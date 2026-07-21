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
    title: '소개',
    description: '콘서트 캘린더(whenstage.com)는 콘서트·내한 공연, 음원 발매(컴백), 페스티벌, 팬미팅 일정을 한곳에 모아 매일 직접 큐레이션하는 서비스입니다.',
    alternates: { canonical: 'https://whenstage.com/ko/about' },
  },
  en: {
    title: 'About',
    description: 'Concert Calendar (whenstage.com) curates concert & tour, music release, festival, and fan meeting schedules from around the world.',
    alternates: { canonical: 'https://whenstage.com/en/about' },
  },
  ja: {
    title: 'サイトについて',
    description: 'コンサートカレンダー(whenstage.com)はコンサート・来日公演、音源発売、フェスティバル、ファンミーティング情報を毎日キュレーションするサービスです。',
    alternates: { canonical: 'https://whenstage.com/ja/about' },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  return META[params.lang];
}

function KoBody() {
  return (
    <>
      <h1>콘서트 캘린더 소개</h1>
      <p><strong>콘서트 캘린더</strong>(whenstage.com)는 콘서트·내한 공연, 음원 발매(컴백), 페스티벌, 팬미팅 일정을 한곳에 모아 보여주는 서비스입니다. 흩어져 있는 일정 정보를 매일 직접 정리해, 다가오는 공연과 발매를 한눈에 확인할 수 있게 만들었습니다.</p>

      <h2>무엇을 다루나요</h2>
      <ul>
        <li><strong>콘서트·내한 공연</strong> 일정</li>
        <li><strong>음원 발매(컴백)</strong> 일정</li>
        <li><strong>페스티벌</strong> 라인업·일정</li>
        <li><strong>팬미팅</strong> 일정</li>
      </ul>

      <h2>어떻게 만드나요</h2>
      <p>모든 일정은 공식 공지·보도자료 등 신뢰할 수 있는 출처를 확인해 큐레이션합니다. <strong>정확성을 최우선</strong>으로 하며, 확인되지 않은 정보는 싣지 않습니다. 데이터는 매일 갱신됩니다.</p>

      <h2>주요 기능</h2>
      <ul>
        <li>월간 <strong>캘린더</strong> / <strong>리스트</strong> 뷰 전환</li>
        <li>카테고리·검색 필터, <strong>위시리스트</strong>(관심 일정 저장)</li>
        <li>상세 페이지에서 <strong>즐겨찾기</strong> · <strong>댓글</strong> · <strong>공유</strong></li>
        <li>각 일정 상세 페이지(일정·아티스트/기획사·공연장·태그·공식 출처)</li>
      </ul>

      <h2>안내</h2>
      <p>본 서비스는 정보 제공(에디토리얼) 목적이며, 아티스트명·이미지 등의 저작권은 각 권리자에게 있습니다. 일정 등 정보는 변경될 수 있으니 최종 확인은 공식 출처를 참고해 주세요.</p>

      <h2>문의</h2>
      <p>제휴·정정·삭제 요청 등: <a href="mailto:devju546@gmail.com">devju546@gmail.com</a></p>
    </>
  );
}

function EnBody() {
  return (
    <>
      <h1>About Concert Calendar</h1>
      <p><strong>Concert Calendar</strong> (whenstage.com) brings together concert & tour dates, music releases (comebacks), festival line-ups, and fan meeting schedules in one place. We manually curate scattered schedule information every day so you can see upcoming shows and releases at a glance.</p>

      <h2>What we cover</h2>
      <ul>
        <li><strong>Concerts & tours</strong></li>
        <li><strong>Music releases (comebacks)</strong></li>
        <li><strong>Festivals</strong></li>
        <li><strong>Fan meetings</strong></li>
      </ul>

      <h2>How it&rsquo;s made</h2>
      <p>Every schedule is curated from official announcements and press releases. We prioritize <strong>accuracy</strong> above all and don&rsquo;t publish unverified information. Data is refreshed daily.</p>

      <h2>Key features</h2>
      <ul>
        <li>Toggle between monthly <strong>calendar</strong> and <strong>list</strong> views</li>
        <li>Category/search filters, a <strong>wishlist</strong> to save shows you&rsquo;re watching</li>
        <li><strong>Favorites</strong>, <strong>comments</strong>, and <strong>sharing</strong> on detail pages</li>
        <li>Per-item detail pages with date, artist/agency, venue, tags, and official sources</li>
      </ul>

      <h2>Note</h2>
      <p>This service exists for informational (editorial) purposes. Artist names, images, and related copyrights belong to their respective owners. Dates and other details may change — please check official sources for the latest information.</p>

      <h2>Contact</h2>
      <p>For partnerships, corrections, or removal requests: <a href="mailto:devju546@gmail.com">devju546@gmail.com</a></p>
    </>
  );
}

function JaBody() {
  return (
    <>
      <h1>コンサートカレンダーについて</h1>
      <p><strong>コンサートカレンダー</strong>(whenstage.com)は、コンサート・来日公演、音源発売(カムバック)、フェスティバル、ファンミーティング情報を一箇所にまとめたサービスです。散らばった日程情報を毎日手作業で整理し、今後の公演や発売を一目で確認できるようにしています。</p>

      <h2>取り扱う情報</h2>
      <ul>
        <li><strong>コンサート・来日公演</strong></li>
        <li><strong>音源発売(カムバック)</strong></li>
        <li><strong>フェスティバル</strong></li>
        <li><strong>ファンミーティング</strong></li>
      </ul>

      <h2>どうやって作っているか</h2>
      <p>すべての日程は公式発表・プレスリリースなど信頼できる情報源を確認してキュレーションしています。<strong>正確性を最優先</strong>とし、未確認の情報は掲載しません。データは毎日更新されます。</p>

      <h2>主な機能</h2>
      <ul>
        <li>月間<strong>カレンダー</strong> / <strong>リスト</strong>表示の切り替え</li>
        <li>カテゴリ・検索フィルター、<strong>ウィッシュリスト</strong>(気になる公演の保存)</li>
        <li>詳細ページでの<strong>お気に入り</strong>・<strong>コメント</strong>・<strong>共有</strong></li>
        <li>各詳細ページ(日程・アーティスト/事務所・会場・タグ・公式情報源)</li>
      </ul>

      <h2>ご案内</h2>
      <p>本サービスは情報提供(エディトリアル)を目的としており、アーティスト名・画像等の著作権は各権利者に帰属します。日程などの情報は変更される場合がありますので、最終確認は公式情報源をご参照ください。</p>

      <h2>お問い合わせ</h2>
      <p>提携・訂正・削除のご依頼など: <a href="mailto:devju546@gmail.com">devju546@gmail.com</a></p>
    </>
  );
}

export default async function Page({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  return (
    <PageShell lang={params.lang}>
      <article className="legal">
        {params.lang === 'ko' ? <KoBody /> : params.lang === 'en' ? <EnBody /> : <JaBody />}
      </article>
    </PageShell>
  );
}
