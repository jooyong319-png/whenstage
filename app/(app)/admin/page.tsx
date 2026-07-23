import type { Metadata } from 'next';
import { getAllGames } from '@/lib/games';
import { getAllPosts } from '@/lib/blog';
import { LOCALES } from '@/lib/i18nLabels';
import { AdminDashboard } from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: '관리자',
  robots: { index: false, follow: false }, // 검색 노출 금지
};

export default async function AdminPage() {
  const games = await getAllGames();
  const nameMap: Record<string, string> = {};
  for (const g of games) nameMap[g.id] = g.name;
  // 블로그는 이제 로케일별 완전 독립 콘텐츠라 전체 로케일을 훑어야 빠짐없이 매핑된다.
  for (const lang of LOCALES) {
    const posts = await getAllPosts(lang);
    for (const p of posts) nameMap[`blog:${p.slug}`] = p.title; // 가이드 글 제목 매핑
  }
  return <AdminDashboard nameMap={nameMap} />;
}
