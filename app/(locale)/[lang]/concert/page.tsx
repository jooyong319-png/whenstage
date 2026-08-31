import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllGames, getUpcomingGames } from '@/lib/games';
import {
  UI, LOCALES, OG_LOCALE, DEFAULT_OG_IMAGE, CATEGORY_LABELS, type Locale,
} from '@/lib/i18nLabels';
import { localeAlternates, breadcrumbLd, jsonLd } from '@/lib/seo';
import { PageShell } from '@/components/PageShell';
import { PageHeader } from '@/components/PageHeader';
import type { Game } from '@/lib/types';
import styles from '@/app/blog/blog.module.css';
import cs from './concertList.module.css';

/**
 * 공연 일정 목록.
 *
 * 왜 만드나 (2026-09-01) — 콘서트는 이 사이트의 본체(3개 로케일 434장)인데 **목록
 * 페이지가 없었다.** 홈이 다가오는 40개를 직접 링크하고, 나머지는 아티스트·공연장
 * 페이지를 거쳐 깊이 3에서야 닿았다. 크롤이 막힌 건 아니지만 우선순위가 뒤로 밀린다.
 *
 * 검색 쪽 값도 있다. "9월 콘서트", "이번 달 공연" 같은 검색은 개별 공연 페이지가 아니라
 * 이런 목록이 받는다. 그래서 **달별로 묶고 앵커를 달아** 그 검색에 대응한다.
 *
 * 홈과 겹치지 않는다 — 홈은 카드로 40개를 보여주고, 여기는 전부를 달력처럼 나열한다.
 */
interface Props { params: { lang: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const ui = UI[params.lang];
  const url = `https://whenstage.com/${params.lang}/concert`;
  return {
    title: ui.concertListMetaTitle,
    description: ui.concertListMetaDescription,
    alternates: localeAlternates('/concert', params.lang),
    openGraph: {
      title: ui.concertListMetaTitle,
      description: ui.concertListMetaDescription,
      url,
      locale: OG_LOCALE[params.lang],
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

/** 'YYYY-MM' 로 묶는다. 정렬은 이미 날짜순이라 순서가 유지된다. */
function groupByMonth(games: Game[]): { key: string; year: number; month: number; items: Game[] }[] {
  const map = new Map<string, Game[]>();
  for (const g of games) {
    const key = g.release_date.slice(0, 7);
    map.set(key, [...(map.get(key) ?? []), g]);
  }
  return Array.from(map.entries()).map(([key, items]) => {
    const [year, month] = key.split('-').map(Number);
    return { key, year, month, items };
  });
}

export default async function ConcertListPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];
  // "다가오는 것"의 정의(오늘 기준·날짜 미정 포함)는 이미 lib에 있다. 여기서 다시 쓰면
  // 두 곳이 언젠가 어긋난다.
  const [all, upcoming] = await Promise.all([getAllGames(lang), getUpcomingGames(lang)]);
  const upcomingIds = new Set(upcoming.map(g => g.id));
  // 지난 일정도 링크해 둔다. 검색 대상이라기보다 **크롤 경로**로서 값이 있다.
  const past = all.filter(g => !upcomingIds.has(g.id)).reverse();

  const months = groupByMonth(upcoming);

  const crumbLd = breadcrumbLd([
    { name: ui.home, url: `https://whenstage.com/${lang}` },
    { name: ui.concertListTitle, url: `https://whenstage.com/${lang}/concert` },
  ]);

  const row = (g: Game) => (
    <li key={g.id} className={cs.row}>
      <a href={`/${lang}/concert/${encodeURIComponent(g.id)}`} className={cs.link}>
        <span className={`${cs.date} num`}>
          {Number(g.release_date.slice(5, 7))}.{g.release_date.slice(8, 10)}
        </span>
        <span className={cs.body}>
          <span className={cs.name}>{g.name}</span>
          {g.developer && <span className={cs.artist}>{g.developer}</span>}
        </span>
        <span className={cs.cat}>{CATEGORY_LABELS[lang][g.category]}</span>
      </a>
    </li>
  );

  return (
    <PageShell lang={lang}>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />

      <section className={styles.indexSection}>
        <PageHeader
          icon="ic-calendar"
          title={ui.concertListTitle}
          subtitle={ui.concertListSubtitle}
          count={upcoming.length}
          countLabel={lang === 'ko' ? '개 예정' : lang === 'ja' ? '件' : 'upcoming'}
        />

        {months.length === 0 ? (
          <p className={styles.empty}>{ui.concertListEmpty}</p>
        ) : (
          months.map(m => (
            // 앵커를 달아 "9월 콘서트" 같은 검색에서 해당 달로 바로 닿게 한다
            <section key={m.key} id={m.key} className={cs.month}>
              <h2 className={cs.monthTitle}>
                {ui.monthLabel(m.year, m.month)}
                <span className={cs.monthCount}>{m.items.length}</span>
              </h2>
              <ul className={cs.list}>{m.items.map(row)}</ul>
            </section>
          ))
        )}

        {past.length > 0 && (
          <section className={cs.past}>
            <h2 className={cs.monthTitle}>{ui.concertListPast}</h2>
            <ul className={cs.list}>{past.map(row)}</ul>
          </section>
        )}
      </section>
    </PageShell>
  );
}
