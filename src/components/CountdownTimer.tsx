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
  const [dayUnit, ...timeUnits] = units;

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
      <div className="w-full max-w-5xl mx-auto overflow-hidden border-2 border-black-pure bg-white-pure">
        <div className="grid min-h-[72px] grid-cols-1 border-b-2 border-black-pure bg-black-pure text-on-primary md:grid-cols-[1fr_auto]">
          <h2
            id={headingId}
            className="flex items-center gap-3 px-5 py-4 font-label-md text-label-md uppercase md:px-7"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center border border-white-pure/50">
              <Icon name="timer" size={18} />
            </span>
            {label}
          </h2>
          {isEstimated && !isPast && (
            <span className="flex items-center gap-2 border-t border-white-pure/25 px-5 py-3 font-label-sm text-label-sm uppercase md:border-l md:border-t-0 md:px-6">
              <Icon name="info" size={15} />
              Tahmini tarih
            </span>
          )}
        </div>

        {isPast ? (
          <div className="p-8 md:p-12 flex flex-col items-center gap-3 text-center bg-white-pure">
            <Icon name="task_alt" size={40} className="text-primary" />
            <span className="font-headline-md text-headline-md text-primary uppercase">Tamamlandı</span>
            <span className="font-body-md text-body-md text-text-muted">Bu sınav oturumu için geri sayım sona erdi.</span>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 bg-white-pure md:grid-cols-[1.2fr_1fr]"
            role="timer"
            aria-live="off"
            aria-label={liveSummary}
          >
            <div
              aria-hidden="true"
              className="flex min-h-60 flex-col justify-between bg-black-pure p-6 text-on-primary sm:p-8 md:min-h-72 md:p-10"
            >
              <span className="font-label-sm text-label-sm uppercase text-white-pure/70">Ana sayaç</span>
              <div>
                <span className="block font-display-lg text-[76px] leading-none tracking-normal sm:text-[92px] md:text-[112px] tabular-nums">
                  {dayUnit.value === undefined ? "--" : String(dayUnit.value).padStart(2, "0")}
                </span>
                <span className="mt-3 block font-headline-md text-headline-md uppercase tracking-normal">Gün kaldı</span>
              </div>
            </div>

            <div className="grid grid-cols-3 border-t-2 border-black-pure md:border-l-2 md:border-t-0">
              {timeUnits.map((u) => (
                <div
                  key={u.key}
                  aria-hidden="true"
                  className="flex min-h-36 flex-col items-center justify-center border-r border-border-subtle bg-surface-container-low px-3 py-7 text-center last:border-r-0 md:min-h-72 md:px-4 md:py-10"
                >
                  <span className="font-display-lg text-[44px] leading-none tracking-normal tabular-nums sm:text-[56px] md:text-[66px]">
                    {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
                  </span>
                  <span className="mt-4 font-label-sm text-label-sm uppercase text-text-muted">
                    {u.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isEstimated && !isPast && (
          <div className="flex items-start gap-3 border-t-2 border-black-pure bg-white-pure px-5 py-4 font-label-sm text-label-sm text-text-muted md:px-7">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" />
            <span>Tarih henüz resmi olarak açıklanmamış olup, tahmini bir tarihtir.</span>
          </div>
        )}
      </div>
    </section>
  );
}
