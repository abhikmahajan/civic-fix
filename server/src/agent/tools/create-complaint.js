import { complaints } from '../../db/schema.js';

export const createComplaint = async (data, db) => {
  const { userId, problemType, description, originalDescription, severity, department, latitude, longitude, confidence, aiReasoning, humanReviewRequired } = data;
  
  const [created] = await db.insert(complaints).values({
    userId,
    problemType,
    description,
    originalDescription,
    severity,
    department,
    latitude,
    longitude,
    confidence: confidence?.toString(),
    aiReasoning,
    humanReviewRequired,
    status: 'pending'
  }).returning();
  
  return created;
};
