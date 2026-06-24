import { useMemo, useState } from "react";
import { CALC_YEARS, estimateRank, fmtInt, type CalcYear } from "../lib/calc-engine";
import { Icon } from "../lib/icons";

const examKinds = [
  { value: "yks", label: "YKS" },
  { value: "tyt", label: "TYT" },
  { value: "ayt", label: "AYT" },
  { value: "lgs", label: "LGS" },
  { value: "dgs", label: "DGS" },
  { value: "ales", label: "ALES" },
  { value: "kpss-lisans", label: "KPSS Lisans" },
] as const;

export function RankEstimatorClient() {
  const [score, setScore] = useState("400");
  const [kind, setKind] = useState<(typeof examKinds)[number]["value"]>("yks");
  const [year, setYear] = useState<CalcYear>(2026);

  const result = useMemo(() => {
    const scoreNum = Math.max(0, Number(score) || 0);
    const estimate = estimateRank(scoreNum, kind, year);
    const low = Math.max(1, Math.round(estimate.rank * 0.88));
    const high = Math.max(low, Math.round(estimate.rank * 1.12));
    return { ...estimate, low, high };
  }, [kind, score, year]);

  return (
    <section className="border border-border-subtle bg-white-pure p-8" aria-labelledby="rank-title">
      <h2 id="rank-title" className="flex items-center gap-2 font-headline-md text-headline-md text-primary mb-8">
        <Icon name="trending_up" />
        Sıralama Aralığı
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Tahmini puan
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={score}
            onChange={(event) => setScore(event.target.value)}
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
          />
        </label>
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Sınav
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as typeof kind)}
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
          >
            {examKinds.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Yıl modeli
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value) as CalcYear)}
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
          >
            {CALC_YEARS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="bg-black-pure text-white-pure p-8 mb-6">
        <div className="font-label-sm text-label-sm uppercase text-white-pure/70 mb-2">Yaklaşık başarı sıralaması</div>
        <div className="font-display-lg text-[42px] leading-none mb-3">
          {fmtInt(result.low)} - {fmtInt(result.high)}
        </div>
        <p className="font-body-md text-body-md text-white-pure/75">
          Tek sayı yerine aralık gösterilir; resmi sonuç aday dağılımı ve standartlaştırmaya göre değişir.
        </p>
      </div>

      <div className="border border-border-subtle bg-surface p-6">
        <div className="flex items-start gap-3">
          <Icon name="warning" className="text-primary shrink-0 mt-1" />
          <p className="font-body-md text-body-md text-text-muted leading-relaxed">
            Bu tahmin resmi sonuç değildir. Tercih listesi hazırlarken ÖSYM sonuç belgesi,
            güncel kılavuz, kontenjan ve önceki yılların başarı sıralamaları birlikte değerlendirilmelidir.
          </p>
        </div>
      </div>
    </section>
  );
}
