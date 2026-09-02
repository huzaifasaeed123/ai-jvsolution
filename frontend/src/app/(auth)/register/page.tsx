'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';
import { ROLE_OPTIONS, COUNTRIES } from '@/features/auth/constants';
import type { Role } from '@/features/auth/types';
import { useTranslator } from '@/i18n/client';

function RegisterForm() {
  const router = useRouter();
  const t = useTranslator();
  const params = useSearchParams();
  const initialRole = (params.get('role') as Role) ?? 'OWNER';

  const [role, setRole] = useState<Role>(
    ROLE_OPTIONS.some((r) => r.value === initialRole) ? initialRole : 'OWNER',
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.register({ fullName, email, password, role, country: country || undefined });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="eyebrow">{t('auth.registerEyebrow')}</p>
      <h1 className="display mt-2 text-[1.875rem] leading-tight">{t('auth.joinTitle')}</h1>
      <p className="mt-2 text-sm text-muted">{t('auth.joinLede')}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t('auth.joiningAs')}</legend>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((opt) => {
              const selected = role === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  aria-pressed={selected}
                  className={`rounded-lg border p-3 text-left transition-all ${
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
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {opt.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
            {t('auth.fullName')}
          </label>
          <input
            id="fullName"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            {t('auth.email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            {t('auth.password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <p className="mt-1.5 text-xs text-muted">{t('auth.minChars')}</p>
        </div>

        <div>
          <label htmlFor="country" className="mb-1.5 block text-sm font-medium">
            {t('auth.country')}
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="input"
          >
            <option value="">{t('auth.selectCountry')}</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
          {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
        </button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-sm text-muted">
        {t('auth.haveAccount')}{' '}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          {t('nav.signIn')}
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
