# PROJECT_STATUS.md — WhenStage

## 현재 상태 (2026-07-22)
- `/ko` `/en` `/ja` 완전 대칭 라우팅 구조 전환 완료
- 콘서트·뉴스·아티스트 프로필은 로케일별 완전 독립 데이터(번역 아님), 블로그는 KO 원본 + 선택적 번역
- 스키마·정책: `AGENTS.md`

### 작업 지시 프롬프트 목록
| 프롬프트 | 대상 | 실행 방식 |
|---|---|---|
| `RESEARCHER_KO.md` / `_EN.md` / `_JA.md` | `data/concerts.<locale>.json` | 자동 스케줄러(하루 2회) |
| `NEWS_RESEARCHER_KO.md` / `_EN.md` / `_JA.md` | `content/news/*.<locale>.md` | 자동 스케줄러(하루 2회) |
| `ARTIST_PROFILE.md` | `data/artist-images.json`, `data/artist-bios.json` | 수동/비정기(신규 아티스트 생길 때) |
| `BLOG_RESEARCHER.md` | `content/blog/*.md`(모아보기) | 수동/비정기(신규 글 필요할 때) |

## 최근 변경 로그 (최신이 위, 최대 20개)
- 2026-07-22: AdSense용 콘텐츠 3종(아티스트 소개글, 모아보기 아티클, 가이드 FAQ 확장) 추가
- 2026-07-22: ARTIST_IMAGES.md → ARTIST_PROFILE.md로 확장(이미지+소개글 통합 큐레이션), BLOG_RESEARCHER.md 신규
- 2026-07-21: 아티스트 이미지 큐레이션 프롬프트(ARTIST_IMAGES.md), 아티스트 목록/상세 페이지 신규
- 2026-07-21: 뉴스를 콘서트와 동일한 로케일별 완전 독립 구조로 전환 + 뉴스 작성 프롬프트 3종
- 2026-07-21: 리서처 3종 프롬프트(KO/EN/JA) + AGENTS.md 스키마 문서 신규 작성
- 2026-07-21: `/ko` `/en` `/ja` 완전 대칭 라우팅 구조 전환, middleware.ts 신규
