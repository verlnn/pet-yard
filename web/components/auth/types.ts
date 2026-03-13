export type MascotState = "idle" | "trackingText" | "coveringEyes" | "peeking";

export type FocusedField = "email" | "password" | null;

export interface MascotStateSnapshot {
  mascotState: MascotState;
  focusedField: FocusedField;
  isPasswordVisible: boolean;
  trackingIntensity: number;
  inputProgress: number;
}
