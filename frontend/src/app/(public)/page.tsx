import Link from "next/link";
import { config } from "@/lib/config";
import { getPublicStats } from "@/features/stats/api";
import { listCountries } from "@/features/countries/api";
import { listOpportunities, getOpportunityReference } from "@/features/opportunities/api";
import { CoverImage } from "@/components/ui/Media";
import { formatMoney, toLabelMap, OWNER_CATEGORY_LABEL } from "@/features/opportunities/format";
import { getTranslator } from "@/i18n/server";
import type { MessageKey } from "@/i18n/messages";
import {
  IconBuilding,
  IconTarget,
  IconShield,
  IconSpark,
  IconChart,
  IconKey,
} from "@/components/ui/icons";

const CAPABILITIES: { icon: React.ReactNode; titleKey: MessageKey; descKey: MessageKey }[] = [
  { icon: <IconSpark />, titleKey: "home.capFitTitle", descKey: "home.capFitDesc" },
  { icon: <IconShield />, titleKey: "home.capAnonTitle", descKey: "home.capAnonDesc" },
  { icon: <IconKey />, titleKey: "home.capRoomTitle", descKey: "home.capRoomDesc" },
  { icon: <IconChart />, titleKey: "home.capModelTitle", descKey: "home.capModelDesc" },
  { icon: <IconBuilding />, titleKey: "home.capPassportTitle", descKey: "home.capPassportDesc" },
  { icon: <IconTarget />, titleKey: "home.capStructureTitle", descKey: "home.capStructureDesc" },
];

const OWNER_STEP_KEYS: MessageKey[] = ["home.ownerStep1", "home.ownerStep2", "home.ownerStep3"];
const CAPITAL_STEP_KEYS: MessageKey[] = [
  "home.capitalStep1",
  "home.capitalStep2",
  "home.capitalStep3",
];

/** Listings are priced locally, so the API normalises before we format. */
function compactMoney(n: number, currency: string) {
  if (n <= 0) return "—";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <p className="figure text-[1.75rem] leading-none sm:text-[2.25rem]">{value}</p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-muted">{label}</p>
    </div>
  );
}

export default async function Home() {
  const [stats, countries, featured, reference, t] = await Promise.all([
    getPublicStats(),
    listCountries(),
    listOpportunities({ limit: "3" }),
    getOpportunityReference(),
    getTranslator(),
  ]);
  const sectorLabels = toLabelMap(reference.sectors);
  const deals = featured.items.slice(0, 3);
  const hero = deals[0];

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Ground: a soft wash plus a hairline grid — texture without a gradient blob */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-primary/[0.04]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />

        <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          <div>
            <p className="eyebrow">{t("home.eyebrow")}</p>
            <h1 className="display mt-4 text-[2.5rem] leading-[1.05] sm:text-[3.25rem] lg:text-[3.75rem]">
              {t("home.title1")}
              <br />
              <span className="text-primary">{t("home.title2")}</span> {t("home.title3")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {config.brandName} {t("home.lede")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/register?role=OWNER"
                className="btn btn-primary px-6 py-3 text-base"
              >
                <IconBuilding width={18} height={18} /> {t("home.ctaOwner")}
              </Link>
              <Link
                href="/register?role=DEVELOPER"
                className="btn btn-outline px-6 py-3 text-base"
              >
                <IconTarget width={18} height={18} /> {t("home.ctaDeveloper")}
              </Link>
            </div>

            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
              {t("home.trustLine")}
            </p>
          </div>

          {/* A real listing, not an illustration — the platform proves itself */}
          {hero && (
            <Link
              href={`/opportunities/${hero.id}`}
              className="card group relative block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <div className="relative">
                <CoverImage
                  src={hero.coverImageUrl}
                  alt={hero.title}
                  seed={hero.reference}
                  ratio="16 / 10"
                  sizes="(max-width: 1024px) 100vw, 520px"
                  priority
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                />
                <span className="absolute left-4 top-4 rounded-md bg-black/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/90 backdrop-blur-sm">
                  {t("home.liveBadge")}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-mono text-[11px] text-white/70">{hero.reference}</p>
                  <h2 className="display mt-1 text-xl leading-snug text-white">{hero.title}</h2>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted">
                    {t("opportunities.gdv")}
                  </p>
                  <p className="figure mt-0.5 text-sm">
                    {formatMoney(hero.projectValue, hero.currency)}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted">
                    {t("opportunities.investment")}
                  </p>
                  <p className="figure mt-0.5 text-sm">
                    {formatMoney(hero.investmentRequired, hero.currency)}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted">
                    {t("opportunities.targetIrr")}
                  </p>
                  <p className="figure mt-0.5 text-sm">
                    {hero.targetIrr ? `${hero.targetIrr}%` : "—"}
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ================= LIVE FIGURES ================= */}
      {stats && (
        <section className="border-b border-border bg-surface">
          <div className="container-page py-8 sm:py-10">
            <div className="grid grid-cols-2 divide-x divide-y divide-border border border-border sm:grid-cols-4 sm:divide-y-0">
              <Stat
                value={String(stats.publishedOpportunities)}
                label={t("home.statsOpportunities")}
              />
              <Stat
                value={compactMoney(stats.totalProjectValue, stats.totalProjectValueCurrency)}
                label={`${t("home.statsValue")} · ${stats.totalProjectValueCurrency} eq.`}
              />
              <Stat value={String(stats.verifiedOpportunities)} label={t("home.statsVerified")} />
              <Stat value={String(stats.marketsCovered)} label={t("home.statsMarkets")} />
            </div>
            <p className="mt-4 text-xs text-muted">
              {t("home.statsFootnote")} · {stats.structuresSupported} {t("home.statsStructures")}{" "}
              · {stats.activeMandates}{" "}
              {stats.activeMandates === 1 ? t("home.statsMandate") : t("home.statsMandates")}
            </p>
          </div>
        </section>
      )}

      {/* ================= LIVE OPPORTUNITIES ================= */}
      {deals.length > 0 && (
        <section className="container-page py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="eyebrow">{t("home.dealsEyebrow")}</p>
              <h2 className="display mt-2 text-2xl sm:text-3xl">{t("home.dealsTitle")}</h2>
            </div>
            <Link
              href="/opportunities"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("home.dealsBrowseAll")} →
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((o) => (
              <Link
                key={o.id}
                href={`/opportunities/${o.id}`}
                className="group block"
              >
                <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
                  <CoverImage
                    src={o.coverImageUrl}
                    alt={o.title}
                    seed={o.reference}
                    ratio="3 / 2"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded bg-foreground/[0.07] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                    {OWNER_CATEGORY_LABEL[o.ownerCategory]}
                  </span>
                  <span className="font-mono text-[11px] text-muted">{o.reference}</span>
                </div>
                <h3 className="display mt-1.5 text-lg leading-snug transition-colors group-hover:text-primary">
                  {o.title}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {sectorLabels[o.sector] ?? o.sector}
                  {o.city ? ` · ${o.city}` : ""} · {o.countryCode}
                </p>
                <p className="mt-3 border-t border-border pt-3 text-sm">
                  <span className="text-muted">{t("opportunities.investment")} </span>
                  <span className="figure">
                    {formatMoney(o.investmentRequired, o.currency)}
                  </span>
                  {o.targetIrr ? (
                    <>
                      <span className="text-muted"> · IRR </span>
                      <span className="figure">{o.targetIrr}%</span>
                    </>
                  ) : null}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= TWO SIDES ================= */}
      <section className="border-y border-border bg-surface">
        <div className="container-page py-16 sm:py-20">
          <p className="eyebrow">{t("home.sidesEyebrow")}</p>
          <h2 className="display mt-2 max-w-2xl text-2xl sm:text-3xl">{t("home.sidesTitle")}</h2>

          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-10">
            {[
              {
                icon: <IconBuilding />,
                tint: "bg-primary/10 text-primary",
                title: t("home.ownersTitle"),
                steps: OWNER_STEP_KEYS.map((k) => t(k)),
                cta: { href: "/register?role=OWNER", label: t("home.ownerCta") },
              },
              {
                icon: <IconTarget />,
                tint: "bg-accent/15 text-accent",
                title: t("home.capitalTitle"),
                steps: CAPITAL_STEP_KEYS.map((k) => t(k)),
                cta: { href: "/register?role=DEVELOPER", label: t("home.capitalCta") },
              },
            ].map((side) => (
              <div key={side.title} className="flex flex-col">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl ${side.tint}`}
                >
                  {side.icon}
                </span>
                <h3 className="display mt-4 text-xl">{side.title}</h3>
                <ol className="mt-5 flex-1 space-y-0">
                  {side.steps.map((s, i) => (
                    <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                      {/* Connector shows these are sequential, not a bullet list */}
                      {i < side.steps.length - 1 && (
                        <span
                          aria-hidden
                          className="absolute left-[13px] top-7 bottom-0 w-px bg-border"
                        />
                      )}
                      <span className="relative z-10 grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border border-border bg-background font-mono text-[11px] font-semibold">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-relaxed text-foreground/80">
                        {s}
                      </span>
                    </li>
                  ))}
                </ol>
                <Link href={side.cta.href} className="btn btn-outline mt-6 self-start">
                  {side.cta.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CAPABILITIES ================= */}
      <section className="container-page py-16 sm:py-20">
        <p className="eyebrow">{t("home.capabilitiesEyebrow")}</p>
        <h2 className="display mt-2 max-w-2xl text-2xl sm:text-3xl">
          {t("home.capabilitiesTitle")}
        </h2>

        <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((f) => (
            <div key={f.titleKey} className="border-t border-border pt-5">
              <span className="text-primary">{f.icon}</span>
              <h3 className="mt-3 text-base font-semibold">{t(f.titleKey)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= MARKETS ================= */}
      {countries.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="container-page py-16 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="eyebrow">{t("home.marketsEyebrow")}</p>
                <h2 className="display mt-2 text-2xl sm:text-3xl">{t("home.marketsTitle")}</h2>
              </div>
              <Link
                href="/countries"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("home.marketsAll", { count: countries.length })} →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
              {countries.map((c) => (
                <Link
                  key={c.code}
                  href={`/countries/${c.code.toLowerCase()}`}
                  className="group flex items-center gap-3 bg-surface p-4 transition-colors hover:bg-surface-2"
                >
                  <span className="text-2xl leading-none">{c.flag}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium transition-colors group-hover:text-primary">
                      {c.name}
                    </span>
                    <span className="block font-mono text-[11px] text-muted">
                      {c.ownerShareRange.low}–{c.ownerShareRange.high}%{" "}
                      {t("home.marketsOwnerShare")}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= CTA ================= */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="container-page flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center sm:py-16">
          <div>
            <h2 className="display text-2xl sm:text-[1.75rem]">{t("home.finalTitle")}</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed opacity-80">
              {t("home.finalBody")}
            </p>
          </div>
          <Link
            href="/register"
            className="btn shrink-0 bg-[var(--primary-foreground)] px-6 py-3 text-base text-[var(--primary)] hover:opacity-90"
          >
            {t("common.createAccount")}
          </Link>
        </div>
      </section>
    </>
  );
}
