// 웹 푸시 구독 저장소 접근 — 브라우저 대신 서버가 service_role 키로 읽고 쓴다 (2026-11-11).
//
// 예전엔 브라우저가 공개 키로 `push_subscriptions`를 직접 조회·수정·삭제했다. 그러려면 테이블을
// 누구에게나 열어 둬야 해서, 공개 키만으로 **전체 구독을 읽거나 지울 수 있었다.**
// 이제 모든 요청은 endpoint 하나에만 닿는다. endpoint는 브라우저 푸시 서비스가 발급하는 추측 불가능한
// URL이라 "그 구독의 주인"임을 뜻하는 열쇠 구실을 한다 — 남의 구독은 endpoint를 모르면 건드릴 수 없다.
// 이 라우트가 배포된 뒤 `supabase/lockdown_public_policies.sql`을 실행해 공개 정책을 없앤다.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IDS = 2000;

function isEndpoint(v: unknown): v is string {
  return typeof v === 'string' && v.length <= 2048 && /^https:\/\/[^\s]+$/.test(v);
}
function isStringList(v: unknown): v is string[] {
  return Array.isArray(v) && v.length <= MAX_IDS && v.every(x => typeof x === 'string' && x.length <= 300);
}
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && JSON.stringify(v).length <= 4000;
}
const bad = (msg: string) => NextResponse.json({ error: msg }, { status: 400 });

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: 'missing env' }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return bad('invalid json'); }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return bad('invalid body');
  const { action, endpoint } = body;
  if (!isEndpoint(endpoint)) return bad('invalid endpoint');

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const table = supabase.from('push_subscriptions');
  const now = new Date().toISOString();

  if (action === 'exists') {
    const { data, error } = await table.select('endpoint').eq('endpoint', endpoint).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ registered: !!data });
  }

  if (action === 'save') {
    const { p256dh, auth, gameIds, prefs, artistKeys } = body;
    if (typeof p256dh !== 'string' || typeof auth !== 'string' || !p256dh || !auth || p256dh.length > 512 || auth.length > 512) {
      return bad('invalid keys');
    }
    if (!isStringList(gameIds)) return bad('invalid gameIds');
    const { error } = await table.upsert(
      { endpoint, p256dh, auth, game_ids: gameIds, updated_at: now },
      { onConflict: 'endpoint' },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // prefs·artist_keys는 best-effort — 컬럼 마이그레이션 전이어도 구독 자체는 성공하게(예전 동작 그대로).
    if (isPlainObject(prefs)) await supabase.from('push_subscriptions').update({ prefs }).eq('endpoint', endpoint);
    if (isStringList(artistKeys)) await supabase.from('push_subscriptions').update({ artist_keys: artistKeys }).eq('endpoint', endpoint);
    return NextResponse.json({ ok: true });
  }

  if (action === 'update') {
    const patch: Record<string, unknown> = {};
    if (body.gameIds !== undefined) { if (!isStringList(body.gameIds)) return bad('invalid gameIds'); patch.game_ids = body.gameIds; }
    if (body.artistKeys !== undefined) { if (!isStringList(body.artistKeys)) return bad('invalid artistKeys'); patch.artist_keys = body.artistKeys; }
    if (body.prefs !== undefined) { if (!isPlainObject(body.prefs)) return bad('invalid prefs'); patch.prefs = body.prefs; }
    if (Object.keys(patch).length === 0) return bad('empty patch');
    const { error } = await table.update({ ...patch, updated_at: now }).eq('endpoint', endpoint);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete') {
    const { error } = await table.delete().eq('endpoint', endpoint);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return bad('unknown action');
}
