"use client";

import { GithubLogo } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="border-t border-line-soft px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-surface-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Nebula</p>
            <p className="text-xs text-ink-3">Robust gas classification under distribution shift</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-3">
          <a href="#solution" className="transition-colors hover:text-ink">Method</a>
          <a href="#results" className="transition-colors hover:text-ink">Results</a>
          <a href="#lab" className="transition-colors hover:text-ink">Lab</a>
          <a
            href="https://github.com/manishghoshal99/nebula"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
          >
            <GithubLogo weight="fill" className="h-4 w-4" />
            GitHub
          </a>
        </nav>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-line-soft pt-6 text-xs text-ink-3">
        Built with Next.js, Motion, and Recharts. CORAL and Robust MLP on the UCI Gas Sensor Array
        Drift dataset.
      </div>
    </footer>
  );
}
