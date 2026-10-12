type Props = {
  title: React.ReactNode;
  lead?: React.ReactNode;
  tone?: "ink" | "paper" | "sand" | "green";
  aside?: React.ReactNode;
  children?: React.ReactNode;
};

/** Abertura editorial das páginas internas. */
export function PageHero({ title, lead, tone = "paper", aside, children }: Props) {
  return (
    <section className="page-hero section-tone" data-tone={tone} data-tone-section={tone}>
      <div className="container page-hero__grid">
        <div className="page-hero__main">
          <h1 className="h1 page-hero__title" data-split="load">
            {title}
          </h1>
          {lead && (
            <p className="lead lead--wide page-hero__lead" data-reveal data-load="" data-delay="0.5">
              {lead}
            </p>
          )}
          {children}
        </div>
        {aside && (
          <div className="page-hero__aside" data-reveal data-load="" data-delay="0.7">
            {aside}
          </div>
        )}
      </div>
      <div className="page-hero__rule container" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
