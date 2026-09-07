import type { MetadataRoute } from 'next';

/**
 * robots.txt — 사이트맵 위치를 알리고, **검색에 도움이 안 되는 크롤러를 막는다.**
 *
 * ## 왜 막나 (2026-09-07)
 *
 * Vercel ISR Read Units가 한 달 한도의 90%에 닿았고, 그중 76%가 이 프로젝트였다.
 * 그런데 사람 방문자는 하루 20명 남짓이다. 요청 대부분이 봇이라는 뜻이다.
 *
 * 아래 목록은 **검색 유입을 하나도 만들지 않으면서 요청만 쌓는** 크롤러다.
 *
 *  · AI 학습 크롤러 — 콘텐츠를 학습 데이터로 가져갈 뿐 우리 쪽으로 사람을 보내지 않는다
 *  · SEO 분석 도구 — 경쟁사 조사용이지 우리 검색 순위와는 무관하다
 *
 * ## 무엇을 막지 않는가
 *
 * **검색엔진은 하나도 막지 않는다.** Googlebot·Bingbot·Yeti(네이버)·Daum은 전체 허용
 * 그대로다. `Google-Extended`는 이름이 비슷하지만 검색이 아니라 Gemini 학습용이라
 * 막아도 검색 순위에 영향이 없다(구글이 공식적으로 밝힌 내용이다).
 *
 * 이 사이트는 3개 로케일 1,570페이지라 크롤러 하나가 훑는 양이 크다. 그래서 같은 차단이
 * 딱칼크보다 효과가 크다. 되돌리기 쉬운 조치이니, 유입이 줄면 목록에서 빼면 된다.
 */

/** 콘텐츠를 학습에 쓰되 사람을 보내주지는 않는 크롤러 */
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'anthropic-ai', 'Claude-Web',
  'Google-Extended',          // Gemini 학습용. 검색(Googlebot)과 다른 봇이다.
  'Applebot-Extended',        // 같은 이유. 검색용 Applebot은 막지 않는다.
  'CCBot', 'PerplexityBot', 'Bytespider', 'Amazonbot',
  'Meta-ExternalAgent', 'FacebookBot', 'cohere-ai', 'Diffbot',
  'ImagesiftBot', 'Omgilibot', 'Timpibot', 'YouBot',
];

/** 경쟁사 분석용 SEO 도구. 우리 검색 순위에 아무 영향이 없다. */
const SEO_TOOLS = [
  'AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'DataForSeoBot',
  'BLEXBot', 'Barkrowler', 'ZoominfoBot', 'Seekport Crawler', 'serpstatbot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/_next/'] },
      { userAgent: AI_CRAWLERS, disallow: '/' },
      { userAgent: SEO_TOOLS, disallow: '/' },
    ],
    sitemap: 'https://whenstage.com/sitemap.xml',
    host: 'https://whenstage.com',
  };
}
