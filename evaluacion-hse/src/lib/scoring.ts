import type { Evaluacion } from "./types";

/** Nota mínima para aprobar (escala 0-5), según el formato FO-SG-SS-100-1. */
export const NOTA_APROBACION = 3.0;

/** Horas de espera antes de poder reintentar tras reprobar. */
export const HORAS_ESPERA_REINTENTO = 24;

export interface ResultadoCalificacion {
  aciertos: number;
  totalPreguntas: number;
  nota: number; // 0-5 con un decimal
  aprobado: boolean;
}

/**
 * Califica las respuestas de conocimiento en escala 0-5.
 * nota = (aciertos / total) * 5, redondeada a un decimal.
 */
export function calificar(
  evaluacion: Evaluacion,
  respuestas: Record<string, string>,
): ResultadoCalificacion {
  const total = evaluacion.preguntas.length;
  let aciertos = 0;
  for (const pregunta of evaluacion.preguntas) {
    if (respuestas[pregunta.id] === pregunta.correcta) {
      aciertos += 1;
    }
  }
  const notaBruta = total > 0 ? (aciertos / total) * 5 : 0;
  const nota = Math.round(notaBruta * 10) / 10;
  return {
    aciertos,
    totalPreguntas: total,
    nota,
    aprobado: nota >= NOTA_APROBACION,
  };
}

/**
 * Determina si un participante puede reintentar tras reprobar.
 * Devuelve los milisegundos restantes de espera (0 si ya puede).
 */
export function esperaRestanteMs(ultimoIntentoISO: string): number {
  const ultimo = new Date(ultimoIntentoISO).getTime();
  const disponible = ultimo + HORAS_ESPERA_REINTENTO * 3600 * 1000;
  return Math.max(0, disponible - Date.now());
}
