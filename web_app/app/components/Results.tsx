"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { ResponsiveChart } from "./ui/ResponsiveChart";
import { Card } from "./ui/Card";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { EASE_OUT_EXPO } from "../lib/motion";

const C_PRIMARY = "oklch(0.62 0.17 256)";
const C_MUTED = "oklch(0.5 0.02 256)";
const C_SUCCESS = "oklch(0.72 0.15 162)";

const temporalData = [
  { scenario: "Severe", "CORAL + MLP": 79.9, Stacking: 65.4 },
  { scenario: "Moderate", "CORAL + MLP": 76.6, Stacking: 82.4 },
  { scenario: "Immediate", "CORAL + MLP": 55.6, Stacking: 53.9 },
];

const archData = [
  { name: "Transformer", acc: 64.3 },
  { name: "Robust MLP", acc: 78.3 },
];

const trajData = [
  { stage: "Baseline", acc: 47 },
  { stage: "+ CORAL", acc: 54 },
  { stage: "+ Robust MLP", acc: 79.9 },
];

const tooltip = {
  contentStyle: {
    background: "oklch(0.085 0.016 258)",
    border: "1px solid oklch(0.32 0.02 256)",
    borderRadius: "0.75rem",
    color: "oklch(0.97 0.004 256)",
    fontSize: "12px",
  },
  labelStyle: { color: "oklch(0.6 0.02 256)" },
  cursor: { fill: "oklch(0.3 0.02 256 / 0.18)" },
};

const axis = { fill: "oklch(0.6 0.02 256)", fontSize: 12 };
const grid = "oklch(0.3 0.02 256 / 0.25)";

const STATS = [
  { to: 79.9, dec: 1, suffix: "%", sign: "", label: "Severe-drift accuracy", sub: "CORAL + Robust MLP" },
  { to: 33, dec: 0, suffix: " pts", sign: "+", label: "Gain over baseline", sub: "47% → 79.9%" },
  { to: 83.5, dec: 1, suffix: "%", sign: "", label: "Concentration accuracy", sub: "Residualization" },
  { to: 78.3, dec: 1, suffix: "%", sign: "", label: "MLP over Transformer", sub: "vs 64.3% on tabular" },
];

const INSIGHTS = [
  {
    title: "Different shifts, different fixes",
    body: "Temporal drift needs covariance alignment (CORAL). Concentration shift needs dose-bias removal (residualization). One method cannot do both.",
  },
  {
    title: "Alignment beats ensembles under severe drift",
    body: "CORAL + Robust MLP reaches 79.9% where a Random-Forest/SVM stack manages 65.4%, a 14.5-point gap.",
  },
  {
    title: "MLP inductive bias wins on tabular data",
    body: "At ~13k samples the Robust MLP scores 78.3% against a sensor-tokenized Transformer's 64.3%.",
  },
];

function Counter({
  to,
  dec = 0,
  suffix = "",
  sign = "",
}: {
  to: number;
  dec?: number;
  suffix?: string;
  sign?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: EASE_OUT_EXPO,
      onUpdate: (x) => setV(x),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {sign}
      {v.toFixed(dec)}
      {suffix}
    </span>
  );
}

export function Results() {
  return (
    <section id="results" className="relative px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Results that hold under drift."
          intro="Every number below comes from the held-out evaluation: train on early batches, test on the drifted batch the model never saw."
        />

        {/* Stat row — mono numbers, hairline dividers, no gradient */}
        <Reveal className="mt-12" y={24}>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-surface p-6">
                <div className="text-3xl font-semibold text-ink sm:text-4xl">
                  <Counter to={s.to} dec={s.dec} suffix={s.suffix} sign={s.sign} />
                </div>
                <div className="mt-2 text-sm text-ink-2">{s.label}</div>
                <div className="mt-0.5 text-xs text-ink-3">{s.sub}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Wide chart */}
        <Reveal className="mt-8" y={24}>
          <Card title="Temporal drift across severity">
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveChart>
                <BarChart data={temporalData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="scenario" tick={axis} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltip} />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "oklch(0.6 0.02 256)" }} />
                  <Bar dataKey="CORAL + MLP" fill={C_PRIMARY} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Stacking" fill={C_MUTED} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveChart>
            </div>
            <p className="mt-3 text-sm text-ink-3">
              CORAL + Robust MLP dominates under severe aging. Stacking edges ahead only when drift
              is mild, an honest trade-off the system exposes rather than hides.
            </p>
          </Card>
        </Reveal>

        {/* Two smaller charts */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Reveal y={24}>
            <Card title="Architecture: MLP vs Transformer">
              <div className="h-[240px] w-full min-w-0">
                <ResponsiveChart>
                  <BarChart data={archData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltip} />
                    <Bar dataKey="acc" radius={[4, 4, 0, 0]} barSize={64}>
                      {archData.map((e) => (
                        <Cell key={e.name} fill={e.name === "Robust MLP" ? C_PRIMARY : C_MUTED} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveChart>
              </div>
            </Card>
          </Reveal>

          <Reveal y={24} delay={0.08}>
            <Card title="Improvement trajectory">
              <div className="h-[240px] w-full min-w-0">
                <ResponsiveChart>
                  <BarChart data={trajData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="stage" tick={axis} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltip} />
                    <Bar dataKey="acc" radius={[4, 4, 0, 0]} barSize={56}>
                      {trajData.map((e, i) => (
                        <Cell key={e.stage} fill={i === trajData.length - 1 ? C_SUCCESS : C_MUTED} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveChart>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Findings — hairline-divided numbered sequence, not cards */}
        <Reveal className="mt-12" y={24}>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft sm:grid-cols-3">
            {INSIGHTS.map((it, i) => (
              <div key={it.title} className="bg-surface p-6">
                <div className="font-mono text-sm text-primary-bright">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 text-base font-medium text-ink">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">{it.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
