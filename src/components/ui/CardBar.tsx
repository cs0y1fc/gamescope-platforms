interface CardBarProps {
  className?: string;
  color?: string;
}

export function CardBar({ className = "", color = "var(--color-border)" }: CardBarProps) {
  return (
    <svg
      width="100%"
      height="12"
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <line x1="0" y1="6" x2="92" y2="6" stroke={color} strokeWidth="1" />
      <circle cx="100" cy="6" r="2" fill={color} />
      <line x1="108" y1="6" x2="200" y2="6" stroke={color} strokeWidth="1" />
    </svg>
  );
}
