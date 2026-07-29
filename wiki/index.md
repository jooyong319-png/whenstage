# index — WhenStage 위키 페이지 카탈로그

> 이 위키의 모든 페이지 + 한 줄 요약. 새 페이지 만들면 여기 추가.
> 처음이면 [[SCHEMA]]부터 읽을 것.

WhenStage = 콘서트/음원 발매 캘린더. gcalen(게임 출시 캘린더, `Game_sk` 저장소)의 인프라를
재사용해 만든 프로젝트로, 회사 겸업금지·기밀 문제로 gcalen을 접으면서 시작됨(2026-07-21),
브랜드명 "WhenStage" 확정(2026-07-22).

- 저장소: https://github.com/jooyong319-png/whenstage · 도메인: whenstage.com · 배포: Vercel

## 코어
- [[SCHEMA]] — 위키 사용법 + 2단 구조(프로젝트/통합) + 3동작(ingest/query/lint) (먼저 읽기)
- 변경 로그 → 저장소 루트 `PROJECT_STATUS.md`의 "최근 변경 로그"(이 위키의 log 역할)

## 프로젝트 지식 (WhenStage 전용)
- [[decisions]] — 왜 이렇게 만들었는지(결정 기록, 시간순 추가)
- [[architecture]] — 라우트 구조(멀티 루트 레이아웃), 데이터/콘텐츠 파이프라인, 외부 연동 현황
- [[todo]] — 남은 작업 목록(상세 상태는 `BACKLOG.md`)
- [[design-audit]] — 2차 리디자인 착수 전 디자인 시스템·컴포넌트·페이지 현황 감사(2026-07-23)

## 상위: 통합 개발 위키 (기술 지식, 재사용)
Next.js·Vercel·Supabase·SEO 같은 **어느 프로젝트든 재사용되는 기술 지식**은 상위 통합 위키
(`../../wiki/`, 즉 `d:/Gcalen/wiki/`)에 있다 — 로컬 작업 시 먼저 참고하면 검증된 함정·패턴을
알고 출발한다. ⚠️ 통합 위키는 이 저장소 **바깥의 로컬 폴더**라 `git clone`만 하는 원격/클라우드
세션은 못 읽는다(로컬 세션 전용). 원격에서도 필요해지면 통합 위키를 별도 저장소로 만들어야 한다.

- [[unified-wiki-inbox]] — **통합 위키로 옮겨야 할 내용 임시 보관함.** 원격 세션은 통합 위키에
  직접 쓸 수 없으므로 여기에 적어두고, 나중에 사람이 옮긴 뒤 이 파일에서 지운다.
  목적지 파일(`seo.md`/`nextjs.md`/`vercel.md` 등)별로 분류돼 있고 프로젝트 이름 없이 작성됨.

## 이 위키를 읽어야 하는 프롬프트
`prompts/PRODUCT_PLANNER.md`, `prompts/PRODUCT_DEVELOPER.md`(기획/개발 자동화)는 실행 시작 시
**반드시** 이 위키 문서들을 먼저 읽는다 — 과거에 왜 이렇게 결정했는지 모르고 움직이면 이미
폐기된 패턴(쿠폰/게임 허브 등)을 되살리거나 검증된 아키텍처 원칙을 어길 위험이 있다.
콘텐츠 리서처(`RESEARCHER_*`, `NEWS_RESEARCHER_*`, `prompts/ARTIST_PROFILE.md`,
`prompts/BLOG_RESEARCHER_KO/EN/JA.md`)와 신호 점검용 `prompts/PLANNER.md`는 읽을 필요 없음.

## 태그
#whenstage #nextjs #wiki
