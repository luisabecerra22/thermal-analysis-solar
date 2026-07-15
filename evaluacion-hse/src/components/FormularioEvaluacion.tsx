"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Evaluacion } from "@/lib/types";

const CUALITATIVAS = [
  { valor: "bueno", texto: "Bueno" },
  { valor: "regular", texto: "Regular" },
  { valor: "deficiente", texto: "Deficiente" },
];

const DEPARTAMENTOS = [
  "Departamento administrativo y de recursos humanos",
  "Departamento contable, financiero y de control",
  "Departamento de Construcción",
  "Departamento de Ingeniería",
  "Departamento de operación y mantenimiento",
  "Departamento de Procura",
  "Departamento de Propuestas",
  "Departamento de sistemas integrados",
  "Departamento mercadeo y comunicaciones",
];

const PROYECTOS = [
  "COS5SO - La Soberana",
  "COS4HA - Hatogrande",
  "COS2OT - OLD-T",
  "COSAR - Aris Mining",
  "COS17PR - Bayunca",
  "PA21LV - La Villa",
  "COS6VL - Villanueva",
];

function CanvasFirma({
  onFirmaChange,
}: {
  onFirmaChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const tieneTrazo = useRef(false);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  function iniciar(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    dibujando.current = true;
    tieneTrazo.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function mover(e: React.MouseEvent | React.TouchEvent) {
    if (!dibujando.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function terminar() {
    if (!dibujando.current) return;
    dibujando.current = false;
    if (tieneTrazo.current) {
      onFirmaChange(canvasRef.current!.toDataURL("image/png"));
    }
  }

  function limpiar() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tieneTrazo.current = false;
    onFirmaChange(null);
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#1f3a5f";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="firma-canvas"
        onMouseDown={iniciar}
        onMouseMove={mover}
        onMouseUp={terminar}
        onMouseLeave={terminar}
        onTouchStart={iniciar}
        onTouchMove={mover}
        onTouchEnd={terminar}
      />
      <button
        type="button"
        className="btn btn-secondary"
        style={{ marginTop: 8, padding: "6px 16px", fontSize: 13 }}
        onClick={limpiar}
      >
        Limpiar firma
      </button>
    </div>
  );
}

export default function FormularioEvaluacion({
  evaluacion,
}: {
  evaluacion: Evaluacion;
}) {
  const router = useRouter();
  const [participante, setParticipante] = useState({
    correo: "",
    nombre: "",
    apellido: "",
    cedula: "",
    cargo: "",
    departamento: "",
    proyecto: "",
  });
  const [proyectoOtro, setProyectoOtro] = useState("");
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [firma, setFirma] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function setCampo(campo: keyof typeof participante, valor: string) {
    setParticipante((p) => ({ ...p, [campo]: valor }));
  }

  function validar(): string | null {
    const { correo, nombre, apellido, cedula, cargo, departamento, proyecto } =
      participante;
    if (!nombre.trim() || !apellido.trim()) return "Ingresa tu nombre y apellido.";
    if (!/^\S+@\S+\.\S+$/.test(correo)) return "Ingresa un correo válido.";
    if (!/^\d{5,15}$/.test(cedula.trim()))
      return "Ingresa un número de cédula válido (solo dígitos).";
    if (!cargo.trim()) return "Ingresa tu cargo.";
    if (!departamento) return "Selecciona tu departamento.";
    if (!proyecto && !proyectoOtro.trim())
      return "Selecciona o ingresa tu proyecto.";
    if (proyecto === "__otro__" && !proyectoOtro.trim())
      return "Ingresa el nombre del proyecto.";
    for (const p of evaluacion.preguntas) {
      if (!respuestas[p.id]) return "Responde todas las preguntas de conocimiento.";
    }
    for (const f of evaluacion.feedback) {
      if (!feedback[f.id]) return "Responde todas las preguntas de retroalimentación.";
    }
    if (!firma) return "Debes firmar antes de enviar.";
    return null;
  }

  async function enviar() {
    const errValidacion = validar();
    if (errValidacion) {
      setError(errValidacion);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError(null);
    setEnviando(true);

    const proyectoFinal =
      participante.proyecto === "__otro__"
        ? proyectoOtro.trim()
        : participante.proyecto;

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluacionId: evaluacion.id,
          participante: {
            ...participante,
            correo: participante.correo.trim().toLowerCase(),
            cedula: participante.cedula.trim(),
            proyecto: proyectoFinal,
          },
          respuestas,
          feedback: Object.entries(feedback).map(([preguntaId, valor]) => ({
            preguntaId,
            valor,
          })),
          firma,
        }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setError(data.mensaje);
        setEnviando(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!res.ok) throw new Error(data.error || "Error al enviar.");
      router.push(`/resultado/${data.id}`);
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      {/* Registro */}
      <div className="card">
        <h2>Tus datos</h2>
        <div className="grid-2">
          <div className="field">
            <label>Nombre</label>
            <input
              value={participante.nombre}
              onChange={(e) => setCampo("nombre", e.target.value)}
              placeholder="Ej. María"
            />
          </div>
          <div className="field">
            <label>Apellido</label>
            <input
              value={participante.apellido}
              onChange={(e) => setCampo("apellido", e.target.value)}
              placeholder="Ej. Gómez"
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Número de identificación (cédula)</label>
            <input
              inputMode="numeric"
              value={participante.cedula}
              onChange={(e) => setCampo("cedula", e.target.value)}
              placeholder="Solo números"
            />
          </div>
          <div className="field">
            <label>Cargo</label>
            <input
              value={participante.cargo}
              onChange={(e) => setCampo("cargo", e.target.value)}
              placeholder="Ej. Operario"
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Departamento</label>
            <select
              value={participante.departamento}
              onChange={(e) => setCampo("departamento", e.target.value)}
            >
              <option value="">Selecciona un departamento</option>
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Proyecto</label>
            <select
              value={participante.proyecto}
              onChange={(e) => {
                setCampo("proyecto", e.target.value);
                if (e.target.value !== "__otro__") setProyectoOtro("");
              }}
            >
              <option value="">Selecciona un proyecto</option>
              {PROYECTOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="__otro__">Otro</option>
            </select>
          </div>
        </div>
        {participante.proyecto === "__otro__" && (
          <div className="field">
            <label>Nombre del proyecto</label>
            <input
              value={proyectoOtro}
              onChange={(e) => setProyectoOtro(e.target.value)}
              placeholder="Escribe el nombre del proyecto"
            />
          </div>
        )}
        <div className="field">
          <label>Correo electrónico</label>
          <input
            type="email"
            value={participante.correo}
            onChange={(e) => setCampo("correo", e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />
        </div>
      </div>

      {/* Preguntas de conocimiento */}
      <div className="card">
        <h2>Evaluación de conocimiento</h2>
        {evaluacion.preguntas.map((p, i) => (
          <div className="pregunta" key={p.id}>
            <div className="enunciado">
              {i + 1}. {p.enunciado}
            </div>
            {p.opciones.map((o) => {
              const sel = respuestas[p.id] === o.id;
              return (
                <label
                  key={o.id}
                  className={`opcion ${sel ? "seleccionada" : ""}`}
                >
                  <input
                    type="radio"
                    name={p.id}
                    checked={sel}
                    onChange={() =>
                      setRespuestas((r) => ({ ...r, [p.id]: o.id }))
                    }
                  />
                  <span>
                    <strong>{o.id})</strong> {o.texto}
                  </span>
                </label>
              );
            })}
          </div>
        ))}
      </div>

      {/* Retroalimentación */}
      <div className="card">
        <h2>Evaluación del capacitador y del lugar</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Esta sección es retroalimentación y no afecta tu calificación.
        </p>
        {evaluacion.feedback.map((f) => (
          <div className="pregunta" key={f.id}>
            <div className="enunciado">{f.enunciado}</div>
            {f.escala === "cualitativa" ? (
              <div className="escala-num">
                {CUALITATIVAS.map((c) => (
                  <label key={c.valor}>
                    <input
                      type="radio"
                      name={f.id}
                      checked={feedback[f.id] === c.valor}
                      onChange={() =>
                        setFeedback((r) => ({ ...r, [f.id]: c.valor }))
                      }
                    />
                    {c.texto}
                  </label>
                ))}
              </div>
            ) : (
              <div className="escala-num">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n}>
                    <input
                      type="radio"
                      name={f.id}
                      checked={feedback[f.id] === String(n)}
                      onChange={() =>
                        setFeedback((r) => ({ ...r, [f.id]: String(n) }))
                      }
                    />
                    {n}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Firma */}
      <div className="card">
        <h2>Firma del participante</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Dibuja tu firma en el recuadro.
        </p>
        <CanvasFirma onFirmaChange={setFirma} />
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={enviar}
        disabled={enviando}
      >
        {enviando ? "Enviando…" : "Enviar evaluación"}
      </button>
    </div>
  );
}
