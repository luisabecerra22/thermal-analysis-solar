import Topbar from "@/components/Topbar";
import AdminNav from "@/components/AdminNav";
import TablaAsistencia from "@/components/TablaAsistencia";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AsistenciaAdminPage() {
  const store = await getStore();
  const [asistencias, evaluaciones] = await Promise.all([
    store.listAsistencias(),
    store.listEvaluaciones(),
  ]);

  return (
    <>
      <Topbar subtitulo="Panel de administración" />
      <main className="container-wide">
        <AdminNav activo="asistencia" />
        <h1>Registro de asistencia</h1>
        <TablaAsistencia asistencias={asistencias} evaluaciones={evaluaciones} />
      </main>
    </>
  );
}
