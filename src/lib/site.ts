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

export const footerLinkGroups = [
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
