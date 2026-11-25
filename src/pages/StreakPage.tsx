import { useState } from "react"
import { ChevronLeft, ChevronRight, Snowflake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Flame } from "@/components/Flame"
import { MonthCalendar } from "@/components/MonthCalendar"
import { addDays } from "@/lib/dates"
import { useProgress } from "@/lib/progress"
import { DAILY_GOAL_XP, FREEZE_CAP, MILESTONES, goalMetOn } from "@/lib/streak"

export function StreakPage() {
  const { state, today } = useProgress()
  const streak = state.streak
  const [cursor, setCursor] = useState(() => {
    const [year, month] = today.split("-").map(Number)
    return { year, month: month - 1 }
  })
  const met = goalMetOn(streak, today)
  const yesterdayFrozen = streak.frozenDates.includes(addDays(today, -1))
  const thisMonth = { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }
  const atThisMonth = cursor.year === thisMonth.year && cursor.month === thisMonth.month

  function shift(delta: number) {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
  }

  return (
    <div className="px-5 pt-6 pb-10">
      <div className="flex items-center gap-4">
        <Flame lit={streak.current > 0} className="h-20 w-16" />
        <div>
          <p data-testid="streak-count" className="font-display text-6xl leading-none text-ink">{streak.current}</p>
          <p className="text-sm font-extrabold tracking-[0.14em] text-muted-foreground uppercase">day streak</p>
        </div>
      </div>
      <p className="mt-4 font-bold text-ink/80">
        {streak.current === 0
          ? "No flame yet. One lesson, or 20 XP, lights it."
          : met
            ? "Today’s goal is done."
            : "Today’s goal is still open. The streak is alive until the day ends."}
      </p>
      {yesterdayFrozen ? (
        <p className="mt-2 font-extrabold text-[#1f4b99]">A freeze covered yesterday.</p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Stat label="Longest" value={streak.longest === 1 ? "1 day" : `${streak.longest} days`} />
        <Stat label="Days you showed up" value={String(streak.goalDates.length)} />
        <Stat label="Freezes left" value={`${streak.freezes} / ${FREEZE_CAP}`} />
        <Stat label="Total XP" value={String(state.xp)} />
      </div>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" className="rounded-full" aria-label="Previous month" onClick={() => shift(-1)}>
            <ChevronLeft />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="rounded-full" aria-label="Next month" disabled={atThisMonth} onClick={() => shift(1)}>
            <ChevronRight />
          </Button>
        </div>
        <MonthCalendar year={cursor.year} month={cursor.month} streak={streak} today={today} />
      </section>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
          <Snowflake className="size-5 text-[#1f4b99]" /> Freezes
        </h2>
        <p className="mt-2 font-bold text-ink/75">
          A freeze saves a single missed day. It is spent only when it can cover the whole gap — two missed days need two freezes. You can hold {FREEZE_CAP}. Every 7-day streak earns one, up to that cap.
        </p>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="font-display text-2xl text-ink">Milestones</h2>
        <ul className="mt-3 space-y-2">
          {MILESTONES.map((days) => {
            const earned = streak.longest >= days
            return (
              <li key={days} className="flex items-center justify-between rounded-2xl bg-[#f7efe6] px-3 py-3">
                <span className="font-extrabold text-ink">{days} days</span>
                <span className={earned ? "font-extrabold text-[#14804a]" : "font-bold text-muted-foreground"}>
                  {earned ? "Reached" : `${DAILY_GOAL_XP} XP or one lesson a day`}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
      <p className="font-display text-2xl text-ink">{value}</p>
      <p className="text-xs font-extrabold tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  )
}
