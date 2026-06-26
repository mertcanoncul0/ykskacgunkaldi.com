// Tarayıcı tarafı kimlik doğrulama yardımcıları.
//
// Auth istekleri doğrudan PocketBase'e değil, kendi SSR sunucumuzdaki
// /api/auth/* endpoint'lerine gider (aynı origin → CORS sorunu yok). Sunucu
// token'ı httpOnly cookie'de, görüntülenecek kullanıcıyı ise okunabilir bir
// `pb_user` cookie'sinde saklar.

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  verified?: boolean;
}

export class PbError extends Error {
  fields: Record<string, { message: string }>;
  constructor(message: string, fields: Record<string, { message: string }> = {}) {
    super(message);
    this.name = "PbError";
    this.fields = fields;
  }
}

export function getUser(): AuthUser | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)pb_user=([^;]*)/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1])) as AuthUser;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getUser();
}

async function postLocal(path: string, body: unknown): Promise<any> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new PbError("Sunucuya ulaşılamadı. Lütfen tekrar dene.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new PbError(data?.message || "İşlem başarısız oldu.", data?.fields || {});
  }
  return data;
}

export async function login(identity: string, password: string): Promise<AuthUser> {
  const data = await postLocal("/api/auth/login", { identity, password });
  return data.user as AuthUser;
}

export async function register(input: {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
}): Promise<AuthUser | null> {
  const data = await postLocal("/api/auth/register", input);
  return (data.user as AuthUser) ?? null;
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* yoksay — yine de yönlendireceğiz */
  }
}

export async function forgotPassword(email: string): Promise<string> {
  const data = await postLocal("/api/auth/forgot", { email });
  return data.message as string;
}

export async function resetPassword(token: string, password: string, passwordConfirm: string): Promise<void> {
  await postLocal("/api/auth/reset", { token, password, passwordConfirm });
}

export async function requestVerification(email?: string): Promise<string> {
  const data = await postLocal("/api/auth/verify-request", email ? { email } : {});
  return data.message as string;
}

export async function confirmVerification(token: string): Promise<void> {
  await postLocal("/api/auth/verify-confirm", { token });
}

export async function updateProfile(name: string): Promise<AuthUser> {
  const data = await postLocal("/api/auth/update", { name });
  return data.user as AuthUser;
}
