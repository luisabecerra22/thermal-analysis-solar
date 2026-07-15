import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import type { Evaluacion } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Valida que la evaluación tenga la forma mínima correcta antes de guardar. */
function validar(ev: Evaluacion): string | null {
  if (!ev.titulo?.trim()) return "El título es obligatorio.";
  if (!ev.tema?.trim()) return "El tema es obligatorio.";
  if (!Array.isArray(ev.preguntas) || ev.preguntas.length === 0)
    return "Debe haber al menos una pregunta.";
  for (const [i, p] of ev.preguntas.entries()) {
    if (!p.enunciado?.trim())
      return `El enunciado de la pregunta ${i + 1} está vacío.`;
    if (!Array.isArray(p.opciones) || p.opciones.length < 2)
      return `La pregunta ${i + 1} debe tener al menos dos opciones.`;
    if (p.opciones.some((o) => !o.texto?.trim()))
      return `Hay opciones vacías en la pregunta ${i + 1}.`;
    if (!p.opciones.some((o) => o.id === p.correcta))
      return `La pregunta ${i + 1} no tiene marcada una respuesta correcta válida.`;
  }
  return null;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStore();
  const actual = await store.getEvaluacion(id);
  if (!actual) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }

  let body: Evaluacion;
  try {
    body = (await req.json()) as Evaluacion;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const evaluacion: Evaluacion = {
    ...actual,
    ...body,
    id, // no permitir cambiar el id
    creadaEn: actual.creadaEn,
    actualizadaEn: new Date().toISOString(),
  };

  const error = validar(evaluacion);
  if (error) return NextResponse.json({ error }, { status: 400 });

  await store.saveEvaluacion(evaluacion);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStore();
  await store.deleteEvaluacion(id);
  return NextResponse.json({ ok: true });
}
