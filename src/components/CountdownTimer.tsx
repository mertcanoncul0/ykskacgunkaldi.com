import { useEffect, useId, useState } from "react";
import { getCountdown } from "../lib/countdown";
import { Icon } from "../lib/icons";

interface Props {
  targetDate: string;
  label: string;
  isEstimated?: boolean;
}

export function CountdownTimer({ targetDate, label, isEstimated }: Props) {
  const [remaining, setRemaining] = useState<ReturnType<typeof getCountdown> | null>(null);
  const headingId = useId();

  useEffect(() => {
    setRemaining(getCountdown(targetDate));
    const id = window.setInterval(() => setRemaining(getCountdown(targetDate)), 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  const isPast = remaining?.isPast ?? false;
  const units = [
    { key: "days", value: remaining?.days, label: "GÜN" },
    { key: "hours", value: remaining?.hours, label: "SAAT" },
    { key: "minutes", value: remaining?.minutes, label: "DAKİKA" },
    { key: "seconds", value: remaining?.seconds, label: "SANİYE" },
  ];

  // Saniyede bir değişen rakamları ekran okuyucuya tek tek/sürekli
  // okutmamak için sayaç ızgarası `aria-hidden` ile gizlenir; onun yerine
  // tek, kontrollü bir özet `aria-label` olarak sunulur ve `aria-live="off"`
  // ile otomatik yeniden okuma engellenir.
  const liveSummary = !remaining
    ? `${label}: geri sayım yükleniyor.`
    : remaining.isPast
    ? `${label}: geri sayım tamamlandı.`
    : `${label}: ${remaining.days} gün ${remaining.hours} saat ${remaining.minutes} dakika ${remaining.seconds} saniye kaldı.`;

  return (
    <section className="w-full" aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="font-label-md text-label-md uppercase tracking-widest text-text-muted text-center mb-4"
      >
        {label}
      </h2>
      {isPast ? (
        <div className="w-full max-w-3xl mx-auto bg-surface-container-high border border-black-pure p-8 md:p-12 flex flex-col items-center gap-3 text-center">
          <Icon name="task_alt" size={40} className="text-primary" />
          <span className="font-headline-md text-headline-md text-primary uppercase">Tamamlandı</span>
          <span className="font-body-md text-body-md text-text-muted">Bu sınav oturumu için geri sayım sona erdi.</span>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl mx-auto bg-white-pure border border-black-pure p-8 md:p-12"
          role="timer"
          aria-live="off"
          aria-label={liveSummary}
        >
          {units.map((u, i) => (
            <div
              key={u.key}
              aria-hidden="true"
              className={`flex flex-col items-center py-4${
                i < units.length - 1 ? " border-r border-border-subtle" : ""
              }`}
            >
              <span className="font-display-lg text-[64px] leading-none mb-2 tabular-nums">
                {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-text-muted">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      )}
      {isEstimated && !isPast && (
        <div className="flex items-center justify-center gap-2 mt-4 font-label-sm text-label-sm text-text-muted border border-border-subtle py-2 px-4 max-w-3xl mx-auto">
          <Icon name="info" size={16} />
          Tarih henüz resmi olarak açıklanmamış olup, tahmini bir tarihtir.
        </div>
      )}
    </section>
  );
}
