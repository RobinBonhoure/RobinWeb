import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ObstacleData } from "./Game";
import {
  OBSTACLE_HALF_W,
  COLOR_LASER_BEAM_SHORT,
  COLOR_LASER_BEAM_TALL,
  COLOR_LASER_FRAME,
} from "./config";

const BEAM_W = 0.028;
const HALO_PAD = 0.07;

function FramePart({ position, args }: { position: [number, number, number]; args: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={COLOR_LASER_FRAME} roughness={0.4} metalness={0.5} />
    </mesh>
  );
}

// Short obstacle — single horizontal laser beam, jump over it
function ShortLaserDoor({ data }: { data: ObstacleData }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.MeshStandardMaterial>(null);
  const haloRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.position.z = data.z;
    const intensity = 1.0 + 0.65 * Math.sin(clock.elapsedTime * 9 + data.id * 1.7);
    if (coreRef.current) coreRef.current.emissiveIntensity = intensity;
    if (haloRef.current) haloRef.current.emissiveIntensity = intensity * 0.22;
  });

  const postH = data.height + 0.12;
  const beamSpan = OBSTACLE_HALF_W * 2 - 0.07;

  return (
    <group ref={groupRef} position={[data.x, 0, data.z]}>
      <FramePart position={[-OBSTACLE_HALF_W, postH / 2, 0]} args={[0.06, postH, 0.06]} />
      <FramePart position={[ OBSTACLE_HALF_W, postH / 2, 0]} args={[0.06, postH, 0.06]} />
      {/* Laser beam — core */}
      <mesh position={[0, data.height, 0]}>
        <boxGeometry args={[beamSpan, BEAM_W, BEAM_W]} />
        <meshStandardMaterial ref={coreRef} color={COLOR_LASER_BEAM_SHORT} emissive={COLOR_LASER_BEAM_SHORT} emissiveIntensity={1.0} />
      </mesh>
      {/* Glow halo */}
      <mesh position={[0, data.height, 0]}>
        <boxGeometry args={[beamSpan + HALO_PAD, BEAM_W + HALO_PAD, BEAM_W + HALO_PAD]} />
        <meshStandardMaterial ref={haloRef} color={COLOR_LASER_BEAM_SHORT} emissive={COLOR_LASER_BEAM_SHORT} emissiveIntensity={0.22} transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Tall obstacle — vertical laser curtain inside a door frame, dodge around it
const BEAM_X_OFFSETS = [-0.36, -0.18, 0, 0.18, 0.36];

function TallLaserDoor({ data }: { data: ObstacleData }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const haloRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.position.z = data.z;
    const intensity = 1.0 + 0.65 * Math.sin(clock.elapsedTime * 7 + data.id * 1.3);
    coreRefs.current.forEach((m) => { if (m) m.emissiveIntensity = intensity; });
    haloRefs.current.forEach((m) => { if (m) m.emissiveIntensity = intensity * 0.22; });
  });

  const h = data.height;
  const railSpan = OBSTACLE_HALF_W * 2 + 0.08;

  return (
    <group ref={groupRef} position={[data.x, 0, data.z]}>
      {/* Top rail */}
      <FramePart position={[0, h + 0.04, 0]} args={[railSpan, 0.06, 0.06]} />
      {/* Bottom rail */}
      <FramePart position={[0, 0.03, 0]} args={[railSpan, 0.06, 0.06]} />
      {/* Side posts */}
      <FramePart position={[-OBSTACLE_HALF_W, h / 2, 0]} args={[0.06, h, 0.06]} />
      <FramePart position={[ OBSTACLE_HALF_W, h / 2, 0]} args={[0.06, h, 0.06]} />
      {/* Vertical laser beams */}
      {BEAM_X_OFFSETS.map((x, i) => (
        <group key={i}>
          <mesh position={[x, h / 2, 0]}>
            <boxGeometry args={[BEAM_W, h, BEAM_W]} />
            <meshStandardMaterial
              ref={(el) => { coreRefs.current[i] = el; }}
              color={COLOR_LASER_BEAM_TALL}
              emissive={COLOR_LASER_BEAM_TALL}
              emissiveIntensity={1.0}
            />
          </mesh>
          <mesh position={[x, h / 2, 0]}>
            <boxGeometry args={[BEAM_W + HALO_PAD, h + HALO_PAD, BEAM_W + HALO_PAD]} />
            <meshStandardMaterial
              ref={(el) => { haloRefs.current[i] = el; }}
              color={COLOR_LASER_BEAM_TALL}
              emissive={COLOR_LASER_BEAM_TALL}
              emissiveIntensity={0.22}
              transparent
              opacity={0.12}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Obstacle({ data }: { data: ObstacleData }) {
  return data.type === "short" ? <ShortLaserDoor data={data} /> : <TallLaserDoor data={data} />;
}
