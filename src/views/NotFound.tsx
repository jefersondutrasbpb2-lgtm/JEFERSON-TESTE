import { Button } from "@/components/ui/Button";
import { SiteLink } from "@/components/ui/SiteLink";

/**
 * Página 404. É única para os três idiomas (o servidor não sabe de qual
 * versão o visitante veio), então traz o texto em português e os atalhos
 * para inglês e espanhol.
 */
export default function NotFound() {
  return (
    <section className="page-hero section-tone not-found" data-tone="paper" data-tone-section="paper">
      <div className="container">
        <h1 className="h1">
          Página <em>não encontrada.</em>
        </h1>
        <p className="lead">O endereço pode ter mudado. Volte ao início ou navegue pelo menu.</p>
        <div className="btn-row">
          <Button href="/">Voltar ao início</Button>
          <Button href="/contato/" variant="text">
            Fale conosco
          </Button>
        </div>
        <p className="small muted not-found__langs">
          <span lang="en">
            Page not found — <SiteLink href="/en/" raw>
              go to the English home page
            </SiteLink>.
          </span>{" "}
          <span lang="es">
            Página no encontrada — <SiteLink href="/es/" raw>
              ir al inicio en español
            </SiteLink>.
          </span>
        </p>
      </div>
    </section>
  );
}
