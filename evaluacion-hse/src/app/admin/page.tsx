import Topbar from "@/components/Topbar";
import AdminNav from "@/components/AdminNav";
import TablaResultados from "@/components/TablaResultados";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const store = await getStore();
  const [intentos, evaluaciones] = await Promise.all([
    store.listIntentos(),
    store.listEvaluaciones(),
  ]);

  return (
    <>
      <Topbar subtitulo="Panel de administración" />
      <main className="container-wide">
        <AdminNav activo="resultados" />
        <h1>Resultados de evaluaciones</h1>
        <TablaResultados intentos={intentos} evaluaciones={evaluaciones} />
      </main>
    </>
  );
}
