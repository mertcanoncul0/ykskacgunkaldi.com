import type { Exam } from "../lib/api";
import { Icon } from "../lib/icons";

// Not: Eski sürümdeki "Günün Sözü" (Robert Collier'e atfedilen alıntı) ve
// "Günün Tavsiyesi" (statik Pomodoro ipucu) kartları PocketBase'de hiçbir
// veriye dayanmıyordu — sabit kodlanmış, hiç değişmeyen uydurma içerikti.
// Bu yüzden kaldırıldı; sadece gerçek exam verisine dayanan "Sıradaki Sınav"
// kartı kalıyor.
export function InfoCards({ exam }: { exam: Exam }) {
  const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  });
  const dateStr = exam.targetDate
    ? dateFormatter.format(new Date(exam.targetDate))
    : "Tarih bekleniyor";

  return (
    <section className="mb-section-gap" aria-label="Sınav bilgileri">
      <div className="border border-border-subtle bg-white-pure p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
        <div className="flex items-center gap-4 md:flex-1">
          <Icon name="event_upcoming" size={32} className="text-text-muted shrink-0" />
          <div>
            <span className="font-label-sm text-label-sm uppercase text-text-muted block mb-1">Sıradaki Sınav</span>
            <h3 className="font-headline-md text-headline-md text-primary">{exam.name}</h3>
          </div>
        </div>
        <div className="md:flex-1">
          <p className="font-headline-md text-headline-md text-primary mb-1">{dateStr}</p>
          <p className="font-body-md text-body-md text-text-muted">
            {exam.nextExamDescription || "Sınav oturumları için geri sayım."}
          </p>
        </div>
        <a
          href={`/?sinav=${exam.slug}`}
          className="inline-flex items-center gap-2 font-label-md text-label-md uppercase text-primary hover:text-text-muted transition-colors shrink-0"
        >
          <span>{exam.name} Detaylarını Gör</span>
          <Icon name="arrow_forward" size={18} />
        </a>
      </div>
    </section>
  );
}
