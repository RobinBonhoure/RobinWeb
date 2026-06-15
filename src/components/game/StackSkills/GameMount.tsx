"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, PerspectiveCamera, Environment } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import { Button } from "@/components/ui/button";

/** Props contract — keep stable so the section wrapper never needs to change. */
interface Props {
  skills: string[];
  locale: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BLOCK_W = 2;
const BLOCK_H = 0.4;
const BLOCK_D = 1;
const DROP_Y = 8;
const SWING_RANGE = 1.8;
const SWING_SPEED = 1.2;
const FALL_THRESHOLD = -3; // block y below this → game over

// ── Colour palette (Swiss, desaturated) ──────────────────────────────────────
const PALETTE = [
  "#1a1a1a",
  "#4a4a4a",
  "#7a7a7a",
  "#a8a8a8",
  "#c8c8c8",
  "#e2e2e2",
];

// ── Block data ────────────────────────────────────────────────────────────────
interface BlockData {
  id: number;
  label: string;
  color: string;
  landedY: number;
}

// ── Swinging (to-drop) block ─────────────────────────────────────────────────
function SwingingBlock({
  label,
  color,
  onDrop,
  stackHeight,
}: {
  label: string;
  color: string;
  onDrop: (x: number) => void;
  stackHeight: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useRef(0);
  const dropped = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current || dropped.current) return;
    phase.current += delta * SWING_SPEED;
    meshRef.current.position.x = Math.sin(phase.current) * SWING_RANGE;
    meshRef.current.position.y = DROP_Y;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "Enter") && !dropped.current) {
        drop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const drop = () => {
    if (dropped.current || !meshRef.current) return;
    dropped.current = true;
    onDrop(meshRef.current.position.x);
  };

  return (
    <mesh ref={meshRef} onClick={drop} position={[0, DROP_Y, 0]}>
      <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
      <meshStandardMaterial color={color} />
      <Text
        position={[0, 0, BLOCK_D / 2 + 0.01]}
        fontSize={0.18}
        color={color === "#1a1a1a" || color === "#4a4a4a" ? "#f5f5f5" : "#1a1a1a"}
        anchorX="center"
        anchorY="middle"
        maxWidth={BLOCK_W - 0.2}
      >
        {label}
      </Text>
    </mesh>
  );
}

// ── A landed (physics-enabled) block ─────────────────────────────────────────
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

  useFrame(() => {
    if (fallen.current || !rb.current) return;
    const pos = rb.current.translation();
    if (pos.y < FALL_THRESHOLD) {
      fallen.current = true;
      onFall();
    }
  });

  return (
    <RigidBody ref={rb} position={[x, y, 0]} colliders={false} restitution={0.1} friction={0.8}>
      <CuboidCollider args={[BLOCK_W / 2, BLOCK_H / 2, BLOCK_D / 2]} />
      <mesh>
        <boxGeometry args={[BLOCK_W, BLOCK_H, BLOCK_D]} />
        <meshStandardMaterial color={color} />
        <Text
          position={[0, 0, BLOCK_D / 2 + 0.01]}
          fontSize={0.18}
          color={color === "#1a1a1a" || color === "#4a4a4a" ? "#f5f5f5" : "#1a1a1a"}
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

// ── Ground ────────────────────────────────────────────────────────────────────
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

// ── Game scene ────────────────────────────────────────────────────────────────
function GameScene({
  skills,
  blocks,
  nextSkill,
  nextColor,
  gameOver,
  onDrop,
  onFall,
  stackTopY,
}: {
  skills: string[];
  blocks: BlockData[];
  nextSkill: string;
  nextColor: string;
  gameOver: boolean;
  onDrop: (x: number) => void;
  onFall: () => void;
  stackTopY: number;
}) {
  return (
    <Physics gravity={[0, -9.8, 0]}>
      <Environment preset="studio" />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} castShadow={false} />

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
          key={blocks.length}
          label={nextSkill}
          color={nextColor}
          onDrop={onDrop}
          stackHeight={stackTopY}
        />
      )}
    </Physics>
  );
}

// ── Main mount ────────────────────────────────────────────────────────────────
export default function GameMount({ skills, locale }: Props) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    setIsMobile(window.innerWidth < 640);
  }, []);

  const shuffled = [...skills].sort(() => Math.random() - 0.5);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const blockCounter = useRef(0);

  const stackTopY = blocks.length * (BLOCK_H + 0.02) + BLOCK_H / 2 + 0.5;
  const nextSkill = shuffled[nextIndex % shuffled.length];
  const nextColor = PALETTE[nextIndex % PALETTE.length];
  const score = blocks.length;

  const handleDrop = (x: number) => {
    const id = ++blockCounter.current;
    const landedY = stackTopY;
    setBlocks((prev) => [...prev, { id, label: nextSkill, color: nextColor, landedY }]);
    setNextIndex((i) => i + 1);
  };

  const handleFall = () => {
    if (!gameOver) setGameOver(true);
  };

  const reset = () => {
    setBlocks([]);
    setNextIndex(0);
    setGameOver(false);
    blockCounter.current = 0;
  };

  if (prefersReducedMotion === null) return null;

  if (prefersReducedMotion || isMobile) {
    return (
      <div className="flex items-center justify-center h-48 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        {locale === "fr" ? "Jeu 3D disponible sur desktop" : "3D game available on desktop"}
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-72 rounded-lg border border-border gap-4">
        <p className="text-sm text-muted-foreground">
          {locale === "fr"
            ? "Empilez vos technos — cliquez ou appuyez sur Espace pour lâcher un bloc."
            : "Stack your skills — click or press Space to drop a block."}
        </p>
        <Button onClick={() => setStarted(true)}>
          {locale === "fr" ? "Jouer" : "Play"}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-border" style={{ height: 400 }}>
      {/* HUD */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-6 text-xs font-medium text-muted-foreground">
        <span>{locale === "fr" ? "Blocs" : "Blocks"}: <strong className="text-foreground">{score}</strong></span>
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

      <Canvas shadows={false} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <GameScene
          skills={shuffled}
          blocks={blocks}
          nextSkill={nextSkill}
          nextColor={nextColor}
          gameOver={gameOver}
          onDrop={handleDrop}
          onFall={handleFall}
          stackTopY={stackTopY}
        />
      </Canvas>

      {!gameOver && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-xs text-muted-foreground">
          {locale === "fr" ? "Cliquez ou Espace pour lâcher" : "Click or Space to drop"}
        </div>
      )}
    </div>
  );
}
