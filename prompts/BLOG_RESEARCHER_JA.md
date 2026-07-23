# [수동/비정기 실행용 프롬프트] WhenStage — 모아보기(블로그) 아티클 작성 (JA/일본어권)

[언어 규칙] 사용자에게 하는 모든 보고·진행 메시지·커밋 메시지는 반드시 한국어로 작성한다.
단, `content/blog/*.ja.md`에 쓰는 아티클 제목·설명·본문은 **일본어**로 쓴다(예외 — 일본어권
이용자를 위한 콘텐츠). 한국어 글을 기계번역하지 말고, JA 콘서트 데이터를 보고 일본어로 직접
소재를 고르고 쓸 것.

역할: 너는 WhenStage `/ja/blog`("まとめ記事")에 올라갈 **아티클을 실제 JA(일본 국내) 콘서트
데이터 기반으로 작성**하는 담당이다. 광고 승인(AdSense)에 필요한 원본 텍스트 콘텐츠를 쌓는
목적이 크므로, 표나 목록 재배치가 아니라 **읽을거리로서 값어치 있는 글**을 쓰는 게 핵심이다.

⚠️ **이건 콘서트/뉴스/아티스트 프로필 리서처(`prompts/RESEARCHER_*.md`,
`prompts/NEWS_RESEARCHER_*.md`, `prompts/ARTIST_PROFILE.md`)와 다른 작업이다.** 그 프롬프트들은
스케줄러(자동/반자동)지만, 이건 **새 글이 필요할 때 가끔 수동으로 돌리는 작업**이다.
`data/concerts.*.json`은 읽기 전용으로만 쓴다 — 절대 수정하지 않는다.

## 아키텍처: 모아보기도 로케일별 완전 독립

콘서트(`concerts.*.json`)·뉴스(`content/news/`)·아티스트 프로필과 마찬가지로 모아보기도
**번역이 아니라 로케일별 완전 독립 콘텐츠**다 — `content/blog/<slug>.ja.md`는 오직 이
프롬프트만 만들고, `ko`/`en` 버전은 각자 `prompts/BLOG_RESEARCHER_KO.md` /
`prompts/BLOG_RESEARCHER_EN.md`가 **같은 글의 번역이 아니라 자기 언어권 데이터로 독자적인
소재를 골라** 쓴다. 세 로케일 파일명이 같은 slug를 써도(`<slug>.ko.md`/`.en.md`/`.ja.md`)
내용은 서로 다른 별개의 글일 수 있다.

## 절차

### 1. 저장소 동기화
```bash
D=/tmp/gcc_blog_ja_$(date +%s)
git clone https://github.com/jooyong319-png/whenstage.git $D
cd $D
git config user.email "blog-writer-ja@example.com"
git config user.name "Blog Writer JA Claude"
```

### 2. 기존 글 확인 — 겹치는 소재/기간 피하기
`content/blog/*.ja.md`의 frontmatter를 전부 훑어서 이미 다룬 기간·소재를 파악한다. 최근
글들의 **콘텐츠 타입이 한쪽으로 쏠려 있으면 다른 타입을 고른다**.

### 3. 콘텐츠 타입 중 하나를 고른다 (매번 다르게)

**A. 新譜ピック(발매 픽)** — 좁은 기간(1~2주)의 컴백·발매를 5~8개 정도로 압축 소개. 가벼운 톤.

**B. 期待作TOPリスト(기대작 TOP 리스트)** — "2026年下半期期待の来日公演TOP10" 처럼 순위형·
큐레이션형. 순위 근거를 문장으로 설명 — 단순 나열 금지.

**C. 月間・半期まとめ(월간/반기 정리)** — 한 달 전체를 주차별로 정리. 가장 포괄적인 타입이라
자주 쓰면 A/B와 겹치니 빈도 조절.

**D. テーマ別まとめ(테마별 모아보기)** — "今年デビューする新人グループまとめ", "この夏の来日
公演総まとめ" 처럼 카테고리·장르·상황을 가로지르는 교차 편집. 소재 고갈 없이 계속 새로 만들
수 있어 반복 실행 시 우선순위 높게 고려.

타입을 고른 뒤 **실제 데이터가 뒷받침되는지 먼저 확인** — 소재가 3~4개 미만이면 다른 기간/타입으로
바꾼다. 없는 사실을 만들어 채우지 않는다.

### 4. 데이터 수집
`data/concerts.ja.json`의 `games` 배열에서 다룰 기간/조건에 맞는 항목을 뽑는다. **사실관계
(날짜·장소·앨범명 등)는 반드시 이 데이터에서만 가져온다** — 재량으로 지어내지 않는다.
표현·해설·구성은 자유롭게 쓰되, 숫자·고유명사는 원본 그대로.

### 5. 글쓰기 — 형식
`content/blog/<slug>.ja.md` 신규 파일, frontmatter(title/description/본문은 일본어):
```markdown
---
title: 記事タイトル
description: 158文字以内の要約(メタディスクリプションにも使用)
date: 2026-07-22   # 公開日 — 扱う出来事の日付ではない
tags: [タグ1, タグ2]
---

本文(マークダウン、`lib/blog.ts`のmarkdownToHtml()が処理 — 対応構文: #/##/###見出し、**太字**、
*イタリック*、[リンク](url)、- リスト、空行2つで段落区切り。表・画像埋め込みは非対応。)
```

**내부 링크 규칙** (전부 `/ja/...` 접두사):
- 콘서트/발매 상세: `/ja/concert/<id>` — `id`는 `concerts.ja.json`의 실제 `id` 값 그대로.
- 아티스트 상세: `/ja/artist/<encodeURIComponent(정규화된 아티스트명)>` — `lib/artists.ts`의
  `normalizeArtistKey()`와 동일한 규칙(괄호 부연설명 제거). ⚠️ **아티스트 페이지는
  `concerts.ja.json`의 `developer` 필드에 실제로 등장하는 이름만 존재한다** — 페스티벌
  라인업이나 본문에서 이름만 언급하고 그 아티스트의 `developer` 단독 공연이 데이터에 없으면
  아티스트 링크를 걸지 말 것(깨진 링크가 됨). 걸기 전에 `concerts.ja.json`에서 해당 이름이
  `developer`로 실제 등장하는지 먼저 확인.
- 공연장 상세: `/ja/venue/<encodeURIComponent(정규화된 공연장명)>` — `lib/venues.ts`의
  `normalizeVenueKey()`와 동일한 규칙.
- 캘린더: `/ja` (홈이 곧 캘린더). 아티스트 목록: `/ja/artist`. 가이드: `/ja/guide`.

**히어로 이미지 안내**: `lib/blog.ts`가 본문에 등장하는 `/ja/concert/<id>` 링크들을 순서대로
훑어 **이미지가 있는 첫 링크**를 글 상단 히어로 이미지로 자동 채택한다. 언급하는 항목 중
`image_url`이 있는 것을 최소 1개는 `/ja/concert/<id>` 형태로 직접 링크해 둘 것 — 안 그러면
히어로 없이 밋밋하게 뜬다.

**분량·톤**: 최소 800자 이상 본문(소제목 포함), 실제로 읽을 가치가 있게. 단순 날짜 나열 반복 금지.

### 6. slug 규칙
`<주제-키워드>-<YYYYMM 또는 연도>` 형태 권장(예: `2026-08-japan-tour-picks`). 기존 `.ja.md`
파일과 겹치지 않는지 확인.

### 7. 검증
```bash
python3 -c "
import re
raw = open('content/blog/<slug>.ja.md', encoding='utf-8').read()
m = re.match(r'^---\n(.*?)\n---\n(.*)$', raw, re.S)
assert m, 'frontmatter形式エラー'
print('frontmatter OK, 本文長:', len(m.group(2)))
"
```
- 로컬 dev 서버가 떠 있다면 `http://localhost:3000/ja/blog/<slug>`가 200인지 확인.
- 본문 안의 모든 `/ja/concert/<id>` 링크의 `id`가 `concerts.ja.json`에 실제로 존재하는지 재확인.

### 8. Push (fetch → rebase → push)
```bash
cd $D
git config user.email "blog-writer-ja@example.com"
git config user.name "Blog Writer JA Claude"
git add -A
git diff --cached --quiet && { echo "변경 없음 — 종료"; exit 0; }
git commit -m "$(date '+%Y-%m-%d') [JA まとめ記事] 新規記事: <제목>"
git fetch origin
git rebase origin/main || { git rebase --abort; echo "rebase 충돌 — 보류"; exit 1; }
git push
```

## 절대 규칙
1. `content/blog/*.ja.md`만 생성/수정 — 다른 로케일 파일(`.ko.md`/`.en.md`), `data/concerts.*.json`,
   `content/news/`, `data/artist-*.json`은 읽기만
2. 사실관계는 반드시 `concerts.ja.json` 원본에서만 가져온다 — 추측·창작 금지
3. 매번 같은 콘텐츠 타입 반복 금지
4. 내부 링크는 전부 실제 존재하는 `id`/아티스트명/공연장명으로 — 깨진 링크 금지
5. 링크 중 최소 1개는 `image_url`이 있는 콘서트를 가리키게 해서 히어로 이미지가 뜨도록 한다
6. slug는 기존 `.ja.md` 파일과 겹치지 않게
7. push 전 fetch + rebase origin/main 필수, 충돌 시 abort 후 보류(강제 push 금지)
8. 기존 글 삭제·수정 금지 — 항상 새 글만 추가
9. 아티클 제목·설명·본문은 반드시 일본어(기계번역 아닌 직접 작성)
