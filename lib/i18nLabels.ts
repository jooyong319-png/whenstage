// 다국어(/en, /ja) 페이지 공용 UI 문구 — 정적 딕셔너리(번역 API 미사용, 직접 작성).
import type { Category } from './types';

export type Locale = 'ko' | 'en' | 'ja';
export const LOCALES: Locale[] = ['ko', 'en', 'ja'];

// openGraph.locale용 — 각 페이지 generateMetadata가 명시적으로 지정해야 og:locale이 실제
// 페이지 언어와 항상 일치한다(안 넣으면 부모 레이아웃 기본값에 기댈 여지가 생김).
export const OG_LOCALE: Record<Locale, string> = { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP' };

// ko/en/ja는 서로 번역 관계가 아니라 국가별로 완전히 독립된 콘텐츠(lib/games.ts가
// locale별 data/concerts.{ko,en,ja}.json을 각각 읽음) — 그래서 게임명/설명에 별도
// 폴백 헬퍼가 필요 없음. 각 페이지가 자기 locale의 데이터를 그대로 씀.

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
  artistImageSourceNote: string;
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
  heroTitle: string;
  heroSubtitle: string;
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
    artistImageSourceNote: '사진 출처: 소속사 공식 프로필·보도자료 또는 위키미디어 커먼즈. 권리자 요청 시 삭제됩니다.',
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
    heroTitle: '콘서트·컴백·페스티벌, 한눈에',
    heroSubtitle: '매일 업데이트되는 내한·투어·발매 캘린더',
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
    artistImageSourceNote: 'Image source: official agency profile/press materials or Wikimedia Commons. Removed promptly upon a rights holder’s request.',
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
    siteDescription: 'Concerts, world tours, music releases (comebacks), festivals, and fan meetings — all in one calendar, updated daily.',
    heroTitle: 'Every Show, Right On Time',
    heroSubtitle: 'A daily-updated calendar for tours, comebacks & festivals',
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
    artistImageSourceNote: '画像出典: 所属事務所の公式プロフィール・報道資料またはWikimedia Commons。権利者の要請があれば速やかに削除します。',
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
    siteDescription: 'コンサート・来日公演、音源発売(カムバック)、フェスティバル、ファンミーティングの日程を一つのカレンダーに。毎日更新中。',
    heroTitle: 'コンサート・カムバック・フェスを一目で',
    heroSubtitle: '毎日更新される来日公演・カムバック・フェスカレンダー',
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
  ticketingLegend: string;
  onSaleNowBadge: string;
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
  viewSource: string;
  goToPresale: string;
  goToGeneralSale: string;
  presaleClosedLabel: string;
  generalSaleClosedLabel: string;
  favorited: string;
  favorite: string;
  fullPage: string;
  copied: string;
  ticketingTimeLeft: string;
  ticketingClosedText: string;
  ticketingDeadlineTba: string;
  ticketingInfo: string;
  totalItems: (count: number) => string;
  noSearchResults: string;
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
    ticketingLegend: '티켓팅',
    onSaleNowBadge: '예매중',
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
    viewSource: '출처 보기',
    goToPresale: '선예매 하러 가기',
    goToGeneralSale: '일반예매 하러 가기',
    presaleClosedLabel: '선예매 마감',
    generalSaleClosedLabel: '예매 마감',
    favorited: '즐겨찾기됨',
    favorite: '즐겨찾기',
    fullPage: '전체 페이지',
    copied: '복사됨',
    ticketingTimeLeft: '마감까지 남은 시간',
    ticketingClosedText: '판매 마감됨',
    ticketingDeadlineTba: '마감일 미정',
    ticketingInfo: '티켓팅 안내',
    totalItems: (count) => `총 ${count}개`,
    noSearchResults: '검색 결과가 없어요.',
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
    appBottomNavAria: '앱 하단 메뉴',
    switchToLight: '라이트 모드로 전환',
    switchToDark: '다크 모드로 전환',
    recommendedSchedule: '추천 일정',
    eventEnds: (title) => `${title} 종료`,
  },
  en: {
    searchPlaceholder: 'Search shows…',
    wishlist: 'Wishlist',
    wishlistOnly: 'Wishlist only',
    today: 'Today',
    noImage: 'No image',
    lastUpdated: 'Data last updated',
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
    ticketingLegend: 'Ticketing',
    onSaleNowBadge: 'On sale now',
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
    viewSource: 'View source',
    goToPresale: 'Go to presale',
    goToGeneralSale: 'Go to general sale',
    presaleClosedLabel: 'Presale closed',
    generalSaleClosedLabel: 'Sales closed',
    favorited: 'Favorited',
    favorite: 'Favorite',
    fullPage: 'Full page',
    copied: 'Copied',
    ticketingTimeLeft: 'Time left',
    ticketingClosedText: 'Sale closed',
    ticketingDeadlineTba: 'Deadline TBA',
    ticketingInfo: 'Ticketing info',
    totalItems: (count) => `${count} total`,
    noSearchResults: 'No results found.',
    myWishlist: 'My Wishlist',
    myWishlistSub: 'Shows and releases you’re watching, all in one place.',
    wishlistEmptyText: 'No shows in your wishlist yet.',
    wishlistEmptyHint: 'Tap the star button on a show’s page to add it.',
    releaseDateTba: 'Release date TBA',
    removeFromWishlistAria: (name) => `Remove ${name} from wishlist`,
    notifyTitle: 'Release notifications',
    notifyToggleAria: 'Toggle release notifications',
    notifyDeniedSub: 'Please allow notifications in your browser settings.',
    notifyNormalSub: 'We’ll notify you the day before and on the day of your wishlisted shows.',
    notifyOnToast: 'Release notifications turned on',
    notifyOffToast: 'Release notifications turned off',
    notifyDeniedToast: 'Notification permission was denied',
    notifyFailToast: (reason) => `Notification setup failed: ${reason}`,
    notifyUnknownError: 'Unknown error',
    appBottomNavAria: 'App bottom menu',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    recommendedSchedule: 'Recommended schedule',
    eventEnds: (title) => `${title} ends`,
  },
  ja: {
    searchPlaceholder: '公演名を検索…',
    wishlist: 'お気に入り',
    wishlistOnly: 'お気に入りのみ表示',
    today: '今日',
    noImage: '画像なし',
    lastUpdated: 'データ最終更新',
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
    ticketingLegend: 'チケット',
    onSaleNowBadge: '発売中',
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
    viewSource: '出典を見る',
    goToPresale: '先行予約はこちら',
    goToGeneralSale: '一般発売はこちら',
    presaleClosedLabel: '先行予約終了',
    generalSaleClosedLabel: '販売終了',
    favorited: 'お気に入り済み',
    favorite: 'お気に入り',
    fullPage: '詳細ページ',
    copied: 'コピーしました',
    ticketingTimeLeft: '締切までの時間',
    ticketingClosedText: '発売終了',
    ticketingDeadlineTba: '締切日は未定',
    ticketingInfo: 'チケット情報',
    totalItems: (count) => `合計${count}件`,
    noSearchResults: '検索結果がありません。',
    myWishlist: 'マイお気に入り',
    myWishlistSub: '気になる公演・発売日程をまとめました。',
    wishlistEmptyText: 'まだお気に入りに追加した日程がありません。',
    wishlistEmptyHint: '詳細ページのお気に入りボタンから追加できます。',
    releaseDateTba: '発売日未定',
    removeFromWishlistAria: (name) => `${name}をお気に入りから削除`,
    notifyTitle: '発売通知',
    notifyToggleAria: '発売通知の切り替え',
    notifyDeniedSub: 'ブラウザの設定で通知を許可してください。',
    notifyNormalSub: 'お気に入りの公演・発売の前日と当日にお知らせします。',
    notifyOnToast: '発売通知をオンにしました',
    notifyOffToast: '発売通知をオフにしました',
    notifyDeniedToast: '通知の許可が拒否されました',
    notifyFailToast: (reason) => `通知の設定に失敗しました: ${reason}`,
    notifyUnknownError: '不明なエラー',
    appBottomNavAria: 'アプリ下部メニュー',
    switchToLight: 'ライトモードに切り替え',
    switchToDark: 'ダークモードに切り替え',
    recommendedSchedule: 'おすすめの日程',
    eventEnds: (title) => `${title} 終了`,
  },
};
