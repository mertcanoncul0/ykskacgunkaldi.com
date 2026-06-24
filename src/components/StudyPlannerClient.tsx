import { useMemo, useState } from "react";
import { Icon } from "../lib/icons";

const focusOptions = [
  { value: "balanced", label: "Dengeli" },
  { value: "tyt", label: "TYT ağırlıklı" },
  { value: "ayt", label: "AYT ağırlıklı" },
  { value: "deneme", label: "Deneme analizi" },
] as const;

const planMap: Record<string, string[]> = {
  balanced: [
    "TYT temel ders tekrarı",
    "AYT alan konusu",
    "Soru çözümü ve yanlış analizi",
    "Karma deneme",
    "Haftalık tekrar",
  ],
  tyt: [
    "TYT Türkçe paragraf",
    "TYT temel matematik",
    "TYT sosyal/fen tekrar",
    "TYT süreli deneme",
    "Yanlış defteri",
  ],
  ayt: [
    "AYT alan konusu",
    "AYT konu testi",
    "TYT koruma çalışması",
    "AYT süreli deneme",
    "Alan yanlış analizi",
  ],
  deneme: [
    "Süreli deneme",
    "Yanlış/boş sınıflandırma",
    "Eksik konu tekrarı",
    "Benzer soru çözümü",
    "Haftalık net değerlendirmesi",
  ],
};

function weeksUntil(dateValue: string) {
  const target = new Date(dateValue).getTime();
  if (!Number.isFinite(target)) return 0;
  const diff = Math.max(0, target - Date.now());
  return Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
}

export function StudyPlannerClient() {
  const [examDate, setExamDate] = useState("2027-06-19");
  const [dailyHours, setDailyHours] = useState("3");
  const [focus, setFocus] = useState<(typeof focusOptions)[number]["value"]>("balanced");
  const [weakTopics, setWeakTopics] = useState("Paragraf, Problemler, AYT Matematik");

  const plan = useMemo(() => {
    const weeks = weeksUntil(examDate);
    const hours = Math.max(1, Math.min(Number(dailyHours) || 1, 12));
    const weeklyHours = hours * 6;
    const topics = weakTopics
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5);
    const routine = planMap[focus];

    return {
      weeks,
      weeklyHours,
      topics,
      rows: Array.from({ length: 4 }).map((_, index) => ({
        week: index + 1,
        title: index === 0 ? "Başlangıç ve eksik analizi" : `${index + 1}. hafta odak planı`,
        tasks: [
          routine[index % routine.length],
          topics[index % Math.max(1, topics.length)] || "Eksik konu tekrarı",
          index % 2 === 0 ? "1 süreli deneme + analiz" : "Konu testi + mini tekrar",
        ],
      })),
    };
  }, [dailyHours, examDate, focus, weakTopics]);

  return (
    <section className="border border-border-subtle bg-white-pure p-8" aria-labelledby="planner-title">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <h2 id="planner-title" className="flex items-center gap-2 font-headline-md text-headline-md text-primary">
          <Icon name="edit_note" />
          Plan Oluştur
        </h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 border border-border-subtle px-4 py-2 font-label-sm text-label-sm uppercase hover:border-black-pure transition-colors"
        >
          <Icon name="picture_as_pdf" size={16} />
          Yazdır
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Hedef tarih
          <input
            type="date"
            value={examDate}
            onChange={(event) => setExamDate(event.target.value)}
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
          />
        </label>
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Günlük saat
          <input
            type="number"
            min={1}
            max={12}
            value={dailyHours}
            onChange={(event) => setDailyHours(event.target.value)}
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
          />
        </label>
        <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted">
          Odak
          <select
            value={focus}
            onChange={(event) => setFocus(event.target.value as typeof focus)}
            className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none"
          >
            {focusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2 font-label-sm text-label-sm uppercase text-text-muted mb-8">
        Eksik konular
        <textarea
          value={weakTopics}
          onChange={(event) => setWeakTopics(event.target.value)}
          rows={3}
          className="border border-border-subtle bg-white-pure px-4 py-3 font-body-md text-body-md text-on-surface focus:border-black-pure outline-none resize-y"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="border border-border-subtle bg-surface p-5">
          <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">Kalan süre</div>
          <div className="font-headline-lg text-headline-lg text-primary">{plan.weeks} hafta</div>
        </div>
        <div className="border border-border-subtle bg-surface p-5">
          <div className="font-label-sm text-label-sm uppercase text-text-muted mb-1">Haftalık çalışma</div>
          <div className="font-headline-lg text-headline-lg text-primary">{plan.weeklyHours} saat</div>
        </div>
      </div>

      <div className="grid gap-4">
        {plan.rows.map((row) => (
          <article key={row.week} className="border border-border-subtle p-5">
            <h3 className="font-headline-md text-headline-md text-primary mb-3">{row.title}</h3>
            <ul className="grid gap-2">
              {row.tasks.map((task) => (
                <li key={task} className="flex items-start gap-2 font-body-md text-body-md text-text-muted">
                  <Icon name="check_circle" size={16} className="text-primary mt-1 shrink-0" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
