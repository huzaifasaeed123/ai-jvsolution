'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COUNTRIES } from '@/features/auth/constants';
import type { OpportunityReference } from '../types';
import { createOpportunity, type CreateOpportunityInput } from '../actions';

const STEPS = ['Basics', 'Location', 'Commercial', 'Structure & review'];

const input =
  'w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40';
const label = 'mb-1 block text-sm font-medium';

type FormState = {
  title: string;
  summary: string;
  sector: string;
  projectType: string;
  ownerCategory: 'PRIVATE' | 'SEMI_GOVERNMENT' | 'GOVERNMENT';
  countryCode: string;
  region: string;
  city: string;
  addressLine: string;
  landAreaSqm: string;
  gfaSqm: string;
  currency: string;
  projectValue: string;
  investmentRequired: string;
  targetIrr: string;
  developmentPeriodMonths: string;
  concessionPeriodYears: string;
  riskLevel: '' | 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH';
  structures: string[];
  requiredDeveloperExperience: string;
  financingRequired: boolean;
};

const initial: FormState = {
  title: '',
  summary: '',
  sector: '',
  projectType: '',
  ownerCategory: 'PRIVATE',
  countryCode: '',
  region: '',
  city: '',
  addressLine: '',
  landAreaSqm: '',
  gfaSqm: '',
  currency: 'USD',
  projectValue: '',
  investmentRequired: '',
  targetIrr: '',
  developmentPeriodMonths: '',
  concessionPeriodYears: '',
  riskLevel: '',
  structures: [],
  requiredDeveloperExperience: '',
  financingRequired: false,
};

function num(v: string): number | undefined {
  if (v.trim() === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function CreateOpportunityForm({ reference }: { reference: OpportunityReference }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStructure(code: string) {
    setF((prev) => ({
      ...prev,
      structures: prev.structures.includes(code)
        ? prev.structures.filter((s) => s !== code)
        : [...prev.structures, code],
    }));
  }

  function canNext(): boolean {
    if (step === 0) return f.title.trim().length >= 4 && !!f.sector;
    if (step === 1) return f.countryCode.length === 2;
    return true;
  }

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const payload: CreateOpportunityInput = {
        title: f.title,
        summary: f.summary || undefined,
        sector: f.sector,
        projectType: f.projectType || undefined,
        ownerCategory: f.ownerCategory,
        countryCode: f.countryCode,
        region: f.region || undefined,
        city: f.city || undefined,
        addressLine: f.addressLine || undefined,
        landAreaSqm: num(f.landAreaSqm),
        gfaSqm: num(f.gfaSqm),
        currency: f.currency || undefined,
        projectValue: num(f.projectValue),
        investmentRequired: num(f.investmentRequired),
        targetIrr: num(f.targetIrr),
        developmentPeriodMonths: num(f.developmentPeriodMonths),
        concessionPeriodYears: num(f.concessionPeriodYears),
        structures: f.structures.length ? f.structures : undefined,
        riskLevel: f.riskLevel || undefined,
        requiredDeveloperExperience: f.requiredDeveloperExperience || undefined,
        financingRequired: f.financingRequired,
      };
      const created = await createOpportunity(payload);
      router.push(`/opportunities/${created.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Stepper */}
      <ol className="mb-8 flex flex-wrap gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`rounded-full px-3 py-1 ${
              i === step ? 'bg-foreground text-background' : 'bg-foreground/10 text-foreground/60'
            }`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Step 1 — Basics */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className={label}>Title</label>
            <input className={input} value={f.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <label className={label}>Summary (public)</label>
            <textarea
              className={input}
              rows={3}
              value={f.summary}
              onChange={(e) => set('summary', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Sector</label>
              <select className={input} value={f.sector} onChange={(e) => set('sector', e.target.value)}>
                <option value="">Select…</option>
                {reference.sectors.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Project type</label>
              <select
                className={input}
                value={f.projectType}
                onChange={(e) => set('projectType', e.target.value)}
              >
                <option value="">Select…</option>
                {reference.projectTypes.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Owner category</label>
            <select
              className={input}
              value={f.ownerCategory}
              onChange={(e) => set('ownerCategory', e.target.value as FormState['ownerCategory'])}
            >
              {reference.ownerCategories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 2 — Location */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Country</label>
              <select
                className={input}
                value={f.countryCode}
                onChange={(e) => set('countryCode', e.target.value)}
              >
                <option value="">Select…</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>City</label>
              <input className={input} value={f.city} onChange={(e) => set('city', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={label}>Region</label>
            <input className={input} value={f.region} onChange={(e) => set('region', e.target.value)} />
          </div>
          <div>
            <label className={label}>
              Exact address <span className="text-foreground/40">(confidential — hidden until approved)</span>
            </label>
            <input
              className={input}
              value={f.addressLine}
              onChange={(e) => set('addressLine', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 3 — Commercial */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Land area (m²)</label>
              <input className={input} value={f.landAreaSqm} onChange={(e) => set('landAreaSqm', e.target.value)} />
            </div>
            <div>
              <label className={label}>GFA (m²)</label>
              <input className={input} value={f.gfaSqm} onChange={(e) => set('gfaSqm', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Currency</label>
              <input className={input} value={f.currency} onChange={(e) => set('currency', e.target.value)} />
            </div>
            <div>
              <label className={label}>GDV</label>
              <input className={input} value={f.projectValue} onChange={(e) => set('projectValue', e.target.value)} />
            </div>
            <div>
              <label className={label}>Investment req.</label>
              <input
                className={input}
                value={f.investmentRequired}
                onChange={(e) => set('investmentRequired', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Target IRR %</label>
              <input className={input} value={f.targetIrr} onChange={(e) => set('targetIrr', e.target.value)} />
            </div>
            <div>
              <label className={label}>Dev. months</label>
              <input
                className={input}
                value={f.developmentPeriodMonths}
                onChange={(e) => set('developmentPeriodMonths', e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Risk</label>
              <select
                className={input}
                value={f.riskLevel}
                onChange={(e) => set('riskLevel', e.target.value as FormState['riskLevel'])}
              >
                <option value="">—</option>
                {reference.riskLevels.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Structures & review */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className={label}>Applicable structures</label>
            <div className="max-h-56 overflow-y-auto rounded-md border border-foreground/10 p-2">
              <div className="grid grid-cols-2 gap-1">
                {reference.structures.map((s) => (
                  <label key={s.code} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-foreground/5">
                    <input
                      type="checkbox"
                      checked={f.structures.includes(s.code)}
                      onChange={() => toggleStructure(s.code)}
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={label}>Required developer experience</label>
            <input
              className={input}
              value={f.requiredDeveloperExperience}
              onChange={(e) => set('requiredDeveloperExperience', e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.financingRequired}
              onChange={(e) => set('financingRequired', e.target.checked)}
            />
            Financing required
          </label>
          <p className="text-xs text-foreground/50">
            Your opportunity is created as a <strong>draft</strong>. You can publish it from “My
            opportunities”.
          </p>
        </div>
      )}

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-md border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground/5 disabled:opacity-40"
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => canNext() && setStep((s) => s + 1)}
            disabled={!canNext()}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create opportunity'}
          </button>
        )}
      </div>
    </div>
  );
}
