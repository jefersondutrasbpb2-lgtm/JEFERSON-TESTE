/* Escala do Louvor — service worker.
 *
 * Guarda a casca do app (página, scripts, fontes, ícones) para abrir rápido e instalar como app.
 * Os dados (api.php) nunca vêm do cache: sem internet, o app avisa e não finge estar sincronizado.
 * A página é buscada na rede primeiro; cada versão publicada tem o próprio cache, e a versão nova
 * só assume quando a pessoa toca em "Atualizar" (ou fecha e abre o app).
 */
const VERSAO = "__VERSAO__";
const CACHE = `escala-louvor-${VERSAO}`;
const ARQUIVOS = __ARQUIVOS__;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith("escala-louvor-") && n !== CACHE).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("message", (e) => {
  if (e.data === "ativar") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const pedido = e.request;
  const url = new URL(pedido.url);
  if (pedido.method !== "GET" || url.origin !== location.origin || url.pathname.endsWith("api.php")) return;
  if (pedido.mode === "navigate") {
    e.respondWith(fetch(pedido).catch(() => caches.match("index.html", { cacheName: CACHE })));
    return;
  }
  e.respondWith(caches.match(pedido, { cacheName: CACHE }).then((guardado) => guardado || fetch(pedido)));
});
