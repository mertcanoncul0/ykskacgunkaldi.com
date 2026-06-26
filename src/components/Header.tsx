import { useEffect, useRef, useState } from "react";
import { scoreCalculatorMenu } from "../data/score-calculators";
import { homeSelectionLandingPaths } from "../data/exam-landing-pages";
import { site, socialLinks } from "../lib/site";
import { Icon } from "../lib/icons";
import { getUser, logout, type AuthUser } from "../lib/auth";
import { getRecentSearches, addRecentSearch, clearRecentSearches } from "../lib/recent-searches";

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
  { to: "/rehberler", label: "Sınav Rehberi" },
  { to: "/hakkimizda", label: "Hakkımızda" },
] as const;

const popularSearches = [
  "YKS kaç gün kaldı",
  "TYT puan hesaplama",
  "AYT konu dağılımı",
  "YKS çalışma programı",
  "Deneme net takip",
] as const;

const searchQuickLinks = [
  { label: "Sınav Takvimi", href: "/sinavlar", icon: "calendar_month" },
  { label: "Puan Hesaplama", href: "/puan-hesaplama/yks", icon: "calculate" },
  { label: "Blog & Rehber", href: "/blog", icon: "article" },
  { label: "Sınav Rehberi", href: "/rehberler", icon: "school" },
] as const;

type OpenMenu = null | "exams" | "calc" | "mobile" | "search" | "account";
type HeaderExam = {
  slug: string;
  name: string;
};

// Soldan sağa büyüyen animasyonlu alt çizgi — hem <a> hem <button> için ortak.
// Çizgi metnin hemen altında (-bottom-1) konumlanır; kutu yüksekliğini
// değiştirmediği için öğeler dikeyde tam ortada kalır.
const underline =
  "relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:bg-primary after:transition-transform after:duration-300 after:ease-out after:content-['']";

const linkClass = (active: boolean) =>
  `${underline} font-label-md text-label-md transition-colors duration-200 ${
    active
      ? "text-primary font-bold after:scale-x-100"
      : "text-text-muted hover:text-primary after:scale-x-0 hover:after:scale-x-100"
  }`;

const triggerClass = (active: boolean) =>
  `${underline} flex items-center gap-1 font-label-md text-label-md transition-colors duration-200 ${
    active
      ? "text-primary font-bold after:scale-x-100"
      : "text-text-muted hover:text-primary after:scale-x-0 hover:after:scale-x-100"
  }`;

const actionBtn =
  "inline-flex h-10 w-10 items-center justify-center text-text-muted hover:text-primary transition-colors duration-200";

// lucide-react 1.x marka ikonlarını (Facebook/Twitter/Instagram/TikTok/YouTube)
// telif nedeniyle kaldırdı; bu yüzden inline SVG olarak tutuyoruz.
function SocialIcon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true as const };
  switch (name) {
    case "facebook":
      return (
        <svg {...common} fill="currentColor">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      );
    case "twitter":
      return (
        <svg {...common} fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common} fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2-2.75v-3.5a6.33 6.33 0 1 0 5.45 6.25V8.72a8.16 8.16 0 0 0 4.77 1.52V6.69Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Header({ exams = [] }: { exams?: HeaderExam[] }) {
  const [open, setOpen] = useState<OpenMenu>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const rootRef = useRef<HTMLElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  // Oturum durumunu mount'ta cookie'den oku.
  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setOpen(null);
    window.location.href = "/";
  };

  // Arama formu gönderimi: overlay'i kapatmak yerine /arama'ya yönlendir.
  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q") || "").toString().trim();
    if (q) addRecentSearch(q);
    window.location.href = q ? `/arama?q=${encodeURIComponent(q)}` : "/arama";
  };

  // Arama overlay'i açıldığında son aramaları yükle.
  useEffect(() => {
    if (open === "search") setRecent(getRecentSearches());
  }, [open]);

  // Tam ekran arama: Tab odak tuzağı + kapanınca odağı tetikleyene geri ver.
  useEffect(() => {
    if (open !== "search") return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const panel = searchPanelRef.current;
      if (!panel) return;
      const f = panel.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open]);

  // Arama önerilerinde ok tuşlarıyla gezinme.
  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>("[data-search-item]") ?? []
    );
    if (!items.length) return;
    e.preventDefault();
    const idx = items.indexOf(document.activeElement as HTMLElement);
    let next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    items[next]?.focus();
  };

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Hesabım";

  // Sidebar açık durumunu body sınıfı ile senkronize et.
  useEffect(() => {
    setSidebarOpen(document.body.classList.contains("sidebar-open"));
  }, []);

  // Tam ekran arama açıkken arka plan kaymasını kilitle.
  useEffect(() => {
    document.body.style.overflow = open === "search" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    document.body.classList.toggle("sidebar-open", next);
    try {
      localStorage.setItem("sidebar-open", String(next));
    } catch {}
  };

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
  const closeHoverMenu = () => {
    setOpen((cur) => (cur === "exams" || cur === "calc" ? null : cur));
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-border-subtle"
      ref={rootRef}
      onMouseLeave={closeHoverMenu}
    >
      <nav className="relative flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-[1440px] mx-auto h-16">
        {/* Sol: aside aç/kapa hamburgeri (yalnız masaüstü) + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden hdr:inline-flex h-10 w-10 items-center justify-center text-text-muted hover:text-primary transition-colors duration-200"
            aria-label={sidebarOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={sidebarOpen}
            onClick={toggleSidebar}
          >
            <Icon name={sidebarOpen ? "close" : "menu"} size={22} />
          </button>
          <a
            href="/"
            className="whitespace-nowrap font-display-lg text-[22px] sm:text-[24px] leading-none tracking-tighter text-primary uppercase font-extrabold transition-opacity hover:opacity-70"
            aria-label="Ana sayfa"
            onClick={close}
          >
            {site.name}
          </a>
        </div>

        {/* Ortadaki gezinme — logo ile sağ aksiyonlar arasında ortalanır */}
        <div className="hidden hdr:flex flex-1 items-center justify-center gap-8">
          <button
            type="button"
            className={triggerClass(open === "exams" || path.startsWith("/sinavlar") || path.endsWith("-kac-gun-kaldi"))}
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

        {/* Sağ: sosyal (≥1420, daralınca aside'a geçer) + arama. Giriş/Kayıt sol menüde. */}
        <div className="hidden hdr:flex items-center gap-1">
          <div className="hidden hdrwide:flex items-center gap-0.5 mr-2">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center text-text-muted hover:text-primary transition-colors duration-200"
                aria-label={s.label}
              >
                <SocialIcon name={s.icon} size={18} />
              </a>
            ))}
          </div>
          <button
            type="button"
            className={actionBtn}
            aria-label="Ara"
            aria-expanded={open === "search"}
            aria-controls="header-search-panel"
            onClick={() => setOpen((cur) => (cur === "search" ? null : "search"))}
          >
            <Icon name="search" size={20} title="Ara" />
          </button>
        </div>

        {/* Mobil menü butonu */}
        <button
          type="button"
          className="hdr:hidden inline-flex h-10 w-10 items-center justify-center border border-primary text-primary"
          aria-label={open === "mobile" ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open === "mobile"}
          aria-controls="header-mobile-menu"
          onClick={() => setOpen((cur) => (cur === "mobile" ? null : "mobile"))}
        >
          <Icon name={open === "mobile" ? "close" : "menu"} size={22} />
        </button>
      </nav>

      {/* Tam ekran arama */}
      {open === "search" && (
        <div
          id="header-search-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Arama"
          ref={searchPanelRef}
          className="fixed inset-0 z-[60] bg-surface-container-lowest/95 backdrop-blur-md animate-in fade-in duration-200"
          onMouseEnter={() => show("search")}
          onKeyDown={onSearchKeyDown}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="flex h-full flex-col">
            {/* Üst bar */}
            <div className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-5 flex items-center justify-between">
              <a
                href="/"
                onClick={close}
                className="font-display-lg text-[22px] leading-none tracking-tighter text-primary uppercase font-extrabold"
              >
                {site.name}
              </a>
              <button
                type="button"
                onClick={close}
                aria-label="Aramayı kapat"
                className="group inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
              >
                <span className="hidden sm:inline font-label-sm uppercase tracking-widest">Kapat</span>
                <span className="inline-flex h-11 w-11 items-center justify-center border border-border-subtle group-hover:border-primary transition-colors">
                  <Icon name="close" size={22} />
                </span>
              </button>
            </div>

            {/* Orta — arama alanı */}
            <div className="flex-1 flex items-start md:items-center overflow-y-auto">
              <div className="w-full max-w-[1000px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:-mt-16 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <form action="/arama" method="get" onSubmit={submitSearch}>
                  <label className="block font-label-sm uppercase tracking-[0.3em] text-text-muted mb-5">
                    Ne arıyorsun?
                  </label>
                  <div className="flex items-center gap-4 border-b border-border-subtle focus-within:border-primary transition-colors duration-200 pb-4">
                    <Icon name="search" size={32} className="text-primary shrink-0" />
                    <input
                      type="search"
                      name="q"
                      autoFocus
                      placeholder="Sınav, puan, konu, yazı…"
                      className="search-input flex-1 min-w-0 bg-transparent font-display-lg text-3xl md:text-5xl leading-tight placeholder:text-text-muted/40"
                    />
                  </div>
                </form>

                {/* Son aramalar */}
                {recent.length > 0 && (
                  <div className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-label-sm uppercase tracking-widest text-text-muted">Son aramalar</p>
                      <button
                        type="button"
                        onClick={() => {
                          clearRecentSearches();
                          setRecent([]);
                        }}
                        className="font-label-sm text-text-muted hover:text-primary transition-colors"
                      >
                        Temizle
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {recent.map((q) => (
                        <a
                          key={q}
                          data-search-item
                          href={`/arama?q=${encodeURIComponent(q)}`}
                          onClick={() => addRecentSearch(q)}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-border-subtle text-text-muted hover:border-primary hover:text-primary transition-colors font-label-md text-label-md"
                        >
                          <Icon name="history" size={16} />
                          {q}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popüler aramalar */}
                <div className="mt-10">
                  <p className="font-label-sm uppercase tracking-widest text-text-muted mb-4">
                    Popüler aramalar
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {popularSearches.map((q) => (
                      <a
                        key={q}
                        data-search-item
                        href={`/arama?q=${encodeURIComponent(q)}`}
                        onClick={() => addRecentSearch(q)}
                        className="px-4 py-2 border border-border-subtle text-text-muted hover:border-primary hover:text-primary transition-colors font-label-md text-label-md"
                      >
                        {q}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Hızlı bağlantılar */}
                <div className="mt-12">
                  <p className="font-label-sm uppercase tracking-widest text-text-muted mb-4">
                    Hızlı erişim
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-subtle border border-border-subtle">
                    {searchQuickLinks.map((l) => (
                      <a
                        key={l.href}
                        data-search-item
                        href={l.href}
                        onClick={close}
                        className="group flex items-center gap-4 bg-surface-container-lowest p-5 hover:bg-surface-container-high transition-colors"
                      >
                        <span className="inline-flex h-11 w-11 items-center justify-center bg-primary text-on-primary shrink-0 transition-transform duration-300 group-hover:scale-105">
                          <Icon name={l.icon} size={22} />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-label-md text-label-md text-primary">{l.label}</span>
                          <span className="font-body-md text-text-muted text-sm">Hemen incele</span>
                        </span>
                        <Icon name="arrow_forward" size={20} className="ml-auto text-text-muted group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sınavlar mega menü — calc menüsüyle aynı tasarım dili */}
      {open === "exams" && (
        <div
          id="header-exams-menu"
          className="hidden hdr:block absolute top-16 left-1/2 -translate-x-1/2 w-[680px] max-w-[calc(100vw-2rem)] bg-surface-container-lowest border border-border-subtle z-40 animate-in fade-in slide-in-from-top-2 duration-200"
          onMouseEnter={() => show("exams")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 p-2">
            {exams.map((exam) => (
              <a
                key={exam.slug}
                href={homeSelectionLandingPaths[exam.slug] || `/?sinav=${exam.slug}`}
                className="flex items-start gap-3 p-3 hover:bg-surface-container-high transition-colors"
                onClick={close}
              >
                <Icon name={examIcons[exam.slug] || "edit_document"} size={20} className="text-primary mt-0.5 shrink-0" />
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

      {/* Puan Hesaplama menü — exams menüsüyle aynı tasarım dili */}
      {open === "calc" && (
        <div
          id="header-calc-menu"
          className="hidden hdr:block absolute top-16 left-1/2 -translate-x-1/2 w-64 max-w-[calc(100vw-2rem)] bg-surface-container-lowest border border-border-subtle z-40 animate-in fade-in slide-in-from-top-2 duration-200"
          onMouseEnter={() => show("calc")}
        >
          <div className="flex flex-col p-2">
            {scoreCalculatorMenu?.map((item) => (
              <a
                key={item.slug}
                href={`/puan-hesaplama/${item.slug}`}
                className="flex items-center gap-3 p-3 hover:bg-surface-container-high transition-colors font-label-md text-label-md"
                onClick={close}
              >
                <Icon name={item.icon} size={20} className="text-primary shrink-0" />
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
          className="hdr:hidden absolute left-0 right-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border-subtle bg-surface-container-lowest"
        >
          <div className="px-margin-mobile py-5">
            <form action="/arama" method="get" className="flex items-center gap-3 border-b border-border-subtle focus-within:border-primary transition-colors pb-3 mb-5" onSubmit={submitSearch}>
              <Icon name="search" size={20} className="text-primary" />
              <input
                type="search"
                name="q"
                placeholder="Sınav, rehber veya yazı ara…"
                className="search-input flex-1 bg-transparent font-body-md placeholder:text-text-muted"
              />
            </form>

            <div className="border-b border-border-subtle pb-5">
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-text-muted mb-3">
                Sınavlar
              </p>
              <div className="grid grid-cols-1 gap-1">
                {exams.map((exam) => (
                  <a
                    key={exam.slug}
                    href={homeSelectionLandingPaths[exam.slug] || `/?sinav=${exam.slug}`}
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
              {user ? (
                <div className="mt-2 border border-border-subtle">
                  <a
                    href="/hesap"
                    className="flex items-center gap-3 px-3 py-3 border-b border-border-subtle hover:bg-surface-container-high"
                    onClick={close}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center bg-primary text-on-primary text-xs font-bold uppercase">
                      {displayName.charAt(0)}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-primary truncate">{displayName}</span>
                      <span className="font-body-md text-xs text-text-muted truncate">{user.email}</span>
                    </span>
                  </a>
                  <a
                    href="/hesap"
                    className="w-full flex items-center gap-2 px-3 py-3 font-label-md text-label-md text-primary hover:bg-surface-container-high"
                    onClick={close}
                  >
                    <Icon name="account" size={18} />
                    <span>Hesabım</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-3 text-left font-label-md text-label-md text-primary hover:bg-surface-container-high border-t border-border-subtle"
                  >
                    <Icon name="logout" size={18} />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <a
                    href="/giris"
                    className="flex items-center justify-center gap-2 border border-border-subtle px-3 py-3 font-label-md text-label-md text-primary hover:border-primary"
                    onClick={close}
                  >
                    <Icon name="login" size={18} />
                    <span>Giriş</span>
                  </a>
                  <a
                    href="/kayit"
                    className="flex items-center justify-center gap-2 bg-primary text-on-primary px-3 py-3 font-label-md text-label-md"
                    onClick={close}
                  >
                    <Icon name="person_add" size={18} />
                    <span>Kayıt</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-5 mt-5 border-t border-border-subtle">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center border border-border-subtle text-text-muted hover:border-primary hover:text-primary transition-colors"
                  aria-label={s.label}
                >
                  <SocialIcon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
