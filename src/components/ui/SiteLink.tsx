import Link from "next/link";
import { isPreviewStatic, pageHref } from "@/lib/links";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Link interno do site: rota do Next.js em produção, link simples na prévia estática. */
export function SiteLink({ href, children, ...rest }: Props) {
  if (isPreviewStatic) {
    return (
      <a href={pageHref(href)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
