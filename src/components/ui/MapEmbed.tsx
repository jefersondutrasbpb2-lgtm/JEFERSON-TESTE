"use client";

import { useState } from "react";
import { mapsEmbedUrl, site } from "@/content/site";
import { useT } from "@/i18n/client";
import { Icon } from "./Icon";

/** Mapa carregado somente sob demanda (privacidade e desempenho). */
export function MapEmbed() {
  const [load, setLoad] = useState(false);
  const t = useT();
  return (
    <div className="map-embed">
      {load ? (
        <iframe
          src={mapsEmbedUrl}
          title={`${t({ pt: "Mapa: localização da", en: "Map: location of", es: "Mapa: ubicación de la" })} ${site.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="map-embed__placeholder">
          <Icon name="pin" size={28} />
          <p className="small">
            {site.address.street} — {site.address.district}
            <br />
            {site.address.city} — {site.address.state}
          </p>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => setLoad(true)}>
            <span className="btn__label">
              {t({ pt: "Carregar mapa interativo", en: "Load interactive map", es: "Cargar mapa interactivo" })}
            </span>
          </button>
          <p className="xs muted">
            {t({
              pt: "O mapa é fornecido pelo Google e pode utilizar cookies.",
              en: "The map is provided by Google and may use cookies.",
              es: "El mapa lo proporciona Google y puede utilizar cookies.",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
