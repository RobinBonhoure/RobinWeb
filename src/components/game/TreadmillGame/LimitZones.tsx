import * as THREE from "three";
import {
  BELT_WIDTH,
  Z_FRONT,
  Z_BACK,
  COLOR_LIMIT_BACK,
  COLOR_LIMIT_SIDE,
  COLOR_LIMIT_FRONT,
} from "./config";

const STRIP_W = 0.35;

function FloorStrip({
  position,
  rotation,
  size,
  color,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation ?? [-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={1}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function LimitZones() {
  return (
    <group>
      {/* Back edge — danger strip on floor */}
      <FloorStrip
        position={[0, 0.005, Z_BACK - STRIP_W / 2]}
        size={[BELT_WIDTH, STRIP_W]}
        color={COLOR_LIMIT_BACK}
      />
      {/* Front edge */}
      <FloorStrip
        position={[0, 0.005, Z_FRONT + STRIP_W / 2]}
        size={[BELT_WIDTH, STRIP_W]}
        color={COLOR_LIMIT_FRONT}
      />
      {/* Left side */}
      <FloorStrip
        position={[
          -(BELT_WIDTH / 2 - STRIP_W / 2),
          0.005,
          (Z_FRONT + Z_BACK) / 2,
        ]}
        size={[STRIP_W, Z_BACK - Z_FRONT]}
        color={COLOR_LIMIT_SIDE}
      />
      {/* Right side */}
      <FloorStrip
        position={[BELT_WIDTH / 2 - STRIP_W / 2, 0.005, (Z_FRONT + Z_BACK) / 2]}
        size={[STRIP_W, Z_BACK - Z_FRONT]}
        color={COLOR_LIMIT_SIDE}
      />
    </group>
  );
}
