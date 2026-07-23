'use client';
// 사용자 제보(예매 링크 제보/정정, 아티스트 정보 수정·등록) — Supabase data_reports 테이블.
import { supabase, isSupabaseReady } from './supabase';

export type ReportKind = 'ticketing_link' | 'artist_info' | 'other';
export type ReportTargetType = 'concert' | 'artist';

export interface ReportInput {
  kind: ReportKind;
  targetType: ReportTargetType;
  targetId: string;
  locale: string;
  message: string;
  contact?: string;
}

export function reportsConfigured(): boolean {
  return isSupabaseReady();
}

export async function submitReport(input: ReportInput): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseReady() || !supabase) return { ok: false, error: 'Supabase 미설정' };
  if (!input.message.trim()) return { ok: false, error: 'empty' };
  const { error } = await supabase.from('data_reports').insert({
    kind: input.kind,
    target_type: input.targetType,
    target_id: input.targetId,
    locale: input.locale,
    message: input.message.trim(),
    contact: input.contact?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
