import 'dotenv/config';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/config/database.js';
import { users, departments, complaints, evidence, agentActions } from './src/db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, 'uploads');

function ensureDemoEvidence() {
  const source = path.join(__dirname, 'test.png');
  if (!fs.existsSync(source)) throw new Error('Missing demo image: server/test.png');
  fs.mkdirSync(uploadDir, { recursive: true });
  for (const file of ['sample-pothole.png', 'sample-garbage.png', 'sample-streetlight.png']) {
    fs.copyFileSync(source, path.join(uploadDir, file));
  }
}

async function seed() {
  try {
    console.log('Starting seed...');

    console.log('Deleting existing data...');
    await db.delete(agentActions);
    await db.delete(evidence);
    await db.delete(complaints);
    await db.delete(users);
    await db.delete(departments);

    console.log('Inserting departments...');
    const insertedDepartments = await db.insert(departments).values([
      { name: 'Road Maintenance', category: 'road_maintenance', contact: 'roads@civicfix.com' },
      { name: 'Sanitation', category: 'sanitation', contact: 'waste@civicfix.com' },
      { name: 'Water & Drainage', category: 'water_drainage', contact: 'water@civicfix.com' },
      { name: 'Electrical', category: 'electrical', contact: 'power@civicfix.com' }
    ]).returning();
    console.log(`Inserted ${insertedDepartments.length} departments.`);

    console.log('Inserting users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const insertedUsers = await db.insert(users).values([
      { name: 'Rahul Kumar', email: 'rahul@example.com', phone: '1234567890', role: 'citizen', passwordHash },
      { name: 'Priya Sharma', email: 'priya@example.com', phone: '0987654321', role: 'management', passwordHash },
      { name: 'Amit Singh', email: 'amit@example.com', phone: '1122334455', role: 'management', passwordHash }
    ]).returning();
    console.log(`Inserted ${insertedUsers.length} users.`);

    const rahulId = insertedUsers.find(u => u.email === 'rahul@example.com').id;

    console.log('Inserting complaints...');
    const insertedComplaints = await db.insert(complaints).values([
      {
        userId: rahulId,
        problemType: 'pothole',
        description: 'There is a very deep pothole causing traffic issues and potential vehicle damage.',
        originalDescription: 'Very deep pothole',
        latitude: '28.6139',
        longitude: '77.2090',
        status: 'pending',
        severity: 'high',
        department: 'road_maintenance',
      },
      {
        userId: rahulId,
        problemType: 'garbage',
        description: 'The garbage bins are overflowing and causing a foul smell in the neighborhood.',
        originalDescription: 'Garbage not collected for a week',
        latitude: '28.6200',
        longitude: '77.2100',
        status: 'in_progress',
        severity: 'medium',
        department: 'sanitation',
      },
      {
        userId: rahulId,
        problemType: 'streetlight',
        description: 'The streetlight pole fell down during the storm last night.',
        originalDescription: 'Streetlight broken',
        latitude: '28.6300',
        longitude: '77.2200',
        status: 'resolved',
        severity: 'critical',
        department: 'electrical',
      }
    ]).returning();
    console.log(`Inserted ${insertedComplaints.length} complaints.`);

    console.log('Inserting evidence...');
    ensureDemoEvidence();
    const insertedEvidence = await db.insert(evidence).values([
      {
        complaintId: insertedComplaints[0].id,
        fileUrl: '/uploads/sample-pothole.png',
        type: 'initial_photo'
      },
      {
        complaintId: insertedComplaints[1].id,
        fileUrl: '/uploads/sample-garbage.png',
        type: 'initial_photo'
      },
      {
        complaintId: insertedComplaints[2].id,
        fileUrl: '/uploads/sample-streetlight.png',
        type: 'initial_photo'
      }
    ]).returning();
    console.log(`Inserted ${insertedEvidence.length} evidence records.`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
