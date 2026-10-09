/* Scène 3D : le portable sur son bureau, la rade de Genève sous la pluie.
   L'interface (#screen) est du HTML normal, plaqué chaque image sur la dalle
   du portable par une homographie (matrix3d) calculée depuis la caméra.
   Une fois « installé au poste », la caméra est exactement dans l'axe de
   l'écran : la transformation redevient une simple translation, le texte est net. */
window.Scene = (() => {
  const canvas = document.getElementById('gl');
  const screenEl = document.getElementById('screen');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const listeners = [];

  /* ---------- Repli sans WebGL : l'écran occupe toute la fenêtre ---------- */
  function fallback() {
    document.body.classList.add('no-gl');
    let docked = false;
    return {
      ok: false, takeover: true,
      get docked() { return docked; },
      powerOn: () => Promise.resolve(),
      screenOn() { screenEl.style.visibility = 'visible'; },
      dock(on) {
        docked = on;
        document.body.classList.toggle('docked', on);
        document.body.classList.toggle('takeover', on);
        listeners.forEach(f => f(on));
        return Promise.resolve();
      },
      onDock: f => listeners.push(f),
      setMood() {}, pulse() {}, phone() {},
    };
  }
  if (!window.THREE) return fallback();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return fallback(); }

  THREE.ColorManagement.legacyMode = false;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020308);
  scene.fog = new THREE.FogExp2(0x03050a, 0.028);
  const FOV = 32;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 140);

  /* ---------- Outils ---------- */
  const rng = (seed => () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  })(1291);
  const easeInOut = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const easeOut = k => 1 - Math.pow(1 - k, 3);
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function canvasTexture(c) { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }

  // Plaque à coins arrondis, w × h dans le plan XY, épaisseur t vers +Z.
  function slab(w, h, t, r, bevel) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: t - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel,
      bevelOffset: -bevel, bevelSegments: 3, curveSegments: 10,
    });
    g.translate(0, 0, bevel);
    return g;
  }

  /* ---------- Environnement de reflets (généré, aucun fichier HDR) ---------- */
  (function buildEnvironment() {
    const env = new THREE.Scene();
    env.background = new THREE.Color(0x010204);
    const panel = (w, h, color, pos, look) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
      m.position.copy(pos); m.lookAt(look || new THREE.Vector3()); env.add(m);
    };
    panel(26, 7, new THREE.Color().setRGB(0.09, 0.14, 0.30), new THREE.Vector3(0, 3, -12));    // la baie vitrée
    panel(5, 3, new THREE.Color().setRGB(4.2, 2.3, 1.0), new THREE.Vector3(11, 5, 4));          // lampe chaude, hors champ
    panel(14, 6, new THREE.Color().setRGB(0.05, 0.065, 0.1), new THREE.Vector3(0, 12, 0));       // plafond
    panel(3, 2, new THREE.Color().setRGB(1.6, 0.25, 0.2), new THREE.Vector3(-12, 2, -5));       // lueur rouge lointaine
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(env, 0.035).texture;
    pmrem.dispose();
  })();

  /* ---------- Fond : la rade de Genève, de nuit, hors mise au point ---------- */
  const BACK = { r: 30, span: 1.82, h: 13.6, z: -11, horizon: 0.58, horizonY: 1.95 };
  function paintCity() {
    const k = innerWidth > 900 ? 2 : 1, W = 2048, H = 512;
    const c = makeCanvas(W * k, H * k), g = c.getContext('2d');
    g.scale(k, k);
    const HZ = H * BACK.horizon;

    let grad = g.createLinearGradient(0, 0, 0, HZ);
    grad.addColorStop(0, '#02040a'); grad.addColorStop(.55, '#060b19'); grad.addColorStop(.9, '#111a30'); grad.addColorStop(1, '#231d2b');
    g.fillStyle = grad; g.fillRect(0, 0, W, HZ + 1);
    // Nuages bas éclairés par la ville
    for (let i = 0; i < 26; i++) {
      const x = rng() * W, y = HZ * (.25 + rng() * .6), r = 90 + rng() * 220;
      const cg = g.createRadialGradient(x, y, 0, x, y, r);
      cg.addColorStop(0, `rgba(58,66,104,${.05 + rng() * .08})`); cg.addColorStop(1, 'rgba(58,66,104,0)');
      g.fillStyle = cg; g.fillRect(x - r, y - r * .45, r * 2, r * .9);
    }

    const poly = (pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
    // Jura à gauche, Alpes pâles au centre, Salève à droite
    const jura = [[-10, HZ]];
    for (let i = 0; i <= 40; i++) jura.push([i / 40 * W * .46, HZ - H * (.03 + .045 * Math.sin(i / 40 * Math.PI)) - rng() * 2]);
    jura.push([W * .46, HZ]); poly(jura, '#0b1122');
    const alps = [[W * .3, HZ]];
    for (let i = 0; i <= 90; i++) {
      const t = i / 90, env = Math.sin(t * Math.PI);
      alps.push([W * (.3 + t * .34), HZ - H * env * (.05 + .035 * Math.sin(t * 17) + .02 * Math.sin(t * 41 + 1) + rng() * .008)]);
    }
    alps.push([W * .64, HZ]); poly(alps, 'rgba(120,134,170,.09)');
    const sal = [[W * .5, HZ]];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, rise = Math.min(1, t / .16), fall = t > .86 ? 1 - (t - .86) / .3 : 1;
      sal.push([W * (.52 + t * .5), HZ - H * (.2 * rise + .02 * Math.sin(t * 9) + rng() * .006) * fall]);
    }
    sal.push([W * 1.03, HZ]); poly(sal, '#070b17');

    // Lac
    grad = g.createLinearGradient(0, HZ, 0, H);
    grad.addColorStop(0, '#0c1326'); grad.addColorStop(.5, '#060913'); grad.addColorStop(1, '#020308');
    g.fillStyle = grad; g.fillRect(0, HZ, W, H - HZ);

    // Rive : immeubles des quais, fenêtres, réverbères, enseignes de toit
    const lights = [];
    let bx = 0;
    while (bx < W) {
      const w = 10 + rng() * 34, zone = bx < W * .22 ? 1 : bx < W * .4 ? .5 : bx > W * .62 ? .95 : .7;
      const h = (5 + rng() * 20) * zone + 3;
      g.fillStyle = '#04060b'; g.fillRect(bx, HZ - h, w, h + 1);
      for (let wy = HZ - h + 2.5; wy < HZ - 2; wy += 3.6) for (let wx = bx + 2; wx < bx + w - 2; wx += 3.8) {
        if (rng() < .42) { g.fillStyle = rng() < .78 ? 'rgba(255,208,140,.85)' : 'rgba(196,220,255,.8)'; g.fillRect(wx, wy, 1.5, 1.4); }
      }
      if (rng() < .2 && zone > .6) {
        const col = ['#ff3b30', '#2f7bff', '#3ddc84', '#ffffff', '#ffb347', '#2f7bff', '#ff3b30'][Math.floor(rng() * 7)];
        const sw = Math.min(w - 4, 10 + rng() * 18);
        g.shadowColor = col; g.shadowBlur = 10; g.fillStyle = col;
        g.fillRect(bx + (w - sw) / 2, HZ - h - 4.5, sw, 3);
        g.shadowBlur = 0;
        lights.push({ x: bx + w / 2, col, a: .5, w: sw * .8 });
      }
      bx += w + rng() * 4;
    }
    for (let x = 6; x < W; x += 13 + rng() * 5) {
      const lg = g.createRadialGradient(x, HZ - 1.5, 0, x, HZ - 1.5, 5);
      lg.addColorStop(0, 'rgba(255,214,150,.95)'); lg.addColorStop(1, 'rgba(255,190,110,0)');
      g.fillStyle = lg; g.fillRect(x - 5, HZ - 6.5, 10, 10);
      if (rng() < .55) lights.push({ x, col: '#ffcf8c', a: .28, w: 3 });
    }
    // Reflets dans l'eau : traînées verticales hachées
    for (const l of lights) {
      const len = 50 + rng() * 120;
      for (let y = HZ + 2; y < HZ + len; y += 2 + rng() * 3) {
        const t = (y - HZ) / len;
        g.globalAlpha = l.a * (1 - t) * (.4 + rng() * .6);
        g.fillStyle = l.col;
        g.fillRect(l.x - l.w / 2 + (rng() - .5) * 5 * (1 + t * 2), y, l.w * (.6 + rng() * .8), 1.2);
      }
    }
    g.globalAlpha = 1;

    // Flou de profondeur : la ville est loin derrière le plan de netteté.
    // Réduction puis agrandissement : marche partout, sans ctx.filter.
    const small = makeCanvas(c.width / 8, c.height / 8), sg = small.getContext('2d');
    sg.imageSmoothingQuality = 'high'; sg.drawImage(c, 0, 0, small.width, small.height);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingQuality = 'high';
    g.globalAlpha = .9; g.drawImage(small, 0, 0, c.width, c.height); g.restore();

    // Jet d'eau, couché par le vent. Peint après le flou : c'est le repère de la rade, il doit se lire.
    const jx = W * .46, jh = H * .135;
    const fl = g.createRadialGradient(jx, HZ, 0, jx, HZ, 34);
    fl.addColorStop(0, 'rgba(220,235,255,.42)'); fl.addColorStop(1, 'rgba(220,235,255,0)');
    g.fillStyle = fl; g.fillRect(jx - 34, HZ - 34, 68, 68);
    // Panache en particules douces : colonne serrée, retombée en voile sous le vent
    for (let i = 0; i < 620; i++) {
      const t = Math.pow(rng(), .7), fallT = rng() < .45 ? rng() : 0;
      const x = jx + t * t * 9 + fallT * (6 + t * 22) + (rng() - .5) * (1 + t * 3);
      const y = HZ - t * jh + fallT * t * jh * .8;
      const r = 1.6 + t * 2.4 + fallT * 4, al = (.07 + .13 * (1 - fallT)) * (1 - t * .25);
      const pg = g.createRadialGradient(x, y, 0, x, y, r);
      pg.addColorStop(0, `rgba(236,244,255,${al})`); pg.addColorStop(1, 'rgba(236,244,255,0)');
      g.fillStyle = pg; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let y = HZ + 2; y < HZ + 70; y += 2.4) {
      g.fillStyle = `rgba(226,238,255,${.16 * (1 - (y - HZ) / 70) * (.4 + rng() * .6)})`;
      g.fillRect(jx - 4 + (rng() - .5) * 8, y, 5 + rng() * 8, 1.2);
    }

    // Bokeh des lumières proches, sur la vitre
    const tones = ['255,196,128', '255,196,128', '255,214,170', '190,214,255', '255,72,60', '64,128,255'];
    for (let i = 0; i < 44; i++) {
      const x = rng() * W, y = HZ + (rng() - .42) * 150, r = 9 + rng() * 15, tone = tones[Math.floor(rng() * tones.length)], a = .03 + rng() * .07;
      g.fillStyle = `rgba(${tone},${a})`; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      g.strokeStyle = `rgba(${tone},${a * 1.3})`; g.lineWidth = 1; g.stroke();
    }

    return c;
  }
  // Toile cintrée (arc de cylindre vu de l'intérieur) : pas de bord visible en tournant.
  const cityTex = canvasTexture(paintCity());
  cityTex.wrapS = THREE.RepeatWrapping; cityTex.repeat.x = -1; cityTex.offset.x = 1;
  const backdrop = new THREE.Mesh(
    new THREE.CylinderGeometry(BACK.r, BACK.r, BACK.h, 48, 1, true, Math.PI - BACK.span / 2, BACK.span),
    new THREE.MeshBasicMaterial({ map: cityTex, fog: false, toneMapped: false, side: THREE.BackSide })
  );
  backdrop.position.set(0, BACK.horizonY - (0.5 - BACK.horizon) * BACK.h, BACK.z + BACK.r);
  scene.add(backdrop);

  // Gyrophares lointains sur le quai : deux halos qui alternent lentement
  function haloTexture() {
    const c = makeCanvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  const halo = haloTexture();
  const beacon = (color, x) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false, transparent: true }));
    s.position.set(x, BACK.horizonY - .1, BACK.z + 2); s.scale.set(1.5, 1.5, 1); scene.add(s); return s;
  };
  const beaconRed = beacon(0xff3528, -9.6), beaconBlue = beacon(0x2f6bff, -8.9);
  const washRed = new THREE.PointLight(0xff3528, 0, 26, 2), washBlue = new THREE.PointLight(0x2f6bff, 0, 26, 2);
  washRed.position.set(-8, 2.2, -5.5); washBlue.position.set(-7, 2.2, -5.5);
  scene.add(washRed, washBlue);

  /* ---------- Baie vitrée : montants, gouttes, pluie ---------- */
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x07080b, roughness: .5, metalness: .6, envMapIntensity: .5 });
  [-13.8, -4.6, 4.6, 13.8].forEach(x => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(.2, 18, .26), frameMat); m.position.set(x, 6, -5.2); scene.add(m);
  });
  const sill = new THREE.Mesh(new THREE.BoxGeometry(60, .34, .5), frameMat); sill.position.set(0, .12, -5.25); scene.add(sill);

  function paintDrops() {
    const c = makeCanvas(1024, 512), g = c.getContext('2d');
    for (let i = 0; i < 900; i++) {
      const x = rng() * 1024, y = rng() * 512, r = .6 + Math.pow(rng(), 3) * 4.2;
      const gr = g.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r);
      gr.addColorStop(0, `rgba(210,225,255,${.25 + rng() * .4})`); gr.addColorStop(1, 'rgba(160,190,255,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * 1.25, 0, 0, 6.283); g.fill();
    }
    return c;
  }
  function paintRivulets() {
    const c = makeCanvas(256, 512), g = c.getContext('2d');
    for (let i = 0; i < 7; i++) {
      let x = rng() * 256, y = rng() * 512; const len = 60 + rng() * 160;
      g.strokeStyle = `rgba(190,210,255,${.12 + rng() * .14})`; g.lineWidth = .8 + rng() * 1.2; g.beginPath(); g.moveTo(x, y);
      for (let d = 0; d < len; d += 8) { x += (rng() - .5) * 3; g.lineTo(x, (y + d) % 512); if ((y + d) % 512 < 8) g.moveTo(x, 0); }
      g.stroke();
      g.fillStyle = 'rgba(225,235,255,.55)'; g.beginPath(); g.ellipse(x, (y + len) % 512, 1.8, 2.6, 0, 0, 6.283); g.fill();
    }
    return c;
  }
  const glassMat = map => new THREE.MeshBasicMaterial({ map, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false });
  const drops = new THREE.Mesh(new THREE.PlaneGeometry(36, 18), glassMat(new THREE.CanvasTexture(paintDrops())));
  drops.position.set(0, 6, -5.4); scene.add(drops);
  const rivTex = new THREE.CanvasTexture(paintRivulets());
  rivTex.wrapS = rivTex.wrapT = THREE.RepeatWrapping; rivTex.repeat.set(7, 2);
  const rivulets = new THREE.Mesh(new THREE.PlaneGeometry(36, 18), glassMat(rivTex));
  rivulets.position.set(0, 6, -5.38); rivulets.material.opacity = .7; scene.add(rivulets);

  const RAIN = reduced ? 160 : 760;
  const rainPos = new Float32Array(RAIN * 6), rainData = [];
  for (let i = 0; i < RAIN; i++) rainData.push({ x: (rng() - .5) * 40, y: rng() * 14 - 1, z: -10.4 + rng() * 4.6, v: 9 + rng() * 7, l: .18 + rng() * .32 });
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xa9bfe6, transparent: true, opacity: .11, fog: false, depthWrite: false }));
  rain.frustumCulled = false; scene.add(rain);
  function stepRain(dt) {
    for (let i = 0; i < RAIN; i++) {
      const d = rainData[i]; d.y -= d.v * dt; d.x += d.v * dt * .12;
      if (d.y < -1.5) { d.y = 13; d.x = (Math.random() - .5) * 40; }
      const o = i * 6;
      rainPos[o] = d.x; rainPos[o + 1] = d.y; rainPos[o + 2] = d.z;
      rainPos[o + 3] = d.x - d.l * .12; rainPos[o + 4] = d.y + d.l; rainPos[o + 5] = d.z;
    }
    rainGeo.attributes.position.needsUpdate = true;
  }

  /* ---------- Bureau ---------- */
  function paintWood() {
    const c = makeCanvas(1024, 1024), g = c.getContext('2d');
    g.fillStyle = '#0d0b0a'; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 1500; i++) {
      const y = rng() * 1024, a = rng() * .1;
      g.fillStyle = rng() < .5 ? `rgba(54,38,26,${a})` : `rgba(0,0,0,${a * 1.6})`;
      g.fillRect(rng() * 1024 - 200, y, 200 + rng() * 800, .6 + rng() * 1.6);
    }
    return c;
  }
  const woodTex = canvasTexture(paintWood());
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(5, 3);
  const desk = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 20),
    new THREE.MeshStandardMaterial({ map: woodTex, color: 0xffffff, roughness: .62, metalness: 0, envMapIntensity: .4 })
  );
  desk.rotation.x = -Math.PI / 2; desk.position.set(0, 0, 4.9); scene.add(desk);

  function paintShadow() {
    const c = makeCanvas(256, 256), g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 30, 128, 128, 128);
    gr.addColorStop(0, 'rgba(0,0,0,.85)'); gr.addColorStop(.6, 'rgba(0,0,0,.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return c;
  }
  const shadowTex = new THREE.CanvasTexture(paintShadow());
  const contactShadow = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, .004, z); scene.add(m); return m;
  };
  contactShadow(4.5, 3.5, 0, -.05);

  /* ---------- Le portable ---------- */
  const laptop = new THREE.Group(); scene.add(laptop);
  const alu = new THREE.MeshStandardMaterial({ color: 0x33363c, metalness: .92, roughness: .36, envMapIntensity: 1.25 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x08090b, metalness: .2, roughness: .5, envMapIntensity: .6 });

  const BASE_H = .13, FEET = .012, BASE_TOP = BASE_H + FEET;
  const base = new THREE.Mesh(slab(3.2, 2.2, BASE_H, .15, .018), alu);
  base.geometry.rotateX(-Math.PI / 2); base.position.y = FEET; laptop.add(base);

  // Clavier : disposition suisse romande (QWERTZ), légendes rétroéclairées
  const P = .2, KB_W = 14.5 * P, KX0 = -KB_W / 2, KZ0 = -.93, KB_D = 1.13;
  const ROWS = [
    { d: .11, keys: ['esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', '⏻'].map(l => [14.5 / 14, l]) },
    { d: .2, keys: [...'§1234567890\'^'].map(l => [1, l]).concat([[1.5, '←']]) },
    { d: .2, keys: [[1.5, 'tab']].concat([...'QWERTZUIOPè¨$'].map(l => [1, l])) },
    { d: .2, keys: [[1.75, 'caps']].concat([...'ASDFGHJKLéà'].map(l => [1, l]), [[1.75, 'enter']]) },
    { d: .2, keys: [[2.25, 'shift']].concat([...'YXCVBNM,.-'].map(l => [1, l]), [[2.25, 'shift']]) },
    { d: .2, keys: [[1, 'fn'], [1, 'ctrl'], [1, 'alt'], [1.25, 'cmd'], [5, ''], [1.25, 'cmd'], [1, '←'], [1, '↑'], [1, '↓'], [1, '→']] },
  ];
  const keys = [];
  let kz = KZ0;
  for (const row of ROWS) {
    let kx = KX0;
    for (const [w, label] of row.keys) { keys.push({ x: kx + w * P / 2, z: kz + row.d / 2, w: w * P - .028, d: row.d - .028, label }); kx += w * P; }
    kz += row.d;
  }
  const well = new THREE.Mesh(new THREE.PlaneGeometry(KB_W + .06, KB_D + .06), new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }));
  well.rotation.x = -Math.PI / 2; well.position.set(0, BASE_TOP + .0012, KZ0 + KB_D / 2); laptop.add(well);
  const keyMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: .58, metalness: .1, envMapIntensity: .55 }), keys.length);
  const mat4 = new THREE.Matrix4();
  keys.forEach((k, i) => { mat4.makeScale(k.w, .02, k.d); mat4.setPosition(k.x, BASE_TOP + .011, k.z); keyMesh.setMatrixAt(i, mat4); });
  laptop.add(keyMesh);
  function paintLegends() {
    const CW = 2048, CH = Math.round(2048 * KB_D / KB_W), c = makeCanvas(CW, CH), g = c.getContext('2d');
    g.fillStyle = '#dfe8ff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const k of keys) {
      if (!k.label) continue;
      const px = (k.x - KX0) / KB_W * CW, py = (k.z - KZ0) / KB_D * CH;
      g.font = `500 ${k.label.length > 1 ? 26 : 44}px "Hanken Grotesk", "Segoe UI", sans-serif`;
      g.fillText(k.label, px, py + 2);
    }
    return c;
  }
  const legendTex = new THREE.CanvasTexture(paintLegends());
  legendTex.anisotropy = 8;
  const legends = new THREE.Mesh(new THREE.PlaneGeometry(KB_W, KB_D), new THREE.MeshBasicMaterial({ map: legendTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }));
  legends.rotation.x = -Math.PI / 2; legends.position.set(0, BASE_TOP + .0215, KZ0 + KB_D / 2); laptop.add(legends);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { legendTex.image = paintLegends(); legendTex.needsUpdate = true; });

  const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .72), new THREE.MeshStandardMaterial({ color: 0x2b2e33, metalness: .9, roughness: .22, envMapIntensity: 1.3 }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(0, BASE_TOP + .001, .64); laptop.add(pad);

  // Capot, articulé sur l'arrière de la base
  const LID_OPEN = -.3, LID_CLOSED = Math.PI / 2;
  const SCR = { w: 3.0, h: 1.875, y0: .125, z: .004 };
  const lid = new THREE.Group();
  lid.position.set(0, BASE_TOP + .004, -1.05); lid.rotation.x = LID_CLOSED; laptop.add(lid);
  const lidShell = new THREE.Mesh(slab(3.2, 2.1, .06, .15, .012), alu);
  lidShell.geometry.translate(0, 1.05, -.06); lid.add(lidShell);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 2.04), new THREE.MeshStandardMaterial({ color: 0x020203, roughness: .12, metalness: 0, envMapIntensity: .9 }));
  glass.position.set(0, 1.05, .0015); lid.add(glass);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(SCR.w, SCR.h), new THREE.MeshBasicMaterial({ color: 0x010102, toneMapped: false }));
  panel.position.set(0, SCR.y0 + SCR.h / 2, .003); lid.add(panel);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(.012, 16), new THREE.MeshStandardMaterial({ color: 0x0a0c12, roughness: .1, envMapIntensity: 2 }));
  lens.position.set(0, 2.05, .003); lid.add(lens);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, 2.5, 20), dark);
  hinge.rotation.z = Math.PI / 2; hinge.position.set(0, BASE_TOP - .005, -1.07); laptop.add(hinge);

  // La dalle éclaire la pièce : couleur et intensité suivent ce qu'affiche l'interface
  const screenLight = new THREE.PointLight(0x6f9dff, 0, 11, 2);
  screenLight.position.set(0, 1.0, 1.1); lid.add(screenLight);

  /* ---------- Téléphone posé à droite ---------- */
  const phone = new THREE.Group();
  phone.position.set(2.55, 0, .55); phone.rotation.y = -.28; scene.add(phone);
  const phoneBody = new THREE.Mesh(slab(.74, 1.5, .045, .1, .012), new THREE.MeshStandardMaterial({ color: 0x0b0c0f, metalness: .7, roughness: .3, envMapIntensity: 1 }));
  phoneBody.geometry.rotateX(-Math.PI / 2); phoneBody.position.y = .006; phone.add(phoneBody);
  const phoneCanvas = makeCanvas(256, 520), phoneTex = canvasTexture(phoneCanvas);
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(.68, 1.44), new THREE.MeshBasicMaterial({ map: phoneTex, toneMapped: false }));
  phoneScreen.rotation.x = -Math.PI / 2; phoneScreen.position.y = .0525; phone.add(phoneScreen);
  const phoneLight = new THREE.PointLight(0x5cff9a, 0, 4, 2); phoneLight.position.set(0, .5, 0); phone.add(phoneLight);
  contactShadow(1.3, 2.1, 2.55, .55);
  let phoneState = { mode: 'off' }, phoneGlow = 0;
  function drawPhone() {
    const g = phoneCanvas.getContext('2d'), st = phoneState, W = 256, H = 520, f = '"Hanken Grotesk", "Segoe UI", sans-serif';
    g.fillStyle = '#010102'; g.fillRect(0, 0, W, H);
    g.textAlign = 'center';
    if (st.mode === 'call') {
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d2a1d'); gr.addColorStop(1, '#04090a');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `400 17px ${f}`; g.fillText('Appel entrant', W / 2, 78);
      g.fillStyle = '#fff'; g.font = `500 27px ${f}`; g.fillText(st.title || '', W / 2, 124, W - 24);
      g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `400 16px ${f}`; g.fillText(st.sub || '', W / 2, 152, W - 24);
      g.fillStyle = '#ff453a'; g.beginPath(); g.arc(70, 430, 31, 0, 6.283); g.fill();
      g.fillStyle = '#30d158'; g.beginPath(); g.arc(186, 430, 31, 0, 6.283); g.fill();
    } else if (st.mode === 'msg') {
      g.fillStyle = '#05070c'; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.92)'; g.font = `300 62px ${f}`; g.fillText(st.clock || '13:15', W / 2, 118);
      g.fillStyle = 'rgba(255,255,255,.14)'; roundRect(g, 14, 190, W - 28, 96, 18); g.fill();
      g.textAlign = 'left';
      g.fillStyle = 'rgba(255,255,255,.55)'; g.font = `500 13px ${f}`; g.fillText(st.app || 'Message', 30, 216);
      g.fillStyle = '#fff'; g.font = `600 17px ${f}`; g.fillText(st.title || '', 30, 243, W - 60);
      g.fillStyle = 'rgba(255,255,255,.8)'; g.font = `400 15px ${f}`; g.fillText(st.sub || '', 30, 266, W - 60);
    }
    phoneTex.needsUpdate = true;
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  drawPhone();

  /* ---------- Poussières dans le halo de l'écran ---------- */
  const DUST = reduced ? 0 : 110, dustPos = new Float32Array(DUST * 3), dustV = [];
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (rng() - .5) * 6; dustPos[i * 3 + 1] = .2 + rng() * 3; dustPos[i * 3 + 2] = -1 + rng() * 4.5;
    dustV.push({ x: (rng() - .5) * .05, y: .01 + rng() * .04, p: rng() * 6.28 });
  }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: halo, size: .045, color: 0x9fbaff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  scene.add(dust);

  /* ---------- Lumières ---------- */
  scene.add(new THREE.AmbientLight(0x1b2436, .32));
  const moon = new THREE.DirectionalLight(0x8fb0ff, .4); moon.position.set(-4, 5, -7); scene.add(moon);
  const lamp = new THREE.PointLight(0xffa860, 1.5, 18, 2); lamp.position.set(6.5, 3.4, 2.5); scene.add(lamp);

  const MOODS = {
    off: [0x000000, 0], boot: [0xa9bcff, 1.0], idle: [0x9db4e6, 1.5], alert: [0xff3b2f, 2.3],
    paper: [0xfff0dc, 3.0], term: [0x52e695, 1.6], call: [0x4ef59a, 1.8], video: [0xbfd0ff, 2.2],
  };
  const moodColor = new THREE.Color(0x000000), moodTarget = new THREE.Color(0x000000);
  let moodI = 0, moodITarget = 0, pulseV = 0;
  const RED = new THREE.Color(0xff2a1f), tmpColor = new THREE.Color();

  /* ---------- État animé ---------- */
  const S = { lid: 0, intro: 1, dock: 0, zoom: 0, kb: 0, dragAz: 0, dragEl: 0 };
  const anims = {};
  function animate(key, to, ms, ease = easeInOut) {
    return new Promise(res => {
      if (anims[key]) anims[key].res();
      if (reduced) ms = Math.min(ms, 250);
      anims[key] = { from: S[key], to, t0: performance.now(), ms, ease, res };
    });
  }
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let vw = 1, vh = 1, takeover = false, dockDist = 6, rDesk = 7.4;
  let dockTarget = false, screenVisible = false, lastTransform = '', takeoverActive = false, scrW = 1280, scrH = 800;

  function layout() {
    vw = innerWidth; vh = innerHeight;
    const aspect = vw / vh;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(vw, vh, false);
    camera.aspect = aspect; camera.updateProjectionMatrix();
    takeover = vw < 900 || aspect < 1.15;
    api.takeover = takeover;
    const Hd = Math.min(.9 * vh, .94 * vw / 1.6), Wd = Hd * 1.6;
    dockDist = SCR.h * vh / (Hd * 2 * Math.tan(FOV * Math.PI / 360));
    rDesk = Math.max(7.4, 8.4 / aspect);
    INTRO_TARGET.x = INTRO_X * clamp((aspect - .8) / .8, 0, 1); // en portrait, le portable reste centré
    if (!takeoverActive) sizeScreen(Wd, Hd);
    if (takeoverActive && !takeover) { setTakeover(false); sizeScreen(Wd, Hd); }
    else if (!takeoverActive && takeover && S.dock === 1 && dockTarget) setTakeover(true);
    lastTransform = '';
  }
  function sizeScreen(Wd, Hd) {
    const W = takeover ? 1120 : Math.round(Wd), H = takeover ? 700 : Math.round(Hd);
    scrW = W; scrH = H;
    screenEl.style.width = W + 'px'; screenEl.style.height = H + 'px';
    screenEl.style.fontSize = clamp(W / 1280 * 16, 11, 23).toFixed(2) + 'px';
  }
  function setTakeover(on) {
    takeoverActive = on;
    document.body.classList.toggle('takeover', on);
    if (on) { screenEl.style.width = screenEl.style.height = screenEl.style.fontSize = ''; screenEl.style.transform = 'none'; }
    else { lastTransform = ''; const Hd = Math.min(.9 * vh, .94 * vw / 1.6); sizeScreen(Hd * 1.6, Hd); }
  }

  /* ---------- Caméra ---------- */
  const UP = new THREE.Vector3(0, 1, 0), TARGET = new THREE.Vector3(0, 1.22, -.2), INTRO_TARGET = new THREE.Vector3(-1.5, .9, 0), INTRO_X = -1.5;
  const pA = new THREE.Vector3(), pB = new THREE.Vector3(), pC = new THREE.Vector3();
  const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), qC = new THREE.Quaternion();
  const mLook = new THREE.Matrix4(), vN = new THREE.Vector3(), vU = new THREE.Vector3(), vX = new THREE.Vector3(), vTmp = new THREE.Vector3();
  function orbit(target, az, el, r, pos, quat) {
    pos.set(target.x + r * Math.sin(az) * Math.cos(el), target.y + r * Math.sin(el), target.z + r * Math.cos(az) * Math.cos(el));
    mLook.lookAt(pos, target, UP); quat.setFromRotationMatrix(mLook);
  }
  function updateCamera(t) {
    const sway = reduced ? 0 : Math.sin(t * .17) * .014;
    orbit(TARGET, -.2 + S.dragAz + mouse.x * .15 + sway, .17 + S.dragEl - mouse.y * .05, rDesk * (1 - .32 * S.zoom), pA, qA);
    if (S.intro > 0) {
      orbit(INTRO_TARGET, -.55 + mouse.x * .05 + sway * 2, .13 - mouse.y * .02, rDesk * 1.12, pB, qB);
      const k = easeInOut(S.intro); pA.lerp(pB, k); qA.slerp(qB, k);
    }
    if (S.dock > 0) {
      lid.localToWorld(pC.set(0, SCR.y0 + SCR.h / 2, SCR.z));
      vN.set(0, 0, 1).transformDirection(lid.matrixWorld); vU.set(0, 1, 0).transformDirection(lid.matrixWorld); vX.crossVectors(vU, vN);
      pC.addScaledVector(vN, dockDist); mLook.makeBasis(vX, vU, vN); qC.setFromRotationMatrix(mLook);
      pA.lerp(pC, S.dock); qA.slerp(qC, S.dock);
    }
    camera.position.copy(pA); camera.quaternion.copy(qA); camera.updateMatrixWorld();
  }

  /* ---------- Plaquer #screen sur la dalle ---------- */
  const CORNERS = [[-SCR.w / 2, SCR.y0 + SCR.h], [SCR.w / 2, SCR.y0 + SCR.h], [SCR.w / 2, SCR.y0], [-SCR.w / 2, SCR.y0]];
  const px = [0, 0, 0, 0, 0, 0, 0, 0];
  function placeScreen() {
    const show = screenVisible && S.lid > .92;
    if (screenEl.style.visibility !== (show ? 'visible' : 'hidden')) screenEl.style.visibility = show ? 'visible' : 'hidden';
    if (!show || takeoverActive) return;
    for (let i = 0; i < 4; i++) {
      lid.localToWorld(vTmp.set(CORNERS[i][0], CORNERS[i][1], SCR.z)).project(camera);
      px[i * 2] = (vTmp.x * .5 + .5) * vw; px[i * 2 + 1] = (-vTmp.y * .5 + .5) * vh;
    }
    const W = scrW, H = scrH;
    let tf;
    if (S.dock === 1) tf = `translate(${Math.round(px[0])}px,${Math.round(px[1])}px)`;
    else {
      const [x0, y0, x1, y1, x2, y2, x3, y3] = px;
      const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3, dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
      const den = dx1 * dy2 - dy1 * dx2;
      if (Math.abs(den) < 1e-6) return;
      const g = (sx * dy2 - sy * dx2) / den, h = (dx1 * sy - dy1 * sx) / den;
      const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
      tf = `matrix3d(${a / W},${d / W},0,${g / W},${b / H},${e / H},0,${h / H},0,0,1,0,${x0},${y0},0,1)`;
    }
    if (tf !== lastTransform) { screenEl.style.transform = tf; lastTransform = tf; }
    // Le reflet sur la dalle glisse avec l'angle de vue
    screenEl.style.setProperty('--glare', (22 + camera.position.x * 7).toFixed(1) + '%');
  }

  /* ---------- Boucle ---------- */
  let last = 0, running = true;
  function frame(ms) {
    if (!running) return;
    requestAnimationFrame(frame);
    const t = ms / 1000, dt = Math.min(.05, t - last || .016); last = t;
    for (const key in anims) {
      const a = anims[key], k = a.ms <= 0 ? 1 : Math.min(1, (ms - a.t0) / a.ms);
      S[key] = a.from + (a.to - a.from) * a.ease(Math.max(0, k));
      if (k >= 1) { S[key] = a.to; delete anims[key]; a.res(); }
    }
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3.2); mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3.2);

    lid.rotation.x = lerp(LID_CLOSED, LID_OPEN, S.lid);
    laptop.updateMatrixWorld(true);
    updateCamera(t);

    // Humeur de l'écran → lumière de la pièce
    moodColor.lerp(moodTarget, Math.min(1, dt * 4)); moodI += (moodITarget - moodI) * Math.min(1, dt * 4);
    pulseV = Math.max(0, pulseV - dt * 1.4);
    tmpColor.copy(moodColor).lerp(RED, Math.min(1, pulseV));
    screenLight.color.copy(tmpColor);
    screenLight.intensity = (moodI + pulseV * 1.6) * (1 + (reduced ? 0 : Math.sin(t * 31) * .012 + Math.sin(t * 7.3) * .02));
    dust.material.color.copy(tmpColor); dust.material.opacity = Math.min(.5, moodI * .22);
    legends.material.opacity = S.kb * .85;
    well.material.color.setRGB(.012 * S.kb, .02 * S.kb, .04 * S.kb);

    const bt = t * 1.9, r = Math.max(0, Math.sin(bt)) ** 3, b = Math.max(0, Math.sin(bt + Math.PI)) ** 3;
    beaconRed.material.opacity = .15 + r * .85; beaconBlue.material.opacity = .15 + b * .85;
    washRed.intensity = r * .5; washBlue.intensity = b * .5;

    if (!reduced || ms % 3 < 1) stepRain(dt);
    rivTex.offset.y += dt * .035;
    for (let i = 0; i < DUST; i++) {
      const v = dustV[i], o = i * 3;
      dustPos[o] += (v.x + Math.sin(t * .4 + v.p) * .02) * dt; dustPos[o + 1] += v.y * dt;
      if (dustPos[o + 1] > 3.4) dustPos[o + 1] = .15;
    }
    if (DUST) dustGeo.attributes.position.needsUpdate = true;

    const ringing = phoneState.mode === 'call' && phoneState.ring;
    phoneGlow += ((phoneState.mode === 'off' ? 0 : 1) - phoneGlow) * Math.min(1, dt * 6);
    phoneLight.intensity = phoneGlow * .9; phoneLight.color.set(phoneState.mode === 'call' ? 0x4ef59a : 0x9db8ff);
    phone.rotation.y = -.28 + (ringing && !reduced ? Math.sin(t * 95) * .012 * (Math.sin(t * 2.9) > 0 ? 1 : 0) : 0);

    renderer.render(scene, camera);
    placeScreen();
  }

  /* ---------- Entrées ---------- */
  addEventListener('pointermove', e => { mouse.tx = (e.clientX / vw) * 2 - 1; mouse.ty = (e.clientY / vh) * 2 - 1; });
  let drag = null;
  canvas.addEventListener('pointerdown', e => {
    if (dockTarget || S.intro > 0) return;
    drag = { x: e.clientX, y: e.clientY, az: S.dragAz, el: S.dragEl }; canvas.setPointerCapture(e.pointerId);
    document.body.classList.add('dragging');
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    S.dragAz = clamp(drag.az - (e.clientX - drag.x) / vw * 2.2, -.4, .8);
    S.dragEl = clamp(drag.el + (e.clientY - drag.y) / vh * 1.1, -.1, .5);
  });
  const endDrag = () => { drag = null; document.body.classList.remove('dragging'); };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
  addEventListener('wheel', e => {
    if (dockTarget || S.intro > 0 || !screenVisible) return;
    const z = clamp(S.zoom - e.deltaY * .0016, 0, 1.15);
    if (z > 1.08) { S.zoom = 1; api.dock(true, 900); } else S.zoom = Math.min(1, z);
  }, { passive: true });
  addEventListener('resize', layout);
  document.addEventListener('visibilitychange', () => {
    const was = running; running = !document.hidden;
    if (running && !was) { last = 0; requestAnimationFrame(frame); }
  });

  /* ---------- API ---------- */
  const api = {
    ok: true, takeover: false,
    get docked() { return dockTarget; },
    // Ouvre le capot et recule jusqu'à la vue « bureau ».
    powerOn() {
      animate('kb', 1, 1600);
      animate('intro', 0, 2600);
      return animate('lid', 1, 1900, easeOut);
    },
    screenOn() { screenVisible = true; },
    // S'installer au poste (true) ou reculer vers la vue bureau (false).
    dock(on, ms = 1300) {
      if (on === dockTarget) return Promise.resolve();
      dockTarget = on;
      document.body.classList.toggle('docked', on);
      if (!on) { setTakeover(false); document.body.classList.remove('dock-settled'); }
      listeners.forEach(f => f(on));
      return animate('dock', on ? 1 : 0, ms).then(() => {
        if (dockTarget !== on) return;
        if (on) { document.body.classList.add('dock-settled'); if (takeover) setTakeover(true); }
        else S.zoom = 0;
        lastTransform = '';
      });
    },
    onDock: f => listeners.push(f),
    setMood(name) { const m = MOODS[name] || MOODS.idle; moodTarget.setHex(m[0]); moodITarget = m[1]; },
    pulse(v = 1) { pulseV = Math.max(pulseV, v); },
    // { mode: 'off' | 'call' | 'msg', title, sub, app, clock, ring }
    phone(state) { phoneState = state || { mode: 'off' }; drawPhone(); },
  };

  layout();
  requestAnimationFrame(frame);
  return api;
})();
