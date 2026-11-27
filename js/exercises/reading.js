// Texto corto + preguntas de comprensión.
import { h, sayBtn, mdEl, iconEl } from '../ui.js';
import { speak } from '../speech.js';
import { choiceList } from './_common.js';

export default {
  icon: '📖', title: 'Lee y responde',
  items: ex => ex.questions,
  header(el, ex) {
    el.append(h('article', { class: 'card reading-text' },
      ex.textTitle ? h('h3', {}, iconEl(ex.icon), ' ', ex.textTitle) : null,
      mdEl('p', ex.text),
      h('button', { class: 'btn', type: 'button', onclick: () => speak(ex.audio || ex.text) }, '🔊 Escuchar el texto')
    ));
  },
  renderItem(el, item) {
    return new Promise(resolve => {
      el.append(
        h('p', { class: 'prompt' }, item.q, ' ', sayBtn(item.q)),
        choiceList(item.options, item.answer, { explain: item.explain, onDone: resolve })
      );
    });
  }
};
