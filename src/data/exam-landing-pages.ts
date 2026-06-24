export interface LandingLink {
  label: string;
  href: string;
  description: string;
  icon?: string;
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingSection {
  title: string;
  body: string;
}

export interface CountdownRef {
  examSlug: string;
  sessionSlug?: string;
  label?: string;
}

export interface ExamLandingPageConfig {
  slug: string;
  switchLabel?: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sourceNote: string;
  primaryCountdown: CountdownRef;
  secondaryCountdowns?: CountdownRef[];
  sections: LandingSection[];
  faqs: LandingFaq[];
  links: LandingLink[];
}

export const examLandingPages: ExamLandingPageConfig[] = [
  {
    slug: "yks-kac-gun-kaldi",
    switchLabel: "YKS",
    h1: "2027 YKS'ye Kaç Gün Kaldı?",
    metaTitle: "2027 YKS Kaç Gün Kaldı? Canlı Sayaç",
    metaDescription:
      "2027 YKS, TYT, AYT ve YDT oturumlarına kalan süreyi canlı sayaçla takip edin.",
    intro:
      "YKS hazırlığında zaman planı yalnızca sınav gününü bilmekten ibaret değildir. TYT, AYT ve YDT oturumlarının her biri farklı çalışma temposu ister; bu sayfa kalan süreyi, oturum ayrımını ve kullanabileceğiniz temel hazırlık araçlarını tek yerde toplar. 2027 tarihi resmi kılavuz yayımlanana kadar tahmini olarak gösterilir ve kesinleştiğinde güncellenir.",
    sourceNote:
      "2027 YKS tarihi resmi olarak açıklanana kadar önceki yılların ÖSYM takvim düzenine göre tahmini gösterilir.",
    primaryCountdown: { examSlug: "yks", label: "YKS 2027" },
    secondaryCountdowns: [
      { examSlug: "yks", sessionSlug: "tyt", label: "TYT 2027" },
      { examSlug: "yks", sessionSlug: "ayt", label: "AYT 2027" },
      { examSlug: "yks", sessionSlug: "ydt", label: "YDT 2027" },
    ],
    sections: [
      {
        title: "YKS planı nasıl okunmalı?",
        body:
          "TYT tüm adaylar için ortak temel oturumdur; AYT ve YDT ise hedeflenen puan türüne göre ağırlık kazanır. Kalan süreyi haftalara bölerek önce konu eksiklerini, sonra deneme analizini, en sonda da tekrar rutinini planlamak daha sağlıklı olur.",
      },
      {
        title: "Bu sayfayı ne zaman kontrol etmelisiniz?",
        body:
          "ÖSYM takvimi açıklandığında, başvuru dönemi başladığında, sınava 100 gün ve 30 gün kaldığında bu sayfa çalışma takvimini güncellemek için iyi bir kontrol noktasıdır.",
      },
    ],
    faqs: [
      {
        question: "2027 YKS tarihi kesin mi?",
        answer:
          "Hayır. Resmi ÖSYM kılavuzu yayımlanana kadar 2027 YKS tarihi tahmini olarak gösterilir.",
      },
      {
        question: "TYT ve AYT aynı gün mü yapılır?",
        answer:
          "Genellikle TYT cumartesi, AYT ve YDT pazar günü uygulanır. Resmi yıl takvimi açıklandığında oturum tarihleri güncellenir.",
      },
      {
        question: "YKS hazırlığında hangi aracı önce kullanmalıyım?",
        answer:
          "Önce konu dağılımı ile eksikleri belirleyin, sonra çalışma programı ve puan hesaplama aracını düzenli takip için kullanın.",
      },
    ],
    links: [
      { label: "TYT sayacı", href: "/tyt-kac-gun-kaldi", description: "TYT oturumuna özel geri sayım", icon: "timer" },
      { label: "AYT sayacı", href: "/ayt-kac-gun-kaldi", description: "AYT oturumuna özel geri sayım", icon: "timer" },
      { label: "YDT sayacı", href: "/ydt-kac-gun-kaldi", description: "YDT oturumuna özel geri sayım", icon: "timer" },
      { label: "YKS puan hesaplama", href: "/puan-hesaplama/yks", description: "TYT, AYT, YDT ve OBP ile tahmini puan hesapla", icon: "calculate" },
      { label: "2027 YKS takvimi", href: "/2027-yks-takvimi", description: "Tahmini ve kesinleşen tarihleri birlikte takip et", icon: "calendar_month" },
      { label: "YKS çalışma programı", href: "/yks-calisma-programi", description: "Haftalık çalışma planı oluştur", icon: "edit_note" },
    ],
  },
  {
    slug: "tyt-kac-gun-kaldi",
    switchLabel: "TYT",
    h1: "2027 TYT'ye Kaç Gün Kaldı?",
    metaTitle: "TYT Kaç Gün Kaldı? 2027 Canlı Sayaç",
    metaDescription:
      "TYT'ye kalan süreyi görün, TYT puan hesaplama ve konu dağılımı ile plan yapın.",
    intro:
      "TYT, YKS sürecinin ortak oturumudur ve temel yeterlilikleri ölçtüğü için erken dönemde düzenli takip gerektirir. Bu sayfa yalnızca kalan günü göstermek için değil; Türkçe, temel matematik, sosyal bilimler ve fen bilimleri çalışmalarını doğru araçlarla bağlamak için hazırlandı. Tarih resmi olarak açıklanana kadar tahmini ibaresi korunur.",
    sourceNote:
      "2027 TYT tarihi resmi ÖSYM takvimi yayımlanana kadar tahmini olarak gösterilir.",
    primaryCountdown: { examSlug: "yks", sessionSlug: "tyt", label: "TYT 2027" },
    sections: [
      {
        title: "TYT için kalan süre nasıl kullanılmalı?",
        body:
          "İlk aşamada temel konu eksiklerini kapatın, ardından her hafta süreli deneme ve yanlış analizi ekleyin. TYT netleri yavaş ama istikrarlı yükseldiği için küçük haftalık hedefler daha gerçekçi sonuç verir.",
      },
      {
        title: "TYT verilerini nasıl takip etmelisiniz?",
        body:
          "Puan hesaplama aracı netlerin puana etkisini, konu dağılımı ise hangi derslerde ağırlık vermeniz gerektiğini gösterir. Deneme netlerini ayrı kaydetmek gelişimi görmeyi kolaylaştırır.",
      },
    ],
    faqs: [
      {
        question: "TYT kaç sorudan oluşur?",
        answer:
          "TYT; Türkçe, sosyal bilimler, temel matematik ve fen bilimleri testlerinden oluşan 120 soruluk bir oturumdur.",
      },
      {
        question: "TYT puanı tek başına yeterli olur mu?",
        answer:
          "Ön lisans programları ve bazı özel koşullar için TYT puanı kullanılır; lisans hedefleyen adayların çoğu AYT puanına da ihtiyaç duyar.",
      },
      {
        question: "TYT tarihi kesin değilse ne yapmalıyım?",
        answer:
          "Tahmini tarih üzerinden plan yapabilir, resmi ÖSYM takvimi açıklandığında çalışma programınızı güncelleyebilirsiniz.",
      },
    ],
    links: [
      { label: "TYT puan hesaplama", href: "/puan-hesaplama/tyt", description: "TYT netlerinden tahmini puan hesapla", icon: "calculate" },
      { label: "TYT konu dağılımı", href: "/konu-dagilimi/tyt", description: "TYT ders ve konu ağırlıklarını incele", icon: "bar_chart" },
      { label: "YKS çalışma programı", href: "/yks-calisma-programi", description: "TYT ağırlıklı haftalık plan çıkar", icon: "edit_note" },
      { label: "Deneme net takip", href: "/deneme-net-takip-tablosu", description: "TYT denemelerini kaydet ve karşılaştır", icon: "history" },
    ],
  },
  {
    slug: "ayt-kac-gun-kaldi",
    switchLabel: "AYT",
    h1: "2027 AYT'ye Kaç Gün Kaldı?",
    metaTitle: "AYT Kaç Gün Kaldı? 2027 Canlı Sayaç",
    metaDescription:
      "AYT'ye kalan gün, alan testleri ve hazırlık kaynaklarını tek sayfada görün.",
    intro:
      "AYT, hedef puan türünüzü belirleyen alan oturumudur. Sayısal, eşit ağırlık, sözel veya dil dışındaki alan hedeflerinde AYT netlerinin etkisi çok yüksek olduğu için kalan süreyi konu bitirme, alan denemesi ve tekrar döngüsüne ayırmak gerekir. Bu sayfa AYT tarihini, ilgili puan hesaplama aracını ve konu dağılımını birlikte sunar.",
    sourceNote:
      "2027 AYT tarihi resmi ÖSYM takvimi yayımlanana kadar tahmini olarak gösterilir.",
    primaryCountdown: { examSlug: "yks", sessionSlug: "ayt", label: "AYT 2027" },
    sections: [
      {
        title: "AYT'de alan stratejisi",
        body:
          "AYT'de her adayın aynı testleri çözmesi gerekmez. Hedef puan türüne göre Matematik, Fen Bilimleri, Edebiyat-Sosyal ya da Dil oturumuna odaklanmak gerekir. Bu yüzden çalışma planı TYT'den daha seçici olmalıdır.",
      },
      {
        title: "AYT son dönem planı",
        body:
          "Son aylarda konu bitirmek kadar karma deneme ve yanlışların tekrar edilmesi de önemlidir. AYT konu dağılımını kullanarak yüksek ağırlıklı konuları görünür tutun.",
      },
    ],
    faqs: [
      {
        question: "AYT hangi gün yapılır?",
        answer:
          "AYT genellikle TYT'den sonraki gün sabah oturumunda yapılır; kesin bilgi resmi ÖSYM takvimine göre güncellenir.",
      },
      {
        question: "AYT puanı TYT olmadan hesaplanır mı?",
        answer:
          "Hayır. SAY, EA ve SÖZ puanlarında TYT katkısı da bulunduğu için AYT hesaplaması TYT netleriyle birlikte değerlendirilir.",
      },
      {
        question: "AYT için en iyi takip aracı hangisi?",
        answer:
          "Alanınıza göre konu dağılımı ve AYT puan hesaplama aracını birlikte kullanmak en pratik başlangıçtır.",
      },
    ],
    links: [
      { label: "AYT puan hesaplama", href: "/puan-hesaplama/ayt", description: "Alan netlerinden tahmini puan hesapla", icon: "calculate" },
      { label: "AYT konu dağılımı", href: "/konu-dagilimi/ayt", description: "AYT ders ağırlıklarını incele", icon: "bar_chart" },
      { label: "YKS puan hesaplama", href: "/puan-hesaplama/yks", description: "TYT ve AYT netlerini birlikte hesapla", icon: "school" },
      { label: "Başarı sıralaması tahmini", href: "/basari-siralamasi-tahmini", description: "Tahmini puanın yaklaşık sıralama aralığını gör", icon: "trending_up" },
    ],
  },
  {
    slug: "ydt-kac-gun-kaldi",
    switchLabel: "YDT",
    h1: "2027 YDT'ye Kaç Gün Kaldı?",
    metaTitle: "YDT Kaç Gün Kaldı? 2027 Canlı Sayaç",
    metaDescription:
      "YDT'ye kalan süreyi görün, dil puanı hedefiniz için YKS araçlarını ve hazırlık bağlantılarını takip edin.",
    intro:
      "YDT, dil puanı hedefleyen adayların belirleyici oturumudur. TYT ortak zemini oluştururken YDT netleri dil puanında yüksek ağırlık taşır; bu nedenle kelime, okuma, dil bilgisi ve deneme takibini ayrı bir ritimle planlamak gerekir. Bu sayfa YDT tarihini, YKS içindeki yerini ve kullanabileceğiniz temel hazırlık araçlarını tek noktada toplar.",
    sourceNote:
      "2027 YDT tarihi resmi ÖSYM takvimi yayımlanana kadar tahmini olarak gösterilir.",
    primaryCountdown: { examSlug: "yks", sessionSlug: "ydt", label: "YDT 2027" },
    sections: [
      {
        title: "YDT için kalan süre nasıl okunmalı?",
        body:
          "YDT hazırlığında düzenli kelime tekrarı, okuma hızı ve soru tipi pratiği birlikte ilerlemelidir. Kalan süreyi haftalık deneme, yanlış analizi ve kısa tekrar bloklarına ayırmak dil netlerini daha görünür takip etmeyi sağlar.",
      },
      {
        title: "TYT ve YDT dengesi",
        body:
          "Dil puanı hedefleyen adaylar için TYT tamamen ihmal edilmemelidir. TYT tabanı korunurken YDT pratiğine ayrı zaman ayırmak, puan hedefini daha gerçekçi hale getirir.",
      },
    ],
    faqs: [
      {
        question: "YDT hangi gün yapılır?",
        answer:
          "YDT genellikle AYT ile aynı gün öğleden sonra uygulanır; kesin bilgi resmi ÖSYM takvimi açıklandığında güncellenir.",
      },
      {
        question: "YDT puanı TYT olmadan hesaplanır mı?",
        answer:
          "Hayır. Dil puanında YDT netlerinin yanında TYT katkısı da bulunur.",
      },
      {
        question: "YDT hazırlığında hangi veriyi takip etmeliyim?",
        answer:
          "Deneme netleri, kelime tekrar düzeni ve yanlış soru tipleri birlikte takip edildiğinde gelişim daha net görünür.",
      },
    ],
    links: [
      { label: "YKS puan hesaplama", href: "/puan-hesaplama/yks", description: "TYT, YDT ve OBP ile tahmini dil puanını hesapla", icon: "calculate" },
      { label: "YKS çalışma programı", href: "/yks-calisma-programi", description: "Dil hedefi için haftalık çalışma planı oluştur", icon: "edit_note" },
      { label: "Deneme net takip", href: "/deneme-net-takip-tablosu", description: "YDT ve TYT denemelerini düzenli kaydet", icon: "history" },
      { label: "2027 YKS takvimi", href: "/2027-yks-takvimi", description: "TYT, AYT ve YDT oturumlarını birlikte takip et", icon: "calendar_month" },
    ],
  },
  {
    slug: "lgs-kac-gun-kaldi",
    switchLabel: "LGS",
    h1: "2027 LGS'ye Kaç Gün Kaldı?",
    metaTitle: "LGS Kaç Gün Kaldı? 2027 Canlı Sayaç",
    metaDescription:
      "LGS'ye kalan süreyi takip edin, LGS puan hesaplama ve rehberlerle hazırlanın.",
    intro:
      "LGS hazırlığı, öğrencinin yanında velinin ve öğretmenin de düzenli takip ettiği bir süreçtir. Kalan gün sayısı; konu tekrarını, MEB örnek sorularını, süreli denemeleri ve tercih dönemi araştırmasını dengeli planlamak için kullanılmalıdır. 2027 tarihi resmi duyuruya kadar tahmini olarak gösterilir.",
    sourceNote:
      "2027 LGS tarihi resmi MEB duyurusu yayımlanana kadar tahmini olarak gösterilir.",
    primaryCountdown: { examSlug: "lgs", label: "LGS 2027" },
    sections: [
      {
        title: "LGS hazırlığında takip rutini",
        body:
          "LGS'de okuduğunu anlama, yeni nesil soru çözme ve zaman yönetimi birlikte gelişir. Haftalık deneme sonuçlarını ve konu eksiklerini ayrı takip etmek, öğrencinin baskı hissetmeden ilerlemesini sağlar.",
      },
      {
        title: "Veliler için not",
        body:
          "Sayaç tek başına motivasyon aracı olarak kullanılmamalı; gerçekçi haftalık hedeflerle desteklenmelidir. Küçük gelişimleri görünür kılmak öğrencinin sürece bağlılığını artırır.",
      },
    ],
    faqs: [
      {
        question: "LGS tarihi kesin mi?",
        answer:
          "Resmi MEB duyurusu yapılana kadar sayfadaki 2027 tarihi tahmini olarak değerlendirilmelidir.",
      },
      {
        question: "LGS kaç sorudan oluşur?",
        answer:
          "LGS merkezi sınavı sözel ve sayısal bölümlerden oluşur; toplam 90 soru uygulanır.",
      },
      {
        question: "LGS puanı bu sitede resmi sonuç mudur?",
        answer:
          "Hayır. Puan hesaplama aracı tahmini sonuç üretir; resmi yerleştirme puanı MEB tarafından hesaplanır.",
      },
    ],
    links: [
      { label: "LGS puan hesaplama", href: "/puan-hesaplama/lgs", description: "LGS netlerinden tahmini puan hesapla", icon: "calculate" },
      { label: "LGS konu dağılımı", href: "/konu-dagilimi/lgs", description: "LGS derslerini ve konu ağırlıklarını incele", icon: "bar_chart" },
      { label: "LGS rehberi", href: "/blog/lgs-puf-noktalari", description: "Hazırlık sürecindeki temel püf noktaları oku", icon: "article" },
      { label: "Deneme net takip", href: "/deneme-net-takip-tablosu", description: "LGS denemelerini düzenli kaydet", icon: "history" },
    ],
  },
  {
    slug: "kpss-kac-gun-kaldi",
    switchLabel: "KPSS",
    h1: "KPSS'ye Kaç Gün Kaldı?",
    metaTitle: "KPSS Kaç Gün Kaldı? Lisans, Önlisans, Ortaöğretim",
    metaDescription:
      "KPSS oturumlarına kalan süreyi ve puan hesaplama araçlarını görün.",
    intro:
      "KPSS tek bir aday kitlesine hitap etmez; lisans, önlisans ve ortaöğretim adaylarının sınav tarihleri, puan türleri ve çalışma öncelikleri farklıdır. Bu sayfa yakın KPSS oturumlarını birlikte gösterir ve adayın kendi mezuniyet düzeyine uygun puan hesaplama aracına hızlı ulaşmasını sağlar.",
    sourceNote:
      "KPSS tarihleri ÖSYM takvimindeki güncel oturum bilgilerine göre gösterilir.",
    primaryCountdown: { examSlug: "kpss-lisans", label: "KPSS Lisans" },
    secondaryCountdowns: [
      { examSlug: "kpss-lisans", sessionSlug: "genel-yetenek", label: "KPSS Lisans GY-GK" },
      { examSlug: "kpss-onlisans", label: "KPSS Önlisans" },
      { examSlug: "kpss-ortaogretim", label: "KPSS Ortaöğretim" },
    ],
    sections: [
      {
        title: "KPSS'de doğru oturumu seçmek",
        body:
          "Lisans adayları P3 ve alan oturumlarına, önlisans adayları P93'e, ortaöğretim adayları P94'e göre plan yapmalıdır. Yanlış puan türüne göre çalışmak zaman kaybına neden olabilir.",
      },
      {
        title: "KPSS çalışma takibi",
        body:
          "Genel yetenek ve genel kültür netlerini düzenli takip etmek, hedef kadro puanına ne kadar yaklaşıldığını görmeyi kolaylaştırır.",
      },
    ],
    faqs: [
      {
        question: "KPSS Lisans, Önlisans ve Ortaöğretim aynı sınav mı?",
        answer:
          "Hayır. Mezuniyet düzeyine göre farklı oturumlar ve farklı puan türleri bulunur.",
      },
      {
        question: "KPSS P3, P93 ve P94 nedir?",
        answer:
          "P3 lisans, P93 önlisans, P94 ise ortaöğretim düzeyindeki adayların genel atamalarda kullandığı temel puan türleridir.",
      },
      {
        question: "KPSS puan hesaplama resmi sonuç verir mi?",
        answer:
          "Hayır. Araç yaklaşık puan üretir; resmi puan ÖSYM tarafından aday dağılımına göre hesaplanır.",
      },
    ],
    links: [
      { label: "KPSS Lisans hesaplama", href: "/puan-hesaplama/kpss-lisans", description: "P3 tahmini puanını hesapla", icon: "calculate" },
      { label: "KPSS Önlisans hesaplama", href: "/puan-hesaplama/kpss-onlisans", description: "P93 tahmini puanını hesapla", icon: "calculate" },
      { label: "KPSS Ortaöğretim hesaplama", href: "/puan-hesaplama/kpss-ortaogretim", description: "P94 tahmini puanını hesapla", icon: "calculate" },
      { label: "KPSS meslek rehberi", href: "/blog/kpss-ile-yapilabilecek-meslekler", description: "Kadrolar ve meslek seçeneklerini incele", icon: "article" },
    ],
  },
  {
    slug: "dgs-kac-gun-kaldi",
    switchLabel: "DGS",
    h1: "2026 DGS'ye Kaç Gün Kaldı?",
    metaTitle: "DGS Kaç Gün Kaldı? Canlı Sayaç",
    metaDescription:
      "DGS tarihini, kalan süreyi ve DGS puan hesaplama aracını takip edin.",
    intro:
      "DGS, önlisans eğitiminden lisans programına geçmek isteyen adaylar için kısa ama yoğun bir hazırlık süreci gerektirir. Sayısal ve sözel yetenek testleri kadar tercih edilebilecek bölümler, kontenjanlar ve ÖBP etkisi de önemlidir. Bu sayfa DGS tarihini ve temel hazırlık araçlarını tek yerde toplar.",
    sourceNote:
      "2026 DGS tarihi ÖSYM takvimindeki güncel sınav tarihine göre gösterilir.",
    primaryCountdown: { examSlug: "dgs", label: "DGS 2026" },
    sections: [
      {
        title: "DGS için kalan süreyi planlamak",
        body:
          "DGS'de temel matematik ve Türkçe pratikleri düzenli yapılmalıdır. Kısa sürede gelişim görmek için her deneme sonrası eksik konuları not etmek ve tekrar etmek önemlidir.",
      },
      {
        title: "ÖBP ve tercih etkisi",
        body:
          "DGS'de önlisans başarı puanı yerleştirme sonucunu etkiler. Bu yüzden yalnızca net değil, diploma notu ve hedef bölüm kontenjanları da birlikte değerlendirilmelidir.",
      },
    ],
    faqs: [
      {
        question: "DGS kaç sorudan oluşur?",
        answer:
          "DGS sayısal ve sözel yetenek testlerinden oluşur; toplam soru sayısı yıl kılavuzuna göre kontrol edilmelidir.",
      },
      {
        question: "DGS'de ÖBP nedir?",
        answer:
          "ÖBP, önlisans başarı puanıdır ve yerleştirme puanına belirli katsayılarla eklenir.",
      },
      {
        question: "DGS puan hesaplama kesin sonuç verir mi?",
        answer:
          "Hayır. Araç tahmini puan üretir; resmi puan ÖSYM standartlaştırmasına göre hesaplanır.",
      },
    ],
    links: [
      { label: "DGS puan hesaplama", href: "/puan-hesaplama/dgs", description: "Sayısal, sözel ve ÖBP ile tahmini puan hesapla", icon: "calculate" },
      { label: "DGS bölümleri", href: "/blog/dgs-tercih-edilebilecek-bolumler", description: "Geçiş yapılabilecek popüler bölümleri incele", icon: "article" },
      { label: "Deneme net takip", href: "/deneme-net-takip-tablosu", description: "DGS denemelerini düzenli kaydet", icon: "history" },
    ],
  },
  {
    slug: "ales-kac-gun-kaldi",
    switchLabel: "ALES",
    h1: "2026 ALES'e Kaç Gün Kaldı?",
    metaTitle: "ALES Kaç Gün Kaldı? Canlı Sayaç",
    metaDescription:
      "ALES oturumuna kalan süreyi ve ALES puan hesaplama aracını görün.",
    intro:
      "ALES; lisansüstü başvuru, akademik kadro ve bazı kurum süreçlerinde kullanılan önemli bir sınavdır. Adayların çoğu çalışma, okul veya akademik hazırlığı birlikte yürüttüğü için kalan süreyi gerçekçi parçalara bölmek gerekir. Bu sayfa ALES tarihini, puan türlerini ve hazırlık bağlantılarını tek yerde sunar.",
    sourceNote:
      "2026 ALES tarihi ÖSYM takvimindeki güncel oturum bilgisine göre gösterilir.",
    primaryCountdown: { examSlug: "ales", label: "ALES 2026" },
    sections: [
      {
        title: "ALES'te puan türü odağı",
        body:
          "ALES-SAY, ALES-SÖZ ve ALES-EA puan türleri farklı başvurularda kullanılır. Hedef programın istediği puan türünü erken öğrenmek çalışma ağırlığını doğru dağıtmayı sağlar.",
      },
      {
        title: "Çalışan adaylar için plan",
        body:
          "Günde kısa ama düzenli soru çözümü, hafta sonu süreli deneme ile birleştiğinde ALES için sürdürülebilir bir tempo oluşturur.",
      },
    ],
    faqs: [
      {
        question: "ALES puanı kaç yıl geçerlidir?",
        answer:
          "ALES sonuçları genellikle açıklandığı tarihten itibaren 5 yıl geçerlidir.",
      },
      {
        question: "ALES'te hangi puan türleri vardır?",
        answer:
          "ALES-SAY, ALES-SÖZ ve ALES-EA olmak üzere üç temel puan türü bulunur.",
      },
      {
        question: "ALES puan hesaplama resmi sonuç verir mi?",
        answer:
          "Hayır. Araç yaklaşık puan üretir; resmi puan ÖSYM tarafından sınav verileriyle hesaplanır.",
      },
    ],
    links: [
      { label: "ALES puan hesaplama", href: "/puan-hesaplama/ales", description: "Sayısal ve sözel netlerden tahmini puan hesapla", icon: "calculate" },
      { label: "ALES rehberi", href: "/blog/ales-nedir-nasil-hazirlanir", description: "ALES nedir ve nasıl hazırlanılır?", icon: "article" },
      { label: "Deneme net takip", href: "/deneme-net-takip-tablosu", description: "ALES denemelerini takip et", icon: "history" },
    ],
  },
];

const landingBySlug = new Map(examLandingPages.map((page) => [page.slug, page]));

export function getExamLandingPage(slug: string | undefined) {
  return slug ? landingBySlug.get(slug) : undefined;
}

export const examLandingPaths = examLandingPages.map((page) => `/${page.slug}`);

export const homeSelectionLandingPaths: Record<string, string> = {
  yks: "/yks-kac-gun-kaldi",
  tyt: "/tyt-kac-gun-kaldi",
  ayt: "/ayt-kac-gun-kaldi",
  ydt: "/ydt-kac-gun-kaldi",
  lgs: "/lgs-kac-gun-kaldi",
  dgs: "/dgs-kac-gun-kaldi",
  ales: "/ales-kac-gun-kaldi",
  kpss: "/kpss-kac-gun-kaldi",
  "kpss-lisans": "/kpss-kac-gun-kaldi",
  "kpss-onlisans": "/kpss-kac-gun-kaldi",
  "kpss-ortaogretim": "/kpss-kac-gun-kaldi",
  "genel-yetenek": "/kpss-kac-gun-kaldi",
  "egitim-bilimleri": "/kpss-kac-gun-kaldi",
  oabt: "/kpss-kac-gun-kaldi",
};
