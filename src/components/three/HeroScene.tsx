"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, Float } from "@react-three/drei";
import * as THREE from "three";

/** Mouse parallax hook — returns normalised [-1, 1] xy. */
function useMouseParallax() {
  const pos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return pos;
}

/** Scroll parallax — returns normalised scroll progress [0, 1]. */
function useScrollProgress() {
  const progress = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      progress.current =
        window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

function SceneCameraRig({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const scroll = useScrollProgress();

  useFrame(() => {
    const m = mouse.current;
    target.current.set(m.x * 0.6, m.y * 0.3 - scroll.current * 2, 0);
    camera.position.lerp(
      new THREE.Vector3(target.current.x, target.current.y, 5),
      0.05
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** Floating translucent rectangle — Swiss-grid accent. */
function GridPlane({
  position,
  rotation,
  scale,
  opacity,
  speed,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  opacity: number;
  speed: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.z =
      rotation[2] + Math.sin(state.clock.elapsedTime * speed) * 0.04;
  });

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={mesh} position={position} rotation={rotation} scale={scale}>
        <planeGeometry args={[1, 1, 8, 8]} />
        <meshBasicMaterial
          color="#1a1a1a"
          wireframe
          transparent
          opacity={opacity}
        />
      </mesh>
    </Float>
  );
}

/** Thin horizontal rule lines. */
function HorizontalLines() {
  return (
    <>
      {[-1.2, -0.4, 0.4, 1.2].map((y, i) => (
        <mesh key={i} position={[0, y, -1]}>
          <planeGeometry args={[12, 0.002]} />
          <meshBasicMaterial color="#1a1a1a" transparent opacity={0.12} />
        </mesh>
      ))}
    </>
  );
}

function Scene() {
  const mouse = useMouseParallax();

  return (
    <>
      <SceneCameraRig mouse={mouse} />
      <ambientLight intensity={0.6} />

      {/* Background subtle grid */}
      <Grid
        position={[0, 0, -3]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#d0d0d0"
        sectionSize={4}
        sectionThickness={0.6}
        sectionColor="#b0b0b0"
        fadeDistance={18}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Floating geometric planes — depth layers for parallax */}
      <GridPlane position={[-2.5, 1, -0.5]} rotation={[0, 0, 0.3]} scale={2.8} opacity={0.22} speed={0.4} />
      <GridPlane position={[3, -0.8, -1.5]} rotation={[0, 0, -0.15]} scale={3.5} opacity={0.15} speed={0.3} />
      <GridPlane position={[-1, -1.8, -2]} rotation={[0, 0.2, 0.5]} scale={2} opacity={0.1} speed={0.6} />
      <GridPlane position={[2.2, 2, -0.8]} rotation={[0.1, 0, -0.2]} scale={1.6} opacity={0.18} speed={0.5} />

      <HorizontalLines />
    </>
  );
}

/** Static fallback for prefers-reduced-motion / SSR. */
function StaticFallback() {
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        backgroundImage:
          "linear-gradient(oklch(0.922 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.922 0 0) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        backgroundPosition: "-1px -1px",
      }}
      aria-hidden
    />
  );
}

export function HeroScene() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (prefersReducedMotion || isMobile) {
    return <StaticFallback />;
  }

  return (
    <div className="absolute inset-0 -z-10" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
