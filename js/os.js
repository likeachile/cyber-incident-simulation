/* Le système affiché sur la dalle : démarrage, barre, navigation et la vue Contact.
   Le film d'exercice est dans film.js, les démos dans injects.js.
   Tous les textes viennent de content.js. */
window.UI = (() => {
  const C = window.CONTENT;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  function el(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }

  let bank = C.bank.name;
  const tag = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '');
  // Remplace {bank}, {ceo}… dans un texte de content.js. Renvoie du texte brut.
  function fill(str) {
    const c = C.cast, map = {
      bank, bankTag: tag(bank), ceo: c.ceo, ceoLast: c.ceo.split(' ').slice(-1)[0], cfo: c.cfo, ciso: c.ciso,
      comms: c.comms, journalist: c.journalist, outlet: c.outlet, scenario: C.brand.scenario,
    };
    return String(str).replace(/\{(\w+)\}/g, (m, k) => k in map ? map[k] : m);
  }
  const f = s => esc(fill(s));

  // Exécution annulable : quitter une vue ou relancer coupe tout proprement.
  // Après stop(), wait() ne rend plus jamais la main : la séquence s'arrête là.
  function makeRun({ instant = reduced } = {}) {
    const timers = new Set(), cleanups = [];
    let dead = false;
    return {
      get dead() { return dead; },
      wait(ms) { return new Promise(res => { if (dead) return; const t = setTimeout(() => { timers.delete(t); res(); }, instant ? Math.min(ms, 120) : ms); timers.add(t); }); },
      every(ms, fn) { const t = setInterval(() => dead || fn(), ms); cleanups.push(() => clearInterval(t)); },
      onStop(fn) { cleanups.push(fn); },
      stop() { if (dead) return; dead = true; timers.forEach(clearTimeout); cleanups.forEach(fn => fn()); },
    };
  }
  return {
    C, esc, $, $$, el, fill, f, makeRun, reduced,
    get bank() { return bank; },
    set bank(v) { bank = v.trim() || C.bank.name; },
  };
})();

window.OS = (() => {
  const { C, esc, $, $$, el, reduced } = UI;
  const os = $('#os'), views = $('#views'), nav = $('#nav');
  let skipping = false, current = null;
  const wait = ms => new Promise(r => skipping ? r() : setTimeout(r, reduced ? Math.min(ms, 60) : ms));

  /* ---------- Démarrage : BIOS → session → bureau ---------- */
  async function boot() {
    const bios = $('#bios');
    os.dataset.state = 'bios';
    Scene.screenOn(); Scene.setMood('boot'); Sound.boot();
    await wait(650);
    for (let i = 0; i < C.bios.length; i++) {
      const line = el('span', i === 0 ? 'l0' : '', esc(C.bios[i]).replace(/(OK|établi|déverrouillé)$/, '<span class="ok">$1</span>') + (i ? '\n' : ''));
      bios.append(line); Sound.key();
      await wait(i === 0 ? 420 : 150 + Math.random() * 190);
    }
    bios.append(el('span', 'cursor'));
    await wait(520);

    os.dataset.state = 'login';
    $('#loginMark').textContent = C.brand.console[0];
    const pass = $('#loginPass');
    await wait(450);
    for (let i = 0; i < 10; i++) { pass.append(el('i')); Sound.key(); await wait(70); }
    await wait(260);
    pass.classList.add('ok'); Sound.login();
    $('#loginGreet').textContent = C.brand.greeting; $('#loginGreet').classList.add('on');
    await wait(1500);
    openDesk();
  }
  function skip() { skipping = true; }

  function openDesk() {
    os.dataset.state = 'desk';
    document.body.classList.add('ready');
    const start = (location.hash || '').slice(1).split('/');
    go(C.nav.some(n => n.id === start[0]) ? start[0] : C.nav[0].id, { inject: start[1] });
  }

  /* ---------- Navigation ---------- */
  // Chaque vue : render(view) une seule fois, puis enter(opts) / leave() à chaque passage.
  const modules = {
    film: { render: v => Film.render(v), enter: () => Film.enter(), leave: () => Film.leave() },
    injects: { render: v => Injects.render(v), enter: o => Injects.enter(o.inject), leave: () => Injects.leave() },
    contact: { render: renderContact, enter: () => Scene.setMood('idle'), leave() {} },
  };
  function go(id, opts = {}) {
    if (current && current !== id) modules[current].leave();
    current = id;
    $$('button', nav).forEach(b => b.removeAttribute('aria-current'));
    const btn = $(`button[data-id="${id}"]`, nav); if (btn) btn.setAttribute('aria-current', 'page');
    $$('.view', views).forEach(v => v.classList.toggle('on', v.dataset.id === id));
    const view = $(`.view[data-id="${id}"]`, views);
    if (!view.dataset.ready) { modules[id].render(view); view.dataset.ready = '1'; }
    view.scrollTop = 0;
    try { history.replaceState(null, '', '#' + id + (opts.inject ? '/' + opts.inject : '')); } catch (e) { /* file:// */ }
    modules[id].enter(opts);
  }
  function buildChrome() {
    $('#barName').textContent = C.brand.console + (C.brand.firm ? ' — ' + C.brand.firm : '');
    $('#barScn').textContent = 'Scénario « ' + C.brand.scenario + ' »';
    for (const n of C.nav) {
      const b = el('button', '', esc(n.label)); b.type = 'button'; b.dataset.id = n.id;
      b.addEventListener('click', () => go(n.id)); nav.append(b);
      const v = el('section', 'view'); v.dataset.id = n.id; v.setAttribute('aria-label', n.label); views.append(v);
    }
  }

  /* ---------- Contact ---------- */
  function renderContact(view) {
    const c = C.contact, fl = c.fields;
    view.innerHTML = `
      <div class="contact">
        <div>
          <h2>${esc(c.title)}</h2>
          <p class="lead">${esc(c.lead)}</p>
          <dl class="kv"><dt>E-mail</dt><dd><a class="link" href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>${c.lines.map(l => `<dt>${esc(l.label)}</dt><dd>${esc(l.value)}</dd>`).join('')}</dl>
        </div>
        <form class="form" id="contactForm">
          <label>${esc(fl.name)}<input name="name" required autocomplete="name"></label>
          <label>${esc(fl.bank)}<input name="bank" required autocomplete="organization"></label>
          <label>${esc(fl.role)}<input name="role" autocomplete="organization-title"></label>
          <label>${esc(fl.email)}<input name="email" type="email" required autocomplete="email"></label>
          <label class="wide">${esc(fl.level)}<select name="level">${c.levelOptions.map(o => `<option>${esc(o)}</option>`).join('')}</select></label>
          <label class="wide">${esc(fl.message)}<textarea name="message"></textarea></label>
          <button class="btn" type="submit">${esc(c.submit)}</button>
          <p class="form-note wide" id="formNote">${esc(c.note)}</p>
        </form>
      </div>`;
    $('#contactForm', view).addEventListener('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const body = [`${fl.name} : ${d.name}`, `${fl.bank} : ${d.bank}`, `${fl.role} : ${d.role}`, `${fl.email} : ${d.email}`, `${fl.level} : ${d.level}`, '', d.message].join('\n');
      location.href = `mailto:${c.email}?subject=${encodeURIComponent('Simulation d’incident cyber — ' + d.bank)}&body=${encodeURIComponent(body)}`;
      const note = $('#formNote', view); note.textContent = c.sent; note.className = 'form-sent wide';
    });
  }

  // Décrochage bref de l'image (lancement d'un inject, coupe du film).
  function glitch() { os.classList.remove('glitch'); void os.offsetWidth; os.classList.add('glitch'); setTimeout(() => os.classList.remove('glitch'), 450); }
  // L'horloge de la barre suit l'heure fictive de l'exercice.
  function setClock(text) { $('#xclock').textContent = text; }

  /* ---------- Câblage global ---------- */
  buildChrome();
  // Liens internes : n'importe quel élément [data-go] navigue.
  os.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go, { inject: b.dataset.inject });
    if (e.target.closest('button, a, [role="tab"]')) Sound.click();
  });
  const soundBtn = $('#btnSound');
  const syncSound = () => soundBtn.setAttribute('aria-pressed', String(Sound.enabled));
  soundBtn.addEventListener('click', () => { Sound.setEnabled(!Sound.enabled); syncSound(); });
  $('#btnBack').addEventListener('click', () => Scene.dock(false));

  return { boot, skip, go, glitch, setClock, syncSound, get view() { return current; } };
})();
