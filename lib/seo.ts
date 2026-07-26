// SEO 구조화 데이터(JSON-LD) 공용 헬퍼 — fs/브라우저 의존 없는 순수 모듈.

// BreadcrumbList — 상세 페이지 계층(홈 > 섹션 > 항목)을 SERP 빵부스러기로 노출.
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// 여러 JSON-LD를 한 <script>에 안전하게 넣기 위한 직렬화(</script> 이스케이프).
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
