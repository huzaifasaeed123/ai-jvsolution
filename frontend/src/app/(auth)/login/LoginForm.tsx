'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';
import { useSearchParams } from 'next/navigation';
import { useTranslator } from '@/i18n/client';
import { GoogleButton, AuthDivider } from '@/features/auth/GoogleButton';
import type { MessageKey } from '@/i18n/messages';

/** Callback failure codes mapped to something a person can act on. */
const OAUTH_ERRORS: Record<string, MessageKey> = {
  google_failed: 'auth.googleFailed',
  google_unavailable: 'auth.googleFailed',
  google_cancelled: 'auth.googleCancelled',
  google_state: 'auth.googleState',
};

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslator();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The Google callback redirects here with a reason when it cannot finish.
  // `message` carries the backend's own wording for the cases that need it —
  // an unverified email, or a suspended account.
  const oauthCode = params.get('error');
  const oauthMessage = params.get('message');
  const oauthError = oauthMessage
    ? oauthMessage
    : oauthCode
      ? t(OAUTH_ERRORS[oauthCode] ?? 'auth.googleFailed')
      : null;

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

      {oauthError && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {oauthError}
        </p>
      )}

      {googleEnabled && (
        <>
          <div className="mt-8">
            <GoogleButton />
          </div>
          <AuthDivider />
        </>
      )}

      <form onSubmit={onSubmit} className={googleEnabled ? 'space-y-4' : 'mt-8 space-y-4'}>
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
