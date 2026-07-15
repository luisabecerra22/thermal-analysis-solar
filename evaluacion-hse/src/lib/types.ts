// Tipos del dominio del sistema de evaluación HSE.

/** Una opción de respuesta dentro de una pregunta de conocimiento. */
export interface Opcion {
  id: string; // "a", "b", "c"...
  texto: string;
}

/** Pregunta calificable (opción múltiple, una sola correcta). */
export interface PreguntaConocimiento {
  id: string;
  enunciado: string;
  opciones: Opcion[];
  correcta: string; // id de la opción correcta
}

/** Tipo de escala para la retroalimentación del capacitador/lugar. */
export type EscalaFeedback = "cualitativa" | "numerica";
// cualitativa: Bueno / Regular / Deficiente
// numerica: 1 a 5

/** Pregunta de retroalimentación (no califica, solo se registra). */
export interface PreguntaFeedback {
  id: string;
  enunciado: string;
  escala: EscalaFeedback;
}

/** Una evaluación/capacitación completa. */
export interface Evaluacion {
  id: string;
  titulo: string;
  tema: string;
  descripcion?: string;
  preguntas: PreguntaConocimiento[];
  feedback: PreguntaFeedback[];
  activa: boolean;
  creadaEn: string; // ISO
  actualizadaEn: string; // ISO
}

/** Datos de registro del participante. */
export interface Participante {
  correo: string;
  nombre: string;
  apellido: string;
  cedula: string;
  cargo: string;
  departamento: string;
  proyecto: string;
}

/** Respuesta a una pregunta de feedback. */
export interface RespuestaFeedback {
  preguntaId: string;
  valor: string; // "bueno"|"regular"|"deficiente" o "1".."5"
}

/** Un intento de evaluación presentado por un participante. */
export interface Intento {
  id: string;
  evaluacionId: string;
  evaluacionTitulo: string;
  tema: string;
  participante: Participante;
  respuestas: Record<string, string>; // preguntaId -> opcionId elegida
  feedback: RespuestaFeedback[];
  aciertos: number;
  totalPreguntas: number;
  nota: number; // escala 0-5, un decimal
  aprobado: boolean;
  firma?: string; // base64 data URL de la firma
  presentadoEn: string; // ISO
  eliminado?: boolean;
  eliminadoEn?: string;
}

/** Registro de asistencia a una capacitación. */
export interface Asistencia {
  id: string;
  evaluacionId: string;
  evaluacionTitulo: string;
  nombre: string;
  apellido: string;
  cedula: string;
  cargo: string;
  departamento: string;
  proyecto: string;
  correo: string;
  firma?: string;
  registradoEn: string; // ISO
  eliminado?: boolean;
  eliminadoEn?: string;
}

/** Cuenta de administrador. */
export interface Admin {
  username: string;
  passwordHash: string;
  creadoEn: string;
}
