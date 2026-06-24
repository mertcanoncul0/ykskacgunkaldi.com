import type { CountdownRef } from "./exam-landing-pages";

export interface EmbedCountdownConfig {
  slug: string;
  title: string;
  attributionLabel: string;
  countdown: CountdownRef;
  canonicalLanding: string;
}

export const embedCountdowns: EmbedCountdownConfig[] = [
  {
    slug: "yks-2027",
    title: "YKS 2027",
    attributionLabel: "YKS sayacı",
    countdown: { examSlug: "yks", label: "YKS 2027" },
    canonicalLanding: "/yks-kac-gun-kaldi",
  },
  {
    slug: "tyt-2027",
    title: "TYT 2027",
    attributionLabel: "TYT sayacı",
    countdown: { examSlug: "yks", sessionSlug: "tyt", label: "TYT 2027" },
    canonicalLanding: "/tyt-kac-gun-kaldi",
  },
  {
    slug: "ayt-2027",
    title: "AYT 2027",
    attributionLabel: "AYT sayacı",
    countdown: { examSlug: "yks", sessionSlug: "ayt", label: "AYT 2027" },
    canonicalLanding: "/ayt-kac-gun-kaldi",
  },
];

const embedBySlug = new Map(embedCountdowns.map((item) => [item.slug, item]));

export function getEmbedCountdown(slug: string | undefined) {
  return slug ? embedBySlug.get(slug) : undefined;
}
