// @ts-nocheck
import { clientsClaim } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
} from "workbox-strategies";

// self.__WB_MANIFEST is injected by workbox injectManifest at build time
precacheAndRoute(self.__WB_MANIFEST);

// Claim clients immediately so updates take effect
clientsClaim();

// GraphQL calls — network first with fallback
registerRoute(
  ({ url }) => url.pathname.includes("/graphql"),
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 10,
  })
);

// Static assets (JS, CSS) — stale-while-revalidate
registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "static-assets",
  })
);

// Fonts and images — cache first
registerRoute(
  ({ request }) =>
    request.destination === "font" ||
    request.destination === "image",
  new CacheFirst({
    cacheName: "static-media",
  })
);

// Listen for skip-waiting message
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
