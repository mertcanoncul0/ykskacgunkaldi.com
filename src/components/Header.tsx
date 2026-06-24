import { useEffect, useRef, useState } from "react";
import { scoreCalculatorMenu } from "../data/score-calculators";
import { site } from "../lib/site";
import { Icon } from "../lib/icons";

const examIcons: Record<string, string> = {
  yks: "school",
  lgs: "menu_book",
  dgs: "trending_up",
  kpss: "work",
  ales: "psychology",
  msu: "military_tech",
};

const examDescriptions: Record<string, string> = {
  yks: "Yükseköğretim Kurumları Sınavı hazırlık materyalleri ve detayları.",
  lgs: "Liselere Geçiş Sistemi denemeleri, çıkmış sorular ve konu anlatımları.",
  dgs: "Dikey Geçiş Sınavı ile lisans tamamlama rehberi ve dokümanları.",
  kpss: "Kamu Personeli Seçme Sınavı memurluk rehberi ve hazırlık testleri.",
  ales: "Akademik Personel ve Lisansüstü Eğitim Giriş Sınavı kaynakları.",
  msu: "Milli Savunma Üniversitesi askeri öğrenci seçme sınavı içerikleri.",
};

const examLabels: Record<string, string> = {
  yks: "YKS (TYT - AYT - YDT)",
};

const mainLinks = [
  { to: "/rehberler", label: "Rehberlik" },
  { to: "/hakkimizda", label: "Hakkımızda" },
] as const;

type OpenMenu = null | "exams" | "calc" | "mobile";

const linkClass = (active: boolean) =>
  active
    ? "text-primary border-b-2 border-primary font-bold pb-2 font-label-md text-label-md transition-colors duration-200"
    : "text-text-muted hover:text-primary font-label-md text-label-md pb-2 transition-colors duration-200";

const triggerClass = (active: boolean) =>
  `flex items-center gap-1 ${active
    ? "text-primary border-b-2 border-primary font-bold pb-2"
    : "text-text-muted hover:text-primary pb-2"} font-label-md text-label-md transition-colors duration-200`;

export function Header({ exams = [] }: { exams?: any[] }) {
  const [open, setOpen] = useState<OpenMenu>(null);
  const rootRef = useRef<HTMLElement>(null);
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(null);
  const show = (k: OpenMenu) => setOpen(k);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-border-subtle"
      ref={rootRef}
      onMouseLeave={close}
    >
      <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto h-16">
        <a
          href="/"
          className="font-display-lg text-[22px] sm:text-[24px] tracking-tighter text-primary uppercase font-extrabold"
          aria-label="Ana sayfa"
          onClick={close}
        >
          {site.name}
        </a>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center border border-primary text-primary"
          aria-label={open === "mobile" ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open === "mobile"}
          aria-controls="header-mobile-menu"
          onClick={() => setOpen((cur) => (cur === "mobile" ? null : "mobile"))}
        >
          <Icon name={open === "mobile" ? "close" : "menu"} size={22} />
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button
            type="button"
            className={triggerClass(open === "exams" || path.startsWith("/sinavlar"))}
            aria-expanded={open === "exams"}
            aria-haspopup="true"
            aria-controls="header-exams-menu"
            onMouseEnter={() => show("exams")}
            onClick={() => show("exams")}
          >
            Sınavlar
            <Icon name="expand_more" size={18} />
          </button>

          <button
            type="button"
            className={triggerClass(open === "calc" || path.startsWith("/puan-hesaplama"))}
            aria-expanded={open === "calc"}
            aria-haspopup="true"
            aria-controls="header-calc-menu"
            onMouseEnter={() => show("calc")}
            onClick={() => show("calc")}
          >
            Puan Hesaplama
            <Icon name="expand_more" size={18} />
          </button>

          <a
            href="/blog"
            className={linkClass(path === "/blog" || path.startsWith("/blog/"))}
            aria-current={path === "/blog" || path.startsWith("/blog/") ? "page" : undefined}
            onClick={close}
          >
            Blog
          </a>

          {mainLinks.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className={linkClass(path.startsWith(l.to))}
              aria-current={path.startsWith(l.to) ? "page" : undefined}
              onClick={close}
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Exams mega menu */}
      {open === "exams" && (
        <div
          id="header-exams-menu"
          className="absolute left-0 right-0 top-16 bg-surface-container-lowest border-b-2 border-primary z-40"
          onMouseEnter={() => show("exams")}
        >
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 grid grid-cols-1 md:grid-cols-2 gap-2">
            {exams.map((exam) => (
              <a
                key={exam.slug}
                href={`/?sinav=${exam.slug}`}
                className="flex items-start gap-4 p-4 hover:bg-surface-container-high transition-colors"
                onClick={close}
              >
                <Icon name={examIcons[exam.slug] || "edit_document"} className="text-primary" />
                <span className="flex flex-col">
                  <strong className="font-label-md text-label-md text-primary">
                    {examLabels[exam.slug] || exam.name}
                  </strong>
                  <small className="font-body-md text-text-muted text-sm">
                    {examDescriptions[exam.slug] || "Sınav detayları"}
                  </small>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Calculator menu */}
      {open === "calc" && (
        <div
          id="header-calc-menu"
          className="absolute right-0 md:right-auto top-16 md:left-1/2 bg-surface-container-lowest border-2 border-primary z-40 w-full md:w-64"
          onMouseEnter={() => show("calc")}
        >
          <div className="flex flex-col py-2">
            {scoreCalculatorMenu?.map((item) => (
              <a
                key={item.slug}
                href={`/puan-hesaplama/${item.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors font-label-md text-label-md"
                onClick={close}
              >
                <Icon name={item.icon} size={20} className="text-primary" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open === "mobile" && (
        <div
          id="header-mobile-menu"
          className="md:hidden absolute left-0 right-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b-2 border-primary bg-surface-container-lowest"
        >
          <div className="px-margin-mobile py-5">
            <div className="border-b border-border-subtle pb-5">
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-text-muted mb-3">
                Sınavlar
              </p>
              <div className="grid grid-cols-1 gap-1">
                {exams.map((exam) => (
                  <a
                    key={exam.slug}
                    href={`/?sinav=${exam.slug}`}
                    className="flex items-center justify-between gap-3 px-3 py-3 font-label-md text-label-md text-primary hover:bg-surface-container-high"
                    onClick={close}
                  >
                    <span>{examLabels[exam.slug] || exam.name}</span>
                    <Icon name="chevron_right" size={18} className="text-text-muted" />
                  </a>
                ))}
              </div>
            </div>

            <div className="border-b border-border-subtle py-5">
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-text-muted mb-3">
                Puan Hesaplama
              </p>
              <div className="grid grid-cols-1 gap-1">
                {scoreCalculatorMenu?.map((item) => (
                  <a
                    key={item.slug}
                    href={`/puan-hesaplama/${item.slug}`}
                    className="flex items-center justify-between gap-3 px-3 py-3 font-label-md text-label-md text-primary hover:bg-surface-container-high"
                    onClick={close}
                  >
                    <span>{item.label}</span>
                    <Icon name={item.icon} size={18} className="text-text-muted" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 pt-5">
              <a
                href="/blog"
                className="px-3 py-3 font-label-md text-label-md text-primary hover:bg-surface-container-high"
                onClick={close}
              >
                Blog
              </a>
              {mainLinks.map((l) => (
                <a
                  key={l.to}
                  href={l.to}
                  className="px-3 py-3 font-label-md text-label-md text-primary hover:bg-surface-container-high"
                  onClick={close}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
