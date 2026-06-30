"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface Point {
  x: number; // normalized 0..1
  y: number;
  vx: number;
  vy: number;
  r: number;
  warm: boolean;
  phase: number;
  speed: number;
}

const N = 64;
const LINK_DIST = 0.145;

/**
 * Ambient sensor-manifold field for the hero. Slow-drifting points (mostly cool,
 * a few warm "drifters") with faint proximity links. Positions are normalized so
 * resize is free. Renders a single static frame under reduced motion.
 */
export function DriftField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let w = 0;
    let h = 0;
    let points: Point[] = [];

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

    const init = () => {
      points = Array.from({ length: N }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0004,
        vy: (Math.random() - 0.5) * 0.0004,
        r: Math.random() * 1.6 + 0.9,
        warm: Math.random() < 0.16,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.014 + 0.004,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `oklch(0.62 0.07 256 / ${(1 - d / LINK_DIST) * 0.13})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }

      for (const p of points) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += p.speed;
          if (p.x < 0) p.x += 1;
          if (p.x > 1) p.x -= 1;
          if (p.y < 0) p.y += 1;
          if (p.y > 1) p.y -= 1;
        }
        const tw = reduce ? 0.75 : 0.55 + 0.45 * Math.sin(p.phase);
        const px = p.x * w;
        const py = p.y * h;
        const hue = p.warm ? "0.8 0.14 72" : "0.7 0.16 256";
        ctx.beginPath();
        ctx.arc(px, py, p.r * 3.2, 0, 6.2832);
        ctx.fillStyle = `oklch(${hue} / ${0.06 * tw})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, 6.2832);
        ctx.fillStyle = `oklch(${hue} / ${0.6 * tw})`;
        ctx.fill();
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();

    const ro = new ResizeObserver(() => resize());
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
