import type {
  ScoreCalculatorConfig,
  ScoreCalculatorField,
} from "../data/score-calculators";

export type CalcRow = { correct: string; wrong: string };
export type CalcState = Record<string, CalcRow>;

export type CalcResult = {
  label: string;
  value: number;
  hint?: string;
  rankable?: boolean;
};

export type CalcSnapshot = {
  state: CalcState;
  diploma: string;
  previous: boolean;
};

export const CALC_YEARS = [2026, 2025, 2024] as const;
export type CalcYear = (typeof CALC_YEARS)[number];

const CANDIDATE_COUNTS: Record<string, Record<CalcYear, number>> = {
  yks: { 2026: 2500000, 2025: 2470000, 2024: 2440000 },
  tyt: { 2026: 2500000, 2025: 2470000, 2024: 2440000 },
  ayt: { 2026: 2100000, 2025: 2080000, 2024: 2050000 },
  lgs: { 2026: 1200000, 2025: 1180000, 2024: 1160000 },
  dgs: { 2026: 260000, 2025: 255000, 2024: 250000 },
  ales: { 2026: 700000, 2025: 690000, 2024: 680000 },
  obp: { 2026: 2500000, 2025: 2470000, 2024: 2440000 },
  // Önceden bu dört sınav türü tabloda yoktu ve estimateRank() sessizce
  // YKS'nin 2,5 milyonluk aday havuzuna düşüyordu (yks fallback). Bu,
  // örneğin YDS için gerçek katılımcı sayısının (~50-80 bin/oturum) ~30-50
  // katı, MSÜ için ise ~4 katı büyük bir havuzla "~X. sıra" tahmini
  // üretiyordu — kullanıcıya anlamsız/yanıltıcı bir sıralama gösteriyordu.
  // Rakamlar haber kaynaklarından alınan yaklaşık başvuru sayılarıdır.
  "kpss-lisans": { 2026: 1800000, 2025: 1800000, 2024: 1750000 },
  "kpss-onlisans": { 2026: 500000, 2025: 500000, 2024: 480000 },
  "kpss-ortaogretim": { 2026: 400000, 2025: 400000, 2024: 380000 },
  yds: { 2026: 65000, 2025: 65000, 2024: 60000 },
  // MSÜ için ÖSYM/MSB duyurularına dayalı gerçek başvuru sayıları:
  // 2024: 736.894, 2025: 670.718, 2026: 645.406.
  msu: { 2026: 645406, 2025: 670718, 2024: 736894 },
};

const PERCENTILE_TABLES: Record<CalcYear, Array<[number, number]>> = {
  2026: [
    [500, 99.999],
    [480, 99.95],
    [460, 99.8],
    [440, 99.4],
    [420, 98.5],
    [400, 96],
    [380, 92],
    [360, 86],
    [340, 78],
    [320, 68],
    [300, 56],
    [280, 44],
    [260, 32],
    [240, 22],
    [220, 14],
    [200, 8],
    [180, 4],
    [150, 1],
  ],
  2025: [
    [500, 99.999],
    [480, 99.94],
    [460, 99.78],
    [440, 99.35],
    [420, 98.4],
    [400, 95.7],
    [380, 91.6],
    [360, 85.4],
    [340, 77.2],
    [320, 67],
    [300, 55],
    [280, 43],
    [260, 31.2],
    [240, 21.3],
    [220, 13.4],
    [200, 7.5],
    [180, 3.6],
    [150, 0.9],
  ],
  2024: [
    [500, 99.999],
    [480, 99.93],
    [460, 99.75],
    [440, 99.3],
    [420, 98.3],
    [400, 95.4],
    [380, 91.2],
    [360, 84.8],
    [340, 76.4],
    [320, 66.2],
    [300, 54.1],
    [280, 42.1],
    [260, 30.4],
    [240, 20.6],
    [220, 12.8],
    [200, 7.1],
    [180, 3.3],
    [150, 0.8],
  ],
};

export function estimatePercentile(score: number, year: CalcYear) {
  const table = PERCENTILE_TABLES[year];
  if (score >= table[0][0]) return table[0][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [hi, hiP] = table[i];
    const [lo, loP] = table[i + 1];
    if (score <= hi && score >= lo) {
      const t = (score - lo) / (hi - lo);
      return loP + (hiP - loP) * t;
    }
  }
  const last = table[table.length - 1];
  return Math.max(0, (score / last[0]) * last[1]);
}

export function estimateRank(score: number, kind: string, year: CalcYear) {
  const candidates =
    CANDIDATE_COUNTS[kind]?.[year] ?? CANDIDATE_COUNTS.yks[year];
  const p = estimatePercentile(score, year);
  const rank = Math.max(1, Math.round(((100 - p) / 100) * candidates));
  return { percentile: p, rank, candidates };
}

export function netOf(field: ScoreCalculatorField, row: CalcRow | undefined) {
  if (!row) return 0;
  const c = Math.max(0, Math.min(Number(row.correct) || 0, field.max));
  // Yanlış sayısı, doğru sayısıyla birlikte test toplam soru sayısını (max)
  // aşamaz. Aksi halde örn. 40 soruluk bir testte "40 doğru + 40 yanlış"
  // gibi imkansız bir giriş, hesaplanan nete sessizce karışıp yanlış
  // (gerçekte var olamayacak) bir puan üretebilir.
  const w = Math.max(0, Math.min(Number(row.wrong) || 0, field.max - c));
  if (field.penalty === "none") {
    return c;
  }
  const div = field.penalty === "third" ? 3 : 4;
  return Math.max(0, c - w / div);
}

const TYT_CONTRIB = {
  tytTurkce: 1.32,
  tytSosyal: 1.36,
  tytMatematik: 1.32,
  tytFen: 1.36,
} as const;
const TYT_WEIGHTS = {
  tytTurkce: 3.3,
  tytSosyal: 3.4,
  tytMatematik: 3.3,
  tytFen: 3.4,
} as const;
const AYT_SAY = {
  aytMatematik: 3.0,
  aytFizik: 2.85,
  aytKimya: 3.07,
  aytBiyoloji: 3.07,
} as const;
const AYT_EA = {
  aytMatematik: 3.0,
  aytEdebiyat: 3.0,
  aytTarih1: 2.8,
  aytCografya1: 3.33,
} as const;
const AYT_SOZ = {
  aytEdebiyat: 3.0,
  aytTarih1: 2.8,
  aytCografya1: 3.33,
  aytTarih2: 2.91,
  aytCografya2: 2.91,
  aytFelsefe: 2.67,
  aytDin: 2.67,
} as const;
const LGS_COEF: Record<string, number> = {
  lgsTurkce: 4,
  lgsMatematik: 4,
  lgsFen: 4,
  lgsInkilap: 1,
  lgsDin: 1,
  lgsYabanciDil: 1,
};

export type CalcComputed = {
  nets: Record<string, number>;
  results: CalcResult[];
  obp: number | null;
  obpKatki: number | null;
  obpDgs: number | null;
  obpDgsKatki: number | null;
};

export function computeAll(
  config: ScoreCalculatorConfig,
  snapshot: CalcSnapshot,
): CalcComputed {
  const nets: Record<string, number> = {};
  for (const g of config.groups) {
    for (const f of g.fields) nets[f.id] = netOf(f, snapshot.state[f.id]);
  }

  const tytWeighted =
    (nets.tytTurkce || 0) * TYT_WEIGHTS.tytTurkce +
    (nets.tytSosyal || 0) * TYT_WEIGHTS.tytSosyal +
    (nets.tytMatematik || 0) * TYT_WEIGHTS.tytMatematik +
    (nets.tytFen || 0) * TYT_WEIGHTS.tytFen;

  const tytContrib =
    (nets.tytTurkce || 0) * TYT_CONTRIB.tytTurkce +
    (nets.tytSosyal || 0) * TYT_CONTRIB.tytSosyal +
    (nets.tytMatematik || 0) * TYT_CONTRIB.tytMatematik +
    (nets.tytFen || 0) * TYT_CONTRIB.tytFen;

  const results: CalcResult[] = [];

  if (config.kind === "tyt" || config.kind === "yks" || config.kind === "ayt") {
    if (config.groups.some((g) => g.title.startsWith("TYT"))) {
      results.push({
        label: "TYT Ham Puan (tahmini)",
        value: 100 + tytWeighted,
        rankable: true,
      });
    }
  }

  if (config.kind === "yks" || config.kind === "ayt") {
    const say =
      tytContrib +
      (nets.aytMatematik || 0) * AYT_SAY.aytMatematik +
      (nets.aytFizik || 0) * AYT_SAY.aytFizik +
      (nets.aytKimya || 0) * AYT_SAY.aytKimya +
      (nets.aytBiyoloji || 0) * AYT_SAY.aytBiyoloji;
    const ea =
      tytContrib +
      (nets.aytMatematik || 0) * AYT_EA.aytMatematik +
      (nets.aytEdebiyat || 0) * AYT_EA.aytEdebiyat +
      (nets.aytTarih1 || 0) * AYT_EA.aytTarih1 +
      (nets.aytCografya1 || 0) * AYT_EA.aytCografya1;
    const soz =
      tytContrib +
      (nets.aytEdebiyat || 0) * AYT_SOZ.aytEdebiyat +
      (nets.aytTarih1 || 0) * AYT_SOZ.aytTarih1 +
      (nets.aytCografya1 || 0) * AYT_SOZ.aytCografya1 +
      (nets.aytTarih2 || 0) * AYT_SOZ.aytTarih2 +
      (nets.aytCografya2 || 0) * AYT_SOZ.aytCografya2 +
      (nets.aytFelsefe || 0) * AYT_SOZ.aytFelsefe +
      (nets.aytDin || 0) * AYT_SOZ.aytDin;
    results.push({ label: "SAY (Sayısal)", value: 100 + say, rankable: true });
    results.push({
      label: "EA (Eşit Ağırlık)",
      value: 100 + ea,
      rankable: true,
    });
    results.push({ label: "SÖZ (Sözel)", value: 100 + soz, rankable: true });
  }

  if (config.kind === "yks") {
    // YDT net katsayısı 3.0 olmalı: TYT katkısının üst sınırı (tytContrib
    // max ≈ 160) ile birlikte toplamın SAY/EA/SÖZ'deki gibi ~500 tabanına
    // ulaşması için (80 soruluk YDT'de) gereken katsayı budur. Önceki
    // katsayı (5) ile DİL puanı teorik üst sınırı ~660'a çıkıyordu; oysa
    // YKS puanları her zaman 100-500 aralığındadır.
    const dil = tytContrib + (nets.ydtDil || 0) * 3;
    results.push({
      label: "DİL (Yabancı Dil)",
      value: 100 + dil,
      rankable: true,
    });
  }

  if (config.kind === "lgs") {
    let ham = 0;
    for (const f of [
      ...(config.groups[0]?.fields || []),
      ...(config.groups[1]?.fields || []),
    ]) {
      const coef = LGS_COEF[f.id] ?? 1;
      ham += (nets[f.id] || 0) * coef;
    }
    
    // LGS max ham is 270. Base score is ~194. Max score is 500.
    const lgsScore = 194 + (ham * 1.1333);

    results.push({
      label: "LGS Ağırlıklı Ham Net",
      value: ham,
      hint: "Türkçe/Mat/Fen katsayısı 4; diğerleri 1",
    });
    results.push({
      label: "LGS Puanı (Tahmini)",
      value: lgsScore,
      hint: "Resmi puan standart sapma ile hesaplanır",
      rankable: true,
    });
  }

  if (config.kind === "dgs") {
    const sayNet = nets.dgsSayisal || 0;
    const sozNet = nets.dgsSozel || 0;

    // DGS puanları 100-500 aralığındadır (taban 100). formulaNote/SSS
    // metninde belirtilen ağırlıklar: DGS-SAY'da sayısal %75 + sözel %25,
    // DGS-SÖZ'de tersi, DGS-EA'da %50/%50. Katsayılar bu oranı koruyacak ve
    // (50 net + 50 net) tam doğruda puanı 500 tavanına taşıyacak şekilde
    // ayarlanmıştır (8 = (500-100) / 50).
    const sayPuan = 100 + sayNet * 6 + sozNet * 2;
    const sozPuan = 100 + sayNet * 2 + sozNet * 6;
    const eaPuan = 100 + sayNet * 4 + sozNet * 4;

    results.push({ label: "DGS-SAY Ham Puan", value: sayPuan, rankable: true });
    results.push({ label: "DGS-SÖZ Ham Puan", value: sozPuan, rankable: true });
    results.push({ label: "DGS-EA Ham Puan", value: eaPuan, rankable: true });
  }

  if (config.kind === "ales") {
    const sayNet = nets.alesSayisal || 0;
    const sozNet = nets.alesSozel || 0;

    const sayPuan = 40 + (sayNet * 0.9) + (sozNet * 0.3);
    const sozPuan = 40 + (sayNet * 0.3) + (sozNet * 0.9);
    const eaPuan = 40 + (sayNet * 0.6) + (sozNet * 0.6);

    results.push({ label: "ALES-SAY Ham Puan", value: sayPuan, rankable: true });
    results.push({ label: "ALES-SÖZ Ham Puan", value: sozPuan, rankable: true });
    results.push({ label: "ALES-EA Ham Puan", value: eaPuan, rankable: true });
  }

  if (
    config.kind === "kpss-lisans" ||
    config.kind === "kpss-onlisans" ||
    config.kind === "kpss-ortaogretim"
  ) {
    const gy = (nets.kpssTurkce || 0) + (nets.kpssMatematik || 0);
    const gk =
      (nets.kpssTarih || 0) +
      (nets.kpssCografya || 0) +
      (nets.kpssVatandaslik || 0);
    
    // Puan: Taban (40) + GY (0.5) + GK (0.5) olarak yaklaşık standart puan
    const score = 40 + gy * 0.5 + gk * 0.5;
    
    let label = "KPSS P3 (Tahmini)";
    if (config.kind === "kpss-onlisans") label = "KPSS P93 (Tahmini)";
    if (config.kind === "kpss-ortaogretim") label = "KPSS P94 (Tahmini)";

    results.push({ label, value: score, rankable: true, hint: "Resmi puan zorluğa göre değişir." });
  }

  if (config.kind === "yds") {
    const score = (nets.ydsYabanciDil || 0) * 1.25;
    
    let level = "E";
    if (score >= 90) level = "A";
    else if (score >= 80) level = "B";
    else if (score >= 70) level = "C";
    else if (score >= 60) level = "D";
    
    results.push({ label: "YDS Puanı", value: score, rankable: true });
    results.push({ label: "Seviye", value: 0, hint: level });
  }

  if (config.kind === "msu") {
    const turkce = nets.msuTurkce || 0;
    const sosyal = nets.msuSosyal || 0;
    const mat = nets.msuMatematik || 0;
    const fen = nets.msuFen || 0;

    const say = 100 + (turkce * 2.5) + (mat * 3.5) + (fen * 7.0) + (sosyal * 1.0);
    const ea = 100 + (turkce * 3.5) + (mat * 3.5) + (fen * 2.0) + (sosyal * 4.0);
    const soz = 100 + (turkce * 3.5) + (mat * 2.0) + (fen * 2.0) + (sosyal * 7.0);
    const genel = 100 + (turkce * 3.3) + (mat * 3.3) + (fen * 3.4) + (sosyal * 3.4);

    results.push({ label: "SAYISAL (SAY)", value: say, rankable: true });
    results.push({ label: "EŞİT AĞIRLIK (EA)", value: ea, rankable: true });
    results.push({ label: "SÖZEL (SÖZ)", value: soz, rankable: true });
    results.push({ label: "GENEL", value: genel, rankable: true });
  }

  const diplomaNum = Math.max(0, Math.min(Number(snapshot.diploma) || 0, 100));
  const obp = config.diploma?.mode === "yks-obp" ? diplomaNum * 5 : null;
  const obpDgs = config.diploma?.mode === "dgs-obp" ? diplomaNum * 0.8 : null;
  const obpKatki = obp != null ? obp * (snapshot.previous ? 0.06 : 0.12) : null;
  const obpDgsKatki =
    obpDgs != null ? obpDgs * (snapshot.previous ? 0.45 : 0.6) : null;

  return { nets, results, obp, obpKatki, obpDgs, obpDgsKatki };
}

export function fmt(n: number) {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 3 });
}

export function fmtInt(n: number) {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

export function isSnapshotEmpty(s: CalcSnapshot) {
  if ((s.diploma || "").trim() !== "") return false;
  for (const row of Object.values(s.state)) {
    if ((row?.correct ?? "").trim() !== "") return false;
    if ((row?.wrong ?? "").trim() !== "") return false;
  }
  return true;
}
