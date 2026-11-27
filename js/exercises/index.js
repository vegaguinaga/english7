// Registro de tipos de ejercicio: "type" del JSON → módulo.
// Cada módulo tiene: items(ex), renderItem(el, item, ex) → Promise<puntaje 0..1>,
// y opcionalmente header(el, ex) y autoNext (si el propio ejercicio tiene botón "Continuar").
import listenChoice from './listen-choice.js';
import dictation from './dictation.js';
import listenTf from './listen-tf.js';
import reading from './reading.js';
import match from './match.js';
import gapFill from './gap-fill.js';
import wordOrder from './word-order.js';
import formFill from './form-fill.js';
import guidedWriting from './guided-writing.js';
import shadowing from './shadowing.js';
import speakAnswer from './speak-answer.js';
import roleplay from './roleplay.js';

export const REGISTRY = {
  'listen-choice': listenChoice,
  'dictation': dictation,
  'listen-tf': listenTf,
  'reading': reading,
  'match': match,
  'gap-fill': gapFill,
  'word-order': wordOrder,
  'form-fill': formFill,
  'guided-writing': guidedWriting,
  'shadowing': shadowing,
  'speak-answer': speakAnswer,
  'roleplay': roleplay
};

export function getType(type) {
  const m = REGISTRY[type];
  if (!m) throw new Error(`Tipo de ejercicio desconocido en el JSON: "${type}"`);
  return m;
}
