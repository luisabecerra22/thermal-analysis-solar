import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await getStore();
  const evaluaciones = await store.listEvaluacionesActivas();

  return (
    <>
      <Topbar />
      <main className="container">
        <h1>Evaluaciones de capacitación</h1>
        <p className="muted">
          Selecciona la capacitación que vas a presentar. Al finalizar recibirás
          tu calificación de inmediato.
        </p>

        {evaluaciones.length === 0 ? (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              En este momento no hay evaluaciones disponibles. Comunícate con el
              área de SST.
            </p>
          </div>
        ) : (
          <div style={{ marginTop: 22 }}>
            {evaluaciones.map((ev) => (
              <div className="card" key={ev.id}>
                <h2 style={{ marginBottom: 6 }}>{ev.titulo}</h2>
                {ev.descripcion && (
                  <p className="muted" style={{ marginTop: 0 }}>
                    {ev.descripcion}
                  </p>
                )}
                <p className="muted" style={{ marginBottom: 18 }}>
                  {ev.preguntas.length} preguntas · aprueba con 3,0 / 5,0
                </p>
                <Link className="btn btn-primary" href={`/evaluacion/${ev.id}`}>
                  Presentar evaluación →
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{ textAlign: "center", marginTop: 28 }}>
          <h2 style={{ marginBottom: 6 }}>Registro de asistencia</h2>
          <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
            Registra tu asistencia a una capacitación.
          </p>
          <Link className="btn btn-primary" href="/asistencia">
            Registrar asistencia →
          </Link>
        </div>

        <p className="muted" style={{ marginTop: 30, textAlign: "center" }}>
          <Link href="/admin/login">Acceso administrador</Link>
        </p>
      </main>
    </>
  );
}
