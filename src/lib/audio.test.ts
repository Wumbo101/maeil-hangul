import { existsSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { audioClips } from "../data/audio-manifest"
import { JAMO } from "../data/jamo"
import { LESSONS } from "../data/lessons"

const audioDir = resolve(process.cwd(), "public/audio")

describe("pronunciation clips", () => {
  it("has a real recording for every letter, taught syllable, and word", () => {
    const needed = new Set<string>(JAMO.map((jamo) => jamo.char))
    for (const lesson of LESSONS) {
      for (const word of lesson.words) needed.add(word.hangul)
      for (const build of lesson.builds) needed.add(build.hangul)
    }
    for (const text of needed) {
      const clip = audioClips[text]
      expect(clip, text).toBeTruthy()
      const file = resolve(audioDir, clip.file)
      expect(existsSync(file), file).toBe(true)
      expect(statSync(file).size, text).toBeGreaterThan(800)
    }
  })

  it("speaks letters as sounds, not letter names", () => {
    expect(audioClips["ㅏ"].speak).toBe("아")
    expect(audioClips["ㅓ"].speak).toBe("어")
    expect(audioClips["ㄱ"].speak).toBe("그")
    expect(audioClips["ㅋ"].speak).toBe("크")
    expect(audioClips["ㅇ"].speak).toBe("응")
    expect(audioClips["나무"].speak).toBe("나무")
    expect(audioClips["안녕하세요"].speak).toBe("안녕하세요")
  })
})
