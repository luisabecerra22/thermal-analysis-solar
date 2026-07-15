import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import type { Intento } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCampo(valor: string | number): string {
  const s = String(valor);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fEval = url.searchParams.get("evaluacion") ?? "";
  const fEstado = url.searchParams.get("estado") ?? "";
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const store = await getStore();
  let intentos = await store.listIntentos();

  intentos = intentos.filter((i: Intento) => {
    if (fEval && i.evaluacionId !== fEval) return false;
    if (fEstado === "aprobado" && !i.aprobado) return false;
    if (fEstado === "reprobado" && i.aprobado) return false;
    if (q) {
      const txt =
        `${i.participante.nombre} ${i.participante.apellido} ${i.participante.cedula} ${i.participante.correo}`.toLowerCase();
      if (!txt.includes(q)) return false;
    }
    return true;
  });

  const encabezados = [
    "Fecha",
    "Nombre",
    "Apellido",
    "Cédula",
    "Cargo",
    "Departamento",
    "Proyecto",
    "Correo",
    "Evaluación",
    "Tema",
    "Aciertos",
    "Total preguntas",
    "Nota",
    "Estado",
  ];

  const filas = intentos.map((i) =>
    [
      new Date(i.presentadoEn).toLocaleString("es-CO"),
      i.participante.nombre,
      i.participante.apellido,
      i.participante.cedula,
      i.participante.cargo,
      i.participante.departamento ?? "",
      i.participante.proyecto ?? "",
      i.participante.correo,
      i.evaluacionTitulo,
      i.tema,
      i.aciertos,
      i.totalPreguntas,
      i.nota.toFixed(1),
      i.aprobado ? "Aprobado" : "Reprobado",
    ]
      .map(csvCampo)
      .join(";"),
  );

  // BOM + separador ';' para que Excel en español abra bien UTF-8 y columnas.
  const csv = "﻿" + [encabezados.map(csvCampo).join(";"), ...filas].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="resultados-evaluaciones.csv"`,
    },
  });
}
