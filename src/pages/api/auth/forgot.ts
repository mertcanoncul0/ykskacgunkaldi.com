import type { APIRoute } from "astro";
import { pbPost } from "../../../lib/auth-server";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({}));
  const email = (body?.email ?? "").toString().trim();

  if (email) {
    // Hata olsa bile (örn. e-posta kayıtlı değil) kullanıcıya aynı yanıtı
    // döneriz — hangi e-postaların kayıtlı olduğunu sızdırmamak için.
    await pbPost("/api/collections/users/request-password-reset", { email }).catch(() => null);
  }

  return new Response(
    JSON.stringify({ message: "Eğer bu e-posta kayıtlıysa, sıfırlama bağlantısı gönderildi." }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
