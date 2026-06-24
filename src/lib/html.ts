const LINK_TITLE_BY_HREF: Record<string, string> = {
  "/konu-dagilimi": "Konu dağılımı sayfasını incele",
  "/puan-hesaplama/yks": "YKS puan hesaplama aracını kullan",
};

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getHref(attributes: string) {
  const match = attributes.match(/\shref\s*=\s*(["'])(.*?)\1/i);
  return match?.[2] || "";
}

function hasAttribute(attributes: string, name: string) {
  return new RegExp(`\\s${name}\\s*=`, "i").test(attributes);
}

export function addMissingLinkTitles(html: string) {
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (match, attributes, body) => {
    const href = getHref(attributes);
    const fallbackTitle = LINK_TITLE_BY_HREF[href] || stripHtml(body);
    if (!fallbackTitle) return match;

    let nextAttributes = attributes;
    if (!hasAttribute(nextAttributes, "title")) {
      nextAttributes += ` title="${escapeAttribute(fallbackTitle)}"`;
    }
    if (!hasAttribute(nextAttributes, "aria-label")) {
      nextAttributes += ` aria-label="${escapeAttribute(fallbackTitle)}"`;
    }

    return `<a${nextAttributes}>${body}</a>`;
  });
}
