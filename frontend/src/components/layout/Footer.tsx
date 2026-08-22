import { config } from '@/lib/config';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            JV
          </span>
          <p className="font-semibold text-foreground">{config.brandName}</p>
        </div>
        <p className="mt-3 max-w-xl">
          Platform for private, semi-government and government joint ventures, PPP, concessions and
          infrastructure opportunities. Market intelligence and modelling — not legal, tax or
          investment advice.
        </p>
        <p className="mt-4 text-xs">
          © {new Date().getFullYear()} {config.brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
