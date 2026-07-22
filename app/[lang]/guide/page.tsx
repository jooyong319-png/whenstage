import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { LOCALES, type Locale } from '@/lib/i18nLabels';

interface Props { params: { lang: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

const META: Record<Locale, Metadata> = {
  ko: {
    title: '콘서트·티켓팅·페스티벌 가이드 | 자주 묻는 질문',
    description: '콘서트 사전예약/티켓팅, 페스티벌 라인업, 팬미팅, 일정 변동까지. 자주 묻는 질문을 한곳에 정리했습니다.',
    alternates: { canonical: 'https://whenstage.com/ko/guide' },
  },
  en: {
    title: 'Concert & Ticketing Guide | FAQ',
    description: 'Concert pre-registration/ticketing, festival line-ups, fan meetings, and why dates change — answers to common questions.',
    alternates: { canonical: 'https://whenstage.com/en/guide' },
  },
  ja: {
    title: 'コンサート・チケット・フェスガイド | よくある質問',
    description: 'コンサートのチケット先行、フェスラインナップ、ファンミーティング、日程変更まで、よくある質問をまとめました。',
    alternates: { canonical: 'https://whenstage.com/ja/guide' },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  return META[params.lang];
}

interface Faq { q: string; a: string; }

const FAQS: Record<Locale, Faq[]> = {
  ko: [
    { q: '콘서트 사전예약/티켓팅이란 무엇인가요?', a: '공연 티켓이 정식 판매되기 전에 팬클럽·회원 대상으로 먼저 열리는 선예매를 말합니다. 인기 공연은 일반 예매 전에 매진되는 경우가 많아 사전예약 일정을 챙기는 것이 중요합니다.' },
    { q: '선예매와 일반예매는 뭐가 다른가요?', a: '<strong>선예매</strong>는 팬클럽 회원이나 특정 카드사 고객 등 자격이 있는 사람만 먼저 참여할 수 있는 구간이고, <strong>일반예매</strong>는 자격 제한 없이 누구나 참여하는 공개 예매입니다. 인기 공연은 선예매에서 좌석 대부분이 소진되는 경우가 많습니다.' },
    { q: '해외에서도 내한 공연 티켓을 예매할 수 있나요?', a: '대부분의 국내 예매처는 해외 발급 카드 결제를 지원합니다. 다만 본인인증에 국내 휴대폰 번호가 필요한 경우가 있어, 대리 수령이 가능한지 예매처 공지를 미리 확인하는 것이 좋습니다.' },
    { q: '사이트에 표시된 티켓팅 시각은 어느 기준인가요?', a: '공연이 실제로 열리는 지역의 현지 시각 기준입니다. 해외 공연은 시차 때문에 착각하기 쉬우니, 상세 페이지에 표시된 시간대(KST, PST 등)를 꼭 확인하세요.' },
    { q: '공연 일정은 왜 자주 바뀌나요?', a: '아티스트 스케줄, 공연장 사정, 컨디션 등 여러 이유로 연기·변경될 수 있습니다. 정확한 일정은 공식 채널을 함께 확인하는 것이 좋습니다.' },
    { q: '페스티벌 라인업은 언제 확정되나요?', a: '보통 공연 몇 달 전부터 순차적으로 헤드라이너부터 발표되며, 전체 라인업은 공연에 가까워질수록 확정됩니다.' },
    { q: '팬미팅과 콘서트는 뭐가 다른가요?', a: '팬미팅은 소규모 팬 교류 중심 행사로 토크·게임 등이 포함되고, 콘서트는 공연 자체가 중심인 대형 행사입니다.' },
    { q: '일정 알림을 받을 수 있나요?', a: '네. 관심 있는 일정을 즐겨찾기에 담아두면 공연 하루 전과 당일에 알림을 받을 수 있습니다.' },
    { q: '아티스트별로 일정을 모아 볼 수 있나요?', a: '네. 상단 메뉴의 "아티스트"에서 아티스트를 선택하면 그 아티스트의 발매·투어·팬미팅 일정을 한 번에 확인할 수 있습니다.' },
  ],
  en: [
    { q: 'What is concert pre-registration / early ticketing?', a: 'Early ticket sales open to fan club members before general sale. Popular shows often sell out before general sale, so it&rsquo;s worth tracking early access dates.' },
    { q: 'What&rsquo;s the difference between presale and general sale?', a: '<strong>Presale</strong> is open only to eligible fans (fan club members, certain cardholders, etc.), while <strong>general sale</strong> is open to everyone with no restrictions. For popular shows, most seats are often gone by the time general sale opens.' },
    { q: 'Can I buy tickets from outside the country?', a: 'Most Korean ticketing platforms accept international cards. Some require identity verification with a Korean phone number, so it&rsquo;s worth checking in advance whether proxy pickup is allowed.' },
    { q: 'What time zone are the ticketing times shown in?', a: 'All times shown are local to where the show actually takes place. This matters most for international tours — always double-check the time zone label (KST, PST, etc.) on the event page.' },
    { q: 'Why do concert dates change so often?', a: 'Dates can shift due to artist schedules, venue availability, or other circumstances. Always confirm the latest info with official channels.' },
    { q: 'When is a festival line-up confirmed?', a: 'Headliners are usually announced first, months ahead, with the full line-up confirmed closer to the event.' },
    { q: 'What&rsquo;s the difference between a fan meeting and a concert?', a: 'Fan meetings are smaller, interactive events (talk segments, games), while concerts are larger performance-focused shows.' },
    { q: 'Can I get schedule notifications?', a: 'Yes — add a show to your wishlist and you&rsquo;ll get notified the day before and on the day of the event.' },
    { q: 'Can I see all of an artist&rsquo;s schedules in one place?', a: 'Yes — go to "Artists" in the top menu and select an artist to see their full schedule of releases, tours, and fan meetings.' },
  ],
  ja: [
    { q: 'コンサートのチケット先行/事前予約とは何ですか?', a: '一般発売前にファンクラブ会員向けに行われる先行販売です。人気公演は一般発売前に完売することが多いため、先行日程の確認が重要です。' },
    { q: '先行予約と一般発売の違いは何ですか?', a: '<strong>先行予約</strong>はファンクラブ会員や特定のカード会社の顧客など、資格のある方のみが参加できる枠で、<strong>一般発売</strong>は誰でも参加できる公開販売です。人気公演は先行予約でほとんどの座席が埋まることが多いです。' },
    { q: '海外からでも来日公演のチケットを購入できますか?', a: '国内の主要チケットサイトの多くは海外発行のカード決済に対応しています。ただし本人確認に日本の電話番号が必要な場合があるため、代理受け取りが可能かどうか事前に確認することをおすすめします。' },
    { q: 'サイトに表示されているチケット時刻はどの基準ですか?', a: '公演が実際に開催される地域の現地時間です。海外公演は時差で勘違いしやすいため、詳細ページに表示されているタイムゾーン(JST、PSTなど)を必ずご確認ください。' },
    { q: '公演日程はなぜよく変わるのですか?', a: 'アーティストのスケジュールや会場の都合など様々な理由で変更される場合があります。最新情報は公式チャンネルでご確認ください。' },
    { q: 'フェスのラインナップはいつ確定しますか?', a: '通常、開催の数ヶ月前からヘッドライナーが順次発表され、全体のラインナップは開催が近づくにつれて確定します。' },
    { q: 'ファンミーティングとコンサートの違いは?', a: 'ファンミーティングはトークやゲームなど交流中心の小規模イベント、コンサートはパフォーマンス中心の大規模公演です。' },
    { q: '日程の通知は受け取れますか?', a: 'はい。気になる公演をウィッシュリストに追加すると、前日と当日に通知が届きます。' },
    { q: 'アーティストごとに日程をまとめて見られますか?', a: 'はい。上部メニューの「アーティスト」からアーティストを選ぶと、発売・ツアー・ファンミーティングの全日程を一度に確認できます。' },
  ],
};

const FOOTER_H2: Record<Locale, string> = {
  ko: '매일 업데이트되는 공연·발매 일정',
  en: 'Daily-updated concert & release schedules',
  ja: '毎日更新される公演・発売日程',
};
const FOOTER_P: Record<Locale, string> = {
  ko: 'WhenStage(whenstage.com)는 콘서트·내한 공연, 음원 발매, 페스티벌, 팬미팅 일정을 매일 새로 정리합니다.',
  en: 'WhenStage (whenstage.com) refreshes concert, release, festival, and fan meeting schedules every day.',
  ja: 'WhenStage(whenstage.com)はコンサート・来日公演、音源発売、フェス、ファンミーティング情報を毎日整理しています。',
};

export default async function Page({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const faqs = FAQS[lang];

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
    })),
  };

  return (
    <PageShell lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <article className="legal">
        <h1>{META[lang].title as string}</h1>
        {faqs.map(f => (
          <section key={f.q}>
            <h2>{f.q}</h2>
            <p dangerouslySetInnerHTML={{ __html: f.a }} />
          </section>
        ))}
        <h2>{FOOTER_H2[lang]}</h2>
        <p>{FOOTER_P[lang]}</p>
      </article>
    </PageShell>
  );
}
