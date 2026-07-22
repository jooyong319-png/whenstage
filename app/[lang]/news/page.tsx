import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllNews, formatPostDate } from '@/lib/news';
import { PageShell } from '@/components/PageShell';
import { BlogImg } from '@/components/BlogImg';
import { LOCALES, type Locale } from '@/lib/i18nLabels';
import styles from '@/app/blog/blog.module.css';
import n from '@/app/news/news.module.css';

interface Props { params: { lang: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

const META: Record<Locale, Metadata> = {
  ko: {
    title: '공연 뉴스 | 신규 소식, 업데이트, 발표',
    description: '국내외 콘서트·페스티벌·발매 관련 신규 소식, 일정 변경, 사전예약, 발표를 매일 정리합니다.',
    alternates: { canonical: 'https://whenstage.com/ko/news' },
  },
  en: {
    title: 'News | New Announcements, Updates, Ticketing',
    description: 'Daily-curated concert and release news from Korea and worldwide — announcements, updates, and pre-registration.',
    alternates: { canonical: 'https://whenstage.com/en/news' },
  },
  ja: {
    title: 'ニュース | 新着情報・アップデート・発売情報',
    description: '国内外のコンサート・フェス・発売関連の新着情報、日程変更、先行予約情報を毎日整理。',
    alternates: { canonical: 'https://whenstage.com/ja/news' },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  return META[params.lang];
}

const H2: Record<Locale, string> = { ko: '공연 뉴스', en: 'News', ja: 'ニュース' };
const SUBTITLE: Record<Locale, string> = {
  ko: '신규 소식, 일정 변경, 사전예약, 발표 소식을 매일 정리합니다.',
  en: 'Announcements, updates, and pre-registration news — curated daily.',
  ja: '新着情報、日程変更、先行予約情報を毎日整理。',
};
const EMPTY: Record<Locale, string> = { ko: '아직 뉴스가 없습니다. 곧 채워질 예정이에요!', en: 'No news yet — check back soon!', ja: 'まだニュースがありません。近日公開予定です!' };

export default async function Page({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const items = await getAllNews(lang);

  return (
    <PageShell lang={lang}>
      <section className={styles.indexSection}>
        <header className={styles.header}>
          <h1 className={styles.title}><svg className="ic" aria-hidden="true"><use href="#ic-flame" /></svg> {H2[lang]}</h1>
          <p className={styles.subtitle}>{SUBTITLE[lang]}</p>
        </header>

        {items.length === 0 ? (
          <p className={styles.empty}>{EMPTY[lang]}</p>
        ) : (
          <ul className={styles.postList}>
            {items.map(it => (
              <li key={it.slug} className={it.heroImage ? `${styles.postCard} ${styles.postCardThumb}` : styles.postCard}>
                <a href={`/${lang}/news/${it.slug}`} className={styles.postLink}>
                  {it.heroImage && <BlogImg src={it.heroImage} containerClassName={styles.thumb} />}
                  <div className={styles.postCardBody}>
                    <time className={styles.postDate}>
                      {formatPostDate(it.date)}
                      {it.source && <span className={n.sourceBadge}>{it.source}</span>}
                    </time>
                    <h3 className={styles.postTitle}>{it.title}</h3>
                    {it.description && <p className={styles.postDesc}>{it.description}</p>}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
