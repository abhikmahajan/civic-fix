import { transition, STATUSES } from '../state-machine.js';

export const requestResolutionEvidence = async (complaintId, db) => {
  await transition(complaintId, STATUSES.AWAITING_VERIFICATION, db);
  return { complaintId, status: STATUSES.AWAITING_VERIFICATION, message: 'Resolution evidence requested' };
};
