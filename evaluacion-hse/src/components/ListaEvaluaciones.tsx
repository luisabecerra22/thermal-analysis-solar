"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Fila {
  id: string;
  titulo: string;
  tema: string;
  activa: boolean;
  numPreguntas: number;
}

export default function ListaEvaluaciones({
  evaluaciones,
}: {
  evaluaciones: Fila[];
}) {
  const router = useRouter();
  const [creando, setCreando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  function copiarLink(ruta: string, label: string) {
    const url = `${window.location.origin}${ruta}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(label);
      setTimeout(() => setCopiado(null), 2000);
    });
  }

  async function crear() {
    setCreando(true);
    const res = await fetch("/api/admin/evaluations", { method: "POST" });
    const data = await res.json();
    if (data.id) router.push(`/admin/evaluaciones/${data.id}`);
    else setCreando(false);
  }

  async function eliminar(id: string, titulo: string) {
    if (!confirm(`¿Eliminar la evaluación "${titulo}"? Esta acción no se puede deshacer.`))
      return;
    await fetch(`/api/admin/evaluations/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <button
          className="btn btn-primary"
          onClick={crear}
          disabled={creando}
        >
          {creando ? "Creando…" : "+ Nueva evaluación"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => copiarLink("/asistencia", "asistencia-general")}
        >
          {copiado === "asistencia-general" ? "Link copiado!" : "Copiar link de asistencia"}
        </button>
      </div>

      <div className="tabla-wrap">
        <table className="tabla">
          <thead>
            <tr>
              <th>Título</th>
              <th>Tema</th>
              <th>Preguntas</th>
              <th>Estado</th>
              <th>Links</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {evaluaciones.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>
                  No hay evaluaciones. Crea la primera.
                </td>
              </tr>
            ) : (
              evaluaciones.map((e) => (
                <tr key={e.id}>
                  <td>{e.titulo}</td>
                  <td>{e.tema}</td>
                  <td>{e.numPreguntas}</td>
                  <td>
                    <span className={`badge ${e.activa ? "badge-ok" : "badge-fail"}`}>
                      {e.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "6px 10px", fontSize: 12 }}
                      onClick={() => copiarLink(`/evaluacion/${e.id}`, `eval-${e.id}`)}
                    >
                      {copiado === `eval-${e.id}` ? "Copiado!" : "Copiar link"}
                    </button>
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <a
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: 13 }}
                      href={`/admin/evaluaciones/${e.id}`}
                    >
                      Editar
                    </a>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: 13, color: "var(--rojo)" }}
                      onClick={() => eliminar(e.id, e.titulo)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
