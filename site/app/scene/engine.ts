/**
 * The hero scene: a Stanford bunny mid-reconstruction.
 *
 * A sweep plane travels up the model and converts one representation into the
 * next — point cloud, then surfaced mesh, then voxels, then back. The form
 * being replaced sits above the sweep, the new one is built below it, so no
 * pass ever cuts. That is how the real bunny was made (range scans, 1994) and
 * what the site's subject does for a living.
 *
 * Loaded dynamically by scene-canvas.tsx, so three.js never lands in the
 * first-paint bundle.
 */
import * as THREE from 'three';

export type ViewMode = 'home' | 'page';

export interface HeroScene {
  setView(mode: ViewMode): void;
  setTheme(isLight: boolean): void;
  dispose(): void;
}

/* ----------------------------- tuning ---------------------------------- */

const SCALE = 1.95;
const MODEL_HEIGHT = 0.986;

// Framing solved against the real projected vertex bounds rather than guessed.
// Both values must react to window shape: the projected width scales as
// 1/aspect while a fixed offset does not, so constants clip on short windows.
const HOME_DIST = 4.15;
const HOME_X = 0.62;
const PAGE_DIST = 1.55;
const PAGE_X = 0.34;
const NARROW_DIST = 6.0; // portrait viewports are width-bound, not height-bound
const NARROW_PX = 720;

const U = {
  wireWidth: 1.6,
  glow: 0.95,
  fresnelPow: 3.0,
  ghost: 0.14,
  fillOpacity: 0.94,
  pointSize: 3.4,
  voxEdge: 0.14,
  scanBand: 0.065,
  gridOpacity: 0.16,
};

const SCAN_SPEED = { home: 0.14, page: 0.055 };
const ORBIT_SPEED = { home: 0.11, page: 0.02 };

const PALETTE = {
  dark: { clear: 0x07070a, fillA: 0x08131b, fillB: 0x123a47, band: 0xcffafe, grid: 0x1b3743 },
  light: { clear: 0xf7f9f8, fillA: 0xffffff, fillB: 0xdaeaf2, band: 0x083344, grid: 0xb4cad6 },
};
const ACCENT = { dark: '#67e8f9', light: '#0e7490' };

const MODES = ['points', 'mesh', 'voxel'] as const;
type Mode = (typeof MODES)[number];

/* ----------------------------- shaders --------------------------------- */
// Written in GLSL1 style; three's GLSL3 compatibility defines map attribute/
// varying/fragColor, and GLSL3 gives us fwidth() as core rather than via an
// extension directive.

const COMMON = /* glsl */ `
  // three's GLSL3 path maps attribute/varying for us but declares no fragment
  // output and no fragColor define, so the shader owns its own out variable.
  out vec4 fragColor;

  uniform float uScanY, uScanBand, uScanOn;
  // uRole: 1 incoming (built below the sweep), -1 outgoing (erased below it),
  // 0 absent from this pass.
  uniform float uRole;
  varying float vY;

  float recon() {
    if (uScanOn < 0.5) return 1.0;
    return 1.0 - smoothstep(uScanY - uScanBand, uScanY + uScanBand, vY);
  }
  float presence() {
    if (uScanOn < 0.5) return uRole > 0.5 ? 1.0 : 0.0;
    float r = recon();
    if (uRole >  0.5) return r;
    if (uRole < -0.5) return 1.0 - r;
    return 0.0;
  }
  bool incoming() { return uRole > 0.5; }
  // ramps the pre-scan ghost up from nothing so a new pass cannot pop in
  float ghostFade() { return smoothstep(-0.12, 0.18, uScanY); }
  float sweepBand() {
    if (uScanOn < 0.5) return 0.0;
    float d = (vY - uScanY) / max(uScanBand, 1e-4);
    return exp(-d * d * 2.2);
  }
`;

const VERT = /* glsl */ `
  attribute vec3 bary;
  varying vec3 vBary; varying vec3 vNrm; varying vec3 vView; varying float vY;
  void main() {
    vBary = bary;
    vY = position.y;                      // local height: the sweep ignores orbit
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNrm  = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const WIRE_FRAG = /* glsl */ `
  uniform vec3 uWire, uBand;
  uniform float uWireWidth, uGlow, uFresnelPow, uGhost, uLight;
  varying vec3 vBary; varying vec3 vNrm; varying vec3 vView;
  ${COMMON}
  // Barycentric wireframe: real antialiased edges at any zoom. lineWidth is
  // ignored by browsers, so drawing actual lines is not an option.
  float edgeFactor(vec3 b, float w) {
    vec3 d = fwidth(b);
    vec3 a = smoothstep(vec3(0.0), d * w, b);
    return min(min(a.x, a.y), a.z);
  }
  void main() {
    if (abs(uRole) < 0.5) discard;
    float core = 1.0 - edgeFactor(vBary, uWireWidth);
    float halo = 1.0 - edgeFactor(vBary, uWireWidth * 4.0);
    float fres = pow(1.0 - abs(dot(normalize(vNrm), normalize(vView))), uFresnelPow);
    float p    = presence();
    float band = sweepBand();
    float g    = incoming() ? uGhost * ghostFade() : 0.0;
    float vis  = mix(g, 1.0, p);
    float w    = core * vis + halo * 0.26 * vis * uGlow + band * 1.15;
    vec3  col  = mix(uWire, uBand, clamp(band, 0.0, 1.0));
    if (uLight < 0.5) {
      col += uWire * fres * 0.75 * uGlow;
      fragColor = vec4(col * w, w);          // additive
    } else {
      col = mix(col, uBand, fres * 0.35);        // blueprint: densify the rim
      fragColor = vec4(col, clamp(w, 0.0, 1.0));
    }
  }
`;

const FILL_FRAG = /* glsl */ `
  uniform vec3 uFillA, uFillB;
  uniform float uFillOpacity, uLight;
  varying vec3 vNrm; varying vec3 vView;
  ${COMMON}
  void main() {
    if (abs(uRole) < 0.5) discard;
    float a = uFillOpacity * presence();
    if (a < 0.02) discard;                       // let the other form through
    vec3 L = normalize(vec3(0.35, 0.85, 0.55));
    float ndl = max(dot(normalize(vNrm), L), 0.0);
    float fres = pow(1.0 - abs(dot(normalize(vNrm), normalize(vView))), 2.0);
    fragColor = vec4(mix(uFillA, uFillB, ndl * 0.85 + fres * 0.25), a);
  }
`;

const PT_VERT = /* glsl */ `
  uniform float uPointSize, uScale;
  varying float vY;
  void main() {
    vY = position.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // uPointSize is a pixel diameter at nominal distance; 0.01 puts it in world
    // units so uScale (half the viewport height, in px) attenuates it correctly.
    gl_PointSize = max(uPointSize * 0.01 * (uScale / max(-mv.z, 0.001)), 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const PT_FRAG = /* glsl */ `
  uniform vec3 uWire, uBand;
  uniform float uLight;
  ${COMMON}
  void main() {
    if (abs(uRole) < 0.5) discard;
    vec2 q = gl_PointCoord - 0.5;
    float r = dot(q, q);
    if (r > 0.25) discard;
    float soft = 1.0 - smoothstep(0.04, 0.25, r);
    float p    = presence();
    float band = sweepBand();
    // Kept low: 36k additive points otherwise accumulate to white and the cloud
    // loses the accent hue. Density is the brightness control here.
    float a = p * 0.55 + band * 0.9 * step(0.02, p);
    if (a < 0.01) discard;
    vec3 col = mix(uWire, uBand, clamp(band, 0.0, 1.0));
    if (uLight < 0.5) fragColor = vec4(col * soft * a, soft * a);
    else              fragColor = vec4(col, soft * a);
  }
`;

// three injects `instanceMatrix` for a ShaderMaterial on an InstancedMesh, so
// declaring it here would be a redefinition.
const VOX_VERT = /* glsl */ `
  varying vec3 vLocal; varying vec3 vNrm; varying vec3 vView; varying float vY;
  void main() {
    vLocal = position;                           // BoxGeometry(1,1,1) -> +/-0.5
    vec4 ip = instanceMatrix * vec4(position, 1.0);
    vY = ip.y;
    vec4 wp = modelMatrix * ip;
    vNrm  = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const VOX_FRAG = /* glsl */ `
  uniform vec3 uWire, uBand, uFillA, uFillB;
  uniform float uGlow, uFillOpacity, uLight, uVoxEdge;
  varying vec3 vLocal; varying vec3 vNrm; varying vec3 vView;
  ${COMMON}
  void main() {
    if (abs(uRole) < 0.5) discard;
    float p = presence();
    if (p < 0.03) discard;
    // an edge is where the two largest |local| components are both near a face
    vec3 d = abs(vLocal) * 2.0;
    float m1 = max(max(d.x, d.y), d.z);
    float m3 = min(min(d.x, d.y), d.z);
    float m2 = d.x + d.y + d.z - m1 - m3;
    float aa = max(fwidth(m2), 1e-4);
    float edge = smoothstep(1.0 - uVoxEdge - aa, 1.0 - uVoxEdge + aa, m2);
    vec3 L = normalize(vec3(0.35, 0.85, 0.55));
    float ndl = max(dot(normalize(vNrm), L), 0.0);
    float fres = pow(1.0 - abs(dot(normalize(vNrm), normalize(vView))), 2.5);
    vec3 fill = mix(uFillA, uFillB, ndl * 0.9 + fres * 0.2);
    float band = sweepBand();
    vec3 col = mix(fill, mix(uWire, uBand, clamp(band, 0.0, 1.0)), edge);
    if (uLight < 0.5) col += uWire * edge * 0.45 * uGlow + uBand * band * 0.35;
    fragColor = vec4(col, max(uFillOpacity, 0.35) * p);
  }
`;

const GRID_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const GRID_FRAG = /* glsl */ `
  out vec4 fragColor;
  uniform vec3 uGrid; uniform float uGridOpacity, uDiv, uLight;
  varying vec2 vUv;
  void main() {
    vec2 g = vUv * uDiv;
    vec2 f = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(1e-5));
    float line = 1.0 - min(min(f.x, f.y), 1.0);
    float fade = 1.0 - smoothstep(0.05, 0.30, length(vUv - 0.5));
    float a = line * fade * uGridOpacity;
    if (a < 0.004) discard;
    if (uLight < 0.5) fragColor = vec4(uGrid * a, a);
    else              fragColor = vec4(uGrid, a);
  }
`;

/* ---------------------------- geometry load ----------------------------- */

interface Manifest {
  mesh: { triangles: number; vertices: number };
  points: { count: number; min: number[]; span: number[] };
  voxels: { count: number; grid: number; size: number; origin: number[] };
}

async function loadGeometry(base: string) {
  const bin = (name: string) =>
    fetch(`${base}/${name}`).then((r) => {
      if (!r.ok) throw new Error(`${name}: ${r.status}`);
      return r.arrayBuffer();
    });

  const [manifest, posBuf, norBuf, idxBuf, ptBuf, voxBuf] = await Promise.all([
    fetch(`${base}/manifest.json`).then((r) => r.json() as Promise<Manifest>),
    bin('mesh-pos.bin'),
    bin('mesh-nor.bin'),
    bin('mesh-idx.bin'),
    bin('points.bin'),
    bin('voxels.bin'),
  ]);

  const srcPos = new Float32Array(posBuf);
  const srcNor = new Float32Array(norBuf);
  const idx = new Uint16Array(idxBuf);
  const tri = idx.length / 3;

  // Expand to non-indexed so every triangle can carry its own barycentric
  // coords, and synthesize that attribute here rather than shipping it.
  const pos = new Float32Array(tri * 9);
  const nor = new Float32Array(tri * 9);
  const bary = new Float32Array(tri * 9);
  for (let t = 0; t < tri; t++) {
    for (let j = 0; j < 3; j++) {
      const s = idx[t * 3 + j] * 3;
      const d = (t * 3 + j) * 3;
      pos[d] = srcPos[s]; pos[d + 1] = srcPos[s + 1]; pos[d + 2] = srcPos[s + 2];
      nor[d] = srcNor[s]; nor[d + 1] = srcNor[s + 1]; nor[d + 2] = srcNor[s + 2];
      bary[d + j] = 1.0;
    }
  }

  // points arrive uint16-quantized against the manifest's min/span
  const q = new Uint16Array(ptBuf);
  const n = manifest.points.count;
  const ptPos = new Float32Array(n * 3);
  const { min, span } = manifest.points;
  for (let i = 0; i < n; i++) {
    ptPos[i * 3] = min[0] + (q[i * 3] / 65535) * span[0];
    ptPos[i * 3 + 1] = min[1] + (q[i * 3 + 1] / 65535) * span[1];
    ptPos[i * 3 + 2] = min[2] + (q[i * 3 + 2] / 65535) * span[2];
  }

  return { manifest, pos, nor, bary, tri, ptPos, voxIjk: new Uint8Array(voxBuf) };
}

/* ------------------------------ the scene ------------------------------- */

export async function createHeroScene(
  canvas: HTMLCanvasElement,
  opts: { basePath?: string; reducedMotion?: boolean; light?: boolean } = {},
): Promise<HeroScene> {
  const base = `${opts.basePath ?? ''}/geometry`;
  const reduced = opts.reducedMotion ?? false;
  const geo = await loadGeometry(base);

  // Match the prototype's colour handling: raw shaders write their own values,
  // so keep three out of the sRGB/linear conversion entirely.
  THREE.ColorManagement.enabled = false;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  const shared = {
    uScanY: { value: 0.62 },
    uScanBand: { value: U.scanBand },
    uScanOn: { value: 1 },
    uWire: { value: new THREE.Color(ACCENT.dark) },
    uBand: { value: new THREE.Color(PALETTE.dark.band) },
    uLight: { value: 0 },
    uWireWidth: { value: U.wireWidth },
    uGlow: { value: U.glow },
    uFresnelPow: { value: U.fresnelPow },
    uGhost: { value: U.ghost },
    uFillA: { value: new THREE.Color(PALETTE.dark.fillA) },
    uFillB: { value: new THREE.Color(PALETTE.dark.fillB) },
    uFillOpacity: { value: U.fillOpacity },
    uPointSize: { value: U.pointSize },
    uVoxEdge: { value: U.voxEdge },
    uScale: { value: 320 },
    uGrid: { value: new THREE.Color(PALETTE.dark.grid) },
    uGridOpacity: { value: U.gridOpacity },
    uDiv: { value: 28 },
  };

  // One role uniform per representation: the scan uniforms are shared, but
  // mesh, points and voxels each need to know their own part in this pass.
  const roles: Record<Mode, { value: number }> = {
    points: { value: 0 },
    mesh: { value: 0 },
    voxel: { value: 0 },
  };

  const pick = (names: (keyof typeof shared)[], role: Mode) => {
    const o: Record<string, { value: unknown }> = { uRole: roles[role] };
    for (const n of names) o[n] = shared[n];
    return o as never;
  };

  const meshGeo = new THREE.BufferGeometry();
  meshGeo.setAttribute('position', new THREE.BufferAttribute(geo.pos, 3));
  meshGeo.setAttribute('normal', new THREE.BufferAttribute(geo.nor, 3));
  meshGeo.setAttribute('bary', new THREE.BufferAttribute(geo.bary, 3));

  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(geo.ptPos, 3));

  const glsl3 = { glslVersion: THREE.GLSL3 };

  const wireMat = new THREE.ShaderMaterial({
    uniforms: pick(['uScanY', 'uScanBand', 'uScanOn', 'uWire', 'uBand', 'uLight',
                    'uWireWidth', 'uGlow', 'uFresnelPow', 'uGhost'], 'mesh'),
    vertexShader: VERT, fragmentShader: WIRE_FRAG, ...glsl3,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const fillMat = new THREE.ShaderMaterial({
    uniforms: pick(['uScanY', 'uScanBand', 'uScanOn', 'uFillA', 'uFillB',
                    'uFillOpacity', 'uLight'], 'mesh'),
    vertexShader: VERT, fragmentShader: FILL_FRAG, ...glsl3,
    transparent: true, depthWrite: true, side: THREE.FrontSide,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });
  const ptMat = new THREE.ShaderMaterial({
    uniforms: pick(['uScanY', 'uScanBand', 'uScanOn', 'uWire', 'uBand', 'uLight',
                    'uPointSize', 'uScale'], 'points'),
    vertexShader: PT_VERT, fragmentShader: PT_FRAG, ...glsl3,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const voxMat = new THREE.ShaderMaterial({
    uniforms: pick(['uScanY', 'uScanBand', 'uScanOn', 'uWire', 'uBand', 'uFillA',
                    'uFillB', 'uGlow', 'uFillOpacity', 'uLight', 'uVoxEdge'], 'voxel'),
    vertexShader: VOX_VERT, fragmentShader: VOX_FRAG, ...glsl3,
    transparent: true, depthWrite: true,
  });
  const gridMat = new THREE.ShaderMaterial({
    uniforms: pick(['uGrid', 'uGridOpacity', 'uDiv', 'uLight'], 'mesh'),
    vertexShader: GRID_VERT, fragmentShader: GRID_FRAG, ...glsl3,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  const model = new THREE.Group();
  model.scale.setScalar(SCALE);
  model.position.y = -0.5 * MODEL_HEIGHT * SCALE;

  const fillMesh = new THREE.Mesh(meshGeo, fillMat);
  const wireMesh = new THREE.Mesh(meshGeo, wireMat);
  const points = new THREE.Points(ptGeo, ptMat);

  const voxGeo = new THREE.BoxGeometry(1, 1, 1);
  const voxCount = geo.manifest.voxels.count;
  const voxMesh = new THREE.InstancedMesh(voxGeo, voxMat, voxCount);
  {
    const m = new THREE.Matrix4();
    const { size, origin } = geo.manifest.voxels;
    const s = size * 0.86; // slightly under grid pitch so the seams read
    for (let i = 0; i < voxCount; i++) {
      m.makeScale(s, s, s);
      m.setPosition(
        origin[0] + (geo.voxIjk[i * 3] + 0.5) * size,
        origin[1] + (geo.voxIjk[i * 3 + 1] + 0.5) * size,
        origin[2] + (geo.voxIjk[i * 3 + 2] + 0.5) * size,
      );
      voxMesh.setMatrixAt(i, m);
    }
    voxMesh.instanceMatrix.needsUpdate = true;
  }
  voxMesh.frustumCulled = false;

  model.add(fillMesh, wireMesh, points, voxMesh);
  group.add(model);
  scene.add(group);

  const gridGeo = new THREE.PlaneGeometry(26, 26);
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.rotation.x = -Math.PI / 2;
  scene.add(grid);

  /* ---- view state ---- */
  let viewMode: ViewMode = 'home';
  let fromIdx = 0;
  let toIdx = 1;
  let yaw = 1.9;
  let pitch = 0.06;
  let dist = HOME_DIST;
  let targetYaw = yaw;
  let targetPitch = pitch;
  let targetDist = dist;
  let scanT = 0.62;
  let idleAt = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const aspect = () => (canvas.clientWidth || 1) / (canvas.clientHeight || 1);
  const narrow = () => (canvas.clientWidth || 1) < NARROW_PX;

  function baseDist() {
    if (viewMode === 'page') return PAGE_DIST;
    if (narrow()) return NARROW_DIST;
    return HOME_DIST * Math.max(1, 1.35 / aspect());
  }
  function baseOffsetX() {
    if (viewMode === 'page') return narrow() ? 0.12 : PAGE_X;
    if (narrow()) return 0;
    // largest offset keeping the right flank inside the frame at any yaw,
    // fitted against the real projected bounds sampled around the orbit
    return Math.max(0, Math.min(HOME_X, 1.02 * aspect() - 0.962));
  }

  function applyRoles() {
    const fromM = MODES[fromIdx];
    const toM = MODES[toIdx];
    for (const m of MODES) {
      roles[m].value = m === toM ? 1 : m === fromM ? -1 : 0;
    }
    const live = (m: Mode) => roles[m].value !== 0;
    wireMesh.visible = live('mesh');
    fillMesh.visible = live('mesh');
    voxMesh.visible = live('voxel');
    points.visible = live('points');
  }

  function layout() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    group.position.x = baseOffsetX();
    group.position.y = viewMode === 'page' ? 0.1 : narrow() ? 0.34 : -0.03;
    targetDist = baseDist();
    camera.updateProjectionMatrix();
    grid.position.y = model.position.y + group.position.y;
    shared.uScale.value = 0.5 * h * Math.min(window.devicePixelRatio || 1, 2);
  }

  /* ---- hand-rolled orbit: no second dependency for 30 lines ---- */
  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    targetYaw += (e.clientX - lastX) * 0.007;
    targetPitch = Math.max(-0.55, Math.min(0.75, targetPitch + (e.clientY - lastY) * 0.005));
    lastX = e.clientX;
    lastY = e.clientY;
    idleAt = performance.now() + 2600;
  };
  const onUp = () => { dragging = false; };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    targetDist = Math.max(2.1, Math.min(9.0, targetDist + e.deltaY * 0.0022));
    idleAt = performance.now() + 2600;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  /* ---- theme ---- */
  function setTheme(isLight: boolean) {
    const P = isLight ? PALETTE.light : PALETTE.dark;
    renderer.setClearColor(P.clear, 1);
    shared.uLight.value = isLight ? 1 : 0;
    shared.uBand.value.set(P.band);
    shared.uFillA.value.set(P.fillA);
    shared.uFillB.value.set(P.fillB);
    shared.uGrid.value.set(P.grid);
    shared.uWire.value.set(isLight ? ACCENT.light : ACCENT.dark);
    // glow does not exist on white: light mode is a blueprint, not an inversion
    const blend = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
    wireMat.blending = blend;
    ptMat.blending = blend;
    wireMat.needsUpdate = true;
    ptMat.needsUpdate = true;
  }

  function setView(mode: ViewMode) {
    if (mode === viewMode) return;
    viewMode = mode;
    targetPitch = mode === 'page' ? 0.16 : 0.06;
    layout();
    if (reduced) dist = targetDist; // cut rather than dolly
  }

  /* ---- loop ---- */
  let raf = 0;
  let prev = 0;
  let running = true;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!running) return;

    const dt = prev ? Math.min((now - prev) / 1000, 0.05) : 0.016;
    prev = now;

    const orbitSpeed = reduced ? 0 : ORBIT_SPEED[viewMode];
    const scanSpeed = reduced ? 0 : SCAN_SPEED[viewMode];

    if (now > idleAt && !dragging) targetYaw += orbitSpeed * dt;
    yaw += (targetYaw - yaw) * 0.09;
    pitch += (targetPitch - pitch) * 0.09;
    dist += (targetDist - dist) * 0.045;
    group.rotation.y = yaw;

    if (scanSpeed > 0) {
      scanT += scanSpeed * dt;
      if (scanT > 1.45) {
        scanT = -0.12;                 // hold below the feet, then rescan
        fromIdx = toIdx;               // what was just built is next to be swept
        toIdx = (toIdx + 1) % MODES.length;
        applyRoles();
      }
    }
    shared.uScanY.value = scanT;

    // the group carries the yaw, so the camera only rises and pulls back
    camera.position.set(0, pitch * 2.0 + 0.02, dist);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  const ro = new ResizeObserver(() => layout());
  ro.observe(canvas);
  const onVisibility = () => { running = !document.hidden; };
  document.addEventListener('visibilitychange', onVisibility);

  setTheme(opts.light ?? false);
  applyRoles();
  layout();
  if (reduced) {
    scanT = 0.62;                      // park mid-body: the still frame still reads
    dist = targetDist;
  }
  raf = requestAnimationFrame(frame);

  return {
    setView,
    setTheme,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('wheel', onWheel);
      meshGeo.dispose(); ptGeo.dispose(); voxGeo.dispose(); gridGeo.dispose();
      wireMat.dispose(); fillMat.dispose(); ptMat.dispose();
      voxMat.dispose(); gridMat.dispose();
      renderer.dispose();
    },
  };
}
