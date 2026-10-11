type Props = {
  id?: string;
  tone?: "ink" | "paper" | "sand" | "green";
  className?: string;
  children: React.ReactNode;
  labelledBy?: string;
  as?: "section" | "div";
};

/** Seção com tom próprio; participa da transição de tom do fundo. */
export function Section({ id, tone = "paper", className = "", children, labelledBy, as: Tag = "section" }: Props) {
  return (
    <Tag
      id={id}
      className={`section section-tone ${className}`.trim()}
      data-tone={tone}
      data-tone-section={tone}
      aria-labelledby={labelledBy}
    >
      {children}
    </Tag>
  );
}
