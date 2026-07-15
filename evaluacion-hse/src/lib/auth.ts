import { SignJWT, jwtVerify } from "jose";

/**
 * Sesión del administrador basada en un JWT firmado, guardado en cookie httpOnly.
 * jose funciona tanto en el runtime de Node como en el Edge (middleware).
 */

export const SESSION_COOKIE = "renergeia_admin";
const DURACION_SEGUNDOS = 60 * 60 * 8; // 8 horas

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET no configurado o demasiado corto (mínimo 16 caracteres).",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Crea el token de sesión para un administrador. */
export async function crearSesion(username: string): Promise<string> {
  return new SignJWT({ sub: username, rol: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SEGUNDOS}s`)
    .sign(getSecret());
}

/** Verifica el token; devuelve el username o null si es inválido/expiró. */
export async function verificarSesion(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export const COOKIE_MAX_AGE = DURACION_SEGUNDOS;
