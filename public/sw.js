// PPURI 알림 전용 서비스 워커 (캐시 없음 — 오래된 화면이 남지 않도록)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data && event.data.text() }; }
  const title = data.title || "도토리가 기다려요 🌰";
  const body = data.body || "오늘의 1분 레슨으로 뿌리를 키워볼까요?";
  event.waitUntil(
    self.registration.showNotification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png", data: { url: data.url || "/lesson" } })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) { c.navigate(url); return c.focus(); } }
      return self.clients.openWindow(url);
    })
  );
});
