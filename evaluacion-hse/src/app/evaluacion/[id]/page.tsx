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

  return (
    <>
      <Topbar subtitulo={evaluacion.tema} />
      <main className="container">
        <h1>{evaluacion.titulo}</h1>
        <p className="muted">
          Completa tus datos y responde todas las preguntas. La calificación se
          obtiene sobre 5,0 y se aprueba con 3,0.
        </p>
        <FormularioEvaluacion evaluacion={evaluacion} />
      </main>
    </>
  );
}
