import { Link } from "react-router-dom"
import { Check, Lock } from "lucide-react"
import { LESSONS, isLessonUnlocked, nextLesson } from "@/data/lessons"
import { useProgress } from "@/lib/progress"

export function PathPage() {
  const { state } = useProgress()
  const current = nextLesson(state.completedLessonIds)
  const sections: { name: string; lessons: typeof LESSONS }[] = []
  for (const lesson of LESSONS) {
    const last = sections[sections.length - 1]
    if (!last || last.name !== lesson.section) sections.push({ name: lesson.section, lessons: [lesson] })
    else last.lessons.push(lesson)
  }

  return (
    <div className="px-5 pt-6 pb-10">
      <p className="text-sm font-extrabold tracking-[0.16em] text-flame uppercase">Your path</p>
      <h1 className="mt-1 font-display text-4xl text-ink">Thirteen short lessons</h1>
      <p className="mt-2 font-bold text-ink/75">New letters unlock the next block. Misses come back in review.</p>

      <div className="mt-6 space-y-8">
        {sections.map((section) => (
          <section key={section.name}>
            <h2 className="text-xs font-extrabold tracking-[0.16em] text-muted-foreground uppercase">{section.name}</h2>
            <ol className="mt-3 space-y-3">
              {section.lessons.map((lesson) => {
                const done = state.completedLessonIds.includes(lesson.id)
                const unlocked = isLessonUnlocked(state.completedLessonIds, lesson.id)
                const active = current?.id === lesson.id
                const body = (
                  <span className="flex items-center gap-3">
                    <span className={[
                      "flex size-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl",
                      done ? "bg-[#14804a] text-white" : active ? "bg-flame text-white" : "bg-[#f3e6d8] text-ink/50",
                    ].join(" ")}>
                      {done ? <Check /> : unlocked ? lesson.hero : <Lock className="size-5" />}
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block font-display text-xl text-ink">{lesson.title}</span>
                      <span className="block text-sm font-bold text-muted-foreground">{lesson.blurb}</span>
                    </span>
                  </span>
                )
                if (!unlocked) {
                  return (
                    <li key={lesson.id}>
                      <div className="w-full rounded-3xl bg-white/70 px-3 py-3 opacity-70">{body}</div>
                    </li>
                  )
                }
                return (
                  <li key={lesson.id}>
                    <Link
                      to={`/lesson/${lesson.id}`}
                      className={[
                        "block rounded-3xl bg-white px-3 py-3 shadow-sm",
                        active ? "ring-2 ring-flame" : "",
                      ].join(" ")}
                    >
                      {body}
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
