import { describe, expect, it } from "vitest"
import { addDays } from "./dates"
import {
  freshStreak,
  goalMetOn,
  reconcileStreak,
  recordPractice,
  type StreakData,
} from "./streak"

const MON = "2026-03-02"
const TUE = "2026-03-03"
const WED = "2026-03-04"
const THU = "2026-03-05"
const FRI = "2026-03-06"

function practice(streak: StreakData, day: string, xp = 20, lesson = false) {
  return recordPractice(streak, day, xp, lesson)
}

describe("recordPractice", () => {
  it("starts a streak the first day the goal is met", () => {
    const result = practice(freshStreak(), MON)
    expect(result.goalJustMet).toBe(true)
    expect(result.streak.current).toBe(1)
    expect(result.streak.longest).toBe(1)
    expect(result.streak.lastGoalDate).toBe(MON)
    expect(result.streak.goalDates).toEqual([MON])
    expect(result.streak.freezes).toBe(1)
  })

  it("does not increment twice on the same day", () => {
    const first = practice(freshStreak(), MON)
    const second = practice(first.streak, MON, 10)
    expect(second.goalJustMet).toBe(false)
    expect(second.streak.current).toBe(1)
    expect(second.streak.xpByDate[MON]).toBe(30)
    expect(second.milestone).toBeNull()
  })

  it("increments across consecutive local days", () => {
    let streak = practice(freshStreak(), MON).streak
    streak = practice(streak, TUE).streak
    const third = practice(streak, WED)
    expect(third.streak.current).toBe(3)
    expect(third.streak.longest).toBe(3)
    expect(third.goalJustMet).toBe(true)
  })

  it("meets the goal with one finished lesson even at 0 XP", () => {
    const result = recordPractice(freshStreak(), MON, 0, true)
    expect(result.goalJustMet).toBe(true)
    expect(result.streak.current).toBe(1)
    expect(goalMetOn(result.streak, MON)).toBe(true)
  })

  it("meets the goal from XP alone and only then extends the streak", () => {
    const partial = recordPractice(freshStreak(), MON, 10, false)
    expect(partial.goalJustMet).toBe(false)
    expect(partial.streak.current).toBe(0)
    expect(partial.streak.lastGoalDate).toBeNull()

    const done = recordPractice(partial.streak, MON, 10, false)
    expect(done.goalJustMet).toBe(true)
    expect(done.streak.current).toBe(1)

    const extra = recordPractice(done.streak, MON, 10, false)
    expect(extra.goalJustMet).toBe(false)
    expect(extra.streak.current).toBe(1)
    expect(extra.streak.xpByDate[MON]).toBe(30)
  })

  it("keeps yesterday's streak alive before today's practice", () => {
    const streak = practice(freshStreak(), MON).streak
    const opened = reconcileStreak(streak, TUE)
    expect(opened.current).toBe(1)
    expect(opened.freezes).toBe(1)
    expect(opened.frozenDates).toEqual([])
  })
})

describe("missed days", () => {
  it("resets the streak after a missed day and keeps the longest", () => {
    let streak = freshStreak()
    streak = { ...streak, freezes: 0 }
    streak = practice(streak, MON).streak
    streak = practice(streak, TUE).streak
    expect(streak.current).toBe(2)

    const opened = reconcileStreak(streak, THU)
    expect(opened.current).toBe(0)
    expect(opened.longest).toBe(2)
    expect(opened.freezes).toBe(0)
    expect(opened.frozenDates).toEqual([])

    const again = reconcileStreak(opened, THU)
    expect(again).toBe(opened)

    const restart = practice(opened, THU)
    expect(restart.streak.current).toBe(1)
    expect(restart.streak.longest).toBe(2)
    expect(restart.goalJustMet).toBe(true)
  })

  it("spends one freeze to cover exactly one missed day", () => {
    const monday = practice(freshStreak(), MON).streak
    const wednesday = reconcileStreak(monday, WED)
    expect(wednesday.current).toBe(1)
    expect(wednesday.freezes).toBe(0)
    expect(wednesday.frozenDates).toEqual([TUE])

    const again = reconcileStreak(wednesday, WED)
    expect(again.freezes).toBe(0)
    expect(again.current).toBe(1)
    expect(again.frozenDates).toEqual([TUE])

    const practiced = practice(wednesday, WED)
    expect(practiced.streak.current).toBe(2)
    expect(practiced.streak.freezes).toBe(0)
  })

  it("does not spend a freeze when the gap is too wide to save", () => {
    const monday = practice(freshStreak(), MON).streak
    const thursday = reconcileStreak(monday, THU)
    expect(thursday.current).toBe(0)
    expect(thursday.freezes).toBe(1)
    expect(thursday.frozenDates).toEqual([])
  })

  it("spends two freezes to cover two missed days", () => {
    let streak = freshStreak()
    streak = { ...streak, freezes: 2 }
    streak = practice(streak, MON).streak
    const opened = reconcileStreak(streak, THU)
    expect(opened.current).toBe(1)
    expect(opened.freezes).toBe(0)
    expect(opened.frozenDates).toEqual([TUE, WED])

    const thursday = practice(opened, THU).streak
    expect(thursday.current).toBe(2)
    const friday = practice(thursday, FRI)
    expect(friday.streak.current).toBe(3)
  })

  it("crosses month boundaries the same way", () => {
    const jan30 = "2026-01-30"
    const jan31 = "2026-01-31"
    const feb1 = "2026-02-01"
    let streak = practice(freshStreak(), jan30).streak
    streak = practice(streak, feb1).streak
    expect(streak.current).toBe(2)
    expect(streak.freezes).toBe(0)
    expect(streak.frozenDates).toEqual([jan31])
  })
})

describe("milestones and freezes", () => {
  it("celebrates 7, 30, and 100, and caps freezes at 2", () => {
    let streak = freshStreak()
    const milestones: number[] = []
    let awards = 0
    for (let i = 0; i < 100; i++) {
      const day = addDays("2026-01-01", i)
      const result = practice(streak, day)
      if (result.milestone) milestones.push(result.milestone)
      if (result.freezeAwarded) awards += 1
      streak = result.streak
    }
    expect(streak.current).toBe(100)
    expect(streak.longest).toBe(100)
    expect(milestones).toEqual([7, 30, 100])
    expect(streak.freezes).toBe(2)
    expect(awards).toBe(1)
  })

  it("awards another freeze on day 7 if one was spent", () => {
    let streak = practice(freshStreak(), MON).streak
    streak = reconcileStreak(streak, WED)
    expect(streak.freezes).toBe(0)
    streak = practice(streak, WED).streak
    expect(streak.current).toBe(2)

    let result = practice(streak, THU)
    streak = result.streak
    result = practice(streak, FRI)
    streak = result.streak
    result = practice(streak, "2026-03-07")
    streak = result.streak
    result = practice(streak, "2026-03-08")
    streak = result.streak
    result = practice(streak, "2026-03-09")
    expect(result.streak.current).toBe(7)
    expect(result.milestone).toBe(7)
    expect(result.freezeAwarded).toBe(true)
    expect(result.streak.freezes).toBe(1)
  })
})
