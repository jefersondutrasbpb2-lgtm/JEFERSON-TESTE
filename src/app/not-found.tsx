import { Button } from "@/components/ui/Button";

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
      </div>
    </section>
  );
}
