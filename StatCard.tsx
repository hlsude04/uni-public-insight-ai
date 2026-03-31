export function StatCard(props: {
  title: string;
  value: string;
  hint: string;
  badgeLabel: string;
  badgeTone: "good" | "warn" | "bad";
  colSpan?: number;
}) {
  const span = Math.max(3, Math.min(12, props.colSpan ?? 4));
  return (
    <section className="card" style={{ gridColumn: `span ${span}` }}>
      <div className="cardHeader">
        <div>
          <h2>{props.title}</h2>
          <p className="sub">{props.hint}</p>
        </div>
        <span className={`badge ${props.badgeTone}`}>{props.badgeLabel}</span>
      </div>
      <div className="cardBody">
        <div className="stat">
          <div className="value">{props.value}</div>
        </div>
      </div>
    </section>
  );
}

