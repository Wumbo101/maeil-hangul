import { useMemo, useState } from "react"
import { jamoById } from "@/data/jamo"
import { LESSONS } from "@/data/lessons"
import { DrillSession } from "@/components/DrillSession"
import { Button } from "@/components/ui/button"
import { buildReviewExercises } from "@/lib/exercises"
import { useProgress } from "@/lib/progress"
import { upcomingCards, type SrsCard } from "@/lib/srs"
import { REVIEW_XP } from "@/lib/streak"
import { playSessionEnd } from "@/lib/sfx"

function describeCard(card: SrsCard): { title: string; detail: string } {
  if (card.id.startsWith("jamo:")) {
    const jamo = jamoById(card.id.slice("jamo:".length))
    return { title: jamo.char, detail: `${jamo.romanization} · ${jamo.hint}` }
  }
  const hangul = card.id.slice(card.id.indexOf(":") + 1)
  const word = LESSONS.flatMap((lesson) => lesson.words).find((item) => item.hangul === hangul)
  const build = LESSONS.flatMap((lesson) => lesson.builds).find((item) => item.hangul === hangul)
  const meaning = word?.meaning ?? build?.meaning
  const reading = word?.romanization
  return {
    title: hangul,
    detail: [reading, meaning].filter(Boolean).join(" · ") || "Practice again",
  }
}

export function ReviewPage() {
  const { state, today, due, presentCelebration } = useProgress()
  const [playing, setPlaying] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [summary, setSummary] = useState<{ correct: number; total: number; xp: number } | null>(null)
  const upcoming = upcomingCards(state.cards, today)
  const exercises = useMemo(() => buildReviewExercises(due, attempt), [attempt, due])

  if (playing) {
    return (
      <DrillSession
        exercises={exercises}
        xpEach={REVIEW_XP}
        onExit={() => {
          playSessionEnd(presentCelebration(), false)
          setPlaying(false)
        }}
        onFinish={(result) => {
          playSessionEnd(presentCelebration(), true)
          setSummary(result)
          setPlaying(false)
        }}
      />
    )
  }

  return (
    <div className="px-5 pt-6 pb-10">
      <p className="text-sm font-extrabold tracking-[0.16em] text-flame uppercase">Review</p>
      <h1 className="mt-1 font-display text-4xl text-ink">Letters that slipped</h1>
      <p className="mt-2 font-bold text-ink/75">
        Miss something in a lesson and it comes back here. A correct answer waits a day, then three, then a week.
      </p>

      {summary ? (
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-extrabold text-ink shadow-sm">
          {summary.correct} of {summary.total} on the first try · +{summary.xp} XP
        </p>
      ) : null}

      {due.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white px-5 py-6 shadow-sm">
          <p className="font-display text-3xl text-ink">You’re clear.</p>
          <p className="mt-2 font-bold text-muted-foreground">
            Nothing is due. When a letter or word gives you trouble, it will wait on this page.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-5 space-y-2">
            {due.map((card) => {
              const described = describeCard(card)
              return (
                <li key={card.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span>
                    <span className="font-display text-3xl text-ink">{described.title}</span>
                    <span className="mt-0.5 block text-sm font-bold text-muted-foreground">{described.detail}</span>
                  </span>
                  <span className="text-sm font-extrabold text-[#9f1d2c]">{card.wrong} miss{card.wrong === 1 ? "" : "es"}</span>
                </li>
              )
            })}
          </ul>
          <Button type="button" className="mt-4 h-14 w-full rounded-2xl text-base font-extrabold" onClick={() => { setSummary(null); setAttempt((value) => value + 1); setPlaying(true) }}>
            Review {Math.min(8, exercises.length)} {exercises.length === 1 ? "card" : "cards"}
          </Button>
        </>
      )}

      {upcoming.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xs font-extrabold tracking-[0.16em] text-muted-foreground uppercase">Coming back later</h2>
          <ul className="mt-3 space-y-2">
            {upcoming.slice(0, 6).map((card) => {
              const described = describeCard(card)
              return (
                <li key={card.id} className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
                  <span className="font-display text-2xl text-ink">{described.title}</span>
                  <span className="text-sm font-extrabold text-muted-foreground">{card.due}</span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
