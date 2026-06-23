export const site = {
  name: "YKS Kaç Gün Kaldı",
  url: "https://ykskacgunkaldi.com",
  defaultTitle:
    "YKS Kaç Gün Kaldı? | Canlı YKS Sayacı ve Sınav Hazırlık Rehberi",
  defaultDescription:
    "YKS kaç gün kaldı sorusunun yanıtını canlı sayaçla takip et. TYT, AYT, DGS, LGS, KPSS ve ALES için sınav tarihleri, konu dağılımlarını incele.",
  ogImage: "/og-image.png",
  logo: "/logo.png",
  themeColor: "#000000",
  locale: "tr_TR",
  twitterHandle: "@ykskacgunkaldi",
} as const;

// Not: Daha önce burada ayrı bir `headerLinks` listesi de vardı ama hiçbir
// dosyada import edilmiyordu (Header.tsx kendi `mainLinks` dizisini ve
// aşağıdaki `hubLinks`'i kullanıyor) — ölü kod olduğu için kaldırıldı.
export const hubLinks = [
  { label: "Sınav Takvimi", href: "/sinavlar", icon: "calendar_month" },
  { label: "Popüler Yazılar", href: "/populer-yazilar", icon: "trending_up" },
  { label: "Rehberlik", href: "/rehberler", icon: "school" },
  { label: "İlanlar", href: "/ilanlar", icon: "ads_click" },
] as const;

// "Sınavlar" grubu: header'daki mobil hamburger menü (ve içindeki açılır
// panel) kullanıcı talebiyle kaldırıldığı için, küçük ekranlarda (<768px)
// header artık sadece logo gösteriyor — Sınavlar/Puan Hesaplama/Blog/
// Rehberlik gibi birincil gezinme hedeflerine mobilde ulaşmanın tek yolu
// bu footer grubu (footer her sayfada, her breakpoint'te görünür, bkz.
// Footer.tsx — `hidden` sınıfı yok). Masaüstü/tablet (≥768px) zaten üst
// menüden, ≥1024px ayrıca SideNav'dan da bu sayfalara ulaşabiliyor.
export const footerLinkGroups = [
  {
    title: "Sınavlar",
    links: [
      { label: "Sınav Takvimi", href: "/sinavlar" },
      { label: "Puan Hesaplama", href: "/puan-hesaplama/yks" },
      { label: "Konu Dağılımı", href: "/konu-dagilimi" },
      { label: "Blog", href: "/blog" },
      { label: "Rehberlik", href: "/rehberler" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "İletişim", href: "/iletisim" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
      { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
    ],
  },
] as const;
