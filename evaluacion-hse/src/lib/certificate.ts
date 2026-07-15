import { promises as fs } from "node:fs";
import path from "node:path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Intento } from "./types";

const AZUL = rgb(0x1f / 255, 0x3a / 255, 0x5f / 255);
const VERDE = rgb(0x6a / 255, 0xbf / 255, 0x4b / 255);
const GRIS = rgb(0.35, 0.35, 0.35);

function capitalizar(texto: string): string {
  return texto.trim().toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

function fechaLarga(iso: string): string {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const d = new Date(iso);
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function textoCentradoEn(
  page: PDFPage,
  texto: string,
  centerX: number,
  y: number,
  font: PDFFont,
  size: number,
  color = AZUL,
): void {
  const ancho = font.widthOfTextAtSize(texto, size);
  page.drawText(texto, {
    x: centerX - ancho / 2,
    y,
    size,
    font,
    color,
  });
}

export async function generarCertificado(intento: Intento): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const pageW = 842;
  const pageH = 595;
  const page = pdf.addPage([pageW, pageH]);

  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // Cargar Montserrat Bold para el nombre
  let fontNombre: PDFFont = fontBold;
  try {
    const montserratBytes = await fs.readFile(
      path.join(process.cwd(), "public", "Montserrat-Bold.ttf"),
    );
    fontNombre = await pdf.embedFont(montserratBytes);
  } catch {
    // Fallback a Helvetica Bold
  }

  try {
    const templateBytes = await fs.readFile(
      path.join(process.cwd(), "public", "diploma-template.png"),
    );
    const templateImg = await pdf.embedPng(templateBytes);
    page.drawImage(templateImg, { x: 0, y: 0, width: pageW, height: pageH });
  } catch {
    // Sin template
  }

  // Centro horizontal del área de contenido
  const centerX = 420;

  // Nombre completo en MAYÚSCULAS con Montserrat Bold
  const nombre = `${intento.participante.nombre} ${intento.participante.apellido}`.trim().toUpperCase();
  let tamNombre = 36;
  const maxAnchoNombre = 450;
  while (tamNombre > 20 && fontNombre.widthOfTextAtSize(nombre, tamNombre) > maxAnchoNombre) {
    tamNombre -= 1;
  }
  textoCentradoEn(page, nombre, centerX, 305, fontNombre, tamNombre, VERDE);

  // "Ha aprobado satisfactoriamente la capacitación"
  textoCentradoEn(page, "Ha aprobado satisfactoriamente la capacitacion", centerX, 255, fontRegular, 13, GRIS);

  // Nombre de la capacitación en negrita
  const temaTexto = `"${intento.tema}"`;
  let tamTema = 17;
  const maxAncho = 420;
  while (tamTema > 12 && fontBold.widthOfTextAtSize(temaTexto, tamTema) > maxAncho) {
    tamTema -= 1;
  }
  textoCentradoEn(page, temaTexto, centerX, 228, fontBold, tamTema, AZUL);

  // Resultado obtenido
  const notaTexto = `Resultado obtenido: ${intento.nota.toFixed(1)} / 5.0`;
  textoCentradoEn(page, notaTexto, centerX, 203, fontRegular, 13, GRIS);

  // Fecha de expedición
  const fechaTexto = `Expedido el ${fechaLarga(intento.presentadoEn)}`;
  textoCentradoEn(page, fechaTexto, centerX, 168, fontItalic, 13, GRIS);

  // ID de verificación
  page.drawText(`ID: ${intento.id}`, {
    x: 40, y: 18, size: 5, font: fontRegular, color: rgb(0.65, 0.65, 0.65),
  });

  return pdf.save();
}
