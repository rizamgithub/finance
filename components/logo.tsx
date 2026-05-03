import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-7 w-7", className)}
      role="img"
      aria-label="Gold and Finance logo"
    >
      <defs>
        <linearGradient id="lg-coin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#lg-coin)" />
      <circle
        cx="20"
        cy="20"
        r="15"
        fill="none"
        stroke="#fff8e1"
        strokeOpacity="0.45"
        strokeWidth="1"
      />
      <text
        x="20"
        y="19"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
        fontWeight="700"
        fontSize="11"
        fill="#3f2a04"
      >
        RM
      </text>
      <polyline
        points="11,27 16,23 20,25 25,20 29,22"
        fill="none"
        stroke="#3f2a04"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
