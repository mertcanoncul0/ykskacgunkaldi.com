import type { APIRoute } from "astro";
import { PB_URL, readUser, readToken, refreshUserCookie, publicUser } from "../../../lib/auth-server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = readUser(cookies);
  const token = readToken(cookies);
  if (!user || !token) return json({ message: "Oturum bulunamadı." }, 401);

  const body = await request.json().catch(() => ({}));
  const name = (body?.name ?? "").toString().trim();

  const res = await fetch(`${PB_URL}/api/collections/users/records/${user.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({ name }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return json({ message: data?.message || "Güncelleme başarısız.", fields: data?.data || {} }, res.status || 400);
  }

  refreshUserCookie(cookies, data);
  return json({ user: publicUser(data) }, 200);
};

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
