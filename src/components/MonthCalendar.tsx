import { Snowflake } from "lucide-react"
import { formatLocalDate } from "@/lib/dates"
import type { StreakData } from "@/lib/streak"
import { goalMetOn } from "@/lib/streak"

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function MonthCalendar({
  year,
  month,
  streak,
  today,
}: {
  year: number
  month: number
  streak: StreakData
  today: string
}) {
  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()
  const lead = first.getDay()
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, index) => formatLocalDate(new Date(year, month, index + 1))),
  ]
  const frozen = new Set(streak.frozenDates)
  const title = first.toLocaleDateString("en", { month: "long", year: "numeric" })

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-xl text-ink">{title}</h3>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold tracking-wide text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((iso, index) => {
          if (!iso) return <div key={`empty-${index}`} />
          const met = goalMetOn(streak, iso) || streak.goalDates.includes(iso)
          const freeze = frozen.has(iso)
          const practiced = (streak.xpByDate[iso] ?? 0) > 0
          const isToday = iso === today
          const dayNum = Number(iso.slice(-2))
          return (
            <div
              key={iso}
              className={[
                "flex aspect-square items-center justify-center rounded-lg text-sm font-extrabold",
                met ? "bg-flame text-white" : "",
                !met && freeze ? "bg-[#d7e6fb] text-[#1f4b99]" : "",
                !met && !freeze && practiced ? "bg-[#ffd7c4] text-ink" : "",
                !met && !freeze && !practiced ? "text-ink/80" : "",
                isToday ? "ring-2 ring-flame ring-offset-1 ring-offset-paper" : "",
              ].join(" ")}
              aria-label={`${iso}${met ? ", goal met" : ""}${freeze ? ", freeze" : ""}`}
            >
              {dayNum}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
        <span className="inline-flex items-center gap-1"><i className="inline-block size-2.5 rounded-sm bg-flame" /> Goal met</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block size-2.5 rounded-sm bg-[#ffd7c4]" /> Practiced</span>
        <span className="inline-flex items-center gap-1"><Snowflake className="size-3 text-[#1f4b99]" /> Freeze</span>
      </div>
    </div>
  )
}
