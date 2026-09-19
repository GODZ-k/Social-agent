/**
 * House motion. Springs, not durations: a spring starts from wherever the
 * element currently is and carries velocity, so every transition here can be
 * interrupted or reversed mid-flight without a jump.
 *
 * `bounce: 0` is critically damped (no overshoot) and is the default.
 * Bounce is reserved for motion that follows a physical gesture.
 */
import type { Transition } from "motion/react";

export const spring = {
  /** Default for UI that moves on its own: menus, layout shifts, reveals. */
  smooth: { type: "spring", bounce: 0, duration: 0.4 },
  /** Small, quick state changes: toggles, chips, press releases. */
  snappy: { type: "spring", bounce: 0, duration: 0.28 },
  /** After a drag or flick only. The overshoot reads as momentum. */
  momentum: { type: "spring", bounce: 0.2, duration: 0.4 },
  /** Sheets and drawers. */
  sheet: { type: "spring", bounce: 0.12, duration: 0.34 },
} satisfies Record<string, Transition>;

/**
 * Where a flick would come to rest, from release velocity in px/s.
 * Exponential decay, the same model as scroll deceleration.
 */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past a boundary: follows less the further you pull. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
