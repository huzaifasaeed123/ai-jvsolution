'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createConsortium } from '../actions';

export function CreateConsortiumForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const c = await createConsortium({ name, description: description || undefined });
        router.push(`/dashboard/consortiums/${c.id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed');
      }
    });
  }

  return (
    <form onSubmit={submit} className="card max-w-lg space-y-4 p-5">
      <h2 className="text-sm font-semibold">New consortium</h2>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div>
        <label className="mb-1 block text-xs text-muted">Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Description</label>
        <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? 'Creating…' : 'Create consortium'}
      </button>
    </form>
  );
}
