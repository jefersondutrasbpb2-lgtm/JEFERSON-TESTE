import type { Scripture } from "@/content/fe";
import { t } from "@/i18n/server";

export function ScriptureQuote({ verse, size = "md" }: { verse: Scripture; size?: "md" | "lg" }) {
  return (
    <figure className={`scripture scripture--${size}`} data-reveal>
      <span className="scripture__mark" aria-hidden="true">
        “
      </span>
      <blockquote className="scripture__text">
        <p>{t(verse.text)}</p>
      </blockquote>
      <figcaption className="scripture__ref">
        {t(verse.ref)} <span className="scripture__version">· {t(verse.version)}</span>
      </figcaption>
    </figure>
  );
}
