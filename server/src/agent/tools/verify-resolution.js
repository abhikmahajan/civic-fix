import { eq } from 'drizzle-orm';
import { complaints } from '../../db/schema.js';
import { verifyResolution } from '../../ai/verifier.js';
import { transition, STATUSES } from '../state-machine.js';

export const verifyResolutionTool = async (complaintId, beforeEvidence, afterImageBuffer, afterMimeType, db) => {
  const beforeBuffer = beforeEvidence?.buffer;
  const beforeMime = beforeEvidence?.mimeType || 'image/jpeg';

  const result = await verifyResolution(
    beforeBuffer, beforeMime,
    afterImageBuffer, afterMimeType,
    'Civic complaint resolution verification'
  );
  
  let finalStatus;
  let humanReview = false;
  
  if (result.resolved && result.confidence > 0.8) {
    finalStatus = STATUSES.RESOLVED;
  } else if (!result.resolved && result.confidence > 0.8) {
    finalStatus = STATUSES.REOPENED;
  } else {
    finalStatus = STATUSES.NEEDS_REVIEW;
    humanReview = true;
  }
  
  await transition(complaintId, finalStatus, db);
  await db.update(complaints)
    .set({ humanReviewRequired: humanReview, updatedAt: new Date() })
    .where(eq(complaints.id, complaintId));
  
  return { ...result, status: finalStatus };
};
