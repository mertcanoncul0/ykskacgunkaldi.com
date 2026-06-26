import { defineMiddleware } from "astro:middleware";

/**
 * Güvenlik ve cache başlıkları.
 *
 * Neden burada: projede nginx/vercel/netlify gibi ayrı bir edge/reverse-proxy
 * config dosyası yok — @astrojs/node adaptörü (standalone mode) tüm istekleri
 * (HTML sayfalar + statik dosyalar) aynı Node sürecinden sunuyor. Bu yüzden
 * HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
 * Permissions-Policy, CSP ve Cache-Control başlıklarının tek doğru yeri bu
 * merkezi Astro middleware'i.
 *
 * Not (HSTS): bu header'ın gerçek etkisi, prod domain'in her zaman geçerli
 * bir HTTPS sertifikasıyla sunulmasına bağlı — DNS/SSL kurulumu bu görevin
 * kapsamı dışında (rapor edildi). HTTP üzerinden gelen yanıtlarda tarayıcılar
 * bu header'ı zaten yok sayar, dolayısıyla zararsız ama HTTPS doğru
 * kurulmadan tam etkili olmaz.
 */

// Vite/Astro'nun içerik hash'li build çıktıları (örn. /_astro/foo.D3F1ab2c.js)
// — dosya adı içerik değiştiğinde değişir, bu yüzden agresif/immutable cache
// güvenlidir.
const HASHED_ASSET_RE = /\/_astro\/.+\.[A-Za-z0-9_-]{6,}\.(?:js|css|woff2?|png|jpe?g|svg|webp|avif)$/i;

// public/ klasöründen hash'siz servis edilen statik dosyalar (favicon,
// manifest, robots.txt, og görselleri vb.) — daha kısa ama hâlâ anlamlı bir
// cache süresi.
const STATIC_FILE_RE = /\.(?:js|css|png|jpe?g|svg|webp|avif|ico|woff2?|ttf|json|txt|xml|webmanifest)$/i;

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  // Astro island hydration için sayfaya küçük inline bootstrap scriptleri
  // ekler. Bunlar engellenirse React markup görünür ama event handler'lar
  // bağlanmaz; header menüleri ve tab/accordion kontrolleri tepkisiz kalır.
  // Google tag ve Cloudflare proxy arkasındaysa otomatik enjekte edilen Web
  // Analytics beacon'ı için origin istisnaları korunur.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://static.cloudflareinsights.com",
  "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://static.cloudflareinsights.com",
  // İkonlar SVG'ye taşındı ama bazı bileşenler (ScoreCalculatorForm,
  // KonuDagilimiClient, ilerleme çubuğu script'i, shadcn/ui sidebar/chart)
  // hâlâ inline style="" attribute'u kullanıyor — bunları kırmadan strict
  // style-src uygulamak büyük bir refactor gerektirir, bu yüzden
  // 'unsafe-inline' burada bilinçli bir taviz.
  "style-src 'self' 'unsafe-inline'",
  // Hepta Slab self-hosted (@fontsource) olduğu için fonts.gstatic.com'a
  // artık hiç ihtiyaç yok — font-src 'self' yeterli.
  "font-src 'self'",
  "img-src 'self' data: https:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://static.cloudflareinsights.com",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const EMBED_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self' https: http:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'none'",
  "form-action 'none'",
].join("; ");

// Giriş gerektiren yollar — token yoksa /giris'e yönlendirilir.
const PROTECTED_ROUTES = ["/hesap"];
// Sadece giriş yapılmamışken anlamlı yollar — giriş varsa /hesap'a gönder.
const GUEST_ONLY_ROUTES = ["/giris", "/kayit"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const hasToken = !!context.cookies.get("pb_token")?.value;

  // Korumalı sayfalara giriş kontrolü (header'lar eklenmeden önce).
  const isProtected = PROTECTED_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isProtected && !hasToken) {
    const redirect = encodeURIComponent(pathname + context.url.search);
    return context.redirect(`/giris?redirect=${redirect}`, 302);
  }

  // Giriş yapmış kullanıcı giriş/kayıt sayfasına gitmesin.
  if (hasToken && GUEST_ONLY_ROUTES.includes(pathname)) {
    return context.redirect("/hesap", 302);
  }

  const response = await next();
  const isEmbed = pathname.startsWith("/embed/");

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  if (!isEmbed) {
    response.headers.set("X-Frame-Options", "DENY");
  } else {
    response.headers.delete("X-Frame-Options");
  }
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    isEmbed ? EMBED_CONTENT_SECURITY_POLICY : CONTENT_SECURITY_POLICY
  );

  if (HASHED_ASSET_RE.test(pathname)) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (STATIC_FILE_RE.test(pathname)) {
    response.headers.set("Cache-Control", "public, max-age=86400");
  } else {
    // SSR HTML sayfaları: içerik PocketBase'den her istekte taze çekiliyor
    // (geri sayım/sınav/blog verisi sık değişebilir), agresif cache yerine
    // her zaman yeniden doğrulama yapılır.
    response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }

  return response;
});
