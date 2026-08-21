import { transition, STATUSES } from '../state-machine.js';

export const escalateComplaint = async (complaintId, reason, db) => {
  await transition(complaintId, STATUSES.ESCALATED, db);
  return { complaintId, reason, status: STATUSES.ESCALATED };
};
