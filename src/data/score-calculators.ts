export type ScoreCalculatorKind =
  | "yks"
  | "tyt"
  | "ayt"
  | "lgs"
  | "dgs"
  | "ales"
  | "kpss-lisans"
  | "kpss-onlisans"
  | "kpss-ortaogretim"
  | "yds"
  | "msu"
  | "obp";

export type PenaltyRule = "quarter" | "third" | "none";

export interface ScoreCalculatorField {
  id: string;
  label: string;
  max: number;
  penalty: PenaltyRule;
}

export interface ScoreCalculatorGroup {
  title: string;
  icon: string;
  badge: string;
  fields: ScoreCalculatorField[];
}

export interface ScoreCalculatorSource {
  label: string;
  url: string;
}

export interface DiplomaConfig {
  mode: "yks-obp" | "dgs-obp";
  label: string;
  help: string;
  previousPlacementLabel: string;
}

export interface ScoreCalculatorConfig {
  slug: string;
  kind: ScoreCalculatorKind;
  title: string;
  metaTitle: string;
  description: string;
  lead: string;
  resultTitle: string;
  formulaNote: string;
  groups: ScoreCalculatorGroup[];
  diploma?: DiplomaConfig;
  sources: ScoreCalculatorSource[];
}

const osymYksGuide =
  "https://dokuman.osym.gov.tr/pdfdokuman/2026/YKS/basvuru_kilavuz06022026.pdf";
const osymAlesGuide =
  "https://dokuman.osym.gov.tr/pdfdokuman/2026/ALES-1/kilavuz_b25032026.pdf";
const osymDgsGuide =
  "https://dokuman.osym.gov.tr/pdfdokuman/2026/DGS/kilavuz_dgsd15052026.pdf";
const mebLgsGuide =
  "https://www.meb.gov.tr/meb_iys_dosyalar/2026_04/06110219_LGS_Basvuru_ve_Uygulama_Kilavuzu_2026.pdf";

const tytGroup: ScoreCalculatorGroup = {
  title: "TYT Testleri",
  icon: "edit_note",
  badge: "120 soru",
  fields: [
    { id: "tytTurkce", label: "Türkçe", max: 40, penalty: "quarter" },
    { id: "tytSosyal", label: "Sosyal Bilimler", max: 20, penalty: "quarter" },
    {
      id: "tytMatematik",
      label: "Temel Matematik",
      max: 40,
      penalty: "quarter",
    },
    { id: "tytFen", label: "Fen Bilimleri", max: 20, penalty: "quarter" },
  ],
};

const aytMathScienceGroup: ScoreCalculatorGroup = {
  title: "AYT Matematik ve Fen",
  icon: "functions",
  badge: "80 soru",
  fields: [
    { id: "aytMatematik", label: "Matematik", max: 40, penalty: "quarter" },
    { id: "aytFizik", label: "Fizik", max: 14, penalty: "quarter" },
    { id: "aytKimya", label: "Kimya", max: 13, penalty: "quarter" },
    { id: "aytBiyoloji", label: "Biyoloji", max: 13, penalty: "quarter" },
  ],
};

const aytLiteratureSocialGroup: ScoreCalculatorGroup = {
  title: "AYT Edebiyat ve Sosyal",
  icon: "menu_book",
  badge: "80 soru",
  fields: [
    {
      id: "aytEdebiyat",
      label: "Türk Dili ve Edebiyatı",
      max: 24,
      penalty: "quarter",
    },
    { id: "aytTarih1", label: "Tarih-1", max: 10, penalty: "quarter" },
    { id: "aytCografya1", label: "Coğrafya-1", max: 6, penalty: "quarter" },
    { id: "aytTarih2", label: "Tarih-2", max: 11, penalty: "quarter" },
    { id: "aytCografya2", label: "Coğrafya-2", max: 11, penalty: "quarter" },
    { id: "aytFelsefe", label: "Felsefe Grubu", max: 12, penalty: "quarter" },
    {
      id: "aytDin",
      label: "Din Kültürü / Ek Felsefe",
      max: 6,
      penalty: "quarter",
    },
  ],
};

const ydtGroup: ScoreCalculatorGroup = {
  title: "YDT",
  icon: "translate",
  badge: "80 soru",
  fields: [{ id: "ydtDil", label: "Yabancı Dil", max: 80, penalty: "quarter" }],
};

const lgsVerbalGroup: ScoreCalculatorGroup = {
  title: "LGS Sözel Bölüm",
  icon: "subject",
  badge: "50 soru",
  fields: [
    { id: "lgsTurkce", label: "Türkçe", max: 20, penalty: "third" },
    {
      id: "lgsInkilap",
      label: "T.C. İnkılap Tarihi ve Atatürkçülük",
      max: 10,
      penalty: "third",
    },
    {
      id: "lgsDin",
      label: "Din Kültürü ve Ahlak Bilgisi",
      max: 10,
      penalty: "third",
    },
    { id: "lgsYabanciDil", label: "Yabancı Dil", max: 10, penalty: "third" },
  ],
};

const lgsNumericGroup: ScoreCalculatorGroup = {
  title: "LGS Sayısal Bölüm",
  icon: "calculate",
  badge: "40 soru",
  fields: [
    { id: "lgsMatematik", label: "Matematik", max: 20, penalty: "third" },
    { id: "lgsFen", label: "Fen Bilimleri", max: 20, penalty: "third" },
  ],
};

const alesGroup: ScoreCalculatorGroup = {
  title: "ALES Testleri",
  icon: "psychology",
  badge: "100 soru",
  fields: [
    { id: "alesSayisal", label: "Sayısal Test", max: 50, penalty: "quarter" },
    { id: "alesSozel", label: "Sözel Test", max: 50, penalty: "quarter" },
  ],
};

const dgsGroup: ScoreCalculatorGroup = {
  title: "DGS Yetenek Testi",
  icon: "swap_vert",
  badge: "100 soru",
  fields: [
    { id: "dgsSayisal", label: "Sayısal Bölüm", max: 50, penalty: "quarter" },
    { id: "dgsSozel", label: "Sözel Bölüm", max: 50, penalty: "quarter" },
  ],
};

const kpssGyGroup: ScoreCalculatorGroup = {
  title: "KPSS Genel Yetenek",
  icon: "calculate",
  badge: "60 soru",
  fields: [
    { id: "kpssTurkce", label: "Türkçe", max: 30, penalty: "quarter" },
    { id: "kpssMatematik", label: "Matematik", max: 30, penalty: "quarter" },
  ],
};

const kpssGkGroup: ScoreCalculatorGroup = {
  title: "KPSS Genel Kültür",
  icon: "public",
  badge: "60 soru",
  fields: [
    { id: "kpssTarih", label: "Tarih", max: 27, penalty: "quarter" },
    { id: "kpssCografya", label: "Coğrafya", max: 18, penalty: "quarter" },
    { id: "kpssVatandaslik", label: "Vatandaşlık ve G.K.", max: 15, penalty: "quarter" },
  ],
};

const ydsDilGroup: ScoreCalculatorGroup = {
  title: "Yabancı Dil Testi",
  icon: "translate",
  badge: "80 soru",
  fields: [
    { id: "ydsYabanciDil", label: "Yabancı Dil", max: 80, penalty: "none" },
  ],
};

const msuGroup: ScoreCalculatorGroup = {
  title: "MSÜ Testleri",
  icon: "military_tech",
  badge: "120 soru",
  fields: [
    { id: "msuTurkce", label: "Türkçe", max: 40, penalty: "quarter" },
    { id: "msuSosyal", label: "Sosyal Bilimler", max: 20, penalty: "quarter" },
    { id: "msuMatematik", label: "Temel Matematik", max: 40, penalty: "quarter" },
    { id: "msuFen", label: "Fen Bilimleri", max: 20, penalty: "quarter" },
  ],
};

const yksDiploma: DiplomaConfig = {
  mode: "yks-obp",
  label: "Ortaöğretim diploma notu",
  help: "OBP = diploma notu x 5. Yerleştirme katkısı normalde OBP x 0,12; önceki yıl yerleşenlerde OBP x 0,06.",
  previousPlacementLabel: "Geçen yıl bir programa yerleştim",
};

const dgsDiploma: DiplomaConfig = {
  mode: "dgs-obp",
  label: "Ön lisans diploma notu",
  help: "ÖBP = diploma notu x 0,8. Yerleştirme katkısı normalde ÖBP x 0,60; önceki yıl DGS ile yerleşenlerde ÖBP x 0,45.",
  previousPlacementLabel: "Geçen yıl DGS ile yerleştim",
};

export const scoreCalculatorConfigs: Record<string, ScoreCalculatorConfig> = {
  yks: {
    slug: "yks",
    kind: "yks",
    title: "YKS Puan Hesaplama",
    metaTitle: "YKS Puan Hesaplama 2026 | TYT AYT YDT ve OBP",
    description:
      "TYT, AYT, YDT netleri ve OBP ile 2026 YKS için kılavuz katsayılarına dayalı tahmini puan hesaplama.",
    lead: "TYT, AYT, YDT ve diploma notunu tek ekranda gir; SAY, EA, SÖZ, DİL ve TYT puanlarını birlikte gör.",
    resultTitle: "YKS Sonuç Özeti",
    formulaNote:
      "YKS'de netler doğru - yanlış/4 ile hesaplanır. Test ağırlıkları 2026-YKS kılavuzundaki TYT ve AYT/YDT tablolarına göre uygulanır. Resmi puanlar aday dağılımı ile standartlaştırıldığı için buradaki değerler kılavuz katsayılı tahmindir.",
    groups: [tytGroup, aytMathScienceGroup, aytLiteratureSocialGroup, ydtGroup],
    diploma: yksDiploma,
    sources: [{ label: "2026-YKS Kılavuzu", url: osymYksGuide }],
  },
  tyt: {
    slug: "tyt",
    kind: "tyt",
    title: "TYT Puan Hesaplama",
    metaTitle: "TYT Puan Hesaplama 2026 | Net ve OBP",
    description:
      "TYT doğru-yanlış sayılarıyla 2026 TYT için kılavuz ağırlıklarına göre tahmini puan hesaplama.",
    lead: "Türkçe, Sosyal Bilimler, Temel Matematik ve Fen Bilimleri netlerini gir; TYT ve Y-TYT tahminini gör.",
    resultTitle: "TYT Sonuç Özeti",
    formulaNote:
      "TYT netleri doğru - yanlış/4 ile hesaplanır. TYT puan ağırlıkları Türkçe %33, Sosyal %17, Temel Matematik %33 ve Fen %17 olarak alınır. Resmi puan standartlaştırmaya bağlıdır.",
    groups: [tytGroup],
    diploma: yksDiploma,
    sources: [{ label: "2026-YKS Kılavuzu", url: osymYksGuide }],
  },
  ayt: {
    slug: "ayt",
    kind: "ayt",
    title: "AYT Puan Hesaplama",
    metaTitle: "AYT Puan Hesaplama 2026 | SAY EA SÖZ ve OBP",
    description:
      "TYT ve AYT netleriyle 2026 SAY, EA ve SÖZ puan türleri için tahmini puan hesaplama.",
    lead: "TYT tabanını ve AYT alan netlerini birlikte gir; SAY, EA ve SÖZ puanlarını kılavuz katsayılarıyla hesapla.",
    resultTitle: "AYT Sonuç Özeti",
    formulaNote:
      "SAY, EA ve SÖZ puan türlerinde TYT testleri ile AYT alan testleri 2026-YKS kılavuzundaki ağırlıklarla değerlendirilir. Resmi puan için sınav yılı ortalama ve standart sapmaları gerekir.",
    groups: [tytGroup, aytMathScienceGroup, aytLiteratureSocialGroup],
    diploma: yksDiploma,
    sources: [{ label: "2026-YKS Kılavuzu", url: osymYksGuide }],
  },
  lgs: {
    slug: "lgs",
    kind: "lgs",
    title: "LGS Puan Hesaplama",
    metaTitle: "LGS Puan Hesaplama 2026 | MEB Katsayıları",
    description:
      "LGS doğru-yanlış sayılarıyla 2026 merkezi sınav için MEB katsayılarına dayalı tahmini puan hesaplama.",
    lead: "Sözel ve sayısal bölüm netlerini gir; MEB kılavuzundaki ham puan ve ağırlık mantığıyla tahmini MSP değerini gör.",
    resultTitle: "LGS Sonuç Özeti",
    formulaNote:
      "LGS ham puanı doğru - yanlış/3 ile hesaplanır. Türkçe, Matematik ve Fen katsayısı 4; İnkılap, Din ve Yabancı Dil katsayısı 1 alınır. Resmi MSP için test ortalamaları, standart sapmaları ve TASP dönüşümü gerekir.",
    groups: [lgsVerbalGroup, lgsNumericGroup],
    sources: [
      { label: "2026 LGS Başvuru ve Uygulama Kılavuzu", url: mebLgsGuide },
    ],
  },
  dgs: {
    slug: "dgs",
    kind: "dgs",
    title: "DGS Puan Hesaplama",
    metaTitle: "DGS Puan Hesaplama 2026 | SAY SÖZ EA ve ÖBP",
    description:
      "DGS sayısal-sözel netleri ve ön lisans başarı puanı ile 2026 DGS için tahmini puan hesaplama.",
    lead: "Sayısal, sözel ve ön lisans diploma notunu gir; DGS-SAY, DGS-SÖZ ve DGS-EA tahminlerini gör.",
    resultTitle: "DGS Sonuç Özeti",
    formulaNote:
      "DGS netleri doğru - yanlış/4 ile hesaplanır. Resmi DGS puanında sayısal/sözel standart puanlar ve ÖBP, kılavuzdaki Tablo-A katsayılarıyla çarpılıp toplanır. Standart puanlar aday dağılımına bağlı olduğu için sonuç tahminidir.",
    groups: [dgsGroup],
    diploma: dgsDiploma,
    sources: [{ label: "2026-DGS Kılavuzu", url: osymDgsGuide }],
  },
  ales: {
    slug: "ales",
    kind: "ales",
    title: "ALES Puan Hesaplama",
    metaTitle: "ALES Puan Hesaplama 2026 | Sayısal Sözel EA",
    description:
      "ALES sayısal ve sözel netleriyle 2026 ALES için sayısal, sözel ve eşit ağırlık tahmini puan hesaplama.",
    lead: "Sayısal ve sözel test netlerini gir; ALES-SAY, ALES-SÖZ ve ALES-EA tahminini aynı anda gör.",
    resultTitle: "ALES Sonuç Özeti",
    formulaNote:
      "ALES netleri doğru - yanlış/4 ile hesaplanır. Sayısal puanda test ağırlıkları 0,75/0,25; sözel puanda 0,25/0,75; eşit ağırlıkta 0,50/0,50 alınır. Resmi ALES puanı ÖSYM'nin AP, ortalama, standart sapma ve en büyük AP formülüne bağlıdır.",
    groups: [alesGroup],
    sources: [{ label: "2026-ALES Kılavuzu", url: osymAlesGuide }],
  },
  "kpss-lisans": {
    slug: "kpss-lisans",
    kind: "kpss-lisans",
    title: "KPSS Lisans Puan Hesaplama",
    metaTitle: "KPSS Lisans Puan Hesaplama 2026 | P1 P2 P3",
    description:
      "KPSS lisans genel yetenek ve genel kültür netleriyle 2026 tahmini P3 puan hesaplama.",
    lead: "Genel Yetenek ve Genel Kültür netlerini gir, memurluk atamalarında kullanılan P3 puan tahminini gör.",
    resultTitle: "KPSS Sonuç Özeti",
    formulaNote:
      "KPSS netleri doğru - yanlış/4 ile hesaplanır. P3 puanı %50 GY ve %50 GK standart puanları üzerinden oluşturulan formülle yaklaşık olarak hesaplanır. Resmi puan testin o yılki zorluğuna göre değişir.",
    groups: [kpssGyGroup, kpssGkGroup],
    sources: [],
  },
  "kpss-onlisans": {
    slug: "kpss-onlisans",
    kind: "kpss-onlisans",
    title: "KPSS Önlisans Puan Hesaplama",
    metaTitle: "KPSS Önlisans Puan Hesaplama | P93 Puanı",
    description:
      "KPSS önlisans genel yetenek ve genel kültür netleriyle P93 puan hesaplama.",
    lead: "Önlisans KPSS için netlerini gir ve P93 tahminini hesapla.",
    resultTitle: "KPSS Sonuç Özeti",
    formulaNote:
      "KPSS netleri doğru - yanlış/4 ile hesaplanır. P93 puanı %50 GY ve %50 GK standart puanları üzerinden yaklaşık hesaplanır.",
    groups: [kpssGyGroup, kpssGkGroup],
    sources: [],
  },
  "kpss-ortaogretim": {
    slug: "kpss-ortaogretim",
    kind: "kpss-ortaogretim",
    title: "KPSS Ortaöğretim Puan Hesaplama",
    metaTitle: "KPSS Ortaöğretim Puan Hesaplama | P94 Puanı",
    description:
      "KPSS ortaöğretim genel yetenek ve genel kültür netleriyle P94 puan hesaplama.",
    lead: "Ortaöğretim KPSS için netlerini gir ve P94 tahminini hesapla.",
    resultTitle: "KPSS Sonuç Özeti",
    formulaNote:
      "KPSS netleri doğru - yanlış/4 ile hesaplanır. P94 puanı %50 GY ve %50 GK standart puanları üzerinden yaklaşık hesaplanır.",
    groups: [kpssGyGroup, kpssGkGroup],
    sources: [],
  },
  yds: {
    slug: "yds",
    kind: "yds",
    title: "YDS Puan Hesaplama",
    metaTitle: "YDS Puan Hesaplama 2026 | Yabancı Dil Bilgisi",
    description:
      "YDS (Yabancı Dil Bilgisi Seviye Tespit Sınavı) doğru sayıları ile tahmini puan hesaplama.",
    lead: "80 soruluk YDS için doğru sayını gir ve tahmini puan seviyeni öğren.",
    resultTitle: "YDS Sonuç Özeti",
    formulaNote:
      "YDS'de 4 yanlış 1 doğruyu götürmez (yanlışların doğruyu götürme kuralı uygulanmaz). Puan = Doğru Sayısı × 1.25 formülü ile hesaplanır.",
    groups: [ydsDilGroup],
    sources: [],
  },
  msu: {
    slug: "msu",
    kind: "msu",
    title: "MSÜ Puan Hesaplama",
    metaTitle: "MSÜ Puan Hesaplama 2026 | Askeri Öğrenci Aday Belirleme",
    description:
      "MSÜ (Milli Savunma Üniversitesi) netleriyle sayısal, sözel, eşit ağırlık ve genel puan hesaplama.",
    lead: "MSÜ netlerini gir; SAY, EA, SÖZ ve GENEL tahmini puanlarını öğren.",
    resultTitle: "MSÜ Sonuç Özeti",
    formulaNote:
      "MSÜ'de her 4 yanlış 1 doğruyu götürür. Katsayılar testin türüne göre (SAY, EA, SÖZ) değişir. Standart sapma etkilidir.",
    groups: [msuGroup],
    sources: [],
  },
  obp: {
    slug: "obp",
    kind: "obp",
    title: "OBP Puan Hesaplama",
    metaTitle: "OBP Puan Hesaplama 2026 | Diploma Notu ve Yerleştirme Katkısı",
    description:
      "Ortaöğretim diploma notundan OBP ve YKS yerleştirme puanına eklenecek katkıyı hesaplama.",
    lead: "Diploma notunu gir; OBP, normal yerleştirme katkısı ve kırık OBP katkısını anında gör.",
    resultTitle: "OBP Sonuç Özeti",
    formulaNote:
      "YKS'de OBP, diploma notunun 5 ile çarpılmasıyla bulunur. Yerleştirme puanına normalde OBP x 0,12, önceki yıl yerleşen adaylarda OBP x 0,06 eklenir.",
    groups: [],
    diploma: yksDiploma,
    sources: [{ label: "2026-YKS Kılavuzu", url: osymYksGuide }],
  },
};

export const scoreCalculatorMenu = [
  { slug: "yks", label: "YKS Hesaplama", icon: "school" },
  { slug: "tyt", label: "TYT Hesaplama", icon: "edit_note" },
  { slug: "ayt", label: "AYT Hesaplama", icon: "functions" },
  { slug: "lgs", label: "LGS Hesaplama", icon: "menu_book" },
  { slug: "dgs", label: "DGS Hesaplama", icon: "swap_vert" },
  { slug: "kpss-lisans", label: "KPSS Lisans", icon: "work" },
  { slug: "kpss-onlisans", label: "KPSS Önlisans", icon: "work_outline" },
  { slug: "kpss-ortaogretim", label: "KPSS Ortaöğretim", icon: "cases" },
  { slug: "ales", label: "ALES Hesaplama", icon: "psychology" },
  { slug: "yds", label: "YDS Hesaplama", icon: "translate" },
  { slug: "msu", label: "MSÜ Hesaplama", icon: "military_tech" },
  { slug: "obp", label: "OBP Hesaplama", icon: "workspace_premium" },
];

export const getScoreCalculatorConfig = (slug: string | undefined) => {
  if (!slug) {
    return undefined;
  }

  return scoreCalculatorConfigs[slug];
};

export interface CalculatorFaq {
  q: string;
  a: string;
}

const COMMON_FAQS: Record<string, CalculatorFaq[]> = {
  yks: [
    {
      q: "YKS puanı nasıl hesaplanır?",
      a: "TYT testlerinin tamamı ile AYT/YDT alan testleri, 2026-YKS kılavuzundaki katsayılarla çarpılıp toplanır ve 100 tabanına eklenir. Netler doğru sayısından yanlış sayısının dörtte biri çıkarılarak bulunur.",
    },
    {
      q: "SAY, EA, SÖZ ve DİL puanları arasındaki fark nedir?",
      a: "Her puan türü farklı AYT testlerine farklı ağırlık verir. SAY'da Matematik–Fizik–Kimya–Biyoloji; EA'da Matematik–Edebiyat–Tarih1–Coğrafya1; SÖZ'de Edebiyat–Tarih–Coğrafya–Felsefe–Din; DİL'de YDT ağırlığı yüksektir.",
    },
    {
      q: "OBP ve yerleştirme katkısı nasıl eklenir?",
      a: "OBP = diploma notu × 5. Yerleştirme puanına normal şartlarda OBP × 0,12; geçen yıl bir programa yerleşmiş adaylarda OBP × 0,06 eklenir.",
    },
    {
      q: "Bu hesaplayıcı resmi ÖSYM puanını verir mi?",
      a: "Hayır. ÖSYM puanları aday dağılımı, ortalama ve standart sapma ile standartlaştırıldığı için resmi puanlar bu araçtaki kılavuz katsayılı tahminden ufak farklılıklar gösterebilir.",
    },
  ],
  tyt: [
    {
      q: "TYT puanı nasıl hesaplanır?",
      a: "Türkçe, Sosyal Bilimler, Temel Matematik ve Fen Bilimleri netleri 2026-YKS kılavuzundaki ağırlıklarla çarpılıp toplanır ve 100 tabanına eklenir.",
    },
    {
      q: "TYT'de yanlışlar netten nasıl düşer?",
      a: "Her 4 yanlış 1 doğruyu götürür. Net = doğru − (yanlış ÷ 4).",
    },
    {
      q: "TYT barajı kaç puandır?",
      a: "Bir lisans programına yerleştirilebilmek için TYT puanının en az 150 (özel yetenek için 130) olması gerekir; sıralamaya girmek için 180 barajı kullanılır.",
    },
  ],
  ayt: [
    {
      q: "AYT puanı TYT olmadan hesaplanabilir mi?",
      a: "Hayır. SAY, EA ve SÖZ puanları TYT testlerinden gelen katkı ile birlikte hesaplanır; AYT netleri tek başına yeterli değildir.",
    },
    {
      q: "AYT'de hangi testler hangi puan türüne girer?",
      a: "SAY: AYT Matematik + Fizik + Kimya + Biyoloji. EA: AYT Matematik + Edebiyat + Tarih-1 + Coğrafya-1. SÖZ: Edebiyat + Tarih-1/2 + Coğrafya-1/2 + Felsefe + Din.",
    },
    {
      q: "AYT netleri kaç soru üzerinden hesaplanır?",
      a: "AYT Matematik 40, Edebiyat 24, Tarih-1 10, Coğrafya-1 6, Fizik 14, Kimya 13, Biyoloji 13, Tarih-2 11, Coğrafya-2 11, Felsefe Grubu 12, Din Kültürü 6 sorudan oluşur.",
    },
  ],
  lgs: [
    {
      q: "LGS puanı nasıl hesaplanır?",
      a: "Sözel ve sayısal bölüm netleri MEB katsayılarıyla (Türkçe/Matematik/Fen = 4; İnkılap/Din/İngilizce = 1) çarpılıp toplanır. Bu ham puan, test ortalama ve standart sapmasıyla standartlaştırılarak MSP'ye dönüştürülür.",
    },
    {
      q: "LGS'de yanlışlar nasıl düşer?",
      a: "LGS'de her 3 yanlış 1 doğruyu götürür. Net = doğru − (yanlış ÷ 3).",
    },
    {
      q: "LGS MSP kaç puan üzerinden hesaplanır?",
      a: "MSP 500 puan üzerinden hesaplanır; ortalama 300, en düşük 100 civarındadır.",
    },
  ],
  dgs: [
    {
      q: "DGS puanı nasıl hesaplanır?",
      a: "Sayısal ve sözel netler ÖSYM tarafından standart puanlara çevrilir; DGS-SAY'da sayısal 0,75 + sözel 0,25, DGS-SÖZ'de tersi, DGS-EA'da 0,50/0,50 ağırlıkla toplanır ve ÖBP katkısı eklenir.",
    },
    {
      q: "ÖBP nasıl hesaplanır?",
      a: "Ön lisans diploma notu × 0,8 = ÖBP. Yerleştirme puanına normal şartlarda ÖBP × 0,60; geçen yıl DGS ile yerleşenlerde ÖBP × 0,45 eklenir.",
    },
    {
      q: "DGS barajı kaç puandır?",
      a: "Bir lisans programına yerleşebilmek için DGS puanının en az 150 olması gerekir.",
    },
  ],
  ales: [
    {
      q: "ALES puanı nasıl hesaplanır?",
      a: "Sayısal ve sözel netler ÖSYM tarafından standart puanlara dönüştürülür; ALES-SAY 0,75/0,25, ALES-SÖZ 0,25/0,75, ALES-EA 0,50/0,50 ağırlığıyla toplanır.",
    },
    {
      q: "ALES kaç yıl geçerlidir?",
      a: "ALES sonuçları açıklandığı tarihten itibaren 5 yıl geçerlidir.",
    },
    {
      q: "ALES puan türleri ne için kullanılır?",
      a: "Lisansüstü programlara başvuru, akademik kadrolar ve kamu kurumlarının uzman/araştırmacı alımlarında ilgili puan türü kullanılır.",
    },
  ],
  obp: [
    {
      q: "OBP nedir, nasıl hesaplanır?",
      a: "Ortaöğretim Başarı Puanı, diploma notunun 5 ile çarpılmasıyla bulunur. 100 üzerinden 85 olan bir diploma için OBP 425'tir.",
    },
    {
      q: "Yerleştirme katkısı nedir?",
      a: "OBP'nin 0,12 ile çarpılmasıyla bulunan değer, sıralama yapılan yerleştirme puanına eklenir. Bu yıl bir programa yerleşmiş adaylarda katsayı 0,06'ya düşer (kırık OBP).",
    },
    {
      q: "Kırık OBP ne demek?",
      a: "Bir önceki yıl YKS ile bir yükseköğretim programına yerleşmiş adayların OBP katkısı yarıya indirilir; buna 'OBP'nin kırılması' denir.",
    },
  ],
  "kpss-lisans": [
    {
      q: "KPSS Lisans P3 puanı nasıl hesaplanır?",
      a: "Genel yetenek ve genel kültür testlerinden elde edilen netler standart puanlara dönüştürülür. P3 puan türünde her iki testin ağırlığı %50'dir.",
    },
    {
      q: "Yanlışlar doğruyu götürür mü?",
      a: "Evet, KPSS lisans sınavlarında 4 yanlış 1 doğruyu götürür.",
    },
  ],
  "kpss-onlisans": [
    {
      q: "KPSS Önlisans P93 puanı nedir?",
      a: "Önlisans mezunlarının genel yetenek ve genel kültür testleri sonucunda atamalar için kullanılan puan türüdür. Ağırlıkları yaklaşık %50-%50 oranındadır.",
    },
  ],
  "kpss-ortaogretim": [
    {
      q: "KPSS Ortaöğretim P94 puanı nedir?",
      a: "Ortaöğretim mezunlarının genel yetenek ve genel kültür netleriyle hesaplanan ve lise düzeyindeki memur atamalarında kullanılan temel puan türüdür.",
    },
  ],
  yds: [
    {
      q: "YDS puanı nasıl hesaplanır?",
      a: "Sınav 80 sorudur ve 4 yanlış 1 doğruyu götürmez. Her doğru soru 1.25 puan değerindedir.",
    },
    {
      q: "YDS barajı kaç puandır?",
      a: "Barajlar amaca göre değişir. Genellikle yüksek lisans/doktora için 55 (C/D seviyesi) istenirken, doçentlik vb. için daha yüksek seviyeler talep edilebilir.",
    },
  ],
  msu: [
    {
      q: "MSÜ puan türleri nelerdir?",
      a: "MSÜ sınavında Sayısal, Eşit Ağırlık, Sözel ve Genel olmak üzere 4 ana puan türü hesaplanır.",
    },
    {
      q: "MSÜ sınavı TYT'ye benzer mi?",
      a: "Evet, soru sayısı ve derslerin dağılımı TYT ile aynıdır (120 soru). Sadece puan türlerindeki katsayı ağırlıkları farklılık gösterir.",
    },
  ],
};

export const getCalculatorFaqs = (slug: string): CalculatorFaq[] =>
  COMMON_FAQS[slug] ?? [];
