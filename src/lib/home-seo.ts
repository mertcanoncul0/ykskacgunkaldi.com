import type { Exam, ExamSession } from "./api";

export interface HomeSeoDefaults {
  homepage_seo_title: string;
  homepage_seo_description: string;
}

export interface HomeSeo {
  title: string;
  description: string;
  canonicalPath: string;
  selectionSlug?: string;
}

const HOME_SEO_BY_SLUG: Record<string, Omit<HomeSeo, "canonicalPath" | "selectionSlug">> = {
  yks: {
    title: "YKS Kaç Gün Kaldı? 2027 YKS Canlı Sayaç",
    description:
      "2027 YKS, TYT, AYT ve YDT oturumlarına kalan süreyi canlı sayaçla takip edin; sınav tarihleri, puan hesaplama ve hazırlık rehberlerini inceleyin.",
  },
  tyt: {
    title: "TYT Kaç Gün Kaldı? 2027 TYT Canlı Sayaç",
    description:
      "2027 TYT sınavına kaç gün kaldığını canlı sayaçla takip edin; TYT tarihi, puan hesaplama aracı ve hazırlık rehberleriyle planınızı güncelleyin.",
  },
  ayt: {
    title: "AYT Kaç Gün Kaldı? 2027 AYT Canlı Sayaç",
    description:
      "2027 AYT sınavına kaç gün kaldığını canlı sayaçla takip edin; AYT tarihi, puan hesaplama aracı ve hazırlık rehberleriyle çalışmanızı planlayın.",
  },
  lgs: {
    title: "LGS Kaç Gün Kaldı? 2027 LGS Canlı Sayaç",
    description:
      "2027 LGS sınavına kaç gün kaldığını canlı sayaçla takip edin; LGS tarihi, puan hesaplama aracı ve hazırlık rehberleriyle hazırlığınızı planlayın.",
  },
  "kpss-lisans": {
    title: "KPSS Kaç Gün Kaldı? 2026 KPSS Lisans Canlı Sayaç",
    description:
      "2026 KPSS Lisans sınavına kaç gün kaldığını canlı sayaçla takip edin; oturum tarihleri, puan hesaplama ve hazırlık rehberleriyle plan yapın.",
  },
};

function getYear(value?: string) {
  return value?.match(/\b20\d{2}\b/)?.[0];
}

function getExamYear(exam?: Exam) {
  return getYear(exam?.h1) || getYear(exam?.countdownLabel) || getYear(exam?.targetDate);
}

function getSessionYear(session?: ExamSession, exam?: Exam) {
  return getYear(session?.countdownLabel) || getYear(session?.targetDate) || getExamYear(exam);
}

function withYear(label: string, year?: string) {
  return year ? `${year} ${label}` : label;
}

function getSeoLabel(exam?: Exam, session?: ExamSession) {
  if (!session) return exam?.name;
  if (["tyt", "ayt", "ydt"].includes(session.slug)) return session.name;
  if (exam?.slug.startsWith("kpss")) return `KPSS ${session.name}`;
  return `${exam?.name || ""} ${session.name}`.trim();
}

function buildSeoDescription(yearLabel: string) {
  const templates = [
    `${yearLabel} sınavına kalan süreyi canlı sayaçla takip edin; sınav tarihi, geri sayım, puan hesaplama ve hazırlık rehberleriyle planınızı güncelleyin.`,
    `${yearLabel} sınavına kalan süreyi canlı sayaçla takip edin; sınav tarihi, puan hesaplama ve rehberlerle çalışma planınızı güncelleyin.`,
    `${yearLabel} sınavına kalan süreyi canlı sayaçla takip edin; sınav tarihi, puan hesaplama ve rehberlerle planınızı güncelleyin.`,
  ];

  return templates.find((description) => description.length <= 155) || templates.at(-1)!;
}

function getAllSelectionSlugs(exams: Exam[]) {
  const slugs = new Set<string>();
  for (const exam of exams) {
    slugs.add(exam.slug);
    for (const session of exam.sessions || []) {
      slugs.add(session.slug);
    }
  }
  return [...slugs];
}

export function resolveHomeSelection(exams: Exam[], requestedSlug?: string | null) {
  if (!requestedSlug) return null;

  const normalizedSlug = requestedSlug === "kpss" ? "kpss-lisans" : requestedSlug;
  const exam = exams.find((e) => e.slug === normalizedSlug);
  if (exam) {
    return { selectionSlug: exam.slug, examSlug: exam.slug, sessionSlug: null };
  }

  const sessionOwner = exams.find((e) =>
    e.sessions?.some((session) => session.slug === normalizedSlug),
  );
  const session = sessionOwner?.sessions?.find((s) => s.slug === normalizedSlug);
  if (sessionOwner && session) {
    return {
      selectionSlug: session.slug,
      examSlug: sessionOwner.slug,
      sessionSlug: session.slug,
    };
  }

  return null;
}

export function getHomeSeo(
  defaults: HomeSeoDefaults,
  exams: Exam[],
  requestedSlug?: string | null,
): HomeSeo {
  const selection = resolveHomeSelection(exams, requestedSlug);
  if (!selection) {
    return {
      title: defaults.homepage_seo_title,
      description: defaults.homepage_seo_description,
      canonicalPath: "/",
    };
  }

  const exactSeo = HOME_SEO_BY_SLUG[selection.selectionSlug];
  if (exactSeo) {
    return {
      ...exactSeo,
      canonicalPath: `/?sinav=${encodeURIComponent(selection.selectionSlug)}`,
      selectionSlug: selection.selectionSlug,
    };
  }

  const exam = exams.find((e) => e.slug === selection.examSlug);
  const session = exam?.sessions?.find((s) => s.slug === selection.sessionSlug);
  const label = getSeoLabel(exam, session) || selection.selectionSlug;
  const year = session ? getSessionYear(session, exam) : getExamYear(exam);
  const yearLabel = withYear(label, year);
  const title = `${label} Kaç Gün Kaldı? ${yearLabel} Canlı Sayaç`;
  const description = buildSeoDescription(yearLabel);

  return {
    title,
    description,
    canonicalPath: `/?sinav=${encodeURIComponent(selection.selectionSlug)}`,
    selectionSlug: selection.selectionSlug,
  };
}

export function getHomeSeoSitemapPaths(exams: Exam[]) {
  return getAllSelectionSlugs(exams).map((slug) => `/?sinav=${encodeURIComponent(slug)}`);
}
