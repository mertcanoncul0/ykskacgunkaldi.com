import { useState, useMemo, useEffect } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { InfoCards } from "./InfoCards";
import { FeatureGrid } from "./FeatureGrid";
import { SeoGuideSection } from "./SeoGuideSection";
import { FaqAccordion } from "./FaqAccordion";
import { FeaturedPosts } from "./FeaturedPosts";
import { QuickLinks } from "./QuickLinks";
import { TrustNotice } from "./TrustNotice";
import type { Post } from "../lib/pocketbase";
import { getHomeSeo, resolveHomeSelection, type HomeSeoDefaults } from "../lib/home-seo";
import { Icon } from "../lib/icons";

const SESSION_H1_BY_SLUG: Record<string, string> = {
  tyt: "2027 TYT'ye Kaç Gün Kaldı?",
  ayt: "2027 AYT'ye Kaç Gün Kaldı?",
  ydt: "2027 YDT'ye Kaç Gün Kaldı?",
  "genel-yetenek": "2026 KPSS Genel Yetenek - Genel Kültür'e Kaç Gün Kaldı?",
  "egitim-bilimleri": "2026 KPSS Eğitim Bilimleri'ne Kaç Gün Kaldı?",
  oabt: "2026 KPSS ÖABT'ye Kaç Gün Kaldı?",
};

function getDefaultSessionSlug(exam: any) {
  return (
    exam?.sessions?.find((s: any) => new Date(s.targetDate).getTime() > Date.now())?.slug ||
    exam?.sessions?.[0]?.slug ||
    null
  );
}

function updateHeadMeta(name: string, content: string) {
  const selector = name.startsWith("og:")
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;
  const meta = document.querySelector<HTMLMetaElement>(selector);
  meta?.setAttribute("content", content);
}

function replaceSelectionUrl(selectionSlug: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("sinav", selectionSlug);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export function HomeClient({
  exams,
  faqs,
  posts,
  defaultSeo,
  initialSelectionSlug,
}: {
  exams: any[];
  faqs: any[];
  posts: Post[];
  defaultSeo: HomeSeoDefaults;
  initialSelectionSlug?: string;
}) {
  const initialSelection = resolveHomeSelection(exams, initialSelectionSlug);
  const initialExamSlug = initialSelection?.examSlug || exams[0]?.slug || "";
  const initialExam = exams.find((e) => e.slug === initialExamSlug) || exams[0];

  const [activeSlug, setActiveSlug] = useState(initialExamSlug);
  const [currentSelectionSlug, setCurrentSelectionSlug] = useState<string | null>(
    initialSelection?.selectionSlug || null,
  );
  const [activeSessionSlug, setActiveSessionSlug] = useState<string | null>(
    initialSelection?.sessionSlug || getDefaultSessionSlug(initialExam),
  );

  // Header'daki sınav menüsü, /sinavlar listesi ve bilgi kartları
  // "/?sinav=<slug>" linkiyle belirli bir sınavı açmayı bekliyor.
  // Statik üretim sırasında URL erişilemez, bu yüzden mount sonrası okunur.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("sinav");
    const selection = resolveHomeSelection(exams, slug);
    if (!selection) return;

    setCurrentSelectionSlug(selection.selectionSlug);
    setActiveSlug(selection.examSlug);
    if (selection.sessionSlug) setActiveSessionSlug(selection.sessionSlug);
  }, [exams]);

  const exam = useMemo(
    () => exams.find((e) => e.slug === activeSlug) || exams[0],
    [exams, activeSlug]
  );

  const defaultSessionSlug = getDefaultSessionSlug(exam);

  // Sınav (ve dolayısıyla oturum listesi) değiştiğinde aktif oturumu
  // sıfırla. Not: bu bir yan etkidir, bu yüzden useMemo değil useEffect
  // kullanılır — useMemo saf değer hesaplamak için tasarlanmıştır, içinde
  // setState çağırmak React tarafından önerilmez.
  useEffect(() => {
    if (currentSelectionSlug && exam?.sessions?.some((s: any) => s.slug === currentSelectionSlug)) {
      setActiveSessionSlug(currentSelectionSlug);
      return;
    }
    setActiveSessionSlug(defaultSessionSlug);
  }, [exam?.slug, defaultSessionSlug, exam?.sessions, currentSelectionSlug]);

  useEffect(() => {
    const seo = getHomeSeo(defaultSeo, exams, currentSelectionSlug);
    const canonicalUrl = `${window.location.origin}${seo.canonicalPath}`;
    document.title = seo.title;
    updateHeadMeta("description", seo.description);
    updateHeadMeta("og:title", seo.title);
    updateHeadMeta("og:description", seo.description);
    updateHeadMeta("og:url", canonicalUrl);
    updateHeadMeta("twitter:title", seo.title);
    updateHeadMeta("twitter:description", seo.description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
  }, [currentSelectionSlug, defaultSeo, exams]);

  const selectExam = (slug: string) => {
    setActiveSlug(slug);
    setCurrentSelectionSlug(slug);
    replaceSelectionUrl(slug);
  };

  const selectSession = (slug: string) => {
    setActiveSessionSlug(slug);
    setCurrentSelectionSlug(slug);
    replaceSelectionUrl(slug);
  };

  if (!exam) {
    return (
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap text-center">
        <h1 className="font-headline-lg text-headline-lg mb-4">Yayınlanmış sınav bulunamadı.</h1>
        <p className="text-text-muted">Sınav listesi yüklenirken bir sorun oluştu.</p>
      </section>
    );
  }

  const activeSession =
    exam.sessions?.find((s: any) => s.slug === activeSessionSlug) || exam.sessions?.[0];
  const displayH1 =
    currentSelectionSlug && currentSelectionSlug === activeSession?.slug
      ? SESSION_H1_BY_SLUG[activeSession.slug] || `${exam.name} ${activeSession.name} Kaç Gün Kaldı?`
      : exam.h1;
  const targetDate = activeSession?.targetDate || exam.targetDate;
  const countdownLabel = activeSession?.countdownLabel || exam.countdownLabel;

  return (
    <div className="px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        {/* Hero Countdown Section */}
        <section className="pt-8 mb-section-gap">
          <div className="flex flex-col items-center text-center">
            {exams.length > 1 && (
              <div
                className="inline-flex flex-wrap justify-center gap-1 border border-border-subtle mb-12 bg-white-pure p-1.5"
                role="tablist"
                aria-label="Sınav seçimi"
              >
                {exams.map((e) => (
                  <button
                    key={e.slug}
                    type="button"
                    role="tab"
                    aria-selected={e.slug === exam.slug ? "true" : "false"}
                    onClick={() => selectExam(e.slug)}
                    className={`px-5 py-2 font-label-md text-label-md transition-colors ${
                      e.slug === exam.slug
                        ? "bg-primary text-on-primary"
                        : "hover:bg-surface-container-low text-text-muted"
                    }`}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            )}

            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-6 uppercase tracking-tighter">
              {displayH1}
            </h1>

            {exam.sessions && exam.sessions.length > 1 && (
              <div
                className="flex flex-wrap justify-center gap-2 mb-8"
                role="tablist"
                aria-label="Sınav oturumu seçimi"
              >
                {exam.sessions.map((s: any) => (
                  <button
                    key={s.slug}
                    type="button"
                    role="tab"
                    aria-selected={s.slug === activeSession?.slug ? "true" : "false"}
                    onClick={() => selectSession(s.slug)}
                    className={`px-5 py-1.5 font-label-sm text-label-sm uppercase tracking-widest border transition-colors ${
                      s.slug === activeSession?.slug
                        ? "border-primary bg-primary text-on-primary"
                        : "border-border-subtle text-text-muted hover:border-primary"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            <CountdownTimer
              targetDate={targetDate}
              label={countdownLabel}
              isEstimated={activeSession?.isEstimated ?? exam.isEstimated}
            />

            <p className="font-body-lg text-body-lg max-w-2xl text-text-muted mt-12">
              {exam.heroDescription}
            </p>

            <a
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 mt-8 font-label-md text-label-md uppercase tracking-widest border border-primary hover:bg-surface-container-highest hover:text-primary transition-colors duration-300"
              href="https://www.osym.gov.tr/tr%2C15164/yks-cikmis-sorular.html"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Çıkmış Soruları Çöz
              <Icon name="north_east" size={18} />
            </a>
          </div>
        </section>

        <InfoCards exam={exam} />
        <FeatureGrid exam={exam} />
        <TrustNotice />
        <SeoGuideSection exam={exam} />
        <FaqAccordion faqs={faqs} />

        {posts?.length > 0 && <FeaturedPosts posts={posts} />}

        <QuickLinks />
      </div>
    </div>
  );
}
