import type { Post } from "../lib/pocketbase";

function formatDate(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

// Editorial "Öne Çıkan Yazılar" bento grid — literal new_ui/ana_sayfa_saya_final
// layout (1 major + 2 side articles). Fictional photography/copy replaced with
// real blog posts from PocketBase; posts without a coverImage fall back to a
// plain monochrome placeholder block instead of a fabricated stock photo.
export function FeaturedPosts({ posts }: { posts: Post[] }) {
  const [major, ...rest] = posts;
  const side = rest.slice(0, 2);
  if (!major) return null;

  return (
    <section className="mb-section-gap">
      <div className="flex justify-between items-end mb-12 border-b border-black-pure pb-4">
        <h2 className="font-headline-lg text-headline-lg uppercase tracking-tight">Öne Çıkan Yazılar</h2>
        <a
          className="font-label-md text-label-md uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform"
          href="/blog"
        >
          Tümünü Gör
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <article className="md:col-span-8 group">
          <a href={`/blog/${major.slug}`} className="block">
            <div className="relative overflow-hidden aspect-[16/9] mb-6 border border-border-subtle bg-surface-container">
              {major.coverImage ? (
                <img
                  className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700"
                  src={major.coverImage}
                  alt={major.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <span className="material-symbols-outlined text-[48px]" aria-hidden="true">
                    menu_book
                  </span>
                </div>
              )}
              {major.category && (
                <div className="absolute top-6 left-6 z-20">
                  <span className="bg-primary text-on-primary px-4 py-1 font-label-sm text-label-sm uppercase">
                    {major.category}
                  </span>
                </div>
              )}
            </div>
            <h3 className="font-headline-lg text-[40px] leading-tight mb-4 group-hover:underline decoration-1 underline-offset-4">
              {major.title}
            </h3>
          </a>
          {major.excerpt && <p className="font-body-md text-text-muted max-w-xl mb-6">{major.excerpt}</p>}
          <div className="flex items-center gap-4 text-text-muted font-label-sm text-label-sm uppercase tracking-wider">
            {major.authorName && <span>{major.authorName}</span>}
            {major.authorName && major.publishedAt && <span className="w-1 h-1 bg-text-muted rounded-full" />}
            {major.publishedAt && <span>{formatDate(major.publishedAt)}</span>}
          </div>
        </article>

        <div className="md:col-span-4 flex flex-col gap-12">
          {side.map((post) => (
            <article key={post.slug} className="group">
              <a href={`/blog/${post.slug}`} className="block">
                <div className="aspect-[4/3] overflow-hidden border border-border-subtle mb-4 bg-surface-container">
                  {post.coverImage ? (
                    <img
                      className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
                      src={post.coverImage}
                      alt={post.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <span className="material-symbols-outlined text-[32px]" aria-hidden="true">
                        article
                      </span>
                    </div>
                  )}
                </div>
                {post.category && (
                  <span className="font-label-sm text-label-sm text-text-muted uppercase mb-2 block tracking-widest">
                    {post.category}
                  </span>
                )}
                <h4 className="font-headline-md text-headline-md leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
