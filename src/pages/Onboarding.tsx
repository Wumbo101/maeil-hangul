import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Flame } from "@/components/Flame"
import { useProgress } from "@/lib/progress"

const steps = [
  {
    kicker: "매일",
    title: "Read Hangul. Every day.",
    body: "Korean is written in blocks. You’ll learn the letters, stack them into syllables, and read real words — with the English meaning always in sight.",
  },
  {
    kicker: "Short lessons",
    title: "A few minutes, then you’re out.",
    body: "Vowels first, then consonants, then the way they snap together. Each letter comes with a romanization and an English sound, like ㅓ — “eo”, the u in up.",
  },
  {
    kicker: "The flame",
    title: "Show up once a day.",
    body: "Finish one lesson or earn 20 XP. Miss a day and the streak resets. A freeze can cover a single missed day. You start with one.",
  },
]

export function Onboarding() {
  const [step, setStep] = useState(0)
  const { onboard } = useProgress()
  const navigate = useNavigate()
  const current = steps[step]
  const last = step === steps.length - 1

  function finish() {
    onboard()
    navigate("/lesson/four-vowels")
  }

  return (
    <div className="flex min-h-full flex-col px-6 py-8">
      <Flame className="h-24 w-20" />
      <p className="mt-6 text-sm font-extrabold tracking-[0.16em] text-flame uppercase">{current.kicker}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink">{current.title}</h1>
      <p className="mt-4 text-lg font-bold leading-snug text-ink/80">{current.body}</p>
      <div className="mt-auto pt-10">
        <div className="mb-4 flex gap-2" aria-hidden>
          {steps.map((item, index) => (
            <span key={item.kicker} className={["h-1.5 flex-1 rounded-full", index === step ? "bg-flame" : "bg-[#f0dcc8]"].join(" ")} />
          ))}
        </div>
        {last ? (
          <Button type="button" className="h-14 w-full rounded-2xl text-base font-extrabold" onClick={finish}>
            Start with ㅏ
          </Button>
        ) : (
          <Button type="button" className="h-14 w-full rounded-2xl text-base font-extrabold" onClick={() => setStep((value) => value + 1)}>
            Next
          </Button>
        )}
        {step > 0 ? (
          <Button type="button" variant="ghost" className="mt-2 h-12 w-full rounded-2xl font-extrabold" onClick={() => setStep((value) => value - 1)}>
            Back
          </Button>
        ) : null}
      </div>
    </div>
  )
}
