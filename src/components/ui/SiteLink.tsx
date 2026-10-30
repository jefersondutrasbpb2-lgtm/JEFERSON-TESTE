"use client";

import Link from "next/link";
import { isPreviewStatic, pageHref } from "@/lib/links";
import { localizeHref } from "@/i18n/config";
import { useLocale } from "@/i18n/client";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  /** Não traduz o endereço (ex.: troca de idioma, que já informa o destino) */
  raw?: boolean;
};

/**
 * Link interno do site: leva ao endereço no idioma da página atual
 * ("/agenda/" vira "/en/agenda/" nas páginas em inglês). Rota do Next.js em
 * produção, link simples na prévia estática.
 */
export function SiteLink({ href, raw, children, ...rest }: Props) {
  const locale = useLocale();
  const target = raw ? href : localizeHref(locale, href);
  if (isPreviewStatic) {
    return (
      <a href={pageHref(target)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={target} {...rest}>
      {children}
    </Link>
  );
}
