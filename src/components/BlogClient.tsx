import { useMemo, useState } from "react";
import type { Post } from "../lib/pocketbase";
import { Icon } from "../lib/icons";

function readingTime(p: Post): number {
  const text = (p?.contentHtml || p?.excerpt || "") as string;
  const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200));
}

function formatDate(d?: string) {
  if (!d) return "";
  try {
    return new Date(d)
      .toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
      .toLocaleUpperCase("tr-TR");
  } catch {
    return "";
  }
}

const PAGE_SIZE = 9;

// Literal new_ui/blog_yaz_lar_final layout: a large featured article followed
// by a square card grid. The mockup's own top nav, sidebar, and "Bülten"
// newsletter widget are dropped here — the sidebar is now the global
// SideNav, and there is no newsletter backend to subscribe to. Category
// filter chips are derived from the real `category` field on each post
// instead of the mockup's fictional film-studies categories; posts with no
// category just don't get a chip/badge rather than being assigned a fake one.
export function BlogClient({ posts }: { posts: Post[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.category && set.add(p.category));
    return ["Tüm Yazılar", ...Array.from(set)];
  }, [posts]);

  const [active, setActive] = useState("Tüm Yazılar");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (active === "Tüm Yazılar" ? posts : posts.filter((p) => p.category === active)),
    [posts, active]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagePosts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const [featured, ...rest] = pagePosts;

  function selectCategory(c: string) {
    setActive(c);
    setPage(1);
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto py-section-gap">
        <header className="mb-12">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-4">Sınav Rehberi ve Blog</h1>
          <div className="h-px w-24 bg-primary mb-6" />
          <p className="font-body-lg text-text-muted max-w-2xl">
            Sınav hazırlığında kullanabileceğiniz çalışma teknikleri, güncel rehber yazıları ve kaynak notları.
          </p>
        </header>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => selectCategory(c)}
                className={`px-5 py-2 font-label-md text-label-md uppercase tracking-wide border transition-colors ${
                  active === c
                    ? "bg-primary text-on-primary border-primary"
                    : "border-border-subtle text-text-muted hover:border-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {pagePosts.length === 0 && (
          <p className="font-body-md text-text-muted py-section-gap text-center">
            Bu kategoride henüz yazı bulunmuyor. Yakında eklenecek.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-12">
          {featured && (
            <article className="col-span-1 md:col-span-2 group">
              <a href={`/blog/${featured.slug}`} className="block">
                <div className="relative overflow-hidden aspect-[21/9] mb-6 border border-border-subtle bg-surface-container">
                  {featured.coverImage ? (
                    <img
                      className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700"
                      src={featured.coverImage}
                      alt={featured.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <Icon name="menu_book" size={48} />
                    </div>
                  )}
                  {featured.category && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-on-primary px-3 py-1 font-label-sm uppercase">
                        {featured.category}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-3">
                  {featured.publishedAt && (
                    <time className="font-label-sm text-text-muted">{formatDate(featured.publishedAt)}</time>
                  )}
                  <span className="h-px w-8 bg-border-subtle" />
                  <span className="font-label-sm text-primary">{readingTime(featured)} DK OKUMA</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg mb-4 group-hover:underline underline-offset-4 decoration-1">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="font-body-md text-text-muted line-clamp-2">{featured.excerpt}</p>
                )}
              </a>
            </article>
          )}

          {rest.map((p) => (
            <article key={p.slug} className="group">
              <a href={`/blog/${p.slug}`} className="block">
                <div className="aspect-square mb-6 border border-border-subtle bg-surface-container overflow-hidden">
                  {p.coverImage ? (
                    <img
                      className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
                      src={p.coverImage}
                      alt={p.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <Icon name="article" size={32} />
                    </div>
                  )}
                </div>
                {p.category && (
                  <span className="border border-primary text-primary px-2 py-0.5 font-label-sm uppercase inline-block mb-3">
                    {p.category}
                  </span>
                )}
                {p.publishedAt && (
                  <time className="block font-label-sm text-text-muted mb-2">{formatDate(p.publishedAt)}</time>
                )}
                <h3 className="font-headline-md text-headline-md mb-3 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                {p.excerpt && (
                  <p className="font-body-md text-text-muted text-sm line-clamp-3">{p.excerpt}</p>
                )}
              </a>
            </article>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="mt-20 flex justify-center items-center gap-4">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-10 h-10 flex items-center justify-center border border-border-subtle hover:border-primary transition-colors disabled:opacity-30"
              aria-label="Önceki sayfa"
            >
              <Icon name="chevron_left" />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`font-label-md transition-colors ${
                  n === page ? "text-primary font-bold" : "text-text-muted hover:text-primary"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={page === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="w-10 h-10 flex items-center justify-center border border-border-subtle hover:border-primary transition-colors disabled:opacity-30"
              aria-label="Sonraki sayfa"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
