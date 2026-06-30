import { type ReactNode, type HTMLAttributes } from "react";

type Variant = "default" | "primary" | "accent";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: Variant;
}

const RING: Record<Variant, string> = {
  default: "border-line-soft hover:border-line",
  primary: "border-primary/30 hover:border-primary/50",
  accent: "border-warn/30 hover:border-warn/50",
};

/**
 * Surface panel. Solid fill, full hairline border (never a side-stripe),
 * optional titled header that shares the body's horizontal padding.
 */
export function Card({
  children,
  className = "",
  title,
  icon,
  size = "md",
  variant = "default",
  ...props
}: CardProps) {
  const bodyPad = { sm: "p-4", md: "p-5 sm:p-6", lg: "p-6 sm:p-8" }[size];
  const headPad = { sm: "px-4 py-3", md: "px-5 sm:px-6 py-4", lg: "px-6 sm:px-8 py-5" }[size];

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-surface edge-light transition-colors duration-300 ${RING[variant]} ${className}`}
      {...props}
    >
      {(title || icon) && (
        <div className={`flex items-center gap-2.5 border-b border-line-soft ${headPad}`}>
          {icon && <span className="shrink-0 text-ink-2">{icon}</span>}
          {title && <h3 className="text-sm font-medium text-ink">{title}</h3>}
        </div>
      )}
      <div className={bodyPad}>{children}</div>
    </div>
  );
}
