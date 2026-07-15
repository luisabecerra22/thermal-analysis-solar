import Link from "next/link";
import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import { getStore } from "@/lib/db";
import { HORAS_ESPERA_REINTENTO } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStore();
  const intento = await store.getIntento(id);
  if (!intento) notFound();

  const aprobado = intento.aprobado;

  return (
    <>
      <Topbar subtitulo={intento.tema} />
      <main className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <span className={`badge ${aprobado ? "badge-ok" : "badge-fail"}`}>
            {aprobado ? "APROBADO" : "REPROBADO"}
          </span>
          <div
            className="nota-grande"
            style={{
              color: aprobado ? "var(--verde)" : "var(--rojo)",
              margin: "18px 0 6px",
            }}
          >
            {intento.nota.toFixed(1)}
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            de 5,0 · {intento.aciertos} de {intento.totalPreguntas} correctas
          </p>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--gris-borde)",
              margin: "22px 0",
            }}
          />

          <p style={{ fontWeight: 600 }}>
            {intento.participante.nombre} {intento.participante.apellido}
          </p>
          <p className="muted" style={{ marginTop: 0 }}>
            C.C. {intento.participante.cedula} · {intento.tema}
          </p>

          {aprobado ? (
            <>
              <div className="alert alert-info" style={{ marginTop: 20 }}>
                Enviamos tu certificado al correo{" "}
                <strong>{intento.participante.correo}</strong>. También puedes
                descargarlo aquí.
              </div>
              <a
                className="btn btn-primary"
                href={`/api/certificate/${intento.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Descargar certificado (PDF)
              </a>
            </>
          ) : (
            <div className="alert alert-error" style={{ marginTop: 20 }}>
              Tu calificación es inferior a 3,0. Debes repetir la capacitación y
              volver a presentar la evaluación. Podrás reintentar después de{" "}
              {HORAS_ESPERA_REINTENTO} horas.
            </div>
          )}

          <p style={{ marginTop: 24 }}>
            <Link className="btn btn-secondary" href="/">
              Volver al inicio
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
