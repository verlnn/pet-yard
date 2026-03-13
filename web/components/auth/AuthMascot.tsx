"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo } from "react";
import type { MascotState } from "./types";

const MAX_EYE_OFFSET = 6;
const MAX_HEAD_ROTATION = 6;

interface AuthMascotProps {
  state: MascotState;
  inputProgress: number;
  trackingIntensity: number;
}

export default function AuthMascot({ state, inputProgress, trackingIntensity }: AuthMascotProps) {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0.5);
  const smoothed = useSpring(progress, { stiffness: 120, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (reduceMotion) {
      progress.set(0.5);
      return;
    }
    progress.set(inputProgress || 0.5);
  }, [inputProgress, progress, reduceMotion]);

  const safeIntensity = reduceMotion ? 0 : trackingIntensity;
  const eyeOffset = useTransform(smoothed, (value) => (value - 0.5) * 2 * MAX_EYE_OFFSET * safeIntensity);
  const headRotate = useTransform(smoothed, (value) => (value - 0.5) * 2 * MAX_HEAD_ROTATION * safeIntensity);

  const pawOffset = useMemo(() => {
    if (reduceMotion) return 0;
    if (state === "coveringEyes") return -18;
    if (state === "peeking") return -14;
    return 0;
  }, [reduceMotion, state]);

  const pawSpread = useMemo(() => {
    if (state === "peeking" && !reduceMotion) return 10;
    return 0;
  }, [reduceMotion, state]);

  return (
    <div className="flex items-center justify-center">
      <motion.svg
        width={240}
        height={220}
        viewBox="0 0 240 220"
        className="max-w-full"
        role="img"
        aria-label="강아지 인증 마스코트"
      >
        <motion.g style={{ rotate: headRotate, transformOrigin: "120px 120px" }}>
          <g>
            <path
              d="M45 70c-6-24 10-46 30-52 16-4 32 2 42 16"
              fill="#caa18d"
            />
            <path
              d="M195 70c6-24-10-46-30-52-16-4-32 2-42 16"
              fill="#caa18d"
            />
          </g>
          <ellipse cx="120" cy="120" rx="78" ry="70" fill="#f6e7d9" />
          <ellipse cx="120" cy="138" rx="58" ry="50" fill="#fff5ea" />
          <ellipse cx="90" cy="118" rx="20" ry="16" fill="#ffffff" />
          <ellipse cx="150" cy="118" rx="20" ry="16" fill="#ffffff" />
          <motion.circle cx="90" cy="120" r="6" fill="#2b2a28" style={{ x: eyeOffset }} />
          <motion.circle cx="150" cy="120" r="6" fill="#2b2a28" style={{ x: eyeOffset }} />
          <circle cx="120" cy="135" r="6" fill="#2b2a28" />
          <path
            d="M110 146c6 6 14 6 20 0"
            stroke="#2b2a28"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
        <motion.g
          animate={{ y: pawOffset }}
          transition={{ type: "spring", stiffness: 160, damping: 16 }}
        >
          <motion.g animate={{ x: -pawSpread }} transition={{ type: "spring", stiffness: 160, damping: 16 }}>
            <ellipse cx="70" cy="148" rx="22" ry="18" fill="#f2c6b2" />
            <circle cx="58" cy="146" r="4" fill="#d99a83" />
            <circle cx="70" cy="142" r="4" fill="#d99a83" />
            <circle cx="82" cy="146" r="4" fill="#d99a83" />
          </motion.g>
          <motion.g animate={{ x: pawSpread }} transition={{ type: "spring", stiffness: 160, damping: 16 }}>
            <ellipse cx="170" cy="148" rx="22" ry="18" fill="#f2c6b2" />
            <circle cx="158" cy="146" r="4" fill="#d99a83" />
            <circle cx="170" cy="142" r="4" fill="#d99a83" />
            <circle cx="182" cy="146" r="4" fill="#d99a83" />
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
}
