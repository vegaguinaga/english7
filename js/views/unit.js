// Vista de una unidad con pestañas, lista de ejercicios y pantalla de ejercicio.
import { h, progressBar, starsEl, mdEl } from '../ui.js';
import { loadUnit } from '../data.js';
import { store, unitStats } from '../store.js';
import { TABS, SKILLS } from '../config.js';
import { getType } from '../exercises/index.js';
import { runSteps, stepsForExercise } from '../exercises/runner.js';
import { vocabView } from './vocab.js';
import { grammarView } from './grammar.js';
import { quizView } from './quiz.js';
import { checkBadge, badgeHint } from './rewards.js';

function unitHeader(unit) {
  const st = unitStats(unit);
  return h('header', { class: 'unit-head' },
    h('a', { href: '#/', class: 'back' }, '← Inicio'),
    h('h1', {}, h('span', { 'aria-hidden': 'true' }, unit.emoji + ' '), unit.title),
    h('p', { class: 'sub' }, unit.titleEs),
    h('div', { class: 'unit-meta' }, starsEl(st.stars), h('span', {}, `${st.progress}% · ${st.points} puntos`)),
    progressBar(st.progress));
}

export async function unitView(id, tab = 'vocab') {
  const unit = await loadUnit(id);
  if (!TABS.some(t => t.id === tab)) tab = 'vocab';
  const nav = h('nav', { class: 'tabs', 'aria-label': 'Secciones de la unidad' }, TABS.map(t =>
    h('a', { href: `#/u/${id}/${t.id}`, class: 'tab' + (t.id === tab ? ' active' : ''), 'aria-current': t.id === tab ? 'page' : null },
      h('span', { class: 'tab-ic', 'aria-hidden': 'true' }, t.icon), h('span', {}, t.label))));
  let content;
  if (tab === 'vocab') content = vocabView(unit);
  else if (tab === 'grammar') content = grammarView(unit);
  else if (tab === 'quiz') content = quizView(unit);
  else content = skillList(unit, tab);
  setTimeout(() => nav.querySelector('.active')?.scrollIntoView({ inline: 'center', block: 'nearest' }), 0);
  return h('section', { class: 'unit', style: { '--unit': unit.color } }, unitHeader(unit), nav, h('div', { class: 'tab-content' }, content));
}

function skillList(unit, skillId) {
  const skill = SKILLS.find(s => s.id === skillId);
  const exs = unit.skills?.[skillId] || [];
  const prog = store.unit(unit.id).done;
  return h('div', {},
    h('h2', { class: 'skill-title' }, `${skill.icon} ${skill.label} · ${skill.es}`),
    h('div', { class: 'ex-list' }, exs.map((ex, n) => {
      const mod = getType(ex.type);
      const score = prog[ex.id];
      return h('a', { class: 'ex-card', href: `#/u/${unit.id}/ex/${ex.id}` },
        h('span', { class: 'ex-ic', 'aria-hidden': 'true' }, mod.icon),
        h('span', { class: 'ex-info' }, h('strong', {}, `${n + 1}. ${ex.title || mod.title}`), h('span', { class: 'small' }, ex.instructions)),
        h('span', { class: 'ex-score ' + (score == null ? 'new' : score >= 0.8 ? 'good' : 'mid') },
          score == null ? 'Nuevo' : `✔ ${Math.round(score * 100)}%`));
    })),
    h('p', { class: 'small center' }, badgeHint(unit)));
}

function findExercise(unit, exId) {
  for (const s of SKILLS) {
    const list = unit.skills?.[s.id] || [];
    const i = list.findIndex(e => e.id === exId);
    if (i >= 0) return { ex: list[i], skill: s, list, i };
  }
  return null;
}

export async function exerciseView(unitId, exId) {
  const unit = await loadUnit(unitId);
  const found = findExercise(unit, exId);
  if (!found) throw new Error('Ejercicio no encontrado: ' + exId);
  const { ex, skill, list, i } = found;
  const mod = getType(ex.type);
  const area = h('div', { class: 'ex-area' });
  const view = h('section', { class: 'unit exercise', style: { '--unit': unit.color } },
    h('a', { href: `#/u/${unitId}/${skill.id}`, class: 'back' }, `← ${skill.icon} ${skill.label}`),
    h('h1', { class: 'ex-title' }, mod.icon, ' ', ex.title || mod.title),
    mdEl('p', ex.instructions || '', { class: 'instructions' }),
    area);

  async function start() {
    area.replaceChildren();
    const scores = await runSteps(area, stepsForExercise(ex), { sharedHeader: mod.header ? ex : null });
    const score = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    store.saveExercise(unitId, ex.id, score);
    const pct = Math.round(score * 100);
    const nextEx = list[i + 1];
    area.replaceChildren(h('div', { class: 'card result' },
      h('div', { class: 'result-emoji', 'aria-hidden': 'true' }, pct >= 90 ? '🌟' : pct >= 70 ? '😃' : pct >= 50 ? '🙂' : '💪'),
      h('h2', {}, `Tu puntaje: ${pct}%`),
      h('p', {}, pct >= 90 ? '¡Excelente trabajo!' : pct >= 70 ? '¡Muy bien!' : pct >= 50 ? '¡Bien! Puedes repetir para mejorar.' : 'Sigue practicando, ¡tú puedes!'),
      h('div', { class: 'row center' },
        h('button', { class: 'btn', type: 'button', onclick: start }, '🔁 Repetir'),
        nextEx ? h('a', { class: 'btn primary', href: `#/u/${unitId}/ex/${nextEx.id}` }, 'Siguiente ejercicio →')
               : h('a', { class: 'btn primary', href: `#/u/${unitId}/${skill.id}` }, 'Volver a la lista'))));
    area.scrollIntoView({ block: 'start', behavior: 'smooth' });
    checkBadge(unit);
  }
  start();
  return view;
}
