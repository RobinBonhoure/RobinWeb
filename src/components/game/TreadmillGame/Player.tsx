import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLOR_PLAYER_SKIN, COLOR_PLAYER_SHIRT, COLOR_PLAYER_PANTS } from "./config";

export interface PlayerPosRef {
  x: number;
  y: number;
  z: number;
}

interface Props {
  playerPosRef: React.RefObject<PlayerPosRef>;
}

function Part({
  color,
  args,
  position,
  roughness = 0.75,
}: {
  color: string;
  args: [number, number, number];
  position: [number, number, number];
  roughness?: number;
}) {
  return (
    <mesh position={position} castShadow={false}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
    </mesh>
  );
}

export default function Player({ playerPosRef }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const p = playerPosRef.current;
    const t = clock.elapsedTime;
    const freq = 6;
    const legAmp = 0.65;
    const armAmp = 0.45;

    groupRef.current.position.set(
      p.x,
      p.y + Math.abs(Math.sin(t * freq)) * 0.025,
      p.z
    );

    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * freq) * legAmp;
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * freq + Math.PI) * legAmp;
    if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * freq + Math.PI) * armAmp;
    if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * freq) * armAmp;
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <Part color={COLOR_PLAYER_SKIN} args={[0.17, 0.17, 0.14]} position={[0, 0.83, 0]} roughness={0.6} />

      {/* Torso */}
      <Part color={COLOR_PLAYER_SHIRT} args={[0.24, 0.32, 0.13]} position={[0, 0.57, 0]} roughness={0.8} />

      {/* Left arm — pivot at shoulder */}
      <group ref={leftArmRef} position={[-0.18, 0.71, 0]}>
        <Part color={COLOR_PLAYER_SKIN} args={[0.07, 0.28, 0.07]} position={[0, -0.14, 0]} roughness={0.6} />
      </group>

      {/* Right arm — pivot at shoulder */}
      <group ref={rightArmRef} position={[0.18, 0.71, 0]}>
        <Part color={COLOR_PLAYER_SKIN} args={[0.07, 0.28, 0.07]} position={[0, -0.14, 0]} roughness={0.6} />
      </group>

      {/* Left leg — pivot at hip */}
      <group ref={leftLegRef} position={[-0.09, 0.40, 0]}>
        <Part color={COLOR_PLAYER_PANTS} args={[0.09, 0.38, 0.09]} position={[0, -0.19, 0]} roughness={0.9} />
      </group>

      {/* Right leg — pivot at hip */}
      <group ref={rightLegRef} position={[0.09, 0.40, 0]}>
        <Part color={COLOR_PLAYER_PANTS} args={[0.09, 0.38, 0.09]} position={[0, -0.19, 0]} roughness={0.9} />
      </group>
    </group>
  );
}
