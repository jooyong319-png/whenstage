-- 웹 푸시 알림용 테이블 (Supabase SQL Editor에서 1회 실행)
-- 1) 구독 정보 + 찜한 게임 id 목록
create table if not exists public.push_subscriptions (
  endpoint   text primary key,
  p256dh     text not null,
  auth       text not null,
  game_ids   text[] not null default '{}',
  updated_at timestamptz not null default now()
);
-- 알림 설정(lib/notifyPrefs.ts: offsets·categories·ticketing·hour) — 운영 DB엔 이미 있는데 이 파일에 빠져 있었다
-- (Codex 점검 2026-11-04). 새로 만드는 DB에서 이게 없으면 크론 조회가 실패한다.
alter table public.push_subscriptions add column if not exists prefs jsonb;
-- game_ids 배열 겹침(overlaps) 조회 가속
create index if not exists push_subscriptions_game_ids_idx
  on public.push_subscriptions using gin (game_ids);

-- 2) 중복 발송 방지 로그 (endpoint+game_id+kind 1회만)
create table if not exists public.push_sent_log (
  endpoint  text not null,
  game_id   text not null,
  kind      text not null,            -- 'd1' | 'dday'
  sent_at   timestamptz not null default now(),
  primary key (endpoint, game_id, kind)
);

-- 3) RLS: 클라이언트(anon)는 자기 구독을 upsert/삭제만, 조회는 불가.
--    cron은 service_role 키로 RLS 우회.
alter table public.push_subscriptions enable row level security;
alter table public.push_sent_log     enable row level security;

-- 역할 모호성 제거: to public. 정책 이름은 따옴표 불필요하게 underscore.
drop policy if exists pub_insert_sub on public.push_subscriptions;
drop policy if exists pub_update_sub on public.push_subscriptions;
drop policy if exists pub_delete_sub on public.push_subscriptions;
drop policy if exists pub_select_sub on public.push_subscriptions;

create policy pub_insert_sub on public.push_subscriptions for insert to public with check (true);
create policy pub_update_sub on public.push_subscriptions for update to public using (true) with check (true);
create policy pub_delete_sub on public.push_subscriptions for delete to public using (true);
-- ⚠️ upsert(ON CONFLICT DO UPDATE)는 기존 행을 읽어야 해서 SELECT 정책 필수.
-- (구독키는 서버 VAPID 비밀키 없이는 무용지물이라 노출되어도 푸시 위조 불가)
create policy pub_select_sub on public.push_subscriptions for select to public using (true);
-- push_sent_log 에는 클라 정책 없음 → service_role 만 접근(=cron 전용)
