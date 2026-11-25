import { useMemo } from "react"

const COLORS = ["#ff4d1c", "#f2c14e", "#1f4b99", "#14804a", "#d7263d", "#fff6ea"]

export function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 26 }, (_, id) => ({
        id,
        left: Math.round((id * 37) % 100),
        delay: (id % 8) * 0.12,
        duration: 1.8 + (id % 5) * 0.2,
        color: COLORS[id % COLORS.length],
        spin: (id % 2 === 0 ? 1 : -1) * (120 + id * 8),
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((bit) => (
        <span
          key={bit.id}
          className="confetti-bit"
          style={{
            left: `${bit.left}%`,
            background: bit.color,
            animationDelay: `${bit.delay}s`,
            animationDuration: `${bit.duration}s`,
            transform: `rotate(${bit.spin}deg)`,
          }}
        />
      ))}
    </div>
  )
}
