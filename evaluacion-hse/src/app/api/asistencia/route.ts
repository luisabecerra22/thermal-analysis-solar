import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import type { Asistencia } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Payload {
  evaluacionId: string;
  evaluacionTitulo?: string;
  nombre: string;
  apellido: string;
  cedula: string;
  cargo: string;
  departamento: string;
  proyecto: string;
  correo: string;
  firma?: string;
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { evaluacionId, nombre, apellido, cedula, cargo, departamento, proyecto, correo, firma } = body;
  if (!evaluacionId || !nombre || !apellido || !cedula || !departamento || !proyecto || !correo) {
    return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
  }

  function capitalizar(texto: string): string {
    return texto.trim().toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
  }

  const store = await getStore();

  let titulo: string;
  if (evaluacionId === "__otro__") {
    titulo = body.evaluacionTitulo?.trim() || "Otra capacitación";
  } else {
    const evaluacion = await store.getEvaluacion(evaluacionId);
    if (!evaluacion || !evaluacion.activa) {
      return NextResponse.json({ error: "La capacitación no está disponible." }, { status: 404 });
    }
    titulo = evaluacion.titulo;
  }

  const asistencia: Asistencia = {
    id: randomUUID(),
    evaluacionId,
    evaluacionTitulo: titulo,
    nombre: capitalizar(nombre),
    apellido: capitalizar(apellido),
    cedula: cedula.trim(),
    cargo: capitalizar(cargo),
    departamento,
    proyecto,
    correo: correo.trim().toLowerCase(),
    firma: firma || undefined,
    registradoEn: new Date().toISOString(),
  };

  await store.createAsistencia(asistencia);

  return NextResponse.json({ ok: true, id: asistencia.id });
}
