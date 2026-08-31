import Link from 'next/link';
import { getStructureLibrary } from '@/features/structures/api';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Partnership structures',
  description:
    'How joint venture, lease, PPP, concession and delivery formulas work — what the owner receives, who carries the risk, and when each fits.',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 py-2">
      <dt className="text-[10px] uppercase leading-relaxed tracking-[0.09em] text-muted">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-foreground/80">{value}</dd>
    </div>
  );
}

export default async function StructuresPage() {
  const library = await getStructureLibrary();

  if (!library) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-sm text-muted">Structure library unavailable.</p>
      </section>
    );
  }

  return (
    <section className="container-page py-12 sm:py-16">
      <PageHeader
        eyebrow="Structure library"
        title="Partnership structures"
        lede="There is rarely one right way to structure a venture. These are the formulas in common use — what the owner receives, who carries the risk, and when each tends to fit."
        actions={
          <div className="text-right">
            <p className="figure text-[2rem] leading-none">{library.totalSupported}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-muted">
              structures supported
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">
              {library.documented} explained
            </p>
          </div>
        }
      />

      {library.groups.map((g) => (
        <div key={g.code} className="mt-14">
          <div className="flex items-center gap-4">
            <h2 className="display shrink-0 text-2xl">{g.label}</h2>
            <span aria-hidden className="h-px flex-1 bg-border" />
            <span className="shrink-0 font-mono text-[11px] text-muted">
              {g.entries.length}
            </span>
          </div>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted">{g.blurb}</p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {g.entries.map((s) => (
              <article
                key={s.code}
                className="card flex flex-col p-5 transition-shadow duration-300 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="display text-[1.0625rem] leading-snug">{s.label}</h3>
                  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
                    {s.code}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/80">{s.mechanism}</p>
                <div className="flex-1" />
                <dl className="mt-3 divide-y divide-border border-t border-border">
                  <Row label="Owner gets" value={s.ownerReceives} />
                  <Row label="Risk" value={s.riskProfile} />
                  <Row label="Best for" value={s.bestFor} />
                </dl>
              </article>
            ))}
          </div>
        </div>
      ))}

      {/* CTA */}
      <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-[var(--radius-card)] bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center">
        <div>
          <h3 className="display text-xl">Not sure which structure fits?</h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed opacity-80">
            Describe your opportunity and the recommender ranks the formulas against it, with a
            stated reason for each placement.
          </p>
        </div>
        <Link
          href="/register"
          className="btn shrink-0 bg-[var(--primary-foreground)] px-6 py-3 text-base text-[var(--primary)] hover:opacity-90"
        >
          Try the recommender
        </Link>
      </div>

      <p className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted">
        Educational summaries only — not legal, tax or investment advice. Structures vary by
        jurisdiction; verify with qualified local advisors.
      </p>
    </section>
  );
}
