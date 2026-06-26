import type { APIRoute } from "astro";
import { readUser, pbAuthed } from "../../../lib/auth-server";

export const prerender = false;

const COLLECTION = "calc_history";

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}

// Belirli bir hesaplayıcının (?slug=) kullanıcıya ait geçmişini listele.
export const GET: APIRoute = async ({ url, cookies }) => {
  const slug = url.searchParams.get("slug") || "";
  const filter = encodeURIComponent(`slug="${slug.replace(/"/g, "")}"`);
  const r = await pbAuthed(cookies, `/api/collections/${COLLECTION}/records?perPage=50&sort=-created&filter=${filter}`);
  if (!r) return json({ items: [] }, 200);
  if (!r.ok) return json({ items: [], message: r.data?.message }, r.status);
  const items = (r.data?.items ?? []).map((rec: any) => ({ id: rec.id, ...(rec.payload || {}) }));
  return json({ items });
};

// Yeni hesaplama kaydı oluştur.
export const POST: APIRoute = async ({ request, cookies }) => {
  const user = readUser(cookies);
  if (!user) return json({ message: "Oturum yok." }, 401);
  const body = await request.json().catch(() => ({}));
  const slug = (body?.slug || "").toString();
  const payload = body?.payload ?? {};
  if (!slug) return json({ message: "slug gerekli." }, 400);
  const r = await pbAuthed(cookies, `/api/collections/${COLLECTION}/records`, {
    method: "POST",
    body: JSON.stringify({ user: user.id, slug, label: payload.label || "", payload }),
  });
  if (!r || !r.ok) return json({ message: r?.data?.message || "Kaydedilemedi." }, r?.status || 400);
  return json({ item: { id: r.data.id, ...(r.data.payload || {}) } });
};

// Tek kaydı (?id=) veya bir hesaplayıcının tümünü (?slug=&all=1) sil.
export const DELETE: APIRoute = async ({ url, cookies }) => {
  const id = url.searchParams.get("id");
  const all = url.searchParams.get("all");
  const slug = url.searchParams.get("slug") || "";

  if (id) {
    const r = await pbAuthed(cookies, `/api/collections/${COLLECTION}/records/${id}`, { method: "DELETE" });
    return json({ ok: !!r?.ok }, r?.ok ? 200 : r?.status || 400);
  }

  if (all) {
    const filter = encodeURIComponent(`slug="${slug.replace(/"/g, "")}"`);
    const list = await pbAuthed(cookies, `/api/collections/${COLLECTION}/records?perPage=200&filter=${filter}`);
    const ids: string[] = (list?.data?.items ?? []).map((x: any) => x.id);
    await Promise.all(
      ids.map((rid) => pbAuthed(cookies, `/api/collections/${COLLECTION}/records/${rid}`, { method: "DELETE" })),
    );
    return json({ ok: true });
  }

  return json({ message: "id veya all gerekli." }, 400);
};
