import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useProgress } from "@/lib/progress"

export function SettingsDialog() {
  const { state, setSound, reset } = useProgress()
  const [confirming, setConfirming] = useState(false)

  return (
    <Dialog onOpenChange={() => setConfirming(false)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Settings">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Settings</DialogTitle>
          <DialogDescription>
            Progress stays on this device. Readings use Revised Romanization. Audio uses a Korean voice when your device has one.
          </DialogDescription>
        </DialogHeader>
        <Button
          type="button"
          variant="secondary"
          className="h-12 justify-between rounded-2xl font-extrabold"
          onClick={() => setSound(!state.sound)}
        >
          Sound
          <span>{state.sound ? "On" : "Off"}</span>
        </Button>
        {confirming ? (
          <div className="grid gap-2">
            <p className="text-sm font-bold text-ink">This wipes your streak, XP, and lessons on this device.</p>
            <Button type="button" variant="destructive" className="h-12 rounded-2xl font-extrabold" onClick={reset}>
              Reset everything
            </Button>
            <Button type="button" variant="ghost" className="h-12 rounded-2xl font-extrabold" onClick={() => setConfirming(false)}>
              Keep my progress
            </Button>
          </div>
        ) : (
          <Button type="button" variant="ghost" className="h-12 rounded-2xl font-extrabold" onClick={() => setConfirming(true)}>
            Reset progress
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
