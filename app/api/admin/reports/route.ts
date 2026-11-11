// 관리자용 제보(data_reports) 조회·상태 변경 — 비밀번호를 **서버에서** 확인한다 (2026-11-11).
//
// 예전엔 비밀번호가 `NEXT_PUBLIC_ADMIN_PASS`라 브라우저 번들에 그대로 실려 나갔고, 제보 테이블도
// 누구나 읽고 고칠 수 있었다(연락처가 들어 있을 수 있다). 이제 브라우저는 입력한 키를 이 라우트로
// 보내고, 서버가 맞을 때만 service_role 키로 읽어 준다.
// 비밀번호는 `ADMIN_PASS`(서버 전용)를 쓴다. 옮기는 동안 끊기지 않게 예전 변수도 읽지만,
// 그 값은 이미 공개됐던 값이니 `ADMIN_PASS`를 새 값으로 넣고 예전 변수는 지울 것.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual, createHash } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function passwordOk(input: unknown): boolean | null {
  const expected = process.env.ADMIN_PASS || process.env.NEXT_PUBLIC_ADMIN_PASS;
  if (!expected) return null; // 미설정 — 열어 두지 않고 막는다
  if (typeof input !== 'string') return false;
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  const ok = passwordOk(body?.password);
  if (ok === null) return NextResponse.json({ error: 'ADMIN_PASS not set' }, { status: 503 });
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (body.action === 'verify') return NextResponse.json({ ok: true });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: 'missing env' }, { status: 503 });
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  if (body.action === 'list') {
    const { data, error } = await supabase
      .from('data_reports')
      .select('id,kind,target_type,target_id,locale,message,contact,status,created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reports: data ?? [] });
  }

  if (body.action === 'update') {
    const { id, status } = body;
    if (typeof id !== 'string' || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ error: 'invalid input' }, { status: 400 });
    }
    const { error } = await supabase.from('data_reports').update({ status }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
