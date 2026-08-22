'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';
import { ROLE_OPTIONS, COUNTRIES } from '@/features/auth/constants';
import type { Role } from '@/features/auth/types';

function RegisterForm() {
  const router = useRouter();
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
    <section className="card mx-auto my-16 max-w-lg p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-foreground/60">One account. Two sides of every venture.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div>
          <span className="mb-2 block text-sm font-medium">I am joining as</span>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setRole(opt.value)}
                className={`rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                  role === opt.value
                    ? 'border-foreground bg-foreground/5'
                    : 'border-foreground/15 hover:border-foreground/40'
                }`}
              >
                <span className="block font-medium">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-foreground/55">{opt.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
          />
          <p className="mt-1 text-xs text-foreground/50">Minimum 8 characters.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
          >
            <option value="">Select a country…</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-foreground/60">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
