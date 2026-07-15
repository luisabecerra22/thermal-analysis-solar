import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import AdminNav from "@/components/AdminNav";
import EditorEvaluacion from "@/components/EditorEvaluacion";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditarEvaluacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStore();
  const evaluacion = await store.getEvaluacion(id);
  if (!evaluacion) notFound();

  return (
    <>
      <Topbar subtitulo="Panel de administración" />
      <main className="container">
        <AdminNav activo="evaluaciones" />
        <h1>Editar evaluación</h1>
        <EditorEvaluacion inicial={evaluacion} />
      </main>
    </>
  );
}
