'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Small-screen navigation. The desktop bar hides its links below `md`, so
 * without this a phone had no way to reach any section of the site.
 */
export function MobileNav({
  items,
  signedIn,
  labels,
}: {
  items: { href: string; label: string }[];
  signedIn: boolean;
  labels: { menu: string; dashboard: string; signIn: string; join: string };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation, so the panel never lingers over the new page.
  useEffect(() => setOpen(false), [pathname]);

  // Stop the page scrolling behind the panel while it is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.menu}
        aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-lg border border-border-strong text-foreground"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          />
          <div className="absolute inset-x-0 top-0 border-b border-border bg-surface shadow-[var(--shadow-md)]">
            <div className="flex h-16 items-center justify-between px-5">
              <span className="eyebrow text-muted">{labels.menu}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border-strong"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="border-t border-border px-3 pb-4 pt-2">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-3 text-[0.95rem] font-medium transition-colors ${
                      active ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-foreground/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
                {signedIn ? (
                  <Link href="/dashboard" className="btn btn-primary py-2.5">
                    {labels.dashboard}
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="btn btn-outline py-2.5">
                      {labels.signIn}
                    </Link>
                    <Link href="/register" className="btn btn-primary py-2.5">
                      {labels.join}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
