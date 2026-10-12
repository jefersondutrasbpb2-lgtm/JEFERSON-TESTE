import { SiteLink } from "@/components/ui/SiteLink";
import { Icon, type IconName } from "./Icon";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "text";
  icon?: IconName | null;
  external?: boolean;
  className?: string;
};

export function Button({ href, children, variant = "solid", icon = "arrow-right", external, className = "" }: Props) {
  const cls = `btn btn--${variant} ${className}`.trim();
  const content = (
    <>
      <span className="btn__label">{children}</span>
      {icon && (
        <span className="btn__icon" aria-hidden="true">
          <Icon name={icon} size={16} />
        </span>
      )}
    </>
  );
  if (external) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {content}
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    );
  }
  return (
    <SiteLink className={cls} href={href}>
      {content}
    </SiteLink>
  );
}
