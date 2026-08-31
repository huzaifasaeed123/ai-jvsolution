import { getPublicStats } from '@/features/stats/api';
import { config } from '@/lib/config';

const PROOF = [
  {
    title: 'Nothing confidential leaves the server early',
    body: 'Exact location and owner identity stay sealed until the owner approves access and an NDA is signed. Approval on its own reveals nothing.',
  },
  {
    title: 'Every score shows its reasoning',
    body: 'Matching, offer comparison and bid evaluation each publish the factors and weights behind the number — there is no black box to argue with.',
  },
  {
    title: 'Figures are counted, not claimed',
    body: 'Platform statistics are read live from the database on every request. None of them are typed in by hand.',
  },
];

function compact(n: number, currency: string) {
  if (n <= 0) return '—';
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * The reassurance half of the sign-in / sign-up split. Hidden below `lg`,
 * where the form should have the whole screen rather than competing with it.
 */
export async function AuthPanel() {
  const stats = await getPublicStats();

  return (
    <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block">
      {/* Hairline grid, masked so it fades rather than tiling to the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 70% 10%, #000 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 70% at 70% 10%, #000 30%, transparent 100%)',
        }}
      />

      <div className="relative flex h-full flex-col justify-center px-10 py-16 xl:px-16">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Joint ventures · PPP · Concessions
          </p>
          <h2 className="display mt-4 text-[2rem] leading-[1.12]">
            One deal room for both sides of a venture
          </h2>
          <p className="mt-4 text-sm leading-relaxed opacity-75">
            {config.brandName} connects landowners, governments and asset holders with the
            developers, investors and contractors who can deliver — under controlled disclosure.
          </p>

          <ul className="mt-10 space-y-6">
            {PROOF.map((p) => (
              <li key={p.title} className="border-l-2 border-accent/60 pl-4">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed opacity-70">{p.body}</p>
              </li>
            ))}
          </ul>

          {stats && (
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-current/15 pt-6">
              <div>
                <p className="figure text-2xl leading-none">{stats.publishedOpportunities}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.1em] opacity-60">
                  Live opportunities
                </p>
              </div>
              <div>
                <p className="figure text-2xl leading-none">
                  {compact(stats.totalProjectValue, stats.totalProjectValueCurrency)}
                </p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.1em] opacity-60">
                  Value listed
                </p>
              </div>
              <div>
                <p className="figure text-2xl leading-none">{stats.marketsCovered}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.1em] opacity-60">
                  Markets
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
