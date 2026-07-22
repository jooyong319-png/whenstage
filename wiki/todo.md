# 남은 작업 (2026-07-22 갱신)

## 완료된 것 (참고용 — 다시 하지 말 것)
- [x] 카피 정리("게임" 표현 → 콘서트 도메인) — about/guide/contact/privacy/terms/blog/news
- [x] 콘서트 전용 리서처 프롬프트 신규 작성(prompts/RESEARCHER_KO/EN/JA.md)
- [x] `AGENTS.md` 콘서트 도메인 기준 재작성
- [x] `content/blog`, `content/news` 첫 콘텐츠 채우기 + 전용 리서처 프롬프트
- [x] 사이트 표시명 "WhenStage"로 확정 + 전체 브랜드명 치환
- [x] 아티스트 목록/상세 페이지, 공연장 목록/상세 페이지
- [x] 상세 페이지 사이드바 맥락화(관련 아티스트/공연장/아티클/뉴스)
- [x] 가이드 FAQ 확장 + 용어 사전 페이지
- [x] 콘텐츠 자동화 파이프라인(`prompts/PLANNER.md`) — 주 1회, 콘텐츠 신호 점검 전용

## 사용자가 직접 처리해야 하는 것(자동화 프롬프트가 손댈 수 없는 영역)
- [ ] Vercel 프로젝트 소스를 이 저장소(`whenstage`)로 연결/배포 상태 확인
- [ ] Supabase 프로젝트가 gcalen 것과 분리됐는지 확인(`.env.local` 설정) — 댓글/조회수/
      푸시 기능이 실제로 이 프로젝트 전용 DB를 쓰는지 검증 필요

## 기획/개발 자동화(`prompts/PRODUCT_PLANNER.md`/`prompts/PRODUCT_DEVELOPER.md`)가 판단해서 진행할 것
- [ ] 사이트 아이콘/파비콘이 gcalen 시절 것 그대로인지 확인 후 필요하면 콘서트 도메인에
      맞게 새로 제작
- [ ] `lib/i18nLabels.ts`의 `CAL` 딕셔너리 등에 아직 게임 시절 표현이 남아있는지 점검
      (예: wishlist 관련 문구) — 기능은 정상 작동하지만 카피가 어색할 수 있음
- 그 외엔 이 문서 + `PROJECT_STATUS.md` + 실제 코드베이스를 보고 스스로 다음 우선순위를
  판단할 것(막연한 신규 아이디어보다 관찰된 구체적 문제 우선)
