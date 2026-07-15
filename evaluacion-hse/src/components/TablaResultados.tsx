"use client";

import { useMemo, useState } from "react";
import type { Evaluacion, Intento } from "@/lib/types";

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

export default function TablaResultados({
  intentos: intentosIniciales,
  evaluaciones,
}: {
  intentos: Intento[];
  evaluaciones: Evaluacion[];
}) {
  const [intentos, setIntentos] = useState(intentosIniciales);
  const [papelera, setPapelera] = useState<Intento[]>([]);
  const [verPapelera, setVerPapelera] = useState(false);
  const [fEval, setFEval] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fDepto, setFDepto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState<Intento | null>(null);

  async function eliminarIntento(id: string, nombre: string) {
    if (!confirm(`¿Mover el registro de "${nombre}" a la papelera?`)) return;
    await fetch(`/api/admin/attempts/${id}`, { method: "DELETE" });
    const eliminado = intentos.find((i) => i.id === id);
    setIntentos((prev) => prev.filter((i) => i.id !== id));
    if (eliminado) setPapelera((prev) => [{ ...eliminado, eliminado: true, eliminadoEn: new Date().toISOString() }, ...prev]);
  }

  async function restaurarIntento(id: string) {
    await fetch(`/api/admin/attempts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "restaurar" }),
    });
    const restaurado = papelera.find((i) => i.id === id);
    setPapelera((prev) => prev.filter((i) => i.id !== id));
    if (restaurado) setIntentos((prev) => [{ ...restaurado, eliminado: false, eliminadoEn: undefined }, ...prev]);
  }

  async function eliminarPermanente(id: string, nombre: string) {
    if (!confirm(`¿Eliminar PERMANENTEMENTE el registro de "${nombre}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/admin/attempts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "eliminar-permanente" }),
    });
    setPapelera((prev) => prev.filter((i) => i.id !== id));
  }

  async function cargarPapelera() {
    setVerPapelera(true);
    const res = await fetch("/api/admin/attempts/papelera");
    const data = await res.json();
    setPapelera(data.intentos ?? []);
  }

  const total = intentos.length;
  const aprobados = intentos.filter((i) => i.aprobado).length;
  const reprobados = total - aprobados;
  const tasa = total > 0 ? Math.round((aprobados / total) * 100) : 0;

  const departamentos = useMemo(() => {
    const set = new Set(intentos.map((i) => i.participante.departamento).filter(Boolean));
    return Array.from(set).sort();
  }, [intentos]);

  const evalPorId = useMemo(
    () => new Map(evaluaciones.map((e) => [e.id, e])),
    [evaluaciones],
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return intentos.filter((i) => {
      if (fEval && i.evaluacionId !== fEval) return false;
      if (fEstado === "aprobado" && !i.aprobado) return false;
      if (fEstado === "reprobado" && i.aprobado) return false;
      if (fDepto && i.participante.departamento !== fDepto) return false;
      if (q) {
        const txt = `${i.participante.nombre} ${i.participante.apellido} ${i.participante.cedula} ${i.participante.correo}`.toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    });
  }, [intentos, fEval, fEstado, fDepto, busqueda]);

  function exportar() {
    const params = new URLSearchParams();
    if (fEval) params.set("evaluacion", fEval);
    if (fEstado) params.set("estado", fEstado);
    if (busqueda.trim()) params.set("q", busqueda.trim());
    window.location.href = `/api/admin/export?${params.toString()}`;
  }

  return (
    <>
      <div className="stat-grid">
        <div className="stat">
          <div className="num">{total}</div>
          <div className="lbl">Evaluaciones presentadas</div>
        </div>
        <div className="stat">
          <div className="num">{aprobados}</div>
          <div className="lbl">Aprobados</div>
        </div>
        <div className="stat">
          <div className="num" style={{ color: "var(--rojo)" }}>{reprobados}</div>
          <div className="lbl">Reprobados</div>
        </div>
        <div className="stat">
          <div className="num">{tasa}%</div>
          <div className="lbl">Tasa de aprobación</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="field">
          <label>Evaluación</label>
          <select value={fEval} onChange={(e) => setFEval(e.target.value)}>
            <option value="">Todas</option>
            {evaluaciones.map((e) => (
              <option key={e.id} value={e.id}>{e.titulo}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Estado</label>
          <select value={fEstado} onChange={(e) => setFEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="aprobado">Aprobados</option>
            <option value="reprobado">Reprobados</option>
          </select>
        </div>
        <div className="field">
          <label>Departamento</label>
          <select value={fDepto} onChange={(e) => setFDepto(e.target.value)}>
            <option value="">Todos</option>
            {departamentos.map((d) => (
              <option key={d} value={d}>{d}</option>
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
        <button className="btn btn-primary" onClick={exportar}>
          Exportar a Excel (CSV)
        </button>
        <button
          className={`btn ${verPapelera ? "btn-primary" : "btn-secondary"}`}
          onClick={() => verPapelera ? setVerPapelera(false) : cargarPapelera()}
        >
          {verPapelera ? "Volver a resultados" : "Papelera"}
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
                  <th>Evaluación</th>
                  <th>Nota</th>
                  <th>Estado</th>
                  <th>Eliminado el</th>
                  <th>Restaurar</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {papelera.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: 24 }}>
                      Papelera vacía.
                    </td>
                  </tr>
                ) : (
                  papelera.map((i) => (
                    <tr key={i.id}>
                      <td>{fechaCorta(i.presentadoEn)}</td>
                      <td>{i.participante.nombre} {i.participante.apellido}</td>
                      <td>{i.participante.cedula}</td>
                      <td>{i.evaluacionTitulo}</td>
                      <td><strong>{i.nota.toFixed(1)}</strong></td>
                      <td>
                        <span className={`badge ${i.aprobado ? "badge-ok" : "badge-fail"}`}>
                          {i.aprobado ? "Aprobado" : "Reprobado"}
                        </span>
                      </td>
                      <td>{i.eliminadoEn ? fechaCorta(i.eliminadoEn) : "—"}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: 13 }}
                          onClick={() => restaurarIntento(i.id)}
                        >
                          Restaurar
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 13, color: "var(--rojo)" }}
                          onClick={() => eliminarPermanente(i.id, `${i.participante.nombre} ${i.participante.apellido}`)}
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
          <p className="muted">{filtrados.length} de {intentos.length} registros</p>
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
                  <th>Evaluación</th>
                  <th>Nota</th>
                  <th>Estado</th>
                  <th>Ver</th>
                  <th>Certificado</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={13} style={{ textAlign: "center", padding: 24 }}>
                      Sin registros.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((i) => (
                    <tr key={i.id}>
                      <td>{fechaCorta(i.presentadoEn)}</td>
                      <td>{i.participante.nombre} {i.participante.apellido}</td>
                      <td>{i.participante.cedula}</td>
                      <td>{i.participante.cargo}</td>
                      <td>{i.participante.departamento}</td>
                      <td>{i.participante.proyecto}</td>
                      <td>{i.participante.correo}</td>
                      <td>{i.evaluacionTitulo}</td>
                      <td><strong>{i.nota.toFixed(1)}</strong></td>
                      <td>
                        <span className={`badge ${i.aprobado ? "badge-ok" : "badge-fail"}`}>
                          {i.aprobado ? "Aprobado" : "Reprobado"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 13 }}
                          onClick={() => setDetalle(i)}
                        >
                          Ver
                        </button>
                      </td>
                      <td>
                        {i.aprobado && (
                          <a
                            className="btn btn-primary"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                            href={`/api/certificate/${i.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Certificado
                          </a>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 13, color: "var(--rojo)" }}
                          onClick={() => eliminarIntento(i.id, `${i.participante.nombre} ${i.participante.apellido}`)}
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

      {detalle && (
        <DetalleModal
          intento={detalle}
          evaluacion={evalPorId.get(detalle.evaluacionId)}
          onClose={() => setDetalle(null)}
        />
      )}
    </>
  );
}

function DetalleModal({
  intento,
  evaluacion,
  onClose,
}: {
  intento: Intento;
  evaluacion?: Evaluacion;
  onClose: () => void;
}) {
  const fbTexto = new Map(
    (evaluacion?.feedback ?? []).map((f) => [f.id, f.enunciado]),
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 20,
        zIndex: 50,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ maxWidth: 640, width: "100%", marginTop: 40 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ marginBottom: 4 }}>
            {intento.participante.nombre} {intento.participante.apellido}
          </h2>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>
          C.C. {intento.participante.cedula} · {intento.participante.cargo} ·{" "}
          {intento.participante.correo}
          <br />
          {intento.participante.departamento} · {intento.participante.proyecto}
        </p>
        <p>
          <strong>{intento.evaluacionTitulo}</strong> — Nota{" "}
          <strong>{intento.nota.toFixed(1)}</strong> (
          {intento.aciertos}/{intento.totalPreguntas}) ·{" "}
          <span className={`badge ${intento.aprobado ? "badge-ok" : "badge-fail"}`}>
            {intento.aprobado ? "Aprobado" : "Reprobado"}
          </span>
        </p>

        <h2 style={{ fontSize: 16, marginTop: 22 }}>Respuestas de conocimiento</h2>
        {(evaluacion?.preguntas ?? []).map((p, i) => {
          const elegida = intento.respuestas[p.id];
          const ok = elegida === p.correcta;
          return (
            <div key={p.id} style={{ marginBottom: 10, fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>{i + 1}. {p.enunciado}</div>
              <div style={{ color: ok ? "var(--verde-osc)" : "var(--rojo)" }}>
                Respondió: {elegida ?? "—"} {ok ? "✓" : `✗ (correcta: ${p.correcta})`}
              </div>
            </div>
          );
        })}

        <h2 style={{ fontSize: 16, marginTop: 22 }}>Retroalimentación del capacitador</h2>
        {intento.feedback.length === 0 ? (
          <p className="muted">Sin retroalimentación registrada.</p>
        ) : (
          intento.feedback.map((f) => (
            <div key={f.preguntaId} style={{ marginBottom: 8, fontSize: 14 }}>
              <span style={{ fontWeight: 600 }}>{fbTexto.get(f.preguntaId) ?? f.preguntaId}:</span> {f.valor}
            </div>
          ))
        )}

        {intento.firma && (
          <>
            <h2 style={{ fontSize: 16, marginTop: 22 }}>Firma</h2>
            <img
              src={intento.firma}
              alt="Firma del participante"
              style={{ maxWidth: 300, border: "1px solid var(--gris-borde)", borderRadius: 8, background: "#fff" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
