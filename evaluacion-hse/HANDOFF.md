# Traspaso del proyecto — Sistema de Evaluaciones HSE Renergeia

Documento de entrega para **Luisa Becerra** (`luisabecerra22@gmail.com`).

## 1. Qué es

Aplicación web (Next.js 15 + Firestore) que digitaliza el formato **FO-SG-SS-100-1**
"Evaluación de Capacitación en Hábitos y Estilos de Vida Saludables" de Renergeia.
Participantes presentan la evaluación, obtienen nota (escala 0–5, aprueban con 3,0),
reciben certificado PDF, y un administrador ve/exporta resultados y gestiona evaluaciones.

Detalle funcional y técnico completo en [`README.md`](./README.md).

## 2. Estado actual (en producción)

| Recurso | Valor |
|---|---|
| Proyecto GCP | `renergeia-evaluaciones` |
| Servicio Cloud Run | `evaluacion-hse` (región `us-central1`) |
| URL pública | https://evaluacion-hse-64204106653.us-central1.run.app |
| Base de datos | Firestore nativo, `us-central1` (free tier) |
| Costo estimado | ≈ $0–1 / mes con ~2.000 evaluaciones/mes |

**Acceso administrador de la app:**
- Usuario: `admin`
- Contraseña: `Rg-W0cRDtkJJZ2yZQ`  ← *recomendado cambiarla (ver sección 5)*

## 3. Acceso en Google Cloud

Ya tienes asignados en el proyecto los roles: **Editor, Cloud Run Admin, Datastore Owner,
Secret Manager Admin, Service Account User, Project IAM Admin, Billing Project Manager**.
Con eso puedes administrar, desplegar y facturar el proyecto.

> Opcional: si quieres el rol formal de **Owner (Propietario)**, Carlos debe invitarte
> desde la consola (IAM → Conceder acceso → Propietario); Google te enviará un correo de
> invitación a aceptar. No es imprescindible: los roles actuales ya te dan control completo.

## 4. Pasar la facturación a tu cuenta (IMPORTANTE)

Hoy la factura va a la cuenta de Carlos. Para que el proyecto quede 100% en tu Google Cloud:

1. Entra a la consola con `luisabecerra22@gmail.com`.
2. Ve a **Facturación** → **Vincular una cuenta de facturación** al proyecto
   `renergeia-evaluaciones`.
3. Selecciona **tu** cuenta de facturación (o crea una con tu tarjeta).

Un proyecto tiene una sola cuenta de facturación: al vincular la tuya, se desvincula la de Carlos automáticamente.

Enlace directo: https://console.cloud.google.com/billing/linkedaccount?project=renergeia-evaluaciones

## 5. Cómo trabajar con el código

```bash
# Requisitos: Node 20+ y gcloud instalado y autenticado con tu cuenta.
npm install
cp .env.example .env.local     # ajusta variables si es necesario
npm run dev                    # http://localhost:3000  (usa base de datos JSON local)
```

**Redesplegar a producción** (tras autenticarte con `gcloud auth login`):

```bash
gcloud config set project renergeia-evaluaciones
gcloud run deploy evaluacion-hse --source . --region us-central1
```

**Cambiar la contraseña del administrador:** hoy no hay pantalla para ello. Se cambia
regenerando el hash. Rápido:
1. Actualiza el secreto: `printf 'NUEVA_CLAVE' | gcloud secrets versions add ADMIN_PASSWORD --data-file=-`
2. Reсrea el admin en Firestore corriendo el seed con la nueva clave:
   `gcloud auth application-default login`
   `DB_BACKEND=firestore GOOGLE_CLOUD_PROJECT=renergeia-evaluaciones ADMIN_USERNAME=admin ADMIN_PASSWORD='NUEVA_CLAVE' npm run seed`
   (El seed no sobrescribe si el admin ya existe; primero borra el doc `admins/admin` en Firestore o pídeme un script para forzar el cambio.)

## 6. Pendiente

- **Envío de certificados por correo: DESACTIVADO.** Falta cargar la API key de Resend.
  El certificado se descarga sin problema; solo no se envía por email. Para activarlo:
  1. `printf 'RESEND_API_KEY_AQUI' | gcloud secrets create RESEND_API_KEY --data-file=- --replication-policy=automatic`
  2. `gcloud run services update evaluacion-hse --region us-central1 --update-secrets RESEND_API_KEY=RESEND_API_KEY:latest`
  - El remitente configurado es `no-reply@btodigital.com` (variable `MAIL_FROM`). Cámbialo si usarás otro dominio verificado en Resend.
- (Opcional) Mapear un subdominio propio, ej. `evaluacion.renergeia.com`, en Cloud Run.

## 7. Estructura del código

```
src/
  app/            páginas (formulario, resultado, admin) y APIs (/api/*)
  components/     componentes de UI (formulario, tabla admin, editor, etc.)
  lib/            db.ts (abstracción JSON/Firestore), scoring, auth, certificate, email
scripts/seed.ts   crea la evaluación inicial y el admin
deploy.sh         despliegue automatizado en Cloud Run
Dockerfile        imagen para Cloud Run
```
