import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PomodoroMode, PomodoroSettings } from "../lib/pomodoro";
import { modeDurationMinutes, modeLabel } from "../lib/pomodoro";

export type PomodoroTimerState = "idle" | "running" | "paused";

interface UsePomodoroTimerOptions {
  onComplete?: (mode: PomodoroMode) => void;
}

export function formatPomodoroTime(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function usePomodoroTimer(settings: PomodoroSettings, options: UsePomodoroTimerOptions = {}) {
  const [mode, setModeValue] = useState<PomodoroMode>("focus");
  const [state, setState] = useState<PomodoroTimerState>("idle");
  const [remainingMs, setRemainingMs] = useState(() => settings.focusMinutes * 60_000);
  const endAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(options.onComplete);
  const originalTitleRef = useRef<string | null>(null);

  useEffect(() => {
    onCompleteRef.current = options.onComplete;
  }, [options.onComplete]);

  const totalMs = useMemo(() => modeDurationMinutes(mode, settings) * 60_000, [mode, settings]);

  useEffect(() => {
    if (state === "idle") setRemainingMs(totalMs);
  }, [state, totalMs]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!originalTitleRef.current) originalTitleRef.current = document.title;
    if (state === "running") {
      document.title = `${formatPomodoroTime(remainingMs)} - ${modeLabel(mode)}`;
    } else {
      document.title = originalTitleRef.current;
    }
    return () => {
      if (state === "running" && originalTitleRef.current) document.title = originalTitleRef.current;
    };
  }, [mode, remainingMs, state]);

  useEffect(() => {
    if (state !== "running") return;
    completedRef.current = false;
    const tick = () => {
      const endAt = endAtRef.current;
      if (!endAt) return;
      const next = Math.max(0, endAt - Date.now());
      setRemainingMs(next);
      if (next <= 0 && !completedRef.current) {
        completedRef.current = true;
        endAtRef.current = null;
        setState("idle");
        onCompleteRef.current?.(mode);
      }
    };
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [mode, state]);

  const start = useCallback(() => {
    const base = state === "paused" ? remainingMs : totalMs;
    endAtRef.current = Date.now() + base;
    setRemainingMs(base);
    setState("running");
  }, [remainingMs, state, totalMs]);

  const pause = useCallback(() => {
    if (state !== "running") return;
    const endAt = endAtRef.current;
    if (endAt) setRemainingMs(Math.max(0, endAt - Date.now()));
    endAtRef.current = null;
    setState("paused");
  }, [state]);

  const reset = useCallback(() => {
    endAtRef.current = null;
    setRemainingMs(totalMs);
    setState("idle");
  }, [totalMs]);

  const finishNow = useCallback(() => {
    endAtRef.current = null;
    setRemainingMs(0);
    setState("idle");
  }, []);

  const setMode = useCallback((nextMode: PomodoroMode) => {
    endAtRef.current = null;
    setModeValue(nextMode);
    setState("idle");
  }, []);

  return {
    mode,
    state,
    remainingMs,
    totalMs,
    progress: totalMs > 0 ? 1 - remainingMs / totalMs : 0,
    formattedTime: formatPomodoroTime(remainingMs),
    setMode,
    start,
    pause,
    resume: start,
    reset,
    finishNow,
  };
}
