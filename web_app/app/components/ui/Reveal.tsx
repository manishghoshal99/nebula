"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT_EXPO } from "../../lib/motion";

/**
 * Scroll-reveal wrapper. Content is visible by default (SSR-safe); the reveal
 * only enhances. Degrades to an instant show under reduced motion.
 */
export function Reveal({
  children,
  y = 24,
  delay = 0,
  duration = 0.6,
  amount = 0.25,
  className,
}: {
  children: ReactNode;
  y?: number;
  delay?: number;
  duration?: number;
  amount?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
