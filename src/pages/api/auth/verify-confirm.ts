import type { APIRoute } from "astro";
import { pbPost } from "../../../lib/auth-server";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const token = (body?.token ?? "").toString();
  if (!token) return json({ message: "Geçersiz veya eksik doğrulama bağlantısı." }, 400);

  const { ok, status, data } = await pbPost("/api/collections/users/confirm-verification", { token });
  if (!ok) {
    return json({ message: data?.message || "Bağlantı geçersiz veya süresi dolmuş." }, status || 400);
  }
  return json({ ok: true }, 200);
};

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
