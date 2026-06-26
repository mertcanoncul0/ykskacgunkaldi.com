import type { Post } from "../lib/pocketbase";
import { Icon } from "../lib/icons";

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
          aria-label="Tüm blog yazılarını görüntüle"
          title="Tüm blog yazılarını görüntüle"
        >
          Tümünü Gör
          <Icon name="arrow_forward" />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <article className="md:col-span-8 group">
          <a href={`/blog/${major.slug}`} className="block" aria-label={major.title} title={major.title}>
            <div className="relative overflow-hidden aspect-[16/9] mb-6 border border-border-subtle bg-surface-container">
              {major.coverImage ? (
                <img
                  className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700"
                  src={major.coverImage}
                  alt={major.coverImageAlt || major.title}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <Icon name="menu_book" size={48} />
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
            <h3 className="font-headline-lg text-[40px] leading-tight mb-4">
              <span className="title-underline">{major.title}</span>
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
              <a href={`/blog/${post.slug}`} className="block" aria-label={post.title} title={post.title}>
                <div className="aspect-[4/3] overflow-hidden border border-border-subtle mb-4 bg-surface-container">
                  {post.coverImage ? (
                    <img
                      className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
                      src={post.coverImage}
                      alt={post.coverImageAlt || post.title}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <Icon name="article" size={32} />
                    </div>
                  )}
                </div>
                {post.category && (
                  <span className="font-label-sm text-label-sm text-text-muted uppercase mb-2 block tracking-widest">
                    {post.category}
                  </span>
                )}
                <h4 className="font-headline-md text-headline-md leading-snug">
                  <span className="title-underline">{post.title}</span>
                </h4>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
