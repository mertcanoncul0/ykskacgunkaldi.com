import { useEffect, useState } from "react";
import { getDaysLeft } from "../lib/countdown";
import { Icon } from "../lib/icons";

interface Props {
  targetDate: string;
  label: string;
  href?: string;
  isEstimated?: boolean;
}

export function CalcExamCountdown({ targetDate, label, href, isEstimated }: Props) {
  const [days, setDays] = useState<number | null>(() => getDaysLeft(targetDate));

  useEffect(() => {
    setDays(getDaysLeft(targetDate));
    const id = window.setInterval(() => setDays(getDaysLeft(targetDate)), 60_000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  const content = (
    <>
      <div className="flex items-center justify-center gap-2 font-label-sm text-label-sm uppercase text-text-muted mb-3">
        <Icon name="schedule" size={18} />
        <span>{label}</span>
      </div>
      <div className="flex flex-col items-center">
        <strong className="font-display-lg text-display-lg text-primary leading-none">{days ?? "—"}</strong>
        <span className="font-label-sm text-label-sm text-text-muted mt-1">gün kaldı</span>
      </div>
      {isEstimated && (
        <div className="mt-3 font-label-sm text-[11px] text-text-muted text-center italic leading-tight">
          * Tahmini tarihtir.
        </div>
      )}
    </>
  );

  const wrapperClass = "block border border-border-subtle bg-white-pure p-6 text-center hover:border-black-pure transition-colors";

  if (href) {
    return (
      <a className={wrapperClass} href={href}>
        {content}
      </a>
    );
  }
  return <div className={wrapperClass}>{content}</div>;
}
