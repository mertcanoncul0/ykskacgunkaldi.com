import { Icon } from "../lib/icons";

const notes = [
  "Resmi kurum sitesi değildir.",
  "Tarihler ÖSYM/MEB duyurularına göre güncellenir.",
  "Puan hesaplamaları tahmini sonuç verir.",
  "Amaç öğrenciye hızlı sınav aracı ve kaynak sunmaktır.",
] as const;

export function TrustNotice() {
  return (
    <section className="mb-section-gap" aria-label="Güven ve kullanım notları">
      <div className="border border-border-subtle bg-surface-container-low p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Icon name="info" size={24} className="text-primary shrink-0 mt-1" />
            <div>
              <h2 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-2">
                Bilgilendirme
              </h2>
              <p className="font-body-md text-body-md text-text-muted max-w-2xl">
                YKS Kaç Gün Kaldı; sınav tarihlerini, tahmini puanları ve hazırlık kaynaklarını hızlıca takip etmek için hazırlanmış bağımsız bir araç sitesidir.
              </p>
            </div>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:max-w-2xl">
            {notes.map((note) => (
              <li key={note} className="flex items-start gap-2 font-label-sm text-label-sm text-text-muted uppercase">
                <Icon name="check_circle" size={16} className="text-primary shrink-0 mt-0.5" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
