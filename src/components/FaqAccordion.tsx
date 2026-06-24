import { useState } from "react";
import { addMissingLinkTitles } from "../lib/html";
import { Icon } from "../lib/icons";

interface FaqItem {
  id?: string | number;
  question: string;
  answer: string;
}
interface Props {
  faqs: FaqItem[];
  title?: string;
}

export function FaqAccordion({ faqs, title = "Sıkça Sorulan Sorular" }: Props) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <section className="mb-section-gap" aria-labelledby="faq-title">
      <h2
        id="faq-title"
        className="font-headline-lg text-headline-lg uppercase tracking-tight mb-12 border-b border-black-pure pb-4"
      >
        {title}
      </h2>
      <ul className="flex flex-col">
        {faqs.map((f, i) => (
          <li key={f.id ?? i} className="border-b border-border-subtle last:border-0">
            <button
              type="button"
              className="w-full flex items-center justify-between gap-4 py-6 text-left font-label-md text-label-md uppercase text-on-surface hover:text-primary transition-colors"
              aria-expanded={open === i}
              aria-controls={`faq-answer-${f.id ?? i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{f.question}</span>
              <Icon name={open === i ? "expand_less" : "expand_more"} className="text-text-muted shrink-0" />
            </button>
            <div
              id={`faq-answer-${f.id ?? i}`}
              className="font-body-md text-body-md text-text-muted pb-6 leading-relaxed [&_a]:underline [&_a]:text-primary"
              hidden={open !== i}
              dangerouslySetInnerHTML={{ __html: addMissingLinkTitles(f.answer) }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
