export function Eyebrow({ index, children, as: Tag = "p" }: { index?: string; children: React.ReactNode; as?: "p" | "span" | "div" }) {
  return (
    <Tag className="eyebrow">
      {index && <span className="eyebrow__index">{index}</span>}
      <span className="eyebrow__rule" aria-hidden="true" />
      <span>{children}</span>
    </Tag>
  );
}
