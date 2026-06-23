import { useCallback, useEffect, useState } from "react";
import type { CalcSnapshot, CalcYear } from "../lib/calc-engine";

export type CalcAttempt = {
  id: string;
  ts: number;
  label: string;
  year: CalcYear;
  snapshot: CalcSnapshot;
  primaryScore: number | null;
  primaryLabel: string | null;
};

const MAX_HISTORY = 5;
const keyFor = (slug: string) => `calc_history_v1_${slug}`;

export function useCalcHistory(slug: string) {
  const [items, setItems] = useState<CalcAttempt[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(keyFor(slug));
      setItems(raw ? (JSON.parse(raw) as CalcAttempt[]) : []);
    } catch {
      setItems([]);
    }
  }, [slug]);

  const persist = useCallback(
    (next: CalcAttempt[]) => {
      setItems(next);
      try {
        window.localStorage.setItem(keyFor(slug), JSON.stringify(next));
      } catch {
        /* quota — ignore */
      }
    },
    [slug],
  );

  const save = useCallback(
    (entry: Omit<CalcAttempt, "id" | "ts">) => {
      const attempt: CalcAttempt = {
        ...entry,
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ts: Date.now(),
      };
      persist([attempt, ...items].slice(0, MAX_HISTORY));
      return attempt;
    },
    [items, persist],
  );

  const remove = useCallback(
    (id: string) => persist(items.filter((i) => i.id !== id)),
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, save, remove, clear };
}
