import type { Exam } from "./api";
import type { CountdownRef } from "../data/exam-landing-pages";

export interface ResolvedCountdown {
  title: string;
  targetDate: string;
  countdownLabel: string;
  isEstimated?: boolean;
  exam: Exam;
}

export interface QuickActionCard {
  title: string;
  body: string;
  href: string;
  icon: string;
  external?: boolean;
}

const calculatorSlugByExamSlug: Record<string, string> = {
  kpss: "kpss-lisans",
  ydt: "yds",
};

export function getQuickActionCards(exam: Exam): QuickActionCard[] {
  const calculatorSlug = calculatorSlugByExamSlug[exam.slug] || exam.slug;

  return [
    {
      title: "Sınav Takvimi",
      body: `${exam.name} tarihi ve yaklaşan sınav oturumlarını incele.`,
      href: "/sinavlar",
      icon: "calendar_month",
    },
    {
      title: "Puan Hesaplama",
      body: `${exam.name} netlerinle tahmini puanını hızlıca hesapla.`,
      href: `/puan-hesaplama/${calculatorSlug}`,
      icon: "calculate",
    },
    {
      title: "Sınav Rehberi",
      body: `${exam.name} hazırlığı için rehber yazıları ve çalışma önerilerini oku.`,
      href: "/rehberler",
      icon: "school",
    },
    {
      title: "Çıkmış Sorular",
      body: `${exam.name} çıkmış sorularıyla ilgili içerikleri ara.`,
      href: `/arama?q=${encodeURIComponent(`${exam.name} çıkmış sorular`)}`,
      icon: "quiz",
    },
  ];
}

export function resolveCountdownRef(
  exams: Exam[],
  ref: CountdownRef,
): ResolvedCountdown | null {
  const exam = exams.find((item) => item.slug === ref.examSlug);
  if (!exam) return null;

  const session = ref.sessionSlug
    ? exam.sessions?.find((item) => item.slug === ref.sessionSlug)
    : undefined;

  return {
    title: ref.label || session?.name || exam.name,
    targetDate: session?.targetDate || exam.targetDate,
    countdownLabel: ref.label || session?.countdownLabel || exam.countdownLabel,
    isEstimated: session?.isEstimated ?? exam.isEstimated,
    exam,
  };
}

export function formatExamDate(value: string) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
