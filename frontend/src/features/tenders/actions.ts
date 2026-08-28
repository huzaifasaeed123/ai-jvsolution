'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Tender, TenderStage, RiskAllocationItem, EvaluationCriterion } from './types';

async function authed(path: string, init: RequestInit) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const m = (data as { message?: string | string[] }).message;
    throw new Error(Array.isArray(m) ? m.join(', ') : (m ?? 'Request failed'));
  }
  return data;
}

export interface TenderInput {
  title: string;
  procurementType?: string;
  employerRequirements?: string;
  outputSpecification?: string;
  siteInformation?: string;
  governmentSupport?: string;
  paymentMechanism?: string;
  riskAllocation?: RiskAllocationItem[];
  evaluationCriteria?: EvaluationCriterion[];
  currency?: string;
  estimatedValue?: number;
  bidSecurity?: number;
  concessionYears?: number;
  clarificationDeadline?: string;
  submissionDeadline?: string;
}

export async function createTender(opportunityId: string, input: TenderInput): Promise<Tender> {
  const t = (await authed(`/opportunities/${opportunityId}/tenders`, {
    method: 'POST',
    body: JSON.stringify(input),
  })) as Tender;
  revalidatePath('/dashboard/tenders');
  return t;
}

export async function updateTender(tenderId: string, input: Partial<TenderInput>): Promise<Tender> {
  const t = (await authed(`/tenders/${tenderId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })) as Tender;
  revalidatePath('/dashboard/tenders');
  revalidatePath(`/dashboard/tenders/${tenderId}`);
  revalidatePath(`/tenders/${tenderId}`);
  return t;
}

export async function setTenderStage(tenderId: string, stage: TenderStage): Promise<Tender> {
  const t = (await authed(`/tenders/${tenderId}/stage`, {
    method: 'PATCH',
    body: JSON.stringify({ stage }),
  })) as Tender;
  revalidatePath('/dashboard/tenders');
  revalidatePath(`/dashboard/tenders/${tenderId}`);
  revalidatePath(`/tenders/${tenderId}`);
  revalidatePath('/tenders');
  return t;
}

export async function answerClarification(
  clarificationId: string,
  tenderId: string,
  answer: string,
) {
  const r = await authed(`/clarifications/${clarificationId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });
  revalidatePath(`/dashboard/tenders/${tenderId}`);
  revalidatePath(`/tenders/${tenderId}`);
  return r;
}

export async function issueAddendum(
  tenderId: string,
  input: { title: string; description: string; newSubmissionDeadline?: string },
) {
  const r = await authed(`/tenders/${tenderId}/addenda`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  revalidatePath(`/dashboard/tenders/${tenderId}`);
  revalidatePath(`/tenders/${tenderId}`);
  return r;
}
