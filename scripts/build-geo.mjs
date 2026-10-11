/**
 * Gera os traçados SVG dos mapas missionários a partir de um GeoJSON
 * dos estados brasileiros (fonte: codeforamerica/click_that_hood, dados IBGE).
 *
 * Uso: node scripts/build-geo.mjs caminho/para/brazil-states.geojson
 * Saída: src/content/geo.generated.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { geoArea, geoMercator, geoPath } from "d3-geo";

const src = process.argv[2];
if (!src) {
  console.error("Informe o caminho do GeoJSON dos estados.");
  process.exit(1);
}
const geo = JSON.parse(readFileSync(src, "utf8"));

// d3-geo espera anéis no sentido horário (oposto ao RFC 7946); corrige quando necessário.
function rewind(feature) {
  const fixPoly = (rings) => {
    const area = geoArea({ type: "Polygon", coordinates: rings });
    return area > 2 * Math.PI ? rings.map((r) => [...r].reverse()) : rings;
  };
  const g = feature.geometry;
  if (g.type === "Polygon") g.coordinates = fixPoly(g.coordinates);
  if (g.type === "MultiPolygon") g.coordinates = g.coordinates.map(fixPoly);
  return feature;
}
geo.features.forEach(rewind);
const bySigla = (s) => geo.features.find((f) => f.properties.sigla === s);

// Coordenadas aproximadas das sedes municipais [longitude, latitude]
export const PLACES = {
  pombal: [-37.8016, -6.7703],
  sousa: [-38.228, -6.759],
  cajazeiras: [-38.5614, -6.8897],
  catole: [-37.7468, -6.3439],
  condado: [-37.6058, -6.9083],
  caico: [-37.0978, -6.4594],
  purus: [-64.3, -6.4], // trecho médio do Rio Purus (aproximado)
};

/** Remove vértices muito próximos (em px) para manter o SVG leve. */
function thin(projection, minDist) {
  return {
    stream(s) {
      // Atua sobre as coordenadas já projetadas (em px).
      const inner = s;
      let last = null;
      let first = null;
      let buffered = null;
      const thinned = {
        point(x, y) {
          if (!first) {
            first = [x, y];
            last = [x, y];
            inner.point(x, y);
            return;
          }
          if (Math.hypot(x - last[0], y - last[1]) >= minDist) {
            inner.point(x, y);
            last = [x, y];
            buffered = null;
          } else buffered = [x, y];
        },
        lineStart() { first = null; last = null; buffered = null; inner.lineStart(); },
        lineEnd() { if (buffered) inner.point(...buffered); inner.lineEnd(); },
        polygonStart() { inner.polygonStart(); },
        polygonEnd() { inner.polygonEnd(); },
        sphere() { inner.sphere?.(); },
      };
      return projection.stream(thinned);
    },
  };
}

function build({ width, height, fitTo, features, minDist, clip }) {
  const projection = geoMercator().fitExtent([[0, 0], [width, height]], fitTo);
  if (clip) projection.clipExtent([[-2, -2], [width + 2, height + 2]]);
  const path = geoPath(thin(projection, minDist)).digits(1);
  const shapes = features.map((f) => ({
    id: f.properties.sigla,
    name: f.properties.name,
    d: path(f) ?? "",
  }));
  const points = Object.fromEntries(
    Object.entries(PLACES).map(([k, ll]) => {
      const [x, y] = projection(ll);
      return [k, [Math.round(x * 10) / 10, Math.round(y * 10) / 10]];
    }),
  );
  return { width, height, shapes, points };
}

// Mapa 1 — Brasil (visão geral)
const brasil = { type: "FeatureCollection", features: geo.features };
const overview = build({
  width: 1000,
  height: 1000,
  fitTo: brasil,
  features: geo.features,
  minDist: 3.6,
});

// Mapa 2 — Sertão paraibano e Seridó potiguar (recorte regional)
const bbox = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [[[-38.85, -6.05], [-36.75, -6.05], [-36.75, -7.25], [-38.85, -7.25], [-38.85, -6.05]]],
  },
};
const regional = build({
  width: 1000,
  height: 580,
  fitTo: bbox,
  features: ["PB", "RN", "CE"].map(bySigla),
  minDist: 2,
  clip: true,
});

const out = `// Arquivo gerado por scripts/build-geo.mjs — não edite manualmente.
// Base cartográfica: limites estaduais (IBGE) via codeforamerica/click_that_hood.
export type GeoShape = { id: string; name: string; d: string };
export type GeoMap = { width: number; height: number; shapes: GeoShape[]; points: Record<string, [number, number]> };

export const overviewMap: GeoMap = ${JSON.stringify(overview)};

export const regionalMap: GeoMap = ${JSON.stringify(regional)};
`;
writeFileSync("src/content/geo.generated.ts", out);
console.log("geo.generated.ts:", (out.length / 1024).toFixed(1), "KB");
