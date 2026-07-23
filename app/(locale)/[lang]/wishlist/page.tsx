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
  ko: { title: '내 위시리스트', description: '저장한 공연·발매 일정을 한곳에서 확인하세요.', robots: { index: false, follow: true } },
  en: { title: 'My Wishlist', description: 'Your saved shows and release schedules, all in one place.', robots: { index: false, follow: true } },
  ja: { title: 'マイウィッシュリスト', description: '保存した公演・発売日程を一箇所で確認できます。', robots: { index: false, follow: true } },
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
