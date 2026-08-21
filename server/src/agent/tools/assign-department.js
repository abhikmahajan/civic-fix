import { eq } from 'drizzle-orm';
import { complaints, departments } from '../../db/schema.js';

export const assignDepartment = async (complaintId, problemType, db) => {
  let mappedDepartment = 'general';
  const p = problemType?.toLowerCase() || '';
  
  if (p.includes('pothole') || p.includes('road')) mappedDepartment = 'road_maintenance';
  else if (p.includes('garbage') || p.includes('waste')) mappedDepartment = 'sanitation';
  else if (p.includes('water') || p.includes('drainage')) mappedDepartment = 'water_drainage';
  else if (p.includes('streetlight') || p.includes('electrical')) mappedDepartment = 'electrical';

  await db.update(complaints)
    .set({ department: mappedDepartment, updatedAt: new Date() })
    .where(eq(complaints.id, complaintId));

  const deptResults = await db.select().from(departments).where(eq(departments.category, mappedDepartment));
  const departmentDetails = deptResults[0] || null;
  
  return { department: mappedDepartment, departmentDetails };
};
