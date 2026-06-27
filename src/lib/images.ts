const PB_FILE_RE = /\/api\/files\//;

function appendQuery(url: string, params: Record<string, string>) {
  try {
    const parsed = new URL(url, "https://local.invalid");
    for (const [key, value] of Object.entries(params)) {
      parsed.searchParams.set(key, value);
    }
    if (url.startsWith("/")) return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return parsed.toString();
  } catch {
    const joiner = url.includes("?") ? "&" : "?";
    return `${url}${joiner}${new URLSearchParams(params).toString()}`;
  }
}

export function pocketBaseThumb(url: string | undefined, width: number, height = 0) {
  if (!url) return undefined;
  if (!PB_FILE_RE.test(url)) return url;
  return appendQuery(url, { thumb: `${width}x${height}` });
}

export function pocketBaseCroppedThumb(url: string | undefined, width: number, height: number) {
  if (!url) return undefined;
  if (!PB_FILE_RE.test(url)) return url;
  return appendQuery(url, { thumb: `${width}x${height}f` });
}

export function responsivePocketBaseSrcSet(
  url: string | undefined,
  widths: number[],
  aspectRatio?: number,
) {
  if (!url || !PB_FILE_RE.test(url)) return undefined;
  return widths
    .map((width) => {
      const height = aspectRatio ? Math.round(width / aspectRatio) : 0;
      const src = aspectRatio ? pocketBaseCroppedThumb(url, width, height) : pocketBaseThumb(url, width);
      return `${src} ${width}w`;
    })
    .join(", ");
}
