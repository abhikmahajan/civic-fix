import { Type } from '@google/genai';

export const COMPLAINT_ANALYSIS_PROMPT = `You are an AI assistant for a civic complaint system. Analyze the provided image and description of a civic issue.
The text might be in English, Hindi, or Hinglish. Translate and summarize it into clear, clean English.
Determine the problem type, severity, appropriate department, confidence score, detailed reasoning, safety concerns, and if human review is needed.`;

export const COMPLAINT_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    problem_type: { type: Type.STRING, enum: ['pothole', 'garbage', 'water', 'streetlight', 'other'] },
    severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
    description: { type: Type.STRING },
    department: { type: Type.STRING, enum: ['road_maintenance', 'sanitation', 'water_drainage', 'electrical', 'general'] },
    confidence: { type: Type.NUMBER },
    reasoning: { type: Type.STRING },
    human_review_required: { type: Type.BOOLEAN },
    safety_concerns: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['problem_type', 'severity', 'description', 'department', 'confidence', 'reasoning', 'human_review_required', 'safety_concerns']
};

export const RESOLUTION_VERIFICATION_PROMPT = `You are a verification AI. Compare the 'before' image of a civic issue and the 'after' image showing the claimed resolution, alongside the original complaint description.
Determine if the issue has been truly resolved. Point out any differences detected, reasoning, and your confidence score.`;

export const RESOLUTION_VERIFICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    resolved: { type: Type.BOOLEAN },
    confidence: { type: Type.NUMBER },
    reasoning: { type: Type.STRING },
    differences_detected: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['resolved', 'confidence', 'reasoning', 'differences_detected']
};

export const CONFLICT_DETECTION_PROMPT = `You are an auditing AI. Analyze the current evidence against historical records to detect any contradictions or anomalies.
Provide a clear description of any conflict, recommend an action, and state your confidence.`;

export const CONFLICT_DETECTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    has_conflict: { type: Type.BOOLEAN },
    conflict_description: { type: Type.STRING },
    recommendation: { type: Type.STRING },
    confidence: { type: Type.NUMBER }
  },
  required: ['has_conflict', 'conflict_description', 'recommendation', 'confidence']
};
