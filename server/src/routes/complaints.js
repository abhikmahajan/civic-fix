import { Router } from 'express';
import { db } from '../config/database.js';
import { complaints, evidence, agentActions } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { upload } from '../middleware/upload.js';
import { processComplaint, verifyComplaintResolution } from '../agent/agent.js';
import { STATUSES, getValidTransitions } from '../agent/state-machine.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// POST /api/complaints - Create a new complaint
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { description, latitude, longitude, user_id } = req.body;
    if (!description?.trim() && !req.file) return res.status(400).json({ error: 'Provide a description or an image' });
    
    const [complaint] = await db.insert(complaints).values({
      originalDescription: description,
      latitude: latitude || null,
      longitude: longitude || null,
      userId: user_id || null,
      status: 'pending'
    }).returning();

    if (req.file) {
      await db.insert(evidence).values({
        complaintId: complaint.id,
        type: 'initial_photo',
        fileUrl: `/uploads/${req.file.filename}`
      });
    }

    res.status(201).json(complaint);
  } catch (err) {
    next(err);
  }
});

// POST /api/complaints/:id/analyze - Trigger AI analysis
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaintResults = await db.select().from(complaints).where(eq(complaints.id, id));
    if (!complaintResults.length) return res.status(404).json({ error: 'Complaint not found' });

    const actions = await processComplaint(id, db);

    const [updatedComplaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    const evidenceList = await db.select().from(evidence).where(eq(evidence.complaintId, id));
    const agentActionsList = await db.select().from(agentActions).where(eq(agentActions.complaintId, id));

    res.json({ 
      complaint: updatedComplaint, 
      evidence: evidenceList, 
      agentActions: agentActionsList,
      actionsTaken: actions 
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/complaints/:id - Get single complaint with evidence & actions
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const evidenceList = await db.select().from(evidence).where(eq(evidence.complaintId, id));
    const agentActionsList = await db.select().from(agentActions).where(eq(agentActions.complaintId, id));

    res.json({ complaint, evidence: evidenceList, agentActions: agentActionsList });
  } catch (err) {
    next(err);
  }
});

// GET /api/complaints - List all complaints (filterable)
router.get('/', async (req, res, next) => {
  try {
    const { status, severity, department, problem_type } = req.query;
    
    let conditions = [];
    if (status) conditions.push(eq(complaints.status, status));
    if (severity) conditions.push(eq(complaints.severity, severity));
    if (department) conditions.push(eq(complaints.department, department));
    if (problem_type) conditions.push(eq(complaints.problemType, problem_type));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const complaintsList = await db.select().from(complaints)
      .where(whereClause)
      .orderBy(desc(complaints.createdAt));

    res.json(complaintsList);
  } catch (err) {
    next(err);
  }
});

// POST /api/complaints/:id/verify - Upload resolution photo & verify
router.post('/:id/verify', upload.single('image'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    if (![STATUSES.ASSIGNED, STATUSES.IN_PROGRESS, STATUSES.AWAITING_VERIFICATION].includes(complaint.status)) {
      return res.status(409).json({ error: 'Resolution evidence can only be submitted for an assigned or in-progress complaint' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required for verification' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype;

    // Store evidence first
    await db.insert(evidence).values({
      complaintId: id,
      type: 'resolution_photo',
      fileUrl: `/uploads/${req.file.filename}`
    });

    const result = await verifyComplaintResolution(id, imageBuffer, mimeType, db);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/complaints/:id/review - Human review decision
router.post('/:id/review', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;
    const [existingComplaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    if (!existingComplaint) return res.status(404).json({ error: 'Complaint not found' });
    
    let updateData = { updatedAt: new Date() };
    if (decision === 'approve') {
      updateData.status = 'assigned';
      updateData.humanReviewRequired = false;
    } else if (decision === 'reject') {
      updateData.status = 'closed';
    } else if (decision === 'request_more') {
      // keep status, just log the action
    } else {
      return res.status(400).json({ error: 'Invalid decision. Use: approve, reject, or request_more' });
    }

    if (Object.keys(updateData).length > 1) {
      await db.update(complaints)
        .set(updateData)
        .where(eq(complaints.id, id));
    }

    await db.insert(agentActions).values({
      complaintId: id,
      toolName: 'human_review',
      input: JSON.stringify({ decision, notes }),
      output: JSON.stringify(updateData),
      reason: notes || `Human review: ${decision}`
    });

    const [updatedComplaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    res.json(updatedComplaint);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/complaints/:id/status - Update status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !Object.values(STATUSES).includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const [existingComplaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    if (!existingComplaint) return res.status(404).json({ error: 'Complaint not found' });
    if (existingComplaint.status !== status && !getValidTransitions(existingComplaint.status).includes(status)) {
      return res.status(409).json({ error: `Invalid status transition: ${existingComplaint.status} → ${status}` });
    }

    const [updatedComplaint] = await db.update(complaints)
      .set({ status, updatedAt: new Date() })
      .where(eq(complaints.id, id))
      .returning();
      
    res.json(updatedComplaint);
  } catch (err) {
    next(err);
  }
});

export default router;
