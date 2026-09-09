# WhenStage 데이터 점검 로그

| 로케일 | 마지막 점검 | 다음 순번 |
|---|---|---|
| ko | 2026-09-09 | |
| en | — | ← |
| ja | — | |

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
