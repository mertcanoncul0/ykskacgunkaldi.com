import { useCallback, useEffect, useState } from "react";
import type { CalcSnapshot, CalcYear } from "../lib/calc-engine";
import { isLoggedIn, fetchCalc, createCalc, deleteCalc, clearCalc } from "../lib/user-data";

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

function genId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Hesaplama geçmişi. Giriş yapılmışsa PocketBase'e (cihazlar arası senkron),
 * yapılmamışsa localStorage'a kaydeder.
 */
export function useCalcHistory(slug: string) {
  const [items, setItems] = useState<CalcAttempt[]>([]);
  const [remote, setRemote] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = isLoggedIn();
    setRemote(loggedIn);
    if (loggedIn) {
      fetchCalc<CalcAttempt>(slug)
        .then((list) => setItems(list))
        .catch(() => setItems([]));
    } else {
      try {
        const raw = window.localStorage.getItem(keyFor(slug));
        setItems(raw ? (JSON.parse(raw) as CalcAttempt[]) : []);
      } catch {
        setItems([]);
      }
    }
  }, [slug]);

  const persistLocal = useCallback(
    (next: CalcAttempt[]) => {
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
      const ts = Date.now();
      if (remote) {
        const payload = { ...entry, ts };
        createCalc<typeof payload>(slug, payload)
          .then((item) => setItems((prev) => [item as CalcAttempt, ...prev].slice(0, MAX_HISTORY)))
          .catch(() => {});
      } else {
        const attempt: CalcAttempt = { ...entry, id: genId(), ts };
        setItems((prev) => {
          const next = [attempt, ...prev].slice(0, MAX_HISTORY);
          persistLocal(next);
          return next;
        });
      }
    },
    [remote, slug, persistLocal],
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        if (!remote) persistLocal(next);
        return next;
      });
      if (remote) deleteCalc(id).catch(() => {});
    },
    [remote, persistLocal],
  );

  const clear = useCallback(() => {
    setItems([]);
    if (remote) clearCalc(slug).catch(() => {});
    else persistLocal([]);
  }, [remote, slug, persistLocal]);

  return { items, save, remove, clear };
}
