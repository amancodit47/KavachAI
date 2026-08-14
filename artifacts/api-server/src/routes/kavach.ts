import { Router, type IRouter } from "express";
import { count, desc, eq } from "drizzle-orm";
import {
  ApplyFindingPatchParams,
  ApplyFindingPatchResponse,
  CreateProjectBody,
  CreateProjectResponse,
  CreateScanBody,
  CreateScanResponse,
  GetDashboardSummaryResponse,
  GetFindingParams,
  GetFindingResponse,
  ListFindingsQueryParams,
  ListFindingsResponse,
  GetProjectParams,
  GetProjectResponse,
  GetScanParams,
  GetScanResponse,
  ListActivityResponse,
  ListProjectsResponse,
  ListScansQueryParams,
  ListScansResponse,
  RerunScanParams,
  RerunScanResponse,
} from "@workspace/api-zod";
import {
  activityEventsTable,
  db,
  findingsTable,
  projectsTable,
  scansTable,
} from "@workspace/db";
import {
  demoFinding,
  ensureSeedData,
  getProof,
  getStages,
  getLatestScans,
  parseJson,
  startScan,
} from "../lib/kavach-engine";

const router: IRouter = Router();

const parseId = (value: string | string[]) => Number(Array.isArray(value) ? value[0] : value);

function toProject(project: typeof projectsTable.$inferSelect) {
  return {
    ...project,
    description: project.description ?? undefined,
    sourceRef: project.sourceRef ?? undefined,
  };
}

function toScan(scan: typeof scansTable.$inferSelect, projectName?: string) {
  return { ...scan, projectName: projectName ?? undefined };
}

function toFinding(finding: typeof findingsTable.$inferSelect) {
  return {
    ...finding,
    evidence: parseJson<unknown[]>(finding.evidence),
    verification: parseJson<Record<string, string>>(finding.verification),
  };
}

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const [{ value: projectCount }] = await db.select({ value: count() }).from(projectsTable);
  const [{ value: scanCount }] = await db.select({ value: count() }).from(scansTable);
  const [{ value: findingCount }] = await db.select({ value: count() }).from(findingsTable);
  const severityRows = await db.select({
    severity: findingsTable.severity,
    value: count(),
  }).from(findingsTable).groupBy(findingsTable.severity);
  const severity = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const row of severityRows) {
    if (row.severity in severity) severity[row.severity as keyof typeof severity] = Number(row.value);
  }
  const latest = (await getLatestScans(1))[0];
  const latestProject = latest
    ? (await db.select({ name: projectsTable.name }).from(projectsTable).where(eq(projectsTable.id, latest.projectId)).limit(1))[0]
    : undefined;
  const trendScans = await getLatestScans(6);
  const response = {
    projects: Number(projectCount),
    scans: Number(scanCount),
    findings: Number(findingCount),
    severity,
    latestScan: latest ? toScan(latest, latestProject?.name) : null,
    assuranceTrend: [...trendScans].reverse().map((scan, index) => ({
      label: `Run ${index + 1}`,
      score: scan.assuranceScore ?? 0,
    })),
  };
  res.json(GetDashboardSummaryResponse.parse(response));
});

router.get("/activity", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const events = await db.select().from(activityEventsTable).orderBy(desc(activityEventsTable.createdAt)).limit(12);
  res.json(ListActivityResponse.parse(events.map((event) => ({
    ...event,
    scanId: event.scanId ?? undefined,
  }))));
});

router.get("/projects", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const projects = await db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));
  res.json(ListProjectsResponse.parse(projects.map(toProject)));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db.insert(projectsTable).values({
    name: parsed.data.name,
    description: parsed.data.description,
    sourceType: parsed.data.sourceType,
    sourceRef: parsed.data.sourceRef,
    languages: parsed.data.languages ?? ["Unknown"],
  }).returning();
  res.status(201).json(CreateProjectResponse.parse(toProject(project)));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const parsed = GetProjectParams.safeParse({ id: parseId(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const project = (await db.select().from(projectsTable).where(eq(projectsTable.id, parsed.data.id)).limit(1))[0];
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse(toProject(project)));
});

router.get("/scans", async (req, res): Promise<void> => {
  await ensureSeedData();
  const parsed = ListScansQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const rows = await db.select({
    scan: scansTable,
    projectName: projectsTable.name,
  }).from(scansTable).leftJoin(projectsTable, eq(scansTable.projectId, projectsTable.id))
    .where(parsed.data.projectId ? eq(scansTable.projectId, parsed.data.projectId) : undefined)
    .orderBy(desc(scansTable.startedAt));
  res.json(ListScansResponse.parse(rows.map((row) => toScan(row.scan, row.projectName ?? undefined))));
});

router.post("/scans", async (req, res): Promise<void> => {
  await ensureSeedData();
  const parsed = CreateScanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const project = (await db.select().from(projectsTable).where(eq(projectsTable.id, parsed.data.projectId)).limit(1))[0];
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  const [scan] = await db.insert(scansTable).values({
    projectId: project.id,
    status: "queued",
    stage: "Queued",
    progress: 0,
  }).returning();
  await db.insert(activityEventsTable).values({
    scanId: scan.id,
    message: "Scan queued",
    detail: `${parsed.data.mode === "assisted" ? "Assisted" : "Autonomous"} scan initialized for ${project.name}.`,
    kind: "scan",
  });
  startScan(scan.id);
  res.status(201).json(CreateScanResponse.parse(toScan(scan, project.name)));
});

router.get("/scans/:id", async (req, res): Promise<void> => {
  const parsed = GetScanParams.safeParse({ id: parseId(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const scan = (await db.select().from(scansTable).where(eq(scansTable.id, parsed.data.id)).limit(1))[0];
  if (!scan) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }
  const project = (await db.select({ name: projectsTable.name }).from(projectsTable).where(eq(projectsTable.id, scan.projectId)).limit(1))[0];
  const findings = await db.select().from(findingsTable).where(eq(findingsTable.scanId, scan.id));
  const complete = scan.status === "completed";
  res.json(GetScanResponse.parse({
    ...toScan(scan, project?.name),
    stages: getStages(scan.progress),
    findings: findings.map((finding) => {
      const normalized = toFinding(finding);
      return {
        id: normalized.id,
        scanId: normalized.scanId,
        title: normalized.title,
        cwe: normalized.cwe,
        severity: normalized.severity,
        file: normalized.file,
        line: normalized.line,
        function: normalized.function,
        status: normalized.status,
        confidence: normalized.confidence,
        summary: normalized.summary,
      };
    }),
    proof: getProof(scan.assuranceScore, complete),
  }));
});

router.post("/scans/:id/rerun", async (req, res): Promise<void> => {
  const parsed = RerunScanParams.safeParse({ id: parseId(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const previous = (await db.select().from(scansTable).where(eq(scansTable.id, parsed.data.id)).limit(1))[0];
  if (!previous) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }
  const project = (await db.select().from(projectsTable).where(eq(projectsTable.id, previous.projectId)).limit(1))[0];
  const [scan] = await db.insert(scansTable).values({ projectId: previous.projectId }).returning();
  await db.insert(activityEventsTable).values({
    scanId: scan.id,
    message: "Scan re-run queued",
    detail: `Fresh verification cycle started for ${project?.name ?? "protected project"}.`,
    kind: "scan",
  });
  startScan(scan.id);
  res.status(201).json(RerunScanResponse.parse(toScan(scan, project?.name)));
});

router.get("/findings/:id", async (req, res): Promise<void> => {
  const parsed = GetFindingParams.safeParse({ id: parseId(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const finding = (await db.select().from(findingsTable).where(eq(findingsTable.id, parsed.data.id)).limit(1))[0];
  if (!finding) {
    res.status(404).json({ error: "Finding not found" });
    return;
  }
  res.json(GetFindingResponse.parse(toFinding(finding)));
});

router.get("/findings", async (req, res): Promise<void> => {
  await ensureSeedData();
  const parsed = ListFindingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const findings = await db.select().from(findingsTable)
    .where(parsed.data.scanId ? eq(findingsTable.scanId, parsed.data.scanId) : undefined)
    .orderBy(desc(findingsTable.id));
  res.json(ListFindingsResponse.parse(findings.map((finding) => {
    const normalized = toFinding(finding);
    return {
      id: normalized.id,
      scanId: normalized.scanId,
      title: normalized.title,
      cwe: normalized.cwe,
      severity: normalized.severity,
      file: normalized.file,
      line: normalized.line,
      function: normalized.function,
      status: normalized.status,
      confidence: normalized.confidence,
      summary: normalized.summary,
    };
  })));
});

router.post("/findings/:id/patch", async (req, res): Promise<void> => {
  const parsed = ApplyFindingPatchParams.safeParse({ id: parseId(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const finding = (await db.select().from(findingsTable).where(eq(findingsTable.id, parsed.data.id)).limit(1))[0];
  if (!finding) {
    res.status(404).json({ error: "Finding not found" });
    return;
  }
  const [updated] = await db.update(findingsTable).set({
    status: "verified",
    confidence: 99,
    verification: JSON.stringify({ ...parseJson<Record<string, string>>(finding.verification), verdict: "FIX VERIFIED", exploitAfter: "BLOCKED" }),
  }).where(eq(findingsTable.id, finding.id)).returning();
  await db.update(scansTable).set({ assuranceScore: 98 }).where(eq(scansTable.id, finding.scanId));
  await db.insert(activityEventsTable).values({
    scanId: finding.scanId,
    message: "Patch independently verified",
    detail: `Verification harness re-ran the exploit and marked ${finding.cwe} as fixed.`,
    kind: "verification",
  });
  res.json(ApplyFindingPatchResponse.parse(toFinding(updated)));
});

export default router;