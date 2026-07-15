import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import fs from "fs";

const AZUL = rgb(31 / 255, 58 / 255, 95 / 255);
const VERDE = rgb(92 / 255, 182 / 255, 74 / 255);
const VERDE_OSC = rgb(74 / 255, 158 / 255, 58 / 255);
const GRIS = rgb(71 / 255, 85 / 255, 105 / 255);
const BLANCO = rgb(1, 1, 1);
const GRIS_CLARO = rgb(0.96, 0.97, 0.98);
const AZUL_CLARO_BG = rgb(0.92, 0.95, 0.98);
const VERDE_CLARO = rgb(0.92, 0.98, 0.90);

const W = PageSizes.Letter[0];
const H = PageSizes.Letter[1];
const MARGIN = 55;
const CONTENT_W = W - MARGIN * 2;

async function main() {
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const fb = await doc.embedFont(StandardFonts.HelveticaBold);
  const fi = await doc.embedFont(StandardFonts.HelveticaOblique);

  let logoImg;
  try {
    const logoBytes = fs.readFileSync("public/logo-renergeia.png");
    logoImg = await doc.embedPng(logoBytes);
  } catch { logoImg = null; }

  let leonImg;
  try {
    const leonBytes = fs.readFileSync("public/leon-sig.png");
    leonImg = await doc.embedPng(leonBytes);
  } catch {
    try {
      const leonBytes = fs.readFileSync("public/leon-sig.jpg");
      leonImg = await doc.embedJpg(leonBytes);
    } catch { leonImg = null; }
  }

  // ── helpers ──
  function drawHeader(page) {
    page.drawRectangle({ x: 0, y: H - 65, width: W, height: 65, color: AZUL });
    page.drawRectangle({ x: 0, y: H - 68, width: W, height: 3, color: VERDE });
    if (logoImg) {
      const s = 38 / logoImg.height;
      page.drawImage(logoImg, { x: MARGIN, y: H - 54, width: logoImg.width * s, height: 38 });
    }
    const t = "Sistema de Evaluaciones HSE";
    page.drawText(t, { x: W - MARGIN - f.widthOfTextAtSize(t, 9), y: H - 44, size: 9, font: f, color: rgb(0.8, 0.85, 0.9) });
  }

  function drawFooter(page, num) {
    page.drawRectangle({ x: 0, y: 0, width: W, height: 32, color: AZUL });
    page.drawText("Renergeia S.A.S. -- Documento confidencial", { x: MARGIN, y: 11, size: 7.5, font: f, color: rgb(0.7, 0.75, 0.8) });
    const p = `Pagina ${num}`;
    page.drawText(p, { x: W - MARGIN - f.widthOfTextAtSize(p, 7.5), y: 11, size: 7.5, font: f, color: rgb(0.7, 0.75, 0.8) });
  }

  function wrap(text, font, size, maxW) {
    const words = text.split(" ");
    const lines = []; let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (font.widthOfTextAtSize(t, size) > maxW) { if (cur) lines.push(cur); cur = w; }
      else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function drawW(page, text, x, y, font, size, color, maxW, lh) {
    for (const line of wrap(text, font, size, maxW || CONTENT_W)) {
      page.drawText(line, { x, y, size, font, color });
      y -= (lh || size * 1.5);
    }
    return y;
  }

  function bullet(page, text, x, y, maxW) {
    page.drawCircle({ x: x + 4, y: y + 3, size: 2.5, color: VERDE });
    return drawW(page, text, x + 14, y, f, 10, GRIS, (maxW || CONTENT_W) - 14);
  }

  function numbered(page, num, text, x, y, maxW) {
    page.drawText(`${num}.`, { x, y, size: 10, font: fb, color: VERDE });
    return drawW(page, text, x + 16, y, f, 10, GRIS, (maxW || CONTENT_W) - 16);
  }

  function section(page, text, y) {
    page.drawRectangle({ x: MARGIN - 2, y: y - 5, width: CONTENT_W + 4, height: 24, color: AZUL });
    page.drawText(text.toUpperCase(), { x: MARGIN + 8, y: y + 1, size: 11, font: fb, color: BLANCO });
    return y - 36;
  }

  function subtitle(page, text, y) {
    page.drawRectangle({ x: MARGIN, y: y - 1, width: 3, height: 15, color: VERDE });
    page.drawText(text, { x: MARGIN + 10, y: y, size: 11, font: fb, color: AZUL });
    return y - 20;
  }

  function infoBox(page, text, y) {
    const lines = wrap(text, f, 9.5, CONTENT_W - 28);
    const bh = lines.length * 14 + 16;
    page.drawRectangle({ x: MARGIN, y: y - bh + 10, width: CONTENT_W, height: bh, color: AZUL_CLARO_BG, borderColor: VERDE, borderWidth: 1 });
    let ty = y - 2;
    for (const line of lines) { page.drawText(line, { x: MARGIN + 14, y: ty, size: 9.5, font: f, color: AZUL }); ty -= 14; }
    return y - bh - 4;
  }

  function linkBox(page, label, url, y) {
    page.drawRectangle({ x: MARGIN, y: y - 24, width: CONTENT_W, height: 36, color: GRIS_CLARO, borderColor: VERDE, borderWidth: 1 });
    page.drawText(label, { x: MARGIN + 10, y: y + 1, size: 9.5, font: fb, color: AZUL });
    page.drawText(url, { x: MARGIN + 10, y: y - 14, size: 8.5, font: f, color: rgb(0.2, 0.4, 0.65) });
    return y - 34;
  }

  // ── Mockup drawing helpers ──
  function mockTopbar(page, x, y, w) {
    page.drawRectangle({ x, y: y - 24, width: w, height: 24, color: BLANCO, borderColor: rgb(0.88, 0.9, 0.92), borderWidth: 0.5 });
    page.drawRectangle({ x: x + 6, y: y - 10, width: 14, height: 10, color: VERDE });
    page.drawText("RENERGEIA", { x: x + 23, y: y - 15, size: 5, font: fb, color: AZUL });
    return y - 24;
  }

  function mockCard(page, x, y, w, h, title, lines) {
    page.drawRectangle({ x, y: y - h, width: w, height: h, color: BLANCO, borderColor: rgb(0.88, 0.9, 0.92), borderWidth: 0.5 });
    if (title) {
      page.drawText(title, { x: x + 8, y: y - 14, size: 7, font: fb, color: AZUL });
    }
    let ty = y - (title ? 26 : 12);
    for (const line of (lines || [])) {
      page.drawText(line, { x: x + 8, y: ty, size: 5.5, font: f, color: GRIS });
      ty -= 9;
    }
    return y - h;
  }

  function mockBtn(page, x, y, text, bg) {
    const tw = f.widthOfTextAtSize(text, 5.5) + 12;
    page.drawRectangle({ x, y: y - 10, width: tw, height: 12, color: bg || VERDE, borderWidth: 0 });
    page.drawText(text, { x: x + 6, y: y - 6, size: 5.5, font: fb, color: BLANCO });
    return tw;
  }

  function mockInput(page, x, y, w, label) {
    page.drawText(label, { x, y: y, size: 5, font: fb, color: AZUL });
    page.drawRectangle({ x, y: y - 14, width: w, height: 12, color: BLANCO, borderColor: rgb(0.85, 0.88, 0.92), borderWidth: 0.5 });
    return y - 18;
  }

  function mockStatCard(page, x, y, w, num, label) {
    page.drawRectangle({ x, y: y - 30, width: w, height: 30, color: BLANCO, borderColor: rgb(0.88, 0.9, 0.92), borderWidth: 0.5 });
    page.drawText(num, { x: x + 6, y: y - 12, size: 10, font: fb, color: VERDE });
    page.drawText(label, { x: x + 6, y: y - 24, size: 4.5, font: f, color: GRIS });
  }

  function mockTableHeader(page, x, y, cols, colW) {
    page.drawRectangle({ x, y: y - 12, width: cols.length * colW, height: 12, color: AZUL });
    for (let i = 0; i < cols.length; i++) {
      page.drawText(cols[i], { x: x + i * colW + 3, y: y - 9, size: 4.5, font: fb, color: BLANCO });
    }
    return y - 12;
  }

  function mockTableRow(page, x, y, cols, colW, alt) {
    page.drawRectangle({ x, y: y - 11, width: cols.length * colW, height: 11, color: alt ? GRIS_CLARO : BLANCO, borderColor: rgb(0.92, 0.93, 0.95), borderWidth: 0.3 });
    for (let i = 0; i < cols.length; i++) {
      page.drawText(cols[i], { x: x + i * colW + 3, y: y - 8, size: 4, font: f, color: GRIS });
    }
    return y - 11;
  }

  function mockNavTab(page, x, y, tabs, activeIdx) {
    let tx = x;
    for (let i = 0; i < tabs.length; i++) {
      const tw = f.widthOfTextAtSize(tabs[i], 5.5) + 14;
      page.drawRectangle({ x: tx, y: y - 12, width: tw, height: 14, color: i === activeIdx ? VERDE : BLANCO, borderColor: rgb(0.85, 0.88, 0.92), borderWidth: 0.5 });
      page.drawText(tabs[i], { x: tx + 7, y: y - 7, size: 5.5, font: fb, color: i === activeIdx ? BLANCO : AZUL });
      tx += tw + 4;
    }
    return y - 18;
  }

  function drawScreenFrame(page, x, y, w, h, title) {
    // Browser-like frame
    page.drawRectangle({ x, y: y - h, width: w, height: h, color: GRIS_CLARO, borderColor: rgb(0.82, 0.85, 0.88), borderWidth: 1 });
    // Title bar
    page.drawRectangle({ x, y: y - 16, width: w, height: 16, color: rgb(0.92, 0.93, 0.95), borderColor: rgb(0.82, 0.85, 0.88), borderWidth: 0.5 });
    // Dots
    page.drawCircle({ x: x + 10, y: y - 8, size: 3, color: rgb(0.98, 0.38, 0.35) });
    page.drawCircle({ x: x + 20, y: y - 8, size: 3, color: rgb(0.99, 0.76, 0.18) });
    page.drawCircle({ x: x + 30, y: y - 8, size: 3, color: rgb(0.27, 0.77, 0.35) });
    if (title) page.drawText(title, { x: x + 42, y: y - 11, size: 5, font: f, color: GRIS });
    return { innerX: x + 6, innerY: y - 22, innerW: w - 12 };
  }

  // ════════════════════════════════════════════
  // PAGE 1 — PORTADA
  // ════════════════════════════════════════════
  const p1 = doc.addPage(PageSizes.Letter);
  p1.drawRectangle({ x: 0, y: H - 300, width: W, height: 300, color: AZUL });
  p1.drawRectangle({ x: 0, y: H - 304, width: W, height: 4, color: VERDE });

  if (logoImg) {
    const s = 75 / logoImg.height;
    p1.drawImage(logoImg, { x: (W - logoImg.width * s) / 2, y: H - 120, width: logoImg.width * s, height: 75 });
  }

  let t = "GUIA DE USO";
  p1.drawText(t, { x: (W - fb.widthOfTextAtSize(t, 30)) / 2, y: H - 168, size: 30, font: fb, color: BLANCO });
  t = "Sistema de Evaluaciones HSE";
  p1.drawText(t, { x: (W - fb.widthOfTextAtSize(t, 18)) / 2, y: H - 196, size: 18, font: fb, color: VERDE });
  t = "Plataforma de Capacitacion, Evaluacion y Asistencia";
  p1.drawText(t, { x: (W - f.widthOfTextAtSize(t, 12)) / 2, y: H - 218, size: 12, font: f, color: rgb(0.75, 0.8, 0.88) });
  p1.drawRectangle({ x: W / 2 - 50, y: H - 240, width: 100, height: 2, color: VERDE });
  t = "Renergeia S.A.S.";
  p1.drawText(t, { x: (W - fb.widthOfTextAtSize(t, 13)) / 2, y: H - 260, size: 13, font: fb, color: BLANCO });
  t = "Julio 2026";
  p1.drawText(t, { x: (W - f.widthOfTextAtSize(t, 11)) / 2, y: H - 280, size: 11, font: f, color: rgb(0.7, 0.75, 0.82) });

  // Intro text
  let y = H - 350;
  y = drawW(p1, "Este documento presenta la guia completa de uso del Sistema de Evaluaciones HSE de Renergeia, disenado para gestionar las capacitaciones en Seguridad, Salud en el Trabajo y Ambiente (SST/HSEQ) de manera digital, eficiente y trazable.", MARGIN + 20, y, f, 10.5, GRIS, CONTENT_W - 40, 16);

  y -= 16;
  // TOC
  p1.drawRectangle({ x: MARGIN + 25, y: y - 200, width: CONTENT_W - 50, height: 220, color: GRIS_CLARO, borderColor: VERDE, borderWidth: 1 });
  p1.drawText("CONTENIDO", { x: MARGIN + 45, y: y - 4, size: 12, font: fb, color: AZUL });
  y -= 30;
  const toc = [
    "1.  Introduccion y objetivo del sistema",
    "2.  Acceso a la plataforma - Enlaces principales",
    "3.  Portal de evaluaciones - Como presentar una evaluacion",
    "4.  Registro de asistencia - Paso a paso",
    "5.  Panel administrativo - Gestion y control",
    "6.  Dashboard - Indicadores y estadisticas",
    "7.  Evaluaciones activas actualmente",
    "8.  Funcionalidades adicionales",
    "9.  Autorizacion de uso",
  ];
  for (const item of toc) { p1.drawText(item, { x: MARGIN + 45, y, size: 10, font: f, color: AZUL }); y -= 18; }

  if (leonImg) {
    const s = 90 / leonImg.height;
    p1.drawImage(leonImg, { x: W - MARGIN - 100, y: 42, width: leonImg.width * s, height: 90, opacity: 0.12 });
  }
  drawFooter(p1, 1);

  // ════════════════════════════════════════════
  // PAGE 2 — INTRO + ENLACES
  // ════════════════════════════════════════════
  const p2 = doc.addPage(PageSizes.Letter);
  drawHeader(p2);
  y = H - 100;
  y = section(p2, "1. Introduccion y objetivo", y);
  y = drawW(p2, "El Sistema de Evaluaciones HSE de Renergeia es una plataforma web que permite evaluar los conocimientos de los colaboradores, registrar asistencia a capacitaciones y generar certificados de aprobacion de forma automatica y digital.", MARGIN, y, f, 10, GRIS, CONTENT_W);
  y -= 6;
  y = subtitle(p2, "Objetivos principales", y);
  y = bullet(p2, "Evaluar conocimientos post-capacitacion con preguntas de seleccion multiple.", MARGIN + 6, y);
  y = bullet(p2, "Registrar la asistencia de participantes con firma digital.", MARGIN + 6, y);
  y = bullet(p2, "Generar certificados PDF de aprobacion automaticamente.", MARGIN + 6, y);
  y = bullet(p2, "Centralizar resultados, estadisticas y trazabilidad del plan de capacitacion.", MARGIN + 6, y);
  y = bullet(p2, "Facilitar la gestion administrativa con dashboard, filtros y exportacion de datos.", MARGIN + 6, y);

  y -= 10;
  y = section(p2, "2. Acceso a la plataforma - enlaces principales", y);
  y = drawW(p2, "La plataforma cuenta con tres puntos de acceso. Comparta estos enlaces con los participantes segun corresponda:", MARGIN, y, f, 10, GRIS, CONTENT_W);
  y -= 4;
  y = linkBox(p2, "Portal de Evaluaciones (participantes)", "https://evaluacion-hse-64204106653.us-central1.run.app/", y);
  y -= 2;
  y = linkBox(p2, "Registro de Asistencia (participantes)", "https://evaluacion-hse-64204106653.us-central1.run.app/asistencia", y);
  y -= 2;
  y = linkBox(p2, "Panel de Administracion (acceso restringido)", "https://evaluacion-hse-64204106653.us-central1.run.app/admin/login", y);
  y -= 6;
  y = infoBox(p2, "Nota: El panel de administracion requiere credenciales de acceso. Solicite sus credenciales al area de HSE/SST para gestionar evaluaciones, ver resultados y administrar el sistema.", y);

  // Mockup del portal principal
  y -= 12;
  y = subtitle(p2, "Vista del portal principal", y);
  const frame1 = drawScreenFrame(p2, MARGIN + 20, y, CONTENT_W - 40, 160, "evaluacion-hse-....us-central1.run.app");
  let fy = frame1.innerY;
  fy = mockTopbar(p2, frame1.innerX, fy, frame1.innerW);
  p2.drawText("Evaluaciones de capacitacion", { x: frame1.innerX + 10, y: fy - 12, size: 7, font: fb, color: AZUL });
  fy -= 20;
  mockCard(p2, frame1.innerX + 10, fy, frame1.innerW - 20, 35, "Evaluacion -- Habitos y estilos de vida saludables", ["6 preguntas - aprueba con 3,0 / 5,0"]);
  mockBtn(p2, frame1.innerX + 14, fy - 22, "Presentar evaluacion", VERDE);
  fy -= 40;
  mockCard(p2, frame1.innerX + 10, fy, frame1.innerW - 20, 35, "Evaluacion -- Induccion y Reinduccion HSEQ", ["20 preguntas - aprueba con 3,0 / 5,0"]);
  mockBtn(p2, frame1.innerX + 14, fy - 22, "Presentar evaluacion", VERDE);
  fy -= 40;
  mockCard(p2, frame1.innerX + 10, fy, frame1.innerW - 20, 22, "Registro de asistencia", []);
  mockBtn(p2, frame1.innerX + 14, fy - 12, "Registrar asistencia", VERDE);

  drawFooter(p2, 2);

  // ════════════════════════════════════════════
  // PAGE 3 — EVALUACIONES PASO A PASO
  // ════════════════════════════════════════════
  const p3 = doc.addPage(PageSizes.Letter);
  drawHeader(p3);
  y = H - 100;
  y = section(p3, "3. Portal de evaluaciones - Como presentar una evaluacion", y);
  y = drawW(p3, "Los participantes acceden al portal de evaluaciones para presentar las pruebas de conocimiento. El proceso es intuitivo y se completa en pocos minutos:", MARGIN, y, f, 10, GRIS, CONTENT_W);
  y -= 6;

  y = numbered(p3, 1, "Ingrese al enlace del portal de evaluaciones proporcionado por el area HSE.", MARGIN + 6, y);
  y -= 2;
  y = numbered(p3, 2, "Seleccione la capacitacion que va a presentar y haga clic en \"Presentar evaluacion\".", MARGIN + 6, y);
  y -= 2;
  y = numbered(p3, 3, "Complete sus datos personales: nombre, apellido, cedula, cargo, departamento, proyecto y correo.", MARGIN + 6, y);

  // Mockup del formulario de datos
  y -= 10;
  const frame2 = drawScreenFrame(p3, MARGIN + 30, y, CONTENT_W - 60, 100, "Formulario de datos personales");
  let fy2 = frame2.innerY;
  const iw = (frame2.innerW - 20) / 2;
  fy2 = mockInput(p3, frame2.innerX + 6, fy2, iw - 4, "Nombre");
  mockInput(p3, frame2.innerX + iw + 10, fy2 + 18, iw - 4, "Apellido");
  fy2 = mockInput(p3, frame2.innerX + 6, fy2, iw - 4, "Cedula");
  mockInput(p3, frame2.innerX + iw + 10, fy2 + 18, iw - 4, "Cargo");
  fy2 = mockInput(p3, frame2.innerX + 6, fy2, iw - 4, "Departamento");
  mockInput(p3, frame2.innerX + iw + 10, fy2 + 18, iw - 4, "Proyecto");
  mockInput(p3, frame2.innerX + 6, fy2, frame2.innerW - 12, "Correo electronico");

  y -= 108;
  y = numbered(p3, 4, "Responda las preguntas de conocimiento seleccionando la opcion que considere correcta.", MARGIN + 6, y);

  // Mockup de pregunta
  y -= 8;
  const frame3 = drawScreenFrame(p3, MARGIN + 30, y, CONTENT_W - 60, 70, "Preguntas de seleccion multiple");
  let fy3 = frame3.innerY;
  p3.drawText("1. Cual es el elemento de proteccion personal obligatorio?", { x: frame3.innerX + 8, y: fy3 - 10, size: 6, font: fb, color: AZUL });
  const opts = ["A) Casco de seguridad", "B) Gafas de sol", "C) Guantes de cocina", "D) Ninguna de las anteriores"];
  let oy = fy3 - 24;
  for (const opt of opts) {
    p3.drawRectangle({ x: frame3.innerX + 10, y: oy - 6, width: frame3.innerW - 24, height: 10, color: BLANCO, borderColor: rgb(0.88, 0.9, 0.92), borderWidth: 0.5 });
    p3.drawCircle({ x: frame3.innerX + 16, y: oy - 1, size: 3, color: BLANCO, borderColor: GRIS, borderWidth: 0.5 });
    p3.drawText(opt, { x: frame3.innerX + 22, y: oy - 3, size: 5, font: f, color: GRIS });
    oy -= 11;
  }

  y -= 78;
  y = numbered(p3, 5, "Diligencie la seccion de retroalimentacion del capacitador (evaluacion de satisfaccion).", MARGIN + 6, y);
  y -= 2;
  y = numbered(p3, 6, "Registre su firma digital dibujando en el espacio habilitado (compatible con mouse y pantalla tactil).", MARGIN + 6, y);
  y -= 2;
  y = numbered(p3, 7, "Haga clic en \"Enviar evaluacion\". El sistema mostrara su calificacion de inmediato.", MARGIN + 6, y);
  y -= 2;
  y = numbered(p3, 8, "Si aprueba (nota >= 3.0/5.0), podra descargar su certificado de aprobacion en PDF.", MARGIN + 6, y);

  // Mockup resultado
  y -= 10;
  const frame4 = drawScreenFrame(p3, MARGIN + 30, y, CONTENT_W - 60, 65, "Pantalla de resultado");
  p3.drawText("4.2", { x: frame4.innerX + 20, y: frame4.innerY - 28, size: 22, font: fb, color: VERDE });
  p3.drawText("/ 5.0", { x: frame4.innerX + 52, y: frame4.innerY - 22, size: 8, font: f, color: GRIS });
  p3.drawRectangle({ x: frame4.innerX + 90, y: frame4.innerY - 28, width: 55, height: 14, color: VERDE_CLARO, borderColor: VERDE, borderWidth: 0.5 });
  p3.drawText("Aprobado", { x: frame4.innerX + 98, y: frame4.innerY - 23, size: 7, font: fb, color: VERDE_OSC });
  mockBtn(p3, frame4.innerX + 160, frame4.innerY - 28, "Descargar certificado", VERDE);

  y -= 72;
  y = infoBox(p3, "Importante: La nota minima de aprobacion es 3.0 sobre 5.0. Si no aprueba, podra presentar la evaluacion nuevamente. El certificado incluye nombre, cedula, capacitacion, fecha y firmas institucionales.", y);

  drawFooter(p3, 3);

  // ════════════════════════════════════════════
  // PAGE 4 — ASISTENCIA
  // ════════════════════════════════════════════
  const p4 = doc.addPage(PageSizes.Letter);
  drawHeader(p4);
  y = H - 100;
  y = section(p4, "4. Registro de asistencia - Paso a paso", y);
  y = drawW(p4, "El modulo de asistencia permite registrar la participacion de los colaboradores en las capacitaciones, independientemente de si presentan evaluacion. Es fundamental para la trazabilidad del plan de capacitacion.", MARGIN, y, f, 10, GRIS, CONTENT_W);
  y -= 6;
  y = numbered(p4, 1, "Ingrese al enlace de registro de asistencia, o desde el portal principal haga clic en \"Registrar asistencia\".", MARGIN + 6, y);
  y -= 2;
  y = numbered(p4, 2, "Complete sus datos personales: nombre, apellido, cedula, cargo, departamento, proyecto y correo.", MARGIN + 6, y);
  y -= 2;
  y = numbered(p4, 3, "Seleccione la capacitacion del menu desplegable. Si no aparece, seleccione \"Otro\" y escriba el nombre.", MARGIN + 6, y);
  y -= 2;
  y = numbered(p4, 4, "Registre su firma digital en el espacio habilitado.", MARGIN + 6, y);
  y -= 2;
  y = numbered(p4, 5, "Haga clic en \"Registrar asistencia\" para enviar.", MARGIN + 6, y);

  // Mockup formulario asistencia
  y -= 10;
  const frame5 = drawScreenFrame(p4, MARGIN + 20, y, CONTENT_W - 40, 150, "evaluacion-hse-.../asistencia");
  let fy5 = frame5.innerY;
  fy5 = mockTopbar(p4, frame5.innerX, fy5, frame5.innerW);
  p4.drawText("Registro de asistencia", { x: frame5.innerX + 10, y: fy5 - 12, size: 7, font: fb, color: AZUL });
  fy5 -= 18;
  p4.drawRectangle({ x: frame5.innerX + 6, y: fy5 - 70, width: frame5.innerW - 12, height: 70, color: BLANCO, borderColor: rgb(0.88, 0.9, 0.92), borderWidth: 0.5 });
  p4.drawText("Datos personales", { x: frame5.innerX + 12, y: fy5 - 10, size: 6, font: fb, color: AZUL });
  const fw = (frame5.innerW - 36) / 2;
  mockInput(p4, frame5.innerX + 12, fy5 - 18, fw, "Nombre");
  mockInput(p4, frame5.innerX + fw + 20, fy5 - 18, fw, "Apellido");
  mockInput(p4, frame5.innerX + 12, fy5 - 36, fw, "Cedula");
  mockInput(p4, frame5.innerX + fw + 20, fy5 - 36, fw, "Cargo");
  mockInput(p4, frame5.innerX + 12, fy5 - 54, fw, "Departamento");
  mockInput(p4, frame5.innerX + fw + 20, fy5 - 54, fw, "Proyecto");
  fy5 -= 78;
  p4.drawRectangle({ x: frame5.innerX + 6, y: fy5 - 28, width: frame5.innerW - 12, height: 28, color: BLANCO, borderColor: rgb(0.88, 0.9, 0.92), borderWidth: 0.5 });
  p4.drawText("Capacitacion", { x: frame5.innerX + 12, y: fy5 - 10, size: 6, font: fb, color: AZUL });
  p4.drawRectangle({ x: frame5.innerX + 12, y: fy5 - 24, width: frame5.innerW - 24, height: 10, color: BLANCO, borderColor: rgb(0.85, 0.88, 0.92), borderWidth: 0.5 });
  p4.drawText("Selecciona una capacitacion", { x: frame5.innerX + 16, y: fy5 - 21, size: 4.5, font: f, color: rgb(0.6, 0.65, 0.7) });

  y -= 160;
  y = infoBox(p4, "El registro incluye firma digital del participante y queda almacenado para consulta desde el panel administrativo. La opcion \"Otro\" permite registrar asistencia a capacitaciones no configuradas.", y);

  // ── PANEL ADMIN ──
  y -= 12;
  y = section(p4, "5. Panel administrativo - Gestion y control", y);
  y = drawW(p4, "El panel de administracion es el centro de control del sistema. Cuenta con 4 modulos accesibles desde la navegacion superior:", MARGIN, y, f, 10, GRIS, CONTENT_W);

  // Mockup de navegación admin
  y -= 8;
  const frame6 = drawScreenFrame(p4, MARGIN + 20, y, CONTENT_W - 40, 40, "Panel de administracion");
  mockNavTab(p4, frame6.innerX + 6, frame6.innerY - 4, ["Resultados", "Evaluaciones", "Dashboard", "Asistencia"], 0);

  y -= 52;

  const mods = [
    { t: "Resultados", d: "Consulte resultados de evaluaciones con filtros por evaluacion, estado, departamento. Vea detalles, descargue certificados, exporte a Excel y gestione la papelera." },
    { t: "Evaluaciones", d: "Cree y gestione evaluaciones con preguntas de seleccion multiple. Active/desactive evaluaciones y copie enlaces para compartir." },
    { t: "Dashboard", d: "Visualice graficos de barras: resultados por capacitacion, evaluaciones por departamento, horas de capacitacion y asistencia." },
    { t: "Asistencia", d: "Consulte registros de asistencia con filtros, tarjetones resumen por capacitacion, y gestion de papelera." },
  ];
  for (const m of mods) {
    const lines = wrap(m.d, f, 9, CONTENT_W - 24);
    const bh = lines.length * 12 + 22;
    p4.drawRectangle({ x: MARGIN, y: y - bh + 10, width: CONTENT_W, height: bh, color: BLANCO, borderColor: VERDE, borderWidth: 1 });
    p4.drawRectangle({ x: MARGIN, y: y + 10 - 18, width: CONTENT_W, height: 18, color: VERDE });
    p4.drawText(m.t, { x: MARGIN + 8, y: y - 2, size: 9, font: fb, color: BLANCO });
    let ty = y - 16;
    for (const line of lines) { p4.drawText(line, { x: MARGIN + 8, y: ty, size: 9, font: f, color: GRIS }); ty -= 12; }
    y = y - bh - 5;
  }

  drawFooter(p4, 4);

  // ════════════════════════════════════════════
  // PAGE 5 — DASHBOARD + RESULTADOS MOCKUP
  // ════════════════════════════════════════════
  const p5 = doc.addPage(PageSizes.Letter);
  drawHeader(p5);
  y = H - 100;
  y = section(p5, "5.1 Modulo de resultados", y);
  y = drawW(p5, "El modulo de resultados muestra todas las evaluaciones presentadas con tarjetones de resumen que se actualizan en tiempo real:", MARGIN, y, f, 10, GRIS, CONTENT_W);
  y -= 8;

  // Mockup resultados
  const frame7 = drawScreenFrame(p5, MARGIN + 10, y, CONTENT_W - 20, 145, "Panel > Resultados");
  let fy7 = frame7.innerY;
  fy7 = mockNavTab(p5, frame7.innerX + 4, fy7, ["Resultados", "Evaluaciones", "Dashboard", "Asistencia"], 0);
  fy7 -= 4;
  const sw = (frame7.innerW - 30) / 4;
  mockStatCard(p5, frame7.innerX + 4, fy7, sw, "15", "Evaluaciones");
  mockStatCard(p5, frame7.innerX + sw + 8, fy7, sw, "12", "Aprobados");
  mockStatCard(p5, frame7.innerX + sw * 2 + 12, fy7, sw, "3", "Reprobados");
  mockStatCard(p5, frame7.innerX + sw * 3 + 16, fy7, sw, "80%", "Tasa aprobacion");
  fy7 -= 38;
  fy7 = mockTableHeader(p5, frame7.innerX + 4, fy7, ["Fecha", "Nombre", "Cedula", "Evaluacion", "Nota", "Estado", "Ver", "Certificado", "Eliminar"], (frame7.innerW - 10) / 9);
  const cw = (frame7.innerW - 10) / 9;
  fy7 = mockTableRow(p5, frame7.innerX + 4, fy7, ["08/07/26", "Maria Gomez", "10235647", "Induccion HSEQ", "4.2", "Aprobado", "[Ver]", "[PDF]", "[X]"], cw, false);
  fy7 = mockTableRow(p5, frame7.innerX + 4, fy7, ["07/07/26", "Juan Perez", "98765432", "Hab. Saludables", "3.8", "Aprobado", "[Ver]", "[PDF]", "[X]"], cw, true);
  fy7 = mockTableRow(p5, frame7.innerX + 4, fy7, ["06/07/26", "Ana Lopez", "55667788", "Induccion HSEQ", "2.5", "Reprobado", "[Ver]", "--", "[X]"], cw, false);
  fy7 -= 4;
  mockBtn(p5, frame7.innerX + 4, fy7, "Exportar a Excel (CSV)", VERDE);
  mockBtn(p5, frame7.innerX + 100, fy7, "Papelera", rgb(0.85, 0.88, 0.92));

  y -= 155;
  y -= 8;
  y = section(p5, "6. Dashboard - Indicadores y estadisticas", y);
  y = drawW(p5, "El Dashboard ofrece una vista consolidada con tarjetones KPI y graficos de barras:", MARGIN, y, f, 10, GRIS, CONTENT_W);
  y -= 6;
  y = subtitle(p5, "Tarjetones de resumen (KPIs)", y);
  y = bullet(p5, "Total de personas capacitadas", MARGIN + 6, y);
  y = bullet(p5, "Horas de capacitacion acumuladas", MARGIN + 6, y);
  y = bullet(p5, "Cantidad de aprobados", MARGIN + 6, y);
  y = bullet(p5, "Total de registros de asistencia", MARGIN + 6, y);
  y -= 6;
  y = subtitle(p5, "Graficos disponibles", y);
  y = bullet(p5, "Personas por capacitacion: aprobados y reprobados por cada evaluacion.", MARGIN + 6, y);
  y = bullet(p5, "Personas por departamento: distribucion de participaciones por area.", MARGIN + 6, y);
  y = bullet(p5, "Horas por departamento: calculo estimado de horas invertidas.", MARGIN + 6, y);
  y = bullet(p5, "Asistencia por capacitacion: asistentes registrados por evento.", MARGIN + 6, y);

  // Mockup dashboard
  y -= 8;
  const frame8 = drawScreenFrame(p5, MARGIN + 10, y, CONTENT_W - 20, 95, "Panel > Dashboard");
  let fy8 = frame8.innerY;
  fy8 = mockNavTab(p5, frame8.innerX + 4, fy8, ["Resultados", "Evaluaciones", "Dashboard", "Asistencia"], 2);
  fy8 -= 4;
  mockStatCard(p5, frame8.innerX + 4, fy8, sw, "15", "Personas");
  mockStatCard(p5, frame8.innerX + sw + 8, fy8, sw, "8h", "Horas cap.");
  mockStatCard(p5, frame8.innerX + sw * 2 + 12, fy8, sw, "12", "Aprobados");
  mockStatCard(p5, frame8.innerX + sw * 3 + 16, fy8, sw, "20", "Asistencias");
  fy8 -= 36;
  // Mini bar charts
  const chartW = (frame8.innerW - 16) / 2;
  p5.drawRectangle({ x: frame8.innerX + 4, y: fy8 - 22, width: chartW, height: 22, color: BLANCO, borderColor: rgb(0.88, 0.9, 0.92), borderWidth: 0.5 });
  p5.drawText("Personas por capacitacion", { x: frame8.innerX + 8, y: fy8 - 8, size: 5, font: fb, color: AZUL });
  // Bars
  p5.drawRectangle({ x: frame8.innerX + 10, y: fy8 - 20, width: 30, height: 8, color: VERDE });
  p5.drawRectangle({ x: frame8.innerX + 45, y: fy8 - 20, width: 20, height: 8, color: rgb(0.86, 0.16, 0.16) });
  p5.drawRectangle({ x: frame8.innerX + 75, y: fy8 - 20, width: 25, height: 8, color: VERDE });

  p5.drawRectangle({ x: frame8.innerX + chartW + 10, y: fy8 - 22, width: chartW, height: 22, color: BLANCO, borderColor: rgb(0.88, 0.9, 0.92), borderWidth: 0.5 });
  p5.drawText("Personas por departamento", { x: frame8.innerX + chartW + 14, y: fy8 - 8, size: 5, font: fb, color: AZUL });
  p5.drawRectangle({ x: frame8.innerX + chartW + 16, y: fy8 - 20, width: 35, height: 8, color: VERDE });
  p5.drawRectangle({ x: frame8.innerX + chartW + 56, y: fy8 - 20, width: 20, height: 8, color: VERDE_OSC });

  y -= 103;
  y = infoBox(p5, "Los datos del dashboard se actualizan en tiempo real. Al eliminar registros (papelera), las estadisticas se recalculan automaticamente.", y);

  drawFooter(p5, 5);

  // ════════════════════════════════════════════
  // PAGE 6 — EVALUACIONES ACTIVAS + FUNCIONALIDADES
  // ════════════════════════════════════════════
  const p6 = doc.addPage(PageSizes.Letter);
  drawHeader(p6);
  y = H - 100;
  y = section(p6, "7. Evaluaciones activas actualmente", y);
  y = drawW(p6, "Actualmente se encuentran creadas y activas las siguientes evaluaciones:", MARGIN, y, f, 10, GRIS, CONTENT_W);
  y -= 6;

  // Eval 1
  p6.drawRectangle({ x: MARGIN, y: y - 58, width: CONTENT_W, height: 62, color: BLANCO, borderColor: VERDE, borderWidth: 1.5 });
  p6.drawText("Evaluacion -- Induccion y Reinduccion HSEQ", { x: MARGIN + 10, y: y - 2, size: 11, font: fb, color: AZUL });
  y = drawW(p6, "Evaluacion de la induccion y reinduccion en Seguridad, Salud en el Trabajo, Ambiente y Calidad (HSEQ) de Renergeia. Contiene 20 preguntas de seleccion multiple. Nota minima de aprobacion: 3.0 / 5.0.", MARGIN + 10, y - 18, f, 9.5, GRIS, CONTENT_W - 20, 13);
  y -= 12;

  p6.drawRectangle({ x: MARGIN, y: y - 48, width: CONTENT_W, height: 52, color: BLANCO, borderColor: VERDE, borderWidth: 1.5 });
  p6.drawText("Evaluacion -- Habitos y estilos de vida saludables", { x: MARGIN + 10, y: y - 2, size: 11, font: fb, color: AZUL });
  y = drawW(p6, "Evaluacion de la capacitacion en habitos y estilos de vida saludables (SG-SST). Contiene 6 preguntas de seleccion multiple. Nota minima de aprobacion: 3.0 / 5.0.", MARGIN + 10, y - 18, f, 9.5, GRIS, CONTENT_W - 20, 13);
  y -= 12;
  y = infoBox(p6, "Se pueden crear nuevas evaluaciones en cualquier momento desde el panel administrativo, segun las necesidades del plan de capacitacion anual.", y);

  y -= 12;
  y = section(p6, "8. Funcionalidades adicionales", y);

  y = subtitle(p6, "Papelera (eliminacion segura)", y);
  y = drawW(p6, "Los registros eliminados se mueven a una papelera. Desde alli se pueden restaurar o eliminar permanentemente. Las estadisticas se actualizan automaticamente.", MARGIN, y, f, 9.5, GRIS, CONTENT_W, 14);
  y -= 4;
  y = subtitle(p6, "Certificados de aprobacion", y);
  y = drawW(p6, "Certificado PDF automatico con nombre, cedula, capacitacion, fecha y firmas. Descargable por el participante y el administrador.", MARGIN, y, f, 9.5, GRIS, CONTENT_W, 14);
  y -= 4;
  y = subtitle(p6, "Exportacion de datos", y);
  y = drawW(p6, "Exportacion a CSV (Excel) desde el modulo de resultados para analisis, informes y auditorias.", MARGIN, y, f, 9.5, GRIS, CONTENT_W, 14);
  y -= 4;
  y = subtitle(p6, "Compartir enlaces", y);
  y = drawW(p6, "Copie enlaces de evaluaciones y asistencia desde el panel para compartir por correo, WhatsApp u otros medios.", MARGIN, y, f, 9.5, GRIS, CONTENT_W, 14);

  drawFooter(p6, 6);

  // ════════════════════════════════════════════
  // PAGE 7 — AUTORIZACIÓN
  // ════════════════════════════════════════════
  const p7 = doc.addPage(PageSizes.Letter);
  drawHeader(p7);
  y = H - 100;
  y = section(p7, "9. Autorizacion de uso", y);

  y = drawW(p7, "Por medio del presente documento se informa y autoriza el uso del Sistema de Evaluaciones HSE de Renergeia como herramienta oficial para la gestion de capacitaciones, evaluaciones de conocimiento y registro de asistencia en el marco del Sistema de Gestion de Seguridad, Salud en el Trabajo y Ambiente (SG-SST/HSEQ).", MARGIN, y, f, 10.5, GRIS, CONTENT_W, 16);
  y -= 6;
  y = drawW(p7, "Esta plataforma sera utilizada en todas las futuras capacitaciones programadas dentro del plan anual de capacitacion, garantizando la trazabilidad, el registro digital y la medicion de la eficacia de las actividades formativas.", MARGIN, y, f, 10.5, GRIS, CONTENT_W, 16);

  y -= 14;
  // Auth box
  const abh = 95;
  p7.drawRectangle({ x: MARGIN, y: y - abh + 10, width: CONTENT_W, height: abh, color: AZUL_CLARO_BG, borderColor: AZUL, borderWidth: 1.5 });
  p7.drawText("Se autoriza el uso de esta plataforma para:", { x: MARGIN + 14, y: y - 4, size: 10, font: fb, color: AZUL });
  let ya = y - 22;
  const authItems = [
    "Evaluaciones de conocimiento en capacitaciones HSE/SST/HSEQ.",
    "Registro de asistencia a capacitaciones programadas.",
    "Generacion de certificados de aprobacion.",
    "Consulta de resultados, estadisticas e indicadores de gestion.",
  ];
  for (const item of authItems) {
    p7.drawCircle({ x: MARGIN + 22, y: ya + 3, size: 3, color: VERDE });
    p7.drawText(item, { x: MARGIN + 30, y: ya, size: 10, font: f, color: AZUL });
    ya -= 16;
  }

  y = y - abh - 30;

  // Firmas
  p7.drawRectangle({ x: MARGIN, y: y, width: 200, height: 1, color: AZUL });
  p7.drawText("Elaborado por:", { x: MARGIN, y: y - 14, size: 9, font: fb, color: AZUL });
  p7.drawText("Area HSE / SST", { x: MARGIN, y: y - 28, size: 9, font: f, color: GRIS });
  p7.drawText("Renergeia S.A.S.", { x: MARGIN, y: y - 42, size: 9, font: f, color: GRIS });

  p7.drawRectangle({ x: MARGIN + 280, y: y, width: 200, height: 1, color: AZUL });
  p7.drawText("Autorizado por:", { x: MARGIN + 280, y: y - 14, size: 9, font: fb, color: AZUL });
  p7.drawText("___________________________", { x: MARGIN + 280, y: y - 28, size: 9, font: f, color: GRIS });
  p7.drawText("Firma y cargo", { x: MARGIN + 280, y: y - 42, size: 9, font: f, color: GRIS });

  if (leonImg) {
    const s = 120 / leonImg.height;
    p7.drawImage(leonImg, { x: (W - leonImg.width * s) / 2, y: y - 180, width: leonImg.width * s, height: 120, opacity: 0.1 });
  }

  drawFooter(p7, 7);

  // ── Save ──
  const pdfBytes = await doc.save();
  fs.writeFileSync("Guia_Uso_Sistema_Evaluaciones_HSE_Renergeia.pdf", pdfBytes);
  console.log(`PDF generado: ${(pdfBytes.length / 1024).toFixed(0)} KB, ${doc.getPageCount()} paginas`);
}

main().catch(console.error);
