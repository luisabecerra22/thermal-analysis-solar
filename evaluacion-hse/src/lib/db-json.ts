import { promises as fs } from "node:fs";
import path from "node:path";
import type { DataStore } from "./db";
import type { Admin, Asistencia, Evaluacion, Intento } from "./types";

/**
 * Almacén basado en archivos JSON para desarrollo local.
 * Guarda cada colección en ./data/<coleccion>.json.
 * No apto para producción (sin concurrencia real), solo para probar la app.
 */
const DATA_DIR = path.join(process.cwd(), "data");

async function readCollection<T>(name: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeCollection<T>(name: string, rows: T[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, `${name}.json`),
    JSON.stringify(rows, null, 2),
    "utf-8",
  );
}

export class JsonStore implements DataStore {
  async listEvaluaciones(): Promise<Evaluacion[]> {
    return readCollection<Evaluacion>("evaluaciones");
  }

  async listEvaluacionesActivas(): Promise<Evaluacion[]> {
    const all = await this.listEvaluaciones();
    return all.filter((e) => e.activa);
  }

  async getEvaluacion(id: string): Promise<Evaluacion | null> {
    const all = await this.listEvaluaciones();
    return all.find((e) => e.id === id) ?? null;
  }

  async saveEvaluacion(evaluacion: Evaluacion): Promise<void> {
    const all = await this.listEvaluaciones();
    const idx = all.findIndex((e) => e.id === evaluacion.id);
    if (idx >= 0) all[idx] = evaluacion;
    else all.push(evaluacion);
    await writeCollection("evaluaciones", all);
  }

  async deleteEvaluacion(id: string): Promise<void> {
    const all = await this.listEvaluaciones();
    await writeCollection(
      "evaluaciones",
      all.filter((e) => e.id !== id),
    );
  }

  async createIntento(intento: Intento): Promise<void> {
    const all = await readCollection<Intento>("intentos");
    all.push(intento);
    await writeCollection("intentos", all);
  }

  async listIntentos(): Promise<Intento[]> {
    const all = await readCollection<Intento>("intentos");
    return all.filter((i) => !i.eliminado).sort((a, b) => b.presentadoEn.localeCompare(a.presentadoEn));
  }

  async listIntentosEliminados(): Promise<Intento[]> {
    const all = await readCollection<Intento>("intentos");
    return all.filter((i) => i.eliminado).sort((a, b) => (b.eliminadoEn ?? "").localeCompare(a.eliminadoEn ?? ""));
  }

  async getIntento(id: string): Promise<Intento | null> {
    const all = await readCollection<Intento>("intentos");
    return all.find((i) => i.id === id) ?? null;
  }

  async softDeleteIntento(id: string): Promise<void> {
    const all = await readCollection<Intento>("intentos");
    const idx = all.findIndex((i) => i.id === id);
    if (idx >= 0) {
      all[idx].eliminado = true;
      all[idx].eliminadoEn = new Date().toISOString();
      await writeCollection("intentos", all);
    }
  }

  async restaurarIntento(id: string): Promise<void> {
    const all = await readCollection<Intento>("intentos");
    const idx = all.findIndex((i) => i.id === id);
    if (idx >= 0) {
      all[idx].eliminado = false;
      all[idx].eliminadoEn = undefined;
      await writeCollection("intentos", all);
    }
  }

  async deleteIntento(id: string): Promise<void> {
    const all = await readCollection<Intento>("intentos");
    await writeCollection("intentos", all.filter((i) => i.id !== id));
  }

  async getUltimoIntento(
    evaluacionId: string,
    cedula: string,
  ): Promise<Intento | null> {
    const all = await readCollection<Intento>("intentos");
    const filtrados = all
      .filter(
        (i) =>
          i.evaluacionId === evaluacionId &&
          i.participante.cedula === cedula,
      )
      .sort((a, b) => b.presentadoEn.localeCompare(a.presentadoEn));
    return filtrados[0] ?? null;
  }

  async createAsistencia(asistencia: Asistencia): Promise<void> {
    const all = await readCollection<Asistencia>("asistencias");
    all.push(asistencia);
    await writeCollection("asistencias", all);
  }

  async listAsistencias(): Promise<Asistencia[]> {
    const all = await readCollection<Asistencia>("asistencias");
    return all.filter((a) => !a.eliminado).sort((a, b) => b.registradoEn.localeCompare(a.registradoEn));
  }

  async listAsistenciasEliminadas(): Promise<Asistencia[]> {
    const all = await readCollection<Asistencia>("asistencias");
    return all.filter((a) => a.eliminado).sort((a, b) => (b.eliminadoEn ?? "").localeCompare(a.eliminadoEn ?? ""));
  }

  async softDeleteAsistencia(id: string): Promise<void> {
    const all = await readCollection<Asistencia>("asistencias");
    const idx = all.findIndex((a) => a.id === id);
    if (idx >= 0) {
      all[idx].eliminado = true;
      all[idx].eliminadoEn = new Date().toISOString();
      await writeCollection("asistencias", all);
    }
  }

  async restaurarAsistencia(id: string): Promise<void> {
    const all = await readCollection<Asistencia>("asistencias");
    const idx = all.findIndex((a) => a.id === id);
    if (idx >= 0) {
      all[idx].eliminado = false;
      all[idx].eliminadoEn = undefined;
      await writeCollection("asistencias", all);
    }
  }

  async deleteAsistencia(id: string): Promise<void> {
    const all = await readCollection<Asistencia>("asistencias");
    await writeCollection("asistencias", all.filter((a) => a.id !== id));
  }

  async getAdmin(username: string): Promise<Admin | null> {
    const all = await readCollection<Admin>("admins");
    return all.find((a) => a.username === username) ?? null;
  }

  async saveAdmin(admin: Admin): Promise<void> {
    const all = await readCollection<Admin>("admins");
    const idx = all.findIndex((a) => a.username === admin.username);
    if (idx >= 0) all[idx] = admin;
    else all.push(admin);
    await writeCollection("admins", all);
  }
}
