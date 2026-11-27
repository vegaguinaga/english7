// Guardado del progreso en localStorage.
import { CONFIG, SKILLS } from './config.js';

const blank = () => ({
  version: 1,
  settings: { rate: 'normal', theme: 'auto' },
  units: {}
});

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(CONFIG.storageKey));
    if (s && s.version === 1) {
      return { ...blank(), ...s, settings: { ...blank().settings, ...(s.settings || {}) } };
    }
  } catch (e) { /* almacenamiento no disponible o dañado */ }
  return blank();
}

let state = load();

function save() {
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); }
  catch (e) { console.warn('No se pudo guardar el progreso', e); }
}

const blankUnit = () => ({ done: {}, quiz: { best: 0, attempts: 0 }, badge: false, updated: null });

export const store = {
  get settings() { return state.settings; },
  setSetting(key, value) {
    state.settings[key] = value;
    save();
    window.dispatchEvent(new CustomEvent('settingschange', { detail: { key, value } }));
  },
  unit(id) { return state.units[id] || blankUnit(); },
  _unitW(id) { return (state.units[id] ||= blankUnit()); },
  saveExercise(unitId, exId, score) {
    const u = this._unitW(unitId);
    const s = Math.round(Math.max(0, Math.min(1, score)) * 100) / 100;
    u.done[exId] = Math.max(u.done[exId] ?? 0, s);
    u.updated = new Date().toISOString();
    save();
  },
  saveQuiz(unitId, correct) {
    const u = this._unitW(unitId);
    u.quiz.best = Math.max(u.quiz.best, correct);
    u.quiz.attempts += 1;
    u.updated = new Date().toISOString();
    save();
  },
  markBadge(unitId) { this._unitW(unitId).badge = true; save(); },
  resetUnit(unitId) { delete state.units[unitId]; save(); },
  resetAll() { const settings = state.settings; state = blank(); state.settings = settings; save(); },
  raw() { return state; }
};

export function allExercises(unit) {
  return SKILLS.flatMap(s => (unit.skills?.[s.id] || []).map(ex => ({ ...ex, skill: s.id })));
}

// Calcula avance, estrellas, puntos e insignia de una unidad.
export function unitStats(unit) {
  const p = store.unit(unit.id);
  const exs = allExercises(unit);
  const total = exs.length;
  const done = exs.filter(e => p.done[e.id] != null).length;
  const quizLen = unit.quiz?.length || 0;
  const hasQuiz = quizLen > 0;
  const quizDone = p.quiz.attempts > 0;
  const steps = total + (hasQuiz ? 1 : 0);
  const progress = steps ? Math.round(100 * (done + (quizDone ? 1 : 0)) / steps) : 0;
  const sumEx = exs.reduce((a, e) => a + (p.done[e.id] || 0), 0);
  const w = hasQuiz ? CONFIG.quizWeight : 0;
  const score = (total + w) ? (sumEx + (hasQuiz ? w * p.quiz.best / quizLen : 0)) / (total + w) : 0;
  const stars = CONFIG.starThresholds.filter(t => score >= t).length;
  const points = Math.round(sumEx * 10) + p.quiz.best * 10;
  const badge = total > 0 && done === total && hasQuiz && p.quiz.best >= Math.min(CONFIG.badgeQuizMin, quizLen);
  return { progress, done, total, stars, points, badge, score, quizBest: p.quiz.best, quizAttempts: p.quiz.attempts, quizLen };
}
