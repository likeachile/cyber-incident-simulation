/* Sons d'interface synthétisés (Web Audio) : aucun fichier à charger.
   Tout passe par un gain maître ; `Sound.enabled` coupe l'ensemble. */
window.Sound = (() => {
  let ctx = null, master = null, rainNode = null, ringTimer = null;
  let enabled = false;

  function init(on) {
    enabled = on;
    if (!on || ctx) { if (master) master.gain.value = on ? 0.5 : 0; return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }

  function setEnabled(on) {
    if (on && !ctx) init(true);
    enabled = on;
    if (master) master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.05);
    if (ctx && on && ctx.state === 'suspended') ctx.resume();
    if (!on) { stopRing(); if (window.speechSynthesis) speechSynthesis.cancel(); }
  }

  // Une note : oscillateur + enveloppe courte.
  function tone(freq, { at = 0, dur = 0.18, type = 'sine', gain = 0.2, slide = 0 } = {}) {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noiseBuffer(seconds) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  const api = {
    init, setEnabled,
    get enabled() { return enabled; },

    click() { tone(1900, { dur: 0.035, type: 'square', gain: 0.035 }); },
    key() { tone(900 + Math.random() * 500, { dur: 0.02, type: 'square', gain: 0.02 }); },
    boot() {
      tone(110, { dur: 1.6, gain: 0.12 });
      tone(220, { at: 0.12, dur: 1.4, gain: 0.08 });
      tone(329.6, { at: 0.28, dur: 1.3, gain: 0.07 });
      tone(440, { at: 0.5, dur: 1.2, gain: 0.05 });
    },
    login() { tone(660, { dur: 0.14, gain: 0.09 }); tone(990, { at: 0.11, dur: 0.3, gain: 0.08 }); },
    notify() { tone(880, { dur: 0.12, gain: 0.1 }); tone(1318, { at: 0.09, dur: 0.22, gain: 0.08 }); },
    soft() { tone(520, { dur: 0.18, gain: 0.05 }); },
    message() { tone(1175, { dur: 0.07, gain: 0.07 }); tone(1568, { at: 0.06, dur: 0.12, gain: 0.06 }); },
    alert() {
      tone(196, { dur: 0.5, type: 'sawtooth', gain: 0.06, slide: 0.5 });
      tone(98, { dur: 0.7, gain: 0.14 });
    },
    launch() {
      tone(80, { dur: 0.9, gain: 0.18, slide: 0.45 });
      tone(1400, { dur: 0.5, type: 'triangle', gain: 0.04, slide: 0.2 });
    },
    hangup() { tone(480, { dur: 0.2, gain: 0.08 }); tone(360, { at: 0.2, dur: 0.3, gain: 0.08 }); },

    ring() {
      stopRing();
      const burst = () => {
        for (let i = 0; i < 2; i++) {
          tone(1040, { at: i * 0.42, dur: 0.32, type: 'triangle', gain: 0.09 });
          tone(1300, { at: i * 0.42, dur: 0.32, type: 'triangle', gain: 0.07 });
        }
      };
      burst();
      ringTimer = setInterval(burst, 2200);
    },
    stopRing,

    // Pluie contre la vitre : bruit filtré en boucle, très bas.
    rain(on) {
      if (!ctx) return;
      if (on && !rainNode) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer(3); src.loop = true;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
        const g = ctx.createGain(); g.gain.value = 0;
        g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3);
        src.connect(hp).connect(lp).connect(g).connect(master);
        src.start();
        rainNode = { src, g };
      } else if (!on && rainNode) {
        rainNode.src.stop(); rainNode = null;
      }
    },

    // Voix de synthèse du navigateur, utilisée tant qu'aucun fichier audio n'est fourni.
    speak(text, { rate = 1.02, pitch = 1, onend } = {}) {
      const synth = window.speechSynthesis;
      if (!enabled || !synth || !window.SpeechSynthesisUtterance) { return false; }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR'; u.rate = rate; u.pitch = pitch;
      const fr = synth.getVoices().find(v => /^fr/i.test(v.lang));
      if (fr) u.voice = fr;
      if (onend) u.onend = onend;
      synth.speak(u);
      return true;
    },
    hush() { if (window.speechSynthesis) speechSynthesis.cancel(); },
  };

  function stopRing() { clearInterval(ringTimer); ringTimer = null; }
  return api;
})();
