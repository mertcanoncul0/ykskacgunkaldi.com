import type { Exam } from "../lib/api";
import { FaqAccordion } from "./FaqAccordion";

export function SeoGuideSection({ exam }: { exam: Exam }) {
  if (!exam.guideParagraphs?.length) return null;

  const guideFaqs = exam.guideParagraphs.map((g, i) => ({
    id: `guide-${exam.slug}-${i}`,
    question: g.heading?.trim() || `${exam.name} Hazırlık Notu ${i + 1}`,
    answer: g.body,
  }));

  return (
    <FaqAccordion
      faqs={guideFaqs}
      title={exam.guideTitle || `${exam.name} Bilinmesi Gerekenler`}
      idPrefix={`seo-guide-${exam.slug}`}
    />
  );
}
