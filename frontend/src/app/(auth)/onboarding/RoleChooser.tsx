'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLE_OPTIONS } from '@/features/auth/constants';
import type { Role } from '@/features/auth/types';
import { useTranslator } from '@/i18n/client';

/**
 * Role selection for an account created through Google.
 *
 * OAuth gives us an identity but not an intent — Google cannot tell us whether
 * this person owns land or wants to invest in it. That question is asked once,
 * here, immediately after the first sign-in, rather than being guessed.
 */
export function RoleChooser({ initial }: { initial: Role }) {
  const router = useRouter();
  const t = useTranslator();
  const [role, setRole] = useState<Role>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/auth/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? 'Could not save your choice');
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your choice');
      setSaving(false);
    }
  }

  return (
    <>
      <p className="eyebrow">{t('onboarding.eyebrow')}</p>
      <h1 className="display mt-2 text-[1.875rem] leading-tight">{t('onboarding.title')}</h1>
      <p className="mt-2 text-sm text-muted">{t('onboarding.lede')}</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <fieldset>
          <legend className="sr-only">{t('onboarding.title')}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLE_OPTIONS.map((opt) => {
              const selected = role === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  aria-pressed={selected}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    selected
                      ? 'border-primary bg-primary/[0.07] ring-1 ring-inset ring-primary/25'
                      : 'border-border-strong hover:border-primary/40 hover:bg-foreground/[0.02]'
                  }`}
                >
                  <span
                    className={`block text-sm font-semibold ${selected ? 'text-primary' : ''}`}
                  >
                    {opt.label}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-muted">{opt.blurb}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <button type="submit" disabled={saving} className="btn btn-primary w-full py-2.5">
          {saving ? t('onboarding.saving') : t('onboarding.continue')}
        </button>
      </form>
    </>
  );
}
