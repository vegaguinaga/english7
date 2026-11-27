// Widget de práctica oral con tres modos:
//  - recognition: el navegador escucha y compara automáticamente.
//  - record: "grábate y compárate" (MediaRecorder) con autoevaluación.
//  - self: sin micrófono, el estudiante lo dice en voz alta y se autoevalúa.
import { h, feedback, sayBtn } from '../ui.js';
import { listen, speechMode, setSpeechMode, canRecord, canRecognize, startRecording, speak, FATAL_SR_ERRORS } from '../speech.js';
import { matchesAny, similarity, diffWords } from '../compare.js';

function scoreAlts(alts, { expected, accept }) {
  let best = { score: -1, heard: alts[0] || '' };
  for (const a of alts) {
    let s = 0;
    if (accept?.length && matchesAny(a, accept)) s = 1;
    else if (expected) s = similarity(expected, a);
    if (s > best.score) best = { score: s, heard: a };
  }
  best.score = Math.max(0, best.score);
  return best;
}

// Muestra un botón de micrófono y resuelve con { score, heard, mode }.
export function speakAttempt(el, opts) {
  return new Promise(resolve => {
    const box = h('div', { class: 'mic-box' });
    el.append(box);
    render();

    function render(note) {
      box.replaceChildren();
      if (note) box.append(h('p', { class: 'note warn' }, note));
      const m = speechMode();
      if (m === 'recognition') renderRecognition();
      else if (m === 'record') renderRecord();
      else renderSelf();
    }

    function switchLink(label, target) {
      return h('button', { class: 'link-btn', type: 'button', onclick: () => { setSpeechMode(target); render(); } }, label);
    }

    function renderRecognition() {
      const status = h('p', { class: 'mic-status', 'aria-live': 'polite' }, 'Toca el micrófono y habla en inglés.');
      const btn = h('button', { class: 'btn mic big', type: 'button', 'aria-label': 'Hablar' }, '🎤 Toca y habla');
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.classList.add('listening');
        btn.textContent = '🎙️ Escuchando…';
        status.textContent = 'Habla ahora.';
        try {
          const alts = await listen();
          box.remove();
          resolve({ ...scoreAlts(alts, opts), mode: 'recognition' });
        } catch (err) {
          btn.disabled = false;
          btn.classList.remove('listening');
          btn.textContent = '🎤 Toca y habla';
          if (FATAL_SR_ERRORS.includes(err)) {
            setSpeechMode(canRecord ? 'record' : 'self');
            const why = err === 'network'
              ? 'El reconocimiento de voz necesita internet. Usaremos el modo "grábate y compárate".'
              : 'No se pudo usar el reconocimiento de voz. Usaremos el modo "grábate y compárate".';
            render(why);
          } else {
            status.textContent = err === 'aborted' ? 'Toca el micrófono para intentar.' : 'No te escuché bien. Toca y habla otra vez, más cerca del celular.';
          }
        }
      });
      box.append(btn, status);
      if (canRecord) box.append(switchLink('¿No funciona? Usar modo "grábate y compárate"', 'record'));
    }

    function renderRecord() {
      const status = h('p', { class: 'mic-status', 'aria-live': 'polite' }, 'Graba tu voz y compárala con el modelo.');
      const btn = h('button', { class: 'btn mic big', type: 'button' }, '⏺ Grabar');
      let rec = null, timer = null;
      btn.addEventListener('click', async () => {
        if (!rec) {
          try {
            rec = await startRecording();
          } catch (e) {
            setSpeechMode('self');
            return render('No se pudo usar el micrófono. Di la frase en voz alta.');
          }
          btn.classList.add('listening');
          btn.textContent = '⏹ Detener';
          status.textContent = 'Grabando… habla ahora.';
          timer = setTimeout(() => btn.click(), 8000);
        } else {
          clearTimeout(timer);
          const url = await rec.stop();
          rec = null;
          showCompare(url);
        }
      });
      box.append(btn, status);
      if (canRecognize) box.append(switchLink('Usar reconocimiento automático', 'recognition'));
    }

    function showCompare(url) {
      box.replaceChildren(
        h('p', { class: 'mic-status' }, 'Escucha tu voz y el modelo. ¿Cómo te salió?'),
        h('div', { class: 'row' },
          h('button', { class: 'btn', type: 'button', onclick: () => new Audio(url).play() }, '▶ Mi voz'),
          opts.model ? h('button', { class: 'btn', type: 'button', onclick: () => speak(opts.model) }, '🔊 Modelo') : null),
        selfButtons(true)
      );
    }

    function selfButtons(withRetry) {
      return h('div', { class: 'row self-eval' },
        h('button', { class: 'btn ok-btn', type: 'button', onclick: () => done(1) }, '😀 Lo dije bien'),
        h('button', { class: 'btn', type: 'button', onclick: () => done(0.6) }, '🙂 Más o menos'),
        withRetry ? h('button', { class: 'btn', type: 'button', onclick: () => render() }, '🔁 Grabar otra vez') : null);
    }

    function renderSelf() {
      box.append(h('p', { class: 'mic-status' }, '🗣️ Di la frase en voz alta. Luego elige cómo te salió.'), selfButtons(false));
    }

    function done(score) { box.remove(); resolve({ score, heard: null, mode: 'self' }); }
  });
}

// Retroalimentación para un intento de voz.
export function speechFeedback(result, { expected, example }) {
  if (result.mode === 'self') {
    return feedback({ ok: result.score >= 1, partial: result.score < 1, title: result.score >= 1 ? '👏 ¡Muy bien!' : '💪 ¡Sigue practicando!' });
  }
  const ok = result.score >= 0.8;
  const partial = !ok && result.score >= 0.5;
  const pct = Math.round(result.score * 100);
  const children = [h('p', {}, 'Escuché: ', h('em', {}, `“${result.heard || '…'}”`))];
  if (expected && !expected.includes('___')) {
    children.push(h('p', { class: 'diff' }, diffWords(expected, result.heard).map(d =>
      h('span', { class: d.ok ? 'w-ok' : 'w-miss' }, d.w + ' '))));
    if (!ok) children.push(h('p', { class: 'small' }, 'Las palabras en rojo no las escuché. Escucha el modelo y repite.'));
  }
  if (!ok && example) children.push(h('p', {}, 'Puedes decir: ', h('strong', {}, example), ' ', sayBtn(example)));
  const title = ok ? `✅ ¡Excelente! (${pct}%)` : partial ? `🟡 ¡Casi! (${pct}%)` : `🔁 Intenta otra vez (${pct}%)`;
  return feedback({ ok, partial, title, children });
}

// Ciclo: intentar → retroalimentación → "Otra vez" o "Continuar". Resuelve con el mejor puntaje.
export function practiceLoop(el, opts) {
  return new Promise(resolve => {
    let best = 0;
    const area = h('div', {});
    el.append(area);
    async function attempt() {
      area.replaceChildren();
      const r = await speakAttempt(area, opts);
      best = Math.max(best, r.score);
      area.append(
        speechFeedback(r, opts),
        h('div', { class: 'row' },
          h('button', { class: 'btn', type: 'button', onclick: attempt }, '🔁 Otra vez'),
          h('button', { class: 'btn primary', type: 'button', onclick: () => resolve(best) }, 'Continuar →')));
    }
    attempt();
  });
}
