// Quiz final de la unidad: mezcla las 4 habilidades.
import { h, mdEl } from '../ui.js';
import { store, unitStats } from '../store.js';
import { CONFIG, SKILLS } from '../config.js';
import { getType } from '../exercises/index.js';
import { runSteps } from '../exercises/runner.js';
import { checkBadge, badgeHint } from './rewards.js';

export function quizView(unit) {
  const box = h('div', { class: 'quiz' });
  const questions = unit.quiz || [];

  function intro() {
    const st = unitStats(unit);
    box.replaceChildren(h('div', { class: 'card center' },
      h('div', { class: 'result-emoji', 'aria-hidden': 'true' }, '🏆'),
      h('h2', {}, 'Quiz final'),
      h('p', {}, `${questions.length} preguntas que mezclan Listening, Reading, Writing y Speaking.`),
      st.quizAttempts ? h('p', {}, `Tu mejor puntaje: ${st.quizBest} de ${questions.length}`) : null,
      h('p', { class: 'small' }, badgeHint(unit)),
      h('button', { class: 'btn primary big', type: 'button', onclick: start }, st.quizAttempts ? '🔁 Hacer el quiz otra vez' : '▶ Empezar')));
  }

  async function start() {
    box.replaceChildren();
    const steps = questions.map(q => {
      const skill = SKILLS.find(s => s.id === q.skill);
      return {
        ex: q,
        item: getType(q.type).items(q)[0],
        label: h('div', {},
          skill ? h('span', { class: 'skill-chip' }, `${skill.icon} ${skill.label}`) : null,
          q.instructions ? mdEl('p', q.instructions, { class: 'instructions' }) : null)
      };
    });
    const scores = await runSteps(box, steps);
    const correct = scores.filter(s => s >= CONFIG.passScore).length;
    store.saveQuiz(unit.id, correct);
    const bySkill = SKILLS.map(s => {
      const idx = questions.map((q, i) => (q.skill === s.id ? i : -1)).filter(i => i >= 0);
      const ok = idx.filter(i => scores[i] >= CONFIG.passScore).length;
      return idx.length ? h('li', {}, `${s.icon} ${s.label}: ${ok} de ${idx.length}`) : null;
    });
    const pass = correct >= Math.min(CONFIG.badgeQuizMin, questions.length);
    box.replaceChildren(h('div', { class: 'card result center' },
      h('div', { class: 'result-emoji', 'aria-hidden': 'true' }, pass ? '🎉' : '💪'),
      h('h2', {}, `${correct} de ${questions.length}`),
      h('p', {}, pass ? '¡Muy bien! Aprobaste el quiz.' : `Necesitas ${Math.min(CONFIG.badgeQuizMin, questions.length)} o más. Repasa y vuelve a intentarlo.`),
      h('ul', { class: 'by-skill' }, bySkill),
      h('div', { class: 'row center' },
        h('button', { class: 'btn', type: 'button', onclick: start }, '🔁 Repetir quiz'),
        h('a', { class: 'btn primary', href: '#/' }, '🏠 Inicio'))));
    box.scrollIntoView({ block: 'start', behavior: 'smooth' });
    checkBadge(unit);
  }

  intro();
  return box;
}
