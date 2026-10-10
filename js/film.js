/* Vue Exercice : un film d'environ une minute joué sur la dalle.
   Intro → Préparation (registre des menaces → fonctions critiques → scénarios
   graves mais plausibles) → Simulation (le catalogue d'injects défile, s'arrête
   sur un inject, qui s'ouvre ; puis tout arrive en même temps) → Restitution.
   Animations natives du navigateur (Web Animations API), aucune bibliothèque.
   Tout ce qui s'affiche vient de content.js → film. */
window.Film = (() => {
  const { C, esc, $, $$, el, fill, f, makeRun, reduced } = UI;
  const F = C.film, ORDER = ['intro', 'prep', 'sim', 'rest'];
  const EASE = 'cubic-bezier(.2,.8,.2,1)', DAYS = ['Lundi', 'Mardi', 'Mercredi'];
  let root, stage, run = null, clockMin = 0;

  /* ---------- Outils ---------- */
  const A = (node, frames, opts) => node.animate(frames, Object.assign({ easing: EASE, fill: 'both' }, typeof opts === 'number' ? { duration: opts } : opts));
  // Attend la fin d'une animation ; ne rend jamais la main si le film a été coupé.
  const fin = (r, anim) => new Promise(res => anim.finished.then(() => { if (!r.dead) res(); }, () => {}));
  const add = (tag, cls, html, parent = stage) => { const n = el(tag, cls, html); parent.append(n); return n; };
  const rand = (a, b) => a + Math.random() * (b - a);
  const rise = (node, delay = 0) => A(node, { opacity: [0, 1], transform: ['translateY(.7em)', 'translateY(0)'] }, { duration: 600, delay });
  const ping = dot => A(dot, { transform: ['scale(1)', 'scale(2)', 'scale(1)'] }, 400);
  const initials = name => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const hms = s => [s / 3600, s / 60 % 60, s % 60].map(v => String(Math.floor(v)).padStart(2, '0')).join(':');
  function wipe() { stage.getAnimations({ subtree: true }).forEach(a => a.cancel()); stage.replaceChildren(); }
  async function type(r, node, text, step = 26) { for (let i = 1; i <= text.length; i++) { node.textContent = text.slice(0, i); await r.wait(step); } }

  // Trait entre deux points donnés en % de la scène : un élément HTML que l'on étire
  // (scaleX), identique dans tous les navigateurs.
  function link(parent, x1, y1, x2, y2, cls) {
    const dx = (x2 - x1) / 100 * stage.clientWidth, dy = (y2 - y1) / 100 * stage.clientHeight;
    const n = add('span', 'fx-link' + (cls ? ' ' + cls : ''), '', parent), rot = `rotate(${Math.atan2(dy, dx).toFixed(4)}rad)`;
    n.style.cssText = `left:${x1}%;top:${y1}%;width:${Math.hypot(dx, dy).toFixed(1)}px;transform:${rot} scaleX(0)`;
    n.draw = (ms = 450, delay = 0) => A(n, { transform: [rot + ' scaleX(0)', rot + ' scaleX(1)'] }, { duration: ms, delay });
    return n;
  }

  function setChapter(id) { $$('.fx-rail [data-ch]', root).forEach(b => b.classList.toggle('on', b.dataset.ch === id)); }
  function setProg(id, k) { const b = $(`.fx-rail [data-ch="${id}"] b`, root); if (b) b.style.width = (k * 100).toFixed(1) + '%'; }

  // Horloge fictive de l'exercice, en minutes depuis lundi 00:00.
  const minutesOf = b => DAYS.indexOf(b.day) * 1440 + (+b.time.slice(0, 2)) * 60 + (+b.time.slice(3));
  function showClock(min) {
    clockMin = min;
    const d = DAYS[Math.min(2, Math.floor(min / 1440))], m = Math.floor(min % 1440);
    const t = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    const day = $('.fx-day', stage), time = $('.fx-time', stage);
    if (day) { day.textContent = d; time.textContent = t; }
    OS.setClock(d + ' ' + t);
  }
  function roll(r, to, ms) {
    const from = clockMin, t0 = performance.now();
    return new Promise(res => {
      const step = now => {
        if (r.dead) return;
        const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        showClock(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }

  /* ======================================================================
     Intro
     ====================================================================== */
  async function intro(r) {
    setChapter(null); Scene.setMood('boot');
    const h = add('h2', 'fx-title', F.intro.map(l => `<span class="fx-line">${l.split(' ').map(w => `<span class="fx-word"><i>${esc(w)}</i></span>`).join(' ')}</span>`).join(''));
    $$('.fx-word i', h).forEach((w, i) => A(w, { transform: ['translateY(115%)', 'translateY(0)'] }, { duration: 750, delay: 200 + i * 95 }));
    await r.wait(2700);
    Scene.pulse(1); Sound.launch(); OS.glitch();
    await fin(r, A(h, [
      { clipPath: 'inset(0 0 0 0)', transform: 'none', opacity: 1 },
      { clipPath: 'inset(38% 0 30% 0)', transform: 'translateX(-2%) skewX(-10deg)', opacity: 1, offset: .45 },
      { clipPath: 'inset(49% 0 49% 0)', transform: 'translateX(4%) scaleX(1.4)', opacity: 0 },
    ], { duration: 420, easing: 'steps(6)' }));
  }

  /* ======================================================================
     Préparation : l'entonnoir qui mène au scénario
       1. le radar balaie le registre des menaces et en retient trois ;
       2. chaque menace retenue est reliée aux fonctions critiques qu'elle touche ;
       3. les scénarios graves mais plausibles qui en découlent défilent, un est retenu.
     ====================================================================== */
  async function prep(r) {
    setChapter('prep'); Scene.setMood('idle');
    const P = F.prep, w = stage.clientWidth, h = stage.clientHeight, tall = w < h;
    const steps = add('ol', 'fx-steps', P.steps.map(s => `<li>${esc(s)}</li>`).join(''));
    const step = i => $$('li', steps).forEach((li, j) => { li.classList.toggle('on', j === i); li.classList.toggle('done', j < i); });
    rise(steps);
    if (P.ref) rise(add('p', 'fx-ref', esc(P.ref)), 200);

    /* --- 1. Registre des menaces --- */
    step(0);
    // En portrait, l'ellipse se resserre pour que les libellés restent dans le cadre.
    const n = P.threats.length, CX = 50, CY = tall ? 47 : 52, RX = tall ? 24 : 33, RY = tall ? 27 : 30, T = 1700;
    // Angle a : en degrés depuis le haut, sens horaire (comme le balayage).
    const pts = P.threats.map((label, i) => {
      const a = (i / n * 360 + (i % 2 ? 9 : -6) + 360) % 360, k = i % 2 ? .76 : 1, rad = (a - 90) * Math.PI / 180;
      return { label, a, x: CX + RX * k * Math.cos(rad), y: CY + RY * k * Math.sin(rad) };
    });
    const map = add('div', 'fx-map');
    const lines = pts.map(p => link(map, CX, CY, p.x, p.y));
    const sweep = add('div', 'fx-sweep', '<b></b>', map);
    sweep.style.left = CX + '%'; sweep.style.top = CY + '%';
    const nodes = pts.map(p => {
      const nd = add('div', 'fx-node' + (p.x < CX - 2 ? ' l' : ''), `<i></i><span>${esc(p.label)}</span>`, map);
      nd.style.left = p.x.toFixed(2) + '%'; nd.style.top = p.y.toFixed(2) + '%'; return nd;
    });
    const core = add('div', 'fx-core', `<b>${esc(UI.bank)}</b>`, map), CORE = 'translate(-50%,-50%)';
    core.style.left = CX + '%'; core.style.top = CY + '%';
    A(core, { opacity: [0, 1], transform: [CORE + ' scale(.6)', CORE + ' scale(1)'] }, 550);
    lines.forEach((l, i) => l.draw(450, 250 + i * 70));
    nodes.forEach((nd, i) => A(nd, { opacity: [0, 1] }, { duration: 300, delay: 550 + i * 70 }));
    setProg('prep', .12);
    await r.wait(1400);

    // Le faisceau est un disque déformé en ellipse : il passe sur chaque menace à son angle.
    const R = h * RY / 100 * 1.12, beam = $('b', sweep);
    beam.style.cssText = `width:${2 * R}px;height:${2 * R}px;left:${-R}px;top:${-R}px`;
    sweep.style.transform = `scaleX(${((w * RX) / (h * RY)).toFixed(3)})`;
    A(sweep, { opacity: [0, 1] }, 300);
    A(beam, { transform: ['rotate(0deg)', 'rotate(720deg)'] }, { duration: 2 * T, easing: 'linear' });
    pts.forEach((p, i) => {
      r.wait(p.a / 360 * T).then(() => ping($('i', nodes[i])));
      if (P.locked.includes(i)) r.wait(T + p.a / 360 * T).then(() => {
        nodes[i].classList.add('hot'); lines[i].classList.add('hot'); Scene.pulse(.5); Sound.notify();
      });
    });
    await r.wait(2 * T + 300);
    setProg('prep', .4);

    /* --- 2. Fonctions critiques --- */
    step(1);
    A(sweep, { opacity: [1, 0] }, 300); A(core, { opacity: [1, 0] }, 300);
    lines.forEach(l => A(l, { opacity: [1, 0] }, 300));
    pts.forEach((p, i) => { if (!P.locked.includes(i)) A(nodes[i], { opacity: [1, 0] }, 300); });
    // Les menaces retenues se rangent à gauche, les fonctions critiques apparaissent à droite.
    const LX = tall ? 38 : 31, FX = tall ? 58 : 63;
    const ty = j => (tall ? 36 : 38) + j * (tall ? 11 : 13), fy = k => (tall ? 24 : 24) + k * (tall ? 9 : 10.6);
    P.locked.forEach((i, j) => {
      nodes[i].classList.add('l');
      A(nodes[i], { left: [pts[i].x + '%', LX + '%'], top: [pts[i].y + '%', ty(j) + '%'] }, { duration: 650, easing: 'cubic-bezier(.6,0,.2,1)' });
    });
    await r.wait(650);
    const fns = P.functions.map((label, k) => {
      const nd = add('div', 'fx-node', `<i></i><span>${esc(label)}</span>`, map);
      nd.style.left = FX + '%'; nd.style.top = fy(k) + '%';
      A(nd, { opacity: [0, 1] }, { duration: 300, delay: k * 60 }); return nd;
    });
    await r.wait(650);
    for (let j = 0; j < P.links.length; j++) for (const k of P.links[j]) {
      link(map, LX, ty(j), FX, fy(k), 'hot').draw(360);
      r.wait(340).then(() => ping($('i', fns[k])));
      Sound.key(); await r.wait(170);
    }
    await r.wait(550);
    fns.forEach((nd, k) => { if (P.critical.includes(k)) nd.classList.add('hot'); else A(nd, { opacity: [1, .3] }, 400); });
    Scene.pulse(.6); Sound.notify(); setProg('prep', .7);
    await r.wait(1200);

    /* --- 3. Scénarios graves mais plausibles --- */
    step(2);
    await fin(r, A(map, { opacity: [1, 0] }, 300));
    map.remove();
    const deck = add('div', 'fx-deck', P.scenarios.map(sc => `<div class="fx-card"><b>${esc(sc.name)}</b><span>${esc(sc.tags)}</span></div>`).join(''));
    const cards = $$('.fx-card', deck), len = cards.length;
    // fill: 'backwards' → après l'entrée, la carte retrouve ses styles (dont l'agrandissement de la carte retenue).
    cards.forEach((c, i) => A(c, { opacity: [0, 1], transform: ['translateY(1.4em)', 'translateY(0)'] }, { duration: 500, delay: i * 90, fill: 'backwards' }));
    await r.wait(850);
    // La sélection saute de carte en carte, ralentit, et s'arrête sur le scénario retenu.
    const hops = 2 * len + P.chosen + 1;
    for (let i = 0; i < hops; i++) {
      cards.forEach((c, j) => c.classList.toggle('lit', j === i % len)); Sound.key();
      await r.wait(70 + Math.pow(i / hops, 2) * 340);
    }
    cards.forEach((c, j) => { if (j === P.chosen) c.classList.add('won'); else A(c, { opacity: [1, .14] }, 450); });
    Scene.pulse(.9); Sound.login(); setProg('prep', 1);
    rise(add('p', 'fx-count', esc(fill(P.count).replace('{beats}', F.sim.beats.length))), 250);
    await r.wait(2100);
  }

  /* ======================================================================
     Simulation : le catalogue défile, un inject est choisi, il s'ouvre.
     À la fin, tout arrive en même temps.
     ====================================================================== */
  // Inclinaison de chaque emplacement de fenêtre (slot 1 à 9, positions dans film.css).
  const ROT = [-1.6, 1.1, 2.2, 1.3, -2.2, -1.2, -1, 1.6, 1.4];
  const media = b => C.injects.find(x => x.id === b.inject) || {};
  const videoTag = d => d.video ? `<video muted loop playsinline preload="auto" src="${esc(d.video)}"${d.poster ? ` poster="${esc(d.poster)}"` : ''}></video>` : '';
  const playVideo = w => { const v = $('video', w); if (v) v.play().catch(() => {}); };
  // Chaque inject : le contenu de sa fenêtre, puis ce qui s'y anime.
  const beatsUI = {
    mail: {
      html: b => `<p class="fx-from">${f(b.from)}</p><p class="fx-subj"></p><p class="fx-count-down">72:00:00</p>`,
      start(r, w, b) {
        type(r, $('.fx-subj', w), fill(b.subject), 34);
        let s = 72 * 3600; const out = $('.fx-count-down', w);
        r.every(60, () => { out.textContent = hms(--s); });
      },
    },
    news: {
      html: b => `<p class="fx-mast">${f('{outlet}')}</p><span class="fx-flag">${esc(b.flag)}</span><h3 class="fx-head"></h3><p class="fx-reach">${esc(b.reach)} <b>0</b></p>`,
      start(r, w, b) {
        type(r, $('.fx-head', w), fill(b.headline), 22);
        let n = 0; const out = $('.fx-reach b', w);
        r.every(110, () => { n += 1 + Math.floor(Math.random() * 12); out.textContent = n.toLocaleString('fr-CH'); });
      },
    },
    call: {
      html: b => `<div class="fx-av">${esc(initials(fill(b.name)))}</div><p class="fx-name">${f(b.name)}</p><p class="fx-sub">${f(b.sub)}</p><div class="call-bars on" aria-hidden="true">${'<i></i>'.repeat(22)}</div>`,
      start(r, w, b) {
        Scene.setMood('call'); Scene.phone({ mode: 'call', title: fill(b.name), sub: fill(b.sub), ring: true }); Sound.ring();
        r.wait(2300).then(() => { Sound.stopRing(); Scene.phone({ mode: 'off' }); Scene.setMood('idle'); });
      },
    },
    voice: {
      html: b => `<p class="fx-who">${f(b.who)}</p><div class="fx-bars" aria-hidden="true">${Array.from({ length: 46 }, (_, i) => `<i style="--h:${(.18 + Math.abs(Math.sin(i * 1.7) * Math.sin(i * .37)) * .82).toFixed(2)};--i:${i}"></i>`).join('')}</div><p class="fx-quote">${f(b.line)}</p>`,
      start(r, w) {
        $$('.fx-bars i', w).forEach((bar, i) => A(bar, { opacity: [0, 1] }, { duration: 200, delay: i * 30 }));
        rise($('.fx-quote', w), 900);
      },
    },
    // Deepfake : la vidéo de la démo, avec le cadre de suivi du visage.
    video: { html: b => `${videoTag(media(b))}<span class="fx-face"><em>${esc(b.mark)}</em></span>`, start: (r, w) => playVideo(w) },
    // Images « en direct » : manifestation, incendie…
    clip: { html: b => `${videoTag(media(b))}<span class="fx-live">${esc(b.badge)}</span>`, start: (r, w) => playVideo(w) },
    // Annonce de vente : l'enchère monte, le compte à rebours tourne.
    dark: {
      html: b => `<p class="fx-dk-title">${f(b.title)}</p><p class="fx-dk-label">${esc(b.label)}</p><p class="fx-dk-price"><b>6,50</b> BTC</p><p class="fx-dk-ends">47:59:59</p>`,
      start(r, w) {
        let p = 6.5, s = 48 * 3600 - 1; const price = $('.fx-dk-price b', w), ends = $('.fx-dk-ends', w);
        r.every(240, () => { p += Math.random() * .5; price.textContent = p.toFixed(2).replace('.', ','); });
        r.every(70, () => { ends.textContent = hms(--s); });
      },
    },
    agent: {
      html: () => '<div class="fx-chat"></div>',
      async start(r, w, b) {
        for (let i = 0; i < b.lines.length; i++) {
          const bub = add('p', 'fx-bub' + (i % 2 ? ' me' : ''), f(b.lines[i]), $('.fx-chat', w));
          A(bub, { opacity: [0, 1], transform: ['scale(.8)', 'scale(1)'] }, 320); Sound.message();
          await r.wait(620);
        }
      },
    },
  };
  function spawn(r, i, b) {
    const ui = beatsUI[b.kind], slot = b.slot || i + 1, rot = ROT[slot - 1] || 0;
    const w = add('div', `fx-win fx-${b.kind} fx-w${slot}`, `<header><time>${esc(b.day.slice(0, 3) + ' ' + b.time)}</time><b>${esc(b.tag)}</b></header>${ui.html(b)}`);
    w.style.setProperty('--rot', rot + 'deg'); w.style.setProperty('--i', i);
    A(w, [
      { opacity: 0, transform: `perspective(60em) translateZ(-42em) rotateY(${i % 2 ? 30 : -30}deg) rotateX(12deg)` },
      { opacity: 1, transform: 'perspective(60em) translateZ(4em) rotateY(0deg) rotateX(0deg)', offset: .68 },
      { opacity: 1, transform: `perspective(60em) translateZ(0) rotate(${rot}deg)` },
    ], { duration: 900, fill: 'backwards' });
    ui.start(r, w, b);
    return w;
  }

  // Le catalogue : tous les injects déclarés, en bande défilante. spin() fait tourner
  // la bande et l'arrête sur l'inject demandé, sous le cadre de sélection.
  function buildReel(label) {
    const lib = C.injects, n = lib.length, COPIES = 5;
    const reel = add('div', 'fx-reel', `${label ? `<span class="fx-reel-label">${esc(label)}</span>` : ''}<div class="fx-reel-win"><div class="fx-reel-track">${Array.from({ length: COPIES }, () => lib.map(x => `<span data-id="${esc(x.id)}">${esc(x.name)}</span>`).join('')).join('')}</div><i class="fx-reel-sel"></i></div>`);
    const win = $('.fx-reel-win', reel), track = $('.fx-reel-track', reel), chips = $$('span', track), sel = $('.fx-reel-sel', reel);
    const centre = chip => win.clientWidth / 2 - (chip.offsetLeft + chip.offsetWidth / 2);
    const copyW = chips[n].offsetLeft - chips[0].offsetLeft;
    let x = 0;
    const place = v => { x = v; track.style.transform = `translateX(${v.toFixed(1)}px)`; };
    place(centre(chips[n]));
    rise(reel);
    return {
      async spin(r, id, ms = 700) {
        const i = lib.findIndex(v => v.id === id); if (i < 0) return;
        chips.forEach(c => c.classList.remove('sel')); sel.classList.remove('on');
        // Toujours au moins une demi-bande de course, pour que l'on voie défiler le catalogue.
        let to = centre(chips[2 * n + i]);
        if (x - to < copyW * .5) to = centre(chips[3 * n + i]);
        const from = x; place(to);
        await fin(r, A(track, { transform: [`translateX(${from}px)`, `translateX(${to}px)`] }, { duration: ms, easing: 'cubic-bezier(.12,.75,.2,1)', fill: 'none' }));
        place(centre(chips[n + i]));                    // même image, recalée sur la copie du milieu
        chips[n + i].classList.add('sel');
        sel.style.width = chips[n + i].offsetWidth + 'px'; sel.classList.add('on');
      },
      // Fin de simulation : la bande ne s'arrête plus.
      frenzy() {
        chips.forEach(c => c.classList.remove('sel')); sel.classList.remove('on');
        A(track, { transform: [`translateX(${x}px)`, `translateX(${x - copyW}px)`] }, { duration: 1100, iterations: Infinity, easing: 'linear', fill: 'none' });
      },
    };
  }

  async function sim(r) {
    setChapter('sim'); Scene.setMood('idle');
    const S = F.sim, n = S.beats.length;
    const clock = add('div', 'fx-clock', '<span class="fx-day"></span><span class="fx-time"></span>');
    showClock(7 * 60 + 30);
    // Position « en grand, au centre », en coordonnées locales de la scène (indépendantes de la vue 3D).
    const zoom = Math.min(2.5, stage.clientWidth * .82 / clock.offsetWidth);
    const big = `translate(${stage.clientWidth / 2 - (clock.offsetLeft + clock.offsetWidth / 2)}px, ${stage.clientHeight * .4 - (clock.offsetTop + clock.offsetHeight / 2)}px) scale(${zoom.toFixed(3)})`;
    A(clock, { opacity: [0, 1], transform: [big, big] }, 350);
    const cap = add('p', 'fx-cap fx-cap-mid', esc(S.caption));
    rise(cap, 250); Sound.launch();
    await roll(r, 2 * 1440 + 11 * 60, 2000);
    await r.wait(450);
    A(cap, { opacity: [1, 0] }, 350);
    A(clock, { transform: [big, 'none'] }, { duration: 750, easing: 'cubic-bezier(.7,0,.2,1)' });
    await roll(r, 7 * 60 + 30, 750);
    const reel = buildReel(S.reelLabel);

    for (let i = 0; i < n; i++) {
      const b = S.beats[i];
      await Promise.all([roll(r, minutesOf(b), 650), reel.spin(r, b.inject, 720)]);
      $$('.fx-win', stage).forEach(w => w.classList.add('dim'));
      spawn(r, i, b);
      Scene.pulse(.75); if (b.kind !== 'call') Sound.notify();
      setProg('sim', (i + 1) / (n + 2));
      await r.wait(b.kind === 'call' ? 2500 : 1900);
    }

    // Tout arrive en même temps : les fenêtres se rallument, les alertes submergent l'écran.
    $$('.fx-win', stage).forEach(w => w.classList.remove('dim'));
    Scene.setMood('alert'); Sound.alert(); OS.glitch(); reel.frenzy();
    A(stage, [{ transform: 'translate(0,0)' }, { transform: 'translate(-.3em,.2em)' }, { transform: 'translate(.3em,-.2em)' }, { transform: 'translate(-.2em,-.15em)' }, { transform: 'translate(0,0)' }], { duration: 240, iterations: Infinity, easing: 'linear', fill: 'none' });
    setProg('sim', (n + 1) / (n + 2));
    const t0 = performance.now(); let gap = 230, k = 0;
    while (performance.now() - t0 < 3200) {
      const chip = add('div', 'fx-chip', f(S.flood[k % S.flood.length]));
      chip.style.left = rand(3, 78) + '%'; chip.style.top = rand(5, 84) + '%';
      A(chip, { opacity: [0, 1], transform: [`scale(.5) rotate(${rand(-6, 6)}deg)`, `scale(1) rotate(${rand(-3, 3)}deg)`] }, 240);
      Scene.pulse(.4); if (k % 3 === 0) Sound.message();
      k++; await r.wait(gap); gap = Math.max(34, gap * .87);
    }

    // Coupe au noir. Une seule question.
    wipe(); Sound.hush(); Scene.setMood('off');
    const q = add('h2', 'fx-question', `<span>${esc(S.question)}</span>`);
    A($('span', q), { opacity: [0, 1, 1], transform: ['scale(.95)', 'scale(1.04)'] }, { duration: 2700, easing: 'ease-out' });
    setProg('sim', 1);
    await r.wait(2800);
  }

  /* ======================================================================
     Restitution : le désordre se range en un relevé horodaté
     ====================================================================== */
  async function rest(r) {
    setChapter('rest'); Scene.setMood('idle');
    const R = F.rest;
    rise(add('p', 'fx-cap fx-cap-top', esc(R.caption)));
    rise(add('p', 'fx-note', esc(R.note)), 300);
    const ol = add('ol', 'fx-ledger');
    await r.wait(500);
    for (let i = 0; i < R.rows.length; i++) {
      const row = R.rows[i];
      const li = add('li', row.ok ? 'ok' : 'ko', `<time>${esc(row.when)}</time><b>${esc(row.what)}</b><span>${esc(row.result)}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="${row.ok ? 'M4 12.5l5 5L20 6.5' : 'M6 6l12 12M18 6L6 18'}"/></svg>`, ol);
      A(li, [{ opacity: 0, transform: `translate(${rand(-26, 26)}%, ${rand(-160, 200)}%) rotate(${rand(-9, 9)}deg) scale(1.2)` }, { opacity: 1, transform: 'none' }], 780);
      A($('path', li), { strokeDashoffset: [1, 0] }, { duration: 420, delay: 640, easing: 'ease-out' });
      Sound.soft(); setProg('rest', (i + 1) / (R.rows.length + 1));
      await r.wait(360);
    }
    await r.wait(1300);
    rise(add('div', 'fx-cta', R.cta.map((c, i) => `<button type="button" class="btn${i ? ' ghost' : ''}" data-go="${esc(c.go)}">${esc(c.label)}</button>`).join('')));
    setProg('rest', 1);
  }

  // Mouvement réduit : l'essentiel, sans film.
  function poster() {
    wipe(); setChapter(null);
    add('h2', 'fx-title', F.intro.map(l => `<span class="fx-line">${esc(l)}</span>`).join(''));
    add('div', 'fx-cta', F.rest.cta.map((c, i) => `<button type="button" class="btn${i ? ' ghost' : ''}" data-go="${esc(c.go)}">${esc(c.label)}</button>`).join(''));
  }

  /* ---------- Lecture ---------- */
  const scenes = { intro, prep, sim, rest };
  function stop() {
    if (run) { run.stop(); run = null; }
    if (stage) wipe();
  }
  async function play(from = 'intro') {
    stop();
    if (reduced) return poster();
    const r = run = makeRun();
    r.onStop(() => { Sound.stopRing(); Sound.hush(); Scene.phone({ mode: 'off' }); });
    const start = ORDER.indexOf(from);
    F.chapters.forEach(c => setProg(c.id, ORDER.indexOf(c.id) < start ? 1 : 0));
    for (const id of ORDER.slice(start)) {
      wipe();
      await scenes[id](r);
    }
  }

  function render(view) {
    root = view; view.classList.add('view-film');
    view.innerHTML = `<div class="fx">
      <div class="fx-stage" id="fxStage"></div>
      <nav class="fx-rail" aria-label="Phases de l’exercice">
        ${F.chapters.map(c => `<button type="button" data-ch="${c.id}"><span>${esc(c.label)}</span><i><b></b></i></button>`).join('')}
        <button type="button" class="ico fx-replay" title="Revoir depuis le début">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4.5h4.5"/></svg><span class="sr">Revoir depuis le début</span>
        </button>
      </nav>
    </div>`;
    stage = $('#fxStage', view);
    $$('.fx-rail [data-ch]', view).forEach(b => b.addEventListener('click', () => play(b.dataset.ch)));
    $('.fx-replay', view).addEventListener('click', () => play('intro'));
  }

  return { render, enter: () => play('intro'), leave: stop };
})();
