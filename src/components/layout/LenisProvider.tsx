"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let raf: number;
    function loop(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    // Same-page links (hash anchors and the current page itself): handled here (capture phase, before next/link) so
    // repeated clicks on the same anchor still scroll, even when the URL hash
    // is already set and the router sees no navigation.
    function onAnchorClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const url = new URL(anchor.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname
      ) {
        return;
      }
      // Link to the current page itself (e.g. the logo): scroll back to top.
      if (!url.hash) {
        if (url.search !== window.location.search) return;
        e.preventDefault();
        lenis.scrollTo(0);
        if (window.location.hash) {
          history.pushState(history.state, "", url.pathname + url.search);
        }
        return;
      }
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target);
      if (window.location.hash !== url.hash) {
        history.pushState(history.state, "", url.hash);
      }
    }
    document.addEventListener("click", onAnchorClick, true);

    return () => {
      document.removeEventListener("click", onAnchorClick, true);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
