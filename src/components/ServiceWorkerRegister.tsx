"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          console.debug("SW: registro não foi possível (deve estar em HTTP local ou HTTPS)");
        });
      });
    }
  }, []);

  return null;
}
