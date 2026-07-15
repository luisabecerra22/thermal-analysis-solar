"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Evaluacion, PreguntaConocimiento } from "@/lib/types";

const LETRAS = "abcdefghij";

export default function EditorEvaluacion({
  inicial,
}: {
  inicial: Evaluacion;
}) {
  const router = useRouter();
  const [ev, setEv] = useState<Evaluacion>(inicial);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [guardando, setGuardando] = useState(false);

  function setCampo<K extends keyof Evaluacion>(k: K, v: Evaluacion[K]) {
    setEv((e) => ({ ...e, [k]: v }));
    setOk(false);
  }

  function setPregunta(idx: number, patch: Partial<PreguntaConocimiento>) {
    setEv((e) => {
      const preguntas = [...e.preguntas];
      preguntas[idx] = { ...preguntas[idx], ...patch };
      return { ...e, preguntas };
    });
    setOk(false);
  }

  function setOpcionTexto(pi: number, oi: number, texto: string) {
    setEv((e) => {
      const preguntas = [...e.preguntas];
      const opciones = [...preguntas[pi].opciones];
      opciones[oi] = { ...opciones[oi], texto };
      preguntas[pi] = { ...preguntas[pi], opciones };
      return { ...e, preguntas };
    });
    setOk(false);
  }

  function agregarOpcion(pi: number) {
    setEv((e) => {
      const preguntas = [...e.preguntas];
      const opciones = [...preguntas[pi].opciones];
      if (opciones.length >= LETRAS.length) return e;
      opciones.push({ id: LETRAS[opciones.length], texto: "" });
      preguntas[pi] = { ...preguntas[pi], opciones };
      return { ...e, preguntas };
    });
  }

  function quitarOpcion(pi: number, oi: number) {
    setEv((e) => {
      const preguntas = [...e.preguntas];
      let opciones = preguntas[pi].opciones.filter((_, i) => i !== oi);
      // Re-etiquetar ids a, b, c...
      opciones = opciones.map((o, i) => ({ ...o, id: LETRAS[i] }));
      let correcta = preguntas[pi].correcta;
      if (!opciones.some((o) => o.id === correcta)) correcta = opciones[0]?.id ?? "a";
      preguntas[pi] = { ...preguntas[pi], opciones, correcta };
      return { ...e, preguntas };
    });
  }

  function agregarPregunta() {
    setEv((e) => ({
      ...e,
      preguntas: [
        ...e.preguntas,
        {
          id: `p${e.preguntas.length + 1}-${Date.now()}`,
          enunciado: "",
          opciones: [
            { id: "a", texto: "" },
            { id: "b", texto: "" },
          ],
          correcta: "a",
        },
      ],
    }));
    setOk(false);
  }

  function quitarPregunta(idx: number) {
    setEv((e) => ({
      ...e,
      preguntas: e.preguntas.filter((_, i) => i !== idx),
    }));
    setOk(false);
  }

  async function guardar() {
    setError(null);
    setOk(false);
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/evaluations/${ev.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ev),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar.");
      setOk(true);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {ok && <div className="alert alert-info">Cambios guardados correctamente.</div>}

      <div className="card">
        <h2>Datos generales</h2>
        <div className="field">
          <label>Título</label>
          <input
            value={ev.titulo}
            onChange={(e) => setCampo("titulo", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Tema (aparece en el certificado)</label>
          <input value={ev.tema} onChange={(e) => setCampo("tema", e.target.value)} />
        </div>
        <div className="field">
          <label>Descripción (opcional)</label>
          <input
            value={ev.descripcion ?? ""}
            onChange={(e) => setCampo("descripcion", e.target.value)}
          />
        </div>
        <label className="opcion" style={{ maxWidth: 260 }}>
          <input
            type="checkbox"
            checked={ev.activa}
            onChange={(e) => setCampo("activa", e.target.checked)}
          />
          <span>Evaluación activa (visible para los participantes)</span>
        </label>
      </div>

      <div className="card">
        <h2>Preguntas de conocimiento</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Marca con el círculo cuál es la respuesta correcta de cada pregunta.
        </p>
        {ev.preguntas.map((p, pi) => (
          <div className="pregunta" key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Pregunta {pi + 1}</strong>
              {ev.preguntas.length > 1 && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: 12, color: "var(--rojo)" }}
                  onClick={() => quitarPregunta(pi)}
                >
                  Quitar pregunta
                </button>
              )}
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <textarea
                value={p.enunciado}
                onChange={(e) => setPregunta(pi, { enunciado: e.target.value })}
                placeholder="Escribe el enunciado de la pregunta…"
                rows={2}
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  border: "1px solid var(--gris-borde)",
                  borderRadius: 9,
                  fontSize: 15,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
            {p.opciones.map((o, oi) => (
              <div
                key={o.id}
                style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}
              >
                <input
                  type="radio"
                  name={`correcta-${p.id}`}
                  checked={p.correcta === o.id}
                  onChange={() => setPregunta(pi, { correcta: o.id })}
                  title="Marcar como correcta"
                  style={{ accentColor: "var(--verde)" }}
                />
                <strong style={{ width: 18 }}>{o.id})</strong>
                <input
                  value={o.texto}
                  onChange={(e) => setOpcionTexto(pi, oi, e.target.value)}
                  placeholder="Texto de la opción"
                  style={{
                    flex: 1,
                    padding: "9px 11px",
                    border: "1px solid var(--gris-borde)",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
                {p.opciones.length > 2 && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    onClick={() => quitarOpcion(pi, oi)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              className="btn btn-secondary"
              style={{ padding: "6px 12px", fontSize: 13, marginTop: 4 }}
              onClick={() => agregarOpcion(pi)}
            >
              + Agregar opción
            </button>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={agregarPregunta}>
          + Agregar pregunta
        </button>
      </div>

      <div className="card">
        <h2>Retroalimentación del capacitador (estándar)</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Estas preguntas son fijas del formato y no afectan la calificación:
        </p>
        <ul className="muted" style={{ fontSize: 14 }}>
          {ev.feedback.map((f) => (
            <li key={f.id}>
              {f.enunciado}{" "}
              <em>({f.escala === "numerica" ? "escala 1–5" : "Bueno/Regular/Deficiente"})</em>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-primary" onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        <a className="btn btn-secondary" href="/admin/evaluaciones">
          Volver
        </a>
      </div>
    </div>
  );
}
