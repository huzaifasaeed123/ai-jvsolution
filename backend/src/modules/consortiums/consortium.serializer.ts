import { ConsortiumDetail } from './consortiums.repository';

/** Shape a consortium for the client, with total committed equity. */
export function serializeConsortium(c: ConsortiumDetail, viewerId: string) {
  const activeMembers = c.members.filter((m) => m.status !== 'REMOVED' && m.status !== 'DECLINED');
  const totalEquity = activeMembers.reduce((s, m) => s + (m.equityPct ?? 0), 0);
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    status: c.status,
    opportunity: c.opportunity,
    lead: c.lead,
    isLead: c.leadId === viewerId,
    totalEquity,
    members: c.members
      .filter((m) => m.status !== 'REMOVED')
      .map((m) => ({
        id: m.id,
        role: m.role,
        equityPct: m.equityPct,
        status: m.status,
        user: m.user,
        isMe: m.userId === viewerId,
      })),
    createdAt: c.createdAt,
  };
}
