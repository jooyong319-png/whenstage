// 다국어(/en, /ja) 페이지 공용 UI 문구 — 정적 딕셔너리(번역 API 미사용, 직접 작성).
import type { Category } from './types';

export type Locale = 'ko' | 'en' | 'ja';
export const LOCALES: Locale[] = ['ko', 'en', 'ja'];

// ko/en/ja는 서로 번역 관계가 아니라 국가별로 완전히 독립된 콘텐츠(lib/games.ts가
// locale별 data/concerts.{ko,en,ja}.json을 각각 읽음) — 그래서 게임명/설명에 별도
// 폴백 헬퍼가 필요 없음. 각 페이지가 자기 locale의 데이터를 그대로 씀.

// events.json 이벤트 타입(game_show/sale/season) 라벨
export const EVENT_TYPE_LABELS: Record<Locale, Record<'game_show' | 'sale' | 'season', string>> = {
  ko: { game_show: '게임쇼', sale: '할인', season: '새 시즌' },
  en: { game_show: 'Game Show', sale: 'Sale', season: 'New Season' },
  ja: { game_show: 'ゲームショー', sale: 'セール', season: '新シーズン' },
};

export const CATEGORY_LABELS: Record<Locale, Record<Category, string>> = {
  ko: {
    concert_tour: '콘서트·내한 공연',
    music_release: '음원 발매(컴백)',
    festival: '페스티벌',
    fanmeeting: '팬미팅',
  },
  en: {
    concert_tour: 'Concerts & Tours',
    music_release: 'Music Release (Comeback)',
    festival: 'Festival',
    fanmeeting: 'Fan Meeting',
  },
  ja: {
    concert_tour: 'コンサート・来日公演',
    music_release: '音源発売(カムバック)',
    festival: 'フェスティバル',
    fanmeeting: 'ファンミーティング',
  },
};

interface UiStrings {
  siteName: string;
  siteNameShort: string;
  home: string;
  calendar: string;
  news: string;
  blog: string;
  artist: string;
  artistListTitle: string;
  artistListSubtitle: string;
  artistUpcomingCount: string;
  artistNoEvents: string;
  bioAgency: string;
  bioMembers: string;
  bioDebut: string;
  venue: string;
  venueListTitle: string;
  venueListSubtitle: string;
  releaseDate: string;
  platforms: string;
  genres: string;
  developer: string;
  publisher: string;
  tba: string;
  viewOriginal: string;
  backToList: string;
  publishedOn: string;
  source: string;
  notFound: string;
  notTranslated: string;
  contact: string;
  about: string;
  contactPage: string;
  guide: string;
  privacy: string;
  terms: string;
  footerDisclaimer: string;
  siteDescription: string;
}

export const UI: Record<Locale, UiStrings> = {
  ko: {
    siteName: 'WhenStage — 내한·컴백·페스티벌',
    siteNameShort: 'WhenStage',
    home: '홈',
    calendar: '캘린더',
    news: '뉴스',
    blog: '모아보기',
    artist: '아티스트',
    artistListTitle: '아티스트',
    artistListSubtitle: '아티스트별로 발매·투어·팬미팅 일정을 모아봤어요.',
    artistUpcomingCount: '개 예정',
    artistNoEvents: '등록된 일정이 없어요.',
    bioAgency: '소속사',
    bioMembers: '구성',
    bioDebut: '데뷔',
    venue: '공연장',
    venueListTitle: '공연장',
    venueListSubtitle: '공연장별로 열리는 콘서트·페스티벌·팬미팅 일정을 모아봤어요.',
    releaseDate: '일정',
    platforms: '공연장',
    genres: '태그',
    developer: '아티스트/기획사',
    publisher: '주최',
    tba: '미정',
    viewOriginal: '원문 보기 →',
    backToList: '← 목록으로',
    publishedOn: '게시일',
    source: '출처',
    notFound: '페이지를 찾을 수 없어요.',
    notTranslated: '이 페이지는 아직 준비되지 않았어요.',
    contact: '문의',
    about: '소개',
    contactPage: '문의하기',
    guide: '이용 가이드',
    privacy: '개인정보처리방침',
    terms: '이용약관',
    footerDisclaimer: '아티스트명·이미지·상표 등은 각 권리자의 자산이며, 본 사이트는 공연·발매 일정 정보 제공을 목적으로 합니다. 권리자의 요청 시 해당 콘텐츠를 수정·삭제합니다.',
    siteDescription: '콘서트·내한 공연, 음원 발매(컴백), 페스티벌, 팬미팅 일정을 한눈에. 매일 업데이트되는 공연·발매 캘린더.',
  },
  en: {
    siteName: 'WhenStage — Tours, Comebacks & Festivals',
    siteNameShort: 'WhenStage',
    home: 'Home',
    calendar: 'Calendar',
    news: 'News',
    blog: 'Roundups',
    artist: 'Artists',
    artistListTitle: 'Artists',
    artistListSubtitle: 'Releases, tours, and fan meetings, grouped by artist.',
    artistUpcomingCount: ' upcoming',
    artistNoEvents: 'No scheduled events.',
    bioAgency: 'Agency',
    bioMembers: 'Members',
    bioDebut: 'Debut',
    venue: 'Venues',
    venueListTitle: 'Venues',
    venueListSubtitle: 'Concerts, festivals, and fan meetings, grouped by venue.',
    releaseDate: 'Date',
    platforms: 'Venue',
    genres: 'Tags',
    developer: 'Artist / Agency',
    publisher: 'Organizer',
    tba: 'TBA',
    viewOriginal: 'View full interactive page (Korean) →',
    backToList: '← Back to list',
    publishedOn: 'Published',
    source: 'Source',
    notFound: 'Page not found.',
    notTranslated: "This page hasn't been translated into English yet.",
    contact: 'Contact',
    about: 'About',
    contactPage: 'Contact',
    guide: 'Guide',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    footerDisclaimer: 'Artist names, images, and trademarks are property of their respective rights holders. This site exists to provide schedule information and will edit or remove content upon a rights holder’s request.',
    siteDescription: 'Track Korean and global game release dates, pre-registrations, new server openings, and events in one calendar — updated daily.',
  },
  ja: {
    siteName: 'WhenStage — 来日公演・カムバック・フェス',
    siteNameShort: 'WhenStage',
    home: 'ホーム',
    calendar: 'カレンダー',
    news: 'ニュース',
    blog: 'まとめ記事',
    artist: 'アーティスト',
    artistListTitle: 'アーティスト',
    artistListSubtitle: 'アーティストごとに発売・ツアー・ファンミーティング情報をまとめました。',
    artistUpcomingCount: '件予定',
    artistNoEvents: '登録された日程はありません。',
    bioAgency: '所属',
    bioMembers: '構成',
    bioDebut: 'デビュー',
    venue: '会場',
    venueListTitle: '会場',
    venueListSubtitle: '会場ごとにコンサート・フェス・ファンミーティング情報をまとめました。',
    releaseDate: '日程',
    platforms: '会場',
    genres: 'タグ',
    developer: 'アーティスト/所属事務所',
    publisher: '主催',
    tba: '未定',
    viewOriginal: '詳細ページ(韓国語・全機能)を見る →',
    backToList: '← 一覧へ戻る',
    publishedOn: '公開日',
    source: '出典',
    notFound: 'ページが見つかりません。',
    notTranslated: 'このページはまだ日本語に翻訳されていません。',
    contact: 'お問い合わせ',
    about: 'サイトについて',
    contactPage: 'お問い合わせ',
    guide: 'ガイド',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    footerDisclaimer: 'アーティスト名・画像・商標等は各権利者の資産であり、本サイトは日程情報の提供を目的としています。権利者の要請があれば該当コンテンツを速やかに修正・削除します。',
    siteDescription: '国内外のゲーム発売日程・事前予約・新規サーバー・イベント情報を一つのカレンダーにまとめて毎日更新しています。',
  },
};

// hreflang용 언어 코드(Next Metadata alternates.languages 키)
export const HREFLANG: Record<Locale, string> = { ko: 'ko', en: 'en', ja: 'ja' };

// 캘린더/리스트/모달 등 딥 컴포넌트용 UI 문구 (usePathname 자체 감지 컴포넌트에서 사용)
interface CalUiStrings {
  searchPlaceholder: string;
  wishlist: string;
  wishlistOnly: string;
  today: string;
  noImage: string;
  lastUpdated: string;
  noSchedule: string;
  totalCount: string;
  comingSoon: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  weekdays: string[]; // Sun..Sat
  close: string;
  official: string;
  addToWishlist: string;
  removeFromWishlist: string;
  share: string;
  comments: string;
  commentPlaceholder: string;
  postComment: string;
  nickname: string;
  loading: string;
  released: string;
  goTo: string;
  prevMonth: string;
  nextMonth: string;
  goToToday: string;
  noReleaseThisMonth: string;
  swipeHint: string;
  closePanel: string;
  noScheduleThisDate: string;
  nextSchedule: string;
  todaySchedule: string;
  presaleTag: string;
  generalSaleTag: string;
  deadlineTag: string;
  presaleStartBadge: string;
  presaleEndBadge: string;
  generalSaleStartBadge: string;
  generalSaleEndBadge: string;
  ongoing: string;
  closed: string;
  all: string;
  categoryFilter: string;
  prevYear: string;
  nextYear: string;
  monthSelect: string;
  months: string[]; // Jan..Dec short
  noDateSet: string;
  noApproxGames: string;
  noReleaseThisMonthYear: (monthYearLabel: string) => string;
  pickOtherMonth: string;
  viewSource: string;
  goToPresale: string;
  goToGeneralSale: string;
  favorited: string;
  favorite: string;
  fullPage: string;
  copied: string;
  ticketingLive: string;
  ticketingTimeLeft: string;
  ticketingClosedText: string;
  ticketingDeadlineTba: string;
  ticketingInfo: string;
  startsOn: (label: string) => string;
  totalItems: (count: number) => string;
  noScheduleRegistered: string;
  noSearchResults: string;
  copy: string;
  copiedCheck: string;
  expiredTag: string;
  expiredUntil: (label: string) => string;
  copyAria: (code: string) => string;
  noActiveCoupons: string;
  officialRedeemPage: (name: string, term: string) => string;
  pastCoupons: (term: string) => string;
  couponIntro: (name: string, term: string) => string;
  howToUse: (name: string, term: string) => string;
  faqTitle: (name: string, term: string) => string;
  otherGameCoupons: (term: string) => string;
  gameHub: (name: string) => string;
  releaseInfo: (name: string) => string;
  allCoupons: string;
  lastUpdatedCouponNote: (dateLabel: string) => string;
  gameCoupons: string;
  scheduleCount: (count: number) => string;
  scheduleTitle: (name: string) => string;
  upcomingTag: string;
  fullGameList: string;
  otherGameCouponsShort: string;
  noValidCodesShort: string;
  hubLastUpdatedNote: (dateLabel: string) => string;
  couponFor: (name: string, term: string) => string;
  myWishlist: string;
  myWishlistSub: string;
  wishlistEmptyText: string;
  wishlistEmptyHint: string;
  releaseDateTba: string;
  removeFromWishlistAria: (name: string) => string;
  notifyTitle: string;
  notifyToggleAria: string;
  notifyDeniedSub: string;
  notifyNormalSub: string;
  notifyOnToast: string;
  notifyOffToast: string;
  notifyDeniedToast: string;
  notifyFailToast: (reason: string) => string;
  notifyUnknownError: string;
  freeGamesAria: string;
  freeGamesTitle: string;
  freeGamesTag: string;
  freeDaysLeft: (days: number) => string;
  freeFromDate: (mmdd: string) => string;
  appBottomNavAria: string;
  switchToLight: string;
  switchToDark: string;
  recommendedSchedule: string;
  eventEnds: (title: string) => string;
}

export const CAL: Record<Locale, CalUiStrings> = {
  ko: {
    searchPlaceholder: '공연명 검색…',
    wishlist: '찜',
    wishlistOnly: '찜한 것만 보기',
    today: '오늘',
    noImage: '이미지 없음',
    lastUpdated: '데이터 마지막 갱신',
    noSchedule: '등록된 일정이 없어요.',
    totalCount: '총',
    comingSoon: '공개 임박',
    days: '일', hours: '시간', minutes: '분', seconds: '초',
    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
    close: '닫기',
    official: '공식 출처 →',
    addToWishlist: '찜하기',
    removeFromWishlist: '찜 해제',
    share: '공유',
    comments: '댓글',
    commentPlaceholder: '이 일정에 대한 댓글 (최대 500자)',
    postComment: '등록',
    nickname: '닉네임',
    loading: '불러오는 중…',
    released: '지남',
    goTo: '바로가기',
    prevMonth: '이전 달',
    nextMonth: '다음 달',
    goToToday: '오늘로',
    noReleaseThisMonth: '이 달 일정이 없어요.',
    swipeHint: '좌우로 밀거나 ‹ ›로 다른 달을 살펴보세요.',
    closePanel: '패널 닫기',
    noScheduleThisDate: '이 날짜엔 일정이 없어요.',
    nextSchedule: '다음 일정',
    todaySchedule: '오늘의 일정',
    presaleTag: '선예매',
    generalSaleTag: '일반예매',
    deadlineTag: '마감',
    presaleStartBadge: '선예매 시작',
    presaleEndBadge: '선예매 마감',
    generalSaleStartBadge: '일반예매 시작',
    generalSaleEndBadge: '일반예매 마감',
    ongoing: '진행 중',
    closed: '종료',
    all: '전체',
    categoryFilter: '카테고리 필터',
    prevYear: '이전 해',
    nextYear: '다음 해',
    monthSelect: '월 선택',
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    noDateSet: '미정',
    noApproxGames: '일정 미정인 항목이 없어요.',
    noReleaseThisMonthYear: (label) => `${label} 일정이 없어요.`,
    pickOtherMonth: '위 탭에서 다른 달을 골라보세요.',
    viewSource: '출처 보기',
    goToPresale: '선예매 하러 가기',
    goToGeneralSale: '일반예매 하러 가기',
    favorited: '즐겨찾기됨',
    favorite: '즐겨찾기',
    fullPage: '전체 페이지',
    copied: '복사됨',
    ticketingLive: '티켓팅 진행 중',
    ticketingTimeLeft: '마감까지 남은 시간',
    ticketingClosedText: '판매 마감됨',
    ticketingDeadlineTba: '마감일 미정',
    ticketingInfo: '티켓팅 안내',
    startsOn: (label) => `${label} 시작`,
    totalItems: (count) => `총 ${count}개`,
    noScheduleRegistered: '아직 등록된 일정이 없어요.',
    noSearchResults: '검색 결과가 없어요.',
    copy: '복사',
    copiedCheck: '복사됨 ✓',
    expiredTag: '만료됨',
    expiredUntil: (label) => `${label} · 만료`,
    copyAria: (code) => `${code} 복사`,
    noActiveCoupons: '현재 유효한 코드가 없어요.',
    officialRedeemPage: (name, term) => `${name} 공식 ${term} 등록 페이지 →`,
    pastCoupons: (term) => `지난 ${term} (만료)`,
    couponIntro: (name, term) => `${name} ${term} 안내입니다.`,
    howToUse: (name, term) => `${name} ${term} 사용법`,
    faqTitle: (name, term) => `${name} ${term} 자주 묻는 질문`,
    otherGameCoupons: (term) => `다른 ${term}`,
    gameHub: (name) => `${name} 허브 →`,
    releaseInfo: (name) => `${name} 일정 정보 →`,
    allCoupons: '전체 보기 →',
    lastUpdatedCouponNote: (dateLabel) => `마지막 업데이트: ${dateLabel}.`,
    gameCoupons: '쿠폰',
    scheduleCount: (count) => `${count}건 예정`,
    scheduleTitle: (name) => `${name} 일정`,
    upcomingTag: '예정',
    fullGameList: '전체 목록 보기 →',
    otherGameCouponsShort: '다른 항목 →',
    noValidCodesShort: '현재 유효한 항목이 없어요.',
    hubLastUpdatedNote: (dateLabel) => `마지막 업데이트: ${dateLabel}.`,
    couponFor: (name, term) => `${name} ${term}`,
    myWishlist: '내 즐겨찾기',
    myWishlistSub: '관심 있는 공연·발매 일정을 모아봤어요.',
    wishlistEmptyText: '아직 즐겨찾기한 일정이 없어요.',
    wishlistEmptyHint: '상세 페이지에서 즐겨찾기 버튼을 눌러 추가하세요.',
    releaseDateTba: '일정 미정',
    removeFromWishlistAria: (name) => `${name} 즐겨찾기 제거`,
    notifyTitle: '일정 알림',
    notifyToggleAria: '일정 알림 토글',
    notifyDeniedSub: '브라우저 설정에서 알림을 허용해 주세요.',
    notifyNormalSub: '찜한 일정 하루 전·당일에 알려드려요.',
    notifyOnToast: '일정 알림을 켰어요',
    notifyOffToast: '일정 알림을 껐어요',
    notifyDeniedToast: '알림 권한이 거부됐어요',
    notifyFailToast: (reason) => `알림 실패: ${reason}`,
    notifyUnknownError: '알 수 없음',
    freeGamesAria: '무료 배포',
    freeGamesTitle: '지금 무료',
    freeGamesTag: 'Epic Games',
    freeDaysLeft: (days) => `무료 · ${days}일 남음`,
    freeFromDate: (mmdd) => `${mmdd}부터 무료`,
    appBottomNavAria: '앱 하단 메뉴',
    switchToLight: '라이트 모드로 전환',
    switchToDark: '다크 모드로 전환',
    recommendedSchedule: '추천 일정',
    eventEnds: (title) => `${title} 종료`,
  },
  en: {
    searchPlaceholder: 'Search games…',
    wishlist: 'Wishlist',
    wishlistOnly: 'Wishlist only',
    today: 'Today',
    noImage: 'No image',
    lastUpdated: 'Data last updated',
    noSchedule: 'No games scheduled.',
    totalCount: 'Total',
    comingSoon: 'Coming soon',
    days: 'D', hours: 'H', minutes: 'M', seconds: 'S',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    close: 'Close',
    official: 'Official source →',
    addToWishlist: 'Add to wishlist',
    removeFromWishlist: 'Remove from wishlist',
    share: 'Share',
    comments: 'Comments',
    commentPlaceholder: 'Comment on this game (max 500 chars)',
    postComment: 'Post',
    nickname: 'Nickname',
    loading: 'Loading…',
    released: 'Released',
    goTo: 'View',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    goToToday: 'Today',
    noReleaseThisMonth: 'No releases scheduled this month.',
    swipeHint: 'Swipe or use ‹ › to browse other months.',
    closePanel: 'Close panel',
    noScheduleThisDate: 'Nothing scheduled on this date.',
    nextSchedule: 'Coming Up Next',
    todaySchedule: "Today's Schedule",
    presaleTag: 'Presale',
    generalSaleTag: 'General sale',
    deadlineTag: 'Deadline',
    presaleStartBadge: 'Presale opens',
    presaleEndBadge: 'Presale closes',
    generalSaleStartBadge: 'General sale opens',
    generalSaleEndBadge: 'General sale closes',
    ongoing: 'Ongoing',
    closed: 'Closed',
    all: 'All',
    categoryFilter: 'Category & event filter',
    prevYear: 'Previous year',
    nextYear: 'Next year',
    monthSelect: 'Select month',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    noDateSet: 'TBA',
    noApproxGames: 'No games with a TBA release date.',
    noReleaseThisMonthYear: (label) => `No releases in ${label}.`,
    pickOtherMonth: 'Pick another month from the tabs above.',
    viewSource: 'View source',
    goToPresale: 'Go to presale',
    goToGeneralSale: 'Go to general sale',
    favorited: 'Favorited',
    favorite: 'Favorite',
    fullPage: 'Full page',
    copied: 'Copied',
    ticketingLive: 'Tickets on sale',
    ticketingTimeLeft: 'Time left',
    ticketingClosedText: 'Sale closed',
    ticketingDeadlineTba: 'Deadline TBA',
    ticketingInfo: 'Ticketing info',
    startsOn: (label) => `Starts ${label}`,
    totalItems: (count) => `${count} total`,
    noScheduleRegistered: 'No games scheduled here yet.',
    noSearchResults: 'No results found.',
    copy: 'Copy',
    copiedCheck: 'Copied ✓',
    expiredTag: 'Expired',
    expiredUntil: (label) => `${label} · expired`,
    copyAria: (code) => `Copy ${code}`,
    noActiveCoupons: 'No active codes right now. Check the recently-expired codes and how to redeem below.',
    officialRedeemPage: (name, term) => `Open ${name} official ${term} redemption page →`,
    pastCoupons: (term) => `Past ${term} (expired)`,
    couponIntro: (name, term) =>
      `${name} ${term} codes are free reward codes the publisher gives out during official broadcasts, major updates, and anniversary events. This page collects only codes verified on official channels and refreshes daily; expired codes stay visible for 90 days for reference. Codes are often first-come, first-served or time-limited, so redeem them as soon as they appear — some may require a specific server or account condition, so check each code's reward description.`,
    howToUse: (name, term) => `How to redeem ${name} ${term}`,
    faqTitle: (name, term) => `${name} ${term} FAQ`,
    otherGameCoupons: (term) => `Other games' ${term}`,
    gameHub: (name) => `${name} hub (coupons & schedule) →`,
    releaseInfo: (name) => `${name} release info →`,
    allCoupons: 'All game coupons →',
    lastUpdatedCouponNote: (dateLabel) => `Last updated: ${dateLabel}. Codes are verified against official channels and status changes when expired or exhausted.`,
    gameCoupons: 'Game Coupons',
    scheduleCount: (count) => `${count} scheduled`,
    scheduleTitle: (name) => `${name} release, update & event schedule`,
    upcomingTag: 'Upcoming',
    fullGameList: 'Full game list →',
    otherGameCouponsShort: 'Other game coupons →',
    noValidCodesShort: 'No active codes right now. See the dedicated page for recently expired codes and how to redeem.',
    hubLastUpdatedNote: (dateLabel) => `Last updated: ${dateLabel}. Codes and schedules are verified against official channels.`,
    couponFor: (name, term) => `${name} ${term}`,
    myWishlist: 'My Wishlist',
    myWishlistSub: 'Release schedules for games you’re watching.',
    wishlistEmptyText: 'No games in your wishlist yet.',
    wishlistEmptyHint: 'Tap the star button on a game’s page to add it.',
    releaseDateTba: 'Release date TBA',
    removeFromWishlistAria: (name) => `Remove ${name} from wishlist`,
    notifyTitle: 'Release notifications',
    notifyToggleAria: 'Toggle release notifications',
    notifyDeniedSub: 'Please allow notifications in your browser settings.',
    notifyNormalSub: 'We’ll notify you the day before and on the day your wishlisted games release.',
    notifyOnToast: 'Release notifications turned on',
    notifyOffToast: 'Release notifications turned off',
    notifyDeniedToast: 'Notification permission was denied',
    notifyFailToast: (reason) => `Notification setup failed: ${reason}`,
    notifyUnknownError: 'Unknown error',
    freeGamesAria: 'Free game giveaways',
    freeGamesTitle: 'Free right now',
    freeGamesTag: 'Epic Games',
    freeDaysLeft: (days) => `Free · ${days} day${days === 1 ? '' : 's'} left`,
    freeFromDate: (mmdd) => `Free from ${mmdd}`,
    appBottomNavAria: 'App bottom menu',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    recommendedSchedule: 'Recommended schedule',
    eventEnds: (title) => `${title} ends`,
  },
  ja: {
    searchPlaceholder: 'ゲームを検索…',
    wishlist: 'お気に入り',
    wishlistOnly: 'お気に入りのみ表示',
    today: '今日',
    noImage: '画像なし',
    lastUpdated: 'データ最終更新',
    noSchedule: '登録されている予定がありません。',
    totalCount: '合計',
    comingSoon: '発売間近',
    days: '日', hours: '時間', minutes: '分', seconds: '秒',
    weekdays: ['日', '月', '火', '水', '木', '金', '土'],
    close: '閉じる',
    official: '公式情報 →',
    addToWishlist: 'お気に入りに追加',
    removeFromWishlist: 'お気に入りから削除',
    share: '共有',
    comments: 'コメント',
    commentPlaceholder: 'このゲームへのコメント(最大500文字)',
    postComment: '投稿',
    nickname: 'ニックネーム',
    loading: '読み込み中…',
    released: '発売済み',
    goTo: '見る',
    prevMonth: '前月',
    nextMonth: '翌月',
    goToToday: '今日',
    noReleaseThisMonth: '今月の発売予定はありません。',
    swipeHint: 'スワイプまたは‹ ›で他の月を見る。',
    closePanel: 'パネルを閉じる',
    noScheduleThisDate: 'この日には予定がありません。',
    nextSchedule: '次の予定',
    todaySchedule: '本日の予定',
    presaleTag: '先行予約',
    generalSaleTag: '一般発売',
    deadlineTag: '締切',
    presaleStartBadge: '先行予約開始',
    presaleEndBadge: '先行予約締切',
    generalSaleStartBadge: '一般発売開始',
    generalSaleEndBadge: '一般発売締切',
    ongoing: '受付中',
    closed: '終了',
    all: 'すべて',
    categoryFilter: 'カテゴリ・イベントフィルター',
    prevYear: '前年',
    nextYear: '翌年',
    monthSelect: '月を選択',
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    noDateSet: '未定',
    noApproxGames: '発売日未定のゲームはありません。',
    noReleaseThisMonthYear: (label) => `${label}の発売予定はありません。`,
    pickOtherMonth: '上のタブから他の月を選んでください。',
    viewSource: '出典を見る',
    goToPresale: '先行予約はこちら',
    goToGeneralSale: '一般発売はこちら',
    favorited: 'お気に入り済み',
    favorite: 'お気に入り',
    fullPage: '詳細ページ',
    copied: 'コピーしました',
    ticketingLive: 'チケット発売中',
    ticketingTimeLeft: '締切までの時間',
    ticketingClosedText: '発売終了',
    ticketingDeadlineTba: '締切日は未定',
    ticketingInfo: 'チケット情報',
    startsOn: (label) => `${label}開始`,
    totalItems: (count) => `合計${count}件`,
    noScheduleRegistered: 'まだ登録されている予定がありません。',
    noSearchResults: '検索結果がありません。',
    copy: 'コピー',
    copiedCheck: 'コピーしました ✓',
    expiredTag: '期限切れ',
    expiredUntil: (label) => `${label}・期限切れ`,
    copyAria: (code) => `${code}をコピー`,
    noActiveCoupons: '現在有効なコードはありません。下記の最近期限切れになったコードと使い方をご確認ください。',
    officialRedeemPage: (name, term) => `${name}公式${term}登録ページを開く →`,
    pastCoupons: (term) => `過去の${term}(期限切れ)`,
    couponIntro: (name, term) =>
      `${name}の${term}は、公式配信や大型アップデート、記念イベントの際に配布される無料報酬コードです。このページは公式チャンネルで確認できたコードのみを毎日更新して掲載し、期限切れのコードも参考用に90日間表示します。コードは先着順・期間限定のことが多いため、公開されたらすぐに登録するのがおすすめです。サーバーやアカウントの条件が必要な場合もあるため、各コードの報酬内容をご確認ください。`,
    howToUse: (name, term) => `${name} ${term}の使い方`,
    faqTitle: (name, term) => `${name} ${term}によくある質問`,
    otherGameCoupons: (term) => `他のゲームの${term}`,
    gameHub: (name) => `${name}ハブ(クーポン・日程) →`,
    releaseInfo: (name) => `${name}の発売情報 →`,
    allCoupons: 'ゲームクーポン一覧 →',
    lastUpdatedCouponNote: (dateLabel) => `最終更新: ${dateLabel}。コードは公式チャンネルを基に確認しており、期限切れ・終了時は表示が変わります。`,
    gameCoupons: 'ゲームクーポン',
    scheduleCount: (count) => `${count}件の予定`,
    scheduleTitle: (name) => `${name}の発売・アップデート・イベント情報`,
    upcomingTag: '予定',
    fullGameList: 'ゲーム一覧を見る →',
    otherGameCouponsShort: '他のゲームクーポン →',
    noValidCodesShort: '現在有効なコードはありません。専用ページで最近期限切れのコードと使い方を確認できます。',
    hubLastUpdatedNote: (dateLabel) => `最終更新: ${dateLabel}。コード・日程は公式チャンネルを基に確認しています。`,
    couponFor: (name, term) => `${name} ${term}`,
    myWishlist: 'マイお気に入り',
    myWishlistSub: '気になるゲームの発売日程をまとめました。',
    wishlistEmptyText: 'まだお気に入りに追加したゲームがありません。',
    wishlistEmptyHint: 'ゲーム詳細ページのお気に入りボタンから追加できます。',
    releaseDateTba: '発売日未定',
    removeFromWishlistAria: (name) => `${name}をお気に入りから削除`,
    notifyTitle: '発売通知',
    notifyToggleAria: '発売通知の切り替え',
    notifyDeniedSub: 'ブラウザの設定で通知を許可してください。',
    notifyNormalSub: 'お気に入りゲームの発売前日と当日にお知らせします。',
    notifyOnToast: '発売通知をオンにしました',
    notifyOffToast: '発売通知をオフにしました',
    notifyDeniedToast: '通知の許可が拒否されました',
    notifyFailToast: (reason) => `通知の設定に失敗しました: ${reason}`,
    notifyUnknownError: '不明なエラー',
    freeGamesAria: '無料ゲーム配布',
    freeGamesTitle: '今すぐ無料',
    freeGamesTag: 'Epic Games',
    freeDaysLeft: (days) => `無料 · 残り${days}日`,
    freeFromDate: (mmdd) => `${mmdd}から無料`,
    appBottomNavAria: 'アプリ下部メニュー',
    switchToLight: 'ライトモードに切り替え',
    switchToDark: 'ダークモードに切り替え',
    recommendedSchedule: 'おすすめの日程',
    eventEnds: (title) => `${title} 終了`,
  },
};
