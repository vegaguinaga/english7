// Ejecuta una lista de pasos (ítems) uno por uno y devuelve los puntajes.
import { h, progressBar } from '../ui.js';
import { getType } from './index.js';

// steps: [{ ex, item, label? }]. Si sharedHeader se pasa, el encabezado (texto, diálogo) se muestra una sola vez.
export function runSteps(container, steps, { sharedHeader = null } = {}) {
  return new Promise(resolve => {
    const scores = [];
    let i = 0;
    const counter = h('p', { class: 'step-count small' });
    const barWrap = h('div', {});
    const top = h('div', { class: 'step-top' }, counter, barWrap);
    const headerBox = h('div', { class: 'ex-header' });
    const body = h('div', { class: 'ex-body' });
    const nav = h('div', { class: 'ex-nav' });
    if (steps.length > 1) container.append(top);
    container.append(headerBox, body, nav);
    if (sharedHeader) getType(sharedHeader.type).header?.(headerBox, sharedHeader);

    async function show() {
      const step = steps[i];
      const mod = getType(step.ex.type);
      counter.textContent = `${i + 1} de ${steps.length}`;
      barWrap.replaceChildren(progressBar(Math.round(100 * i / steps.length)));
      body.replaceChildren();
      nav.replaceChildren();
      if (!sharedHeader) {
        headerBox.replaceChildren();
        if (step.label) headerBox.append(step.label);
        mod.header?.(headerBox, step.ex);
      }
      const s = await mod.renderItem(body, step.item, step.ex);
      if (!container.isConnected) return;
      scores.push(Math.max(0, Math.min(1, Number(s) || 0)));
      const last = i === steps.length - 1;
      const go = () => {
        if (last) return resolve(scores);
        i++;
        show();
        top.scrollIntoView({ block: 'start', behavior: 'smooth' });
      };
      if (mod.autoNext) return go();
      const b = h('button', { class: 'btn primary big', type: 'button', onclick: go }, last ? 'Terminar ✔' : 'Siguiente →');
      nav.append(b);
      b.focus({ preventScroll: true });
      b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    show();
  });
}

export function stepsForExercise(ex) {
  return getType(ex.type).items(ex).map(item => ({ ex, item }));
}
