import { useEffect, useMemo, useState } from "react";
import { loadCsvFromPublic } from "lib/csv.ts";
import type { CsvRow } from "lib/csv.ts";


import { Header } from "./components/Header.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { GeminiPanel } from "./components/GeminiPanel.tsx";

export function App() {
  const [rows, setRows] = useState<CsvRow[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadCsvFromPublic("/veriler.csv");
        if (!mounted) return;

        const hs = Array.from(
          data.reduce((s, r) => {
            Object.keys(r).forEach((k) => s.add(k));
            return s;
          }, new Set<string>()),
        );

        setHeaders(hs);
        setRows(data);
      } catch (e: any) {
        setErr(e?.message || "CSV yüklenemedi.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sampleCount = useMemo(() => rows?.length ?? 0, [rows]);

  return (
    <div className="container">
      <Header sampleCount={sampleCount} />

      {err ? (
        <section className="card">
          <div className="cardHeader">
            <div>
              <h2>Hata</h2>
              <p className="sub">CSV yüklenemedi.</p>
            </div>
          </div>
          <div className="cardBody">
            <div className="mono">{err}</div>
            <div className="mono" style={{ marginTop: 10 }}>
              Kontrol: <span className="mono">public/veriler.csv</span> dosyası var mı?
            </div>
          </div>
        </section>
      ) : null}

      {rows ? (
        <>
          <Dashboard rows={rows} headers={headers} />
          <div style={{ height: 14 }} />
          <GeminiPanel rows={rows} headers={headers} />
        </>
      ) : err ? null : (
        <section className="card">
          <div className="cardHeader">
            <div>
              <h2>Yükleniyor…</h2>
              <p className="sub">CSV okunuyor ve grafikler hazırlanıyor.</p>
            </div>
          </div>
          <div className="cardBody">
            <div className="mono">Lütfen bekleyin.</div>
          </div>
        </section>
      )}

      <div className="footerRow">
        <div className="mono">
          Dosya: <span className="mono">/public/veriler.csv</span>
        </div>
        <button className="btn secondary" onClick={() => location.reload()}>
          Yenile
        </button>
      </div>
    </div>
  );
}

