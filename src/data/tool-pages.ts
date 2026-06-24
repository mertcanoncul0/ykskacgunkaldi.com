import type { LandingFaq, LandingLink, LandingSection } from "./exam-landing-pages";

export type ToolPageKind =
  | "yks-schedule"
  | "study-planner"
  | "trial-tracker"
  | "rank-estimator"
  | "embed-docs";

export interface ToolPageConfig {
  slug: string;
  kind: ToolPageKind;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: LandingSection[];
  faqs: LandingFaq[];
  links: LandingLink[];
}

export const toolPages: ToolPageConfig[] = [
  {
    slug: "2027-yks-takvimi",
    kind: "yks-schedule",
    h1: "2027 YKS Takvimi",
    metaTitle: "2027 YKS Takvimi | TYT, AYT, YDT Tarihleri",
    metaDescription:
      "2027 YKS takvimini, TYT, AYT ve YDT oturum tarihlerini tahmini/kesin ayrımıyla takip edin.",
    intro:
      "2027 YKS takvimi sayfası; TYT, AYT ve YDT oturumlarını, tahmini tarih uyarılarını ve hazırlık araçlarını birlikte sunar. Resmi ÖSYM kılavuzu yayımlandığında tarih ve kaynak notları güncellenmelidir.",
    sections: [
      {
        title: "Tahmini ve kesin tarih ayrımı",
        body:
          "ÖSYM resmi takvimi yayımlanmadan önce tarihleri kesin bilgi gibi sunmak güven problemi oluşturur. Bu yüzden tahmini tarihler açık rozetle gösterilir ve resmi kaynak bağlantısı ayrı tutulur.",
      },
      {
        title: "Takvimi nasıl kullanmalı?",
        body:
          "Başvuru dönemi, sınava 100 gün kala ve sınava 30 gün kala çalışma planını yeniden gözden geçirmek için ana kontrol noktalarıdır.",
      },
    ],
    faqs: [
      {
        question: "2027 YKS tarihi resmi olarak açıklandı mı?",
        answer:
          "Bu sayfadaki tarih resmi kılavuz yayımlanana kadar tahmini kabul edilmelidir.",
      },
      {
        question: "TYT, AYT ve YDT aynı hafta sonu mu yapılır?",
        answer:
          "YKS oturumları genellikle aynı hafta sonu uygulanır; kesin oturum bilgisi resmi ÖSYM takvimine göre güncellenir.",
      },
      {
        question: "Takvim değişirse sayaçlar da güncellenir mi?",
        answer:
          "Evet. Sitedeki sayaçlar merkezi sınav verisinden beslendiği için tarih güncellendiğinde ilgili sayfalar da güncellenir.",
      },
    ],
    links: [
      { label: "YKS sayacı", href: "/yks-kac-gun-kaldi", description: "2027 YKS geri sayımını takip et", icon: "timer" },
      { label: "TYT sayacı", href: "/tyt-kac-gun-kaldi", description: "TYT oturumuna kalan süreyi gör", icon: "timer" },
      { label: "AYT sayacı", href: "/ayt-kac-gun-kaldi", description: "AYT oturumuna kalan süreyi gör", icon: "timer" },
      { label: "YKS çalışma programı", href: "/yks-calisma-programi", description: "Takvime göre haftalık plan oluştur", icon: "edit_note" },
    ],
  },
  {
    slug: "yks-calisma-programi",
    kind: "study-planner",
    h1: "YKS Çalışma Programı Oluşturucu",
    metaTitle: "YKS Çalışma Programı Oluşturucu | Haftalık Plan",
    metaDescription:
      "Hedef sınav tarihine, günlük çalışma süresine ve önceliklerine göre ücretsiz YKS çalışma programı oluşturun.",
    intro:
      "Bu araç, kalan süreyi haftalara böler ve günlük çalışma saatine göre sade bir plan önerir. Üretilen plan resmi bir rehberlik programı değil; öğrencinin kendi temposunu görünür kılmasına yardımcı olan pratik bir başlangıçtır.",
    sections: [
      {
        title: "MVP çalışma mantığı",
        body:
          "Plan, TYT temel dersleri, AYT alan çalışması, deneme analizi ve tekrar bloklarını dengeli dağıtır. Öğrenci isterse öncelik alanını değiştirerek ağırlığı güncelleyebilir.",
      },
      {
        title: "Veri gizliliği",
        body:
          "Planlama tarayıcıda çalışır; girilen bilgiler sunucuya kaydedilmez.",
      },
    ],
    faqs: [
      {
        question: "Bu çalışma programı herkes için uygun mu?",
        answer:
          "Hayır. Araç genel bir başlangıç planı üretir; okul, kurs ve kişisel eksiklere göre düzenlenmelidir.",
      },
      {
        question: "Günde kaç saat çalışmalıyım?",
        answer:
          "Sabit bir sayı yoktur. Sürdürülebilir ve düzenli çalışma, kısa süreli aşırı tempodan daha değerlidir.",
      },
      {
        question: "Programı kaydedebilir miyim?",
        answer:
          "MVP sürümde plan ekranda oluşturulur; çıktı almak için tarayıcının yazdırma özelliği kullanılabilir.",
      },
    ],
    links: [
      { label: "YKS sayacı", href: "/yks-kac-gun-kaldi", description: "Hedef tarihe kalan süreyi gör", icon: "timer" },
      { label: "TYT konu dağılımı", href: "/konu-dagilimi/tyt", description: "TYT konu önceliklerini incele", icon: "bar_chart" },
      { label: "Deneme net takip", href: "/deneme-net-takip-tablosu", description: "Plan sonrası denemelerini takip et", icon: "history" },
    ],
  },
  {
    slug: "deneme-net-takip-tablosu",
    kind: "trial-tracker",
    h1: "Deneme Net Takip Tablosu",
    metaTitle: "Deneme Net Takip Tablosu | Ücretsiz Net Takibi",
    metaDescription:
      "TYT, AYT, LGS, KPSS, DGS ve ALES deneme netlerinizi tarayıcınızda kaydedin ve gelişiminizi takip edin.",
    intro:
      "Deneme sonuçlarını tek tek hatırlamak zordur. Bu araç, tarih ve sınav türüne göre netlerinizi tarayıcıda saklar, toplam net değişimini görünür hale getirir ve düzenli analiz alışkanlığı oluşturmanıza yardımcı olur.",
    sections: [
      {
        title: "Nasıl kullanılmalı?",
        body:
          "Her denemeden sonra ders netlerini girin ve kısa bir not ekleyin. Haftalık olarak toplam net değişimini ve en çok hata yapılan dersleri kontrol edin.",
      },
      {
        title: "Veri nerede saklanır?",
        body:
          "Kayıtlar yalnızca tarayıcı localStorage alanında tutulur; hesap açma veya sunucu kaydı yoktur.",
      },
    ],
    faqs: [
      {
        question: "Deneme kayıtları silinir mi?",
        answer:
          "Tarayıcı verileri temizlenirse kayıtlar silinebilir. Bu MVP sürüm yerel kullanım için tasarlanmıştır.",
      },
      {
        question: "Hangi sınavları takip edebilirim?",
        answer:
          "TYT, AYT, YKS, LGS, KPSS, DGS ve ALES denemeleri için kullanılabilir.",
      },
      {
        question: "Bu araç puan hesaplar mı?",
        answer:
          "Hayır. Net takibi için tasarlanmıştır; puan için ilgili puan hesaplama sayfalarını kullanabilirsiniz.",
      },
    ],
    links: [
      { label: "TYT puan hesaplama", href: "/puan-hesaplama/tyt", description: "Netlerini tahmini puana çevir", icon: "calculate" },
      { label: "YKS çalışma programı", href: "/yks-calisma-programi", description: "Deneme sonuçlarına göre plan oluştur", icon: "edit_note" },
      { label: "Başarı sıralaması tahmini", href: "/basari-siralamasi-tahmini", description: "Tahmini puan aralığını sıraya çevir", icon: "trending_up" },
    ],
  },
  {
    slug: "basari-siralamasi-tahmini",
    kind: "rank-estimator",
    h1: "Başarı Sıralaması Tahmini",
    metaTitle: "Başarı Sıralaması Tahmini | YKS, TYT, AYT",
    metaDescription:
      "Tahmini puanınızı ve sınav türünü seçerek yaklaşık başarı sıralaması aralığını görün.",
    intro:
      "Başarı sıralaması tahmini, hedef gerçekçiliği için faydalı olabilir; ancak resmi sonuç yerine geçmez. Bu sayfa puan hesaplama aracındaki yaklaşık modelin daha görünür, uyarılı ve kaynaklı bir kullanımını sunar.",
    sections: [
      {
        title: "Tahmin nasıl yorumlanmalı?",
        body:
          "Sıralama tahmini tek bir kesin değer yerine aralık olarak okunmalıdır. Sınavın zorluğu, aday sayısı ve standart sapma resmi sonuçları değiştirebilir.",
      },
      {
        title: "Ne zaman kullanılmalı?",
        body:
          "Deneme netleri belirli bir seviyede oturduğunda hedef bölüm aralığını görmek için kullanılabilir; tercih listesi için tek kaynak olmamalıdır.",
      },
    ],
    faqs: [
      {
        question: "Bu sıralama tahmini resmi midir?",
        answer:
          "Hayır. Sadece yaklaşık modeldir ve resmi ÖSYM sonuçlarının yerine geçmez.",
      },
      {
        question: "Puan mı sıralama mı daha önemli?",
        answer:
          "Tercih döneminde başarı sıralaması genellikle puandan daha anlamlıdır; ancak her ikisi de yıl koşullarına göre değişebilir.",
      },
      {
        question: "Tahmin neden aralık olarak gösteriliyor?",
        answer:
          "Çünkü resmi sıralama aday dağılımına bağlıdır; tek sayı yanıltıcı güven verebilir.",
      },
    ],
    links: [
      { label: "YKS puan hesaplama", href: "/puan-hesaplama/yks", description: "Önce netlerinden tahmini puan hesapla", icon: "calculate" },
      { label: "Deneme net takip", href: "/deneme-net-takip-tablosu", description: "Sıralama tahminini deneme trendiyle birlikte izle", icon: "history" },
      { label: "YKS tercih rehberi", href: "/blog/yks-tercih-donemi-rehberi", description: "Tercih listesi hazırlarken dikkat edilecekler", icon: "article" },
    ],
  },
  {
    slug: "embed-sayac",
    kind: "embed-docs",
    h1: "Ücretsiz Embed Sınav Sayacı",
    metaTitle: "Embed Sınav Sayacı | YKS, TYT, AYT Widget",
    metaDescription:
      "Eğitim siteleri için ücretsiz YKS, TYT ve AYT geri sayım iframe widget kodlarını alın.",
    intro:
      "Embed sayaç, eğitim sitelerinin kendi sayfalarında sade bir YKS, TYT veya AYT geri sayımı göstermesi için hazırlanmıştır. Amaç yapay backlink üretmek değil; isteyen sitelere hızlı, küçük ve faydalı bir widget sunmaktır.",
    sections: [
      {
        title: "Etik kullanım",
        body:
          "Attribution bağlantısı görünürdür ama manipülatif anchor metin içermez. Widget kullanan sitelerden zorunlu veya ücretli backlink talep edilmez.",
      },
      {
        title: "Performans ve güvenlik",
        body:
          "Embed sayfaları global layout, analytics ve ağır script kullanmaz; noindex olarak servis edilir ve yalnızca iframe içinde çalışacak şekilde sade tutulur.",
      },
    ],
    faqs: [
      {
        question: "Embed sayacı ücretsiz mi?",
        answer:
          "Evet. Eğitim amaçlı sayfalarda ücretsiz olarak kullanılabilir.",
      },
      {
        question: "Backlink vermek zorunlu mu?",
        answer:
          "Hayır. Widget içinde sade attribution bağlantısı bulunur; ek backlink talep edilmez.",
      },
      {
        question: "Embed sayfaları Google'da indexlenir mi?",
        answer:
          "Hayır. Widget sayfaları noindex olarak planlanmıştır; dokümantasyon sayfası ise indexlenebilir.",
      },
    ],
    links: [
      { label: "YKS widget", href: "/embed/yks-2027", description: "YKS embed sayacını önizle", icon: "timer" },
      { label: "TYT widget", href: "/embed/tyt-2027", description: "TYT embed sayacını önizle", icon: "timer" },
      { label: "AYT widget", href: "/embed/ayt-2027", description: "AYT embed sayacını önizle", icon: "timer" },
    ],
  },
];

const toolBySlug = new Map(toolPages.map((page) => [page.slug, page]));

export function getToolPage(slug: string | undefined) {
  return slug ? toolBySlug.get(slug) : undefined;
}

export const toolPagePaths = toolPages.map((page) => `/${page.slug}`);
