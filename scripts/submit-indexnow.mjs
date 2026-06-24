#!/usr/bin/env node

const SITE_URL = "https://ykskacgunkaldi.com";
const HOST = "ykskacgunkaldi.com";
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const DEFAULT_KEY = "df7cdb4351ae6da7";
const SITEMAP_URL = process.env.INDEXNOW_SITEMAP_URL || `${SITE_URL}/sitemap.xml`;
const key = process.env.INDEXNOW_KEY || DEFAULT_KEY;
const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `${SITE_URL}/${key}.txt`;

function normalize(input) {
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  return `${SITE_URL}${input.startsWith("/") ? input : `/${input}`}`;
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

async function getUrlsFromSitemap() {
  const response = await fetch(SITEMAP_URL);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Sitemap okunamadı: ${response.status} ${body}`);
  }

  const urls = [...body.matchAll(/<loc>(.*?)<\/loc>/gims)].map((match) =>
    decodeXml(match[1].trim()),
  );

  if (urls.length === 0) {
    throw new Error(`Sitemap içinde URL bulunamadı: ${SITEMAP_URL}`);
  }

  return urls;
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const urlSource = args.length ? args : await getUrlsFromSitemap();
const urls = Array.from(new Set(urlSource.map(normalize)));

if (urls.length > 10000) {
  console.error("IndexNow tek POST isteğinde en fazla 10.000 URL kabul eder.");
  process.exit(1);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation,
    urlList: urls,
  }),
});

const body = await response.text();
if (!response.ok) {
  console.error(`IndexNow gönderimi başarısız: ${response.status} ${body}`);
  process.exit(1);
}

console.log(`IndexNow ${urls.length} URL aldı: ${response.status}`);
