// Insignias al terminar una unidad.
import { h, modal } from '../ui.js';
import { store, unitStats } from '../store.js';
import { CONFIG } from '../config.js';

export function checkBadge(unit) {
  const st = unitStats(unit);
  if (st.badge && !store.unit(unit.id).badge) {
    store.markBadge(unit.id);
    modal({
      title: '¡Ganaste una insignia!',
      body: h('div', { class: 'badge-big' },
        h('div', { class: 'badge-emoji', 'aria-hidden': 'true' }, unit.badge?.emoji || '🏅'),
        h('p', {}, h('strong', {}, unit.badge?.name || unit.title)),
        h('p', {}, `Terminaste la unidad “${unit.title}”. ¡Felicidades! 🎉`)),
      actions: [{ label: '¡Genial!' }]
    });
    return true;
  }
  return false;
}

export function badgeHint(unit) {
  const st = unitStats(unit);
  if (st.badge) return `🏅 Ya tienes la insignia de esta unidad.`;
  return `Para ganar la insignia: completa los ${st.total} ejercicios (${st.done} hechos) y saca ${Math.min(CONFIG.badgeQuizMin, st.quizLen)} o más en el quiz (mejor: ${st.quizBest}/${st.quizLen}).`;
}
