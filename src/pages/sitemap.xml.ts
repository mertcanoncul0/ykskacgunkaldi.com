import type { APIRoute } from 'astro';
import { site } from '../lib/site';
import { getHomeSeoSitemapPaths } from '../lib/home-seo';
import { getExams, getPosts, getAllPageSlugs } from '../lib/pocketbase';
import { scoreCalculatorMenu } from '../data/score-calculators';

// Site artık tamamen PocketBase'den besleniyor; @astrojs/sitemap build-time'da
// çalıştığı ve sadece prerender edilen rotaları gördüğü için SSR'da işe
// yaramıyor. Bunun yerine her istekte PocketBase'i okuyan bu endpoint var.

const staticRoutes = [
  '/',
  '/sinavlar',
  '/sayac',
  '/blog',
  '/konu-dagilimi',
  '/populer-yazilar',
  '/ilanlar',
  '/rehberler',
];

function urlEntry(path: string) {
  return `  <url>\n    <loc>${site.url}${path}</loc>\n  </url>`;
}

export const GET: APIRoute = async () => {
  const [exams, posts, pageSlugs] = await Promise.all([
    getExams(),
    getPosts(),
    getAllPageSlugs(),
  ]);

  const urls = [
    ...staticRoutes,
    ...getHomeSeoSitemapPaths(exams),
    ...scoreCalculatorMenu.map((c) => `/puan-hesaplama/${c.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
    ...pageSlugs.map((slug) => `/${slug}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(urlEntry)
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
