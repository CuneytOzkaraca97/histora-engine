"""Synthesized music bed + SFX stems for the Emu War short. Writes work/music.wav and work/sfx.wav (48 kHz mono)."""
import numpy as np, wave
SR = 48000; FPS = 30; N_FRAMES = 1237
DUR = N_FRAMES / FPS + 0.5
n = int(DUR * SR)
rng = np.random.default_rng(7)
t_all = np.arange(n) / SR

def env(length, a=0.005, d=0.2, s=0.0, r=0.05, sus=None):
    L = int(length * SR); e = np.zeros(L); A = max(1, int(a * SR)); D = max(1, int(d * SR))
    e[:A] = np.linspace(0, 1, A); e[A:A + D] = np.linspace(1, s, min(D, L - A))[: max(0, min(D, L - A))]
    if A + D < L: e[A + D:] = s
    R = int(r * SR)
    if R and L > R: e[-R:] *= np.linspace(1, 0, R)
    return e

def put(buf, sig, at_s, gain=1.0):
    i = int(at_s * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig)); buf[i:j] += gain * sig[: j - i]

def lp(x, a):  # one-pole low-pass, a in (0,1)
    y = np.empty_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y

def lp_fast(x, cutoff):
    # FFT brickwall-ish low-pass (cheap for long noise)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x))

def hp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x))

def bp_fast(x, lo, hi): return hp_fast(lp_fast(x, hi), lo)

# ---------------- instruments ----------------
def kick(L=0.35):
    t = np.arange(int(L * SR)) / SR; f = 50 + 90 * np.exp(-t * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9)

def snare(L=0.22):
    t = np.arange(int(L * SR)) / SR; nz = bp_fast(rng.standard_normal(len(t)), 900, 7000)
    return (0.8 * nz / (np.abs(nz).max() + 1e-9) + 0.4 * np.sin(2 * np.pi * 190 * t)) * np.exp(-t * 18)

def pluck(freq, L=0.45):
    # Karplus-Strong bass
    N = int(SR / freq); buf = rng.uniform(-1, 1, N); out = np.zeros(int(L * SR))
    for i in range(len(out)):
        out[i] = buf[i % N]; buf[i % N] = 0.5 * (buf[i % N] + buf[(i + 1) % N]) * 0.996
    return lp_fast(out, 900) * np.exp(-np.arange(len(out)) / SR * 3)

def brass(freq, L, vib=5.0):
    t = np.arange(int(L * SR)) / SR; f = freq * (1 + 0.004 * np.sin(2 * np.pi * vib * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum((1 / k) * np.sin(k * ph) for k in range(1, 8))
    s = lp_fast(s, 1800 + 600 * 0)
    return s * env(L, a=0.06, d=0.15, s=0.75, r=0.12)

def glock(freq, L=0.6):
    t = np.arange(int(L * SR)) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2.76 * t)) * np.exp(-t * 6)

NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- music: jaunty military march, 112 bpm ----------------
BPM = 112; beat = 60 / BPM
music = np.zeros(n)
STOP = 1193 / FPS            # music cuts on the twist line
FADE_IN_END = 0.4
prog = [(55, 59, 62), (60, 64, 67), (62, 66, 69), (55, 59, 62)]   # G C D G
mel = [79, 78, 76, 74, 76, 79, 81, 79, 76, 74, 72, 74, 76, 74, 71, 74]
bars = int(STOP / (4 * beat)) + 1
K, S = kick(), snare()
for b in range(bars):
    t0 = b * 4 * beat
    chord = prog[b % 4]
    for q in range(4):
        tq = t0 + q * beat
        if tq >= STOP: break
        put(music, K, tq, 0.55 if q % 2 == 0 else 0.0)
        if q % 2 == 1: put(music, S, tq, 0.28)
        put(music, S * 0.5, tq + beat * 0.75, 0.08 if q == 3 else 0.0)
        bass = NOTE(chord[0] - 12) if q % 2 == 0 else NOTE(chord[0] - 5)
        put(music, pluck(bass, beat * 0.9), tq, 0.45)
    if t0 < STOP:
        for k, m in enumerate(chord):
            put(music, brass(NOTE(m), min(4 * beat, STOP - t0)) , t0, 0.07)
    # whimsical glockenspiel melody every other bar pair
    if b % 4 in (1, 3):
        for i in range(8):
            tm = t0 + i * beat / 2
            if tm < STOP: put(music, glock(NOTE(mel[(b * 8 + i) % 16])), tm, 0.10)
music[int(STOP * SR):] = 0
fade = int(0.03 * SR); i0 = int(STOP * SR); music[i0 - fade:i0] *= np.linspace(1, 0, fade)
# tone the march by light: night section (891-1094) gets a mellower filtered bed
a, b_ = int(891 / FPS * SR), int(1095 / FPS * SR)
music[a:b_] = lp_fast(music[a:b_], 1200) * 0.9
# low drone after the twist
L = DUR - STOP; tt = np.arange(int(L * SR)) / SR
drone = (np.sin(2 * np.pi * 49 * tt) + 0.5 * np.sin(2 * np.pi * 73.5 * tt)) * np.minimum(1, tt / 0.3) * np.exp(-tt * 0.4)
put(music, drone, STOP, 0.35)

# ---------------- SFX ----------------
sfx = np.zeros(n)
def noise(L): return rng.standard_normal(int(L * SR))
def thunk(L=0.35):
    t = np.arange(int(L * SR)) / SR
    return (np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 25)) * t) * 0.9 + 0.4 * lp_fast(noise(L), 600)) * np.exp(-t * 12)
def pop(L=0.15):
    t = np.arange(int(L * SR)) / SR; f = 300 + 900 * t / L
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 20)
def whoosh(L=0.6):
    t = np.arange(int(L * SR)) / SR; nz = bp_fast(noise(L), 400, 4000)
    e = np.sin(np.pi * t / L) ** 2; return nz / (np.abs(nz).max() + 1e-9) * e
def rumble(L=2.5):
    nz = lp_fast(noise(L), 180); e = env(L, a=0.6, d=0.5, s=0.8, r=0.8); return nz / (np.abs(nz).max() + 1e-9) * e
def munch(L=0.12):
    t = np.arange(int(L * SR)) / SR; nz = bp_fast(noise(L), 1500, 6000); return nz / (np.abs(nz).max() + 1e-9) * np.exp(-t * 40)
def engine(L, rpm=28, gain_curve=None):
    t = np.arange(int(L * SR)) / SR
    s = np.sign(np.sin(2 * np.pi * rpm * t)) * 0.5 + 0.5 * np.sin(2 * np.pi * rpm * 2 * t)
    s = lp_fast(s + 0.3 * noise(L), 400)
    s /= np.abs(s).max() + 1e-9
    return s * (gain_curve if gain_curve is not None else 1)
def boing(L=0.35):
    t = np.arange(int(L * SR)) / SR; f = 180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6)
def sting(L=2.2):
    t = np.arange(int(L * SR)) / SR
    s = np.sin(2 * np.pi * 41 * t) + 0.6 * np.sin(2 * np.pi * 61.5 * t) + 0.3 * lp_fast(noise(L), 300)
    return s * np.exp(-t * 1.6) * np.minimum(1, t / 0.01)
def ting(L=1.0):
    t = np.arange(int(L * SR)) / SR; return (np.sin(2 * np.pi * 1760 * t) + 0.4 * np.sin(2 * np.pi * 2640 * t)) * np.exp(-t * 5)
def flashfx(L=0.5):
    t = np.arange(int(L * SR)) / SR; nz = hp_fast(noise(L), 3000); return nz / (np.abs(nz).max() + 1e-9) * np.exp(-t * 7) * 0.6 + 0.4 * np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 9)
def clunk(L=0.25):
    t = np.arange(int(L * SR)) / SR; return (np.sin(2 * np.pi * 110 * t) + 0.5 * bp_fast(noise(L), 300, 1500) / 3) * np.exp(-t * 18)

F = lambda f: f / FPS
cues = [
    (thunk(), F(101), 0.9), (pop(), F(144), 0.7), (ting(), F(146), 0.25),
    (whoosh(0.7), F(178), 0.6), (rumble(3.2), F(262), 0.7),
    *[(munch(), F(326 + k * 4.5), 0.35) for k in range(8)],
    (whoosh(0.4), F(402), 0.3), (pop(), F(455), 0.7),
    *[(thunk(0.25), F(a + 9), 0.55) for a in (520, 527, 534)],
    (thunk(0.4), F(551), 1.0), (thunk(0.4), F(559), 1.0),
    *[(thunk(0.3), F(578 + i * 6.5 + 5), 0.65) for i in range(6)],
    (whoosh(0.6), F(688), 0.8), (pop(), F(735), 0.5),
    (whoosh(0.5), F(836), 0.7), (ting(0.6), F(858), 0.3),
    (flashfx(), F(890), 0.6), *[(clunk(), F(895 + k * 15.5), 0.6) for k in range(7)],
    *[(boing(), F(997 + k * 11), 0.35) for k in range(9)],
    (flashfx(), F(1094), 0.6),
    (sting(), F(1194), 0.9), (munch(0.15), F(1212), 0.6), (munch(0.15), F(1218), 0.5),
]
for sig, at, g in cues: put(sfx, sig / (np.abs(sig).max() + 1e-9), at, g)
# truck engine beds
for a, b, rpm in [(769, 891, 30), (891, 997, 24), (1100, 1191, 30)]:
    L = (b - a) / FPS; tt = np.arange(int(L * SR)) / SR
    g = np.minimum(1, tt / 0.3) * np.minimum(1, (L - tt) / 0.3)
    if a == 1100: g *= np.exp(-tt * 0.9)  # drives away
    put(sfx, engine(L, rpm, g), F(a), 0.35)
# light wind ambience under day/golden shots
wind = lp_fast(noise(DUR), 500); wind /= np.abs(wind).max(); sfx += 0.05 * wind * (0.6 + 0.4 * np.sin(2 * np.pi * 0.1 * t_all))

def write(path, x):
    x = np.clip(x, -1, 1); w = wave.open(path, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
music /= np.abs(music).max() + 1e-9; sfx /= np.abs(sfx).max() + 1e-9
write("work/music.wav", music * 0.9); write("work/sfx.wav", sfx * 0.9)
print("ok", DUR)
