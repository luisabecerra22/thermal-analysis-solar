import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import FormularioEvaluacion from "@/components/FormularioEvaluacion";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EvaluacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStore();
  const evaluacion = await store.getEvaluacion(id);

  if (!evaluacion || !evaluacion.activa) {
    notFound();
  }

  const esInduccion = id === "induccion-reinduccion-hseq";

  return (
    <>
      <Topbar subtitulo={evaluacion.tema} />
      <main className="container">
        <h1>{evaluacion.titulo}</h1>
        {esInduccion && (
          <div style={{ margin: "1.5rem 0" }}>
            <h3 style={{ marginBottom: "0.75rem", color: "var(--azul-oscuro)" }}>
              Video de la capacitación
            </h3>
            <video
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              style={{
                width: "100%",
                maxWidth: 720,
                borderRadius: 10,
                boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
              }}
            >
              <source
                src="https://storage.googleapis.com/renergeia-media/video-induccion.mp4"
                type="video/mp4"
              />
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>
        )}
        <p className="muted">
          Completa tus datos y responde todas las preguntas. La calificación se
          obtiene sobre 5,0 y se aprueba con 3,0.
        </p>
        <FormularioEvaluacion evaluacion={evaluacion} />
      </main>
    </>
  );
}
