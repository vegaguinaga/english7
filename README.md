# English 7 🇳🇮

App web para practicar el inglés de 7mo grado: **escuchar, leer, escribir y hablar**.
Tiene 6 unidades con vocabulario, gramática explicada en español, 16 ejercicios por unidad y un quiz final.
Funciona en el celular, se puede instalar como app y sirve sin internet después de abrirla una vez.

| Unidad | Tema |
|---|---|
| 1 · Nice to Meet You | Saludos e información personal |
| 2 · My Family | Mi familia |
| 3 · My School | Mi escuela |
| 4 · My Daily Routine | Mi rutina diaria |
| 5 · Food and Drinks | Comidas y bebidas |
| 6 · Places and Signs | Lugares y señales |

## Cómo abrirla en tu computadora

La app **no funciona con doble clic** en `index.html`: el navegador necesita un servidor.
Con Python (ya viene en Linux y Mac):

```bash
cd ruta/a/la/carpeta
python3 -m http.server 8000
```

Abre **http://localhost:8000** en Chrome. Para detener el servidor presiona `Ctrl + C`.

Para verla con tamaño de celular: `F12` y luego `Ctrl + Shift + M`.

## Cómo publicarla en internet (gratis)

Al publicarla tendrá una dirección `https://`, que es necesaria para que el **micrófono** funcione en los celulares.

### GitHub Pages
1. Sube esta carpeta a un repositorio de GitHub.
2. En el repositorio: **Settings → Pages**.
3. En *Source* elige **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`. Guarda.
4. En uno o dos minutos la app estará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

### Netlify
1. Entra a <https://app.netlify.com/drop>.
2. Arrastra la carpeta completa del proyecto a la página.
3. Netlify te da una dirección `https://….netlify.app` al instante.

No hace falta compilar nada: son archivos HTML, CSS, JS y JSON tal cual.

## Instalarla en el celular

Abre la dirección publicada en Chrome (Android) o Safari (iPhone):
- **Android:** menú ⋮ → *Agregar a pantalla de inicio* (o *Instalar app*).
- **iPhone:** botón Compartir → *Agregar a inicio*.

Después de abrirla una vez con internet, funciona sin conexión.
(El reconocimiento de voz de Chrome sí necesita internet; sin él, la app pasa sola al modo
"grábate y compárate".)

## Para el docente

- **Modo docente:** enlace al final de la pantalla de inicio. PIN: `1234`.
  Muestra el avance, las estrellas, los puntajes del quiz y las insignias, y permite reiniciar el progreso.
- **Cambiar el PIN** y otros ajustes (velocidad de la voz, puntaje para aprobar, estrellas): en `js/config.js`.
- El progreso se guarda **solo en el dispositivo** (en el navegador). Cada estudiante usa su propio celular.
  Si borra los datos del navegador, se pierde el progreso.

## Cómo está organizado

```
index.html              página principal
css/styles.css          estilos (modo claro y oscuro)
js/config.js            ajustes que puedes cambiar (PIN, velocidades, puntajes)
js/app.js               arranque y rutas
js/views/               pantallas: inicio, unidad, vocabulario, gramática, quiz, docente
js/exercises/           los 12 tipos de ejercicio
js/speech.js            voz (leer en voz alta, micrófono, grabar)
data/units.json         lista de unidades
data/unit1.json …       contenido de cada unidad
assets/icons/           íconos de la app
assets/svg/             señales dibujadas (Unidad 6)
sw.js                   guarda la app para usarla sin internet
tools/check-data.mjs    revisa que los JSON de las unidades estén bien
```

## Cómo editar o agregar una unidad

Todo el contenido está en `data/`. No hace falta tocar el código.

1. **Copia** una unidad parecida (por ejemplo `data/unit2.json`) y cambia el texto.
2. **Regístrala** en `data/units.json`:
   ```json
   { "id": "unit7", "file": "data/unit7.json", "available": true, "emoji": "🎉",
     "color": "#5D4037", "title": "Holidays", "titleEs": "Días festivos",
     "badge": { "emoji": "🎊", "name": "Holiday Hero" } }
   ```
   Con `"available": false` aparece como "🔒 Próximamente".
3. **Agrégala a `sw.js`** en la lista `ASSETS` (`'data/unit7.json'`) y **sube el número** de
   `CACHE` (por ejemplo de `english7-v6` a `english7-v7`). Sin esto, quien ya instaló la app no verá los cambios.
   Hay que subir `CACHE` **cada vez** que cambies cualquier archivo.
4. **Revísala** con Node.js:
   ```bash
   node tools/check-data.mjs
   ```
   Avisa si falta una respuesta, si un índice está fuera de rango, si los espacios `___` no coinciden
   con las respuestas o si un ejemplo no cumple su propia revisión.

### Partes de una unidad

```json
{
  "vocabulary": [ { "en": "mother", "es": "madre", "icon": { "emoji": "👩" }, "example": "My mother is kind." } ],
  "grammar":    [ { "title": "…", "explanation": "…", "table": { "headers": [], "rows": [] },
                    "examples": [ { "en": "…", "es": "…" } ], "tip": "…" } ],
  "skills": { "listening": [ … ], "reading": [ … ], "writing": [ … ], "speaking": [ … ] },
  "quiz": [ … ]
}
```

- Los íconos pueden ser `{ "emoji": "👩" }` o `{ "svg": "stop", "alt": "Señal de alto" }`
  (usa `assets/svg/stop.svg`).
- En los textos en español puedes usar `**negrita**`, `*cursiva*` y `\n` para saltos de línea.
- Cada ejercicio necesita un `id` único dentro de la unidad, `type`, `title` e `instructions`.
- En el `quiz` cada pregunta es un ejercicio de **un solo ítem** con `"skill"` (listening, reading, writing o speaking).
- Las opciones (`options`) se cuentan desde **0**: `"answer": 0` es la primera.

### Los 12 tipos de ejercicio

| `type` | Qué hace | Campos principales |
|---|---|---|
| `listen-choice` | Escucha y elige | `items: [{ audio, prompt?, options, answer }]` |
| `dictation` | Escucha y escribe | `items: [{ answer }]` |
| `listen-tf` | Diálogo: verdadero/falso | `dialogue: [{ speaker, text, voice }]`, `statements: [{ text, answer: true/false }]` |
| `reading` | Lee y responde | `text`, `textTitle?`, `questions: [{ q, options, answer }]` |
| `match` | Relaciona columnas | `pairs: [["izquierda", "derecha"]]` |
| `gap-fill` | Completa los espacios `___` | `items: [{ text, answers }]`, `wordBank?` (lista para elegir) |
| `word-order` | Ordena las palabras | `items: [{ answer, alsoAccept? }]` |
| `form-fill` | Completa una ficha | `fields: [{ label, labelEs, kind, answer? }]`, `text?` |
| `guided-writing` | Escribe oraciones con plantilla | `template`, `checks: [{ pattern, label, hint }]`, `model` |
| `shadowing` | Escucha y repite | `items: [{ text, es }]` |
| `speak-answer` | Responde en voz alta | `items: [{ question, accept, example }]` |
| `roleplay` | Diálogo hablado | `scene`, `appName`, `turns: [{ role: "app", text } \| { role: "student", expected, accept, example }]` |

Detalles útiles:
- En `gap-fill`, `answers` tiene **una respuesta por cada `___`**. Para aceptar varias formas en un mismo
  espacio usa una lista dentro: `"answers": [["grandmother", "grandma"]]`.
- `voice` puede ser `"male"` o `"female"`.
- En `form-fill`, `kind` puede ser `name`, `number` (con `min`/`max`), `choice` (con `accept`), `email`, `phone` o `text`.
  Sin `answer`, el campo se revisa solo por su tipo (sirve para datos personales).
- `accept` y `pattern` son expresiones regulares sencillas que se buscan en lo que dijo o escribió el estudiante,
  por ejemplo `"my name is"` o `"\\b(yes|no)\\b"`. Los números se comparan escritos en palabras
  (`12` → `twelve`) y las contracciones se expanden (`I'm` → `I am`).

## Problemas comunes

| Problema | Solución |
|---|---|
| "La app no puede abrirse con doble clic" | Ábrela con un servidor local o desde la dirección publicada. |
| No se escucha la voz | Sube el volumen. En Linux la voz suena robótica (usa espeak); en Android y iPhone suena natural. |
| El micrófono no funciona | Necesita `https://` (o `localhost`) y dar permiso al navegador. Si falla, usa el modo "grábate y compárate". |
| No veo los cambios que hice | Sube el número de `CACHE` en `sw.js` y recarga la página dos veces. |
