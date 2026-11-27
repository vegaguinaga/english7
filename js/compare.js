// Normalizar y comparar textos en inglés (para dictado, escritura y voz).

const CONTRACTIONS = {
  "i'm": 'i am', "you're": 'you are', "he's": 'he is', "she's": 'she is', "it's": 'it is',
  "we're": 'we are', "they're": 'they are', "what's": 'what is', "where's": 'where is',
  "who's": 'who is', "how's": 'how is', "that's": 'that is', "there's": 'there is',
  "here's": 'here is', "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not',
  "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "can't": 'cannot',
  "mustn't": 'must not', "i've": 'i have', "let's": 'let us', "i'll": 'i will',
  "you'll": 'you will', "won't": 'will not', "i'd": 'i would'
};

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth',
  'tenth', 'eleventh', 'twelfth'];

function numWords(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numWords(n % 100) : '');
}

export function normalize(s) {
  let t = String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  t = t.replace(/[’‘`´]/g, "'");
  t = t.replace(/\b(mr|mrs|ms|dr)\./g, '$1');
  t = t.replace(/[a-z]+'[a-z]+/g, w => CONTRACTIONS[w] || w.replace(/'/g, ''));
  t = t.replace(/\b(\d+)(st|nd|rd|th)\b/g, (m, d) => ORD[+d] ? ' ' + ORD[+d] + ' ' : d);
  t = t.replace(/\d+/g, d => ' ' + (d.length <= 3 ? numWords(+d) : [...d].map(c => ONES[+c]).join(' ')) + ' ');
  t = t.replace(/[^a-z0-9\s]/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

export const tokens = s => normalize(s).split(' ').filter(Boolean);

function lcsLen(a, b) {
  const dp = Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let prev = 0;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

// recall: cuántas palabras esperadas aparecieron (para voz).
// strict: también penaliza palabras de más (para dictado).
export function similarity(expected, actual, mode = 'recall') {
  const a = tokens(expected).filter(w => w !== '___');
  const b = tokens(actual);
  if (!a.length) return b.length ? 0 : 1;
  const l = lcsLen(a, b);
  return mode === 'strict' ? l / Math.max(a.length, b.length) : l / a.length;
}

export const sameText = (a, b) => normalize(a) === normalize(b);

export function matchesAny(text, patterns = []) {
  const n = normalize(text);
  const raw = String(text ?? '').toLowerCase();
  return patterns.some(p => {
    try { const re = new RegExp(p, 'i'); return re.test(n) || re.test(raw); }
    catch (e) { console.warn('Patrón inválido en JSON:', p); return false; }
  });
}

// Marca qué palabras de la frase esperada sí aparecen en lo dicho/escrito.
export function diffWords(expected, actual) {
  const have = new Set(tokens(actual));
  return String(expected).split(/\s+/).filter(Boolean).map(w => {
    const ts = tokens(w);
    return { w, ok: ts.length === 0 || ts.every(t => have.has(t)) };
  });
}

export const digits = s => String(s ?? '').replace(/\D/g, '');
