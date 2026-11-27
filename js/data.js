// Carga de datos JSON de las unidades.
let indexPromise = null;
const unitCache = {};

async function getJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`);
  return res.json();
}

export function loadIndex() {
  indexPromise ||= getJSON('data/units.json').catch(e => { indexPromise = null; throw e; });
  return indexPromise;
}

export async function loadUnit(id) {
  if (unitCache[id]) return unitCache[id];
  const idx = await loadIndex();
  const meta = idx.units.find(u => u.id === id);
  if (!meta) throw new Error('Unidad no encontrada: ' + id);
  if (!meta.available) throw new Error('Esta unidad estará disponible pronto.');
  const data = await getJSON(meta.file);
  unitCache[id] = { ...meta, ...data, id: meta.id };
  return unitCache[id];
}
