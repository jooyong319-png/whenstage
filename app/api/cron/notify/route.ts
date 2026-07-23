import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import gamesKo from '@/data/concerts.ko.json';
import gamesEn from '@/data/concerts.en.json';
import gamesJa from '@/data/concerts.ja.json';
import type { Category, LocaleCode } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GameLite {
  id: string;
  name: string;
  category: Category;
  release_date: string;
  release_date_approx?: boolean;
}

const CATEGORY_LABEL: Record<LocaleCode, Record<Category, string>> = {
  ko: {
    concert_tour: '콘서트·내한 공연',
    music_release: '음원 발매(컴백)',
    festival: '페스티벌',
    fanmeeting: '팬미팅',
  },
  en: {
    concert_tour: 'Concerts & Tours',
    music_release: 'Music Release (Comeback)',
    festival: 'Festival',
    fanmeeting: 'Fan Meeting',
  },
  ja: {
    concert_tour: 'コンサート・来日公演',
    music_release: '音源発売(カムバック)',
    festival: 'フェスティバル',
    fanmeeting: 'ファンミーティング',
  },
};

// game_ids는 로케일 접두사(ko-/en-/ja-)가 항상 붙어 있다(RESEARCHER 프롬프트 규칙) — 이걸로
// 해당 id가 어느 concerts.<locale>.json 소속인지, 알림 문구를 어느 언어로 보낼지 정한다.
function localeOfId(id: string): LocaleCode | null {
  const p = id.split('-')[0];
  return p === 'ko' || p === 'en' || p === 'ja' ? p : null;
}

function buildPayload(lang: LocaleCode, kind: 'dday' | 'd1', g: GameLite): string {
  const cat = CATEGORY_LABEL[lang][g.category];
  const title =
    lang === 'ko' ? `${kind === 'dday' ? '오늘이에요' : '내일이에요'}! ${g.name}`
    : lang === 'ja' ? `${kind === 'dday' ? '本日' : '明日'}: ${g.name}`
    : `${kind === 'dday' ? 'Today' : 'Tomorrow'}: ${g.name}`;
  const body =
    lang === 'ko' ? `${cat} · 지금 확인해보세요.`
    : lang === 'ja' ? `${cat} · 今すぐチェック！`
    : `${cat} — check it out now.`;
  return JSON.stringify({ title, body, url: `/${lang}/concert/${g.id}`, tag: `${g.id}-${kind}` });
}

// KST 기준 N일 뒤 날짜(YYYY-MM-DD)
function kstDateStr(offsetDays = 0): string {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  kst.setUTCDate(kst.getUTCDate() + offsetDays);
  return kst.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  // 보안: Vercel Cron이 주입하는 Authorization: Bearer <CRON_SECRET> 확인
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:devju546@gmail.com';
  if (!url || !serviceKey || !vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: 'missing env' }, { status: 500 });
  }

  webpush.setVapidDetails(subject, vapidPublic, vapidPrivate);
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 테스트 모드: ?test=1 → 날짜 무관 구독자 전원에게 1발(파이프라인 검증용)
  if (new URL(req.url).searchParams.get('test') === '1') {
    const { data: subs, error: e } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');
    if (e) return NextResponse.json({ error: e.message }, { status: 500 });
    let sent = 0;
    let pruned = 0;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: '테스트 알림 🔔', body: '푸시가 정상 작동해요!', url: '/ko/wishlist' }),
        );
        sent++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
          pruned++;
        }
      }
    }
    return NextResponse.json({ ok: true, test: true, sent, pruned, subs: subs?.length ?? 0 });
  }

  const today = kstDateStr(0);
  const tomorrow = kstDateStr(1);
  // ko/en/ja는 서로 번역이 아니라 완전히 독립된 콘텐츠라(id도 로케일별로 다름) 셋 다 훑어야
  // 함 — 하나로 합친 맵의 키는 id 자체가 이미 로케일 접두사로 전역 유일하다.
  const allGames: GameLite[] = [
    ...(gamesKo as { games: GameLite[] }).games,
    ...(gamesEn as { games: GameLite[] }).games,
    ...(gamesJa as { games: GameLite[] }).games,
  ];
  const byId = new Map(allGames.map(g => [g.id, g]));

  // 대상: 오늘 공연·발매 등(dday) / 내일(d1) — 날짜 미확정(approx)은 제외
  const targets: { id: string; kind: 'dday' | 'd1' }[] = [];
  for (const g of allGames) {
    if (g.release_date_approx) continue;
    if (g.release_date === today) targets.push({ id: g.id, kind: 'dday' });
    else if (g.release_date === tomorrow) targets.push({ id: g.id, kind: 'd1' });
  }
  if (targets.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: 'no targets today' });
  }

  const targetIds = targets.map(t => t.id);
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, game_ids')
    .overlaps('game_ids', targetIds);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let pruned = 0;
  for (const s of subs ?? []) {
    const ids: string[] = s.game_ids ?? [];
    for (const t of targets) {
      if (!ids.includes(t.id)) continue;
      const lang = localeOfId(t.id);
      const g = byId.get(t.id);
      if (!lang || !g) continue; // 접두사가 깨진 id는 스킵(있을 수 없지만 방어)

      // 중복 발송 방지: (endpoint, game_id, kind) unique. 충돌하면 이미 보낸 것.
      const { error: logErr } = await supabase
        .from('push_sent_log')
        .insert({ endpoint: s.endpoint, game_id: t.id, kind: t.kind });
      if (logErr) continue;

      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          buildPayload(lang, t.kind, g),
        );
        sent++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
          pruned++;
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent, pruned, targets: targets.length, subs: subs?.length ?? 0 });
}
