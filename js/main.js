/* Câblage : allumage du poste, installation / recul, raccourcis, aides.
   Paramètres d'URL utiles en démo :
     ?skip        saute le démarrage (BIOS, session)
     ?desk        reste en vue « bureau » après le démarrage
     #injects/call  ouvre directement une section, voire un inject */
(() => {
  const { C, $ } = UI;
  const params = new URLSearchParams(location.search);
  const hint = $('#hint'), skipBtn = $('#skip'), screenEl = $('#screen');

  $('#powerLine').textContent = C.power.line;
  $('#powerSub').textContent = C.power.sub;
  $('#btnOn').textContent = C.power.on;
  $('#btnSilent').textContent = C.power.silent;

  // Standard du portail : le lien de retour n'existe que lorsque le site est servi par le Pi.
  if (location.hostname === '192.168.1.38') $('#portal').hidden = false;

  let started = false;
  async function power(withSound) {
    if (started) return; started = true;
    document.body.classList.add('powered');
    Sound.init(withSound); OS.syncSound();
    const fast = params.has('skip');
    if (fast) OS.skip(); else skipBtn.hidden = false;
    await Scene.powerOn();
    // La caméra s'avance pendant le démarrage : à l'ouverture de session, on est assis au poste.
    if (!params.has('desk')) setTimeout(() => Scene.dock(true, fast ? 1400 : 4600), fast ? 0 : 900);
    await OS.boot();
    skipBtn.hidden = true;
    hint.textContent = Scene.takeover
      ? 'Touchez l’écran pour vous installer au poste.'
      : 'Cliquez sur l’écran pour vous installer au poste. Glissez pour tourner, molette pour zoomer, Échap pour reculer.';
    hint.hidden = false;
  }
  $('#btnOn').addEventListener('click', () => power(true));
  $('#btnSilent').addEventListener('click', () => power(false));
  skipBtn.addEventListener('click', () => { OS.skip(); skipBtn.hidden = true; });
  if (params.has('skip')) power(false);

  // Vue bureau : un clic sur la dalle installe au poste (les clics n'atteignent pas l'interface).
  screenEl.addEventListener('click', e => {
    if (!Scene.docked) { e.preventDefault(); e.stopPropagation(); Scene.dock(true); }
  }, true);
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && Scene.docked && started) { if (document.activeElement) document.activeElement.blur(); Scene.dock(false); }
    else if ((e.key === 'Enter' || e.key === ' ') && !started && document.activeElement === document.body) power(true);
  });
})();
