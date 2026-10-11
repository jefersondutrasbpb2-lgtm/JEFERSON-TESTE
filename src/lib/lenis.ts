import type Lenis from "lenis";

/** Instância única do Lenis, compartilhada entre componentes. */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;
