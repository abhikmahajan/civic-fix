import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { complaints, evidence, agentActions } from '../db/schema.js';
import { transition, STATUSES } from './state-machine.js';
import { analyzeComplaint } from '../ai/analyzer.js';
import { verifyResolutionTool } from './tools/verify-resolution.js';
import { assignDepartment } from './tools/assign-department.js';
import { findPreviousComplaints } from './tools/find-previous.js';
import { requestHumanReview } from './tools/request-human-review.js';
import { getConfidenceLevel } from '../utils/confidence.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logAgentAction = async (database, complaintId, toolName, input, output, reason, confidence) => {
  try {
    await database.insert(agentActions).values({
      complaintId,
      toolName,
      input: JSON.stringify(input),
      output: JSON.stringify(output),
      reason,
      confidence: confidence?.toString() || '0'
    });
  } catch (err) {
    console.error('Failed to log agent action:', err.message);
  }
};

export const processComplaint = async (complaintId, database = db) => {
  const actionsTaken = [];
  
  try {
    // Step 1: Fetch complaint
    const complaintResults = await database.select().from(complaints).where(eq(complaints.id, complaintId));
    const complaint = complaintResults[0];
    if (!complaint) throw new Error('Complaint not found');

    // Step 2: Transition to analyzing
    await transition(complaintId, STATUSES.ANALYZING, database);

    // Step 3: Get initial photo evidence
    const evidenceResults = await database.select().from(evidence).where(eq(evidence.complaintId, complaintId));
    const initialEvidence = evidenceResults.find(e => e.type === 'initial_photo');
    
    let imageBuffer = null;
    let mimeType = 'image/jpeg';
    
    if (initialEvidence && initialEvidence.fileUrl) {
      try {
        if (initialEvidence.fileUrl.startsWith('data:')) {
          const matches = initialEvidence.fileUrl.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            mimeType = matches[1];
            imageBuffer = Buffer.from(matches[2], 'base64');
          }
        } else {
          // Fallback for older local files
          const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '../../uploads');
          const filePath = path.join(uploadDir, path.basename(initialEvidence.fileUrl));
          imageBuffer = fs.readFileSync(filePath);
        }
      } catch (err) {
        console.error('Failed to read evidence image:', err.message);
      }
    }

    // Step 4: AI Analysis
    const locationStr = complaint.latitude && complaint.longitude 
      ? `Latitude: ${complaint.latitude}, Longitude: ${complaint.longitude}` 
      : 'Unknown location';

    let analysis;
    if (imageBuffer) {
      analysis = await analyzeComplaint(imageBuffer, mimeType, complaint.originalDescription || complaint.description || '', locationStr);
    } else {
      // Text-only analysis fallback
      const { generateText } = await import('../ai/gemini.js');
      const { COMPLAINT_ANALYSIS_PROMPT, COMPLAINT_ANALYSIS_SCHEMA } = await import('../ai/prompts.js');
      const prompt = `${COMPLAINT_ANALYSIS_PROMPT}\n\nDescription: ${complaint.originalDescription || complaint.description || 'No description'}\nLocation: ${locationStr}\n\nNote: No image was provided. Analyze based on the text description only.`;
      analysis = await generateText(prompt, COMPLAINT_ANALYSIS_SCHEMA);
    }
    
    await logAgentAction(database, complaintId, 'analyze_complaint', 
      { description: complaint.originalDescription, hasImage: !!imageBuffer }, 
      analysis, 
      'Analyzed complaint using multimodal AI', 
      analysis.confidence
    );
    actionsTaken.push({ tool: 'analyze_complaint', result: analysis });

    // Step 5: Update complaint with AI results
    await database.update(complaints).set({
      problemType: analysis.problem_type,
      description: analysis.description,
      severity: analysis.severity,
      department: analysis.department,
      confidence: analysis.confidence?.toString(),
      aiReasoning: analysis.reasoning,
      humanReviewRequired: analysis.human_review_required || false,
      updatedAt: new Date()
    }).where(eq(complaints.id, complaintId));

    // Step 6: Transition to classified
    await transition(complaintId, STATUSES.CLASSIFIED, database);

    // Step 7: Confidence check
    const confidenceLevel = getConfidenceLevel(analysis.confidence);
    
    if (confidenceLevel === 'low') {
      await requestHumanReview(complaintId, 'Low confidence in AI analysis (' + (analysis.confidence * 100).toFixed(0) + '%)', database);
      await logAgentAction(database, complaintId, 'request_human_review', 
        { confidence: analysis.confidence }, 
        { status: 'needs_review' }, 
        'AI confidence too low for automatic processing', 
        analysis.confidence
      );
      actionsTaken.push({ tool: 'request_human_review', result: { reason: 'Low confidence' } });
      return actionsTaken;
    } else if (confidenceLevel === 'medium') {
      await database.update(complaints).set({ humanReviewRequired: true }).where(eq(complaints.id, complaintId));
      actionsTaken.push({ tool: 'flag_for_review', result: { reason: 'Medium confidence - flagged for review but continuing' } });
    }

    // Step 8: Duplicate check
    try {
      const previous = await findPreviousComplaints({
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        problemType: analysis.problem_type,
        complaintId
      }, database);
      
      await logAgentAction(database, complaintId, 'find_previous_complaints', 
        { lat: complaint.latitude, lng: complaint.longitude, type: analysis.problem_type }, 
        { found: previous.length, complaints: previous.map(p => p.id) }, 
        `Searched for previous complaints - found ${previous.length} nearby`, 
        1.0
      );
      actionsTaken.push({ tool: 'find_previous_complaints', result: { found: previous.length } });

      if (previous.length > 0) {
        const latest = previous[0];
        await database.update(complaints).set({ relatedComplaintId: latest.id }).where(eq(complaints.id, complaintId));
        await logAgentAction(database, complaintId, 'duplicate_detected', 
          { currentId: complaintId, matchId: latest.id }, 
          { action: 'linked_complaints', priority_increased: true }, 
          `Found related complaint ${latest.id.slice(0, 8)} - linked and increased priority`, 
          1.0
        );
        actionsTaken.push({ tool: 'duplicate_detected', result: { matchId: latest.id } });
      }
    } catch (err) {
      console.error('Duplicate check failed:', err.message);
    }

    // Step 9: Assign department
    try {
      const deptInfo = await assignDepartment(complaintId, analysis.problem_type, database);
      await logAgentAction(database, complaintId, 'assign_department', 
        { problemType: analysis.problem_type }, 
        deptInfo, 
        `Assigned to ${deptInfo.department} department`, 
        1.0
      );
      actionsTaken.push({ tool: 'assign_department', result: deptInfo });
    } catch (err) {
      console.error('Department assignment failed:', err.message);
    }

    // Step 10: Transition to assigned
    await transition(complaintId, STATUSES.ASSIGNED, database);
    actionsTaken.push({ tool: 'status_update', result: { status: 'assigned' } });

  } catch (error) {
    console.error('Error processing complaint:', error);
    actionsTaken.push({ tool: 'error', result: { message: error.message } });
  }
  
  return actionsTaken;
};

export const verifyComplaintResolution = async (complaintId, afterImageBuffer, afterMimeType, database = db) => {
  try {
    // Fetch complaint
    const complaintResults = await database.select().from(complaints).where(eq(complaints.id, complaintId));
    const complaint = complaintResults[0];
    if (!complaint) throw new Error('Complaint not found');
    if (![STATUSES.ASSIGNED, STATUSES.IN_PROGRESS, STATUSES.AWAITING_VERIFICATION].includes(complaint.status)) {
      throw new Error('Resolution evidence can only be verified for an assigned or in-progress complaint');
    }

    // Get before evidence
    const evidenceResults = await database.select().from(evidence).where(eq(evidence.complaintId, complaintId));
    const beforeEvidence = evidenceResults.find(e => e.type === 'initial_photo');
    
    let beforeBuffer = null;
    let beforeMime = 'image/jpeg';
    if (beforeEvidence && beforeEvidence.fileUrl) {
      try {
        if (beforeEvidence.fileUrl.startsWith('data:')) {
          const matches = beforeEvidence.fileUrl.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            beforeMime = matches[1];
            beforeBuffer = Buffer.from(matches[2], 'base64');
          }
        } else {
          // Fallback for older local files
          const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '../../uploads');
          const filePath = path.join(uploadDir, path.basename(beforeEvidence.fileUrl));
          beforeBuffer = fs.readFileSync(filePath);
        }
      } catch (err) {
        console.error('Failed to read before evidence:', err.message);
      }
    }
    if (!beforeBuffer) {
      await requestHumanReview(complaintId, 'Cannot verify a resolution without the original evidence photo', database);
      return { resolved: false, confidence: 0, reasoning: 'Original evidence photo is unavailable; human review is required.', status: STATUSES.NEEDS_REVIEW };
    }
    if (complaint.status !== STATUSES.AWAITING_VERIFICATION) {
      await transition(complaintId, STATUSES.AWAITING_VERIFICATION, database);
    }
    
    const result = await verifyResolutionTool(
      complaintId, 
      { buffer: beforeBuffer, mimeType: beforeMime }, 
      afterImageBuffer, 
      afterMimeType, 
      database
    );
    
    await logAgentAction(database, complaintId, 'verify_resolution', 
      { hasBeforeImage: !!beforeBuffer, hasAfterImage: true }, 
      result, 
      `Resolution verification: ${result.resolved ? 'RESOLVED' : 'NOT RESOLVED'} (${(result.confidence * 100).toFixed(0)}% confidence)`, 
      result.confidence
    );
    
    return result;
  } catch (error) {
    console.error('Error verifying resolution:', error);
    throw error;
  }
};
