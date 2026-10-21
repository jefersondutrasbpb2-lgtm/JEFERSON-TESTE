"use client";

import { useState } from "react";
import { mapsEmbedUrl, site } from "@/content/site";
import { Icon } from "./Icon";

/** Mapa carregado somente sob demanda (privacidade e desempenho). */
export function MapEmbed() {
  const [load, setLoad] = useState(false);
  return (
    <div className="map-embed">
      {load ? (
        <iframe
          src={mapsEmbedUrl}
          title={`Mapa: localização da ${site.name}`}
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
            <span className="btn__label">Carregar mapa interativo</span>
          </button>
          <p className="xs muted">O mapa é fornecido pelo Google e pode utilizar cookies.</p>
        </div>
      )}
    </div>
  );
}
