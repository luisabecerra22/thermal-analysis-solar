#!/usr/bin/env bash
# Despliegue del Sistema de Evaluaciones HSE de Renergeia en Google Cloud Run.
# Requisitos: gcloud instalado y sesión iniciada con la cuenta destino.
#   gcloud auth login
set -euo pipefail

# ==================== CONFIGURACIÓN ====================
CUENTA="carlos.betancur.galvez@gmail.com"
PROJECT_ID="${PROJECT_ID:-renergeia-evaluaciones}"   # cámbialo si ya tienes uno
REGION="${REGION:-us-central1}"
SERVICE="evaluacion-hse"
MAIL_FROM="${MAIL_FROM:-Renergeia Capacitaciones <no-reply@btodigital.com>}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
# ======================================================

echo "==> Cuenta activa"
gcloud config set account "$CUENTA"
gcloud config set project "$PROJECT_ID"

echo "==> Habilitando APIs necesarias"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com

echo "==> Base de datos Firestore (modo nativo) — se ignora si ya existe"
gcloud firestore databases create --location="$REGION" 2>/dev/null || \
  echo "   (Firestore ya existe o se creó antes)"

echo "==> Secretos en Secret Manager"
crear_secreto () {
  local nombre="$1"; local valor="$2"
  if ! gcloud secrets describe "$nombre" >/dev/null 2>&1; then
    printf "%s" "$valor" | gcloud secrets create "$nombre" --data-file=- --replication-policy=automatic
    echo "   creado: $nombre"
  else
    echo "   ya existe: $nombre (no se sobrescribe)"
  fi
}

# SESSION_SECRET aleatorio si no se define.
SESSION_SECRET="${SESSION_SECRET:-$(openssl rand -hex 32)}"
crear_secreto "SESSION_SECRET" "$SESSION_SECRET"

# Contraseña del admin (obligatoria en el primer despliegue).
if [ -n "${ADMIN_PASSWORD:-}" ]; then
  crear_secreto "ADMIN_PASSWORD" "$ADMIN_PASSWORD"
else
  gcloud secrets describe ADMIN_PASSWORD >/dev/null 2>&1 || {
    echo "!! Define ADMIN_PASSWORD la primera vez:  ADMIN_PASSWORD='TuClave' ./deploy.sh"; exit 1; }
fi

# RESEND_API_KEY (opcional; sin ella no se envían correos pero el certificado sí se descarga).
if [ -n "${RESEND_API_KEY:-}" ]; then
  crear_secreto "RESEND_API_KEY" "$RESEND_API_KEY"
fi

echo "==> Desplegando en Cloud Run (build con Cloud Build, sin Docker local)"
SECRETS="SESSION_SECRET=SESSION_SECRET:latest,ADMIN_PASSWORD=ADMIN_PASSWORD:latest"
if gcloud secrets describe RESEND_API_KEY >/dev/null 2>&1; then
  SECRETS="$SECRETS,RESEND_API_KEY=RESEND_API_KEY:latest"
fi

gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --min-instances=0 \
  --memory=512Mi \
  --set-env-vars "DB_BACKEND=firestore,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,ADMIN_USERNAME=$ADMIN_USERNAME,MAIL_FROM=$MAIL_FROM" \
  --set-secrets "$SECRETS"

URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')
echo "==> Fijando APP_BASE_URL=$URL"
gcloud run services update "$SERVICE" --region "$REGION" \
  --update-env-vars "APP_BASE_URL=$URL" >/dev/null

echo ""
echo "======================================================"
echo " Despliegue completado."
echo " URL de la app:  $URL"
echo ""
echo " Falta un paso: sembrar la evaluación y el admin en Firestore."
echo " Ejecuta una vez:"
echo "   gcloud auth application-default login"
echo "   DB_BACKEND=firestore GOOGLE_CLOUD_PROJECT=$PROJECT_ID \\"
echo "     ADMIN_USERNAME=$ADMIN_USERNAME ADMIN_PASSWORD='<tu-clave>' npm run seed"
echo "======================================================"
