import type { APIRoute } from "astro";
import { pbPost, setAuthCookies, publicUser } from "../../../lib/auth-server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json().catch(() => ({}));
  const email = (body?.email ?? "").toString().trim();
  const password = (body?.password ?? "").toString();
  const passwordConfirm = (body?.passwordConfirm ?? "").toString();
  const name = (body?.name ?? "").toString().trim();

  if (!email || !password) {
    return json({ message: "E-posta ve şifre gerekli." }, 400);
  }
  if (password !== passwordConfirm) {
    return json({ message: "Şifreler eşleşmiyor.", fields: { passwordConfirm: { message: "Şifreler eşleşmiyor." } } }, 400);
  }

  // 1) Kullanıcıyı oluştur
  const create = await pbPost("/api/collections/users/records", {
    email,
    password,
    passwordConfirm,
    ...(name ? { name } : {}),
  });

  if (!create.ok) {
    return json(
      { message: create.data?.message || "Kayıt başarısız.", fields: create.data?.data || {} },
      create.status || 400,
    );
  }

  // 2) Oluşturduktan sonra otomatik giriş
  const auth = await pbPost("/api/collections/users/auth-with-password", {
    identity: email,
    password,
  });

  if (!auth.ok) {
    // Kayıt başarılı ama otomatik giriş başarısız → kullanıcı /giris'ten girebilir.
    return json({ message: "Hesap oluşturuldu, lütfen giriş yap.", created: true }, 200);
  }

  setAuthCookies(cookies, auth.data.token, auth.data.record);
  return json({ user: publicUser(auth.data.record) }, 200);
};

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
