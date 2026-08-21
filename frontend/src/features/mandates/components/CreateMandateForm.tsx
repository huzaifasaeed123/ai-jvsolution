'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COUNTRIES } from '@/features/auth/constants';
import type { OpportunityReference } from '@/features/opportunities/types';
import { createMandate, type CreateMandateInput } from '../actions';
import type { OwnerCategory, RiskLevel } from '../types';

const input =
  'w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40';
const label = 'mb-1 block text-sm font-medium';

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: { code: string; label: string }[];
  selected: string[];
  onToggle: (code: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o.code);
        return (
          <button
            type="button"
            key={o.code}
            onClick={() => onToggle(o.code)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              on ? 'border-foreground bg-foreground text-background' : 'border-foreground/15 hover:border-foreground/40'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function CreateMandateForm({ reference }: { reference: OpportunityReference }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [countryCodes, setCountryCodes] = useState<string[]>([]);
  const [structures, setStructures] = useState<string[]>([]);
  const [ownerCategories, setOwnerCategories] = useState<OwnerCategory[]>([]);
  const [minInvestment, setMin] = useState('');
  const [maxInvestment, setMax] = useState('');
  const [targetIrr, setIrr] = useState('');
  const [riskAppetite, setRisk] = useState<'' | RiskLevel>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle<T extends string>(list: T[], set: (v: T[]) => void, code: T) {
    set(list.includes(code) ? list.filter((c) => c !== code) : [...list, code]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: CreateMandateInput = {
        title,
        sectors: sectors.length ? sectors : undefined,
        countryCodes: countryCodes.length ? countryCodes : undefined,
        structures: structures.length ? structures : undefined,
        ownerCategories: ownerCategories.length ? ownerCategories : undefined,
        minInvestment: minInvestment ? Number(minInvestment) : undefined,
        maxInvestment: maxInvestment ? Number(maxInvestment) : undefined,
        targetIrr: targetIrr ? Number(targetIrr) : undefined,
        riskAppetite: riskAppetite || undefined,
      };
      const created = await createMandate(payload);
      router.push(`/dashboard/mandates/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div>
        <label className={label}>Mandate title</label>
        <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} required minLength={4} />
      </div>

      <div>
        <label className={label}>Target sectors</label>
        <Chips options={reference.sectors} selected={sectors} onToggle={(c) => toggle(sectors, setSectors, c)} />
      </div>

      <div>
        <label className={label}>Target countries</label>
        <Chips
          options={COUNTRIES.map((c) => ({ code: c.code, label: c.name }))}
          selected={countryCodes}
          onToggle={(c) => toggle(countryCodes, setCountryCodes, c)}
        />
      </div>

      <div>
        <label className={label}>Preferred structures</label>
        <Chips
          options={reference.structures}
          selected={structures}
          onToggle={(c) => toggle(structures, setStructures, c)}
        />
      </div>

      <div>
        <label className={label}>Owner types</label>
        <Chips
          options={reference.ownerCategories}
          selected={ownerCategories}
          onToggle={(c) => toggle(ownerCategories, setOwnerCategories, c as OwnerCategory)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={label}>Min ticket</label>
          <input className={input} value={minInvestment} onChange={(e) => setMin(e.target.value)} placeholder="20000000" />
        </div>
        <div>
          <label className={label}>Max ticket</label>
          <input className={input} value={maxInvestment} onChange={(e) => setMax(e.target.value)} placeholder="60000000" />
        </div>
        <div>
          <label className={label}>Target IRR %</label>
          <input className={input} value={targetIrr} onChange={(e) => setIrr(e.target.value)} placeholder="15" />
        </div>
        <div>
          <label className={label}>Risk appetite</label>
          <select className={input} value={riskAppetite} onChange={(e) => setRisk(e.target.value as RiskLevel | '')}>
            <option value="">Any</option>
            {reference.riskLevels.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create mandate & see matches'}
      </button>
    </form>
  );
}
