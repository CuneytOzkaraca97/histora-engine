// Emu War: shots, cameras, lights and actors as pure functions of the frame.
export const FPS = 30, N = 1237;
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const smooth = (x) => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const easeOut = (x) => 1 - (1 - clamp01(x)) ** 3;
export const back = (x) => { x = clamp01(x); const c = 1.9; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; };
export const spring = (x) => { x = clamp01(x); return 1 - Math.exp(-6 * x) * Math.cos(10 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rnd = (s, k = 0) => { const x = Math.sin(s * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const between = (f, a, b) => clamp01((f - a) / (b - a));

export const SHOTS = [
  { id: "S1", a: 0, b: 179, light: "day" },
  { id: "S2", a: 180, b: 372, light: "day" },
  { id: "S3", a: 373, b: 493, light: "day" },
  { id: "S4", a: 494, b: 636, light: "day" },
  { id: "S5", a: 637, b: 684, light: "day" },
  { id: "S6", a: 685, b: 768, light: "day" },
  { id: "S7", a: 769, b: 890, light: "day" },
  { id: "S8a", a: 891, b: 996, light: "night" },
  { id: "S8b", a: 997, b: 1094, light: "night" },
  { id: "S9", a: 1095, b: 1190, light: "golden" },
  { id: "S10", a: 1191, b: 1236, light: "golden" },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

export const LIGHTS = {
  day: { skyTop: "#5fa6e3", skyHor: "#f4e3bd", sun: "#fff0d2", sunI: 2.6, az: 140, el: 48, hemiSky: "#d4e8ff", hemiGround: "#b07a45", hemiI: 1.25,
    fog: "#efdcb4", fogNear: 70, fogFar: 380, card: "#ffffff", sat: 1.12, gain: 1.0, lift: 0.0, vign: 0.22 },
  golden: { skyTop: "#6f78b5", skyHor: "#ffb06a", sun: "#ffc27c", sunI: 2.9, az: 92, el: 11, hemiSky: "#ffcf9e", hemiGround: "#6b3d2c", hemiI: 1.1,
    fog: "#f4aa74", fogNear: 50, fogFar: 300, card: "#ffd6a8", sat: 1.15, gain: 1.0, lift: 0.0, vign: 0.3 },
  night: { skyTop: "#18244e", skyHor: "#4a5f9c", sun: "#a9bcff", sunI: 1.7, az: 150, el: 40, hemiSky: "#7088cc", hemiGround: "#262b45", hemiI: 1.15,
    fog: "#3a4c84", fogNear: 40, fogFar: 260, card: "#9fb2e6", sat: 0.95, gain: 1.0, lift: 0.02, vign: 0.38 },
};

// ---------- terrain ----------
export const HILL = { x: 0, z: -68, R: 24, H: 4.5 };
export const groundH = (x, z) => {
  const d2 = ((x - HILL.x) ** 2 + (z - HILL.z) ** 2) / HILL.R ** 2;
  return d2 < 1 ? HILL.H * Math.sqrt(1 - d2) : 0;
};

// ---------- truck path ----------
export const truckAt = (f) => {
  if (f <= 768) return { x: 21.2, z: 9.4, y: 0, pitch: 0, roll: 0, yaw: 0, wheel: 0, moving: false };
  if (f <= 890) { const t = (f - 769) / FPS, x = -40 + 7 * t;
    return { x, z: 12, y: 0.04 * Math.abs(Math.sin(t * 9)), pitch: 0.012 * Math.sin(t * 7), roll: 0.01 * Math.sin(t * 5), yaw: 0, wheel: x / 0.45, moving: true }; }
  if (f <= 996) { const t = (f - 891) / FPS, x = 100 + 5.2 * t;
    return { x, z: 12, y: 0.32 * Math.abs(Math.sin(t * 6.3)), pitch: 0.1 * Math.sin(t * 6.3), roll: 0.06 * Math.sin(t * 4.1 + 1), yaw: 0, wheel: x / 0.45, moving: true }; }
  const t = Math.max(0, (f - 1100) / FPS), x = 150 + 4 * t + 2.2 * t * t;
  return { x, z: 12, y: 0.04 * Math.abs(Math.sin(t * 8)), pitch: 0.01 * Math.sin(t * 6), roll: 0, yaw: 0, wheel: x / 0.45, moving: f > 1100 };
};
const BED_Y = 1.15;

// ---------- cameras ----------
const K = (f, pos, tgt, fov = 40, roll = 0) => ({ f, pos, tgt, fov, roll });
const camKeys = {
  S1: [K(0, [0.95, 1.75, 3.0], [0.62, 1.48, 0], 34), K(70, [0.85, 1.7, 3.3], [0.55, 1.45, 0], 34), K(110, [0.05, 1.55, 5.6], [-0.15, 1.2, -1.4], 42), K(179, [0.0, 1.5, 5.1], [-0.15, 1.2, -1.4], 41, 1)],
  S2: [K(180, [6, 15, 34], [0, 2.5, -30], 44), K(300, [4, 8, 25], [-1, 2, -26], 43), K(372, [3, 5.2, 18], [-2, 1.4, -22], 42)],
  S3: [K(373, [-15.85, 1.7, -12.2], [-15.85, 1.35, -19.4], 42), K(493, [-15.85, 1.7, -13.1], [-15.85, 1.4, -19.4], 40)],
  S4: [K(494, [19.9, 1.9, 24.0], [20.3, 1.55, 13.9], 46), K(636, [20.7, 1.85, 23.4], [20.4, 1.5, 13.9], 45)],
  S5: [K(637, [18.8, 1.62, 17.2], [18.7, 1.5, 14.6], 36), K(684, [18.76, 1.6, 16.6], [18.7, 1.52, 14.6], 34, -2)],
  S6: [K(685, [1.5, 12.5, -4.5], [0, 0.4, -20], 50), K(768, [1.2, 14.0, -5.0], [0, 0.4, -20.5], 52)],
  S8b: [K(997, [60.45, 1.55, -1.7], [60.05, 1.35, -6], 40), K(1094, [60.3, 1.5, -2.3], [60.05, 1.35, -6], 38, 2)],
  S9: [K(1095, [141, 2.3, 12.6], [168, 1.4, 12], 42), K(1190, [140.2, 2.5, 12.8], [168, 1.5, 12], 42)],
  S10: [K(1191, [0.95, 1.45, 3.1], [0.72, 1.45, 0], 36), K(1236, [0.85, 1.4, 2.35], [0.75, 1.35, 0], 33, 3)],
};
const fromKeys = (keys, f) => {
  if (f <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b.f) { const t = smooth((f - a.f) / (b.f - a.f));
      return { pos: lerp3(a.pos, b.pos, t), tgt: lerp3(a.tgt, b.tgt, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll, b.roll, t) }; }
  }
  return keys[keys.length - 1];
};
const kick = (f, at, amp = 0.05, dur = 7) => { const t = (f - at) / dur; return t < 0 || t > 1 ? 0 : amp * Math.sin(t * Math.PI * 3) * (1 - t); };

export const camAt = (f) => {
  const s = shotAt(f);
  let c;
  if (s.id === "S7") { const tr = truckAt(f), pan = 2.2 * smooth(between(f, 836, 880)); c = { pos: [tr.x + 0.4 + pan, 1.45, 22.4], tgt: [tr.x + 0.6 + pan, 1.55, 12.5], fov: 44, roll: 0 }; }
  else if (s.id === "S8a") { const sx = 100 + 5.2 * (f - 891) / FPS, pan = 2.5 * smooth(between(f, 930, 990)); const tt = (f - 891) / FPS, ex = 101 + (tt < 0.8 ? 5.2 * tt : 5.2 * 0.8 + 8.5 * (tt - 0.8)), cx = ex - 0.2 - 0.6 * (1 - smooth(between(f, 891, 930))); c = { pos: [cx, 1.4, 21.8], tgt: [cx + 0.2, 1.5, 12.5], fov: 44, roll: 1.5 * Math.sin(f / 9) }; }
  else c = fromKeys(camKeys[s.id], f);
  c = { ...c, pos: [...c.pos], tgt: [...c.tgt] };
  // impact kicks
  const shake = kick(f, 101, 0.03) + kick(f, 548, 0.05) + kick(f, 556, 0.05) + kick(f, 600, 0.03) + kick(f, 1212, 0.02);
  c.pos[1] += shake; c.tgt[1] += shake;
  if (s.id === "S8a") { const tr = truckAt(f); c.pos[1] += 0.25 * tr.y; }
  return c;
};

// ---------- focus (distance in m) and blur strength ----------
export const dofAt = (f) => {
  const s = shotAt(f);
  const c = camAt(f), d = (p) => Math.hypot(p[0] - c.pos[0], p[1] - c.pos[1], p[2] - c.pos[2]);
  switch (s.id) {
    case "S1": return { focus: lerp(d([0.6, 1.5, 0]), d([-1.0, 1.4, -3.2]), smooth(between(f, 100, 116))), blur: lerp(11, 6, between(f, 70, 120)) };
    case "S3": return { focus: d([-16.3, 1.3, -19.3]), blur: 7 };
    case "S5": return { focus: d([18.6, 1.6, 14.2]), blur: 12 };
    case "S8b": return { focus: d([60, 1.4, -5.6]), blur: 9 };
    case "S10": return { focus: d([0.7, 1.4, 0]), blur: 12 };
    case "S4": return { focus: d([20.4, 1.0, 14.3]), blur: 3 };
    default: return { focus: 20, blur: 0 };
  }
};

export const flashAt = (f) => {
  for (const at of [891, 1095]) { const t = (f - at) / 7; if (t >= 0 && t < 1) return (1 - t) * 0.9; }
  return 0;
};

// ---------- actors ----------
export const SOLDIER = { jacket: "#9b8a5a", pants: "#7c6f4a", boots: "#4a3426", hat: "slouch", cap: "#8f7a50", upbrim: true, belt: "#6b5a3a", buttons: "#c9b46a", skin: "#f5c9a0" };
export const SOLDIER2 = { ...SOLDIER, skin: "#ffe2c2", moustache: "#4a3426" };
export const SOLDIER3 = { ...SOLDIER, skin: "#ecd0b6" };
export const MAJOR = { jacket: "#8f7d4f", pants: "#6f6342", boots: "#3a2a1e", hat: "slouch", cap: "#6f5c3a", moustache: "#4a3020", build: "stout", skin: "#ffe2c2", buttons: "#e8c45a" };
export const FARMER_A = { jacket: "#4f78a8", pants: "#5a4a3a", boots: "#4a3426", hat: "slouch", cap: "#7a5a3a", skin: "#ecd0b6", moustache: "#9a9a9a", buttons: "#d8c070" };
export const FARMER_B = { jacket: "#a65a3c", pants: "#4a4a55", boots: "#4a3426", hat: "slouch", cap: "#9a7a4a", skin: "#f5c9a0", buttons: "#d8c070", build: "stout" };

const blinkAt = (f, seed) => { const per = 70 + Math.floor(rnd(seed, 3) * 50), ph = (f + Math.floor(rnd(seed, 4) * per)) % per; return ph < 2 ? 1 : ph < 4 ? 0.5 : 0; };
const idleBob = (f, seed) => 0.006 * Math.sin(f * 0.11 + seed);

const human = (id, o, x, z, opts = {}, extra = {}) => ({ id, kind: "human", o, x, y: 0, z, opts, ...extra });
const emuA = (id, x, z, opts = {}, extra = {}) => ({ id, kind: "emu", x, y: 0, z, opts, ...extra });
const prop = (id, type, x, y, z, opts = {}, extra = {}) => ({ id, kind: "prop", type, x, y, z, opts, ...extra });
const fx = (id, type, x, y, z, size, opts = {}, extra = {}) => ({ id, kind: "fx", type, x, y, z, size, opts, ...extra });
const dust = (id, x, z, f, at, size = 1.6) => { const t = (f - at) / 14; return t >= 0 && t < 1 ? [fx(id, "dust", x, 0.02, z, size, { t })] : []; };

/** emu cycling run phase from distance travelled */
const runPh = (dist, seed = 0) => (((dist / 2.2) + rnd(seed, 9)) % 1 + 1) % 1;

export const actorsAt = (f) => {
  const s = shotAt(f), A = [];
  const peckCycle = (ff, seed) => { const ph = ((ff + seed * 13) % 26) / 26; return ph < 0.5 ? smooth(ph * 2) : smooth(2 - ph * 2); };
  switch (s.id) {
    case "S1": {
      const smug = f >= 145;
      A.push(emuA("hero", 0.3, 0, { mode: "stand", expr: smug ? "smug" : "neutral", chest: smug ? 1 : 0, blink: blinkAt(f, 1), seed: 3 }, { bob: idleBob(f, 1) + (smug ? 0.02 * back(between(f, 145, 152)) : 0) }));
      const sold = f >= 146 ? "pained" : f >= 103 ? "stern" : "neutral";
      A.push(human("sold1", SOLDIER, -0.75, -2.7, { mode: "stand", expr: sold, blink: blinkAt(f, 2), seed: 3, wave: f >= 146 ? 0.2 : undefined }, { bob: idleBob(f, 2) }));
      if (f >= 100) A.push(prop("lewis1", "lewis", -1.3, 1.6 * (1 - back(between(f, 100, 106))), -2.0, {}, { flip: false }));
      A.push(...dust("d1", -1.25, -1.9, f, 104, 1.4));
      if (f >= 143) A.push(prop("flag", "flag", -0.45, -2.3 * (1 - back(between(f, 143, 151))), -2.75, { t: f / 30 }));
      break;
    }
    case "S2": {
      for (let i = 0; i < 46; i++) {
        const x0 = -22 + 44 * rnd(i, 1), z0 = -88 - 8 * rnd(i, 2), dir = rnd(i, 3) < 0.5 ? -1 : 1;
        const x1 = x0 * 0.7 + dir * 4, z1 = -40 + 22 * rnd(i, 4);
        const start = 262 + 30 * rnd(i, 5), dur = 52 + 10 * rnd(i, 6);
        const t = between(f, start, start + dur), e = t;
        const x = lerp(x0, x1, e), z = lerp(z0, z1, e), moving = t > 0 && t < 1;
        const travelled = Math.hypot(x1 - x0, z1 - z0) * e;
        const pecking = t >= 1;
        A.push(emuA("h" + i, x, z, pecking ? { mode: "peck", peck: peckCycle(f, i), expr: "happy", seed: i } : { mode: moving ? "run" : "stand", phase: runPh(travelled, i), seed: i },
          { flip: (x1 - x0) < 0, y: groundH(x, z) }));
      }
      break;
    }
    case "S3": {
      const sal = smooth(between(f, 402, 410)) - smooth(between(f, 440, 448));
      A.push(human("farmA", FARMER_A, -16.85, -19.6, { mode: "stand", expr: f > 452 ? "stern" : "neutral", blink: blinkAt(f, 5), seed: 11, wave: sal > 0.02 ? 0.6 * sal : undefined }, { bob: idleBob(f, 5) }));
      A.push(human("farmB", FARMER_B, -15.95, -19.4, { mode: "stand", expr: f > 456 ? "shock" : "stern", blink: blinkAt(f, 6), seed: 14, wave: sal > 0.02 ? 0.6 * sal : undefined }, { bob: idleBob(f, 6) }));
      if (f >= 455) A.push(prop("placard", "placard", -15.0, -2.2 * (1 - back(between(f, 455, 463))), -19.9));
      break;
    }
    case "S4": case "S5": {
      const tr = truckAt(f);
      const hop = (at, x, z, o, seed, id) => {
        const t = between(f, at, at + 9);
        if (f < at) return;
        const y = t < 1 ? BED_Y * (1 - t) + 0.8 * Math.sin(Math.PI * t) : 0;
        const sq = t >= 1 ? 1 - 0.06 * Math.exp(-(f - at - 9) / 3) : 1;
        A.push(human(id, o, lerp(19.9, x, t), lerp(10.3, z, t), { mode: "stand", expr: f > 640 ? "smile" : "stern", blink: blinkAt(f, seed), seed }, { y, sy: sq, bob: idleBob(f, seed) }));
        A.push(...dust(id + "d", x, z, f, at + 9, 1.0));
      };
      hop(520, 19.5, 13.9, SOLDIER, 4, "s1"); hop(527, 20.4, 14.2, SOLDIER2, 8, "s2"); hop(534, 21.3, 13.8, SOLDIER3, 12, "s3");
      const major = { mode: "stand", expr: f >= 637 ? "grin" : "stern", blink: blinkAt(f, 9), seed: 21, wave: f >= 652 ? 0.9 * back(between(f, 652, 660)) : undefined, headTilt: f >= 637 ? 4 * Math.sin(f * 0.2) : 0 };
      A.push(human("major", MAJOR, 18.6, 14.2, major, { bob: idleBob(f, 9) + (f >= 645 && f <= 680 ? 0.01 * Math.abs(Math.sin(f * 0.35)) : 0) }));
      for (const [i, at, x] of [[0, 546, 21.75], [1, 554, 22.35]]) if (f >= at) {
        A.push(prop("g" + i, "lewis", x, 3 * (1 - easeOut(between(f, at, at + 5)) ** 2), 15.3 - i * 0.3));
        A.push(...dust("gd" + i, x, 15.3 - i * 0.3, f, at + 5, 1.3));
      }
      const crates = [[0, 0, 0], [1, 0.62, 0], [2, 1.24, 0], [3, 0.31, 0.47], [4, 0.93, 0.47], [5, 0.62, 0.94]];
      for (const [i, dx, dy] of crates) { const at = 578 + i * 6.5; if (f >= at) {
        const t = easeOut(between(f, at, at + 5));
        A.push(prop("c" + i, "crate", 19.3 + dx, dy + 3.5 * (1 - t), 16.4 + 0.01 * i));
        if (i < 3) A.push(...dust("cd" + i, 19.3 + dx, 16.4, f, at + 5, 0.9));
      } }
      break;
    }
    case "S6": {
      for (let i = 0; i < 18; i++) {
        const a0 = rnd(i, 1) * Math.PI * 2, r0 = 1.5 + 2.5 * rnd(i, 2);
        const at = 690 + 10 * rnd(i, 3), t = Math.max(0, (f - at) / FPS);
        const dist = t > 0 ? 2.5 * t + 1.2 * t * t : 0;
        const x = 0 + Math.cos(a0) * (r0 + dist), z = -21 + Math.sin(a0) * (r0 + dist) * 0.8;
        A.push(emuA("sc" + i, x, z, t > 0 ? { mode: "run", phase: runPh(dist, i), expr: "shock", seed: i } : { mode: "peck", peck: peckCycle(f, i), seed: i }, { flip: Math.cos(a0) < 0 }));
      }
      A.push(human("gunner", SOLDIER, -1.4, -15.2, { mode: "stand", expr: f > 700 ? "shock" : "stern", blink: blinkAt(f, 3), seed: 3 }));
      A.push(prop("g6", "lewis", -0.55, 0, -15.5));
      if (f >= 735) A.push(fx("q", "question", -1.4, 2.0 + 0.1 * back(between(f, 735, 742)), -15.2, 1.1 * back(between(f, 735, 742))));
      break;
    }
    case "S7": {
      const tr = truckAt(f);
      // soldiers in the truck bed
      A.push(human("t1", SOLDIER, tr.x - 1.2, tr.z - 0.2, { mode: "stand", expr: f > 838 ? "shock" : "stern", seed: 4, blink: blinkAt(f, 4) }, { y: BED_Y + tr.y, parentTruck: true }));
      A.push(human("t2", SOLDIER2, tr.x - 0.3, tr.z + 0.2, { mode: "stand", expr: f > 838 ? "shock" : "stern", seed: 8, blink: blinkAt(f, 8) }, { y: BED_Y + tr.y, parentTruck: true }));
      const tt = (f - 769) / FPS;
      for (let i = 0; i < 5; i++) {
        const lead = i === 0;
        let rel = [-0.6, -2.4, 1.2, -3.6, 0.2][i];
        if (lead) rel += 6 * smooth(between(f, 836, 878));
        else rel -= 1.5 * smooth(between(f, 836, 890)) * (i % 2);
        const x = tr.x + 1.0 + rel * 1.3, z = [16.8, 17.6, 16.2, 17.3, 8.6][i];
        const dist = 7 * tt + rel;
        const look = lead ? smooth(between(f, 852, 858)) - smooth(between(f, 874, 880)) : 0;
        A.push(emuA("r" + i, x, z, { mode: "run", phase: runPh(dist * 1.1, i), expr: lead && f > 856 && f < 876 ? "wink" : "neutral", look, seed: i + 2 }));
        if (lead && f > 838) A.push(fx("spd", "speed", x - 1.4, 0.7, z, 1.1, {}, { flip: false }));
      }
      break;
    }
    case "S8a": {
      const tr = truckAt(f);
      A.push(human("t1", SOLDIER, tr.x - 1.2, tr.z - 0.2, { mode: "stand", expr: "dazed", seed: 4 }, { y: BED_Y + tr.y }));
      A.push(human("t2", SOLDIER2, tr.x - 0.3, tr.z + 0.2, { mode: "stand", expr: "shock", seed: 8 }, { y: BED_Y + tr.y }));
      const tt = (f - 891) / FPS, ex = 100 + 1.0 + (tt < 0.8 ? 5.2 * tt : 5.2 * 0.8 + 8.5 * (tt - 0.8));
      A.push(emuA("smooth", ex, 16.9, { mode: "run", phase: runPh(ex, 1), expr: f > 950 ? "smug" : "neutral", seed: 5 }));
      for (let k = 0; k < 4; k++) A.push(...dust("td" + k, tr.x - 1.5, tr.z + 0.8, f, 893 + k * 26, 1.5));
      break;
    }
    case "S8b": {
      const tt = f - 997;
      for (let i = 0; i < 6; i++) {
        const hopN = Math.floor((tt + i * 5) / 11), ph = ((tt + i * 5) % 11) / 11;
        const xa = 57.6 + 5 * rnd(i * 31 + hopN, 1), xb = 57.6 + 5 * rnd(i * 31 + hopN + 1, 1);
        const z = -12 - 4 * rnd(i, 2);
        A.push(emuA("hop" + i, lerp(xa, xb, smooth(ph)), z, { mode: "run", phase: ph, expr: "happy", seed: i }, { y: 0.6 * Math.sin(Math.PI * ph), flip: xb < xa }));
      }
      const aim = 14 * Math.sin(tt * 0.32) + 6 * Math.sin(tt * 0.71);
      const dizzy = f >= 1062;
      A.push(human("aimer", SOLDIER2, 59.75, -5.6, { mode: "stand", expr: dizzy ? "dazed" : "stern", seed: 8, blink: dizzy ? 0 : blinkAt(f, 8), headTilt: dizzy ? 6 * Math.sin(f * 0.4) : 0, tilt: dizzy ? 3 * Math.sin(f * 0.3) : 0 }));
      A.push(prop("aimgun", "lewis", 60.55, 0, -5.3, { tilt: dizzy ? 10 : aim }));
      if (dizzy) A.push(fx("spin", "spiral", 59.75, 1.95, -5.6, 0.8, { t: f / 30 }));
      break;
    }
    case "S9": {
      const tr = truckAt(f);
      A.push(human("t1", SOLDIER, tr.x - 1.5, tr.z - 0.35, { mode: "stand", expr: "pained", seed: 4 }, { y: BED_Y + tr.y }));
      A.push(human("t2", SOLDIER2, tr.x - 1.5, tr.z + 0.35, { mode: "stand", expr: "pained", seed: 8 }, { y: BED_Y + tr.y }));
      for (let k = 0; k < 6; k++) A.push(...dust("sd" + k, tr.x - 2.2, tr.z, f, 1104 + k * 13, 2.2));
      A.push(emuA("watch", 147.5, 13.9, { mode: "stand", expr: "smug", blink: blinkAt(f, 4), seed: 6 }, { bob: idleBob(f, 4) }));
      A.push(emuA("watch2", 152, 10.2, { mode: f > 1150 ? "peck" : "stand", peck: peckCycle(f, 3), seed: 9 }));
      break;
    }
    case "S10": {
      const pk = f < 1203 ? 0 : f < 1212 ? smooth(between(f, 1203, 1212)) : 1 - smooth(between(f, 1214, 1222));
      const expr = f >= 1222 ? "smug" : pk > 0.5 ? "happy" : "neutral";
      A.push(emuA("hero", 0.3, 0, pk > 0.02 ? { mode: "peck", peck: pk * 0.62, expr, seed: 3 } : { mode: "stand", expr: f >= 1222 ? "smug" : "neutral", chest: f >= 1222 ? 1 : 0, blink: blinkAt(f, 1), seed: 3 }, { bob: idleBob(f, 1) }));
      break;
    }
  }
  return A;
};

/** wheat eaten fraction for S2 patch */
export const eatenAt = (f) => (f < 326 || f > 372 ? 0 : smooth(between(f, 326, 364)));
