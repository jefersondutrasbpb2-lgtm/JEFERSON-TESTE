import type { Scripture } from "@/content/fe";
import { Pending } from "./Pending";

export function ScriptureQuote({ verse, size = "md" }: { verse: Scripture; size?: "md" | "lg" }) {
  return (
    <figure className={`scripture scripture--${size}`} data-reveal>
      <span className="scripture__mark" aria-hidden="true">
        “
      </span>
      <blockquote className="scripture__text">
        <p>{verse.text}</p>
      </blockquote>
      <figcaption className="scripture__ref">
        {verse.ref} <span className="scripture__version">· {verse.version}</span> <Pending show={verse.pending} label="texto sugerido" />
      </figcaption>
    </figure>
  );
}
