export function Header(props: { sampleCount: number }) {
  return (
    <div className="header">
      <div className="brand">
        <div className="logo" aria-hidden="true" />
        <div className="hgroup">
          <h1>Uni‑Public Insight AI</h1>
          <p>
            Üniversite öğrencilerinin kamu hizmetleri memnuniyetini görselleştirir ve sorunlu alanlar için çözüm önerileri üretir.
          </p>
        </div>
      </div>

      <div className="pillbar">
        <div className="pill">Kaynak: Google Forms CSV</div>
        <div className="pill">Yanıt: {props.sampleCount}</div>
        <div className="pill">Grafikler: Chart.js</div>
      </div>
    </div>
  );
}

