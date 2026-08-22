import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 20 }).default('citizen'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export const complaints = pgTable('complaints', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  problemType: varchar('problem_type', { length: 50 }),
  description: text('description'),
  originalDescription: text('original_description'),
  severity: varchar('severity', { length: 20 }),
  status: varchar('status', { length: 30 }).default('pending'),
  department: varchar('department', { length: 50 }),
  latitude: varchar('latitude', { length: 20 }),
  longitude: varchar('longitude', { length: 20 }),
  confidence: varchar('confidence', { length: 10 }),
  aiReasoning: text('ai_reasoning'),
  humanReviewRequired: boolean('human_review_required').default(false),
  relatedComplaintId: uuid('related_complaint_id'),
  authorityTicketId: varchar('authority_ticket_id', { length: 50 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
});

export const evidence = pgTable('evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  complaintId: uuid('complaint_id').references(() => complaints.id),
  type: varchar('type', { length: 30 }),
  fileUrl: text('file_url'),
  description: text('description'),
  aiAnalysis: text('ai_analysis'),
  confidence: varchar('confidence', { length: 10 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export const agentActions = pgTable('agent_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  complaintId: uuid('complaint_id').references(() => complaints.id),
  toolName: varchar('tool_name', { length: 50 }),
  input: text('input'),
  output: text('output'),
  reason: text('reason'),
  confidence: varchar('confidence', { length: 10 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }),
  category: varchar('category', { length: 50 }),
  contact: varchar('contact', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
});
