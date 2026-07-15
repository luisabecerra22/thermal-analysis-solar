import Topbar from "@/components/Topbar";
import AdminNav from "@/components/AdminNav";
import ListaEvaluaciones from "@/components/ListaEvaluaciones";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminEvaluaciones() {
  const store = await getStore();
  const evaluaciones = await store.listEvaluaciones();

  return (
    <>
      <Topbar subtitulo="Panel de administración" />
      <main className="container-wide">
        <AdminNav activo="evaluaciones" />
        <h1>Evaluaciones</h1>
        <p className="muted">
          Crea, edita y activa las evaluaciones que verán los participantes.
        </p>
        <ListaEvaluaciones
          evaluaciones={evaluaciones.map((e) => ({
            id: e.id,
            titulo: e.titulo,
            tema: e.tema,
            activa: e.activa,
            numPreguntas: e.preguntas.length,
          }))}
        />
      </main>
    </>
  );
}
