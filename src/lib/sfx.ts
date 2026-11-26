import type { Celebration } from "@/lib/progress"

const FILES = {
  tap: "sfx/tap.wav",
  correct: "sfx/correct.wav",
  wrong: "sfx/wrong.wav",
  lesson: "sfx/lesson.wav",
  streak: "sfx/streak.wav",
  milestone: "sfx/milestone.wav",
} as const

type EffectName = keyof typeof FILES

const VOLUME = 0.32
let enabled = true
const clips = new Map<EffectName, HTMLAudioElement>()

export function setEffectsEnabled(on: boolean): void {
  enabled = on
}

function element(name: EffectName): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null
  let audio = clips.get(name)
  if (!audio) {
    audio = new Audio(`${import.meta.env.BASE_URL}${FILES[name]}`)
    audio.preload = "auto"
    clips.set(name, audio)
  }
  return audio
}

/** Play each effect once at zero volume so later playback works outside the tap on iOS. */
export function primeEffects(): void {
  for (const name of Object.keys(FILES) as EffectName[]) {
    const audio = element(name)
    if (!audio || audio.dataset.primed === "1") continue
    audio.dataset.primed = "1"
    audio.volume = 0
    audio.play()?.then(() => {
      if (audio.dataset.live === "1") return
      audio.pause()
      try {
        audio.currentTime = 0
      } catch {
        // Metadata may not be ready yet.
      }
      audio.volume = VOLUME
    }).catch(() => {
      audio.volume = VOLUME
    })
  }
}

function haptic(pattern: number | number[]): void {
  if (!enabled || typeof navigator === "undefined" || !navigator.vibrate) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Some browsers expose vibrate and then refuse the call.
  }
}

function play(name: EffectName, pattern: number | number[]): void {
  haptic(pattern)
  if (!enabled) return
  const audio = element(name)
  if (!audio) return
  audio.dataset.live = "1"
  audio.volume = VOLUME
  try {
    audio.currentTime = 0
  } catch {
    // Ignore until the file has loaded.
  }
  // A separate element from the Korean pronunciation player, so this never stops that clip.
  void audio.play().catch(() => {})
}

export function playTap(): void {
  play("tap", 8)
}

export function playCorrect(): void {
  play("correct", [12, 30, 12])
}

export function playWrong(): void {
  play("wrong", 18)
}

export function playSessionEnd(celebration: Celebration | null, completed: boolean): void {
  if (celebration?.type === "milestone") {
    play("milestone", [20, 40, 20, 40, 30, 50, 40])
    return
  }
  if (celebration) {
    play("streak", [16, 36, 16, 36, 28])
    return
  }
  if (completed) play("lesson", [14, 36, 14, 36, 24])
}
