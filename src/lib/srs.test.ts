import { describe, expect, it } from "vitest"
import { dueCards, gradeCard, upcomingCards } from "./srs"

describe("gradeCard", () => {
  it("makes a miss due today and clears the streak", () => {
    const card = gradeCard(undefined, "jamo:eo", false, "2026-04-01")
    expect(card.wrong).toBe(1)
    expect(card.streak).toBe(0)
    expect(card.interval).toBe(0)
    expect(card.due).toBe("2026-04-01")
  })

  it("spaces correct answers out by 1, then 3, then 7 days", () => {
    let card = gradeCard(undefined, "jamo:a", true, "2026-04-01")
    expect(card.due).toBe("2026-04-02")
    expect(card.interval).toBe(1)
    expect(card.streak).toBe(1)

    card = gradeCard(card, card.id, true, "2026-04-02")
    expect(card.due).toBe("2026-04-05")
    expect(card.interval).toBe(3)

    card = gradeCard(card, card.id, true, "2026-04-05")
    expect(card.due).toBe("2026-04-12")
    expect(card.interval).toBe(7)
    expect(card.correct).toBe(3)
  })

  it("brings a card back today after a later miss", () => {
    let card = gradeCard(undefined, "jamo:a", true, "2026-04-01")
    card = gradeCard(card, card.id, false, "2026-04-02")
    expect(card.due).toBe("2026-04-02")
    expect(card.streak).toBe(0)
    expect(card.wrong).toBe(1)
  })
})

describe("dueCards", () => {
  it("returns only missed cards that are due, most-missed first", () => {
    const a = gradeCard(undefined, "jamo:a", false, "2026-04-01")
    const eo = gradeCard(gradeCard(undefined, "jamo:eo", false, "2026-04-01"), "jamo:eo", false, "2026-04-01")
    const mastered = gradeCard(undefined, "jamo:o", true, "2026-04-01")
    const later = gradeCard(gradeCard(undefined, "jamo:u", false, "2026-03-01"), "jamo:u", true, "2026-04-01")

    const due = dueCards({ a, eo, mastered, later }, "2026-04-01")
    expect(due.map((card) => card.id)).toEqual(["jamo:eo", "jamo:a"])
    expect(upcomingCards({ a, eo, mastered, later }, "2026-04-01").map((card) => card.id)).toEqual(["jamo:u"])
  })
})
