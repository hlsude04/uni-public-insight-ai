import React from "react";

export function ChartCard(props: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  colSpan?: number;
}) {
  const span = Math.max(3, Math.min(12, props.colSpan ?? 6));
  return (
    <section className="card" style={{ gridColumn: `span ${span}` }}>
      <div className="cardHeader">
        <div>
          <h2>{props.title}</h2>
          {props.subtitle ? <p className="sub">{props.subtitle}</p> : null}
        </div>
      </div>
      <div className="cardBody">{props.children}</div>
    </section>
  );
}

