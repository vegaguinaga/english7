// Escuchar y elegir la imagen o palabra correcta.
import { h, listenBtn } from '../ui.js';
import { speak } from '../speech.js';
import { choiceList } from './_common.js';

export default {
  icon: '👂', title: 'Escucha y elige',
  items: ex => ex.items,
  renderItem(el, item) {
    return new Promise(resolve => {
      el.append(
        listenBtn(() => speak(item.audio, { voice: item.voice }), { auto: true }),
        item.prompt ? h('p', { class: 'prompt' }, item.prompt) : '', // '' y no null: el.append() nativo escribiría "null"
        choiceList(item.options, item.answer, { explain: item.explain, onDone: resolve })
      );
    });
  }
};
