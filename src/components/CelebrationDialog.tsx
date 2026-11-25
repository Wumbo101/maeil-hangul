import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Confetti } from "@/components/Confetti"
import { Flame } from "@/components/Flame"
import { useProgress, type Celebration } from "@/lib/progress"

function copyFor(celebration: Celebration): { kicker: string; title: string; body: string } {
  if (celebration.type === "milestone" && celebration.days === 7) {
    return {
      kicker: "7 days",
      title: "A week of Hangul.",
      body: celebration.freezeAwarded
        ? "You earned a streak freeze. The letters are starting to look like language."
        : "The letters are starting to look like language.",
    }
  }
  if (celebration.type === "milestone" && celebration.days === 30) {
    return {
      kicker: "30 days",
      title: "A month of showing up.",
      body: "This is how reading sticks.",
    }
  }
  if (celebration.type === "milestone" && celebration.days === 100) {
    return {
      kicker: "100 days",
      title: "You can read Hangul.",
      body: "A hundred days. Keep the flame.",
    }
  }
  if (celebration.days <= 1) {
    return {
      kicker: "Day 1",
      title: "The flame is lit.",
      body: "Come back tomorrow. That’s the whole habit.",
    }
  }
  return {
    kicker: `Day ${celebration.days}`,
    title: "You showed up.",
    body: celebration.freezeAwarded
      ? "Today’s goal is done, and you earned a streak freeze."
      : "Today’s goal is done. The streak holds.",
  }
}

export function CelebrationDialog() {
  const { celebration, dismissCelebration } = useProgress()
  const copy = celebration ? copyFor(celebration) : null

  return (
    <Dialog open={Boolean(celebration)} onOpenChange={(open) => { if (!open) dismissCelebration() }}>
      <DialogContent showCloseButton={false} className="overflow-visible bg-paper sm:max-w-md">
        {celebration && copy ? (
          <div className="relative flex flex-col items-center px-2 py-4 text-center">
            <Confetti />
            <Flame className="relative z-10 h-28 w-24" />
            <p className="relative z-10 mt-2 text-xs font-extrabold tracking-[0.16em] text-flame uppercase">{copy.kicker}</p>
            <DialogTitle className="relative z-10 mt-1 font-display text-4xl text-ink">{copy.title}</DialogTitle>
            <DialogDescription className="relative z-10 mt-2 max-w-xs text-base font-bold text-ink/80">
              {copy.body}
            </DialogDescription>
            <Button type="button" className="relative z-10 mt-6 h-14 w-full rounded-2xl text-base font-extrabold" onClick={dismissCelebration}>
              Keep going
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
