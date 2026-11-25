import { addDays } from "./dates"

export type SrsCard = {
  id: string
  correct: number
  wrong: number
  streak: number
  interval: number
  due: string
}

export function jamoCardId(id: string): string {
  return `jamo:${id}`
}

export function wordCardId(hangul: string): string {
  return `word:${hangul}`
}

export function syllableCardId(hangul: string): string {
  return `syllable:${hangul}`
}

export function gradeCard(
  existing: SrsCard | undefined,
  id: string,
  correct: boolean,
  today: string,
): SrsCard {
  const card: SrsCard = existing ?? {
    id,
    correct: 0,
    wrong: 0,
    streak: 0,
    interval: 0,
    due: today,
  }

  if (!correct) {
    return {
      ...card,
      wrong: card.wrong + 1,
      streak: 0,
      interval: 0,
      due: today,
    }
  }

  const streak = card.streak + 1
  const interval = streak <= 1 ? 1 : streak === 2 ? 3 : 7
  return {
    ...card,
    correct: card.correct + 1,
    streak,
    interval,
    due: addDays(today, interval),
  }
}

/** Letters and words the learner has missed and that are due today or earlier. */
export function dueCards(cards: Record<string, SrsCard>, today: string): SrsCard[] {
  return Object.values(cards)
    .filter((card) => card.wrong > 0 && card.due <= today)
    .sort((a, b) => b.wrong - a.wrong || a.due.localeCompare(b.due) || a.id.localeCompare(b.id))
}

export function upcomingCards(cards: Record<string, SrsCard>, today: string): SrsCard[] {
  return Object.values(cards)
    .filter((card) => card.wrong > 0 && card.due > today)
    .sort((a, b) => a.due.localeCompare(b.due) || b.wrong - a.wrong)
}
