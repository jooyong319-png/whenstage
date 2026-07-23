import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllGames, getLastUpdated } from '@/lib/games';
import { Home } from '@/components/Home';
import { UI, LOCALES, type Locale } from '@/lib/i18nLabels';

interface Props {
  params: { lang: string };
}

function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const ui = UI[params.lang];
  const url = `https://whenstage.com/${params.lang}`;
  return {
    title: ui.siteName,
    description: ui.siteDescription,
    alternates: {
      canonical: url,
      languages: {
        ko: 'https://whenstage.com/ko',
        en: 'https://whenstage.com/en',
        ja: 'https://whenstage.com/ja',
        'x-default': 'https://whenstage.com/',
      },
    },
    openGraph: { title: ui.siteName, description: ui.siteDescription, url, type: 'website' },
  };
}

export default async function LocaleHomePage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];

  const games = await getAllGames(lang);
  const lastUpdated = await getLastUpdated(lang);
  const serverNow = new Date().toISOString();

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ui.siteName,
    url: `https://whenstage.com/${lang}`,
    description: ui.siteDescription,
    inLanguage: lang,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <Home initialGames={games} lastUpdated={lastUpdated} serverNow={serverNow} />
    </>
  );
}
