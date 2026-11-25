import { jamoByChar, jamoById, type Jamo } from "../data/jamo"
import {
  learnedJamo,
  lessonIndex,
  LESSONS,
  type BuildTarget,
  type Lesson,
  type Vocab,
} from "../data/lessons"
import { composeSyllable, decomposeSyllable, isValidFinal, romanize } from "./hangul"
import { hashSeed, mulberry32, shuffle } from "./rng"
import { jamoCardId, syllableCardId, wordCardId, type SrsCard } from "./srs"

export type Choice = {
  id: string
  title: string
  detail?: string
  hangul?: boolean
}

export type BuildSpec = {
  initial: string
  medial: string
  final: string
  initialChoices: string[]
  medialChoices: string[]
  finalChoices: string[]
}

export type Exercise = {
  id: string
  kind: "char-to-sound" | "sound-to-char" | "build" | "read"
  prompt: string
  note?: string
  character?: string
  romanization?: string
  meaning?: string
  choices?: Choice[]
  answerId?: string
  build?: BuildSpec
  explain: string
  focusIds: string[]
}

function pickChoices(answer: string, pool: string[], count: number, rng: () => number): string[] {
  const unique = [...new Set(pool.filter((item) => item && item !== answer))]
  return shuffle([answer, ...shuffle(unique, rng).slice(0, Math.max(0, count - 1))], rng)
}

function sameKindFirst(jamo: Jamo, pool: Jamo[], rng: () => number, count: number): Jamo[] {
  const same = pool.filter((item) => item.id !== jamo.id && item.kind === jamo.kind)
  const other = pool.filter((item) => item.id !== jamo.id && item.kind !== jamo.kind)
  const distractors = shuffle([...same, ...other], rng).slice(0, count - 1)
  return shuffle([jamo, ...distractors], rng)
}

function charToSound(jamo: Jamo, pool: Jamo[], rng: () => number, id: string): Exercise {
  const options = sameKindFirst(jamo, pool, rng, 4)
  return {
    id,
    kind: "char-to-sound",
    prompt: "What sound is this?",
    character: jamo.char,
    romanization: jamo.romanization,
    choices: options.map((item) => ({
      id: item.id,
      title: item.romanization,
      detail: item.hint,
    })),
    answerId: jamo.id,
    explain: `${jamo.char} is ${jamo.romanization} — ${jamo.hint}.`,
    focusIds: [jamoCardId(jamo.id)],
  }
}

function soundToChar(jamo: Jamo, pool: Jamo[], rng: () => number, id: string): Exercise {
  const options = sameKindFirst(jamo, pool, rng, 4)
  return {
    id,
    kind: "sound-to-char",
    prompt: `Which letter is «${jamo.romanization}»?`,
    note: jamo.hint,
    romanization: jamo.romanization,
    choices: options.map((item) => ({
      id: item.id,
      title: item.char,
      hangul: true,
    })),
    answerId: jamo.id,
    explain: `${jamo.romanization} (${jamo.hint}) is written ${jamo.char}.`,
    focusIds: [jamoCardId(jamo.id)],
  }
}

function buildExercise(target: BuildTarget, pool: Jamo[], rng: () => number, id: string): Exercise {
  const parts = decomposeSyllable(target.hangul)
  if (!parts || [...target.hangul].length !== 1) {
    throw new Error(`Build target must be one syllable: ${target.hangul}`)
  }
  const consonants = pool.filter((item) => item.kind === "consonant").map((item) => item.char)
  const vowels = pool.filter((item) => item.kind === "vowel").map((item) => item.char)
  const finals = consonants.filter((char) => isValidFinal(char))
  const bits = [parts.initial, parts.medial, parts.final].filter(Boolean)
  const gloss = target.lexical ? `It means ${target.meaning}.` : `Said as “${target.meaning}”.`
  return {
    id,
    kind: "build",
    prompt: target.lexical ? "Build this word" : "Build this syllable",
    character: target.hangul,
    romanization: romanize(target.hangul),
    meaning: target.meaning,
    note: target.lexical ? target.meaning : `Syllable · ${target.meaning}`,
    build: {
      initial: parts.initial,
      medial: parts.medial,
      final: parts.final,
      initialChoices: pickChoices(parts.initial, consonants, 5, rng),
      medialChoices: pickChoices(parts.medial, vowels, 6, rng),
      finalChoices: parts.final ? pickChoices(parts.final, finals, 5, rng) : [],
    },
    explain: `${target.hangul} is ${bits.join(" + ")}. ${gloss}`,
    focusIds: [syllableCardId(target.hangul)],
  }
}

function readingPool(words: Vocab[], pool: Jamo[], rng: () => number): string[] {
  const readings = new Set(words.map((word) => word.romanization))
  const consonants = pool.filter((item) => item.kind === "consonant")
  const vowels = pool.filter((item) => item.kind === "vowel")
  if (consonants.length === 0 || vowels.length === 0) return [...readings]
  for (let n = 0; n < 24; n++) {
    const initial = consonants[Math.floor(rng() * consonants.length)]
    const medial = vowels[Math.floor(rng() * vowels.length)]
    readings.add(romanize(composeSyllable(initial.char, medial.char)))
  }
  return [...readings]
}

function readExercise(word: Vocab, bank: string[], rng: () => number, id: string): Exercise {
  const distractors = shuffle(
    bank.filter((reading) => reading !== word.romanization),
    rng,
  ).slice(0, 3)
  return {
    id,
    kind: "read",
    prompt: "How do you read this?",
    character: word.hangul,
    romanization: word.romanization,
    meaning: word.meaning,
    note: word.meaning,
    choices: shuffle([word.romanization, ...distractors], rng).map((reading) => ({
      id: reading,
      title: reading,
    })),
    answerId: word.romanization,
    explain: `${word.hangul} is read ${word.romanization}. It means ${word.meaning}.`,
    focusIds: [wordCardId(word.hangul)],
  }
}

function takeBalanced(items: Exercise[], count: number, rng: () => number): Exercise[] {
  const groups = new Map<Exercise["kind"], Exercise[]>()
  for (const item of items) {
    const list = groups.get(item.kind) ?? []
    list.push(item)
    groups.set(item.kind, list)
  }
  const picked: Exercise[] = []
  const seen = new Set<string>()
  for (const kind of shuffle([...groups.keys()], rng)) {
    const group = shuffle(groups.get(kind) ?? [], rng)
    const first = group[0]
    if (!first) continue
    picked.push(first)
    seen.add(first.id)
  }
  for (const item of shuffle(items, rng)) {
    if (picked.length >= count) break
    if (seen.has(item.id)) continue
    picked.push(item)
    seen.add(item.id)
  }
  return shuffle(picked, rng).slice(0, count)
}

export function buildLessonExercises(lesson: Lesson, attempt: number): Exercise[] {
  const index = lessonIndex(lesson.id)
  const pool = learnedJamo(index)
  const rng = mulberry32(hashSeed(`${lesson.id}:${attempt}`))
  const made: Exercise[] = []
  let n = 0
  const nextId = (kind: string) => `${lesson.id}-${kind}-${n++}`

  for (const id of lesson.newJamo) {
    const jamo = jamoById(id)
    made.push(charToSound(jamo, pool, rng, nextId("sound")))
    made.push(soundToChar(jamo, pool, rng, nextId("char")))
  }

  for (const target of lesson.builds) {
    made.push(buildExercise(target, pool, rng, nextId("build")))
  }

  const earlierWords = LESSONS.slice(0, index).flatMap((item) => item.words)
  const bank = readingPool([...lesson.words, ...earlierWords], pool, rng)
  for (const word of lesson.words) {
    made.push(readExercise(word, bank, rng, nextId("read")))
  }

  let picked = takeBalanced(made, 8, rng)

  if (picked.length < 6) {
    const review = pool.filter((jamo) => !lesson.newJamo.includes(jamo.id))
    for (const jamo of shuffle(review, rng)) {
      if (picked.length >= 8) break
      const exercise = rng() > 0.5
        ? charToSound(jamo, pool, rng, nextId("review-sound"))
        : soundToChar(jamo, pool, rng, nextId("review-char"))
      picked.push(exercise)
    }
    picked = shuffle(picked, rng)
  }

  return picked
}

function wordByHangul(hangul: string): Vocab | undefined {
  for (const lesson of LESSONS) {
    const word = lesson.words.find((item) => item.hangul === hangul)
    if (word) return word
    const build = lesson.builds.find((item) => item.hangul === hangul && item.lexical)
    if (build) {
      return { hangul, romanization: romanize(hangul), meaning: build.meaning }
    }
  }
  return undefined
}

export function buildReviewExercises(cards: SrsCard[], attempt: number): Exercise[] {
  const rng = mulberry32(hashSeed(`review:${attempt}:${cards.map((card) => card.id).join(",")}`))
  const pool = learnedJamo(LESSONS.length - 1)
  const allWords = LESSONS.flatMap((lesson) => lesson.words)
  const bank = readingPool(allWords, pool, rng)
  const made: Exercise[] = []
  let n = 0

  for (const card of cards) {
    if (card.id.startsWith("jamo:")) {
      const jamo = jamoById(card.id.slice(5))
      made.push(charToSound(jamo, pool, rng, `review-sound-${n++}`))
      made.push(soundToChar(jamo, pool, rng, `review-char-${n++}`))
    } else if (card.id.startsWith("word:") || card.id.startsWith("syllable:")) {
      const hangul = card.id.slice(card.id.indexOf(":") + 1)
      if (card.id.startsWith("syllable:") && [...hangul].length === 1 && decomposeSyllable(hangul)) {
        const known = wordByHangul(hangul)
        const meaning = known?.meaning ?? romanize(hangul)
        made.push(
          buildExercise(
            { hangul, meaning, lexical: Boolean(known) },
            pool,
            rng,
            `review-build-${n++}`,
          ),
        )
      }
      const word = wordByHangul(hangul) ?? (allWords.find((item) => item.hangul === hangul))
      if (word && card.id.startsWith("word:")) {
        made.push(readExercise(word, bank, rng, `review-read-${n++}`))
      }
    }
  }

  return shuffle(made, rng).slice(0, 8)
}

export function answerIsCorrect(exercise: Exercise, choiceId: string): boolean {
  return exercise.answerId === choiceId
}

export function builtSyllable(initial: string, medial: string, final: string): string | null {
  if (!initial || !medial) return null
  try {
    return composeSyllable(initial, medial, final)
  } catch {
    return null
  }
}

export function jamoForExerciseCharacter(char: string): Jamo | undefined {
  return jamoByChar(char)
}
