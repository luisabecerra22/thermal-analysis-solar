import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { calificar, esperaRestanteMs } from "@/lib/scoring";
import { generarCertificado } from "@/lib/certificate";
import { enviarCertificado } from "@/lib/email";
import type { Intento, Participante, RespuestaFeedback } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Payload {
  evaluacionId: string;
  participante: Participante;
  respuestas: Record<string, string>;
  feedback: RespuestaFeedback[];
  firma?: string;
}

function capitalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

function horas(ms: number): string {
  const h = Math.ceil(ms / (3600 * 1000));
  return h === 1 ? "1 hora" : `${h} horas`;
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { evaluacionId, participante, respuestas, feedback, firma } = body;
  if (
    !evaluacionId ||
    !participante?.correo ||
    !participante?.cedula ||
    !participante?.nombre ||
    !participante?.departamento ||
    !participante?.proyecto ||
    !respuestas
  ) {
    return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
  }

  const store = await getStore();
  const evaluacion = await store.getEvaluacion(evaluacionId);
  if (!evaluacion || !evaluacion.activa) {
    return NextResponse.json(
      { error: "La evaluación no está disponible." },
      { status: 404 },
    );
  }

  // Regla de reintento: por cédula dentro de esta evaluación.
  const ultimo = await store.getUltimoIntento(evaluacionId, participante.cedula.trim());
  if (ultimo) {
    if (ultimo.aprobado) {
      return NextResponse.json(
        {
          mensaje:
            "Ya presentaste y aprobaste esta evaluación con esa cédula. No es necesario repetirla.",
        },
        { status: 429 },
      );
    }
    const restante = esperaRestanteMs(ultimo.presentadoEn);
    if (restante > 0) {
      return NextResponse.json(
        {
          mensaje: `Reprobaste tu intento anterior. Debes esperar ${horas(
            restante,
          )} antes de volver a presentar esta evaluación.`,
        },
        { status: 429 },
      );
    }
  }

  const resultado = calificar(evaluacion, respuestas);

  const intento: Intento = {
    id: randomUUID(),
    evaluacionId: evaluacion.id,
    evaluacionTitulo: evaluacion.titulo,
    tema: evaluacion.tema,
    participante: {
      correo: participante.correo.trim().toLowerCase(),
      nombre: capitalizar(participante.nombre),
      apellido: capitalizar(participante.apellido),
      cedula: participante.cedula.trim(),
      cargo: capitalizar(participante.cargo ?? ""),
      departamento: participante.departamento?.trim() ?? "",
      proyecto: participante.proyecto?.trim() ?? "",
    },
    respuestas,
    feedback: Array.isArray(feedback) ? feedback : [],
    aciertos: resultado.aciertos,
    totalPreguntas: resultado.totalPreguntas,
    nota: resultado.nota,
    aprobado: resultado.aprobado,
    firma: firma ?? undefined,
    presentadoEn: new Date().toISOString(),
  };

  await store.createIntento(intento);

  // Certificado + correo solo si aprobó (best effort, no bloquea la respuesta).
  if (intento.aprobado) {
    try {
      const pdf = await generarCertificado(intento);
      await enviarCertificado(intento, pdf);
    } catch (e) {
      console.error("Error generando/enviando certificado:", e);
    }
  }

  return NextResponse.json({
    id: intento.id,
    aprobado: intento.aprobado,
    nota: intento.nota,
  });
}
