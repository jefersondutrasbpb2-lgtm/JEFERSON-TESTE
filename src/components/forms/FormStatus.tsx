import type { Status } from "./useFormSubmit";

export function FormStatus({
  status,
  success,
  mailto,
}: {
  status: Status;
  success: string;
  mailto: string;
}) {
  return (
    <div aria-live="polite" role="status">
      {status === "success" && <p className="form__status form__status--success">{success}</p>}
      {status === "error" && (
        <p className="form__status form__status--error">
          Não foi possível enviar agora. Tente novamente em instantes ou <a href={mailto}>envie por e-mail</a>.
        </p>
      )}
      {status === "unconfigured" && (
        <p className="form__status form__status--info">
          O envio on-line ainda está sendo configurado. Você pode <a href={mailto}>enviar sua mensagem por e-mail</a> —
          o texto que você escreveu já estará preenchido.
        </p>
      )}
    </div>
  );
}

export const buildMailto = (to: string, subject: string, body: string) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
