import type { Exam } from "../lib/api";
import { Icon } from "../lib/icons";

const features = [
  {
    icon: "timer",
    title: "Canlı Sayaç",
    body: "Saniye saniye güncellenen geri sayım.",
  },
  {
    icon: "article",
    title: "Rehberlik & Blog",
    body: "Sınavlara hazırlık tüyoları ve makaleler.",
  },

  {
    icon: "calculate",
    title: "Puan Hesaplama",
    body: "TYT, AYT, DGS, LGS, ALES, OBP hepsi tek yerde.",
  },
];

export function FeatureGrid({ exam }: { exam: Exam }) {
  return (
    <section className="mb-section-gap" aria-labelledby="features-title">
      <h2 id="features-title" className="font-headline-lg text-headline-lg uppercase tracking-tight mb-2">
        {exam.featureTitle}
      </h2>
      <p className="font-body-md text-body-md text-text-muted mb-12 max-w-2xl">{exam.featureDescription}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {features.map((f) => (
          <article key={f.title} className="border border-border-subtle bg-white-pure p-8">
            <Icon name={f.icon} size={32} className="text-text-muted mb-6 block" />
            <h3 className="font-headline-md text-headline-md text-primary mb-3">{f.title}</h3>
            <p className="font-body-md text-body-md text-text-muted">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
