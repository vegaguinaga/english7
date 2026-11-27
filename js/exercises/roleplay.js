// Mini diálogo (role-play): la app dice su parte y el estudiante responde en voz alta.
import { h, sayBtn, feedback } from '../ui.js';
import { speak } from '../speech.js';
import { speakAttempt, speechFeedback } from './_speak.js';

export default {
  icon: '🎭', title: 'Role-play',
  items: ex => [ex],
  renderItem(el, ex) {
    return new Promise(resolve => {
      const chat = h('div', { class: 'chat', 'aria-live': 'polite' });
      const turnBox = h('div', { class: 'turn-box' });
      const startBtn = h('button', { class: 'btn primary big', type: 'button' }, '▶ Empezar el diálogo');
      el.append(
        ex.scene ? h('p', { class: 'scene' }, '🎬 ', ex.scene) : null,
        chat, turnBox, startBtn);
      const scores = [];
      let i = 0;

      startBtn.addEventListener('click', () => { startBtn.remove(); next(); });

      const bubble = (who, text, name) => {
        const b = h('div', { class: 'bubble ' + who },
          h('span', { class: 'who' }, name), h('span', {}, text),
          who === 'app' ? sayBtn(text, { voice: ex.appVoice }) : null);
        chat.append(b);
        b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };

      async function next() {
        if (i >= ex.turns.length) return finish();
        const t = ex.turns[i++];
        if (t.role === 'app') {
          bubble('app', t.text, ex.appName || 'App');
          await speak(t.text, { voice: t.voice || ex.appVoice });
          return next();
        }
        studentTurn(t, 0);
      }

      async function studentTurn(t, tries) {
        turnBox.replaceChildren(
          h('div', { class: 'card your-turn' },
            h('p', { class: 'small' }, '🗣️ Tu turno. Puedes decir:'),
            h('p', { class: 'say-text', lang: 'en' }, t.expected, ' ', t.example ? sayBtn(t.example) : sayBtn(t.expected))));
        const r = await speakAttempt(turnBox, { expected: t.expected, accept: t.accept, example: t.example, model: t.example || t.expected });
        const passed = r.mode === 'self' ? r.score > 0 : r.score >= 0.8;
        if (passed || tries >= 1) {
          scores.push(r.score);
          bubble('me', r.heard || t.example || t.expected.replace(/___/g, '…'), 'Tú');
          turnBox.replaceChildren();
          if (!passed) chat.append(h('p', { class: 'small note' }, 'Practica esta frase: ', h('strong', {}, t.example || t.expected)));
          return next();
        }
        turnBox.append(speechFeedback(r, { expected: t.expected, example: t.example }),
          h('div', { class: 'row' },
            h('button', { class: 'btn primary', type: 'button', onclick: () => studentTurn(t, tries + 1) }, '🔁 Intentar otra vez')));
      }

      function finish() {
        const score = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 1;
        turnBox.replaceChildren(feedback({
          ok: score >= 0.8, partial: score < 0.8,
          title: score >= 0.8 ? '🎉 ¡Terminaste el diálogo muy bien!' : '👍 ¡Terminaste el diálogo! Puedes repetirlo para mejorar.'
        }));
        resolve(score);
      }
    });
  }
};
