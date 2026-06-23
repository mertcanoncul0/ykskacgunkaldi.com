import { useMemo, useState } from "react";
import type { ScoreCalculatorConfig } from "../data/score-calculators";
import {
  type CalcSnapshot,
  type CalcYear,
  computeAll,
  fmt,
  isSnapshotEmpty,
} from "../lib/calc-engine";
import { useCalcHistory, type CalcAttempt } from "../hooks/useCalcHistory";

interface Props {
  config: ScoreCalculatorConfig;
  currentSnapshot: CalcSnapshot;
  currentYear: CalcYear;
  primaryScore: number | null;
  primaryLabel: string | null;
  onLoad: (snapshot: CalcSnapshot, year: CalcYear) => void;
}

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  return `${d} gün önce`;
}

export function CalcHistory({
  config,
  currentSnapshot,
  currentYear,
  primaryScore,
  primaryLabel,
  onLoad,
}: Props) {
  const { items, save, remove, clear } = useCalcHistory(config.slug);
  const [label, setLabel] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const empty = isSnapshotEmpty(currentSnapshot);

  const handleSave = () => {
    if (empty) return;
    const finalLabel =
      label.trim() ||
      `Deneme ${new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })} ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
    save({
      label: finalLabel,
      year: currentYear,
      snapshot: currentSnapshot,
      primaryScore,
      primaryLabel,
    });
    setLabel("");
  };

  const toggleCompare = (id: string) => {
    setCompareIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= 2) return [ids[1], id];
      return [...ids, id];
    });
  };

  const compareAttempts = useMemo(
    () =>
      compareIds
        .map((id) => items.find((i) => i.id === id))
        .filter((x): x is CalcAttempt => Boolean(x)),
    [compareIds, items],
  );

  return (
    <section className="border border-border-subtle bg-white-pure p-8" aria-labelledby="calc-history-title">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h3 id="calc-history-title" className="flex items-center gap-2 font-headline-md text-headline-md text-primary">
          <span className="material-symbols-outlined" aria-hidden="true">history</span>
          Son Denemelerim
        </h3>
        {items.length > 0 ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase text-error hover:underline"
            onClick={() => {
              if (confirm("Tüm geçmişi sil?")) clear();
            }}
            aria-label="Tüm geçmişi sil"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">delete_sweep</span>
            Temizle
          </button>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-2">
        <input
          type="text"
          maxLength={48}
          value={label}
          placeholder="Deneme adı (opsiyonel)"
          onChange={(e) => setLabel(e.target.value)}
          aria-label="Deneme adı"
          disabled={empty}
          className="flex-1 border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md focus:border-black-pure outline-none transition-colors disabled:opacity-50"
        />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 bg-black-pure text-white-pure px-6 py-3 font-label-md text-label-md uppercase hover:bg-primary-container transition-colors disabled:opacity-40 disabled:pointer-events-none"
          onClick={handleSave}
          disabled={empty}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">bookmark_add</span>
          Denememi Kaydet
        </button>
      </div>
      <p className="font-label-sm text-[13px] text-text-muted mb-6 italic">
        Tarayıcında saklanır · en fazla 5 deneme · sayfayı kapatsan da durur
      </p>

      {items.length === 0 ? (
        <div className="border border-dashed border-border-subtle p-6 text-center font-body-md text-body-md text-text-muted">
          Henüz kayıtlı deneme yok. Hesapladıktan sonra "Denememi Kaydet" ile
          buraya ekleyebilirsin.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((it) => {
            const checked = compareIds.includes(it.id);
            return (
              <li
                key={it.id}
                className={`flex items-center gap-4 border p-4 transition-colors ${checked ? "border-black-pure bg-surface-container" : "border-border-subtle"}`}
              >
                <label className="flex items-center shrink-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCompare(it.id)}
                    aria-label={`${it.label} karşılaştırmaya ekle`}
                    className="accent-black-pure"
                  />
                </label>
                <div className="flex-1 min-w-0">
                  <div className="font-body-md text-body-md text-on-surface font-medium truncate">{it.label}</div>
                  <div className="flex items-center gap-2 font-label-sm text-label-sm text-text-muted flex-wrap mt-1">
                    {it.primaryLabel && it.primaryScore != null ? (
                      <span className="text-primary">
                        {it.primaryLabel}:{" "}
                        <strong>{fmt(it.primaryScore)}</strong>
                      </span>
                    ) : null}
                    <span aria-hidden="true">·</span>
                    <span>{it.year}</span>
                    <span aria-hidden="true">·</span>
                    <span>{timeAgo(it.ts)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    className="p-2 border border-border-subtle text-text-muted hover:border-black-pure hover:text-black-pure transition-colors"
                    onClick={() => onLoad(it.snapshot, it.year)}
                    aria-label={`${it.label} yükle`}
                    title="Forma yükle"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">upload</span>
                  </button>
                  <button
                    type="button"
                    className="p-2 border border-border-subtle text-text-muted hover:border-error hover:text-error transition-colors"
                    onClick={() => remove(it.id)}
                    aria-label={`${it.label} sil`}
                    title="Sil"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {compareAttempts.length === 2 ? (
        <CompareTable config={config} attempts={compareAttempts} />
      ) : compareIds.length === 1 ? (
        <div className="font-label-sm text-label-sm text-text-muted italic mt-4">
          Karşılaştırma için bir deneme daha seç.
        </div>
      ) : null}
    </section>
  );
}

function CompareTable({
  config,
  attempts,
}: {
  config: ScoreCalculatorConfig;
  attempts: CalcAttempt[];
}) {
  const [a, b] = attempts;
  const ca = computeAll(config, a.snapshot);
  const cb = computeAll(config, b.snapshot);

  // Tüm sonuç etiketlerini birleştir
  const labels = Array.from(
    new Set([
      ...ca.results.map((r) => r.label),
      ...cb.results.map((r) => r.label),
    ]),
  );
  const find = (arr: typeof ca.results, l: string) =>
    arr.find((r) => r.label === l);

  return (
    <div className="border-t border-border-subtle pt-8 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-text-muted" aria-hidden="true">compare_arrows</span>
        <h4 className="font-headline-md text-headline-md text-primary">Karşılaştırma</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="border-b-2 border-primary pb-3">
          <div className="font-label-sm text-label-sm uppercase text-primary">{a.label}</div>
          <div className="font-label-sm text-[11px] text-text-muted mt-1">{a.year}</div>
        </div>
        <div className="border-b-2 border-primary pb-3">
          <div className="font-label-sm text-label-sm uppercase text-primary">{b.label}</div>
          <div className="font-label-sm text-[11px] text-text-muted mt-1">{b.year}</div>
        </div>
        {labels.map((l) => {
          const va = find(ca.results, l)?.value;
          const vb = find(cb.results, l)?.value;
          const delta = va != null && vb != null ? vb - va : null;
          return (
            <div key={l} className="col-span-2 grid grid-cols-[2fr_1fr_1fr] gap-2 items-center py-2 border-b border-border-subtle last:border-0">
              <div className="font-body-md text-[14px] text-text-muted">{l}</div>
              <div className="font-body-md text-body-md text-primary font-semibold text-center">
                {va != null ? fmt(va) : "—"}
              </div>
              <div className="font-body-md text-body-md text-primary font-semibold text-center flex items-center justify-center gap-2 flex-wrap">
                {vb != null ? fmt(vb) : "—"}
                {delta != null && Math.abs(delta) > 0.001 ? (
                  <span
                    className={`font-label-sm text-[12px] font-semibold ${delta > 0 ? "text-primary" : "text-error"}`}
                  >
                    {delta > 0 ? "▲" : "▼"} {fmt(Math.abs(delta))}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
