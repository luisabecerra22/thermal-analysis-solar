import type { Admin, Asistencia, Evaluacion, Intento } from "./types";

/**
 * Contrato del almacén de datos. Permite dos implementaciones intercambiables:
 * - JSON local (desarrollo)
 * - Firestore (producción en Cloud Run)
 * Seleccionadas por la variable de entorno DB_BACKEND.
 */
export interface DataStore {
  // Evaluaciones
  listEvaluaciones(): Promise<Evaluacion[]>;
  listEvaluacionesActivas(): Promise<Evaluacion[]>;
  getEvaluacion(id: string): Promise<Evaluacion | null>;
  saveEvaluacion(evaluacion: Evaluacion): Promise<void>;
  deleteEvaluacion(id: string): Promise<void>;

  // Intentos
  createIntento(intento: Intento): Promise<void>;
  listIntentos(): Promise<Intento[]>;
  listIntentosEliminados(): Promise<Intento[]>;
  getIntento(id: string): Promise<Intento | null>;
  softDeleteIntento(id: string): Promise<void>;
  restaurarIntento(id: string): Promise<void>;
  deleteIntento(id: string): Promise<void>;
  getUltimoIntento(
    evaluacionId: string,
    cedula: string,
  ): Promise<Intento | null>;

  // Asistencia
  createAsistencia(asistencia: Asistencia): Promise<void>;
  listAsistencias(): Promise<Asistencia[]>;
  listAsistenciasEliminadas(): Promise<Asistencia[]>;
  softDeleteAsistencia(id: string): Promise<void>;
  restaurarAsistencia(id: string): Promise<void>;
  deleteAsistencia(id: string): Promise<void>;

  // Administradores
  getAdmin(username: string): Promise<Admin | null>;
  saveAdmin(admin: Admin): Promise<void>;
}

let cached: DataStore | null = null;

/** Devuelve el almacén de datos configurado (singleton). */
export async function getStore(): Promise<DataStore> {
  if (cached) return cached;
  const backend = process.env.DB_BACKEND ?? "json";
  if (backend === "firestore") {
    const { FirestoreStore } = await import("./db-firestore");
    cached = new FirestoreStore();
  } else {
    const { JsonStore } = await import("./db-json");
    cached = new JsonStore();
  }
  return cached;
}
