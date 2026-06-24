import { useEffect, useMemo, useState } from "react";
import { Icon } from "../lib/icons";

type TrialRow = {
  id: string;
  date: string;
  exam: string;
  verbal: string;
  math: string;
  science: string;
  social: string;
  note: string;
};

const STORAGE_KEY = "trial_tracker_v1";
const emptyRow: Omit<TrialRow, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  exam: "TYT",
  verbal: "",
  math: "",
  science: "",
  social: "",
  note: "",
};

function total(row: TrialRow | Omit<TrialRow, "id">) {
  return ["verbal", "math", "science", "social"].reduce(
    (sum, key) => sum + (Number(row[key as keyof typeof row]) || 0),
    0,
  );
}

export function TrialTrackerClient() {
  const [rows, setRows] = useState<TrialRow[]>([]);
  const [form, setForm] = useState(emptyRow);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRows(raw ? JSON.parse(raw) : []);
    } catch {
      setRows([]);
    }
  }, []);

  const persist = (next: TrialRow[]) => {
    setRows(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage unavailable */
    }
  };

  const add = () => {
    const next = [
      {
        ...form,
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
      },
      ...rows,
    ].slice(0, 20);
    persist(next);
    setForm({ ...emptyRow, date: form.date, exam: form.exam });
  };

  const clear = () => {
    if (confirm("Tüm deneme kayıtları silinsin mi?")) persist([]);
  };

  const stats = useMemo(() => {
    const ordered = rows.slice().sort((a, b) => a.date.localeCompare(b.date));
    const first = ordered[0];
    const last = ordered.at(-1);
    const best = rows.reduce((acc, row) => Math.max(acc, total(row)), 0);
    return {
      count: rows.length,
      best,
      delta: first && last ? total(last) - total(first) : 0,
    };
  }, [rows]);

  return (
    <section className="border border-border-subtle bg-white-pure p-8" aria-labelledby="trial-title">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <h2 id="trial-title" className="flex items-center gap-2 font-headline-md text-headline-md text-primary">
          <Icon name="history" />
          Netlerini Kaydet
        </h2>
        {rows.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-2 font-label-sm text-label-sm uppercase text-error hover:underline"
          >
            <Icon name="delete_sweep" size={16} />
            Temizle
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        <input
          type="date"
          value={form.date}
          onChange={(event) => setForm((cur) => ({ ...cur, date: event.target.value }))}
          className="border border-border-subtle px-3 py-2 font-body-md text-body-md col-span-2 md:col-span-1"
          aria-label="Deneme tarihi"
        />
        <select
          value={form.exam}
          onChange={(event) => setForm((cur) => ({ ...cur, exam: event.target.value }))}
          className="border border-border-subtle px-3 py-2 font-body-md text-body-md"
          aria-label="Sınav türü"
        >
          {["TYT", "AYT", "YKS", "LGS", "KPSS", "DGS", "ALES"].map((exam) => (
            <option key={exam}>{exam}</option>
          ))}
        </select>
        {[
          ["verbal", "Türkçe/Sözel"],
          ["math", "Matematik"],
          ["science", "Fen/Alan"],
          ["social", "Sosyal/GK"],
        ].map(([key, label]) => (
          <input
            key={key}
            type="number"
            inputMode="decimal"
            min={0}
            value={form[key as keyof typeof form]}
            onChange={(event) => setForm((cur) => ({ ...cur, [key]: event.target.value }))}
            placeholder={label}
            aria-label={`${label} neti`}
            className="border border-border-subtle px-3 py-2 font-body-md text-body-md"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-8">
        <input
          value={form.note}
          onChange={(event) => setForm((cur) => ({ ...cur, note: event.target.value }))}
          placeholder="Kısa not: süre yetmedi, paragraf hatası, işlem eksiği..."
          aria-label="Deneme notu"
          className="border border-border-subtle px-3 py-2 font-body-md text-body-md"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center justify-center gap-2 bg-black-pure text-white-pure px-6 py-3 font-label-md text-label-md uppercase hover:bg-primary-container transition-colors"
        >
          <Icon name="bookmark_add" size={18} />
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-border-subtle bg-surface p-5">
          <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">Kayıt</div>
          <div className="font-headline-lg text-headline-lg text-primary">{stats.count}</div>
        </div>
        <div className="border border-border-subtle bg-surface p-5">
          <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">En iyi toplam</div>
          <div className="font-headline-lg text-headline-lg text-primary">{stats.best.toFixed(2)}</div>
        </div>
        <div className="border border-border-subtle bg-surface p-5">
          <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">İlk-son fark</div>
          <div className="font-headline-lg text-headline-lg text-primary">{stats.delta >= 0 ? "+" : ""}{stats.delta.toFixed(2)}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="border border-dashed border-border-subtle p-6 text-center text-text-muted">
          Henüz deneme kaydı yok.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-primary">
                {["Tarih", "Sınav", "Toplam", "Not", ""].map((head) => (
                  <th key={head} className="py-3 px-2 font-label-md text-label-md uppercase text-text-muted">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 px-2 font-body-md text-body-md">{row.date}</td>
                  <td className="py-3 px-2 font-body-md text-body-md">{row.exam}</td>
                  <td className="py-3 px-2 font-body-md text-body-md font-semibold text-primary">{total(row).toFixed(2)}</td>
                  <td className="py-3 px-2 font-body-md text-body-md text-text-muted">{row.note || "-"}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => persist(rows.filter((item) => item.id !== row.id))}
                      className="p-2 border border-border-subtle text-text-muted hover:border-error hover:text-error transition-colors"
                      aria-label="Kaydı sil"
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
