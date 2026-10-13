"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { overviewMap, regionalMap, type GeoMap } from "@/content/geo.generated";
import { kindLabel, missionFields, type MissionField } from "@/content/missoes";
import { Pending } from "@/components/ui/Pending";

type View = "regional" | "overview";

const views: { id: View; label: string; caption: string }[] = [
  { id: "regional", label: "Sertão e Seridó", caption: "Sertão Paraibano e Seridó potiguar" },
  { id: "overview", label: "Brasil", caption: "Campos missionários no Brasil" },
];

/** Curva suave entre dois pontos, arqueada para o lado de `bend`. */
function arc([x1, y1]: [number, number], [x2, y2]: [number, number], bend = 0.22) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  return `M${x1} ${y1} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
}

const regionalLabels: { text: string; x: number; y: number }[] = [
  { text: "Ceará", x: 40, y: 70 },
  { text: "Rio Grande do Norte", x: 690, y: 70 },
  { text: "Paraíba", x: 760, y: 520 },
];

const placeNames: Record<string, string> = {
  pombal: "Pombal",
  sousa: "Sousa",
  cajazeiras: "Cajazeiras",
  catole: "Catolé do Rocha",
  condado: "Condado",
  caico: "Caicó",
  paulista: "Paulista",
  purus: "Rio Purus",
};

function MapSvg({
  map,
  view,
  current,
  active,
  onPick,
}: {
  map: GeoMap;
  view: View;
  current: boolean;
  active: string | null;
  onPick: (id: string) => void;
}) {
  const hub = map.points.pombal;
  const fields = missionFields.filter((f) => (view === "regional" ? f.map === "regional" || f.id === "caico" : f.map === "overview"));
  const highlight = view === "regional" ? ["PB"] : ["PB", "RN", "AM"];
  const targets = fields.filter((f) => f.point && f.point !== "pombal");
  const scale = view === "overview" ? 1.25 : 1;

  return (
    <svg
      className={`atlas__map atlas__map--${view} ${current ? "is-current" : ""}`}
      viewBox={`0 0 ${map.width} ${map.height}`}
      role="img"
      aria-label={`${views.find((v) => v.id === view)?.caption}: mapa ilustrativo com a localização aproximada dos trabalhos.`}
      aria-hidden={!current}
    >
      <g className="atlas__states">
        {map.shapes.map((s) => (
          <path key={s.id} d={s.d} className={highlight.includes(s.id) ? "is-highlight" : undefined} />
        ))}
      </g>

      {view === "regional" &&
        regionalLabels.map((l) => (
          <text key={l.text} x={l.x} y={l.y} className="atlas__state-label">
            {l.text}
          </text>
        ))}
      {view === "overview" && (
        <>
          <text x={map.points.purus[0] - 70} y={map.points.purus[1] + 70} className="atlas__state-label">
            Amazonas
          </text>
          <text x={map.points.pombal[0] - 70} y={map.points.pombal[1] - 52} className="atlas__state-label">
            Nordeste
          </text>
        </>
      )}

      <g className="atlas__routes">
        {targets.map((f, i) => (
          <path
            key={f.id}
            d={arc(hub, map.points[f.point!], view === "overview" ? -0.28 : 0.2)}
            pathLength={1}
            className={`atlas__route ${active === f.id ? "is-active" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
      </g>

      <g className="atlas__points">
        {targets.map((f) => {
          const [x, y] = map.points[f.point!];
          const isActive = active === f.id;
          return (
            <g
              key={f.id}
              className={`atlas__point ${isActive ? "is-active" : ""}`}
              transform={`translate(${x} ${y}) scale(${scale})`}
              onClick={() => onPick(f.id)}
            >
              <circle r="16" className="atlas__halo" />
              <circle r="5" className="atlas__dot" />
              {(view === "regional" || f.id === "purus") && (
                <text x={f.id === "purus" ? 12 : 11} y={-11} className="atlas__label">
                  {placeNames[f.point!]}
                </text>
              )}
            </g>
          );
        })}
        <g
          className={`atlas__hub ${active === "rurais" ? "is-active" : ""}`}
          transform={`translate(${hub[0]} ${hub[1]}) scale(${scale})`}
          onClick={() => onPick("rurais")}
        >
          <circle r="22" className="atlas__halo" />
          <circle r="8" className="atlas__hub-dot" />
          <text x={14} y={26} className="atlas__label atlas__label--hub">
            Pombal
          </text>
        </g>
      </g>
    </svg>
  );
}

export function MissionAtlas({ compact = false }: { compact?: boolean }) {
  const [view, setView] = useState<View>("regional");
  const [active, setActive] = useState<string | null>("catole");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (id: string) => {
    const f = missionFields.find((m) => m.id === id);
    if (!f) return;
    setActive(id);
    if (f.map === "overview" && f.id !== "caico") setView("overview");
    if (f.map === "regional") setView("regional");
  };

  const activeField = useMemo(() => missionFields.find((f) => f.id === active) ?? null, [active]);

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = views[(index + step + views.length) % views.length].id;
    setView(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  return (
    <div className={`atlas ${compact ? "atlas--compact" : ""}`} ref={ref} data-inview={inView || undefined}>
      <div className="atlas__stage">
        <div className="tabs atlas__tabs" role="tablist" aria-label="Escala do mapa">
          {views.map((v, i) => (
            <button
              key={v.id}
              id={`${uid}-tab-${v.id}`}
              type="button"
              role="tab"
              className="tabs__btn"
              aria-selected={view === v.id}
              aria-controls={`${uid}-panel`}
              tabIndex={view === v.id ? 0 : -1}
              onClick={() => setView(v.id)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="atlas__canvas" id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${view}`}>
          <MapSvg map={regionalMap} view="regional" current={view === "regional"} active={active} onPick={pick} />
          <MapSvg map={overviewMap} view="overview" current={view === "overview"} active={active} onPick={pick} />
        </div>
        <p className="atlas__legend xs">
          Mapa ilustrativo · localizações aproximadas · base cartográfica IBGE
        </p>
      </div>

      <div className="atlas__side">
        <ul className="atlas__list" aria-label="Trabalhos e campos missionários">
          {missionFields.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className={`atlas__item ${active === f.id ? "is-active" : ""}`}
                aria-pressed={active === f.id}
                onClick={() => pick(f.id)}
                onMouseEnter={() => pick(f.id)}
              >
                <span className="atlas__item-name">{f.name}</span>
                <span className="atlas__item-place">{f.place}</span>
              </button>
            </li>
          ))}
        </ul>

        {activeField && <FieldDetail field={activeField} compact={compact} />}
      </div>
    </div>
  );
}

function FieldDetail({ field, compact }: { field: MissionField; compact: boolean }) {
  return (
    <div className="atlas__detail" aria-live="polite">
      <p className="atlas__detail-kind">{kindLabel[field.kind]}</p>
      <p className="atlas__detail-name">
        {field.name} <span className="muted">— {field.place}</span>
      </p>
      {field.people && <p className="atlas__detail-people">{field.people}</p>}
      {!compact && <p className="atlas__detail-text">{field.summary}</p>}
      <Pending show={field.pending} label="situação atual a confirmar" />
    </div>
  );
}
