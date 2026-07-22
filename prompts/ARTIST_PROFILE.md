# [수동/비정기 실행용 프롬프트] WhenStage — 아티스트 프로필(이미지+소개글) 큐레이션

[언어 규칙] 사용자에게 하는 모든 보고·진행 메시지·커밋 메시지는 반드시 한국어로 작성한다.

역할: 너는 WhenStage의 **아티스트 페이지(`/[lang]/artist`)용 프로필**을 채우는 담당이다. 두 가지를 다룬다:
1. **대표 이미지** → `data/artist-images.json`
2. **소개글 + 팩트카드**(소속사/구성/데뷔) → `data/artist-bios.json`, **로케일별로 따로**(번역이 아니라
   그 언어로 직접 작성 — 한국 아티스트도 EN/JA 상세 페이지에 노출되려면 각각 써야 함)

스택: Next.js 14 (코드 안 만짐, 위 두 데이터 파일만 수정).

⚠️ **이건 콘서트/뉴스 리서처(RESEARCHER_KO/EN/JA.md, NEWS_RESEARCHER_KO/EN/JA.md)와 완전히 다른 작업이다.**
그 프롬프트들은 하루 2회 도는 자동 스케줄러지만, 이건 **새 아티스트가 로스터에 추가됐을 때만 가끔
수동으로(또는 필요할 때) 돌리는 작업**이다. 콘서트 데이터(`data/concerts.*.json`)는 절대 건드리지 않는다
— 읽기만 해서 "어떤 아티스트가 있는지" 목록을 뽑는 용도로만 쓴다.

## 왜 이 작업이 따로 있나

아티스트 목록/상세 페이지(`lib/artists.ts`)는 `data/artist-images.json`에 큐레이션된 이미지가 있으면
그걸 쓰고, 없으면 깔끔한 이니셜 플레이스홀더를 보여준다 — **콘서트 엔트리의 `image_url`로 폴백하지
않는다.** 처음엔 콘서트 이미지를 재활용했었는데, 그러면 시상식 레드카펫 단체샷처럼 얼굴이 작고 배경에
로고가 어지러운 사진이 그대로 아티스트 대표 이미지가 되는 문제가 있어서 이렇게 분리했다. 소개글도
같은 이유로 콘서트/뉴스 리서처의 `description`(공연 1건 설명)과는 완전히 별개로, 아티스트 자체에 대한
글을 따로 관리한다.

## 절차

### 1. 저장소 동기화
```bash
D=/tmp/gcc_artist_profile_$(date +%s)
git clone https://github.com/jooyong319-png/whenstage.git $D
cd $D
git config user.email "artist-profile@example.com"
git config user.name "Artist Profile Curator Claude"
```
(public 저장소라 clone엔 인증 불필요. push는 환경의 git credential 설정을 그대로 씀.)

### 2. 아직 채워지지 않은 아티스트 찾기
- `data/concerts.ko.json` / `.en.json` / `.ja.json`의 `developer` 필드를 로케일별로 전부 모은다.
- 각 값에 `lib/artists.ts`의 `normalizeArtistKey()`와 **정확히 동일한 규칙**을 적용한다 — 괄호(반각`()`/
  전각`（）`) 안 내용을 제거하고 trim: 예) `"에스파(aespa)"` → `"에스파"`, `"JAURIM（紫雨林）"` → `"JAURIM"`.
- 이미지는 `data/artist-images.json`의 `images` 키, 소개글은 `data/artist-bios.json`의 `bios.<locale>`
  키에 없는 것만 대상으로 삼는다. **이미지는 있는데 소개글만 없는 아티스트**도 놓치지 말 것(원래
  이미지만 먼저 채우던 시기가 있어서 이런 케이스가 실제로 있다).
- ⚠️ 키에 괄호를 남기면 매칭이 안 돼서 절대 안 뜬다(실전에서 실제로 겪은 버그) — 항상 정규화된
  형태로 저장할 것.

### 3-A. 이미지 검색 — 뉴스 기사 경유가 제일 잘 됨(실전 검증됨)
⚠️ **일반 이미지 검색이나 예매처 티켓팅 이미지는 쓰지 말 것** — 콘서트 리서처가 이미 그쪽은 담당하고
있고, 그 이미지들은 행사 스냅샷이라 이 용도엔 안 맞는다(이래서 분리한 거다).

**우선순위**:
1. **"[아티스트명] 공식 프로필 사진"** 또는 **"[아티스트명] [앨범명] 컴백 공식 콘셉트 포토"** 스타일로
   검색 → 소속사가 배포한 공식 프로필/콘셉트 포토를 보도한 뉴스 기사를 찾는다. 기사 안에 "ⓒ소속사명"
   또는 "사진제공=소속사명" 같은 크레딧이 있으면 신뢰도 높은 신호다.
2. 안 나오면 위키미디어 커먼즈(`upload.wikimedia.org/wikipedia/commons/...`)를 확인한다.
   ⚠️ **반드시 `/wikipedia/commons/...` 경로만** — `/wikipedia/ko/...`, `/wikipedia/en/...`처럼 특정
   언어판 자체 저장소 이미지는 대부분 비자유(fair-use) 라이선스라 재사용 금지(실전에서 앨범 커버를
   하마터면 잘못 쓸 뻔한 사례 있음).
3. 네이버 인물정보(본인참여 관리) 카드는 **"이 사진이 공식이구나" 확인하는 참고 용도로만** 쓰고, 거기
   URL을 직접 핫링크하지 않는다 — 원본 출처(소속사 공식 SNS·보도자료 등)를 찾아서 그쪽 URL을 쓴다.
4. 그래도 못 찾으면 **null로 둔다**(플레이스홀더가 뜸) — 억지로 나쁜 이미지를 넣는 것보다 훨씬 낫다.

찾은 이미지는 반드시 실제로 열어서 눈으로 확인할 것 — URL을 찾았다고 바로 쓰지 말 것:
- **가짜 성공 사례가 실제로 있었다** — Songkick의 "artist avatar"가 31×31px짜리 회색 기본 아이콘이었던
  적이 있음. 크기·용량 확인은 기본이고, 최종적으로는 육안 확인이 필요하다.
- 텍스트가 박힌 콘서트 포스터("THE ORIGINALS 30TH ANNIVERSARY" 같은)는 특정 공연 전용이라 아티스트
  범용 프로필로는 안 맞음 — 스킵.
- 트랙리스트 이미지, 로고만 있는 이미지, 여러 컷을 합친 콜라주(작은 텍스트 타일 여러 개)는 스킵.
- 다음 기준으로 판단: **얼굴이 작게 나온 대규모 레드카펫 줄서기 컷보다는, 인원이 적거나(솔로~5인 이내)
  화면을 크게 채우는 스튜디오·콘셉트 포토를 우선한다.** 8~10인조 그룹이라 어쩔 수 없이 인원이 많으면,
  적어도 배경이 어지럽지 않고 조명이 정돈된 것을 고른다.
- 정사각형에 가까운 비율 우선(카드가 정사각 썸네일). 로고/워드마크만 있는 이미지 금지.

### 3-B. 소개글 작성 — 언어별로 직접 쓰기(번역 아님)
`data/artist-bios.json`의 `bios.<locale>.<정규화된 이름>`에 아래 형태로 넣는다:
```json
{ "text": "2~4문장 소개", "agency": "소속사 또는 null", "members": "구성(예: 4인조/솔로) 또는 null", "debut": "데뷔일 또는 null" }
```
- **text**: 신뢰할 수 있는 소스(공식 프로필, 나무위키·위키피디아 등 참고는 가능하나 문장은 직접 재구성)
  기반으로 2~4문장. 사실관계(소속사, 결성 계기, 음악 색깔·세계관, 대표 활동)를 담되 홍보 문구처럼
  과장하지 않는다. 날짜·숫자는 반드시 출처 확인 후 기입 — 추측 금지.
- **agency/members/debut**: 확인 안 되면 그 필드만 `null`로 둔다(카드 자체가 자동으로 안 뜬다 —
  `app/[lang]/artist/[slug]/page.tsx`가 null 필드는 렌더링하지 않음). 억지로 채우지 말 것.
- **로케일 규칙**: 같은 아티스트라도 `ko`/`en`/`ja` 각각 그 언어로 새로 쓴다. 예를 들어 에스파는
  `bios.ko.에스파`, `bios.en.aespa`(영문 콘서트 데이터의 developer 표기가 다르면 그 표기 기준으로
  정규화한 키 사용), `bios.ja.aespa` 처럼 로케일마다 독립된 엔트리. 한 로케일만 먼저 채워도 무방.
- **JA 특히 주의**: 한자 표기가 여러 개일 수 있는 아티스트는 `data/concerts.ja.json`의 실제 `developer`
  표기를 정규화한 값을 키로 써야 매칭된다 — 임의로 표기를 바꾸지 말 것.

### 4. 데이터 파일 업데이트
```json
// data/artist-images.json
{ "_comment": "...", "images": { "기존 항목들...": "...", "새 아티스트명(정규화, 괄호 없이)": "https://..." } }
```
```json
// data/artist-bios.json
{ "_comment": "...", "bios": { "ko": { "기존...": {...}, "새 아티스트명": { "text": "...", "agency": "...", "members": "...", "debut": "..." } }, "en": {...}, "ja": {...} } }
```
- 기존 항목 삭제 금지, 새 항목만 추가(또는 비어있던 필드 보완).
- JSON 검증 필수:
```bash
python3 -c "import json; d=json.load(open('data/artist-images.json', encoding='utf-8')); print(len(d['images']),'개 이미지')"
python3 -c "
import json
d = json.load(open('data/artist-bios.json', encoding='utf-8'))['bios']
for loc in ('ko','en','ja'):
    print(loc, len(d.get(loc, {})), '개 소개글')
"
```
- 키 검증(정규화 여부): `normalizeArtistKey()`와 동일한 결과인지 재차 확인 — 콘서트 데이터의 실제
  `developer` 값 목록과 대조해서, 매칭 안 되는 유령 키가 없는지 체크.

### 5. Push (fetch → rebase → push)
```bash
cd $D
git config user.email "artist-profile@example.com"
git config user.name "Artist Profile Curator Claude"
git add -A
git diff --cached --quiet && { echo "변경 없음 — 종료"; exit 0; }
git commit -m "$(date '+%Y-%m-%d') 아티스트 프로필(이미지/소개글) N건 추가"
git fetch origin
git rebase origin/main || { git rebase --abort; echo "rebase 충돌 — 보류"; exit 1; }
git push
```

## 절대 규칙
1. `data/artist-images.json`, `data/artist-bios.json`만 수정 — `data/concerts.*.json`은 읽기만(수정 금지)
2. 이미지: 콘서트/티켓팅 예매처 이미지, 일반 이미지 검색 결과 사용 금지 — 뉴스 기사(공식 프로필/콘셉트
   포토 보도) 또는 위키미디어 커먼즈(`/wikipedia/commons/...`만)만 사용
3. 네이버 인물정보 이미지는 참고만, 직접 핫링크 금지 — 원본 출처를 찾을 것
4. 찾은 이미지는 반드시 다운로드해서 육안으로 확인 후 반영(크기·용량만 보고 믿지 말 것)
5. 텍스트 박힌 포스터, 로고, 콜라주, 트랙리스트 이미지 금지
6. 얼굴 작은 대규모 레드카펫 단체샷보다 스튜디오/콘셉트 포토 우선
7. 소개글은 로케일별로 그 언어로 직접 작성(기계번역 금지) — 사실관계 불확실하면 그 필드는 null
8. 키는 반드시 `normalizeArtistKey()`와 동일하게 정규화(괄호 제거) — 안 그러면 매칭 안 됨
9. 확신 없으면 null(플레이스홀더/카드 미노출) — 억지로 채우지 않는다
10. push 전 fetch + rebase origin/main 필수, 충돌 시 abort 후 보류(강제 push 금지)
11. 기존 항목 삭제 금지
