import { useEffect, useState } from "react";
import { getCountdown } from "../lib/countdown";

interface Props {
  targetDate: string;
  label: string;
  isEstimated?: boolean;
}

export function CountdownTimer({ targetDate, label, isEstimated }: Props) {
  const [remaining, setRemaining] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    setRemaining(getCountdown(targetDate));
    const id = window.setInterval(() => setRemaining(getCountdown(targetDate)), 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  const units = [
    { key: "days", value: remaining.days, label: "GÜN" },
    { key: "hours", value: remaining.hours, label: "SAAT" },
    { key: "minutes", value: remaining.minutes, label: "DAKİKA" },
    { key: "seconds", value: remaining.seconds, label: "SANİYE" },
  ];

  return (
    <section className="w-full" aria-label={label} role="timer" aria-live="off">
      <p className="font-label-md text-label-md uppercase tracking-widest text-text-muted text-center mb-4">
        {label}
      </p>
      {remaining.isPast ? (
        <div className="w-full max-w-3xl mx-auto bg-surface-container-high border border-black-pure p-8 md:p-12 flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-[40px] text-primary" aria-hidden="true">
            task_alt
          </span>
          <span className="font-headline-md text-headline-md text-primary uppercase">Tamamlandı</span>
          <span className="font-body-md text-body-md text-text-muted">Bu sınav oturumu için geri sayım sona erdi.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl mx-auto bg-white-pure border border-black-pure p-8 md:p-12">
          {units.map((u, i) => (
            <div
              key={u.key}
              className={`flex flex-col items-center py-4${
                i < units.length - 1 ? " border-r border-border-subtle" : ""
              }`}
            >
              <span className="font-display-lg text-[64px] leading-none mb-2 tabular-nums">
                {String(u.value).padStart(2, "0")}
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-text-muted">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      )}
      {isEstimated && !remaining.isPast && (
        <div className="flex items-center justify-center gap-2 mt-4 font-label-sm text-label-sm text-text-muted border border-border-subtle py-2 px-4 max-w-3xl mx-auto">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            info
          </span>
          Tarih henüz resmi olarak açıklanmamış olup, tahmini bir tarihtir.
        </div>
      )}
    </section>
  );
}
