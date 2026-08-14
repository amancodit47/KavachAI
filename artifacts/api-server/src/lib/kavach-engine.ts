import { desc, eq } from "drizzle-orm";
import { db, activityEventsTable, findingsTable, projectsTable, scansTable } from "@workspace/db";

const stages = [
  { key: "recon", label: "Repository recon", threshold: 12, detail: "Mapping languages, dependencies, entry points, and trust boundaries." },
  { key: "analyze", label: "Static analysis", threshold: 25, detail: "Running lightweight SAST rules across source and dependency surfaces." },
  { key: "hypothesize", label: "AI reasoning", threshold: 40, detail: "Connecting code paths, findings, and runtime context into a vulnerability hypothesis." },
  { key: "validate", label: "Adaptive fuzzing", threshold: 58, detail: "Generating targeted payloads for the highest-confidence attack surface." },
  { key: "exploit", label: "Sandbox validation", threshold: 70, detail: "Reproducing the exploit inside a constrained, isolated execution boundary." },
  { key: "patch", label: "Patch generation", threshold: 82, detail: "Producing a minimal remediation and applying it to the working tree." },
  { key: "regression", label: "Regression harness", threshold: 93, detail: "Re-running the exploit, regression suite, and post-patch static scan." },
  { key: "verify", label: "Independent verification", threshold: 100, detail: "Comparing before/after evidence and issuing a proof-of-fix verdict." },
] as const;

export const demoFinding = {
  title: "SQL injection in asset lookup",
  cwe: "CWE-89",
  severity: "critical",
  file: "services/assets.py",
  line: 142,
  function: "get_asset_by_id()",
  status: "verified",
  confidence: 97,
  summary: "User-controlled asset IDs are concatenated into a raw SQL statement.",
  rootCause: "The asset lookup path interpolates request input directly into the database query. The query builder never creates a bound parameter, so a crafted boolean condition changes execution semantics.",
  attackSurface: "GET /assets/{asset_id} → services/assets.py:get_asset_by_id",
  payload: "' OR '1'='1' --",
  evidence: [
    { label: "Static finding", value: "Raw string concatenation at line 142", status: "info" },
    { label: "Exploit before patch", value: "Payload altered query result set", status: "pass" },
    { label: "Sandbox boundary", value: "Network disabled · 256 MB · 2 s timeout", status: "clean" },
    { label: "Exploit after patch", value: "Payload rejected by parameterized query", status: "blocked" },
  ],
  beforeCode: `query = "SELECT * FROM assets WHERE id = '" + asset_id + "'"\ncursor.execute(query)`,
  afterCode: `query = "SELECT * FROM assets WHERE id = %s"\ncursor.execute(query, (asset_id,))`,
  verification: {
    exploitBefore: "REPRODUCED",
    patchApplied: "APPLIED",
    exploitAfter: "BLOCKED",
    regression: "103 / 103 PASS",
    staticRescan: "CLEAN",
    dynamicRetest: "CLEAN",
    verdict: "FIX VERIFIED",
  },
};

let seedPromise: Promise<void> | undefined;

export function getStages(progress: number) {
  return stages.map((stage, index) => {
    const previousThreshold = index === 0 ? 0 : stages[index - 1].threshold;
    const status = progress >= stage.threshold
      ? "complete"
      : progress > previousThreshold
        ? "running"
        : "pending";
    return {
      key: stage.key,
      label: stage.label,
      status,
      detail: stage.detail,
      durationMs: status === "complete" ? 420 + index * 38 : null,
    };
  });
}

export function getProof(score: number | null, complete = false) {
  const verified = complete && score !== null;
  return {
    score: score ?? 0,
    reproduced: complete,
    patched: complete,
    blocked: verified,
    regressionPassed: verified,
    staticClean: verified,
    dynamicClean: verified,
  };
}

export async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db.select({ id: projectsTable.id }).from(projectsTable).limit(1);
      if (existing.length > 0) return;

      const [project] = await db.insert(projectsTable).values({
        name: "Military Logistics API",
        description: "Demo target with intentionally vulnerable asset retrieval and a protected operational surface.",
        sourceType: "workspace",
        sourceRef: "demo://military-logistics-api",
        status: "protected",
        languages: ["Python", "FastAPI"],
        lastScanAt: new Date(),
      }).returning();

      const completedAt = new Date();
      const [scan] = await db.insert(scansTable).values({
        projectId: project.id,
        status: "completed",
        stage: "Verified",
        progress: 100,
        completedAt,
        findingCount: 1,
        assuranceScore: 96,
      }).returning();

      await db.insert(findingsTable).values({
        scanId: scan.id,
        ...demoFinding,
        evidence: JSON.stringify(demoFinding.evidence),
        verification: JSON.stringify(demoFinding.verification),
      });

      await db.insert(activityEventsTable).values([
        { scanId: scan.id, message: "Fix verified", detail: "CWE-89 blocked after patch and 103 regression tests passed.", kind: "verification" },
        { scanId: scan.id, message: "Patch applied", detail: "Parameterized query applied to services/assets.py.", kind: "finding" },
        { scanId: scan.id, message: "Vulnerability reproduced", detail: "Adaptive fuzzer confirmed SQL injection in the sandbox.", kind: "finding" },
        { scanId: scan.id, message: "Scan completed", detail: "Assurance score 96/100 · 1 finding verified.", kind: "scan" },
      ]);
    })();
  }
  await seedPromise;
}

function stageForProgress(progress: number) {
  const active = stages.find((stage) => progress < stage.threshold);
  return active?.label ?? "Verified";
}

export function startScan(scanId: number) {
  let index = 0;
  const advance = async () => {
    const step = stages[index];
    if (!step) return;
    const progress = step.threshold;
    await db.update(scansTable).set({
      status: progress === 100 ? "completed" : "running",
      stage: progress === 100 ? "Verified" : step.label,
      progress,
      ...(progress === 100 ? { completedAt: new Date(), findingCount: 1, assuranceScore: 96 } : {}),
    }).where(eq(scansTable.id, scanId));

    if (progress === 100) {
      const existing = await db.select({ id: findingsTable.id }).from(findingsTable).where(eq(findingsTable.scanId, scanId)).limit(1);
      if (existing.length === 0) {
        await db.insert(findingsTable).values({
          scanId,
          ...demoFinding,
          evidence: JSON.stringify(demoFinding.evidence),
          verification: JSON.stringify(demoFinding.verification),
        });
      }
      await db.insert(activityEventsTable).values({
        scanId,
        message: "Fix verified",
        detail: "Closed-loop verification passed with 103 regression tests and clean re-scans.",
        kind: "verification",
      });
      return;
    }

    await db.insert(activityEventsTable).values({
      scanId,
      message: step.label,
      detail: step.detail,
      kind: progress >= 58 ? "finding" : "scan",
    });
    index += 1;
    setTimeout(() => void advance(), 1100);
  };

  setTimeout(() => void advance(), 450);
}

export async function getLatestScans(limit = 6) {
  return db.select().from(scansTable).orderBy(desc(scansTable.startedAt)).limit(limit);
}

export function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

export { stages };