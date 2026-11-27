// Modo docente: ver y reiniciar el progreso guardado en este dispositivo.
import { h, toast, starsEl } from '../ui.js';
import { CONFIG } from '../config.js';
import { loadIndex, loadUnit } from '../data.js';
import { store, unitStats, allExercises } from '../store.js';

const KEY = 'ingles7_teacher';
const isUnlocked = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } };

export async function teacherView() {
  const view = h('section', { class: 'teacher' }, h('a', { href: '#/', class: 'back' }, '← Inicio'), h('h1', {}, '👩‍🏫 Modo docente'));
  if (!isUnlocked()) {
    const input = h('input', { class: 'input pin', type: 'password', inputmode: 'numeric', autocomplete: 'off', maxlength: 8, 'aria-label': 'PIN' });
    const msg = h('p', { class: 'field-msg', 'aria-live': 'polite' });
    const form = h('form', { class: 'card center' },
      h('label', {}, 'Escribe el PIN del docente:'), input, msg,
      h('button', { class: 'btn primary big', type: 'submit' }, 'Entrar'));
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (input.value === CONFIG.teacherPin) {
        try { sessionStorage.setItem(KEY, '1'); } catch (err) { /* nada */ }
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } else { msg.textContent = 'PIN incorrecto.'; input.value = ''; input.focus(); }
    });
    view.append(form);
    setTimeout(() => input.focus(), 50);
    return view;
  }

  const idx = await loadIndex();
  const units = [];
  for (const meta of idx.units.filter(u => u.available)) {
    try { units.push(await loadUnit(meta.id)); } catch (e) { console.error(e); }
  }

  const summary = () => units.map((u, n) => {
    const st = unitStats(u);
    return `Unit ${n + 1} - ${u.title}: ${st.progress}% | ${st.stars} estrellas | quiz ${st.quizBest}/${st.quizLen} (${st.quizAttempts} intentos) | insignia: ${st.badge ? 'sí' : 'no'}`;
  }).join('\n');

  view.append(
    h('p', {}, 'Este es el progreso guardado en este dispositivo.'),
    ...units.map(u => {
      const st = unitStats(u);
      const p = store.unit(u.id);
      return h('div', { class: 'card' },
        h('h2', {}, `${u.emoji} ${u.title}`),
        h('p', {}, starsEl(st.stars), ` ${st.progress}% · ${st.points} puntos · ${st.done}/${st.total} ejercicios · Quiz: ${st.quizBest}/${st.quizLen} (${st.quizAttempts} intentos) · Insignia: ${st.badge ? '🏅 sí' : 'no'}`),
        p.updated ? h('p', { class: 'small' }, 'Última actividad: ' + new Date(p.updated).toLocaleString('es-NI')) : null,
        h('details', {}, h('summary', {}, 'Ver ejercicios'),
          h('div', { class: 'table-wrap' }, h('table', {},
            h('thead', {}, h('tr', {}, h('th', {}, 'Ejercicio'), h('th', {}, 'Habilidad'), h('th', {}, 'Mejor'))),
            h('tbody', {}, allExercises(u).map(ex => h('tr', {},
              h('td', {}, ex.title || ex.id), h('td', {}, ex.skill),
              h('td', {}, p.done[ex.id] == null ? '—' : Math.round(p.done[ex.id] * 100) + '%'))))))),
        h('button', { class: 'btn danger', type: 'button', onclick: () => {
          if (confirm(`¿Borrar el progreso de "${u.title}"?`)) { store.resetUnit(u.id); toast('Progreso borrado'); window.dispatchEvent(new HashChangeEvent('hashchange')); }
        } }, '🗑️ Reiniciar esta unidad'));
    }),
    h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', onclick: async () => {
        try { await navigator.clipboard.writeText(summary()); toast('Resumen copiado'); }
        catch (e) { prompt('Copia este resumen:', summary()); }
      } }, '📋 Copiar resumen'),
      h('button', { class: 'btn danger', type: 'button', onclick: () => {
        if (confirm('¿Borrar TODO el progreso de este dispositivo?')) { store.resetAll(); toast('Todo el progreso fue borrado'); window.dispatchEvent(new HashChangeEvent('hashchange')); }
      } }, '🗑️ Reiniciar todo'),
      h('button', { class: 'btn', type: 'button', onclick: () => {
        try { sessionStorage.removeItem(KEY); } catch (e) { /* nada */ }
        location.hash = '#/';
      } }, '🔒 Salir del modo docente'))
  );
  return view;
}
