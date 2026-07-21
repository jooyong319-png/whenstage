import type { Game } from './types';
import { CATEGORY_META } from './types';

export function buildGoogleCalendarUrl(game: Game): string {
  if (!game.release_date) return '';
  const start = game.release_date.replace(/-/g, '');
  const endDate = new Date(game.release_date);
  endDate.setDate(endDate.getDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, '');

  const title = game.name || '일정';
  const cat = CATEGORY_META[game.category]?.label ?? game.category;

  const details = [
    `[${cat}] ${title}`,
    game.description ?? '',
    game.developer ? `아티스트/기획사: ${game.developer}` : '',
    game.publisher ? `주최: ${game.publisher}` : '',
    game.platforms?.length ? `공연장: ${game.platforms.join(', ')}` : '',
    '',
    `출처: https://whenstage.com/ko/concert/${game.id}`
  ].filter(Boolean).join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${title} 출시`,
    dates: `${start}/${end}`,
    details
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
