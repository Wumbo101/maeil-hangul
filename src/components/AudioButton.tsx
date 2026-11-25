import { useEffect, useState } from "react"
import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { speechSupported, speakKorean } from "@/lib/speech"

export function AudioButton({ text, label }: { text: string; label?: string }) {
  const [ready, setReady] = useState(() => speechSupported())

  useEffect(() => {
    if (!speechSupported()) return
    const synth = window.speechSynthesis
    const mark = () => setReady(speechSupported())
    synth.addEventListener("voiceschanged", mark)
    return () => synth.removeEventListener("voiceschanged", mark)
  }, [])

  if (!ready) return null

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      className="rounded-full"
      aria-label={label ?? `Play ${text}`}
      onClick={() => speakKorean(text)}
    >
      <Volume2 />
    </Button>
  )
}
