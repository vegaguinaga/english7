// Componentes de interfaz reutilizables.
import { store } from './store.js';
import { speak, canSpeak } from './speech.js';

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Mini-markdown seguro: **negrita**, *cursiva*, saltos de línea.
export function md(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}
export const mdEl = (tag, s, attrs = {}) => h(tag, { ...attrs, html: md(s) });

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Ícono: { emoji: "🏥" } o { svg: "stop" } (archivo assets/svg/stop.svg)
export function iconEl(icon, cls = 'icon') {
  if (!icon) return null;
  if (icon.svg) return h('img', { class: cls + ' icon-svg', src: `assets/svg/${icon.svg}.svg`, alt: icon.alt || '', loading: 'lazy' });
  if (icon.emoji) return h('span', { class: cls, 'aria-hidden': 'true' }, icon.emoji);
  return null;
}

// Botón pequeño para escuchar una palabra o frase.
export function sayBtn(text, opts = {}, label = '🔊') {
  return h('button', {
    class: 'btn icon-btn', type: 'button', 'aria-label': 'Escuchar: ' + text, title: 'Escuchar',
    onclick: e => { e.stopPropagation(); speak(opts.audio || text, opts); }
  }, label);
}

// Botón grande "Escuchar" → después de la primera vez dice "Escuchar de nuevo".
export function listenBtn(play, { auto = false } = {}) {
  const btn = h('button', { class: 'btn primary big listen', type: 'button' }, '🔊 Escuchar');
  const run = () => { btn.textContent = '🔁 Escuchar de nuevo'; play(); };
  btn.addEventListener('click', run);
  const row = h('div', { class: 'listen-row' }, btn, speedToggle());
  if (!canSpeak) row.append(h('p', { class: 'note warn' }, 'Tu navegador no puede leer en voz alta. Prueba con Chrome.'));
  if (auto) setTimeout(run, 250);
  return row;
}

// Interruptor de velocidad (lento / normal), sincronizado en toda la app.
export function speedToggle() {
  const btn = h('button', { class: 'btn chip speed', type: 'button' });
  const paint = () => {
    const slow = store.settings.rate === 'slow';
    btn.textContent = slow ? '🐢 Lento' : '🐇 Normal';
    btn.setAttribute('aria-pressed', String(slow));
    btn.setAttribute('aria-label', 'Velocidad de la voz: ' + (slow ? 'lenta' : 'normal'));
  };
  btn.addEventListener('click', () => store.setSetting('rate', store.settings.rate === 'slow' ? 'normal' : 'slow'));
  // Se quita el listener cuando el botón ya no está en pantalla.
  const onChange = () => {
    if (btn.dataset.mounted && !btn.isConnected) return window.removeEventListener('settingschange', onChange);
    paint();
  };
  window.addEventListener('settingschange', onChange);
  setTimeout(() => { if (btn.isConnected) btn.dataset.mounted = '1'; }, 0);
  paint();
  return btn;
}

// Caja de retroalimentación.
export function feedback({ ok, partial = false, title, correct, explain, children }) {
  const cls = ok ? 'ok' : partial ? 'partial' : 'bad';
  const head = title || (ok ? '✅ ¡Correcto!' : partial ? '🟡 ¡Casi!' : '❌ Incorrecto');
  return h('div', { class: 'feedback ' + cls, role: 'status', 'aria-live': 'polite' },
    h('p', { class: 'fb-title' }, head),
    (!ok && correct) ? h('p', {}, 'Respuesta correcta: ', h('strong', {}, correct)) : null,
    explain ? mdEl('p', explain, { class: 'fb-explain' }) : null,
    children || null
  );
}

export function progressBar(pct, label) {
  return h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct, 'aria-label': label || 'Avance' },
    h('div', { class: 'progress-fill', style: { width: pct + '%' } }));
}

export function starsEl(n, max = 3) {
  return h('span', { class: 'stars', 'aria-label': `${n} de ${max} estrellas` },
    Array.from({ length: max }, (_, i) => h('span', { class: i < n ? 'star on' : 'star', 'aria-hidden': 'true' }, '★')));
}

export function modal({ title, body, actions = [{ label: 'Cerrar' }] }) {
  const prev = document.activeElement;
  const close = () => { wrap.remove(); prev?.focus?.(); };
  const wrap = h('div', { class: 'modal-wrap', onclick: e => { if (e.target === wrap) close(); } },
    h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('h2', {}, title),
      body,
      h('div', { class: 'modal-actions' }, actions.map(a =>
        h('button', { class: 'btn ' + (a.cls || 'primary'), type: 'button', onclick: () => { close(); a.onclick?.(); } }, a.label)))
    ));
  wrap.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.body.append(wrap);
  wrap.querySelector('.modal-actions .btn')?.focus();
  return close;
}

export function toast(msg) {
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}
