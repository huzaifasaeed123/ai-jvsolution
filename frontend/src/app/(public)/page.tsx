import Link from "next/link";
import { config } from "@/lib/config";
import { Badge } from "@/components/ui/Badge";
import { IconBuilding, IconTarget, IconShield, IconSpark } from "@/components/ui/icons";

const FEATURES = [
  { icon: <IconSpark />, title: "Explainable Fit Score", desc: "Two-sided matching that scores and explains every opportunity–mandate pair." },
  { icon: <IconShield />, title: "Anonymous until approved", desc: "Exact location and identity stay private until you approve access and an NDA is signed." },
  { icon: <IconBuilding />, title: "Verified opportunities", desc: "A tiered Opportunity Passport from declared info to authority-verified." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-primary/[0.05]">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Badge tone="accent">Two-sided JV & PPP platform</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Your opportunity.<br />
            <span className="text-primary">Their capital.</span> One venture.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            {config.brandName} connects landowners, governments and asset holders with developers,
            investors, banks and contractors — with AI feasibility, verified trust and a secure deal room.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register?role=OWNER" className="btn btn-primary px-6 py-3 text-base">
              <IconBuilding width={18} height={18} /> I own land
            </Link>
            <Link href="/register?role=DEVELOPER" className="btn btn-outline px-6 py-3 text-base">
              <IconTarget width={18} height={18} /> I develop or invest
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
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

        <div className="card mt-12 flex flex-col items-center justify-between gap-4 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-xl font-semibold">Ready to find your partner?</h3>
            <p className="mt-1 text-muted">Create an account and list an opportunity or a mandate in minutes.</p>
          </div>
          <Link href="/register" className="btn btn-primary px-6 py-3 text-base">
            Create your account
          </Link>
        </div>
      </section>
    </>
  );
}
