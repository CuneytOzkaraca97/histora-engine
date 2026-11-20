// Era characters for History Beans channel art: bodyFront + headgear overlays drawn in the same flat ink style.
import { Pen, bodyFront } from "./toon.js";
export const INKC = "#241726";
// head geometry for default build (design 600x1000): cx 300, top 174, bottom 370, half-width 107
const H = { cx: 300, top: 174, bot: 370, hw: 107 };
const shape = (g, pts, fill, lw = 10) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INKC; g.lineJoin = "round"; g.stroke(); } };
const ell = (g, x, y, rx, ry, fill, lw = 10, a0 = 0, a1 = Math.PI * 2) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, a0, a1); if (a1 - a0 < 6.2) g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INKC; g.stroke(); } };
const dome = (g, y0, y1, hw, fill, lw = 10) => { g.beginPath(); g.moveTo(H.cx - hw, y1); g.bezierCurveTo(H.cx - hw, y0 - 10, H.cx + hw, y0 - 10, H.cx + hw, y1); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = INKC; g.stroke(); };

export const ERAS = {
  roman: { name: "Rome", year: "50 BC", out: { jacket: "#b5402f", pants: "#ffe2c2", boots: "#7a5432", belt: "#c9a24a", skin: "#ffe2c2" },
    hat(g) { // galea with crest + cheek guards
      g.save(); g.lineCap = "round";
      shape(g, [[H.cx - 112, 240], [H.cx - 100, 330], [H.cx - 70, 320], [H.cx - 80, 240]], "#c9a24a");
      shape(g, [[H.cx + 112, 240], [H.cx + 100, 330], [H.cx + 70, 320], [H.cx + 80, 240]], "#c9a24a");
      dome(g, 150, 245, 118, "#c9a24a");
      shape(g, [[H.cx - 122, 238], [H.cx + 122, 238], [H.cx + 122, 256], [H.cx - 122, 256]], "#a8822f", 8);
      g.beginPath(); g.moveTo(H.cx - 95, 160); g.bezierCurveTo(H.cx - 60, 40, H.cx + 60, 40, H.cx + 95, 160);
      g.lineTo(H.cx + 60, 165); g.bezierCurveTo(H.cx + 40, 95, H.cx - 40, 95, H.cx - 60, 165); g.closePath();
      g.fillStyle = "#c8342c"; g.fill(); g.lineWidth = 10; g.strokeStyle = INKC; g.stroke(); g.restore(); } },
  pharaoh: { name: "Egypt", year: "1300 BC", out: { jacket: "#f2ead6", pants: "#f2ead6", boots: "#c9a24a", skin: "#d9a074", belt: "#c9a24a" },
    hat(g) { // nemes headcloth
      const stripes = (pts) => { g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
        for (let y = 100; y < 520; y += 34) { g.fillStyle = (y / 34) % 2 < 1 ? "#2f5fa8" : "#e8c45a"; g.fillRect(100, y, 400, 17); g.fillStyle = (y / 34) % 2 < 1 ? "#e8c45a" : "#2f5fa8"; g.fillRect(100, y + 17, 400, 17); } g.restore();
        shape(g, pts, null, 10); };
      stripes([[H.cx - 110, 230], [H.cx - 165, 470], [H.cx - 105, 470], [H.cx - 92, 300]]);
      stripes([[H.cx + 110, 230], [H.cx + 165, 470], [H.cx + 105, 470], [H.cx + 92, 300]]);
      g.save(); g.beginPath(); g.moveTo(H.cx - 118, 250); g.bezierCurveTo(H.cx - 118, 120, H.cx + 118, 120, H.cx + 118, 250); g.closePath(); g.clip();
      for (let y = 120; y < 260; y += 26) { g.fillStyle = "#2f5fa8"; g.fillRect(150, y, 300, 13); g.fillStyle = "#e8c45a"; g.fillRect(150, y + 13, 300, 13); } g.restore();
      g.beginPath(); g.moveTo(H.cx - 118, 250); g.bezierCurveTo(H.cx - 118, 120, H.cx + 118, 120, H.cx + 118, 250); g.closePath(); g.lineWidth = 10; g.strokeStyle = INKC; g.stroke();
      shape(g, [[H.cx - 120, 236], [H.cx + 120, 236], [H.cx + 120, 254], [H.cx - 120, 254]], "#e8c45a", 8);
      ell(g, H.cx, 205, 13, 20, "#e8c45a", 7); // uraeus
    },
    over(g) { ell(g, H.cx, 400, 120, 60, "#2f8f86", 9, 0, Math.PI); ell(g, H.cx, 400, 80, 35, "#e8c45a", 0, 0, Math.PI); } },
  knight: { name: "Middle Ages", year: "1350", out: { jacket: "#9aa3ab", pants: "#7d858c", boots: "#5b6168", skin: "#ffe2c2", belt: "#5b4632" },
    hat(g) { // bascinet + mail
      g.save(); g.beginPath(); g.moveTo(H.cx - 125, 240); g.lineTo(H.cx - 125, 400); g.bezierCurveTo(H.cx - 60, 430, H.cx + 60, 430, H.cx + 125, 400); g.lineTo(H.cx + 125, 240);
      g.lineTo(H.cx + 92, 240); g.lineTo(H.cx + 92, 330); g.bezierCurveTo(H.cx + 60, 385, H.cx - 60, 385, H.cx - 92, 330); g.lineTo(H.cx - 92, 240); g.closePath();
      g.fillStyle = "#b8bec4"; g.fill(); g.lineWidth = 10; g.strokeStyle = INKC; g.stroke(); g.clip();
      g.strokeStyle = "#8a9299"; g.lineWidth = 3; for (let y = 240; y < 440; y += 14) for (let x = 170; x < 440; x += 14) { g.beginPath(); g.arc(x + (y % 28 ? 7 : 0), y, 5, 0, 7); g.stroke(); } g.restore();
      g.beginPath(); g.moveTo(H.cx - 120, 250); g.bezierCurveTo(H.cx - 120, 150, H.cx - 30, 100, H.cx, 80); g.bezierCurveTo(H.cx + 30, 100, H.cx + 120, 150, H.cx + 120, 250); g.closePath();
      g.fillStyle = "#c9cfd4"; g.fill(); g.lineWidth = 10; g.strokeStyle = INKC; g.stroke();
      g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.beginPath(); g.moveTo(H.cx - 70, 200); g.quadraticCurveTo(H.cx - 60, 150, H.cx - 25, 125); g.stroke(); },
    over(g) { shape(g, [[H.cx - 70, 430], [H.cx + 70, 430], [H.cx + 70, 600], [H.cx - 70, 600]], "#f6f3ea", 8); shape(g, [[H.cx - 12, 440], [H.cx + 12, 440], [H.cx + 12, 592], [H.cx - 12, 592]], "#c8342c", 0); shape(g, [[H.cx - 62, 500], [H.cx + 62, 500], [H.cx + 62, 524], [H.cx - 62, 524]], "#c8342c", 0); } },
  viking: { name: "Vikings", year: "900", out: { jacket: "#5d7a4a", pants: "#7a5a3a", boots: "#4a3426", skin: "#f5c9a0", belt: "#3a2a1e" },
    hat(g) {
      g.beginPath(); g.moveTo(H.cx - 105, 330); g.bezierCurveTo(H.cx - 110, 480, H.cx + 110, 480, H.cx + 105, 330); g.bezierCurveTo(H.cx + 50, 360, H.cx - 50, 360, H.cx - 105, 330);
      g.fillStyle = "#d9802e"; g.fill(); g.lineWidth = 10; g.strokeStyle = INKC; g.stroke();
      g.strokeStyle = "#b8661f"; g.lineWidth = 6; for (const dx of [-50, 0, 50]) { g.beginPath(); g.moveTo(H.cx + dx, 370); g.lineTo(H.cx + dx * 0.8, 440); g.stroke(); }
      dome(g, 140, 240, 116, "#8d949a");
      shape(g, [[H.cx - 120, 228], [H.cx + 120, 228], [H.cx + 120, 248], [H.cx - 120, 248]], "#6d6f73", 8);
      shape(g, [[H.cx - 10, 248], [H.cx + 10, 248], [H.cx + 8, 300], [H.cx - 8, 300]], "#6d6f73", 7);
      shape(g, [[H.cx - 8, 150], [H.cx + 8, 150], [H.cx + 8, 228], [H.cx - 8, 228]], "#6d6f73", 6); } },
  explorer: { name: "Explorers", year: "1890", out: { jacket: "#c9b07a", pants: "#a8935f", boots: "#5a3a22", skin: "#ecd0b6", belt: "#6b4a2a", buttons: "#7a5a32", moustache: "#5a3a22" },
    hat(g) { ell(g, H.cx, 222, 175, 34, "#e8dcb8", 10); dome(g, 110, 225, 112, "#efe4c6"); shape(g, [[H.cx - 112, 196], [H.cx + 112, 196], [H.cx + 112, 214], [H.cx - 112, 214]], "#7a5a32", 7); } },
  napoleon: { name: "Napoleonic Wars", year: "1805", out: { jacket: "#2f4d8a", pants: "#efe7d6", boots: "#22222a", skin: "#ffe2c2", buttons: "#e8c45a", sash: "#c0353a" },
    hat(g) { const cx = 300, y = 205; g.beginPath();
      for (let i = 0; i <= 24; i++) { const t = i / 24; g.lineTo(cx - 190 + 380 * t, y + 20 - 9 * Math.sin(Math.PI * t)); }
      for (let i = 24; i >= 0; i--) { const t = i / 24; g.lineTo(cx - 190 + 380 * t, y + 10 - 120 * Math.sin(Math.PI * t) ** 0.8); }
      g.closePath(); g.fillStyle = "#22223a"; g.fill(); g.lineWidth = 11; g.strokeStyle = INKC; g.stroke();
      g.strokeStyle = "#e8c45a"; g.lineWidth = 10; g.beginPath(); g.moveTo(cx - 170, y + 6); g.lineTo(cx + 170, y + 6); g.stroke();
      ell(g, cx + 70, y - 40, 26, 26, "#c0353a", 7); ell(g, cx + 70, y - 40, 13, 13, "#f6f3ea", 0); } },
  ww1: { name: "World War I", year: "1916", out: { jacket: "#9b8a5a", pants: "#7c6f4a", boots: "#4a3426", hat: "slouch", cap: "#8f7a50", upbrim: true, belt: "#6b5a3a", buttons: "#c9b46a", skin: "#f5c9a0" } },
};
export const ORDER = ["pharaoh", "roman", "viking", "knight", "napoleon", "explorer", "ww1"];

/** draw era character in design space 600x1000 */
export const drawEra = (g, key, o = {}) => {
  const e = ERAS[key]; const p = new Pen(g); g.lineJoin = "round"; g.lineCap = "round";
  bodyFront(p, e.out, { mode: "stand", expr: o.expr || "grin", seed: o.seed ?? 7, wave: o.wave, blink: 0 });
  if (e.over) e.over(g);
  if (e.hat) e.hat(g);
};
