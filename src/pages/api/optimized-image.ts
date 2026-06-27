import type { APIRoute } from "astro";
import sharp from "sharp";

const ALLOWED_HOSTS = new Set(["api.ykskacgunkaldi.com"]);
const MAX_WIDTH = 1400;
const MAX_HEIGHT = 1000;
const SOURCE_TIMEOUT_MS = 12_000;

function numericParam(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.round(parsed)));
}

function cleanSourceUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_HOSTS.has(url.hostname)) return null;
    if (!url.pathname.startsWith("/api/files/")) return null;
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ request, url }) => {
  const sourceUrl = cleanSourceUrl(url.searchParams.get("src"));
  if (!sourceUrl) {
    return new Response("Invalid image source", { status: 400 });
  }

  const width = numericParam(url.searchParams.get("w"), 680, MAX_WIDTH);
  const height = numericParam(url.searchParams.get("h"), Math.round(width / (16 / 9)), MAX_HEIGHT);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);

  try {
    const source = await fetch(sourceUrl, {
      headers: {
        accept: "image/avif,image/webp,image/png,image/jpeg,*/*",
      },
      signal: controller.signal,
    });

    if (!source.ok) {
      return new Response("Image source unavailable", { status: source.status });
    }

    const contentType = source.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return new Response("Unsupported source type", { status: 415 });
    }

    const input = new Uint8Array(await source.arrayBuffer());
    const acceptsAvif = request.headers.get("accept")?.includes("image/avif") ?? false;
    const transformer = sharp(input)
      .resize(width, height, {
        fit: "cover",
        position: "attention",
        withoutEnlargement: true,
      })
      .rotate();

    const output = acceptsAvif
      ? await transformer.avif({ quality: 50, effort: 4 }).toBuffer()
      : await transformer.webp({ quality: 72, effort: 4 }).toBuffer();

    return new Response(output, {
      headers: {
        "Content-Type": acceptsAvif ? "image/avif" : "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Cloudflare-CDN-Cache-Control": "public, max-age=31536000, immutable",
        "Vary": "Accept",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[optimized-image]", error);
    return new Response("Image optimization failed", { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
};
