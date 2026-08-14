import type { ActivityEvent, Finding, Project, Scan } from '@workspace/api-client-react';

export const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not recorded';
export const formatDuration = (value?: number | null) => value == null ? '—' : value < 1000 ? `${value}ms` : `${(value / 1000).toFixed(1)}s`;
export const severityTone = (severity?: string) => severity === 'critical' ? 'k-status-danger' : severity === 'high' ? 'k-status-warn' : severity === 'medium' ? 'text-slate-300 bg-slate-400/10 border-slate-400/20' : 'k-status-live';
export const statusTone = (status?: string) => status === 'failed' || status === 'open' ? 'k-status-danger' : status === 'running' || status === 'queued' || status === 'patch_ready' ? 'k-status-warn' : status === 'verified' || status === 'completed' || status === 'complete' ? 'k-status-live' : 'k-status-muted';
export const initials = (name: string) => name.split(/[\s/_-]+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
export const projectRepo = (project: Project) => project.sourceRef || `${project.sourceType} source`;
export const scanLabel = (scan: Scan) => `SC-${String(scan.id).padStart(4, '0')}`;
export const findingLabel = (finding: Finding) => `F-${String(finding.id).padStart(4, '0')}`;
export const eventAccent = (kind: ActivityEvent['kind']) => kind === 'verification' ? 'bg-[hsl(var(--primary))]' : kind === 'finding' ? 'bg-[hsl(var(--destructive))]' : kind === 'scan' ? 'bg-[hsl(var(--accent))]' : 'bg-slate-500';