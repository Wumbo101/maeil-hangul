import { useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AudioButton } from "@/components/AudioButton"
import { DrillSession } from "@/components/DrillSession"
import { jamoById, type Jamo } from "@/data/jamo"
import { isLessonUnlocked, lessonById, nextLesson, type Lesson } from "@/data/lessons"
import { buildLessonExercises } from "@/lib/exercises"
import { jamoChars } from "@/lib/hangul"
import { DRILL_XP, LESSON_BONUS } from "@/lib/streak"
import { useProgress } from "@/lib/progress"
import { playSessionEnd } from "@/lib/sfx"

type Phase = "intro" | "teach" | "drill" | "done"

export function LessonPage() {
  const { lessonId = "" } = useParams()
  const lesson = lessonById(lessonId)
  const { state, finishLesson, presentCelebration } = useProgress()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>("intro")
  const [cardIndex, setCardIndex] = useState(0)
  const [summary, setSummary] = useState({ correct: 0, total: 0, xp: 0 })
  const finished = useRef(false)
  const [finishBonus, setFinishBonus] = useState(0)

  const cards = useMemo(() => (lesson ? teachCards(lesson) : []), [lesson])
  const exercises = useMemo(
    () => (lesson ? buildLessonExercises(lesson, state.lessonAttempts[lesson.id] ?? 0) : []),
    [lesson, state.lessonAttempts],
  )

  if (!lesson) {
    return (
      <div className="px-5 py-10">
        <h1 className="font-display text-3xl">That lesson isn’t on the path.</h1>
        <Button asChild className="mt-4 h-12 rounded-2xl font-extrabold"><Link to="/learn">Back to the path</Link></Button>
      </div>
    )
  }

  if (!isLessonUnlocked(state.completedLessonIds, lesson.id)) {
    return (
      <div className="px-5 py-10">
        <h1 className="font-display text-3xl">This lesson is still locked.</h1>
        <p className="mt-2 font-bold text-muted-foreground">Finish the one before it.</p>
        <Button asChild className="mt-4 h-12 rounded-2xl font-extrabold"><Link to="/learn">Back to the path</Link></Button>
      </div>
    )
  }

  function leave() {
    playSessionEnd(presentCelebration(), false)
    navigate("/learn")
  }

  function handleFinish(result: { correct: number; total: number; xp: number }) {
    if (finished.current || !lesson) return
    finished.current = true
    setFinishBonus(state.completedLessonIds.includes(lesson.id) ? 0 : LESSON_BONUS)
    finishLesson(lesson.id)
    setSummary(result)
    setPhase("done")
    playSessionEnd(presentCelebration(), true)
  }

  if (phase === "drill") {
    return (
      <DrillSession
        exercises={exercises}
        xpEach={DRILL_XP}
        onExit={leave}
        onFinish={handleFinish}
      />
    )
  }

  if (phase === "done") {
    const following = nextLesson(state.completedLessonIds.filter((id) => id !== lesson.id).concat(lesson.id))
    return (
      <div className="flex min-h-full flex-col px-6 py-10">
        <p className="text-sm font-extrabold tracking-[0.16em] text-flame uppercase">Lesson complete</p>
        <h1 className="mt-2 font-display text-5xl text-ink">{lesson.title}</h1>
        <p className="mt-4 text-lg font-extrabold text-ink">
          {summary.correct} of {summary.total} on the first try
          {" · "}
          +{summary.xp + finishBonus} XP
        </p>
        <p className="mt-2 font-bold text-ink/70">
          {summary.correct === summary.total
            ? "Clean round. The letters are getting familiar."
            : "Anything you missed will wait in review."}
        </p>
        <div className="mt-auto grid gap-2 pt-8">
          {following && following.id !== lesson.id ? (
            <Button asChild className="h-14 rounded-2xl text-base font-extrabold">
              <Link to={`/lesson/${following.id}`} onClick={() => { setPhase("intro"); setCardIndex(0); finished.current = false }}>
                Next · {following.title}
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="secondary" className="h-14 rounded-2xl text-base font-extrabold">
            <Link to="/learn">Back to the path</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (phase === "teach") {
    const card = cards[cardIndex]
    const lastCard = cardIndex >= cards.length - 1
    return (
      <div className="flex min-h-full flex-col px-6 py-6">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" className="rounded-full font-extrabold" onClick={leave}>Close</Button>
          <Progress value={((cardIndex + 1) / Math.max(cards.length, 1)) * 100} className="h-3 bg-[#f3e2d2]" />
        </div>
        {card?.kind === "concept" ? (
          <article className="mt-6">
            <p className="text-sm font-extrabold tracking-[0.16em] text-flame uppercase">How it fits</p>
            <h1 className="mt-2 font-display text-4xl text-ink">{card.title}</h1>
            <p className="mt-3 text-lg font-bold leading-snug text-ink/80">{card.body}</p>
            {card.examples ? (
              <ul className="mt-5 grid grid-cols-2 gap-2">
                {card.examples.map((example) => (
                  <li key={example.hangul} className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                    <p className="font-display text-4xl text-ink">{example.hangul}</p>
                    <p className="text-sm font-bold text-muted-foreground">{example.caption}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            {card.table ? (
              <ul className="mt-5 divide-y divide-[#f0dcc8] overflow-hidden rounded-2xl bg-white">
                {card.table.map((row) => (
                  <li key={row.label} className="flex items-center justify-between px-3 py-2 font-bold">
                    <span className="font-display text-lg">{row.label}</span>
                    <span className="text-flame">{row.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ) : card?.kind === "jamo" ? (
          <article className="mt-6 flex flex-1 flex-col items-center text-center">
            <p className="self-start text-sm font-extrabold tracking-[0.16em] text-flame uppercase">New letter</p>
            <p className="mt-2 font-display text-9xl leading-none text-ink">{card.jamo.char}</p>
            <div className="mt-3">
              <AudioButton text={card.jamo.char} label={`Play ${card.jamo.char}`} />
            </div>
            <p className="mt-4 font-sans text-4xl font-extrabold tracking-tight text-ink">{card.jamo.romanization}</p>
            <p className="mt-1 text-lg font-extrabold text-flame">{card.jamo.hint}</p>
            <p className="mt-4 text-left text-lg font-bold leading-snug text-ink/80">{card.jamo.detail}</p>
            {card.example ? (
              <div className="mt-5 w-full rounded-3xl bg-white px-4 py-4 text-left shadow-sm">
                <p className="text-xs font-extrabold tracking-wide text-muted-foreground uppercase">A word</p>
                <p className="font-display text-5xl text-ink">{card.example.hangul}</p>
                <p className="font-extrabold text-ink">{card.example.romanization}</p>
                <p className="font-bold text-muted-foreground">{card.example.meaning}</p>
              </div>
            ) : null}
          </article>
        ) : null}
        <Button
          type="button"
          className="mt-8 h-14 w-full rounded-2xl text-base font-extrabold"
          onClick={() => {
            if (lastCard) setPhase("drill")
            else setCardIndex((value) => value + 1)
          }}
        >
          {lastCard ? "Practice" : "Got it"}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col px-6 py-8">
      <p className="text-sm font-extrabold tracking-[0.16em] text-flame uppercase">{lesson.section}</p>
      <h1 className="mt-2 font-display text-5xl text-ink">{lesson.title}</h1>
      <p className="mt-3 text-lg font-bold text-ink/80">{lesson.blurb}</p>
      <p className="mt-2 text-sm font-extrabold text-muted-foreground">About {lesson.minutes} minutes</p>
      {lesson.newJamo.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {lesson.newJamo.map((id) => {
            const jamo = jamoById(id)
            return (
              <li key={id} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                <span className="font-display text-3xl text-ink">{jamo.char}</span>
                <span className="ml-2 text-sm font-extrabold text-muted-foreground">{jamo.romanization}</span>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="mt-6 space-y-2">
          {lesson.words.slice(0, 4).map((word) => (
            <li key={word.hangul} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <span className="font-display text-2xl text-ink">{word.hangul}</span>
              <span className="ml-2 font-extrabold text-muted-foreground">{word.meaning}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto grid gap-2 pt-8">
        <Button
          type="button"
          className="h-14 rounded-2xl text-base font-extrabold"
          onClick={() => setPhase(cards.length > 0 ? "teach" : "drill")}
        >
          Start
        </Button>
        <Button type="button" variant="ghost" className="h-12 rounded-2xl font-extrabold" onClick={() => navigate("/learn")}>
          Not now
        </Button>
      </div>
    </div>
  )
}

type TeachCard =
  | {
      kind: "concept"
      title: string
      body: string
      examples?: { hangul: string; caption: string }[]
      table?: { label: string; value: string }[]
    }
  | { kind: "jamo"; jamo: Jamo; example?: { hangul: string; romanization: string; meaning: string } }

function teachCards(lesson: Lesson): TeachCard[] {
  const cards: TeachCard[] = []
  if (lesson.concept) {
    cards.push({
      kind: "concept",
      title: lesson.concept.title,
      body: lesson.concept.body,
      examples: lesson.concept.examples,
      table: lesson.concept.table,
    })
  }
  for (const id of lesson.newJamo) {
    const jamo = jamoById(id)
    const example = lesson.words.find((word) => jamoChars(word.hangul).includes(jamo.char))
    cards.push({ kind: "jamo", jamo, example })
  }
  return cards
}
