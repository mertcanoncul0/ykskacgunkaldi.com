import type { APIRoute } from "astro";
import { pbPost, setAuthCookies, publicUser } from "../../../lib/auth-server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json().catch(() => ({}));
  const identity = (body?.identity ?? "").toString().trim();
  const password = (body?.password ?? "").toString();

  if (!identity || !password) {
    return json({ message: "E-posta ve şifre gerekli." }, 400);
  }

  const { ok, status, data } = await pbPost(
    "/api/collections/users/auth-with-password",
    { identity, password },
  );

  if (!ok) {
    return json(
      {
        message: status === 400 ? "E-posta veya şifre hatalı." : data?.message || "Giriş başarısız.",
        fields: data?.data || {},
      },
      status || 400,
    );
  }

  setAuthCookies(cookies, data.token, data.record);
  return json({ user: publicUser(data.record) }, 200);
};

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
