import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getUpcomingTicketOpenings, getMonthPages, isMonthIndexable, isTicketingIndexable,
  dayLabel, todayKst, tzShort, type TicketOpening,
} from '@/lib/schedule';
import { SCHEDULE_TEXT } from '@/lib/scheduleText';
import { LOCALES, CAL, OG_LOCALE, DEFAULT_OG_IMAGE, type Locale } from '@/lib/i18nLabels';
import { breadcrumbLd, jsonLd } from '@/lib/seo';
import { PageShell } from '@/components/PageShell';
import styles from '@/app/blog/blog.module.css';
import cs from '../concert/concertList.module.css';
import ss from './schedule.module.css';

/**
 * 티켓팅 일정 — "이번주 티켓팅", "presale dates", "チケット 発売日" 검색을 받는다.
 *
 * 선예매·일반예매 오픈 시각을 공연 단위가 아니라 **시각순으로** 한곳에 모은 건 이 사이트에만
 * 있는 데이터다(예매처마다 흩어져 있다).
 *
 * 빌드 시점 기준이다(하루 2~4번 배포). 그래서 '오늘·내일' 같은 상대 표현을 쓰지 않는다 —
 * 배포가 하루 밀리면 틀린 말이 된다. 날짜는 전부 절대 날짜로 쓴다.
 *
 * 시각은 **공연 현지 시간**이다. en은 미·영 공연이 섞여 있어 시간대 표기(EDT 등)를 붙인다 —
 * 해외 팬이 자기 시간으로 착각해 놓치는 사고를 막는 사이트 원칙(lib/utils.ts formatEventDateTime).
 *
 * 앞으로 열릴 예매가 적으면(TICKETING_MIN_INDEX 미만) 색인에서 뺀다 — 2건짜리 목록은 얇은 페이지다.
 * 데이터가 늘면 다음 배포에서 저절로 색인 대상이 된다.
 */
interface Props { params: { lang: string }; }
function isLocale(v: string): v is Locale { return (LOCALES as string[]).includes(v); }

export const dynamicParams = false;

export async function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

/** ko·ja는 공연이 전부 그 나라라 시간대를 안 붙인다(리드 문장에 "한국 시간"이라고 밝힌다) */
function timeWithZone(t: TicketOpening, lang: Locale): string {
  if (lang !== 'en') return t.time;
  return `${t.time} ${tzShort(t.at, t.tz, lang)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const lang = params.lang;
  const t = SCHEDULE_TEXT[lang];
  const list = await getUpcomingTicketOpenings(lang);
  const first = list[0];
  const description = t.ticketingDescribe(
    list.length,
    first ? `${dayLabel(first.date, lang)} ${timeWithZone(first, lang)} ${first.game.developer ?? first.game.name}` : undefined,
  );
  const url = `https://whenstage.com/${lang}/ticketing`;
  return {
    title: t.ticketingMetaTitle,
    description,
    alternates: { canonical: url },
    ...(isTicketingIndexable(list.length) ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title: t.ticketingMetaTitle, description, url, locale: OG_LOCALE[lang], images: [DEFAULT_OG_IMAGE] },
  };
}

function groupByDate(list: TicketOpening[]): { date: string; items: TicketOpening[] }[] {
  const map = new Map<string, TicketOpening[]>();
  for (const t of list) map.set(t.date, [...(map.get(t.date) ?? []), t]);
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

export default async function TicketingPage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const t = SCHEDULE_TEXT[lang];
  const cal = CAL[lang];
  const today = todayKst();
  const list = await getUpcomingTicketOpenings(lang);
  const days = groupByDate(list);
  const presale = list.filter(x => x.kind === 'presale').length;
  // 월별 일정으로 가는 길 — 색인 대상 달만
  const months = (await getMonthPages(lang)).filter(m => isMonthIndexable(m, today));

  const crumbLd = breadcrumbLd([
    { name: 'WhenStage', url: `https://whenstage.com/${lang}` },
    { name: t.ticketingTitle, url: `https://whenstage.com/${lang}/ticketing` },
  ]);

  const row = (x: TicketOpening) => (
    <li key={`${x.game.id}-${x.kind}`} className={cs.row}>
      <a href={`/${lang}/concert/${encodeURIComponent(x.game.id)}`} className={cs.link}>
        <span className={`${cs.date} num`}>
          {x.time}
          {/* 시간대는 둘째 줄 — 'EDT'까지 한 줄에 넣으면 시각 칸을 넘친다 */}
          {lang === 'en' && <span className={ss.time}>{tzShort(x.at, x.tz, lang)}</span>}
        </span>
        <span className={cs.body}>
          <span className={cs.name}>{x.game.name}</span>
          {x.game.developer && <span className={cs.artist}>{x.game.developer}</span>}
          {x.game.platforms?.[0] && (
            <span className={cs.artist}>{x.game.platforms[0]} · {t.showOn(dayLabel(x.game.release_date, lang))}</span>
          )}
        </span>
        <span className={`${ss.kind} ${x.kind === 'general_sale' ? ss.kindGeneral : ''}`}>
          {x.kind === 'presale' ? cal.presaleTag : cal.generalSaleTag}
        </span>
      </a>
      {x.url && (
        // 상세 링크(<a>) 안에 넣으면 중첩 링크가 된다 — 형제로 둔다
        <p className={ss.buyRow}>
          <a className={ss.buy} href={x.url} target="_blank" rel="noopener nofollow">{t.buy}</a>
        </p>
      )}
    </li>
  );

  return (
    <PageShell lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />
      <article className={styles.post}>
        <a href={`/${lang}`} className={styles.backLink}>{t.backToCalendar}</a>
        <header className={styles.postHeader}>
          <h1 className={styles.postH1}>{t.ticketingTitle}</h1>
          <p className={styles.postLead}>{t.ticketingLead}</p>
        </header>

        <section className={ss.summary} aria-label={t.upcomingOpenings}>
          <div className={ss.fact}>
            <span className={ss.factLabel}>{t.upcomingOpenings}</span>
            <p className={ss.factText}><b>{t.upcomingText(list.length, presale)}</b></p>
          </div>
          {days[0] && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>{t.nearest}</span>
              <p className={ss.factText}>
                {dayLabel(days[0].date, lang)} {timeWithZone(days[0].items[0], lang)} · <b>{t.unit(days[0].items.length)}</b>
              </p>
            </div>
          )}
          {months.length > 0 && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>{t.monthly}</span>
              <p className={ss.factText}>
                {months.map((m, i) => (
                  <span key={m.ym}>{i > 0 && ' · '}<a href={`/${lang}/month/${m.ym}`}>{t.monthShort(m.month)}</a></span>
                ))}
              </p>
            </div>
          )}
        </section>
        <p className={ss.note}>{t.asOf(dayLabel(today, lang))}</p>

        {days.length === 0 ? (
          <p className={styles.empty}>{t.noOpenings}</p>
        ) : (
          days.map(d => (
            <section key={d.date} className={cs.month}>
              <h2 className={cs.monthTitle}>
                {dayLabel(d.date, lang)}
                <span className={cs.monthCount}>{d.items.length}</span>
              </h2>
              <ul className={cs.list}>{d.items.map(row)}</ul>
            </section>
          ))
        )}
      </article>
    </PageShell>
  );
}
