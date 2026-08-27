import Link from 'next/link';
import { getStructureLibrary } from '@/features/structures/api';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Partnership structures',
  description:
    'How joint venture, lease, PPP, concession and delivery formulas work — what the owner receives, who carries the risk, and when each fits.',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm text-foreground/80">{value}</p>
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
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Partnership structures</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        There is rarely one right way to structure a venture. These are the formulas in common use —
        what the owner receives, who carries the risk, and when each tends to fit.
      </p>
      <p className="mt-3 text-sm text-muted">
        {library.documented} explained · {library.totalSupported} supported across the platform
      </p>

      {library.groups.map((g) => (
        <div key={g.code} className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">{g.label}</h2>
          <p className="mt-1 text-muted">{g.blurb}</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {g.entries.map((s) => (
              <div key={s.code} className="card p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold">{s.label}</h3>
                  <Badge tone="neutral">{s.code}</Badge>
                </div>
                <p className="mt-2 text-sm text-foreground/80">{s.mechanism}</p>
                <div className="mt-3 border-t border-border pt-2">
                  <Row label="Owner receives" value={s.ownerReceives} />
                  <Row label="Risk" value={s.riskProfile} />
                  <Row label="Best for" value={s.bestFor} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* CTA */}
      <div className="card mt-16 flex flex-col items-center justify-between gap-4 p-8 text-center sm:flex-row sm:text-left">
        <div>
          <h3 className="text-xl font-semibold">Not sure which structure fits?</h3>
          <p className="mt-1 text-muted">
            Describe your opportunity and our recommender ranks the formulas with reasons for each.
          </p>
        </div>
        <Link href="/register" className="btn btn-primary px-6 py-3 text-base">
          Try the recommender
        </Link>
      </div>

      <p className="mt-8 text-xs text-muted">
        Educational summaries only — not legal, tax or investment advice. Structures vary by
        jurisdiction; verify with qualified local advisors.
      </p>
    </section>
  );
}
