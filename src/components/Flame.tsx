import { cn } from "cn"

export function Flame({ className, lit = true }: { className?: string; lit?: boolean }) {
  return (
    <svg
      viewBox="0 0 80 96"
      className={cn(lit && "flame-flicker", className)}
      aria-hidden
    >
      <path
        d="M40 92c-14 0-26-14-26-32 0-14 8-22 10-34 2-10 8-18 16-26 8 8 14 16 16 26 2 12 10 20 10 34 0 18-12 32-26 32z"
        fill={lit ? "#ff4d1c" : "#e6d3c4"}
      />
      <path
        d="M40 84c-8 0-14-8-14-18 0-8 4-13 6-20 2-6 4-10 8-16 4 6 6 10 8 16 2 7 6 12 6 20 0 10-6 18-14 18z"
        fill={lit ? "#ffd15c" : "#f6ebe1"}
      />
    </svg>
  )
}
