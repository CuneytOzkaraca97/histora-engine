import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { Pen, emu, lewis, crate, whiteFlag, placard, bodyFront, bodySide, fxQuestion, fxSpeed, fxSpiral } from "./cast.js";
import { fxPuff, fxCloud } from "./toon.js";
import { N, FPS, SHOTS, shotAt, camAt, dofAt, flashAt, LIGHTS, actorsAt, truckAt, groundH, HILL, eatenAt } from "./story.js";

const QP = new URLSearchParams(location.search); const W = +(QP.get("w") || 1080), H = +(QP.get("h") || 1920);
const INKC = new THREE.Color("#241726");
const canvas = document.createElement("canvas");
canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 900);
const rng = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

// ---------- toon materials ----------
const grad = (() => { const d = new Uint8Array([120, 200, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (color, map = null) => new THREE.MeshToonMaterial({ color: new THREE.Color(color), gradientMap: grad, map });
const ctex = (w, h, fn, rep = [1, 1]) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); fn(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 8; return t;
};
// ---------- painted textures ----------
const speck = (g, w, h, cols, n, r0, r1, seed = 7) => { const R = rng(seed); for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(R() * cols.length)]; const r = r0 + (r1 - r0) * R(); g.beginPath(); g.ellipse(R() * w, R() * h, r * 1.6, r, R() * 3, 0, 7); g.fill(); } };
const T_EARTH = ctex(512, 512, (g, w, h) => { g.fillStyle = "#b8703f"; g.fillRect(0, 0, w, h); speck(g, w, h, ["#a5603a", "#c98552", "#9a5634", "#d0935e"], 900, 3, 14); }, [240, 240]);
const T_WHEAT = ctex(512, 512, (g, w, h) => { g.fillStyle = "#e3b354"; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { g.fillStyle = y % 32 ? "#d6a145" : "#ecc566"; g.fillRect(0, y, w, 7); }
  speck(g, w, h, ["#f2d27a", "#c99038", "#e9be5c"], 700, 2, 8, 3); }, [24, 24]);
const T_STUBBLE = ctex(512, 512, (g, w, h) => { g.fillStyle = "#b98a4a"; g.fillRect(0, 0, w, h); speck(g, w, h, ["#a37838", "#cfa25c", "#8f6a35"], 900, 2, 7, 5); }, [6, 6]);
const T_ROAD = ctex(512, 128, (g, w, h) => { g.fillStyle = "#c99a68"; g.fillRect(0, 0, w, h);
  for (const y of [38, 90]) { g.fillStyle = "#b5865a"; g.fillRect(0, y, w, 12); } speck(g, w, h, ["#ad7d52", "#dcae7c", "#8f6a45"], 300, 2, 6, 9); }, [60, 1]);
const T_PLANK = ctex(256, 256, (g, w, h) => { g.fillStyle = "#efe2c4"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = "#c9b48e"; g.fillRect(0, y, w, 4); } }, [2, 1]);
const T_IRON = ctex(256, 64, (g, w, h) => { g.fillStyle = "#a9b0b4"; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = "#8a9196"; g.fillRect(x, 0, 6, h); g.fillStyle = "#c4cacd"; g.fillRect(x + 8, 0, 3, h); } }, [3, 1]);
const T_ROCK = ctex(128, 128, (g, w, h) => { g.fillStyle = "#9b6a4c"; g.fillRect(0, 0, w, h); speck(g, w, h, ["#7e5039", "#b17e5c"], 120, 3, 10, 2); });

// ---------- ink: clip-space inverted hull ----------
const inkMat = new THREE.ShaderMaterial({
  uniforms: { uW: { value: 2.6 }, uRes: { value: new THREE.Vector2(W, H) }, uCol: { value: INKC } },
  vertexShader: `uniform float uW; uniform vec2 uRes; varying float vFade;
    void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vec4 c = projectionMatrix*mv;
      vec3 n = normalize(normalMatrix*normal); vec2 nc = (projectionMatrix*vec4(n,0.0)).xy; float l=length(nc); nc = l>1e-5? nc/l : vec2(0.0);
      float d = -mv.z; vFade = 1.0 - smoothstep(140.0, 520.0, d);
      c.xy += nc * uW * vFade * 2.0 / uRes * c.w; c.z += 0.00002*c.w; gl_Position = c; }`,
  fragmentShader: `uniform vec3 uCol; void main(){ gl_FragColor = vec4(uCol,1.0); }`,
  side: THREE.BackSide,
});
const inkGeo = new Map();
const addInk = (mesh, w = 1) => {
  let g = inkGeo.get(mesh.geometry);
  if (!g) { const tmp = mesh.geometry.clone(); for (const k of Object.keys(tmp.attributes)) if (k !== "position") tmp.deleteAttribute(k); g = mergeVertices(tmp, 1e-3); g.computeVertexNormals(); inkGeo.set(mesh.geometry, g); }
  const o = new THREE.Mesh(g, w === 1 ? inkMat : inkMat.clone()); if (w !== 1) o.material.uniforms.uW.value = 2.6 * w;
  o.castShadow = false; o.receiveShadow = false; mesh.add(o); return mesh;
};
const M = (geo, mat, x, y, z, { ink = true, cast = true, recv = true, parent = scene } = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); if (ink) addInk(m); return m;
};

// ---------- sky ----------
const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunAmt: { value: 0 } },
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
  fragmentShader: `uniform vec3 top,hor,sunDir,sunCol; uniform float sunAmt; varying vec3 vP;
    void main(){ float h = clamp(vP.y*1.6,0.0,1.0); vec3 c = mix(hor, top, pow(h,0.7)); float s = max(dot(normalize(vP), normalize(sunDir)),0.0);
      c += sunCol * sunAmt * (smoothstep(0.9985,0.9992,s) + 0.35*pow(s,40.0)); gl_FragColor = vec4(c,1.0); }` });
const sky = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), skyMat); sky.renderOrder = -10; scene.add(sky);
scene.fog = new THREE.Fog(0xffffff, 60, 380);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight(0xffffff, 0x886644, 1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.5); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun); scene.add(sun.target);

// ---------- ground ----------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), toon("#ffffff", T_EARTH)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const field = new THREE.Mesh(new THREE.PlaneGeometry(110, 80), toon("#ffffff", T_WHEAT)); field.rotation.x = -Math.PI / 2; field.position.set(0, 0.012, -22); field.receiveShadow = true; scene.add(field);
const eatPatch = new THREE.Mesh(new THREE.CircleGeometry(1, 40), toon("#ffffff", T_STUBBLE)); eatPatch.rotation.x = -Math.PI / 2; eatPatch.position.set(-2, 0.02, -30); eatPatch.receiveShadow = true; eatPatch.scale.set(0.001, 0.001, 1); scene.add(eatPatch);
const road = new THREE.Mesh(new THREE.PlaneGeometry(700, 4.4), toon("#ffffff", T_ROAD)); road.rotation.x = -Math.PI / 2; road.position.set(60, 0.02, 12); road.receiveShadow = true; scene.add(road);
// farm track to the house
const track = new THREE.Mesh(new THREE.PlaneGeometry(3, 34), toon("#ffffff", T_ROAD)); track.rotation.x = -Math.PI / 2; track.position.set(-16, 0.015, -5); track.receiveShadow = true; scene.add(track);

// ---------- hills / mountains ----------
const hill = M(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), toon("#f2dfa8", T_WHEAT), HILL.x, 0, HILL.z, { ink: true });
hill.scale.set(HILL.R, HILL.H, HILL.R);
const hillCols = ["#a8834a", "#9a7c4c", "#b08a52", "#8f8a55"];
const R1 = rng(42);
for (let i = 0; i < 26; i++) {
  const a = (i / 26) * Math.PI * 2 + R1() * 0.2, d = 230 + 90 * R1();
  const h = M(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(hillCols[i % 4]), Math.cos(a) * d, 0, Math.sin(a) * d, { cast: false });
  h.scale.set(50 + 50 * R1(), 14 + 26 * R1(), 40 + 40 * R1());
}
for (let i = 0; i < 9; i++) { // nearer rolling hills behind farm
  const h = M(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(["#b7924f", "#9c8a52", "#c39a55"][i % 3]), -120 + i * 32 + 10 * R1(), 0, -130 - 30 * R1(), { cast: false });
  h.scale.set(30 + 20 * R1(), 8 + 8 * R1(), 22);
}

// ---------- gum trees ----------
const trunkMat = toon("#e8e1d6"), leafMats = [toon("#6f8f4a"), toon("#5f8044"), toon("#7d9a55")];
const gum = (x, z, s = 1, seed = 1) => {
  const R = rng(seed + 11), g = new THREE.Group(); g.position.set(x, groundH(x, z), z); g.scale.setScalar(s); scene.add(g);
  const tr = M(new THREE.CylinderGeometry(0.18, 0.32, 6, 8), trunkMat, 0, 3, 0, { parent: g }); tr.rotation.z = (R() - 0.5) * 0.15;
  const br = M(new THREE.CylinderGeometry(0.08, 0.14, 3, 6), trunkMat, 0.8, 5.5, 0, { parent: g }); br.rotation.z = -0.7;
  for (let i = 0; i < 5; i++) { const b = M(new THREE.IcosahedronGeometry(1.4 + R() * 0.8, 1), leafMats[i % 3], (R() - 0.5) * 3.4, 6.2 + R() * 2.2, (R() - 0.5) * 2.4, { parent: g }); b.scale.y = 0.62; }
  return g;
};
const R2 = rng(7);
[[-38, -40], [-30, -55], [34, -48], [42, -20], [-48, -8], [52, -60], [-8, -96], [24, -100], [-60, -70], [70, 0], [96, 30], [118, 4], [128, 26], [160, 30], [182, 2], [210, 28], [56, -14], [64, -30],
 [-22, 30], [12, 36], [-4, 24], [40, 30], [60, 22]].forEach(([x, z], i) => gum(x, z, 0.8 + R2() * 0.5, i));

// ---------- farmhouse ----------
const house = new THREE.Group(); house.position.set(-16, 0, -27); scene.add(house);
M(new THREE.BoxGeometry(9, 3.2, 6), toon("#ffffff", T_PLANK), 0, 1.6, 0, { parent: house });
const roofGeo = new THREE.CylinderGeometry(0.01, 5.6, 2.4, 4, 1); roofGeo.rotateY(Math.PI / 4); roofGeo.scale(1.25, 1, 0.85);
M(roofGeo, toon("#ffffff", T_IRON), 0, 4.4, 0, { parent: house });
const ver = M(new THREE.BoxGeometry(9.6, 0.14, 2.6), toon("#ffffff", T_IRON), 0, 2.9, 4.2, { parent: house }); ver.rotation.x = 0.12;
for (const x of [-4.5, -1.5, 1.5, 4.5]) M(new THREE.CylinderGeometry(0.09, 0.09, 2.9, 6), toon("#efe7d6"), x, 1.45, 5.3, { parent: house });
M(new THREE.BoxGeometry(1.1, 2.1, 0.12), toon("#2f6f6a"), 0, 1.05, 3.02, { parent: house });
for (const x of [-2.8, 2.8]) { M(new THREE.BoxGeometry(1.4, 1.1, 0.1), toon("#7fb3c9"), x, 1.9, 3.02, { parent: house }); M(new THREE.BoxGeometry(1.6, 0.12, 0.16), toon("#2f6f6a"), x, 2.5, 3.06, { parent: house }); }
M(new THREE.BoxGeometry(0.5, 1.6, 0.5), toon("#b5643f"), 2.6, 5.4, -1, { parent: house });
const tank = M(new THREE.CylinderGeometry(1.2, 1.2, 2.4, 20), toon("#ffffff", T_IRON), 6.2, 1.6, 1.0, { parent: house });
M(new THREE.ConeGeometry(1.3, 0.5, 20), toon("#9aa1a5"), 6.2, 3.05, 1.0, { parent: house });
M(new THREE.BoxGeometry(2.8, 0.4, 2.8), toon("#8a6a4a"), 6.2, 0.2, 1.0, { parent: house });

// ---------- windmill ----------
const mill = new THREE.Group(); mill.position.set(13, 0, -36); scene.add(mill);
const steel = toon("#8c8f94");
for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = M(new THREE.CylinderGeometry(0.07, 0.07, 9.4, 5), steel, dx * 0.6, 4.6, dz * 0.6, { parent: mill }); l.rotation.z = -dx * 0.12; l.rotation.x = dz * 0.12; }
for (const y of [2.5, 5, 7.2]) M(new THREE.TorusGeometry(0.95 - y * 0.07, 0.04, 4, 4), steel, 0, y, 0, { parent: mill }).rotation.x = Math.PI / 2;
const rotor = new THREE.Group(); rotor.position.set(0, 9.3, 0.5); mill.add(rotor);
const bladeMat = toon("#c9ccd0");
for (let i = 0; i < 16; i++) { const b = M(new THREE.BoxGeometry(0.28, 1.6, 0.03), bladeMat, 0, 0, 0, { parent: rotor }); b.geometry.translate(0, 1.0, 0); b.rotation.z = (i / 16) * Math.PI * 2; b.rotation.y = 0.35; }
M(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 10), toon("#c0392b"), 0, 0, 0, { parent: rotor }).rotation.x = Math.PI / 2;
const vane = M(new THREE.BoxGeometry(0.05, 0.9, 1.8), toon("#c0392b"), 0, 9.3, -1.6, { parent: mill });

// ---------- fences ----------
const postMat = toon("#7a5a3c");
const postGeo = new THREE.CylinderGeometry(0.07, 0.08, 1.2, 6);
const fenceLine = (x0, z0, x1, z1, step = 3) => {
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / step));
  for (let i = 0; i <= n; i++) M(postGeo, postMat, x0 + (x1 - x0) * i / n, 0.6, z0 + (z1 - z0) * i / n, { cast: true });
  for (const y of [0.55, 0.95]) { const len = Math.hypot(x1 - x0, z1 - z0), w = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 3), new THREE.MeshBasicMaterial({ color: 0x4a4048 }));
    w.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); w.rotation.z = Math.PI / 2; w.rotation.y = -Math.atan2(z1 - z0, x1 - x0); scene.add(w); }
};
fenceLine(-54, 9.4, 230, 9.4, 3.2); fenceLine(32, 17.6, 88, 17.6, 3.6); fenceLine(142, 17.6, 230, 17.6, 3.6);
fenceLine(-54, -62, -54, 9.4, 3.4); fenceLine(54, -62, 54, 9.4, 3.4);

// ---------- rocks for rough ground ----------
const R3 = rng(99), rockMat = toon("#ffffff", T_ROCK);
for (let i = 0; i < 70; i++) { const x = 92 + R3() * 50, z = 9.8 + R3() * 4.6; const r = M(new THREE.DodecahedronGeometry(0.12 + R3() * 0.28, 0), rockMat, x, 0.05, z, { cast: true }); r.scale.y = 0.6; r.rotation.y = R3() * 6; }
for (let i = 0; i < 40; i++) { const x = 92 + R3() * 60, z = (R3() < 0.5 ? 28 + R3() * 10 : -2 - R3() * 14); const r = M(new THREE.DodecahedronGeometry(0.3 + R3() * 0.7, 0), rockMat, x, 0.1, z); r.scale.y = 0.55; }
for (let i = 0; i < 30; i++) { const x = 40 + R3() * 50, z = -2 - R3() * 30; const r = M(new THREE.DodecahedronGeometry(0.2 + R3() * 0.5, 0), rockMat, x, 0.08, z); r.scale.y = 0.55; }
// saltbush clumps
const bushMat = [toon("#8aa070"), toon("#9caf7a")];
for (let i = 0; i < 120; i++) { const x = 30 + R3() * 200, z = (R3() < 0.5 ? 20 + R3() * 30 : -6 - R3() * 50); if (Math.abs(z - 12) < 4) continue; const b = M(new THREE.IcosahedronGeometry(0.5 + R3() * 0.6, 0), bushMat[i % 2], x, 0.25, z); b.scale.y = 0.6; }

// ---------- wheat instances ----------
const wheatGeo = new THREE.ConeGeometry(0.045, 1, 4); wheatGeo.translate(0, 0.5, 0);
const WN = 14000;
const wheat = new THREE.InstancedMesh(wheatGeo, toon("#ffffff"), WN); wheat.castShadow = false; wheat.receiveShadow = true; scene.add(wheat);
const wheatBase = [];
{ const R = rng(5), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let i = 0;
  while (i < WN) {
    let x, z;
    const zone = R();
    if (zone < 0.45) { x = -10 + 20 * R(); z = -6 + 9 * R(); }          // hero area around origin
    else if (zone < 0.8) { x = -12 + 20 * R(); z = -40 + 22 * R(); }    // S2 patch / S6 area
    else { x = -50 + 100 * R(); z = -60 + 66 * R(); }
    if (x > -1.4 && x < 2.4 && z > 0.9 && z < 6) continue;              // keep camera lane clear
    if (Math.abs(x - 0.5) < 0.6 && Math.abs(z) < 0.5) continue;         // emu feet
    if (x > -24 && x < -8 && z > -33) continue;                          // farmhouse yard + track
    if (z > 5) continue;
    const h = 0.5 + 0.35 * R();
    wheatBase.push({ x, z, h, rx: (R() - 0.5) * 0.3, rz: (R() - 0.5) * 0.3 });
    i++;
  }
  const col = new THREE.Color();
  wheatBase.forEach((w, k) => { col.set(["#f3d888", "#e8c470", "#fae2a0", "#dcb560"][k % 4]); wheat.setColorAt(k, col); });
}
const setWheat = (f) => {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const eat = eatenAt(f);
  wheatBase.forEach((w, k) => {
    let sc = 1;
    const d = Math.hypot(w.x + 2, (w.z + 30) * 1.2);
    if (eat > 0 && d < 9) sc = Math.max(0.12, 1 - Math.min(1, eat * 1.6 - (d / 9) * 0.6 + 0.1));
    const sway = 0.06 * Math.sin(f * 0.07 + w.x * 0.5 + w.z * 0.3);
    e.set(w.rx + sway, 0, w.rz); q.setFromEuler(e); s.set(1, w.h * sc, 1); p.set(w.x, 0, w.z);
    m.compose(p, q, s); wheat.setMatrixAt(k, m);
  });
  wheat.instanceMatrix.needsUpdate = true;
  const r = 9 * Math.min(1, eat * 1.3); eatPatch.scale.set(Math.max(0.001, r), Math.max(0.001, r * 0.8), 1);
};

// ---------- truck (1930s army lorry) ----------
const truck = new THREE.Group(); scene.add(truck);
const truckBody = new THREE.Group(); truck.add(truckBody);
const drab = toon("#6e6b3c"), drabDk = toon("#55522e"), tyre = toon("#2a2628"), hub = toon("#8c8a70"), wood = toon("#8a6a44");
M(new THREE.BoxGeometry(1.6, 1.25, 1.9), drab, 1.2, 1.55, 0, { parent: truckBody });          // cab
M(new THREE.BoxGeometry(1.6, 0.12, 2.0), drabDk, 1.2, 2.24, 0, { parent: truckBody });        // cab roof
M(new THREE.BoxGeometry(1.5, 0.9, 1.4), drab, 2.6, 1.3, 0, { parent: truckBody });            // bonnet
M(new THREE.BoxGeometry(0.12, 0.9, 1.3), toon("#3a3826"), 3.37, 1.3, 0, { parent: truckBody }); // grille
for (const z of [-0.5, 0.5]) M(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 12), toon("#f2e7b5"), 3.42, 1.55, z, { parent: truckBody }).rotation.z = Math.PI / 2;
M(new THREE.BoxGeometry(0.9, 0.55, 0.05), toon("#9fc3d2"), 1.85, 1.75, 0.95, { parent: truckBody, ink: false });
M(new THREE.BoxGeometry(3.2, 0.18, 2.1), wood, -1.2, BED_Y_W(), 0, { parent: truckBody });     // bed floor
for (const z of [-1.02, 1.02]) M(new THREE.BoxGeometry(3.2, 0.5, 0.08), wood, -1.2, 1.4, z, { parent: truckBody });
M(new THREE.BoxGeometry(0.08, 0.5, 2.1), wood, -2.8, 1.4, 0, { parent: truckBody });
for (const [x, z] of [[2.55, 0.95], [2.55, -0.95], [-1.9, 0.95], [-1.9, -0.95]]) { const fg = M(new THREE.CylinderGeometry(0.55, 0.55, 0.36, 14, 1, false, 0, Math.PI), drabDk, x, 0.6, z, { parent: truckBody }); fg.rotation.x = Math.PI / 2; fg.rotation.z = Math.PI / 2; fg.rotation.y = 0; }
function BED_Y_W() { return 1.06; }
const wheels = [];
for (const [x, z] of [[2.55, 0.95], [2.55, -0.95], [-1.9, 0.95], [-1.9, -0.95]]) {
  const w = new THREE.Group(); w.position.set(x, 0.45, z); truck.add(w);
  const t = M(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 18), tyre, 0, 0, 0, { parent: w }); t.rotation.x = Math.PI / 2;
  const h = M(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 8), hub, 0, 0, 0, { parent: w, ink: false }); h.rotation.x = Math.PI / 2;
  const sp = M(new THREE.BoxGeometry(0.06, 0.38, 0.33), hub, 0, 0, 0, { parent: w, ink: false });
  wheels.push(w);
}
const applyTruck = (f) => {
  const s = truckAt(f); truck.position.set(s.x, 0, s.z); truck.rotation.y = s.yaw;
  truckBody.position.y = s.y; truckBody.rotation.z = s.pitch; truckBody.rotation.x = s.roll;
  for (const w of wheels) w.rotation.z = -s.wheel;
};

// ---------- clouds ----------
const clouds = [];
{ const R = rng(3);
  for (let i = 0; i < 14; i++) {
    const c = document.createElement("canvas"); c.width = 600; c.height = 1000; const p = new Pen(c.getContext("2d")); fxCloud(p, 10 + i);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false }));
    const a = R() * Math.PI * 2, d = 380 + R() * 120; m.position.set(Math.cos(a) * d, 45 + R() * 40, Math.sin(a) * d); m.scale.set(80 + R() * 40, 133 + R() * 66, 1);
    m.renderOrder = -5; scene.add(m); clouds.push(m);
  }
}

// ---------- cards ----------
const SOLE = 0.025;
const cardGeo = new THREE.PlaneGeometry(1, 1); cardGeo.translate(0, 0.5 - SOLE, 0);
const blobTex = ctex(128, 64, (g, w, h) => { const gr = g.createRadialGradient(64, 32, 4, 64, 32, 62); gr.addColorStop(0, "rgba(40,20,30,0.55)"); gr.addColorStop(1, "rgba(40,20,30,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const blobGeo = new THREE.PlaneGeometry(1, 1); blobGeo.rotateX(-Math.PI / 2);
const pool = new Map(); let frameNo = 0;
const getTex = (key, cw, ch, dw, dh, draw) => {
  const k = `${cw}|${key}`; let e = pool.get(k);
  if (!e) {
    const c = document.createElement("canvas"); c.width = cw; c.height = ch; const g = c.getContext("2d");
    g.setTransform(cw / dw, 0, 0, ch / dh, 0, 0); g.lineJoin = "round"; g.lineCap = "round";
    draw(new Pen(g));
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
    e = { t, used: 0 }; pool.set(k, e);
  }
  e.used = frameNo;
  return e.t;
};
const evict = () => { if (pool.size < 260) return; for (const [k, e] of pool) if (frameNo - e.used > 2) { e.t.dispose(); pool.delete(k); } };
const cardMeshes = []; const blobMeshes = [];
const cardMat = () => new THREE.MeshBasicMaterial({ alphaTest: 0.5, side: THREE.DoubleSide, fog: true });
const shadowMat = () => new THREE.MeshBasicMaterial({ alphaTest: 0.5, side: THREE.DoubleSide });
const getCard = (i) => {
  while (cardMeshes.length <= i) {
    const m = new THREE.Mesh(cardGeo, cardMat()); m.castShadow = true; m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: 0.5 }); scene.add(m); cardMeshes.push(m);
    const b = new THREE.Mesh(blobGeo, new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); b.renderOrder = 1; scene.add(b); blobMeshes.push(b);
  }
  return cardMeshes[i];
};
const q = (v, s = 0.05) => Math.round(v / s) * s;
const keyOf = (o) => JSON.stringify(o, (k, v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v));
const SPEC = {
  human: { dw: 600, dh: 1000, mpu: 0.0023 },
  emu: { dw: 800, dh: 1000, mpu: 0.00185 },
  lewis: { dw: 600, dh: 1000, mpu: 0.0026 },
  crate: { dw: 600, dh: 1000, mpu: 0.0016 },
  flag: { dw: 600, dh: 1000, mpu: 0.0034 },
  placard: { dw: 600, dh: 1000, mpu: 0.0021 },
};
const drawFor = (a) => {
  if (a.kind === "emu") { const o = { ...a.opts, phase: q(a.opts.phase ?? 0, 1 / 12), peck: q(a.opts.peck ?? 0, 0.04), look: q(a.opts.look ?? 0, 0.1), blink: a.opts.blink ?? 0 };
    return { spec: SPEC.emu, key: "emu" + keyOf(o), draw: (p) => emu(p, o) }; }
  if (a.kind === "human") { const o = { ...a.opts, phase: q(a.opts.phase ?? 0, 1 / 12), wave: a.opts.wave === undefined ? undefined : q(a.opts.wave, 0.05), headTilt: q(a.opts.headTilt ?? 0, 1), tilt: q(a.opts.tilt ?? 0, 1) };
    const side = a.opts.mode === "march";
    return { spec: SPEC.human, key: "hu" + keyOf(a.o) + keyOf(o), draw: (p) => (side ? bodySide(p, a.o, o) : bodyFront(p, a.o, o)) }; }
  if (a.kind === "prop") {
    const o = { ...a.opts, t: q(a.opts.t ?? 0, 0.1), tilt: q(a.opts.tilt ?? 0, 1) };
    const fn = { lewis, crate, flag: whiteFlag, placard }[a.type];
    return { spec: SPEC[a.type], key: a.type + keyOf(o), draw: (p) => fn(p, o) };
  }
  if (a.kind === "fx") {
    const o = { ...a.opts, t: q(a.opts.t ?? 0, 0.05) };
    const fn = { dust: (p) => fxPuff(p, o.t), question: (p) => fxQuestion(p, o), speed: (p) => fxSpeed(p, o), spiral: (p) => fxSpiral(p, o) }[a.type];
    return { spec: { dw: 600, dh: 1000, mpu: (a.size || 1) / 1000 * 1.6 }, key: "fx" + a.type + keyOf(o), draw: fn, fx: true };
  }
};
let cardTint = new THREE.Color(1, 1, 1);
const placeCards = (f, actors) => {
  const cp = camera.position, fovK = 2 * Math.tan((camera.fov * Math.PI) / 360);
  let i = 0;
  for (const a of actors) {
    const d = drawFor(a); if (!d) continue;
    const m = getCard(i), b = blobMeshes[i]; i++;
    const hM = d.spec.dh * d.spec.mpu, wM = d.spec.dw * d.spec.mpu;
    const dist = Math.max(0.5, Math.hypot(a.x - cp.x, (a.y || 0) + hM * 0.5 - cp.y, a.z - cp.z));
    const px = (hM / (dist * fovK)) * H;
    const ch = px > 1100 ? 1600 : px > 600 ? 1000 : px > 260 ? 560 : 300;
    const cw = Math.round(ch * d.spec.dw / d.spec.dh);
    m.material.map = getTex(d.key, cw, ch, d.spec.dw, d.spec.dh, d.draw); m.material.needsUpdate = m.material.map !== m.userData.lastMap; m.userData.lastMap = m.material.map;
    m.customDepthMaterial.map = m.material.map; m.customDepthMaterial.needsUpdate = m.material.needsUpdate;
    m.material.color.copy(d.fx ? new THREE.Color(1, 1, 1) : cardTint);
    m.material.transparent = !!d.fx; m.material.alphaTest = d.fx ? 0.02 : 0.5; m.material.depthWrite = !d.fx;
    m.castShadow = !d.fx;
    const sy = a.sy ?? 1;
    m.scale.set(wM * (a.flip ? -1 : 1) * (2 - sy), hM * sy, 1);
    m.position.set(a.x, (a.y || 0) + (a.bob || 0), a.z);
    m.rotation.set(0, Math.atan2(cp.x - a.x, cp.z - a.z), 0);
    m.visible = true;
    const showBlob = !d.fx && a.type !== "flag";
    b.visible = showBlob; if (showBlob) { const ground = groundH(a.x, a.z); const lift = Math.max(0, (a.y || 0) - ground); const sc = (a.kind === "emu" ? 1.1 : a.kind === "human" ? 0.75 : 0.9) / (1 + lift * 0.8);
      b.position.set(a.x, ground + 0.03, a.z); b.scale.set(sc * 1.6, 1, sc * 0.8); b.material.opacity = 1 / (1 + lift); }
  }
  for (; i < cardMeshes.length; i++) { cardMeshes[i].visible = false; blobMeshes[i].visible = false; }
};

// ---------- render targets + post ----------
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
rt.depthTexture = new THREE.DepthTexture(W, H); rt.depthTexture.type = THREE.UnsignedIntType;
const rtResolve = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
rtResolve.depthTexture = new THREE.DepthTexture(W, H); rtResolve.depthTexture.type = THREE.UnsignedIntType;
const post = new THREE.ShaderMaterial({
  uniforms: { tC: { value: null }, tD: { value: null }, near: { value: 0.1 }, far: { value: 900 }, focus: { value: 5 }, blur: { value: 0 }, res: { value: new THREE.Vector2(W, H) },
    sat: { value: 1.1 }, gain: { value: 1 }, lift: { value: 0 }, vign: { value: 0.25 }, flash: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.0,1.0); }`,
  fragmentShader: `uniform sampler2D tC,tD; uniform float near,far,focus,blur,sat,gain,lift,vign,flash; uniform vec2 res; varying vec2 vUv;
    float lin(float d){ float z = d*2.0-1.0; return 2.0*near*far/(far+near-z*(far-near)); }
    float coc(float z){ return blur * clamp(abs(z-focus)/max(z,0.01) * 1.6, 0.0, 1.0); }
    vec3 srgb(vec3 c){ c = max(c, 0.0); return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4))-0.055, step(0.0031308, c)); }
    void main(){
      vec3 col = texture2D(tC, vUv).rgb; float z = lin(texture2D(tD, vUv).r); float c0 = coc(z);
      if (blur > 0.0 && c0 > 0.6) {
        vec3 acc = col; float wsum = 1.0;
        for (int i=0;i<24;i++){ float a = float(i)*2.39996; float r = sqrt((float(i)+0.5)/24.0);
          vec2 o = vec2(cos(a),sin(a))*r*c0/res; float zs = lin(texture2D(tD, vUv+o).r); float cs = coc(zs);
          float w = (zs < z - 0.05) ? step(r*c0, cs+0.5) : 1.0; acc += texture2D(tC, vUv+o).rgb*w; wsum += w; }
        col = acc/wsum;
      }
      float l = dot(col, vec3(0.2126,0.7152,0.0722)); col = mix(vec3(l), col, sat); col = col*gain + lift;
      vec2 v = vUv-0.5; v.x *= 0.75; col *= 1.0 - vign*smoothstep(0.25, 0.75, length(v));
      col = mix(col, vec3(1.0), flash);
      gl_FragColor = vec4(srgb(col),1.0); }`,
  depthTest: false, depthWrite: false,
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post); const postScene = new THREE.Scene(); postScene.add(quad); const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// ---------- light presets ----------
const applyLight = (name, focusPt) => {
  const L = LIGHTS[name];
  skyMat.uniforms.top.value.set(L.skyTop); skyMat.uniforms.hor.value.set(L.skyHor);
  const az = (L.az * Math.PI) / 180, el = (L.el * Math.PI) / 180;
  const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  if (name === "golden") dir.set(Math.cos(el), Math.sin(el), -0.08).normalize();
  skyMat.uniforms.sunDir.value.copy(dir); skyMat.uniforms.sunCol.value.set(L.sun); skyMat.uniforms.sunAmt.value = name === "night" ? 0.5 : name === "golden" ? 1.0 : 0.35;
  hemi.color.set(L.hemiSky); hemi.groundColor.set(L.hemiGround); hemi.intensity = L.hemiI;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  sun.position.copy(focusPt).addScaledVector(dir, 60); sun.target.position.copy(focusPt);
  const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  cardTint = new THREE.Color(L.card);
  post.uniforms.sat.value = L.sat; post.uniforms.gain.value = L.gain; post.uniforms.lift.value = L.lift; post.uniforms.vign.value = L.vign;
};

// ---------- frame ----------
window.renderFrame = (f, ov = null) => {
  frameNo = f;
  const s = shotAt(f), c = ov ? ov.cam : camAt(f);
  camera.position.set(...c.pos); camera.fov = c.fov; camera.up.set(0, 1, 0); camera.lookAt(...c.tgt);
  camera.rotateZ((c.roll * Math.PI) / 180); camera.updateProjectionMatrix();
  sky.position.copy(camera.position);
  const tg = new THREE.Vector3(...c.tgt);
  applyLight(s.light, tg);
  setWheat(f); applyTruck(f);
  rotor.rotation.z = -f * 0.12;
  truck.visible = ["S4", "S5", "S7", "S8a", "S9"].includes(s.id);
  for (const cl of clouds) cl.lookAt(camera.position);
  placeCards(f, ov && ov.actors ? ov.actors(actorsAt(f)) : actorsAt(f)); evict();
  const dof = ov ? ov.dof : dofAt(f);
  post.uniforms.focus.value = dof.focus; post.uniforms.blur.value = dof.blur; post.uniforms.flash.value = flashAt(f);
  renderer.setRenderTarget(rt); renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.copyFramebufferToTexture; // noop
  post.uniforms.tC.value = rt.texture; post.uniforms.tD.value = rt.depthTexture;
  renderer.render(postScene, postCam);
  return true;
};
window.ready = true;
