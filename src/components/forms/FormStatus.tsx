"use client";

import type { Status } from "./useFormSubmit";
import { useT } from "@/i18n/client";

export function FormStatus({
  status,
  success,
  mailto,
}: {
  status: Status;
  success: string;
  mailto: string;
}) {
  const t = useT();
  return (
    <div aria-live="polite" role="status">
      {status === "success" && <p className="form__status form__status--success">{success}</p>}
      {status === "error" && (
        <p className="form__status form__status--error">
          {t({
            pt: "Não foi possível enviar agora. Tente novamente em instantes ou ",
            en: "We could not send it right now. Please try again shortly or ",
            es: "No fue posible enviarlo ahora. Inténtalo de nuevo en unos instantes o ",
          })}
          <a href={mailto}>{t({ pt: "envie por e-mail", en: "send it by email", es: "envíalo por correo" })}</a>.
        </p>
      )}
      {status === "unconfigured" && (
        <p className="form__status form__status--info">
          {t({
            pt: "O envio on-line ainda está sendo configurado. Você pode ",
            en: "Online sending is still being set up. You can ",
            es: "El envío en línea aún se está configurando. Puedes ",
          })}
          <a href={mailto}>
            {t({ pt: "enviar sua mensagem por e-mail", en: "send your message by email", es: "enviar tu mensaje por correo" })}
          </a>
          {t({
            pt: " — o texto que você escreveu já estará preenchido.",
            en: " — the text you wrote will already be filled in.",
            es: ": el texto que escribiste ya estará completado.",
          })}
        </p>
      )}
    </div>
  );
}

export const buildMailto = (to: string, subject: string, body: string) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
