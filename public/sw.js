const CACHE = "maeil-v4"
const BASE = new URL("./", self.location)

function scoped(path) {
  return new URL(path, BASE).href
}

self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(precache())
})

async function precache() {
  const cache = await caches.open(CACHE)
  const urls = [
    scoped("./"),
    scoped("index.html"),
    scoped("404.html"),
    scoped("manifest.webmanifest"),
    scoped("audio/manifest.json"),
    scoped("sfx/tap.wav"),
    scoped("sfx/correct.wav"),
    scoped("sfx/wrong.wav"),
    scoped("sfx/lesson.wav"),
    scoped("sfx/streak.wav"),
    scoped("sfx/milestone.wav"),
  ]
  try {
    const response = await fetch(scoped("audio/manifest.json"))
    if (response.ok) {
      const manifest = await response.json()
      const files = new Set(Object.values(manifest).map((entry) => entry.file || entry))
      for (const file of files) urls.push(scoped(`audio/${file}`))
    }
  } catch {
    // The page still works online if precache of the manifest fails.
  }
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url)
        if (response.ok) await cache.put(url, response)
      } catch {
        // Skip a single missing file instead of aborting the update.
      }
    }),
  )
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting()
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
        }
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match(scoped("index.html")))),
  )
})
