"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { instagramProfileUrl, type InstagramFeed } from "@/content/instagram";
import { Icon } from "./Icon";

export type CarouselFallbackItem = { image: string; alt: string; caption: string };

type Props = {
  feed: InstagramFeed;
  /** Fotos exibidas enquanto o feed do Instagram não estiver conectado. */
  fallback: CarouselFallbackItem[];
  title?: string;
};

const dateLabel = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
};

/**
 * Carrossel de publicações do Instagram, com rolagem horizontal por toque,
 * arraste, teclado ou pelos botões. As imagens são servidas pelo próprio site.
 */
export function InstagramCarousel({ feed, fallback, title = "No Instagram" }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const profile = instagramProfileUrl(feed.handle);
  const live = feed.posts.length > 0;

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="ig" aria-label={`${title}: @${feed.handle}`}>
      <div className="ig__head">
        <div className="ig__title">
          <p className="ig__kicker">
            <Icon name="instagram" size={16} /> {title}
          </p>
          <a className="ig__handle" href={profile} target="_blank" rel="noopener noreferrer">
            @{feed.handle}
            <span className="sr-only"> (abre o Instagram em nova aba)</span>
          </a>
        </div>
        <div className="ig__controls">
          <button type="button" className="ig__btn" onClick={() => scrollBy(-1)} disabled={atStart} aria-label="Publicações anteriores">
            <Icon name="arrow-right" size={18} className="ig__btn-prev" />
          </button>
          <button type="button" className="ig__btn" onClick={() => scrollBy(1)} disabled={atEnd} aria-label="Próximas publicações">
            <Icon name="arrow-right" size={18} />
          </button>
          <a className="btn btn--outline btn--sm ig__follow" href={profile} target="_blank" rel="noopener noreferrer">
            <span className="btn__label">Seguir no Instagram</span>
          </a>
        </div>
      </div>

      <ul className="ig__track" ref={trackRef} tabIndex={0} aria-label="Publicações; use as setas do teclado para rolar" data-lenis-prevent>
        {live
          ? feed.posts.map((p) => (
              <li key={p.id} className="ig__card">
                <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="ig__link">
                  <span className="ig__media">
                    <img src={asset(p.image)} alt={p.caption ? p.caption.slice(0, 140) : `Publicação de @${feed.handle}`} loading="lazy" decoding="async" width={1080} height={1080} />
                    {p.type === "VIDEO" && (
                      <span className="ig__badge" aria-hidden="true">
                        <Icon name="play" size={14} />
                      </span>
                    )}
                  </span>
                  {p.caption && <span className="ig__caption">{p.caption}</span>}
                  {dateLabel(p.timestamp) && <span className="ig__date">{dateLabel(p.timestamp)}</span>}
                  <span className="sr-only"> (abre no Instagram)</span>
                </a>
              </li>
            ))
          : fallback.map((f) => (
              <li key={f.image} className="ig__card">
                <a href={profile} target="_blank" rel="noopener noreferrer" className="ig__link">
                  <span className="ig__media">
                    <img src={asset(f.image)} alt={f.alt} loading="lazy" decoding="async" width={1080} height={1080} />
                  </span>
                  <span className="ig__caption">{f.caption}</span>
                  <span className="sr-only"> (abre o perfil no Instagram)</span>
                </a>
              </li>
            ))}
      </ul>

    </section>
  );
}
