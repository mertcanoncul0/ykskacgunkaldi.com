import { useState, useMemo, useEffect } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { InfoCards } from "./InfoCards";
import { FeatureGrid } from "./FeatureGrid";
import { SeoGuideSection } from "./SeoGuideSection";
import { FaqAccordion } from "./FaqAccordion";
import { FeaturedPosts } from "./FeaturedPosts";
import { QuickLinks } from "./QuickLinks";
import type { Post } from "../lib/pocketbase";
import { Icon } from "../lib/icons";

export function HomeClient({ exams, faqs, posts }: { exams: any[]; faqs: any[]; posts: Post[] }) {
  const [activeSlug, setActiveSlug] = useState(exams[0]?.slug || "");

  // Header'daki sınav menüsü, /sinavlar listesi ve bilgi kartları
  // "/?sinav=<slug>" linkiyle belirli bir sınavı açmayı bekliyor.
  // Statik üretim sırasında URL erişilemez, bu yüzden mount sonrası okunur.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("sinav");
    if (!slug) return;

    const examMatch = exams.find((e) => e.slug === slug);
    if (examMatch) {
      setActiveSlug(examMatch.slug);
      return;
    }

    const sessionOwner = exams.find((e) => e.sessions?.some((s: any) => s.slug === slug));
    if (sessionOwner) {
      setActiveSlug(sessionOwner.slug);
      setActiveSessionSlug(slug);
    }
  }, [exams]);

  const exam = useMemo(
    () => exams.find((e) => e.slug === activeSlug) || exams[0],
    [exams, activeSlug]
  );

  const defaultSessionSlug =
    exam?.sessions?.find((s: any) => new Date(s.targetDate).getTime() > Date.now())?.slug ||
    exam?.sessions?.[0]?.slug ||
    null;

  const [activeSessionSlug, setActiveSessionSlug] = useState<string | null>(defaultSessionSlug);

  // Sınav (ve dolayısıyla oturum listesi) değiştiğinde aktif oturumu
  // sıfırla. Not: bu bir yan etkidir, bu yüzden useMemo değil useEffect
  // kullanılır — useMemo saf değer hesaplamak için tasarlanmıştır, içinde
  // setState çağırmak React tarafından önerilmez.
  useEffect(() => {
    const querySlug = new URLSearchParams(window.location.search).get("sinav");
    if (querySlug && exam?.sessions?.some((s: any) => s.slug === querySlug)) {
      setActiveSessionSlug(querySlug);
      return;
    }
    setActiveSessionSlug(defaultSessionSlug);
  }, [exam?.slug, defaultSessionSlug, exam?.sessions]);

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
                className="flex flex-wrap justify-center border border-border-subtle mb-12 bg-white-pure p-1"
                role="tablist"
                aria-label="Sınav seçimi"
              >
                {exams.map((e) => (
                  <button
                    key={e.slug}
                    type="button"
                    role="tab"
                    aria-selected={e.slug === exam.slug ? "true" : "false"}
                    onClick={() => setActiveSlug(e.slug)}
                    className={`px-8 py-2 font-label-md text-label-md transition-all ${
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
              {exam.h1}
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
                    onClick={() => setActiveSessionSlug(s.slug)}
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
        <SeoGuideSection exam={exam} />
        <FaqAccordion faqs={faqs} />

        {posts?.length > 0 && <FeaturedPosts posts={posts} />}

        <QuickLinks />
      </div>
    </div>
  );
}
