// Escuchar un diálogo y responder verdadero / falso.
import { h, listenBtn, sayBtn } from '../ui.js';
import { speakLines } from '../speech.js';
import { choiceList } from './_common.js';

export default {
  icon: '💬', title: 'Diálogo: ¿verdadero o falso?',
  items: ex => ex.statements,
  header(el, ex) {
    const script = h('div', { class: 'dialogue', hidden: true },
      ex.dialogue.map(l => h('p', {}, h('strong', {}, l.speaker + ': '), l.text)));
    const toggle = h('button', { class: 'link-btn', type: 'button' }, '📄 Mostrar el texto');
    toggle.addEventListener('click', () => {
      script.hidden = !script.hidden;
      toggle.textContent = script.hidden ? '📄 Mostrar el texto' : '🙈 Ocultar el texto';
    });
    el.append(h('div', { class: 'card' }, listenBtn(() => speakLines(ex.dialogue)), toggle, script));
  },
  renderItem(el, item) {
    return new Promise(resolve => {
      el.append(
        h('p', { class: 'prompt' }, item.text, ' ', sayBtn(item.text)),
        choiceList([{ text: 'True ✔' }, { text: 'False ✘' }], item.answer ? 0 : 1, { explain: item.explain, onDone: resolve, mix: false })
      );
    });
  }
};
