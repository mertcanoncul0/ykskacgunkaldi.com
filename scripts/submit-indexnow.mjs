#!/usr/bin/env node

const SITE_URL = "https://ykskacgunkaldi.com";
const HOST = "ykskacgunkaldi.com";
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const key = process.env.INDEXNOW_KEY;
const keyLocation = process.env.INDEXNOW_KEY_LOCATION || (key ? `${SITE_URL}/${key}.txt` : undefined);

const defaultPaths = [
  "/yks-kac-gun-kaldi",
  "/tyt-kac-gun-kaldi",
  "/ayt-kac-gun-kaldi",
  "/lgs-kac-gun-kaldi",
  "/kpss-kac-gun-kaldi",
  "/dgs-kac-gun-kaldi",
  "/ales-kac-gun-kaldi",
  "/2027-yks-takvimi",
  "/yks-calisma-programi",
  "/deneme-net-takip-tablosu",
  "/basari-siralamasi-tahmini",
  "/embed-sayac",
  "/konu-dagilimi/tyt",
  "/konu-dagilimi/ayt",
  "/konu-dagilimi/lgs",
  "/puan-hesaplama/yks",
  "/konu-dagilimi",
  "/blog",
  "/sinavlar",
];

function normalize(input) {
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  return `${SITE_URL}${input.startsWith("/") ? input : `/${input}`}`;
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const urls = Array.from(new Set((args.length ? args : defaultPaths).map(normalize)));

if (!key) {
  console.error("INDEXNOW_KEY ortam değişkeni gerekli.");
  process.exit(1);
}

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
