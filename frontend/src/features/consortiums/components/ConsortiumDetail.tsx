'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import type { Consortium, MemberStatus, RefItem } from '../types';
import { inviteMember, updateMember, removeMember, respondInvite, disbandConsortium } from '../actions';

const STATUS_TONE: Record<MemberStatus, 'neutral' | 'success' | 'danger' | 'warning'> = {
  INVITED: 'warning',
  ACCEPTED: 'success',
  DECLINED: 'danger',
  REMOVED: 'neutral',
};

export function ConsortiumDetail({ consortium, roles }: { consortium: Consortium; roles: RefItem[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const roleLabel = (code: string) => roles.find((r) => r.code === code)?.label ?? code;

  function run(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try { await fn(); router.refresh(); }
      catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    });
  }

  const c = consortium;
  const myInvite = c.members.find((m) => m.isMe && m.status === 'INVITED');

  return (
    <div className="space-y-6">
      <Link href="/dashboard/consortiums" className="text-sm text-muted hover:text-foreground">← My consortiums</Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
          {c.description && <p className="mt-1 text-sm text-muted">{c.description}</p>}
          <p className="mt-1 text-xs text-muted">Lead: {c.lead.fullName} · {c.members.filter((m) => m.status === 'ACCEPTED').length} confirmed · {c.totalEquity}% equity committed</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={c.status === 'DISBANDED' ? 'danger' : c.status === 'ACTIVE' ? 'success' : 'primary'}>{c.status}</Badge>
          {c.isLead && c.status !== 'DISBANDED' && (
            <button onClick={() => run(() => disbandConsortium(c.id))} disabled={pending} className="btn btn-outline text-xs">Disband</button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* My invitation */}
      {myInvite && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-2 border-primary/40 p-4">
          <p className="text-sm">You’ve been invited as <strong>{roleLabel(myInvite.role)}</strong>.</p>
          <div className="flex gap-2">
            <button onClick={() => run(() => respondInvite(c.id, myInvite.id, true))} disabled={pending} className="btn btn-primary text-xs">Accept</button>
            <button onClick={() => run(() => respondInvite(c.id, myInvite.id, false))} disabled={pending} className="btn btn-outline text-xs">Decline</button>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold">Members</h2>
        <div className="mt-3 space-y-2">
          {c.members.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-md bg-foreground/[0.03] px-3 py-2">
              <div className="min-w-40 flex-1">
                <p className="text-sm font-medium">{m.user.fullName}{m.isMe && ' (you)'}</p>
                <p className="text-xs text-muted">{m.user.email}</p>
              </div>
              {c.isLead && m.user.id !== c.lead.id ? (
                <>
                  <select
                    className="rounded-md border border-border-strong bg-transparent px-2 py-1 text-xs"
                    value={m.role}
                    disabled={pending}
                    onChange={(e) => run(() => updateMember(c.id, m.id, { role: e.target.value }))}
                  >
                    {roles.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
                  </select>
                  <input
                    className="w-20 rounded-md border border-border-strong bg-transparent px-2 py-1 text-xs"
                    defaultValue={m.equityPct ?? ''}
                    placeholder="equity %"
                    onBlur={(e) => { const v = e.target.value; if (v !== String(m.equityPct ?? '')) run(() => updateMember(c.id, m.id, { equityPct: Number(v) })); }}
                  />
                  <Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge>
                  <button onClick={() => run(() => removeMember(c.id, m.id))} disabled={pending} className="text-xs text-muted hover:text-red-500">✕</button>
                </>
              ) : (
                <>
                  <span className="text-xs text-muted">{roleLabel(m.role)}</span>
                  <span className="text-xs font-medium">{m.equityPct != null ? `${m.equityPct}%` : '—'}</span>
                  <Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge>
                </>
              )}
            </div>
          ))}
        </div>

        {c.isLead && c.status !== 'DISBANDED' && <InviteForm consortiumId={c.id} roles={roles} onDone={run} />}
      </div>
    </div>
  );
}

function InviteForm({ consortiumId, roles, onDone }: { consortiumId: string; roles: RefItem[]; onDone: (fn: () => Promise<unknown>) => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[0]?.code ?? '');
  const [equity, setEquity] = useState('');

  return (
    <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
      <div className="flex-1">
        <label className="mb-1 block text-xs text-muted">Invite by email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="partner@company.com" />
      </div>
      <select className="input max-w-40" value={role} onChange={(e) => setRole(e.target.value)}>
        {roles.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
      </select>
      <input className="input w-24" value={equity} onChange={(e) => setEquity(e.target.value)} placeholder="equity %" />
      <button
        className="btn btn-primary"
        disabled={!email}
        onClick={() => { onDone(() => inviteMember(consortiumId, { email, role, equityPct: equity ? Number(equity) : undefined })); setEmail(''); setEquity(''); }}
      >
        Invite
      </button>
    </div>
  );
}
