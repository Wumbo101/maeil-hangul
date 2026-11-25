export const INITIALS = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const

export const MEDIALS = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
] as const

export const FINALS = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ",
  "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ",
  "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const

const INITIAL_RR: Record<string, string> = {
  ㄱ: "g", ㄲ: "kk", ㄴ: "n", ㄷ: "d", ㄸ: "tt", ㄹ: "r", ㅁ: "m",
  ㅂ: "b", ㅃ: "pp", ㅅ: "s", ㅆ: "ss", ㅇ: "", ㅈ: "j", ㅉ: "jj",
  ㅊ: "ch", ㅋ: "k", ㅌ: "t", ㅍ: "p", ㅎ: "h",
}

const MEDIAL_RR: Record<string, string> = {
  ㅏ: "a", ㅐ: "ae", ㅑ: "ya", ㅒ: "yae", ㅓ: "eo", ㅔ: "e", ㅕ: "yeo",
  ㅖ: "ye", ㅗ: "o", ㅘ: "wa", ㅙ: "wae", ㅚ: "oe", ㅛ: "yo", ㅜ: "u",
  ㅝ: "wo", ㅞ: "we", ㅟ: "wi", ㅠ: "yu", ㅡ: "eu", ㅢ: "ui", ㅣ: "i",
}

/** Representative batchim sounds used by Revised Romanization at the end of a word. */
const FINAL_RR: Record<string, string> = {
  ㄱ: "k", ㄲ: "k", ㄳ: "k", ㄴ: "n", ㄵ: "n", ㄶ: "n", ㄷ: "t",
  ㄹ: "l", ㄺ: "k", ㄻ: "m", ㄼ: "l", ㄽ: "l", ㄾ: "l", ㄿ: "p",
  ㅀ: "l", ㅁ: "m", ㅂ: "p", ㅄ: "p", ㅅ: "t", ㅆ: "t", ㅇ: "ng",
  ㅈ: "t", ㅊ: "t", ㅋ: "k", ㅌ: "t", ㅍ: "p", ㅎ: "t",
}

/** Finals that slide onto a following vowel (연음). ㅇ and ㅎ do not. */
const MOVABLE_FINALS = new Set([
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅆ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ",
])

/** Batchim that nasalizes before ㄴ or ㅁ: 감사합니다 → gamsahamnida. */
const NASAL_TRIGGER = new Set(["ㄴ", "ㅁ"])
const NASALIZED: Record<string, string> = {
  ㅂ: "ㅁ",
  ㅍ: "ㅁ",
  ㄱ: "ㅇ",
  ㅋ: "ㅇ",
  ㄲ: "ㅇ",
  ㄷ: "ㄴ",
  ㅌ: "ㄴ",
  ㅅ: "ㄴ",
  ㅆ: "ㄴ",
  ㅈ: "ㄴ",
  ㅊ: "ㄴ",
  ㅎ: "ㄴ",
}

const FINAL_SET = new Set<string>(FINALS)

export type SyllableParts = {
  initial: string
  medial: string
  final: string
}

function indexIn(list: readonly string[], value: string): number {
  return list.indexOf(value)
}

export function isHangulSyllable(char: string): boolean {
  if ([...char].length !== 1) return false
  const code = char.charCodeAt(0)
  return code >= 0xac00 && code <= 0xd7a3
}

export function composeSyllable(initial: string, medial: string, final = ""): string {
  const i = indexIn(INITIALS, initial)
  const m = indexIn(MEDIALS, medial)
  const f = indexIn(FINALS, final)
  if (i < 0 || m < 0 || f < 0) {
    throw new Error(`Cannot compose ${initial}+${medial}+${final}`)
  }
  return String.fromCharCode(0xac00 + (i * 21 + m) * 28 + f)
}

export function decomposeSyllable(char: string): SyllableParts | null {
  if (!isHangulSyllable(char)) return null
  const index = char.charCodeAt(0) - 0xac00
  const finalIndex = index % 28
  const medialIndex = Math.floor(index / 28) % 21
  const initialIndex = Math.floor(index / (28 * 21))
  return {
    initial: INITIALS[initialIndex],
    medial: MEDIALS[medialIndex],
    final: FINALS[finalIndex],
  }
}

export function isValidFinal(char: string): boolean {
  return FINAL_SET.has(char)
}

/** Revised Romanization for a word, including 연음 onto a following vowel. */
export function romanize(hangul: string): string {
  const syllables = [...hangul].map((char) => {
    const parts = decomposeSyllable(char)
    if (!parts) throw new Error(`Not a Hangul syllable: ${char}`)
    return { ...parts }
  })

  for (let i = 0; i < syllables.length - 1; i++) {
    const current = syllables[i]
    const next = syllables[i + 1]
    if (current.final && MOVABLE_FINALS.has(current.final) && next.initial === "ㅇ") {
      next.initial = current.final
      current.final = ""
    }
  }

  for (let i = 0; i < syllables.length - 1; i++) {
    const current = syllables[i]
    const next = syllables[i + 1]
    const nasal = current.final ? NASALIZED[current.final] : undefined
    if (nasal && NASAL_TRIGGER.has(next.initial)) current.final = nasal
  }

  return syllables
    .map((syllable, index) => {
      let initial = INITIAL_RR[syllable.initial]
      if (initial === undefined) {
        throw new Error(`No romanization for initial ${syllable.initial}`)
      }
      if (syllable.initial === "ㄹ" && index > 0 && syllables[index - 1].final === "ㄹ") {
        initial = "l"
      }
      const medial = MEDIAL_RR[syllable.medial]
      if (medial === undefined) {
        throw new Error(`No romanization for vowel ${syllable.medial}`)
      }
      const final = syllable.final ? FINAL_RR[syllable.final] : ""
      if (syllable.final && final === undefined) {
        throw new Error(`No romanization for batchim ${syllable.final}`)
      }
      return `${initial}${medial}${final}`
    })
    .join("")
}

export function jamoChars(hangul: string): string[] {
  const chars: string[] = []
  for (const char of hangul) {
    const parts = decomposeSyllable(char)
    if (!parts) continue
    chars.push(parts.initial, parts.medial)
    if (parts.final) chars.push(parts.final)
  }
  return chars
}
