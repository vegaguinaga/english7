// Voz: leer en inglés (speechSynthesis), reconocer voz (SpeechRecognition) y grabar (MediaRecorder).
import { CONFIG } from './config.js';
import { store } from './store.js';

const synth = window.speechSynthesis || null;
export const canSpeak = !!synth && typeof window.SpeechSynthesisUtterance !== 'undefined';

let voices = [];
function refreshVoices() { if (canSpeak) voices = synth.getVoices() || []; }
if (canSpeak) {
  refreshVoices();
  if (synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoices);
  else synth.onvoiceschanged = refreshVoices;
}

const FEMALE = /female|samantha|zira|jenny|aria|ava|allison|susan|karen|victoria|joanna|salli|kendra|kimberly|ivy|emma|michelle/i;
const MALE = /\bmale|david|mark|guy|alex|fred|daniel|tom\b|matthew|joey|justin|christopher|eric|roger|steffan/i;

function pickVoice(kind) {
  if (!voices.length) refreshVoices();
  const us = voices.filter(v => /^en[-_]US/i.test(v.lang));
  const pool = us.length ? us : voices.filter(v => /^en/i.test(v.lang));
  if (!pool.length) return { voice: null, exact: false };
  if (kind === 'male') {
    const m = pool.find(v => MALE.test(v.name) && !/female/i.test(v.name));
    if (m) return { voice: m, exact: true };
  }
  if (kind === 'female') {
    const f = pool.find(v => FEMALE.test(v.name));
    if (f) return { voice: f, exact: true };
  }
  return { voice: pool.find(v => v.localService) || pool[0], exact: false };
}

export const currentRate = () => CONFIG.rates[store.settings.rate] || CONFIG.rates.normal;

let token = 0;
const wait = ms => new Promise(r => setTimeout(r, ms));

export function stopSpeaking() {
  token++;
  if (canSpeak) { try { synth.cancel(); } catch (e) { /* nada */ } }
}

function sayOne(text, { voice, rate, myToken }) {
  return new Promise(resolve => {
    if (!canSpeak || myToken !== token || !text.trim()) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    const pick = pickVoice(voice);
    if (pick.voice) u.voice = pick.voice;
    u.rate = rate;
    // Si no hay voz de hombre/mujer distinta, cambiamos el tono para diferenciar personajes.
    u.pitch = pick.exact ? 1 : voice === 'male' ? 0.8 : voice === 'female' ? 1.2 : 1;
    let finished = false;
    const timer = setTimeout(() => end(), 2500 + text.length * 120 / rate);
    function end() { if (!finished) { finished = true; clearTimeout(timer); resolve(); } }
    u.onend = end;
    u.onerror = end;
    synth.speak(u);
  });
}

function splitSentences(text) {
  const t = String(text).replace(/\b(Mr|Mrs|Ms|Dr)\./g, '$1');
  return (t.match(/[^.!?]+[.!?]*/g) || [t]).map(s => s.trim()).filter(Boolean);
}

export async function speak(text, opts = {}) {
  stopSpeaking();
  const my = token;
  await wait(80);
  for (const part of splitSentences(text)) {
    if (my !== token) return;
    await sayOne(part, { voice: opts.voice, rate: opts.rate || currentRate(), myToken: my });
  }
}

// Diálogos: [{ text, voice: 'male' | 'female' }]
export async function speakLines(lines) {
  stopSpeaking();
  const my = token;
  await wait(80);
  for (const line of lines) {
    for (const part of splitSentences(line.text)) {
      if (my !== token) return;
      await sayOne(part, { voice: line.voice, rate: currentRate(), myToken: my });
    }
    await wait(300);
  }
}

/* ---------- Reconocimiento de voz ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canRecognize = !!SR;
export const canRecord = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

// Modo de práctica oral: 'recognition' (compara automático), 'record' (grábate y compárate), 'self'.
let mode = canRecognize ? 'recognition' : canRecord ? 'record' : 'self';
export const speechMode = () => mode;
export function setSpeechMode(m) { mode = m; window.dispatchEvent(new CustomEvent('speechmode', { detail: m })); }
export const FATAL_SR_ERRORS = ['network', 'not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported', 'start-failed'];

let current = null;
export function stopListening() { try { current?.abort(); } catch (e) { /* nada */ } current = null; }

export function listen({ maxMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!SR) return reject('unsupported');
    stopSpeaking();
    const r = new SR();
    r.lang = 'en-US';
    r.interimResults = false;
    r.continuous = false;
    r.maxAlternatives = 5;
    let done = false;
    const finish = (fn, val) => { if (!done) { done = true; clearTimeout(timer); current = null; fn(val); } };
    r.onresult = e => finish(resolve, Array.from(e.results[0]).map(a => a.transcript));
    r.onerror = e => finish(reject, e.error || 'error');
    r.onend = () => finish(reject, 'no-speech');
    const timer = setTimeout(() => { try { r.stop(); } catch (e) { /* nada */ } }, maxMs);
    current = r;
    try { r.start(); } catch (e) { finish(reject, 'start-failed'); }
  });
}

/* ---------- Grabación ---------- */
let activeStream = null;
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  activeStream = stream;
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  rec.start();
  return {
    stop: () => new Promise(resolve => {
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        activeStream = null;
        resolve(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })));
      };
      if (rec.state !== 'inactive') rec.stop(); else rec.onstop();
    })
  };
}

export function stopAll() {
  stopSpeaking();
  stopListening();
  if (activeStream) { activeStream.getTracks().forEach(t => t.stop()); activeStream = null; }
}
