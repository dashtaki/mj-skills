"""Synthesize a calm, mid-energy music bed and UI sounds for a demo video.

Everything is generated with numpy, so there are no music license issues.
Clicks and key sounds are placed on the frames listed in the timeline JSON,
so they stay in sync with the video.

Usage:  python3 scripts/make_audio.py src/timeline.json demo
Writes: public/demo-music.wav and public/demo-sfx.wav

Timeline keys: fps, duration (frames), clicks [frames],
typing [{start, speed (chars/frame), text}], drumsIn (frame), endCard (frame).
Tweak BPM, CHORDS and the gains below to change the mood.
"""
import json
import math
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / sys.argv[1]).read_text())
PREFIX = sys.argv[2]
SR = 44100
FPS = TL["fps"]
DUR = TL["duration"] / FPS
N = int(DUR * SR)
rng = np.random.default_rng(5)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def add(buf, sig, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf) or i < 0:
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(fr)
    if hi:
        g *= 1 / np.sqrt(1 + (fr / hi) ** 4)
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(fr, 1)) ** 4)
    return np.fft.irfft(X * g, len(x))


def reverb(x, seconds=2.2, mix=0.3):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 6, n))
    ir = fft_filter(ir, hi=5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << (len(x) + n - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return x * (1 - mix) + wet * mix


def epiano(f, dur, vel=1.0):
    """Soft electric-piano tone: sine body + small bell partial + tremolo."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3)
    bell = 0.12 * np.sin(2 * np.pi * f * 7.1 * t) * np.exp(-t * 18)
    env = np.minimum(1, t / 0.008) * np.exp(-t * 0.9)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)
    return (body + bell) * env * trem * vel


BPM = 98
BEAT = 60 / BPM
BAR = 4 * BEAT
SWING = 0.12 * BEAT
DRUMS_IN = TL["drumsIn"] / FPS
END = TL["endCard"] / FPS
# Fmaj7 - Em7 - Dm7 - Cmaj7
CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
ROOTS = [41, 40, 38, 36]
MELODY = [[72, 69], [71, 67], [69, 65, 67], [67, 64]]

keys = np.zeros(N)
bass = np.zeros(N)
drums = np.zeros(N)
mel = np.zeros(N)
pad = np.zeros(N)

n_bars = int(DUR / BAR) + 2
for b in range(n_bars):
    t0 = b * BAR
    if t0 >= DUR:
        break
    ci = b % 4
    ending = t0 >= END - 0.05
    # keys: chord on 1 and on the "and" of 2 (soft), with a small strum
    hits = [(0.0, 0.9)] if ending else [(0.0, 0.9), (1.5 * BEAT + SWING, 0.55)]
    for off, vel in hits:
        for k, note in enumerate(CHORDS[0] if ending else CHORDS[ci]):
            add(keys, epiano(midi(note), BAR * (2.5 if ending else 1.3), vel), t0 + off + k * 0.012, 0.09)
    # soft pad under the keys
    n = int(BAR * SR)
    tt = np.arange(n) / SR
    padsig = np.zeros(n)
    for note in (CHORDS[0] if ending else CHORDS[ci]):
        for det in (-0.08, 0.08):
            ff = midi(note) * 2 ** (det / 12)
            padsig += 2 * ((tt * ff + rng.random()) % 1.0) - 1
    penv = np.minimum(1, tt / 0.25) * np.minimum(1, (BAR - tt) / 0.3)
    add(pad, padsig * penv, t0, 0.012)
    if ending:
        continue
    # bass on 1 and 3
    for k in (0, 2):
        bt = t0 + k * BEAT
        n = int(BEAT * 1.9 * SR)
        tt = np.arange(n) / SR
        f = midi(ROOTS[ci])
        s = np.sin(2 * np.pi * f * tt) + 0.15 * np.sin(4 * np.pi * f * tt)
        add(bass, s * np.minimum(1, tt / 0.02) * np.exp(-tt * 1.1), bt, 0.28)
    # simple melody, starts after the first bars
    if t0 >= DRUMS_IN + BAR:
        notes = MELODY[ci]
        for k, note in enumerate(notes):
            mt = t0 + BEAT * (0.5 + k * (3 / len(notes)))
            n = int(1.2 * SR)
            tt = np.arange(n) / SR
            f = midi(note) * (1 + 0.004 * np.sin(2 * np.pi * 5 * tt))
            ph = 2 * np.pi * np.cumsum(f) / SR
            s = np.sin(ph) + 0.2 * np.sin(2 * ph)
            add(mel, s * np.minimum(1, tt / 0.04) * np.exp(-tt * 2.2), mt, 0.045)
    # drums (light)
    if t0 < DRUMS_IN - 0.01 or t0 >= END - 0.05:
        continue
    for k in range(4):
        bt = t0 + k * BEAT
        for kt in ([0.0] if k in (0, 2) else []) + ([0.5] if k == 1 else []):
            n = int(0.3 * SR)
            tt = np.arange(n) / SR
            fr = 50 + 45 * np.exp(-tt * 25)
            s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 9)
            add(drums, s, bt + kt * BEAT, 0.42 if kt == 0 else 0.25)
        if k in (1, 3):
            n = int(0.18 * SR)
            tt = np.arange(n) / SR
            noise = fft_filter(rng.standard_normal(n), lo=900, hi=5000)
            add(drums, noise * np.exp(-tt * 22) * 0.17 + np.sin(2 * np.pi * 200 * tt) * np.exp(-tt * 35) * 0.08, bt)
        for h, swing in ((0, 0), (BEAT / 2, SWING)):
            n = int(0.05 * SR)
            tt = np.arange(n) / SR
            hat = fft_filter(rng.standard_normal(n), lo=6000)
            add(drums, hat * np.exp(-tt * 60), bt + h + swing, 0.04 if h else 0.028)

# vinyl texture
crackle = fft_filter(rng.standard_normal(N), lo=200, hi=3000) * 0.002
pops = np.zeros(N)
for _ in range(int(DUR * 1)):
    i = rng.integers(0, N - 50)
    pops[i : i + 30] += rng.standard_normal(30) * np.exp(-np.arange(30) / 6) * 0.03

music = reverb(keys, 2.4, 0.32) + reverb(fft_filter(pad, hi=1800), 2.0, 0.4) + bass + reverb(mel, 2.6, 0.45) + reverb(drums, 1.0, 0.15) + crackle + pops
music = fft_filter(music, lo=35, hi=7000)
fade_in = np.clip(np.arange(N) / (1.0 * SR), 0, 1)
fade_out = np.clip((N - np.arange(N)) / (2.5 * SR), 0, 1)
music *= fade_in * fade_out
music = np.tanh(music * 1.1)
music /= np.max(np.abs(music)) + 1e-9
music *= 0.42

# ---------------------------------------------------------------- sfx
sfx = np.zeros(N)
for c in TL["clicks"]:
    n = int(0.06 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 140) * 0.3
    s += np.sin(2 * np.pi * 420 * tt) * np.exp(-tt * 70) * 0.3
    s += np.diff(rng.standard_normal(n), prepend=0) * np.exp(-tt * 200) * 0.1
    add(sfx, s, c / FPS)
typing = TL.get("typing") or [{"start": TL["typeStart"], "speed": TL["typeSpeed"], "text": TL.get("prompt", "")}]
for seg in typing:
    for k in range(1, len(seg["text"]) + 1):
        frame = seg["start"] + math.ceil(k / seg["speed"])
        n = int(0.03 * SR)
        tt = np.arange(n) / SR
        key = np.sin(2 * np.pi * rng.uniform(1500, 2600) * tt) * np.exp(-tt * 260) * 0.11
        key += np.diff(rng.standard_normal(n), prepend=0) * np.exp(-tt * 300) * 0.05
        add(sfx, key, frame / FPS + rng.uniform(-0.008, 0.008))


def write(path, x):
    data = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(np.repeat(data[:, None], 2, axis=1).tobytes())


(ROOT / "public").mkdir(exist_ok=True)
write(ROOT / "public" / f"{PREFIX}-music.wav", music)
write(ROOT / "public" / f"{PREFIX}-sfx.wav", sfx)
print("done", round(DUR, 1), "s")
