// Tarjetas de vocabulario: toca la tarjeta para ver la traducción.
import { h, iconEl, sayBtn } from '../ui.js';
import { speak } from '../speech.js';

export function vocabView(unit) {
  const cards = (unit.vocabulary || []).map(v => {
    const back = h('p', { class: 'v-es', hidden: true }, v.es);
    const card = h('div', { class: 'vcard', role: 'button', tabindex: 0, 'aria-label': `${v.en}. Toca para ver la traducción` },
      iconEl(v.icon, 'v-icon'),
      h('p', { class: 'v-en', lang: 'en' }, v.en),
      back,
      v.example ? h('p', { class: 'v-ex', lang: 'en', hidden: true }, v.example, ' ', sayBtn(v.example)) : null,
      h('div', { class: 'v-actions' }, sayBtn(v.en, { audio: v.audio }, '🔊 Escuchar'))
    );
    const flip = () => {
      const show = back.hidden;
      card.querySelectorAll('.v-es, .v-ex').forEach(x => { x.hidden = !show; });
      card.classList.toggle('flipped', show);
      if (show) speak(v.audio || v.en);
    };
    card.addEventListener('click', flip);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    return card;
  });
  return h('div', {},
    h('p', { class: 'instructions' }, '👆 Toca una tarjeta para ver la traducción y un ejemplo. Toca 🔊 para escuchar.'),
    h('div', { class: 'vgrid' }, cards));
}
