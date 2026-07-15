"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminNav({
  activo,
}: {
  activo: "resultados" | "evaluaciones" | "dashboard" | "asistencia";
}) {
  const router = useRouter();

  async function salir() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 22,
        flexWrap: "wrap",
      }}
    >
      <Link
        className={`btn ${activo === "resultados" ? "btn-primary" : "btn-secondary"}`}
        href="/admin"
      >
        Resultados
      </Link>
      <Link
        className={`btn ${activo === "evaluaciones" ? "btn-primary" : "btn-secondary"}`}
        href="/admin/evaluaciones"
      >
        Evaluaciones
      </Link>
      <Link
        className={`btn ${activo === "dashboard" ? "btn-primary" : "btn-secondary"}`}
        href="/admin/dashboard"
      >
        Dashboard
      </Link>
      <Link
        className={`btn ${activo === "asistencia" ? "btn-primary" : "btn-secondary"}`}
        href="/admin/asistencia"
      >
        Asistencia
      </Link>
      <button
        className="btn btn-secondary"
        style={{ marginLeft: "auto" }}
        onClick={salir}
      >
        Cerrar sesión
      </button>
    </nav>
  );
}
