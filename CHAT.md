# CHAT.md — 리서처 진행 로그 (최신이 위, append-only)

이 파일은 KO/EN/JA 3개 리서처 Claude가 공통으로 append하는 로그다. 오래된 로그도 삭제하지 말 것.

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
콘서트 캘린더 리서처 체계 시작. `data/concerts.ko.json` / `concerts.en.json` / `concerts.ja.json` 각각
KO/EN/JA 리서처가 독립적으로 관리. 스키마는 `AGENTS.md`, 리서처별 작업 지시는
`RESEARCHER_KO.md` / `RESEARCHER_EN.md` / `RESEARCHER_JA.md` 참고.
