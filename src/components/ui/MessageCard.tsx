"use client";

import { useState } from "react";
import type { Message } from "@/content/data";
import { formatDateLong } from "@/content/data";
import { Icon } from "./Icon";

/**
 * Cartão de mensagem com reprodução sob demanda: o player do YouTube
 * (domínio youtube-nocookie) só é carregado após o clique.
 */
export function MessageCard({ message, index }: { message: Message; index?: number }) {
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(message.youtubeId);

  return (
    <article className="msg-card">
      <div className="msg-card__media">
        {playing && hasVideo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${message.youtubeId}?autoplay=1&rel=0`}
            title={`Vídeo: ${message.title}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : hasVideo ? (
          <button type="button" className="msg-card__play" onClick={() => setPlaying(true)}>
            <img
              src={`https://i.ytimg.com/vi/${message.youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              width={480}
              height={360}
            />
            <span className="msg-card__play-icon" aria-hidden="true">
              <Icon name="play" size={22} />
            </span>
            <span className="sr-only">Assistir: {message.title}</span>
          </button>
        ) : (
          <div className="msg-card__placeholder" aria-hidden="true">
            <span className="msg-card__ref">{message.passage}</span>
            {typeof index === "number" && <span className="msg-card__num">{String(index + 1).padStart(2, "0")}</span>}
          </div>
        )}
      </div>
      <div className="msg-card__body">
        <p className="msg-card__meta">
          {message.series && <span>{message.series}</span>}
          <time dateTime={message.date}>{formatDateLong(message.date)}</time>
        </p>
        <h3 className="msg-card__title">{message.title}</h3>
        <p className="msg-card__info">
          {message.passage && (
            <span>
              <Icon name="book" size={14} /> {message.passage}
            </span>
          )}
          {message.preacher && <span>{message.preacher}</span>}
        </p>
        {message.example && <span className="pending">exemplo de layout</span>}
      </div>
    </article>
  );
}
