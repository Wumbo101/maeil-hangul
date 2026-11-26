import { useEffect } from "react"
import { useProgress } from "@/lib/progress"
import { playTap, primeEffects, setEffectsEnabled } from "@/lib/sfx"

export function SfxRoot() {
  const { state } = useProgress()

  useEffect(() => {
    setEffectsEnabled(state.effects)
  }, [state.effects])

  useEffect(() => {
    const unlock = () => primeEffects()
    window.addEventListener("pointerdown", unlock, { capture: true })
    window.addEventListener("touchstart", unlock, { capture: true })
    window.addEventListener("keydown", unlock, { capture: true })
    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const control = target.closest("button, a")
      if (!control || control.closest("[data-sfx='result']")) return
      playTap()
    }
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("pointerdown", unlock, { capture: true })
      window.removeEventListener("touchstart", unlock, { capture: true })
      window.removeEventListener("keydown", unlock, { capture: true })
      document.removeEventListener("click", onClick, true)
    }
  }, [])

  return null
}
