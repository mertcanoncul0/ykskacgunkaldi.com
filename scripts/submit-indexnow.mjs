#!/usr/bin/env node

const SITE_URL = "https://ykskacgunkaldi.com";
const HOST = "ykskacgunkaldi.com";
const DEFAULT_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];
const DEFAULT_KEY = "df7cdb4351ae6da7";
const SITEMAP_URL = process.env.INDEXNOW_SITEMAP_URL || `${SITE_URL}/sitemap.xml`;
const key = process.env.INDEXNOW_KEY || DEFAULT_KEY;
const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `${SITE_URL}/${key}.txt`;
const endpoints = (process.env.INDEXNOW_ENDPOINT || process.env.INDEXNOW_ENDPOINTS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const endpointList = endpoints.length > 0 ? endpoints : DEFAULT_ENDPOINTS;

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

const payload = {
  host: HOST,
  key,
  keyLocation,
  urlList: urls,
};

const results = await Promise.all(
  endpointList.map(async (endpoint) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const body = await response.text();
    return { endpoint, ok: response.ok, status: response.status, body };
  }),
);

for (const result of results) {
  if (result.ok) {
    console.log(`IndexNow ${result.endpoint} ${urls.length} URL aldı: ${result.status}`);
  } else {
    console.error(`IndexNow ${result.endpoint} başarısız: ${result.status} ${result.body}`);
  }
}

if (!results.some((result) => result.ok)) {
  console.error("IndexNow gönderimi başarısız: hiçbir endpoint URL'leri kabul etmedi.");
  process.exit(1);
}

const failedCount = results.filter((result) => !result.ok).length;
if (failedCount > 0) {
  console.warn(`IndexNow uyarı: ${failedCount} endpoint reddetti, en az bir endpoint kabul ettiği için işlem tamamlandı.`);
}
