export type ConsortiumStatus = 'FORMING' | 'ACTIVE' | 'DISBANDED';
export type MemberStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'REMOVED';

export interface ConsortiumMember {
  id: string;
  role: string;
  equityPct: number | null;
  status: MemberStatus;
  user: { id: string; fullName: string; email: string };
  isMe: boolean;
}

export interface Consortium {
  id: string;
  name: string;
  description: string | null;
  status: ConsortiumStatus;
  opportunity: { id: string; reference: string; title: string } | null;
  lead: { id: string; fullName: string; email: string };
  isLead: boolean;
  totalEquity: number;
  members: ConsortiumMember[];
  createdAt: string;
}

export interface RefItem {
  code: string;
  label: string;
}
