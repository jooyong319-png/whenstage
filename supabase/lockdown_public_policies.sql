-- 공개 정책 잠금 (2026-11-11) — Supabase SQL Editor에서 1회 실행
--
-- ⚠️ 순서가 중요하다. 반드시 **`/api/push`·`/api/admin/reports` 라우트가 운영에 배포된 뒤** 실행한다.
--    먼저 실행하면 그때까지의 브라우저 코드(테이블 직접 접근)가 막혀 알림 켜기/끄기가 실패한다.
--    배포 직후에도 예전 JS를 열어 둔 탭은 새로고침 전까지 알림 설정 변경이 실패할 수 있다(읽기 전용 영향).
--
-- 실행 뒤에는 브라우저(공개 키)가 이 두 테이블을 직접 읽거나 고칠 수 없고,
-- 서버 라우트와 크론만 service_role 키로 접근한다(service_role은 RLS를 우회한다).

-- 1) 푸시 구독: 공개 조회·추가·수정·삭제 전부 제거
drop policy if exists pub_select_sub on public.push_subscriptions;
drop policy if exists pub_insert_sub on public.push_subscriptions;
drop policy if exists pub_update_sub on public.push_subscriptions;
drop policy if exists pub_delete_sub on public.push_subscriptions;

-- 2) 제보: 누구나 "보내기"만 가능. 조회·상태 변경은 관리자 라우트(service_role)만.
drop policy if exists pub_select_reports on public.data_reports;
drop policy if exists pub_update_reports on public.data_reports;
-- pub_insert_reports 는 그대로 둔다(제보 폼이 브라우저에서 바로 넣는다).

-- 확인: 아래 결과에 push_subscriptions 행이 없고, data_reports는 pub_insert_reports 하나만 남아야 한다.
select tablename, policyname, cmd from pg_policies
where schemaname = 'public' and tablename in ('push_subscriptions', 'data_reports')
order by tablename, policyname;

-- 되돌리기: supabase/push_subscriptions.sql · supabase/data_reports.sql 의 create policy 구문을 다시 실행.
