import 'dotenv/config';
import { db } from './src/config/database.js';
import { users, departments, complaints, evidence } from './src/db/schema.js';

async function seed() {
  try {
    console.log('Seeding departments...');
    const depts = await db.insert(departments).values([
      { name: 'Road Maintenance', category: 'road_maintenance', contact: 'roads@civicfix.com' },
      { name: 'Sanitation', category: 'sanitation', contact: 'sanitation@civicfix.com' },
      { name: 'Water & Drainage', category: 'water_drainage', contact: 'water@civicfix.com' },
      { name: 'Electrical', category: 'electrical', contact: 'electrical@civicfix.com' },
    ]).returning();

    console.log('Seeding users...');
    const insertedUsers = await db.insert(users).values([
      { name: 'Rahul Kumar', email: 'rahul@example.com', phone: '1234567890', role: 'citizen' },
      { name: 'Priya Sharma', email: 'priya@example.com', phone: '0987654321', role: 'operator' },
      { name: 'Amit Singh', email: 'amit@example.com', phone: '1122334455', role: 'worker' },
    ]).returning();

    console.log('Seeding complaints...');
    const insertedComplaints = await db.insert(complaints).values([
      {
        userId: insertedUsers[0].id,
        problemType: 'pothole',
        description: 'Large pothole on main road.',
        originalDescription: 'Bada gaddha hai main road pe.',
        severity: 'high',
        status: 'pending',
        department: 'road_maintenance',
        latitude: '28.6139',
        longitude: '77.2090',
        confidence: '0.92',
        aiReasoning: 'Image clearly shows a deep pothole disrupting traffic flow.',
      },
      {
        userId: insertedUsers[0].id,
        problemType: 'garbage',
        description: 'Garbage dump overflowing for 3 days.',
        originalDescription: 'Kachre ka dher pichle 3 din se bhara pada hai.',
        severity: 'medium',
        status: 'in_progress',
        department: 'sanitation',
        latitude: '28.6200',
        longitude: '77.2100',
        confidence: '0.88',
        aiReasoning: 'Garbage accumulation visible, moderate severity.',
      },
      {
        userId: insertedUsers[0].id,
        problemType: 'streetlight',
        description: 'Streetlight not working, area is completely dark.',
        originalDescription: 'Streetlight kharab hai, bohot andhera hai.',
        severity: 'critical',
        status: 'resolved',
        department: 'electrical',
        latitude: '28.6300',
        longitude: '77.2200',
        confidence: '0.95',
        aiReasoning: 'Safety hazard due to lack of illumination.',
      }
    ]).returning();

    console.log('Seeding evidence...');
    await db.insert(evidence).values([
      { complaintId: insertedComplaints[0].id, type: 'initial_photo', fileUrl: '/uploads/sample-pothole.jpg', description: 'Photo of the pothole.', aiAnalysis: 'Pothole confirmed.', confidence: '0.95' },
      { complaintId: insertedComplaints[1].id, type: 'initial_photo', fileUrl: '/uploads/sample-garbage.jpg', description: 'Photo of garbage dump.', aiAnalysis: 'Garbage pile confirmed.', confidence: '0.90' },
      { complaintId: insertedComplaints[2].id, type: 'initial_photo', fileUrl: '/uploads/sample-streetlight.jpg', description: 'Photo of dark street.', aiAnalysis: 'Streetlight out.', confidence: '0.85' },
    ]);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
