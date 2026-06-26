export type PomodoroMode = "focus" | "short_break" | "long_break";
export type PomodoroSessionStatus = "running" | "completed" | "paused" | "cancelled";
export type PomodoroSessionSaveScope = "guest_device" | "account_device";

export interface PomodoroSession {
  id: string;
  userId?: string | null;
  mode: PomodoroMode;
  subject: string;
  durationMinutes: number;
  startedAt: string;
  endedAt?: string | null;
  completed: boolean;
  status: PomodoroSessionStatus;
  notes?: string;
  outcome?: string;
  nextAction?: string;
  questionCount?: number;
  correctCount?: number;
  wrongCount?: number;
  blankCount?: number;
  reviewedAt?: string | null;
  saveScope?: PomodoroSessionSaveScope;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSettings {
  userId?: string | null;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface PomodoroStorage {
  loadSettings(): Promise<PomodoroSettings>;
  saveSettings(settings: PomodoroSettings): Promise<void>;
  listSessions(): Promise<PomodoroSession[]>;
  saveSession(session: PomodoroSession): Promise<PomodoroSession>;
  updateSession(id: string, patch: Partial<PomodoroSession>): Promise<PomodoroSession | null>;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  userId: null,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  notificationsEnabled: false,
};

export const POMODORO_SUBJECTS = [
  "TYT Türkçe",
  "TYT Matematik",
  "TYT Fen",
  "TYT Sosyal",
  "AYT Matematik",
  "AYT Edebiyat",
  "AYT Fizik",
  "AYT Kimya",
  "AYT Biyoloji",
  "YDT",
  "Genel Tekrar",
] as const;

const SETTINGS_KEY = "pomodoro_settings_v1";
const SESSIONS_KEY = "pomodoro_sessions_v1";

export function genPomodoroId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function modeLabel(mode: PomodoroMode) {
  if (mode === "focus") return "Odaklanma";
  if (mode === "short_break") return "Kısa Mola";
  return "Uzun Mola";
}

export function modeDurationMinutes(mode: PomodoroMode, settings: PomodoroSettings) {
  if (mode === "focus") return settings.focusMinutes;
  if (mode === "short_break") return settings.shortBreakMinutes;
  return settings.longBreakMinutes;
}

function safeJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function clampSettings(settings: PomodoroSettings): PomodoroSettings {
  return {
    ...DEFAULT_POMODORO_SETTINGS,
    ...settings,
    focusMinutes: Math.max(1, Math.min(180, Number(settings.focusMinutes) || 25)),
    shortBreakMinutes: Math.max(1, Math.min(60, Number(settings.shortBreakMinutes) || 5)),
    longBreakMinutes: Math.max(1, Math.min(90, Number(settings.longBreakMinutes) || 15)),
    longBreakInterval: Math.max(2, Math.min(12, Number(settings.longBreakInterval) || 4)),
  };
}

export class LocalStoragePomodoroStorage implements PomodoroStorage {
  constructor(private userId: string | null = null) {}

  private scopedKey(key: string) {
    return this.userId ? `${key}_${this.userId}` : key;
  }

  async loadSettings(): Promise<PomodoroSettings> {
    if (typeof localStorage === "undefined") return { ...DEFAULT_POMODORO_SETTINGS, userId: this.userId };
    const raw = safeJson<PomodoroSettings | null>(localStorage.getItem(this.scopedKey(SETTINGS_KEY)), null);
    return clampSettings({ ...DEFAULT_POMODORO_SETTINGS, ...raw, userId: this.userId });
  }

  async saveSettings(settings: PomodoroSettings): Promise<void> {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(this.scopedKey(SETTINGS_KEY), JSON.stringify(clampSettings({ ...settings, userId: this.userId })));
  }

  async listSessions(): Promise<PomodoroSession[]> {
    if (typeof localStorage === "undefined") return [];
    return safeJson<PomodoroSession[]>(localStorage.getItem(this.scopedKey(SESSIONS_KEY)), []);
  }

  async saveSession(session: PomodoroSession): Promise<PomodoroSession> {
    const sessions = await this.listSessions();
    const next = [{ ...session, userId: this.userId }, ...sessions.filter((item) => item.id !== session.id)].slice(0, 80);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(this.scopedKey(SESSIONS_KEY), JSON.stringify(next));
    }
    return next[0];
  }

  async updateSession(id: string, patch: Partial<PomodoroSession>): Promise<PomodoroSession | null> {
    const sessions = await this.listSessions();
    let updated: PomodoroSession | null = null;
    const next = sessions.map((session) => {
      if (session.id !== id) return session;
      updated = { ...session, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (updated && typeof localStorage !== "undefined") {
      localStorage.setItem(this.scopedKey(SESSIONS_KEY), JSON.stringify(next));
    }
    return updated;
  }
}

export class RemotePomodoroStorage extends LocalStoragePomodoroStorage {
  // TODO: PocketBase'de pomodoro_sessions collection'ı açıldığında bu sınıfı
  // /api/data/pomodoro endpoint'ine bağla. Şimdilik giriş yapan kullanıcılar
  // için cihaz içi güvenli localStorage fallback'i kullanılır.
}

export function createPomodoroStorage(userId?: string | null): PomodoroStorage {
  return userId ? new RemotePomodoroStorage(userId) : new LocalStoragePomodoroStorage(null);
}
