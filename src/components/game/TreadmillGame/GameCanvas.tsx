"use client";

import { Component, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useInput } from "./hooks/useInput";
import type { GamePhase } from "./Game";
import Game from "./Game";
import Hud from "./Hud";

class CanvasErrorBoundary extends Component<
  { children: ReactNode; locale: string },
  { crashed: boolean }
> {
  state = { crashed: false };
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  render() {
    if (this.state.crashed) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#888",
            fontSize: 14,
          }}
        >
          {this.props.locale === "fr"
            ? "Le jeu n'a pas pu se charger."
            : "The game failed to load."}
        </div>
      );
    }
    return this.props.children;
  }
}

interface Props {
  locale: string;
}

export default function GameCanvas({ locale }: Props) {
  const [gamePhase, setGamePhase] = useState<GamePhase>("idle");
  const [score, setScore] = useState(0);
  const restartRef = useRef<() => void>(() => {});
  const inputRef = useInput();

  const handleStart = () => setGamePhase("playing");
  const handleRestart = () => restartRef.current();

  return (
    <div style={{ width: "100%", height: "100dvh", position: "relative", background: "#050505" }}>
      <CanvasErrorBoundary locale={locale}>
        <Canvas dpr={[1, 1.5]} gl={{ antialias: true }}>
          <Game
            gamePhase={gamePhase}
            inputRef={inputRef}
            onScoreChange={setScore}
            onPhaseChange={setGamePhase}
            restartRef={restartRef}
          />
        </Canvas>
      </CanvasErrorBoundary>
      <Hud
        gamePhase={gamePhase}
        score={score}
        locale={locale}
        onStart={handleStart}
        onRestart={handleRestart}
      />
    </div>
  );
}
