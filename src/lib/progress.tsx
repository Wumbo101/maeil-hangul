import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { formatLocalDate } from "./dates"
import { gradeCard, dueCards as selectDue, type SrsCard } from "./srs"
import { LESSON_BONUS, reconcileStreak, recordPractice, type PracticeResult } from "./streak"
import { freshProgress, loadProgress, saveProgress, type ProgressState } from "./storage"

export type Celebration = {
  type: "goal" | "milestone"
  days: number
  freezeAwarded: boolean
}

type Grade = { id: string; correct: boolean }

type ProgressApi = {
  state: ProgressState
  today: string
  due: SrsCard[]
  celebration: Celebration | null
  onboard: () => void
  setSound: (on: boolean) => void
  setEffects: (on: boolean) => void
  reset: () => void
  recordAnswer: (grades: Grade[], xp: number) => void
  finishLesson: (lessonId: string) => void
  dismissCelebration: () => void
  presentCelebration: () => Celebration | null
}

const ProgressContext = createContext<ProgressApi | null>(null)

function hydrate(state: ProgressState, today: string): ProgressState {
  const streak = reconcileStreak(state.streak, today)
  if (streak === state.streak) return state
  return { ...state, streak }
}

function queueFrom(result: PracticeResult, previous: Celebration | null): Celebration | null {
  if (result.milestone) {
    return {
      type: "milestone",
      days: result.milestone,
      freezeAwarded: result.freezeAwarded || Boolean(previous?.freezeAwarded),
    }
  }
  if (previous?.type === "milestone") return previous
  if (result.goalJustMet) {
    return {
      type: "goal",
      days: result.streak.current,
      freezeAwarded: result.freezeAwarded || Boolean(previous?.freezeAwarded),
    }
  }
  return previous
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [today, setToday] = useState(() => formatLocalDate(new Date()))
  const [state, setState] = useState(() => hydrate(loadProgress(), formatLocalDate(new Date())))
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const queued = useRef<Celebration | null>(null)

  useEffect(() => {
    saveProgress(state)
  }, [state])

  useEffect(() => {
    const sync = () => {
      const next = formatLocalDate(new Date())
      setToday(next)
      setState((prev) => hydrate(prev, next))
    }
    document.addEventListener("visibilitychange", sync)
    const id = window.setInterval(sync, 60_000)
    return () => {
      document.removeEventListener("visibilitychange", sync)
      window.clearInterval(id)
    }
  }, [])

  const note = useCallback((result: PracticeResult) => {
    queued.current = queueFrom(result, queued.current)
  }, [])

  const commit = useCallback((award: { xp: number; lessonCompleted: boolean; lessonId?: string; grades: Grade[] }) => {
    const day = formatLocalDate(new Date())
    let result: PracticeResult | null = null
    setToday(day)
    setState((prev) => {
      const base = hydrate(prev, day)
      const firstClear = Boolean(award.lessonId && !base.completedLessonIds.includes(award.lessonId))
      const xp = award.xp + (award.lessonCompleted && firstClear ? LESSON_BONUS : 0)
      const practiced = recordPractice(base.streak, day, xp, award.lessonCompleted)
      result = practiced
      const cards = { ...base.cards }
      for (const grade of award.grades) {
        cards[grade.id] = gradeCard(cards[grade.id], grade.id, grade.correct, day)
      }
      let completedLessonIds = base.completedLessonIds
      let lessonAttempts = base.lessonAttempts
      if (award.lessonCompleted && award.lessonId) {
        if (!completedLessonIds.includes(award.lessonId)) {
          completedLessonIds = [...completedLessonIds, award.lessonId]
        }
        lessonAttempts = {
          ...lessonAttempts,
          [award.lessonId]: (lessonAttempts[award.lessonId] ?? 0) + 1,
        }
      }
      return {
        ...base,
        xp: base.xp + xp,
        cards,
        completedLessonIds,
        lessonAttempts,
        streak: practiced.streak,
      }
    })
    if (result) note(result)
  }, [note])

  const api = useMemo<ProgressApi>(() => ({
    state,
    today,
    due: selectDue(state.cards, today),
    celebration,
    onboard: () => setState((prev) => ({ ...prev, onboarded: true })),
    setSound: (on) => setState((prev) => ({ ...prev, sound: on })),
    setEffects: (on) => setState((prev) => ({ ...prev, effects: on })),
    reset: () => {
      queued.current = null
      setCelebration(null)
      setState(freshProgress())
    },
    recordAnswer: (grades, xp) => commit({ xp, lessonCompleted: false, grades }),
    finishLesson: (lessonId) => {
      commit({ xp: 0, lessonCompleted: true, lessonId, grades: [] })
    },
    dismissCelebration: () => setCelebration(null),
    presentCelebration: () => {
      const pending = queued.current
      if (!pending) return null
      queued.current = null
      setCelebration(pending)
      return pending
    },
  }), [celebration, commit, state, today])

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider")
  return ctx
}
