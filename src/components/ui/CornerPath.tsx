type Variant = "tl" | "tr" | "bl" | "br";

interface CornerPathProps {
  variant: Variant;
  size?: number;
  className?: string;
  color?: string;
}

const positionClasses: Record<Variant, string> = {
  tl: "top-0 left-0",
  tr: "top-0 right-0",
  bl: "bottom-0 left-0",
  br: "bottom-0 right-0",
};

const paths: Record<Variant, string> = {
  tl: "M 0 12 L 0 0 L 12 0",
  tr: "M 0 0 L 12 0 L 12 12",
  bl: "M 0 0 L 0 12 L 12 12",
  br: "M 0 12 L 12 12 L 12 0",
};

export function CornerPath({
  variant,
  size = 14,
  className = "",
  color = "var(--color-accent)",
}: CornerPathProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      className={`absolute pointer-events-none ${positionClasses[variant]} ${className}`}
      aria-hidden="true"
    >
      <path d={paths[variant]} />
    </svg>
  );
}

export function CornerPathFrame({ size, color, className }: Omit<CornerPathProps, "variant">) {
  return (
    <>
      <CornerPath variant="tl" size={size} color={color} className={className} />
      <CornerPath variant="tr" size={size} color={color} className={className} />
      <CornerPath variant="bl" size={size} color={color} className={className} />
      <CornerPath variant="br" size={size} color={color} className={className} />
    </>
  );
}
