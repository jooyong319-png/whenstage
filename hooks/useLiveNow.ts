'use client';
import { createContext, createElement, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';

/**
 * 실제 현재 시각(1분마다 갱신) — 서버 렌더·하이드레이션 중에는 서버 렌더 시각 (2026-11-04, Codex 점검).
 *
 * 왜: 예매 오픈·마감은 "몇 시"까지 따져야 한다. 그런데 홈이 내려주는 `now`는 하이드레이션 일치를 위한
 * **오늘 자정**(kstDateOnly)이라, "오늘 10시 오픈"이 오후에도 안 열린 것으로, "오늘 18시 마감"이 밤에도
 * 열린 것으로 보였다. 또 렌더 중에 Date.now()를 바로 쓰면 빌드 시각과 접속 시각이 달라 하이드레이션이 깨진다.
 *
 * 쓰는 법: `const live = useLiveNow() ?? now;`
 *  - 마운트 전(서버 렌더·하이드레이션)엔 <ServerNowProvider>가 준 **서버 렌더 시각**(ISO 문자열 → 같은 순간)
 *    — 서버와 브라우저가 같은 값을 쓰니 하이드레이션이 일치한다. 🔴 `now`(kstDateOnly = 그 기기 시간대의 자정)를
 *    판매 시각 비교에 쓰면 서버(UTC 자정)와 브라우저(KST·NZ 자정)가 **다른 순간**이 되어, 경계에 걸린 공연이
 *    있으면 목록이 달라졌다(Pacific/Auckland /ja에서 실측). Provider가 없으면 null.
 * 타이머는 구독자가 있을 때만 하나 돈다(카드 수십 장이 각자 setInterval을 만들지 않게).
 */
let current: Date | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!timer) {
    current = new Date();
    timer = setInterval(() => { current = new Date(); listeners.forEach(l => l()); }, 60_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) { clearInterval(timer); timer = null; }
  };
}

function getSnapshot(): Date | null {
  if (!current) current = new Date();
  return current;
}

function getServerSnapshot(): Date | null { return null; }

const ServerNowContext = createContext<string | null>(null);

/** 서버 렌더 시각(ISO)을 아래 컴포넌트들에 준다 — 페이지에서 `new Date().toISOString()`을 넘긴다 */
export function ServerNowProvider({ value, children }: { value: string; children: ReactNode }) {
  return createElement(ServerNowContext.Provider, { value }, children);
}

export function useLiveNow(): Date | null {
  const live = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const serverIso = useContext(ServerNowContext);
  const serverNow = useMemo(() => (serverIso ? new Date(serverIso) : null), [serverIso]);
  return live ?? serverNow;
}
