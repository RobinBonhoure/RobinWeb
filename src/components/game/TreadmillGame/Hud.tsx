"use client";

import { AnimatePresence, motion } from "motion/react";
import type { GamePhase } from "./Game";

interface Props {
  gamePhase: GamePhase;
  score: number;
  locale: string;
  onStart: () => void;
  onRestart: () => void;
}

const t = {
  title: { fr: "Treadmill Survival", en: "Treadmill Survival" },
  subtitle: {
    fr: "Avance pour survivre. La bande te pousse en arrière.",
    en: "Move forward to survive. The belt pushes you back.",
  },
  controls: {
    fr: "ZQSD / flèches — déplacer · Espace — sauter · Shift — dash",
    en: "WASD / arrows — move · Space — jump · Shift — dash",
  },
  play: { fr: "Jouer", en: "Play" },
  score: { fr: "Score", en: "Score" },
  gameOver: { fr: "Game Over", en: "Game Over" },
  finalScore: { fr: "Score final", en: "Final score" },
  restart: { fr: "Rejouer", en: "Restart" },
  restartHint: { fr: "R ou Entrée", en: "R or Enter" },
};

function str(key: keyof typeof t, locale: string): string {
  return (t[key] as Record<string, string>)[locale === "fr" ? "fr" : "en"];
}

export default function Hud({ gamePhase, score, locale, onStart, onRestart }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      {/* Idle start screen */}
      <AnimatePresence>
        {gamePhase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.75)",
                border: "1px solid #00ffcc44",
                borderRadius: 12,
                padding: "2rem 2.5rem",
                maxWidth: 420,
                textAlign: "center",
                pointerEvents: "auto",
              }}
            >
              <h1
                style={{
                  color: "#00ffcc",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  margin: 0,
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                }}
              >
                {str("title", locale)}
              </h1>
              <p style={{ color: "#aaa", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
                {str("subtitle", locale)}
              </p>
              <p style={{ color: "#555", fontSize: "0.75rem", margin: "0 0 1.5rem" }}>
                {str("controls", locale)}
              </p>
              <button
                onClick={onStart}
                style={{
                  background: "#00ffcc",
                  color: "#050505",
                  border: "none",
                  borderRadius: 6,
                  padding: "0.6rem 2rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {str("play", locale)}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score display while playing */}
      {gamePhase === "playing" && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 20,
            color: "#00ffcc",
            fontSize: "0.85rem",
            letterSpacing: "0.08em",
            opacity: 0.85,
          }}
        >
          {str("score", locale)}: {score}s
        </div>
      )}

      {/* Game over overlay */}
      <AnimatePresence>
        {gamePhase === "dead" && (
          <motion.div
            key="dead"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.55)",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.85)",
                border: "1px solid #ff222244",
                borderRadius: 12,
                padding: "2rem 2.5rem",
                textAlign: "center",
                minWidth: 280,
              }}
            >
              <h2
                style={{
                  color: "#ff4444",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {str("gameOver", locale)}
              </h2>
              <p style={{ color: "#888", fontSize: "0.8rem", margin: "0 0 0.25rem" }}>
                {str("finalScore", locale)}
              </p>
              <p
                style={{
                  color: "#00ffcc",
                  fontSize: "2rem",
                  fontWeight: 700,
                  margin: "0 0 1.5rem",
                }}
              >
                {score}s
              </p>
              <button
                onClick={onRestart}
                style={{
                  background: "#ff4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "0.6rem 2rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  display: "block",
                  width: "100%",
                  marginBottom: "0.5rem",
                }}
              >
                {str("restart", locale)}
              </button>
              <p style={{ color: "#444", fontSize: "0.7rem", margin: 0 }}>
                {str("restartHint", locale)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
