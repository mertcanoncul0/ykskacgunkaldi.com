import type { ElementType } from "react";
import type { Post } from "../lib/pocketbase";
import { Icon } from "../lib/icons";
import { pocketBaseThumb, responsivePocketBaseSrcSet } from "../lib/images";

type BlogPostCardVariant = "wide" | "grid" | "major" | "side" | "related" | "search";

interface BlogPostCardProps {
  post: Post;
  variant?: BlogPostCardVariant;
  className?: string;
  titleHtml?: string;
  excerptHtml?: string;
}

function readingTime(p: Post): number {
  const text = (p?.contentHtml || p?.excerpt || "") as string;
  const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200));
}

function formatDate(d?: string, uppercase = false) {
  if (!d) return "";
  try {
    const value = new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return uppercase ? value.toLocaleUpperCase("tr-TR") : value;
  } catch {
    return "";
  }
}

const styles = {
  wide: {
    imageAspect: "aspect-[21/9]",
    imageMb: "mb-6",
    imageDuration: "duration-700",
    fallbackIcon: "menu_book",
    fallbackSize: 48,
    category: "overlay",
    categoryClass: "bg-primary text-on-primary px-3 py-1 font-label-sm uppercase",
    categoryWrapClass: "absolute top-4 left-4 z-10",
    titleTag: "h2",
    titleClass: "font-headline-lg text-headline-lg mb-4",
    excerptClass: "font-body-md text-text-muted line-clamp-2",
    showDate: true,
    uppercaseDate: true,
    showReadingTime: true,
    showExcerpt: true,
  },
  grid: {
    imageAspect: "aspect-square",
    imageMb: "mb-6",
    imageDuration: "duration-500",
    fallbackIcon: "article",
    fallbackSize: 32,
    category: "outline",
    categoryClass: "border border-primary text-primary px-2 py-0.5 font-label-sm uppercase inline-block mb-3",
    titleTag: "h3",
    titleClass: "font-headline-md text-headline-md mb-3",
    excerptClass: "font-body-md text-text-muted text-sm line-clamp-3",
    showDate: true,
    uppercaseDate: true,
    showExcerpt: true,
  },
  major: {
    imageAspect: "aspect-[16/9]",
    imageMb: "mb-6",
    imageDuration: "duration-700",
    fallbackIcon: "menu_book",
    fallbackSize: 48,
    category: "overlay",
    categoryClass: "bg-primary text-on-primary px-4 py-1 font-label-sm text-label-sm uppercase",
    categoryWrapClass: "absolute top-6 left-6 z-10",
    titleTag: "h3",
    titleClass: "font-headline-lg text-[40px] leading-tight mb-4",
    excerptClass: "font-body-md text-text-muted max-w-xl mb-6",
    showExcerpt: true,
    showAuthorDate: true,
  },
  side: {
    imageAspect: "aspect-[4/3]",
    imageMb: "mb-4",
    imageDuration: "duration-500",
    fallbackIcon: "article",
    fallbackSize: 32,
    category: "muted",
    categoryClass: "font-label-sm text-label-sm text-text-muted uppercase mb-2 block tracking-widest",
    titleTag: "h4",
    titleClass: "font-headline-md text-headline-md leading-snug",
  },
  related: {
    imageAspect: "aspect-[4/3]",
    imageMb: "mb-4",
    imageDuration: "duration-500",
    fallbackIcon: "article",
    fallbackSize: 32,
    category: "muted",
    categoryClass: "font-label-sm text-text-muted uppercase mb-2 block tracking-widest",
    titleTag: "h3",
    titleClass: "font-headline-md text-headline-md",
  },
  search: {
    imageAspect: "aspect-[16/10]",
    imageMb: "mb-5",
    imageDuration: "duration-500",
    fallbackIcon: "article",
    fallbackSize: 32,
    category: "outline",
    categoryClass: "border border-primary text-primary px-2 py-0.5 font-label-sm uppercase inline-block mb-3",
    titleTag: "h3",
    titleClass: "font-headline-md text-headline-md mb-2",
    excerptClass: "font-body-md text-text-muted text-sm line-clamp-3",
    showDate: true,
    showExcerpt: true,
  },
} satisfies Record<string, Record<string, unknown>>;

export function BlogPostCard({ post, variant = "grid", className = "", titleHtml, excerptHtml }: BlogPostCardProps) {
  const s = styles[variant] as (typeof styles)[BlogPostCardVariant] & {
    imageAspect: string;
    imageMb: string;
    imageDuration: string;
    fallbackIcon: string;
    fallbackSize: number;
    category?: "overlay" | "outline" | "muted";
    categoryClass?: string;
    categoryWrapClass?: string;
    titleTag: string;
    titleClass: string;
    excerptClass?: string;
    showDate?: boolean;
    uppercaseDate?: boolean;
    showReadingTime?: boolean;
    showExcerpt?: boolean;
    showAuthorDate?: boolean;
  };
  const TitleTag = s.titleTag as ElementType;
  const date = formatDate(post.publishedAt, s.uppercaseDate);
  const imageWidths =
    variant === "major" || variant === "wide"
      ? [420, 720, 960, 1320]
      : [240, 420, 640, 840];
  const imageSrc = pocketBaseThumb(post.coverImage, imageWidths[1]);
  const imageSrcSet = responsivePocketBaseSrcSet(post.coverImage, imageWidths);
  const imageSizes =
    variant === "major"
      ? "(min-width: 768px) 66vw, 100vw"
      : variant === "wide"
        ? "(min-width: 768px) 70vw, 100vw"
        : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";
  const eagerImage = variant === "major" || variant === "wide";

  return (
    <article className={`group ${className}`}>
      <a href={`/blog/${post.slug}`} className="block" aria-label={post.title} title={post.title}>
        <div className={`${s.imageAspect} ${s.imageMb} relative overflow-hidden border border-border-subtle bg-surface-container`}>
          {post.coverImage ? (
            <img
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${s.imageDuration}`}
              src={imageSrc || post.coverImage}
              srcSet={imageSrcSet}
              sizes={imageSrcSet ? imageSizes : undefined}
              alt={post.coverImageAlt || post.title}
              loading={eagerImage ? "eager" : "lazy"}
              fetchPriority={eagerImage ? "high" : "auto"}
              decoding="async"
              width={variant === "major" || variant === "wide" ? 1320 : 640}
              height={variant === "wide" ? 566 : variant === "major" ? 743 : 640}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <Icon name={s.fallbackIcon} size={s.fallbackSize} />
            </div>
          )}
          {post.category && s.category === "overlay" && (
            <div className={s.categoryWrapClass}>
              <span className={s.categoryClass}>{post.category}</span>
            </div>
          )}
        </div>

        {(s.showDate || s.showReadingTime) && (
          <div className="flex items-center gap-4 mb-3">
            {date && <time className="font-label-sm text-text-muted">{date}</time>}
            {date && s.showReadingTime && <span className="h-px w-8 bg-border-subtle" />}
            {s.showReadingTime && <span className="font-label-sm text-primary">{readingTime(post)} DK OKUMA</span>}
          </div>
        )}

        {post.category && s.category !== "overlay" && <span className={s.categoryClass}>{post.category}</span>}

        <TitleTag className={s.titleClass}>
          <span className="title-underline" dangerouslySetInnerHTML={titleHtml ? { __html: titleHtml } : undefined}>
            {titleHtml ? undefined : post.title}
          </span>
        </TitleTag>

        {s.showExcerpt && (excerptHtml || post.excerpt) && (
          <p className={s.excerptClass} dangerouslySetInnerHTML={excerptHtml ? { __html: excerptHtml } : undefined}>
            {excerptHtml ? undefined : post.excerpt}
          </p>
        )}

        {s.showAuthorDate && (
          <div className="flex items-center gap-4 text-text-muted font-label-sm text-label-sm uppercase tracking-wider">
            {post.authorName && <span>{post.authorName}</span>}
            {post.authorName && post.publishedAt && <span className="w-1 h-1 bg-text-muted rounded-full" />}
            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          </div>
        )}
      </a>
    </article>
  );
}
