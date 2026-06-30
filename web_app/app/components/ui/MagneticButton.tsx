"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { SPRING_SOFT } from "../../lib/motion";

type Variant = "primary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  // Dark ink on bright primary — verified ~7:1 (white-on-primary would fail AA)
  primary: "bg-primary text-canvas hover:bg-primary-bright",
  ghost: "border border-line text-ink hover:bg-surface-2",
};

/**
 * CTA with a subtle magnetic pull toward the cursor. Driven by motion values
 * (never React state), pointer-gated to fine pointers, and inert under reduced
 * motion. The label drifts slightly more than the shell for parallax depth.
 */
export function MagneticButton({
  children,
  href,
  variant = "primary",
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING_SOFT);
  const sy = useSpring(y, SPRING_SOFT);
  // Label drifts a touch more than the shell for parallax depth
  const lx = useSpring(x, { stiffness: 220, damping: 20 });
  const ly = useSpring(y, { stiffness: 220, damping: 20 });

  function handleMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition-colors duration-200 ${VARIANTS[variant]} ${className}`}
    >
      <motion.span style={{ x: lx, y: ly }} className="inline-flex items-center gap-2">
        {children}
      </motion.span>
    </motion.a>
  );
}
