// Relacionar columnas: toca un elemento de la izquierda y luego su pareja.
import { h, shuffle, feedback } from '../ui.js';

export default {
  icon: '🔗', title: 'Relaciona',
  items: ex => [ex],
  renderItem(el, ex) {
    return new Promise(resolve => {
      const pairs = ex.pairs;
      let selected = null, errors = 0, matched = 0;
      const mk = (text, i, side) => {
        const b = h('button', { class: 'option match-item', type: 'button' }, text);
        b.dataset.idx = i; b.dataset.side = side;
        b.addEventListener('click', () => tap(b));
        return b;
      };
      const left = shuffle(pairs.map((p, i) => mk(p[0], i, 'L')));
      const right = shuffle(pairs.map((p, i) => mk(p[1], i, 'R')));
      const status = h('p', { class: 'small', 'aria-live': 'polite' }, 'Toca una opción de la izquierda y luego su pareja de la derecha.');
      el.append(status, h('div', { class: 'match-grid' }, h('div', { class: 'col' }, left), h('div', { class: 'col' }, right)));

      function tap(b) {
        if (b.disabled) return;
        if (!selected || selected.dataset.side === b.dataset.side) {
          selected?.classList.remove('selected');
          selected = b; b.classList.add('selected');
          return;
        }
        const a = selected; selected = null; a.classList.remove('selected');
        if (a.dataset.idx === b.dataset.idx) {
          [a, b].forEach(x => { x.disabled = true; x.classList.add('correct'); });
          matched++;
          status.textContent = `¡Bien! ${matched} de ${pairs.length}.`;
          if (matched === pairs.length) {
            const score = pairs.length / (pairs.length + errors);
            el.append(feedback({
              ok: errors === 0, partial: errors > 0,
              title: errors === 0 ? '✅ ¡Perfecto, sin errores!' : `🟡 ¡Terminaste! Tuviste ${errors} error${errors > 1 ? 'es' : ''}.`,
              explain: ex.explain
            }));
            resolve(score);
          }
        } else {
          errors++;
          [a, b].forEach(x => { x.classList.add('wrong'); setTimeout(() => x.classList.remove('wrong'), 600); });
          status.textContent = 'Esa pareja no es correcta. Intenta otra vez.';
        }
      }
    });
  }
};
