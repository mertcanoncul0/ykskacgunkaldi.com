// Replaces new_ui/ana_sayfa_saya_final's fictional "Haftalık Deneme / Akademi
// Bülten / Mobil Uygulama" three-column row — none of those three things
// exist on this site (no mock-exam booking system, no newsletter backend, no
// mobile app), so they'd be fabricated UI promising functionality that
// doesn't work. Same three-column editorial rhythm, pointed at the three
// real tools the site actually has instead.
import { Icon } from "../lib/icons";

const links = [
  {
    label: "YKS Sayacı",
    href: "/yks-kac-gun-kaldi",
    icon: "timer",
    body: "YKS, TYT ve AYT oturumlarına kalan süreyi canlı sayaçla takip edin.",
    description: "YKS sayacı sayfasını incele",
  },
  {
    label: "Puan Hesaplama",
    href: "/puan-hesaplama/yks",
    icon: "calculate",
    body: "TYT, AYT, LGS, DGS, ALES ve KPSS için puanınızı saniyeler içinde hesaplayın.",
    description: "Puan hesaplama aracını incele",
  },
  {
    label: "Konu Dağılımı",
    href: "/konu-dagilimi/tyt",
    icon: "bar_chart",
    body: "TYT ve AYT konu dağılımlarını inceleyerek çalışma önceliklerinizi belirleyin.",
    description: "TYT konu dağılımı sayfasını incele",
  },
  {
    label: "Sınav Rehberi",
    href: "/rehberler",
    icon: "school",
    body: "Sayaç, puan hesaplama, çalışma programı ve blog kaynaklarına tek merkezden ulaşın.",
    description: "Sınav rehberi ve ücretsiz kaynakları incele",
  },
] as const;

export function QuickLinks() {
  return (
    <section className="mb-section-gap">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-border-subtle border border-border-subtle">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="group flex flex-col bg-surface-container-lowest p-7 hover:bg-surface-container-high transition-colors"
            aria-label={l.description}
            title={l.description}
          >
            <span className="inline-flex h-12 w-12 items-center justify-center bg-primary text-on-primary mb-6 transition-transform duration-300 group-hover:scale-105">
              <Icon name={l.icon} size={24} />
            </span>
            <h3 className="font-headline-md text-headline-md mb-3">{l.label}</h3>
            <p className="font-body-md text-text-muted text-sm mb-6 flex-1">{l.body}</p>
            <span className="inline-flex items-center gap-2 font-label-md text-label-md text-primary uppercase tracking-wide">
              İncele
              <Icon name="north_east" size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
