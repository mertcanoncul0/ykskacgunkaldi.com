// PocketBase'den içerik çeken merkezi veri erişim katmanı.
//
// Tüm fonksiyonlar, sitenin eskiden `src/data/mock.json`'dan okuduğu
// şekille birebir uyumlu nesneler döndürür — bu sayede bileşenler
// (HomeClient, BlogClient, KonuDagilimiClient, vb.) hiç değişmeden
// çalışmaya devam eder, veri kaynağı PocketBase olsa da.
//
// PocketBase'e SSR sırasında (her istekte) bağlanılır — bu yüzden
// site artık build zamanında PocketBase'e erişebilmek zorunda değil,
// sadece çalışan Node sunucusunun PocketBase'e erişmesi yeterli.
// Adres `POCKETBASE_URL` ortam değişkeniyle (rebuild gerekmeden,
// çalışma zamanında) ayarlanır.

import type { Exam, ExamSession } from "./api";

const runtimeEnv = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process?.env;

const PB_URL = (
  runtimeEnv?.POCKETBASE_URL || "https://api.ykskacgunkaldi.com"
).replace(/\/$/, "");

// Aynı süreç içinde tekrarlanan istekleri PocketBase'e tekrar göndermemek için
// bellek-içi stale-while-revalidate cache. Node adapter "standalone" modda
// sürekli çalışan tek bir process olduğundan, bu cache istekler arasında
// paylaşılır. Süre dolduğunda ilk kullanıcıyı PocketBase yanıtına bekletmek
// yerine eski veriyi hemen döndürüp yenilemeyi arkada yapar; PageSpeed'in
// soğuk origin TTFB zıplamalarını azaltır.
const CACHE_TTL_MS = 5 * 60_000;
const CACHE_STALE_MS = 24 * 60 * 60_000;

type CacheEntry = { data: unknown; expires: number };
const cache = new Map<string, CacheEntry>();
const refreshes = new Map<string, Promise<unknown>>();

export function clearPocketBaseCache() {
  cache.clear();
}

async function fetchFresh<T = unknown>(pathname: string): Promise<T> {
  const res = await fetch(`${PB_URL}${pathname}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `PocketBase isteği başarısız: GET ${pathname} -> ${res.status} ${body}`,
    );
  }
  const data = (await res.json()) as T;
  cache.set(pathname, { data, expires: Date.now() + CACHE_TTL_MS });
  return data;
}

function refreshInBackground(pathname: string) {
  if (refreshes.has(pathname)) return;
  const refresh = fetchFresh(pathname)
    .catch((error) => {
      console.warn(`[PocketBase cache] refresh failed for ${pathname}:`, error);
    })
    .finally(() => {
      refreshes.delete(pathname);
    });
  refreshes.set(pathname, refresh);
}

async function pbFetch<T = unknown>(pathname: string): Promise<T> {
  const cached = cache.get(pathname);
  const now = Date.now();
  if (cached && cached.expires > now) {
    return cached.data as T;
  }
  if (cached && cached.expires + CACHE_STALE_MS > now) {
    refreshInBackground(pathname);
    return cached.data as T;
  }

  const inflight = refreshes.get(pathname);
  if (inflight) return inflight as Promise<T>;

  const fresh = fetchFresh<T>(pathname).finally(() => {
    refreshes.delete(pathname);
  });
  refreshes.set(pathname, fresh);
  return fresh;
}

interface PbListResponse<T> {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

async function fetchAllRecords<T = any>(
  collection: string,
  params = "",
): Promise<T[]> {
  const extra = params ? `&${params}` : "";
  const all: T[] = [];
  let page = 1;
  while (true) {
    const data = await pbFetch<PbListResponse<T>>(
      `/api/collections/${collection}/records?page=${page}&perPage=200${extra}`,
    );
    all.push(...data.items);
    if (page >= data.totalPages || data.items.length === 0) break;
    page++;
  }
  return all;
}

// --- exams + exam_sessions ---

export async function getExams(): Promise<Exam[]> {
  const [examRecords, sessionRecords] = await Promise.all([
    fetchAllRecords<any>("exams", "sort=order"),
    fetchAllRecords<any>("exam_sessions", "sort=order"),
  ]);

  const sessionsByExamId = new Map<string, ExamSession[]>();
  for (const s of sessionRecords) {
    const list = sessionsByExamId.get(s.exam) || [];
    list.push({
      slug: s.slug,
      name: s.name,
      targetDate: s.targetDate,
      countdownLabel: s.countdownLabel,
      isEstimated: !!s.isEstimated,
    });
    sessionsByExamId.set(s.exam, list);
  }

  return examRecords.map(
    (e: any): Exam => ({
      slug: e.slug,
      name: e.name,
      h1: e.h1,
      heroDescription: e.heroDescription,
      targetDate: e.targetDate,
      countdownLabel: e.countdownLabel,
      isEstimated: !!e.isEstimated,
      detailCta: e.detailCta || undefined,
      sessions: sessionsByExamId.get(e.id) || [],
      featureTitle: e.featureTitle || undefined,
      featureDescription: e.featureDescription || undefined,
      guideTitle: e.guideTitle || undefined,
      guideParagraphs: e.guideParagraphs || [],
      nextExamDescription: e.nextExamDescription || undefined,
    }),
  );
}

export async function getExamBySlug(slug: string): Promise<Exam | undefined> {
  const exams = await getExams();
  return exams.find((e) => e.slug === slug);
}

// --- posts ---

export interface Post {
  slug: string;
  title: string;
  category?: string;
  excerpt?: string;
  contentHtml: string;
  authorName?: string;
  tags?: string[];
  coverImage?: string;
  coverImageAlt?: string;
  publishedAt?: string;
}

function firstPocketBaseFile(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" && value[0] ? value[0] : undefined;
  }
  return typeof value === "string" && value ? value : undefined;
}

function resolvePocketBaseFileUrl(record: any, fieldName: string) {
  const fileName = firstPocketBaseFile(record?.[fieldName]);
  if (!fileName) return undefined;
  if (/^(?:https?:)?\/\//i.test(fileName) || fileName.startsWith("/")) {
    return fileName;
  }

  const collection = record.collectionName || record.collectionId;
  if (!collection || !record.id) return fileName;

  return `${PB_URL}/api/files/${collection}/${record.id}/${encodeURIComponent(fileName)}`;
}

function normalizeImageAlt(record: any) {
  const explicitAlt =
    record.coverImageAlt || record.imageAlt || record.coverAlt || record.alt;
  if (typeof explicitAlt === "string" && explicitAlt.trim()) {
    return explicitAlt.trim();
  }
  return record.title ? `${record.title} kapak görseli` : undefined;
}

function normalizeAuthorName(authorName?: string) {
  if (!authorName) return undefined;
  const replacements: Record<string, string> = {
    "Rehberlik Servisi": "Kaynak Editörü",
    "Eğitim Danışmanı": "Eğitim Editörü",
    "Kariyer Danışmanı": "Kariyer Editörü",
    "Psikolojik Danışman": "Psikoloji Editörü",
  };
  return replacements[authorName] || authorName;
}

export async function getPosts(): Promise<Post[]> {
  // Koleksiyonun listRule'u zaten status = "" || status = "published" olduğu
  // için taslaklar (draft) PocketBase tarafından otomatik filtrelenir.
  const records = await fetchAllRecords<any>("posts", "sort=-publishedAt");
  return records.map(
    (p: any): Post => ({
      slug: p.slug,
      title: p.title,
      category: p.category || undefined,
      excerpt: p.excerpt || undefined,
      contentHtml: p.contentHtml || "",
      authorName: normalizeAuthorName(p.authorName),
      tags: p.tags || [],
      coverImage: resolvePocketBaseFileUrl(p, "coverImage"),
      coverImageAlt: normalizeImageAlt(p),
      publishedAt: p.publishedAt || undefined,
    }),
  );
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug);
}

// --- faqs ---

export interface Faq {
  question: string;
  answer: string;
}

export async function getFaqs(): Promise<Faq[]> {
  const records = await fetchAllRecords<any>("faqs", "sort=order");
  return records.map(
    (f: any): Faq => ({ question: f.question, answer: f.answer }),
  );
}

// --- pages ---

export interface PageContent {
  title: string;
  description?: string;
  contentHtml: string;
}

export async function getPageBySlug(
  slug: string,
): Promise<PageContent | undefined> {
  const records = await fetchAllRecords<any>("pages");
  const found = records.find((p: any) => p.slug === slug);
  if (!found) return undefined;
  return {
    title: found.title,
    description: found.description || "",
    contentHtml: found.contentHtml || "",
  };
}

export async function getAllPageSlugs(): Promise<string[]> {
  const records = await fetchAllRecords<any>("pages");
  return records.map((p: any) => p.slug);
}

// --- settings ---

export interface Settings {
  homepage_seo_title: string;
  homepage_seo_description: string;
}

function normalizeSettingsDescription(description?: string) {
  return (description || "").replace("rehberleri inceleyin", "kaynakları inceleyin");
}

export async function getSettings(): Promise<Settings> {
  const records = await fetchAllRecords<any>("settings");
  const s = records[0];
  return {
    homepage_seo_title: s?.homepage_seo_title || "",
    homepage_seo_description: normalizeSettingsDescription(s?.homepage_seo_description),
  };
}

// --- subjects ---

export interface Subject {
  examSlug: string;
  slug: string;
  name: string;
}

export async function getSubjects(): Promise<Subject[]> {
  const records = await fetchAllRecords<any>(
    "subjects",
    "sort=order&expand=exam",
  );
  return records
    .filter((s: any) => s.expand?.exam)
    .map(
      (s: any): Subject => ({
        examSlug: s.expand.exam.slug,
        slug: s.slug,
        name: s.name,
      }),
    );
}

// --- topic_distributions ---

export interface TopicDistribution {
  examSlug: string;
  subjectSlug: string;
  subjectName: string;
  topicName: string;
  year: number;
  questionCount: number;
  importance?: string;
}

export async function getTopicDistributions(): Promise<TopicDistribution[]> {
  const records = await fetchAllRecords<any>(
    "topic_distributions",
    "expand=exam,subject",
  );
  return records
    .filter((d: any) => d.expand?.exam && d.expand?.subject)
    .map(
      (d: any): TopicDistribution => ({
        examSlug: d.expand.exam.slug,
        subjectSlug: d.expand.subject.slug,
        subjectName: d.expand.subject.name,
        topicName: d.topicName,
        year: d.year,
        questionCount: d.questionCount,
        importance: d.importance || "normal",
      }),
    );
}
