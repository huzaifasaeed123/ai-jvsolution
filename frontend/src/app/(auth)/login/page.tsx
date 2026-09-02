'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';
import { useTranslator } from '@/i18n/client';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslator();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.login({ email, password });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="eyebrow">{t('auth.signInEyebrow')}</p>
      <h1 className="display mt-2 text-[1.875rem] leading-tight">{t('auth.welcomeBack')}</h1>
      <p className="mt-2 text-sm text-muted">{t('auth.signInLede')}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          >
            {error}
          </p>
        )}

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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
          {loading ? t('auth.signingIn') : t('nav.signIn')}
        </button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-sm text-muted">
        {t('auth.newHere')}{' '}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('auth.createAccountLink')}
        </Link>
      </p>
    </>
  );
}
