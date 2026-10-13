"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== "" && v !== undefined ? n : fallback;
};

/**
 * Orquestra as animações declarativas da página atual a partir de atributos
 * `data-*` presentes no HTML estático. Assim, a página funciona integralmente
 * sem JavaScript e as animações são apenas uma camada de aprimoramento.
 *
 *  data-tone-section="ink|paper|sand|green"  tom do cabeçalho; blocos escuros se expandem
 *  data-reveal[="stagger|fade"]               entrada suave
 *  data-split[="load"]                        revelação de títulos por linhas
 *  data-parallax="12"                         deslocamento vertical (yPercent)
 *  data-drift="10"                            deslocamento horizontal (xPercent)
 *  data-mask                                  revelação por máscara
 *  data-slide="left|right"                    entrada lateral, vindo do lado indicado
 *  data-draw[="scrub"]                        desenho de linhas SVG
 *  data-progress                              linha de progresso (scaleY)
 *  data-count                                 contagem numérica
 *  data-story / data-story-step / data-story-panel   storytelling fixo
 *  data-activate                              classe .is-active ao passar
 *
 * Montado em app/template.tsx, portanto é recriado a cada navegação.
 */
export function MotionDirector() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = prefersReducedMotion();
    const q = <T extends Element = HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T & Element>(sel)) as T[];

    const ctx = gsap.context(() => {
      /* ---------- Comportamentos (sempre ativos) ---------- */

      // Cabeçalho assume o tom da seção que está sob ele
      q<HTMLElement>("[data-tone-section]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 40px",
          end: "bottom 40px",
          onToggle: (self) => {
            if (self.isActive) root.dataset.headerTone = el.dataset.toneSection || "paper";
          },
        });
      });

      // Storytelling: etapa ativa controla o painel fixo
      q<HTMLElement>("[data-story]").forEach((story) => {
        const steps = Array.from(story.querySelectorAll<HTMLElement>("[data-story-step]"));
        const panels = Array.from(story.querySelectorAll<HTMLElement>("[data-story-panel]"));
        const markers = Array.from(story.querySelectorAll<HTMLElement>("[data-story-marker]"));
        const activate = (i: number) => {
          story.dataset.active = String(i);
          panels.forEach((p, j) => p.classList.toggle("is-active", i === j));
          steps.forEach((s, j) => s.classList.toggle("is-active", i === j));
          markers.forEach((m, j) => m.classList.toggle("is-active", i === j));
        };
        steps.forEach((step, i) => {
          ScrollTrigger.create({
            trigger: step,
            start: "top 62%",
            end: "bottom 62%",
            onToggle: (self) => self.isActive && activate(i),
          });
        });
      });

      // Marcadores que acendem ao serem alcançados
      q<HTMLElement>("[data-activate]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 68%",
          onEnter: () => el.classList.add("is-active"),
          onLeaveBack: () => el.classList.remove("is-active"),
        });
      });

      if (reduce) return;

      /* ---------- Movimento (somente sem preferência de redução) ---------- */

      // Passagem claro → escuro: o bloco escuro se expande das margens
      q<HTMLElement>('[data-tone-section="ink"], [data-tone-section="green"]').forEach((el) => {
        if (el.getBoundingClientRect().top + window.scrollY < window.innerHeight * 0.5) return;
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 2.5% 0% 2.5% round 28px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 35%", scrub: true },
          },
        );
      });

      q<HTMLElement>("[data-reveal]").forEach((el) => {
        const mode = el.dataset.reveal;
        const targets = mode === "stagger" ? Array.from(el.children) : el;
        const fromY = mode === "fade" ? 0 : 36;
        gsap.fromTo(
          targets,
          { opacity: 0, y: fromY },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "expo.out",
            delay: num(el.dataset.delay, 0),
            stagger: mode === "stagger" ? num(el.dataset.stagger, 0.09) : 0,
            clearProps: "transform",
            scrollTrigger: el.dataset.load !== undefined ? undefined : { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      q<HTMLElement>("[data-split]").forEach((el) => {
        const onLoad = el.dataset.split === "load";
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { opacity: 1 });
            return gsap.from(self.lines, {
              yPercent: 112,
              duration: 1.35,
              ease: "expo.out",
              stagger: 0.085,
              delay: num(el.dataset.delay, onLoad ? 0.15 : 0),
              scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 90%", once: true },
            });
          },
        });
      });

      q<HTMLElement>("[data-mask]").forEach((el) => {
        const dir = el.dataset.mask || "up";
        const from =
          dir === "left" ? "inset(0% 100% 0% 0%)" : dir === "center" ? "inset(18% 18% 18% 18%)" : "inset(100% 0% 0% 0%)";
        const img = el.querySelector("img, .photo__slot");
        const tl = gsap.timeline({
          delay: num(el.dataset.delay, 0),
          scrollTrigger: el.dataset.load !== undefined ? undefined : { trigger: el, start: "top 85%", once: true },
        });
        tl.fromTo(el, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" });
        if (img) tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.9, ease: "expo.out" }, 0.1);
      });

      // Entrada lateral. Em telas largas, os elementos de uma seção entram
      // juntos; no celular (empilhados), cada um entra ao chegar à tela.
      const wide = window.matchMedia("(min-width: 900px)").matches;
      q<HTMLElement>("[data-slide]").forEach((el) => {
        const sign = el.dataset.slide === "right" ? 1 : -1;
        const img = el.querySelector("img");
        const group = wide ? el.closest("section") : null;
        const tl = gsap.timeline({
          delay: num(el.dataset.delay, 0) * (group ? 1 : 0.4),
          scrollTrigger: group
            ? { trigger: group, start: "top 65%", once: true }
            : { trigger: el, start: "top 88%", once: true },
        });
        tl.fromTo(
          el,
          { opacity: 0, xPercent: sign * num(el.dataset.distance, 35) },
          { opacity: 1, xPercent: 0, duration: 1.6, ease: "expo.out", clearProps: "transform" },
        );
        if (img) tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 2, ease: "expo.out", clearProps: "transform" }, 0);
      });

      q<HTMLElement>("[data-parallax]").forEach((el) => {
        const amt = num(el.dataset.parallax, 10);
        gsap.fromTo(
          el,
          { yPercent: -amt },
          {
            yPercent: amt,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      q<HTMLElement>("[data-drift]").forEach((el) => {
        const amt = num(el.dataset.drift, 8);
        gsap.fromTo(
          el,
          { xPercent: amt },
          {
            xPercent: -amt,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      q<SVGGeometryElement>("[data-draw]").forEach((el) => {
        const mode = (el as unknown as HTMLElement).dataset.draw;
        const trigger = el.closest("[data-draw-trigger]") || el;
        const delay = num((el as unknown as HTMLElement).dataset.delay, 0);
        if (mode === "scrub") {
          gsap.fromTo(
            el,
            { drawSVG: "0%" },
            { drawSVG: "100%", ease: "none", scrollTrigger: { trigger, start: "top 75%", end: "bottom 45%", scrub: 0.6 } },
          );
        } else {
          gsap.fromTo(
            el,
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              duration: num((el as unknown as HTMLElement).dataset.duration, 1.8),
              ease: "power2.inOut",
              delay,
              scrollTrigger: mode === "load" ? undefined : { trigger, start: "top 80%", once: true },
            },
          );
        }
      });

      q<HTMLElement>("[data-progress]").forEach((el) => {
        const track = el.closest("[data-progress-track]") || el.parentElement || el;
        gsap.fromTo(
          el,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: track, start: "top 65%", end: "bottom 65%", scrub: 0.4 },
          },
        );
      });

      q<HTMLElement>("[data-count]").forEach((el) => {
        const target = num(el.dataset.count, 0);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      });
    });

    root.classList.add("motion-ready");

    // Recalcula posições quando fontes, imagens ou conteúdo mudam a altura da página.
    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    };
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    let lastHeight = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastHeight) > 2) {
        lastHeight = h;
        refresh();
      }
    });
    ro.observe(document.body);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", refresh);
      ro.disconnect();
      ctx.revert();
      delete root.dataset.headerTone;
    };
  }, []);

  return null;
}
