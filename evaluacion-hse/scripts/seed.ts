import { promises as fs } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { getStore } from "../src/lib/db";
import { EVALUACION_HABITOS_SALUDABLES, EVALUACION_INDUCCION_HSEQ } from "../src/lib/seed-data";
import type { Admin } from "../src/lib/types";

/** Carga simple de variables desde .env.local si existe (para correr fuera de Next). */
async function cargarEnv(): Promise<void> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), ".env.local"),
      "utf-8",
    );
    for (const linea of raw.split("\n")) {
      const limpia = linea.trim();
      if (!limpia || limpia.startsWith("#")) continue;
      const idx = limpia.indexOf("=");
      if (idx === -1) continue;
      const clave = limpia.slice(0, idx).trim();
      let valor = limpia.slice(idx + 1).trim();
      if (
        (valor.startsWith('"') && valor.endsWith('"')) ||
        (valor.startsWith("'") && valor.endsWith("'"))
      ) {
        valor = valor.slice(1, -1);
      }
      if (!(clave in process.env)) process.env[clave] = valor;
    }
  } catch {
    // Sin .env.local: se usan los valores por defecto.
  }
}

async function main(): Promise<void> {
  await cargarEnv();
  const store = await getStore();

  // 1) Evaluaciones.
  for (const ev of [EVALUACION_HABITOS_SALUDABLES, EVALUACION_INDUCCION_HSEQ]) {
    const existente = await store.getEvaluacion(ev.id);
    if (existente) {
      console.log("• Evaluación ya existe, no se sobrescribe:", existente.id);
    } else {
      await store.saveEvaluacion(ev);
      console.log("✓ Evaluación creada:", ev.id);
    }
  }

  // 2) Administrador inicial.
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "Renergeia2026*";
  const admin = await store.getAdmin(username);
  if (admin) {
    console.log("• Administrador ya existe:", username);
  } else {
    const nuevo: Admin = {
      username,
      passwordHash: await bcrypt.hash(password, 10),
      creadoEn: new Date().toISOString(),
    };
    await store.saveAdmin(nuevo);
    console.log("✓ Administrador creado:", username);
  }

  console.log("\nSeed completado. Backend:", process.env.DB_BACKEND || "json");
}

main().catch((e) => {
  console.error("Error en seed:", e);
  process.exit(1);
});
