"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { GithubLogo, ArrowUpRight } from "@phosphor-icons/react";

const LINKS = [
  { label: "Method", href: "#solution", id: "solution" },
  { label: "Results", href: "#results", id: "results" },
  { label: "Lab", href: "#lab", id: "lab" },
  { label: "How it works", href: "#method", id: "method" },
];

export function Navbar() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <motion.header
      initial={reduce ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? "glass border-line-soft" : "border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-surface-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-base font-semibold tracking-tight text-ink">Nebula</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`relative rounded-lg px-3.5 py-2 text-sm transition-colors duration-200 ${
                active === l.id ? "text-ink" : "text-ink-3 hover:text-ink"
              }`}
            >
              {l.label}
              {active === l.id && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-x-3 -bottom-px h-px bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </div>

        <a
          href="https://github.com/manishghoshal99/nebula"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft px-3 py-2 text-sm text-ink-2 transition-colors hover:border-line hover:text-ink"
        >
          <GithubLogo weight="fill" className="h-4 w-4" />
          <span className="hidden sm:inline">GitHub</span>
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </nav>
    </motion.header>
  );
}
