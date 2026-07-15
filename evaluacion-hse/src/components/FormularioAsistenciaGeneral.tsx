"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Evaluacion } from "@/lib/types";

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
        style={{ marginTop: 8, padding: "6px 14px", fontSize: 13 }}
        onClick={limpiar}
      >
        Limpiar firma
      </button>
    </div>
  );
}

export default function FormularioAsistenciaGeneral({
  evaluaciones,
}: {
  evaluaciones: Evaluacion[];
}) {
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    cargo: "",
    departamento: "",
    proyecto: "",
    correo: "",
    capacitacion: "",
  });
  const [proyectoOtro, setProyectoOtro] = useState("");
  const [capacitacionOtra, setCapacitacionOtra] = useState("");
  const [firma, setFirma] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  function setCampo(campo: keyof typeof datos, valor: string) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  function validar(): string | null {
    if (!datos.nombre.trim() || !datos.apellido.trim())
      return "Ingresa tu nombre y apellido.";
    if (!/^\d{5,15}$/.test(datos.cedula.trim()))
      return "Ingresa un número de cédula válido (solo dígitos).";
    if (!datos.cargo.trim()) return "Ingresa tu cargo.";
    if (!datos.departamento) return "Selecciona tu departamento.";
    if (!datos.proyecto && !proyectoOtro.trim())
      return "Selecciona o ingresa tu proyecto.";
    if (datos.proyecto === "__otro__" && !proyectoOtro.trim())
      return "Ingresa el nombre del proyecto.";
    if (!/^\S+@\S+\.\S+$/.test(datos.correo))
      return "Ingresa un correo válido.";
    if (!datos.capacitacion)
      return "Selecciona la capacitación.";
    if (datos.capacitacion === "__otro__" && !capacitacionOtra.trim())
      return "Ingresa el nombre de la capacitación.";
    if (!firma) return "Por favor dibuja tu firma.";
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
      datos.proyecto === "__otro__" ? proyectoOtro.trim() : datos.proyecto;

    const esOtraCapacitacion = datos.capacitacion === "__otro__";

    try {
      const res = await fetch("/api/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluacionId: esOtraCapacitacion ? "__otro__" : datos.capacitacion,
          evaluacionTitulo: esOtraCapacitacion ? capacitacionOtra.trim() : undefined,
          nombre: datos.nombre.trim(),
          apellido: datos.apellido.trim(),
          correo: datos.correo.trim().toLowerCase(),
          cedula: datos.cedula.trim(),
          cargo: datos.cargo.trim(),
          departamento: datos.departamento,
          proyecto: proyectoFinal,
          firma,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar.");
      setRegistrado(true);
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  }

  if (registrado) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <span
          className="badge badge-ok"
          style={{ fontSize: 16, padding: "8px 20px" }}
        >
          Asistencia registrada
        </span>
        <p style={{ marginTop: 16 }}>
          <strong>
            {datos.nombre} {datos.apellido}
          </strong>
        </p>
        <p className="muted">
          Tu asistencia ha sido registrada exitosamente.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h2>Datos personales</h2>
        <div className="grid-2">
          <div className="field">
            <label>Nombre</label>
            <input
              value={datos.nombre}
              onChange={(e) => setCampo("nombre", e.target.value)}
              placeholder="Ej. María"
            />
          </div>
          <div className="field">
            <label>Apellido</label>
            <input
              value={datos.apellido}
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
              value={datos.cedula}
              onChange={(e) => setCampo("cedula", e.target.value)}
              placeholder="Solo números"
            />
          </div>
          <div className="field">
            <label>Cargo</label>
            <input
              value={datos.cargo}
              onChange={(e) => setCampo("cargo", e.target.value)}
              placeholder="Ej. Operario"
            />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Departamento</label>
            <select
              value={datos.departamento}
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
              value={datos.proyecto}
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
        {datos.proyecto === "__otro__" && (
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
            value={datos.correo}
            onChange={(e) => setCampo("correo", e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />
        </div>
      </div>

      <div className="card">
        <h2>Capacitación</h2>
        <div className="field">
          <label>Selecciona la capacitación</label>
          <select
            value={datos.capacitacion}
            onChange={(e) => {
              setCampo("capacitacion", e.target.value);
              if (e.target.value !== "__otro__") setCapacitacionOtra("");
            }}
          >
            <option value="">Selecciona una capacitación</option>
            {evaluaciones.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.titulo}
              </option>
            ))}
            <option value="__otro__">Otro</option>
          </select>
        </div>
        {datos.capacitacion === "__otro__" && (
          <div className="field">
            <label>Nombre de la capacitación</label>
            <input
              value={capacitacionOtra}
              onChange={(e) => setCapacitacionOtra(e.target.value)}
              placeholder="Escribe el nombre de la capacitación"
            />
          </div>
        )}
      </div>

      <div className="card">
        <h2>Firma</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
          Dibuja tu firma en el recuadro.
        </p>
        <CanvasFirma onFirmaChange={setFirma} />
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={enviar}
        disabled={enviando}
      >
        {enviando ? "Registrando…" : "Confirmar asistencia"}
      </button>
    </div>
  );
}
