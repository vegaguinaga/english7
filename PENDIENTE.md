# Estado del proyecto (para continuar en otra máquina)

## Hecho
- Motor completo en JS puro con módulos ES (sin build): rutas por hash, encabezado con velocidad de voz y modo oscuro.
- `js/store.js`: progreso en localStorage (`ingles7_progress`), estrellas, puntos e insignias.
- `js/speech.js`: TTS en-US (lento/normal), SpeechRecognition y respaldo con MediaRecorder ("grábate y compárate").
- `js/compare.js`: normalización (contracciones, números a palabras, acentos) y similitud por palabras.
- 12 tipos de ejercicio en `js/exercises/`: listen-choice, dictation, listen-tf, reading, match,
  gap-fill, word-order, form-fill, guided-writing, shadowing, speak-answer, roleplay.
- Vistas: inicio, unidad con pestañas, vocabulario, gramática, quiz, modo docente (PIN en `js/config.js`).
- PWA: `manifest.webmanifest` + `sw.js` + íconos en `assets/icons/` ("E7" provisional).
- `data/units.json` (6 unidades, solo unit1 disponible) y `data/unit1.json` "Nice to Meet You":
  24 palabras, 4 temas de gramática, 16 ejercicios (4 por habilidad) y quiz de 10 preguntas.
- `data/unit2.json` "My Family" con la misma estructura.
- `tools/check-data.mjs`: valida los JSON (`node tools/check-data.mjs`). Correrlo tras editar una unidad.
- Probado a 360px con Chrome headless: todas las vistas y ejercicios cargan sin error.

## Falta
1. Probar sin conexión en un celular real (el service worker no se probó en headless).
2. Unidades 3 a 6 (una por una; al agregar una: `available: true` en `units.json`, añadirla a `ASSETS` en `sw.js` y subir `CACHE`), señales en SVG en `assets/svg/` para la Unidad 6.
3. README en español (cómo abrir, publicar en GitHub Pages/Netlify, agregar unidades).

## Cómo abrirla
Necesita un servidor local (no funciona con doble clic): `python -m http.server 8000`
y abrir http://localhost:8000
