// Emu War cast: emu (side view), props and effects drawn with the toon.js Pen in the same flat style.
// Design canvases: humans 600x1000 (soles y=975, from toon.js); emu 800x1000 (soles y=975, faces screen-right).
import { Pen, INK, mul, shade, mix, bodyFront, bodySide, fxPuff } from "./toon.js";

const rad = (d) => (d * Math.PI) / 180;
const TWO = Math.PI * 2;
const FEATHER = "#5c4630", FEATHER_LT = "#7b6044", FEATHER_DK = "#3e2f21";
const NECK = "#7894b4", LEG = "#8b8d97", BEAK = "#3a3230", IRIS = "#e0843a";
const ellPts = (cx, cy, rx, ry, n = 48, rot = 0) => {
  const out = [];
  for (let i = 0; i < n; i++) { const t = (i / n) * TWO, x = rx * Math.cos(t), y = ry * Math.sin(t);
    out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
  return out;
};
const lerp = (a, b, t) => a + (b - a) * t;
const quad = (a, k, b, n = 10) => {
  const c = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); }
  return out;
};
/** tapered band between two widths along a polyline (filled, inked) */
const taper = (p, pts, w0, w1, fill, ol = 9) => {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, w = lerp(w0, w1, i / (pts.length - 1)) / 2;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  p.poly([...L, ...R.reverse()], fill, ol);
};

/** emu, side view facing right.
 * o: { mode: "stand"|"run"|"peck"|"look", phase, peck 0..1, expr: "neutral"|"smug"|"wink"|"shock"|"happy"|"chew", look 0..1 (head turns back), blink, seed } */
export const emu = (p, o = {}) => {
  const { mode = "stand", phase = 0, peck = 0, expr = "neutral", blink = 0, seed = 1, look = 0, chest = 0 } = o;
  const run = mode === "run";
  const bob = run ? 16 * Math.cos(2 * TWO * phase) : 0;
  const lean = run ? 10 : 0;
  const bx = 380, by = 470 + bob - (chest ? 6 : 0);
  // ---- legs (far leg first) ----
  const hip = [bx + 30, by + 95];
  const legPose = (ph) => {
    if (!run) return { ank: [hip[0] - 40 + (ph ? 18 : -18), 790], foot: [hip[0] + (ph ? 40 : 0), 975] };
    const t = (phase + ph) % 1, sw = Math.sin(TWO * t), up = Math.max(0, Math.sin(TWO * t)) ;
    const fx = hip[0] + 170 * Math.cos(TWO * t);
    const fy = 975 - 120 * up;
    return { ank: [lerp(hip[0], fx, 0.45) - 70, lerp(hip[1], fy, 0.55) - 10], foot: [fx, fy] };
  };
  const drawLeg = (ph, far) => {
    const { ank, foot } = legPose(ph), col = far ? shade(LEG, 0.72) : LEG;
    p.line([hip, ank], col, 30, true);
    p.line([ank, [foot[0] - 6, foot[1] - 8]], col, 22, true);
    for (const a of [-12, 0, 14]) { const d = rad(a); p.line([[foot[0] - 6, foot[1] - 8], [foot[0] + 52 * Math.cos(d), foot[1] - 4 + 22 * Math.sin(d)]], col, 12, true); }
  };
  drawLeg(0.5, true);
  // ---- neck + head position ----
  const base = [bx + 150, by - 50];
  let head;
  if (mode === "peck") head = [lerp(bx + 250, bx + 330, peck), lerp(by - 330, 880, peck)];
  else if (run) head = [bx + 300, by - 320];
  else head = [bx + 245, by - (chest ? 400 : 370)];
  if (look) head = [lerp(head[0], bx + 120, look), lerp(head[1], by - 360, look)];
  const knee = mode === "peck" ? [lerp(bx + 250, bx + 330, peck), lerp(by - 200, by - 40, peck)] : [base[0] + 50, (base[1] + head[1]) / 2 + 10];
  const neck = quad(base, knee, head, 14);
  // ---- body: shaggy oval with droopy rump, feather fringe ----
  const body = ellPts(bx, by, 215, 150, 64, rad(lean * 0.5 - 6));
  const fringe = [];
  for (let i = 0; i < body.length; i++) {
    const [x, y] = body[i], k = y > by + 40 ? 1 : 0, j = (i * 7 + seed) % 3;
    fringe.push([x + (k ? (j - 1) * 8 : 0), y + (k ? (i % 2 ? 30 : -4) : 0)]);
  }
  taper(p, neck, 92, 54, NECK, 9);
  // dark feathered upper neck stripe
  const top = neck.slice(Math.floor(neck.length * 0.55));
  taper(p, top, 60, 52, mix(NECK, FEATHER_DK, 0.6), 0);
  p.shadedFill(fringe, FEATHER, FEATHER_DK, rad(-120), 230, 0.45);
  p.poly(fringe, null, 12);
  for (let i = 0; i < 9; i++) { // feather strokes
    const x = bx - 150 + i * 36 + ((seed * 13 + i * 29) % 17), y = by - 60 + ((i * 37 + seed) % 90);
    p.stroke([[x, y], [x - 26, y + 34]], 6, FEATHER_LT);
  }
  // wing-tuft
  p.stroke([[bx - 160, by - 40], [bx - 220, by + 10]], 7, FEATHER_DK);
  drawLeg(0, false);
  // ---- head (scaled up for readable faces) ----
  const [hx, hy] = head, flip = look > 0.5 ? -1 : 1, k = 1.4;
  p.ell(hx, hy, 50 * k, 42 * k, mix(NECK, FEATHER_DK, 0.55), 9);
  p.ell(hx - 6 * flip * k, hy - 20 * k, 40 * k, 18 * k, FEATHER_DK, 0); // crown feathers
  const bk = [[hx + 34 * flip * k, hy - 4 * k], [hx + 96 * flip * k, hy + 8 * k], [hx + 94 * flip * k, hy + 18 * k], [hx + 32 * flip * k, hy + 20 * k]];
  if (expr === "chew") bk[2][1] += 10 * k;
  p.poly(bk, BEAK, 8);
  if (expr === "shock") p.poly([[hx + 34 * flip * k, hy + 20 * k], [hx + 88 * flip * k, hy + 22 * k], [hx + 34 * flip * k, hy + 40 * k]], "#5a1e28", 6);
  const ex = hx + 10 * flip * k, ey = hy - 6 * k, big = expr === "shock" ? 1.35 : 1, r = 18 * k * big;
  if (blink >= 1 || expr === "wink") p.stroke([[ex - r, ey], [ex + r, ey]], 8);
  else if (expr === "happy") p.arc(ex, ey + 6, r, r * 0.7, 200, 340, 8);
  else {
    p.ell(ex, ey, r, r, IRIS, 6);
    p.ell(ex + 5 * flip, ey, r * 0.48, r * 0.55, INK, 0);
    if (expr === "smug" || blink > 0) { p.ell(ex, ey - 2, r * 1.15, r * 0.95, mix(NECK, FEATHER_DK, 0.55), 0, 180, 360); p.stroke([[ex - r * 1.1, ey - 1], [ex + r * 1.1, ey - 1]], 7); }
    if (expr === "smug") p.stroke([[ex - r * 1.2, ey - r * 1.5], [ex + r * 1.1, ey - r * 1.1]], 8);
    if (expr === "shock") p.stroke([[ex - r, ey - r * 1.7], [ex + r, ey - r * 1.9]], 8);
  }
};

/** Lewis gun on a bipod, side view, muzzle to the right, design 600x1000 (base y=975) */
export const lewis = (p, o = {}) => {
  const { recoil = 0, tilt = 0 } = o;
  p.rot = tilt ? [rad(tilt), 300, 800] : null;
  const y = 800 - recoil * 6;
  p.line([[250, y + 10], [190, 975]], "#4a4038", 16); p.line([[260, y + 10], [320, 975]], "#4a4038", 16);
  p.poly([[60, y - 10], [170, y - 30], [170, y + 40], [80, y + 55]], "#7a5432", 10); // stock
  p.poly([[160, y - 34], [470, y - 34], [470, y + 26], [160, y + 26]], "#3d4a3a", 10); // cooling shroud
  for (let i = 0; i < 7; i++) p.stroke([[190 + i * 40, y - 30], [190 + i * 40, y + 22]], 4, "#2b3529");
  p.line([[470, y - 4], [560, y - 4]], "#2b2b2b", 16);
  p.ell(260, y - 62, 80, 22, "#2f3a2d", 9); // pan magazine
  p.ell(260, y - 68, 26, 8, "#4c5a48", 0);
  p.rot = null;
};

/** wooden ammo crate with stencil */
export const crate = (p, o = {}) => {
  const { label = ".303" } = o;
  const pts = [[110, 700], [490, 700], [490, 975], [110, 975]];
  p.shadedFill(pts, "#9a7342", "#6e5130", rad(-120), 260, 0.5);
  p.poly(pts, null, 10);
  for (const yy of [770, 850, 930]) p.stroke([[118, yy], [482, yy]], 4, "#6e5130");
  p.poly([[110, 680], [490, 680], [490, 712], [110, 712]], "#86643a", 9);
  const g = p.g; g.save(); g.fillStyle = "#2a1f18"; g.font = "bold 74px Arial"; g.textAlign = "center"; g.fillText(label, 300, 868); g.restore();
};

/** white flag on a stick, design 600x1000 */
export const whiteFlag = (p, o = {}) => {
  const { t = 0 } = o;
  p.line([[200, 975], [200, 300]], "#7a5432", 18);
  const pts = [];
  for (let i = 0; i <= 10; i++) { const x = 200 + i * 30; pts.push([x, 310 + 14 * Math.sin(i * 0.8 + t * 6)]); }
  for (let i = 10; i >= 0; i--) { const x = 200 + i * 30; pts.push([x, 520 + 14 * Math.sin(i * 0.8 + t * 6 + 0.6) - i * 4]); }
  p.poly(pts, "#f6f3ea", 9);
};

/** placard with text */
export const placard = (p, o = {}) => {
  const { lines = ["SEND", "MACHINE", "GUNS!"] } = o;
  p.line([[300, 975], [300, 520]], "#7a5432", 20);
  const pts = [[40, 90], [560, 70], [570, 540], [50, 560]];
  p.poly(pts, "#efe4c8", 10);
  const g = p.g; g.save(); g.fillStyle = "#b8322c"; g.textAlign = "center"; g.font = "bold 96px Arial";
  lines.forEach((l, i) => g.fillText(l, 305, 215 + i * 140)); g.restore();
};

export const fxDust = (p, o = {}) => { fxPuff(p, o.t ?? 0.5); };
export const fxQuestion = (p, o = {}) => {
  const g = p.g; g.save(); g.font = "bold 420px Arial"; g.textAlign = "center"; g.lineWidth = 26; g.strokeStyle = INK; g.lineJoin = "round";
  g.strokeText("?", 300, 800); g.fillStyle = "#ffd34a"; g.fillText("?", 300, 800); g.restore();
};
export const fxSpeed = (p) => { for (let i = 0; i < 5; i++) p.stroke([[60, 300 + i * 110], [520 - (i % 2) * 120, 300 + i * 110]], 16, "#ffffff"); };
export const fxSpiral = (p, o = {}) => { const t = o.t || 0; for (let k = 0; k < 3; k++) { const a = t * 8 + k * 2.1; p.dot(300 + 150 * Math.cos(a), 300 + 50 * Math.sin(a), 30, "#ffd34a"); } };

export { bodyFront, bodySide, Pen };

/** History Beans mascot: bean-head historian in a bicorne, bust (design 600x1000; uses bodyFront then the hat on top) */
export const mascot = (p, o = {}) => {
  const out = { jacket: "#2f4d8a", pants: "#2a2a36", boots: "#2a2a36", skin: "#ffe2c2", buttons: "#e8c45a", sash: "#c0353a" };
  bodyFront(p, out, { mode: "stand", expr: o.expr || "grin", seed: 7, wave: o.wave });
  // bicorne
  const cx = 300, y = 205;
  const pts = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24, x = cx - 190 + 380 * t; pts.push([x, y + 20 - 30 * Math.sin(Math.PI * t) * 0.3]); }
  for (let i = 24; i >= 0; i--) { const t = i / 24, x = cx - 190 + 380 * t; pts.push([x, y + 10 - 120 * Math.sin(Math.PI * t) ** 0.8]); }
  p.poly(pts, "#22223a", 11);
  p.stroke([[cx - 170, y + 6], [cx + 170, y + 6]], 10, "#e8c45a");
  p.ell(cx + 70, y - 40, 26, 26, "#c0353a", 7); p.ell(cx + 70, y - 40, 13, 13, "#f6f3ea", 0);
};
