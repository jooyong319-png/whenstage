# CHAT.md — 리서처 진행 로그 (최신이 위, append-only)

이 파일은 KO/EN/JA 3개 리서처 Claude가 공통으로 append하는 로그다. 오래된 로그도 삭제하지 말 것.

## [2026-07-23 20:52] [JA 뉴스]
뉴스 작성 완료 (일본 국내 공연 뉴스)
- 신규 기사 3건: 吉井和哉 12년만의 8th 앨범(12/9)＋전국홀투어 2027(FC선행 7/22~), Silica Gel 3rd 앨범 「Ballad of You」(8/20)＋도쿄 단독공연(11/21, 오피셜선행 접수중), あいみょん 10주년 부도칸 공연(11/30·12/1)＋전국아레나투어 AIMYON TOUR 2027(2/6~ 14도시 36공연)
- 콘서트 링크 연결 0건 / 링크 없음 3건 (3건 모두 concerts.ja.json 미등재 아티스트)
- 스킵: Number_i REBON 수록내용(7/22)=기존 기사와 동일 사안 중복, 桑田佳祐 추가공연=발표 6/25로 48시간 밖, QOTSA 내일공연=발표 7/15로 48시간 밖(리드로만 인계), miwa 신곡=발표 7/17로 48시간 밖
- leads.ja.jsonl 4건 append: AIMYON TOUR 2027, 吉井和哉 TOUR 2027, Silica Gel Asia Tour in Tokyo, QUEENS OF THE STONE AGE 내일공연 — 모두 concerts.ja.json 미등재 등재 후보

## [2026-07-23 20:30] [EN 뉴스]
뉴스 작성 완료 (영어권/글로벌 시장 공연 뉴스)
- 신규 기사 3건: Victoria Monét 신보 'Frequency of Love' 발표(+싱글 'Reach Out'), Bryan Adams 멜버른 2회차 추가(매진→프리세일 7/24), ZZ Top 가을 2개 공연 10월로 일정 변경(깁번스 Crossroads 참가)
- 콘서트 링크 연결 0건 / 링크 없음 3건 (3건 모두 concerts.en.json 미등재 아티스트)
- 스킵: Bob Dylan UK 투어 7/22 일반예매(기존 기사와 중복), Djo 여름투어(3월 발표건이라 48시간 밖), Yungblud UK 추가공연(2025-10 기사), Silvana Estrada·Rebecca Black(기존 기사 중복)
- leads.en.jsonl 4건 append: Bryan Adams(Roll With The Punches 투어), ZZ Top(The Big One! 투어), Victoria Monét(신보 music_release), Djo(2026 여름투어) — 모두 concerts.en.json 미등재 등재 후보

## [2026-07-23 20:10] [KO 뉴스]
뉴스 작성 완료 (한국 국내 공연 뉴스)
- 신규 기사 0건 — 최근 48시간(7/21~7/23) 내 신규·검증 가능한 국내 공연 공지를 발견하지 못함
- 스킵 사유: 강한 신선 소식(전유진 팬콘·허남준 팬미팅·이즈나 단독콘서트·레드벨벳 티저·키스오브라이프 컴백)은 이미 기존 기사로 발행 완료 → 중복 방지. 그 외 검색 결과는 집계성/과거 소식(빅뱅 고양 7/13 추가오픈, 박지훈 RE:FLECT 5월 공연 등 48시간 밖)뿐이라 기사화 보류
- 콘서트 링크 연결 0건 / 링크 없음 0건
- 리서처 인계(leads): 신규 검증 건 없음 → leads.ko.jsonl 미변경

## [2026-07-23 19:45] [JA 리서처]
리서치 완료 (일본 국내 공연)
- 콘서트/来日 1→1, 발매 1→1, 페스티벌 0→0, 팬미팅 1→1 (후보→통과)
- 신규 3개 / 갱신 0개 (삭제 없음·전량 보존)
- 티켓팅 진행중 0개 (추가 +0 / 해제 -0): 신규 3건 모두 현재 판매/선행 진행 구간 아님(桑田 추가공연은 秋頃 발표 예정, Number_i 팬미팅은 iLYs 회원한정 접수)
- description 보강 0개 (기존 21건 모두 120자 이상 확인, 보강 불필요)
- 총 등록 24개
- 뉴스 인계 처리 2건 중 2건 등재: ①Number_i『REBON / BUGS LIFE / DIGITAL GIRL』(9/23 발매, 아틀란틱 이적 제1탄 트리플A사이드 — Mikiki/TOWER/HMV/음악나탈리/Billboard JAPAN/ORICON 다수 독립 일치) ②桑田佳祐「夏祭りツアー 2026」追加公演(12/16~31 계7공연, 공식사이트+ORICON+음악나탈리+USEN 일치, 정식 첫날 12/16으로 등재)
- 자체 발굴 1건 등재: Number_i「Numbers Ur'26」팬미팅 도쿄공연(TOYOTA ARENA TOKYO 8/25~27, 음악나탈리+TOBE공식 일치). 대상 이벤트는 오사카(7/21~22, 이미 종료)+도쿄 2레그 구성이며, 아직 남은 도쿄 레그를 release_date=8/25로 등재(오사카 종료분은 description에 명기)
- 이미지: 신규 3건 모두 image_url=null (Number_i 위키 인포박스 이미지 없음, ぴあ/公式 JS렌더링으로 og:image 미획득, 桑田 공식 og는 사이트 공통 ogp.jpg뿐 — 억지 채우기 대신 정직하게 null, 다음 사이클 교체 대상)

[검증 탈락]
- 없음

## [2026-07-23 19:28] [EN 리서처]
리서치 완료 (영어권/글로벌 시장 공연)
- 콘서트/투어 2→2, 발매 0→0, 페스티벌 0→0, 팬미팅 0→0 (후보→통과)
- 신규 2개 / 갱신 0개 (삭제 없음·전량 보존)
- 티켓팅 진행중 2개 (추가 +2 / 해제 -0): Jon Pardi 일반예매 7/24 10:00 (현지)·프리세일 7/21 종료, Lupe Fiasco & Gym Class Heroes 일반예매 7/17~ 진행중
- description 보강 0개
- 총 등록 21개
- 뉴스 인계 처리 2건 중 0건 등재 (Rebecca Black·Silvana Estrada 리드 2건 모두 이미 concerts.en.json에 등재돼 있어 자동 건너뜀 — 직전 EN 사이클에서 등재 완료)
- 자체 발굴 2건 등재: ①Jon Pardi 'Gamblin' Man Tour' (9/17 리치먼드 Allianz Amphitheater 개막~11/14, Pollstar 7/20 게재 + Ticketmaster 다수 이벤트 페이지 일치) ②Lupe Fiasco & Gym Class Heroes 'Back To Basics Tour' (9/10 클리블랜드 Jacobs Pavilion 개막, Consequence 7/16 + Ticketmaster/Complex/iHeart 일치, B.o.B 게스트)
- 이미지: 신규 2건 모두 image_url=null (Songkick 가짜 placeholder 리스크 회피·Jon Pardi 위키 문서는 아래 사유로 미사용 — 다음 사이클 교체 대상)

[검증 탈락]
- 없음

[주의]
- Jon Pardi 영어 위키백과 문서에 "2026-05-01 사망(피격)"이라는 출처 없는 서술이 있으나, 7/20 Pollstar 투어 발표·Ticketmaster 실판매 페이지(7/24 온세일)와 정면 배치되는 명백한 위키 반달로 판단. 투어 자체는 Pollstar+Ticketmaster 2개 독립 공식 출처로 검증되어 등재. 위키 인포박스 이미지는 신뢰 불가로 미사용(null 처리).
## [2026-07-23 19:10] [KO 리서처]
리서치 완료 (한국 국내 공연)
- 콘서트/내한 2→2, 음원발매 0→0, 페스티벌 1→0, 팬미팅 0→0 (후보→통과)
- 신규 2개 / 갱신 0개 (삭제 없음·전량 보존)
- 티켓팅 진행중 1개 (추가 +1 / 해제 -0): 임영웅 IM HERO THE STADIUM 2 일반예매 진행중(7/16 20:00 오픈)
- description 보강 0개
- 총 등록 25개
- 뉴스 인계 처리 1건 중 0건 등재 (전유진 'TWENTY-ONE'은 이미 concerts.ko.json에 등재돼 있어 자동 건너뜀)
- 자체 발굴 2건 등재: ①2026 임영웅 콘서트 [IM HERO - THE STADIUM 2] (9/4~6 고양종합운동장 주경기장, 인터파크 공식 오픈공지+다수 매체 일치) ②Vaundy ASIA ARENA TOUR 2026 "HORO" IN SEOUL (9/19~20 인천 인스파이어 아레나, 인터파크 공식+스포츠경향·뉴스1 일치, 전석 매진)
- 이미지: 신규 2건 모두 위키미디어 커먼즈 실사 이미지 검증 후 등재(임영웅 1872×2762, 바운디 515×670 — 크기·실사 확인)

[검증 탈락]
- 워터밤 서울 2026: 출처 간 날짜·장소 불일치(7/24~26 킨텍스 vs 7/25~8/2 잠실)로 정기개최 페스티벌 함정 리스크 → 확정 보류, 다음 사이클 재검증


## [2026-07-23 14:48] [EN 리서처]
리서치 완료 (영어권/글로벌 시장 공연)
- 콘서트/투어 4→4, 발매 0→0, 페스티벌 0→0, 팬미팅 0→0 (후보→통과)
- 신규 4개 / 갱신 0개 (삭제 없음·전량 보존)
- 티켓팅 진행중 4개 (추가 +4 / 해제 -0): Rebecca Black 일반예매 7/24 10:00 EDT, Silvana Estrada 일반예매 7/24 10:00 PDT, Lucinda Williams 일반예매 진행중(7/17~), Michelle Branch 일반예매 진행중(일부 매진)
- description 보강 0개
- 총 등록 19개
- 뉴스 인계 처리 2건 중 2건 등재 (Rebecca Black·Silvana Estrada — 각 독립출처 2건 이상 일치, 기사 게재일 2026-07 확인)
- 추가 자체 발굴 2건 등재 (Lucinda Williams·Michelle Branch — Pollstar 등 독립출처 2건 이상, 7월 발표 확인)
- 이미지: 신규 4건 모두 image_url=null (위키미디어 커먼즈 인포박스 이미지 검증 실패 — 가짜 placeholder/비자유 이미지 리스크 회피 위해 정직하게 null 처리, 다음 사이클 보강 대상)

[검증 탈락]
- 없음

## [2026-07-23 14:45] [KO 리서처]
리서치 완료 (한국 국내 공연)
- 콘서트/내한 2→2, 음원발매 0→0, 페스티벌 0→0, 팬미팅 0→0 (후보→통과)
- 신규 2개 / 갱신 0개 (삭제 없음·전량 보존)
- 티켓팅 진행중 2개 (추가 +2 / 해제 -0): 전유진 팬콘서트 일반예매 7/23 19:00, 성시경 콘서트 일반예매 7/24 20:00
- description 보강 0개
- 총 등록 23개
- 뉴스 인계 처리 1건 중 1건 등재 (전유진 2nd Fan Concert 'TWENTY-ONE' — 독립출처 3건 일치, 기사 게재일 2026-07-23 확인)
- 이미지 교체 대상 2건: 신규 항목 모두 image_url=null (예매처 상세 페이지 JS 렌더링으로 og:image 미확보 — 다음 사이클 보강)

[검증 탈락]
- 없음

## [2026-07-23 14:32] [JA 뉴스]
뉴스 작성 완료 (일본 국내 공연 뉴스)
- 신규 기사 2건: 木村拓哉「BLACK DENIM」先行配信＆MV公開, Number_i 4thシングル『REBON / BUGS LIFE / DIGITAL GIRL』収録内容発表
- 콘서트 링크 연결 1건(木村拓哉『Checkpoint』→/ja/concert/ja-kimura-takuya-checkpoint-20260812) / 링크 없음 1건(Number_i 미등재)
- 리서처 인계(leads) 2건 추가: Number_i 신규 싱글(9/23 발매), 桑田佳祐 夏祭りツアー 2026 追加公演(12월 7공연) → data/leads.ja.jsonl
- 스킵(48시간 초과·행동유발 아님): JOURNEY 東京単独公演 一般発売(7/25 오픈이나 스케줄 자체는 7/3 발표分이라 48h 밖·이미 concerts.ja.json 등재), Official髭男dism/DREAMS COME TRUE(영상작품·드라마 주제가로 티켓 행동유발 아님), 桑田佳祐 追加公演 기사(6/25 게재로 48h 초과 → 기사화 대신 leads로만 인계), WANDS 활동종료(공지형 아님)

## [2026-07-23 14:21] [EN 뉴스]
뉴스 작성 완료 (영어권/글로벌 시장 공연 뉴스)
- 신규 기사 2건: Rebecca Black's 'Exhibitionism' Tour Tickets Hit On-Sale This Week, Silvana Estrada's North American Tour Tickets Go On Sale
- 콘서트 링크 연결 0건 / 링크 없음 2건 (concerts.en.json에 매칭 공연 없음)
- 리서처 인계(leads) 2건 추가: Rebecca Black Exhibitionism Tour, Silvana Estrada North American Tour 2026 → data/leads.en.jsonl
- 스킵(48시간 초과·중복·소스 불충분): J. Cole The Fall-Off(온세일 2월 완료), Daniel Caesar Son of Spergy(온세일 4월 완료), CORTIS Put Your Phone Down(온세일 6월 완료), Mike D/Jon Pardi(전 사이클 처리분 중복), Lewis Capaldi·Olivia Dean 추가공연(발표 시점 48h 초과)
- 출처: Pollstar News (Rebecca Black 7/20 게재·7/22~24 온세일, Silvana Estrada 7/21 게재·7/22 프리세일 개시 — 둘 다 48h 내 팬 행동유발 온세일 기준 충족)

## [2026-07-23 14:16] [KO 뉴스]
뉴스 작성 완료 (한국 국내 공연 뉴스)
- 신규 기사 1건: 전유진, 두 번째 단독 팬 콘서트 'TWENTY-ONE'…오늘 오후 7시 티켓 오픈
- 콘서트 링크 연결 0건 / 링크 없음 1건 (concerts.ko.json에 전유진 미등재)
- 리서처 인계(leads) 1건 추가: 전유진 팬 콘서트(8/29~30 우리금융아트홀) → data/leads.ko.jsonl
- 스킵(48시간 초과·소스 불충분): 라이즈 3주년 팬미팅(발표 7/20 16:47로 48h 초과·이미 concerts.ko.json 등재), 터치드 'ATTRACTION'(기사 2025-06-24 게재로 1년 초과), OURBIRTHDAY·효린(7/22 발매 완료 후기성·공지형 아님), 김재중 THE WAVE(7/21 오픈, 기존 사이클 경계), 워터밤·2PM 등 기존 처리분
- 전유진 건은 국제뉴스 2026-07-23 00:06 게재(48h 이내)·7/23 19시 NOL 티켓 오픈되는 행동유발 공지로 확정

## [2026-07-23 13:10] [EN 뉴스]
뉴스 작성 완료 (영어권/글로벌 시장 공연 뉴스)
- 신규 기사 3건: Doja Cat Adds Latto to North American 'Tour Ma Vie' Dates, Tinashe Sets Three 'Popstar' Album Shows in Chicago, NYC and LA, Don Was and The Pan-Detroit Ensemble Confirm Fall Tour Dates
- 콘서트 링크 연결 0건 / 링크 없음 3건 (concerts.en.json에 매칭 공연 없음)
- 스킵(중복·48시간 초과·소스 불충분): Bob Dylan/Robbie Williams/Trivium/Mike D/Jon Pardi(전일 처리분과 중복), The Weeknd 웸블리 추가 공연(기사 게재일 2025-09-11로 48시간 초과), Rolling Stones 2026 투어설(미확정 루머, 신뢰 소스 부재)
- 출처: Pollstar News (2026-07-22 게재 3건 모두 확인)

## [2026-07-23 12:55] [KO 뉴스]
뉴스 작성 완료 (한국 국내 공연 뉴스)
- 신규 기사 1건: 허남준, 데뷔 7년 만에 첫 단독 팬미팅…오늘 밤 8시 멤버십 선예매
- 콘서트 링크 연결 0건 / 링크 없음 1건 (concerts.ko.json에 매칭 공연 없음, 배우 팬미팅으로 콘서트 데이터 미등록)
- 스킵(중복·48시간 초과·소스 불충분): 그루브뮤직페스티벌·B1A4 15주년 콘서트(티켓오픈 6/29, 초과)·OURBIRTHDAY 데뷔싱글·효린 미니4집(발매 완료 후기성, 공지형 아님)·워터밤 등 기존 처리분
- 허남준 팬미팅 확정 보도는 7/13이나, 실제 행동유발 시점인 멤버십 선예매 오픈일(7/23 오후 8시)을 기준으로 작성. 소스: 스타뉴스

## [2026-07-23 11:40] [JA 뉴스]
뉴스 작성 완료 (일본 국내 공연 뉴스)
- 신규 기사 1건: JAURIM来日公演、優先入場&交流会付きアップグレード先行受付開始
- 콘서트 링크 연결 1건(JAURIM ja-jaurim-life-tokyo-2026-20260829) / 링크 없음 0건
- 스킵 다수(48시간 초과·소스 불충분): SixTONES 돔투어(추첨결과 7/24 예정, 미도래)·TREASURE(생일 축하 게시물뿐, 뉴스성 없음)·BABYMONSTER(7/22 팝업스토어 상품추가는 카테고리 미해당)·ULTRA JAPAN 2nd라인업(7/10 발표, 48h 초과)·THIS FES'26(전체라인업 7/10 발표, 7/21·22 발표분은 라디오 추첨 홍보뿐이라 소스 신뢰도/뉴스가치 부족)·RIIZE·Journey·Charlie Puth·Post Malone·Kimura Takuya 등 확인했으나 전부 48시간 이내 신규 공지 없음 확인
- JAURIM 건은 ぴあ 공식 PR TIMES 보도자료(2026-07-22 15:00 게재)+korepo.com 기사로 교차 확인, 7/23 18:00 추첨接受 시작(행동유발 공지) 확정

## [2026-07-22 10:32] [EN 뉴스]
뉴스 작성 완료 (영어권/글로벌 시장 공연 뉴스)
- 신규 기사 3건: Trivium Announce Fall 2026 North American Tour With In Flames, Mike D 5D Add 20 International Tour Dates for Fall 2026, Jon Pardi Announces 2026 'Gamblin' Man Tour'
- 콘서트 링크 연결 0건 / 링크 없음 3건 (concerts.en.json에 매칭 공연 없음)
- 스킵(중복·48시간 초과): Bob Dylan·Robbie Williams(오늘 10시 사이클 기존 처리분, 중복 회피), Garth Brooks(7/7)·Beabadoobee(6/24)·Angus & Julia Stone(7/9) 등 48시간 초과 건
- 3건 모두 7/21 발표(48시간 이내)·전부 7/24 일반예매 오픈되는 행동유발 온세일 공지. 출처: Blabbermouth 1건, uDiscover Music 2건

## [2026-07-22 10:03] [KO 뉴스]
뉴스 작성 완료 (한국 국내 공연 뉴스)
- 신규 기사 2건: '완전체' 레드벨벳 '벨벳 서머' 티저 이미지 공개, 키스오브라이프 8월 4일 'SWEAT' 컴백 스케줄러 공개
- 콘서트 링크 연결 2건(레드벨벳 ko-redvelvet-velvet-summer-20260803, 키스오브라이프 ko-kissoflife-sweat-20260804) / 링크 없음 0건
- 스킵: 스트레이 키즈 서울 매진(7/2 보도로 48시간 초과)·워터밤/BIGBANG 등 기존 사이클 처리분·해외전용 소식 제외
- 두 건 모두 7/21 발표 컴백 티저/스케줄러(48시간 이내), 기존 기사와 중복 없음

## [2026-07-22 09:50] [JA 리서처]
리서치 완료 (일본 국내 공연)
- 콘서트/来日 1→1, 발매 2→2, 페스티벌 0→0, 팬미팅 0→0 (후보→통과)
- 신규 3개 / 갱신 0개 (삭제 없음·기존 18개 전량 보존)
- 티켓팅 진행중: 신규 +1 (THE CRIBS 一般発売 8/8 10:00 eplus 예정 + 오피셜先行(抽選) 7/27까지). 기존 티켓팅 항목(EPICA·SUPER JUNIOR-RYEOWOOK·福山雅治·FLO·JOURNEY·The Weeknd·チソン팬미팅)은 이번 사이클 재확인 결과 최이른 공연이 8/5(福山)로 전부 미도래 → 값 유지, 해제 없음
- description 보강: 신규 3개 전부 일본어 233~259자
- image_url: 신규 3개 전부 null. THE CRIBS는 skream 기사 og:image가 와이드 아티스트 사진이라 "정사각 근접" 기준 미충족 판단, 발매 2건은 확정 정사각 커버 URL 미확보 → 교체 대상으로 이월(ぴあ/イープラス 상세·공식 커버 재확보 시 반영)
- 총 등록 21개

[신규 항목]
- THE CRIBS「Selling A Vibe」来日公演 (concert_tour, 10/2 東京 duo MUSIC EXCHANGE 19:00): Skream!(2026.07.14 11:25)+Billboard JAPAN+Guitar Magazine WEB+CDJournal 4개 매체 2026년 기사 일치. 2026년 1월 발매 신작 『Selling A Vibe』 투어. 一般発売 8/8 10:00 eplus/ぴあ/ローチケ, 오피셜先行(抽選) ~7/27 확정. ⚠️정기 来日 밴드 연도혼동 함정 점검: 소스 전부 2026-07 게시·본문 2026년 명기로 재확인
- milet『Made of Glass』 (music_release, 8/19): 소니뮤직 공식(sonymusic.co.jp/584236)+Tower Records+lisani+Sony Music Artists 일치. 약 3년만 4th 오리지널 앨범, 「葬送のフリーレン」ED 등 타이업곡 다수+신곡, 초회한정반에 라이브 영상 수록
- いきものがかり「さよならララ」 (music_release, 8/26): 공식(ikimonogakari.com/20260417-1)+Real Sound+Billboard JAPAN+lisani 일치. 오리지널 TV애니메이션『さよならララ』(7/5 방영개시) OP테마, 7/15 선행배신, CD 8/26. 초회한정반/통상반 2형태

[검증 탈락 / 보류]
- Janet Jackson Japan 2026(6월 神戸·横浜·名古屋): 검증은 되나 오늘(7/22) 기준 이미 종료 공연 → 과거 아카이브 추가는 우선순위 낮아 이번 사이클도 보류(이전 사이클과 동일 판단)
- SixTONES『Dance Forever/マイオンリー』(9/9): 이미 등록된 기존 항목이라 신규 아님(중복 방지 확인)
- J-POP 발매 후보군(King Gnu·Ado·YOASOBI·RADWIMPS 등 다수): Skream! 릴리스 리스트에서 후보로 포착됐으나 이번 사이클은 독립 2출처+상세 확정된 milet·いきものがかり 우선 처리, 나머지는 다음 사이클 개별 확정 대상으로 이월


## [2026-07-22 09:35] [EN 리서처]
리서치 완료 (영어권/글로벌 시장 공연)
- 콘서트/투어 2→2, 발매 3→2, 페스티벌 0→0, 팬미팅 0→0 (후보→통과)
- 신규 4개 / 갱신 0개 (삭제 없음·기존 11개 전량 보존)
- 티켓팅 진행중: 신규 +2 (Avenged Sevenfold×Good Charlotte 일반예매 2025-12-12 오픈·판매지속, Ringo Starr 일반예매 2026-07-10 10:00 ET Ticketmaster 오픈). 기존 general_sale 항목(Foo Fighters·MCR·ENHYPEN·Monsta X·Phoebe Bridgers·Charli xcx·Lollapalooza·ACL)은 이전 사이클(11:20) 재확인분·공연 미도래로 값 유지, 이번 사이클 변동 없음
- description 보강: 신규 4개 전부 영어 61~73단어(권장 50~80 내)
- image_url: 신규 4개 전부 null. 콘서트 2건은 티켓 플랫폼 og:image가 대부분 와이드 배너라 "정사각형 근접" 기준 미충족 판단, 발매 2건은 확정 정사각 커버 URL 미확보 → 교체 대상으로 다음 사이클 이월(아티스트 공식 유튜브 아바타/Wikimedia 정사각 이미지 재확보 시 반영)
- 총 등록 15개

[신규 항목 — 콘서트/투어]
- Avenged Sevenfold & Good Charlotte 북미 공동헤드라인 투어 - Belmont Park, NY (8/10 UBS Arena): Loudwire+Consequence+Altpress+Revolver 동일 16개 일정표 일치(7/25 Ridgedale 개막~8/27 Phoenix 폐막). 일반예매 2025-12-12 10AM local, 양 밴드 공식 사이트. 정확한 공연 시작 시각 미확정으로 release_time null
- Ringo Starr & His All Starr Band 가을 투어 - Forest Hills, NY (10/1 Forest Hills Stadium): Pollstar(2026-07-06)+BroadwayWorld+Jambase+Consequence(2026/07)+Yahoo/AOL 일치. 이번 달(7/6) 발표된 최신 투어, 10일정(9/24 Easton~10/7 Albany). 일반예매 2026-07-10 10AM local ET Ticketmaster 확정

[신규 항목 — 발매]
- Brandon Flowers 'Thrasher' (8/21 Island Records): Billboard+NME+Universal Music Canada+Radio X+Deseret 일치. 킬러스 프론트맨의 10년 만의 3번째 솔로, 내슈빌 RCA Studio A 녹음, 컨트리 지향. 발표일 2026-06-23
- Kasabian 'ACT III' (9/4 발매): Wikipedia+Spotify+Apple Music+kasabianarchive 일치. 원래 7/17 예정이었으나 최종 보정 위해 9/4로 연기. 9번째 정규, Serge Pizzorno 리드보컬

[검증 탈락 / 보류]
- Lana Del Rey 'Stove': 2026-01-30 발매(imdb/wikipedia/x)로 확인 — 현재 기준 과거(최근 6개월 창 경계 밖)+발매일 표기 상충(early 2026 vs 1/30)으로 신규 후보 부적합, 제외
- AC/DC 2026 북미투어: 유효하나 이미 개막(7/11)·티켓 온세일 2025-11-07로 과거, 우선순위 낮아 이번 사이클 보류(다음 사이클 대표 스탑 검토)
- Rod Wave 'Don't Look Down'(이전 사이클 이월): 2차 독립 출처 재확인 미완으로 계속 보류

## [2026-07-22 09:30] [KO 리서처]
리서치 완료 (한국 국내 공연) — 이전 사이클(09:15) 이월/보류 후보 확정 중심
- 콘서트/내한 3→3, 음원발매 1→1, 페스티벌 1→1, 팬미팅 0→0 (후보→통과)
- 신규 5개 / 갱신 0개 (삭제 없음·기존 16개 전량 보존)
- 티켓팅 진행중 3개(신규 +3): 싸이 흠뻑쇼(일반예매 6/4 오픈·전국 잔여석 판매중), 빅뱅 고양(일반예매 6/25 오픈·잔여석 앱 판매중), 히게단 서울(일반예매 4/16 NOL 오픈). 선예매는 모두 종료 시점이라 presale=false로 이력만 보존
- description 보강: 신규 5개 전부 한국어 212~243자
- image_url: 빅뱅=쿠팡플레이 공식 og:image(preview-image.jpg, 비만료 확정) 확보. 나머지 4개는 인터파크(NOL) JS 렌더링으로 og:image 추출 실패 + 확신 이미지 회피로 null(교체 대상)
- 총 등록 21개

[신규 항목 — 콘서트]
- 싸이 흠뻑쇼 SUMMER SWAG 2026(전국 9개 도시 14회, 남은 일정 원주7/25·수원8/1~2·광주8/8·부산8/15~16·대전8/22~23): 위키트리+트립닷컴+나무위키+타임스프레드 일치. 대표 날짜는 다음 대규모 주말인 수원 8/1로 설정, 잔여 전 일정은 description에 명기
- BIGBANG 2026 WORLD TOUR IN GOYANG(8/21~23 고양종합운동장, 21·22일 19:30/23일 19:00): 쿠팡플레이 공식 프로모션 페이지(meta 2026년 8월·git-tag prod-20260721)+타임스프레드+머니매거진 일치. 데뷔 20주년 투어 개막, 국내 예매 쿠팡플레이 앱 단독
- 오피셜히게단디즘 아시아 투어 2026 in SEOUL(8/8~9 KSPO DOME 19:00): 뉴시스(NISX20260331)+아트앤컬처+톱스타뉴스+인터파크 공지(13341) 일치. 2년 만의 내한, 일반예매 4/16 NOL 티켓

[신규 항목 — 음원발매]
- 앤팀(&TEAM) 한국 미니 2집 'Mark on Me'(9/8 18:00 발매): Soompi+Kpop Fandom+공식 트위터(@andTEAMofficial) 일치. 하이브 소속 앤팀의 첫 한국어 정규 미니앨범, 예약판매 7/6 시작

[신규 항목 — 페스티벌]
- 그랜드 민트 페스티벌 2026(10/17~18 올림픽공원, 1차 18팀): 스포츠경향(202607161910007)+일간스포츠 일치. 10/18 라인업 확정분만 festival_days 기재, 티켓 오픈일 미확정으로 예매 필드 미기재

[검증 탈락 / 보류]
- 없음(이번 사이클은 이전에 시간 부족으로 이월된 확정성 높은 후보 3건 + 신규 확정 2건 처리)
- (참고) 기존 티켓팅 항목(펜타포트·잭 화이트·김종국 앵콜·라이즈 팬미팅·에스파)은 이전 사이클 09:15에 재확인 완료, 이번 사이클 변동 없음으로 유지

## [2026-07-22 11:20] [EN 리서처]
리서치 완료 (영어권/글로벌 시장 공연)
- 콘서트/투어 4→4, 발매 4→1, 페스티벌 1→1, 팬미팅 0→0 (후보→통과)
- 신규 6개 / 갱신 0개 (삭제 없음·기존 5개 전량 보존)
- 티켓팅 진행중 5개(신규 +5): ENHYPEN Oakland(general_sale, AXS), Monsta X NY(general_sale, Ticketmaster), Charli xcx Philadelphia(presale 6/12 09:00 ET + general_sale 6/12 13:00 ET), Phoebe Bridgers Indianapolis(general_sale 6/12 10:00 ET), Lollapalooza(general_sale, 4일권 대기·1일권 판매중)
- 기존 티켓팅 항목 재확인(변경 없음): Foo Fighters Detroit(Ticketmaster/Ford Field 공식 재조회, 여전히 general_sale 유효), My Chemical Romance NY(Ticketmaster/livenation 재조회, 여전히 유효) — 둘 다 공연 미도래·판매 지속으로 기존 값 유지
- description 보강: 신규 6개 전부 영어 75~85단어(권장 50~80 상단 근접~소폭 초과)
- image_url: 티켓 플랫폼/공식 공연장 페이지에서 og:image 후보(MSG 포스터 1024x576, Oakland Arena 820x540, Xfinity Mobile Arena 760x460, Gainbridge Fieldhouse 배너 1180x500)를 모두 확보했으나, 전부 와이드 비율이라 "정사각형에 가까운" 기준 미충족 판단 → 6개 전부 null 유지(교체 대상으로 위 URL 기록, 정사각형 대체 이미지 확보 시 다음 사이클 반영)
- 총 등록 11개

[신규 항목]
- ENHYPEN: Blood Saga World Tour - Oakland (concert_tour, 7/28~29 Oakland Arena, 7:30PM PDT): Oakland Arena 공식(theoaklandarena.com) + AXS + Songkick + Billboard 다수 일치. 7인 완전체 4번째 월드투어, 2025 WALK THE LINE 전석 매진 후속. 4/22~23 ENGENE 선행, 4/24 일반판매
- Monsta X: THE X : NEXUS World Tour - New York (concert_tour, 10/6 MSG Infosys Theater, 8PM ET): MSG 공식(msg.com) + Billboard + Live Nation Newsroom + Ticketmaster 일치. 서울 KSPO DOME 3일 매진 후 아시아·중남미 거쳐 북미 10개 도시 투어
- Charli xcx: Music, Fashion, Film Tour - Philadelphia (concert_tour, 9/11 Xfinity Mobile Arena, 8PM ET): Xfinity Mobile Arena 공식 + Billboard + PhillyVoice + NBC10 + Jambase 일치. 신보 발매 지원 투어 개막 공연, underscores 서포트
- Phoebe Bridgers: The Lost Tour - Indianapolis (concert_tour, 9/14~15 Gainbridge Fieldhouse, 7:30PM ET): Gainbridge Fieldhouse 공식 + Rolling Stone + Variety + WRTV 일치. 폰프리(욘더 파우치) 투어, 3집 Lost Weekend 지원, Alex G 오프닝
- Lollapalooza 2026 (festival, 7/30~8/2 Grant Park Chicago): lollapalooza.com 공식 + CBS Chicago + Time Out Chicago 일치. 데이별 헤드라이너(목 Lorde·John Summit / 금 Charli xcx·Smashing Pumpkins / 토 Olivia Dean·JENNIE(블랙핑크) / 일 Tate McRae·the xx) 확정 → festival_days 기재
- Charli xcx - Music, Fashion, Film (music_release, 7/24 발매): Wikipedia + Billboard + RA.co 일치. 7집, Atlantic Records, 선공개곡 'Rock Music'·'SS26'·'Wink Wink', 커버는 존 케일·마크 제이콥스·마틴 스코세이지

[검증 탈락 / 보류]
- Brandon Flowers 'Thrasher'(8/21 솔로 앨범): Billboard·Universal Music Canada·Radio X 등 확인했으나 대상이 영어권 팬미팅/투어 아닌 솔로 앨범이라 발매 확정성은 충분하나 이번 사이클엔 콘서트/투어·페스티벌 위주로 우선순위 배정 후 시간 관계상 보류 → 다음 사이클 후보
- Rod Wave 'Don't Look Down'(8/28): Billboard 단일 계열 출처만 확인, 2차 독립 출처 재확인 미완으로 보류
- Ariana Grande 'Petal', Olivia Rodrigo·Madonna 신보: 검색 결과 7월 말 이전(현재 창 이전) 발매로 확인되어 "최근/미래" 창 기준 이번 사이클 대상 아님(다음 사이클 재확인 필요시 검토)
[메모] 이번 검증 실행은 RESEARCHER_EN.md 프롬프트 절차를 신규 clone 기준으로 그대로 수행한 검증(verification) 목적 사이클. 2단계 리서치(집계→개별 확정) 및 독립 출처 2개 이상 원칙을 모든 신규 항목에 적용함.

## [2026-07-22 09:15] [KO 리서처]
리서치 완료 (한국 국내 공연)
- 콘서트/내한 7→3, 음원발매 2→0, 페스티벌 1→1, 팬미팅 2→1 (후보→통과)
- 신규 5개 / 갱신 0개 (삭제 없음·전량 보존)
- 티켓팅 진행중 4개: 에스파 고척돔(선예매·일반예매 종료 확인, 필드는 이력 보존), 잭 화이트 내한(일반예매 진행중), 김종국 앵콜(일반예매 진행중), 라이즈 팬미팅(선예매 7/27·일반예매 7/29 예정, 정확한 시각 미확인으로 datetime은 null)
- description 보강: 신규 5개 전부 한국어 200자 내외(204~262자)
- image_url: 예매처 og:image 확보 2개(에스파-멜론티켓, 잭 화이트-라이브네이션), 나머지 3개(김종국·OKF·라이즈)는 인터파크(NOL) 페이지가 JS 렌더링이라 web_fetch로 og:image 추출 실패 + 확신 없는 이미지 회피 위해 null(추후 재시도 대상)
- 총 등록 16개

[신규 항목 — 콘서트]
- 에스파(aespa) 월드투어 서울 'SYNK : COMPLaeXITY'(8/7~8 고척스카이돔): 전남일보+MD투데이+잼베이스+멜론티켓 공식 예매페이지 일치. 지난 사이클 "Trip.com 단일출처" 사유로 보류했던 항목을 이번에 멜론티켓 공식 상세페이지로 재검증해 확정
- 잭 화이트(Jack White) 내한(8/17 예스24라이브홀): 라이브네이션코리아 공식 예매페이지+festivallife.kr+다음 뉴스 일치. 지난 사이클 "WebSearch 요약 단일출처" 사유로 보류했던 항목을 라이브네이션 공식페이지로 재검증해 확정
- 김종국 30주년 콘서트 〈The Originals〉 서울 앵콜(8/15~16 블루스퀘어): 스포츠경향+mhnse+헤럴드뮤즈+kstars+tvreport+네이트 6개 매체 일치

[신규 항목 — 페스티벌]
- 2026 OKF(ORJET K-POP FESTA)(9/26~27 킨텍스, 1차 라인업 11팀): 전자신문+스타뉴스+스포츠서울+더퍼블릭 일치. 티켓 오픈일 미공개로 예매 필드는 미기재, 데이별 라인업 매핑 미확정으로 festival_days도 null 처리

[신규 항목 — 팬미팅]
- 라이즈(RIIZE) 팬미팅 'Ch. RIIZE : ON AIR'(9/12~13 인천 인스파이어 아레나): 이투데이+텐아시아+문화일보+헤럴드뮤즈 일치. 국내 선예매 7/27, 글로벌 선예매 7/28, 일반예매 7/29(정확한 시각 미확인)

[검증 탈락]
- 아이브(IVE) "8월 22일 컴백" 기사: 검색 결과 상단에 노출된 스포츠경향 기사가 실제로는 2022년 7월 25일자 'After Like' 싱글 발매 기사(URL 내 202207251121003 확인)로, 2026년 현재 시점 재유통된 옛 기사였음 — 룰 [최우선 규칙 4] "재유통 기사 함정"에 정확히 해당해 탈락 처리
- 제로베이스원(ZEROBASEONE) 8/19 '회귀러브': 일본 로컬 발매(일본어 신곡)로 확인돼 KO 대상 아님(JA 리서처 영역) → 미등재
- 샤이니(SHINee) WORLD VIII [THE INVERT]: 5/29~31 개최로 이미 종료된 공연 → 신규 후보 제외(과거 항목이라 데이터 보존 원칙상 삭제 대상도 아니고 애초에 미등록 상태 유지)
- BE BOYS 팬미팅 BE:GINNING in SEOUL(6/21 개최): 이미 지난 공연이라 "최근 6개월" 조건상 등록 가능하나, 이번 사이클은 향후 임박 공연 검증에 우선순위를 둬 보류
- 싸이 흠뻑쇼(8/1~2 수원 외), 빅뱅 월드투어(8/21~23 고양), 오피셜히게단디즘 내한(8/8~9): 지난 사이클과 동일하게 이번에도 시간 부족으로 예매처 상세페이지 재검증 미완, 다음 사이클로 이월

## [2026-07-22 00:53] [JA 뉴스]
뉴스 작성 완료 (일본 국내 공연 뉴스) — NEWS_RESEARCHER_JA.md 최초 실행 검증
- 신규 기사 2건: BABYMONSTER来日ツアー、一部会場で立見チケット追加販売(BABYMONSTER JAPAN OFFICIAL SITE, 2026-07-21 게시) / RIIZE、3rd日本シングル「Sunburst」予約者対象ラッキードロー開催(RIIZE JAPAN OFFICIAL SITE, 2026-07-21 게시)
- 콘서트 링크 연결 0건 / 링크 없음 2건 (data/concerts.ja.json에 RIIZE·BABYMONSTER 항목 자체가 없어 링크 대상 없음)
- 스킵(중복·소스 불충분): The Weeknd 추가공연·SixTONES 스타디움 투어·ULTRA JAPAN 라인업·ROCK IN JAPAN 타임테이블 등은 실제 발표일이 6~7월 초라 48시간 규정 미충족으로 제외. RIIZE JAPAN FANMEETING(7/23~24 고베) 관련은 신규 공지 없어 제외

## [2026-07-22 00:52] [EN 뉴스]
뉴스 작성 완료 (영어권/글로벌 시장 공연 뉴스) — NEWS_RESEARCHER_EN.md 최초 실행(검증 목적)
- 신규 기사 2건:
  - "Bob Dylan's 2026 UK Tour Tickets Go On General Sale Today" (Ultimate Classic Rock announce 7/16 + 일반발매 개시일이 오늘 7/22 — "다음 행동 유발" 기준 부합으로 판단, NME/Radio X/Ladbible 등 교차 확인)
  - "Robbie Williams Confirms First 2027 UK and Ireland Outdoor Shows" (NME 게재 7/21, 48시간 이내 — Stereoboard/XSNoize 교차 확인)
- 콘서트 링크 연결 0건 / 링크 없음 2건 (data/concerts.en.json에 Bob Dylan·Robbie Williams 매칭 항목 없음 — 규칙대로 링크 생략, 이미지 없이 정상 노출)
- 스킵(중복·소스 불충분): Katseye 'Wildworld', Gracie Abrams 'Look at My Life' 투어 등은 실제로는 5월 발표건이라 48시간 규정 위반으로 제외. Variety는 봇 페이월(tollbit, HTTP 402)로 직접 열람 불가해 해당 매체발 기사 검증엔 사용 못함(교차 확인용 타 매체로 대체).

## [2026-07-22 00:51] [KO 뉴스]
뉴스 작성 완료 (한국 국내 공연 뉴스)
- 신규 기사 2건: 이즈나 데뷔 첫 단독 콘서트, 오늘 밤 8시 팬클럽 선예매 시작 / 제천국제음악영화제 '원 썸머 나잇 위드 케이팝 시즌2' 1차 라인업 공개
- 콘서트 링크 연결 0건 / 링크 없음 2건(이즈나·JIMFF 원썸머나잇 모두 concerts.ko.json 미등록 아티스트/행사로 링크 생략)
- 스킵(중복·소스 불충분): 없음 — content/news 디렉터리 자체가 이번에 처음 생성됨(기존 기사 없어 중복 확인 대상 없음)
- 참고: 인터파크 오픈공지 페이지의 "izna Concert Tour: WHO DAT GIRL？"(팬클럽 선예매 22일 20:00) 공지, 헤럴드경제 기사(2026-07-21 08:30 게재, JIMFF 라인업)를 각각 원 출처로 확인 후 재서술
## [2026-07-22 00:53] [JA 리서처]
리서치 완료 (일본 국내 공연)
- 콘서트/来日 5→10, 발매 3→3, 페스티벌 3→3, 팬미팅 2→2 (후보→통과)
- 신규 5개 / 갱신 0개 (삭제 없음·전량 보존)
- 티켓팅 진행중 4개: EPICA(각 프레이가이드 先着一般発売中), SUPER JUNIOR-RYEOWOOK(一般発売 7/18 開始 진행중), 福山雅治(BROS.회원 先行 진행중), FLO(一般発売 7/18 開始 진행중) / JAURIM은 확인된 先行(抽選) 회차가 이미 종료됐고 一般発売 일자 미확인으로 티켓팅 필드 미기재
- description 보강: 신규 5개 전부 일본어 185~233자
- image_url: 5개 전부 확신 가능한 티켓 플랫폼 og:image를 추출하지 못해 null 처리(추후 ぴあ/イープラス 상세페이지에서 og:image 재확인 대상)
- 총 등록 18개

[신규 항목]
- EPICA「JAPAN TOUR 2026」来日公演(concert_tour, 9/14 東京LIQUIDROOM・9/15 大阪BIGCAT): eplus.jp 공식 티켓 페이지 + jambase + bandsintown 일치. 2025년 12월 来日과는 별개의 신규 투어임을 gekirock 기사(2025년 来日 발표분)와 대조해 확인
- SUPER JUNIOR-RYEOWOOK「Special Live 2026 〜紺碧〜」(concert_tour, 8/19~20 LINE CUBE SHIBUYA 全3公演): SUPER JUNIOR JAPAN 공식 사이트 + SJ_NEWS_JP 공식 트위터 + dareae.info 집계 일치
- 福山雅治「NISSAY PRESENTS WE'RE BROS. TOUR 2026 DOME LIVE 龍、涼風至」(concert_tour, 8/5~6 東京ドーム・8/22~23 京セラドーム大阪): 福山雅治 공식 사이트 + 京セラドーム大阪 공식 스케줄 + ローソンチケット 공식 트위터 일치
- JAURIM（紫雨林）「CONCERT in JAPAN 2026 〜LIFE! X TOKYO〜」(concert_tour, 8/29 Veats Shibuya 昼夜2公演): 韓流ぴあ 공식 트위터(hanryu_pia) + TRAICY + korepo.com 기사 일치. ⚠️1차 검색에서 걸린 buzzyroots 기사는 2025년 2月 duo MUSIC EXCHANGE 공연(작년 来日)에 관한 것으로 확인돼 탈락시키고 재검색으로 올해 8/29 Veats Shibuya 공연을 재확정(정기 来日 아티스트 연도 혼동 함정 실제 발생 사례)
- FLO「初単独来日ツアー」(concert_tour, 8/31 東京TOYOSU PIT・9/2 大阪Zepp Namba): universal-music.co.jp 공식 뉴스 + Billboard JAPAN + NME Japan + Kyodo 기사 일치

[검증 탈락 / 보류]
- JAURIM 一般発売 정확 일시: ぴあ最速先行(6/19~6/28 抽選)·ぴあ先行予約(7/2~7/12 抽選) 확인됐으나 一般発売 개시일 자체는 독립 출처로 확정 못 해 presale/general_sale 필드는 미기재(다음 사이클 t.pia 상세페이지에서 재확인)
- Janet Jackson Japan 2026(6/9~17 神戸·横浜·名古屋): 공연 자체는 잘 검증되나 오늘(7/22) 기준 이미 종료된 공연이라 신규 추가 실익이 없다고 판단해 보류(과거 공연 아카이브 추가는 다음 우선순위로)

[검증 프로세스 노트]
- 이번 사이클은 RESEARCHER_JA.md 프롬프트를 처음부터 끝까지 따라가며 실제 검증 실행. 2단계 원칙(집계→개별 검색)과 연도 함정 경고가 실제로 JAURIM 건에서 작동함을 확인(1차 결과로 잡힌 buzzyroots 기사가 작년 공연이었음을 재검색으로 발견)
## [2026-07-22 00:07] [KO 리서처]
리서치 완료 (한국 국내 공연)
- 콘서트/내한 6→1, 음원발매 11→9, 페스티벌 5→1, 팬미팅 0→0 (후보→통과)
- 신규 11개 / 갱신 0개
- 스캐폴드 샘플 플레이스홀더 4개 정리(name에 "[샘플]"·description "실제 데이터로 교체 예정"·last_researched_by=scaffold-placeholder 명시된 명백한 오등록. 미래 날짜라 라이브 캘린더 "예정"을 오염시켜 AGENTS.md §5 예외로 판단해 제거. EN/JA 리서처가 자기 파일에서 동일 처리한 선례 있음. 실데이터는 이제부터 전량 보존)
- 티켓팅 진행중 1개: 인천펜타포트 락 페스티벌(3일권 얼리버드 등 예매 진행중, general_sale:true / 예매 URL·일시 미확인으로 null)
- description 보강: 신규 11개 전부 한국어 130자 이상
- image_url: 만료성/비공식(Trip.com CDN 등) URL 회피 위해 11개 전부 null(추후 예매처 og:image 교체 대상)
- 총 등록 11개

[신규 항목 — 음원발매]
- 레드벨벳 'Velvet Summer'(8/3 18:00): kpopofficial 집계 + 공식 트위터(@RVsmtown 7/5) 일치
- 키스오브라이프 'SWEAT'(8/4 18:00): kpopofficial + 공식 트위터(@KISSOFLIFE_S2 7/20) 일치
- 에이엔(AEN) 'A NEW ERA OF NOW'(8/5 18:00): kpopofficial + 나무위키 2026 가요계 요약(8/5 에이엔) 일치
- 스트레이 키즈 'THIS & THAT'(8/7 13:00): kpopofficial + 나무위키 요약(8/7 스트레이키즈) 일치
- 아르테미스(ARTMS) 'Hyper-Ego'(8/7 13:00): kpopofficial + 공식 트위터(@official_artms 7/3) 일치
- 키키(KiiiKiii) 'WhyKiiiKiii'(8/10 18:00): kpopofficial + 집계 언급 일치
- 티파니 영 'Edge of Calm'(8/20 18:00): kpopofficial + 나무위키 요약(8/20 티파니 영) 일치
- 엔하이픈 'THE SIN : BLISS'(8/21 13:00): kpopofficial + 나무위키 요약(8/21 엔하이픈) 일치
- NCT 127 정규 7집(8/24, 시각 미정): kpopofficial + 나무위키 요약(8/24 NCT 127) 일치

[신규 항목 — 콘서트/페스티벌]
- 스트레이 키즈 월드투어 서울(7/25~8/2 KSPO DOME): kpopofficial 트렌딩 이벤트 + Trip.com 대한민국 콘서트 집계 일치. 국내 대형 홈 공연
- 2026 인천펜타포트 락 페스티벌(7/31~8/2 송도달빛축제공원): Trip.com 상세(얼리버드 티켓 가격·판매 안내) + WebSearch 집계 일치. 공식 데이별 라인업 미확인으로 festival_days는 미기재

[검증 탈락 / 보류]
- 에스파 월드투어 서울 고척스카이돔(8/7~8), 빅뱅 월드투어 고양(8/21~23), 싸이 흠뻑쇼 수원(8/1~2)·부산(8/15~16), 이승철 40주년 성남(8/8): Trip.com 단일 집계만 확인, 독립 2개 출처 미충족으로 보류(다음 사이클 예매처 상세 재확인)
- 오피셜히게단디즘 내한(8/8~9 KSPO DOME), 김종국 30주년(8/15~16), 잭 화이트 내한(8/17): WebSearch 요약 단일 출처만 확인 → 보류
- Picheolin(세븐틴 도겸) '吉BOARD'(8/3): kpopofficial 단일 출처만 확인 → 보류
- WayV 'Vision Wings'(8/10): 중국 기반 유닛(CST/KST 병기)이라 국내 발매 여부 불확실 → 보류
- 일본 발매분(TWS·TXT·제로베이스원·aespa 등 JP 싱글): 일본 시장 발매로 KO 대상 아님(JA 리서처 영역)
[메모] WebSearch 세션 한도 도달(자정 KST 리셋)로 이번 사이클은 web_fetch 중심 검증. 보류분은 다음 사이클 예매처 상세페이지로 재검증 예정.


## [2026-07-21 22:10] [EN 리서처]
리서치 완료 (영어권/글로벌 시장 공연)
- 콘서트/투어 6→4, 발매 3→0, 페스티벌 1→1, 팬미팅 0→0 (후보→통과)
- 신규 5개 / 갱신 0개
- 스캐폴드 샘플 플레이스홀더 5개 정리(name에 "[Sample]"·description "Placeholder entry to be replaced with real data"·last_researched_by=scaffold-placeholder 명시된 오등록. 미래 날짜라 라이브 캘린더 "예정"을 오염시켜 AGENTS.md §5 "명백한 오등록" 예외로 판단해 제거. JA 리서처가 concerts.ja.json에서 동일 처리한 선례 있음. 실데이터는 이제부터 전량 보존)
- 티켓팅 진행중 3개: Foo Fighters(Ticketmaster 일반발매 진행중), My Chemical Romance(2025-09-26 일반발매 오픈), ACL Festival(패스 판매중)
- description 보강: 신규 5개 전부 영어 70~78단어(권장 50~80 범위)
- image_url: 만료성 URL 회피 위해 5개 전부 null(추후 티켓 플랫폼 og:image 교체 대상)
- 총 등록 5개

[신규 항목]
- BTS World Tour 'ARIRANG' - Arlington (concert_tour, 8/15~16 AT&T Stadium): arlingtontx.gov 공식 + Songkick + AT&T Stadium 공식 + Consequence 일치. 양일 8PM, 1월 초기판매 매진(현재 리세일만). 군복무 후 7인 완전체 복귀.
- Foo Fighters: Take Cover Tour - Detroit (concert_tour, 8/6 Ford Field): Ticketmaster 다수 도시 판매페이지 + Wikipedia + Live Nation 일치. 8/6 디트로이트 개막~9/26 라스베가스 Allegiant Stadium 폐막, QOTSA 서포트.
- My Chemical Romance: The Black Parade 2026 - New York (concert_tour, 8/9 Citi Field): Variety + Consequence + Live Nation + Alamodome 공식 일치. NA 스타디움 레그 8/9 뉴욕 재개~10/24 할리우드 볼 3일. 티켓 2025-09-26 일반발매.
- Ariana Grande: The Eternal Sunshine Tour - London (concert_tour, 8/15~9/1 The O2 레지던시): The O2 공식 + AEG Europe + Time Out + Wikipedia 일치. 10일 전석 매진, 커리어 최장 단일 공연장 레지던시, 2019년 이후 첫 UK 공연.
- Austin City Limits Music Festival 2026 (festival, 10/2~4 & 10/9~11 Zilker Park): aclfestival.com 공식 + JamBase + LiveForLiveMusic 일치. 25주년, 헤드라이너 Charli XCX·Rufus Du Sol·Twenty One Pilots·Lorde·The XX(W1 Skrillex/W2 Kings of Leon). 데이별 라인업 매핑 미확정으로 festival_days는 null 처리(공식 데이별 확정 후 보강).

[검증 탈락 / 보류]
- music_release 카테고리: Madonna·Olivia Rodrigo·Ariana Grande 신보는 7월 말 이전 발매로 창(최근/미래) 벗어남. Celine Dion 신보는 발매일 미정. 특정 발매일 확정 후보 부재 → 이번 사이클 추가 없음(정확성 우선).
- Daniel Caesar 시카고 United Center 공연: 7/26 예정이나 아시아·북미 투어 스탑 개별 날짜 재확인 미완으로 이번 사이클 보류(다음 사이클 재검토).

## [2026-07-21 21:45] [JA 리서처]
리서치 완료 (일본 국내 공연)
- 콘서트/来日 1→1, 발매 3→1, 페스티벌 0→0, 팬미팅 3→2 (후보→통과)
- 신규 4개 / 갱신 2개 (JOURNEY 先行 필드 보강, The Weeknd image_url 추가) (삭제 없음·전량 보존)
- 티켓팅 진행중 4개: JOURNEY(メンバーズ先行 ~7/24 + 一般発売 7/25 10:00), The Weeknd(ローチケ 一般発売 発売中 재확인), Summer Sonic(一般発売 進行中 재확인), JISUNG(FC限定1次先行 ~7/26)
- description 보강: 신규 4개 전부 일본어 178~212자
- image_url: The Weeknd ローチケ og:image(HMV hybridimage) 확보 / 신규 4개는 만료성 URL 회피 위해 null(추후 티켓 플랫폼 og:image 교체 대상)
- 총 등록 13개
[신규 항목]
- 中島健人『鬼事 / Fiction Love』(music_release, 8/19) — 소니뮤직 공식·HMV·타워레코드·Billboard JAPAN 등 다수 일치. 지난 사이클 보류분 확정 추가
- TREASURE「THE STAGE 2026 IN JAPAN」(concert_tour, 9/5~6 有明アリーナ) — YGEX 공식+集計 일치. 각종 티켓 판매 종료(AnyPASS 전자티켓 입장)
- 2026 KO1KEYZ 1ST FAN MEETING(fanmeeting, 8/21~23 TOYOTA ARENA TOKYO ほか) — produce101 공식+音楽ナタリー+CDJournal 일치
- チソン『JISUNG FANMEETING IN JAPAN : OUR SCENE』(fanmeeting, 9/18 世田谷) — チケットプラス 공식+オリコン+Kstyle 일치
[검증 탈락 / 보류]
- Travis Japan 라이브 영상작품(Blu-ray/DVD, 8/26), Da-iCE photobook(9/6): 음원 발매가 아니라 영상·서적 상품 → music_release 대상 제외
- SEVENTEEN 2026 JAPAN FANMEETING 'YAKUSOKU': 공식 특설사이트는 존재하나 이번 사이클에 개최일 확정 미완 → 다음 사이클 보류
[재확인 메모]
- The Weeknd 一般発売: 1차 검색(INROCK 트윗)엔 '未定'로 나왔으나 ローチケ 판매페이지에서 '発売中 一般発売 先着' 확인 → 기존 general_sale:true 유지 정당. 장소도 기존 ベルーナドーム 표기 정확(東京ドーム 아님)

## [2026-07-21 21:40] [JA 리서처]
리서치 완료 (일본 국내 공연)
- 콘서트/来日 4→4, 발매 2→2, 페스티벌 3→3, 팬미팅 0→0 (후보→통과)
- 신규 9개 / 갱신 0개
- 스캐폴드 샘플 플레이스홀더 4개 정리(name에 "[サンプル]"·description에 "実データに差し替え予定" 명시된 오등록 항목, last_researched_by=scaffold-placeholder). 실제 이벤트가 아니고 미래 날짜라 라이브 캘린더 "예정"에 노출되어 오염되므로 AGENTS.md §3-5 "명백한 오등록" 예외로 판단해 제거. 실데이터 항목은 전량 보존.
- 티켓팅 진행중 3개 (Summer Sonic 일반발매 진행 / The Weeknd 일반발매 진행 / JOURNEY 7/25 일반발매 예정)
- description 보강: 신규 9개 전부 일본어 120자 이상(163~219자)
- 총 등록 9개
- image_url: Summer Sonic만 ローチケ og:image 확보, 나머지 8개는 만료성 URL 회피 위해 null(추후 티켓 플랫폼 og:image 교체 대상)
[검증 탈락 / 보류]
- 中島健人『鬼事 / Fiction Love』(8/19), ハク。『世界が変わる時』(9/9): 1차 집계에서만 확인, 독립 출처 2개 재확인 미완으로 이번 사이클 보류
- ROCK IN JAPAN / ULTRA JAPAN: 개최일·라인업은 확정했으나 데이별 헤드라이너 매핑 미확정으로 festival_days는 null 처리(공식 데이별 확정 후 보강)

## [2026-07-21 00:00] [시스템]
WhenStage 리서처 체계 시작. `data/concerts.ko.json` / `concerts.en.json` / `concerts.ja.json` 각각
KO/EN/JA 리서처가 독립적으로 관리. 스키마는 `AGENTS.md`, 리서처별 작업 지시는
`RESEARCHER_KO.md` / `RESEARCHER_EN.md` / `RESEARCHER_JA.md` 참고.
