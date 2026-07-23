-- 사용자 제보(예매 링크 제보/정정, 아티스트 정보 수정·등록 신청) 테이블
-- (Supabase SQL Editor에서 1회 실행)
create table if not exists public.data_reports (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,              -- 'ticketing_link' | 'artist_info' | 'other'
  target_type text not null,              -- 'concert' | 'artist'
  target_id   text not null,              -- concert면 game id, artist면 정규화된 아티스트명
  locale      text not null,              -- 'ko' | 'en' | 'ja'
  message     text not null,              -- 제보 내용(자유 텍스트 — 예매 URL, 정정할 정보 등)
  contact     text,                       -- 선택: 답변받을 이메일 등
  status      text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at  timestamptz not null default now()
);
create index if not exists data_reports_status_idx on public.data_reports (status);

-- RLS: 누구나 제보 가능(insert), 관리자 대시보드가 클라이언트에서 조회·상태변경 가능하도록
-- select/update도 공개(admin 페이지 자체가 이미 비밀번호 게이트 — page_views/AdminDashboard와
-- 동일한 신뢰 모델). 여기 쌓이는 값은 "누가 제보했는지"보다 "무엇을 제보했는지"가 핵심이라
-- 노출돼도 치명적이지 않음 — 다만 개인 연락처(contact)가 있을 수 있어 delete는 막아둔다.
alter table public.data_reports enable row level security;

drop policy if exists pub_insert_reports on public.data_reports;
drop policy if exists pub_select_reports on public.data_reports;
drop policy if exists pub_update_reports on public.data_reports;

create policy pub_insert_reports on public.data_reports for insert to public with check (true);
create policy pub_select_reports on public.data_reports for select to public using (true);
create policy pub_update_reports on public.data_reports for update to public using (true) with check (true);
-- delete 정책 없음 — service_role만 삭제 가능(실수로 지워지는 것 방지, 필요하면 status만 바꿈)
