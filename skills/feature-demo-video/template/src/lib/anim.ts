import type React from 'react';
import { Easing, interpolate } from 'remotion';

// Every animated value is a pure function of the current frame `f`.

export const ease = Easing.bezier(0.65, 0, 0.35, 1);
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0 before a, 1 after b, eased in between. */
export const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

/** 0 -> 1 -> 0: on between a and b, with a fade of `fade` frames at both ends. */
export const window01 = (f: number, a: number, b: number, fade = 6) =>
  Math.min(ramp(f, a, a + fade), 1 - ramp(f, b - fade, b));

export type Key = { f: number; [prop: string]: number };

/** Eased interpolation through keyframes. Two equal keyframes in a row = hold. */
export const keyframes = (f: number, keys: Key[], prop: string): number => {
  if (f <= keys[0].f) return keys[0][prop];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.f) return a[prop] + (b[prop] - a[prop]) * ease((f - a.f) / (b.f - a.f));
  }
  return keys[keys.length - 1][prop];
};

/** Fade + small lift + scale for modals and popovers (p goes 0 -> 1). */
export const popIn = (p: number): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * 14}px) scale(${0.97 + 0.03 * p})`,
});

/** Text typed so far: `speed` characters per frame from `start`. */
export const typed = (f: number, start: number, speed: number, text: string) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((f - start) * speed))));

/** Short press on click frames: scale 1 -> 0.95 -> 1. */
export const press = (f: number, clickFrame: number, depth = 0.95) =>
  interpolate(f - clickFrame, [-3, 0, 6], [1, depth, 1], clamp);
