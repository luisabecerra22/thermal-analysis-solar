"use client";

import { useMemo, useState } from "react";
import type { Evaluacion, Asistencia } from "@/lib/types";

function fechaCorta(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TablaAsistencia({
  asistencias: asistenciasIniciales,
  evaluaciones,
}: {
  asistencias: Asistencia[];
  evaluaciones: Evaluacion[];
}) {
  const [asistencias, setAsistencias] = useState(asistenciasIniciales);
  const [papelera, setPapelera] = useState<Asistencia[]>([]);
  const [verPapelera, setVerPapelera] = useState(false);
  const [fEval, setFEval] = useState("");
  const [fDepto, setFDepto] = useState("");
  const [busqueda, setBusqueda] = useState("");

  async function eliminarAsistencia(id: string, nombre: string) {
    if (!confirm(`¿Mover el registro de "${nombre}" a la papelera?`)) return;
    await fetch(`/api/admin/asistencia/${id}`, { method: "DELETE" });
    const eliminado = asistencias.find((a) => a.id === id);
    setAsistencias((prev) => prev.filter((a) => a.id !== id));
    if (eliminado) setPapelera((prev) => [{ ...eliminado, eliminado: true, eliminadoEn: new Date().toISOString() }, ...prev]);
  }

  async function restaurarAsistencia(id: string) {
    await fetch(`/api/admin/asistencia/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "restaurar" }),
    });
    const restaurado = papelera.find((a) => a.id === id);
    setPapelera((prev) => prev.filter((a) => a.id !== id));
    if (restaurado) setAsistencias((prev) => [{ ...restaurado, eliminado: false, eliminadoEn: undefined }, ...prev]);
  }

  async function eliminarPermanente(id: string, nombre: string) {
    if (!confirm(`¿Eliminar PERMANENTEMENTE el registro de "${nombre}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/admin/asistencia/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "eliminar-permanente" }),
    });
    setPapelera((prev) => prev.filter((a) => a.id !== id));
  }

  async function cargarPapelera() {
    setVerPapelera(true);
    const res = await fetch("/api/admin/asistencia/papelera");
    const data = await res.json();
    setPapelera(data.asistencias ?? []);
  }

  const total = asistencias.length;

  const departamentos = useMemo(() => {
    const set = new Set(asistencias.map((a) => a.departamento).filter(Boolean));
    return Array.from(set).sort();
  }, [asistencias]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return asistencias.filter((a) => {
      if (fEval && a.evaluacionId !== fEval) return false;
      if (fDepto && a.departamento !== fDepto) return false;
      if (q) {
        const txt = `${a.nombre} ${a.apellido} ${a.cedula} ${a.correo}`.toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    });
  }, [asistencias, fEval, fDepto, busqueda]);

  const resumen = useMemo(() => {
    const map = new Map<string, { titulo: string; count: number }>();
    for (const a of asistencias) {
      const entry = map.get(a.evaluacionId) ?? {
        titulo: a.evaluacionTitulo,
        count: 0,
      };
      entry.count++;
      map.set(a.evaluacionId, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [asistencias]);

  return (
    <>
      <div className="stat-grid">
        <div className="stat">
          <div className="num">{total}</div>
          <div className="lbl">Total asistencias</div>
        </div>
        {resumen.map((r) => (
          <div className="stat" key={r.titulo}>
            <div className="num">{r.count}</div>
            <div className="lbl">{r.titulo}</div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="field">
          <label>Capacitación</label>
          <select value={fEval} onChange={(e) => setFEval(e.target.value)}>
            <option value="">Todas</option>
            {evaluaciones.map((e) => (
              <option key={e.id} value={e.id}>
                {e.titulo}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Departamento</label>
          <select value={fDepto} onChange={(e) => setFDepto(e.target.value)}>
            <option value="">Todos</option>
            {departamentos.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ flex: 1, minWidth: 200 }}>
          <label>Buscar (nombre, cédula, correo)</label>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe para filtrar…"
          />
        </div>
        <button
          className={`btn ${verPapelera ? "btn-primary" : "btn-secondary"}`}
          onClick={() => verPapelera ? setVerPapelera(false) : cargarPapelera()}
        >
          {verPapelera ? "Volver a asistencias" : "Papelera"}
        </button>
      </div>

      {verPapelera ? (
        <>
          <p className="muted">{papelera.length} registros en papelera</p>
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Capacitación</th>
                  <th>Eliminado el</th>
                  <th>Restaurar</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {papelera.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 24 }}>
                      Papelera vacía.
                    </td>
                  </tr>
                ) : (
                  papelera.map((a) => (
                    <tr key={a.id}>
                      <td>{fechaCorta(a.registradoEn)}</td>
                      <td>{a.nombre} {a.apellido}</td>
                      <td>{a.cedula}</td>
                      <td>{a.evaluacionTitulo}</td>
                      <td>{a.eliminadoEn ? fechaCorta(a.eliminadoEn) : "—"}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: 13 }}
                          onClick={() => restaurarAsistencia(a.id)}
                        >
                          Restaurar
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 13, color: "var(--rojo)" }}
                          onClick={() => eliminarPermanente(a.id, `${a.nombre} ${a.apellido}`)}
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
      ) : (
        <>
          <p className="muted">
            {filtrados.length} de {asistencias.length} registros
          </p>
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Cargo</th>
                  <th>Departamento</th>
                  <th>Proyecto</th>
                  <th>Correo</th>
                  <th>Capacitación</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: 24 }}>
                      Sin registros de asistencia.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((a) => (
                    <tr key={a.id}>
                      <td>{fechaCorta(a.registradoEn)}</td>
                      <td>{a.nombre} {a.apellido}</td>
                      <td>{a.cedula}</td>
                      <td>{a.cargo}</td>
                      <td>{a.departamento}</td>
                      <td>{a.proyecto}</td>
                      <td>{a.correo}</td>
                      <td>{a.evaluacionTitulo}</td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 13, color: "var(--rojo)" }}
                          onClick={() => eliminarAsistencia(a.id, `${a.nombre} ${a.apellido}`)}
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
      )}
    </>
  );
}
