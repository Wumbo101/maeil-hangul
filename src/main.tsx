import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller)
  let reloaded = false
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloaded) return
    reloaded = true
    window.location.reload()
  })
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
        updateViaCache: "none",
      })
      .then((registration) => registration.update())
      .catch(() => {})
  })
}
