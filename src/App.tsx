import { useEffect } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"
import { BottomNav } from "@/components/BottomNav"
import { CelebrationDialog } from "@/components/CelebrationDialog"
import { SfxRoot } from "@/components/SfxRoot"
import { ProgressProvider, useProgress } from "@/lib/progress"
import { HomePage } from "@/pages/HomePage"
import { LessonPage } from "@/pages/LessonPage"
import { Onboarding } from "@/pages/Onboarding"
import { PathPage } from "@/pages/PathPage"
import { ReviewPage } from "@/pages/ReviewPage"
import { StreakPage } from "@/pages/StreakPage"

function HomeGate() {
  const { state } = useProgress()
  if (!state.onboarded) return <Onboarding />
  return <HomePage />
}

function Frame() {
  const location = useLocation()
  const { state } = useProgress()
  const hideNav = location.pathname.startsWith("/lesson") || (location.pathname === "/" && !state.onboarded)
  useEffect(() => {
    document.querySelector(".app-scroll")?.scrollTo(0, 0)
  }, [location.pathname])
  return (
    <div className="app-bg">
      <div className="app-frame">
        <div className="dancheong" aria-hidden>
          <span /><span /><span /><span /><span />
        </div>
        <div className="app-scroll">
          <Outlet />
        </div>
        {hideNav ? null : <BottomNav />}
      </div>
      <CelebrationDialog />
    </div>
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <SfxRoot />
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Routes>
          <Route element={<Frame />}>
            <Route path="/" element={<HomeGate />} />
            <Route path="/learn" element={<PathPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/streak" element={<StreakPage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  )
}
