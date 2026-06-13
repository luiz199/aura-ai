const CACHE_NAME = "aura-ai-v1"
const urlsToCache = [
  "/",
  "/dashboard",
  "/dashboard/chat",
  "/dashboard/historico",
  "/dashboard/favoritos",
  "/dashboard/estatisticas",
  "/dashboard/configuracoes",
  "/icons/icon.svg",
  "/manifest.json",
]

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") return response
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
    })
  )
})

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    ))
  )
})

export {}
