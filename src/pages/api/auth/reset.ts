import type { APIRoute } from "astro";
import { pbPost } from "../../../lib/auth-server";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const token = (body?.token ?? "").toString();
  const password = (body?.password ?? "").toString();
  const passwordConfirm = (body?.passwordConfirm ?? "").toString();

  if (!token) return json({ message: "Geçersiz veya eksik bağlantı." }, 400);
  if (password !== passwordConfirm) {
    return json({ message: "Şifreler eşleşmiyor.", fields: { passwordConfirm: { message: "Şifreler eşleşmiyor." } } }, 400);
  }

  const { ok, status, data } = await pbPost("/api/collections/users/confirm-password-reset", {
    token,
    password,
    passwordConfirm,
  });

  if (!ok) {
    return json(
      { message: data?.message || "Bağlantı geçersiz veya süresi dolmuş.", fields: data?.data || {} },
      status || 400,
    );
  }
  return json({ ok: true }, 200);
};

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
