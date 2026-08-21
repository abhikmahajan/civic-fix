import { eq, and, gte } from 'drizzle-orm';
import { complaints } from '../../db/schema.js';

export const findPreviousComplaints = async ({ latitude, longitude, problemType, complaintId, daysBack = 30 }, db) => {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - daysBack);

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
  const latTolerance = 0.002;
  const lngTolerance = 0.002;

  const previousComplaints = await db.select({
    id: complaints.id,
    problemType: complaints.problemType,
    status: complaints.status,
    severity: complaints.severity,
    createdAt: complaints.createdAt,
    latitude: complaints.latitude,
    longitude: complaints.longitude
  })
  .from(complaints)
  .where(
    and(
      eq(complaints.problemType, problemType),
      gte(complaints.createdAt, dateLimit.toISOString())
    )
  );

  const nearby = previousComplaints.filter(c => {
    if (c.id === complaintId) return false;
    if (!c.latitude || !c.longitude) return false;
    const cLat = parseFloat(c.latitude);
    const cLng = parseFloat(c.longitude);
    return Math.abs(cLat - lat) <= latTolerance && Math.abs(cLng - lng) <= lngTolerance;
  }).map(c => ({
    ...c,
    distanceInfo: 'within ~200m'
  }));

  return nearby;
};
