interface LineProps {
  className?: string;
  color?: string;
  fixed?: boolean;
}

export function TopLine({ className = "", color = "var(--color-accent)", fixed = false }: LineProps) {
  return (
    <div
      className={`${fixed ? "fixed top-0 left-0 right-0 z-50" : "w-full"} ${className}`}
      style={{ height: "2px", background: color }}
      aria-hidden="true"
    />
  );
}

export function BottomLine({ className = "", color = "var(--color-accent)" }: Omit<LineProps, "fixed">) {
  return (
    <div
      className={`w-full ${className}`}
      style={{ height: "2px", background: color }}
      aria-hidden="true"
    />
  );
}
