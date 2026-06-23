import type { APIRoute } from 'astro';
import { site } from '../lib/site';
import { getPosts } from '../lib/pocketbase';

// sitemap.xml.ts ile aynı mantık: site SSR olduğu ve içerik PocketBase'den
// geldiği için statik @astrojs/rss yerine her istekte PocketBase'i okuyan
// bu endpoint kullanılıyor.

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const posts = await getPosts();

  const items = posts
    .slice(0, 50)
    .map((p) => {
      const url = `${site.url}/blog/${p.slug}`;
      const pubDate = p.publishedAt
        ? new Date(p.publishedAt).toUTCString()
        : new Date().toUTCString();
      return `  <item>\n    <title>${escapeXml(p.title)}</title>\n    <link>${url}</link>\n    <guid>${url}</guid>\n    <pubDate>${pubDate}</pubDate>\n    <description>${escapeXml(p.excerpt || '')}</description>\n  </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>${escapeXml(site.name)}</title>\n  <link>${site.url}</link>\n  <description>${escapeXml(site.defaultDescription)}</description>\n  <language>tr-TR</language>\n${items}\n</channel>\n</rss>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
