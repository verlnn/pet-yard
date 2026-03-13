"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FocusedField, MascotState, MascotStateSnapshot } from "./types";

const IDLE_DELAY_MS = 320;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const getTrackingProgress = (value: string) => {
  const length = value.trim().length;
  return clamp(length / 24, 0, 1);
};

interface UseAuthMascotStateProps {
  emailValue: string;
  passwordValue: string;
  focusedField: FocusedField;
  isPasswordVisible: boolean;
}

export function useAuthMascotState({
  emailValue,
  passwordValue,
  focusedField,
  isPasswordVisible
}: UseAuthMascotStateProps): MascotStateSnapshot {
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputProgress = useMemo(() => {
    if (focusedField !== "email") return 0;
    return getTrackingProgress(emailValue);
  }, [emailValue, focusedField]);

  const trackingIntensity = useMemo(() => {
    if (focusedField !== "email") return 0;
    const length = emailValue.trim().length;
    return clamp(length / 18, 0.25, 1);
  }, [emailValue, focusedField]);

  useEffect(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }

    if (focusedField === "password") {
      setMascotState(isPasswordVisible ? "peeking" : "coveringEyes");
      return;
    }

    if (focusedField === "email") {
      setMascotState("trackingText");
      return;
    }

    idleTimer.current = setTimeout(() => {
      setMascotState("idle");
    }, IDLE_DELAY_MS);

    return () => {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    };
  }, [focusedField, isPasswordVisible, passwordValue]);

  return {
    mascotState,
    focusedField,
    isPasswordVisible,
    trackingIntensity,
    inputProgress
  };
}
