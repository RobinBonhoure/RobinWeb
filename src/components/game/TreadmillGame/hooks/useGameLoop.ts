import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function useGameLoop(cb: (delta: number) => void) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useFrame((_, delta) => cbRef.current(Math.min(delta, 0.1)));
}
