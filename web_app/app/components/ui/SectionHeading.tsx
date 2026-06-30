import { type ReactNode } from "react";
import { Reveal } from "./Reveal";

/**
 * Section header. Headline + optional intro, deliberately no uppercase eyebrow
 * (eyebrow-on-every-section is the saturated AI tell; budget is rationed).
 */
export function SectionHeading({
  title,
  intro,
  center = false,
  className = "",
}: {
  title: ReactNode;
  intro?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}>
      <h2 className="text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.08] text-ink">
        {title}
      </h2>
      {intro && <p className="mt-4 text-base leading-relaxed text-ink-2">{intro}</p>}
    </Reveal>
  );
}
