import type { Exam } from "./api";
import type { CountdownRef } from "../data/exam-landing-pages";

export interface ResolvedCountdown {
  title: string;
  targetDate: string;
  countdownLabel: string;
  isEstimated?: boolean;
  exam: Exam;
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
