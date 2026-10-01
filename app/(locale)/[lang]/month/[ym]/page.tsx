import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMonthPages, isMonthIndexable, koDayLabel, type MonthPage } from '@/lib/schedule';
import { getAllVenues } from '@/lib/venues';
import { CATEGORY_LABELS, OG_LOCALE, DEFAULT_OG_IMAGE } from '@/lib/i18nLabels';
import { breadcrumbLd, jsonLd } from '@/lib/seo';
import { PageShell } from '@/components/PageShell';
import type { Category, Game } from '@/lib/types';
import styles from '@/app/blog/blog.module.css';
import cs from '../../concert/concertList.module.css';
import ss from '../../ticketing/schedule.module.css';

/**
 * 월별 공연 일정 — "10월 콘서트", "2026년 11월 공연 일정" 검색을 받는다.
 *
 * 한국어만 만든다(2026-10-01). 네이버 유입을 노린 것이고, 구글은 스팸 강등이 풀리는
 * 신호를 보고 영어판을 붙인다 — 이유는 lib/schedule.ts 머리 주석.
 *
 * `/ko/concert`도 달별로 묶어 보여주지만 거긴 **전체 목록**이고, 여기는 **한 달만**
 * 깊게 본다: 그 달의 요약 + 주 단위 목록. 공연 목록의 달 제목이 여기로 링크한다.
 */
interface Props { params: { lang: string; ym: string }; }

export const dynamicParams = false;

export async function generateStaticParams() {
  const months = await getMonthPages('ko');
  return months.map(m => ({ lang: 'ko', ym: m.ym }));
}

async function findMonth(params: Props['params']): Promise<MonthPage | null> {
  if (params.lang !== 'ko') return null;
  const months = await getMonthPages('ko');
  return months.find(m => m.ym === params.ym) ?? null;
}

const CATEGORY_ORDER: Category[] = ['concert_tour', 'festival', 'fanmeeting', 'music_release'];

function categorySummary(m: MonthPage): string {
  return CATEGORY_ORDER
    .filter(c => m.byCategory[c])
    .map(c => `${CATEGORY_LABELS.ko[c]} ${m.byCategory[c]}건`)
    .join(' · ');
}

function describe(m: MonthPage): string {
  const parts = [`${m.year}년 ${m.month}월 국내 콘서트·내한 공연·페스티벌·팬미팅 일정 ${m.events.length}건.`];
  if (m.busiestDays[0]) parts.push(`가장 많은 날은 ${koDayLabel(m.busiestDays[0].date)} ${m.busiestDays[0].count}건.`);
  if (m.topVenues[0]) parts.push(`${m.topVenues[0].name}에서 ${m.topVenues[0].count}건.`);
  parts.push('날짜·공연장·예매 일정을 한 페이지에.');
  return parts.join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await findMonth(params);
  if (!m) return {};
  const url = `https://whenstage.com/ko/month/${m.ym}`;
  const title = `${m.year}년 ${m.month}월 콘서트·공연 일정 (${m.events.length}건)`;
  const description = describe(m);
  return {
    title,
    description,
    alternates: { canonical: url },
    // 지난 달은 페이지만 남기고 색인에서 뺀다(사이트맵에서도 빠진다 — 신호를 맞춘다)
    ...(isMonthIndexable(m) ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title, description, url, locale: OG_LOCALE.ko, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function MonthPageView({ params }: Props) {
  const m = await findMonth(params);
  if (!m) notFound();

  const months = await getMonthPages('ko');
  const idx = months.findIndex(x => x.ym === m.ym);
  const prev = months[idx - 1];
  const next = months[idx + 1];
  // 공연장 페이지가 있는 곳만 링크한다(없는 slug로 링크하면 404)
  const venueSlugs = new Set((await getAllVenues('ko')).map(v => v.slug));

  const url = `https://whenstage.com/ko/month/${m.ym}`;
  const crumbLd = breadcrumbLd([
    { name: '홈', url: 'https://whenstage.com/ko' },
    { name: '공연 일정', url: 'https://whenstage.com/ko/concert' },
    { name: `${m.year}년 ${m.month}월`, url },
  ]);
  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${m.year}년 ${m.month}월 공연 일정`,
    numberOfItems: m.events.length,
    itemListElement: m.events.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://whenstage.com/ko/concert/${encodeURIComponent(g.id)}`,
    })),
  };

  const row = (g: Game) => (
    <li key={g.id} className={cs.row}>
      <a href={`/ko/concert/${encodeURIComponent(g.id)}`} className={cs.link}>
        <span className={`${cs.date} num`}>
          {Number(g.release_date.slice(5, 7))}.{g.release_date.slice(8, 10)}
          {g.release_time ? <span className={ss.time}>{g.release_time}</span> : null}
        </span>
        <span className={cs.body}>
          <span className={cs.name}>{g.name}</span>
          {g.developer && <span className={cs.artist}>{g.developer}</span>}
          {g.platforms?.[0] && (
            <span className={`${cs.artist} ${ss.venue}`}>
              <svg className="ic" aria-hidden="true"><use href="#ic-pin" /></svg>{g.platforms[0]}
            </span>
          )}
        </span>
        <span className={cs.cat}>{CATEGORY_LABELS.ko[g.category]}</span>
      </a>
    </li>
  );

  return (
    <PageShell lang="ko">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(listLd) }} />
      <article className={styles.post}>
        <a href="/ko/concert" className={styles.backLink}>← 전체 공연 일정</a>
        <header className={styles.postHeader}>
          <h1 className={styles.postH1}>{m.year}년 {m.month}월 콘서트·공연 일정</h1>
          <p className={styles.postLead}>{categorySummary(m)} — 총 {m.events.length}건</p>
        </header>

        {/* 그 달만의 요약 — 목록만 있는 페이지와 구분되는 부분 */}
        <section className={ss.summary} aria-label={`${m.month}월 요약`}>
          {m.busiestDays.length > 0 && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>공연이 몰린 날</span>
              <ul className={ss.factList}>
                {m.busiestDays.map(d => <li key={d.date}>{koDayLabel(d.date)} <b>{d.count}건</b></li>)}
              </ul>
            </div>
          )}
          {m.topVenues.length > 0 && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>공연이 많은 곳</span>
              <ul className={ss.factList}>
                {m.topVenues.map(v => (
                  <li key={v.slug}>
                    {venueSlugs.has(v.slug)
                      ? <a href={`/ko/venue/${encodeURIComponent(v.slug)}`}>{v.name}</a>
                      : v.name}{' '}
                    <b>{v.count}건</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {m.ticketOpenings > 0 && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>이 달 티켓 오픈</span>
              <p className={ss.factText}>
                선예매·일반예매 <b>{m.ticketOpenings}건</b> · <a href="/ko/ticketing">티켓팅 일정 보기</a>
              </p>
            </div>
          )}
        </section>

        {m.weeks.map(w => (
          <section key={w.label} className={cs.month}>
            <h2 className={cs.monthTitle}>
              {w.label}
              <span className={cs.monthCount}>{w.items.length}</span>
            </h2>
            <ul className={cs.list}>{w.items.map(row)}</ul>
          </section>
        ))}

        <nav className={ss.pager} aria-label="다른 달">
          {prev ? <a href={`/ko/month/${prev.ym}`}>← {prev.year}년 {prev.month}월</a> : <span />}
          {next ? <a href={`/ko/month/${next.ym}`}>{next.year}년 {next.month}월 →</a> : <span />}
        </nav>
      </article>
    </PageShell>
  );
}
