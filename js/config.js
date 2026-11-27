// Configuración general de la app. Puedes cambiar estos valores sin tocar el resto del código.
export const CONFIG = {
  appName: 'English 7',
  teacherPin: '1234',            // PIN del modo docente (cámbialo aquí)
  storageKey: 'ingles7_progress',
  rates: { slow: 0.7, normal: 0.95 }, // velocidad de la voz
  passScore: 0.8,                // desde este puntaje una respuesta cuenta como "correcta"
  badgeQuizMin: 7,               // puntaje mínimo en el quiz para la insignia
  quizWeight: 3,                 // el quiz vale como 3 ejercicios para las estrellas
  starThresholds: [0.5, 0.7, 0.9] // 1, 2 y 3 estrellas
};

export const SKILLS = [
  { id: 'listening', label: 'Listening', es: 'Escuchar', icon: '🎧' },
  { id: 'reading',   label: 'Reading',   es: 'Leer',     icon: '📖' },
  { id: 'writing',   label: 'Writing',   es: 'Escribir', icon: '✍️' },
  { id: 'speaking',  label: 'Speaking',  es: 'Hablar',   icon: '🗣️' }
];

export const TABS = [
  { id: 'vocab',   label: 'Vocabulario', icon: '📚' },
  { id: 'grammar', label: 'Gramática',   icon: '📝' },
  ...SKILLS.map(s => ({ id: s.id, label: s.label, icon: s.icon })),
  { id: 'quiz',    label: 'Quiz',        icon: '🏆' }
];
