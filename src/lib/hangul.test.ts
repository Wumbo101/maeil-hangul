import { describe, expect, it } from "vitest"
import { jamoByChar } from "../data/jamo"
import { LESSONS, taughtChars } from "../data/lessons"
import { buildLessonExercises } from "./exercises"
import {
  composeSyllable,
  decomposeSyllable,
  jamoChars,
  romanize,
} from "./hangul"

describe("composeSyllable", () => {
  it("builds well-known blocks", () => {
    expect(composeSyllable("ㄱ", "ㅏ")).toBe("가")
    expect(composeSyllable("ㅎ", "ㅏ", "ㄴ")).toBe("한")
    expect(composeSyllable("ㄱ", "ㅡ", "ㄹ")).toBe("글")
    expect(composeSyllable("ㅇ", "ㅏ")).toBe("아")
    expect(composeSyllable("ㄲ", "ㅗ", "ㅊ")).toBe("꽃")
    expect(composeSyllable("ㅇ", "ㅣ", "ㅆ")).toBe("있")
    expect(composeSyllable("ㅁ", "ㅝ")).toBe("뭐")
    expect(composeSyllable("ㄷ", "ㅙ")).toBe("돼")
  })

  it("round-trips every syllable it composes", () => {
    const samples = ["가", "한", "글", "아", "꽃", "있", "뭐", "돼", "빵", "의", "워"]
    for (const sample of samples) {
      const parts = decomposeSyllable(sample)
      expect(parts).not.toBeNull()
      expect(composeSyllable(parts!.initial, parts!.medial, parts!.final)).toBe(sample)
    }
  })
})

describe("romanize", () => {
  it("matches Revised Romanization, including liaison", () => {
    const cases: [string, string][] = [
      ["가", "ga"],
      ["나무", "namu"],
      ["한글", "hangeul"],
      ["안녕하세요", "annyeonghaseyo"],
      ["감사합니다", "gamsahamnida"],
      ["있어요", "isseoyo"],
      ["한국어", "hangugeo"],
      ["꽃", "kkot"],
      ["빵", "ppang"],
      ["여덟", "yeodeol"],
      ["빨리", "ppalli"],
      ["고양이", "goyangi"],
      ["뭐", "mwo"],
      ["의자", "uija"],
      ["돼지", "dwaeji"],
      ["케이크", "keikeu"],
      ["카메라", "kamera"],
      ["비빔밥", "bibimbap"],
      ["김치", "gimchi"],
      ["학교", "hakgyo"],
      ["서울", "seoul"],
      ["어머니", "eomeoni"],
      ["아버지", "abeoji"],
    ]
    for (const [hangul, reading] of cases) {
      expect(romanize(hangul), hangul).toBe(reading)
    }
  })
})

describe("curriculum", () => {
  it("introduces every letter once and only uses letters already taught", () => {
    const seen = new Set<string>()
    LESSONS.forEach((lesson, index) => {
      for (const id of lesson.newJamo) {
        expect(seen.has(id), `${id} repeated`).toBe(false)
        seen.add(id)
      }
      const known = taughtChars(index)
      const entries = [
        ...lesson.words.map((word) => word.hangul),
        ...lesson.builds.map((build) => build.hangul),
      ]
      for (const hangul of entries) {
        for (const char of jamoChars(hangul)) {
          expect(known.has(char), `${lesson.id} uses untaught ${char} in ${hangul}`).toBe(true)
          expect(jamoByChar(char), char).toBeDefined()
        }
        for (const syllable of hangul) {
          const parts = decomposeSyllable(syllable)
          expect(parts, syllable).not.toBeNull()
          expect(composeSyllable(parts!.initial, parts!.medial, parts!.final)).toBe(syllable)
        }
      }
    })
    expect(seen.size).toBeGreaterThan(30)
  })

  it("stores a meaning and the romanization the reader will generate", () => {
    const readings = new Map<string, string>()
    for (const lesson of LESSONS) {
      expect(lesson.blurb.length).toBeGreaterThan(0)
      for (const word of lesson.words) {
        expect(word.meaning.trim().length, word.hangul).toBeGreaterThan(0)
        expect(romanize(word.hangul), word.hangul).toBe(word.romanization)
        const previous = readings.get(word.hangul)
        if (previous) expect(previous).toBe(word.romanization)
        readings.set(word.hangul, word.romanization)
      }
      for (const build of lesson.builds) {
        expect(build.meaning.trim().length, build.hangul).toBeGreaterThan(0)
        expect([...build.hangul].length, build.hangul).toBe(1)
      }
    }
  })

  it("gives the first lessons real practice, including vowels and basic consonants", () => {
    const vowels = buildLessonExercises(LESSONS[0], 0)
    expect(vowels.length).toBeGreaterThanOrEqual(6)
    expect(vowels.every((item) => item.kind === "char-to-sound" || item.kind === "sound-to-char")).toBe(true)
    for (const item of vowels) {
      expect(item.choices?.some((choice) => choice.id === item.answerId)).toBe(true)
    }

    const consonants = LESSONS.find((lesson) => lesson.id === "g-n-m")!
    const practice = buildLessonExercises(consonants, 1)
    expect(practice.some((item) => item.kind === "build")).toBe(true)
    expect(practice.some((item) => item.kind === "read")).toBe(true)
    for (const item of practice) {
      if (item.kind === "read") {
        expect(item.meaning && item.meaning.length > 0).toBe(true)
        expect(item.choices?.some((choice) => choice.id === item.answerId)).toBe(true)
      }
      if (item.kind === "build" && item.build) {
        const built = composeSyllable(item.build.initial, item.build.medial, item.build.final)
        expect(built).toBe(item.character)
        expect(item.build.initialChoices).toContain(item.build.initial)
        expect(item.build.medialChoices).toContain(item.build.medial)
      }
    }

    const again = buildLessonExercises(LESSONS[0], 0)
    expect(again.map((item) => item.id)).toEqual(vowels.map((item) => item.id))
  })
})
