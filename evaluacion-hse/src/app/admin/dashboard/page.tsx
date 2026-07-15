import Topbar from "@/components/Topbar";
import AdminNav from "@/components/AdminNav";
import DashboardCharts from "@/components/DashboardCharts";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const store = await getStore();
  const [intentos, evaluaciones, asistencias] = await Promise.all([
    store.listIntentos(),
    store.listEvaluaciones(),
    store.listAsistencias(),
  ]);

  return (
    <>
      <Topbar subtitulo="Panel de administración" />
      <main className="container-wide">
        <AdminNav activo="dashboard" />
        <h1>Dashboard</h1>
        <DashboardCharts
          intentos={intentos}
          evaluaciones={evaluaciones}
          asistencias={asistencias}
        />
      </main>
    </>
  );
}
