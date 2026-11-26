import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { AudioButton } from "@/components/AudioButton"
import { builtSyllable, type Exercise } from "@/lib/exercises"
import { useProgress } from "@/lib/progress"
import { playPronunciation } from "@/lib/speech"
import { jamoById } from "@/data/jamo"

type Item = { exercise: Exercise; misses: number; graded: boolean }

function clipText(exercise: Exercise): string {
  if (exercise.character) return exercise.character
  if (exercise.answerId) {
    try {
      return jamoById(exercise.answerId).char
    } catch {
      return ""
    }
  }
  return ""
}

function emptySlots(exercise: Exercise | undefined) {
  const only = exercise?.build?.initialChoices.length === 1 ? exercise.build.initialChoices[0] : ""
  return { initial: only, medial: "", final: "" }
}

export function DrillSession({
  exercises,
  xpEach,
  onExit,
  onFinish,
}: {
  exercises: Exercise[]
  xpEach: number
  onExit: () => void
  onFinish: (summary: { correct: number; total: number; xp: number }) => void
}) {
  const { recordAnswer, state } = useProgress()
  const [queue, setQueue] = useState<Item[]>(() => exercises.map((exercise) => ({ exercise, misses: 0, graded: false })))
  const [picked, setPicked] = useState<string | null>(null)
  const [slots, setSlots] = useState(() => emptySlots(exercises[0]))
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle")
  const [firstCorrect, setFirstCorrect] = useState(0)
  const [xp, setXp] = useState(0)
  const [confirmExit, setConfirmExit] = useState(false)
  const [round, setRound] = useState(0)
  const reported = useRef(false)
  const timer = useRef<number | null>(null)

  const current = queue[0]
  const questionKey = `${current?.exercise.id ?? ""}:${round}`
  const [seenKey, setSeenKey] = useState(questionKey)
  if (current && questionKey !== seenKey) {
    setSeenKey(questionKey)
    setSlots(emptySlots(current.exercise))
    setPicked(null)
    setStatus("idle")
  }
  const total = exercises.length
  const progress = total === 0 ? 0 : Math.round(((total - queue.length) / total) * 100)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    if (queue.length > 0 || reported.current) return
    reported.current = true
    onFinish({ correct: firstCorrect, total, xp })
  }, [firstCorrect, onFinish, queue.length, total, xp])

  function clearTimer() {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
  }

  function advance(correct: boolean) {
    clearTimer()
    setRound((value) => value + 1)
    setQueue((items) => {
      const [head, ...rest] = items
      if (!head) return items
      if (correct || head.misses >= 2) return rest
      return [...rest, head]
    })
  }

  if (!current) return null
  const exercise = current.exercise

  function gradeFirst(correct: boolean) {
    if (!current.graded) {
      recordAnswer(
        exercise.focusIds.map((id) => ({ id, correct })),
        correct ? xpEach : 0,
      )
      if (correct) {
        setFirstCorrect((value) => value + 1)
        setXp((value) => value + xpEach)
        if (state.sound) playPronunciation(clipText(exercise))
      }
    }
    setQueue((items) =>
      items.map((item, index) =>
        index === 0 ? { ...item, graded: true, misses: correct ? item.misses : item.misses + 1 } : item,
      ),
    )
  }

  function answerChoice(id: string) {
    if (status !== "idle" || !exercise.answerId) return
    const correct = id === exercise.answerId
    setPicked(id)
    gradeFirst(correct)
    setStatus(correct ? "correct" : "wrong")
    if (correct) {
      clearTimer()
      timer.current = window.setTimeout(() => advance(true), 700)
    }
  }

  function checkBuild() {
    if (status !== "idle" || !exercise.build) return
    const built = builtSyllable(slots.initial, slots.medial, slots.final)
    const correct = built === exercise.character
    gradeFirst(correct)
    setStatus(correct ? "correct" : "wrong")
    if (correct) {
      clearTimer()
      timer.current = window.setTimeout(() => advance(true), 900)
    }
  }

  const buildReady = Boolean(
    exercise.build && slots.initial && slots.medial && (exercise.build.final ? slots.final : true),
  )
  const preview = exercise.build ? builtSyllable(slots.initial, slots.medial, slots.final) : null

  return (
    <div className="flex min-h-full flex-col px-5 pt-4 pb-8">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" className="rounded-full" aria-label="Leave practice" onClick={() => setConfirmExit(true)}>
          <X />
        </Button>
        <Progress value={progress} className="h-3 flex-1 bg-[#f3e2d2]" />
        <span className="w-12 text-right text-sm font-extrabold text-flame">+{xp}</span>
      </div>

      <p className="mt-6 text-sm font-extrabold tracking-[0.14em] text-muted-foreground uppercase">{exercise.prompt}</p>
      {exercise.kind !== "build" && exercise.note ? (
        <p className="mt-1 text-lg font-extrabold text-ink">{exercise.note}</p>
      ) : null}

      {exercise.kind !== "build" && exercise.character ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <p className="font-display text-8xl leading-none text-ink">{exercise.character}</p>
          <AudioButton text={exercise.character} />
        </div>
      ) : null}

      {exercise.kind === "build" && exercise.build ? (
        <div className="mt-2">
          <div className="flex min-h-28 items-center justify-center gap-3">
            <p className="font-display text-7xl leading-none text-ink">{preview ?? "·"}</p>
            {preview ? <AudioButton text={preview} /> : null}
          </div>
          <p className="text-center text-base font-extrabold text-ink">
            {exercise.romanization}
            <span className="mt-1 block text-sm font-bold text-muted-foreground">{exercise.note}</span>
          </p>
          <SlotBank
            label="First consonant"
            choices={exercise.build.initialChoices}
            value={slots.initial}
            locked={exercise.build.initialChoices.length === 1}
            disabled={status !== "idle"}
            onPick={(initial) => setSlots((prev) => ({ ...prev, initial }))}
          />
          <SlotBank
            label="Vowel"
            choices={exercise.build.medialChoices}
            value={slots.medial}
            disabled={status !== "idle"}
            onPick={(medial) => setSlots((prev) => ({ ...prev, medial }))}
          />
          {exercise.build.final ? (
            <SlotBank
              label="Final consonant"
              choices={exercise.build.finalChoices}
              value={slots.final}
              disabled={status !== "idle"}
              onPick={(final) => setSlots((prev) => ({ ...prev, final }))}
            />
          ) : null}
        </div>
      ) : (
        <div className={exercise.choices?.every((choice) => choice.hangul) ? "mt-8 grid grid-cols-2 gap-3" : "mt-6 grid grid-cols-1 gap-3"}>
          {exercise.choices?.map((choice) => {
            const isAnswer = status !== "idle" && choice.id === exercise.answerId
            const isWrong = status === "wrong" && picked === choice.id && !isAnswer
            return (
              <Button
                key={choice.id}
                type="button"
                variant="outline"
                data-testid="choice"
                disabled={status !== "idle"}
                onClick={() => answerChoice(choice.id)}
                className={[
                  "h-auto min-h-16 rounded-2xl px-4 py-3 whitespace-normal",
                  choice.hangul ? "min-h-28 justify-center" : "justify-start text-left",
                  isAnswer ? "border-transparent bg-[#14804a] text-white hover:bg-[#14804a]" : "",
                  isWrong ? "border-transparent bg-[#d7263d] text-white hover:bg-[#d7263d]" : "",
                ].join(" ")}
              >
                <span className="flex flex-col items-start gap-0.5">
                  <span className={choice.hangul ? "font-display text-6xl leading-none" : "text-lg font-extrabold"}>{choice.title}</span>
                  {choice.detail ? (
                    <span className={isAnswer || isWrong ? "text-sm font-bold text-white/90" : "text-sm font-bold text-muted-foreground"}>
                      {choice.detail}
                    </span>
                  ) : null}
                </span>
              </Button>
            )
          })}
        </div>
      )}

      {status === "correct" ? (
        <p className="mt-5 rounded-2xl bg-[#e5f6ea] px-4 py-3 font-extrabold text-[#146c38]">
          {current.misses === 0 ? `That's it. +${xpEach} XP` : "Got it."}
        </p>
      ) : null}
      {status === "wrong" ? (
        <div className="mt-5 rounded-2xl bg-[#fde8e6] px-4 py-3">
          <p className="font-extrabold text-[#9f1d2c]">{exercise.explain}</p>
          <Button type="button" className="mt-3 h-12 w-full rounded-2xl font-extrabold" onClick={() => advance(false)}>
            Continue
          </Button>
        </div>
      ) : null}

      {exercise.kind === "build" && status === "idle" ? (
        <Button type="button" className="mt-6 h-14 w-full rounded-2xl text-base font-extrabold" disabled={!buildReady} onClick={checkBuild}>
          Check
        </Button>
      ) : null}

      <Dialog open={confirmExit} onOpenChange={setConfirmExit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Leave this round?</DialogTitle>
            <DialogDescription>
              XP you already earned stays. This lesson is only marked complete if you finish it.
            </DialogDescription>
          </DialogHeader>
          <Button type="button" className="h-12 rounded-2xl font-extrabold" onClick={onExit}>Leave</Button>
          <Button type="button" variant="ghost" className="h-12 rounded-2xl font-extrabold" onClick={() => setConfirmExit(false)}>
            Keep going
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SlotBank({
  label,
  choices,
  value,
  disabled,
  locked = false,
  onPick,
}: {
  label: string
  choices: string[]
  value: string
  disabled: boolean
  locked?: boolean
  onPick: (value: string) => void
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => {
          const selected = value === choice
          return (
            <Button
              key={`${label}-${choice}`}
              type="button"
              variant={selected ? "default" : "outline"}
              disabled={disabled || locked}
              aria-pressed={selected}
              className="h-14 min-w-14 rounded-2xl font-display text-3xl"
              onClick={() => onPick(choice)}
            >
              {choice}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
