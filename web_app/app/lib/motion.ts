// Shared motion language. Emil-grade easing curves (the CSS built-ins are too
// weak). Every consumer gates on prefers-reduced-motion at the call site.

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT_STRONG = [0.77, 0, 0.175, 1] as const;

// useSpring configs (no `type` field — that's only for animate transitions)
export const SPRING_SOFT = { stiffness: 150, damping: 18, mass: 0.6 };
export const SPRING_SNAPPY = { stiffness: 320, damping: 30 };

export const fadeUp = (y = 24, duration = 0.6) => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: EASE_OUT_EXPO },
  },
});

export const staggerParent = (staggerChildren = 0.06, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});
