import type { APIRoute } from "astro";
import { clearAuthCookies } from "../../../lib/auth-server";

export const prerender = false;

// Hem form POST (JS'siz sidebar butonu) hem fetch (Header) için çalışır.
export const POST: APIRoute = async ({ cookies, redirect }) => {
  clearAuthCookies(cookies);
  return redirect("/", 303);
};
