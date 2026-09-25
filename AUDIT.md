# WhenStage 데이터 점검 로그

| 로케일 | 마지막 점검 | 다음 순번 |
|---|---|---|
| ko | 2026-09-25 | |
| en | 2026-09-21 | ← |
| ja | 2026-09-23 | |

---

## 2026-09-25 · ko

로테이션상 ko가 가장 오래된 점검일(2026-09-18)이라 선택. 대상 창: 2026-07-27 ~ 2026-11-24(오늘 ±60일), 창 안 항목 186건(끝난 것 115 / 예정 71). 코드는 손대지 않았고 `data/concerts.ko.json`만 수정(파일 상단 `last_updated` 2026-09-25). push 전 `validate-data.mjs` 통과. 지난 ja 회차와 같이 AGENTS.md §4-5를 따라 **실제로 고친 항목에만 `updated_at=2026-09-25`**, 항목 단위 `last_updated`는 넣지 않음(트랙 B 중복 방지는 이 로그 목록으로 대신).

**트랙 A (졸업 처리) — 20건** (상한 20 도달)
- A-1/A-2 끝난 공연에 남은 예매 필드 2건(§7대로 `presale`/`general_sale=false` + URL·datetime null): ko-izna-who-dat-girl-seoul-20260919, ko-vaundy-horo-seoul-20260919
- A-3: 창 안 끝난 항목 중 approx=true 없음
- A-4 description 시제 교정 20건(위 2건 포함, 비(非)음원 항목 우선·있는 문장의 시제만 과거형으로 — 새 사실 추가 없음):
  위 2건 + ko-axmxp-x-verse-seoul-20260919, ko-chomingyu-mono-drama-sweet-escape-seoul-20260919, ko-kimyongbin-serenade-seoul-20260919(이미 [취소됨] — "연다"→"열 예정이었다", 환불 "된다"→"됐다"), ko-haha-fan-concert-seoul-20260913, ko-wayv-born-this-way-seoul-20260912, ko-leejunho-autumn-note-seoul-20260912, ko-jeongeunji-summer-i-concert-20260912, ko-isul-live-festival-2026-20260912, ko-johnpark-break-seoul-20260911, ko-evan-debut-showcase-seoul-20260907, ko-parkeunbin-eun-iverse-20260905, ko-kimyoona-coffee-and-cigarette-20260905, ko-fromis9-tomorrow-glow-seoul-20260904, ko-leesu-dsotm-seoul-20260829, ko-kimjaejoong-the-wave-seoul-20260829, ko-jaypark-serenades-body-rolls-replay-seoul-20260829, ko-infinite-mudaejiphoe-v-incheon-20260829, ko-waterbomb-sokcho-2026-20260822

**트랙 B (임박 점검) — 8건 확인** (9/18 회차에 본 okf·boynextdoor·closeyoureyes, 9/23 리서처가 고친 takuyakimura 제외)
- ⚠️ **연기 확인**: ko-postmalone-big-stadium-tour-seoul-20261002 — 8/27 아시아·오세아니아 투어 일괄 조정으로 서울 공연 잠정 연기, 새 일정 미발표, 전액 환불(Korea Herald/경향신문/데일리안/TicketNews). → description 앞에 `[연기됨]` + 연기 사실 추가, `release_date_approx=true`(10/2는 임시값), `general_sale=false`·`general_sale_url=null`(판매 종료). **삭제 안 함**
- ⚠️ **B-2 해제(날짜 대폭 변경)**: ko-tunexx-comeback-20260930 — 실제로는 **9월 2일 18시** 미니 2집 'BLUE MODE' 발매(총 4곡, 엑스포츠뉴스/스포츠경향/톱스타뉴스/벅스). release_date 2026-09-02·approx=false·release_time 18:00·name·description·source_url 갱신. **id는 `-20260930` 그대로 둠**(id 변경은 링크 깨짐 위험 — 운영자 판단 필요)
- ko-minzy-new-single-20260928 — B-4 보강: 싱글명 'Calling'(3곡), 9/28 18시 발매 확인(Korea JoongAng Daily/일간스포츠/allkpop) → name·description·release_time 갱신
- ko-edc-korea-2026-20261003 — 10/3~4 인스파이어 정상. description의 "추석 연휴"는 사실 오류(개천절 연휴)라 교정, "1차 라인업 순차 공개 중" → 확정 헤드라이너(DJ 스네이크·티에스토·피셔·알록, 톱스타뉴스/공식) 반영
- ko-leehi-hibiscus-garden-live-20261003 — 10/3 18시 정상, 국내 예매분 매진(엑스포츠뉴스/네이트) → 티켓 문장 시제·매진 반영
- ko-silicagel-syn-the-size-seoul-20260926 — 9/26 18시·27 17시 KSPO DOME 정상(NOL 티켓/엑스포츠뉴스). 변경 없음
- ko-redoor-memory-seoul-20260926 — 9/26~27 올림픽홀 전석 매진·정상(뉴스핌/톱스타뉴스). 변경 없음
- ko-busan-rock-festival-20261002 — 10/2~4 삼락생태공원 정상(공식/뉴스컬처). 변경 없음. 참고: 최종 99팀·리버틴즈 마지막 헤드라이너 확정 — description의 "2차 라인업 18개 팀" 서술이 낡았고 festival_days 비어 있음 → 리서처 보강 권장
- B-3 링크: 예매처(인터파크 등)는 샌드박스에서 직접 열지 않고 검색으로 판매·개최 진행 교차 확인 → 죽은 링크로 단정한 것 없음

**남은 것**: A-4 music_release 시제("발매한다/돌아온다/공개한다"류) 약 40건 이월, 비음원 ko-redvelvet-a-day-in-red-and-velvet-20260731·ko-crossgene-cross-the-line·ko-choiyena-isegye-movie·ko-janghaneum-i-and-i·ko-nflying-into-rem-busan·ko-kodaline 시제 이월
**운영자 참고**: 포스트 말론·튜넥스 변경에 맞춰 `content/`의 관련 글(2026-10-first-weekend-clash.ko.md, 2026-fall-overseas-pop-top6.ko.md, 2026-09-comeback-album-picks.ko.md, rookie-first-stages-202609.ko.md, news/2026-09-21-10월-미리보기.ko.md 등)이 여전히 예정대로 서술했을 수 있음 — Auditor 쓰기 범위 밖이라 미수정. en 파일에도 포스트 말론 항목이 있으면 en 회차에서 연기 반영 필요. 또한 이번 회차 로그 커밋(0b43160)에 샌드박스의 다른 작업 임시 파일이 잘못 섞여 들어가 바로 다음 커밋으로 원복함(강제 push 없음)
**리서처 참고(추가 안 함)**: 신규 미등록 공연 발견 없음

---

## 2026-09-23 · ja

로테이션상 ja가 가장 오래된 점검일(2026-09-14)이라 선택. 대상 창: 2026-07-25 ~ 2026-11-22(오늘 ±60일), 창 안 항목 150건(끝난 것 74 / 예정 76). 코드는 손대지 않았고 `data/concerts.ja.json`만 수정. push 전 `validate-data.mjs` 통과(파일 상단 `last_updated` 오늘로 갱신).

⚠️ 운영 메모: AUDITOR.md는 "확인한 항목의 `last_updated`를 오늘로" 하라지만, AGENTS.md(3517bed 이후)는 **항목 단위 `last_updated` 금지**, §4-5는 **실제로 고친 항목에만 `updated_at`**이다. 오늘 JA 리서처도 항목 내 `last_updated`를 제거했다. 그래서 이번 회차는 AGENTS.md를 따라 **고친 20건에만 `updated_at=2026-09-23`**을 넣었고, 트랙 B에서 확인만 한 항목엔 아무 필드도 넣지 않았다. 트랙 B 중복 방지는 이 로그의 확인 목록으로 대신함 → **AUDITOR.md 14번 규칙 정리 필요(운영자 참고)**.

**트랙 A (졸업 처리) — 20건** (상한 20 도달)
- A-1/A-2 끝난 공연에 남은 예매 필드·플래그 정리 4건(§7 표대로 `presale`/`general_sale=false` + URL·datetime null, 전부 concert_tour):
  ja-epica-japan-tour-2026-20260914(9/15 대阪 포함 종료), ja-the-weeknd-2026-20260919(9/20 종료), ja-motoharu-sano-in-and-out-osaka-20260922, ja-super-beaver-dome-tour-tokyo-20260922(9/23 공연은 별도 항목 존재)
- A-3: 창 안 끝난 항목 중 approx=true 없음
- A-4 description 시제 교정 20건(위 4건 포함, 있는 문장의 시제만 과거형으로 — 새 사실 추가 없음):
  위 4건 + ja-lynch-ignite-the-climax-yokohama-20260904, ja-hinatazaka46-hinata-fes-2026-20260905, ja-kato-kuniko-reich90-meguro-20260905, ja-seikima-ii-great-black-mass-tokyo-20260905, ja-hosono-haruomi-prelude-20260902, ja-choi-yuree-concert-in-japan-20260830, ja-sukiyaki-tokyo-lindigo-20260825, ja-steve-lacy-ss-extra-20260813, ja-flo-japan-tour-2026-20260831, ja-spellbound-bbs-kabukicho-20260824, ja-jisung-our-scene-20260918, ja-suzuki-masayuki-martini-tokyo-20260922, ja-tentaka-matsuri-2026-20260919, ja-ultra-japan-2026-20260919, ja-rock-in-japan-2026-20260912, ja-fukuyama-masaharu-dome-2026-20260805
- 의도적 제외(투어 전체를 다루는 항목이라 예매 링크가 남은 일정에 아직 유효):
  - ja-nightmare-tour-2026-20260919(11/22까지 투어, eplus 투어 URL), ja-ryokushaka-arena-tour-2026-20260919(12/6까지, ぴあ 번들 URL) — 코드상 release_date 기준 "종료"지만 URL을 지우면 살아 있는 예매를 없애는 셈. 운영 판단 필요
  - ja-babymonster-choom-japan-kyocera-20260922 — 9/22·23 2days, **오늘(9/23) 공연 진행일**이라 제외. 다음 회차에 시제 교정
  - ja-boynextdoor-knock-on-vol2-japan-20260821 — 10/11까지 투어 서술, 제외

**트랙 B (임박 점검) — 8건 확인** (공연일 가까운 순, 9/14 회차에 이미 본 freckles·number-i 제외). 8건 모두 공식·예매처·언론 소스로 정상 개최/발매 확인, 취소·연기 없음, approx 임박 항목 없음:
- ja-glay-yogoreta-eiyu-20260923 — 64th 싱글 9/23 발매 확인(GLAY 공식/타워레코드/新潟日報)
- ja-super-beaver-dome-tour-tokyo-20260923 — 도쿄돔 9/23 18:00 정상, 전 공연 매진·WOWOW 11월 방송(WOWOW/ぴあ)
- ja-belle-and-sebastian-tigermilk-tokyo-20260924 / ja-belle-and-sebastian-sinister-tokyo-20260925 — Kanadevia Hall 9/24·25 개장18:00/개연19:00 정상(クリエイティブマン/e+/Rolling Stone Japan). 참고: 일부 매체는 요금을 "税別"로 표기, 데이터는 "税込" — 공식 확인 못 해 수정 안 함
- ja-benjamin-grosvenor-recital-20260924 — 浜離宮朝日ホール 9/24 19:00 정상(홀 공식 이벤트 페이지/ぴあ)
- ja-jowee-omicil-japan-2026-20260924 — WALL&WALL 9/24 정상(CDJournal/MUSIC TRIBUNE). release_time은 확인 못 해 null 유지
- ja-ringo-ongakusai-2026-20260926 — 9/26·27 アルプス公園 정상, 개장9:00/개연10:00/폐연20:30(공식/松本市)
- ja-sakanaction-toumei-glion-arena-kobe-20260929 — 9/29·30 정상(TOTTEI 공식/e+/サカナクション 공식)
- B-3 링크: 샌드박스 fetch가 예매처 URL(eplus 등)을 직접 열지 못함 → 검색 결과로 해당 페이지·판매 진행 교차 확인, 재확인 원칙대로 죽은 링크로 단정하지 않고 유지
- B-4: 확인 가능한 신규 값 없음(지어내지 않음)

**남은 것**: A-4 music_release 시제("リリースする/される"류) 약 15건 — ja-ballistik-boyz-saku, ja-befirst-bruce-wayne, ja-spitz-mishiranu-ito, ja-yama-mountain, ja-kimura-takuya-checkpoint, ja-motfd-iwaou, ja-boynextdoor-boom-boom-boom, ja-milet-made-of-glass, ja-nakajima-kento-onigoto, ja-ikimonogakari-sayonara-lara, ja-ryokushaka-atamago, ja-hosono-yours-sincerely, ja-crazy-ken-band-nani, ja-ini-anthem, ja-tamaki-aska-otoginga, ja-befirst-watch-me, ja-sota-hanamura-kimiwosagashiteta — 다음 회차 이월. babymonster 0922 시제도 다음 회차.
**리서처 참고(추가·수정 안 함)**:
- ja-rock-in-japan-2026-20260912: 9/14 회차 플래그 그대로 `festival_days` 비어 있음(5일 개최 9/12~21). 이제 전 일정 종료라 화면 피해는 없어졌으나 일자별 라인업은 여전히 미등록
- ja-ultra-japan-2026-20260919: `festival_days: null` 그대로(2일 개최, 종료)
- 투어 전체를 한 항목에 담은 경우(nightmare·ryokushaka·boynextdoor) 첫날 기준으로 "종료" 처리되어 남은 공연이 예정 목록에서 빠짐 — 공연별 분리 또는 festival_days식 처리 검토 권장

---

## 2026-09-21 · en

로테이션상 en이 가장 오래된 점검일(2026-09-11)이라 선택. 대상 창: 2026-07-23 ~ 2026-11-20(오늘 ±60일), 창 안 항목 154건(끝난 것 60 / 예정 94). 코드는 손대지 않았고 `data/concerts.en.json`만 수정. push 전 `validate-data.mjs` 통과(파일 상단 `last_updated`도 오늘로 갱신).

**트랙 A (졸업 처리) — 9건** (상한 20 이내)
- A-1/A-2 끝난 공연에 남은 예매 필드·플래그 정리(§7 표대로 `presale`/`general_sale=false` + 관련 URL·datetime null). 전부 concert_tour/festival이라 `music_release` 예외 해당 없음:
  - en-bigbang-2026-world-tour-east-rutherford-20260911 (general_sale_url null)
  - en-charli-xcx-music-fashion-film-philadelphia-20260911 (presale/general_sale URL·datetime null)
  - en-phoebe-bridgers-lost-tour-indianapolis-20260914 (general_sale_url·datetime null)
  - en-jon-pardi-gamblin-man-richmond-20260917 (presale_datetime·general_sale URL·datetime null)
  - en-riot-fest-2026-20260918 (general_sale=false, riotfest.org URL null)
  - en-erykah-badu-alchemist-queens-20260918 (general_sale=false)
  - en-erykah-badu-alchemist-forest-hills-20260918 (general_sale=false, ticketmaster URL null)
  - en-melanie-martinez-hades-the-sacrifice-london-20260911 (general_sale_url null)
- A-3 (release_date_approx 미해제): 창 안 끝난 항목 중 approx=true 없음 — 처리 없음
- A-4 description 시제 교정: 위 8건 + festival 1건(en-lollapalooza-2026-20260730)에서 끝난 공연인데 남은 현재·미래 표현("brings/opens/launches/returns/headline/play/are waitlisted…")의 **시제만** 과거형으로 교정. 새 사실 추가 없음. 락페스티벌 라인업 동사(lead/headline/close→led/headlined/closed) 포함
- ⚠️ en-shakira-...-madrid-20260918은 general_sale=true·URL 있으나 **12일 residency(9/18 개막, 진행 중)**라 판단해 졸업 처리 제외 — 지난 공연으로 오판하면 살아 있는 예매를 죽이는 셈. 다음 회차 창 안에서 재판정

**트랙 B (임박 점검) — 8건 확인** (공연일 가까운 순, last_updated 오래된/미기록 우선). 8건 모두 공식·언론·예매처 소스로 정상 개최/발매 확인, 취소·연기 없음. 전부 last_updated=2026-09-21 갱신:
- en-neil-young-willie-nelson-bridgeport-20260922 — 9/22 19:00 Hartford HealthCare Amphitheater 정상, Ty Myers 서포트(Consequence/TicketNews/Spotify). **B-4 보강**: release_time 미기입 → 19:00 확정
- en-rebecca-black-exhibitionism-tour-boston-20260923 — 9/23 20:00 Royale 투어 개막 정상(AXS/BrooklynVegan/Pollstar). **B-4 보강**: release_time 미기입 → 20:00 확정
- en-lucinda-williams-worlds-gone-wrong-atlanta-20260924 — 9/24~25 Variety Playhouse 2일 정상(Pollstar/Glide/Consequence)
- en-slothrust-dystopian-theatre-tour-boston-20260924 — 9/24 20:00 Royale 정상, 신보 발매 확인(AXS/SLR Magazine). general_sale_url(axs) 유효
- en-neil-young-willie-nelson-philadelphia-20260924 — 9/24 Highmark Mann Center, Bridgeport과 함께 발표된 2회차 중 하나로 정상(Consequence/TicketNews)
- en-icona-pop-ritual-tour-brooklyn-20260925 — 9/25 Baby's All Right 정상, Ritual 발매 후 투어(mxdwn/Pollstar/DoNYC)
- en-kylie-cantrall-valley-girl-problems-minneapolis-20260925 — 9/25 The Fillmore 투어 개막 정상(Ticketmaster/Consequence/Pollstar), 기존 release_time 19:00 유지
- en-brandi-carlile-returning-to-myself-sad-gay-version-20260925 — 9/25 Interscope/Lost Highway 디럭스 발매 확정(Universal Music/JamBase/Consequence)
- B-3 링크: 예매처(Ticketmaster/AXS/Live Nation 등)는 로봇 차단·매진 표시가 잦아 직접 열지 않고 언론·공식 소스로 개최·판매 진행을 교차 확인 → 재확인 원칙대로 죽은 링크로 단정하지 않고 유지

**남은 것**: 순수 A-4 후보(끝난 항목 중 미래시제만 남은 레코드)가 창 안에 더 있을 수 있으나 상한·정확도 관리를 위해 다음 회차로 이월(조건 자기서술적). en-shakira residency 종료 여부 다음 회차 재판정
**리서처 참고(추가·수정 안 함)**: 점검 범위(±60일)에서 신규 미등록 공연 발견 사항 없음

---

## 2026-09-18 · ko

로테이션상 ko가 가장 오래된 점검일(2026-09-09)이라 선택. 대상 창: 2026-07-20 ~ 2026-11-17(오늘 ±60일), 창 안 항목 171건(끝난 것 108 / 예정 63). 코드는 손대지 않았고 `data/concerts.ko.json`만 수정. push 전 `validate-data.mjs` 통과.

**트랙 A (졸업 처리) — 16건** (상한 20 이내)
- A-1 끝난 공연에 남은 예매 필드 정리 16건 — `general_sale_url`/`presale_url`/`*_datetime`가 "아직 판매 중" 모양(마감일 없이)으로 남은 값을 `presale`/`general_sale=false` + 관련 URL·datetime null 처리(§7 표대로). 전부 concert_tour/fanmeeting이라 `music_release` 예외 해당 없음:
  ko-psy-heumppuck-show-2026-20260801, ko-aespa-synk-complaexity-seoul-20260807, ko-higedandism-asiatour-seoul-20260808,
  ko-kodaline-farewell-tour-seoul-20260812, ko-hyeonyeokgawang-family-festival-seoul-20260822, ko-nflying-into-rem-gwangju-20260822,
  ko-jeonyujin-twenty-one-20260829, ko-limyoungwoong-imhero-stadium2-20260904, ko-honggyeongmin-medalist-september-seoul-20260905,
  ko-sungsikyung-with-friends-20260905, ko-backnumber-grateful-yesterdays-seoul-20260912, ko-crush-zzinbombting-crush-farm-seoul-20260912,
  ko-hyunjae-the-present-for-you-seoul-20260912, ko-plave-keep-it-manic-incheon-20260912, ko-riize-ch-riize-on-air-20260912,
  ko-wax-3579-autumn-seoul-20260913
- A-2 예매 플래그 잔존: 위 16건에 포함(개별 추가 없음). 창 안 끝난 항목 중 별도 플래그 잔존 0건
- A-3 (release_date_approx 미해제): 끝난 항목 중 approx=true 없음 — 처리 없음
- A-4 description 시제 교정: 위 16건과 동일 레코드에서 함께 처리(별도 항목 카운트 없음). 끝난 공연인데 "연다/열린다/돌아온다/진행한다/시작된다/이어진다" 등 미래·현재 표현으로 남은 문장의 **시제만** 과거형으로 교정. 새 사실 추가 없음. backnumber의 "현재도 판매가 진행 중이다"처럼 사실과 어긋난 현재 상태 서술은 제거
- 이번 회차는 A-1(웹 확인 불필요·객관적)에 집중. 순수 A-4 후보(끝난 항목 중 미래시제만 남은 레코드)가 다수 남아 있으나 상한·정확도 관리를 위해 다음 회차로 이월(조건이 자기서술적이라 다시 잡힘)

**트랙 B (임박 점검) — 8건 확인** (공연일 가까운 순, last_updated 오래된/미기록 우선). 8건 모두 공식·언론·예매처 소스로 정상 진행 확인, 취소·연기 없음. 전부 last_updated=2026-09-18로 갱신:
- ko-nct127-neocity-redline-seoul-20260918 — 9/18~20 KSPO DOME 3회차 전석 매진, 정상 개최(스포츠월드/멜론티켓/kpop.fandom)
- ko-vaundy-horo-seoul-20260919 — 9/19~20 인스파이어 아레나 첫 내한 정상(YTN/텐아시아)
- ko-axmxp-x-verse-seoul-20260919 — 9/19~20 NOL 씨어터 합정 데뷔 첫 단독 정상(스타뉴스/톱스타뉴스)
- ko-chomingyu-mono-drama-sweet-escape-seoul-20260919 — 9/19~20 블루스퀘어 전석 매진 정상(스타뉴스/스포츠경향)
- ko-okf2026-orjet-kpop-festa-20260926 — 9/26~27 킨텍스 개최, 1차 라인업 확인(전자신문/스타뉴스/예스24)
- ko-boynextdoor-home-repackage-20260928 — 9/28 18시 리패키지 발매 확정. **B-4 보강**: 미공개였던 앨범명·타이틀곡 확정(HOME: DELUXE / 타이틀 'ANIMAL', 지코 참여, 총 14곡) → name·description·release_time 갱신(MK스포츠/스포츠경향/뉴스핌)
- ko-tunexx-comeback-20260930 — **B-2 확인 실패**: "9월 컴백" 발표만 있고 정확한 발매일·앨범 정보 여전히 미공개(파이낸셜뉴스/스타뉴스/뉴스1) → release_date_approx=true 그대로 유지, 임시값 9/30 보존. 다음 회차 재확인
- ko-closeyoureyes-comeback-20260930 — **B-2 해제**: 미니 4집 '256th Note' 9/30 18시 발매 확정(스타뉴스 9/8·9/10·9/14 등 복수 출처) → release_date_approx=false, release_time=18:00, name·description 갱신. 같은 날 20시 온·오프라인 컴백 라이브
- B-3 링크: 예매처(인터파크/NOL 등)는 로봇 차단·매진 표시가 잦아 직접 열지 않고 언론·공식 소스로 판매·개최 진행을 교차 확인 → 재확인 원칙대로 죽은 링크로 단정하지 않고 유지

**남은 것**: 트랙 A 순수 A-4 후보 다수 이월(상한 여유는 있었으나 A-1 우선 처리). ko-tunexx 발매일 다음 회차 재확인 필요
**리서처 참고(추가·수정 안 함)**: 점검 범위(±60일)에서 신규 미등록 공연 발견 사항 없음

---

## 2026-09-14 · ja

ja 첫 회차. 로테이션상 ja가 미점검(가장 오래됨)이라 선택. 대상 창: 2026-07-16 ~ 2026-11-13(오늘 ±60일), 창 안 항목 133건(끝난 것 60 / 예정 73). 코드는 손대지 않았고 `data/concerts.ja.json`만 수정. push 전 `validate-data.mjs` 통과.

**트랙 A (졸업 처리) — 17건** (상한 20 이내)
- A-1 끝난 공연에 남은 예매 필드 정리 9건 — `general_sale_url`/`presale_url`/`*_datetime` 등 "아직 판매 중" 모양으로 남은 값을 `presale`/`general_sale=false` + 관련 URL·datetime을 null 처리(§7 표대로). `music_release`는 제외:
  ja-fukuyama-masaharu-dome-2026-20260805, ja-david-byrne-ss-extra-20260813, ja-holly-humberstone-ss-extra-20260813,
  ja-summer-sonic-2026-20260814, ja-jon-spencer-ss-extra-20260818, ja-super-junior-ryeowook-konpeki-20260819,
  ja-boynextdoor-knock-on-vol2-japan-20260821, ja-flo-japan-tour-2026-20260831, ja-journey-2026-20260901
- A-2 예매 플래그 잔존: 위 9건에 포함(개별 추가 없음)
- A-3 (release_date_approx 미해제): 끝난 항목 중 approx=true 없음 — 처리 없음
- A-4 description 시제 교정 12건(있는 문장의 시제만 과거형으로, 새 사실 추가 없음) — 위 A-1과 겹치는 4건(fukuyama·summer-sonic·super-junior-ryeowook·journey) + 신규 8건:
  ja-augusta-camp-2026-20260815, ja-jaurim-life-tokyo-2026-20260829, ja-treasure-the-stage-20260905,
  ja-number-i-numbers-ur26-20260825, ja-ko1keyz-1st-fanmeeting-20260821, ja-abc-z-connection-vol2-20260819,
  ja-spellbound-bbs-kabukicho-20260824, ja-sakanaction-toumei-osakajo-hall-20260912
  (개최/출연/발매/예매 개시 등 "開催される·行われる·出演する·スタートする·期待が高まっている" → 과거형·상태 정리)
- 트랙 A 손댄 실 항목 수: 17건(A-1 9 + A-4 신규 8). 오탐으로 판단해 미수정: ja-creator-dream-fes-2026-20260730(이미 과거형), CTA 3건(이미 "行った/行われた" 과거 서술)

**트랙 B (임박 점검) — 8건 확인** (공연일 가까운 순, last_updated 없는 항목 우선). 8건 모두 공식·예매처·언론 소스로 정상 진행 확인, 취소·연기·approx 임박 없음. 전부 last_updated=2026-09-14로 갱신:
- ja-epica-japan-tour-2026-20260914 — LIQUIDROOM 공식 페이지 "〈振替公演〉"로 9/14 개최 확인(2025-12 공연이 건강상 이유로 이 날짜로 연기된 것, 추가 취소 아님)
- ja-crazy-ken-band-nani-20260916 — 앨범 『何？』 9/16 발매 진행(유니버설/HMV)
- ja-jisung-our-scene-20260918 — 9/18 東京 せたがやイーグレットホール 정상(チケプラ/ぴあ)
- ja-the-weeknd-2026-20260919 — ベルーナドーム 9/19·20 정상, 9/20 SOLD OUT(유니버설/ライブネーション)
- ja-ultra-japan-2026-20260919 — お台場 9/19·20 개최, 일자별 라인업 발표 확인(공식/L-tike)
- ja-freckles-japan-tour-2026-20260923 — 青山月見ル君想フ 9/23 정상(Peatix/BIG ROMANTIC)
- ja-number-i-rebon-20260923 — 싱글 9/23 발매 진행(타워/HMV/Mikiki)
- ja-abc-z-the-way-of-love-20260930 — 앨범 9/30 발매 진행(CDJournal/음악나탈리), 선행 배급 「三茶のシスター」 9/23
- B-2(approx 임박): 해당 없음(8건 모두 approx=false)
- B-3 링크: 예매·공식 링크는 provenance/로봇 차단으로 일부 직접 열지 못했으나 검색으로 판매·개최 진행 확인 → 재확인 원칙대로 죽은 링크로 단정하지 않고 유지

**남은 것**: 트랙 A 상한 여유 있었음(17/20). A-4 music_release 시제(ja-befirst-bruce-wayne·ja-boynextdoor-boom-boom-boom·ja-ikimonogakari-sayonara-lara·ja-ryokushaka-atamago 등 "リリースする"류)는 우선순위가 낮아 다음 회차로 이월.
**리서처 참고(추가·수정 안 함)**:
- ja-rock-in-japan-2026-20260912: 실제 5일 개최(9/12·13·19·20·21, 총 115組)인데 `festival_days`가 비어 있어 코드가 release_date(9/12) 기준으로 **이미 종료**로 판단 → 9/19~21 잔여 일정이 "예정"에서 빠지고 offers/sitemap도 종료 처리됨. 일자별 라인업 채우기는 리서처 몫이라 손대지 않음(감사자가 라인업을 지어내는 건 금지). **시급한 데이터 정합성 이슈로 플래그**.
- ja-ultra-japan-2026-20260919: 2일 개최(9/19·20)인데 `festival_days: null`. 아직 예정이라 종료 오판은 없으나 9/20 이후 같은 문제 발생 소지 — 라인업 등록 권장.

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
