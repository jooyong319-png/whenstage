import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, formatPostDate } from '@/lib/blog';
import { PageShell } from '@/components/PageShell';
import { BlogImg } from '@/components/BlogImg';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { LOCALES, type Locale } from '@/lib/i18nLabels';
import styles from '@/app/blog/blog.module.css';

interface Props { params: { lang: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

const META: Record<Locale, Metadata> = {
  ko: {
    title: '모아보기 | 발매 픽, 월간 정리, TOP 리스트',
    description: '신작 발매 픽, 월간·반기 정리, 기대작 TOP 리스트 등 WhenStage가 직접 정리하는 모아보기.',
    alternates: { canonical: 'https://whenstage.com/ko/blog' },
  },
  en: {
    title: 'Roundups | New Release Picks, Monthly Summaries, Top Lists',
    description: 'New release picks, monthly and half-year roundups, and most-anticipated lists — curated by WhenStage.',
    alternates: { canonical: 'https://whenstage.com/en/blog' },
  },
  ja: {
    title: 'まとめ記事 | 新作おすすめ・発売情報まとめ・TOPリスト',
    description: '新作おすすめ、月間・下半期発売まとめ、期待作TOPリストなど、WhenStageがキュレーションするまとめ記事。',
    alternates: { canonical: 'https://whenstage.com/ja/blog' },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  return META[params.lang];
}

const H2: Record<Locale, string> = { ko: '모아보기', en: 'Roundups', ja: 'まとめ記事' };
const SUBTITLE: Record<Locale, string> = {
  ko: '발매 픽, 기대작 TOP 리스트, 월간·반기 정리를 모아봅니다.',
  en: 'New release picks, most-anticipated top lists, and monthly/half-year roundups.',
  ja: '新作おすすめ、期待作TOPリスト、月間・下半期発売まとめ。',
};
const EMPTY: Record<Locale, string> = { ko: '아직 글이 없습니다. 곧 채워질 예정이에요!', en: 'No posts yet — check back soon!', ja: 'まだ記事がありません。近日公開予定です!' };

export default async function Page({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const posts = await getAllPosts(lang);

  return (
    <PageShell lang={lang}>
      <section className={styles.indexSection}>
        <header className={styles.header}>
          <h1 className={styles.title}><svg className="ic" aria-hidden="true"><use href="#ic-file" /></svg> {H2[lang]}</h1>
          <p className={styles.subtitle}>{SUBTITLE[lang]}</p>
        </header>

        {posts.length === 0 ? (
          <p className={styles.empty}>{EMPTY[lang]}</p>
        ) : (
          <RevealGroup as="ul" className={styles.postList}>
            {posts.map(p => (
              <RevealItem key={p.slug} as="li" className={p.heroImage ? `${styles.postCard} ${styles.postCardThumb}` : styles.postCard}>
                <a href={`/${lang}/blog/${p.slug}`} className={styles.postLink}>
                  {p.heroImage && <BlogImg src={p.heroImage} containerClassName={styles.thumb} />}
                  <div className={styles.postCardBody}>
                    <time className={styles.postDate}>{formatPostDate(p.date)}</time>
                    <h3 className={styles.postTitle}>{p.title}</h3>
                    {p.description && <p className={styles.postDesc}>{p.description}</p>}
                  </div>
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>
    </PageShell>
  );
}
