import type { APIRoute } from "astro";
import { pbPost, readUser } from "../../../lib/auth-server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json().catch(() => ({}));
  // E-posta gövdeden gelmezse oturumdaki kullanıcının e-postasını kullan.
  const email = (body?.email ?? readUser(cookies)?.email ?? "").toString().trim();

  if (!email) return json({ message: "E-posta bulunamadı." }, 400);

  await pbPost("/api/collections/users/request-verification", { email }).catch(() => null);
  return json({ message: "Doğrulama e-postası gönderildi. Gelen kutunu kontrol et." }, 200);
};

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
