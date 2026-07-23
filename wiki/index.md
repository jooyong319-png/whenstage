# WhenStage 위키

콘서트/음원 발매 캘린더 프로젝트. gcalen(게임 출시 캘린더, `Game_sk` 저장소)의
인프라를 재사용해 만든 프로젝트로, 회사 겸업금지·기밀 문제로 gcalen 서비스를
접으면서 시작됨(2026-07-21). 이후 브랜드명을 "WhenStage"로 확정(2026-07-22).

- 저장소: https://github.com/jooyong319-png/whenstage
- 로컬 경로: `d:/Gcalen/whenstage` (구 `gcalen-concert`에서 폴더명 변경)
- 도메인: whenstage.com
- 배포: Vercel

⚠️ **이 폴더(`wiki/`)는 저장소 안에 있어서 원격/클라우드에서 도는 자동화 프롬프트도
`git clone`만 하면 그대로 읽을 수 있다.** (로컬 `d:/Gcalen/wiki-concert`에 있던 원본은
로컬 전용이라 원격 세션이 못 읽었음 — 그래서 이쪽으로 옮겨 유지보수함)

## 문서 목록
- [decisions.md](decisions.md) — 왜 이렇게 만들었는지(결정 기록, 시간순 추가)
- [architecture.md](architecture.md) — 아키텍처 현황과 지난 결정들
- [todo.md](todo.md) — 남은 작업 목록
- [design-audit.md](design-audit.md) — 2차 리디자인 착수 전 디자인 시스템·컴포넌트·페이지 현황 감사(2026-07-23)

## 이 위키를 읽어야 하는 프롬프트
`prompts/PRODUCT_PLANNER.md`, `prompts/PRODUCT_DEVELOPER.md`(기획/개발 자동화)는 실행 시작 시 **반드시**
이 위키 3개 문서를 먼저 읽는다 — 과거에 왜 이렇게 결정했는지 모르고 움직이면 이미 폐기된
패턴(쿠폰/게임 허브 등)을 되살리거나 이미 검증된 아키텍처 원칙을 어길 위험이 있다.
콘텐츠 리서처(`RESEARCHER_*`, `NEWS_RESEARCHER_*`, `prompts/ARTIST_PROFILE.md`, `prompts/BLOG_RESEARCHER_KO/EN/JA.md`)와
콘텐츠 신호 점검용 `prompts/PLANNER.md`는 이 위키를 읽을 필요 없음(코드/기획 판단을 안 하므로).
