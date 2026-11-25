import { describe, expect, it } from "vitest"
import { addDays, daysBetween, formatLocalDate } from "./dates"

describe("formatLocalDate", () => {
  it("uses the local calendar, not UTC fields", () => {
    const march = new Date(2026, 2, 15, 23, 30, 0)
    expect(formatLocalDate(march)).toBe("2026-03-15")
    expect(formatLocalDate(march)).toBe(
      `${march.getFullYear()}-${String(march.getMonth() + 1).padStart(2, "0")}-${String(march.getDate()).padStart(2, "0")}`,
    )

    const instant = new Date("2026-03-15T15:30:00Z")
    const utcDay = instant.toISOString().slice(0, 10)
    const localDay = formatLocalDate(instant)
    const shifted = instant.getUTCDate() !== instant.getDate() || instant.getUTCMonth() !== instant.getMonth()
    if (shifted) {
      expect(localDay).not.toBe(utcDay)
    }
    expect(localDay).toBe(
      `${instant.getFullYear()}-${String(instant.getMonth() + 1).padStart(2, "0")}-${String(instant.getDate()).padStart(2, "0")}`,
    )
  })

  it("stays on the local day just after local midnight", () => {
    const date = new Date(2026, 0, 1, 0, 30, 0)
    expect(formatLocalDate(date)).toBe("2026-01-01")
  })
})

describe("addDays", () => {
  it("crosses month, year, and leap-day boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01")
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29")
    expect(addDays("2024-02-28", 2)).toBe("2024-03-01")
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28")
  })

  it("keeps calendar days across a US daylight-saving weekend", () => {
    expect(addDays("2026-03-07", 1)).toBe("2026-03-08")
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09")
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02")
  })
})

describe("daysBetween", () => {
  it("counts calendar days, including across DST", () => {
    expect(daysBetween("2026-01-01", "2026-01-01")).toBe(0)
    expect(daysBetween("2026-01-01", "2026-01-03")).toBe(2)
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2)
    expect(daysBetween("2026-11-01", "2026-11-02")).toBe(1)
    expect(daysBetween("2026-12-31", "2027-01-02")).toBe(2)
  })
})
