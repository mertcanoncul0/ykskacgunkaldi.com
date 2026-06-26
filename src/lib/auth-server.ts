// Sunucu tarafı (Astro SSR) PocketBase kimlik doğrulama yardımcıları.
//
// Tarayıcıdan doğrudan PocketBase'e POST atmak cross-origin (CORS) sorunlarına
// yol açıyordu. Bunun yerine auth istekleri kendi SSR sunucumuz üzerinden
// proxy'leniyor: Node sunucusu PocketBase'e zaten erişebildiği için (bkz.
// pocketbase.ts SSR fetch'leri) hem CORS sorunu ortadan kalkar hem de token'ı
// httpOnly bir cookie'de güvenle saklayabiliriz.

import type { AstroCookies } from "astro";

const runtimeEnv = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process?.env;

export const PB_URL = (
  runtimeEnv?.POCKETBASE_URL || "https://api.ykskacgunkaldi.com"
).replace(/\/$/, "");

const TOKEN_COOKIE = "pb_token";
const USER_COOKIE = "pb_user";
const MAX_AGE = 14 * 24 * 60 * 60; // 14 gün

export interface PublicUser {
  id: string;
  email: string;
  name?: string;
  verified?: boolean;
}

export function publicUser(record: any): PublicUser {
  return {
    id: record.id,
    email: record.email,
    name: record.name || undefined,
    verified: !!record.verified,
  };
}

export function setAuthCookies(cookies: AstroCookies, token: string, record: any) {
  const secure = import.meta.env.PROD;
  cookies.set(TOKEN_COOKIE, token, {
    path: "/",
    maxAge: MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure,
  });
  cookies.set(USER_COOKIE, JSON.stringify(publicUser(record)), {
    path: "/",
    maxAge: MAX_AGE,
    httpOnly: false, // istemci UI'si (Header, SideNav) okuyabilsin
    sameSite: "lax",
    secure,
  });
}

export function clearAuthCookies(cookies: AstroCookies) {
  cookies.delete(TOKEN_COOKIE, { path: "/" });
  cookies.delete(USER_COOKIE, { path: "/" });
}

export function readUser(cookies: AstroCookies): PublicUser | null {
  const raw = cookies.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

export function readToken(cookies: AstroCookies): string | null {
  return cookies.get(TOKEN_COOKIE)?.value || null;
}

/** Yalnızca okunabilir kullanıcı cookie'sini günceller (token'a dokunmaz). */
export function refreshUserCookie(cookies: AstroCookies, record: any) {
  cookies.set(USER_COOKIE, JSON.stringify(publicUser(record)), {
    path: "/",
    maxAge: MAX_AGE,
    httpOnly: false,
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });
}

/** PocketBase'e POST atıp JSON döndürür. */
export async function pbPost(path: string, body: unknown) {
  const res = await fetch(`${PB_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/**
 * Oturumdaki kullanıcının token'ıyla PocketBase'e kimlikli istek atar
 * (koleksiyon erişim kuralları bu sayede uygulanır). Token yoksa null döner.
 */
export async function pbAuthed(
  cookies: AstroCookies,
  path: string,
  init: RequestInit = {},
) {
  const token = readToken(cookies);
  if (!token) return null;
  const res = await fetch(`${PB_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
