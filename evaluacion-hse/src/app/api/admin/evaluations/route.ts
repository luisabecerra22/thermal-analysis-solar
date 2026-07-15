import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { FEEDBACK_ESTANDAR } from "@/lib/seed-data";
import type { Evaluacion } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await getStore();
  const evaluaciones = await store.listEvaluaciones();
  return NextResponse.json({ evaluaciones });
}

/** Crea una nueva evaluación en blanco y devuelve su id. */
export async function POST() {
  const store = await getStore();
  const ahora = new Date().toISOString();
  const nueva: Evaluacion = {
    id: randomUUID(),
    titulo: "Nueva evaluación",
    tema: "Nueva capacitación",
    descripcion: "",
    activa: false,
    creadaEn: ahora,
    actualizadaEn: ahora,
    feedback: FEEDBACK_ESTANDAR,
    preguntas: [
      {
        id: "p1",
        enunciado: "",
        opciones: [
          { id: "a", texto: "" },
          { id: "b", texto: "" },
        ],
        correcta: "a",
      },
    ],
  };
  await store.saveEvaluacion(nueva);
  return NextResponse.json({ id: nueva.id });
}
