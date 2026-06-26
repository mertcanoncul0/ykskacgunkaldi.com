import type { Post } from "../lib/pocketbase";
import { Icon } from "../lib/icons";
import { BlogPostCard } from "./BlogPostCard";

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
        <BlogPostCard post={major} variant="major" className="md:col-span-8" />

        <div className="md:col-span-4 flex flex-col gap-12">
          {side.map((post) => (
            <BlogPostCard key={post.slug} post={post} variant="side" />
          ))}
        </div>
      </div>
    </section>
  );
}
