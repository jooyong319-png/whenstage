import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllGames } from '@/lib/games';
import { PageShell } from '@/components/PageShell';
import { WishlistView } from '@/components/WishlistView';
import { LOCALES, type Locale } from '@/lib/i18nLabels';

interface Props { params: { lang: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

const META: Record<Locale, Metadata> = {
  ko: { title: '내 알림', description: '팔로우한 가수와 찜한 공연의 새 공연·예매 오픈 알림.', robots: { index: false, follow: true } },
  en: { title: 'My alerts', description: 'New shows and ticket sales for the artists you follow and the shows you saved.', robots: { index: false, follow: true } },
  ja: { title: 'マイ通知', description: 'フォロー中のアーティストと保存した公演の新着・発売開始のお知らせ。', robots: { index: false, follow: true } },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  return META[params.lang];
}

export default async function Page({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const games = await getAllGames(lang);
  return (
    <PageShell lang={lang}>
      <WishlistView games={games} />
    </PageShell>
  );
}
