import { useEffect, useRef } from "react";

export interface InputState {
  left: boolean;
  right: boolean;
  forward: boolean;
  back: boolean;
  jumpPressed: boolean;
  dashPressed: boolean;
  restartPressed: boolean;
}

export function useInput() {
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    forward: false,
    back: false,
    jumpPressed: false,
    dashPressed: false,
    restartPressed: false,
  });

  useEffect(() => {
    const keysDown = new Set<string>();

    function onKeyDown(e: KeyboardEvent) {
      if (keysDown.has(e.code)) return;
      keysDown.add(e.code);

      const s = inputRef.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") s.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") s.right = true;
      if (e.code === "ArrowUp" || e.code === "KeyW") s.forward = true;
      if (e.code === "ArrowDown" || e.code === "KeyS") s.back = true;
      if (e.code === "Space") {
        e.preventDefault();
        s.jumpPressed = true;
      }
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") s.dashPressed = true;
      if (e.code === "KeyR" || e.code === "Enter") s.restartPressed = true;
    }

    function onKeyUp(e: KeyboardEvent) {
      keysDown.delete(e.code);
      const s = inputRef.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") s.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") s.right = false;
      if (e.code === "ArrowUp" || e.code === "KeyW") s.forward = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") s.back = false;
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return inputRef;
}
