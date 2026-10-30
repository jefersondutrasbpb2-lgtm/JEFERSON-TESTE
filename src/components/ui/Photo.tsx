import { asset } from "@/lib/asset";
import { reviewMode } from "@/content/site";
import type { Text } from "@/i18n/config";
import { t } from "@/i18n/server";

export type ImageData = {
  src: string;
  /** Descrição da imagem nos três idiomas */
  alt: Text;
  width: number;
  height: number;
  /** Versões em outras larguras, para srcset responsivo */
  variants?: { src: string; width: number }[];
  /** Ponto focal do recorte (object-position), ex.: "50% 40%" */
  focus?: string;
};

type Props = {
  /** Imagem real autorizada. Quando ausente, exibe um espaço reservado. */
  image?: ImageData;
  /** Descrição da fotografia a ser inserida (usada no espaço reservado). */
  slot: string;
  ratio?: string;
  archival?: boolean;
  caption?: Text;
  className?: string;
  priority?: boolean;
  parallax?: number;
  mask?: "up" | "left" | "center";
  maskDelay?: number;
  maskOnLoad?: boolean;
  /** Atributo sizes da imagem (largura exibida) */
  sizes?: string;
};

/**
 * Fotografia documental com tratamento consistente. Sem imagem disponível,
 * renderiza uma moldura de arquivo com a descrição do registro esperado —
 * nunca uma imagem artificial apresentada como registro real.
 */
export function Photo({
  image,
  slot,
  ratio = "4 / 5",
  archival,
  caption,
  className = "",
  priority,
  parallax,
  mask,
  maskDelay,
  maskOnLoad,
  sizes = "(min-width: 1000px) 50vw, 100vw",
}: Props) {
  const inner = image ? (
    <img
      className="photo__img"
      src={asset(image.src)}
      srcSet={
        image.variants?.length
          ? [...image.variants, { src: image.src, width: image.width }].map((v) => `${asset(v.src)} ${v.width}w`).join(", ")
          : undefined
      }
      sizes={image.variants?.length ? sizes : undefined}
      style={image.focus ? { objectPosition: image.focus } : undefined}
      alt={t(image.alt)}
      width={image.width}
      height={image.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      data-parallax={parallax}
    />
  ) : (
    <div className="photo__slot" data-parallax={parallax} role="img" aria-label={`Espaço reservado para fotografia: ${slot}`}>
      <span className="photo__corner photo__corner--tl" aria-hidden="true" />
      <span className="photo__corner photo__corner--br" aria-hidden="true" />
      <span className="photo__slot-label" aria-hidden="true">
        <span className="photo__slot-kicker">{archival ? "Acervo histórico" : "Fotografia"}</span>
        <span className="photo__slot-text">{slot}</span>
        {reviewMode && <span className="photo__slot-note">imagem real a inserir</span>}
      </span>
    </div>
  );

  return (
    <figure className={`photo ${archival ? "photo--archival" : ""} ${className}`.trim()}>
      <div
        className="photo__frame"
        style={{ aspectRatio: ratio }}
        data-mask={mask}
        data-delay={maskDelay}
        data-load={maskOnLoad ? "" : undefined}
      >
        {inner}
      </div>
      {caption && <figcaption className="photo__caption">{t(caption)}</figcaption>}
    </figure>
  );
}
