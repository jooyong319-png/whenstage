import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllGames, getGameById, getUpcomingGamesByCategory, getLastUpdated } from '@/lib/games';
import { normalizeArtistKey } from '@/lib/artists';
import { normalizeVenueKey, VENUE_CATEGORIES } from '@/lib/venues';
import { CATEGORY_LABELS, UI, CAL, LOCALES, type Locale } from '@/lib/i18nLabels';
import type { Game } from '@/lib/types';
import { PageShell } from '@/components/PageShell';
import { WishlistButton } from '@/components/WishlistButton';
import { DdayBadge } from '@/components/DdayBadge';
import { ShareButton } from '@/components/ShareButton';
import { ViewCounter } from '@/components/ViewCounter';
import { DetailCover } from '@/components/DetailCover';
import { TicketingPhase } from '@/components/TicketingPhase';

interface Props {
  params: { lang: string; id: string };
}

function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

// SSG: 각 locale은 자기 언어 데이터 파일의 모든 항목으로 정적 페이지 생성(번역 개념 없음 — 국가별 독립 콘텐츠)
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
  const title = `${game.name} — ${UI[params.lang].siteName}`;
  const desc = (game.description ?? '').slice(0, 158);

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, type: 'article', images: [{ url: ogImage }] },
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

  const eventLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: game.name,
    image: game.image_url || 'https://whenstage.com/og-image.png',
    startDate: game.release_date,
    // music_release는 실제 장소가 없는 발매 소식이라 물리적 이벤트 필드(장소·참석방식)를 안 붙인다 —
    // platforms엔 "Streaming"/"CD" 같은 값이 들어있어 그대로 location에 쓰면 의미 없는 데이터가 된다.
    ...(VENUE_CATEGORIES.has(game.category) && game.platforms.length > 0
      ? {
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          // platforms[0]에 공연장명(+도시)이 통짜 문자열로 들어있어 구조화된 주소는 아니지만,
          // Event에 location이 아예 없으면 리치 리절트 노출이 안 되므로 최소 요건은 채운다.
          location: { '@type': 'Place', name: game.platforms[0], address: game.platforms[0] },
        }
      : {}),
    ...(game.publisher ? { organizer: { '@type': 'Organization', name: game.publisher } } : {}),
    description: game.description ?? '',
    inLanguage: lang,
    url: `https://whenstage.com/${lang}/concert/${params.id}`,
  };

  return (
    <PageShell lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
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
          <TicketingPhase label={t.presaleTag} startDateTime={game.presale_datetime} endDateTime={game.presale_end_datetime} timezone={game.timezone} />
        )}
        {game.general_sale && (
          <TicketingPhase label={t.generalSaleTag} startDateTime={game.general_sale_datetime} endDateTime={game.general_sale_end_datetime} timezone={game.timezone} />
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
            <a className="detail-link prereg-cta" href={game.presale_url} target="_blank" rel="noopener">
              {t.goToPresale} →
            </a>
          )}
          {game.general_sale_url && (
            <a className="detail-link prereg-cta" href={game.general_sale_url} target="_blank" rel="noopener">
              {t.goToGeneralSale} →
            </a>
          )}
          <WishlistButton id={game.id} className="detail-link" />
          <ShareButton url={`/${lang}/concert/${game.id}`} title={game.name} className="detail-link" />
          {game.source_url && (
            <a className="detail-link" href={game.source_url} target="_blank" rel="noopener">{ui.source} →</a>
          )}
          <ViewCounter gameId={game.id} />
        </div>

        {related.length > 0 && (
          <section className="detail-related">
            <div className="related-grid">
              {related.map(r => (
                <a key={r.id} href={`/${lang}/concert/${r.id}`} className="related-card">
                  <span className="related-name">{r.name}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </PageShell>
  );
}
