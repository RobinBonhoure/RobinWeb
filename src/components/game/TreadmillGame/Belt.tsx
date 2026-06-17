import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  BELT_WIDTH,
  BELT_SPEED,
  Z_FRONT,
  Z_BACK,
  COLOR_BELT_SURFACE,
  COLOR_LASER_BELT,
} from "./config";

const BELT_LENGTH = Z_BACK - Z_FRONT;
const SLAT_SPACING = 0.9;
const NUM_SLATS = Math.ceil(BELT_LENGTH / SLAT_SPACING) + 2;

function BeltLaserLines() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const haloRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.z += BELT_SPEED * delta;
    if (groupRef.current.position.z >= SLAT_SPACING) {
      groupRef.current.position.z -= SLAT_SPACING;
    }
    const t = state.clock.elapsedTime;
    coreRefs.current.forEach((mat, i) => {
      if (!mat) return;
      mat.emissiveIntensity = 0.8 + 0.5 * Math.sin(t * 5 + i * 0.35);
    });
    haloRefs.current.forEach((mat, i) => {
      if (!mat) return;
      mat.emissiveIntensity = 0.2 + 0.15 * Math.sin(t * 5 + i * 0.35);
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: NUM_SLATS }, (_, i) => {
        const z = Z_FRONT + i * SLAT_SPACING;
        return (
          <group key={i} position={[0, 0.012, z]}>
            {/* Core laser line */}
            <mesh>
              <boxGeometry args={[BELT_WIDTH - 0.06, 0.022, 0.045]} />
              <meshStandardMaterial
                ref={(el) => { coreRefs.current[i] = el; }}
                color={COLOR_LASER_BELT}
                emissive={COLOR_LASER_BELT}
                emissiveIntensity={0.8}
              />
            </mesh>
            {/* Glow halo */}
            <mesh>
              <boxGeometry args={[BELT_WIDTH - 0.02, 0.08, 0.14]} />
              <meshStandardMaterial
                ref={(el) => { haloRefs.current[i] = el; }}
                color={COLOR_LASER_BELT}
                emissive={COLOR_LASER_BELT}
                emissiveIntensity={0.2}
                transparent
                opacity={0.12}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function Belt() {
  const centerZ = (Z_FRONT + Z_BACK) / 2;

  return (
    <group>
      {/* Dark floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]}>
        <planeGeometry args={[BELT_WIDTH, BELT_LENGTH]} />
        <meshStandardMaterial color={COLOR_BELT_SURFACE} roughness={1} metalness={0} />
      </mesh>

      {/* Scrolling laser danger lines */}
      <BeltLaserLines />

      {/* Side rails */}
      <mesh position={[BELT_WIDTH / 2 + 0.06, 0.04, centerZ]}>
        <boxGeometry args={[0.1, 0.08, BELT_LENGTH]} />
        <meshStandardMaterial color="#1e1c2c" roughness={1} />
      </mesh>
      <mesh position={[-(BELT_WIDTH / 2 + 0.06), 0.04, centerZ]}>
        <boxGeometry args={[0.1, 0.08, BELT_LENGTH]} />
        <meshStandardMaterial color="#1e1c2c" roughness={1} />
      </mesh>
    </group>
  );
}
