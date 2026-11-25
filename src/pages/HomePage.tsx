import { Link } from "react-router-dom"
import { Snowflake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Flame } from "@/components/Flame"
import { MonthCalendar } from "@/components/MonthCalendar"
import { SettingsDialog } from "@/components/SettingsDialog"
import { JAMO } from "@/data/jamo"
import { LESSONS, nextLesson } from "@/data/lessons"
import { DAILY_GOAL_XP, MILESTONES, goalMetOn, xpToday } from "@/lib/streak"
import { useProgress } from "@/lib/progress"

export function HomePage() {
  const { state, today } = useProgress()
  const streak = state.streak
  const met = goalMetOn(streak, today)
  const xp = xpToday(streak, today)
  const upcoming = nextLesson(state.completedLessonIds)
  const [year, month] = today.split("-").map(Number)
  const lit = streak.current > 0
  const uniqueLearned = new Set(
    state.completedLessonIds.flatMap((id) => {
      const lesson = LESSONS.find((item) => item.id === id)
      return lesson?.newJamo ?? []
    }),
  ).size

  let status = "Finish a lesson to light it."
  if (streak.current > 0 && met) status = "Today is locked in. See you tomorrow."
  else if (streak.current > 0) status = "Practice today and the flame keeps going."

  return (
    <div className="px-5 pt-5 pb-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl leading-none text-ink">매일</p>
          <p className="mt-1 text-sm font-extrabold text-muted-foreground">Learn to read Korean</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-ink shadow-sm">{state.xp} XP</span>
          <SettingsDialog />
        </div>
      </header>

      <section className="mt-6 flex flex-col items-center text-center">
        <Flame lit={lit} className="h-32 w-28" />
        <p data-testid="streak-count" className="font-display text-7xl leading-none text-ink">{streak.current}</p>
        <p className="mt-1 text-sm font-extrabold tracking-[0.14em] text-muted-foreground uppercase">day streak</p>
        <p className="mt-2 max-w-xs font-bold text-ink/80">{status}</p>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Today’s goal</h2>
          <span className="text-sm font-extrabold text-muted-foreground">{met ? "Done" : `${Math.min(xp, DAILY_GOAL_XP)}/${DAILY_GOAL_XP} XP`}</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#f3e2d2]">
          <div className="h-full rounded-full bg-flame transition-all" style={{ width: `${met ? 100 : Math.min(100, (xp / DAILY_GOAL_XP) * 100)}%` }} />
        </div>
        <p className="mt-3 text-sm font-bold text-ink/75">
          {met ? "Goal met. The streak is safe for today." : "Finish one lesson, or earn 20 XP from practice."}
        </p>
        {upcoming ? (
          <Button asChild className="mt-4 h-auto min-h-14 w-full rounded-2xl py-3 text-base font-extrabold whitespace-normal">
            <Link to={`/lesson/${upcoming.id}`}>
              <span className="block text-xs font-extrabold tracking-wide uppercase opacity-90">
                {state.completedLessonIds.length === 0 ? "Start" : "Continue"}
              </span>
              <span className="block font-display text-2xl leading-tight">{upcoming.title}</span>
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" className="mt-4 h-14 w-full rounded-2xl text-base font-extrabold">
            <Link to="/review">Path complete · Review</Link>
          </Button>
        )}
      </section>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Longest" value={String(streak.longest)} />
        <Stat label="Freezes" value={String(streak.freezes)} icon />
        <Stat label="Letters" value={`${uniqueLearned}/${JAMO.length}`} />
      </div>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="font-display text-2xl text-ink">Milestones</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {MILESTONES.map((days) => {
            const earned = streak.longest >= days
            return (
              <div key={days} className={["rounded-2xl px-2 py-3 text-center", earned ? "bg-[#fff1cc]" : "bg-[#f7efe6]"].join(" ")}>
                <p className="font-display text-2xl text-ink">{days}</p>
                <p className="text-xs font-extrabold text-muted-foreground">{earned ? "Reached" : "Days"}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <MonthCalendar year={year} month={month - 1} streak={streak} today={today} />
        <Button asChild variant="secondary" className="mt-4 h-12 w-full rounded-2xl font-extrabold">
          <Link to="/streak">Open the calendar</Link>
        </Button>
      </section>
      <p className="mt-4 text-center text-xs font-bold text-muted-foreground">
        Revised Romanization. A Korean voice speaks when your device has one.
      </p>
    </div>
  )
}

function Stat({ label, value, icon = false }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="rounded-2xl bg-white px-2 py-3 shadow-sm">
      <p className="flex items-center justify-center gap-1 font-display text-2xl text-ink">
        {icon ? <Snowflake className="size-4 text-[#1f4b99]" /> : null}
        {value}
      </p>
      <p className="text-[11px] font-extrabold tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  )
}
