"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowsLeftRight } from "@phosphor-icons/react";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { CoralMorph } from "./viz/CoralMorph";
import { EASE_OUT_EXPO } from "../lib/motion";

type Tone = "good" | "bad" | "muted";

const SHIFTS = {
  temporal: {
    label: "Temporal drift",
    caption: "Train batches 1-5, test batch 10. Sensors age over months.",
    rows: [
      { name: "Baseline MLP", acc: 47.0, tone: "muted" as Tone },
      { name: "CORAL + Robust MLP", acc: 79.9, tone: "good" as Tone },
    ],
    ok: true,
    verdict:
      "CORAL aligns the covariance across time, so the decision boundary transfers. Accuracy climbs from 47% to 79.9%.",
  },
  concentration: {
    label: "Concentration shift",
    caption: "Train on low and medium dose, test on high dose.",
    rows: [
      { name: "Baseline MLP", acc: 95.2, tone: "muted" as Tone },
      { name: "CORAL + MLP", acc: 50.7, tone: "bad" as Tone },
      { name: "Residualization + MLP", acc: 83.5, tone: "good" as Tone },
    ],
    ok: false,
    verdict:
      "Here CORAL backfires. Aligning distributions erases the dose-response signal and collapses to 50.7%. Residualization strips dose bias instead and holds 83.5%.",
  },
} as const;

type ShiftKey = keyof typeof SHIFTS;

const BAR: Record<Tone, string> = {
  good: "bg-primary",
  bad: "bg-danger",
  muted: "bg-ink-3/40",
};

function ShiftCompare() {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<ShiftKey>("temporal");
  const d = SHIFTS[tab];

  return (
    <div className="rounded-2xl border border-line-soft bg-surface p-5 edge-light sm:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="lg:max-w-xs">
          <div className="inline-flex rounded-full border border-line-soft bg-canvas p-1">
            {(Object.keys(SHIFTS) as ShiftKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`relative rounded-full px-4 py-1.5 text-sm transition-colors duration-200 ${
                  tab === k ? "text-canvas" : "text-ink-3 hover:text-ink"
                }`}
              >
                {tab === k && (
                  <motion.span
                    layoutId="shift-tab"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <span className="relative">{SHIFTS[k].label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-3">{d.caption}</p>
          <p
            className={`mt-4 text-sm leading-relaxed ${d.ok ? "text-ink-2" : "text-warn"}`}
          >
            {d.verdict}
          </p>
        </div>

        <div className="flex-1 space-y-5">
          {d.rows.map((r, i) => (
            <div key={`${tab}-${r.name}`}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-ink-2">{r.name}</span>
                <span className="font-mono tabular-nums text-ink">{r.acc.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-line-soft">
                <motion.div
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${r.acc}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: EASE_OUT_EXPO }}
                  className={`h-full rounded-full ${BAR[r.tone]}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Solution() {
  return (
    <section id="solution" className="relative px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title={
            <>
              Two shifts. <span className="text-primary-bright">Two</span> fixes.
            </>
          }
          intro="Temporal drift and concentration shift both wreck a sensor classifier, but for opposite reasons. Align the wrong statistic and accuracy gets worse, not better."
        />

        <Reveal className="mt-14" y={32}>
          <div className="rounded-2xl border border-line-soft bg-surface p-5 edge-light sm:p-8">
            <div className="mb-6 flex items-center gap-2 text-sm text-ink-2">
              <ArrowsLeftRight weight="bold" className="h-4 w-4 text-primary" />
              Temporal drift, aligned with CORAL
            </div>
            <CoralMorph />
          </div>
        </Reveal>

        <Reveal className="mt-8" y={32}>
          <ShiftCompare />
        </Reveal>
      </div>
    </section>
  );
}
