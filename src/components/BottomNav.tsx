import { Flame, Home, Route, RotateCcw } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useProgress } from "@/lib/progress"

const items = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/learn", label: "Path", icon: Route, end: false },
  { to: "/review", label: "Review", icon: RotateCcw, end: false },
  { to: "/streak", label: "Streak", icon: Flame, end: false },
]

export function BottomNav() {
  const { due } = useProgress()
  return (
    <nav className="grid grid-cols-4 border-t border-border bg-white/95 px-2 pt-1 backdrop-blur-sm" style={{ paddingBottom: "calc(0.4rem + env(safe-area-inset-bottom))" }}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [
              "relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-extrabold",
              isActive ? "text-flame" : "text-muted-foreground",
            ].join(" ")
          }
        >
          <item.icon className="size-5" />
          {item.label}
          {item.to === "/review" && due.length > 0 ? (
            <span className="absolute top-1 right-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-flame px-1 text-[10px] text-white">
              {due.length}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  )
}
