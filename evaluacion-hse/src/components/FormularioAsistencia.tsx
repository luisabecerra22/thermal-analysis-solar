"use client";

import { useState } from "react";
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

export default function FormularioAsistencia({
  evaluacion,
}: {
  evaluacion: Evaluacion;
}) {
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    cargo: "",
    departamento: "",
    proyecto: "",
    correo: "",
  });
  const [proyectoOtro, setProyectoOtro] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  function setCampo(campo: keyof typeof datos, valor: string) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  function validar(): string | null {
    if (!datos.nombre.trim() || !datos.apellido.trim())
      return "Ingresa tu nombre y apellido.";
    if (!/^\S+@\S+\.\S+$/.test(datos.correo))
      return "Ingresa un correo válido.";
    if (!/^\d{5,15}$/.test(datos.cedula.trim()))
      return "Ingresa un número de cédula válido (solo dígitos).";
    if (!datos.cargo.trim()) return "Ingresa tu cargo.";
    if (!datos.departamento) return "Selecciona tu departamento.";
    if (!datos.proyecto && !proyectoOtro.trim())
      return "Selecciona o ingresa tu proyecto.";
    if (datos.proyecto === "__otro__" && !proyectoOtro.trim())
      return "Ingresa el nombre del proyecto.";
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

    try {
      const res = await fetch("/api/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluacionId: evaluacion.id,
          ...datos,
          correo: datos.correo.trim().toLowerCase(),
          cedula: datos.cedula.trim(),
          proyecto: proyectoFinal,
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
        <span className="badge badge-ok" style={{ fontSize: 16, padding: "8px 20px" }}>
          Asistencia registrada
        </span>
        <p style={{ marginTop: 16 }}>
          <strong>
            {datos.nombre} {datos.apellido}
          </strong>
        </p>
        <p className="muted">
          Tu asistencia a la capacitación <strong>{evaluacion.titulo}</strong> ha
          sido registrada exitosamente.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h2>Tus datos</h2>
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
