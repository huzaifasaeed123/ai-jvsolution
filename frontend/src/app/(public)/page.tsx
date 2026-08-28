import Link from "next/link";
import { config } from "@/lib/config";
import { Badge } from "@/components/ui/Badge";
import { getPublicStats } from "@/features/stats/api";
import { listCountries } from "@/features/countries/api";
import {
  IconBuilding,
  IconTarget,
  IconShield,
  IconSpark,
  IconChart,
  IconKey,
} from "@/components/ui/icons";

const FEATURES = [
  { icon: <IconSpark />, title: "Explainable Fit Score", desc: "Two-sided matching that scores and explains every opportunity–mandate pair — no black box." },
  { icon: <IconShield />, title: "Anonymous until approved", desc: "Exact location and owner identity stay private until you approve access and an NDA is in place." },
  { icon: <IconKey />, title: "Permission-controlled data room", desc: "A 48-section vault where every download is checked against access level and written to an audit trail." },
  { icon: <IconChart />, title: "AI feasibility & valuation", desc: "IRR, NPV, break-even and scenarios — plus residual, DCF and comparable valuation, with the assumptions shown." },
  { icon: <IconBuilding />, title: "Verified opportunity passport", desc: "A tiered verification record showing exactly which facts were checked, by whom, and what remains open." },
  { icon: <IconTarget />, title: "Structure recommender", desc: "Rank JV, PPP and concession formulas against your deal profile with reasons for each." },
];

const OWNER_STEPS = [
  "List your opportunity privately in a few guided steps",
  "See what it could become — feasibility, valuation and structure options",
  "Approve who sees it, then compare benchmarked offers side by side",
];

const CAPITAL_STEPS = [
  "Define your mandate once — sectors, markets, ticket size, target return",
  "Receive matched, underwriting-ready opportunities with an explainable score",
  "Model, request access, and submit an offer in one deal room",
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-semibold tracking-tight sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

/** Listings are priced locally, so the API normalises before we format. */
function compactMoney(n: number, currency: string) {
  if (n <= 0) return "—";
  return new Intl.NumberFormat("en", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export default async function Home() {
  const [stats, countries] = await Promise.all([getPublicStats(), listCountries()]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-primary/[0.05]">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Badge tone="accent">Two-sided JV, PPP &amp; concession platform</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Your opportunity.<br />
            <span className="text-primary">Their capital.</span> One venture.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            {config.brandName} connects landowners, governments and asset holders with developers,
            investors, banks and contractors — with explainable matching, verified trust and a
            secure deal room.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register?role=OWNER" className="btn btn-primary px-6 py-3 text-base">
              <IconBuilding width={18} height={18} /> I own land or assets
            </Link>
            <Link href="/register?role=DEVELOPER" className="btn btn-outline px-6 py-3 text-base">
              <IconTarget width={18} height={18} /> I develop or invest
            </Link>
          </div>
        </div>
      </section>

      {/* Live statistics */}
      {stats && (
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat value={String(stats.publishedOpportunities)} label="Live opportunities" />
              <Stat
                value={compactMoney(stats.totalProjectValue, stats.totalProjectValueCurrency)}
                label={`Project value listed (${stats.totalProjectValueCurrency} equivalent)`}
              />
              <Stat value={String(stats.activeMandates)} label="Active mandates" />
              <Stat value={String(stats.marketsCovered)} label="Markets covered" />
            </div>
            <p className="mt-6 text-center text-xs text-muted">
              Live platform figures · {stats.structuresSupported} partnership structures supported ·
              {" "}{stats.documentsSecured} documents secured
            </p>
          </div>
        </section>
      )}

      {/* Two-sided journeys */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-8">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <IconBuilding />
            </span>
            <h2 className="mt-4 text-xl font-semibold">For owners &amp; authorities</h2>
            <ol className="mt-4 space-y-3">
              {OWNER_STEPS.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/80">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground/10 text-xs font-semibold">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <Link href="/register?role=OWNER" className="btn btn-outline mt-6">List an opportunity</Link>
          </div>

          <div className="card p-8">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent">
              <IconTarget />
            </span>
            <h2 className="mt-4 text-xl font-semibold">For developers &amp; investors</h2>
            <ol className="mt-4 space-y-3">
              {CAPITAL_STEPS.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/80">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground/10 text-xs font-semibold">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <Link href="/register?role=DEVELOPER" className="btn btn-outline mt-6">Define a mandate</Link>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Built for institutional trust</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  {f.icon}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets */}
      {countries.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Market intelligence</h2>
              <p className="mt-1 text-muted">How partnerships actually work, market by market.</p>
            </div>
            <Link href="/countries" className="text-sm font-medium text-primary hover:underline">
              All countries →
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {countries.map((c) => (
              <Link
                key={c.code}
                href={`/countries/${c.code.toLowerCase()}`}
                className="card flex items-center gap-2 px-4 py-2.5 text-sm transition-all hover:-translate-y-0.5"
              >
                <span className="text-lg">{c.flag}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="card flex flex-col items-center justify-between gap-4 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-xl font-semibold">Ready to find your partner?</h3>
            <p className="mt-1 text-muted">
              Create an account and list an opportunity or a mandate in minutes.
            </p>
          </div>
          <Link href="/register" className="btn btn-primary px-6 py-3 text-base">
            Create your account
          </Link>
        </div>
      </section>
    </>
  );
}
