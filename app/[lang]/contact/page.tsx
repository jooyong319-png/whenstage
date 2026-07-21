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
    title: '문의하기',
    description: 'WhenStage(whenstage.com) 문의처 — 정보 정정·삭제 요청, 제휴, 저작권, 개인정보 관련 문의를 받습니다.',
    alternates: { canonical: 'https://whenstage.com/ko/contact' },
  },
  en: {
    title: 'Contact',
    description: 'Contact WhenStage (whenstage.com) for corrections, removal requests, partnerships, copyright, or privacy inquiries.',
    alternates: { canonical: 'https://whenstage.com/en/contact' },
  },
  ja: {
    title: 'お問い合わせ',
    description: 'WhenStage(whenstage.com)へのお問い合わせ — 情報の訂正・削除依頼、提携、著作権、個人情報に関するご相談を受け付けています。',
    alternates: { canonical: 'https://whenstage.com/ja/contact' },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  return META[params.lang];
}

function KoBody() {
  return (
    <>
      <h1>문의하기</h1>
      <p>WhenStage(whenstage.com)를 이용해 주셔서 감사합니다. 아래 내용은 이메일로 문의해 주시면 확인 후 성실히 답변드리겠습니다.</p>

      <h2>이런 문의를 받습니다</h2>
      <ul>
        <li><strong>정보 정정·삭제 요청</strong> — 일정, 아티스트 정보, 게시글·댓글 등 잘못된 정보나 삭제가 필요한 내용</li>
        <li><strong>저작권·권리 관련</strong> — 아티스트명·이미지·상표 등 권리자의 수정·삭제 요청</li>
        <li><strong>개인정보 관련</strong> — 데이터 열람·삭제 요청 (자세한 내용은 개인정보처리방침 참고)</li>
        <li><strong>제휴·제보</strong> — 신규 공연·발매·페스티벌 정보 제보, 협업 제안</li>
      </ul>

      <h2>이메일</h2>
      <p><a href="mailto:devju546@gmail.com">devju546@gmail.com</a></p>
      <p>보내실 때 관련 페이지 링크나 구체적인 내용을 함께 적어주시면 더 빠르게 처리할 수 있습니다. 영업일 기준으로 순차 확인하며, 정정·삭제 요청은 확인되는 대로 반영합니다.</p>

      <h2>참고</h2>
      <p>본 서비스는 정보 제공(에디토리얼) 목적이며, 일정 등은 각 주최·기획사의 사정에 따라 변경될 수 있습니다. 최종 정보는 공식 출처를 함께 확인해 주세요. 서비스 소개는 <a href="/ko/about">소개 페이지</a>, 데이터 처리 방침은 <a href="/ko/privacy">개인정보처리방침</a>에서 확인하실 수 있습니다.</p>
    </>
  );
}

function EnBody() {
  return (
    <>
      <h1>Contact</h1>
      <p>Thanks for using WhenStage (whenstage.com). Email us with the details below and we&rsquo;ll review and respond.</p>

      <h2>We accept</h2>
      <ul>
        <li><strong>Correction / removal requests</strong> — incorrect dates, artist info, posts, or comments</li>
        <li><strong>Copyright / rights issues</strong> — requests from rights holders to edit or remove artist names, images, or trademarks</li>
        <li><strong>Privacy inquiries</strong> — data access/deletion requests (see our Privacy Policy for details)</li>
        <li><strong>Partnerships / tips</strong> — new concert, release, or festival info, or collaboration proposals</li>
      </ul>

      <h2>Email</h2>
      <p><a href="mailto:devju546@gmail.com">devju546@gmail.com</a></p>
      <p>Including a link to the relevant page and specific details helps us respond faster. We review requests on business days and act on corrections/removals as soon as they&rsquo;re verified.</p>

      <h2>Note</h2>
      <p>This service exists for informational (editorial) purposes, and dates may change at the discretion of each organizer. Please confirm final details with official sources. See our <a href="/en/about">About page</a> for more on the service, and our <a href="/en/privacy">Privacy Policy</a> for data handling.</p>
    </>
  );
}

function JaBody() {
  return (
    <>
      <h1>お問い合わせ</h1>
      <p>WhenStage(whenstage.com)をご利用いただきありがとうございます。以下の内容でメールいただければ、確認のうえ誠実にご対応いたします。</p>

      <h2>受け付けている内容</h2>
      <ul>
        <li><strong>情報の訂正・削除依頼</strong> — 発売日、ゲーム情報、投稿・コメントなど誤った情報や削除が必要な内容</li>
        <li><strong>著作権・権利関連</strong> — ゲーム名・画像・商標等について権利者様からの修正・削除依頼</li>
        <li><strong>個人情報関連</strong> — データの閲覧・削除依頼(詳細はプライバシーポリシーをご参照ください)</li>
        <li><strong>提携・情報提供</strong> — 新作ゲーム・サーバー・イベント情報の提供、協業のご提案</li>
      </ul>

      <h2>メール</h2>
      <p><a href="mailto:devju546@gmail.com">devju546@gmail.com</a></p>
      <p>該当ページのリンクや具体的な内容を添えていただくと、より迅速に対応できます。営業日順に確認し、訂正・削除依頼は確認でき次第反映いたします。</p>

      <h2>ご参考</h2>
      <p>本サービスは情報提供(エディトリアル)を目的としており、日程等は各主催者の事情により変更される場合があります。最終的な情報は公式情報源をご確認ください。サービス紹介は<a href="/ja/about">サイトについて</a>、データの取り扱いは<a href="/ja/privacy">プライバシーポリシー</a>をご覧ください。</p>
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
