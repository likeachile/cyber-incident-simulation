/* Vue Injects : la liste, la scène de démo, la fiche et le journal de la régie.
   Chaque inject est un module { mood, render(body, data) → dispose, launch(run, data, body) }.
   render() affiche l'aperçu statique ; launch() joue la simulation.
   Les contenus (textes, fichiers audio et vidéo) sont dans content.js. */
window.Injects = (() => {
  const { C, esc, $, $$, el, fill, f } = UI;
  const I = C.injectsIntro;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let root, body, logEl, launchBtn, active = null, run = null, dispose = null, busy = false, t0 = 0;

  /* ---------- Exécution annulable : changer d'inject coupe tout proprement ---------- */
  function makeRun() {
    const timers = new Set(), cleanups = [];
    let dead = false;
    return {
      get dead() { return dead; },
      wait(ms) { return new Promise(res => { if (dead) return; const t = setTimeout(() => { timers.delete(t); res(); }, reduced ? Math.min(ms, 120) : ms); timers.add(t); }); },
      every(ms, fn) { const t = setInterval(() => dead || fn(), ms); cleanups.push(() => clearInterval(t)); },
      onStop(fn) { cleanups.push(fn); },
      stop() { dead = true; timers.forEach(clearTimeout); cleanups.forEach(fn => fn()); },
    };
  }
  function log(text, tone) {
    const s = Math.floor((performance.now() - t0) / 1000);
    const li = el('li', tone || '', `<time>+${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}</time><span>${esc(text)}</span>`);
    if (logEl.firstElementChild && logEl.firstElementChild.classList.contains('empty')) logEl.innerHTML = '';
    logEl.append(li); logEl.scrollTop = logEl.scrollHeight;
  }
  // Décision laissée au visiteur (content.js → decision).
  function decide(r, box, d) {
    return new Promise(res => {
      box.innerHTML = `<p>${f(d.prompt)}</p><div class="decide-opts">${d.options.map((o, i) => `<button type="button" class="opt" data-i="${i}">${f(o.label)}</button>`).join('')}</div>`;
      box.hidden = false;
      $$('.opt', box).forEach(b => b.addEventListener('click', () => {
        if (r.dead) return;
        const o = d.options[+b.dataset.i];
        box.innerHTML = `<p class="outcome ${o.bad ? 'bad' : 'good'}">${f(o.outcome)}</p>`;
        log(fill(o.outcome), o.bad ? 'bad' : 'good');
        if (o.bad) { Scene.pulse(1.3); Sound.alert(); OS.glitch(); } else Sound.login();
        res(o);
      }));
    });
  }
  const initials = name => name.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  /* ---------- Horloge de lecture simulée (tant qu'aucun fichier média n'est fourni) ---------- */
  function simClock(dur, onTick, onEnd) {
    let t = 0, playing = false, raf = 0, last = 0;
    const step = ms => {
      if (!playing) return;
      t = Math.min(dur, t + (ms - last) / 1000); last = ms; onTick(t);
      if (t >= dur) { playing = false; onEnd && onEnd(); } else raf = requestAnimationFrame(step);
    };
    return {
      get t() { return t; }, get dur() { return dur; }, get playing() { return playing; },
      play() { if (playing) return; if (t >= dur) t = 0; playing = true; last = performance.now(); raf = requestAnimationFrame(step); },
      pause() { playing = false; cancelAnimationFrame(raf); },
      seek(v) { t = Math.max(0, Math.min(dur, v)); onTick(t); },
    };
  }

  // Forme d'onde « parlée » : rafales de syllabes séparées par des respirations.
  function wavePeaks(n, seed) {
    let s = seed;
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const out = []; let word = 0, level = 0;
    for (let i = 0; i < n; i++) {
      if (word <= 0) { word = 4 + Math.floor(rnd() * 14); level = rnd() < .16 ? 0 : .35 + rnd() * .65; }
      word--;
      out.push(level ? Math.max(.06, level * (.35 + rnd() * .65)) : .03 + rnd() * .04);
    }
    return out;
  }
  function drawWave(canvas, peaks, progress, color) {
    const dpr = Math.min(2, devicePixelRatio || 1), w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w) return;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const n = peaks.length, bw = w / n;
    for (let i = 0; i < n; i++) {
      const ph = Math.max(1.5, peaks[i] * h * .92);
      g.fillStyle = i / n < progress ? color : 'rgba(150,170,205,.3)';
      g.fillRect(i * bw, (h - ph) / 2, Math.max(1, bw - 1.4), ph);
    }
  }

  const mods = {};

  /* ======================================================================
     Messages : e-mail, messagerie d'équipe, messagerie mobile
     ====================================================================== */
  mods.messages = (() => {
    let channel = 'mail';
    function mailHTML(ch, items, sel) {
      const m = items[sel];
      return `<div class="mail">
        <ul class="mail-list">${items.map((it, i) => `<li><button type="button" class="mail-item${i === sel ? ' sel' : ''}${it.hot ? ' hot' : ''}" data-i="${ch.inbox.indexOf(it)}">
          <span class="mail-from">${f(it.from)}</span><time>${esc(it.time)}</time><span class="mail-subj">${f(it.subject)}</span></button></li>`).join('')}</ul>
        <article class="mail-read">${m ? `
          <h4>${f(m.subject)}</h4>
          <p class="mail-meta"><b>${f(m.from)}</b> &lt;${f(m.addr)}&gt;<br>À : ${f('{ceo}')} · ${esc(m.time)}</p>
          <div class="mail-body">${m.body.map(p => `<p>${f(p)}</p>`).join('')}</div>
          ${m.attachment ? `<p class="mail-att">${f(m.attachment)}</p>` : ''}` : '<p class="mail-empty">Boîte de réception vide.</p>'}
        </article></div>`;
    }
    function msgNode(m, skin) {
      const li = el('li', 'msg' + (m.ext || m.unknown ? ' odd' : ''));
      const who = fill(m.who);
      li.innerHTML = `${skin === 'teams' ? `<span class="msg-av">${esc(initials(who))}</span>` : ''}
        <div class="msg-b"><p class="msg-who"><b>${esc(who)}</b>${m.role ? `<i>${esc(m.role)}</i>` : ''}${m.unknown ? '<i>Numéro inconnu</i>' : ''}<time>${esc(m.time)}</time></p><p class="msg-t">${f(m.text)}</p></div>`;
      return li;
    }
    function threadHTML(ch) {
      return `<div class="th th-${ch.skin}">
        <header class="th-head"><b>${f(ch.title)}</b>${ch.sub ? `<span>${f(ch.sub)}</span>` : ''}</header>
        <ol class="th-list"></ol><div class="decide" hidden></div></div>`;
    }
    function paint(host, data, upTo) {
      const ch = data.channels.find(c => c.id === channel), pane = $('.ch-pane', host);
      $$('.ch-tabs button', host).forEach(b => b.setAttribute('aria-selected', b.dataset.id === channel));
      if (ch.inbox) {
        const items = upTo == null ? ch.inbox : ch.inbox.slice(0, upTo).reverse(), sel = upTo == null ? 0 : items.length - 1;
        const draw = s => {
          pane.innerHTML = mailHTML(ch, items, s);
          $$('.mail-item', pane).forEach((b, i) => b.addEventListener('click', () => draw(i)));
        };
        draw(Math.max(0, sel));
      } else {
        pane.innerHTML = threadHTML(ch);
        if (upTo == null) ch.thread.forEach(m => $('.th-list', pane).append(msgNode(m, ch.skin)));
      }
      return ch;
    }
    return {
      mood: 'idle',
      render(host, data) {
        host.innerHTML = `<div class="ch"><div class="ch-tabs" role="tablist">${data.channels.map(c => `<button type="button" role="tab" data-id="${c.id}">${esc(c.label)}</button>`).join('')}</div><div class="ch-pane"></div></div>`;
        $$('.ch-tabs button', host).forEach(b => b.addEventListener('click', () => { if (busy) stop(); channel = b.dataset.id; paint(host, data); }));
        paint(host, data);
      },
      async launch(r, data, host) {
        const ch = paint(host, data, 0), pane = $('.ch-pane', host);
        if (ch.inbox) {
          for (let i = 1; i <= ch.inbox.length; i++) {
            await r.wait(i === 1 ? 700 : 2600);
            paint(host, data, i); Sound.message();
            const m = ch.inbox[i - 1];
            log(`${m.time} — e-mail remis : « ${fill(m.subject)} »`, m.hot ? 'bad' : '');
            if (m.hot) { Scene.pulse(.9); $('.mail-read', pane).classList.add('reveal'); }
          }
          await r.wait(900); log('Aucune escalade enregistrée à ce stade.');
          return;
        }
        const list = $('.th-list', pane);
        if (ch.skin === 'wa') Scene.phone({ mode: 'msg', app: 'WhatsApp', title: fill(ch.title), sub: 'Nouveaux messages', clock: '08:31' });
        for (const m of ch.thread) {
          const typing = el('li', 'msg typing', `<div class="msg-b"><p class="msg-t"><i></i><i></i><i></i></p></div>`);
          list.append(typing); list.scrollTop = list.scrollHeight;
          await r.wait(500 + Math.min(1100, m.text.length * 10));
          typing.remove(); list.append(msgNode(m, ch.skin)); list.scrollTop = list.scrollHeight; Sound.message();
          if (m.ext || m.unknown) { log(`${m.time} — message d’un interlocuteur non vérifié`, 'bad'); Scene.pulse(.5); }
          await r.wait(500);
        }
        log('Fil remis. En attente de la réaction du destinataire.');
        await decide(r, $('.decide', pane), ch.decision);
      },
    };
  })();

  /* ======================================================================
     Article de presse
     ====================================================================== */
  mods.fakenews = {
    mood: 'paper',
    render(host, data) {
      const a = data.article;
      host.innerHTML = `<div class="browser">
        <div class="browser-bar"><span class="browser-dots"><i></i><i></i><i></i></span><span class="browser-url">${f(a.url)}</span><span class="browser-reach" hidden>Reprises <b>0</b></span></div>
        <div class="paper">
          <header class="paper-mast"><span class="paper-name">${f('{outlet}')}</span><span class="paper-date">${esc(a.date)}</span></header>
          <article>
            <p class="paper-kicker"><b>${esc(a.flag)}</b>${esc(a.section)}</p>
            <h4 class="paper-h">${f(a.headline)}</h4>
            <p class="paper-stand">${f(a.standfirst)}</p>
            <p class="paper-by">${esc(a.byline)}</p>
            <div class="paper-cols">
              <div class="paper-body">
                ${a.image ? `<figure><img src="${esc(a.image)}" alt=""><figcaption>${esc(a.caption)}</figcaption></figure>` : ''}
                ${a.body.map((p, i) => `<p>${f(p)}</p>${i === 1 ? `<blockquote>${f(a.quote)}</blockquote>` : ''}`).join('')}
              </div>
              <aside class="paper-aside"><h5>À lire aussi</h5><ul>${a.aside.map(x => `<li>${esc(x)}</li>`).join('')}</ul></aside>
            </div>
          </article>
        </div>
        <div class="ripples" aria-live="polite"></div>
      </div>`;
    },
    async launch(r, data, host) {
      const h = $('.paper-h', host), full = fill(data.article.headline), reach = $('.browser-reach', host), box = $('.ripples', host);
      $('.paper', host).scrollTop = 0; $('.paper', host).classList.add('fresh');
      h.textContent = ''; reach.hidden = false;
      log('Article mis en ligne sur le site miroir de l’exercice.');
      for (let i = 1; i <= full.length; i++) { h.textContent = full.slice(0, i); if (i % 3 === 0) Sound.key(); await r.wait(16); }
      let n = 0; r.every(180, () => { n += 1 + Math.floor(Math.random() * 9); $('b', reach).textContent = n.toLocaleString('fr-CH'); });
      let prev = 0;
      for (const rip of data.ripples) {
        await r.wait(rip.at - prev); prev = rip.at;
        box.append(el('div', 'ripple', `<b>${f(rip.title)}</b><span>${f(rip.text)}</span>`));
        Sound.notify(); Scene.pulse(.45); log(`${fill(rip.title)} : ${fill(rip.text)}`, 'bad');
      }
      await r.wait(1600);
      log('Pression médiatique installée. La cellule n’a pas encore d’élément de langage.');
    },
  };

  /* ======================================================================
     Appel entrant
     ====================================================================== */
  mods.call = {
    mood: 'idle',
    render(host, data) {
      const c = data.caller, name = fill(c.name);
      host.innerHTML = `<div class="call">
        <div class="call-id">
          <div class="call-av">${esc(initials(name))}</div>
          <div class="call-name">${esc(name)}</div>
          <div class="call-sub">${f(c.sub)} · ${esc(c.number)}</div>
          <div class="call-state">Un message vocal en attente</div>
          <div class="call-bars" aria-hidden="true">${'<i></i>'.repeat(28)}</div>
        </div>
        <ol class="call-log"><li class="them"><b>Messagerie</b><p>${f(data.voicemail)}</p></li></ol>
        <div class="call-actions"><button type="button" class="opt" data-act="vm">Écouter le message vocal</button></div>
      </div>`;
      $('[data-act="vm"]', host).addEventListener('click', () => {
        const bars = $('.call-bars', host); bars.classList.add('on');
        const done = () => bars.classList.remove('on');
        if (!Sound.speak(fill(data.voicemail), { onend: done })) setTimeout(done, 4200);
      });
      return () => Sound.hush();
    },
    async launch(r, data, host) {
      const c = data.caller, name = fill(c.name), state = $('.call-state', host), logList = $('.call-log', host), actions = $('.call-actions', host), bars = $('.call-bars', host), callEl = $('.call', host);
      const say = async (who, text, cls) => {
        logList.append(el('li', cls, `<b>${esc(who)}</b><p>${esc(text)}</p>`)); logList.scrollTop = logList.scrollHeight;
        if (cls !== 'them') return r.wait(450);
        bars.classList.add('on');
        // La réplique dure le temps de la voix de synthèse, ou un temps de lecture.
        await new Promise(res => {
          let done = false; const end = () => { if (!done) { done = true; res(); } };
          const spoken = Sound.speak(text, { onend: end });
          r.wait(spoken ? text.length * 85 + 2500 : 900 + text.length * 38).then(end);
        });
        bars.classList.remove('on');
      };
      const ask = options => new Promise(res => {
        actions.innerHTML = options.map((o, i) => `<button type="button" class="opt${o.cls ? ' ' + o.cls : ''}" data-i="${i}">${f(o.label)}</button>`).join('');
        $$('.opt', actions).forEach(b => b.addEventListener('click', () => { if (!r.dead) { actions.innerHTML = ''; res(options[+b.dataset.i]); } }));
      });
      r.onStop(() => { Sound.stopRing(); Sound.hush(); Scene.phone({ mode: 'off' }); });

      logList.innerHTML = ''; callEl.classList.add('ringing'); state.textContent = 'Appel entrant…';
      Sound.ring(); Scene.setMood('call'); Scene.phone({ mode: 'call', title: name, sub: fill(c.sub), ring: true });
      log('14:20 — appel présenté sur la ligne directe du CEO.');
      const pick = await ask([{ label: 'Décrocher', cls: 'go', id: 'yes' }, { label: 'Refuser', cls: 'no', id: 'no' }]);
      Sound.stopRing(); callEl.classList.remove('ringing');

      if (pick.id === 'no') {
        Sound.hangup(); Scene.phone({ mode: 'off' }); Scene.setMood('idle'); state.textContent = 'Appel refusé';
        for (const line of data.declined) { await r.wait(1100); logList.append(el('li', 'sys', `<p>${f(line)}</p>`)); log(fill(line), 'bad'); Sound.soft(); }
        Scene.pulse(.8);
        return;
      }
      const started = performance.now(); callEl.classList.add('live');
      Scene.phone({ mode: 'call', title: name, sub: 'En ligne' });
      let live = true;
      r.every(1000, () => { if (live) state.textContent = 'En ligne · ' + fmt((performance.now() - started) / 1000); });
      state.textContent = 'En ligne · 0:00'; log('Appel décroché.');
      let leak = 0;
      for (const turn of data.script) {
        await say(name, fill(turn.say), 'them');
        const o = await ask(turn.options);
        await say('Vous', fill(o.label), 'me');
        leak += o.leak;
        if (o.leak) { log(`Information confirmée : « ${fill(o.label)} »`, 'bad'); Scene.pulse(.5); }
        await say(name, fill(o.reply), 'them');
      }
      live = false;
      Sound.hangup(); callEl.classList.remove('live'); Scene.phone({ mode: 'off' }); Scene.setMood('idle');
      const dur = fmt((performance.now() - started) / 1000);
      state.textContent = 'Appel terminé · ' + dur;
      const verdict = data.verdict[Math.min(2, leak)];
      logList.append(el('li', 'sys ' + (leak ? 'bad' : 'good'), `<p>${esc(verdict)}</p>`)); logList.scrollTop = logList.scrollHeight;
      log(`Appel terminé, ${dur}. ${verdict}`, leak ? 'bad' : 'good');
    },
  };

  /* ======================================================================
     Voix clonée
     ====================================================================== */
  mods.voice = (() => {
    let player = null;
    return {
      mood: 'idle',
      render(host, data) {
        const words = fill(data.transcript).split(' ');
        host.innerHTML = `<div class="vc">
          <div class="vc-row">
            <div class="vc-meta"><b>${esc(data.source.label)}</b><span>${esc(data.source.detail)}</span></div>
            <canvas class="vc-wave vc-src"></canvas>
          </div>
          <ol class="vc-steps">${data.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
          <div class="vc-row vc-clone">
            <div class="vc-meta"><b>${esc(data.clone.label)}</b><span>${f(data.clone.detail)}</span></div>
            <div class="vc-player">
              <button type="button" class="vc-play" aria-label="Lire la voix clonée"><svg viewBox="0 0 24 24"><path class="p" d="M8 5v14l11-7z"/><path class="s" d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></button>
              <canvas class="vc-wave vc-main" role="slider" tabindex="0" aria-label="Position dans le message"></canvas>
              <span class="vc-time">0:00 / ${fmt(data.duration)}</span>
            </div>
          </div>
          <p class="vc-text">${words.map(w => `<span>${esc(w)}</span>`).join(' ')}</p>
          <div class="decide" hidden></div>
        </div>`;
        const src = $('.vc-src', host), main = $('.vc-main', host), btn = $('.vc-play', host), time = $('.vc-time', host), spans = $$('.vc-text span', host);
        const srcPeaks = wavePeaks(120, 7), peaks = wavePeaks(150, 42);
        let dur = data.duration, audio = null, clock = null;
        const paint = t => {
          drawWave(main, peaks, t / dur, '#f0483e');
          time.textContent = `${fmt(t)} / ${fmt(dur)}`;
          const idx = Math.floor(t / dur * spans.length);
          spans.forEach((s, i) => s.classList.toggle('on', i < idx || t >= dur));
        };
        const ended = () => { btn.classList.remove('playing'); if (player && player.onEnd) player.onEnd(); };
        clock = simClock(dur, paint, ended);
        if (data.audio) {
          audio = new Audio(data.audio); audio.preload = 'metadata';
          audio.addEventListener('loadedmetadata', () => { dur = audio.duration || dur; paint(0); });
          audio.addEventListener('timeupdate', () => paint(audio.currentTime));
          audio.addEventListener('ended', ended);
          audio.addEventListener('error', () => { audio = null; });
        }
        player = {
          onEnd: null,
          get playing() { return audio ? !audio.paused : clock.playing; },
          play(fromStart) {
            if (fromStart) this.seek(0);
            btn.classList.add('playing');
            if (audio) { audio.muted = !Sound.enabled; audio.play().catch(() => {}); }
            else { if (clock.t === 0 || clock.t >= dur) Sound.speak(fill(data.transcript), { rate: .98, pitch: .8 }); clock.play(); }
          },
          pause() { btn.classList.remove('playing'); if (audio) audio.pause(); else { clock.pause(); Sound.hush(); } },
          seek(t) { if (audio) audio.currentTime = t; else { clock.seek(t); Sound.hush(); } },
        };
        btn.addEventListener('click', () => player.playing ? player.pause() : player.play());
        const seekAt = e => { const b = main.getBoundingClientRect(); player.seek(Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)) * dur); };
        main.addEventListener('pointerdown', e => { seekAt(e); main.setPointerCapture(e.pointerId); main.onpointermove = seekAt; });
        main.addEventListener('pointerup', () => { main.onpointermove = null; });
        main.addEventListener('keydown', e => { if (e.key === 'ArrowRight') player.seek((audio ? audio.currentTime : clock.t) + 2); if (e.key === 'ArrowLeft') player.seek((audio ? audio.currentTime : clock.t) - 2); });
        requestAnimationFrame(() => { drawWave(src, srcPeaks, 0, '#fff'); paint(0); });
        return () => { player.pause(); player = null; };
      },
      async launch(r, data, host) {
        const steps = $$('.vc-steps li', host), p = player;
        $('.vc', host).classList.add('running');
        r.onStop(() => { p.pause(); Scene.phone({ mode: 'off' }); });
        for (let i = 0; i < steps.length; i++) {
          steps[i].classList.add('doing'); Sound.key();
          await r.wait(i === 1 ? 1500 : 950);
          steps[i].classList.replace('doing', 'done'); log(data.steps[i]);
        }
        Scene.phone({ mode: 'msg', app: 'Message vocal', title: fill('{ceo}'), sub: fmt(data.duration) + ' · à l’instant', clock: '13:15' });
        Sound.message(); Scene.pulse(.9); log('13:15 — message vocal remis sur le mobile du CFO.', 'bad');
        await r.wait(900);
        await new Promise(res => { p.onEnd = res; p.play(true); });
        log('Message écouté jusqu’au bout.');
        await decide(r, $('.decide', host), data.decision);
        Scene.phone({ mode: 'off' });
      },
    };
  })();

  /* ======================================================================
     Deepfake vidéo
     ====================================================================== */
  mods.deepfake = (() => {
    let player = null;
    // Écran de substitution quand aucun fichier vidéo n'est lisible.
    function drawStandIn(canvas, t) {
      const w = canvas.width = 360, h = canvas.height = 640, g = canvas.getContext('2d');
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#111a2c'); bg.addColorStop(1, '#05070c');
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      const cx = w / 2 + Math.sin(t * 1.3) * 6, cy = h * .4 + Math.sin(t * 2.1) * 4;
      g.fillStyle = '#1b2437'; g.beginPath(); g.ellipse(cx, cy, 78, 100, 0, 0, 6.283); g.fill();
      g.beginPath(); g.ellipse(cx, h * .86, 170, 150, 0, 0, 6.283); g.fill();
      g.strokeStyle = 'rgba(75,132,255,.55)'; g.lineWidth = 1;
      for (let i = 0; i < 9; i++) for (let j = 0; j < 11; j++) {
        const a = (i - 4) / 4, b = (j - 5) / 5; if (a * a + b * b > 1) continue;
        const x = cx + a * 70 + Math.sin(t * 3 + j) * 1.5, y = cy + b * 92 + Math.cos(t * 2.4 + i) * 1.5;
        g.strokeRect(x - 1, y - 1, 2, 2);
        if (i < 8 && ((i - 3) / 4) ** 2 + b * b <= 1) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 17.5, y + Math.sin(t * 2 + i + j) * 2); g.stroke(); }
      }
      const sy = (t * 140) % h; g.fillStyle = 'rgba(75,132,255,.16)'; g.fillRect(0, sy, w, 3);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.font = '14px "JetBrains Mono", monospace'; g.textAlign = 'center';
      g.fillText('vidéo à fournir', w / 2, h - 28);
    }
    return {
      mood: 'idle',
      render(host, data) {
        host.innerHTML = `<div class="df">
          <div class="df-phone">
            <div class="df-media"></div>
            <div class="df-ctrl">
              <button type="button" class="df-play" aria-label="Lire la vidéo"><svg viewBox="0 0 24 24"><path class="p" d="M8 5v14l11-7z"/><path class="s" d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></button>
              <input class="df-seek" type="range" min="0" max="1000" value="0" aria-label="Position dans la vidéo">
              <span class="df-time">0:00</span>
              <button type="button" class="df-mute" aria-label="Couper ou rétablir le son de la vidéo" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path class="w" d="M15.5 9a4.5 4.5 0 0 1 0 6"/><path class="x" d="M15.5 9.5l5 5m0-5l-5 5"/></svg></button>
            </div>
          </div>
          <div class="df-side">
            <p class="df-from">Message vidéo de <b>${f(data.from)}</b>, reçu ${esc(active.when)}</p>
            <blockquote lang="en">${esc(data.transcript)}</blockquote>
            <p class="df-tr">${esc(data.translation)}</p>
            <p class="df-note">${esc(data.note)}</p>
            <ol class="df-clues">${data.clues.map(c => `<li><time>${fmt(c.at)}</time><span>${esc(c.text)}</span></li>`).join('')}</ol>
            <div class="decide" hidden></div>
          </div>
        </div>`;
        const media = $('.df-media', host), btn = $('.df-play', host), seek = $('.df-seek', host), time = $('.df-time', host), mute = $('.df-mute', host), clues = $$('.df-clues li', host);
        let video = null, clock = null, dur = 13, muted = !Sound.enabled;
        const paint = t => {
          seek.value = Math.round(t / dur * 1000); time.textContent = fmt(t);
          clues.forEach((li, i) => {
            const on = t >= data.clues[i].at;
            if (on && !li.classList.contains('on') && player && player.onClue) player.onClue(data.clues[i]);
            li.classList.toggle('on', on);
          });
        };
        const ended = () => { btn.classList.remove('playing'); if (player && player.onEnd) player.onEnd(); };
        function standIn() {
          video = null; media.innerHTML = '<canvas class="df-canvas"></canvas>';
          const cv = $('canvas', media); drawStandIn(cv, 0);
          clock = simClock(dur, t => { drawStandIn(cv, t); paint(t); }, ended);
        }
        if (data.video) {
          video = el('video'); video.playsInline = true; video.preload = 'metadata'; video.src = data.video;
          if (data.poster) video.poster = data.poster;
          video.addEventListener('loadedmetadata', () => { dur = video.duration || dur; });
          video.addEventListener('timeupdate', () => paint(video.currentTime));
          video.addEventListener('ended', ended);
          video.addEventListener('error', standIn);
          video.addEventListener('click', () => btn.click());
          media.append(video);
        } else standIn();
        const syncMute = () => { mute.setAttribute('aria-pressed', String(muted)); if (video) video.muted = muted; };
        syncMute();
        player = {
          onEnd: null, onClue: null,
          get playing() { return video ? !video.paused && !video.ended : clock.playing; },
          play(fromStart) {
            if (fromStart) { clues.forEach(li => li.classList.remove('on')); this.seek(0); }
            btn.classList.add('playing'); Scene.setMood('video');
            if (video) video.play().catch(() => { muted = true; syncMute(); video.play().catch(() => {}); }); else clock.play();
          },
          pause() { btn.classList.remove('playing'); if (video) video.pause(); else clock.pause(); },
          seek(t) { if (video) { try { video.currentTime = t; } catch (e) { /* métadonnées pas encore là */ } } else clock.seek(t); },
        };
        btn.addEventListener('click', () => player.playing ? player.pause() : player.play());
        seek.addEventListener('input', () => player.seek(seek.value / 1000 * dur));
        mute.addEventListener('click', () => { muted = !muted; syncMute(); });
        return () => { if (player) player.pause(); player = null; Scene.setMood('idle'); };
      },
      async launch(r, data, host) {
        const p = player;
        r.onStop(() => { p.pause(); Scene.phone({ mode: 'off' }); });
        Scene.phone({ mode: 'msg', app: 'Vidéo', title: fill(data.from), sub: 'Message vidéo · 0:13', clock: '18:10' });
        Sound.message(); Scene.pulse(.9); log('18:10 — message vidéo remis au CFO.', 'bad');
        $('.df-phone', host).classList.add('incoming');
        await r.wait(1100);
        p.onClue = c => log(c.text);
        await new Promise(res => { p.onEnd = res; p.play(true); });
        log('Vidéo vue jusqu’au bout.');
        await decide(r, $('.decide', host), data.decision);
        Scene.phone({ mode: 'off' }); Scene.setMood('idle');
      },
    };
  })();

  /* ======================================================================
     Agent IA : scripts à règles, ou vrai modèle si content.js fournit un endpoint
     ====================================================================== */
  mods.agent = (() => {
    let roleId = null, session = null;
    const METERS = [
      { re: /qui (êtes|es)|ticket|matricule|badge|vérif|identité|preuve|rappel|numéro officiel|valid|autoris/i, tone: 'good' },
      { re: /^oui|\boui\b|confirm|en effet|effectivement|\d{4,}|voici|mot de passe|hors micro|entre nous|pas encore/i, tone: 'bad' },
      { re: /cellule|crise|ciso|sécurité|juridique|communication|service de presse|direction|responsable|transf|passe/i, tone: 'good' },
    ];
    function start(host, data, typed) {
      const role = data.roles.find(x => x.id === roleId) || data.roles[0]; roleId = role.id;
      const s = session = { role, used: {}, fb: 0, history: [], alive: true };
      $$('.ag-roles button', host).forEach(b => b.setAttribute('aria-selected', b.dataset.id === role.id));
      $('.ag-ctx ul', host).innerHTML = role.context.map(c => `<li>${f(c)}</li>`).join('');
      $('.ag-head', host).innerHTML = `<span class="msg-av">${esc(initials(fill(role.name)))}</span><div><b>${f(role.name)}</b><span>${f(role.sub)}</span></div>`;
      $('.ag-thread', host).innerHTML = '';
      $$('.ag-meters li', host).forEach(li => { li.className = ''; });
      $('.ag-quick', host).innerHTML = role.quick.map(q => `<button type="button" class="chip">${esc(q)}</button>`).join('');
      $$('.ag-quick .chip', host).forEach(b => b.addEventListener('click', () => send(host, data, b.textContent)));
      return typed ? agentSay(host, s, fill(role.opening)) : (push(host, 'them', fill(role.opening)), s.history.push({ role: 'assistant', content: fill(role.opening) }), Promise.resolve());
    }
    function push(host, cls, text) {
      const list = $('.ag-thread', host), li = el('li', cls, `<p>${esc(text)}</p>`);
      list.append(li); list.scrollTop = list.scrollHeight; return li;
    }
    async function agentSay(host, s, text) {
      const list = $('.ag-thread', host), typing = el('li', 'them typing', '<p><i></i><i></i><i></i></p>');
      list.append(typing); list.scrollTop = list.scrollHeight;
      await new Promise(r => setTimeout(r, reduced ? 100 : 650 + Math.min(1600, text.length * 16)));
      typing.remove();
      if (!s.alive) return;
      push(host, 'them', text); s.history.push({ role: 'assistant', content: text }); Sound.message();
    }
    async function reply(data, s, text) {
      if (data.endpoint) {
        try {
          const res = await fetch(data.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: s.role.id, context: s.role.context.map(fill), messages: s.history }) });
          const j = await res.json(); if (j && j.reply) return j.reply;
        } catch (e) { /* repli sur le script */ }
      }
      for (let i = 0; i < s.role.rules.length; i++) {
        const rule = s.role.rules[i];
        if (new RegExp(rule.re, 'i').test(text)) { const n = s.used[i] || 0; s.used[i] = n + 1; return fill(rule.replies[n % rule.replies.length]); }
      }
      return fill(s.role.fallback[s.fb++ % s.role.fallback.length]);
    }
    async function send(host, data, text) {
      text = text.trim(); const s = session;
      if (!text || !s || s.pending) return;
      s.pending = true;
      push(host, 'me', text); s.history.push({ role: 'user', content: text });
      $$('.ag-meters li', host).forEach((li, i) => {
        if (!li.className && METERS[i].re.test(text)) { li.className = METERS[i].tone; log(active.measure[i], METERS[i].tone); if (METERS[i].tone === 'bad') Scene.pulse(.6); }
      });
      const answer = await reply(data, s, text);
      if (s.alive) await agentSay(host, s, answer);
      s.pending = false;
    }
    return {
      mood: 'idle',
      render(host, data) {
        host.innerHTML = `<div class="ag">
          <div class="ag-roles" role="tablist">${data.roles.map(r => `<button type="button" role="tab" data-id="${r.id}">${esc(r.label)}</button>`).join('')}</div>
          <aside class="ag-ctx"><h4>${esc(data.contextTitle)}</h4><ul></ul><ul class="ag-meters">${active.measure.map(m => `<li>${esc(m)}</li>`).join('')}</ul></aside>
          <div class="ag-chat">
            <header class="ag-head"></header>
            <ol class="ag-thread" aria-live="polite"></ol>
            <div class="ag-quick"></div>
            <form class="ag-form"><input name="m" autocomplete="off" placeholder="${esc(data.inputPlaceholder)}" aria-label="${esc(data.inputPlaceholder)}"><button type="submit" class="btn">Envoyer</button></form>
          </div>
        </div>`;
        $$('.ag-roles button', host).forEach(b => b.addEventListener('click', () => { if (session) session.alive = false; roleId = b.dataset.id; start(host, data); }));
        $('.ag-form', host).addEventListener('submit', e => { e.preventDefault(); const input = e.target.m; send(host, data, input.value); input.value = ''; });
        start(host, data);
        return () => { if (session) session.alive = false; session = null; };
      },
      async launch(r, data, host) {
        if (session) session.alive = false;
        r.onStop(() => { /* la conversation reste ouverte : le visiteur continue à son rythme */ });
        const role = data.roles.find(x => x.id === roleId) || data.roles[0];
        log(`Agent déployé : ${fill(role.name)}.`);
        log(`Objectif injecté : ${fill(role.context[2]).replace(/^Objectif : /, '')}`);
        await start(host, data, true);
        log('Premier contact établi. À vous de répondre.');
        const input = $('.ag-form input', host); if (input && Scene.docked) input.focus({ preventScroll: true });
      },
    };
  })();

  /* ---------- Châssis de la vue ---------- */
  function render(view) {
    root = view;
    view.classList.add('view-inj');
    view.innerHTML = `<div class="inj">
      <aside class="inj-list">
        <label class="inj-target">${esc(I.targetLabel)}<input id="bankInput" value="${esc(UI.bank)}" maxlength="48" autocomplete="off" spellcheck="false"><small>${esc(I.targetHint)}</small></label>
        <div class="inj-tabs" role="tablist" aria-label="${esc(I.title)}">${C.injects.map(x => `
          <button type="button" role="tab" data-id="${x.id}"><time>${esc(x.when)}</time><b>${esc(x.name)}</b><span>${esc(x.medium)}</span></button>`).join('')}</div>
      </aside>
      <section class="inj-stage">
        <header class="inj-stage-head"><span id="stageMedium"></span><span class="stamp">${esc(I.stamp)}</span></header>
        <div class="inj-stage-body" id="stageBody"></div>
      </section>
      <aside class="inj-fiche">
        <dl id="fiche"></dl>
        <button type="button" class="launch" id="launchBtn"></button>
        <div class="inj-log"><h3>${esc(I.logTitle)}</h3><ol id="injLog"></ol></div>
      </aside>
    </div>`;
    body = $('#stageBody', view); logEl = $('#injLog', view); launchBtn = $('#launchBtn', view);
    $$('.inj-tabs button', view).forEach(b => b.addEventListener('click', () => select(b.dataset.id)));
    launchBtn.addEventListener('click', launch);
    let deb = 0;
    $('#bankInput', view).addEventListener('input', e => {
      UI.bank = e.target.value; clearTimeout(deb);
      deb = setTimeout(() => { if (active) select(active.id); }, 350);
    });
  }
  function stop() {
    if (run) { run.stop(); run = null; }
    busy = false; Sound.stopRing(); Sound.hush();
  }
  function select(id) {
    stop();
    if (dispose) { dispose(); dispose = null; }
    active = C.injects.find(x => x.id === id) || C.injects[0];
    $$('.inj-tabs button', root).forEach(b => b.setAttribute('aria-selected', b.dataset.id === active.id));
    $('#stageMedium', root).textContent = active.medium;
    $('#fiche', root).innerHTML = `
      <dt>${esc(I.tests)}</dt><dd>${esc(active.tests)}</dd>
      <dt>${esc(I.target)}</dt><dd>${esc(active.target)}</dd>
      <dt>${esc(I.measure)}</dt><dd><ul>${active.measure.map(m => `<li>${esc(m)}</li>`).join('')}</ul></dd>`;
    launchBtn.textContent = I.launch; launchBtn.classList.remove('again');
    logEl.innerHTML = `<li class="empty">${esc(I.logEmpty)}</li>`;
    body.className = 'inj-stage-body is-' + active.id; body.scrollTop = 0;
    dispose = mods[active.id].render(body, active) || null;
    Scene.setMood(mods[active.id].mood); Scene.phone({ mode: 'off' });
    try { history.replaceState(null, '', '#injects/' + active.id); } catch (e) { /* file:// */ }
  }
  async function launch() {
    const id = active.id;
    select(id);
    const r = run = makeRun(); busy = true; t0 = performance.now();
    logEl.innerHTML = '';
    launchBtn.textContent = I.replay; launchBtn.classList.add('again');
    OS.glitch(); Sound.launch(); Scene.pulse(1);
    log(`Inject lancé : ${active.name}.`);
    await mods[id].launch(r, active, body);
    if (run === r) { busy = false; }
  }

  return {
    render,
    get busy() { return busy; },
    // Chaque entrée dans la vue repart d'un aperçu propre de l'inject choisi.
    enter(id) { select(id || (active && active.id) || C.injects[0].id); },
    leave() { stop(); if (dispose) { dispose(); dispose = null; } Scene.phone({ mode: 'off' }); },
  };
})();
