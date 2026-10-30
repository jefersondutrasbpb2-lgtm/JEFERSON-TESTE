"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { instagramProfileUrl, type InstagramFeed } from "@/content/instagram";
import { htmlLang, type L10n, type Text } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/client";
import { Icon } from "./Icon";

export type CarouselFallbackItem = { image: string; alt: L10n; caption: L10n };

type Props = {
  feed: InstagramFeed;
  /** Fotos exibidas enquanto o feed do Instagram não estiver conectado. */
  fallback: CarouselFallbackItem[];
  title?: Text;
};

const dateLabel = (iso: string | undefined, lang: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" });
};

/**
 * Carrossel de publicações do Instagram, com rolagem horizontal por toque,
 * arraste, teclado ou pelos botões. As imagens são servidas pelo próprio site.
 */
export function InstagramCarousel({ feed, fallback, title: titleProp }: Props) {
  const t = useT();
  const lang = htmlLang[useLocale()];
  const title = t(titleProp ?? { pt: "No Instagram", en: "On Instagram", es: "En Instagram" });
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
            <span className="sr-only">
              {t({ pt: " (abre o Instagram em nova aba)", en: " (opens Instagram in a new tab)", es: " (abre Instagram en una pestaña nueva)" })}
            </span>
          </a>
        </div>
        <div className="ig__controls">
          <button type="button" className="ig__btn" onClick={() => scrollBy(-1)} disabled={atStart} aria-label={t({ pt: "Publicações anteriores", en: "Previous posts", es: "Publicaciones anteriores" })}>
            <Icon name="arrow-right" size={18} className="ig__btn-prev" />
          </button>
          <button type="button" className="ig__btn" onClick={() => scrollBy(1)} disabled={atEnd} aria-label={t({ pt: "Próximas publicações", en: "Next posts", es: "Publicaciones siguientes" })}>
            <Icon name="arrow-right" size={18} />
          </button>
          <a className="btn btn--outline btn--sm ig__follow" href={profile} target="_blank" rel="noopener noreferrer">
            <span className="btn__label">{t({ pt: "Seguir no Instagram", en: "Follow on Instagram", es: "Seguir en Instagram" })}</span>
          </a>
        </div>
      </div>

      <ul className="ig__track" ref={trackRef} tabIndex={0} aria-label={t({
          pt: "Publicações; use as setas do teclado para rolar",
          en: "Posts; use the arrow keys to scroll",
          es: "Publicaciones; usa las flechas del teclado para desplazarte",
        })} data-lenis-prevent>
        {live
          ? feed.posts.map((p) => (
              <li key={p.id} className="ig__card">
                <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="ig__link">
                  <span className="ig__media">
                    <img src={asset(p.image)} alt={p.caption ? p.caption.slice(0, 140) : `${t({ pt: "Publicação de", en: "Post by", es: "Publicación de" })} @${feed.handle}`} loading="lazy" decoding="async" width={1080} height={1080} />
                    {p.type === "VIDEO" && (
                      <span className="ig__badge" aria-hidden="true">
                        <Icon name="play" size={14} />
                      </span>
                    )}
                  </span>
                  {p.caption && <span className="ig__caption">{p.caption}</span>}
                  {dateLabel(p.timestamp, lang) && <span className="ig__date">{dateLabel(p.timestamp, lang)}</span>}
                  <span className="sr-only">{t({ pt: " (abre no Instagram)", en: " (opens on Instagram)", es: " (se abre en Instagram)" })}</span>
                </a>
              </li>
            ))
          : fallback.map((f) => (
              <li key={f.image} className="ig__card">
                <a href={profile} target="_blank" rel="noopener noreferrer" className="ig__link">
                  <span className="ig__media">
                    <img src={asset(f.image)} alt={t(f.alt)} loading="lazy" decoding="async" width={1080} height={1080} />
                  </span>
                  <span className="ig__caption">{t(f.caption)}</span>
                  <span className="sr-only">
                    {t({ pt: " (abre o perfil no Instagram)", en: " (opens the Instagram profile)", es: " (abre el perfil en Instagram)" })}
                  </span>
                </a>
              </li>
            ))}
      </ul>

    </section>
  );
}
