"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChartLineUp } from "@phosphor-icons/react";
import { DriftField } from "./viz/DriftField";
import { MagneticButton } from "./ui/MagneticButton";
import { fadeUp, staggerParent } from "../lib/motion";

export function Hero() {
  const reduce = useReducedMotion();
  const parent = staggerParent(0.1, 0.15);
  const child = fadeUp(28, 0.7);

  return (
    <section className="relative isolate flex min-h-[100dvh] items-center px-5 pt-28 pb-16 sm:px-8 lg:pt-20">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Left — message */}
        <motion.div
          variants={reduce ? undefined : parent}
          initial={reduce ? false : "hidden"}
          animate="visible"
          className="max-w-xl"
        >
          <motion.p variants={reduce ? undefined : child} className="mono-label mb-5">
            Domain adaptation · UCI gas sensor array
          </motion.p>

          <motion.h1
            variants={reduce ? undefined : child}
            className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.02] text-ink"
          >
            Gas classification that <span className="text-primary-bright">survives</span> sensor
            drift.
          </motion.h1>

          <motion.p
            variants={reduce ? undefined : child}
            className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-2"
          >
            Sensor arrays drift for months. CORAL realigns the distribution and residualization
            strips dose bias, holding accuracy where baselines collapse.
          </motion.p>

          <motion.div
            variants={reduce ? undefined : child}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <MagneticButton href="#solution">
              Explore the method
              <ArrowRight weight="bold" className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href="#results" variant="ghost">
              <ChartLineUp weight="bold" className="h-4 w-4" />
              See the results
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Right — live drift field instrument */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative"
        >
          <div
            className="pointer-events-none absolute -inset-10 -z-10 opacity-70"
            style={{
              background:
                "radial-gradient(circle at 60% 40%, oklch(0.62 0.17 256 / 0.18), transparent 60%)",
            }}
          />
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line-soft bg-canvas/60 edge-light sm:aspect-[5/4] lg:aspect-square">
            <DriftField className="absolute inset-0" />
            {/* instrument corner ticks */}
            <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-line" />
            <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-line" />
            <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-line" />
            <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-line" />
            <span className="mono-label absolute bottom-3 left-1/2 -translate-x-1/2 !text-[10px]">
              sensor manifold · 16 channels
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
