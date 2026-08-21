import { generateWithMultipleImages } from './gemini.js';
import { RESOLUTION_VERIFICATION_PROMPT, RESOLUTION_VERIFICATION_SCHEMA } from './prompts.js';

export async function verifyResolution(beforeImageBuffer, beforeMimeType, afterImageBuffer, afterMimeType, complaintDescription) {
  const images = [
    { base64: beforeImageBuffer.toString('base64'), mimeType: beforeMimeType },
    { base64: afterImageBuffer.toString('base64'), mimeType: afterMimeType }
  ];
  const prompt = `${RESOLUTION_VERIFICATION_PROMPT}\n\nComplaint: ${complaintDescription}`;
  return await generateWithMultipleImages(images, prompt, RESOLUTION_VERIFICATION_SCHEMA);
}
