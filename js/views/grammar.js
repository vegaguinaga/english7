// Explicaciones de gramática en español con ejemplos.
import { h, mdEl, sayBtn } from '../ui.js';

export function grammarView(unit) {
  return h('div', { class: 'grammar' }, (unit.grammar || []).map(g =>
    h('details', { class: 'card gcard', open: true },
      h('summary', {}, h('h3', {}, g.title)),
      g.explanation ? mdEl('div', g.explanation, { class: 'g-exp' }) : null,
      g.table ? h('div', { class: 'table-wrap' }, h('table', {},
        g.table.headers ? h('thead', {}, h('tr', {}, g.table.headers.map(c => h('th', { scope: 'col' }, c)))) : null,
        h('tbody', {}, g.table.rows.map(r => h('tr', {}, r.map((c, i) => i === 0 ? h('th', { scope: 'row', lang: 'en' }, c) : h('td', { html: mdEl('span', c).innerHTML }))))))) : null,
      g.examples?.length ? h('ul', { class: 'examples' }, g.examples.map(e =>
        h('li', {}, h('span', { class: 'ex-en', lang: 'en' }, e.en), ' ', sayBtn(e.en), h('br'), h('span', { class: 'ex-es' }, e.es)))) : null,
      g.tip ? mdEl('p', '💡 ' + g.tip, { class: 'tip' }) : null
    )));
}
