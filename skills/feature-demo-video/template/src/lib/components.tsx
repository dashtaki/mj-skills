import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useVideoConfig } from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { THEME } from '../theme';
import { clamp, Key, keyframes, ramp, window01 } from './anim';

/* ------------------------------------------------------------------ */
/* Design coordinates                                                  */
/* Author the page in the screenshot's own pixels ("design px"), then  */
/* scale it by K into the app window. Cursor and camera use the same   */
/* numbers you read from the screenshot.                               */
/* ------------------------------------------------------------------ */
export const makeStage = (DW: number, DH: number, K: number) => {
  const WIN = { x: (1920 - DW * K) / 2, y: (1080 - DH * K) / 2 };
  const toScreen = (x: number, y: number) => ({ x: WIN.x + x * K, y: WIN.y + y * K });
  /** Camera keyframe: zoom `s`, centered on design point (dx, dy). */
  const cam = (f: number, s: number, dx: number, dy: number): Key => ({ f, s, ...toScreen(dx, dy) });
  return { DW, DH, K, WIN, toScreen, cam };
};
export type Stage = ReturnType<typeof makeStage>;

/** Wait for web fonts before rendering frames. */
export const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
};

/* ------------------------------------------------------------------ */
/* Background with two soft drifting glows                             */
/* ------------------------------------------------------------------ */
export const Background: React.FC<{ f: number }> = ({ f }) => {
  const drift = Math.sin(f / 90) * 40;
  const glow = (color: string): React.CSSProperties => ({
    position: 'absolute',
    width: 1250,
    height: 1250,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 62%)`,
  });
  return (
    <AbsoluteFill style={{ background: THEME.background }}>
      <div style={{ ...glow(THEME.glowA), left: -300 + drift, top: -500 }} />
      <div style={{ ...glow(THEME.glowB), right: -400 - drift, bottom: -700 }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Camera + app window                                                 */
/* ------------------------------------------------------------------ */
export const AppWindow: React.FC<{
  f: number;
  stage: Stage;
  camera: Key[];
  enterAt: number;
  exitAt: number;
  children: React.ReactNode;
}> = ({ f, stage, camera, enterAt, exitAt, children }) => {
  const { fps } = useVideoConfig();
  const s = keyframes(f, camera, 's');
  const cx = keyframes(f, camera, 'x');
  const cy = keyframes(f, camera, 'y');
  const enter = spring({ frame: f - enterAt, fps, config: { damping: 20, mass: 0.9 } });
  const exit = ramp(f, exitAt - 6, exitAt + 14);
  const { DW, DH, K, WIN } = stage;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        transformOrigin: '0 0',
        transform: `translate(${960 - cx * s}px, ${540 - cy * s}px) scale(${s})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: WIN.x,
          top: WIN.y,
          width: DW * K,
          height: DH * K,
          borderRadius: 16,
          overflow: 'hidden',
          background: THEME.page,
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 40px 100px rgba(60,40,20,0.18), 0 8px 24px rgba(60,40,20,0.08)',
          opacity: enter * (1 - exit),
          transform: `translateY(${(1 - enter) * 60}px) scale(${(0.94 + 0.06 * enter) * (1 - 0.04 * exit)})`,
          filter: exit > 0.01 ? `blur(${exit * 10}px)` : undefined,
        }}
      >
        <div style={{ position: 'absolute', width: DW, height: DH, transform: `scale(${K})`, transformOrigin: '0 0' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Cursor with click press + ripple                                    */
/* Render it inside the page (design px) so it zooms with the UI.      */
/* ------------------------------------------------------------------ */
export const Cursor: React.FC<{
  f: number;
  path: Key[];
  clicks: number[];
  visible: [number, number][];
  scale?: number; // use ~1/K so the cursor looks normal size on screen
}> = ({ f, path, clicks, visible, scale = 1.4 }) => {
  const op = Math.max(0, ...visible.map(([a, b]) => window01(f, a, b, 10)));
  if (op <= 0) return null;
  const x = keyframes(f, path, 'x');
  const y = keyframes(f, path, 'y');
  let pr = 1;
  let rp = -1;
  for (const c of clicks) {
    const d = f - c;
    if (d >= -3 && d <= 6) pr = Math.min(pr, interpolate(d, [-3, 0, 6], [1, 0.82, 1], clamp));
    if (d >= 0 && d < 18) rp = d / 18;
  }
  const r = 30 * scale * (0.4 + rp);
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 100, opacity: op }}>
      {rp >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: -r,
            top: -r,
            width: 2 * r,
            height: 2 * r,
            borderRadius: '50%',
            background: THEME.accent,
            opacity: 0.28 * (1 - rp),
          }}
        />
      )}
      <svg
        width={24 * scale}
        height={24 * scale}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: -4 * scale,
          top: -3 * scale,
          transform: `scale(${pr})`,
          transformOrigin: `${4 * scale}px ${3 * scale}px`,
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
        }}
      >
        <path
          d="M4.5 3 L4.5 19.5 L9 15.3 L12 21.5 L14.8 20.2 L11.9 14.2 L18 14.2 Z"
          fill="#111"
          stroke="#fff"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/** Blinking text caret. Solid while `typing` is true. */
export const Caret: React.FC<{ f: number; typing?: boolean; height?: number }> = ({ f, typing, height = 22 }) => (
  <span
    style={{
      display: 'inline-block',
      width: 2,
      height,
      marginLeft: 1,
      verticalAlign: -4,
      background: THEME.text,
      opacity: typing || Math.floor(f / 15) % 2 === 0 ? 1 : 0,
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Placeholder text that blurs in / out word by word                   */
/* ------------------------------------------------------------------ */
export const BlurWords: React.FC<{ f: number; text: string; inAt: number | null; outAt: number | null }> = ({
  f,
  text,
  inAt,
  outAt,
}) => {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => {
        const pin = inAt === null ? 1 : ramp(f, inAt + i * 2.5, inAt + i * 2.5 + 12);
        const pout = outAt === null ? 0 : ramp(f, outAt + i * 2, outAt + i * 2 + 7);
        const blur = (1 - pin) * 8 + pout * 6;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: pin * (1 - pout),
              filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
            }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </>
  );
};

/** Loader text with a dark band that sweeps across it. */
export const ShimmerText: React.FC<{ f: number; text: string }> = ({ f, text }) => {
  const pos = ((f * 3) % 160) - 30;
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(90deg, ${THEME.muted} ${pos - 15}%, ${THEME.text} ${pos}%, ${THEME.muted} ${pos + 15}%)`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {text}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Captions (one short line per scene)                                 */
/* ------------------------------------------------------------------ */
export type Caption = { a: number; b: number; text: string };
export const Captions: React.FC<{ f: number; items: Caption[] }> = ({ f, items }) => (
  <>
    {items.map((c) => {
      const p = window01(f, c.a, c.b, 10);
      if (p <= 0) return null;
      return (
        <div
          key={c.text}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 60,
            display: 'flex',
            justifyContent: 'center',
            opacity: p,
            transform: `translateY(${(1 - p) * 16}px)`,
          }}
        >
          <div
            style={{
              padding: '16px 30px',
              borderRadius: 999,
              background: 'rgba(28,25,23,0.88)',
              color: '#fff',
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: -0.4,
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            }}
          >
            {c.text}
          </div>
        </div>
      );
    })}
  </>
);

/* ------------------------------------------------------------------ */
/* Logo, intro title, end card                                         */
/* Replace <Logo> with the product's own logo (traced SVG or an image  */
/* from the repo). Do not draw other companies' logos.                 */
/* ------------------------------------------------------------------ */
export const Logo: React.FC<{ size: number; progress?: number }> = ({ size, progress = 1 }) => {
  const p = interpolate(progress, [0, 1], [0, 1], clamp);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: THEME.accent,
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.55,
        fontWeight: 700,
        transform: `scale(${0.6 + 0.4 * p})`,
        opacity: p,
      }}
    >
      {THEME.product[0]}
    </div>
  );
};

export const Intro: React.FC<{ f: number; until?: number }> = ({ f, until = 64 }) => {
  const { fps } = useVideoConfig();
  const inP = spring({ frame: f - 4, fps, config: { damping: 18, mass: 0.7 } });
  const out = ramp(f, until - 18, until - 2);
  if (f > until) return null;
  return (
    <AbsoluteFill style={{ display: 'grid', placeItems: 'center', opacity: 1 - out }}>
      <div style={{ textAlign: 'center', opacity: inP, transform: `translateY(${(1 - inP) * 24 - out * 20}px)` }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 22,
            fontWeight: 600,
            color: THEME.accent,
            marginBottom: 18,
          }}
        >
          <Logo size={28} progress={inP} /> New in {THEME.product}
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2.5, color: THEME.text }}>{THEME.feature}</div>
        <div style={{ fontSize: 30, fontWeight: 500, color: THEME.sub, marginTop: 8 }}>{THEME.tagline}</div>
      </div>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = ramp(f, at, at + 20);
  if (p <= 0) return null;
  const t1 = ramp(f, at + 18, at + 34);
  const t2 = ramp(f, at + 28, at + 44);
  return (
    <AbsoluteFill style={{ display: 'grid', placeItems: 'center', opacity: p }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Logo size={96} progress={ramp(f, at + 6, at + 30)} />
        <div
          style={{
            marginTop: 34,
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: -2.4,
            color: THEME.text,
            opacity: t1,
            transform: `translateY(${(1 - t1) * 18}px)`,
          }}
        >
          {THEME.feature}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 30,
            fontWeight: 500,
            color: THEME.sub,
            opacity: t2,
            transform: `translateY(${(1 - t2) * 14}px)`,
          }}
        >
          Live now in {THEME.product}
        </div>
      </div>
    </AbsoluteFill>
  );
};
