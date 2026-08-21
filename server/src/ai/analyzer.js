import { generateWithImage, generateText } from './gemini.js';
import { 
  COMPLAINT_ANALYSIS_PROMPT, 
  COMPLAINT_ANALYSIS_SCHEMA,
  CONFLICT_DETECTION_PROMPT,
  CONFLICT_DETECTION_SCHEMA
} from './prompts.js';

export async function analyzeComplaint(imageBuffer, mimeType, textDescription, location) {
  const prompt = `${COMPLAINT_ANALYSIS_PROMPT}\n\nDescription: ${textDescription || 'None'}\nLocation: ${location || 'Unknown'}`;
  const imageBase64 = imageBuffer.toString('base64');
  
  return await generateWithImage(imageBase64, mimeType, prompt, COMPLAINT_ANALYSIS_SCHEMA);
}

export async function detectConflicts(currentEvidence, historicalRecords) {
  const prompt = `${CONFLICT_DETECTION_PROMPT}\n\nCurrent Evidence: ${JSON.stringify(currentEvidence)}\nHistorical Records: ${JSON.stringify(historicalRecords)}`;
  return await generateText(prompt, CONFLICT_DETECTION_SCHEMA);
}
