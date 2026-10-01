import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMonthPages, isMonthIndexable, dayLabel, monthLabel, type MonthPage } from '@/lib/schedule';
import { SCHEDULE_TEXT, countryName } from '@/lib/scheduleText';
import { getAllVenues } from '@/lib/venues';
import { UI, CAL, LOCALES, CATEGORY_LABELS, OG_LOCALE, DEFAULT_OG_IMAGE, type Locale } from '@/lib/i18nLabels';
import { eventStatusOf } from '@/lib/types';
import { breadcrumbLd, jsonLd } from '@/lib/seo';
import { PageShell } from '@/components/PageShell';
import type { Category, Game } from '@/lib/types';
import styles from '@/app/blog/blog.module.css';
import cs from '../../concert/concertList.module.css';
import ss from '../../ticketing/schedule.module.css';

/**
 * 월별 공연 일정 — "10월 콘서트", "October 2026 concerts", "10月 ライブ" 검색을 받는다.
 *
 * `/[lang]/concert`도 달별로 묶어 보여주지만 거긴 **전체 목록**이고, 여기는 **한 달만**
 * 깊게 본다: 그 달의 요약 + 주 단위 목록. 공연 목록의 달 제목이 여기로 링크한다.
 *
 * 로케일마다 데이터가 독립이다(번역 아님) — ko는 한국 공연, ja는 일본 공연, en은 해외 팬 대상
 * 한국 공연 + 예전에 넣은 미·영 공연. 그래서 hreflang으로 잇지 않는다(사이트 전체 원칙).
 */
interface Props { params: { lang: string; ym: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { lang: Locale; ym: string }[] = [];
  for (const lang of LOCALES) {
    for (const m of await getMonthPages(lang)) params.push({ lang, ym: m.ym });
  }
  return params;
}

async function findMonth(params: Props['params']): Promise<MonthPage | null> {
  if (!isLocale(params.lang)) return null;
  const months = await getMonthPages(params.lang);
  return months.find(m => m.ym === params.ym) ?? null;
}

const CATEGORY_ORDER: Category[] = ['concert_tour', 'festival', 'fanmeeting', 'music_release'];

function categorySummary(m: MonthPage): string {
  const t = SCHEDULE_TEXT[m.lang];
  return CATEGORY_ORDER
    .filter(c => m.byCategory[c])
    .map(c => `${CATEGORY_LABELS[m.lang][c]} ${t.unit(m.byCategory[c]!)}`)
    .join(' · ');
}

function describe(m: MonthPage): string {
  const t = SCHEDULE_TEXT[m.lang];
  const b = m.busiestDays[0];
  const v = m.topVenues[0];
  return t.monthDescribe(
    monthLabel(m.year, m.month, m.lang),
    m.events.length,
    b ? `${dayLabel(b.date, m.lang)} (${t.unit(b.count)})` : undefined,
    v ? `${v.name} ${t.unit(v.count)}` : undefined,
    m.byCountry.find(c => c.code === 'KR')?.count,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await findMonth(params);
  if (!m) return {};
  const t = SCHEDULE_TEXT[m.lang];
  const url = `https://whenstage.com/${m.lang}/month/${m.ym}`;
  const title = t.monthMetaTitle(monthLabel(m.year, m.month, m.lang), m.events.length);
  const description = describe(m);
  return {
    title,
    description,
    alternates: { canonical: url },
    // 지난 달은 페이지만 남기고 색인에서 뺀다(사이트맵에서도 빠진다 — 신호를 맞춘다)
    ...(isMonthIndexable(m) ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title, description, url, locale: OG_LOCALE[m.lang], images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function MonthPageView({ params }: Props) {
  const m = await findMonth(params);
  if (!m) notFound();
  const lang = m.lang;
  const t = SCHEDULE_TEXT[lang];
  const ui = UI[lang];
  const label = monthLabel(m.year, m.month, lang);

  const months = await getMonthPages(lang);
  const idx = months.findIndex(x => x.ym === m.ym);
  const prev = months[idx - 1];
  const next = months[idx + 1];
  // 공연장 페이지가 있는 곳만 링크한다(없는 slug로 링크하면 404)
  const venueSlugs = new Set((await getAllVenues(lang)).map(v => v.slug));
  // 나라가 둘 이상 섞인 달만 나라별 요약을 보여준다(ko·ja는 사실상 한 나라)
  const showCountries = m.byCountry.length > 1;

  const url = `https://whenstage.com/${lang}/month/${m.ym}`;
  const crumbLd = breadcrumbLd([
    { name: 'WhenStage', url: `https://whenstage.com/${lang}` },
    { name: ui.concertListTitle, url: `https://whenstage.com/${lang}/concert` },
    { name: label, url },
  ]);
  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.monthTitle(label),
    numberOfItems: m.events.length,
    itemListElement: m.events.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://whenstage.com/${lang}/concert/${encodeURIComponent(g.id)}`,
    })),
  };

  const row = (g: Game) => (
    <li key={g.id} className={cs.row}>
      <a href={`/${lang}/concert/${encodeURIComponent(g.id)}`} className={cs.link}>
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
        <span className={cs.cat}>
          {/* 취소·연기는 분류보다 먼저 알린다 */}
          {eventStatusOf(g) === 'cancelled' ? <b>{CAL[lang].cancelledTag}</b>
            : eventStatusOf(g) === 'postponed' ? <b>{CAL[lang].postponedTag}</b>
            : CATEGORY_LABELS[lang][g.category]}
        </span>
      </a>
    </li>
  );

  return (
    <PageShell lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(listLd) }} />
      <article className={styles.post}>
        <a href={`/${lang}/concert`} className={styles.backLink}>{t.backToConcerts}</a>
        <header className={styles.postHeader}>
          <h1 className={styles.postH1}>{t.monthTitle(label)}</h1>
          <p className={styles.postLead}>{t.monthLead(categorySummary(m), m.events.length)}</p>
        </header>

        {/* 그 달만의 요약 — 목록만 있는 페이지와 구분되는 부분 */}
        <section className={ss.summary} aria-label={label}>
          {showCountries && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>{t.countries}</span>
              <ul className={ss.factList}>
                {m.byCountry.slice(0, 4).map(c => <li key={c.code}>{countryName(c.code, lang)} <b>{t.unit(c.count)}</b></li>)}
              </ul>
            </div>
          )}
          {m.busiestDays.length > 0 && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>{t.busiest}</span>
              <ul className={ss.factList}>
                {m.busiestDays.map(d => <li key={d.date}>{dayLabel(d.date, lang)} <b>{t.unit(d.count)}</b></li>)}
              </ul>
            </div>
          )}
          {m.topVenues.length > 0 && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>{t.topVenues}</span>
              <ul className={ss.factList}>
                {m.topVenues.map(v => (
                  <li key={v.slug}>
                    {venueSlugs.has(v.slug)
                      ? <a href={`/${lang}/venue/${encodeURIComponent(v.slug)}`}>{v.name}</a>
                      : v.name}{' '}
                    <b>{t.unit(v.count)}</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {m.ticketOpenings > 0 && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>{t.monthTickets}</span>
              <p className={ss.factText}>
                <b>{t.monthTicketsText(m.ticketOpenings)}</b> · <a href={`/${lang}/ticketing`}>{t.seeTicketing}</a>
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

        <nav className={ss.pager} aria-label={t.otherMonths}>
          {prev ? <a href={`/${lang}/month/${prev.ym}`}>← {monthLabel(prev.year, prev.month, lang)}</a> : <span />}
          {next ? <a href={`/${lang}/month/${next.ym}`}>{monthLabel(next.year, next.month, lang)} →</a> : <span />}
        </nav>
      </article>
    </PageShell>
  );
}
