'use client';
import { useState } from 'react';
import { submitReport, reportsConfigured } from '@/lib/reports';
import { trackEvent } from '@/lib/analytics';
import { useLocale } from '@/hooks/useLocale';
import styles from './ListView.module.css';

const TEXT = {
  ko: { ask: '찾는 공연이 없나요?', button: '이 공연 알려 주세요', done: '요청을 받았어요. 찾아서 올려 둘게요.', fail: '요청을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요.' },
  en: { ask: "Can't find the show?", button: 'Ask us to add it', done: "Got it — we'll look it up and add it.", fail: 'Could not send the request. Please try again later.' },
  ja: { ask: 'お探しの公演がありませんか?', button: 'この公演をリクエスト', done: 'リクエストを受け付けました。調べて掲載します。', fail: '送信できませんでした。しばらくしてからもう一度お試しください。' },
};

/**
 * 검색 결과 0건일 때 "이 공연 알려 주세요" (2026-10-13).
 *
 * 0건 검색은 "찾으러 왔는데 우리가 없는 공연" — 니즈가 가장 직접적으로 드러나는 신호인데 그동안
 * "검색 결과가 없어요"만 띄우고 버렸다. 한 번 누르면 검색어가 기존 제보함(data_reports,
 * 관리자 화면)에 '공연 요청'으로 쌓이고, GA4에도 request_show로 남는다.
 * 리서처에게 "사람들이 직접 요청한 것부터 찾아라"로 넘기는 목록이 된다.
 */
export function RequestShowButton({ query }: { query: string }) {
  const lang = useLocale() ?? 'ko';
  const t = TEXT[lang];
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'fail'>('idle');
  const q = query.trim().slice(0, 100);
  if (!q) return null;

  const onClick = async () => {
    setState('sending');
    trackEvent('request_show', { search_term: q });
    if (!reportsConfigured()) { setState('done'); return; }   // 저장소가 없어도 GA4엔 남았다
    const r = await submitReport({ kind: 'show_request', targetType: 'search', targetId: q, locale: lang, message: q });
    setState(r.ok ? 'done' : 'fail');
  };

  if (state === 'done') return <p className={styles.requestDone}>{t.done}</p>;
  return (
    <div className={styles.request}>
      <p className={styles.requestAsk}>{t.ask}</p>
      <button type="button" className={styles.requestBtn} onClick={onClick} disabled={state === 'sending'}>
        {t.button}
      </button>
      {state === 'fail' && <p className={styles.requestFail}>{t.fail}</p>}
    </div>
  );
}
