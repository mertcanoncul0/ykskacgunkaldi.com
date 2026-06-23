const fs = require('fs');
const mock = require('./src/data/mock.json');

mock.pages = {
  hakkimizda: {
    title: "Hakkımızda",
    description: "YKS Kaç Gün Kaldı platformu hakkında bilgiler.",
    contentHtml: "<p>YKS Kaç Gün Kaldı platformu, öğrencilerin sınavlara hazırlanırken...</p>"
  },
  iletisim: {
    title: "İletişim",
    description: "Bizimle iletişime geçin.",
    contentHtml: "<p>Bize admin@ykskacgunkaldi.com adresinden ulaşabilirsiniz.</p>"
  },
  "gizlilik-politikasi": {
    title: "Gizlilik Politikası",
    description: "Kişisel verilerinizin işlenmesi hakkında.",
    contentHtml: "<p>Sitemizi kullanırken gizliliğinize önem veriyoruz...</p>"
  },
  "kullanim-kosullari": {
    title: "Kullanım Koşulları",
    description: "Sitemizi kullanmadan önce okumanız gereken kurallar.",
    contentHtml: "<p>Bu siteyi kullanarak aşağıdaki şartları kabul etmiş sayılırsınız...</p>"
  },
  "rehberler": {
    title: "Rehberler",
    description: "Sınavlara hazırlık rehberleri.",
    contentHtml: "<p>Çok yakında rehber içeriklerimiz burada olacak.</p>"
  }
};

mock.posts = [
  {
    slug: "yks-calisma-programi",
    title: "YKS Çalışma Programı Nasıl Hazırlanır?",
    publishedAt: "2024-05-10T10:00:00Z",
    contentHtml: "<p>Öncelikle eksiklerinizi belirleyin...</p>",
    excerpt: "Sınava hazırlanırken en önemli adım..."
  },
  {
    slug: "tyt-matematik-taktikleri",
    title: "TYT Matematik Çözme Taktikleri",
    publishedAt: "2024-06-01T10:00:00Z",
    contentHtml: "<p>Zaman yönetimi çok önemlidir...</p>",
    excerpt: "Matematik netlerinizi artırmak için..."
  }
];

mock.topics = [
  {
    examSlug: "yks",
    course: "Matematik",
    subject: "Temel Kavramlar",
    weight: 5
  }
];

fs.writeFileSync('./src/data/mock.json', JSON.stringify(mock, null, 2));
