import type { Exam } from "../lib/api";
import { addMissingLinkTitles } from "../lib/html";
import { Icon } from "../lib/icons";

export function SeoGuideSection({ exam }: { exam: Exam }) {
  if (!exam.guideParagraphs?.length) return null;
  return (
    <section className="mb-section-gap" aria-labelledby="seo-guide-title">
      <h2
        id="seo-guide-title"
        className="font-headline-lg text-headline-lg uppercase tracking-tight mb-12 border-b border-black-pure pb-4"
      >
        {exam.guideTitle}
      </h2>
      <div className="flex flex-col">
        {exam.guideParagraphs.map((g, i) => (
          <details key={i} className="group border-b border-border-subtle py-6 last:border-0" open={i === 0}>
            <summary className="flex items-center justify-between gap-4 cursor-pointer font-label-md text-label-md uppercase text-on-surface list-none [&::-webkit-details-marker]:hidden">
              {g.heading?.trim() || `${exam.name} Hazırlık Notu ${i + 1}`}
              <Icon name="expand_more" className="text-text-muted shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p
              className="font-body-md text-body-md text-text-muted mt-4 leading-relaxed [&_a]:underline [&_a]:text-primary"
              dangerouslySetInnerHTML={{ __html: addMissingLinkTitles(g.body) }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}
