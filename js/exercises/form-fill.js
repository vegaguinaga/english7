// Completar un formulario (ficha de datos).
// Cada campo puede tener "answer" (respuesta fija) o solo validarse por su tipo ("kind").
import { h, mdEl, feedback } from '../ui.js';
import { speak } from '../speech.js';
import { normalize, digits } from '../compare.js';
import { checkBtn, asList } from './_common.js';

const INPUT_TYPES = { number: 'text', email: 'email', phone: 'tel' };
const INPUT_MODE = { number: 'numeric', phone: 'tel', email: 'email' };

function evaluate(field, raw) {
  const v = raw.trim();
  if (!v) return { ok: false, hint: 'Este campo está vacío.' };
  const kind = field.kind || 'text';
  if (field.answer != null) {
    const answers = asList(field.answer);
    let ok;
    if (kind === 'phone') ok = answers.some(a => digits(a) === digits(v));
    else if (kind === 'email') ok = answers.some(a => a.toLowerCase() === v.toLowerCase());
    else ok = answers.some(a => normalize(a) === normalize(v));
    if (!ok) return { ok: false, hint: field.hint || `Respuesta correcta: ${answers[0]}` };
    if (['name', 'choice'].includes(kind) && v[0] !== v[0].toUpperCase()) {
      return { ok: true, hint: 'Recuerda: en inglés los nombres y nacionalidades empiezan con mayúscula.' };
    }
    return { ok: true };
  }
  switch (kind) {
    case 'name':
      if (!/^[\p{L}' -]{2,}$/u.test(v)) return { ok: false, hint: 'Escribe solo letras.' };
      if (v[0] !== v[0].toUpperCase()) return { ok: false, hint: 'Los nombres empiezan con mayúscula.' };
      return { ok: true };
    case 'number': {
      const n = parseInt(v, 10);
      if (Number.isNaN(n)) return { ok: false, hint: 'Escribe un número.' };
      if ((field.min != null && n < field.min) || (field.max != null && n > field.max)) return { ok: false, hint: `Escribe un número entre ${field.min} y ${field.max}.` };
      return { ok: true };
    }
    case 'choice': {
      const ok = asList(field.accept).some(a => normalize(a) === normalize(v));
      if (!ok) return { ok: false, hint: 'Ejemplos: ' + asList(field.accept).join(', ') };
      if (v[0] !== v[0].toUpperCase()) return { ok: false, hint: 'Las nacionalidades empiezan con mayúscula: Nicaraguan.' };
      return { ok: true };
    }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) ? { ok: true } : { ok: false, hint: 'Un email se escribe así: nombre@ejemplo.com' };
    case 'phone':
      return digits(v).length === 8 ? { ok: true } : { ok: false, hint: 'En Nicaragua el teléfono tiene 8 números, por ejemplo 8888-1234.' };
    default:
      return { ok: true };
  }
}

export default {
  icon: '🗂️', title: 'Completa la ficha',
  items: ex => [ex],
  header(el, ex) {
    if (ex.text) {
      el.append(h('article', { class: 'card reading-text' }, mdEl('p', ex.text),
        h('button', { class: 'btn', type: 'button', onclick: () => speak(ex.audio || ex.text) }, '🔊 Escuchar')));
    }
  },
  renderItem(el, ex) {
    return new Promise(resolve => {
      const rows = ex.fields.map((f, i) => {
        const id = `ff-${ex.id || 'q'}-${i}`;
        const input = h('input', {
          id, class: 'input', type: INPUT_TYPES[f.kind] || 'text', inputmode: INPUT_MODE[f.kind] || null,
          autocomplete: 'off', spellcheck: 'false', placeholder: f.placeholder || ''
        });
        const msg = h('p', { class: 'field-msg', 'aria-live': 'polite' });
        const row = h('div', { class: 'field' },
          h('label', { for: id }, h('strong', {}, f.label), f.labelEs ? h('span', { class: 'small' }, ` (${f.labelEs})`) : null),
          input, msg);
        return { f, input, msg, row };
      });
      const btn = checkBtn(check);
      el.append(h('div', { class: 'card form-card' }, ex.formTitle ? h('h3', {}, ex.formTitle) : null, rows.map(r => r.row)), btn);

      function check() {
        let right = 0;
        rows.forEach(r => {
          const res = evaluate(r.f, r.input.value);
          r.input.classList.remove('correct', 'wrong');
          r.input.classList.add(res.ok ? 'correct' : 'wrong');
          r.input.disabled = true;
          r.msg.textContent = (res.ok ? '✔ ' : '✘ ') + (res.hint || '¡Bien!');
          if (res.ok) right++;
        });
        btn.remove();
        const score = right / rows.length;
        el.append(feedback({
          ok: score === 1, partial: score > 0 && score < 1,
          title: score === 1 ? '✅ ¡Ficha perfecta!' : `🟡 Tienes ${right} de ${rows.length} campos bien.`,
          explain: ex.explain
        }));
        resolve(score);
      }
    });
  }
};
