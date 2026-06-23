/**
 * Tek bir merkezi sayaç hesaplama yardımcı modülü.
 *
 * Önceden CountdownTimer.tsx (Math.floor), CalcExamCountdown.tsx (Math.ceil)
 * ve blog/[slug].astro (Math.ceil) her biri kendi gün hesaplamasını
 * yapıyordu. Bu, aynı sınav için sayfadan sayfaya farklı "X gün kaldı"
 * değerleri gösterilmesine yol açıyordu. Artık tüm gün/saat/dakika/saniye
 * hesapları buradan geçiyor.
 */

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const SECOND_MS = 1_000;

export interface CountdownBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isPast: boolean;
}

function toEpoch(target: string | Date | null | undefined): number {
  if (target instanceof Date) return target.getTime();
  if (!target) return NaN;
  return new Date(target).getTime();
}

/**
 * Hedef tarihe kalan süreyi gün/saat/dakika/saniye olarak döner.
 * Tarih geçmişse veya geçersizse tüm alanlar 0 olur.
 */
export function getCountdown(target: string | Date | null | undefined): CountdownBreakdown {
  const t = toEpoch(target);
  const valid = Number.isFinite(t);
  const remainingMs = valid ? t - Date.now() : 0;
  const ms = Math.max(remainingMs, 0);

  return {
    days: Math.floor(ms / DAY_MS),
    hours: Math.floor((ms % DAY_MS) / HOUR_MS),
    minutes: Math.floor((ms % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((ms % MINUTE_MS) / SECOND_MS),
    totalMs: ms,
    isPast: valid ? remainingMs <= 0 : false,
  };
}

/**
 * Tek bir "kaç gün kaldı" sayısı döner (taban alınarak — getCountdown().days
 * ile aynı sonucu verir, böylece tüm sayfalarda tutarlı bir gün sayısı
 * görünür). Geçersiz tarih için null döner.
 */
export function getDaysLeft(target: string | Date | null | undefined): number | null {
  const t = toEpoch(target);
  if (!Number.isFinite(t)) return null;
  return getCountdown(target).days;
}
