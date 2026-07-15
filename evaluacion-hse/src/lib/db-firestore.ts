import { Firestore } from "@google-cloud/firestore";
import type { DataStore } from "./db";
import type { Admin, Asistencia, Evaluacion, Intento } from "./types";

/**
 * Almacén Firestore para producción (Cloud Run).
 * Usa las credenciales de la cuenta de servicio del entorno (ADC).
 * Colecciones: evaluaciones, intentos, admins.
 */
export class FirestoreStore implements DataStore {
  private db: Firestore;

  constructor() {
    this.db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || undefined,
      ignoreUndefinedProperties: true,
    });
  }

  async listEvaluaciones(): Promise<Evaluacion[]> {
    const snap = await this.db.collection("evaluaciones").get();
    return snap.docs.map((d) => d.data() as Evaluacion);
  }

  async listEvaluacionesActivas(): Promise<Evaluacion[]> {
    const snap = await this.db
      .collection("evaluaciones")
      .where("activa", "==", true)
      .get();
    return snap.docs.map((d) => d.data() as Evaluacion);
  }

  async getEvaluacion(id: string): Promise<Evaluacion | null> {
    const doc = await this.db.collection("evaluaciones").doc(id).get();
    return doc.exists ? (doc.data() as Evaluacion) : null;
  }

  async saveEvaluacion(evaluacion: Evaluacion): Promise<void> {
    await this.db
      .collection("evaluaciones")
      .doc(evaluacion.id)
      .set(evaluacion);
  }

  async deleteEvaluacion(id: string): Promise<void> {
    await this.db.collection("evaluaciones").doc(id).delete();
  }

  async createIntento(intento: Intento): Promise<void> {
    await this.db.collection("intentos").doc(intento.id).set(intento);
  }

  async listIntentos(): Promise<Intento[]> {
    const snap = await this.db
      .collection("intentos")
      .orderBy("presentadoEn", "desc")
      .get();
    return snap.docs.map((d) => d.data() as Intento).filter((i) => !i.eliminado);
  }

  async listIntentosEliminados(): Promise<Intento[]> {
    const snap = await this.db
      .collection("intentos")
      .where("eliminado", "==", true)
      .get();
    return snap.docs.map((d) => d.data() as Intento).sort((a, b) => (b.eliminadoEn ?? "").localeCompare(a.eliminadoEn ?? ""));
  }

  async getIntento(id: string): Promise<Intento | null> {
    const doc = await this.db.collection("intentos").doc(id).get();
    return doc.exists ? (doc.data() as Intento) : null;
  }

  async softDeleteIntento(id: string): Promise<void> {
    await this.db.collection("intentos").doc(id).update({
      eliminado: true,
      eliminadoEn: new Date().toISOString(),
    });
  }

  async restaurarIntento(id: string): Promise<void> {
    await this.db.collection("intentos").doc(id).update({
      eliminado: false,
      eliminadoEn: null,
    });
  }

  async deleteIntento(id: string): Promise<void> {
    await this.db.collection("intentos").doc(id).delete();
  }

  async getUltimoIntento(
    evaluacionId: string,
    cedula: string,
  ): Promise<Intento | null> {
    // Solo filtros de igualdad (sin orderBy) para no requerir un índice
    // compuesto; se ordena en memoria. Una cédula tiene muy pocos intentos.
    const snap = await this.db
      .collection("intentos")
      .where("evaluacionId", "==", evaluacionId)
      .where("participante.cedula", "==", cedula)
      .get();
    if (snap.empty) return null;
    const intentos = snap.docs
      .map((d) => d.data() as Intento)
      .sort((a, b) => b.presentadoEn.localeCompare(a.presentadoEn));
    return intentos[0] ?? null;
  }

  async createAsistencia(asistencia: Asistencia): Promise<void> {
    await this.db.collection("asistencias").doc(asistencia.id).set(asistencia);
  }

  async listAsistencias(): Promise<Asistencia[]> {
    const snap = await this.db
      .collection("asistencias")
      .orderBy("registradoEn", "desc")
      .get();
    return snap.docs.map((d) => d.data() as Asistencia).filter((a) => !a.eliminado);
  }

  async listAsistenciasEliminadas(): Promise<Asistencia[]> {
    const snap = await this.db
      .collection("asistencias")
      .where("eliminado", "==", true)
      .get();
    return snap.docs.map((d) => d.data() as Asistencia).sort((a, b) => (b.eliminadoEn ?? "").localeCompare(a.eliminadoEn ?? ""));
  }

  async softDeleteAsistencia(id: string): Promise<void> {
    await this.db.collection("asistencias").doc(id).update({
      eliminado: true,
      eliminadoEn: new Date().toISOString(),
    });
  }

  async restaurarAsistencia(id: string): Promise<void> {
    await this.db.collection("asistencias").doc(id).update({
      eliminado: false,
      eliminadoEn: null,
    });
  }

  async deleteAsistencia(id: string): Promise<void> {
    await this.db.collection("asistencias").doc(id).delete();
  }

  async getAdmin(username: string): Promise<Admin | null> {
    const doc = await this.db.collection("admins").doc(username).get();
    return doc.exists ? (doc.data() as Admin) : null;
  }

  async saveAdmin(admin: Admin): Promise<void> {
    await this.db.collection("admins").doc(admin.username).set(admin);
  }
}
