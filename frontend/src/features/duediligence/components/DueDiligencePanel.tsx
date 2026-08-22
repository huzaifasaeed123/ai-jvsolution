'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DueDiligence, DdItem, DdReference } from '../types';
import { Badge } from '@/components/ui/Badge';
import { seedDueDiligence, createDdItem, updateDdItem, deleteDdItem } from '../actions';

const RISK_TONE: Record<string, 'danger' | 'warning' | 'primary' | 'neutral' | 'accent'> = {
  CRITICAL: 'danger',
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'primary',
  INFORMATIONAL: 'neutral',
};

export function DueDiligencePanel({
  opportunityId,
  data,
  reference,
}: {
  opportunityId: string;
  data: DueDiligence | null;
  reference: DdReference;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const catLabel = (code: string) => reference.categories.find((c) => c.code === code)?.label ?? code;

  function run(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  if (!data) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm font-medium">🔒 Due diligence</p>
        <p className="mt-1 text-sm text-muted">
          The due diligence checklist unlocks after the owner grants you access.
        </p>
      </div>
    );
  }

  const { items, summary, canEdit } = data;

  if (items.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm font-medium">No due diligence items yet</p>
        {canEdit ? (
          <button
            onClick={() => run(() => seedDueDiligence(opportunityId))}
            disabled={pending}
            className="btn btn-primary mt-4"
          >
            {pending ? 'Setting up…' : 'Seed standard checklist'}
          </button>
        ) : (
          <p className="mt-1 text-sm text-muted">The owner hasn’t started due diligence yet.</p>
        )}
      </div>
    );
  }

  // Group by category
  const byCat = new Map<string, DdItem[]>();
  for (const i of items) {
    const arr = byCat.get(i.category) ?? [];
    arr.push(i);
    byCat.set(i.category, arr);
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

      {/* Summary */}
      <div className="card flex flex-wrap items-center gap-4 p-4 text-sm">
        <span className="font-medium">{summary.total} items</span>
        <span className="text-muted">·</span>
        <span>{summary.open} open</span>
        <span>{summary.closed} closed</span>
        <span className="ml-auto flex flex-wrap gap-1.5">
          {Object.entries(summary.byRisk).map(([risk, n]) => (
            <Badge key={risk} tone={RISK_TONE[risk] ?? 'neutral'}>
              {risk} {n}
            </Badge>
          ))}
        </span>
      </div>

      {[...byCat.entries()].map(([cat, catItems]) => (
        <div key={cat} className="card p-4">
          <p className="text-sm font-semibold">{catLabel(cat)}</p>
          <div className="mt-2 space-y-2">
            {catItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                opportunityId={opportunityId}
                reference={reference}
                canEdit={canEdit}
                pending={pending}
                onChange={(patch) => run(() => updateDdItem(item.id, opportunityId, patch))}
                onDelete={() => run(() => deleteDdItem(item.id, opportunityId))}
              />
            ))}
          </div>
        </div>
      ))}

      {canEdit && <AddItem opportunityId={opportunityId} reference={reference} onAdd={run} />}
    </div>
  );
}

function ItemRow({
  item,
  reference,
  canEdit,
  pending,
  onChange,
  onDelete,
}: {
  item: DdItem;
  opportunityId: string;
  reference: DdReference;
  canEdit: boolean;
  pending: boolean;
  onChange: (patch: Partial<Pick<DdItem, 'receipt' | 'reviewStatus' | 'riskRating' | 'closure'>>) => void;
  onDelete: () => void;
}) {
  const sel = 'rounded-md border border-border-strong bg-transparent px-2 py-1 text-xs outline-none';
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md bg-foreground/[0.03] px-3 py-2">
      <span className="min-w-40 flex-1 text-sm">{item.title}</span>
      {canEdit ? (
        <>
          <select className={sel} value={item.receipt} disabled={pending} onChange={(e) => onChange({ receipt: e.target.value as DdItem['receipt'] })}>
            {reference.receiptStatuses.map((r) => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
          <select className={sel} value={item.reviewStatus} disabled={pending} onChange={(e) => onChange({ reviewStatus: e.target.value as DdItem['reviewStatus'] })}>
            {reference.reviewStatuses.map((r) => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
          <select className={sel} value={item.riskRating ?? ''} disabled={pending} onChange={(e) => onChange({ riskRating: (e.target.value || null) as DdItem['riskRating'] })}>
            <option value="">Risk —</option>
            {reference.riskRatings.map((r) => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
          <select className={sel} value={item.closure} disabled={pending} onChange={(e) => onChange({ closure: e.target.value as DdItem['closure'] })}>
            {reference.closureStatuses.map((r) => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
          <button onClick={onDelete} disabled={pending} className="text-xs text-muted hover:text-red-500">
            ✕
          </button>
        </>
      ) : (
        <span className="flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{item.receipt.replace('_', ' ')}</Badge>
          {item.riskRating && <Badge tone={RISK_TONE[item.riskRating] ?? 'neutral'}>{item.riskRating}</Badge>}
          <Badge tone={item.closure === 'CLOSED' ? 'success' : 'warning'}>{item.closure}</Badge>
        </span>
      )}
    </div>
  );
}

function AddItem({
  opportunityId,
  reference,
  onAdd,
}: {
  opportunityId: string;
  reference: DdReference;
  onAdd: (fn: () => Promise<unknown>) => void;
}) {
  const [category, setCategory] = useState(reference.categories[0]?.code ?? '');
  const [title, setTitle] = useState('');

  return (
    <div className="card flex flex-wrap items-end gap-2 p-4">
      <select
        className="input max-w-40"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {reference.categories.map((c) => (
          <option key={c.code} value={c.code}>{c.label}</option>
        ))}
      </select>
      <input
        className="input flex-1"
        placeholder="Required document / item…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button
        className="btn btn-primary"
        disabled={title.trim().length < 2}
        onClick={() => {
          onAdd(() => createDdItem(opportunityId, { category, title }));
          setTitle('');
        }}
      >
        Add item
      </button>
    </div>
  );
}
