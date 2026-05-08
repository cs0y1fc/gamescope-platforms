interface SquareGeometryProps {
  className?: string;
  color?: string;
  spacing?: number;
  opacity?: number;
}

export function SquareGeometry({
  className = "",
  color = "var(--color-text-faint)",
  spacing = 20,
  opacity = 0.4,
}: SquareGeometryProps) {
  const patternId = `dot-pattern-${spacing}`;
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <circle cx={spacing / 2} cy={spacing / 2} r="0.5" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
