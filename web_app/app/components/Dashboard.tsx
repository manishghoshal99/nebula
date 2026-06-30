"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";
import { Wind, Gauge, CheckCircle, XCircle, Flask, Clock, Pulse } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "./ui/Card";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { ResponsiveChart } from "./ui/ResponsiveChart";

// ─── Domain ─────────────────────────────────────────────────────

type GasType = "Ammonia" | "Acetaldehyde" | "Acetone" | "Ethylene" | "Ethanol" | "Toluene";

const GASES: GasType[] = ["Ammonia", "Acetaldehyde", "Acetone", "Ethylene", "Ethanol", "Toluene"];

const SIGNATURES: Record<GasType, number[]> = {
  Ammonia: [0.8, 0.7, 0.2, 0.1, 0.9, 0.8, 0.3, 0.2, 0.1, 0.1, 0.5, 0.4, 0.1, 0.1, 0.6, 0.5],
  Acetaldehyde: [0.2, 0.3, 0.8, 0.9, 0.1, 0.2, 0.7, 0.8, 0.1, 0.1, 0.2, 0.3, 0.9, 0.8, 0.2, 0.1],
  Acetone: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  Ethylene: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.9, 0.9, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  Ethanol: [0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4],
  Toluene: [0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2],
};

const RESPONSE_MAX = 120;
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// Saturating sensor response; drift adds jitter and suppresses responsive channels.
function simulateResponse(gas: GasType, concentration: number, drift: number): number[] {
  const base = SIGNATURES[gas];
  const saturation = concentration / (concentration + 1.5);
  return base.map((v) => {
    const signal = v * RESPONSE_MAX * saturation * 1.3;
    const noise = (Math.random() - 0.5) * drift * 18;
    const aging = -drift * 14 * v;
    return clamp(signal + noise + aging, 0, RESPONSE_MAX);
  });
}

function nearestGas(gas: GasType): GasType {
  const a = SIGNATURES[gas];
  let best: GasType = gas === GASES[0] ? GASES[1] : GASES[0];
  let bestDist = Infinity;
  for (const g of GASES) {
    if (g === gas) continue;
    const b = SIGNATURES[g];
    let dist = 0;
    for (let i = 0; i < a.length; i++) dist += (a[i] - b[i]) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = g;
    }
  }
  return best;
}

// Deterministic classifier: accuracy falls smoothly with drift and very low dose.
function simulatePrediction(gas: GasType, drift: number, concentration: number) {
  let acc = 0.96;
  acc -= drift * 0.55;
  if (concentration < 0.6) acc -= (0.6 - concentration) * 0.7;
  acc = clamp(acc, 0.06, 0.99);
  const accuracy = Math.round(acc * 100);
  const correct = acc >= 0.5;
  if (correct) return { prediction: gas, confidence: accuracy, correct, accuracy };
  return {
    prediction: nearestGas(gas),
    confidence: clamp(Math.round((1 - acc) * 100), 34, 96),
    correct,
    accuracy,
  };
}

interface HistoryPoint {
  time: number;
  drift: number;
  accuracy: number;
}

const tooltip = {
  contentStyle: {
    background: "oklch(0.085 0.016 258)",
    border: "1px solid oklch(0.32 0.02 256)",
    borderRadius: "0.75rem",
    color: "oklch(0.97 0.004 256)",
    fontSize: "12px",
  },
  labelStyle: { color: "oklch(0.6 0.02 256)" },
};
const axis = { fill: "oklch(0.6 0.02 256)", fontSize: 11 };
const grid = "oklch(0.3 0.02 256 / 0.25)";
const C_PRIMARY = "oklch(0.62 0.17 256)";

export function Dashboard() {
  const reduce = useReducedMotion();
  const [gasType, setGasType] = useState<GasType>("Ammonia");
  const [concentration, setConcentration] = useState(1.0);
  const [driftLevel, setDriftLevel] = useState(0.0);
  const [sensorData, setSensorData] = useState<{ sensor: string; value: number; fullMark: number }[]>([]);
  const [result, setResult] = useState<ReturnType<typeof simulatePrediction> | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [step, setStep] = useState(0);

  const update = useCallback(() => {
    const response = simulateResponse(gasType, concentration, driftLevel);
    setSensorData(response.map((value, i) => ({ sensor: `S${i + 1}`, value, fullMark: RESPONSE_MAX })));
    const pred = simulatePrediction(gasType, driftLevel, concentration);
    setResult(pred);
    setHistory((prev) => {
      const next = [...prev, { time: prev.length, drift: Math.round(driftLevel * 100), accuracy: pred.accuracy }];
      return next.length > 20 ? next.slice(-20) : next;
    });
    setStep((s) => s + 1);
  }, [gasType, concentration, driftLevel]);

  useEffect(() => {
    update();
  }, [update]);

  // Live readout: re-sample sensor noise without hijacking the user's sliders.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setSensorData(
        simulateResponse(gasType, concentration, driftLevel).map((value, i) => ({
          sensor: `S${i + 1}`,
          value,
          fullMark: RESPONSE_MAX,
        })),
      );
    }, 2500);
    return () => clearInterval(id);
  }, [reduce, gasType, concentration, driftLevel]);

  return (
    <section id="lab" className="relative px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Probe the model live."
          intro="Pick a gas, set the dose, then turn up sensor drift and watch the 16-channel fingerprint distort until the classifier breaks."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Controls */}
          <Reveal className="lg:col-span-4" y={24}>
            <div className="space-y-6">
              <Card title="Target gas" icon={<Wind className="h-4 w-4" weight="bold" />}>
                <div className="grid grid-cols-2 gap-2">
                  {GASES.map((g) => (
                    <motion.button
                      key={g}
                      onClick={() => setGasType(g)}
                      whileTap={reduce ? undefined : { scale: 0.97 }}
                      className={`rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200 ${
                        gasType === g
                          ? "border-primary/60 bg-primary/12 text-primary-bright"
                          : "border-line-soft text-ink-3 hover:border-line hover:text-ink"
                      }`}
                    >
                      {g}
                    </motion.button>
                  ))}
                </div>
              </Card>

              <Card title="Concentration" icon={<Flask className="h-4 w-4" weight="bold" />}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-ink-3">Dose level</span>
                  <span className="rounded bg-primary/12 px-2 py-0.5 font-mono text-sm tabular-nums text-primary-bright">
                    {concentration.toFixed(1)} ppm
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={concentration}
                  onChange={(e) => setConcentration(parseFloat(e.target.value))}
                  aria-label="Concentration in ppm"
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, var(--color-primary) ${(concentration / 5) * 100}%, var(--color-line-soft) ${(concentration / 5) * 100}%)`,
                  }}
                />
                <div className="mt-2 flex justify-between text-[11px] text-ink-3">
                  <span>0.1</span>
                  <span>5.0</span>
                </div>
              </Card>

              <Card title="Sensor drift" icon={<Clock className="h-4 w-4" weight="bold" />}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-ink-3">Aging</span>
                  <span className="rounded bg-warn/12 px-2 py-0.5 font-mono text-sm tabular-nums text-warn">
                    {(driftLevel * 36).toFixed(0)} months
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={driftLevel}
                  onChange={(e) => setDriftLevel(parseFloat(e.target.value))}
                  aria-label="Sensor drift level"
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, var(--color-warn) ${driftLevel * 100}%, var(--color-line-soft) ${driftLevel * 100}%)`,
                  }}
                />
                <div className="mt-2 flex justify-between text-[11px] text-ink-3">
                  <span>Fresh</span>
                  <span>Severe</span>
                </div>
              </Card>

              {result && (
                <Card variant={result.correct ? "primary" : "accent"}>
                  <div className="mono-label mb-4">Live prediction</div>
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <div className="mb-1 text-[11px] text-ink-3">Predicted gas</div>
                      <div
                        className={`text-2xl font-semibold ${
                          result.correct ? "text-success" : "text-danger"
                        }`}
                      >
                        {result.prediction}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1 text-[11px] text-ink-3">Confidence</div>
                      <div className="font-mono text-2xl font-semibold tabular-nums text-ink">
                        {result.confidence}%
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line-soft">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${result.confidence}%`,
                        background: result.correct ? "var(--color-success)" : "var(--color-danger)",
                      }}
                    />
                  </div>
                  <div
                    className={`flex items-start gap-2.5 rounded-lg p-3 text-sm ${
                      result.correct ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {result.correct ? (
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
                    )}
                    <span>
                      {result.correct
                        ? `Identified ${gasType} at ${result.accuracy}% modeled accuracy.`
                        : `Misread as ${result.prediction}. Drift has distorted the signature past the decision boundary.`}
                    </span>
                  </div>
                </Card>
              )}

              <div className="flex items-center gap-4 px-1 text-xs text-ink-3">
                <span className="flex items-center gap-1.5">
                  <Pulse className="h-3.5 w-3.5 text-success" weight="bold" />
                  Live
                </span>
                <span>Step {step}</span>
                <span>Re-samples 2.5s</span>
              </div>
            </div>
          </Reveal>

          {/* Charts */}
          <Reveal className="lg:col-span-8" y={24} delay={0.1}>
            <div className="space-y-6">
              <Card title="Sensor array fingerprint" icon={<Gauge className="h-4 w-4" weight="bold" />}>
                <div className="h-[360px] w-full min-w-0">
                  <ResponsiveChart>
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={sensorData}>
                      <PolarGrid stroke={grid} />
                      <PolarAngleAxis dataKey="sensor" tick={{ fill: "oklch(0.6 0.02 256)", fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, RESPONSE_MAX]} tick={false} axisLine={false} />
                      <Radar
                        dataKey="value"
                        stroke={C_PRIMARY}
                        strokeWidth={2}
                        fill={C_PRIMARY}
                        fillOpacity={0.22}
                        animationDuration={reduce ? 0 : 500}
                      />
                      <Tooltip {...tooltip} />
                    </RadarChart>
                  </ResponsiveChart>
                </div>
                <p className="mt-2 text-center text-xs text-ink-3">
                  16-channel response signature. Each gas paints a distinct shape.
                </p>
              </Card>

              <Card title="Response magnitude" icon={<Gauge className="h-4 w-4" weight="bold" />}>
                <div className="h-[240px] w-full min-w-0">
                  <ResponsiveChart>
                    <BarChart data={sensorData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                      <XAxis dataKey="sensor" tick={axis} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, RESPONSE_MAX]} tick={axis} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltip} cursor={{ fill: "oklch(0.3 0.02 256 / 0.18)" }} />
                      <Bar dataKey="value" radius={[3, 3, 0, 0]} animationDuration={reduce ? 0 : 400}>
                        {sensorData.map((_, i) => (
                          <Cell key={i} fill={`oklch(${0.55 + i * 0.012} 0.16 256)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveChart>
                </div>
              </Card>

              {history.length > 1 && (
                <Card title="Drift and accuracy over time" icon={<Clock className="h-4 w-4" weight="bold" />}>
                  <div className="h-[220px] w-full min-w-0">
                    <ResponsiveChart>
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                        <XAxis dataKey="time" tick={axis} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
                        <Tooltip {...tooltip} />
                        <Legend wrapperStyle={{ fontSize: "12px", color: "oklch(0.6 0.02 256)" }} />
                        <Line
                          type="monotone"
                          dataKey="drift"
                          name="Drift %"
                          stroke="oklch(0.8 0.14 72)"
                          strokeWidth={2}
                          dot={false}
                          animationDuration={reduce ? 0 : 300}
                        />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          name="Accuracy %"
                          stroke="oklch(0.72 0.15 162)"
                          strokeWidth={2}
                          dot={false}
                          animationDuration={reduce ? 0 : 300}
                        />
                      </LineChart>
                    </ResponsiveChart>
                  </div>
                  <p className="mt-2 text-xs text-ink-3">
                    As you raise drift, modeled accuracy falls. CORAL is what buys it back on real data.
                  </p>
                </Card>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
