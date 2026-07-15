import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import FormularioAsistencia from "@/components/FormularioAsistencia";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AsistenciaPage({
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
        <h1>Registro de asistencia</h1>
        <p className="muted">
          Registra tu asistencia a la capacitación:{" "}
          <strong>{evaluacion.titulo}</strong>
        </p>
        <FormularioAsistencia evaluacion={evaluacion} />
      </main>
    </>
  );
}
