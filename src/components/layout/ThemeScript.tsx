"use client";

const THEME_SCRIPT = `(function(){var s=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark')}})();`;

/**
 * Prevents a flash of the wrong theme on load. The script only needs to run
 * from the server HTML; on the client it is rendered as an inert data block so
 * React doesn't warn about script tags rendered in the browser.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
