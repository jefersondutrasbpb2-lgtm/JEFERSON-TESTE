"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useT } from "@/i18n/client";
import { cleanTitle, isFeed, thumb, videoDateLabel, type Video, type VideoFeed as Feed } from "@/lib/youtube";
import { Icon } from "./Icon";

const endpoint = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/youtube.php`;
const LIST_SIZE = 4;

/**
 * Culto em destaque + lista dos anteriores. A lista inicial vem do build;
 * no ar, /api/youtube.php traz os vídeos novos e a transmissão ao vivo.
 * O player (youtube-nocookie) só carrega quando a pessoa clica.
 */
export function VideoFeed({ initial }: { initial: Feed }) {
  const locale = useLocale();
  const t = useT();
  const [feed, setFeed] = useState(initial);
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(endpoint, { headers: { Accept: "application/json" }, signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (isFeed(j) && (j.videos.length || j.live)) setFeed(j);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const live = feed.live;
  const all: Video[] = live ? [live, ...feed.videos.filter((v) => v.id !== live.id)] : feed.videos;
  if (!all.length) return null;

  const featured = all.find((v) => v.id === selected) ?? all[0];
  const others = all.filter((v) => v.id !== featured.id).slice(0, LIST_SIZE);
  const isLive = (v: Video) => live?.id === v.id;
  const label = (v: Video) => (isLive(v) ? t({ pt: "Ao vivo agora", en: "Live now", es: "En vivo ahora" }) : videoDateLabel(v, locale));
  const title = (v: Video) => cleanTitle(v.title) || t({ pt: "Transmissão ao vivo", en: "Live stream", es: "Transmisión en vivo" });

  const choose = (id: string) => {
    setSelected(id);
    setPlaying(true);
    const el = stage.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="watch__grid">
      <div className="watch__stage" ref={stage}>
        <div className={`watch__media${isLive(featured) ? " is-live" : ""}`}>
          {playing ? (
            <iframe
              key={featured.id}
              src={`https://www.youtube-nocookie.com/embed/${featured.id}?autoplay=1&rel=0`}
              title={featured.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button type="button" className="watch__play" onClick={() => setPlaying(true)}>
              <img
                src={thumb(featured.id, "max")}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.includes("hqdefault")) img.src = thumb(featured.id);
                }}
                alt=""
                width={1280}
                height={720}
                decoding="async"
              />
              <span className="watch__play-icon" aria-hidden="true">
                <Icon name="play" size={26} />
              </span>
              <span className="sr-only">
                {t({ pt: "Assistir", en: "Watch", es: "Ver" })}: {featured.title}
              </span>
            </button>
          )}
          {isLive(featured) && !playing && (
            <span className="watch__live" aria-hidden="true">
              {t({ pt: "Ao vivo", en: "Live", es: "En vivo" })}
            </span>
          )}
        </div>
        <div className="watch__caption">
          <p className={`watch__meta${isLive(featured) ? " is-live" : ""}`}>{label(featured)}</p>
          <h3 className="watch__title">{title(featured)}</h3>
        </div>
      </div>

      {others.length > 0 && (
        <div className="watch__side">
          <p className="watch__side-title">{t({ pt: "Cultos anteriores", en: "Previous services", es: "Cultos anteriores" })}</p>
          <ul className="watch__list">
            {others.map((v) => (
              <li key={v.id}>
                <button type="button" className="watch__item" onClick={() => choose(v.id)}>
                  <span className="watch__thumb">
                    <img src={thumb(v.id)} alt="" width={480} height={360} loading="lazy" decoding="async" />
                    <span className="watch__thumb-icon" aria-hidden="true">
                      <Icon name="play" size={14} />
                    </span>
                  </span>
                  <span className="watch__item-text">
                    <span className={`watch__meta${isLive(v) ? " is-live" : ""}`}>{label(v)}</span>
                    <span className="watch__item-title">{title(v)}</span>
                  </span>
                  <span className="sr-only">{t({ pt: " — assistir", en: " — watch", es: " — ver" })}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
