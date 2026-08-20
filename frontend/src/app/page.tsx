import Link from "next/link";
import { config } from "@/lib/config";

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-foreground/50">
        Two-sided platform
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Your opportunity. Their capital. One venture.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-foreground/70">
        {config.brandName} connects landowners, governments and asset holders with developers,
        investors, banks and contractors — with AI feasibility, verified trust and a secure deal room.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/register?role=OWNER"
          className="rounded-md bg-foreground px-5 py-3 font-medium text-background hover:opacity-90"
        >
          I own land →
        </Link>
        <Link
          href="/register?role=DEVELOPER"
          className="rounded-md border border-foreground/20 px-5 py-3 font-medium hover:bg-foreground/5"
        >
          I develop or invest →
        </Link>
      </div>

      <p className="mt-16 text-xs text-foreground/40">
        Phase 0 foundation — full landing experience is built in Phase 1, Step 6.
      </p>
    </section>
  );
}
