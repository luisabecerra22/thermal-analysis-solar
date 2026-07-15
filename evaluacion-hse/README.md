# Sistema de Evaluaciones HSE — Renergeia

Plataforma web para digitalizar las evaluaciones de capacitación en salud, seguridad
y ambiente (SG-SST) de Renergeia. Basada en el formato **FO-SG-SS-100-1**.

## Funcionalidades

- **Participante:** se registra (correo, nombre, apellido, cédula, cargo), presenta la
  evaluación de conocimiento y la retroalimentación del capacitador. Recibe la
  calificación al instante (escala 0–5, aprueba con 3,0).
- **Aprobado:** descarga un **certificado PDF** y lo recibe por correo.
- **Reprobado:** debe repetir la capacitación; puede reintentar tras **24 horas**.
- **Administrador** (usuario y contraseña): ve todos los resultados, filtra, exporta a
  Excel/CSV, revisa la retroalimentación y **crea/edita evaluaciones**.

## Stack

- **Next.js 15** (App Router, TypeScript) — un solo contenedor sirve el formulario y el panel.
- **Firestore** en producción / **JSON local** en desarrollo (seleccionable con `DB_BACKEND`).
- **pdf-lib** para el certificado, **Resend** para el correo, **jose + bcrypt** para el acceso admin.
- Despliegue en **Google Cloud Run** (escala a cero).

## Desarrollo local

```bash
npm install
cp .env.example .env.local     # ya viene un .env.local listo para pruebas
npm run seed                   # crea la evaluación inicial y el admin
npm run dev                    # http://localhost:3000
```

Admin de prueba: usuario `admin`, contraseña `Renergeia2026*` (cámbiala en producción).

## Despliegue en Google Cloud (Cloud Run + Firestore)

Requiere estar autenticado con la cuenta `carlos.betancur.galvez@gmail.com`:

```bash
gcloud auth login          # abre el navegador
./deploy.sh                # automatiza proyecto, Firestore, secretos y despliegue
```

Ver `deploy.sh` para el detalle de cada paso.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DB_BACKEND` | `json` (local) o `firestore` (producción) |
| `GOOGLE_CLOUD_PROJECT` | ID del proyecto GCP (producción) |
| `SESSION_SECRET` | Secreto para firmar la sesión del admin |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales del primer admin (para el seed) |
| `RESEND_API_KEY` | API key de Resend (envío de certificados) |
| `MAIL_FROM` | Remitente verificado, ej. `no-reply@btodigital.com` |
| `APP_BASE_URL` | URL pública de la app |
