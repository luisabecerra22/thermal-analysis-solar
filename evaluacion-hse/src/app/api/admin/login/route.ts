import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getStore } from "@/lib/db";
import { COOKIE_MAX_AGE, SESSION_COOKIE, crearSesion } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";
  if (!username || !password) {
    return NextResponse.json(
      { error: "Ingresa usuario y contraseña." },
      { status: 400 },
    );
  }

  const store = await getStore();
  const admin = await store.getAdmin(username);
  const ok = admin && (await bcrypt.compare(password, admin.passwordHash));

  if (!ok) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const token = await crearSesion(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
