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
    title: '이용약관',
    description: '콘서트 캘린더(whenstage.com) 이용약관 — 서비스 내용, 댓글 운영 방침, 저작권 및 면책 사항에 대한 안내.',
    alternates: { canonical: 'https://whenstage.com/ko/terms' },
  },
  en: {
    title: 'Terms of Service',
    description: 'WhenStage (whenstage.com) terms of service — service description, comment policy, copyright, and disclaimers.',
    alternates: { canonical: 'https://whenstage.com/en/terms' },
  },
  ja: {
    title: '利用規約',
    description: 'WhenStage(whenstage.com)利用規約 — サービス内容、コメント運営方針、著作権および免責事項について。',
    alternates: { canonical: 'https://whenstage.com/ja/terms' },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  return META[params.lang];
}

function KoBody() {
  return (
    <>
      <h1>이용약관</h1>

      <h2>제1조 (목적)</h2>
      <p>본 약관은 콘서트 캘린더(whenstage.com, 이하 &ldquo;서비스&rdquo;)가 제공하는 서비스의 이용 조건과 절차를 규정합니다.</p>

      <h2>제2조 (서비스 내용)</h2>
      <ul>
        <li>서비스는 국내외 콘서트·내한 공연 일정, 음원 발매(컴백), 페스티벌 및 팬미팅 정보를 무료로 제공합니다.</li>
        <li>게재된 일정 등 정보는 변경될 수 있으며, 서비스는 정보의 정확성과 완전성을 보장하지 않습니다. 최종 정보는 각 주최·기획사의 공식 출처를 확인해 주세요.</li>
      </ul>

      <h2>제3조 (이용자 게시물·댓글)</h2>
      <p>이용자는 댓글을 작성할 수 있으나, 다음 행위를 해서는 안 됩니다.</p>
      <ul>
        <li>욕설·비방·차별·혐오 표현</li>
        <li>음란·불법 정보, 광고·스팸, 도배 행위</li>
        <li>타인의 저작권·개인정보 등 권리를 침해하는 행위</li>
      </ul>
      <p>운영자는 위 사항을 위반하거나 부적절하다고 판단되는 게시물을 사전 통지 없이 삭제할 수 있습니다.</p>

      <h2>제4조 (저작권)</h2>
      <ul>
        <li>서비스에 표시되는 아티스트명·이미지 등은 각 권리자에게 저작권이 있으며, 서비스는 정보 제공(에디토리얼) 목적으로 이를 인용합니다.</li>
        <li>권리자의 요청이 있는 경우 해당 콘텐츠를 신속히 수정·삭제합니다.</li>
      </ul>

      <h2>제5조 (면책 조항)</h2>
      <ul>
        <li>서비스는 무료로 제공되며, 정보의 정확성, 서비스 중단, 외부 링크 등으로 발생한 손해에 대해 책임을 지지 않습니다.</li>
        <li>서비스가 연결하는 외부 사이트의 내용에 대해서는 책임을 지지 않습니다.</li>
      </ul>

      <h2>제6조 (약관의 변경)</h2>
      <p>본 약관은 필요에 따라 변경될 수 있으며, 변경 시 본 페이지에 게시합니다.</p>

      <h2>제7조 (문의)</h2>
      <p>문의처: <a href="mailto:devju546@gmail.com">devju546@gmail.com</a></p>

      <p className="legal-updated">시행일: 2026년 6월 16일</p>
    </>
  );
}

function EnBody() {
  return (
    <>
      <h1>Terms of Service</h1>

      <h2>Article 1 (Purpose)</h2>
      <p>These Terms govern the conditions and procedures for using the services provided by WhenStage (whenstage.com, the &ldquo;Service&rdquo;).</p>

      <h2>Article 2 (Service description)</h2>
      <ul>
        <li>The Service provides concert & tour, music release, festival, and fan meeting schedules from Korea and worldwide, free of charge.</li>
        <li>Published dates and other information may change, and the Service does not guarantee their accuracy or completeness. Please confirm final details with each event&rsquo;s official sources.</li>
      </ul>

      <h2>Article 3 (User posts / comments)</h2>
      <p>Users may post comments, but must not engage in the following:</p>
      <ul>
        <li>Abusive, defamatory, discriminatory, or hateful speech</li>
        <li>Obscene or illegal content, advertising/spam, or flooding</li>
        <li>Infringing others&rsquo; copyright, personal data, or other rights</li>
      </ul>
      <p>The operator may remove posts that violate the above or are otherwise inappropriate, without prior notice.</p>

      <h2>Article 4 (Copyright)</h2>
      <ul>
        <li>Artist names, images, and similar content shown on the Service belong to their respective rights holders and are cited for informational (editorial) purposes.</li>
        <li>Upon a rights holder&rsquo;s request, the relevant content will be promptly edited or removed.</li>
      </ul>

      <h2>Article 5 (Disclaimer)</h2>
      <ul>
        <li>The Service is provided free of charge, and is not liable for damages arising from information accuracy, service interruption, or external links.</li>
        <li>The Service is not responsible for the content of external sites it links to.</li>
      </ul>

      <h2>Article 6 (Changes to these Terms)</h2>
      <p>These Terms may be revised as needed, and any changes will be posted on this page.</p>

      <h2>Article 7 (Contact)</h2>
      <p>Contact: <a href="mailto:devju546@gmail.com">devju546@gmail.com</a></p>

      <p className="legal-updated">Effective date: June 16, 2026</p>
    </>
  );
}

function JaBody() {
  return (
    <>
      <h1>利用規約</h1>

      <h2>第1条(目的)</h2>
      <p>本規約は、WhenStage(whenstage.com、以下「本サービス」)が提供するサービスの利用条件および手続きについて定めるものです。</p>

      <h2>第2条(サービス内容)</h2>
      <ul>
        <li>本サービスは、国内外のコンサート・来日公演、音源発売、フェスティバル、ファンミーティング情報を無料で提供します。</li>
        <li>掲載された日程等の情報は変更される場合があり、本サービスは情報の正確性・完全性を保証しません。最終的な情報は各公演の公式情報源をご確認ください。</li>
      </ul>

      <h2>第3条(利用者投稿・コメント)</h2>
      <p>利用者はコメントを投稿できますが、以下の行為をしてはなりません。</p>
      <ul>
        <li>暴言・誹謗中傷・差別・ヘイト表現</li>
        <li>わいせつ・違法情報、広告・スパム、荒らし行為</li>
        <li>他者の著作権・個人情報等の権利を侵害する行為</li>
      </ul>
      <p>運営者は上記に違反する、または不適切と判断した投稿を、事前通知なく削除できます。</p>

      <h2>第4条(著作権)</h2>
      <ul>
        <li>本サービスに表示されるアーティスト名・画像等は各権利者に著作権があり、本サービスは情報提供(エディトリアル)目的でこれらを引用しています。</li>
        <li>権利者からの要請があった場合、該当コンテンツを速やかに修正・削除します。</li>
      </ul>

      <h2>第5条(免責事項)</h2>
      <ul>
        <li>本サービスは無料で提供され、情報の正確性、サービスの中断、外部リンク等により生じた損害について責任を負いません。</li>
        <li>本サービスに含まれる外部サイトのリンク先の内容について責任を負いません。</li>
      </ul>

      <h2>第6条(規約の変更)</h2>
      <p>本規約は必要に応じて変更される場合があり、変更時は本ページに掲示します。</p>

      <h2>第7条(お問い合わせ)</h2>
      <p>お問い合わせ: <a href="mailto:devju546@gmail.com">devju546@gmail.com</a></p>

      <p className="legal-updated">施行日: 2026年6月16日</p>
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
