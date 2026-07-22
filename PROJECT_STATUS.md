# PROJECT_STATUS.md — WhenStage

## 현재 상태 (2026-07-22)
- `/ko` `/en` `/ja` 완전 대칭 라우팅 구조 전환 완료
- 콘서트·뉴스·아티스트 프로필은 로케일별 완전 독립 데이터(번역 아님), 블로그는 KO 원본 + 선택적 번역
- 스키마·정책: `AGENTS.md`, 프로젝트 배경·아키텍처·과거 결정: `wiki/`(코드 변경 자동화 프롬프트 필독)

### 작업 지시 프롬프트 목록
| 프롬프트 | 대상 | 실행 방식 |
|---|---|---|
| `prompts/RESEARCHER_KO.md` / `_EN.md` / `_JA.md` | `data/concerts.<locale>.json` | 자동 스케줄러(하루 2회) |
| `prompts/NEWS_RESEARCHER_KO.md` / `_EN.md` / `_JA.md` | `content/news/*.<locale>.md` | 자동 스케줄러(하루 2회) |
| `prompts/ARTIST_PROFILE.md` | `data/artist-images.json`, `data/artist-bios.json` | 수동/비정기 + `PLANNER`가 신호 있을 때 직접 실행 |
| `prompts/BLOG_RESEARCHER_KO.md` / `_EN.md` / `_JA.md` | `content/blog/*.<locale>.md`(모아보기, 로케일별 완전 독립) | 수동/비정기 + `PLANNER`가 신호 있을 때 직접 실행 |
| `prompts/PLANNER.md` | 콘텐츠 실행 판단(위 2개 트리거) + 코드 관련 관찰은 제안만 | 자동 스케줄러(주 1회) — 코드는 절대 직접 안 함 |
| `prompts/PRODUCT_PLANNER.md` | `BACKLOG.md`에 코드/기능 백로그 항목 등록(위키 필독) | 자동 스케줄러(권장 주 1회) — 코드는 절대 직접 안 함 |
| `prompts/PRODUCT_DEVELOPER.md` | `BACKLOG.md`의 `대기` 항목 1개 구현 + 자체 검증(타입체크·빌드) 후 push | 자동 스케줄러(권장 더 잦게, 예: 2~3일 1회) |

`prompts/PLANNER.md`(콘텐츠 신호 점검)와 `prompts/PRODUCT_PLANNER.md`(코드/기능 기획)는 이름이 비슷하지만
역할이 다르다 — 전자는 콘텐츠만, 후자는 코드만 본다. 코드/기능 변경은 `PRODUCT_PLANNER` →
`BACKLOG.md` → `PRODUCT_DEVELOPER` 순으로 사람 승인 없이 자동 진행되며, `PRODUCT_DEVELOPER`는
반드시 자기가 만든 걸 자기가 검증(타입체크+빌드, 가능하면 스모크테스트)한 뒤에만 push한다.

## 제안 (승인 대기)
_`prompts/PLANNER.md`가 콘텐츠 파이프라인 바깥의 관찰(법적/민감 영역 등)을 발견하면 여기에 기록.
처리 후 사람이 삭제하거나 완료 표시. 코드/기능 아이디어는 여기가 아니라 `BACKLOG.md`로 간다._

## 최근 변경 로그 (최신이 위, 최대 20개)
- 2026-07-22: 사용자 요청으로 사이트 전체 비주얼 오버홀 진행 — motion(Framer Motion) 도입(카테고리
  필터 필 애니메이션, 카드 호버/프레스, 캘린더 패널 전환, 페이지 전환, 모달 진입/퇴장), 디자인
  토큰 확장(그림자·라디우스·타입 스케일), Space Grotesk 디스플레이 폰트 자체 호스팅(워드마크/
  D-day 전용), 홈 히어로 섹션 신규, 카드/CTA/카테고리 태그 전반 비주얼 강화. gcalen(게임 캘린더)
  시절 죽은 i18n 문구 38개 삭제 + EN/JA "game" 잔재 문구 수정(홈 meta description 포함, SEO 버그).
  `.claude/skills/ui-ux-pro-max` 스킬 설치(프로젝트 스코프, 아직 git 미커밋)
- 2026-07-22: 모아보기(블로그)를 KO 원본+선택적 번역 구조에서 콘서트/뉴스와 동일한 로케일별
  완전 독립 구조로 전환. `content/blog/<slug>.<lang>.md` 파일명 규칙, `lib/blog.ts`/블로그
  페이지/sitemap 재작성, `BLOG_RESEARCHER.md` → KO/EN/JA 3개로 분리
- 2026-07-22: 코드/기능 자동화 파이프라인 신규 — `prompts/PRODUCT_PLANNER.md`(위키 필독, BACKLOG.md에
  스펙 등록) + `prompts/PRODUCT_DEVELOPER.md`(백로그 항목 구현 + 자체 검증 후 push). `wiki/` 폴더를
  저장소 안으로 이동(원격 세션도 clone만으로 읽을 수 있도록), 내용 최신화
- 2026-07-22: 기획 플래너(prompts/PLANNER.md) 신규 — 콘텐츠 실행 여부는 신호 기반으로 직접 판단·실행,
  기획/코드 변경은 이 파일의 "제안" 섹션에만 기록(사람 승인 필요)
- 2026-07-22: AdSense용 콘텐츠 3종(아티스트 소개글, 모아보기 아티클, 가이드 FAQ 확장) 추가
- 2026-07-22: ARTIST_IMAGES.md → prompts/ARTIST_PROFILE.md로 확장(이미지+소개글 통합 큐레이션), prompts/BLOG_RESEARCHER.md 신규
- 2026-07-21: 아티스트 이미지 큐레이션 프롬프트(ARTIST_IMAGES.md), 아티스트 목록/상세 페이지 신규
- 2026-07-21: 뉴스를 콘서트와 동일한 로케일별 완전 독립 구조로 전환 + 뉴스 작성 프롬프트 3종
- 2026-07-21: 리서처 3종 프롬프트(KO/EN/JA) + AGENTS.md 스키마 문서 신규 작성
- 2026-07-21: `/ko` `/en` `/ja` 완전 대칭 라우팅 구조 전환, middleware.ts 신규
