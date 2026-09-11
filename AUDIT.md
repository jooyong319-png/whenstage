# WhenStage 데이터 점검 로그

| 로케일 | 마지막 점검 | 다음 순번 |
|---|---|---|
| ko | 2026-09-09 | |
| en | 2026-09-11 | |
| ja | — | ← |

---

## 2026-09-11 · en

en 첫 회차. 대상 창: 2026-07-13 ~ 2026-11-10 (오늘 ±60일). 창 안 항목 133건(끝난 것 43 / 예정 90).
로테이션상 en이 미점검(가장 오래됨)이라 선택. 코드는 손대지 않았고 `data/concerts.en.json`만 수정.

**트랙 A (졸업 처리) — 17건** (상한 20건 이내, A-3·A-4 해당 없음)
- 끝난 공연에 남은 예매 필드 정리(A-1·A-2) 17건 — `general_sale_url`/`presale_datetime`/`general_sale_datetime` 등 "아직 판매 중" 모양으로 남은 값을 null 처리. `isTicketingLiveNow()`가 마감일 없는 과거 `*_datetime`을 "예매중"으로 띄우던 항목 다수 포함(코드 CTA는 `hasEventEnded`로 이미 막혀 있으나 목록/캘린더 "예매중" 배지는 이 함수를 씀 → 데이터를 사실과 맞춤):
  en-enhypen-blood-saga-oakland-20260728, en-lollapalooza-2026-20260730, en-djo-summer-tour-richmond-20260731,
  en-rush-fifty-something-new-york-20260801, en-foo-fighters-take-cover-detroit-20260806, en-mcr-black-parade-2026-new-york-20260809,
  en-avenged-sevenfold-good-charlotte-belmont-park-20260810, en-bon-jovi-forever-tour-edinburgh-20260828,
  en-fcukers-fall-tour-grand-rapids-20260901, en-silvana-estrada-suaves-lluvias-portland-20260903,
  en-garth-brooks-blame-it-all-roots-denver-20260904, en-lupe-fiasco-back-to-basics-cleveland-20260910(general_sale=true→false 포함),
  en-the-band-camino-satellite-music-hall-memphis-20260904, en-garth-brooks-blame-it-all-on-my-roots-indianapolis-20260820,
  en-bad-bunny-cerramos-en-casa-san-juan-20260822, en-bad-bunny-cerramos-en-casa-san-juan-20260823, en-katseye-wildworld-tour-london-20260904
- A-3(release_date_approx 미해제): 끝난 항목 중 approx=true 없음 — 처리 없음
- A-4(description 시제): 끝난 항목 description은 이미 과거형. 오탐 2건 확인 후 미수정 —
  en-morgan-wallen-been-by-now-20260724("will-they-won't-they" 관용구), en-lil-uzi-vert-maverick-almost-forever-20260731("scheduled ... was scrapped" 과거 서술)

**트랙 B (임박 점검) — 8건 확인** (공연일 가까운 순, last_updated 오래된 순)
- 취소·연기 없음. 8건 모두 공식·예매처 소스로 정상 진행 확인, last_updated 오늘로 갱신:
  en-bigbang-2026-world-tour-east-rutherford-20260911(MetLife 9/11 20:00 정상, Ticketmaster 판매중),
  en-charli-xcx-music-fashion-film-philadelphia-20260911(Xfinity Mobile Arena 투어 개막 9/11 20:00 정상),
  en-garth-brooks-blame-it-all-on-my-roots-rosemont-20260911(Allstate Arena 9/11 20:00 정상),
  en-melanie-martinez-hades-the-sacrifice-london-20260911(The O2 9/11 정상),
  en-chrome-sparks-ball-of-light-20260911(앨범 9/11 발매 확정, music_release),
  en-phoebe-bridgers-lost-tour-indianapolis-20260914(Gainbridge Fieldhouse 9/14 19:30 정상, last_updated 없던 항목),
  en-ministry-hate-to-go-farewell-red-rocks-20260915(Red Rocks 9/15 정상),
  en-erykah-badu-alchemist-cleveland-20260915(Jacobs Pavilion 9/15 20:00 정상, De La Soul 동반)
- B-2(approx 임박): 해당 없음(8건 모두 approx=false)
- B-4(빈 필드 보강): release_time 2건 채움(출처 2건 일치) —
  en-melanie-martinez-...-20260911 → 18:30(Live Nation·AXS), en-erykah-badu-alchemist-cleveland-20260915 → 20:00(Jacobs Pavilion·SeatGeek)
- 링크: bigbang·charli·melanie·phoebe의 general_sale_url(Ticketmaster/AXS)은 provenance 제한으로 직접 열지 못했으나 검색으로 판매 진행 확인 → §B-3 재확인 원칙대로 죽은 링크로 단정하지 않고 유지

**남은 것**: 트랙 A 상한 여유 있었고 A-1/A-2 해당 항목 전부 처리(17건). 추가 대기 없음.
**리서처 참고(추가·수정 안 함)**:
- en-bigbang-2026-world-tour-east-rutherford-20260911: `platforms`에 East Rutherford(MetLife)와 Oakland Coliseum 두 도시 공연장이 함께 들어 있음 — 날짜별 항목 분리 여부는 리서처 판단
- 공연장 표기 다수가 "Venue, City, ST" 형식이라 §4-5 괄호 규칙과 어긋남(예: "Gainbridge Fieldhouse, Indianapolis, IN") — 공연장 모아보기 색인에 영향 가능, 표기 통일은 리서처/운영 몫

---

## 2026-09-09 · ko

첫 회차라 `AUDIT.md`를 새로 만들었다. 로테이션 규칙상 다음 순번은 en(미점검) → ja.
대상 창: 2026-07-11 ~ 2026-11-08 (오늘 ±60일). 창 안 항목 151건(끝난 것 84 / 예정 67).

**트랙 A (졸업 처리) — 20건** (상한 20건 도달, 나머지는 다음 회차로)
- 예매 필드/URL 정리(A-1·A-2) 12건 — 끝난 공연에 남아 있던 `general_sale_url`(일부 `presale_url`·`general_sale_datetime` 포함)을 null 처리:
  ko-straykids-worldtour-seoul-20260725, ko-pentaport-rock-festival-20260731, ko-itzy-all-in-midzy-seoul-20260808,
  ko-nflying-into-rem-daegu-20260808, ko-kimjongkook-theoriginals-seoul-encore-20260815, ko-nflying-into-rem-busan-20260815,
  ko-thornapple-my-century-seoul-20260815, ko-jackwhite-live-seoul-20260817, ko-live-icon9-onewe-dragonpony-20260817,
  ko-sekou-live-in-seoul-20260818, ko-stevelacy-oh-yeah-asia-tour-seoul-20260819, ko-bigbang-worldtour-goyang-20260821
- description 시제 교정(A-4) — 끝난 공연인데 "연다/열린다/발매한다/기대를 모은다/예상된다" 등 미래·기대 표현이 남은 항목을 과거형으로. 새 사실은 덧붙이지 않고 시제만 변경. 위 12건 다수 + 다음 8건에 적용:
  ko-redvelvet-velvet-summer-20260803, ko-leeseungchul-thevoice-seongnam-20260808, ko-wayv-vision-wings-20260810,
  ko-jeongeunji-summer-i-20260811, ko-bigbang-20th-hangang-20260819, ko-bigbang-biiig-20260819,
  ko-mimi-first-solo-single-20260820, ko-enhypen-the-sin-bliss-20260821
- 오탐 1건: ko-redvelvet-a-day-in-red-and-velvet-20260731 — "예정됐던"(과거)이라 손대지 않음
- ko-wayv-vision-wings-20260810: 본문 중 9월 12일 공연(미래) 언급은 그대로 둠

**A-3 예외(placeholder 날짜) 처리 — 2건 (웹으로 확정일 확인 후 approx 해제)**
- ko-jennie-new-ep-20260831: 8월 말 임시값 → 2026-08-28 13:00 확정('Fallen Angel' EP, 스포츠경향 다건). name·description 갱신, approx=false
- ko-namyoojung-remake-album-20260831: 8월 말 임시값 → 2026-08-22 확정(리메이크 3부작 완성일, '초대' 발표). description 과거형 보강, approx=false

**트랙 B (임박 점검) — 8건 확인** (공연일 가까운 순, last_updated 오래된 순)
- 취소·연기 없음. 8건 모두 공식 공지대로 정상 진행 확인:
  ko-inaminute-midnight-20260909(발매 정상), ko-allhours-unbound-20260910(발매 정상),
  ko-johnpark-break-seoul-20260911(9/11~13 정상), ko-backnumber-grateful-yesterdays-seoul-20260912(9/12~13 정상),
  ko-jeongeunji-summer-i-concert-20260912(9/12~13 정상), ko-wayv-born-this-way-seoul-20260912(9/12~13 정상),
  ko-riize-ch-riize-on-air-20260912(9/12~13 정상), ko-leejunho-autumn-note-seoul-20260912(9/12 정상)
- 링크 확인: back number(yes24 Perf/58079)·RIIZE(interpark goods/26010045) 예매 URL은 web_fetch provenance 제한으로 직접 열지 못했으나, 두 공연 모두 검색으로 진행 확정 → 죽은 링크로 단정하지 않고 유지(§B-3 재확인 원칙). 다음 회차에 재확인 필요.

**남은 것**: 트랙 A 대기 약 20건(상한 초과분, 조건 자기서술적이라 다음 회차 재포착) — 예: ko-hyeonyeokgawang-family-festival-seoul-20260822 등
**리서처 참고(추가 안 함)**:
- ko-pentaport-rock-festival-20260731: festival 카테고리인데 `festival_days`가 null. 실제 개최는 7/31~8/2 3일. 데이별 라인업 보강은 리서처 몫
- ko-leejunho-autumn-note-seoul-20260912: `platforms` 비어 있음(광운대 동해문화예술관으로 보이나 미확정) — B-4 보강 후보
