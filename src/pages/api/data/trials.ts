import type { APIRoute } from "astro";
import { readUser, pbAuthed } from "../../../lib/auth-server";

export const prerender = false;

const COLLECTION = "trial_results";

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}

// Kullanıcının tüm deneme kayıtlarını listele.
export const GET: APIRoute = async ({ cookies }) => {
  const r = await pbAuthed(cookies, `/api/collections/${COLLECTION}/records?perPage=200&sort=-created`);
  if (!r) return json({ items: [] }, 200);
  if (!r.ok) return json({ items: [], message: r.data?.message }, r.status);
  const items = (r.data?.items ?? []).map((rec: any) => ({ id: rec.id, ...(rec.payload || {}) }));
  return json({ items });
};

// Yeni deneme kaydı oluştur.
export const POST: APIRoute = async ({ request, cookies }) => {
  const user = readUser(cookies);
  if (!user) return json({ message: "Oturum yok." }, 401);
  const body = await request.json().catch(() => ({}));
  const payload = body?.payload ?? {};
  const r = await pbAuthed(cookies, `/api/collections/${COLLECTION}/records`, {
    method: "POST",
    body: JSON.stringify({ user: user.id, exam: payload.exam || "", payload }),
  });
  if (!r || !r.ok) return json({ message: r?.data?.message || "Kaydedilemedi." }, r?.status || 400);
  return json({ item: { id: r.data.id, ...(r.data.payload || {}) } });
};

// Tek kaydı (?id=) veya tümünü (?all=1) sil.
export const DELETE: APIRoute = async ({ url, cookies }) => {
  const id = url.searchParams.get("id");
  const all = url.searchParams.get("all");

  if (id) {
    const r = await pbAuthed(cookies, `/api/collections/${COLLECTION}/records/${id}`, { method: "DELETE" });
    return json({ ok: !!r?.ok }, r?.ok ? 200 : r?.status || 400);
  }

  if (all) {
    const list = await pbAuthed(cookies, `/api/collections/${COLLECTION}/records?perPage=200`);
    const ids: string[] = (list?.data?.items ?? []).map((x: any) => x.id);
    await Promise.all(
      ids.map((rid) => pbAuthed(cookies, `/api/collections/${COLLECTION}/records/${rid}`, { method: "DELETE" })),
    );
    return json({ ok: true });
  }

  return json({ message: "id veya all gerekli." }, 400);
};
