"use client";

import { useMemo } from "react";
import type { Evaluacion, Intento, Asistencia } from "@/lib/types";

function BarChart({
  data,
  color = "var(--verde)",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 180,
              fontSize: 13,
              textAlign: "right",
              flexShrink: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={d.label}
          >
            {d.label}
          </div>
          <div
            style={{
              flex: 1,
              background: "var(--gris-fondo)",
              borderRadius: 6,
              height: 28,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${(d.value / max) * 100}%`,
                minWidth: d.value > 0 ? 24 : 0,
                background: color,
                height: "100%",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 8,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {d.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardCharts({
  intentos,
  evaluaciones,
  asistencias,
}: {
  intentos: Intento[];
  evaluaciones: Evaluacion[];
  asistencias: Asistencia[];
}) {
  const evalMap = useMemo(
    () => new Map(evaluaciones.map((e) => [e.id, e.titulo])),
    [evaluaciones],
  );

  const personasUnicas = useMemo(() => {
    const set = new Set(intentos.map((i) => i.participante.cedula));
    return set.size;
  }, [intentos]);

  const aprobados = useMemo(
    () => intentos.filter((i) => i.aprobado).length,
    [intentos],
  );

  const porCapacitacion = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of intentos) {
      const titulo = evalMap.get(i.evaluacionId) ?? i.evaluacionTitulo;
      map.set(titulo, (map.get(titulo) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [intentos, evalMap]);

  const porDepartamento = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of intentos) {
      const dep = i.participante.departamento || "Sin departamento";
      map.set(dep, (map.get(dep) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [intentos]);

  const horasPorDepto = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const i of intentos) {
      const dep = i.participante.departamento || "Sin departamento";
      if (!map.has(dep)) map.set(dep, new Set());
      map.get(dep)!.add(i.participante.cedula);
    }
    return Array.from(map.entries())
      .map(([label, ceds]) => ({ label, value: ceds.size }))
      .sort((a, b) => b.value - a.value);
  }, [intentos]);

  const asistenciaPorCapacitacion = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of asistencias) {
      const titulo = a.evaluacionTitulo;
      map.set(titulo, (map.get(titulo) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [asistencias]);

  const totalHoras = personasUnicas;

  return (
    <div>
      <div className="stat-grid">
        <div className="stat">
          <div className="num">{personasUnicas}</div>
          <div className="lbl">Personas capacitadas</div>
        </div>
        <div className="stat">
          <div className="num">{totalHoras}</div>
          <div className="lbl">Horas de capacitación</div>
        </div>
        <div className="stat">
          <div className="num">{aprobados}</div>
          <div className="lbl">Aprobados</div>
        </div>
        <div className="stat">
          <div className="num">{asistencias.length}</div>
          <div className="lbl">Registros de asistencia</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card">
          <h2>Personas por capacitación</h2>
          {porCapacitacion.length === 0 ? (
            <p className="muted">Sin datos aún.</p>
          ) : (
            <BarChart data={porCapacitacion} />
          )}
        </div>

        <div className="card">
          <h2>Personas por departamento</h2>
          {porDepartamento.length === 0 ? (
            <p className="muted">Sin datos aún.</p>
          ) : (
            <BarChart data={porDepartamento} color="var(--azul-claro)" />
          )}
        </div>

        <div className="card">
          <h2>Horas por departamento</h2>
          <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
            1 hora por persona única capacitada
          </p>
          {horasPorDepto.length === 0 ? (
            <p className="muted">Sin datos aún.</p>
          ) : (
            <BarChart data={horasPorDepto} color="var(--verde-osc)" />
          )}
        </div>

        <div className="card">
          <h2>Asistencia por capacitación</h2>
          {asistenciaPorCapacitacion.length === 0 ? (
            <p className="muted">Sin datos aún.</p>
          ) : (
            <BarChart data={asistenciaPorCapacitacion} color="var(--azul)" />
          )}
        </div>
      </div>
    </div>
  );
}
