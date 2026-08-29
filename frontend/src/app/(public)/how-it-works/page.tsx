import Link from 'next/link';
import { config } from '@/lib/config';
import { Badge } from '@/components/ui/Badge';
import {
  IconBuilding,
  IconTarget,
  IconShield,
  IconKey,
  IconChart,
  IconUsers,
  IconInbox,
  IconSpark,
} from '@/components/ui/icons';

export const metadata = {
  title: 'How it works',
  description:
    'From listing an opportunity to closing a venture: matching, controlled disclosure, due diligence, analysis and offers.',
};

const OWNER_JOURNEY = [
  { title: 'List privately', desc: 'Add your opportunity in guided steps. Exact location and your identity stay hidden from the public listing.' },
  { title: 'Get verified', desc: 'Build an Opportunity Passport — a tiered record of which facts have been checked, by whom, and what is still open.' },
  { title: 'Receive matches', desc: 'Developers and investors with a matching mandate surface automatically, each with an explainable fit score.' },
  { title: 'Control disclosure', desc: 'Approve who sees the confidential detail. An NDA gate stands between approval and disclosure, and every reveal is logged.' },
  { title: 'Compare offers', desc: 'Score received offers side by side on the criteria you weight — return, experience, capacity, delivery, guarantees.' },
];

const CAPITAL_JOURNEY = [
  { title: 'Define a mandate', desc: 'Set your sectors, markets, ticket size, target return and risk appetite once.' },
  { title: 'See scored matches', desc: 'Matched opportunities arrive with a 0–100 fit score and the reasons behind it — never a black box.' },
  { title: 'Request access', desc: 'Ask the owner for confidential detail. Once approved and the NDA is signed, location, identity and documents unlock.' },
  { title: 'Diligence & model', desc: 'Work through the data room and due-diligence checklist, then model feasibility, valuation and cost.' },
  { title: 'Offer & partner', desc: 'Submit a structured offer, or form a consortium with contractors, operators and financiers to bid together.' },
];

const TRUST = [
  { icon: <IconShield />, title: 'Anonymous until approved', desc: 'Confidential fields are filtered on the server — not merely hidden in the interface.' },
  { icon: <IconKey />, title: 'NDA-gated data room', desc: 'A 48-section vault. Every download is permission-checked and written to an immutable audit trail.' },
  { icon: <IconSpark />, title: 'Explainable scoring', desc: 'Fit scores and structure recommendations always show the factors and reasons behind them.' },
  { icon: <IconChart />, title: 'Reproducible analysis', desc: 'Every feasibility, valuation and estimate run stores its inputs, assumptions and formula version.' },
];

const TOOLS = [
  { icon: <IconChart />, name: 'Feasibility', desc: 'GDV, IRR, NPV, break-even and up/down scenarios.' },
  { icon: <IconTarget />, name: 'Valuation', desc: 'Residual, comparable, income capitalisation and DCF.' },
  { icon: <IconBuilding />, name: 'Estimate', desc: 'Elemental construction cost by area and specification.' },
  { icon: <IconUsers />, name: 'Structure recommender', desc: 'Ranks JV, PPP and concession formulas against your profile.' },
];

function Journey({
  icon,
  title,
  steps,
  cta,
  href,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  steps: { title: string; desc: string }[];
  cta: string;
  href: string;
  tone: string;
}) {
  return (
    <div className="card p-8">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <h2 className="display mt-4 text-xl">{title}</h2>
      <ol className="mt-5 space-y-5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-foreground/10 text-xs font-semibold">
              {i + 1}
            </span>
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="mt-0.5 text-sm text-muted">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href={href} className="btn btn-outline mt-6">{cta}</Link>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-primary/[0.04]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 30% 0%, #000 40%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 30% 0%, #000 40%, transparent 100%)',
          }}
        />
        <div className="container-page relative py-16 sm:py-20">
          <p className="eyebrow">How it works</p>
          <h1 className="display mt-4 max-w-3xl text-[2.25rem] leading-[1.08] sm:text-[3rem]">
            Built for the deal that needs both sides at the table
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Marketplaces list assets. Prospecting tools chase owners. {config.brandName} treats both
            sides of a venture as first-class participants — with controlled disclosure between them.
          </p>
        </div>
      </section>

      {/* Journeys */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <Journey
            icon={<IconBuilding />}
            title="If you own land or assets"
            steps={OWNER_JOURNEY}
            cta="List an opportunity"
            href="/register?role=OWNER"
            tone="bg-primary/10 text-primary"
          />
          <Journey
            icon={<IconTarget />}
            title="If you develop or invest"
            steps={CAPITAL_JOURNEY}
            cta="Define a mandate"
            href="/register?role=DEVELOPER"
            tone="bg-accent/15 text-accent"
          />
        </div>
      </section>

      {/* Controlled disclosure */}
      <section className="border-y border-border bg-surface">
        <div className="container-page py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Controlled disclosure, step by step</h2>
          <p className="mt-2 max-w-2xl text-muted">
            The sensitive parts of a deal open only as trust is established — and every step leaves a record.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '01', t: 'Public', d: 'Sector, market, indicative size — enough to assess interest.' },
              { n: '02', t: 'Request', d: 'A registered party asks the owner for confidential access.' },
              { n: '03', t: 'Approve + NDA', d: 'The owner approves, the NDA is signed, and the grant is recorded.' },
              { n: '04', t: 'Disclosed', d: 'Location, identity and the data room unlock — each access audited.' },
            ].map((s) => (
              <div key={s.n} className="card p-5">
                <span className="font-mono text-xs text-accent">{s.n}</span>
                <p className="mt-2 font-semibold">{s.t}</p>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="container-page py-16 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight">Analysis built in</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Model the deal without leaving the platform. Every run stores its inputs and assumptions,
          so results are reproducible and auditable.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <div key={t.name} className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                {t.icon}
              </span>
              <p className="mt-3 font-semibold">{t.name}</p>
              <p className="mt-1 text-sm text-muted">{t.desc}</p>
            </div>
          ))}
        </div>
        <Link href="/structures" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Browse the structure library →
        </Link>
      </section>

      {/* Trust */}
      <section className="border-t border-border bg-surface">
        <div className="container-page py-16 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight">Why parties trust the process</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {TRUST.map((t) => (
              <div key={t.title} className="card flex gap-4 p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  {t.icon}
                </span>
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <p className="mt-1 text-sm text-muted">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 sm:py-20">
        <div className="card flex flex-col items-center justify-between gap-4 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-xl font-semibold">Start with either side of the table</h3>
            <p className="mt-1 text-muted">Listing an opportunity and defining a mandate both take minutes.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/opportunities" className="btn btn-outline">
              <IconInbox width={16} height={16} /> Browse market
            </Link>
            <Link href="/register" className="btn btn-primary">Create account</Link>
          </div>
        </div>
      </section>
    </>
  );
}
