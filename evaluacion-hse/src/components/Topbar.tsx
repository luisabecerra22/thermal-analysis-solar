/* eslint-disable @next/next/no-img-element */

/** Encabezado con el logo de Renergeia, usado en todas las páginas. */
export default function Topbar({ subtitulo }: { subtitulo?: string }) {
  return (
    <header className="topbar">
      <img src="/logo-renergeia.png" alt="Renergeia" />
      <span className="sub">{subtitulo ?? "Sistema de Evaluaciones SST"}</span>
    </header>
  );
}
