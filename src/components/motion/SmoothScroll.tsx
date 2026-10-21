"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { getLenis, setLenis } from "@/lib/lenis";

/**
 * Rolagem suave com Lenis, sincronizada ao ticker do GSAP para que
 * ScrollTrigger e Lenis compartilhem o mesmo quadro (sem scroll duplicado).
 * Desativado quando o usuário prefere movimento reduzido.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.095,
      wheelMultiplier: 0.95,
      anchors: { offset: -88 },
      autoRaf: false,
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Navegação entre páginas: começa no topo, exceto quando há âncora na URL.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector<HTMLElement>(decodeURIComponent(hash));
      if (target) {
        requestAnimationFrame(() => lenis.scrollTo(target, { offset: -88, immediate: true, force: true }));
        return;
      }
    }
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
