import { eq } from 'drizzle-orm';
import { complaints } from '../../db/schema.js';
import { transition, STATUSES } from '../state-machine.js';

export const requestHumanReview = async (complaintId, reason, db) => {
  await db.update(complaints)
    .set({ humanReviewRequired: true, updatedAt: new Date() })
    .where(eq(complaints.id, complaintId));
    
  await transition(complaintId, STATUSES.NEEDS_REVIEW, db);
  
  return { complaintId, reason, status: STATUSES.NEEDS_REVIEW };
};
