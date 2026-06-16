"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function RevealOnScroll({ children, className, delay = 0, once = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px 0px" });
  const reduced = useReducedMotion();

  if (reduced) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
