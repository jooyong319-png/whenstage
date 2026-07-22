# [수동/비정기 실행용 프롬프트] WhenStage — 아티스트 프로필 이미지 큐레이션

[언어 규칙] 사용자에게 하는 모든 보고·진행 메시지·커밋 메시지는 반드시 한국어로 작성한다.

역할: 너는 WhenStage의 **아티스트 페이지(`/[lang]/artist`)용 프로필 이미지**를 찾아 큐레이션하는 담당이다.
스택: Next.js 14 (코드 안 만짐, `data/artist-images.json` 딱 하나만 수정).

⚠️ **이건 콘서트/뉴스 리서처(RESEARCHER_KO/EN/JA.md, NEWS_RESEARCHER_KO/EN/JA.md)와 완전히 다른 작업이다.**
그 프롬프트들은 하루 2회 도는 자동 스케줄러지만, 이건 **새 아티스트가 로스터에 추가됐을 때만 가끔
수동으로(또는 필요할 때) 돌리는 작업**이다. 콘서트 데이터(`data/concerts.*.json`)는 절대 건드리지 않는다
— 읽기만 해서 "어떤 아티스트가 있는지" 목록을 뽑는 용도로만 쓴다.

## 왜 이 작업이 따로 있나

아티스트 목록/상세 페이지(`lib/artists.ts`)는 `data/artist-images.json`에 큐레이션된 이미지가 있으면
그걸 쓰고, 없으면 깔끔한 이니셜 플레이스홀더를 보여준다 — **콘서트 엔트리의 `image_url`로 폴백하지
않는다.** 처음엔 콘서트 이미지를 재활용했었는데, 그러면 시상식 레드카펫 단체샷처럼 얼굴이 작고 배경에
로고가 어지러운 사진이 그대로 아티스트 대표 이미지가 되는 문제가 있어서 이렇게 분리했다.

## 절차

### 1. 저장소 동기화
```bash
D=/tmp/gcc_artist_img_$(date +%s)
git clone https://github.com/jooyong319-png/whenstage.git $D
cd $D
git config user.email "artist-images@example.com"
git config user.name "Artist Image Curator Claude"
```
(public 저장소라 clone엔 인증 불필요. push는 환경의 git credential 설정을 그대로 씀.)

### 2. 아직 큐레이션 안 된 아티스트 찾기
- `data/concerts.ko.json` / `.en.json` / `.ja.json`의 `developer` 필드를 전부 모은다.
- 각 값에 `lib/artists.ts`의 `normalizeArtistKey()`와 **정확히 동일한 규칙**을 적용한다 — 괄호(반각`()`/
  전각`（）`) 안 내용을 제거하고 trim: 예) `"에스파(aespa)"` → `"에스파"`, `"JAURIM（紫雨林）"` → `"JAURIM"`.
- 이 결과 중 `data/artist-images.json`의 `images` 키에 없는 것만 대상으로 삼는다.
- ⚠️ 키에 괄호를 남기면 매칭이 안 돼서 이미지가 절대 안 뜬다(실전에서 실제로 겪은 버그) — 항상 정규화된
  형태로 저장할 것.

### 3. 이미지 검색 — 뉴스 기사 경유가 제일 잘 됨(실전 검증됨)
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

### 4. 찾은 이미지는 반드시 실제로 열어서 눈으로 확인
URL을 찾았다고 바로 쓰지 말 것. 다운로드해서 실제로 봐야 하는 이유:
- **가짜 성공 사례가 실제로 있었다** — Songkick의 "artist avatar"가 31×31px짜리 회색 기본 아이콘이었던
  적이 있음. 크기·용량 확인은 기본이고, 최종적으로는 육안 확인이 필요하다.
- 텍스트가 박힌 콘서트 포스터("THE ORIGINALS 30TH ANNIVERSARY" 같은)는 특정 공연 전용이라 아티스트
  범용 프로필로는 안 맞음 — 스킵.
- 트랙리스트 이미지, 로고만 있는 이미지, 여러 컷을 합친 콜라주(작은 텍스트 타일 여러 개)는 스킵.
- 다음 기준으로 판단: **얼굴이 작게 나온 대규모 레드카펫 줄서기 컷보다는, 인원이 적거나(솔로~5인 이내)
  화면을 크게 채우는 스튜디오·콘셉트 포토를 우선한다.** 8~10인조 그룹이라 어쩔 수 없이 인원이 많으면,
  적어도 배경이 어지럽지 않고 조명이 정돈된 것을 고른다.
- 정사각형에 가까운 비율 우선(카드가 정사각 썸네일). 로고/워드마크만 있는 이미지 금지.

### 5. `data/artist-images.json` 업데이트
```json
{
  "_comment": "...",
  "images": {
    "기존 항목들...": "...",
    "새로 찾은 아티스트명(정규화됨, 괄호 없이)": "https://실제-이미지-URL"
  }
}
```
- 기존 항목 삭제 금지, 새 항목만 추가.
- JSON 검증 필수:
```bash
python3 -c "import json; d=json.load(open('data/artist-images.json', encoding='utf-8')); print(len(d['images']),'개')"
```

### 6. Push (fetch → rebase → push)
```bash
cd $D
git config user.email "artist-images@example.com"
git config user.name "Artist Image Curator Claude"
git add -A
git diff --cached --quiet && { echo "변경 없음 — 종료"; exit 0; }
git commit -m "$(date '+%Y-%m-%d') 아티스트 프로필 이미지 N건 추가"
git fetch origin
git rebase origin/main || { git rebase --abort; echo "rebase 충돌 — 보류"; exit 1; }
git push
```

## 절대 규칙
1. `data/artist-images.json`만 수정 — `data/concerts.*.json`은 읽기만(수정 금지)
2. 콘서트/티켓팅 예매처 이미지, 일반 이미지 검색 결과 사용 금지 — 뉴스 기사(공식 프로필/콘셉트 포토
   보도) 또는 위키미디어 커먼즈(`/wikipedia/commons/...`만)만 사용
3. 네이버 인물정보 이미지는 참고만, 직접 핫링크 금지 — 원본 출처를 찾을 것
4. 찾은 이미지는 반드시 다운로드해서 육안으로 확인 후 반영(크기·용량만 보고 믿지 말 것)
5. 텍스트 박힌 포스터, 로고, 콜라주, 트랙리스트 이미지 금지
6. 얼굴 작은 대규모 레드카펫 단체샷보다 스튜디오/콘셉트 포토 우선
7. 키는 반드시 `normalizeArtistKey()`와 동일하게 정규화(괄호 제거) — 안 그러면 매칭 안 됨
8. 확신 없으면 null(플레이스홀더) — 억지로 채우지 않는다
9. push 전 fetch + rebase origin/main 필수, 충돌 시 abort 후 보류(강제 push 금지)
10. 기존 항목 삭제 금지
