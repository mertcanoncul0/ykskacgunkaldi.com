import type { APIRoute } from 'astro';
import { site } from '../lib/site';
import { getHomeSeoSitemapPaths } from '../lib/home-seo';
import { getExams, getPosts, getAllPageSlugs, getSubjects } from '../lib/pocketbase';
import { scoreCalculatorMenu } from '../data/score-calculators';
import { examLandingPaths } from '../data/exam-landing-pages';
import { toolPagePaths } from '../data/tool-pages';

// Site artık tamamen PocketBase'den besleniyor; @astrojs/sitemap build-time'da
// çalıştığı ve sadece prerender edilen rotaları gördüğü için SSR'da işe
// yaramıyor. Bunun yerine her istekte PocketBase'i okuyan bu endpoint var.

const staticRoutes = [
  '/',
  '/sinavlar',
  '/sayac',
  '/blog',
  '/konu-dagilimi',
  '/konu-dagilimi/tyt',
  '/konu-dagilimi/ayt',
  '/konu-dagilimi/lgs',
  '/populer-yazilar',
  '/ilanlar',
  '/rehberler',
];

function urlEntry(path: string, lastmod?: string) {
  const last = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${site.url}${path}</loc>${last}\n  </url>`;
}

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

export const GET: APIRoute = async () => {
  const [exams, posts, pageSlugs, subjectList] = await Promise.all([
    getExams(),
    getPosts(),
    getAllPageSlugs(),
    getSubjects(),
  ]);

  // Blog yazıları için yayın tarihini lastmod olarak kullan.
  const postLastmod = new Map<string, string | undefined>();
  for (const p of posts) postLastmod.set(`/blog/${p.slug}`, toIsoDate(p.publishedAt));

  // Ders bazlı konu dağılımı sayfaları (gerçek URL'ler).
  const TYT_SUBJECT_SLUGS = [
    'turkce', 'matematik', 'geometri', 'fizik', 'kimya', 'biyoloji',
    'tarih', 'cografya', 'felsefe', 'din-kulturu',
  ];
  const konuPaths: string[] = [];
  for (const s of subjectList) {
    if (s.examSlug !== 'yks') continue;
    if (s.slug.startsWith('ayt-')) {
      konuPaths.push(`/konu-dagilimi/ayt/${s.slug.slice(4)}`);
    } else if (TYT_SUBJECT_SLUGS.includes(s.slug)) {
      konuPaths.push(`/konu-dagilimi/tyt/${s.slug}`);
    }
  }

  const urls = Array.from(new Set([
    ...staticRoutes,
    ...examLandingPaths,
    ...toolPagePaths,
    ...getHomeSeoSitemapPaths(exams),
    ...scoreCalculatorMenu.map((c) => `/puan-hesaplama/${c.slug}`),
    ...konuPaths,
    ...posts.map((p) => `/blog/${p.slug}`),
    ...pageSlugs.map((slug) => `/${slug}`),
  ]));

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((path) => urlEntry(path, postLastmod.get(path)))
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
