/**
 * Example feature video for a made-up notes app ("Acme").
 * Replace the page, the timeline and the captions with your own feature.
 * Layout numbers are design px (see makeStage). Read them from your screenshots.
 */
import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Archive, Check, FileText, Home, Plus, Search, Users, X } from 'lucide-react';
import { THEME } from './theme';
import { clamp, Key, popIn, press, ramp, typed, window01 } from './lib/anim';
import {
  AppWindow,
  Background,
  BlurWords,
  Caption,
  Captions,
  Caret,
  Cursor,
  EndCard,
  Intro,
  Logo,
  makeStage,
  useFonts,
} from './lib/components';
import TL from './timeline.json';

const stage = makeStage(1600, 1000, 0.9);
const { cam } = stage;

/* ----------------------------- timeline ----------------------------- */
const F = {
  appIn: 58,
  search: TL.clicks[0],
  newNote: TL.clicks[1],
  title: TL.clicks[2],
  share: TL.clicks[3],
  create: TL.clicks[4],
  end: TL.endCard,
};
const SEARCH = TL.typing[0];
const TITLE = TL.typing[1];

const CAMERA: Key[] = [
  cam(0, 1, 800, 500),
  cam(110, 1, 800, 500),
  cam(140, 1.35, 1100, 330),
  cam(200, 1.35, 1100, 330),
  cam(230, 1.15, 800, 450),
  cam(288, 1.15, 800, 450),
  cam(306, 1.5, 800, 360),
  cam(362, 1.5, 800, 360),
  cam(382, 1.5, 860, 560),
  cam(418, 1.5, 860, 560),
  cam(448, 1, 800, 500),
];

const CURSOR: Key[] = [
  { f: 0, x: 1200, y: 600 },
  { f: 120, x: 1200, y: 600 },
  { f: 145, x: 1250, y: 70 },
  { f: 180, x: 1300, y: 160 },
  { f: 211, x: 1010, y: 70 },
  { f: 245, x: 900, y: 420 },
  { f: 297, x: 700, y: 328 },
  { f: 345, x: 780, y: 390 },
  { f: 377, x: 1085, y: 520 },
  { f: 395, x: 1050, y: 600 },
  { f: 417, x: 1060, y: 684 },
  { f: 480, x: 1060, y: 684 },
];

const CAPTIONS: Caption[] = [
  { a: 96, b: 206, text: 'Search all your notes' },
  { a: 210, b: 298, text: 'Start a note in one click' },
  { a: 300, b: 372, text: 'Give it a name' },
  { a: 374, b: 418, text: 'Share it with your team' },
  { a: 422, b: 504, text: 'Done. It is in your list.' },
];

/* ------------------------------- data ------------------------------- */
type Note = { id: string; title: string; tag: string; edited: string };
const NOTES: Record<string, Note> = {
  a: { id: 'a', title: 'Launch plan Q3', tag: 'Product', edited: 'Edited 2d ago' },
  b: { id: 'b', title: 'Design review', tag: 'Design', edited: 'Edited 3d ago' },
  c: { id: 'c', title: 'Launch checklist v2.3', tag: 'Product', edited: 'Edited 1w ago' },
  d: { id: 'd', title: 'Weekly sync', tag: 'Team', edited: 'Edited 1w ago' },
  e: { id: 'e', title: 'Hiring plan', tag: 'People', edited: 'Edited 2w ago' },
  f: { id: 'f', title: 'Launch retro', tag: 'Product', edited: 'Edited 3w ago' },
  n: { id: 'n', title: TITLE.text, tag: 'Product', edited: 'Just now' },
};
// Which cards are visible, in order, from frame f on. Cards slide between slots.
const GRID: { f: number; ids: string[] }[] = [
  { f: 0, ids: ['a', 'b', 'c', 'd', 'e', 'f'] },
  { f: SEARCH.start + 22, ids: ['a', 'c', 'f'] },
  { f: F.create + 8, ids: ['n', 'a', 'b', 'c', 'd', 'e', 'f'] },
];
const slot = (i: number) => ({ x: 300 + (i % 3) * 420, y: 140 + Math.floor(i / 3) * 250 });

/* ---------------------------- small parts --------------------------- */
const NoteCard: React.FC<{ note: Note; x: number; y: number; op: number; glow: number }> = ({ note, x, y, op, glow }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 400,
      height: 220,
      borderRadius: 14,
      background: '#fff',
      border: `1.5px solid ${THEME.border}`,
      boxSizing: 'border-box',
      padding: 22,
      opacity: op,
      transform: `scale(${0.96 + 0.04 * op})`,
      boxShadow: glow > 0 ? `0 0 0 ${4 * glow}px ${THEME.accent}55, 0 10px 30px ${THEME.accent}22` : 'none',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 600 }}>
      <FileText size={20} strokeWidth={1.8} color={THEME.sub} /> {note.title}
    </div>
    {[0.92, 0.78, 0.64].map((w, i) => (
      <div key={i} style={{ marginTop: i ? 10 : 22, width: `${w * 100}%`, height: 8, borderRadius: 4, background: '#ECEAE5' }} />
    ))}
    <div style={{ position: 'absolute', left: 22, right: 22, bottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: THEME.sub }}>
      <span style={{ flex: 1 }}>{note.edited}</span>
      <span style={{ padding: '3px 10px', borderRadius: 999, background: THEME.panel, border: `1px solid ${THEME.border}` }}>{note.tag}</span>
    </div>
  </div>
);

const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <div style={{ width: 50, height: 28, borderRadius: 14, background: interpolate(on, [0, 1], [0, 1]) > 0.5 ? THEME.accent : '#D6D3D1', position: 'relative' }}>
    <div style={{ position: 'absolute', top: 3, left: 3 + 22 * on, width: 22, height: 22, borderRadius: 11, background: '#fff' }} />
  </div>
);

/* ------------------------------- page ------------------------------- */
const Page: React.FC<{ f: number }> = ({ f }) => {
  const searchOn = f >= F.search && f < F.create + 4;
  const query = searchOn ? typed(f, SEARCH.start, SEARCH.speed, SEARCH.text) : '';

  // Grid transition between the last two states
  let si = 0;
  GRID.forEach((g, i) => f >= g.f && (si = i));
  const cur = GRID[si];
  const prev = GRID[Math.max(0, si - 1)];
  const t = si === 0 ? 1 : ramp(f, cur.f, cur.f + 18);
  const ids = Array.from(new Set([...prev.ids, ...cur.ids]));
  const glow = interpolate(f, [F.create + 12, F.create + 22, F.create + 70, F.create + 90], [0, 1, 1, 0], clamp);

  const modal = window01(f, F.newNote + 2, F.create + 8, 10);
  const shareOn = ramp(f, F.share, F.share + 8);
  const toast = window01(f, F.create + 14, F.create + 80, 10);

  const nav = [
    { icon: Home, label: 'Home' },
    { icon: FileText, label: 'Notes', active: true },
    { icon: Users, label: 'Shared' },
    { icon: Archive, label: 'Archive' },
  ];

  return (
    <AbsoluteFill style={{ background: THEME.page, color: THEME.text }}>
      {/* sidebar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, background: THEME.panel, borderRight: `1px solid ${THEME.border}` }}>
        <div style={{ position: 'absolute', left: 24, top: 30, display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, fontWeight: 700 }}>
          <Logo size={34} /> {THEME.product}
        </div>
        {nav.map(({ icon: Icon, label, active }, i) => (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: 110 + i * 52,
              height: 44,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0 14px',
              fontSize: 18,
              fontWeight: active ? 600 : 400,
              background: active ? '#E6E4DE' : 'transparent',
            }}
          >
            <Icon size={19} strokeWidth={1.7} /> {label}
          </div>
        ))}
        <div style={{ position: 'absolute', left: 24, bottom: 28, display: 'flex', alignItems: 'center', gap: 10, fontSize: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: '#E6E4DE', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 14 }}>SL</div>
          Sam Lee
        </div>
      </div>

      {/* header */}
      <div style={{ position: 'absolute', left: 300, top: 46, fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>Notes</div>
      <div
        style={{
          position: 'absolute',
          left: 940,
          top: 44,
          width: 140,
          height: 52,
          borderRadius: 10,
          background: THEME.accent,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 18,
          fontWeight: 600,
          transform: `scale(${press(f, F.newNote)})`,
        }}
      >
        <Plus size={20} strokeWidth={2.2} /> New note
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1100,
          top: 44,
          width: 440,
          height: 52,
          borderRadius: 10,
          background: '#fff',
          border: `1.5px solid ${searchOn ? THEME.accent : THEME.border}`,
          boxShadow: searchOn ? `0 0 0 4px ${THEME.accent}1A` : 'none',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 16px',
          fontSize: 18,
        }}
      >
        <Search size={20} color={THEME.sub} />
        {searchOn ? (
          <span>
            {query}
            <Caret f={f} typing={f >= SEARCH.start && f < SEARCH.start + 25} />
          </span>
        ) : (
          <span style={{ color: THEME.muted }}>
            {f < 110 ? <BlurWords f={f} text="Search notes" inAt={null} outAt={92} /> : <BlurWords f={f} text="Try a project name" inAt={110} outAt={null} />}
          </span>
        )}
      </div>

      {/* grid */}
      {ids.map((id) => {
        const a = prev.ids.indexOf(id);
        const b = cur.ids.indexOf(id);
        const pa = slot(a >= 0 ? a : b);
        const pb = slot(b >= 0 ? b : a);
        let op = 1;
        if (si > 0 && a < 0) op = t;
        if (si > 0 && b < 0) op = 1 - t;
        if (op <= 0) return null;
        return (
          <NoteCard
            key={id}
            note={NOTES[id]}
            x={pa.x + (pb.x - pa.x) * t}
            y={pa.y + (pb.y - pa.y) * t}
            op={op}
            glow={id === 'n' ? glow : 0}
          />
        );
      })}

      {/* modal */}
      {modal > 0 && (
        <>
          <AbsoluteFill style={{ background: `rgba(28,25,23,${0.4 * modal})` }} />
          <div
            style={{
              position: 'absolute',
              left: 450,
              top: 180,
              width: 700,
              height: 540,
              borderRadius: 18,
              background: '#fff',
              boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
              ...popIn(modal),
            }}
          >
            <div style={{ position: 'absolute', left: 30, top: 26, fontSize: 28, fontWeight: 700 }}>New note</div>
            <X size={22} style={{ position: 'absolute', right: 28, top: 32 }} />
            <div style={{ position: 'absolute', left: 30, top: 92, fontSize: 17, fontWeight: 600 }}>Title</div>
            <div
              style={{
                position: 'absolute',
                left: 30,
                top: 120,
                width: 640,
                height: 56,
                borderRadius: 10,
                border: `1.5px solid ${f >= F.title && f < F.share ? THEME.accent : THEME.border}`,
                boxSizing: 'border-box',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                fontSize: 19,
              }}
            >
              {f >= F.title ? (
                <span>
                  {typed(f, TITLE.start, TITLE.speed, TITLE.text)}
                  {f < F.share && <Caret f={f} typing={f >= TITLE.start && f < TITLE.start + 32} />}
                </span>
              ) : (
                <span style={{ color: THEME.muted }}>Untitled</span>
              )}
            </div>
            <div style={{ position: 'absolute', left: 30, top: 200, fontSize: 17, fontWeight: 600 }}>Template</div>
            <div
              style={{
                position: 'absolute',
                left: 30,
                top: 228,
                width: 640,
                height: 56,
                borderRadius: 10,
                border: `1.5px solid ${THEME.border}`,
                boxSizing: 'border-box',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                fontSize: 19,
                color: THEME.sub,
              }}
            >
              Checklist
            </div>
            <div style={{ position: 'absolute', left: 30, right: 40, top: 324, display: 'flex', alignItems: 'center', fontSize: 18 }}>
              <span style={{ flex: 1 }}>
                Share with team
                <div style={{ fontSize: 15, color: THEME.sub, marginTop: 4 }}>
                  {shareOn > 0.5 ? 'Everyone on the team can see and edit it.' : 'Only you can see this note.'}
                </div>
              </span>
              <Toggle on={shareOn} />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 460, height: 1, background: THEME.border }} />
            <div style={{ position: 'absolute', left: 430, top: 480, width: 110, height: 48, borderRadius: 10, border: `1.5px solid ${THEME.border}`, display: 'grid', placeItems: 'center', fontSize: 18 }}>
              Cancel
            </div>
            <div
              style={{
                position: 'absolute',
                left: 550,
                top: 480,
                width: 120,
                height: 48,
                borderRadius: 10,
                background: THEME.accent,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 18,
                fontWeight: 600,
                transform: `scale(${press(f, F.create)})`,
              }}
            >
              Create
            </div>
          </div>
        </>
      )}

      {/* toast */}
      {toast > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 40,
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 22px',
            borderRadius: 14,
            background: '#fff',
            border: `1px solid ${THEME.border}`,
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            fontSize: 18,
            fontWeight: 500,
            opacity: toast,
            transform: `translateY(${(1 - toast) * 20}px)`,
          }}
        >
          <Check size={18} color="#15803D" strokeWidth={2.6} /> Note created and shared
        </div>
      )}

      <Cursor f={f} path={CURSOR} clicks={TL.clicks} visible={[[118, 480]]} scale={1 / stage.K} />
    </AbsoluteFill>
  );
};

/* ------------------------------- root ------------------------------- */
export const DemoVideo: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  useFonts();
  return (
    <AbsoluteFill style={{ fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      <Background f={f} />
      <AppWindow f={f} stage={stage} camera={CAMERA} enterAt={F.appIn} exitAt={F.end}>
        <Page f={f} />
      </AppWindow>
      <Intro f={f} />
      <Captions f={f} items={CAPTIONS} />
      <EndCard f={f} at={F.end} />
      <Audio
        src={staticFile('demo-music.wav')}
        volume={(fr) => interpolate(fr, [0, 12, durationInFrames - 45, durationInFrames - 1], [0, 0.55, 0.55, 0], clamp)}
      />
      <Audio src={staticFile('demo-sfx.wav')} volume={0.6} />
    </AbsoluteFill>
  );
};
