"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { EASE_OUT_EXPO } from "../../lib/motion";

// Source feature distribution (2D projection), shared shape for both domains.
const MEAN: [number, number] = [-0.12, 0.05];
const L: [number, number, number, number] = [0.4, 0.08, 0.08, 0.28]; // covariance factor
const COUNT = 90;

// Drift = rotate + anisotropic scale + shift applied to the aligned cloud.
const THETA = (28 * Math.PI) / 180;
const SX = 1.4;
const SY = 0.62;
const SHIFT: [number, number] = [0.55, -0.42];

const A00 = Math.cos(THETA) * SX;
const A01 = -Math.sin(THETA) * SY;
const A10 = Math.sin(THETA) * SX;
const A11 = Math.cos(THETA) * SY;

function randn() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Accuracy mirrors the paper: CORAL+MLP recovers concentration-shift accuracy.
const ACC_LOW = 50.7;
const ACC_HIGH = 79.9;

export function CoralMorph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef, { once: true, amount: 0.4 });

  const [align, setAlign] = useState(0); // 0..100
  const alignRef = useRef(0);
  useEffect(() => {
    alignRef.current = align / 100;
  }, [align]);

  // Auto-demo once when scrolled into view
  const demoed = useRef(false);
  useEffect(() => {
    if (!inView || demoed.current) return;
    demoed.current = true;
    if (reduce) {
      setAlign(100);
      return;
    }
    const controls = animate(0, 100, {
      duration: 2,
      delay: 0.3,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => setAlign(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce]);

  // Canvas render loop (reads alignRef so slider/demo don't re-init points)
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let w = 0;
    let h = 0;
    let t = 0;

    // source = absolute; target = centered (drift transform applied per frame)
    const source: Array<[number, number, number]> = [];
    const target: Array<[number, number, number]> = [];
    for (let i = 0; i < COUNT; i++) {
      const s1 = randn();
      const s2 = randn();
      source.push([L[0] * s1 + L[1] * s2 + MEAN[0], L[2] * s1 + L[3] * s2 + MEAN[1], Math.random() * 6.28]);
      const t1 = randn();
      const t2 = randn();
      target.push([L[0] * t1 + L[1] * t2, L[2] * t1 + L[3] * t2, Math.random() * 6.28]);
    }

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const map = (wx: number, wy: number): [number, number] => [
      w / 2 + wx * w * 0.3,
      h / 2 - wy * h * 0.32,
    ];

    const ellipse = (
      mfn: (vx: number, vy: number) => [number, number],
      color: string,
    ) => {
      ctx.beginPath();
      for (let k = 0; k <= 48; k++) {
        const a = (k / 48) * 6.2832;
        const bx = Math.cos(a) * 1.9;
        const by = Math.sin(a) * 1.9;
        const [ex, ey] = mfn(L[0] * bx + L[1] * by, L[2] * bx + L[3] * by);
        const [px, py] = map(ex, ey);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const p = alignRef.current;

      // crosshair grid
      ctx.strokeStyle = "oklch(0.3 0.02 256 / 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // drift transform interpolated toward identity by p
      const m00 = (1 - p) * A00 + p;
      const m01 = (1 - p) * A01;
      const m10 = (1 - p) * A10;
      const m11 = (1 - p) * A11 + p;
      const tx = (1 - p) * SHIFT[0];
      const ty = (1 - p) * SHIFT[1];

      // covariance ellipses
      ellipse((vx, vy) => [vx + MEAN[0], vy + MEAN[1]], "oklch(0.66 0.16 256 / 0.5)");
      ellipse(
        (vx, vy) => [m00 * vx + m01 * vy + MEAN[0] + tx, m10 * vx + m11 * vy + MEAN[1] + ty],
        "oklch(0.8 0.14 72 / 0.55)",
      );

      // source points (blue, static)
      for (const [x, y, ph] of source) {
        const tw = reduce ? 0.8 : 0.7 + 0.3 * Math.sin(ph + t * 0.04);
        const [px, py] = map(x, y);
        ctx.beginPath();
        ctx.arc(px, py, 2.1, 0, 6.2832);
        ctx.fillStyle = `oklch(0.72 0.16 256 / ${0.85 * tw})`;
        ctx.fill();
      }

      // target points (amber, morphing)
      for (const [cx, cy, ph] of target) {
        const wx = m00 * cx + m01 * cy + MEAN[0] + tx;
        const wy = m10 * cx + m11 * cy + MEAN[1] + ty;
        const [px, py] = map(wx, wy);
        const tw = reduce ? 0.8 : 0.7 + 0.3 * Math.sin(ph + t * 0.05);
        ctx.beginPath();
        ctx.arc(px, py, 2.1, 0, 6.2832);
        ctx.fillStyle = `oklch(0.82 0.15 72 / ${0.85 * tw})`;
        ctx.fill();
      }

      t += 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => resize());
    ro.observe(parent);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce]);

  const acc = ACC_LOW + (ACC_HIGH - ACC_LOW) * (1 - Math.pow(1 - align / 100, 3));
  const aligned = align > 55;

  return (
    <div ref={wrapRef} className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line-soft bg-canvas sm:aspect-[16/10]">
        <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-xs text-ink-2">
            <span className="h-2 w-2 rounded-full bg-primary" /> Source · batches 1-5
          </span>
          <span className="flex items-center gap-2 text-xs text-ink-2">
            <span className="h-2 w-2 rounded-full bg-warn" /> Target · batch 10
          </span>
        </div>
      </div>

      <div>
        <div className="mono-label mb-3">CORAL alignment</div>
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-mono text-5xl font-semibold tabular-nums text-ink">
            {acc.toFixed(1)}
          </span>
          <span className="text-2xl text-ink-3">%</span>
        </div>
        <p className="mb-5 text-sm text-ink-3">target-domain accuracy</p>

        <input
          type="range"
          min={0}
          max={100}
          value={align}
          onChange={(e) => setAlign(Number(e.target.value))}
          aria-label="CORAL alignment strength"
          className="w-full"
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${align}%, var(--color-line-soft) ${align}%, var(--color-line-soft) 100%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-[11px] text-ink-3">
          <span>No alignment</span>
          <span>Covariances matched</span>
        </div>

        <p
          className={`mt-5 text-sm leading-relaxed transition-colors duration-300 ${
            aligned ? "text-ink-2" : "text-warn"
          }`}
        >
          {aligned
            ? "Aligned. CORAL has recolored the target covariance to match the source, so the classifier's decision boundary transfers across the drift."
            : "Drifted. The target domain's second-order statistics no longer match the source, collapsing the classifier."}
        </p>
      </div>
    </div>
  );
}
