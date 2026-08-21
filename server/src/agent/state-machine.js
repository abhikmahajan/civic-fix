import { eq } from 'drizzle-orm';
import { complaints } from '../db/schema.js';

export const STATUSES = {
  PENDING: 'pending',
  ANALYZING: 'analyzing',
  CLASSIFIED: 'classified',
  NEEDS_REVIEW: 'needs_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  AWAITING_VERIFICATION: 'awaiting_verification',
  RESOLVED: 'resolved',
  REOPENED: 'reopened',
  ESCALATED: 'escalated',
  CLOSED: 'closed'
};

const transitions = {
  [STATUSES.PENDING]: [STATUSES.ANALYZING],
  [STATUSES.ANALYZING]: [STATUSES.CLASSIFIED, STATUSES.NEEDS_REVIEW],
  [STATUSES.CLASSIFIED]: [STATUSES.ASSIGNED, STATUSES.NEEDS_REVIEW, STATUSES.ESCALATED],
  [STATUSES.NEEDS_REVIEW]: [STATUSES.ASSIGNED, STATUSES.ESCALATED, STATUSES.CLOSED],
  [STATUSES.ASSIGNED]: [STATUSES.IN_PROGRESS, STATUSES.AWAITING_VERIFICATION, STATUSES.NEEDS_REVIEW],
  [STATUSES.IN_PROGRESS]: [STATUSES.AWAITING_VERIFICATION, STATUSES.ESCALATED, STATUSES.NEEDS_REVIEW],
  [STATUSES.AWAITING_VERIFICATION]: [STATUSES.RESOLVED, STATUSES.REOPENED, STATUSES.ESCALATED, STATUSES.NEEDS_REVIEW],
  [STATUSES.RESOLVED]: [STATUSES.CLOSED, STATUSES.REOPENED],
  [STATUSES.REOPENED]: [STATUSES.ASSIGNED, STATUSES.ESCALATED],
  [STATUSES.ESCALATED]: [STATUSES.ASSIGNED, STATUSES.IN_PROGRESS, STATUSES.CLOSED]
};

export const canTransition = (from, to) => {
  return transitions[from]?.includes(to) || false;
};

export const getValidTransitions = (status) => {
  return transitions[status] || [];
};

export const transition = async (complaintId, newStatus, db) => {
  const [complaint] = await db.select({ status: complaints.status }).from(complaints).where(eq(complaints.id, complaintId));
  if (!complaint) throw new Error('Complaint not found');
  if (complaint.status !== newStatus && !canTransition(complaint.status, newStatus)) {
    throw new Error(`Invalid status transition: ${complaint.status} → ${newStatus}`);
  }
  await db.update(complaints)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(complaints.id, complaintId));
  return newStatus;
};
