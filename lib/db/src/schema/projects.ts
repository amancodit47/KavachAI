import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const projectsTable = pgTable("kavach_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sourceType: text("source_type").notNull(),
  sourceRef: text("source_ref").notNull(),
  status: text("status").notNull().default("protected"),
  languages: text("languages").array().notNull().default([]),
  lastScanAt: timestamp("last_scan_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scansTable = pgTable("kavach_scans", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id),
  status: text("status").notNull().default("queued"),
  stage: text("stage").notNull().default("Queued"),
  progress: integer("progress").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  findingCount: integer("finding_count").notNull().default(0),
  assuranceScore: integer("assurance_score"),
});

export const findingsTable = pgTable("kavach_findings", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id")
    .notNull()
    .references(() => scansTable.id),
  title: text("title").notNull(),
  cwe: text("cwe").notNull(),
  severity: text("severity").notNull(),
  file: text("file").notNull(),
  line: integer("line").notNull(),
  function: text("function").notNull(),
  status: text("status").notNull().default("confirmed"),
  confidence: integer("confidence").notNull(),
  summary: text("summary").notNull(),
  rootCause: text("root_cause").notNull(),
  attackSurface: text("attack_surface").notNull(),
  payload: text("payload").notNull(),
  evidence: text("evidence").notNull(),
  beforeCode: text("before_code").notNull(),
  afterCode: text("after_code").notNull(),
  verification: text("verification").notNull(),
});

export const activityEventsTable = pgTable("kavach_activity_events", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").references(() => scansTable.id),
  message: text("message").notNull(),
  detail: text("detail").notNull(),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projectsTable.$inferSelect;
export type Scan = typeof scansTable.$inferSelect;
export type Finding = typeof findingsTable.$inferSelect;
export type ActivityEvent = typeof activityEventsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;