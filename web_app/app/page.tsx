import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Solution } from "./components/Solution";
import { Results } from "./components/Results";
import { Dashboard } from "./components/Dashboard";
import { Methodology } from "./components/Methodology";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <>
      <span id="top" className="absolute top-0" aria-hidden />

      {/* Ambient field — one soft glow, fixed behind everything */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 75% 50% at 50% -8%, oklch(0.2 0.07 256 / 0.28), transparent 62%)",
        }}
      />
      <div className="grain" aria-hidden />

      <Navbar />
      <main className="relative">
        <Hero />
        <Solution />
        <Results />
        <Dashboard />
        <Methodology />
      </main>
      <Footer />
    </>
  );
}
