// Shadowing: escuchar y repetir una palabra o frase.
import { h, listenBtn } from '../ui.js';
import { speak } from '../speech.js';
import { practiceLoop } from './_speak.js';

const norm = item => (typeof item === 'string' ? { text: item } : item);

export default {
  icon: '🔁', title: 'Escucha y repite',
  items: ex => ex.items.map(norm),
  autoNext: true,
  renderItem(el, item) {
    el.append(
      h('div', { class: 'card say-card' },
        h('p', { class: 'say-text', lang: 'en' }, item.text),
        item.es ? h('p', { class: 'small' }, item.es) : null),
      listenBtn(() => speak(item.audio || item.text, { voice: item.voice }), { auto: true })
    );
    return practiceLoop(el, { expected: item.text, accept: item.accept, model: item.audio || item.text });
  }
};
