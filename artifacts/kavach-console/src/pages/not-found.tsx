import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return <div className="grid min-h-[60dvh] place-items-center"><div className="k-card w-full max-w-lg p-8 text-center md:p-12"><FileQuestion className="mx-auto text-[hsl(var(--accent))]" size={30} /><p className="k-eyebrow mt-5 text-[hsl(var(--accent))]">Signal not found / 404</p><h1 className="mt-3 text-2xl font-bold tracking-[-.04em]">This record is outside the room.</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">The path does not map to a protected project, scan, or finding in this console.</p><Link href="/" className="k-button k-button-primary k-focus mt-7" data-testid="link-return-overview"><ArrowLeft size={14} /> Return to overview</Link></div></div>;
}
