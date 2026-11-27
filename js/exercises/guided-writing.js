// Escritura guiada: 3–5 oraciones con plantilla. Se revisan palabras clave y estructura.
import { h, md, feedback, sayBtn } from '../ui.js';
import { matchesAny } from '../compare.js';
import { checkBtn } from './_common.js';

const SPANISH = ['soy', 'tengo', 'anos', 'vivo', 'llamo', 'nombre', 'edad', 'ciudad', 'amigo', 'amiga', 'escuela', 'hermano', 'hermana', 'mi', 'es', 'y'];

function review(text, ex) {
  const tips = [];
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const min = ex.minSentences || 3;
  const enough = sentences.length >= min;
  const items = [{ ok: enough, msg: enough ? `Escribiste ${sentences.length} oraciones.` : `Escribe al menos ${min} oraciones (tienes ${sentences.length}). Termina cada una con punto.` }];
  let passed = enough ? 1 : 0;
  for (const c of ex.checks || []) {
    const ok = matchesAny(text, [c.pattern]);
    if (ok) passed++;
    items.push({ ok, msg: ok ? (c.label || '¡Bien!') : c.hint });
  }
  if (text.includes('___')) tips.push('Cambia los espacios ___ por tu información.');
  if (sentences.some(s => /^[a-z]/.test(s))) tips.push('Empieza cada oración con letra mayúscula.');
  if (/\bi\b/.test(text)) tips.push('La palabra *I* (yo) siempre va en mayúscula.');
  if (!/[.!?]\s*$/.test(text.trim())) tips.push('Termina tu última oración con un punto (.)');
  const words = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z]+/g) || [];
  const es = [...new Set(words.filter(w => SPANISH.includes(w)))];
  if (es.length) tips.push(`Parece que escribiste en español: “${es.join(', ')}”. Escribe en inglés.`);
  const total = 1 + (ex.checks?.length || 0);
  return { items, tips, score: passed / total };
}

export default {
  icon: '✍️', title: 'Escribe oraciones',
  items: ex => [ex],
  header(el, ex) {
    el.append(h('div', { class: 'card template' },
      h('p', { class: 'small' }, '📋 Usa esta plantilla:'),
      h('ul', {}, ex.template.map(t => h('li', {}, t)))));
  },
  renderItem(el, ex) {
    return new Promise(resolve => {
      let best = 0;
      const ta = h('textarea', {
        class: 'input', rows: 6, autocapitalize: 'sentences', spellcheck: 'false',
        'aria-label': 'Tu texto', placeholder: ex.placeholder || 'Escribe aquí en inglés…'
      });
      const counter = h('p', { class: 'small' }, '0 palabras');
      ta.addEventListener('input', () => { counter.textContent = (ta.value.match(/\S+/g) || []).length + ' palabras'; });
      const out = h('div', {});
      const btn = checkBtn(check);
      el.append(ta, counter, btn, out);

      function check() {
        if (!ta.value.trim()) { ta.focus(); return; }
        const r = review(ta.value, ex);
        best = Math.max(best, r.score);
        const ok = r.score === 1;
        out.replaceChildren(
          feedback({
            ok, partial: !ok && r.score >= 0.5,
            title: ok ? '✅ ¡Muy bien escrito!' : r.score >= 0.5 ? '🟡 ¡Vas bien! Revisa esto:' : '✏️ Revisa esto:',
            children: [
              h('ul', { class: 'checklist' }, r.items.map(i => h('li', { class: i.ok ? 'w-ok' : 'w-miss', html: (i.ok ? '✔ ' : '✘ ') + md(i.msg) }))),
              r.tips.length ? h('ul', { class: 'tips' }, r.tips.map(t => h('li', { html: '💡 ' + md(t) }))) : null
            ]
          }),
          ex.model ? h('details', { class: 'model' }, h('summary', {}, '👀 Ver un ejemplo'), h('p', {}, ex.model, ' ', sayBtn(ex.model))) : '',
          h('div', { class: 'row' },
            h('button', { class: 'btn', type: 'button', onclick: () => ta.focus() }, '✏️ Corregir y revisar otra vez'),
            h('button', { class: 'btn primary', type: 'button', onclick: () => resolve(best) }, 'Continuar →'))
        );
        btn.textContent = 'Revisar otra vez ✔';
      }
    });
  },
  autoNext: true
};
