// Arranque de la app: encabezado, tema, rutas y service worker.
import { h, speedToggle } from './ui.js';
import { store } from './store.js';
import { stopAll } from './speech.js';
import { homeView } from './views/home.js';
import { unitView, exerciseView } from './views/unit.js';
import { teacherView } from './views/teacher.js';

/* ---------- Tema claro / oscuro ---------- */
function applyTheme() {
  const t = store.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}
const isDark = () => store.settings.theme === 'dark' ||
  (store.settings.theme === 'auto' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);

function themeToggle() {
  const btn = h('button', { class: 'btn chip', type: 'button' });
  const paint = () => {
    btn.textContent = isDark() ? '☀️' : '🌙';
    btn.setAttribute('aria-label', isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  };
  btn.addEventListener('click', () => { store.setSetting('theme', isDark() ? 'light' : 'dark'); applyTheme(); paint(); });
  paint();
  return btn;
}

function header() {
  return h('div', { class: 'bar-inner' },
    h('a', { href: '#/', class: 'brand', 'aria-label': 'Inicio' }, h('span', { 'aria-hidden': 'true' }, '🇳🇮 '), 'English 7'),
    h('div', { class: 'bar-actions' }, speedToggle(), themeToggle()));
}

/* ---------- Rutas ---------- */
const routes = [
  [/^#?\/?$/, () => homeView()],
  [/^#\/u\/([\w-]+)\/ex\/([\w-]+)$/, m => exerciseView(m[1], m[2])],
  [/^#\/u\/([\w-]+)(?:\/([\w-]+))?$/, m => unitView(m[1], m[2] || 'vocab')],
  [/^#\/teacher$/, () => teacherView()]
];

let renderId = 0;
async function render() {
  const my = ++renderId;
  stopAll();
  document.querySelectorAll('.modal-wrap').forEach(m => m.remove());
  const main = document.getElementById('main');
  const hash = location.hash || '#/';
  const route = routes.find(([re]) => re.test(hash));
  main.replaceChildren(h('p', { class: 'loading' }, 'Cargando…'));
  try {
    if (!route) throw new Error('Página no encontrada.');
    const view = await route[1](hash.match(route[0]));
    if (my !== renderId) return;
    main.replaceChildren(view);
    window.scrollTo(0, 0);
  } catch (err) {
    if (my !== renderId) return;
    console.error(err);
    const fileProto = location.protocol === 'file:';
    main.replaceChildren(h('div', { class: 'card error' },
      h('h2', {}, '😕 Algo salió mal'),
      h('p', {}, fileProto
        ? 'La app no puede abrirse con doble clic. Ábrela con un servidor local o desde internet (lee el README).'
        : err.message),
      h('a', { class: 'btn primary', href: '#/' }, '🏠 Volver al inicio')));
  }
}

/* ---------- Inicio ---------- */
applyTheme();
document.getElementById('bar').append(header());
window.addEventListener('hashchange', render);
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker no registrado', err));
  });
}
