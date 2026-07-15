import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await getStore();
  await store.softDeleteAsistencia(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { accion } = (await req.json()) as { accion: string };
  const store = await getStore();

  if (accion === "restaurar") {
    await store.restaurarAsistencia(id);
  } else if (accion === "eliminar-permanente") {
    await store.deleteAsistencia(id);
  }

  return NextResponse.json({ ok: true });
}
