"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { useHelper } from "@react-three/drei";
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
    const y = r * Math.sin(v);
    const z = (R + r * Math.cos(v)) * Math.sin(u);
    // rotated 45° on X
    p[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
    p[i * 3 + 1] = (y - z) * Math.SQRT1_2;
    p[i * 3 + 2] = (y + z) * Math.SQRT1_2;
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
  // {
  //   pos: [-3, -0.5, 0] as [number, number, number],
  //   color: "rgb(255, 255, 255)",
  //   intensity: 40,
  //   w: 3.5,
  // },
  // {
  //   pos: [1.5, 2.5, 0] as [number, number, number],
  //   color: "rgb(255, 255, 255)",
  //   intensity: 40,
  //   w: 2.5,
  // },
  // {
  //   pos: [5.5, -1, 0] as [number, number, number],
  //   color: "rgb(255, 255, 255)",
  //   intensity: 40,
  //   w: 2.5,
  // },
];

// Derived: particle vertex-colour attenuation lights, placed at z=-2 (particle plane).
const WORLD_LIGHTS_DARK = LIGHTS_CONFIG.map((l) => {
  const c = new THREE.Color(l.color);
  return { x: l.pos[0], y: l.pos[1], z: -2, r: c.r, g: c.g, b: c.b, w: l.w };
});
// Light-theme lights: dark saturated colors so particles are visible against white.
const WORLD_LIGHTS_LIGHT = [
  { x: -3, y: -0.5, z: -2, r: 0.05, g: 0.05, b: 0.5, w: 3.5 }, // dark blue
  { x: 1.5, y: 2.5, z: -2, r: 0.38, g: 0.0, b: 0.48, w: 2.5 }, // dark purple
  { x: 5.5, y: -1, z: -2, r: 0.0, g: 0.32, b: 0.48, w: 2.5 }, // dark teal
];
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
  isMobile,
}: {
  mouse: React.RefObject<{ x: number; y: number }>;
  isMobile: boolean;
}) {
  const { camera } = useThree();
  useFrame(() => {
    if (isMobile) {
      camera.position.lerp(new THREE.Vector3(0, 0.3, 5), 0.04);
    } else {
      const m = mouse.current;
      camera.position.lerp(
        new THREE.Vector3(-m.x * 0.4, -m.y * 0.2 + 0.3, 5),
        0.04,
      );
    }
    camera.lookAt(0, 0, 0);
  });
  return null;
}

const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uStrength;
uniform float uSize;
uniform float uScale;

attribute vec3 color;
varying vec3 vColor;

vec3 mod289v3(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289v4(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289v4(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289v3(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j   = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_  = floor(j * ns.z);
  vec4 y_  = floor(j - 7.0 * x_);
  vec4 x   = x_ * ns.x + ns.yyyy;
  vec4 y   = y_ * ns.x + ns.yyyy;
  vec4 h   = 1.0 - abs(x) - abs(y);
  vec4 b0  = vec4(x.xy, y.xy);
  vec4 b1  = vec4(x.zw, y.zw);
  vec4 s0  = floor(b0) * 2.0 + 1.0;
  vec4 s1  = floor(b1) * 2.0 + 1.0;
  vec4 sh  = -step(h, vec4(0.0));
  vec4 a0  = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1  = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0  = vec3(a0.xy, h.x);
  vec3 p1  = vec3(a0.zw, h.y);
  vec3 p2  = vec3(a1.xy, h.z);
  vec3 p3  = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vColor = color;
  vec3 pos = position;

  if (uStrength > 0.001) {
    float n = snoise(pos * 1.8 + vec3(0.0, 0.0, uTime * 0.18));
    pos += normalize(pos + 1e-4) * n * uStrength * 0.1;
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * (uScale / -mvPosition.z);
  gl_Position  = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform float uOpacity;
uniform float uReveal;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float alpha = (1.0 - smoothstep(0.3, 0.5, d)) * uOpacity * uReveal;
  gl_FragColor = vec4(vColor, alpha);
}
`;

const FLOOR_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uReveal;
uniform float uAlpha;
uniform sampler2D uHeightField;
varying float vAlpha;

vec3 _m3(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 _m4(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 _pm(vec4 x) { return _m4(((x * 34.0) + 1.0) * x); }
vec4 _ti(vec4 r)  { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = _m3(i);
  vec4 p = _pm(_pm(_pm(i.z + vec4(0.0,i1.z,i2.z,1.0)) + i.y + vec4(0.0,i1.y,i2.y,1.0)) + i.x + vec4(0.0,i1.x,i2.x,1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j   = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_  = floor(j * ns.z);  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x   = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h   = 1.0 - abs(x) - abs(y);
  vec4 b0  = vec4(x.xy, y.xy);  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0  = floor(b0)*2.0+1.0; vec4 s1 = floor(b1)*2.0+1.0;
  vec4 sh  = -step(h, vec4(0.0));
  vec4 a0  = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1  = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0  = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2  = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = _ti(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
  m = m*m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main() {
  vec3 pos = position;

  // Sample the live particle-cloud height field for shape-accurate deformation.
  // Floor local XZ spans [-FLOOR_SPREAD/2, +FLOOR_SPREAD/2] = [-10, 10].
  vec2 hfUV    = clamp((pos.xz + 10.0) / 20.0, 0.001, 0.999);
  float density = texture2D(uHeightField, hfUV).r;
  float depress = density * 1.2;

  // Slow noise undulation
  float n = snoise(vec3(pos.x * 0.45 + uTime * 0.06, 0.0, pos.z * 0.45 + uTime * 0.05));
  pos.y += -depress + n * 0.09;

  // Edge fade + reveal
  vAlpha = (1.0 - smoothstep(7.0, 10.0, length(pos.xz))) * uAlpha * uReveal;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize  = 2.0;
  gl_Position   = projectionMatrix * mvPosition;
}
`;

const FLOOR_FRAGMENT_SHADER = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  if (length(uv) > 0.5) discard;
  gl_FragColor = vec4(uColor, vAlpha);
}
`;

function MorphingParticles({
  count,
  mouse,
  isDark,
  isMobile,
  heightData,
  heightTex,
}: {
  count: number;
  mouse: React.RefObject<{ x: number; y: number }>;
  isDark: boolean;
  isMobile: boolean;
  heightData: Float32Array;
  heightTex: THREE.DataTexture;
}) {
  const pts = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const isDarkRef = useRef(isDark);
  useEffect(() => {
    isDarkRef.current = isDark;
    if (matRef.current)
      matRef.current.uniforms.uOpacity.value = isDark ? 0.55 : 0.85;
  }, [isDark]);
  const heightDataRef = useRef(heightData);
  const heightTexRef = useRef(heightTex);
  const shapeRef = useRef(0);
  const morphT = useRef(1.0);
  const fromPos = useRef<Float32Array | null>(null);
  const { camera, gl } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: 1.0 },
      uOpacity: { value: isDark ? 0.55 : 0.85 },
      uReveal: { value: 0 },
      uSize: { value: 0.02 },
      uScale: {
        value: 0.5 * gl.domElement.height,
      },
      // uniforms object is intentionally stable; isDark/reveal changes go through useEffect/useFrame
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const shapes = useMemo(
    () => [
      sortByAngle(genSphere(count)),
      sortByAngle(genTorus(count)),
      sortByAngle(genOctahedron(count)),
      sortByAngle(genCylinder(count).map((v) => v * 0.8)),
      sortByAngle(genTetrahedron(count)),
      sortByAngle(genCube(count).map((v) => v * 0.6)),
    ],
    [count],
  );

  // Display buffer — Three.js holds a reference to this Float32Array via <bufferAttribute>.
  const initialPos = useMemo(() => new Float32Array(shapes[0]), [shapes]);
  // Morph base positions — morph loop writes here; offsets are added on top before compositing to the position attribute.
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

    // ── Wave + reveal uniforms ───────────────────────────────────────────────
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      const target = shapeRef.current === 0 ? 1.0 : 0.0;
      matRef.current.uniforms.uStrength.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uStrength.value,
        target,
        delta * 2.5,
      );
      matRef.current.uniforms.uReveal.value = THREE.MathUtils.smoothstep(
        state.clock.elapsedTime,
        0,
        2.0,
      );
    }

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

    // ── Horizontal position shift (non-sphere shapes slide right on desktop) ──
    const targetX = !isMobile && shapeRef.current !== 0 ? 3 : 1.5;
    pts.current.position.x = THREE.MathUtils.lerp(
      pts.current.position.x,
      targetX,
      delta * 1.5,
    );

    pts.current.updateMatrixWorld(true);

    // ── Mouse repulsion ──────────────────────────────────────────────────────
    const off = offsetsRef.current;
    const base = basePosRef.current;
    if (!isMobile) {
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
      const decay = Math.exp(-delta * 4);
      const rox = rayOriginR.current.x,
        roy = rayOriginR.current.y,
        roz = rayOriginR.current.z;
      const rdx = rayDirR.current.x,
        rdy = rayDirR.current.y,
        rdz = rayDirR.current.z;

      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const px = base[ix] - rox,
          py = base[ix + 1] - roy,
          pz = base[ix + 2] - roz;
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
    } else {
      off.fill(0);
    }

    // ── Composite: display = base + offset ───────────────────────────────────
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const disp = posAttr.array as Float32Array;
    for (let i = 0; i < count * 3; i++) disp[i] = base[i] + off[i];
    posAttr.needsUpdate = true;

    // ── Vertex colours ───────────────────────────────────────────────────────
    const me = pts.current.matrixWorld.elements;
    const colorAttr = geo.getAttribute("color") as THREE.BufferAttribute;
    const col = colorAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const lx = base[i * 3],
        ly = base[i * 3 + 1],
        lz = base[i * 3 + 2];
      const wx = me[0] * lx + me[4] * ly + me[8] * lz + me[12];
      const wy = me[1] * lx + me[5] * ly + me[9] * lz + me[13];
      const wz = me[2] * lx + me[6] * ly + me[10] * lz + me[14];

      const ambMin = isDarkRef.current ? 0.03 : 0.0;
      let r = ambMin,
        g = ambMin,
        b = ambMin;
      const lights = isDarkRef.current ? WORLD_LIGHTS_DARK : WORLD_LIGHTS_LIGHT;
      for (const ll of lights) {
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
    colorAttr.needsUpdate = true;

    // ── Height-field for ParticleFloor ───────────────────────────────────────
    // Floor world pos [0,-3,-3]. Floor-local = world - [0,-3,-3].
    // UV.x = (world_x + 10) / 20,  UV.y = (world_z + 13) / 20
    const hd = heightDataRef.current;
    hd.fill(0);
    for (let i = 0; i < count; i += 8) {
      const lx = base[i * 3],
        ly = base[i * 3 + 1],
        lz = base[i * 3 + 2];
      const wx = me[0] * lx + me[4] * ly + me[8] * lz + me[12];
      const wz = me[2] * lx + me[6] * ly + me[10] * lz + me[14];
      const cx = ((wx + 10) / 20) * HF_RES;
      const cz = ((wz + 13) / 20) * HF_RES;
      const R = 2;
      const ix0 = Math.max(0, Math.ceil(cx - R));
      const ix1 = Math.min(HF_RES - 1, Math.floor(cx + R));
      const iz0 = Math.max(0, Math.ceil(cz - R));
      const iz1 = Math.min(HF_RES - 1, Math.floor(cz + R));
      for (let ix = ix0; ix <= ix1; ix++) {
        for (let iz = iz0; iz <= iz1; iz++) {
          const dx = ix + 0.5 - cx,
            dz = iz + 0.5 - cz;
          const d = Math.sqrt(dx * dx + dz * dz);
          if (d < R) hd[iz * HF_RES + ix] += 1 - d / R;
        }
      }
    }
    let hfMax = 0.001;
    for (let i = 0; i < HF_RES * HF_RES; i++) if (hd[i] > hfMax) hfMax = hd[i];
    for (let i = 0; i < HF_RES * HF_RES; i++) hd[i] /= hfMax;
    heightTexRef.current.needsUpdate = true;
  });

  return (
    <points ref={pts} position={[1.5, 0, -2]} scale={1.6}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[initialPos, 3]} />
        <bufferAttribute attach="attributes-color" args={[initialColors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

const FLOOR_GRID = 80;
const FLOOR_SPREAD = 20.0;
const HF_RES = 32;

function ParticleFloor({
  isDark,
  heightTex,
}: {
  isDark: boolean;
  heightTex: THREE.DataTexture;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(FLOOR_GRID * FLOOR_GRID * 3);
    for (let i = 0; i < FLOOR_GRID; i++) {
      for (let j = 0; j < FLOOR_GRID; j++) {
        const idx = (i * FLOOR_GRID + j) * 3;
        pos[idx] = (i / (FLOOR_GRID - 1) - 0.5) * FLOOR_SPREAD;
        pos[idx + 1] = 0;
        pos[idx + 2] = (j / (FLOOR_GRID - 1) - 0.5) * FLOOR_SPREAD;
      }
    }
    return pos;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uAlpha: { value: isDark ? 0.38 : 0.72 },
      uColor: { value: new THREE.Color().setScalar(isDark ? 0.52 : 0.0) },
      uHeightField: { value: heightTex },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uColor.value.setScalar(isDark ? 0.52 : 0.0);
      matRef.current.uniforms.uAlpha.value = isDark ? 0.38 : 0.72;
    }
  }, [isDark]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uReveal.value = THREE.MathUtils.smoothstep(
        state.clock.elapsedTime,
        0.4,
        2.4,
      );
    }
  });

  return (
    <points position={[0, -1.5, -3]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={FLOOR_VERTEX_SHADER}
        fragmentShader={FLOOR_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

// function LightWithHelper({
//   position,
//   color,
//   intensity,
// }: {
//   position: [number, number, number];
//   color: string;
//   intensity: number;
// }) {
//   const ref = useRef<THREE.PointLight>(null);
//   useHelper(
//     ref as React.RefObject<THREE.Object3D>,
//     THREE.PointLightHelper,
//     0.5,
//   );
//   return (
//     <pointLight
//       ref={ref}
//       position={position}
//       color={color}
//       intensity={intensity}
//       distance={14}
//     />
//   );
// }

function Scene({
  isDark,
  isMobile,
  prefersReducedMotion,
}: {
  isDark: boolean;
  isMobile: boolean;
  prefersReducedMotion: boolean;
}) {
  const mouse = useMouseParallax();
  const heightData = useMemo(() => new Float32Array(HF_RES * HF_RES), []);
  const heightTex = useMemo(() => {
    const t = new THREE.DataTexture(
      heightData,
      HF_RES,
      HF_RES,
      THREE.RedFormat,
      THREE.FloatType,
    );
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.needsUpdate = true;
    return t;
  }, [heightData]);
  return (
    <>
      <CameraRig mouse={mouse} isMobile={isMobile} />
      <ambientLight intensity={0.5} />
      {/* {LIGHTS_CONFIG.map((l, i) => (
        <LightWithHelper
          key={i}
          position={l.pos}
          color={l.color}
          intensity={l.intensity}
        />
      ))} */}
      <MorphingParticles
        count={isMobile || prefersReducedMotion ? 4000 : 8000}
        mouse={mouse}
        isDark={isDark}
        isMobile={isMobile}
        heightData={heightData}
        heightTex={heightTex}
      />
      <ParticleFloor isDark={isDark} heightTex={heightTex} />
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

export function HeroScene() {
  const [isMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const [isDark, setIsDark] = useState(
    () =>
      typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 -z-10 h-svh" aria-hidden>
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
        <Scene
          isDark={isDark}
          isMobile={isMobile}
          prefersReducedMotion={prefersReducedMotion}
        />
      </Canvas>
    </div>
  );
}
