import { useMemo, useState } from "react";
import type { CsvRow } from "../lib/csv";
import { findHotspots, localActionableSuggestions } from "../lib/analysis";
import { geminiAnalyze } from "../lib/gemini";

function buildPrompt(hotspots: ReturnType<typeof findHotspots>, suggestions: string[]) {
  const list = hotspots
    .slice(0, 5)
    .map(
      (h, i) =>
        `- ${i + 1}) ${h.question} | olumsuz: ${h.negativeCount}/${h.total} (%${Math.round(h.negativeRate * 100)})`,
    )
    .join("\n");

  return [
    "Sen bir kamu hizmetleri ve öğrenci deneyimi danışmanısın.",
    "Aşağıdaki anket özetine göre, memnuniyetsizliğin yoğunlaştığı alanları kısa şekilde yorumla ve öğrenciler için 3 SOMUT çözüm önerisi ver.",
    "Öneriler uygulanabilir, ölçülebilir ve 4-8 hafta içinde başlatılabilir olsun.",
    "",
    "Anket özeti (olumsuzluk odaklı sıcak noktalar):",
    list || "- (veri yetersiz)",
    "",
    "Yerel (heuristic) öneriler (referans olarak):",
    suggestions.map((s) => `- ${s}`).join("\n"),
    "",
    "Çıktı formatı:",
    "1) Kısa teşhis (2-4 cümle)",
    "2) 3 somut öneri (madde madde)",
  ].join("\n");
}

export function GeminiPanel(props: { rows: CsvRow[]; headers: string[] }) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"local" | "gemini">("local");
  const [text, setText] = useState<string>("");

  const hotspots = useMemo(
    () => findHotspots(props.rows, props.headers, 8),
    [props.rows, props.headers],
  );
  const local = useMemo(() => localActionableSuggestions(hotspots), [hotspots]);

  async function run() {
    setLoading(true);
    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;

      if (apiKey && apiKey.trim().length > 0) {
        setMode("gemini");
        const prompt = buildPrompt(hotspots, local);
        const out = await geminiAnalyze({ apiKey, prompt });
        setText(out);
      } else {
        setMode("local");
        setText(local.map((s) => `- ${s}`).join("\n"));
      }
    } catch (e: any) {
      setMode("local");
      setText(`Analiz sırasında hata: ${e?.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <div className="cardHeader">
        <div>
          <h2>Gemini ile Analiz</h2>
          <p className="sub">
            Buton, memnuniyetsizliği tespit eder ve öğrenciler için 3 somut çözüm önerisi üretir. API anahtarı yoksa yerel analiz çalışır.
          </p>
        </div>
        <span className={`badge ${mode === "gemini" ? "good" : "warn"}`}>
          {mode === "gemini" ? "Gemini" : "Yerel"}
        </span>
      </div>

      <div className="cardBody">
        <div className="footerRow" style={{ marginTop: 0 }}>
          <button className="btn" onClick={run} disabled={loading}>
            {loading ? "Analiz ediliyor…" : "Gemini ile Analiz Et"}
          </button>
          <div className="mono">
            İpucu: Gemini için <span className="mono">VITE_GEMINI_API_KEY</span> ortam değişkenini tanımlayabilirsiniz.
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            whiteSpace: "pre-wrap",
            color: "rgba(234,240,255,.92)",
            lineHeight: 1.5,
          }}
        >
          {text ? text : <span className="mono">Henüz analiz çalıştırılmadı.</span>}
        </div>

        {hotspots.length ? (
          <div style={{ marginTop: 14 }} className="mono">
            Sıcak noktalar:{" "}
            {hotspots
              .slice(0, 5)
              .map((h) => `[%${Math.round(h.negativeRate * 100)}] ${h.question}`)
              .join(" · ")}
          </div>
        ) : null}
      </div>
    </section>
  );
}

