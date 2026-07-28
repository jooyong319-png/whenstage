import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllGames, getGameById, getUpcomingGamesByCategory, getLastUpdated } from '@/lib/games';
import { getArtistBySlug, normalizeArtistKey, getArtistImageMap } from '@/lib/artists';
import { CATEGORY_META } from '@/lib/types';
import { getVenueBySlug, normalizeVenueKey, VENUE_CATEGORIES } from '@/lib/venues';
import { formatShortDate, calcDayDiff } from '@/lib/utils';
import { CATEGORY_LABELS, UI, CAL, LOCALES, OG_LOCALE, type Locale } from '@/lib/i18nLabels';
import type { Game } from '@/lib/types';
import { effectivePresaleEnd } from '@/lib/types';
import { PageShell } from '@/components/PageShell';
import { WishlistButton } from '@/components/WishlistButton';
import { DdayBadge } from '@/components/DdayBadge';
import { ShareButton } from '@/components/ShareButton';
import { ViewCounter } from '@/components/ViewCounter';
import { DetailCover } from '@/components/DetailCover';
import { TicketingPhase } from '@/components/TicketingPhase';
import { TicketingCtaButton } from '@/components/TicketingCtaButton';
import { ReportForm } from '@/components/ReportForm';
import { SidebarSection } from '@/components/SidebarSection';
import { RelatedEventCard } from '@/components/RelatedEventCard';
import { breadcrumbLd, jsonLd } from '@/lib/seo';

interface Props {
  params: { lang: string; id: string };
}

function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

// SSG: 각 locale은 자기 언어 데이터 파일의 모든 항목으로 정적 페이지 생성(번역 개념 없음 — 국가별 독립 콘텐츠)
// 빌드에 없는 slug는 하드 404(soft-404 방지) — 콘텐츠가 모두 빌드 시점에 정해지므로 안전
export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { lang: Locale; id: string }[] = [];
  for (const lang of LOCALES) {
    const games = await getAllGames(lang);
    for (const g of games) params.push({ lang, id: g.id });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.lang)) return {};
  const game = await getGameById(params.id, params.lang);
  if (!game) return { title: UI[params.lang].notFound };

  const url = `https://whenstage.com/${params.lang}/concert/${params.id}`;
  const ogImage = game.image_url || 'https://whenstage.com/og-image.png';
  // 상세 페이지 제목은 공연명만 — 레이아웃 title 템플릿('%s | WhenStage')이 브랜드를 붙인다.
  // (og/twitter title은 템플릿 미적용이라 공연명 그대로 쓰되 브랜드는 도메인으로 노출)
  const title = game.name;
  const desc = (game.description ?? '').slice(0, 158);

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, type: 'article', locale: OG_LOCALE[params.lang], images: [{ url: ogImage }] },
    twitter: { card: 'summary_large_image', title, description: desc, images: [ogImage] },
  };
}

export default async function LocaleGamePage({ params }: Props) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const ui = UI[lang];
  const t = CAL[lang];

  const game = await getGameById(params.id, lang);
  if (!game) notFound();

  const lastUpdatedIso = await getLastUpdated(lang);
  const dateStr = game.release_date_approx
    ? ui.tba
    : new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : 'ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(game.release_date)
      );

  const related: Game[] = (await getUpcomingGamesByCategory(game.category, lang))
    .filter(g => g.id !== game.id)
    .sort((a, b) => a.release_date.localeCompare(b.release_date))
    .slice(0, 6);

  // 관련 카드 이미지 맵: 콘서트 image_url 우선, 없으면 developer로 아티스트 큐레이션 이미지 폴백.
  const artistImgs = await getArtistImageMap();
  const relImg = (g: Game): string | null =>
    g.image_url || (g.developer ? artistImgs[normalizeArtistKey(g.developer)] ?? null : null);

  const isUpcoming = (g: Game) => g.release_date_approx || calcDayDiff(g.release_date) >= 0;

  const artist = game.developer ? await getArtistBySlug(normalizeArtistKey(game.developer), lang) : null;
  const artistOthers = artist
    ? artist.events.filter(g => g.id !== game.id && isUpcoming(g)).slice(0, 3)
    : [];

  const venue = VENUE_CATEGORIES.has(game.category) && game.platforms.length > 0
    ? await getVenueBySlug(normalizeVenueKey(game.platforms[0]), lang)
    : null;
  const venueOthers = venue
    ? venue.events.filter(g => g.id !== game.id && isUpcoming(g)).slice(0, 3)
    : [];

  const artistLabel = lang === 'ko' ? `${artist?.name}의 다른 일정` : lang === 'ja' ? `${artist?.name}の他の予定` : `More from ${artist?.name}`;
  const venueLabel = lang === 'ko' ? `${venue?.name}의 다른 일정` : lang === 'ja' ? `${venue?.name}の他の公演` : `More at ${venue?.name}`;
  const seeAllArtist = lang === 'ko' ? '아티스트 페이지 전체보기' : lang === 'ja' ? 'アーティストページ全体を見る' : 'See full artist page';
  const seeAllVenue = lang === 'ko' ? '공연장 페이지 전체보기' : lang === 'ja' ? '会場ページ全体を見る' : 'See full venue page';

  const sidebar = (artistOthers.length > 0 || venueOthers.length > 0) ? (
    <>
      {artistOthers.length > 0 && artist && (
        <SidebarSection title={artistLabel} moreHref={`/${lang}/artist/${encodeURIComponent(artist.slug)}`} moreLabel={seeAllArtist}>
          {artistOthers.map(g => <RelatedEventCard key={g.id} game={g} lang={lang} dateText={formatShortDate(g.release_date)} />)}
        </SidebarSection>
      )}
      {venueOthers.length > 0 && venue && (
        <SidebarSection title={venueLabel} moreHref={`/${lang}/venue/${encodeURIComponent(venue.slug)}`} moreLabel={seeAllVenue}>
          {venueOthers.map(g => <RelatedEventCard key={g.id} game={g} lang={lang} dateText={formatShortDate(g.release_date)} />)}
        </SidebarSection>
      )}
    </>
  ) : undefined;

  const isVenueEvent = VENUE_CATEGORIES.has(game.category);
  const ticketUrl = game.general_sale_url || game.presale_url || null;
  const eventUrl = `https://whenstage.com/${lang}/concert/${params.id}`;
  const ogImg = game.image_url || 'https://whenstage.com/og-image.png';
  const startDate = game.release_time ? `${game.release_date}T${game.release_time}` : game.release_date;
  const festEnd = game.festival_days && game.festival_days.length > 0
    ? game.festival_days[game.festival_days.length - 1].date
    : null;
  // endDate는 아는 만큼만 쓴다. 다일 공연(페스티벌)은 마지막 날이 명확하고, 시작 시각을 모르는
  // 공연은 "그 날 하루"로 보면 되므로 release_date를 그대로 종료일로 쓴다(startDate도 날짜 단위라
  // 정밀도가 맞음). 시작 시각까지 아는 공연은 끝나는 시각을 알 방법이 없어 생략한다 — 임의로
  // 몇 시간을 더하면 검색 결과에 없는 사실이 표기된다.
  const endDate = festEnd && festEnd > game.release_date
    ? festEnd
    : (!game.release_time ? game.release_date : null);
  // performer는 단독 아티스트(developer)뿐 아니라 페스티벌 데이별 라인업까지 합친다 —
  // 라인업은 데이터에 이미 있는데 구조화 데이터에선 안 쓰이고 있었다(단독 아티스트가 없는
  // 페스티벌이 performer 누락으로 잡히던 원인). 중복 표기는 제거.
  const performerNames = Array.from(new Set([
    ...(game.developer ? [game.developer] : []),
    ...(game.festival_days?.flatMap(d => d.lineup) ?? []),
  ]));
  const venueName = game.platforms[0] || game.name; // location은 필수 — 없으면 공연명으로 폴백

  // 실제 공연(콘서트/페스티벌/팬미팅) = MusicEvent(location 필수 항상 채움).
  // 음원 발매 = MusicAlbum(물리적 장소가 없어 Event의 location 필수 요건에서 자유 → soft 에러 방지).
  const eventLd = isVenueEvent
    ? {
        '@context': 'https://schema.org',
        '@type': 'MusicEvent',
        name: game.name,
        image: ogImg,
        startDate,
        ...(endDate ? { endDate } : {}),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: venueName, address: venueName },
        ...(performerNames.length > 0
          ? { performer: performerNames.map(n => ({ '@type': 'MusicGroup', name: n })) }
          : {}),
        // organizer.url에는 주최사 URL이 들어가야 한다 — 예전엔 여기 우리 페이지(eventUrl)를
        // 넣었는데, 그건 "주최사 홈페이지가 whenstage"라고 주장하는 잘못된 표기라 뺐다.
        // 주최사 URL은 데이터에 없다(추가되면 그때 채운다).
        ...(game.publisher ? { organizer: { '@type': 'Organization', name: game.publisher } } : {}),
        ...(ticketUrl
          ? {
              offers: {
                '@type': 'Offer',
                url: ticketUrl,
                availability: 'https://schema.org/InStock',
                // validFrom은 그 offers.url로 실제 살 수 있게 되는 시점 — 일반예매 URL이면
                // 일반예매 시작, 선예매 URL(일반예매 URL이 없어 폴백된 경우)이면 선예매 시작.
                ...(game.general_sale_url && game.general_sale_datetime
                  ? { validFrom: game.general_sale_datetime }
                  : !game.general_sale_url && game.presale_datetime
                    ? { validFrom: game.presale_datetime }
                    : {}),
              },
            }
          : {}),
        description: game.description ?? '',
        inLanguage: lang,
        url: eventUrl,
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'MusicAlbum',
        name: game.name,
        image: ogImg,
        datePublished: game.release_date,
        ...(game.developer ? { byArtist: { '@type': 'MusicGroup', name: game.developer } } : {}),
        ...(game.publisher ? { publisher: { '@type': 'Organization', name: game.publisher } } : {}),
        description: game.description ?? '',
        inLanguage: lang,
        url: eventUrl,
      };
  const crumbLd = breadcrumbLd([
    { name: 'WhenStage', url: `https://whenstage.com/${lang}` },
    { name: game.name, url: `https://whenstage.com/${lang}/concert/${params.id}` },
  ]);

  return (
    <PageShell lang={lang} sidebar={sidebar}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(eventLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbLd) }} />
      <article className="game-detail">
        <div className="detail-head">
          <span className={`category-tag cat-bg-${game.category}`}>{CATEGORY_LABELS[lang][game.category]}</span>
          <DdayBadge releaseDate={game.release_date} approx={game.release_date_approx} />
        </div>
        <h1>{game.name}</h1>
        {game.image_url && (
          <DetailCover imageUrl={game.image_url} alt={game.name} category={game.category} />
        )}
        <p className="release-date">
          <strong>{ui.releaseDate}:</strong> {dateStr}
        </p>
        {game.presale && (
          <>
            <TicketingPhase label={t.presaleTag} startDateTime={game.presale_datetime} endDateTime={effectivePresaleEnd(game)} timezone={game.timezone} />
            {!game.presale_url && (
              <p className="prereg-info">
                <svg className="ic" aria-hidden="true"><use href="#ic-bell" /></svg>
                {t.ticketingLinkPending}
              </p>
            )}
          </>
        )}
        {game.general_sale && (
          <>
            <TicketingPhase label={t.generalSaleTag} startDateTime={game.general_sale_datetime} endDateTime={game.general_sale_end_datetime} timezone={game.timezone} />
            {!game.general_sale_url && (
              <p className="prereg-info">
                <svg className="ic" aria-hidden="true"><use href="#ic-bell" /></svg>
                {t.ticketingLinkPending}
              </p>
            )}
          </>
        )}
        {game.description && <p className="desc">{game.description}</p>}
        {game.festival_days && game.festival_days.length > 0 && (
          <ul className="detail-festival-days">
            {game.festival_days.map(day => (
              <li key={day.date}><strong>{day.date}</strong>{day.lineup.join(', ')}</li>
            ))}
          </ul>
        )}
        <ul className="detail-meta">
          {game.developer && (
            <li>
              <strong>{ui.developer}</strong>
              <a href={`/${lang}/artist/${encodeURIComponent(normalizeArtistKey(game.developer))}`} className="detail-artist-link">
                {game.developer}
              </a>
            </li>
          )}
          {game.publisher && <li><strong>{ui.publisher}</strong>{game.publisher}</li>}
          {game.platforms.length > 0 && (
            <li>
              <strong>{ui.platforms}</strong>
              {VENUE_CATEGORIES.has(game.category) ? (
                game.platforms.map((p, i) => (
                  <span key={p}>
                    {i > 0 && ', '}
                    <a href={`/${lang}/venue/${encodeURIComponent(normalizeVenueKey(p))}`} className="detail-artist-link">{p}</a>
                  </span>
                ))
              ) : (
                game.platforms.join(', ')
              )}
            </li>
          )}
          {game.genres.length > 0 && <li><strong>{ui.genres}</strong>{game.genres.join(', ')}</li>}
        </ul>
        <div className="detail-actions">
          {game.presale_url && (
            <TicketingCtaButton
              url={game.presale_url}
              endDateTime={effectivePresaleEnd(game)}
              openLabel={t.goToPresale}
              closedLabel={t.presaleClosedLabel}
            />
          )}
          {game.general_sale_url && (
            <TicketingCtaButton
              url={game.general_sale_url}
              endDateTime={game.general_sale_end_datetime}
              openLabel={t.goToGeneralSale}
              closedLabel={t.generalSaleClosedLabel}
            />
          )}
          <WishlistButton id={game.id} className="detail-link" />
          <ShareButton url={`/${lang}/concert/${game.id}`} title={game.name} className="detail-link" />
          {game.source_url && (
            <a className="detail-link" href={game.source_url} target="_blank" rel="noopener">{ui.source} →</a>
          )}
          <ViewCounter gameId={game.id} />
        </div>

        <ReportForm
          kind="ticketing_link"
          targetType="concert"
          targetId={game.id}
          locale={lang}
          buttonLabel={t.reportTicketingLabel}
          placeholder={t.reportTicketingPlaceholder}
          successLabel={t.reportSuccess}
          submitLabel={t.reportSubmit}
          contactLabel={t.reportContactPlaceholder}
          cancelLabel={t.reportCancel}
        />

        {related.length > 0 && (
          <section className="detail-related">
            <div className="related-grid">
              {related.map(r => {
                const img = relImg(r);
                const cat = CATEGORY_META[r.category];
                return (
                  <a key={r.id} href={`/${lang}/concert/${r.id}`} className="related-card" style={{ ['--cat' as string]: cat.color }}>
                    <span className="related-thumb">
                      {img ? (
                        <img src={img} alt="" aria-hidden="true" loading="lazy" />
                      ) : (
                        <span className="related-thumb-ph" aria-hidden="true">
                          <svg className="ic"><use href={`#${cat.icon}`} /></svg>
                        </span>
                      )}
                    </span>
                    <span className="related-body">
                      <span className="related-badge" style={{ background: cat.color }}>{CATEGORY_LABELS[lang][r.category]}</span>
                      <span className="related-name">{r.name}</span>
                      <span className="related-date">{formatShortDate(r.release_date)}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </PageShell>
  );
}
