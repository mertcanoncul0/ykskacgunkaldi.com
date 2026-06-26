import { useCallback, useEffect, useMemo, useState } from "react";
import { getUser, type AuthUser } from "../lib/auth";
import { Icon } from "../lib/icons";
import {
  createPomodoroStorage,
  DEFAULT_POMODORO_SETTINGS,
  genPomodoroId,
  modeDurationMinutes,
  modeLabel,
  POMODORO_SUBJECTS,
  type PomodoroMode,
  type PomodoroSession,
  type PomodoroSessionSaveScope,
  type PomodoroSettings,
  type PomodoroStorage,
} from "../lib/pomodoro";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer";

const modeOptions: { mode: PomodoroMode; label: string; body: string }[] = [
  { mode: "focus", label: "Odaklanma", body: "Ders çalışma sayacı" },
  { mode: "short_break", label: "Kısa Mola", body: "Zihni tazele" },
  { mode: "long_break", label: "Uzun Mola", body: "Döngüyü tamamla" },
];

const outcomeOptions = [
  "Verimli geçti",
  "Kısmen verimli",
  "Zorlandım",
  "Eksik kaldı",
] as const;

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m} dk`;
  return `${h} sa ${m} dk`;
}

function clampNumber(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function makeSession(mode: PomodoroMode, settings: PomodoroSettings, subject: string, user: AuthUser | null): PomodoroSession {
  const now = new Date().toISOString();
  return {
    id: genPomodoroId(),
    userId: user?.id || null,
    mode,
    subject,
    durationMinutes: modeDurationMinutes(mode, settings),
    startedAt: now,
    endedAt: null,
    completed: false,
    status: "running",
    saveScope: user ? "account_device" : "guest_device",
    createdAt: now,
    updatedAt: now,
  };
}

function notify(title: string, body: string, settings: PomodoroSettings) {
  if (settings.soundEnabled && typeof window !== "undefined") {
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 660;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.4);
      }
    } catch {
      /* audio unavailable */
    }
  }

  if (
    settings.notificationsEnabled &&
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(title, { body });
    } catch {
      /* notification unavailable */
    }
  }
}

export function PomodoroClient() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [storage, setStorage] = useState<PomodoroStorage>(() => createPomodoroStorage(null));
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [subject, setSubject] = useState("Genel Tekrar");
  const [customSubject, setCustomSubject] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [cycleFocusCount, setCycleFocusCount] = useState(0);
  const [toast, setToast] = useState("Sayaç hazır.");
  const [pendingAutoStart, setPendingAutoStart] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);

  const activeSubject = customSubject.trim() || subject;
  const reviewSession = useMemo(
    () => sessions.find((item) => item.id === reviewSessionId) || null,
    [reviewSessionId, sessions],
  );

  const syncSession = useCallback((id: string, patch: Partial<PomodoroSession>) => {
    const nextPatch = { ...patch, updatedAt: new Date().toISOString() };
    setSessions((prev) => prev.map((item) => (item.id === id ? { ...item, ...nextPatch } : item)));
    storage.updateSession(id, nextPatch).catch(() => {});
  }, [storage]);

  function completeCurrentSession(finishedMode: PomodoroMode, manual = false) {
    const endedAt = new Date().toISOString();
    const completedSessionId = currentSessionId;
    if (currentSessionId) {
      syncSession(currentSessionId, {
        endedAt,
        completed: true,
        status: "completed",
      });
      setCurrentSessionId(null);
    }

    if (finishedMode === "focus") {
      if (completedSessionId) setReviewSessionId(completedSessionId);
      const nextCount = cycleFocusCount + 1;
      const needsLongBreak = nextCount % settings.longBreakInterval === 0;
      const nextMode: PomodoroMode = needsLongBreak ? "long_break" : "short_break";
      setCycleFocusCount(nextCount);
      timer.setMode(nextMode);
      setToast(manual ? "Odak oturumu tamamlandı. Notlarını ekleyebilirsin." : needsLongBreak ? "Harika, uzun mola zamanı. Oturum notunu ekleyebilirsin." : "Odak oturumu tamamlandı, kısa mola zamanı. Oturum notunu ekleyebilirsin.");
      notify("Odak oturumu tamamlandı", needsLongBreak ? "Uzun mola zamanı." : "Kısa mola zamanı.", settings);
      if (settings.autoStartBreaks) setPendingAutoStart(true);
    } else {
      timer.setMode("focus");
      setToast(manual ? "Mola tamamlandı." : "Mola bitti, yeni odak oturumu hazır.");
      notify("Mola tamamlandı", "Yeni odak oturumu hazır.", settings);
      if (settings.autoStartFocus) setPendingAutoStart(true);
    }
  }

  const timer = usePomodoroTimer(settings, {
    onComplete: (finishedMode) => completeCurrentSession(finishedMode),
  });

  const startSession = useCallback(() => {
    const session = makeSession(timer.mode, settings, activeSubject, user);
    setCurrentSessionId(session.id);
    setSessions((prev) => [session, ...prev].slice(0, 80));
    storage.saveSession(session).catch(() => {});
    timer.start();
    setToast(`${modeLabel(timer.mode)} başladı.`);
  }, [activeSubject, settings, storage, timer, user]);

  useEffect(() => {
    const currentUser = getUser();
    const nextStorage = createPomodoroStorage(currentUser?.id || null);
    setUser(currentUser);
    setStorage(nextStorage);
    Promise.all([nextStorage.loadSettings(), nextStorage.listSessions()])
      .then(([loadedSettings, loadedSessions]) => {
        setSettings(loadedSettings);
        setSessions(loadedSessions);
        const completedFocus = loadedSessions.filter((item) => item.mode === "focus" && item.completed).length;
        setCycleFocusCount(completedFocus % loadedSettings.longBreakInterval);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    storage.saveSettings(settings).catch(() => {});
  }, [settings, storage]);

  useEffect(() => {
    if (!pendingAutoStart || timer.state !== "idle") return;
    setPendingAutoStart(false);
    window.setTimeout(() => startSession(), 350);
  }, [pendingAutoStart, startSession, timer.state]);

  const updateSettings = (patch: Partial<PomodoroSettings>) => {
    setSettings((cur) => ({ ...cur, ...patch }));
  };

  const pauseSession = () => {
    timer.pause();
    if (currentSessionId) syncSession(currentSessionId, { status: "paused" });
    setToast("Sayaç duraklatıldı.");
  };

  const resumeSession = () => {
    timer.resume();
    if (currentSessionId) syncSession(currentSessionId, { status: "running" });
    setToast("Sayaç devam ediyor.");
  };

  const resetSession = () => {
    if (timer.state === "running" && !confirm("Çalışan sayaç sıfırlansın mı?")) return;
    if (currentSessionId) {
      syncSession(currentSessionId, {
        endedAt: new Date().toISOString(),
        completed: false,
        status: "cancelled",
      });
      setCurrentSessionId(null);
    }
    timer.reset();
    setToast("Sayaç sıfırlandı.");
  };

  const finishSession = () => {
    timer.finishNow();
    completeCurrentSession(timer.mode, true);
  };

  const saveSessionReview = (id: string, patch: Partial<PomodoroSession>) => {
    const reviewedAt = new Date().toISOString();
    const saveScope: PomodoroSessionSaveScope = user ? "account_device" : "guest_device";
    syncSession(id, {
      ...patch,
      reviewedAt,
      saveScope,
    });
    setReviewSessionId(null);
    setToast(user ? "Oturum notu hesabına özel kaydedildi." : "Oturum notu bu cihaza kaydedildi.");
  };

  const requestNotifications = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings({ notificationsEnabled: false });
      return;
    }
    if (typeof Notification === "undefined") {
      setToast("Tarayıcı bildirimi desteklenmiyor.");
      return;
    }
    const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    updateSettings({ notificationsEnabled: permission === "granted" });
    setToast(permission === "granted" ? "Bildirimler açıldı." : "Bildirim izni verilmedi.");
  };

  return (
    <section id="pomodoro-app" className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-gutter items-start">
      <div className="grid gap-6">
        <PomodoroTimer
          timer={timer}
          settings={settings}
          toast={toast}
          onModeChange={timer.setMode}
          onStart={startSession}
          onPause={pauseSession}
          onResume={resumeSession}
          onReset={resetSession}
          onFinish={finishSession}
        />
        {reviewSession && (
          <SessionReviewPanel
            session={reviewSession}
            user={user}
            onSave={saveSessionReview}
            onDismiss={() => setReviewSessionId(null)}
          />
        )}
        <SubjectSelector
          subject={subject}
          customSubject={customSubject}
          disabled={timer.state === "running"}
          onSubjectChange={setSubject}
          onCustomSubjectChange={setCustomSubject}
        />
        <PomodoroStats sessions={sessions} />
        <PomodoroSessionHistory sessions={sessions} />
      </div>

      <aside className="xl:sticky xl:top-24 grid gap-6">
        <PomodoroSettingsPanel
          settings={settings}
          disabled={timer.state === "running"}
          onChange={updateSettings}
          onNotificationsChange={requestNotifications}
        />
        <AccountNotice user={user} />
      </aside>
    </section>
  );
}

function coerceCount(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function SessionReviewPanel({
  session,
  user,
  onSave,
  onDismiss,
}: {
  session: PomodoroSession;
  user: AuthUser | null;
  onSave: (id: string, patch: Partial<PomodoroSession>) => void;
  onDismiss: () => void;
}) {
  const [subject, setSubject] = useState(session.subject);
  const [outcome, setOutcome] = useState(session.outcome || outcomeOptions[0]);
  const [questionCount, setQuestionCount] = useState(String(session.questionCount || ""));
  const [correctCount, setCorrectCount] = useState(String(session.correctCount || ""));
  const [wrongCount, setWrongCount] = useState(String(session.wrongCount || ""));
  const [blankCount, setBlankCount] = useState(String(session.blankCount || ""));
  const [notes, setNotes] = useState(session.notes || "");
  const [nextAction, setNextAction] = useState(session.nextAction || "");

  useEffect(() => {
    setSubject(session.subject);
    setOutcome(session.outcome || outcomeOptions[0]);
    setQuestionCount(String(session.questionCount || ""));
    setCorrectCount(String(session.correctCount || ""));
    setWrongCount(String(session.wrongCount || ""));
    setBlankCount(String(session.blankCount || ""));
    setNotes(session.notes || "");
    setNextAction(session.nextAction || "");
  }, [session.id, session]);

  const saveLabel = user ? "Hesaba Kaydet" : "Bu Cihaza Kaydet";
  const savedScope = user
    ? "Giriş yaptığın için bu notlar hesabına özel çalışma geçmişine yazılır."
    : "Giriş yapmadığın için notlar şimdilik yalnızca bu tarayıcıda saklanır.";

  return (
    <div className="border-2 border-black-pure bg-white-pure p-6 md:p-8 rounded-card" aria-live="polite">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-widest text-text-muted mb-2">Oturum özeti</p>
          <h2 className="font-headline-md text-headline-md text-primary">Bitirdiğin çalışmayı kaydet</h2>
        </div>
        <div className="border border-border-subtle px-4 py-3 font-label-sm text-label-sm uppercase text-text-muted">
          {session.durationMinutes} dk · {new Date(session.startedAt).toLocaleDateString("tr-TR")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Ders / konu
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
          />
        </label>
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Sonuç
          <select
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
          >
            {outcomeOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          ["Toplam soru", questionCount, setQuestionCount],
          ["Doğru", correctCount, setCorrectCount],
          ["Yanlış", wrongCount, setWrongCount],
          ["Boş", blankCount, setBlankCount],
        ].map(([label, value, setter]) => (
          <label key={label as string} className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
            {label as string}
            <input
              type="number"
              min={0}
              value={value as string}
              onChange={(event) => (setter as (next: string) => void)(event.target.value)}
              className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 mb-6">
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Oturum notu
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Neyi bitirdin, nerede takıldın, hangi kaynak iyi geldi?"
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none resize-y"
          />
        </label>
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Sonraki adım
          <input
            value={nextAction}
            onChange={(event) => setNextAction(event.target.value)}
            placeholder="Örn. Yanlışları tekrar çöz, fonksiyonlar konu testine dön..."
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
          />
        </label>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <p className="font-body-md text-body-md text-text-muted">{savedScope}</p>
        <div className="flex flex-wrap gap-3">
          {!user && (
            <a href="/giris" className="inline-flex min-h-12 items-center gap-2 border border-border-subtle px-5 py-3 font-label-md text-label-md uppercase hover:border-primary">
              <Icon name="login" size={18} />
              Giriş Yap
            </a>
          )}
          <button type="button" onClick={onDismiss} className="inline-flex min-h-12 items-center gap-2 border border-border-subtle px-5 py-3 font-label-md text-label-md uppercase hover:border-primary">
            Daha Sonra
          </button>
          <button
            type="button"
            onClick={() => onSave(session.id, {
              subject: subject.trim() || session.subject,
              outcome,
              questionCount: coerceCount(questionCount),
              correctCount: coerceCount(correctCount),
              wrongCount: coerceCount(wrongCount),
              blankCount: coerceCount(blankCount),
              notes: notes.trim(),
              nextAction: nextAction.trim(),
            })}
            className="inline-flex min-h-12 items-center gap-2 bg-primary text-on-primary px-5 py-3 font-label-md text-label-md uppercase hover:opacity-90"
          >
            <Icon name="save" size={18} />
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function PomodoroTimer({
  timer,
  settings,
  toast,
  onModeChange,
  onStart,
  onPause,
  onResume,
  onReset,
  onFinish,
}: {
  timer: ReturnType<typeof usePomodoroTimer>;
  settings: PomodoroSettings;
  toast: string;
  onModeChange: (mode: PomodoroMode) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFinish: () => void;
}) {
  const percent = Math.max(0, Math.min(100, timer.progress * 100));
  const canFinish = timer.state !== "idle";
  return (
    <div className="border border-black-pure bg-white-pure p-6 md:p-8 rounded-card shadow-card">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-widest text-text-muted mb-2">Aktif mod</p>
          <h2 className="font-headline-lg text-headline-lg text-primary">{modeLabel(timer.mode)}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {modeOptions.map((option) => (
            <button
              key={option.mode}
              type="button"
              disabled={timer.state === "running"}
              onClick={() => onModeChange(option.mode)}
              className={`border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                timer.mode === option.mode
                  ? "border-black-pure bg-black-pure text-white-pure"
                  : "border-border-subtle bg-white-pure text-text-muted hover:border-black-pure"
              }`}
              aria-pressed={timer.mode === option.mode}
            >
              <span className="block font-label-md text-label-md uppercase">{option.label}</span>
              <span className="block font-body-md text-xs">{option.body}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid justify-items-center gap-6 py-8" aria-live="polite">
        <div
          className="relative grid h-64 w-64 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-primary) ${percent}%, var(--color-surface-container-high) ${percent}% 100%)`,
          }}
        >
          <div className="grid h-[calc(100%-18px)] w-[calc(100%-18px)] place-items-center rounded-full bg-white-pure border border-border-subtle">
            <div className="text-center">
              <div className="font-display-lg text-[64px] leading-none text-primary">{timer.formattedTime}</div>
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-text-muted mt-3">
                {timer.state === "running" ? "Çalışıyor" : timer.state === "paused" ? "Duraklatıldı" : `${modeDurationMinutes(timer.mode, settings)} dk`}
              </p>
            </div>
          </div>
        </div>
        <div className="h-2 w-full max-w-xl bg-surface-container-high border border-border-subtle">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {timer.state === "idle" && (
          <button type="button" onClick={onStart} className="inline-flex min-h-12 items-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase hover:opacity-90" aria-label="Pomodoro sayacını başlat">
            <Icon name="timer" />
            Başlat
          </button>
        )}
        {timer.state === "running" && (
          <button type="button" onClick={onPause} className="inline-flex min-h-12 items-center gap-2 border border-black-pure px-6 py-3 font-label-md text-label-md uppercase hover:bg-surface-container-high" aria-label="Pomodoro sayacını duraklat">
            <Icon name="schedule" />
            Duraklat
          </button>
        )}
        {timer.state === "paused" && (
          <button type="button" onClick={onResume} className="inline-flex min-h-12 items-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase hover:opacity-90" aria-label="Pomodoro sayacına devam et">
            <Icon name="timer" />
            Devam Et
          </button>
        )}
        <button type="button" onClick={onReset} className="inline-flex min-h-12 items-center gap-2 border border-border-subtle px-6 py-3 font-label-md text-label-md uppercase hover:border-black-pure" aria-label="Pomodoro sayacını sıfırla">
          <Icon name="refresh" />
          Sıfırla
        </button>
        <button type="button" disabled={!canFinish} onClick={onFinish} className="inline-flex min-h-12 items-center gap-2 border border-border-subtle px-6 py-3 font-label-md text-label-md uppercase hover:border-primary disabled:opacity-40" aria-label="Aktif oturumu bitir">
          <Icon name="check_circle" />
          Oturumu Bitir
        </button>
      </div>

      <p className="border border-border-subtle bg-surface p-4 text-center font-body-md text-body-md text-text-muted">{toast}</p>
    </div>
  );
}

function SubjectSelector({
  subject,
  customSubject,
  disabled,
  onSubjectChange,
  onCustomSubjectChange,
}: {
  subject: string;
  customSubject: string;
  disabled: boolean;
  onSubjectChange: (value: string) => void;
  onCustomSubjectChange: (value: string) => void;
}) {
  return (
    <div className="border border-border-subtle bg-white-pure p-6 rounded-card">
      <h2 className="flex items-center gap-2 font-headline-md text-headline-md text-primary mb-5">
        <Icon name="subject" />
        Ders / Etiket
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Hazır dersler
          <select
            disabled={disabled}
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none disabled:opacity-50"
          >
            {POMODORO_SUBJECTS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Özel etiket
          <input
            disabled={disabled}
            value={customSubject}
            onChange={(event) => onCustomSubjectChange(event.target.value)}
            placeholder="Örn. Paragraf, Problemler, Organik..."
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none disabled:opacity-50"
          />
        </label>
      </div>
    </div>
  );
}

function PomodoroSettingsPanel({
  settings,
  disabled,
  onChange,
  onNotificationsChange,
}: {
  settings: PomodoroSettings;
  disabled: boolean;
  onChange: (patch: Partial<PomodoroSettings>) => void;
  onNotificationsChange: (enabled: boolean) => void;
}) {
  const numberField = (key: keyof Pick<PomodoroSettings, "focusMinutes" | "shortBreakMinutes" | "longBreakMinutes" | "longBreakInterval">, label: string, min: number, max: number) => (
    <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        disabled={disabled}
        value={settings[key]}
        onChange={(event) => onChange({ [key]: clampNumber(Number(event.target.value), min, max, settings[key]) } as Partial<PomodoroSettings>)}
        className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none disabled:opacity-50"
      />
    </label>
  );

  return (
    <div className="border border-border-subtle bg-white-pure p-6 rounded-card">
      <h2 className="flex items-center gap-2 font-headline-md text-headline-md text-primary mb-5">
        <Icon name="edit_note" />
        Ayarlar
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-5">
        {numberField("focusMinutes", "Odak", 1, 180)}
        {numberField("shortBreakMinutes", "Kısa mola", 1, 60)}
        {numberField("longBreakMinutes", "Uzun mola", 1, 90)}
        {numberField("longBreakInterval", "Uzun mola döngüsü", 2, 12)}
      </div>
      <div className="grid gap-3">
        {[
          ["autoStartBreaks", "Molaları otomatik başlat"],
          ["autoStartFocus", "Odağı otomatik başlat"],
          ["soundEnabled", "Sesli uyarı"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center justify-between gap-4 border border-border-subtle p-3 font-body-md text-body-md">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={Boolean(settings[key as keyof PomodoroSettings])}
              onChange={(event) => onChange({ [key]: event.target.checked } as Partial<PomodoroSettings>)}
              className="h-5 w-5"
            />
          </label>
        ))}
        <label className="flex items-center justify-between gap-4 border border-border-subtle p-3 font-body-md text-body-md">
          <span>Tarayıcı bildirimi</span>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(event) => onNotificationsChange(event.target.checked)}
            className="h-5 w-5"
          />
        </label>
      </div>
    </div>
  );
}

function PomodoroStats({ sessions }: { sessions: PomodoroSession[] }) {
  const stats = useMemo(() => {
    const today = todayKey();
    const weekStart = startOfWeek();
    const completedFocus = sessions.filter((item) => item.mode === "focus" && item.completed);
    const todayFocus = completedFocus.filter((item) => todayKey(new Date(item.startedAt)) === today);
    const weekFocus = completedFocus.filter((item) => new Date(item.startedAt) >= weekStart);
    const days = Array.from(new Set(completedFocus.map((item) => todayKey(new Date(item.startedAt))))).sort().reverse();
    let streak = 0;
    const cursor = new Date();
    while (days.includes(todayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return {
      todayMinutes: todayFocus.reduce((sum, item) => sum + item.durationMinutes, 0),
      todayCount: todayFocus.length,
      weekMinutes: weekFocus.reduce((sum, item) => sum + item.durationMinutes, 0),
      streak,
    };
  }, [sessions]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        ["Bugünkü odak", formatMinutes(stats.todayMinutes)],
        ["Pomodoro", String(stats.todayCount)],
        ["Bu hafta", formatMinutes(stats.weekMinutes)],
        ["Seri", `${stats.streak} gün`],
      ].map(([label, value]) => (
        <div key={label} className="border border-border-subtle bg-white-pure p-5 rounded-card">
          <div className="font-label-sm text-label-sm uppercase text-text-muted mb-2">{label}</div>
          <div className="font-headline-lg text-headline-lg text-primary">{value}</div>
        </div>
      ))}
    </div>
  );
}

function PomodoroSessionHistory({ sessions }: { sessions: PomodoroSession[] }) {
  const recent = sessions.slice(0, 10);
  return (
    <div className="border border-border-subtle bg-white-pure p-6 rounded-card">
      <h2 className="flex items-center gap-2 font-headline-md text-headline-md text-primary mb-5">
        <Icon name="history" />
        Son Oturumlar
      </h2>
      {recent.length === 0 ? (
        <div className="border border-dashed border-border-subtle p-6 text-center text-text-muted">Henüz oturum yok.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-primary">
                {["Tarih", "Ders", "Süre", "Mod", "Sonuç", "Not", "Durum"].map((head) => (
                  <th key={head} className="py-3 px-2 font-label-sm text-label-sm uppercase text-text-muted">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {recent.map((session) => (
                <tr key={session.id}>
                  <td className="py-3 px-2 font-body-md text-body-md">{new Date(session.startedAt).toLocaleDateString("tr-TR")}</td>
                  <td className="py-3 px-2 font-body-md text-body-md">{session.subject}</td>
                  <td className="py-3 px-2 font-body-md text-body-md">{session.durationMinutes} dk</td>
                  <td className="py-3 px-2 font-body-md text-body-md">{modeLabel(session.mode)}</td>
                  <td className="py-3 px-2 font-body-md text-body-md">{session.outcome || "-"}</td>
                  <td className="py-3 px-2 font-body-md text-body-md max-w-xs">
                    <span className="line-clamp-2">
                      {session.notes || session.nextAction || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-label-sm text-label-sm uppercase text-text-muted">
                    {session.completed ? "Tamamlandı" : session.status === "cancelled" ? "Yarım kaldı" : session.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AccountNotice({ user }: { user: AuthUser | null }) {
  if (user) {
    return (
      <div className="border border-border-subtle bg-surface p-6 rounded-card">
        <h2 className="font-headline-md text-headline-md text-primary mb-3">Hesap modu</h2>
        <p className="font-body-md text-body-md text-text-muted">
          Oturumların bu cihazda hesabına özel saklanıyor. PocketBase pomodoro collection'ı açıldığında aynı servis uzak kayda bağlanacak.
        </p>
      </div>
    );
  }
  return (
    <div className="border border-border-subtle bg-surface p-6 rounded-card">
      <h2 className="font-headline-md text-headline-md text-primary mb-3">Misafir kullanım</h2>
      <p className="font-body-md text-body-md text-text-muted mb-5">
        Giriş yaparsan çalışma oturumların hesabına kaydedilir ve farklı cihazlarda da takip edebilirsin.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href="/giris" className="inline-flex items-center gap-2 border border-border-subtle px-4 py-3 font-label-md text-label-md uppercase hover:border-primary">
          <Icon name="login" size={18} />
          Giriş Yap
        </a>
        <a href="/kayit" className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-3 font-label-md text-label-md uppercase hover:opacity-90">
          <Icon name="person_add" size={18} />
          Kayıt Ol
        </a>
      </div>
    </div>
  );
}
