# WhenStage 데이터 스키마 & 리서처 공통 규칙

이 문서는 `data/concerts.ko.json` / `concerts.en.json` / `concerts.ja.json`을 다루는
**3개의 독립된 리서처 Claude**(한국어권/영어권/일본어권)가 공통으로 참조하는 스키마·정책 문서다.
실제 리서처별 작업 지시는 `prompts/RESEARCHER_KO.md` / `prompts/RESEARCHER_EN.md` / `prompts/RESEARCHER_JA.md`에 있다.

🌐 사이트: https://whenstage.com/
📦 저장소: https://github.com/jooyong319-png/whenstage
⚙️ 스택: Next.js 14 (App Router) · TypeScript 5 · Vercel · 로케일 `/ko` `/en` `/ja` 완전 대칭 라우팅

---

## 1. ⚠️ 가장 중요한 전제 — ko/en/ja는 "번역"이 아니라 "독립된 데이터"다

이전 게임 출시 캘린더 프로젝트는 한국어 원본 + en/ja 선택적 번역 필드를 쓰는 **단일 데이터셋 + 번역** 구조였다.
이 프로젝트는 그 구조를 의도적으로 버렸다.

- `data/concerts.ko.json` = **한국 국내** 공연·발매·페스티벌·팬미팅
- `data/concerts.en.json` = **영어권(미국/영국 등 글로벌) 시장** 투어·공연
- `data/concerts.ja.json` = **일본 국내** 공연(来日公演 포함)

세 파일은 서로 다른 실제 이벤트를 담는다. 같은 아티스트라도 한국 공연과 미국 공연은 **각자의 파일에
각자 별도 id로** 등록된다. "이 게임의 일본어 번역을 채워라" 같은 작업은 존재하지 않는다 —
각 리서처는 **자기 언어권의 실제 공연 정보**를 그 언어로 직접 조사·서술한다.

**절대 다른 리서처의 파일을 건드리지 않는다.** KO 리서처는 `concerts.ko.json`만,
EN 리서처는 `concerts.en.json`만, JA 리서처는 `concerts.ja.json`만 수정한다.

---

## 2. 파일 구조

```
app/[lang]/                   # ko/en/ja 완전 대칭 라우트 (app/[lang]/concert/[id] 등)
lib/
├── types.ts                  # Game/Category 타입 + CATEGORY_META (아래 §4와 동일)
├── games.ts                  # ⚠️ 서버 전용, data/concerts.{locale}.json 읽음 (읽기는 자유, 수정 금지)
data/                         # 데이터 (리서처만 수정)
├── concerts.ko.json
├── concerts.en.json
└── concerts.ja.json
```

---

## 3. ⚠️ 절대 규칙

1. **리서처가 수정 가능한 파일**: 자기 언어권의 `data/concerts.<locale>.json`, `CHAT.md`, `PROJECT_STATUS.md`
2. **읽기만 가능**: 다른 언어권의 `data/concerts.*.json`, 그 외 모든 파일(코드 읽기는 자유 — 동작이 궁금하면 `lib/games.ts`/`components/*.tsx`를 직접 grep해서 확인할 것, 추측 금지)
3. **코드(.tsx/.ts/.css) 절대 수정 금지**
4. **스키마 임의 변경 금지** — 아래 §4에 없는 새 key 추가/삭제/개명 금지. 단 이미 정의된 선택 필드(`presale*`/`general_sale*`/`festival_days`/`related_locale_ids` 등)에 값을 채우는 것은 스키마 변경이 아니다 — 적극 채울 것
5. **삭제 금지 — 예외 없음**: `concerts.*.json`의 기존 항목, `CHAT.md` 로그 전부 무기한 보존. "미래/최근 6개월" 조건은 신규 후보를 거르는 기준일 뿐 기존 항목 삭제 근거가 아니다
6. **취소된 공연**: 삭제하지 말고 `description` 맨 앞에 `[취소됨]`/`[Cancelled]`/`[中止]` 표기 후 보존. 일정이 변경된 경우는 `release_date`를 새 날짜로 갱신(approx 재설정 포함)

---

## 4. `data/concerts.<locale>.json` 스키마

```ts
{
  schema_version: 2,
  last_updated: "YYYY-MM-DD",
  last_researched_by: string,       // 예: "ko-researcher", "en-researcher", "ja-researcher"
  categories: {
    concert_tour: string,           // 그 언어로 된 카테고리명 (예: "콘서트·내한 공연" / "Concerts & Tours" / "コンサート・来日公演")
    music_release: string,
    festival: string,
    fanmeeting: string,
  },
  games: Array<{                    // 필드명은 games지만 실제로는 "공연/발매 항목" 배열
    id: string,                     // slug-YYYYMMDD 형식, 로케일 prefix 권장 (예: "ko-artistname-tour-20260905")
    name: string,                   // 공연/앨범명 (그 언어로 자연스럽게 — 기계번역 아님)
    release_date: "YYYY-MM-DD",     // 공연일(다일 공연/페스티벌은 첫날) 또는 발매일
    release_time: string | null,    // "HH:mm" 현지 공연 시작 시각 — 확인되면 채울 것(§4-1), 모르면 null
    release_date_approx: boolean,   // 정확한 날짜 미확정이면 true
    timezone: string,               // IANA 타임존, 예: "Asia/Seoul" — 이 항목의 모든 시각 필드 기준(§4-1, 필수)
    category: "concert_tour" | "music_release" | "festival" | "fanmeeting",
    platforms: string[],            // 공연장·지역 — 부속 시설은 괄호로(§4-5). 예: ["잠실종합운동장(주경기장)"], ["Tokyo Dome"]
    developer: string | null,       // 아티스트 / 기획사명 — 검색결과 구조화 데이터의 performer가 된다(§4-6)
    publisher: string | null,       // 주최사·프로모터 (예: 라이브네이션코리아, CJ ENM, Live Nation) — organizer가 된다(§4-6)
    description: string | null,     // 그 언어로 된 2~4문장 소개 (§자세한 기준은 각 리서처 프롬프트)
    genres: string[],               // 장르/태그 (예: ["K-POP","내한"], ["Pop","Tour"], ["J-POP","来日"])
    image_url: string | null,       // 확신 없으면 null
    source_url: string | null,      // 근거 뉴스/공지 기사 URL

    presale?: boolean,                          // 선예매(팬클럽 선예매 등) 진행/예정이면 true (§4-2)
    presale_datetime?: string | null,           // ISO 8601(오프셋 포함) 선예매 시작
    presale_end_datetime?: string | null,       // 선예매 마감(대개 없음)
    presale_url?: string | null,                // 공식 선예매 페이지 URL

    general_sale?: boolean,                     // 일반예매 진행/예정이면 true (§4-2)
    general_sale_datetime?: string | null,      // ISO 8601(오프셋 포함) 일반예매 시작
    general_sale_end_datetime?: string | null,  // 일반예매 마감(대개 없음)
    general_sale_url?: string | null,           // 공식 일반예매 페이지 URL

    festival_days?: Array<{ date: string; lineup: string[] }> | null,  // festival 전용(§4-3)
    related_locale_ids?: { ko?: string; en?: string; ja?: string } | null, // 크로스 등재 연결(§4-4, 선택)
  }>
}
```

### 카테고리 의미
- `concert_tour`: 단독 콘서트·투어·내한 공연
- `music_release`: 앨범/싱글 발매·컴백 (release_date = 발매일)
- `festival`: 멀티 아티스트 페스티벌 (release_date = 개최 첫날)
- `fanmeeting`: 팬미팅·팬사인회 등 소규모 팬 교류 행사

### §4-1 `timezone` / `release_time` — 시각·타임존 (필수)
⚠️ **모든 항목에 `timezone`을 반드시 채운다.** 콘서트 사이트에서 티켓팅 오픈 시각의 타임존
표기가 생명이다 — 해외 팬이 자기 시간대로 착각해 선예매를 놓치면 신뢰가 바로 무너진다.
- `timezone`: 그 **공연장이 위치한 지역**의 IANA 타임존 이름(예: `"Asia/Seoul"`, `"America/Los_Angeles"`,
  `"Asia/Tokyo"`, `"America/New_York"`). 절대 뷰어(사이트 방문자)의 타임존이 아니라 **공연 자체의 타임존**이다.
- `release_time`: 공연 시작 시각(`"HH:mm"`, 24시간제, `timezone` 기준 현지 시각). 확인되면 채우고, 모르면 `null`.
- `presale_datetime`/`general_sale_datetime` 등은 **ISO 8601, UTC 오프셋 포함** 문자열로 쓴다.
  예: `"2026-08-05T11:00:00+09:00"`(한국, 오전 11시 KST), `"2026-08-10T10:00:00-07:00"`(LA, 오전 10시 PDT).
  오프셋을 빠뜨리면 시각이 틀리게 표시될 수 있으니 반드시 포함한다.

### §4-2 티켓팅(`presale*` / `general_sale*`) — 선예매·일반예매는 별개 필드
⚠️ 선예매(팬클럽 선예매 등)와 일반예매는 **서로 다른 시점에 열리는 별개 이벤트**라 필드를 분리했다.
하나만 있고 다른 하나는 없는 경우가 많고, 둘 다 있는 경우도 흔하니 확인되는 대로 각각 채운다.
- `presale` / `general_sale`: 그 구간이 임박/진행 중이면 `true`. 공연이 지나면 자연히 캘린더 "예정"
  노출에서 빠지므로 별도 false 처리는 선택.
- `*_datetime`: 시작 일시(§4-1 형식). 확정되면 반드시 채울 것 — 캘린더에 별도 마커로 표시됨.
- `*_end_datetime`: 마감 일시. 콘서트 티켓팅은 매진 시까지 판매하는 경우가 많아 대개 비워둔다.
  한정 판매 등으로 마감이 명시된 경우만 채운다.
- `*_url`: **실제 예매 페이지** URL(인터파크/멜론티켓/Ticketmaster/ぴあ 등). 뉴스 기사는 `source_url`이지 여기가 아니다.
- 둘 다 없는(미정) 항목도 정상이다 — 리서처가 아직 확인 못 했으면 그냥 필드를 생략(또는 null)해두면 된다.

### §4-3 `festival_days` — 페스티벌 데이별 라인업 (festival 카테고리 전용)
```ts
festival_days: [
  { date: "2026-09-20", lineup: ["헤드라이너 A", "헤드라이너 B"] },
  { date: "2026-09-21", lineup: ["헤드라이너 C", "헤드라이너 D"] },
]
```
- `festival` 카테고리에서만 사용. 그 외 카테고리는 생략(또는 null).
- 공식 라인업 발표 전에는 채우지 말 것 — 확정된 헤드라이너/데이별 라인업만.
- `release_date`는 여전히 개최 첫날을 가리킨다(달력 배치 기준). `festival_days`는 상세 페이지에 추가로 표시되는 보강 정보다.

### §4-4 `related_locale_ids` — 같은 물리적 공연의 크로스 로케일 연결 (선택)
기본 원칙은 **리전 배타적**이다: 한국 개최 공연은 `concerts.ko.json`에만, 미영권 개최는
`concerts.en.json`에만, 일본 개최는 `concerts.ja.json`에만 등록한다. 대부분의 공연은 이 원칙만
따르면 되고 `related_locale_ids`가 필요 없다.

단, **국제적으로 주목받는 공연**(예: 해외 팬이 많이 원정 오는 K-pop 아티스트의 서울 콘서트)은
예외적으로 다른 로케일 파일에도 **같은 공연을 별도 id로 크로스 등재**할 수 있다. 이때 두 항목이
서로를 가리키도록 양쪽 모두에 `related_locale_ids`를 채워야 hreflang이 정상 동작한다.
```json
// concerts.ko.json의 항목
{ "id": "artist-a-seoul-20260830", "related_locale_ids": { "en": "artist-a-seoul-20260830-en" } }
// concerts.en.json의 항목 (같은 공연, 국제 팬을 위한 영어 소개)
{ "id": "artist-a-seoul-20260830-en", "related_locale_ids": { "ko": "artist-a-seoul-20260830" }, "timezone": "Asia/Seoul" }
```
- **`related_locale_ids`가 붙은 쌍만 sitemap에 hreflang alternate가 생긴다.** 한쪽만 채우면 hreflang이
  깨지니(단방향) 반드시 양쪽에 서로의 id를 넣을 것.
- 크로스 등재된 항목의 `timezone`은 뷰어 언어와 무관하게 **실제 공연장 기준**이다(위 예시: en 항목도
  `Asia/Seoul`).
- 크로스 등재본은 티켓팅 필드(`presale*`/`general_sale*`)를 원본과 중복 관리하기보다, `description`에서
  안내하고 `source_url`로 원본 공지를 링크하는 편이 유지보수에 유리하다(두 파일을 계속 동기화할 필요가 없어짐).
- 대부분의 공연은 이 기능을 쓰지 않는 게 정상이다 — 국제적으로 주목받을 만한 공연에만 선택적으로 사용할 것.

### §4-5 `platforms` — 공연장 표기 통일 (부속 시설은 반드시 괄호로)
`platforms[0]`은 단순한 텍스트가 아니라 **공연장 페이지(`/[lang]/venue/[slug]`)를 만드는 키**다.
`lib/venues.ts`의 `normalizeVenueKey()`가 **괄호 안 내용만** 떼고 같은 공연장으로 묶는다. 그래서
부속 경기장·홀 이름을 괄호 없이 붙여 쓰면 **같은 장소가 서로 다른 공연장 페이지로 갈라진다.**

```
❌ "올림픽공원 88잔디마당" + "올림픽공원 우리금융아트홀" + "올림픽공원"
   → 공연장 페이지 3개, 각각 공연 1건씩 (전부 저품질 판정 → noindex)
✅ "올림픽공원(88잔디마당)" + "올림픽공원(우리금융아트홀)" + "올림픽공원"
   → 공연장 페이지 1개에 공연 3건 (검색에 노출되는 제대로 된 모아보기 페이지)
```

- 상위 공간명을 먼저 쓰고, 그 안의 세부 시설은 **괄호 안에** 넣는다.
- 공연 1건짜리 공연장 페이지는 그 공연 상세와 내용이 겹쳐 자동으로 `noindex` 처리된다
  (`isVenueIndexable`). 표기를 통일하는 것만으로 색인되는 페이지가 늘어난다.
- 기존 데이터에 이미 같은 장소가 갈라져 있으면 표기를 맞춰 정리할 것(이건 '삭제'가 아니라 '표기 수정'이라 데이터 보존 원칙에 어긋나지 않는다).
- 같은 원칙이 `developer`(아티스트명)에도 적용된다 — `normalizeArtistKey()`가 동일하게 동작한다.
  예: `"에스파(aespa)"`와 `"에스파"`는 한 아티스트로 묶이지만, `"에스파 aespa"`는 별도 아티스트가 된다.

### §4-6 데이터가 검색결과에 그대로 나간다 (구조화 데이터)
공연 상세 페이지는 아래 필드를 그대로 Google 구조화 데이터(`MusicEvent`)로 내보낸다. 비어 있으면
검색결과에서 그만큼 기능이 빠진다 — **채울 수 있는데 비워두는 게 가장 아까운 손실**이다.

| 데이터 필드 | 검색결과 항목 | 비면 생기는 일 |
|---|---|---|
| `general_sale_url` / `presale_url` | `offers` | 검색결과에 티켓 정보·예매 링크가 안 뜬다 |
| `publisher` | `organizer` | 주최사 정보 누락 |
| `developer`, `festival_days[].lineup` | `performer` | 출연 아티스트 누락 (라인업도 performer로 쓰인다) |
| `release_time` | `startDate` 시각 | 날짜만 노출 |
| `platforms[0]` | `location` | (필수 항목이라 공연명으로 폴백되지만 부정확) |

- 없는 정보를 지어내면 안 된다. **확인되면 채운다**가 원칙이다.
- 특히 `publisher`(주최사)는 지금까지 대부분 비어 있다 — 예매처 상세 페이지나 공식 공지에 주최/주관이
  거의 항상 적혀 있으니 확인되는 대로 채울 것.

### description 작성 원칙(공통)
- 공식 보도자료/포스터 문구를 그대로 복붙 금지 — 같은 사실관계를 직접 재서술
- 사실만: 검증 안 된 추측·과장·수치 창작 금지
- 담을 내용: ① 아티스트/공연 성격 ② 왜 주목할 만한지(투어 규모, 첫 내한 여부, 컴백 맥락 등) ③ 장소·일정 맥락 ④ 티켓팅 정보(선예매 중이면 그 사실)
- 언어별 최소 분량 기준은 각 리서처 프롬프트(RESEARCHER_*.md)에 명시 — 언어 특성상 글자수 기준이 다르다

---

## 5. 데이터 보관 정책
- 지난 공연도 삭제하지 말 것 — 전부 보관. 지난 공연 상세 페이지도 SEO 롱테일·고유 콘텐츠 자산이라 계속 유지한다.
  → 나아가 **과거 공연은 적극 채우는 대상**이다. §7 백필 정책 참고.
- 공연일이 지난 항목은 코드가 캘린더 "예정"에서 자동으로 빠지므로, 데이터에 남겨도 화면이 지저분해지지 않는다.
- 오래됐다는 이유로 삭제 금지. (명백한 오등록·완전 중복만 정리 대상)

---

## 6. JSON 무결성 검증 (push 전 필수)
```bash
python3 -c "import json; d=json.load(open('data/concerts.ko.json')); print('KO', len(d['games']),'개')"
python3 -c "import json; d=json.load(open('data/concerts.en.json')); print('EN', len(d['games']),'개')"
python3 -c "import json; d=json.load(open('data/concerts.ja.json')); print('JA', len(d['games']),'개')"
```
깨진 채 push 절대 금지. 각 리서처는 **자기 언어 파일만** 검증하면 되지만, 위 3줄을 매번 다 돌려서
다른 리서처가 실수로 깨뜨린 게 없는지도 확인하는 것을 권장한다(발견 시 CHAT.md에 기록만, 수정은 X — 남의 파일이므로).

---

## 7. 과거 공연 백필 (2026-07-30 신설)

### 왜 하는가
캘린더 사이트의 검색 유입은 **항목 수 = 롱테일 페이지 수**에 비례한다. 현재 등록량(ko 36 / en 39 / ja 40,
2026-07-30 기준)은 롱테일이 작동하는 임계점에 한참 못 미친다. 그래서 각 리서처는 예정 공연 리서치와
**별개 트랙으로** 과거 공연을 백필한다. §5의 "지난 공연도 자산이니 보존한다"를 "적극 채운다"로 확장한 것이다.

⚠️ **백필의 주된 이득은 개별 과거 공연 페이지의 검색 유입이 아니다.** 과거 공연 검색은 "세트리스트·후기"
성향이 강해서 공연 정보 상세 페이지와 검색 의도가 어긋난다. 실질 이득은 **§4-5의 아티스트·공연장 모아보기
페이지**에 있다 — 항목이 1건뿐이라 `noindex` 처리되던 페이지가 항목 수가 늘면서 색인 대상으로 전환되고,
이미 색인된 페이지도 내용이 두꺼워진다. 그래서 백필은 "아무 과거 공연이나 많이"가 아니라
**기존 아티스트·공연장을 두껍게 하는 방향**으로 해야 한다. 이 구분을 놓치면 노력 대비 효과가 안 나온다.

### 현재 상태 (2026-07-30 실측 — 백필이 왜 급한지 보여주는 숫자)
| 로케일 | 공연장 | 아티스트 | 색인되는 모아보기 페이지 |
|---|---|---|---|
| ko | 16개 중 10개가 1건짜리 | 28명 중 26명이 1건짜리 | 8개 |
| en | 32개 중 31개가 1건짜리 | 36명 중 35명이 1건짜리 | 2개 |
| ja | 50개 중 39개가 1건짜리 | 36명 중 35명이 1건짜리 | 12개 |

**모아보기 페이지 198개 중 176개(89%)가 `noindex` 상태다.** 상세 페이지를 늘리는 것보다 이 176개를
색인 대상으로 전환시키는 게 훨씬 값싸다 — 1건짜리에 **1건만 더 붙이면** 전환된다.

### 색인 전환 기준 (코드 확인값)
- `lib/venues.ts` → `isVenueIndexable`: `events.length >= 2`
- `lib/artists.ts` → `isArtistIndexable`: `events.length >= 2 || bio 있음`
- `data/artist-bios.json`의 bio 보유 아티스트는 3명뿐 → **사실상 둘 다 "2건 이상" 기준**
- 공연장은 `VENUE_CATEGORIES`(`concert_tour`/`festival`/`fanmeeting`)에서만 뽑는다 — `music_release`의
  `platforms`는 "Streaming"·"CD" 같은 유통 형태라 공연장이 아니다

### ⚠️ 함정 — "같은 투어의 다른 날짜"만 채우면 공연장 페이지는 안 늘어난다
백필 1건은 아티스트 페이지와 공연장 페이지를 **동시에** 건드린다. 그런데 같은 아티스트의 다른 도시 공연을
채우면 아티스트 페이지는 두꺼워지지만 **공연장은 매번 새로운 1건짜리가 생겨서** 색인 안 되는 페이지가
오히려 늘어난다(EN의 공연장 32개 중 31개가 1건짜리인 게 정확히 이 현상이다 — 북미 투어는 도시마다
공연장이 다르다). 두 목표는 서로 다른 전략을 요구한다:

- **아티스트 페이지 전환** → 같은 **아티스트**의 다른 공연 (공연장은 아무거나)
- **공연장 페이지 전환** → 같은 **공연장**의 다른 공연 (아티스트는 아무거나)

효율이 가장 높은 건 **대형 공연장에 과거 공연을 여러 건 몰아 넣는 것**이다. 공연이 많은 장소라 후보가
풍부하고, 한 사이클로 그 공연장 페이지를 확실히 2건 이상으로 만들 수 있다. 반대로 1건짜리 공연장을
새로 만드는 백필은 순 손실에 가깝다 — 상세 페이지 1개는 늘지만 noindex 페이지도 1개 늘어난다.

### 대상 범위
- 기간: **과거 2년 이내**. 그보다 오래되면 소스가 사라져 검증 비용만 커진다.
- 우선순위 (위에서부터):
  1. **이미 등록된 아티스트**(`developer`)의 과거 공연 → 그 아티스트 페이지가 두꺼워진다
  2. **이미 등록된 공연장**(`platforms[0]`)의 과거 공연 → 그 공연장 페이지가 색인 대상으로 전환된다
  3. 대형 공연·정기 페스티벌의 지난 회차 → 검색 수요 자체가 큰 항목
- ❌ 위 1~3에 해당하지 않는 무작위 과거 공연은 건너뛴다. 항목 수를 늘리는 게 목적이 아니라
  **모아보기 페이지를 색인 가능하게 만드는 게** 목적이다.

### 백필 항목의 필드 규칙 (예정 공연과 다른 점)
| 필드 | 백필 시 |
|---|---|
| `release_date_approx` | **반드시 `false`** — 끝난 공연은 날짜가 확정 사실이다 |
| `presale` / `general_sale` | **`false` 또는 생략** — 끝난 예매를 true로 두면 캘린더·알림에 잘못 뜬다 |
| `presale_datetime` / `general_sale_datetime` 등 시각 | **채우지 않는다** — 지난 예매 시각은 정보 가치가 없다 |
| `presale_url` / `general_sale_url` | 채우지 않는다 — 죽은 링크가 되기 쉽다 |
| `description` | **과거 시제로** 서술. "예정"·"열린다" 같은 미래 표현 금지. 분량 기준은 예정 공연과 동일 |
| `timezone` | 예정 공연과 동일하게 **필수** |
| `image_url` | 동일 기준. 과거 공연은 포스터가 내려간 경우가 많아 `null`이 정상이다 |

### 검증 기준은 낮추지 않는다
독립 출처 2개 이상 일치 원칙은 그대로다. 다만 **과거 공연은 오히려 검증이 쉽다** — 이미 일어난 일이라
날짜가 확정돼 있고, 위키피디아 투어 문서에 공연 일정이 표로 정리된 경우가 많다.

⚠️ **대신 "과거 공연인지 예정 공연인지" 판별을 더 엄격히 해야 한다.** 지금까지 각 프롬프트의 연도 검증
규칙은 *"옛 기사를 예정 공연으로 착각하는 것"* 을 막는 장치였다. 백필 트랙이 생기면 그 착각이
**과거 공연을 미래 날짜로 등록하는 사고**로 형태를 바꿔 나타날 수 있다. 백필 항목은 등록 직전에
`release_date`가 반드시 오늘보다 과거인지 확인할 것. 반대로 예정 공연 트랙에서는 과거 날짜가 나오면
그건 백필 후보이지 예정 공연이 아니다.

### 분량
- **사이클당 최대 8건.** 예정 공연 리서치를 **먼저 완료한 뒤** 남는 여력으로 진행한다.
- 예정 공연 신규 추가 한도(15건/일)와 **별개**로 센다.
- 예정 공연 후보 검증이 밀렸으면 그 사이클의 백필은 건너뛴다 — **시의성 있는 정보가 항상 우선이다.**
  티켓팅이 임박한 공연을 놓치면서 과거 공연을 채우는 건 순서가 거꾸로다.
