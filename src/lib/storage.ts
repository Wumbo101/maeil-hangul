import { freshStreak, type StreakData } from "./streak"
import type { SrsCard } from "./srs"

export type ProgressState = {
  version: 1
  onboarded: boolean
  xp: number
  sound: boolean
  completedLessonIds: string[]
  lessonAttempts: Record<string, number>
  cards: Record<string, SrsCard>
  streak: StreakData
}

const KEY = "maeil-progress-v1"

export function freshProgress(): ProgressState {
  return {
    version: 1,
    onboarded: false,
    xp: 0,
    sound: true,
    completedLessonIds: [],
    lessonAttempts: {},
    cards: {},
    streak: freshStreak(),
  }
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return freshProgress()
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    if (parsed.version !== 1) return freshProgress()
    const base = freshProgress()
    return {
      ...base,
      ...parsed,
      version: 1,
      sound: parsed.sound !== false,
      completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
      lessonAttempts: parsed.lessonAttempts ?? {},
      cards: parsed.cards ?? {},
      streak: { ...base.streak, ...(parsed.streak ?? {}) },
    }
  } catch {
    return freshProgress()
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Private mode can reject storage. The session still works in memory.
  }
}
