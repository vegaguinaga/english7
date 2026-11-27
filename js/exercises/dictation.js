// Dictado corto: escuchar y escribir.
import { h, listenBtn, feedback } from '../ui.js';
import { speak } from '../speech.js';
import { similarity, sameText, diffWords } from '../compare.js';
import { checkBtn } from './_common.js';

export default {
  icon: '📝', title: 'Dictado',
  items: ex => ex.items,
  renderItem(el, item) {
    return new Promise(resolve => {
      const input = h('textarea', {
        class: 'input', rows: 2, autocapitalize: 'sentences', autocomplete: 'off', spellcheck: 'false',
        'aria-label': 'Escribe lo que escuchaste', placeholder: 'Escribe aquí lo que escuchaste…'
      });
      const btn = checkBtn(check);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      el.append(listenBtn(() => speak(item.audio || item.answer, { voice: item.voice }), { auto: true }), input, btn);

      function check() {
        if (!input.value.trim()) { input.focus(); return; }
        input.disabled = true; btn.remove();
        const exact = sameText(item.answer, input.value);
        const score = exact ? 1 : similarity(item.answer, input.value, 'strict');
        const diff = h('p', { class: 'diff' }, diffWords(item.answer, input.value).map(d =>
          h('span', { class: d.ok ? 'w-ok' : 'w-miss' }, d.w + ' ')));
        el.append(feedback({
          ok: exact, partial: !exact && score >= 0.6, correct: item.answer,
          explain: item.explain || (exact ? null : 'Las palabras en rojo faltan o están mal escritas.'),
          children: exact ? null : diff
        }));
        resolve(score);
      }
    });
  }
};
