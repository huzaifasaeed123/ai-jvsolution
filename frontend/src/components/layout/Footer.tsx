import { config } from '@/lib/config';

export function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-foreground/60 sm:px-6">
        <p className="font-medium text-foreground/80">{config.brandName}</p>
        <p className="mt-2 max-w-xl">
          Platform for private, semi-government and government joint ventures, PPP, concessions and
          infrastructure opportunities. Market intelligence and modelling — not legal, tax or investment advice.
        </p>
        <p className="mt-4">© {new Date().getFullYear()} {config.brandName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
