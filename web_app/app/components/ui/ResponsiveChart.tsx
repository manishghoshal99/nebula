"use client";

import { useEffect, useState, type ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

/**
 * SSR-safe Recharts container. ResponsiveContainer needs real DOM dimensions to
 * size itself; during server render it measures -1 and logs a console warning.
 * Gating on mount renders charts only on the client (after layout), which keeps
 * the console clean with no visual cost — parents carry the fixed height.
 */
export function ResponsiveChart({ children }: { children: ReactElement }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  );
}
