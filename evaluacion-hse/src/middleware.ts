import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verificarSesion } from "@/lib/auth";

/**
 * Protege todo /admin (y las APIs /api/admin) excepto el login.
 * Corre en el Edge; usa jose para verificar el JWT de sesión.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas del área admin.
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const usuario = await verificarSesion(token);

  if (!usuario) {
    // APIs responden 401; páginas redirigen al login.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
