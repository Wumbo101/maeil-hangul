import { addDays } from "./dates"

export const DAILY_GOAL_XP = 20
export const DRILL_XP = 10
export const REVIEW_XP = 5
export const LESSON_BONUS = 15
export const FREEZE_CAP = 2
export const MILESTONES = [7, 30, 100] as const

export type Milestone = (typeof MILESTONES)[number]

export type StreakData = {
  current: number
  longest: number
  lastGoalDate: string | null
  freezes: number
  frozenDates: string[]
  goalDates: string[]
  xpByDate: Record<string, number>
  lessonsByDate: Record<string, number>
}

export type PracticeResult = {
  streak: StreakData
  goalJustMet: boolean
  milestone: Milestone | null
  freezeAwarded: boolean
}

export function freshStreak(): StreakData {
  return {
    current: 0,
    longest: 0,
    lastGoalDate: null,
    freezes: 1,
    frozenDates: [],
    goalDates: [],
    xpByDate: {},
    lessonsByDate: {},
  }
}

export function isGoalMet(xp: number, lessons: number): boolean {
  return xp >= DAILY_GOAL_XP || lessons >= 1
}

export function isMilestone(days: number): days is Milestone {
  return (MILESTONES as readonly number[]).includes(days)
}

/**
 * Days after the last goal, up through yesterday, that are not already
 * covered by a goal or a freeze. Today is never "missed" yet.
 */
export function missedDates(streak: StreakData, today: string): string[] {
  if (!streak.lastGoalDate) return []
  const start = addDays(streak.lastGoalDate, 1)
  const yesterday = addDays(today, -1)
  if (start > yesterday) return []

  const covered = new Set([...streak.frozenDates, ...streak.goalDates, streak.lastGoalDate])
  const missed: string[] = []
  let cursor = start
  while (cursor <= yesterday) {
    if (!covered.has(cursor)) missed.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return missed
}

/**
 * Apply freezes or break the streak based on `today`.
 * A freeze is spent only when the owned freezes can cover every missed day.
 * Calling this twice on the same day is a no-op the second time.
 */
export function reconcileStreak(streak: StreakData, today: string): StreakData {
  if (!streak.lastGoalDate) {
    return streak.current === 0 ? streak : { ...streak, current: 0 }
  }

  const missed = missedDates(streak, today)
  if (missed.length === 0) return streak

  if (streak.freezes >= missed.length) {
    return {
      ...streak,
      freezes: streak.freezes - missed.length,
      frozenDates: [...streak.frozenDates, ...missed],
    }
  }

  return streak.current === 0 ? streak : { ...streak, current: 0 }
}

export function recordPractice(
  input: StreakData,
  today: string,
  xp: number,
  lessonCompleted: boolean,
): PracticeResult {
  let streak = reconcileStreak(input, today)
  const prevXp = streak.xpByDate[today] ?? 0
  const prevLessons = streak.lessonsByDate[today] ?? 0
  const wasMet = isGoalMet(prevXp, prevLessons)
  const nextXp = prevXp + xp
  const nextLessons = prevLessons + (lessonCompleted ? 1 : 0)
  const nowMet = isGoalMet(nextXp, nextLessons)

  streak = {
    ...streak,
    xpByDate: { ...streak.xpByDate, [today]: nextXp },
    lessonsByDate: { ...streak.lessonsByDate, [today]: nextLessons },
  }

  if (!nowMet || streak.lastGoalDate === today) {
    return { streak, goalJustMet: false, milestone: null, freezeAwarded: false }
  }

  const nextCurrent = streak.current + 1
  const milestone = isMilestone(nextCurrent) ? nextCurrent : null
  const freezeAwarded = nextCurrent > 0 && nextCurrent % 7 === 0 && streak.freezes < FREEZE_CAP

  streak = {
    ...streak,
    current: nextCurrent,
    longest: Math.max(streak.longest, nextCurrent),
    lastGoalDate: today,
    goalDates: streak.goalDates.includes(today) ? streak.goalDates : [...streak.goalDates, today],
    freezes: freezeAwarded ? streak.freezes + 1 : streak.freezes,
  }

  return {
    streak,
    goalJustMet: !wasMet,
    milestone,
    freezeAwarded,
  }
}

export function xpToday(streak: StreakData, today: string): number {
  return streak.xpByDate[today] ?? 0
}

export function lessonsToday(streak: StreakData, today: string): number {
  return streak.lessonsByDate[today] ?? 0
}

export function goalMetOn(streak: StreakData, today: string): boolean {
  return isGoalMet(xpToday(streak, today), lessonsToday(streak, today))
}
