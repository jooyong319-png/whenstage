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
    title: '콘서트·티켓팅 용어 사전 | 가이드',
    description: '선예매, 취켓팅, 스탠딩석, 앵콜 공연 등 콘서트·티켓팅에서 자주 쓰이는 용어를 정리했습니다.',
    alternates: { canonical: 'https://whenstage.com/ko/guide/glossary' },
  },
  en: {
    title: 'Concert & Ticketing Glossary | Guide',
    description: 'Presale, general admission, encore shows, and more — a glossary of common concert and ticketing terms.',
    alternates: { canonical: 'https://whenstage.com/en/guide/glossary' },
  },
  ja: {
    title: 'コンサート・チケット用語集 | ガイド',
    description: '先行予約、電子チケット、特典会など、コンサート・チケットでよく使われる用語をまとめました。',
    alternates: { canonical: 'https://whenstage.com/ja/guide/glossary' },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  return META[params.lang];
}

interface Term { term: string; def: string; }

const TERMS: Record<Locale, Term[]> = {
  ko: [
    { term: '선예매', def: '정식 판매(일반예매) 전에 팬클럽 회원 등 자격이 있는 사람만 참여할 수 있는 사전 판매입니다.' },
    { term: '일반예매', def: '자격 제한 없이 누구나 참여할 수 있는 공개 판매입니다.' },
    { term: '티켓 오픈', def: '예매(선예매 또는 일반예매)가 실제로 시작되는 시각을 말합니다.' },
    { term: '취켓팅', def: '이미 판매됐던 티켓이 취소·환불되며 다시 풀리는 순간을 노려 재예매하는 것을 말합니다.' },
    { term: '매크로', def: '자동으로 빠르게 새로고침·클릭해 부정하게 예매하는 프로그램입니다. 대부분의 예매처 약관과 법으로 금지돼 있습니다.' },
    { term: '대리티켓팅', def: '타인의 명의나 결제수단으로 대신 예매해주는 행위로, 예매처 약관 위반인 경우가 많습니다.' },
    { term: '스탠딩석', def: '좌석 없이 서서 관람하는 구역으로, 보통 무대와 가장 가깝습니다.' },
    { term: '지정석', def: '좌석 번호가 정해져 있는 구역입니다.' },
    { term: '얼리버드', def: '초반 한정 수량을 할인가로 판매하는 티켓입니다.' },
    { term: '내한공연', def: '해외 아티스트가 방한해 국내에서 여는 공연을 말합니다.' },
    { term: '앵콜 공연', def: '정규 공연이 끝난 뒤 팬들의 반응에 힘입어 추가로 편성되는 공연입니다.' },
    { term: '팬클럽', def: '아티스트나 소속사가 공인한 유료 멤버십으로, 가입하면 대개 선예매 자격이 주어집니다.' },
    { term: '컴백', def: '신곡이나 새 앨범 발매와 함께 아티스트가 활동을 재개하는 것을 말합니다.' },
    { term: '타이틀곡', def: '앨범 수록곡 중 대표곡으로 내세워 홍보하는 메인 트랙입니다.' },
    { term: '쇼케이스', def: '신보 발매를 기념해 여는 소규모 무대 또는 기자간담회입니다.' },
    { term: '팬사인회', def: '응모나 앨범 구매 등을 통해 당첨된 팬이 아티스트와 직접 만나는 행사입니다.' },
    { term: '굿즈', def: '응원봉, 포토카드 등 공연·소속사가 판매하는 공식 상품입니다.' },
    { term: '리셀/암표', def: '정가보다 비싸게 티켓을 되파는 행위입니다. 대부분 불법이며, 본 사이트는 이를 권장하지 않습니다.' },
  ],
  en: [
    { term: 'Presale', def: 'Early ticket access limited to eligible fans — fan club members, certain cardholders, etc. — before general sale opens.' },
    { term: 'General Sale', def: 'The public ticket sale, open to anyone with no membership or eligibility required.' },
    { term: 'Ticket Open', def: 'The exact date and time tickets (presale or general sale) actually go on sale.' },
    { term: 'Cancellation Ticketing', def: 'Rebuying tickets the moment they’re released back into the pool after another buyer cancels or gets refunded — common on Korean ticketing sites for sold-out shows.' },
    { term: 'Bots / Macros', def: 'Automated scripts that refresh and click faster than a human to unfairly grab tickets. Against most platforms’ terms, and illegal in many places.' },
    { term: 'Proxy Ticketing', def: 'Having someone else buy tickets on your behalf using their account or card — often against a ticketing platform’s terms of service.' },
    { term: 'Standing / GA (General Admission)', def: 'An unassigned standing area, usually the section closest to the stage.' },
    { term: 'Reserved Seating', def: 'A section where each ticket has an assigned seat number.' },
    { term: 'Early Bird', def: 'A limited batch of tickets sold at a discounted price before regular pricing begins.' },
    { term: 'Encore Show', def: 'An additional performance added after the main run, usually scheduled due to strong demand.' },
    { term: 'Fan Club', def: 'An artist’s official paid membership program, which often grants presale eligibility.' },
    { term: 'Comeback', def: 'An artist returning to active promotion with a new single or album — a term that originated in K-pop but is now used more broadly.' },
    { term: 'Title Track', def: 'The lead single an artist promotes as the main track from an album.' },
    { term: 'Showcase', def: 'A small-scale stage performance or press event held to mark a new release.' },
    { term: 'Fansign', def: 'A meet-and-greet event fans are selected for, typically through album purchases or a lottery.' },
    { term: 'Merch (Goods)', def: 'Official artist or venue merchandise, such as lightsticks or photocards.' },
    { term: 'Resale / Scalping', def: 'Reselling tickets above face value. Mostly illegal or against platform rules — not something this site endorses.' },
  ],
  ja: [
    { term: '先行予約(先行抽選)', def: '一般発売の前に、ファンクラブ会員などが応募できる抽選販売です。' },
    { term: '最速先行', def: '複数ある先行の中で最も早く実施される先行で、当選確率が高いとされることが多いです。' },
    { term: '一般発売', def: '資格制限なく誰でも購入できる公開販売です。' },
    { term: 'チケット発売日', def: 'チケットの販売(先行・一般)が実際に開始される日時です。' },
    { term: '電子チケット', def: 'スマートフォンの画面を提示して入場するデジタル形式のチケットです。' },
    { term: 'オールスタンディング', def: '座席がなく立ち見で観覧するエリアで、通常ステージに最も近い区画です。' },
    { term: '指定席', def: '座席番号があらかじめ指定されているエリアです。' },
    { term: 'アンコール公演', def: '本公演終了後、好評につき追加で編成される公演です。' },
    { term: '会員先行', def: 'ファンクラブ会員を対象にした先行販売のことです。' },
    { term: 'カムバック', def: '新曲や新アルバムを引っさげてアーティストが活動を再開することを指す、韓国発の言葉です。' },
    { term: '表題曲', def: 'アルバムの中でメインとして打ち出し、宣伝する楽曲です。' },
    { term: '特典会', def: '購入者や当選者がアーティストと直接交流できるイベント(握手会・サイン会など)です。' },
    { term: '物販', def: '会場やオンラインで販売される公式グッズ(ペンライト・トレカなど)のことです。' },
    { term: 'トレカ', def: 'アルバムなどに封入される、メンバーの写真が入ったトレーディングカードです。' },
    { term: '転売・ダフ屋', def: '定価より高額でチケットを不正に転売する行為です。多くの場合、違法または規約違反にあたります。' },
    { term: 'リセールチケット', def: '公式が用意する、正規価格でのチケット再販システムです。不正転売とは異なり合法です。' },
  ],
};

const BACK_LABEL: Record<Locale, string> = { ko: '← 가이드로', en: '← Back to Guide', ja: '← ガイドへ' };

export default async function GlossaryPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const terms = TERMS[lang];

  return (
    <PageShell lang={lang}>
      <article className="legal">
        <a href={`/${lang}/guide`} className="detail-link">{BACK_LABEL[lang]}</a>
        <h1>{META[lang].title as string}</h1>
        <dl>
          {terms.map(t => (
            <div key={t.term} style={{ marginBottom: '1.1rem' }}>
              <dt style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{t.term}</dt>
              <dd style={{ margin: 0, color: 'var(--text-faint)' }}>{t.def}</dd>
            </div>
          ))}
        </dl>
      </article>
    </PageShell>
  );
}
