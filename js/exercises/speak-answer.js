// Responder preguntas en voz alta.
import { h, listenBtn, sayBtn } from '../ui.js';
import { speak } from '../speech.js';
import { practiceLoop } from './_speak.js';

export default {
  icon: '🙋', title: 'Responde en voz alta',
  items: ex => ex.items,
  autoNext: true,
  renderItem(el, item) {
    el.append(
      h('div', { class: 'card say-card' }, h('p', { class: 'say-text', lang: 'en' }, item.question)),
      listenBtn(() => speak(item.question, { voice: item.voice }), { auto: true }),
      item.example ? h('details', { class: 'model' }, h('summary', {}, '💡 Ver un ejemplo de respuesta'),
        h('p', {}, item.example, ' ', sayBtn(item.example))) : ''
    );
    return practiceLoop(el, { accept: item.accept, expected: item.accept ? null : item.example, example: item.example, model: item.example });
  }
};
