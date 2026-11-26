import { audioClips } from "@/data/audio-manifest"

let player: HTMLAudioElement | null = null

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

export function hasClip(text: string): boolean {
  return Boolean(text && audioClips[text])
}

/** Bundled recording. Call this inside the tap handler so Safari keeps the gesture. */
export function playPronunciation(text: string): void {
  if (!text || typeof Audio === "undefined") {
    speakKorean(text)
    return
  }
  const clip = audioClips[text]
  if (!clip) {
    speakKorean(text)
    return
  }
  const url = `${import.meta.env.BASE_URL}audio/${clip.file}`
  if (!player) {
    player = new Audio()
    player.volume = 1
  } else player.pause()
  player.src = url
  const started = player.play()
  if (started) {
    started.catch(() => speakKorean(clip.speak))
  }
}

/** Last resort when a clip is missing or the device blocks playback. */
export function speakKorean(text: string): boolean {
  if (!speechSupported() || !text) return false
  try {
    const synth = window.speechSynthesis
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "ko-KR"
    utter.rate = 0.85
    const voices = synth.getVoices()
    const voice = voices.find((item) => item.lang.toLowerCase().replace("_", "-").startsWith("ko"))
    if (voice) utter.voice = voice
    synth.cancel()
    synth.speak(utter)
    return true
  } catch {
    return false
  }
}
