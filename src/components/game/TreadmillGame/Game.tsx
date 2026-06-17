import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import type { InputState } from "./hooks/useInput";
import Belt from "./Belt";
import LimitZones from "./LimitZones";
import Player from "./Player";
import ObstacleSpawner from "./ObstacleSpawner";
import {
  BG_COLOR,
  BELT_WIDTH,
  BELT_SPEED,
  Z_FRONT,
  Z_BACK,
  MOVE_SPEED,
  FORWARD_BACK_SPEED,
  JUMP_FB_MULTIPLIER,
  Z_PLAYER_FRONT_LIMIT,
  Z_PLAYER_FRONT_SLOWDOWN_ZONE,
  JUMP_VELOCITY,
  GRAVITY,
  PLAYER_HALF_W,
  PLAYER_HALF_D,
  PLAYER_HEIGHT,
  DASH_SPEED,
  DASH_DURATION,
  DASH_COOLDOWN,
  OBSTACLE_SPAWN_INTERVAL,
  OBSTACLE_SPAWN_JITTER,
  OBSTACLE_SHORT_HEIGHT,
  OBSTACLE_TALL_HEIGHT,
  OBSTACLE_HALF_W,
  OBSTACLE_HALF_D,
} from "./config";

export type GamePhase = "idle" | "playing" | "dead";

export interface ObstacleData {
  id: number;
  x: number;
  z: number;
  type: "short" | "tall";
  height: number;
}

interface Props {
  gamePhase: GamePhase;
  inputRef: React.RefObject<InputState>;
  onScoreChange: (s: number) => void;
  onPhaseChange: (p: GamePhase) => void;
  restartRef: React.RefObject<() => void>;
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, (Z_FRONT + Z_BACK) / 2);
  }, [camera]);
  return null;
}

export default function Game({
  gamePhase,
  inputRef,
  onScoreChange,
  onPhaseChange,
  restartRef,
}: Props) {
  const [obstacles, setObstacles] = useState<ObstacleData[]>([]);

  const playerPos = useRef({ x: 0, y: 0, z: 0, velY: 0 });
  const playerDash = useRef({
    active: false,
    timeLeft: 0,
    cooldown: 0,
    dirX: 0,
    dirZ: -1,
  });
  const spawnTimer = useRef(1.5);
  const idCounter = useRef(0);
  const scoreTimer = useRef(0);
  const lastScoreFlush = useRef(0);

  // Mirror props into refs so useFrame always reads the latest value
  const gamePhaseRef = useRef(gamePhase);
  const obstaclesRef = useRef<ObstacleData[]>([]);
  const resetGameRef = useRef<() => void>(() => {});

  useEffect(() => {
    gamePhaseRef.current = gamePhase;
  }, [gamePhase]);

  useEffect(() => {
    function resetGame() {
      playerPos.current = { x: 0, y: 0, z: 0, velY: 0 };
      playerDash.current = {
        active: false,
        timeLeft: 0,
        cooldown: 0,
        dirX: 0,
        dirZ: -1,
      };
      spawnTimer.current = 1.5;
      scoreTimer.current = 0;
      lastScoreFlush.current = 0;
      setObstacles([]);
      onScoreChange(0);
      onPhaseChange("playing");
    }
    resetGameRef.current = resetGame;
    restartRef.current = resetGame;
  });

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const phase = gamePhaseRef.current;
    const input = inputRef.current;

    if (phase === "dead") {
      if (input.restartPressed) {
        input.restartPressed = false;
        resetGameRef.current();
      }
      return;
    }

    if (phase !== "playing") return;

    const pos = playerPos.current;
    const dash = playerDash.current;

    // Dash cooldown
    dash.cooldown = Math.max(0, dash.cooldown - delta);

    // Initiate dash
    if (input.dashPressed && dash.cooldown === 0) {
      input.dashPressed = false;
      const dirX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const dirZ = (input.back ? 1 : 0) - (input.forward ? 1 : 0);
      const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
      dash.dirX = len > 0 ? dirX / len : 0;
      dash.dirZ = len > 0 ? dirZ / len : -1;
      dash.active = true;
      dash.timeLeft = DASH_DURATION;
      dash.cooldown = DASH_COOLDOWN;
    }

    // Movement
    if (dash.active) {
      pos.x += dash.dirX * DASH_SPEED * delta;
      pos.z += dash.dirZ * DASH_SPEED * delta;
      dash.timeLeft -= delta;
      if (dash.timeLeft <= 0) dash.active = false;
    } else {
      pos.x +=
        ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * MOVE_SPEED * delta;
      const forwardDir = (input.back ? 1 : 0) - (input.forward ? 1 : 0);
      let fbSpeed = FORWARD_BACK_SPEED * (pos.y > 0 ? JUMP_FB_MULTIPLIER : 1);
      // Taper forward speed to 0 as player approaches the front limit
      if (forwardDir < 0 && pos.z < Z_PLAYER_FRONT_LIMIT + Z_PLAYER_FRONT_SLOWDOWN_ZONE) {
        const t = Math.max(0, (pos.z - Z_PLAYER_FRONT_LIMIT) / Z_PLAYER_FRONT_SLOWDOWN_ZONE);
        fbSpeed *= t * t;
      }
      pos.z += forwardDir * fbSpeed * delta;
    }

    // Belt drift — grounded only
    if (pos.y <= 0) pos.z += BELT_SPEED * delta;

    // Jump
    if (input.jumpPressed && pos.y <= 0 && !dash.active) {
      input.jumpPressed = false;
      pos.velY = JUMP_VELOCITY;
    } else {
      input.jumpPressed = false;
    }

    // Airborne physics
    if (pos.y > 0 || pos.velY > 0) {
      pos.velY += GRAVITY * delta;
      pos.y += pos.velY * delta;
      if (pos.y <= 0) {
        pos.y = 0;
        pos.velY = 0;
      }
    }

    // Death zones
    if (pos.z > Z_BACK || pos.z < Z_FRONT || Math.abs(pos.x) > BELT_WIDTH / 2) {
      onPhaseChange("dead");
      return;
    }

    // Obstacle tick
    const live = obstaclesRef.current;
    let changed = false;

    for (const obs of live) obs.z += BELT_SPEED * delta;

    const before = live.length;
    const surviving = live.filter((o) => o.z <= Z_BACK + 2);
    if (surviving.length !== before) changed = true;

    spawnTimer.current -= delta;
    if (spawnTimer.current <= 0) {
      const halfRange = BELT_WIDTH / 2 - 0.8 - OBSTACLE_HALF_W;
      const x = (Math.random() * 2 - 1) * halfRange;
      const type = Math.random() < 0.7 ? "short" : "tall";
      surviving.push({
        id: idCounter.current++,
        x,
        z: Z_FRONT,
        type,
        height: type === "short" ? OBSTACLE_SHORT_HEIGHT : OBSTACLE_TALL_HEIGHT,
      });
      spawnTimer.current =
        OBSTACLE_SPAWN_INTERVAL +
        (Math.random() * 2 - 1) * OBSTACLE_SPAWN_JITTER;
      changed = true;
    }

    if (changed) setObstacles([...surviving]);
    obstaclesRef.current = surviving;

    // AABB collision
    for (const obs of surviving) {
      const overlapX =
        Math.abs(pos.x - obs.x) < PLAYER_HALF_W + OBSTACLE_HALF_W;
      const overlapY = pos.y < obs.height && pos.y + PLAYER_HEIGHT > 0;
      const overlapZ =
        Math.abs(pos.z - obs.z) < PLAYER_HALF_D + OBSTACLE_HALF_D;
      if (overlapX && overlapY && overlapZ) {
        onPhaseChange("dead");
        return;
      }
    }

    // Score flush every 0.5s
    scoreTimer.current += delta;
    if (scoreTimer.current - lastScoreFlush.current >= 0.5) {
      lastScoreFlush.current = scoreTimer.current;
      onScoreChange(Math.floor(scoreTimer.current));
    }
  });

  return (
    <>
      <color attach="background" args={[BG_COLOR]} />
      <fog attach="fog" args={[BG_COLOR, 20, 40]} />
      <PerspectiveCamera makeDefault position={[0, 6, Z_BACK + 4]} fov={55} />
      <CameraSetup />
      <ambientLight intensity={0.55} color="#c0a0ff" />
      <hemisphereLight args={["#8060d0", "#201428", 0.4]} />
      <directionalLight position={[3, 8, 5]} intensity={0.9} color="#ffe8d0" />
      <Belt />
      <LimitZones />
      <Player playerPosRef={playerPos} />
      <ObstacleSpawner obstacles={obstacles} />
    </>
  );
}
