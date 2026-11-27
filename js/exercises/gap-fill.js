// Completar espacios (___). Con "wordBank" se elige de una lista; sin él se escribe.
import { h, feedback } from '../ui.js';
import { normalize } from '../compare.js';
import { checkBtn, asList } from './_common.js';

export default {
  icon: '🧩', title: 'Completa los espacios',
  items: ex => ex.items,
  renderItem(el, item, ex) {
    return new Promise(resolve => {
      const bank = item.wordBank || ex.wordBank;
      const parts = item.text.split('___');
      const fields = [];
      const sentence = h('p', { class: 'gap-sentence' });
      parts.forEach((p, i) => {
        sentence.append(p);
        if (i < parts.length - 1) {
          const f = bank
            ? h('select', { class: 'gap', 'aria-label': `Espacio ${i + 1}` },
                h('option', { value: '' }, '…'), bank.map(w => h('option', { value: w }, w)))
            : h('input', { class: 'gap', type: 'text', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false', 'aria-label': `Espacio ${i + 1}`, size: 8 });
          fields.push(f);
          sentence.append(f);
        }
      });
      const btn = checkBtn(check);
      el.append(sentence, btn);

      function check() {
        if (fields.some(f => !f.value.trim())) { fields.find(f => !f.value.trim()).focus(); return; }
        let right = 0;
        fields.forEach((f, i) => {
          const ok = asList(item.answers[i]).some(a => normalize(a) === normalize(f.value));
          f.classList.add(ok ? 'correct' : 'wrong');
          f.disabled = true;
          if (ok) right++;
        });
        btn.remove();
        const full = parts.map((p, i) => p + (i < item.answers.length ? asList(item.answers[i])[0] : '')).join('');
        const score = right / fields.length;
        el.append(feedback({ ok: score === 1, partial: score > 0 && score < 1, correct: full, explain: item.explain }));
        resolve(score);
      }
    });
  }
};
