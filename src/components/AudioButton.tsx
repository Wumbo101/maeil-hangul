import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { playPronunciation } from "@/lib/speech"

export function AudioButton({ text, label }: { text: string; label?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      className="rounded-full"
      aria-label={label ?? `Play ${text}`}
      onClick={() => playPronunciation(text)}
    >
      <Volume2 />
    </Button>
  )
}
