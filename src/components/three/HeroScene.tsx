"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, useHelper } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { HalfFloatType } from "three";
import * as THREE from "three";

// Sort a particle array by (azimuth, elevation) so shape A particle i maps to
// the same angular region in shape B → transitions sweep coherently instead of
// crossing randomly.
function sortByAngle(arr: Float32Array): Float32Array {
  const n = arr.length / 3;
  const idx = Array.from({ length: n }, (_, i) => i);
  idx.sort((a, b) => {
    const aAzi = Math.atan2(arr[a * 3 + 1], arr[a * 3]);
    const bAzi = Math.atan2(arr[b * 3 + 1], arr[b * 3]);
    const d = aAzi - bAzi;
    if (Math.abs(d) > 1e-5) return d;
    const aEl = Math.atan2(
      arr[a * 3 + 2],
      Math.hypot(arr[a * 3], arr[a * 3 + 1]),
    );
    const bEl = Math.atan2(
      arr[b * 3 + 2],
      Math.hypot(arr[b * 3], arr[b * 3 + 1]),
    );
    return aEl - bEl;
  });
  const out = new Float32Array(arr.length);
  for (let i = 0; i < n; i++) {
    out[i * 3] = arr[idx[i] * 3];
    out[i * 3 + 1] = arr[idx[i] * 3 + 1];
    out[i * 3 + 2] = arr[idx[i] * 3 + 2];
  }
  return out;
}

const GR = (1 + Math.sqrt(5)) / 2;
// Roberts R2 constants (plastic-constant reciprocals) — optimal 2D coverage on flat faces
const R2_A = 0.7548776662466927;
const R2_B = 0.5698402909980532;

// ─── Shape generators (surface of unit-radius shapes) ─────────────────────────
function genSphere(n: number) {
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = Math.acos(1 - (2 * (i + 0.5)) / n);
    const phi = (2 * Math.PI * i) / GR;
    p[i * 3] = Math.sin(t) * Math.cos(phi);
    p[i * 3 + 1] = Math.sin(t) * Math.sin(phi);
    p[i * 3 + 2] = Math.cos(t);
  }
  return p;
}

// Triangular faces: Roberts R2 mapped to each face independently (face-major layout)
// so every face gets the same near-optimal 2D coverage.
function genTetrahedron(n: number) {
  const verts = [
    [0, 1, 0],
    [(2 * Math.sqrt(2)) / 3, -1 / 3, 0],
    [-Math.sqrt(2) / 3, -1 / 3, Math.sqrt(6) / 3],
    [-Math.sqrt(2) / 3, -1 / 3, -Math.sqrt(6) / 3],
  ];
  const faces = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ];
  const p = new Float32Array(n * 3);
  const perFace = Math.floor(n / 4);
  for (let f = 0; f < 4; f++) {
    const [ai, bi, ci] = faces[f];
    const a = verts[ai],
      b = verts[bi],
      c = verts[ci];
    const start = f * perFace,
      end = f === 3 ? n : start + perFace;
    for (let j = 0; j < end - start; j++) {
      const i = start + j;
      let r1 = ((j + 1) * R2_A) % 1,
        r2 = ((j + 1) * R2_B) % 1;
      if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
      }
      const r3 = 1 - r1 - r2;
      p[i * 3] = a[0] * r1 + b[0] * r2 + c[0] * r3;
      p[i * 3 + 1] = a[1] * r1 + b[1] * r2 + c[1] * r3;
      p[i * 3 + 2] = a[2] * r1 + b[2] * r2 + c[2] * r3;
    }
  }
  return p;
}

// Square faces: Roberts R2 per face (face-major)
function genCube(n: number) {
  const p = new Float32Array(n * 3);
  const perFace = Math.floor(n / 6);
  for (let f = 0; f < 6; f++) {
    const start = f * perFace,
      end = f === 5 ? n : start + perFace;
    for (let j = 0; j < end - start; j++) {
      const i = start + j,
        idx = i * 3;
      const u = (((j + 1) * R2_A) % 1) * 2 - 1;
      const v = (((j + 1) * R2_B) % 1) * 2 - 1;
      if (f === 0) {
        p[idx] = u;
        p[idx + 1] = v;
        p[idx + 2] = 1;
      } else if (f === 1) {
        p[idx] = u;
        p[idx + 1] = v;
        p[idx + 2] = -1;
      } else if (f === 2) {
        p[idx] = 1;
        p[idx + 1] = u;
        p[idx + 2] = v;
      } else if (f === 3) {
        p[idx] = -1;
        p[idx + 1] = u;
        p[idx + 2] = v;
      } else if (f === 4) {
        p[idx] = u;
        p[idx + 1] = 1;
        p[idx + 2] = v;
      } else {
        p[idx] = u;
        p[idx + 1] = -1;
        p[idx + 2] = v;
      }
    }
  }
  return p;
}

// Fibonacci helix on body + Fibonacci disk on caps — direct analog of genSphere
function genCylinder(n: number) {
  const p = new Float32Array(n * 3);
  const body = Math.floor(n * 0.6),
    cap = Math.floor(n * 0.2);
  const botCap = n - body - cap;
  for (let i = 0; i < body; i++) {
    const theta = (2 * Math.PI * i) / GR;
    p[i * 3] = Math.cos(theta);
    p[i * 3 + 1] = ((i + 0.5) / body) * 2 - 1;
    p[i * 3 + 2] = Math.sin(theta);
  }
  for (let i = 0; i < cap; i++) {
    const theta = (2 * Math.PI * i) / GR,
      r = Math.sqrt((i + 0.5) / cap);
    const idx = (body + i) * 3;
    p[idx] = Math.cos(theta) * r;
    p[idx + 1] = 1;
    p[idx + 2] = Math.sin(theta) * r;
  }
  for (let i = 0; i < botCap; i++) {
    const theta = (2 * Math.PI * i) / GR,
      r = Math.sqrt((i + 0.5) / botCap);
    const idx = (body + cap + i) * 3;
    p[idx] = Math.cos(theta) * r;
    p[idx + 1] = -1;
    p[idx + 2] = Math.sin(theta) * r;
  }
  return p;
}

function genOctahedron(n: number) {
  const verts = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  const faces = [
    [0, 2, 4],
    [0, 4, 3],
    [0, 3, 5],
    [0, 5, 2],
    [1, 4, 2],
    [1, 3, 4],
    [1, 5, 3],
    [1, 2, 5],
  ];
  const p = new Float32Array(n * 3);
  const perFace = Math.floor(n / 8);
  for (let f = 0; f < 8; f++) {
    const [ai, bi, ci] = faces[f];
    const a = verts[ai],
      b = verts[bi],
      c = verts[ci];
    const start = f * perFace,
      end = f === 7 ? n : start + perFace;
    for (let j = 0; j < end - start; j++) {
      const i = start + j;
      let r1 = ((j + 1) * R2_A) % 1,
        r2 = ((j + 1) * R2_B) % 1;
      if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
      }
      const r3 = 1 - r1 - r2;
      p[i * 3] = a[0] * r1 + b[0] * r2 + c[0] * r3;
      p[i * 3 + 1] = a[1] * r1 + b[1] * r2 + c[1] * r3;
      p[i * 3 + 2] = a[2] * r1 + b[2] * r2 + c[2] * r3;
    }
  }
  return p;
}

// Fibonacci torus: golden angle on main ring + area-uniform tube angle (Newton CDF inversion)
function genTorus(n: number) {
  const R = 0.65,
    r = 0.28;
  const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = (2 * Math.PI * i) / GR;
    const target = ((i + 0.5) / n) * R * Math.PI * 2;
    let v = target / R;
    for (let k = 0; k < 5; k++)
      v -= (R * v + r * Math.sin(v) - target) / (R + r * Math.cos(v));
    p[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
    p[i * 3 + 1] = r * Math.sin(v);
    p[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u);
  }
  return p;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useMouseParallax() {
  const pos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      pos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", fn, { passive: true });
    return () => window.removeEventListener("mousemove", fn);
  }, []);
  return pos;
}

// ─── Single source of truth for all lights ───────────────────────────────────
// Edit colors/positions here — both the scene pointLights and particle vertex
// colors derive from this array automatically.
const LIGHTS_CONFIG = [
  {
    pos: [-3, -0.5, 0] as [number, number, number],
    color: "rgb(255, 255, 255)",
    intensity: 40,
    w: 3.5,
  },
  {
    pos: [1.5, 2.5, 0] as [number, number, number],
    color: "rgb(158, 128, 182)",
    intensity: 40,
    w: 2.5,
  },
  {
    pos: [5.5, -1, 0] as [number, number, number],
    color: "rgb(0, 242, 255)",
    intensity: 40,
    w: 2.5,
  },
];

// Derived: particle vertex-colour attenuation lights, placed at z=-2 (particle plane).
const WORLD_LIGHTS = LIGHTS_CONFIG.map((l) => {
  const c = new THREE.Color(l.color);
  return { x: l.pos[0], y: l.pos[1], z: -2, r: c.r, g: c.g, b: c.b, w: l.w };
});
const LIGHT_K = 1.5; // higher = sharper/more localised falloff → distinct colour zones

// ─── Scene ────────────────────────────────────────────────────────────────────
// section id → shape index: sphere(0) tetrahedron(1) cube(2) cylinder(3) octahedron(4) torus(5)
const SECTION_IDS = [
  "hero",
  "experiences",
  "formations",
  "stack",
  "projets",
  "game",
];

function CameraRig({
  mouse,
}: {
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();
  useFrame(() => {
    const m = mouse.current;
    camera.position.lerp(
      new THREE.Vector3(-m.x * 0.4, -m.y * 0.2 + 0.3, 5),
      0.04,
    );
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function MorphingParticles({
  count,
  mouse,
}: {
  count: number;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const pts = useRef<THREE.Points>(null);
  const shapeRef = useRef(0);
  const morphT = useRef(1.0);
  const fromPos = useRef<Float32Array | null>(null);
  const { camera } = useThree();

  const shapes = useMemo(
    () => [
      sortByAngle(genOctahedron(count)),
      sortByAngle(genSphere(count)),
      sortByAngle(genCylinder(count).map((v) => v * 0.8)),
      sortByAngle(genCube(count).map((v) => v * 0.6)),
      sortByAngle(genTetrahedron(count)),
      sortByAngle(genTorus(count)),
    ],
    [count],
  );

  // Display buffer — Three.js holds a reference to this Float32Array via <bufferAttribute>.
  const initialPos = useMemo(() => new Float32Array(shapes[0]), [shapes]);
  // Mutable ref to the display buffer so the frame loop can write to it without triggering React-compiler errors.
  const displayRef = useRef(initialPos);
  useEffect(() => {
    displayRef.current = initialPos;
  }, [initialPos]);
  // Morph base positions — morph loop writes here; offsets are added on top before compositing to displayRef.
  const basePosArr = useMemo(() => new Float32Array(shapes[0]), [shapes]);
  const basePosRef = useRef(basePosArr);
  useEffect(() => {
    basePosRef.current = basePosArr;
  }, [basePosArr]);
  // Per-particle mouse-repulsion displacement (added on top of base each frame).
  const offsetsRef = useRef(new Float32Array(count * 3));
  // Reusable objects for projecting the camera ray into particle local space (avoids per-frame allocation).
  const raycasterR = useRef(new THREE.Raycaster());
  const mouseNDCR = useRef(new THREE.Vector2());
  const invMatrixR = useRef(new THREE.Matrix4());
  const rayOriginR = useRef(new THREE.Vector3());
  const rayDirR = useRef(new THREE.Vector3());

  // Colour buffer — initialised neutral grey, updated every frame via matrixWorld.
  const initialColors = useMemo(
    () => new Float32Array(count * 3).fill(0.69),
    [count],
  );
  const colorsRef = useRef(initialColors);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id));

    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let best = 0;
      for (let i = 0; i < sections.length; i++) {
        const el = sections[i];
        if (el && el.offsetTop <= mid) best = i;
      }
      if (best !== shapeRef.current) {
        fromPos.current = new Float32Array(basePosRef.current);
        morphT.current = 0;
        shapeRef.current = best;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state, delta) => {
    if (!pts.current) return;
    const geo = pts.current.geometry;

    // ── Morph base positions ─────────────────────────────────────────────────
    if (morphT.current < 1) {
      morphT.current = Math.min(1, morphT.current + delta * 0.55);
      const t = easeInOutCubic(morphT.current);
      const pulse = 1 + 0.18 * Math.sin(t * Math.PI);
      const from = fromPos.current!,
        to = shapes[shapeRef.current],
        base = basePosRef.current;
      for (let i = 0; i < base.length; i++)
        base[i] = (from[i] + (to[i] - from[i]) * t) * pulse;
    }

    // ── Rotation ─────────────────────────────────────────────────────────────
    pts.current.rotation.y = state.clock.elapsedTime * 0.07;
    pts.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.08;
    pts.current.updateMatrixWorld(true);

    // ── Mouse repulsion ──────────────────────────────────────────────────────
    // Transform the camera ray into particle local space so repulsion distance
    // is measured as screen-space proximity — depth follows the geometry surface.
    mouseNDCR.current.set(mouse.current.x, mouse.current.y);
    raycasterR.current.setFromCamera(mouseNDCR.current, camera);
    invMatrixR.current.copy(pts.current.matrixWorld).invert();
    rayOriginR.current
      .copy(raycasterR.current.ray.origin)
      .applyMatrix4(invMatrixR.current);
    rayDirR.current
      .copy(raycasterR.current.ray.direction)
      .transformDirection(invMatrixR.current)
      .normalize();

    const RADIUS = 0.7;
    const STRENGTH = 0.28;
    const decay = Math.exp(-delta * 4); // ~220 ms half-life, frame-rate independent
    const off = offsetsRef.current;
    const base = basePosRef.current;
    const rox = rayOriginR.current.x,
      roy = rayOriginR.current.y,
      roz = rayOriginR.current.z;
    const rdx = rayDirR.current.x,
      rdy = rayDirR.current.y,
      rdz = rayDirR.current.z;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      // Vector from ray origin to particle
      const px = base[ix] - rox,
        py = base[ix + 1] - roy,
        pz = base[ix + 2] - roz;
      // Perpendicular distance from particle to the camera ray
      const t = px * rdx + py * rdy + pz * rdz;
      const ex = px - t * rdx,
        ey = py - t * rdy,
        ez = pz - t * rdz;
      const dist2 = ex * ex + ey * ey + ez * ez;
      if (dist2 < RADIUS * RADIUS && dist2 > 1e-10) {
        const dist = Math.sqrt(dist2);
        const force = (1 - dist / RADIUS) * STRENGTH;
        off[ix] = off[ix] * decay + (ex / dist) * force * (1 - decay);
        off[ix + 1] = off[ix + 1] * decay + (ey / dist) * force * (1 - decay);
        off[ix + 2] = off[ix + 2] * decay + (ez / dist) * force * (1 - decay);
      } else {
        off[ix] *= decay;
        off[ix + 1] *= decay;
        off[ix + 2] *= decay;
      }
    }

    // ── Composite: display = base + offset ───────────────────────────────────
    const disp = displayRef.current;
    for (let i = 0; i < count * 3; i++) disp[i] = base[i] + off[i];
    (geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;

    // ── Vertex colours ───────────────────────────────────────────────────────
    const me = pts.current.matrixWorld.elements;
    const col = colorsRef.current;
    for (let i = 0; i < count; i++) {
      const lx = base[i * 3],
        ly = base[i * 3 + 1],
        lz = base[i * 3 + 2];
      const wx = me[0] * lx + me[4] * ly + me[8] * lz + me[12];
      const wy = me[1] * lx + me[5] * ly + me[9] * lz + me[13];
      const wz = me[2] * lx + me[6] * ly + me[10] * lz + me[14];

      let r = 0.03,
        g = 0.03,
        b = 0.03;
      for (const ll of WORLD_LIGHTS) {
        const dx = wx - ll.x,
          dy = wy - ll.y,
          dz = wz - ll.z;
        const atten = ll.w / (1 + (dx * dx + dy * dy + dz * dz) * LIGHT_K);
        r += ll.r * atten;
        g += ll.g * atten;
        b += ll.b * atten;
      }
      col[i * 3] = r;
      col[i * 3 + 1] = g;
      col[i * 3 + 2] = b;
    }
    (geo.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={pts} position={[1.5, 0, -2]} scale={1.6}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[initialPos, 3]} />
        <bufferAttribute attach="attributes-color" args={[initialColors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.02}
        // sizeAttenuation
        transparent
        opacity={0.55}
      />
    </points>
  );
}

function HorizontalLines() {
  return (
    <>
      {[-1.2, -0.4, 0.4, 1.2].map((y, i) => (
        <mesh key={i} position={[0, y, -1]}>
          <planeGeometry args={[12, 0.002]} />
          <meshBasicMaterial color="#1a1a1a" transparent opacity={0.08} />
        </mesh>
      ))}
    </>
  );
}

function LightWithHelper({
  position,
  color,
  intensity,
}: {
  position: [number, number, number];
  color: string;
  intensity: number;
}) {
  const ref = useRef<THREE.PointLight>(null);
  useHelper(
    ref as React.RefObject<THREE.Object3D>,
    THREE.PointLightHelper,
    0.5,
  );
  return (
    <pointLight
      ref={ref}
      position={position}
      color={color}
      intensity={intensity}
      distance={14}
    />
  );
}

function Scene() {
  const mouse = useMouseParallax();
  return (
    <>
      <CameraRig mouse={mouse} />
      <ambientLight intensity={0.5} />
      {LIGHTS_CONFIG.map((l, i) => (
        <LightWithHelper
          key={i}
          position={l.pos}
          color={l.color}
          intensity={l.intensity}
        />
      ))}
      <Grid
        position={[0, -3, -3]}
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
      <MorphingParticles count={8000} mouse={mouse} />
      <HorizontalLines />
      <EffectComposer multisampling={0} frameBufferType={HalfFloatType}>
        <Bloom
          luminanceThreshold={0.8}
          luminanceSmoothing={0.3}
          intensity={2.0}
          radius={0.75}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

function StaticFallback() {
  return (
    <div
      className="fixed inset-0 -z-10"
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
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [isMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  if (prefersReducedMotion || isMobile) return <StaticFallback />;

  return (
    <div className="fixed inset-0 -z-10" aria-hidden>
      {/* RGB ambient glow — shows through the transparent canvas, dark mode only */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-700"
        style={{
          background: [
            "radial-gradient(ellipse 55% 45% at 12% 58%, rgb(255 0 80 / 0.055) 0%, transparent 70%)",
            "radial-gradient(ellipse 48% 55% at 44% 22%, rgb(0 210 255 / 0.065) 0%, transparent 70%)",
            "radial-gradient(ellipse 38% 48% at 78% 70%, rgb(80 0 255 / 0.05) 0%, transparent 70%)",
          ].join(", "),
        }}
      />
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
