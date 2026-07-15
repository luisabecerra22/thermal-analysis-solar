import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { generarCertificado } from "@/lib/certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStore();
  const intento = await store.getIntento(id);

  if (!intento) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  if (!intento.aprobado) {
    return NextResponse.json(
      { error: "El certificado solo está disponible para evaluaciones aprobadas." },
      { status: 403 },
    );
  }

  const pdf = await generarCertificado(intento);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Certificado-${intento.participante.cedula}.pdf"`,
    },
  });
}
