'use client';
import { useEffect, useState } from 'react';
import styles from './InstallPrompt.module.css';

// ▼▼ Play 스토어 출시되면 여기에 URL 한 줄 넣고 배포하면 끝 ▼▼
//    예: 'https://play.google.com/store/apps/details?id=com.whenstage.app'
//    비어있으면 → PWA 설치(현재). 채우면 → Android는 자동으로 Play 링크로 전환.
const PLAY_STORE_URL = '';

const DISMISS_KEY = 'whenstage.installDismissed';
const DISMISS_DAYS = 1;

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

type Mode = 'pwa' | 'ios' | 'play';

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    // 이미 설치(standalone)면 숨김
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    // 최근에 닫았으면 숨김
    try {
      const d = localStorage.getItem(DISMISS_KEY);
      if (d && Date.now() - Number(d) < DISMISS_DAYS * 86400000) return;
    } catch { /* ignore */ }

    const ua = navigator.userAgent;
    const isAndroid = /android/i.test(ua);

    // Play 스토어 출시됨 + Android → Play 링크 모드 (삼성 인터넷 경고 회피, 신뢰도↑)
    if (PLAY_STORE_URL && isAndroid) {
      setMode('play');
      return;
    }

    // 그 외 → PWA 설치 / iOS 수동
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setMode('pwa');
    };
    window.addEventListener('beforeinstallprompt', onBIP);

    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|chrome|android/i.test(ua);
    if (isIos && isSafari) setMode('ios');

    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    setMode(null);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch { /* ignore */ }
    setDeferred(null);
    setMode(null);
  };

  const sub =
    mode === 'ios'
      ? '공유 버튼 → "홈 화면에 추가"로 설치하세요.'
      : mode === 'play'
        ? 'Google Play에서 설치하고 출시 알림까지 받아보세요.'
        : '홈 화면에서 바로 열고, 출시 알림까지 받아보세요.';

  return (
    <div className={styles.banner} role="dialog" aria-label="앱 설치 안내">
      <span className={styles.icon} aria-hidden="true">
        <svg className="ic"><use href="#ic-calendar" /></svg>
      </span>
      <div className={styles.text}>
        <strong className={styles.title}>앱으로 설치하기</strong>
        <span className={styles.sub}>{sub}</span>
      </div>
      {mode === 'play' && (
        <a className={styles.cta} href={PLAY_STORE_URL} target="_blank" rel="noopener" onClick={dismiss}>
          Play 스토어
        </a>
      )}
      {mode === 'pwa' && (
        <button type="button" className={styles.cta} onClick={install}>설치</button>
      )}
      <button type="button" className={styles.close} onClick={dismiss} aria-label="닫기">×</button>
    </div>
  );
}
