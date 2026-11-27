// Ordenar palabras para formar una oración.
import { h, shuffle, feedback } from '../ui.js';
import { sameText } from '../compare.js';
import { checkBtn } from './_common.js';

export default {
  icon: '🔀', title: 'Ordena las palabras',
  items: ex => ex.items,
  renderItem(el, item) {
    return new Promise(resolve => {
      const end = (item.answer.match(/[.?!]$/) || [''])[0];
      const words = item.words || item.answer.replace(/[.?!]$/, '').split(/\s+/);
      let order = shuffle(words.map((_, i) => i));
      if (words.length > 1) while (order.every((v, i) => v === i)) order = shuffle(order);

      const built = h('div', { class: 'built', 'aria-live': 'polite', 'aria-label': 'Tu oración' });
      const pool = h('div', { class: 'pool' });
      const btn = checkBtn(check);
      btn.disabled = true;
      const placeholder = h('span', { class: 'placeholder' }, 'Toca las palabras en orden…');
      built.append(placeholder);

      order.forEach(i => {
        const chip = h('button', { class: 'chip-word', type: 'button' }, words[i]);
        chip.addEventListener('click', () => {
          if (btn.isConnected === false) return;
          const target = chip.parentElement === pool ? built : pool;
          target.append(chip);
          placeholder.hidden = built.querySelectorAll('.chip-word').length > 0;
          btn.disabled = pool.children.length > 0;
        });
        pool.append(chip);
      });
      el.append(built, pool, btn);

      function check() {
        const sentence = [...built.querySelectorAll('.chip-word')].map(c => c.textContent).join(' ') + end;
        const ok = [item.answer, ...(item.alsoAccept || [])].some(a => sameText(a, sentence));
        built.classList.add(ok ? 'correct' : 'wrong');
        el.querySelectorAll('.chip-word').forEach(c => { c.disabled = true; });
        btn.remove();
        el.append(feedback({ ok, correct: item.answer, explain: item.explain }));
        resolve(ok ? 1 : 0);
      }
    });
  }
};
