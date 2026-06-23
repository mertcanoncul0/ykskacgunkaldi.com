// Replaces new_ui/ana_sayfa_saya_final's fictional "Haftalık Deneme / Akademi
// Bülten / Mobil Uygulama" three-column row — none of those three things
// exist on this site (no mock-exam booking system, no newsletter backend, no
// mobile app), so they'd be fabricated UI promising functionality that
// doesn't work. Same three-column editorial rhythm, pointed at the three
// real tools the site actually has instead.
import { Icon } from "../lib/icons";

const links = [
  {
    label: "Sınav Takvimi",
    href: "/sinavlar",
    body: "Tüm sınavların güncel tarihlerini ve oturumlarını tek sayfada karşılaştırın.",
    description: "Sınavlar sayfasını incele",
  },
  {
    label: "Puan Hesaplama",
    href: "/puan-hesaplama/yks",
    body: "TYT, AYT, LGS, DGS, ALES ve KPSS için puanınızı saniyeler içinde hesaplayın.",
    description: "Puan hesaplama aracını incele",
  },
  {
    label: "Konu Dağılımı",
    href: "/konu-dagilimi",
    body: "Geçmiş yıllarda hangi dersten kaç soru çıktığını derslere göre inceleyin.",
    description: "Konu dağılımı sayfasını incele",
  },
] as const;

export function QuickLinks() {
  return (
    <section className="mb-section-gap">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {links.map((l) => (
          <div key={l.href} className="border-t border-black-pure pt-8">
            <h3 className="font-label-md text-label-md uppercase tracking-widest mb-6">{l.label}</h3>
            <p className="font-body-md text-text-muted mb-6">{l.body}</p>
            <a
              href={l.href}
              className="flex items-center gap-2 font-bold group"
              aria-label={l.description}
              title={l.description}
            >
              İNCELE
              <Icon name="north_east" className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
