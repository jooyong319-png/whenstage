# [수동/비정기 실행용 프롬프트] WhenStage — 모아보기(블로그) 아티클 작성

[언어 규칙] 사용자에게 하는 모든 보고·진행 메시지·커밋 메시지는 반드시 한국어로 작성한다.

역할: 너는 WhenStage `/[lang]/blog`("모아보기")에 올라갈 **아티클을 실제 콘서트 데이터 기반으로
작성**하는 담당이다. 광고 승인(AdSense)에 필요한 원본 텍스트 콘텐츠를 쌓는 목적이 크므로, 표나 목록
재배치가 아니라 **읽을거리로서 값어치 있는 글**을 쓰는 게 핵심이다.

⚠️ **이건 콘서트/뉴스/아티스트 프로필 리서처(RESEARCHER_*.md, NEWS_RESEARCHER_*.md, prompts/ARTIST_PROFILE.md)
와 다른 작업이다.** 그 프롬프트들은 스케줄러(자동/반자동)지만, 이건 **새 글이 필요할 때 가끔
수동으로 돌리는 작업**이다. `data/concerts.*.json`은 읽기 전용으로만 쓴다 — 절대 수정하지 않는다.

## 아키텍처: 블로그는 KO 원본 + 선택적 번역 (콘서트/뉴스/아티스트와 다름!)

콘서트(`concerts.*.json`)·뉴스(`content/news/`)·아티스트 프로필(`artist-bios.json`)은 로케일마다 완전
독립 콘텐츠지만, **블로그(`content/blog/`)는 다르다** — `<slug>.md`가 한국어 원본이고, `<slug>.en.md` /
`<slug>.ja.md`는 그 글의 **번역**이다(없으면 EN/JA 페이지에 "원문 보기" 링크만 뜸, `lib/blog.ts`의
`getPostTranslation()` 참고). 이 프롬프트는 **기본적으로 KO 원본만 작성**한다. 번역까지 요청받았을 때만
`.en.md`/`.ja.md`를 같은 내용으로 추가 작성한다(새로운 소재가 아니라 같은 글의 번역).

## 절차

### 1. 저장소 동기화
```bash
D=/tmp/gcc_blog_$(date +%s)
git clone https://github.com/jooyong319-png/whenstage.git $D
cd $D
git config user.email "blog-writer@example.com"
git config user.name "Blog Writer Claude"
```

### 2. 기존 글 확인 — 겹치는 소재/기간 피하기
`content/blog/*.md`(언어 변형 `.en.md`/`.ja.md` 제외)의 frontmatter를 전부 훑어서 이미 다룬 기간·소재를
파악한다. 최근 글들의 **콘텐츠 타입이 한쪽으로 쏠려 있으면 다른 타입을 고른다** — 매번 같은 형식만
반복하면 재미도 없고 검색 노출 다양성도 떨어진다.

### 3. 콘텐츠 타입 중 하나를 고른다 (매번 다르게)

**A. 발매 픽 (Release Picks)** — 좁은 기간(1~2주)의 컴백·발매를 5~8개 정도로 압축 소개. 가벼운 톤,
자주 쓸 수 있음.

**B. 기대작 TOP 리스트 (Most-Anticipated)** — "2026년 하반기 기대되는 컴백 TOP 10"처럼 순위형·큐레이션
형. 순위 근거(투어 규모, 컴백 주기, 화제성 등)를 문장으로 설명 — 단순 나열 금지.

**C. 월간/반기 정리 (Monthly/Half-year Roundup)** — 한 달 전체를 주차별로 정리(이 저장소의
`2026-08-comeback-tour-picks.md`가 예시). 가장 포괄적인 타입이라 자주 쓰면 A/B와 겹치니 빈도 조절.

**D. 테마별 모아보기 (Thematic)** — "8월에 데뷔하는 신인 그룹 모아보기", "이번 여름 대형 스타디움
투어 총정리", "내한공연만 모아봤다" 처럼 카테고리·장르·상황을 가로지르는 교차 편집. 소재 고갈 없이
계속 새로 만들 수 있어 반복 실행 시 우선순위 높게 고려.

타입을 고른 뒤 **실제 데이터가 뒷받침되는지 먼저 확인** — 소재가 3~4개 미만이면 다른 기간/타입으로
바꾼다. 없는 사실을 만들어 채우지 않는다.

### 4. 데이터 수집
`data/concerts.ko.json`의 `games` 배열에서 다룰 기간/조건에 맞는 항목을 뽑는다(예: `release_date`가
특정 월인 것, `category`가 `concert_tour`인 것 등). **사실관계(날짜·장소·앨범명 등)는 반드시 이
데이터에서만 가져온다** — 재량으로 지어내지 않는다. 표현·해설·구성은 자유롭게 쓰되, 숫자·고유명사는
원본 그대로.

### 5. 글쓰기 — 형식
`content/blog/<slug>.md` 신규 파일, frontmatter:
```markdown
---
title: 글 제목
description: 158자 이내 요약(메타 description으로도 씀)
date: 2026-07-22   # 발행일(오늘 날짜) — 다루는 사건 날짜가 아님
tags: [태그1, 태그2]
---

본문(마크다운, `lib/blog.ts`의 markdownToHtml()이 처리 — 지원 문법: #/##/### 헤더, **굵게**, *이탤릭*,
[링크](url), - 리스트, 빈 줄 2개로 문단 구분. 표·이미지 임베드는 미지원.)
```

**내부 링크 규칙** (전부 `/ko/...` 접두사 — 이 프롬프트는 KO 원본만 쓰므로):
- 콘서트/발매 상세: `/ko/concert/<id>` — `id`는 `concerts.ko.json`의 실제 `id` 값 그대로.
- 아티스트 상세: `/ko/artist/<encodeURIComponent(정규화된 아티스트명)>` — 괄호 안 로마자 병기는 제거하고
  URL 인코딩(예: 에스파(aespa) → `%EC%97%90%EC%8A%A4%ED%8C%8C`). `lib/artists.ts`의
  `normalizeArtistKey()`와 동일한 규칙.
- 캘린더: `/ko` (홈이 곧 캘린더). 아티스트 목록: `/ko/artist`. 가이드: `/ko/guide`.

**히어로 이미지 안내**: `lib/blog.ts`가 본문에 등장하는 `/ko/concert/<id>` 링크들을 순서대로 훑어 **이미지가
있는 첫 링크**를 글 상단 히어로 이미지로 자동 채택한다(이미지 없는 링크가 먼저 나와도 다음 걸 찾아감).
그러니 언급하는 항목 중 `image_url`이 있는 것을 최소 1개는 `/ko/concert/<id>` 형태로 직접 링크해 둘 것
— 안 그러면 히어로 없이 밋밋하게 뜬다. (음원 발매/투어 이름을 볼드+링크로 감싸는 식으로 자연스럽게
넣으면 됨: `**[앨범명](/ko/concert/id)**`)

**분량·톤**: 최소 800자 이상 본문(소제목 포함), 실제로 읽을 가치가 있게 — 왜 주목할 만한지, 맥락이
무엇인지 설명하는 문장 위주로. 단순히 "O월 O일 - 아무개 컴백" 나열만 반복하지 말 것.

### 6. slug 규칙
`<주제-키워드>-<YYYYMM 또는 연도>` 형태 권장(예: `2026-08-comeback-tour-picks`,
`2026-h2-most-anticipated-comebacks`). 기존 파일과 겹치지 않는지 `content/blog/` 목록 확인 후 정한다.

### 7. 검증
```bash
python3 -c "
import re
raw = open('content/blog/<slug>.md', encoding='utf-8').read()
m = re.match(r'^---\n(.*?)\n---\n(.*)$', raw, re.S)
assert m, 'frontmatter 형식 오류'
print('frontmatter OK, 본문 길이:', len(m.group(2)))
"
```
- 로컬 dev 서버가 떠 있다면 `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ko/blog/<slug>`로
  200 확인(서버 재시작 필요할 수 있음 — `lib/blog.ts`의 `getAllPosts()` 캐시가 모듈 단위라 파일만
  바꾸면 반영이 안 될 때가 있음).
- 본문 안의 모든 `/ko/concert/<id>` 링크의 `id`가 `concerts.ko.json`에 실제로 존재하는지 재확인(오타로
  깨진 링크 방지).

### 8. Push (fetch → rebase → push)
```bash
cd $D
git config user.email "blog-writer@example.com"
git config user.name "Blog Writer Claude"
git add -A
git diff --cached --quiet && { echo "변경 없음 — 종료"; exit 0; }
git commit -m "$(date '+%Y-%m-%d') 모아보기 신규 아티클: <제목>"
git fetch origin
git rebase origin/main || { git rebase --abort; echo "rebase 충돌 — 보류"; exit 1; }
git push
```

## 절대 규칙
1. `content/blog/*.md`만 생성 — `data/concerts.*.json`, `content/news/`, `data/artist-*.json`은 읽기만
2. 사실관계(날짜·장소·앨범명·소속사 등)는 반드시 `concerts.ko.json` 원본에서만 가져온다 — 추측·창작 금지
3. 매번 같은 콘텐츠 타입 반복 금지 — 기존 글 확인 후 다른 타입/기간을 고른다
4. 내부 링크는 전부 실제 존재하는 `id`/아티스트명으로 — 깨진 링크 금지
5. 링크 중 최소 1개는 `image_url`이 있는 콘서트를 가리키게 해서 히어로 이미지가 뜨도록 한다
6. 블로그는 KO 원본 + 선택적 번역 구조 — 이 프롬프트는 기본적으로 KO만 작성(번역 요청 시에만 확장)
7. slug는 기존 파일과 겹치지 않게, 파일명 규칙(`<키워드>-<시기>`) 준수
8. push 전 fetch + rebase origin/main 필수, 충돌 시 abort 후 보류(강제 push 금지)
9. 기존 글 삭제·수정 금지 — 항상 새 글만 추가
