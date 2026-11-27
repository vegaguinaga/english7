// Piezas compartidas por varios tipos de ejercicio.
import { h, shuffle, iconEl, feedback } from '../ui.js';

export function optionLabel(opt) {
  if (typeof opt === 'string' || typeof opt === 'number') return String(opt);
  return opt.text || opt.alt || opt.emoji || '';
}

function optionContent(opt) {
  if (typeof opt === 'string' || typeof opt === 'number') return h('span', { class: 'opt-text' }, String(opt));
  return [
    iconEl(opt.svg ? { svg: opt.svg, alt: opt.text } : opt.emoji ? { emoji: opt.emoji } : null, 'opt-icon'),
    opt.text ? h('span', { class: 'opt-text' }, opt.text) : null
  ];
}

// Botones de opción múltiple. Llama onDone(ok) al elegir. Devuelve el elemento.
export function choiceList(options, answer, { explain, onDone, mix = true } = {}) {
  const hasIcons = options.some(o => o && typeof o === 'object' && (o.emoji || o.svg));
  const order = mix ? shuffle(options.map((_, i) => i)) : options.map((_, i) => i);
  const wrap = h('div', {});
  const list = h('div', { class: 'options' + (hasIcons ? ' grid' : '') });
  const buttons = order.map(i => {
    const b = h('button', { class: 'option', type: 'button', onclick: () => choose(i, b) }, optionContent(options[i]));
    b.dataset.idx = i;
    return b;
  });
  list.append(...buttons);
  wrap.append(list);

  function choose(i, btn) {
    buttons.forEach(b => {
      b.disabled = true;
      if (+b.dataset.idx === answer) b.classList.add('correct');
    });
    const ok = i === answer;
    if (!ok) btn.classList.add('wrong');
    wrap.append(feedback({ ok, correct: optionLabel(options[answer]), explain }));
    onDone?.(ok ? 1 : 0);
  }
  return wrap;
}

export function checkBtn(onclick, label = 'Revisar ✔') {
  return h('button', { class: 'btn primary big', type: 'button', onclick }, label);
}

// Para respuestas que aceptan varias formas: "answer": "is" o ["is", "'s"]
export const asList = a => (Array.isArray(a) ? a : [a]).map(String);
