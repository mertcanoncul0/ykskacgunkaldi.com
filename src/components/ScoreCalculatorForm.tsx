import { useEffect, useMemo, useState } from "react";
import type { ScoreCalculatorConfig } from "../data/score-calculators";
import {
  CALC_YEARS,
  type CalcSnapshot,
  type CalcYear,
  computeAll,
  estimateRank,
  fmt,
  fmtInt,
  isSnapshotEmpty,
} from "../lib/calc-engine";
import { CalcHistory } from "./CalcHistory";
import { Icon } from "../lib/icons";

const TARGET_PLACEHOLDERS: Record<string, string> = {
  yks: "450",
  tyt: "350",
  ayt: "450",
  lgs: "450",
  dgs: "310",
  ales: "85",
  "kpss-lisans": "85",
  "kpss-onlisans": "85",
  "kpss-ortaogretim": "85",
  yds: "85",
  msu: "450",
  obp: "450",
};

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.select();
};

const handleEnterAdvance = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const form = e.currentTarget.closest("[data-calc-root]");
  if (!form) return;
  const inputs = Array.from(
    form.querySelectorAll<HTMLInputElement>("input[type='number']"),
  );
  const idx = inputs.indexOf(e.currentTarget);
  const next = inputs[idx + 1];
  if (next) {
    next.focus();
    next.select();
  }
};

export function ScoreCalculatorForm({
  config,
}: {
  config: ScoreCalculatorConfig;
}) {
  const [state, setState] = useState<
    Record<string, { correct: string; wrong: string }>
  >({});
  const [diploma, setDiploma] = useState<string>("");
  const [previous, setPrevious] = useState<boolean>(false);
  const [year, setYear] = useState<CalcYear>(2026);
  const [target, setTarget] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 180);
    return () => window.clearTimeout(id);
  }, []);

  const snapshot: CalcSnapshot = useMemo(
    () => ({ state, diploma, previous }),
    [state, diploma, previous],
  );

  const update = (id: string, key: "correct" | "wrong", value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    setState((s) => {
      const prev = s[id] ?? { correct: "", wrong: "" };
      return { ...s, [id]: { ...prev, [key]: cleaned } };
    });
  };

  const reset = () => {
    setState({});
    setDiploma("");
    setPrevious(false);
    setTarget("");
  };

  const overflows = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const g of config.groups) {
      for (const f of g.fields) {
        const row = state[f.id];
        if (!row) continue;
        const c = Number(row.correct) || 0;
        const w = Number(row.wrong) || 0;
        if (c + w > f.max) map[f.id] = true;
      }
    }
    return map;
  }, [state, config]);

  const empty = isSnapshotEmpty(snapshot);
  const hasAnyInput = !empty;
  const computed = useMemo(
    () => computeAll(config, snapshot),
    [config, snapshot],
  );
  const { nets, results, obp, obpKatki, obpDgs, obpDgsKatki } = computed;

  const primaryResult = results.find((r) => r.rankable) ?? results[0];
  const targetNum = Number(target) || 0;
  const targetReached =
    targetNum > 0 && primaryResult && hasAnyInput
      ? primaryResult.value >= targetNum
      : null;
  const targetDelta =
    targetNum > 0 && primaryResult && hasAnyInput
      ? primaryResult.value - targetNum
      : null;

  const chartData = config.groups
    .flatMap((g) => g.fields)
    .map((f) => ({
      label: f.label,
      net: nets[f.id] || 0,
      max: f.max,
      ratio: Math.min(1, (nets[f.id] || 0) / f.max),
    }))
    .filter((d) => d.net > 0);

  const shareLines: string[] = [
    `${config.title} (${year})`,
    ...results.map((r) => `${r.label}: ${fmt(r.value)}`),
  ];
  if (obp != null && diploma.trim()) shareLines.push(`OBP: ${fmt(obp)}`);
  if (obpDgs != null && diploma.trim()) shareLines.push(`ÖBP: ${fmt(obpDgs)}`);
  const shareText = shareLines.join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  const handlePrint = () => window.print();
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;

  const loadSnapshot = (snap: CalcSnapshot, yr: CalcYear) => {
    setState(snap.state ?? {});
    setDiploma(snap.diploma ?? "");
    setPrevious(Boolean(snap.previous));
    setYear(yr);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted) {
    return <CalcSkeleton groups={config.groups.length} />;
  }

  return (
    <div className="flex flex-col gap-8" data-calc-root>
      <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-border-subtle" role="group" aria-label="Sınav yılı seçimi">
        <span className="flex items-center gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          <Icon name="event" size={18} />
          Sınav Yılı
        </span>
        <div className="flex gap-2">
          {CALC_YEARS.map((y) => (
            <button
              key={y}
              type="button"
              className={`px-4 py-2 font-label-sm text-label-sm border transition-colors ${y === year ? "bg-black-pure text-white-pure border-black-pure" : "border-border-subtle text-text-muted hover:border-black-pure hover:text-black-pure"}`}
              onClick={() => setYear(y)}
              aria-pressed={y === year}
            >
              {y}
            </button>
          ))}
        </div>
        <span className="font-label-sm text-label-sm text-text-muted italic ml-auto hidden md:inline">
          Yüzdelik dilim ve sıralama tahmini seçilen yıla göre değişir.
        </span>
      </div>

      <div className="border border-border-subtle bg-surface-container-low p-4 mb-6 flex items-start gap-3">
        <Icon name="info" size={18} className="text-text-muted mt-0.5 shrink-0" />
        <p className="font-body-md text-sm text-text-muted">
          <strong className="text-on-surface">Net = Doğru − Yanlış / {config.kind === "lgs" ? "3" : "4"}</strong>
          {config.kind === "lgs"
            ? " (LGS'de 3 yanlış 1 doğruyu götürür)."
            : config.kind === "yds"
              ? " — YDS'de yanlışlar doğru sayısını etkilemez."
              : " (4 yanlış 1 doğruyu götürür)."}{" "}
          Ham puanlar ÖSYM'nin o yılki ortalama ve standart sapmasına bağlı olduğu için burada gösterilenler <strong className="text-on-surface">tahminîdir</strong>; resmî sonuç için{" "}
          <a href="https://www.osym.gov.tr" target="_blank" rel="noopener noreferrer nofollow" className="underline hover:text-primary">ÖSYM</a>{" "}
          sonuç belgesini esas al.
        </p>
      </div>

      {config.groups.map((g) => (
        <div key={g.title} className="relative border border-border-subtle bg-white-pure p-8 pl-10 overflow-hidden">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-black-pure" aria-hidden="true" />
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h2 className="flex items-center gap-2 font-headline-md text-headline-md text-primary">
              <Icon name={g.icon} size={20} className="text-text-muted" />
              {g.title}
            </h2>
            <span className="font-label-sm text-label-sm uppercase border border-border-subtle px-2 py-1 text-text-muted">{g.badge}</span>
          </div>
          <div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 pb-3 border-b-2 border-primary font-label-sm text-label-sm uppercase text-text-muted">
              <div>Test</div>
              <div className="text-center">Doğru</div>
              <div className="text-center">Yanlış</div>
              <div className="text-center">Net</div>
            </div>
            {g.fields.map((f) => {
              const isOverflow = overflows[f.id];
              return (
                <div
                  className={`grid grid-cols-4 gap-2 sm:gap-4 items-center py-3 border-b border-border-subtle last:border-0 ${isOverflow ? "bg-error/5" : ""}`}
                  key={f.id}
                >
                  <div className="font-body-md text-body-md text-on-surface">
                    {f.label}
                    <span className="font-label-sm text-label-sm text-text-muted ml-1">/ {f.max}</span>
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={f.max}
                    value={state[f.id]?.correct ?? ""}
                    onChange={(e) => update(f.id, "correct", e.target.value)}
                    onFocus={selectOnFocus}
                    onKeyDown={handleEnterAdvance}
                    placeholder="0"
                    aria-label={`${f.label} doğru sayısı (en fazla ${f.max})`}
                    aria-invalid={isOverflow || undefined}
                    className="w-full border border-border-subtle bg-white-pure px-2 py-2 text-center font-body-md text-body-md focus:border-black-pure outline-none transition-colors aria-invalid:border-error"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={f.max}
                    value={state[f.id]?.wrong ?? ""}
                    onChange={(e) => update(f.id, "wrong", e.target.value)}
                    onFocus={selectOnFocus}
                    onKeyDown={handleEnterAdvance}
                    placeholder="0"
                    aria-label={`${f.label} yanlış sayısı (en fazla ${f.max})`}
                    aria-invalid={isOverflow || undefined}
                    className="w-full border border-border-subtle bg-white-pure px-2 py-2 text-center font-body-md text-body-md focus:border-black-pure outline-none transition-colors aria-invalid:border-error"
                  />
                  <div
                    className="font-body-md text-body-md font-semibold text-primary text-center"
                    aria-label={`${f.label} net: ${fmt(nets[f.id] || 0)}`}
                  >
                    {fmt(nets[f.id] || 0)}
                  </div>
                  {isOverflow ? (
                    <div className="col-span-4 flex items-center gap-1 font-label-sm text-label-sm text-error mt-1" role="alert">
                      <Icon name="warning" size={16} />
                      Doğru + yanlış toplamı {f.max} soruyu aşıyor.
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {config.diploma ? (
        <div className="border border-border-subtle bg-white-pure p-8">
          <div className="mb-6">
            <h2 className="font-headline-md text-headline-md text-primary">{config.diploma.label}</h2>
          </div>
          <div className="grid gap-3">
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              placeholder="Örn: 85.50"
              value={diploma}
              onChange={(e) =>
                setDiploma(e.target.value.replace(/[^0-9.]/g, ""))
              }
              onFocus={selectOnFocus}
              aria-label={config.diploma.label}
              className="w-full border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md focus:border-black-pure outline-none transition-colors"
            />
            <label className="flex items-center gap-2 font-body-md text-[14px] text-text-muted">
              <input
                type="checkbox"
                checked={previous}
                onChange={(e) => setPrevious(e.target.checked)}
                className="accent-black-pure"
              />
              {config.diploma.previousPlacementLabel}
            </label>
            <p className="font-label-sm text-[13px] text-text-muted m-0">
              {config.diploma.help}
            </p>
          </div>
        </div>
      ) : null}

      <div className="bg-black-pure text-white-pure p-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h2 className="flex items-center gap-2 font-headline-md text-headline-md text-white-pure">
            <Icon name="flag" size={20} />
            Hedef Puan
          </h2>
          {targetReached !== null ? (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 font-label-sm text-label-sm uppercase ${targetReached ? "bg-white-pure text-black-pure" : "border border-white-pure/40 text-white-pure"}`}
              role="status"
            >
              <Icon name={targetReached ? "check_circle" : "schedule"} size={16} />
              {targetReached
                ? `Hedefe ulaştın (+${fmt(Math.abs(targetDelta || 0))})`
                : `${fmt(Math.abs(targetDelta || 0))} puan kaldı`}
            </span>
          ) : null}
        </div>
        <div className="grid gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={`Örn: ${TARGET_PLACEHOLDERS[config.kind] ?? "450"}`}
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ""))}
            onFocus={selectOnFocus}
            aria-label="Hedef puan"
            className="w-full border border-white-pure/30 bg-transparent text-white-pure placeholder-white-pure/40 px-4 py-3 font-body-md text-body-md focus:border-white-pure outline-none transition-colors"
          />
          <p className="font-label-sm text-[13px] text-white-pure/60 m-0">
            {primaryResult
              ? `Karşılaştırma: ${primaryResult.label}`
              : "Hedefini gir, hesaplanan puanla karşılaştıralım."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 border border-border-subtle px-6 py-3 font-label-md text-label-md uppercase text-on-surface hover:border-black-pure transition-colors"
          onClick={reset}
        >
          <Icon name="refresh" size={18} />
          Sıfırla
        </button>
        <a href="#calc-results" className="inline-flex items-center gap-2 bg-black-pure text-white-pure px-6 py-3 font-label-md text-label-md uppercase hover:bg-primary-container transition-colors">
          <Icon name="bar_chart" size={18} />
          Hesapla
        </a>
      </div>

      <div className="border-t-2 border-primary pt-8" id="calc-results">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <h2 className="font-headline-lg text-headline-lg text-primary">{config.resultTitle}</h2>
          <span className="font-label-sm text-label-sm uppercase text-text-muted">{year} katsayıları</span>
        </div>
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
          aria-live="polite"
          aria-atomic="false"
        >
          {results.map((r) => {
            const rankInfo =
              r.rankable && hasAnyInput
                ? estimateRank(r.value, config.kind, year)
                : null;
            return (
              <div key={r.label} className="border border-border-subtle bg-surface p-4">
                <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">{r.label}</div>
                <div className="font-headline-lg text-headline-lg text-primary">
                  {hasAnyInput ? fmt(r.value) : "—"}
                </div>
                {rankInfo ? (
                  <div className="flex items-center gap-2 font-label-sm text-label-sm text-text-muted mt-2 flex-wrap">
                    <span>
                      %{rankInfo.percentile.toFixed(2)} dilim
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>~{fmtInt(rankInfo.rank)}. sıra</span>
                  </div>
                ) : null}
                {r.hint ? (
                  <div className="font-label-sm text-label-sm text-text-muted mt-2 italic">{r.hint}</div>
                ) : null}
              </div>
            );
          })}
          {obp != null ? (
            <>
              <div className="border border-border-subtle bg-surface p-4">
                <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">OBP</div>
                <div className="font-headline-lg text-headline-lg text-primary">
                  {diploma.trim() ? fmt(obp) : "—"}
                </div>
              </div>
              <div className="border border-border-subtle bg-surface p-4">
                <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">
                  Yerleştirme Katkısı{previous ? " (kırık)" : ""}
                </div>
                <div className="font-headline-lg text-headline-lg text-primary">
                  {diploma.trim() ? fmt(obpKatki || 0) : "—"}
                </div>
              </div>
            </>
          ) : null}
          {obpDgs != null ? (
            <>
              <div className="border border-border-subtle bg-surface p-4">
                <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">ÖBP</div>
                <div className="font-headline-lg text-headline-lg text-primary">
                  {diploma.trim() ? fmt(obpDgs) : "—"}
                </div>
              </div>
              <div className="border border-border-subtle bg-surface p-4">
                <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">
                  Yerleştirme Katkısı{previous ? " (kırık)" : ""}
                </div>
                <div className="font-headline-lg text-headline-lg text-primary">
                  {diploma.trim() ? fmt(obpDgsKatki || 0) : "—"}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {chartData.length > 0 ? (
          <div className="border-t border-border-subtle pt-8 mt-8" aria-label="Net dağılımı grafiği">
            <div className="flex items-center gap-2 mb-6">
              <Icon name="bar_chart" className="text-text-muted" />
              <h3 className="font-headline-md text-headline-md text-primary">Net Dağılımı</h3>
            </div>
            <ul className="flex flex-col gap-4">
              {chartData.map((d) => (
                <li key={d.label} className="grid grid-cols-[100px_1fr_80px] sm:grid-cols-[140px_1fr_100px] gap-3 items-center">
                  <span className="font-label-sm text-label-sm text-text-muted truncate" title={d.label}>
                    {d.label}
                  </span>
                  <span className="h-2 bg-surface-container-high block">
                    <span
                      className="h-2 bg-black-pure block"
                      style={{ width: `${Math.round(d.ratio * 100)}%` }}
                    />
                  </span>
                  <span className="font-label-sm text-label-sm text-text-muted text-right">
                    {fmt(d.net)} / {d.max}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {hasAnyInput ? (
          <div className="border-t border-border-subtle pt-8 mt-8 flex flex-col sm:flex-row sm:items-center gap-4" role="group" aria-label="Sonucu paylaş">
            <span className="flex items-center gap-2 font-label-sm text-label-sm uppercase text-text-muted">
              <Icon name="share" size={18} />
              Sonucu Paylaş
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 border border-border-subtle px-4 py-2 font-label-sm text-label-sm uppercase text-on-surface hover:border-black-pure transition-colors"
                onClick={handleCopy}
                aria-label="Sonucu kopyala"
              >
                <Icon name={copied ? "check" : "content_copy"} size={16} />
                {copied ? "Kopyalandı" : "Kopyala"}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 border border-border-subtle px-4 py-2 font-label-sm text-label-sm uppercase text-on-surface hover:border-black-pure transition-colors"
                onClick={handlePrint}
                aria-label="PDF olarak yazdır"
              >
                <Icon name="picture_as_pdf" size={16} />
                PDF / Yazdır
              </button>
              <a
                className="inline-flex items-center gap-2 border border-border-subtle px-4 py-2 font-label-sm text-label-sm uppercase text-on-surface hover:border-black-pure transition-colors"
                href={twitterHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) üzerinde paylaş"
              >
                <Icon name="share" size={16} />X
              </a>
              <a
                className="inline-flex items-center gap-2 border border-border-subtle px-4 py-2 font-label-sm text-label-sm uppercase text-on-surface hover:border-black-pure transition-colors"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp üzerinde paylaş"
              >
                <Icon name="chat" size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        ) : null}

        <p className="font-label-sm text-label-sm text-text-muted mt-8 italic">{config.formulaNote}</p>
      </div>

      <CalcHistory
        config={config}
        currentSnapshot={snapshot}
        currentYear={year}
        primaryScore={hasAnyInput && primaryResult ? primaryResult.value : null}
        primaryLabel={primaryResult?.label ?? null}
        onLoad={loadSnapshot}
      />
    </div>
  );
}

function CalcSkeleton({ groups }: { groups: number }) {
  const blocks = Math.max(1, Math.min(groups, 3));
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Yükleniyor"
    >
      <div className="h-12 bg-surface-container-high animate-pulse" />
      {Array.from({ length: blocks }).map((_, i) => (
        <div key={i} className="border border-border-subtle bg-white-pure p-8 flex flex-col gap-4">
          <div className="h-6 w-1/3 bg-surface-container-high animate-pulse" />
          <div className="h-10 bg-surface-container-high animate-pulse" />
          <div className="h-10 bg-surface-container-high animate-pulse" />
          <div className="h-10 bg-surface-container-high animate-pulse" />
          <div className="h-10 bg-surface-container-high animate-pulse" />
        </div>
      ))}
      <div className="h-12 bg-surface-container-high animate-pulse" />
    </div>
  );
}
