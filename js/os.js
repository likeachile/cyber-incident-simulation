/* Le système affiché sur la dalle : démarrage, barre, navigation, horloge
   d'exercice, notifications, et les vues Mission / Dispositif / Pourquoi / Contact.
   La vue Injects est dans injects.js. Tous les textes viennent de content.js. */
window.UI = (() => {
  const C = window.CONTENT;
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
      comms: c.comms, journalist: c.journalist, outlet: c.outlet,
    };
    return String(str).replace(/\{(\w+)\}/g, (m, k) => k in map ? map[k] : m);
  }
  const f = s => esc(fill(s));
  return {
    C, esc, $, $$, el, fill, f,
    get bank() { return bank; },
    set bank(v) { bank = v.trim() || C.bank.name; },
  };
})();

window.OS = (() => {
  const { C, esc, $, $$, el, f } = UI;
  const os = $('#os'), views = $('#views'), nav = $('#nav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    Scene.setMood('idle');
    document.body.classList.add('ready');
    const start = (location.hash || '').slice(1).split('/');
    go(C.nav.some(n => n.id === start[0]) ? start[0] : 'mission', { inject: start[1] });
    setTimeout(startExercise, 3500);
  }

  /* ---------- Navigation ---------- */
  const renderers = {};
  function go(id, opts = {}) {
    if (current && current !== id && window.Injects) Injects.leave();
    current = id;
    $$('button', nav).forEach(b => b.toggleAttribute('aria-current', false));
    const btn = $(`button[data-id="${id}"]`, nav); if (btn) btn.setAttribute('aria-current', 'page');
    $$('.view', views).forEach(v => v.classList.toggle('on', v.dataset.id === id));
    const view = $(`.view[data-id="${id}"]`, views);
    if (!view.dataset.ready) { renderers[id](view); view.dataset.ready = '1'; }
    view.scrollTop = 0;
    if (id === 'injects') Injects.enter(opts.inject); else Scene.setMood('idle');
    if (id === 'mission') paintTimeline();
    try { history.replaceState(null, '', '#' + id + (opts.inject ? '/' + opts.inject : '')); } catch (e) { /* file:// */ }
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

  /* ---------- Vues ---------- */
  renderers.mission = view => {
    const m = C.mission;
    view.innerHTML = `
      <div class="mission">
        <div class="mission-main">
          <h2>${esc(m.title)}</h2>
          <p class="lead">${esc(m.lead)}</p>
          <div class="mission-body">${m.body.map(p => `<p>${esc(p)}</p>`).join('')}</div>
          <p class="mission-not">${esc(m.not)}</p>
          <div class="mission-cta">
            <button class="btn" type="button" data-go="injects">${esc(m.cta)}</button>
            <p class="fact"><b>${esc(m.fact.figure)}</b><span>${esc(m.fact.text)}</span></p>
          </div>
        </div>
        <div class="questions">
          <h3>${esc(m.questionsTitle)}</h3>
          <ol>${m.questions.map(q => `<li><div><strong>${esc(q.when)}</strong><span>${esc(q.ask)}</span></div></li>`).join('')}</ol>
        </div>
        <div class="tl">
          <div class="tl-head"><h3>${esc(m.timelineTitle)}</h3><span>${esc(m.timelineHint)}</span></div>
          <div class="tl-track" id="tlTrack"><span class="tl-fill" id="tlFill"></span>${C.timeline.map((e, i) => `
            <button type="button" class="tl-tick${e.inject ? ' has' : ''}" data-i="${i}" aria-label="${esc(C.days[e.day] + ' ' + e.time + ' : ' + e.text)}">
              ${i === 0 || C.timeline[i - 1].day !== e.day ? `<span class="tl-day">${esc(C.days[e.day])}</span>` : ''}<i></i><span>${esc(e.time)}</span>
            </button>`).join('')}
          </div>
          <div class="tl-cap" id="tlCap" aria-live="polite"></div>
        </div>
      </div>`;
    $$('.tl-tick', view).forEach(b => {
      const pick = () => { tlPinned = +b.dataset.i; paintTimeline(); };
      b.addEventListener('click', pick); b.addEventListener('mouseenter', pick);
    });
    $('#tlTrack', view).addEventListener('mouseleave', () => { tlPinned = null; paintTimeline(); });
  };

  renderers.dispositif = view => {
    const d = C.dispositif;
    view.innerHTML = `
      <h2>${esc(d.title)}</h2>
      <p class="lead">${esc(d.lead)}</p>
      <ol class="phases">${d.phases.map(p => `<li><h3>${esc(p.name)}</h3><ul>${p.points.map(x => `<li>${esc(x)}</li>`).join('')}</ul></li>`).join('')}</ol>
      <div class="levels">
        <h3>${esc(d.levelsTitle)}</h3>
        <div class="level-tabs" role="tablist">${d.levels.map((l, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${i === 1}"><small>${esc(l.tag)}</small><span>${esc(l.name)}</span></button>`).join('')}</div>
        <div class="level-panel" id="levelPanel" role="tabpanel"></div>
      </div>
      <div class="process"><h3>${esc(d.processTitle)}</h3><ol>${d.process.map(p => `<li>${esc(p)}</li>`).join('')}</ol></div>`;
    const show = i => {
      const l = d.levels[i];
      $$('.level-tabs button', view).forEach(b => b.setAttribute('aria-selected', +b.dataset.i === i));
      $('#levelPanel', view).innerHTML = `
        <p class="focus">${esc(l.focus)}</p>
        <dl class="kv">
          <dt>Format</dt><dd>${esc(l.format)}</dd>
          <dt>Participants</dt><dd>${esc(l.audience)}</dd>
          <dt>Injects adaptés</dt><dd>${l.injects.map(id => `<button class="link" type="button" data-go="injects" data-inject="${id}">${esc(C.injects.find(x => x.id === id).name)}</button>`).join('')}</dd>
        </dl>`;
    };
    $$('.level-tabs button', view).forEach(b => b.addEventListener('click', () => show(+b.dataset.i)));
    show(1);
  };

  renderers.pourquoi = view => {
    const p = C.pourquoi;
    view.innerHTML = `
      <h2>${esc(p.title)}</h2>
      <p class="lead">${esc(p.lead)}</p>
      <table class="compare">
        <thead><tr>${p.compareHead.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${p.compare.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody>
      </table>
      <div class="why-grid">
        <div><h3>${esc(p.valuesTitle)}</h3><dl class="values">${p.values.map(v => `<div><dt>${esc(v.name)}</dt><dd>${esc(v.text)}</dd></div>`).join('')}</dl></div>
        <div><h3>${esc(p.benefitsTitle)}</h3><ul class="benefits">${p.benefits.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>
      </div>`;
  };

  renderers.contact = view => {
    const c = C.contact, fl = c.fields;
    view.innerHTML = `
      <div class="contact">
        <div>
          <h2>${esc(c.title)}</h2>
          <p class="lead">${esc(c.lead)}</p>
          <ol class="steps">${c.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
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
  };
  renderers.injects = view => Injects.render(view);

  /* ---------- Horloge d'exercice : la chronologie du 2-pager défile en fond ---------- */
  const TL = C.timeline, STEP = 22000;
  const dayIndex = { Lun: 0, Mar: 1, Mer: 2 };
  const minutes = e => dayIndex[e.day] * 1440 + (+e.time.slice(0, 2)) * 60 + (+e.time.slice(3));
  let tlIndex = -1, tlPinned = null, tlSince = 0;
  function clockText(min) {
    const d = Object.keys(dayIndex)[Math.floor(min / 1440)], m = Math.floor(min % 1440);
    return `${C.days[d]} ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }
  function startExercise() { fire(0); setInterval(tickClock, 1000); }
  function fire(i) {
    tlIndex = i; tlSince = performance.now();
    const e = TL[i];
    $('#feed').innerHTML = `<b>${esc(e.day + ' ' + e.time)}</b>${esc(e.text)}`;
    paintTimeline();
    // Pas de notification par-dessus une démo en cours ni pendant la saisie du formulaire.
    if (!(window.Injects && Injects.busy) && current !== 'contact') {
      toast({ time: e.day + ' ' + e.time, text: e.text, onClick: () => e.inject ? go('injects', { inject: e.inject }) : go('mission') });
      Sound.soft();
    }
    setTimeout(() => fire((i + 1) % TL.length), i === TL.length - 1 ? STEP * 1.6 : STEP);
  }
  function tickClock() {
    if (tlIndex < 0) return;
    const a = minutes(TL[tlIndex]), next = TL[tlIndex + 1], b = next ? minutes(next) : a + 120;
    const k = Math.min(.98, (performance.now() - tlSince) / STEP);
    $('#xclock').textContent = clockText(a + (b - a) * k);
    const fillEl = $('#tlFill'); if (fillEl) fillEl.style.width = ((tlIndex + .5 + k) / TL.length * 100).toFixed(2) + '%';
  }
  function paintTimeline() {
    const cap = $('#tlCap'); if (!cap) return;
    const shown = tlPinned != null ? tlPinned : Math.max(0, tlIndex), e = TL[shown];
    $$('.tl-tick').forEach((b, i) => { b.classList.toggle('past', i <= tlIndex); b.classList.toggle('sel', i === shown); });
    cap.innerHTML = `<time>${esc(C.days[e.day] + ' ' + e.time)}</time><p>${esc(e.text)}</p>` +
      (e.inject ? `<button class="link" type="button" data-go="injects" data-inject="${e.inject}">Ouvrir l’inject</button>` : '');
  }

  /* ---------- Notifications ---------- */
  function toast({ time, text, calm, onClick, ttl = 6500 }) {
    const host = $('#toasts');
    while (host.children.length >= 3) host.firstChild.remove();
    const t = el('button', 'toast' + (calm ? ' calm' : ''), `<time>${esc(time)}</time><span>${esc(text)}</span>`);
    t.type = 'button';
    const close = () => { t.classList.add('out'); setTimeout(() => t.remove(), 300); };
    t.addEventListener('click', () => { close(); if (onClick) onClick(); });
    host.append(t); setTimeout(close, ttl);
  }
  function glitch() { os.classList.remove('glitch'); void os.offsetWidth; os.classList.add('glitch'); setTimeout(() => os.classList.remove('glitch'), 450); }

  /* ---------- Câblage global ---------- */
  buildChrome();
  // Liens internes : n'importe quel élément [data-go] navigue.
  os.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go, { inject: b.dataset.inject });
    if (e.target.closest('button, a, [role="tab"]')) Sound.click();
  });
  const soundBtn = $('#btnSound');
  const syncSound = () => soundBtn.setAttribute('aria-pressed', String(Sound.enabled));
  soundBtn.addEventListener('click', () => { Sound.setEnabled(!Sound.enabled); Sound.rain(Sound.enabled); syncSound(); });
  $('#btnBack').addEventListener('click', () => Scene.dock(false));

  return { boot, skip, go, toast, glitch, syncSound, get view() { return current; } };
})();
