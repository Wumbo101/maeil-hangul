export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

export function speakKorean(text: string): boolean {
  if (!speechSupported() || !text) return false
  try {
    const synth = window.speechSynthesis
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "ko-KR"
    utter.rate = 0.82
    const voice = synth.getVoices().find((item) => item.lang.toLowerCase().startsWith("ko"))
    if (voice) utter.voice = voice
    synth.cancel()
    synth.speak(utter)
    return true
  } catch {
    return false
  }
}
