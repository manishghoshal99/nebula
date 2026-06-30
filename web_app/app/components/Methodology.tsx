"use client";

import { motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { EASE_OUT_EXPO } from "../lib/motion";

const STEPS = [
  {
    n: "01",
    title: "Capture",
    body: "Sixteen metal-oxide sensors log conductance across 10 batches spanning 36 months of continuous operation.",
  },
  {
    n: "02",
    title: "Detect the drift",
    body: "A t-SNE projection shows early and late batches pulling apart while the six gas classes stay internally coherent.",
  },
  {
    n: "03",
    title: "Align with CORAL",
    body: "Recolor the target domain's covariance to match the source. No target labels required.",
  },
  {
    n: "04",
    title: "Residualize the dose",
    body: "Regress out concentration so the model reads which gas is present, not how much of it there is.",
  },
  {
    n: "05",
    title: "Classify",
    body: "A Robust MLP with batch-norm and dropout, tuned by Optuna, reads the realigned signature.",
  },
];

const FACTS = [
  { v: "~13k", k: "recordings" },
  { v: "16", k: "sensors" },
  { v: "6", k: "gases" },
  { v: "36mo", k: "of aging" },
];

export function Methodology() {
  const reduce = useReducedMotion();

  return (
    <section id="method" className="relative px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="How a reading survives the pipeline."
          intro="From raw conductance to a drift-proof verdict, each stage targets one failure mode the previous stage cannot fix."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="leading-relaxed text-ink-2">
                Built on the UCI Gas Sensor Array Drift dataset: thousands of recordings captured as
                the hardware physically aged, the canonical benchmark for distribution shift in
                chemical sensing.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft">
                {FACTS.map((f) => (
                  <div key={f.k} className="bg-surface p-5">
                    <div className="font-mono text-2xl font-semibold tabular-nums text-ink">{f.v}</div>
                    <div className="mt-1 text-xs text-ink-3">{f.k}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="relative">
            <div className="absolute bottom-3 left-[19px] top-3 w-px bg-line-soft" aria-hidden />
            <ol className="space-y-8">
              {STEPS.map((s, i) => (
                <motion.li
                  key={s.n}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT_EXPO }}
                  className="relative flex gap-5"
                >
                  <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-sm text-primary-bright">
                    {s.n}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-base font-medium text-ink">{s.title}</h3>
                    <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-ink-3">{s.body}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
