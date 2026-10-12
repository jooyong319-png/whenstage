-- 가수 팔로우 알림 (2026-10-13) — Supabase SQL Editor에서 1회 실행
-- ⚠️ 아직 실행 전. 사장님 확인 후 실행한다(feature/follow 브랜치를 배포하기 **전에**).
--    실행 안 하고 배포해도 사이트는 안 깨진다 — 앱이 이 컬럼 갱신을 best-effort로 하고(lib/push),
--    크론도 컬럼이 없으면 팔로우 알림만 건너뛴다. 다만 그동안 팔로우 알림이 안 간다.
--
-- 1) 구독마다 팔로우한 가수 목록. 키 형식은 '로케일:정규화된 아티스트명'(예: 'ko:권진아').
alter table public.push_subscriptions
  add column if not exists artist_keys    text[] not null default '{}',
  -- 2) '새 공연 등록' 알림의 기준선 — 크론이 이 가수의 기존 공연을 "이미 본 것"으로 기록해 둔 목록.
  --    처음 팔로우했을 때 기존 공연 알림이 한꺼번에 쏟아지지 않게, 첫 회차는 보내지 않고 여기에만 적는다.
  add column if not exists seeded_artists text[] not null default '{}';

-- 팔로우한 가수로 구독자를 찾을 때(겹침 조회) 가속
create index if not exists push_subscriptions_artist_keys_idx
  on public.push_subscriptions using gin (artist_keys);

-- push_sent_log.kind에 새 값이 생긴다(스키마 변경 없음 — text 컬럼):
--   'new_show'      팔로우한 가수의 새 공연 등록
--   'presale_soon'  선예매 1시간 전
--   'general_soon'  일반예매 1시간 전
-- RLS는 기존 정책 그대로(클라이언트는 자기 구독 행만 upsert/update — push_subscriptions.sql 참고).
