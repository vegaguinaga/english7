// Revisa los JSON de las unidades disponibles. Uso (desde la carpeta del proyecto): node tools/check-data.mjs
import fs from 'fs';
import { matchesAny } from '../js/compare.js';
const assert = (c, m) => { if (!c) { console.log('FAIL', m); process.exitCode = 1; } };
const idx = JSON.parse(fs.readFileSync('data/units.json'));
for (const u of idx.units.filter(u => u.available)) {
  const d = JSON.parse(fs.readFileSync(u.file));
  const ids = new Set();
  const exs = [...Object.values(d.skills).flat(), ...d.quiz];
  for (const ex of exs) {
    const tag = ex.id || 'quiz:' + ex.type;
    if (ex.id) { assert(!ids.has(ex.id), 'dup id ' + ex.id); ids.add(ex.id); }
    const ch = it => assert(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < it.options.length, tag + ' answer idx');
    ({ 'listen-choice': () => ex.items.forEach(ch), reading: () => ex.questions.forEach(ch),
       'gap-fill': () => ex.items.forEach(it => assert(it.text.split('___').length - 1 === it.answers.length, tag + ' gaps ' + it.text)),
       'listen-tf': () => ex.statements.forEach(s => assert(typeof s.answer === 'boolean', tag)),
       'word-order': () => ex.items.forEach(it => assert(it.answer, tag)),
       dictation: () => ex.items.forEach(it => assert(it.answer, tag)),
       match: () => assert(ex.pairs.every(p => p.length === 2), tag),
       'form-fill': () => assert(ex.fields.length, tag),
       'guided-writing': () => assert(matchesAny(ex.model, ex.checks.map(c => c.pattern)) && ex.checks.every(c => matchesAny(ex.model, [c.pattern])), tag + ' model fails checks'),
       shadowing: () => assert(ex.items.length, tag),
       'speak-answer': () => ex.items.forEach(it => assert(!it.accept || matchesAny(it.example, it.accept), tag + ' example rejected: ' + it.example)),
       roleplay: () => ex.turns.filter(t => t.role === 'student').forEach(t => assert(!t.accept || matchesAny(t.example || t.expected, t.accept), tag + ' turn ' + t.expected)),
    }[ex.type] || (() => assert(false, 'unknown type ' + ex.type)))();
  }
  if (u.id === 'unit1') {
  // Name check should not fire on age/from sentences alone
  const nameRe = d.skills.writing.find(e => e.type === 'guided-writing').checks[0].pattern;
  assert(!matchesAny('I am twelve years old. I am from León.', [nameRe]), 'name check false positive');
  assert(matchesAny("Hi. I'm Luis.", [nameRe]), 'name check misses I\'m Luis');
  }
  console.log(u.id, 'exercises:', ids.size, 'quiz:', d.quiz.length, 'vocab:', d.vocabulary.length);
}
