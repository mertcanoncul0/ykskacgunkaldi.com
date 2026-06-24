#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const PB_URL = (process.env.POCKETBASE_URL || "https://api.ykskacgunkaldi.com").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD;
const DEFAULT_SOURCE_DIR = "/Users/mertcanoncul/Downloads/files";
const OSYM_QUESTIONS_URL = "https://www.osym.gov.tr/tr%2C15164/yks-cikmis-sorular.html";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sourceDir =
  args.find((arg) => !arg.startsWith("--")) || process.env.TOPIC_POSTS_DIR || DEFAULT_SOURCE_DIR;

const posts = [
  {
    file: "tyt-matematik-en-cok-cikan-konular.md",
    slug: "tyt-matematik-en-cok-cikan-konular",
    category: "Konu Dağılımı",
    authorName: "Kaynak Editörü",
    publishedAt: "2026-06-24 09:00:00.000Z",
    tags: ["TYT", "Matematik", "Konu Dağılımı", "YKS"],
    links: [
      { href: "/konu-dagilimi/tyt", label: "TYT konu dağılımı" },
      { href: "/puan-hesaplama/tyt", label: "TYT puan hesaplama" },
      { href: "/tyt-kac-gun-kaldi", label: "TYT sayacı" },
    ],
  },
  {
    file: "tyt-turkce-en-cok-cikan-konular.md",
    slug: "tyt-turkce-en-cok-cikan-konular",
    category: "Konu Dağılımı",
    authorName: "Kaynak Editörü",
    publishedAt: "2026-06-24 09:10:00.000Z",
    tags: ["TYT", "Türkçe", "Konu Dağılımı", "YKS"],
    links: [
      { href: "/konu-dagilimi/tyt", label: "TYT konu dağılımı" },
      { href: "/puan-hesaplama/tyt", label: "TYT puan hesaplama" },
      { href: "/tyt-kac-gun-kaldi", label: "TYT sayacı" },
    ],
  },
  {
    file: "ayt-matematik-en-cok-cikan-konular.md",
    slug: "ayt-matematik-en-cok-cikan-konular",
    category: "Konu Dağılımı",
    authorName: "Kaynak Editörü",
    publishedAt: "2026-06-24 09:20:00.000Z",
    tags: ["AYT", "Matematik", "Konu Dağılımı", "YKS"],
    links: [
      { href: "/konu-dagilimi/ayt", label: "AYT konu dağılımı" },
      { href: "/puan-hesaplama/ayt", label: "AYT puan hesaplama" },
      { href: "/ayt-kac-gun-kaldi", label: "AYT sayacı" },
    ],
  },
  {
    file: "ayt-edebiyat-en-cok-cikan-konular.md",
    slug: "ayt-edebiyat-en-cok-cikan-konular",
    category: "Konu Dağılımı",
    authorName: "Kaynak Editörü",
    publishedAt: "2026-06-24 09:30:00.000Z",
    tags: ["AYT", "Edebiyat", "Konu Dağılımı", "YKS"],
    links: [
      { href: "/konu-dagilimi/ayt", label: "AYT konu dağılımı" },
      { href: "/puan-hesaplama/ayt", label: "AYT puan hesaplama" },
      { href: "/ayt-kac-gun-kaldi", label: "AYT sayacı" },
    ],
  },
  {
    file: "yks-konu-dagilimina-gore-calisma-plani.md",
    slug: "yks-konu-dagilimina-gore-calisma-plani",
    category: "Çalışma Planı",
    authorName: "Kaynak Editörü",
    publishedAt: "2026-06-24 09:40:00.000Z",
    tags: ["YKS", "TYT", "AYT", "Çalışma Planı", "Konu Dağılımı"],
    links: [
      { href: "/konu-dagilimi", label: "YKS konu dağılımı" },
      { href: "/yks-calisma-programi", label: "YKS çalışma programı" },
      { href: "/deneme-net-takip-tablosu", label: "Deneme net takip tablosu" },
      { href: "/puan-hesaplama/yks", label: "YKS puan hesaplama" },
    ],
  },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInline(value) {
  const placeholders = [];
  let text = escapeHtml(value);

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const index = placeholders.length;
    placeholders.push(
      `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`,
    );
    return `@@LINK_${index}@@`;
  });

  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  return text.replace(/@@LINK_(\d+)@@/g, (_, index) => placeholders[Number(index)]);
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let listItems = [];
  let blockquote = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    html.push(`<ul>${listItems.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  const flushBlockquote = () => {
    if (blockquote.length === 0) return;
    html.push(`<blockquote>${renderInline(blockquote.join(" "))}</blockquote>`);
    blockquote = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line === "---") {
      flushParagraph();
      flushList();
      flushBlockquote();
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      blockquote.push(line.slice(2).trim());
      continue;
    }

    const listMatch = line.match(/^- (.+)$/);
    if (listMatch) {
      flushParagraph();
      flushBlockquote();
      listItems.push(listMatch[1]);
      continue;
    }

    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushBlockquote();

  return html.join("\n\n");
}

function extractPost(markdown, config) {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const excerpt = markdown.match(/^\*\*Meta Açıklama:\*\*\s*(.+)$/m)?.[1]?.trim();

  if (!title || !excerpt) {
    throw new Error(`${config.file} içinde başlık veya meta açıklama bulunamadı.`);
  }

  let body = markdown
    .replace(/^#\s+.+$/m, "")
    .replace(/^\*\*Meta Açıklama:\*\*\s*.+$/m, "")
    .replace(/^\s*---\s*$/m, "")
    .trim();

  body = body
    .replace(
      "Geçmiş TYT sınavlarını çözün: 2018'den günümüze tüm TYT Matematik sorularını mutlaka inceleyin.",
      "ÖSYM'nin yayımladığı resmi TYT kitapçıklarını çözün: 2018'den günümüze soru tarzını yalnızca resmi kaynak üzerinden inceleyin.",
    )
    .replace(
      "Geçmiş TYT sorularını çözün: 2018'den bu yana çıkan tüm Türkçe sorularını mutlaka inceleyin.",
      "ÖSYM'nin yayımladığı resmi TYT kitapçıklarını çözün: 2018'den bu yana Türkçe soru tarzını yalnızca resmi kaynak üzerinden inceleyin.",
    )
    .replace(
      "Geçmiş AYT sorularını konu konu çözün: Soru stiline ve zorluk seviyesine alışmak için vazgeçilmezdir.",
      "ÖSYM'nin yayımladığı resmi AYT kitapçıklarını konu konu çözün: Soru stiline ve zorluk seviyesine alışmak için resmi kaynağı esas alın.",
    )
    .replace(
      "Geçmiş AYT Edebiyat sorularını mutlaka çözün: Soru tarzını tanımak için en değerli kaynaktır.",
      "ÖSYM'nin yayımladığı resmi AYT Edebiyat kitapçıklarını mutlaka çözün: Soru tarzını tanımak için resmi kaynağı esas alın.",
    )
    .replace(
      "Geçmiş sınav soruları (TYT + AYT karma)",
      "Resmi ÖSYM kitapçıkları üzerinden TYT + AYT karma tekrar",
    );

  const introHtml = `
<p><strong>Telif notu:</strong> Bu yazı çıkmış soru metni, seçenek veya kitapçık kopyası yayımlamaz. Konu başlığı ve çalışma önceliği analizi sunar; resmi soru kitapçıkları için <a href="${OSYM_QUESTIONS_URL}" target="_blank" rel="noopener noreferrer nofollow">ÖSYM YKS çıkmış sorular sayfasını</a> kullanın.</p>

<p><strong>İlgili araçlar:</strong> ${config.links
    .map((link) => `<a href="${link.href}">${link.label}</a>`)
    .join(" · ")}</p>`;

  return {
    slug: config.slug,
    title,
    category: config.category,
    excerpt,
    contentHtml: `${introHtml}\n\n${markdownToHtml(body)}`,
    authorName: config.authorName,
    tags: config.tags,
    coverImage: "",
    publishedAt: config.publishedAt,
    status: "published",
  };
}

async function authenticate() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "PocketBase admin bilgisi eksik. POCKETBASE_ADMIN_EMAIL ve POCKETBASE_ADMIN_PASSWORD env değerlerini verin.",
    );
  }

  const payload = JSON.stringify({
    identity: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  for (const pathname of [
    "/api/collections/_superusers/auth-with-password",
    "/api/admins/auth-with-password",
  ]) {
    const response = await fetch(`${PB_URL}${pathname}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    }

    if (response.status !== 404) {
      const text = await response.text();
      throw new Error(`PocketBase auth başarısız: ${response.status} ${text}`);
    }
  }

  throw new Error("PocketBase auth endpoint bulunamadı.");
}

async function findExistingPost(token, slug) {
  const filter = encodeURIComponent(`slug="${slug}"`);
  const response = await fetch(
    `${PB_URL}/api/collections/posts/records?perPage=1&filter=${filter}`,
    { headers: { authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error(`Post sorgusu başarısız: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.items?.[0];
}

async function upsertPost(token, post) {
  const existing = await findExistingPost(token, post.slug);
  const endpoint = existing
    ? `${PB_URL}/api/collections/posts/records/${existing.id}`
    : `${PB_URL}/api/collections/posts/records`;

  const response = await fetch(endpoint, {
    method: existing ? "PATCH" : "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    throw new Error(`${post.slug} kaydedilemedi: ${response.status} ${await response.text()}`);
  }

  return { action: existing ? "updated" : "created", record: await response.json() };
}

const parsedPosts = [];
for (const config of posts) {
  const markdown = await fs.readFile(path.join(sourceDir, config.file), "utf8");
  parsedPosts.push(extractPost(markdown, config));
}

if (dryRun) {
  for (const post of parsedPosts) {
    console.log(`${post.slug} | ${post.title} | ${post.excerpt.length} excerpt chars | ${post.contentHtml.length} html chars`);
  }
  console.log(`Dry-run tamam: ${parsedPosts.length} post hazırlandı.`);
  process.exit(0);
}

const token = await authenticate();
for (const post of parsedPosts) {
  const result = await upsertPost(token, post);
  console.log(`${result.action}: /blog/${result.record.slug}`);
}

console.log(`${parsedPosts.length} blog yazısı PocketBase'e kaydedildi.`);
