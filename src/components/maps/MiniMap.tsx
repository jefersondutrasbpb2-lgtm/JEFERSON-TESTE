import { overviewMap, regionalMap } from "@/content/geo.generated";

const regionalTargets = ["catole", "sousa", "cajazeiras", "condado", "caico"] as const;
const overviewTargets = ["purus", "caico"] as const;

function curve([x1, y1]: [number, number], [x2, y2]: [number, number], bend: number) {
  const cx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const cy = (y1 + y2) / 2 + (x2 - x1) * bend;
  return `M${x1} ${y1} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
}

/** Mapa estático e decorativo para o storytelling histórico. */
export function MiniMap({ variant }: { variant: "regional" | "overview" }) {
  const map = variant === "regional" ? regionalMap : overviewMap;
  const targets = variant === "regional" ? regionalTargets : overviewTargets;
  const hub = map.points.pombal;
  const highlight = variant === "regional" ? ["PB"] : ["PB", "RN", "AM"];
  const r = variant === "regional" ? 1 : 1.6;
  return (
    <svg className={`minimap minimap--${variant}`} viewBox={`0 0 ${map.width} ${map.height}`} aria-hidden="true" data-draw-trigger>
      <g className="minimap__states">
        {map.shapes.map((s) => (
          <path key={s.id} d={s.d} className={highlight.includes(s.id) ? "is-highlight" : undefined} />
        ))}
      </g>
      <g className="minimap__routes">
        {targets.map((t, i) => (
          <path key={t} d={curve(hub, map.points[t], variant === "regional" ? 0.2 : -0.28)} data-draw="" data-delay={0.2 + i * 0.15} />
        ))}
      </g>
      {targets.map((t) => (
        <circle key={t} cx={map.points[t][0]} cy={map.points[t][1]} r={6 * r} className="minimap__dot" />
      ))}
      <circle cx={hub[0]} cy={hub[1]} r={9 * r} className="minimap__hub" />
    </svg>
  );
}
