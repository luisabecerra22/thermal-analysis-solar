import Topbar from "@/components/Topbar";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <>
      <Topbar subtitulo="Panel de administración" />
      <main className="container" style={{ maxWidth: 420 }}>
        <div className="card" style={{ marginTop: 40 }}>
          <h1 style={{ fontSize: 22 }}>Acceso administrador</h1>
          <p className="muted">Ingresa con tu usuario y contraseña.</p>
          <LoginForm />
        </div>
      </main>
    </>
  );
}
