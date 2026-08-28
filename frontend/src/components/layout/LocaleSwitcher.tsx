'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES, type Locale } from '@/i18n/config';

/** Sets the locale cookie, then refreshes so the server re-renders translated. */
export function LocaleSwitcher({ current, label }: { current: Locale; label: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const active = LOCALES.find((l) => l.code === current) ?? LOCALES[0];

  function choose(locale: Locale) {
    setOpen(false);
    startTransition(async () => {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
        <span className="hidden sm:inline">{active.native}</span>
      </button>

      {open && (
        <>
          <button
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul
            role="listbox"
            className="absolute end-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-[var(--shadow-md)]"
          >
            {LOCALES.map((l) => (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={l.code === current}
                  onClick={() => choose(l.code)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-foreground/5 ${
                    l.code === current ? 'text-primary' : ''
                  }`}
                >
                  <span>{l.native}</span>
                  <span className="text-xs text-muted">{l.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
