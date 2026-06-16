"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, PerspectiveCamera } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import { Button } from "@/components/ui/button";

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
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
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
  skills: string[];
  locale: string;
}

const BLOCK_W = 2;
const BLOCK_H = 0.4;
const BLOCK_D = 1;
const DROP_Y = 8;
const SWING_RANGE = 1.8;
const SWING_SPEED = 1.2;
const FALL_THRESHOLD = -3;

const PALETTE = [
  "#1a1a1a",
  "#4a4a4a",
  "#7a7a7a",
  "#a8a8a8",
  "#c8c8c8",
  "#e2e2e2",
];

interface BlockData {
  id: number;
  label: string;
  color: string;
  landedY: number;
}

function SwingingBlock({
  label,
  color,
  onDrop,
}: {
  label: string;
  color: string;
  onDrop: (x: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useRef(0);
  const dropped = useRef(false);
  const onDropRef = useRef(onDrop);

  useEffect(() => {
    onDropRef.current = onDrop;
  }, [onDrop]);

  useFrame((_, delta) => {
    if (!meshRef.current || dropped.current) return;
    phase.current += delta * SWING_SPEED;
    meshRef.current.position.x = Math.sin(phase.current) * SWING_RANGE;
    meshRef.current.position.y = DROP_Y;
  });

  useEffect(() => {
    dropped.current = false;
  }, [label]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        (e.code === "Space" || e.code === "Enter") &&
        !dropped.current &&
        meshRef.current
      ) {
        dropped.current = true;
        onDropRef.current(meshRef.current.position.x);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleClick = () => {
    if (dropped.current || !meshRef.current) return;
    dropped.current = true;
    onDropRef.current(meshRef.current.position.x);
  };

  const textColor =
    color === "#1a1a1a" || color === "#4a4a4a" ? "#f5f5f5" : "#1a1a1a";

  return (
    <mesh ref={meshRef} onClick={handleClick} position={[0, DROP_Y, 0]}>
      <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
      <meshStandardMaterial color={color} />
      <Text
        position={[0, 0, BLOCK_D / 2 + 0.01]}
        fontSize={0.18}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={BLOCK_W - 0.2}
      >
        {label}
      </Text>
    </mesh>
  );
}

function LandedBlock({
  label,
  color,
  x,
  y,
  onFall,
}: {
  label: string;
  color: string;
  x: number;
  y: number;
  onFall: () => void;
}) {
  const rb = useRef<RapierRigidBody>(null);
  const fallen = useRef(false);
  const onFallRef = useRef(onFall);

  useEffect(() => {
    onFallRef.current = onFall;
  }, [onFall]);

  useFrame(() => {
    if (fallen.current || !rb.current) return;
    if (rb.current.translation().y < FALL_THRESHOLD) {
      fallen.current = true;
      onFallRef.current();
    }
  });

  const textColor =
    color === "#1a1a1a" || color === "#4a4a4a" ? "#f5f5f5" : "#1a1a1a";

  return (
    <RigidBody
      ref={rb}
      position={[x, y, 0]}
      colliders={false}
      restitution={0.1}
      friction={0.8}
    >
      <CuboidCollider args={[BLOCK_W / 2, BLOCK_H / 2, BLOCK_D / 2]} />
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <meshStandardMaterial color={color} />
        <Text
          position={[0, 0, BLOCK_D / 2 + 0.01]}
          fontSize={0.18}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={BLOCK_W - 0.2}
        >
          {label}
        </Text>
      </mesh>
    </RigidBody>
  );
}

function Ground() {
  return (
    <RigidBody type="fixed" position={[0, -0.5, 0]}>
      <CuboidCollider args={[10, 0.5, 5]} />
      <mesh>
        <boxGeometry args={[20, 1, 10]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
    </RigidBody>
  );
}

function GameScene({
  blocks,
  nextSkill,
  nextColor,
  gameOver,
  onDrop,
  onFall,
}: {
  blocks: BlockData[];
  nextSkill: string;
  nextColor: string;
  gameOver: boolean;
  onDrop: (x: number) => void;
  onFall: () => void;
}) {
  return (
    <Physics gravity={[0, -9.8, 0]}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      <PerspectiveCamera makeDefault position={[0, 4, 10]} fov={45} />

      <Ground />

      {blocks.map((b) => (
        <LandedBlock
          key={b.id}
          label={b.label}
          color={b.color}
          x={0}
          y={b.landedY}
          onFall={onFall}
        />
      ))}

      {!gameOver && (
        <SwingingBlock
          key={`swing-${blocks.length}`}
          label={nextSkill}
          color={nextColor}
          onDrop={onDrop}
        />
      )}
    </Physics>
  );
}

export default function GameMount({ skills, locale }: Props) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleResize = () => setIsMobile(window.innerWidth < 640);
    const handleMotionChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);

    window.addEventListener("resize", handleResize);
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Stable shuffled list — only shuffles once on mount
  const shuffled = useMemo(
    () =>
      skills.length > 0
        ? [...skills].sort((a, b) => {
            const hash = (value: string) =>
              value
                .split("")
                .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 0);

            return hash(a) - hash(b);
          })
        : ["React"],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const blockCounter = useRef(0);

  const stackTopY = blocks.length * (BLOCK_H + 0.02) + BLOCK_H / 2 + 0.5;
  const nextSkill = shuffled[nextIndex % shuffled.length];
  const nextColor = PALETTE[nextIndex % PALETTE.length];

  const handleDrop = () => {
    const id = ++blockCounter.current;
    setBlocks((prev) => [
      ...prev,
      { id, label: nextSkill, color: nextColor, landedY: stackTopY },
    ]);
    setNextIndex((i) => i + 1);
  };

  const handleFall = () => setGameOver(true);

  const reset = () => {
    setBlocks([]);
    setNextIndex(0);
    setGameOver(false);
    blockCounter.current = 0;
  };

  if (prefersReducedMotion || isMobile) {
    return (
      <div className="flex items-center justify-center h-48 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        {locale === "fr"
          ? "Jeu 3D disponible sur desktop"
          : "3D game available on desktop"}
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-border gap-4 bg-secondary/30">
        <p className="text-sm text-muted-foreground text-center max-w-xs px-4">
          {locale === "fr"
            ? "Cliquez ou appuyez sur Espace pour lâcher un bloc."
            : "Click or press Space to drop a block."}
        </p>
        <Button onClick={() => setStarted(true)}>
          {locale === "fr" ? "Jouer" : "Play"}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden border border-border"
      style={{ height: 420 }}
    >
      {/* HUD */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-6 text-xs font-medium text-muted-foreground pointer-events-none">
        <span>
          {locale === "fr" ? "Blocs" : "Blocks"}:{" "}
          <strong className="text-foreground">{blocks.length}</strong>
        </span>
        {gameOver && (
          <span className="text-destructive font-semibold">
            {locale === "fr" ? "Game over !" : "Game over!"}
          </span>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-3 z-10 text-xs"
        onClick={reset}
      >
        {locale === "fr" ? "Recommencer" : "Reset"}
      </Button>

      <CanvasErrorBoundary locale={locale}>
        <Canvas shadows={false} dpr={[1, 1.5]} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <GameScene
              blocks={blocks}
              nextSkill={nextSkill}
              nextColor={nextColor}
              gameOver={gameOver}
              onDrop={handleDrop}
              onFall={handleFall}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>

      {!gameOver && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-xs text-muted-foreground pointer-events-none select-none">
          {locale === "fr"
            ? "Cliquez ou Espace pour lâcher"
            : "Click or Space to drop"}
        </div>
      )}
    </div>
  );
}
