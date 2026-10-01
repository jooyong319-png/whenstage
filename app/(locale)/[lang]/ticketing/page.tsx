import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUpcomingTicketOpenings, getMonthPages, isMonthIndexable, koDayLabel, todayKst, type TicketOpening } from '@/lib/schedule';
import { OG_LOCALE, DEFAULT_OG_IMAGE } from '@/lib/i18nLabels';
import { breadcrumbLd, jsonLd } from '@/lib/seo';
import { PageShell } from '@/components/PageShell';
import styles from '@/app/blog/blog.module.css';
import cs from '../concert/concertList.module.css';
import ss from './schedule.module.css';

/**
 * 티켓팅 일정 — "이번주 티켓팅", "선예매 일정" 검색을 받는다.
 *
 * 선예매·일반예매 오픈 시각을 공연 단위가 아니라 **시각순으로** 한곳에 모은 건 이 사이트에만
 * 있는 데이터다(예매처마다 흩어져 있다). 그래서 날짜 검색 페이지 중 가장 먼저 만들었다.
 *
 * 빌드 시점 기준이다(하루 2~4번 배포). 그래서 '오늘·내일' 같은 상대 표현을 쓰지 않는다 —
 * 배포가 하루 밀리면 틀린 말이 된다. 날짜는 전부 절대 날짜로 쓴다.
 */
interface Props { params: { lang: string }; }

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ lang: 'ko' }];
}

const TITLE = '티켓팅 일정 — 선예매·일반예매 오픈 시간 모음';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (params.lang !== 'ko') return {};
  const list = await getUpcomingTicketOpenings('ko');
  const first = list[0];
  const description = list.length
    ? `콘서트·내한 공연 선예매·일반예매 오픈 시간 ${list.length}건을 시각순으로 정리. ` +
      `가장 가까운 오픈은 ${koDayLabel(first.date)} ${first.time} ${first.game.developer ?? first.game.name}. 예매처 바로가기 포함.`
    : '콘서트·내한 공연 선예매·일반예매 오픈 시간을 시각순으로 정리합니다.';
  const url = 'https://whenstage.com/ko/ticketing';
  return {
    title: TITLE,
    description,
    alternates: { canonical: url },
    openGraph: { title: TITLE, description, url, locale: OG_LOCALE.ko, images: [DEFAULT_OG_IMAGE] },
  };
}

function groupByDate(list: TicketOpening[]): { date: string; items: TicketOpening[] }[] {
  const map = new Map<string, TicketOpening[]>();
  for (const t of list) map.set(t.date, [...(map.get(t.date) ?? []), t]);
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

export default async function TicketingPage({ params }: Props) {
  if (params.lang !== 'ko') notFound();
  const today = todayKst();
  const list = await getUpcomingTicketOpenings('ko');
  const days = groupByDate(list);
  const presale = list.filter(t => t.kind === 'presale').length;
  // 월별 일정으로 가는 길 — 색인 대상 달만
  const months = (await getMonthPages('ko')).filter(m => isMonthIndexable(m, today));

  const crumbLd = breadcrumbLd([
    { name: '홈', url: 'https://whenstage.com/ko' },
    { name: '티켓팅 일정', url: 'https://whenstage.com/ko/ticketing' },
  ]);

  const row = (t: TicketOpening) => (
    <li key={`${t.game.id}-${t.kind}`} className={cs.row}>
      <a href={`/ko/concert/${encodeURIComponent(t.game.id)}`} className={cs.link}>
        <span className={`${cs.date} num`}>{t.time}</span>
        <span className={cs.body}>
          <span className={cs.name}>{t.game.name}</span>
          {t.game.developer && <span className={cs.artist}>{t.game.developer}</span>}
          {t.game.platforms?.[0] && <span className={cs.artist}>{t.game.platforms[0]} · 공연 {koDayLabel(t.game.release_date)}</span>}
        </span>
        <span className={`${ss.kind} ${t.kind === 'general_sale' ? ss.kindGeneral : ''}`}>
          {t.kind === 'presale' ? '선예매' : '일반예매'}
        </span>
      </a>
      {t.url && (
        // 상세 링크(<a>) 안에 넣으면 중첩 링크가 된다 — 형제로 둔다
        <p className={ss.buyRow}>
          <a className={ss.buy} href={t.url} target="_blank" rel="noopener nofollow">예매처 바로가기 →</a>
        </p>
      )}
    </li>
  );

  return (
    <PageShell lang="ko">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />
      <article className={styles.post}>
        <a href="/ko" className={styles.backLink}>← 캘린더</a>
        <header className={styles.postHeader}>
          <h1 className={styles.postH1}>티켓팅 일정</h1>
          <p className={styles.postLead}>
            선예매·일반예매가 열리는 시각을 시간순으로 모았습니다. 시각은 모두 한국 시간입니다.
          </p>
        </header>

        <section className={ss.summary} aria-label="요약">
          <div className={ss.fact}>
            <span className={ss.factLabel}>앞으로 열리는 예매</span>
            <p className={ss.factText}><b>{list.length}건</b> (선예매 {presale} · 일반예매 {list.length - presale})</p>
          </div>
          {days[0] && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>가장 가까운 오픈</span>
              <p className={ss.factText}>{koDayLabel(days[0].date)} {days[0].items[0].time} · <b>{days[0].items.length}건</b></p>
            </div>
          )}
          {months.length > 0 && (
            <div className={ss.fact}>
              <span className={ss.factLabel}>월별 공연 일정</span>
              <p className={ss.factText}>
                {months.map((m, i) => (
                  <span key={m.ym}>{i > 0 && ' · '}<a href={`/ko/month/${m.ym}`}>{m.month}월</a></span>
                ))}
              </p>
            </div>
          )}
        </section>
        <p className={ss.note}>{koDayLabel(today)} 기준 · 예매 시각은 주최 측 사정으로 바뀔 수 있으니 예매처 공지를 함께 확인하세요.</p>

        {days.length === 0 ? (
          <p className={styles.empty}>지금 예정된 티켓 오픈이 없습니다.</p>
        ) : (
          days.map(d => (
            <section key={d.date} className={cs.month}>
              <h2 className={cs.monthTitle}>
                {koDayLabel(d.date)}
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
