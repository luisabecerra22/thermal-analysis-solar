import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await getStore();
  const asistencias = await store.listAsistenciasEliminadas();
  return NextResponse.json({ asistencias });
}
