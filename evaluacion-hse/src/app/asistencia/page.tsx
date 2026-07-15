import Topbar from "@/components/Topbar";
import FormularioAsistenciaGeneral from "@/components/FormularioAsistenciaGeneral";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AsistenciaGeneralPage() {
  const store = await getStore();
  const evaluaciones = await store.listEvaluacionesActivas();

  return (
    <>
      <Topbar subtitulo="Registro de asistencia" />
      <main className="container">
        <h1>Registro de asistencia</h1>
        <p className="muted">
          Completa tus datos y confirma tu asistencia a la capacitación.
        </p>
        <FormularioAsistenciaGeneral evaluaciones={evaluaciones} />
      </main>
    </>
  );
}
