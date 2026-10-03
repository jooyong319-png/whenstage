## 2026-10-02 · ko

로테이션상 ko가 가장 오래된 점검일(2026-09-25)이라 선택. 대상 창: 2026-08-03 ~ 2026-12-01(오늘 ±60일), 창 안 항목 200건(끝난 것 120 / 예정 80). 코드는 손대지 않았고 `data/concerts.ko.json`만 수정(파일 상단 `last_updated` 2026-10-02). push 전 `validate-data.mjs` 통과. 지난 회차들과 같이 AGENTS.md §4-5를 따라 **실제로 고친 24건에만 `updated_at=2026-10-02`**, 항목 단위 `last_updated`는 넣지 않음.

**트랙 A (졸업 처리) — 20건** (상한 20 도달)
- A-1/A-2 끝난 공연에 남은 예매 필드 2건(§7대로 `presale`/`general_sale=false` + URL·datetime null): ko-silicagel-syn-the-size-seoul-20260926, ko-takuyakimura-checkpoint-seoul-20260926
- A-3: 창 안 끝난 항목 중 approx=true 없음
- A-4 description 시제 교정 20건(위 2건 포함, 비음원 항목 우선·있는 문장의 시제만 과거형 — 새 사실 추가 없음):
  위 2건 + ko-redoor-memory-seoul-20260926, ko-okf2026-orjet-kpop-festa-20260926("2차 라인업… 공개될 예정이다" → "예정이었다"), ko-crossgene-cross-the-line-20260808("될 전망이다" → "공연으로 기획됐다"), ko-choiyena-isegye-movie-seoul-20260822, ko-janghaneum-i-and-i-seoul-20260822, ko-limyoungwoong-imhero10-20260908, ko-nct127-7th-album-20260824, ko-unchild-tingting-20260902, ko-oneus-first-light-20260923(10월 투어 문장은 아직 미래라 유지), ko-ourbirthday-debut-single-20260819, ko-minzy-new-single-20260928, ko-closeyoureyes-comeback-20260930, ko-rose-new-trick-20260918, ko-lesserafim-made-my-night-20260911, ko-iu-i-byeollobuteo-20260910, ko-pentagon-geopjaengi-20260911, ko-kissoflife-sweat-20260804, ko-artms-hyper-ego-20260807

**트랙 B (임박 점검) — 8건 확인** (10/3 개막 항목 중 `updated_at` 없는 것, 9/25 회차에 본 busan-rock·edc·leehi·postmalone 제외)
- ko-letsrock-festival-2026-20261003 — 10/3~4 난지한강공원 정상, 양일 12:00~21:00(스포츠경향/NOL 티켓). B-4 보강: `release_time` 12:00, `general_sale=true`인데 비어 있던 `general_sale_url` → NOL 티켓 상품 26010980
- ko-andteam-blaze-the-way-encore-seoul-20261003 — 10/3~4 KSPO DOME 정상(스포츠경향/NOL). 변경 없음
- ko-choiyuree-stay-seoul-20261003 — 10/3~4 장충체육관 정상(iMBC/NOL). 이미 지난 예매 오픈 문장 시제만 교정
- ko-leo-muse-fanmeeting-seoul-20261003 — 취소·변경 소식 없음(9/7 포스터 공개 기사). 지난 선예매 문장 시제만 교정
- ko-sandeul-baramgyeol-seoul-20261003 — 10/3 18시·4일 17시 블루스퀘어 정상(NOL). 지난 예매 문장 시제만 교정
- ko-nakajimakento-idol1st-kenty-seoul-20261003 — 10/3~4 올림픽홀 정상(세계일보/스포츠경향). 시작 시각은 확인 못 해 `release_time` null 유지
- ko-persona-live-tour-resonance-seoul-20261003 — 10/3 예스24 라이브홀 정상(Inven Global/RPG Site). 시작 시각 미확인 → 변경 없음
- ko-verivery-give-me-five-seoul-20261003 — 10/3~4 KBS아레나 정상(iMBC/namanecard). 변경 없음
- B-3 링크: 예매처는 샌드박스에서 직접 열지 않고 검색으로 판매·개최 진행 교차 확인 → 죽은 링크로 단정한 것 없음

**남은 것**: A-4 music_release 시제("발매한다/공개한다"류) 약 20건 이월 — ko-dawn-too-much-20260807, ko-kiiikiii-whykiiikiii-20260810, ko-axmxp-hello-axmxp-20260812, ko-astro-mj-right-20260819, ko-atheart-3-4-20260819, ko-kimjaejoong-the-wave-single-20260820, ko-tiffanyyoung-edge-of-calm-20260820, ko-eungaeun-jeonguk-paldo-20260824, ko-tuide-tune-and-play-20260824, ko-kimkitae-namu-gabang-20260826, ko-taemin-phase1-soft-violence-20260831, ko-82major-heat-20260901, ko-shinwonho-super-star-20260902, ko-plave-flame-milet-20260903, ko-evan-death-of-me-20260907, ko-kimheejae-reverb-20260907, ko-soyeon-solo-comeback-20260910, ko-inaminute-midnight-20260909, ko-allhours-unbound-20260910, ko-youngtak-gogo-20260914. 트랙 B 다음 순번: ko-xmf-2026-20261003, ko-youngtak-tak-show5-seoul-20261003, ko-jogwanwoo-autumn-miracle-bucheon-20261004, ko-zaralarsson-midnight-sun-seoul-20261004부터
**리서처 참고(추가 안 함)**: 신규 미등록 공연 발견 없음. ko-okf2026 / ko-letsrock / ko-busan-rock 등 다일 페스티벌의 `festival_days` 공란 — 리서처 보강 권장(렛츠락은 3일 나씽 벗 띠브스·넬, 4일 자우림·국카스텐 등 요일별 라인업 공개됨)

---

