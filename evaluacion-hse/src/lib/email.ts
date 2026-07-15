import { Resend } from "resend";
import type { Intento } from "./types";

/**
 * Envía el certificado de aprobación por correo usando Resend.
 * Si RESEND_API_KEY no está configurada, no falla: registra y omite el envío
 * (útil en desarrollo local). El certificado siempre queda descargable en la app.
 */
export async function enviarCertificado(
  intento: Intento,
  pdf: Uint8Array,
): Promise<{ enviado: boolean; motivo?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.MAIL_FROM ||
    "Renergeia Capacitaciones <no-reply@btodigital.com>";

  if (!apiKey) {
    return { enviado: false, motivo: "RESEND_API_KEY no configurada" };
  }

  const resend = new Resend(apiKey);
  const nombre =
    `${intento.participante.nombre} ${intento.participante.apellido}`.trim();

  try {
    const { error } = await resend.emails.send({
      from,
      to: intento.participante.correo,
      subject: `Certificado de aprobación — ${intento.tema}`,
      html: plantillaHtml(intento, nombre),
      attachments: [
        {
          filename: `Certificado-${intento.participante.cedula}.pdf`,
          content: Buffer.from(pdf).toString("base64"),
        },
      ],
    });
    if (error) return { enviado: false, motivo: error.message };
    return { enviado: true };
  } catch (e) {
    return { enviado: false, motivo: (e as Error).message };
  }
}

function plantillaHtml(intento: Intento, nombre: string): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1F3A5F;">
    <div style="background:#1F3A5F; padding:24px; text-align:center; border-radius:8px 8px 0 0;">
      <span style="color:#5CB64A; font-size:22px; font-weight:bold;">RENERGEIA</span>
      <span style="color:#ffffff; font-size:12px; display:block; letter-spacing:2px;">SUSTAINABLE PROJECTS</span>
    </div>
    <div style="border:1px solid #e5e7eb; border-top:none; padding:28px; border-radius:0 0 8px 8px;">
      <h2 style="color:#1F3A5F; margin-top:0;">¡Felicitaciones, ${nombre}!</h2>
      <p style="font-size:15px; line-height:1.6;">
        Aprobaste la capacitación <strong>"${intento.tema}"</strong> con una
        calificación de <strong style="color:#5CB64A;">${intento.nota.toFixed(1)} / 5.0</strong>.
      </p>
      <p style="font-size:15px; line-height:1.6;">
        Adjuntamos tu certificado de aprobación en formato PDF.
      </p>
      <p style="font-size:13px; color:#6b7280; margin-top:28px;">
        Este es un mensaje automático del Sistema de Gestión SST de Renergeia.
        Por favor no respondas a este correo.
      </p>
    </div>
  </div>`;
}
