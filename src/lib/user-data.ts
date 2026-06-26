// Kullanıcıya özel araç verisi (deneme takip + hesaplama geçmişi) için
// istemci yardımcıları. Giriş yapılmışsa SSR /api/data/* endpoint'leri
// üzerinden PocketBase'e gider; değilse çağıran taraf localStorage'a düşer.

import { getUser } from "./auth";

export function isLoggedIn(): boolean {
  return !!getUser();
}

async function req(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`İstek başarısız: ${res.status}`);
  return res.json().catch(() => ({}));
}

// --- Deneme net takip ---

export async function fetchTrials<T = any>(): Promise<T[]> {
  const data = await req("/api/data/trials");
  return (data.items ?? []) as T[];
}

export async function createTrial<T = any>(payload: T): Promise<any> {
  const data = await req("/api/data/trials", { method: "POST", body: JSON.stringify({ payload }) });
  return data.item;
}

export async function deleteTrial(id: string): Promise<void> {
  await req(`/api/data/trials?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function clearTrials(): Promise<void> {
  await req("/api/data/trials?all=1", { method: "DELETE" });
}

// --- Hesaplama geçmişi ---

export async function fetchCalc<T = any>(slug: string): Promise<T[]> {
  const data = await req(`/api/data/calc?slug=${encodeURIComponent(slug)}`);
  return (data.items ?? []) as T[];
}

export async function createCalc<T = any>(slug: string, payload: T): Promise<any> {
  const data = await req("/api/data/calc", { method: "POST", body: JSON.stringify({ slug, payload }) });
  return data.item;
}

export async function deleteCalc(id: string): Promise<void> {
  await req(`/api/data/calc?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function clearCalc(slug: string): Promise<void> {
  await req(`/api/data/calc?slug=${encodeURIComponent(slug)}&all=1`, { method: "DELETE" });
}
