"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { mainNav, site, visitCta, fullAddress } from "@/content/site";
import { getLenis } from "@/lib/lenis";
import { Icon } from "@/components/ui/Icon";
import { BrandLogo } from "./BrandLogo";

const isCurrent = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));

export function Header() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Estado do cabeçalho conforme a rolagem: compacto e oculto ao descer.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 520);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Menu aberto: trava a rolagem, gerencia foco e tecla Esc.
  useEffect(() => {
    const lenis = getLenis();
    const root = document.documentElement;
    if (!open) {
      lenis?.start();
      root.classList.remove("menu-open");
      return;
    }
    lenis?.stop();
    root.classList.add("menu-open");
    const menu = menuRef.current;
    const focusables = () =>
      Array.from(menu?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [toggleRef.current!, ...focusables()];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lenis?.start();
      root.classList.remove("menu-open");
    };
  }, [open, close]);

  return (
    <header
      className="site-header"
      data-tone={pathname === "/" ? "ink" : "paper"}
      data-scrolled={scrolled || undefined}
      data-hidden={(hidden && !open) || undefined}
      data-open={open || undefined}
    >
      <div className="site-header__bar container">
        <Link href="/" className="site-header__brand" aria-label={`${site.name} — página inicial`} title="Página inicial">
          <BrandLogo />
        </Link>

        <nav className="nav-desktop" aria-label="Navegação principal">
          <ul>
            {mainNav.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav-desktop__link"
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                >
                  {item.short ?? item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Link href={visitCta.href} className="btn btn--solid btn--sm site-header__cta">
            <span className="btn__label">{visitCta.label}</span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="menu-toggle__label">{open ? "Fechar" : "Menu"}</span>
            <span className="menu-toggle__icon" aria-hidden="true">
              <Icon name={open ? "close" : "menu"} size={20} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        ref={menuRef}
        className="site-menu"
        data-tone="ink"
        role="dialog"
        aria-modal="true"
        aria-label="Menu do site"
        hidden={!open}
      >
        <div className="site-menu__inner container">
          <nav aria-label="Menu principal" className="site-menu__nav">
            <ol>
              {mainNav.map((item, i) => (
                <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={item.href}
                    className="site-menu__link"
                    aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                    onClick={() => close(false)}
                  >
                    <span className="site-menu__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="site-menu__label">{item.label}</span>
                    {item.description && <span className="site-menu__desc">{item.description}</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="site-menu__aside">
            <Link href={visitCta.href} className="btn btn--solid" onClick={() => close(false)}>
              <span className="btn__label">{visitCta.label}</span>
              <span className="btn__icon" aria-hidden="true">
                <Icon name="arrow-right" size={16} />
              </span>
            </Link>
            <p className="small muted">{fullAddress}</p>
            <p className="xs muted">Fundada em {site.foundedLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
