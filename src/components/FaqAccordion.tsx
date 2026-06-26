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
  idPrefix?: string;
}

export function FaqAccordion({
  faqs,
  title = "Sıkça Sorulan Sorular",
  idPrefix = "faq",
}: Props) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <section className="mb-section-gap" aria-labelledby={`${idPrefix}-title`}>
      <h2
        id={`${idPrefix}-title`}
        className="font-headline-lg text-headline-lg uppercase tracking-tight mb-12 border-b border-black-pure pb-4"
      >
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          const answerId = `${idPrefix}-answer-${f.id ?? i}`;
          return (
            <li
              key={f.id ?? i}
              className={`border transition-colors duration-200 ${
                isOpen
                  ? "border-black-pure bg-surface-container-low"
                  : "border-border-subtle bg-white-pure hover:border-black-pure"
              }`}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left font-label-md text-label-md uppercase text-on-surface hover:text-primary transition-colors"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 border border-black-pure transition-colors duration-200 ${isOpen ? "bg-black-pure" : "bg-transparent"}`}
                  />
                  <span>{f.question}</span>
                </span>
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center border transition-colors duration-200 ${isOpen ? "border-black-pure bg-black-pure text-white-pure" : "border-border-subtle text-text-muted"}`}
                >
                  <Icon
                    name="expand_more"
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>
              <div
                id={answerId}
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
                aria-hidden={!isOpen}
              >
                <div className="overflow-hidden px-5 font-body-md text-body-md text-text-muted leading-relaxed [&_a]:underline [&_a]:text-primary">
                  <div
                    className="border-t border-border-subtle pb-5 pt-4"
                    dangerouslySetInnerHTML={{ __html: addMissingLinkTitles(f.answer) }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
