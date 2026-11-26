import { existsSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { freshProgress } from "./storage"

const sfx = ["tap.wav", "correct.wav", "wrong.wav", "lesson.wav", "streak.wav", "milestone.wav"]

describe("sound effects", () => {
  it("defaults to on and ships a short file for each effect", () => {
    expect(freshProgress().effects).toBe(true)
    for (const name of sfx) {
      const file = resolve(process.cwd(), "public/sfx", name)
      expect(existsSync(file), name).toBe(true)
      const size = statSync(file).size
      expect(size, name).toBeGreaterThan(400)
      expect(size, name).toBeLessThan(80_000)
    }
  })
})
