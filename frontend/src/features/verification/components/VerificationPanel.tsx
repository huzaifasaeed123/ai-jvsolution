'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Passport, VerificationReference, VerificationTier } from '../types';
import { Badge } from '@/components/ui/Badge';
import { setVerification } from '../actions';

const TIER_TONE: Record<string, 'neutral' | 'primary' | 'accent' | 'success'> = {
  T0: 'neutral',
  T1: 'neutral',
  T2: 'primary',
  T3: 'primary',
  T4: 'accent',
  T5: 'success',
};

export function VerificationPanel({
  opportunityId,
  data,
  reference,
}: {
  opportunityId: string;
  data: Passport;
  reference: VerificationReference;
}) {
  const tierLabel = reference.tiers.find((t) => t.code === data.tier)?.label ?? data.tier;
  const fieldLabel = (code: string) =>
    reference.verifiableFields.find((f) => f.code === code)?.label ?? code;

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">🛡️ Opportunity Passport</span>
          <Badge tone={TIER_TONE[data.tier] ?? 'neutral'}>{tierLabel}</Badge>
        </div>
        {data.reviewedAt && (
          <span className="text-xs text-muted">
            Reviewed {new Date(data.reviewedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {data.verifiedFields.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wide text-muted">Verified</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {data.verifiedFields.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                ✓ {fieldLabel(f)}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.unresolvedItems.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wide text-muted">Unresolved</p>
          <ul className="mt-1 list-inside list-disc text-sm text-foreground/70">
            {data.unresolvedItems.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </div>
      )}

      {data.reviewer && (
        <p className="mt-3 text-xs text-muted">
          Reviewer: {data.reviewer}
          {data.notes ? ` · ${data.notes}` : ''}
        </p>
      )}

      {data.canVerify && <AdminEditor opportunityId={opportunityId} data={data} reference={reference} />}
    </div>
  );
}

function AdminEditor({
  opportunityId,
  data,
  reference,
}: {
  opportunityId: string;
  data: Passport;
  reference: VerificationReference;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<VerificationTier>(data.tier);
  const [fields, setFields] = useState<string[]>(data.verifiedFields);
  const [unresolved, setUnresolved] = useState(data.unresolvedItems.join('\n'));
  const [notes, setNotes] = useState(data.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(code: string) {
    setFields((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await setVerification(opportunityId, {
          tier,
          verifiedFields: fields,
          unresolvedItems: unresolved.split('\n').map((s) => s.trim()).filter(Boolean),
          notes: notes || undefined,
        });
        setOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-outline mt-4 text-xs">
        Edit verification (admin)
      </button>
    );
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
      <div className="grid gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium">Tier</label>
          <select className="input" value={tier} onChange={(e) => setTier(e.target.value as VerificationTier)}>
            {reference.tiers.map((t) => (
              <option key={t.code} value={t.code}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Verified fields</label>
          <div className="flex flex-wrap gap-1.5">
            {reference.verifiableFields.map((f) => {
              const on = fields.includes(f.code);
              return (
                <button
                  key={f.code}
                  type="button"
                  onClick={() => toggle(f.code)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${on ? 'border-foreground bg-foreground text-background' : 'border-border-strong'}`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Unresolved items (one per line)</label>
          <textarea className="input" rows={2} value={unresolved} onChange={(e) => setUnresolved(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Notes (internal)</label>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={pending} className="btn btn-primary">
            {pending ? 'Saving…' : 'Save verification'}
          </button>
          <button onClick={() => setOpen(false)} className="btn btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}
