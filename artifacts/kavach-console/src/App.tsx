import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Download,
  FileCode2,
  FileSearch,
  FolderGit2,
  Gauge,
  KeyRound,
  LockKeyhole,
  Menu,
  Network,
  Plus,
  Radar,
  RefreshCcw,
  RotateCcw,
  ScanLine,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  Timer,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import {
  ActivityList,
  CodeBlock,
  EmptyState,
  ErrorState,
  FindingRow,
  LoadingState,
  Logo,
  PageHeader,
  ProjectCard,
  ProofTile,
  ScanRow,
  SectionTitle,
  SeverityPill,
  Skeleton,
  StageRail,
  StatusPill,
} from '@/components/kavach-ui';
import { findingLabel, formatDate, formatDuration, initials, projectRepo, scanLabel } from '@/lib/kavach';
import {
  getGetFindingQueryKey,
  getGetProjectQueryKey,
  getGetScanQueryKey,
  getListFindingsQueryKey,
  getListProjectsQueryKey,
  getListScansQueryKey,
  useApplyFindingPatch,
  useCreateProject,
  useCreateScan,
  useGetDashboardSummary,
  useGetFinding,
  useGetProject,
  useGetScan,
  useListActivity,
  useListFindings,
  useListProjects,
  useListScans,
  useRerunScan,
  type Finding,
  type FindingDetail,
  type Project,
  type ProjectInput,
  type Scan,
  type ScanDetail,
} from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

const navGroups = [
  {
    label: 'Command',
    items: [
      { href: '/', label: 'Overview', icon: Gauge },
      { href: '/scan-room', label: 'Scan room', icon: Radar },
      { href: '/projects', label: 'Protected targets', icon: FolderGit2 },
    ],
  },
  {
    label: 'Proof system',
    items: [
      { href: '/findings', label: 'Finding ledger', icon: FileSearch },
      { href: '/verification', label: 'Proof of fix', icon: ClipboardCheck },
      { href: '/agent-trail', label: 'Agent trail', icon: Activity },
      { href: '/evidence', label: 'Evidence vault', icon: BookOpenCheck },
    ],
  },
  {
    label: 'Readiness',
    items: [
      { href: '/performance', label: 'Performance', icon: Timer },
      { href: '/security-desk', label: 'Security desk', icon: ShieldCheck },
      { href: '/settings', label: 'Prototype settings', icon: Settings2 },
    ],
  },
];

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="k-shell k-noise flex min-h-[100dvh] flex-col md:flex-row">
      <aside className={`k-sidebar shrink-0 p-4 md:min-h-[100dvh] md:p-5 ${mobileOpen ? 'block' : 'hidden md:block'}`}>
        <div className="mb-7 flex items-center justify-between">
          <Logo />
          <button className="k-button k-button-ghost p-2 md:hidden" onClick={() => setMobileOpen(false)} data-testid="button-close-menu">
            <X size={15} />
          </button>
        </div>
        <div className="k-boundary mb-7 rounded-lg p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="size-2 rounded-full bg-[hsl(var(--primary))] k-pulse" />
            <span className="k-eyebrow text-[hsl(var(--primary))]">simulation mode</span>
          </div>
          <p className="text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">
            Deterministic closed-loop run. No production systems are touched.
          </p>
        </div>
        <nav className="k-nav-links grid gap-5" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="k-eyebrow mb-2 px-3 text-[9px]">{group.label}</p>
              <div className="grid gap-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = href === '/' ? location === '/' : location === href || location.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`k-nav-link k-focus flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold transition-colors ${active ? 'bg-[hsl(var(--primary)/.11)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/.6)] hover:text-[hsl(var(--foreground))]'}`}
                      data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
                    >
                      <Icon size={16} strokeWidth={1.7} />
                      <span>{label}</span>
                      {active && <span className="ml-auto size-1.5 rounded-full bg-[hsl(var(--primary))]" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-8 border-t border-[hsl(var(--border))] pt-4">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-[hsl(var(--accent)/.15)] text-xs font-bold text-[hsl(var(--accent))]">SD</span>
            <div>
              <p className="text-xs font-semibold">Security desk</p>
              <p className="k-mono mt-0.5 text-[9px] text-[hsl(var(--muted-foreground))]">LOCAL / AUTHORIZED</p>
            </div>
            <CircleHelp className="ml-auto text-[hsl(var(--muted-foreground))]" size={14} />
          </div>
        </div>
      </aside>
      <div className="k-main flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3 md:px-8">
          <button className="k-button k-button-ghost p-2 md:hidden" onClick={() => setMobileOpen(true)} data-testid="button-open-menu">
            <Menu size={17} />
          </button>
          <div className="hidden items-center gap-3 md:flex">
            <span className="k-mono text-[10px] text-[hsl(var(--muted-foreground))]">SECURE CONSOLE</span>
            <span className="size-1 rounded-full bg-[hsl(var(--primary))]" />
            <span className="k-mono text-[10px] text-[hsl(var(--primary))]">SIMULATION MODE</span>
            <span className="k-pill k-status-warn text-[9px]">LOCAL / AUTHORIZED TARGETS ONLY</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="k-mono hidden text-[10px] text-[hsl(var(--muted-foreground))] sm:block">UTC {new Date().toISOString().slice(11, 16)}</span>
            <span className="grid size-8 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[10px] font-bold">SD</span>
          </div>
        </header>
        <main className="k-content k-grid flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

function Modal({ title, detail, onClose, children }: { title: string; detail: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[hsl(222_30%_5%/.78)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="k-card max-h-[90dvh] w-full max-w-xl overflow-y-auto p-5 shadow-2xl md:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="k-eyebrow mb-2 text-[hsl(var(--primary))]">Authorized action</p>
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{detail}</p>
          </div>
          <button className="k-button k-button-ghost p-2" onClick={onClose} data-testid="button-close-dialog"><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MetricStrip({ items }: { items: Array<{ label: string; value: ReactNode; note: string; icon: LucideIcon }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, note, icon: Icon }, index) => (
        <div className={`k-card k-reveal k-reveal-${index % 4} p-5`} key={label} data-testid={`metric-${label.replaceAll(' ', '-')}`}>
          <div className="mb-6 flex items-start justify-between"><span className="k-eyebrow">{label}</span><Icon size={16} className="text-[hsl(var(--muted-foreground))]" /></div>
          <p className="k-mono text-3xl font-semibold tracking-[-.06em]">{value}</p>
          <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">{note}</p>
        </div>
      ))}
    </div>
  );
}

function ProofOfFixCard({ finding, detail }: { finding?: Finding; detail?: FindingDetail }) {
  const verification = detail?.verification;
  const checks = verification
    ? [
        ['exploit reproduced', verification.exploitBefore],
        ['patch applied', verification.patchApplied],
        ['exploit blocked', verification.exploitAfter],
        ['regression', verification.regression],
        ['static rescan', verification.staticRescan],
        ['dynamic retest', verification.dynamicRetest],
      ]
    : [];
  return (
    <section className="k-card k-proof-card overflow-hidden p-5 md:p-6" data-testid={`proof-of-fix-${finding?.id ?? 'latest'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="k-eyebrow text-[hsl(var(--primary))]">Find → Prove → Fix → Prove again</p>
          <h2 className="mt-2 text-lg font-semibold">{finding ? finding.title : 'Proof-of-fix record'}</h2>
          <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{finding ? `${findingLabel(finding)} · ${finding.cwe} · ${finding.file}:${finding.line}` : 'Evidence-backed remediation state from the latest loaded run.'}</p>
        </div>
        <span className={`k-pill ${finding?.status === 'verified' ? 'k-status-live' : 'k-status-warn'}`}><span className="size-1.5 rounded-full bg-current" />{finding?.status === 'verified' ? 'verified' : 'awaiting proof'}</span>
      </div>
      {checks.length ? (
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map(([label, value]) => <div className="border-l-2 border-[hsl(var(--primary)/.55)] bg-[hsl(var(--primary)/.035)] px-3 py-2.5" key={label}><p className="k-eyebrow">{label}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--secondary-foreground))]">{value}</p></div>)}
        </div>
      ) : (
        <div className="mt-6 grid gap-2 sm:grid-cols-4">
          {['reproduce', 'constrain patch', 'retest exploit', 'regression'].map((step, index) => <div className="flex items-center gap-2" key={step}><span className={`grid size-7 place-items-center rounded-full border ${index < 2 ? 'border-[hsl(var(--primary)/.4)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>{index < 2 ? <Check size={13} /> : index + 1}</span><span className="text-xs">{step}</span></div>)}
        </div>
      )}
    </section>
  );
}

function ExportReportButton({ finding, scan }: { finding?: FindingDetail; scan?: ScanDetail | Scan | null }) {
  const exportReport = () => {
    const payload = {
      product: 'AI Kavach',
      mode: 'SIMULATION MODE',
      targetBoundary: 'LOCAL / AUTHORIZED TARGETS ONLY',
      exportedAt: new Date().toISOString(),
      scan: scan ?? null,
      finding: finding ?? null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ai-kavach-${finding ? `finding-${finding.id}` : `evidence-report`}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <button className="k-button k-button-ghost k-focus" onClick={exportReport} disabled={!finding && !scan} data-testid="button-export-security-report"><Download size={14} /> Export security report</button>;
}

function ReasoningChain({ finding }: { finding: FindingDetail }) {
  const rows = [
    ['observation', finding.summary],
    ['evidence', finding.evidence[0]?.value || 'Evidence record loaded from the scan ledger.'],
    ['hypothesis', finding.rootCause],
    ['action', `Constrained patch proposed for ${finding.file}:${finding.line}.`],
    ['result', finding.verification.verdict],
  ];
  return (
    <section className="k-card p-5 md:p-6">
      <SectionTitle eyebrow="Explainable agent record" title="Structured reasoning" action={<span className="k-pill k-status-muted">no hidden chain-of-thought</span>} />
      <div className="grid gap-0 border-l border-[hsl(var(--primary)/.35)] pl-4">
        {rows.map(([label, value], index) => <div className="relative border-b border-[hsl(var(--border))] py-3 first:pt-0 last:border-0 last:pb-0" key={label}><span className="absolute -left-[21px] top-4 size-2 rounded-full border-2 border-[hsl(var(--primary))] bg-[hsl(var(--card))]" /><p className="k-eyebrow text-[hsl(var(--primary))]">{String(index + 1).padStart(2, '0')} / {label}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--secondary-foreground))]">{value}</p></div>)}
      </div>
    </section>
  );
}

function Overview() {
  const summaryQuery = useGetDashboardSummary();
  const activityQuery = useListActivity();
  const summary = summaryQuery.data;
  const trend = summary?.assuranceTrend || [];
  const maxTrend = Math.max(...trend.map((item) => item.score), 100);
  const latest = summary?.latestScan;
  const latestDetailQuery = useGetScan(latest?.id || 0, { query: { enabled: !!latest?.id, queryKey: getGetScanQueryKey(latest?.id || 0) } });
  const metrics = [
    { label: 'protected projects', value: summary?.projects ?? <Skeleton className="h-9 w-16" />, note: 'registered targets', icon: FolderGit2 },
    { label: 'scans observed', value: summary?.scans ?? <Skeleton className="h-9 w-16" />, note: 'simulation ledger', icon: Radar },
    { label: 'findings under proof', value: summary?.findings ?? <Skeleton className="h-9 w-16" />, note: 'severity-aware queue', icon: FileSearch },
    { label: 'assurance baseline', value: latest?.assuranceScore != null ? latest.assuranceScore : '—', note: 'latest verified score / 100', icon: ShieldCheck },
  ];
  return <div className="mx-auto max-w-[1440px]">
    <PageHeader eyebrow="Situation room / 00" title="Proof, not promises." detail="A controlled command view for turning suspicious signals into evidence-backed decisions." action={<Link href="/scan-room" className="k-button k-button-primary k-focus" data-testid="link-start-scan"><Radar size={15} /> Open scan room <ArrowUpRight size={14} /></Link>} />
    <div className="mb-4 flex flex-wrap gap-2"><span className="k-pill k-status-warn">SIMULATION MODE</span><span className="k-pill k-status-muted"><LockKeyhole size={11} /> LOCAL / AUTHORIZED TARGETS ONLY</span></div>
    <MetricStrip items={metrics} />
    <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <section className="k-card k-reveal k-reveal-2 p-5 md:p-6">
        <SectionTitle eyebrow="Confidence over time · simulation-derived" title="Assurance trend" action={<span className="k-pill k-status-live"><span className="size-1.5 rounded-full bg-current" /> state-backed</span>} />
        {summaryQuery.isLoading ? <div className="flex h-48 items-end gap-3 pt-8">{[55, 40, 70, 45, 80, 65].map((height, index) => <span key={index} className="k-pulse flex-1 rounded-md bg-[hsl(var(--muted))]" style={{ height: `${height}%` }} />)}</div> :
          summaryQuery.isError ? <ErrorState onRetry={() => summaryQuery.refetch()} /> :
          trend.length === 0 ? <EmptyState icon={Gauge} title="No assurance history yet" detail="Complete your first autonomous scan to establish the baseline." /> :
          <div className="relative mt-6 h-52"><div className="absolute inset-0 flex flex-col justify-between">{[100, 75, 50, 25, 0].map((tick) => <div className="flex items-center gap-3" key={tick}><span className="k-mono w-7 text-right text-[9px] text-[hsl(var(--muted-foreground))]">{tick}</span><div className="h-px flex-1 bg-[hsl(var(--border))]" /></div>)}</div><div className="absolute inset-x-11 bottom-5 top-1 flex items-end justify-between gap-2">{trend.map((item) => <div className="group flex h-full flex-1 items-end justify-center" key={item.label}><div className="relative w-full max-w-10 rounded-t-sm bg-[hsl(var(--primary)/.76)] transition-all duration-500 group-hover:bg-[hsl(var(--primary))]" style={{ height: `${Math.max((item.score / maxTrend) * 100, 5)}%` }}><span className="absolute -top-5 left-1/2 -translate-x-1/2 k-mono text-[9px] text-[hsl(var(--primary))]">{item.score}</span></div><span className="absolute bottom-0 k-mono translate-y-5 text-[9px] text-[hsl(var(--muted-foreground))]">{item.label}</span></div>)}</div></div>}
      </section>
      <section className="k-card k-reveal k-reveal-3 p-5 md:p-6">
        <SectionTitle eyebrow="Agent trail" title="Recent activity" action={<Link href="/agent-trail" className="k-focus text-[hsl(var(--primary))]" data-testid="link-all-activity"><ArrowUpRight size={15} /></Link>} />
        {activityQuery.isLoading ? <div className="grid gap-4">{[1, 2, 3, 4].map((item) => <Skeleton className="h-10" key={item} />)}</div> : activityQuery.isError ? <ErrorState onRetry={() => activityQuery.refetch()} /> : activityQuery.data?.length ? <ActivityList events={activityQuery.data.slice(0, 6)} /> : <EmptyState icon={Activity} title="No agent events" detail="Activity will appear as agents inspect, reproduce, and verify." />}
      </section>
    </div>
    <div className="mt-4 grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
      <section className="k-card k-reveal k-reveal-1 p-5 md:p-6">
        <SectionTitle eyebrow="Latest proof" title="Last scan completed" />
        {summaryQuery.isLoading ? <LoadingState label="Resolving latest scan" /> : latest ? <div><div className="mb-5 flex items-start justify-between"><div><p className="k-mono text-xs text-[hsl(var(--primary))]">{scanLabel(latest)}</p><h3 className="mt-1 text-lg font-semibold">{latest.projectName || 'Protected project'}</h3></div><StatusPill status={latest.status} /></div><div className="flex items-end gap-4"><div><span className="k-mono text-5xl font-semibold tracking-[-.08em] text-[hsl(var(--primary))]">{latest.assuranceScore ?? '—'}</span><span className="k-mono ml-2 text-xs text-[hsl(var(--muted-foreground))]">/ 100</span></div><div className="mb-1 h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${latest.assuranceScore || 0}%` }} /></div></div><div className="mt-6 flex gap-2"><Link href={`/scans/${latest.id}`} className="k-button k-button-ghost flex-1 k-focus" data-testid="link-latest-scan">Inspect proof record <ArrowUpRight size={14} /></Link><ExportReportButton scan={latestDetailQuery.data || latest} /></div></div> : <EmptyState icon={BookOpenCheck} title="Your proof room is empty" detail="Run a scan to turn a signal into an independently verified record." />}
      </section>
      <section className="k-card k-reveal k-reveal-2 p-5 md:p-6">
        <SectionTitle eyebrow="Severity register" title="Open risk by severity" action={<Link href="/findings" className="k-focus text-xs text-[hsl(var(--primary))]" data-testid="link-finding-ledger">Open ledger <ArrowUpRight className="ml-1 inline" size={13} /></Link>} />
        {summary?.severity ? <div className="grid gap-2">{Object.entries(summary.severity).map(([severity, count]) => <div className="flex items-center gap-3" key={severity}><SeverityPill severity={severity} /><div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className={`h-full rounded-full ${severity === 'critical' ? 'bg-[hsl(var(--destructive))]' : severity === 'high' ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--primary))]'}`} style={{ width: `${Math.min(Number(count) * 12, 100)}%` }} /></div><span className="k-mono w-7 text-right text-xs">{count}</span></div>)}</div> : <div className="grid gap-3">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-7" />)}</div>}
        <div className="mt-6 border-t border-[hsl(var(--border))] pt-4"><p className="k-eyebrow">Operating principle</p><p className="mt-2 max-w-lg text-sm leading-6 text-[hsl(var(--muted-foreground))]">An alert is a question. A reproduction is a fact. A verification is a decision you can defend.</p></div>
      </section>
    </div>
    <section className="k-card mt-4 p-5 md:p-6"><SectionTitle eyebrow="Proof-of-fix center" title="Latest remediation state" action={<Link href="/verification" className="k-button k-button-ghost k-focus" data-testid="link-verification-center">Open center <ArrowUpRight size={14} /></Link>} /><ProofOfFixCard detail={latestDetailQuery.data?.findings[0] ? undefined : undefined} /><div className="mt-3 text-[10px] text-[hsl(var(--muted-foreground))]">Proof data loads from the selected finding dossier; no assurance state is inferred by the client.</div></section>
    <div className="mt-4 flex items-center gap-2 border-t border-[hsl(var(--border))] pt-4"><Network size={14} className="text-[hsl(var(--primary))]" /><p className="text-[11px] text-[hsl(var(--muted-foreground))]">Telemetry is derived from loaded scan stages. Seeded records are clearly marked as simulation.</p></div>
  </div>;
}

function Projects() {
  const queryClient = useQueryClient();
  const projectsQuery = useListProjects();
  const createProject = useCreateProject();
  const [showRegister, setShowRegister] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '', sourceType: 'repository', sourceRef: '', languages: '' });
  const selectedQuery = useGetProject(selectedId || 0, { query: { enabled: !!selectedId, queryKey: getGetProjectQueryKey(selectedId || 0) } });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    createProject.mutate({ data: { ...form, sourceType: form.sourceType as ProjectInput['sourceType'], languages: form.languages.split(',').map((value) => value.trim()).filter(Boolean) } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() }); setShowRegister(false); setForm({ name: '', description: '', sourceType: 'repository', sourceRef: '', languages: '' }); } });
  };
  const projects = projectsQuery.data || [];
  return <div className="mx-auto max-w-[1440px]"><PageHeader eyebrow="Protected estate / 01" title="Protected targets" detail="Register only repositories and workspaces you are authorized to inspect. Credentials never render in this console." action={<button className="k-button k-button-primary k-focus" onClick={() => setShowRegister(true)} data-testid="button-register-project"><Plus size={15} /> Register target</button>} /><div className="mb-4 flex flex-wrap gap-2"><span className="k-pill k-status-warn"><LockKeyhole size={11} /> LOCAL / AUTHORIZED TARGETS ONLY</span><span className="k-pill k-status-muted">simulation boundary enforced</span></div>{projectsQuery.isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div className="k-card p-4" key={item}><Skeleton className="h-10 w-2/3" /><Skeleton className="mt-5 h-10 w-full" /><Skeleton className="mt-4 h-4 w-1/2" /></div>)}</div> : projectsQuery.isError ? <ErrorState onRetry={() => projectsQuery.refetch()} /> : projects.length === 0 ? <EmptyState icon={FolderGit2} title="No protected targets" detail="Register an authorized repository or workspace to give Kavach a surface to reason over." /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} onSelect={() => setSelectedId(project.id)} />)}</div>}{showRegister && <Modal title="Register a protected target" detail="This simulation accepts only targets you are authorized to analyze." onClose={() => setShowRegister(false)}><form className="grid gap-4" onSubmit={submit}><label><span className="k-label">Target name</span><input className="k-input" required placeholder="Atlas Gateway" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-project-name" /></label><label><span className="k-label">Description</span><textarea className="k-input min-h-20 resize-y" placeholder="What does this workspace defend?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="input-project-description" /></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="k-label">Source type</span><select className="k-input" value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value })} data-testid="select-source-type"><option value="repository">Repository</option><option value="archive">Archive</option><option value="workspace">Workspace</option></select></label><label><span className="k-label">Languages</span><input className="k-input" placeholder="Go, TypeScript" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} data-testid="input-project-languages" /></label></div><label><span className="k-label">Source reference</span><input className="k-input" required placeholder="local://authorized/workspace" value={form.sourceRef} onChange={(e) => setForm({ ...form, sourceRef: e.target.value })} data-testid="input-project-source" /></label>{createProject.isError && <p className="text-xs text-[hsl(var(--destructive))]">Registration could not be completed. Check the source reference and retry.</p>}<button className="k-button k-button-primary mt-2 w-full" disabled={createProject.isPending} data-testid="button-submit-project">{createProject.isPending ? 'Registering target…' : 'Register protected target'}</button></form></Modal>}{selectedId && <ProjectInspect project={selectedQuery.data} loading={selectedQuery.isLoading} onClose={() => setSelectedId(null)} />}</div>;
}

function ProjectInspect({ project, loading, onClose }: { project?: Project; loading: boolean; onClose: () => void }) {
  return <div className="fixed inset-0 z-30 flex justify-end bg-[hsl(222_30%_5%/.5)] backdrop-blur-sm"><div className="k-card h-full w-full max-w-md overflow-y-auto rounded-none border-y-0 border-r-0 p-6 md:p-8"><button className="k-button k-button-ghost mb-8 p-2" onClick={onClose} data-testid="button-close-project-inspect"><ArrowLeft size={15} /> Close</button>{loading ? <LoadingState label="Resolving target record" /> : project ? <><p className="k-eyebrow text-[hsl(var(--primary))]">Protected target record</p><div className="mt-3 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-md bg-[hsl(var(--primary)/.1)] font-bold text-[hsl(var(--primary))]">{initials(project.name)}</span><div><h2 className="text-xl font-bold">{project.name}</h2><p className="k-mono text-[10px] text-[hsl(var(--muted-foreground))]">ID {project.id} · {project.sourceType}</p></div></div><p className="mt-6 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{project.description || 'No description provided.'}</p><div className="mt-7 grid gap-4">{[['source reference', projectRepo(project)], ['status', project.status], ['languages', project.languages?.join(', ') || 'Not mapped'], ['registered', formatDate(project.createdAt)], ['last scan', formatDate(project.lastScanAt)]].map(([label, value]) => <div className="border-b border-[hsl(var(--border))] pb-3" key={label}><p className="k-eyebrow">{label}</p><p className="k-mono mt-1 break-words text-xs">{value}</p></div>)}</div><Link href={`/scan-room?projectId=${project.id}`} className="k-button k-button-primary mt-8 w-full k-focus" data-testid="link-project-scans">Open scan room <ArrowUpRight size={14} /></Link></> : <ErrorState label="Target record unavailable" />}</div></div>;
}

function ScanRoom() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const projectsQuery = useListProjects();
  const scansQuery = useListScans();
  const createScan = useCreateScan();
  const [showStart, setShowStart] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [mode, setMode] = useState('autonomous');
  const scans = scansQuery.data || [];
  const startFromQuery = () => { const match = window.location.search.match(/projectId=(\d+)/); if (match) setProjectId(match[1]); setShowStart(true); };
  const submit = (event: FormEvent) => { event.preventDefault(); createScan.mutate({ data: { projectId: Number(projectId), mode: mode as 'autonomous' | 'assisted' } }, { onSuccess: (scan) => { queryClient.invalidateQueries({ queryKey: getListScansQueryKey() }); setShowStart(false); setLocation(`/scans/${scan.id}`); } }); };
  return <div className="mx-auto max-w-[1440px]"><PageHeader eyebrow="Command operations / 02" title="Scan room" detail="Start and observe the deterministic closed loop: map, probe, repair, prove." action={<button className="k-button k-button-primary k-focus" onClick={startFromQuery} data-testid="button-start-scan"><ScanLine size={15} /> Start autonomous scan</button>} /><div className="mb-4 grid gap-3 md:grid-cols-3"><div className="k-boundary rounded-lg p-4 md:col-span-2"><p className="k-eyebrow text-[hsl(var(--accent))]">Operating boundary</p><p className="mt-2 text-sm leading-6">Simulation mode is active. Runs are deterministic and limited to local or explicitly authorized targets.</p></div><div className="k-card p-4"><p className="k-eyebrow">Run modes</p><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Autonomous completes the proof chain. Assisted pauses at review checkpoints.</p></div></div><div className="grid gap-4 lg:grid-cols-[1fr_300px]"><section className="k-card overflow-hidden"><div className="border-b border-[hsl(var(--border))] p-5"><SectionTitle eyebrow="Run ledger" title="Observed scans" action={<span className="k-mono text-[10px] text-[hsl(var(--muted-foreground))]">{scans.length} records</span>} /></div>{scansQuery.isLoading ? <div className="grid gap-3 p-5">{[1, 2, 3, 4].map((item) => <Skeleton className="h-16" key={item} />)}</div> : scansQuery.isError ? <div className="p-5"><ErrorState onRetry={() => scansQuery.refetch()} /></div> : scans.length ? scans.map((scan) => <ScanRow key={scan.id} scan={scan} />) : <div className="p-5"><EmptyState icon={Radar} title="No scans in the ledger" detail="Choose an authorized target to start the first reasoning run." /></div>}</section><aside className="k-card h-fit p-5"><SectionTitle eyebrow="Pipeline" title="Evidence chain" /><div className="grid gap-4">{[['01', 'Map', 'Establish project boundary'], ['02', 'Probe', 'Find and reproduce behavior'], ['03', 'Repair', 'Generate constrained patch'], ['04', 'Prove', 'Retest and record verdict']].map(([index, label, detail]) => <div className="flex gap-3" key={index}><span className="k-mono text-[10px] text-[hsl(var(--primary))]">{index}</span><div><p className="text-xs font-semibold">{label}</p><p className="mt-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{detail}</p></div></div>)}</div></aside></div>{showStart && <Modal title="Start a scan run" detail="Select an authorized target. The backend controls all trust-critical state." onClose={() => setShowStart(false)}><form className="grid gap-4" onSubmit={submit}><label><span className="k-label">Protected target</span><select className="k-input" required value={projectId} onChange={(e) => setProjectId(e.target.value)} data-testid="select-scan-project"><option value="">Choose a target</option>{(projectsQuery.data || []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label><span className="k-label">Run mode</span><select className="k-input" value={mode} onChange={(e) => setMode(e.target.value)} data-testid="select-scan-mode"><option value="autonomous">Autonomous · full proof chain</option><option value="assisted">Assisted · review checkpoints</option></select></label>{createScan.isError && <p className="text-xs text-[hsl(var(--destructive))]">The scan could not start. Check that the target is available and retry.</p>}<button className="k-button k-button-primary mt-2 w-full" disabled={createScan.isPending || projectsQuery.isLoading} data-testid="button-submit-scan">{createScan.isPending ? 'Opening evidence room…' : 'Start scan run'}</button></form></Modal>}</div>;
}

function ScanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const scanId = Number(id);
  const queryClient = useQueryClient();
  const scanQuery = useGetScan(scanId, { query: { enabled: !!scanId, queryKey: getGetScanQueryKey(scanId), refetchInterval: (query) => query.state.data?.status === 'running' ? 1200 : false } });
  const rerun = useRerunScan();
  const scan = scanQuery.data;
  function rerunScan() { rerun.mutate({ id: scanId }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetScanQueryKey(scanId) }); queryClient.invalidateQueries({ queryKey: getListScansQueryKey() }); } }); }
  if (scanQuery.isLoading) return <LoadingState label="Opening scan evidence room" />;
  if (scanQuery.isError || !scan) return <ErrorState onRetry={() => scanQuery.refetch()} label="Scan evidence unavailable" />;
  return <div className="mx-auto max-w-[1440px]"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/scan-room" className="k-button k-button-ghost k-focus" data-testid="link-back-scans"><ArrowLeft size={14} /> Scan room</Link><div className="flex gap-2"><StatusPill status={scan.status} /><button className="k-button k-button-ghost" disabled={rerun.isPending} onClick={rerunScan} data-testid="button-rerun-scan"><RotateCcw size={14} /> {rerun.isPending ? 'Re-running' : 'Re-run'}</button><ExportReportButton scan={scan} /></div></div><div className="mb-7"><p className="k-eyebrow text-[hsl(var(--primary))]">{scanLabel(scan)} · {scan.status === 'running' ? 'live run' : 'proof record'}</p><h1 className="mt-2 text-2xl font-bold tracking-[-.04em]">{scan.projectName || `Project ${scan.projectId}`}</h1><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Started {formatDate(scan.startedAt)} · current stage <span className="text-[hsl(var(--foreground))]">{scan.stage}</span></p></div><div className="k-card mb-4 p-5 md:p-6"><div className="mb-5 flex items-end justify-between"><div><p className="k-eyebrow">Run progress · backend state</p><p className="mt-2 k-mono text-3xl font-semibold">{scan.progress}%</p></div><div className="text-right"><p className="k-eyebrow">assurance</p><p className="mt-2 k-mono text-3xl font-semibold text-[hsl(var(--primary))]">{scan.assuranceScore ?? '—'}</p></div></div><div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500" style={{ width: `${scan.progress}%` }} /></div><div className="mt-7"><StageRail stages={scan.stages} /></div></div><div className="grid gap-4 lg:grid-cols-[1fr_330px]"><section className="k-card overflow-hidden"><div className="p-5 pb-2 md:p-6 md:pb-2"><SectionTitle eyebrow="Findings / evidence queue" title={`${scan.findings.length} finding${scan.findings.length === 1 ? '' : 's'} in this run`} /></div>{scan.findings.length ? scan.findings.map((finding) => <FindingRow key={finding.id} finding={finding} />) : <div className="p-5"><EmptyState icon={ShieldCheck} title="No findings recorded" detail="The scan has not surfaced a vulnerability that requires proof." /></div>}</section><section className="k-card p-5 md:p-6"><SectionTitle eyebrow="Proof summary" title="Independent checks" /><div className="grid gap-2">{[['reproduced', scan.proof.reproduced], ['patch applied', scan.proof.patched], ['exploit blocked', scan.proof.blocked], ['regression passed', scan.proof.regressionPassed], ['static clean', scan.proof.staticClean], ['dynamic clean', scan.proof.dynamicClean]].map(([label, value]) => <ProofTile key={String(label)} label={String(label)} value={Boolean(value)} />)}</div></section></div></div>;
}

function Findings() {
  const [severity, setSeverity] = useState('all');
  const findingsQuery = useListFindings();
  const findings = useMemo(() => (findingsQuery.data || []).filter((finding) => severity === 'all' || finding.severity === severity), [findingsQuery.data, severity]);
  const counts = useMemo(() => (findingsQuery.data || []).reduce<Record<string, number>>((acc, finding) => ({ ...acc, [finding.severity]: (acc[finding.severity] || 0) + 1 }), {}), [findingsQuery.data]);
  return <div className="mx-auto max-w-[1440px]"><PageHeader eyebrow="Proof system / 03" title="Finding ledger" detail="A severity-aware register of signals that crossed the reproduction threshold. Every row opens a dossier." action={<Link href="/scan-room" className="k-button k-button-primary k-focus" data-testid="link-ledger-scan"><Radar size={15} /> Run another scan</Link>} /><div className="mb-4 flex flex-wrap items-center gap-2"><span className="k-eyebrow mr-2">Filter</span>{['all', 'critical', 'high', 'medium', 'low'].map((item) => <button key={item} className={`k-pill k-focus ${severity === item ? 'k-status-live' : 'k-status-muted'}`} onClick={() => setSeverity(item)} data-testid={`button-filter-${item}`}>{item} {item === 'all' ? findingsQuery.data?.length || 0 : counts[item] || 0}</button>)}</div><section className="k-card overflow-hidden"><div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] px-4 py-3 md:grid-cols-[minmax(0,1.5fr)_110px_90px_80px]"><span className="k-eyebrow">Finding / location</span><span className="k-eyebrow">CWE</span><span className="k-eyebrow">confidence</span><span /></div>{findingsQuery.isLoading ? <div className="grid gap-3 p-5">{[1, 2, 3, 4].map((item) => <Skeleton className="h-14" key={item} />)}</div> : findingsQuery.isError ? <div className="p-5"><ErrorState onRetry={() => findingsQuery.refetch()} /></div> : findings.length ? findings.map((finding) => <FindingRow key={finding.id} finding={finding} />) : <div className="p-5"><EmptyState icon={ShieldCheck} title="No findings match this filter" detail="A clean filter is not a claim about coverage; run a scan to update the ledger." /></div>}</section></div>;
}

function Verification() {
  const findingsQuery = useListFindings();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const findingQuery = useGetFinding(selectedId || 0, { query: { enabled: !!selectedId, queryKey: getGetFindingQueryKey(selectedId || 0) } });
  const findings = findingsQuery.data || [];
  const verified = findings.filter((finding) => finding.status === 'verified').length;
  const pending = findings.length - verified;
  return <div className="mx-auto max-w-[1440px]"><PageHeader eyebrow="Proof system / 04" title="Proof of fix" detail="Compare before and after states without collapsing verification into a green badge." action={<Link href="/findings" className="k-button k-button-ghost k-focus" data-testid="link-verification-findings"><FileSearch size={14} /> Finding ledger</Link>} /><MetricStrip items={[{ label: 'verified findings', value: verified, note: 'backend status: verified', icon: Check }, { label: 'awaiting proof', value: pending, note: 'actionable remediation queue', icon: RefreshCcw }, { label: 'proof model', value: '6 checks', note: 'exploit, patch, regression', icon: ClipboardCheck }, { label: 'execution mode', value: 'sim', note: 'deterministic simulation', icon: SlidersHorizontal }]} /><div className="mt-4 grid gap-4 lg:grid-cols-[.85fr_1.15fr]"><section className="k-card p-5 md:p-6"><SectionTitle eyebrow="Remediation queue" title="Select a finding" />{findingsQuery.isLoading ? <div className="grid gap-3">{[1, 2, 3].map((item) => <Skeleton className="h-16" key={item} />)}</div> : findingsQuery.isError ? <ErrorState onRetry={() => findingsQuery.refetch()} /> : findings.length ? <div className="grid gap-2">{findings.map((finding) => <button key={finding.id} className={`k-focus rounded-md border p-3 text-left transition-colors ${selectedId === finding.id ? 'border-[hsl(var(--primary)/.5)] bg-[hsl(var(--primary)/.06)]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.35)]'}`} onClick={() => setSelectedId(finding.id)} data-testid={`button-select-verification-${finding.id}`}><div className="flex items-center justify-between gap-3"><span className="k-mono text-[10px] text-[hsl(var(--muted-foreground))]">{findingLabel(finding)}</span><StatusPill status={finding.status} /></div><p className="mt-2 truncate text-xs font-semibold">{finding.title}</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{finding.file}:{finding.line}</p></button>)}</div> : <EmptyState icon={ClipboardCheck} title="No remediation queue" detail="Findings appear here after a scan crosses the reproduction threshold." />}</section><div>{findingQuery.isLoading ? <div className="k-card"><LoadingState label="Loading proof record" /></div> : findingQuery.isError ? <ErrorState onRetry={() => findingQuery.refetch()} /> : findingQuery.data ? <div className="grid gap-4"><ProofOfFixCard finding={findingQuery.data} detail={findingQuery.data} /><div className="flex justify-end"><Link href={`/findings/${findingQuery.data.id}`} className="k-button k-button-primary k-focus" data-testid="link-open-selected-dossier">Open finding dossier <ArrowUpRight size={14} /></Link></div></div> : <div className="k-card p-5 md:p-6"><EmptyState icon={BookOpenCheck} title="Proof record not selected" detail="Select a finding to compare exploit-before, patch, exploit-after, and regression states." /></div>}</div></div></div>;
}

function AgentTrail() {
  const activityQuery = useListActivity();
  return <div className="mx-auto max-w-[1100px]"><PageHeader eyebrow="Proof system / 05" title="Agent trail" detail="Technical events are the audit surface: what was observed, when it happened, and which run owns it." action={<button className="k-button k-button-ghost k-focus" onClick={() => activityQuery.refetch()} data-testid="button-refresh-activity"><RotateCcw size={14} /> Refresh trail</button>} /><section className="k-card p-5 md:p-7"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="k-eyebrow">Event stream</p><p className="mt-1 text-sm">Backend activity feed · timestamps in local display</p></div><span className="k-pill k-status-muted">structured events only</span></div>{activityQuery.isLoading ? <div className="grid gap-4">{[1, 2, 3, 4, 5].map((item) => <Skeleton className="h-12" key={item} />)}</div> : activityQuery.isError ? <ErrorState onRetry={() => activityQuery.refetch()} /> : activityQuery.data?.length ? <div className="divide-y divide-[hsl(var(--border))]">{activityQuery.data.map((event) => <div className="grid gap-3 py-4 first:pt-0 md:grid-cols-[130px_1fr_auto]" key={event.id} data-testid={`trail-event-${event.id}`}><span className="k-mono text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(event.createdAt)}</span><div><p className="text-sm font-medium">{event.message}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{event.detail}</p></div><span className="k-pill k-status-muted h-fit justify-self-start">{event.kind}</span></div>)}</div> : <EmptyState icon={Activity} title="No events recorded" detail="A scan will populate the technical event trail." />}</section></div>;
}

function Evidence() {
  const scansQuery = useListScans();
  const scans = scansQuery.data || [];
  return <div className="mx-auto max-w-[1440px]"><PageHeader eyebrow="Proof system / 06" title="Evidence vault" detail="A navigable index of backend-owned scan records and stage manifests. Export only what is loaded." action={<ExportReportButton scan={scans[0]} />} /><div className="mb-4 k-boundary rounded-lg p-4"><p className="k-eyebrow text-[hsl(var(--accent))]">Evidence handling</p><p className="mt-2 text-sm leading-6">Records shown here are simulation artifacts. The client does not synthesize verdicts, payloads, or assurance scores.</p></div><section className="k-card overflow-hidden"><div className="border-b border-[hsl(var(--border))] p-5"><SectionTitle eyebrow="Scan manifests" title="Available evidence records" /></div>{scansQuery.isLoading ? <div className="grid gap-3 p-5">{[1, 2, 3].map((item) => <Skeleton className="h-16" key={item} />)}</div> : scansQuery.isError ? <div className="p-5"><ErrorState onRetry={() => scansQuery.refetch()} /></div> : scans.length ? <div className="divide-y divide-[hsl(var(--border))]">{scans.map((scan) => <Link href={`/scans/${scan.id}`} className="k-focus flex items-center justify-between gap-4 px-5 py-4 hover:bg-[hsl(var(--muted)/.3)]" key={scan.id} data-testid={`link-evidence-scan-${scan.id}`}><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]"><BookOpenCheck size={16} /></span><div className="min-w-0"><p className="k-mono text-[10px] text-[hsl(var(--primary))]">{scanLabel(scan)}</p><p className="truncate text-sm font-semibold">{scan.projectName || `Project ${scan.projectId}`}</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{scan.stage} · {scan.findingCount} findings · {formatDate(scan.completedAt || scan.startedAt)}</p></div></div><ChevronRight size={15} className="text-[hsl(var(--muted-foreground))]" /></Link>)}</div> : <div className="p-5"><EmptyState icon={BookOpenCheck} title="Vault is empty" detail="Complete a scan to create a navigable evidence record." /></div>}</section></div>;
}

function Performance() {
  const scansQuery = useListScans();
  const [selectedId, setSelectedId] = useState(0);
  const selected = selectedId || scansQuery.data?.[0]?.id || 0;
  const scanQuery = useGetScan(selected, { query: { enabled: !!selected, queryKey: getGetScanQueryKey(selected) } });
  const stages = scanQuery.data?.stages || [];
  const total = stages.reduce((sum, stage) => sum + (stage.durationMs || 0), 0);
  const slowest = stages.reduce((current, stage) => (stage.durationMs || 0) > (current?.durationMs || 0) ? stage : current, stages[0]);
  return <div className="mx-auto max-w-[1440px]"><PageHeader eyebrow="Readiness / 07" title="Performance telemetry" detail="Stage-derived timing for the loaded simulation run. This is operational telemetry, not a fabricated SLA." action={<select className="k-input max-w-[260px]" value={selected} onChange={(event) => setSelectedId(Number(event.target.value))} data-testid="select-performance-scan"><option value={0}>Choose scan</option>{(scansQuery.data || []).map((scan) => <option key={scan.id} value={scan.id}>{scanLabel(scan)} · {scan.projectName}</option>)}</select>} />{scanQuery.isLoading ? <div className="k-card"><LoadingState label="Loading stage telemetry" /></div> : scanQuery.isError ? <ErrorState onRetry={() => scanQuery.refetch()} /> : scanQuery.data ? <><MetricStrip items={[{ label: 'observed duration', value: formatDuration(total), note: 'sum of loaded stages', icon: Clock3 }, { label: 'stages recorded', value: stages.length, note: 'backend stage records', icon: Network }, { label: 'slowest stage', value: slowest?.label || '—', note: slowest ? formatDuration(slowest.durationMs) : 'not recorded', icon: Timer }, { label: 'run progress', value: `${scanQuery.data.progress}%`, note: `${scanLabel(scanQuery.data)} · simulation`, icon: Activity }]} /><section className="k-card mt-4 p-5 md:p-6"><SectionTitle eyebrow="Stage timings · simulation-derived" title="Where the run spent time" />{stages.length ? <div className="grid gap-3">{stages.map((stage) => <div className="grid gap-2 md:grid-cols-[150px_1fr_70px] md:items-center" key={stage.key}><div><p className="text-xs font-semibold">{stage.label}</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{stage.status}</p></div><div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary)/.78)]" style={{ width: `${total ? ((stage.durationMs || 0) / total) * 100 : 0}%` }} /></div><span className="k-mono text-right text-[10px]">{formatDuration(stage.durationMs)}</span></div>)}</div> : <EmptyState icon={Timer} title="No timing stages recorded" detail="The backend has not returned stage telemetry for this run." />}</section></> : <div className="k-card p-5"><EmptyState icon={Timer} title="Choose a scan" detail="Select a loaded scan to inspect stage-derived telemetry." /></div>}</div>;
}

function SecurityDesk() {
  const summaryQuery = useGetDashboardSummary();
  const projectsQuery = useListProjects();
  const checks = [
    ['Simulation boundary', true, 'Deterministic backend simulation is labeled in the console.'],
    ['Authorized target gate', true, 'Registration copy requires local or authorized sources.'],
    ['Evidence feed', !summaryQuery.isError, summaryQuery.isError ? 'Dashboard summary is unavailable.' : 'Dashboard metrics are loaded from the backend.'],
    ['Protected estate', !!projectsQuery.data?.length, projectsQuery.data?.length ? `${projectsQuery.data.length} target records loaded.` : 'No protected target has been registered.'],
  ];
  return <div className="mx-auto max-w-[1100px]"><PageHeader eyebrow="Readiness / 08" title="Security desk" detail="Operational posture for the prototype console. Readiness statements are scoped to this simulation, not a production certification." action={<Link href="/settings" className="k-button k-button-ghost k-focus" data-testid="link-security-settings"><Settings2 size={14} /> Prototype settings</Link>} /><div className="k-boundary mb-4 rounded-lg p-5"><div className="flex items-start gap-3"><KeyRound className="mt-0.5 text-[hsl(var(--accent))]" size={18} /><div><p className="k-eyebrow text-[hsl(var(--accent))]">Scope declaration</p><p className="mt-2 text-sm leading-6">AI Kavach is a security engineering prototype. It is not an official military system and makes no air-gapped deployment claim.</p></div></div></div><section className="k-card p-5 md:p-7"><SectionTitle eyebrow="Operational readiness" title="Boundary checks" /><div className="grid gap-3">{checks.map(([label, ready, detail]) => <div className="flex items-start gap-3 border-b border-[hsl(var(--border))] py-4 first:pt-0 last:border-0 last:pb-0" key={String(label)}><span className={`mt-0.5 grid size-6 place-items-center rounded-full ${ready ? 'bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent)/.13)] text-[hsl(var(--accent))]'}`}>{ready ? <Check size={14} /> : <Clock3 size={14} />}</span><div className="flex-1"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold">{label}</p><span className={`k-pill ${ready ? 'k-status-live' : 'k-status-warn'}`}>{ready ? 'ready' : 'attention'}</span></div><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{detail}</p></div></div>)}</div></section><div className="mt-4 grid gap-4 sm:grid-cols-3"><div className="k-card p-5"><p className="k-eyebrow">Control plane</p><p className="mt-3 text-sm font-semibold">Backend-owned</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Mutations use generated API hooks.</p></div><div className="k-card p-5"><p className="k-eyebrow">Trust surface</p><p className="mt-3 text-sm font-semibold">Evidence first</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Verdicts remain tied to loaded records.</p></div><div className="k-card p-5"><p className="k-eyebrow">Target scope</p><p className="mt-3 text-sm font-semibold">Explicit only</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">No external targets are implied.</p></div></div></div>;
}

function Settings() {
  const [saved, setSaved] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [review, setReview] = useState(false);
  const save = () => { localStorage.setItem('kavach-prototype-settings', JSON.stringify({ autoRefresh, review })); setSaved(true); window.setTimeout(() => setSaved(false), 2200); };
  return <div className="mx-auto max-w-[900px]"><PageHeader eyebrow="Readiness / 09" title="Prototype settings" detail="Local display preferences only. No setting here changes backend authorization, scan logic, or trust-critical state." action={<span className="k-pill k-status-muted"><SlidersHorizontal size={11} /> client-only</span>} /><section className="k-card p-5 md:p-7"><SectionTitle eyebrow="Console behavior" title="Configuration surface" /><div className="grid gap-4"><label className="flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] py-4"><div><p className="text-sm font-semibold">Live scan refresh</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Refresh active scan detail while the backend reports running.</p></div><input className="k-toggle" type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} data-testid="toggle-auto-refresh" /></label><label className="flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] py-4"><div><p className="text-sm font-semibold">Assisted review hints</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Show review-oriented copy when starting a scan. Backend mode remains authoritative.</p></div><input className="k-toggle" type="checkbox" checked={review} onChange={(event) => setReview(event.target.checked)} data-testid="toggle-review-hints" /></label><div className="rounded-md border border-[hsl(var(--accent)/.25)] bg-[hsl(var(--accent)/.06)] p-4"><p className="k-eyebrow text-[hsl(var(--accent))]">Immutable prototype boundary</p><p className="mt-2 text-xs leading-5">Simulation mode and LOCAL / AUTHORIZED TARGETS ONLY are always visible and cannot be disabled from this surface.</p></div></div><div className="mt-6 flex items-center justify-end gap-3"><span className="text-xs text-[hsl(var(--primary))]">{saved ? 'Local preferences saved.' : ''}</span><button className="k-button k-button-primary" onClick={save} data-testid="button-save-settings"><Check size={14} /> Save local settings</button></div></section></div>;
}

function FindingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const findingId = Number(id);
  const queryClient = useQueryClient();
  const findingQuery = useGetFinding(findingId, { query: { enabled: !!findingId, queryKey: getGetFindingQueryKey(findingId) } });
  const applyPatch = useApplyFindingPatch();
  const finding = findingQuery.data;
  const apply = () => applyPatch.mutate({ id: findingId }, { onSuccess: (updated) => { queryClient.setQueryData(getGetFindingQueryKey(findingId), updated); queryClient.invalidateQueries({ queryKey: getListFindingsQueryKey() }); } });
  if (findingQuery.isLoading) return <LoadingState label="Reconstructing finding evidence" />;
  if (findingQuery.isError || !finding) return <ErrorState onRetry={() => findingQuery.refetch()} label="Finding evidence unavailable" />;
  return <div className="mx-auto max-w-[1440px]"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href={`/scans/${finding.scanId}`} className="k-button k-button-ghost k-focus" data-testid="link-back-scan"><ArrowLeft size={14} /> Back to scan</Link><div className="flex flex-wrap items-center gap-2"><SeverityPill severity={finding.severity} /><StatusPill status={finding.status} /><ExportReportButton finding={finding} /></div></div><div className="mb-7"><p className="k-eyebrow text-[hsl(var(--destructive))]">{findingLabel(finding)} · finding dossier</p><h1 className="mt-2 max-w-4xl text-2xl font-bold tracking-[-.04em] md:text-3xl">{finding.title}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{finding.summary}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2"><span className="k-mono flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]"><FileCode2 size={13} /> {finding.file}:{finding.line}</span><span className="k-mono flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]"><Terminal size={13} /> {finding.function}</span><span className="k-mono flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]"><BookOpenCheck size={13} /> {finding.cwe}</span></div></div><div className="grid gap-4 lg:grid-cols-[1fr_340px]"><div className="grid gap-4"><ReasoningChain finding={finding} /><section className="k-card p-5 md:p-6"><SectionTitle eyebrow="Source delta" title="Code before and after" /><div className="grid gap-4 xl:grid-cols-2"><CodeBlock label="before · vulnerable path" code={finding.beforeCode} tone="bad" /><CodeBlock label="after · generated patch" code={finding.afterCode} tone="good" /></div></section><section className="k-card p-5 md:p-6"><SectionTitle eyebrow="Evidence ledger" title="Observed signals" /><div className="grid gap-2">{finding.evidence.map((item, index) => <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))] py-3 first:pt-0 last:border-0 last:pb-0" key={`${item.label}-${index}`}><div><p className="text-xs font-semibold">{item.label}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{item.value}</p></div><StatusPill status={item.status} /></div>)}</div></section><ProofOfFixCard finding={finding} detail={finding} /></div><aside className="grid h-fit gap-4 lg:sticky lg:top-5"><section className="k-card p-5 md:p-6"><div className="flex items-start justify-between"><div><p className="k-eyebrow">Confidence</p><p className="mt-2 k-mono text-4xl font-semibold text-[hsl(var(--accent))]">{finding.confidence}<span className="text-lg">%</span></p></div><ShieldCheck className="text-[hsl(var(--primary))]" size={20} /></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full bg-[hsl(var(--accent))]" style={{ width: `${finding.confidence}%` }} /></div></section><section className="k-card p-5 md:p-6"><SectionTitle eyebrow="Remediation" title="Patch verification" /><p className="text-xs leading-5 text-[hsl(var(--muted-foreground))]">Apply the constrained patch, then Kavach will rerun the exploit and regression checks.</p><button className="k-button k-button-primary mt-5 w-full" disabled={applyPatch.isPending || finding.status === 'verified'} onClick={apply} data-testid="button-apply-patch">{applyPatch.isPending ? 'Applying and verifying…' : finding.status === 'verified' ? 'Patch independently verified' : 'Apply patch and verify'}</button>{applyPatch.isError && <p className="mt-3 text-xs text-[hsl(var(--destructive))]">Verification did not complete. No source changes were committed.</p>}</section><section className="k-card p-5 md:p-6"><SectionTitle eyebrow="Verification result" title={finding.verification.verdict} /><div className="grid gap-3">{[['exploit before', finding.verification.exploitBefore], ['patch applied', finding.verification.patchApplied], ['exploit after', finding.verification.exploitAfter], ['regression', finding.verification.regression], ['static rescan', finding.verification.staticRescan], ['dynamic retest', finding.verification.dynamicRetest]].map(([label, value]) => <div className="border-l-2 border-[hsl(var(--primary)/.5)] pl-3" key={String(label)}><p className="k-eyebrow">{label}</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--secondary-foreground))]">{value}</p></div>)}</div></section></aside></div></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Shell><Switch><Route path="/" component={Overview} /><Route path="/scan-room" component={ScanRoom} /><Route path="/scans" component={ScanRoom} /><Route path="/projects" component={Projects} /><Route path="/findings" component={Findings} /><Route path="/verification" component={Verification} /><Route path="/agent-trail" component={AgentTrail} /><Route path="/evidence" component={Evidence} /><Route path="/performance" component={Performance} /><Route path="/security-desk" component={SecurityDesk} /><Route path="/settings" component={Settings} /><Route path="/scans/:id" component={ScanDetailPage} /><Route path="/findings/:id" component={FindingDetailPage} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;