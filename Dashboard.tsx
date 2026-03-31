import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import type { CsvRow } from "../lib/csv";
import { countBy, pickKeyColumns, satisfactionDistribution } from "../lib/analysis";
import { ChartCard } from "./ChartCard";
import { StatCard } from "./StatCard";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function toneFromNegRate(negRate: number) {
  if (negRate >= 0.45) return { tone: "bad" as const, label: "Kritik" };
  if (negRate >= 0.25) return { tone: "warn" as const, label: "Dikkat" };
  return { tone: "good" as const, label: "İyi" };
}

export function Dashboard(props: { rows: CsvRow[]; headers: string[] }) {
  const { generalSatisfaction, digitalAdequacy, improvementArea, classLevel, gender } =
    pickKeyColumns(props.headers);

  const sampleCount = props.rows.length;

  const general = generalSatisfaction ? satisfactionDistribution(props.rows, generalSatisfaction) : null;
  const generalNegRate = general && general.total ? general.neg / general.total : 0;
  const generalTone = toneFromNegRate(generalNegRate);

  const digital = digitalAdequacy ? satisfactionDistribution(props.rows, digitalAdequacy) : null;

  const improvement = improvementArea ? countBy(props.rows, improvementArea) : null;
  const classes = classLevel ? countBy(props.rows, classLevel) : null;
  const genders = gender ? countBy(props.rows, gender) : null;

  return (
    <div className="grid">
      <StatCard
        title="Örneklem"
        value={`${sampleCount}`}
        hint="CSV’deki toplam yanıt sayısı."
        badgeLabel="Veri yüklendi"
        badgeTone="good"
        colSpan={4}
      />

      <StatCard
        title="Genel memnuniyetsizlik"
        value={general ? `%${Math.round(generalNegRate * 100)}` : "—"}
        hint={
          generalSatisfaction
            ? "Genel memnuniyet sorusundan hesaplandı."
            : "Genel memnuniyet kolonu bulunamadı."
        }
        badgeLabel={generalTone.label}
        badgeTone={generalTone.tone}
        colSpan={4}
      />

      <StatCard
        title="Dijital hizmet sinyali"
        value={digital && digital.total ? `%${Math.round((digital.neg / digital.total) * 100)}` : "—"}
        hint={
          digitalAdequacy
            ? "Dijital hizmet yeterliliği sorusundan hesaplandı."
            : "Dijital yeterlilik kolonu bulunamadı."
        }
        badgeLabel={digital ? "Analiz hazır" : "Eksik kolon"}
        badgeTone={digital ? "good" : "warn"}
        colSpan={4}
      />

      <ChartCard
        title="Genel memnuniyet dağılımı"
        subtitle={generalSatisfaction ?? "Kolon bulunamadı"}
        colSpan={6}
      >
        {general ? (
          <Doughnut
            data={{
              labels: ["Olumlu", "Nötr", "Olumsuz"],
              datasets: [
                {
                  data: [general.pos, general.neu, general.neg],
                  backgroundColor: [
                    "rgba(61,220,151,.85)",
                    "rgba(255,204,102,.85)",
                    "rgba(255,92,122,.85)"
                  ],
                  borderColor: ["rgba(61,220,151,1)", "rgba(255,204,102,1)", "rgba(255,92,122,1)"],
                  borderWidth: 1
                }
              ]
            }}
            options={{
              plugins: {
                legend: { position: "bottom" }
              }
            }}
          />
        ) : (
          <div className="mono">Bu grafik için gerekli kolon bulunamadı.</div>
        )}
      </ChartCard>

      <ChartCard title="Sınıf düzeyi dağılımı" subtitle={classLevel ?? "Kolon bulunamadı"} colSpan={6}>
        {classes ? (
          <Bar
            data={{
              labels: Object.keys(classes),
              datasets: [
                {
                  label: "Yanıt",
                  data: Object.values(classes),
                  backgroundColor: "rgba(124,92,255,.72)",
                  borderColor: "rgba(124,92,255,1)"
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: "rgba(234,240,255,.75)" }, grid: { color: "rgba(255,255,255,.06)" } },
                y: { ticks: { color: "rgba(234,240,255,.75)" }, grid: { color: "rgba(255,255,255,.06)" } }
              }
            }}
          />
        ) : (
          <div className="mono">Bu grafik için gerekli kolon bulunamadı.</div>
        )}
      </ChartCard>

      <ChartCard
        title="Geliştirme öncelikleri"
        subtitle={improvementArea ?? "Kolon bulunamadı"}
        colSpan={7}
      >
        {improvement ? (
          <Bar
            data={{
              labels: Object.keys(improvement).slice(0, 12),
              datasets: [
                {
                  label: "Seçim sayısı",
                  data: Object.values(improvement).slice(0, 12),
                  backgroundColor: "rgba(50,212,255,.68)",
                  borderColor: "rgba(50,212,255,1)"
                }
              ]
            }}
            options={{
              indexAxis: "y",
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: "rgba(234,240,255,.75)" }, grid: { color: "rgba(255,255,255,.06)" } },
                y: { ticks: { color: "rgba(234,240,255,.75)" }, grid: { color: "rgba(255,255,255,.06)" } }
              }
            }}
          />
        ) : (
          <div className="mono">Bu grafik için gerekli kolon bulunamadı.</div>
        )}
      </ChartCard>

      <ChartCard title="Cinsiyet dağılımı" subtitle={gender ?? "Kolon bulunamadı"} colSpan={5}>
        {genders ? (
          <Doughnut
            data={{
              labels: Object.keys(genders),
              datasets: [
                {
                  data: Object.values(genders),
                  backgroundColor: [
                    "rgba(124,92,255,.85)",
                    "rgba(50,212,255,.85)",
                    "rgba(255,204,102,.85)"
                  ],
                  borderColor: ["rgba(124,92,255,1)", "rgba(50,212,255,1)", "rgba(255,204,102,1)"],
                  borderWidth: 1
                }
              ]
            }}
            options={{ plugins: { legend: { position: "bottom" } } }}
          />
        ) : (
          <div className="mono">Bu grafik için gerekli kolon bulunamadı.</div>
        )}
      </ChartCard>
    </div>
  );
}

