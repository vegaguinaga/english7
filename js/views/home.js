// Pantalla de inicio: las unidades con su avance.
import { h, progressBar, starsEl } from '../ui.js';
import { loadIndex, loadUnit } from '../data.js';
import { unitStats } from '../store.js';

export async function homeView() {
  const idx = await loadIndex();
  const cards = await Promise.all(idx.units.map(async (meta, n) => {
    const head = [
      h('span', { class: 'unit-emoji', 'aria-hidden': 'true' }, meta.emoji),
      h('span', { class: 'unit-num' }, `Unit ${n + 1}`),
      h('span', { class: 'unit-title' }, meta.title),
      h('span', { class: 'unit-es' }, meta.titleEs)
    ];
    if (!meta.available) {
      return h('div', { class: 'unit-card disabled', style: { '--unit': meta.color } }, head, h('span', { class: 'soon' }, '🔒 Próximamente'));
    }
    let st = null;
    try { st = unitStats(await loadUnit(meta.id)); } catch (e) { console.error(e); }
    return h('a', { class: 'unit-card', href: `#/u/${meta.id}`, style: { '--unit': meta.color } },
      head,
      st ? [
        h('span', { class: 'unit-meta' }, starsEl(st.stars), h('span', { class: 'pct' }, `${st.progress}%`), st.badge ? h('span', { class: 'badge-mini', title: 'Insignia ganada' }, meta.badge?.emoji || '🏅') : null),
        progressBar(st.progress, `Avance de ${meta.title}`)
      ] : null);
  }));

  return h('section', { class: 'home' },
    h('div', { class: 'hero' },
      h('h1', {}, '¡Hola! 👋'),
      h('p', {}, 'Practica inglés con 6 unidades. Escucha, lee, escribe y habla.')),
    h('div', { class: 'unit-grid' }, cards),
    h('p', { class: 'center' }, h('a', { href: '#/teacher', class: 'link-btn' }, '👩‍🏫 Modo docente'))
  );
}
