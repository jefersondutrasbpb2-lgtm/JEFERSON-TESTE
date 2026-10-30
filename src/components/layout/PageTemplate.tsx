import { MotionDirector } from "@/components/motion/MotionDirector";

/** Recriado a cada navegação: reinicia as animações da página. */
export function PageTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      {children}
      <MotionDirector />
    </div>
  );
}
