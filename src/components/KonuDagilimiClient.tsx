import { useMemo, useState, useEffect } from "react";
import { Select } from "./Select";
import { Icon } from "../lib/icons";

type FocusMode = "yks" | "tyt" | "ayt" | "lgs";

const FOCUS_COPY: Record<
  FocusMode,
  {
    label: string;
    intro: string;
    subjects?: string[];
    relatedLinks: { href: string; label: string }[];
  }
> = {
  yks: {
    label: "YKS",
    intro:
      "YKS, TYT ve AYT için konu başlığı bazlı dağılımları tek merkezde inceleyin.",
    relatedLinks: [
      { href: "/konu-dagilimi/tyt", label: "TYT çıkan konular" },
      { href: "/konu-dagilimi/ayt", label: "AYT çıkan konular" },
      { href: "/puan-hesaplama/yks", label: "YKS puan hesaplama" },
    ],
  },
  tyt: {
    label: "TYT",
    intro:
      "TYT ağırlıklı dersleri ve yıllara göre konu sayılarını takip ederek temel oturum çalışma sıranızı belirleyin.",
    subjects: [
      "turkce",
      "matematik",
      "geometri",
      "fizik",
      "kimya",
      "biyoloji",
      "tarih",
      "cografya",
      "felsefe",
      "din-kulturu",
    ],
    relatedLinks: [
      { href: "/konu-dagilimi", label: "YKS konu dağılımı" },
      { href: "/konu-dagilimi/ayt", label: "AYT konu dağılımı" },
      { href: "/puan-hesaplama/tyt", label: "TYT puan hesaplama" },
    ],
  },
  ayt: {
    label: "AYT",
    intro:
      "AYT alan derslerinde öne çıkan konu başlıklarını görerek sayısal, eşit ağırlık ve sözel planınızı netleştirin.",
    subjects: [
      "ayt-matematik",
      "ayt-geometri",
      "ayt-edebiyat",
      "ayt-tarih",
      "ayt-cografya",
      "ayt-fizik",
      "ayt-kimya",
      "ayt-biyoloji",
      "ayt-felsefe",
      "ayt-din",
    ],
    relatedLinks: [
      { href: "/konu-dagilimi", label: "YKS konu dağılımı" },
      { href: "/konu-dagilimi/tyt", label: "TYT konu dağılımı" },
      { href: "/puan-hesaplama/ayt", label: "AYT puan hesaplama" },
    ],
  },
  lgs: {
    label: "LGS",
    intro:
      "LGS derslerinde yıllara göre konu ağırlıklarını inceleyerek tekrar ve deneme planınızı güncelleyin.",
    relatedLinks: [
      { href: "/konu-dagilimi", label: "Tüm konu dağılımları" },
      { href: "/puan-hesaplama/lgs", label: "LGS puan hesaplama" },
      { href: "/lgs-kac-gun-kaldi", label: "LGS sayacı" },
    ],
  },
};

export function KonuDagilimiClient({
  exams,
  subjects,
  distributions,
  initialExamSlug = "yks",
  initialSubjectSlug,
  focusMode = "yks",
  titleOverride,
  descriptionOverride,
}: {
  exams: any[];
  subjects: any[];
  distributions: any[];
  initialExamSlug?: string;
  initialSubjectSlug?: string;
  focusMode?: FocusMode;
  titleOverride?: string;
  descriptionOverride?: string;
}) {
  const [examSlug, setExamSlug] = useState(initialExamSlug);
  const [activeSubjectSlug, setActiveSubjectSlug] = useState<string | undefined>(initialSubjectSlug);
  const focus = FOCUS_COPY[focusMode];

  useEffect(() => {
    if (focusMode !== "yks") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("sinav")) setExamSlug(params.get("sinav")!);
    if (params.get("ders")) setActiveSubjectSlug(params.get("ders")!);
  }, [focusMode]);

  const updateUrl = (exam: string, subject?: string) => {
    if (focusMode !== "yks") return;
    const url = new URL(window.location.href);
    url.searchParams.set("sinav", exam);
    if (subject) {
      url.searchParams.set("ders", subject);
    } else {
      url.searchParams.delete("ders");
    }
    window.history.pushState({}, "", url);
  };

  const handleExamChange = (v: string) => {
    setExamSlug(v);
    setActiveSubjectSlug(undefined);
    updateUrl(v, undefined);
  };

  const handleSubjectChange = (v: string) => {
    setActiveSubjectSlug(v);
    updateUrl(examSlug, v);
  };

  const exam = exams.find((e: any) => e.slug === examSlug);

  const examSubjects = useMemo(() => {
    const base = subjects.filter((s: any) => s.examSlug === examSlug);
    if (!focus.subjects) return base;
    const allowed = new Set(focus.subjects);
    const filtered = base.filter((s: any) => allowed.has(s.slug));
    return filtered.length > 0 ? filtered : base;
  }, [subjects, examSlug, focus.subjects]);

  const activeSubject = examSubjects.find(
    (s: any) => s.slug === (activeSubjectSlug || examSubjects[0]?.slug)
  );

  const subjectDist = useMemo(
    () =>
      distributions.filter(
        (d) => d.examSlug === examSlug && (!activeSubject || d.subjectSlug === activeSubject.slug)
      ),
    [distributions, activeSubject, examSlug]
  );

  const topicSummary = useMemo(() => {
    const map = new Map<string, { count: number; years: Set<number>; importance?: string }>();
    for (const d of subjectDist) {
      const cur = map.get(d.topicName) || { count: 0, years: new Set<number>(), importance: d.importance };
      cur.count += d.questionCount;
      cur.years.add(d.year);
      if (d.importance === "high") cur.importance = "high";
      map.set(d.topicName, cur);
    }
    const rows = Array.from(map.entries()).map(([name, v]) => ({
      name,
      avg: v.count / Math.max(1, v.years.size),
      total: v.count,
      importance: v.importance,
    }));
    rows.sort((a, b) => b.avg - a.avg);
    return rows;
  }, [subjectDist]);

  const maxAvg = topicSummary[0]?.avg || 1;
  const grandTotal = topicSummary.reduce((s, r) => s + r.avg, 0);
  const topTopic = topicSummary[0];
  const topPct = topTopic ? Math.round((topTopic.avg / grandTotal) * 100) : 0;

  const years = useMemo(
    () => Array.from(new Set(subjectDist.map((d) => d.year))).sort((a, b) => b - a),
    [subjectDist]
  );
  const matrix = useMemo(() => {
    const m = new Map<string, Record<number, number>>();
    for (const d of subjectDist) {
      const row = m.get(d.topicName) || {};
      row[d.year] = (row[d.year] || 0) + d.questionCount;
      m.set(d.topicName, row);
    }
    return Array.from(m.entries()).map(([name, row]) => ({ name, row }));
  }, [subjectDist]);

  const subjectName = activeSubject?.name || "Tüm Dersler";

  return (
    <div className="px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto py-section-gap">
        <header className="mb-12">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
            {titleOverride || `${exam?.name || "Sınav"} Konu Dağılımı`}
          </h1>
          <p className="font-body-lg text-body-lg text-text-muted max-w-2xl">
            {descriptionOverride || "Yıllara göre konu başlığı ve soru sayısı dağılımını inceleyin. Stratejik çalışma planınızı oluşturmak için verileri kullanın."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="İlgili konu dağılımı sayfaları">
            {focus.relatedLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 border border-border-subtle px-3 py-2 font-label-sm text-label-sm uppercase text-primary transition-colors hover:border-black-pure"
              >
                {link.label}
                <Icon name="north_east" size={14} />
              </a>
            ))}
          </div>
        </header>

        {focusMode === "yks" ? (
          <div className="mb-8 max-w-xs">
            <Select
              ariaLabel="Sınav"
              icon="quiz"
              value={examSlug}
              onChange={handleExamChange}
              options={exams.map((ex: any) => ({
                value: ex.slug,
                label: ex.name,
              }))}
            />
          </div>
        ) : (
          <div className="mb-8 inline-flex items-center gap-2 border border-border-subtle px-4 py-2 font-label-sm text-label-sm uppercase text-text-muted">
            <Icon name="quiz" size={16} />
            {focus.label} odaklı konu analizi
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-gutter" aria-label="Konu dağılımı bilgilendirmesi">
          <article className="lg:col-span-2 border border-border-subtle bg-surface-container-low p-6">
            <div className="flex items-start gap-3">
              <Icon name="bar_chart" size={22} className="mt-1 text-primary" />
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary mb-2">Çıkan Konular Nasıl Okunmalı?</h2>
                <p className="font-body-md text-body-md text-text-muted leading-relaxed">
                  {focus.intro} Tablolar, soru metinlerini değil konuların yıllara göre kaç soruyla temsil edildiğini gösterir.
                </p>
              </div>
            </div>
          </article>
          <article className="border border-border-subtle bg-white-pure p-6">
            <div className="flex items-start gap-3">
              <Icon name="info" size={22} className="mt-1 text-primary" />
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary mb-2">Telif ve Kaynak Notu</h2>
                <p className="font-body-sm text-body-sm text-text-muted leading-relaxed">
                  Bu sayfada çıkmış soru metni, seçenek veya kitapçık kopyası yayımlanmaz. Resmi soru kitapçıkları için{" "}
                  <a className="underline hover:text-primary" href="https://www.osym.gov.tr/tr%2C15164/yks-cikmis-sorular.html" target="_blank" rel="noopener noreferrer nofollow">
                    ÖSYM
                  </a>{" "}
                  ve{" "}
                  <a className="underline hover:text-primary" href="https://www.meb.gov.tr" target="_blank" rel="noopener noreferrer nofollow">
                    MEB
                  </a>{" "}
                  kaynaklarını esas alın.
                </p>
              </div>
            </div>
          </article>
        </section>

        <div className="flex flex-wrap gap-2 mb-12" role="tablist" aria-label="Dersler">
          {examSubjects.map((s: any) => {
            const isActive = s.slug === (activeSubjectSlug || examSubjects[0]?.slug);
            return (
              <button
                key={s.slug}
                type="button"
                role="tab"
                aria-selected={isActive ? "true" : "false"}
                className={`px-4 py-2 font-label-sm text-label-sm uppercase border transition-colors ${
                  isActive
                    ? "bg-black-pure text-white-pure border-black-pure"
                    : "border-border-subtle text-text-muted hover:border-black-pure hover:text-black-pure"
                }`}
                onClick={() => handleSubjectChange(s.slug)}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        {topicSummary.length === 0 ? (
          <p className="font-body-md text-text-muted">Bu filtre için konu dağılımı bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <article className="border border-border-subtle bg-white-pure p-8">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words font-headline-md text-headline-md leading-snug text-primary">{subjectName} Soru Dağılımı</h2>
                    <p className="font-body-md text-body-md text-text-muted mt-1">Yıllara göre ortalama soru sayısı ağırlıkları</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 border border-border-subtle px-3 py-1 font-label-sm text-label-sm uppercase text-text-muted whitespace-nowrap">
                    <Icon name="trending_up" size={16} />
                    Güncel Veri
                  </span>
                </div>

                <ul className="flex flex-col gap-6">
                  {topicSummary.slice(0, 8).map((t) => {
                    const pct = Math.max(8, (t.avg / maxAvg) * 100);
                    const accent = t.importance === "high";
                    return (
                      <li key={t.name}>
                        <div className="flex items-baseline justify-between mb-2 gap-4">
                          <span className="font-body-md text-body-md flex items-center gap-2">
                            {t.name}
                            {accent && <Icon name="flag" size={14} className="text-primary" title="Önemli konu" />}
                          </span>
                          <span className={`font-label-sm text-label-sm whitespace-nowrap ${accent ? "text-primary font-bold" : "text-text-muted"}`}>
                            ~{Math.round(t.avg)} Soru
                          </span>
                        </div>
                        <div className="h-2 bg-surface-container-high">
                          <div className="h-2 bg-black-pure" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </article>

              <article className="border border-border-subtle bg-white-pure p-8">
                <h3 className="font-headline-md text-headline-md text-primary mb-6">Yıllara Göre Detaylı Analiz</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <caption className="sr-only">
                      {subjectName} dersi için {years.join(", ")} yıllarına göre konu başına soru sayısı dağılımı
                    </caption>
                    <thead>
                      <tr className="border-b-2 border-primary">
                        <th scope="col" className="py-3 px-2 font-label-md text-label-md uppercase text-text-muted text-left">Konu Adı</th>
                        {years.map((y) => (
                          <th key={y} scope="col" className="py-3 px-2 font-label-md text-label-md uppercase text-text-muted text-right">{y}</th>
                        ))}
                        <th scope="col" className="py-3 px-2 font-label-md text-label-md uppercase text-primary text-right">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {matrix.map(({ name, row }) => {
                        const rowTotal = years.reduce((s, y) => s + (row[y] ?? 0), 0);
                        return (
                          <tr key={name}>
                            <th scope="row" className="py-3 px-2 font-body-md text-body-md text-left font-normal">{name}</th>
                            {years.map((y, i) => (
                              <td key={y} className={`py-3 px-2 font-body-md text-body-md text-right ${i === 0 ? "font-semibold text-primary" : "text-text-muted"}`}>
                                {row[y] ?? "—"}
                              </td>
                            ))}
                            <td className="py-3 px-2 font-body-md text-body-md text-right font-semibold text-primary">{rowTotal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-primary">
                        <th scope="row" className="py-3 px-2 font-label-md text-label-md uppercase text-left">Toplam Soru</th>
                        {years.map((y) => {
                          const total = matrix.reduce((s, { row }) => s + (row[y] ?? 0), 0);
                          return <td key={y} className="py-3 px-2 font-body-md text-body-md text-right font-semibold">{total}</td>;
                        })}
                        <td className="py-3 px-2 font-body-md text-body-md text-right font-semibold text-primary">
                          {matrix.reduce((s, { row }) => s + years.reduce((a, y) => a + (row[y] ?? 0), 0), 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </article>
            </div>

            <aside className="lg:col-span-4">
              {topTopic && (
                <article className="bg-black-pure text-white-pure p-8">
                  <Icon name="flag" size={32} className="mb-4 block" />
                  <h3 className="font-headline-md text-headline-md mb-3">Strateji Önerisi</h3>
                  <p className="font-body-md text-body-md text-white-pure/80 leading-relaxed">
                    <strong className="text-white-pure">{topTopic.name}</strong> konusu {subjectName} testinin yaklaşık %{topPct}'unu oluşturuyor. Günlük rutin çözüm planlayın.
                  </p>
                </article>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
