import type { Evaluacion, PreguntaFeedback } from "./types";

/** Preguntas de retroalimentación estándar del formato FO-SG-SS-100-1. */
export const FEEDBACK_ESTANDAR: PreguntaFeedback[] = [
  {
    id: "fb1",
    enunciado: "¿El nivel del manejo del tema del capacitador fue?",
    escala: "cualitativa",
  },
  {
    id: "fb2",
    enunciado: "¿La metodología ayudó con la comprensión del tema?",
    escala: "cualitativa",
  },
  {
    id: "fb3",
    enunciado: "¿Dio atención y respuesta a sus dudas y preguntas?",
    escala: "cualitativa",
  },
  {
    id: "fb4",
    enunciado: "¿Cómo califica al capacitador? (5 muy bueno, 1 muy malo)",
    escala: "numerica",
  },
  {
    id: "fb5",
    enunciado:
      "Califique las condiciones de espacio, confort y temperatura del sitio de capacitación.",
    escala: "numerica",
  },
];

/** Evaluación: Inducción y Reinducción HSEQ (FO-SG-SS-024-1). */
export const EVALUACION_INDUCCION_HSEQ: Evaluacion = {
  id: "induccion-reinduccion-hseq",
  titulo: "Evaluación — Inducción y Reinducción HSEQ",
  tema: "Inducción y Reinducción HSEQ",
  descripcion:
    "Evaluación de la inducción y reinducción en Seguridad, Salud en el Trabajo, Ambiente y Calidad (HSEQ) de Renergeia.",
  activa: true,
  creadaEn: new Date().toISOString(),
  actualizadaEn: new Date().toISOString(),
  feedback: FEEDBACK_ESTANDAR,
  preguntas: [
    {
      id: "ind1",
      enunciado: "¿Cuáles son los reglamentos de Renergeia?",
      opciones: [
        { id: "a", texto: "Reglamento de industrial." },
        { id: "b", texto: "Reglamento interno de trabajo y reglamento de higiene y seguridad Industrial." },
        { id: "c", texto: "Reglamento administrativo y operativo." },
        { id: "d", texto: "Ninguna de las anteriores." },
      ],
      correcta: "b",
    },
    {
      id: "ind2",
      enunciado:
        "\"Apoyar la generación de energías renovables modernas, confiables y asequibles, entregando proyectos de alta calidad, ejecutados de manera oportuna y rentable a nuestros clientes en todo el mundo.\" ¿Esta frase corresponde a la MISIÓN o a la VISIÓN de Renergeia?",
      opciones: [
        { id: "a", texto: "Misión." },
        { id: "b", texto: "Visión." },
      ],
      correcta: "a",
    },
    {
      id: "ind3",
      enunciado:
        "\"Ser actores de cambio e innovación en cada paso del camino hacia una transición energética renovable a nivel mundial.\" ¿Esta frase corresponde a la MISIÓN o a la VISIÓN de Renergeia?",
      opciones: [
        { id: "a", texto: "Misión." },
        { id: "b", texto: "Visión." },
      ],
      correcta: "b",
    },
    {
      id: "ind4",
      enunciado: "¿Qué es seguridad y salud en el trabajo?",
      opciones: [
        { id: "a", texto: "Bienestar de las personas." },
        { id: "b", texto: "Conjunto de normas encaminadas a riesgos sociales." },
        { id: "c", texto: "Conjunto de actividades dedicadas controlar accidentes de tránsito." },
        { id: "d", texto: "Disciplina que trata de la prevención de las lesiones y enfermedades causadas por las condiciones de trabajo, y de la protección y promoción de la salud de los trabajadores." },
      ],
      correcta: "d",
    },
    {
      id: "ind5",
      enunciado:
        "Relacione: ¿A quién le corresponde la responsabilidad de \"Gestionar los peligros, prevención y promoción de SST\"?",
      opciones: [
        { id: "a", texto: "Empleador." },
        { id: "b", texto: "ARL." },
        { id: "c", texto: "Trabajador." },
      ],
      correcta: "a",
    },
    {
      id: "ind6",
      enunciado:
        "Relacione: ¿A quién le corresponde \"Asesorar y dar seguimiento a la implementación del SG-SST de la empresa\"?",
      opciones: [
        { id: "a", texto: "Empleador." },
        { id: "b", texto: "ARL." },
        { id: "c", texto: "Trabajador." },
      ],
      correcta: "b",
    },
    {
      id: "ind7",
      enunciado:
        "Relacione: ¿A quién le corresponde \"Cuidar su salud, informar peligro y participar en las formaciones de SST\"?",
      opciones: [
        { id: "a", texto: "Empleador." },
        { id: "b", texto: "ARL." },
        { id: "c", texto: "Trabajador." },
      ],
      correcta: "c",
    },
    {
      id: "ind8",
      enunciado:
        "La política de Seguridad y Salud en Trabajo de Renergeia contempla:",
      opciones: [
        { id: "a", texto: "Grupo Renergeia se compromete con la protección y promoción de la salud y seguridad de todos sus colaboradores, contratistas y partes interesadas. Integra la seguridad y salud en cada aspecto de sus operaciones, centrada en la prevención de riesgos, el mejoramiento continuo y la promoción de un entorno de trabajo seguro y saludable." },
        { id: "b", texto: "Garantizar un ambiente de trabajo seguro y saludable para colaboradores, contratistas y todas las partes interesadas, minimizando incidentes mediante la participación, capacitación continua y cumplimiento normativo. Promover el bienestar físico y mental, integrando la seguridad en todas las etapas de los procesos, con un enfoque preventivo, proactivo y basado en la mejora continua." },
        { id: "c", texto: "Proporcionar un entorno de trabajo seguro y saludable para todos sus colaboradores, contratistas y visitantes. Enfocada en la prevención de lesiones y enfermedades relacionadas con el trabajo, la mejora continua de las condiciones de trabajo y el cumplimiento de todas las leyes y regulaciones aplicables en materia de seguridad y salud en el trabajo." },
        { id: "d", texto: "Todas las anteriores." },
      ],
      correcta: "d",
    },
    {
      id: "ind9",
      enunciado:
        "Relacione la definición: \"Fuente, situación o acto con potencial de daño en términos de enfermedad o lesión a las personas, o una combinación de estos.\" Corresponde a:",
      opciones: [
        { id: "a", texto: "Peligro." },
        { id: "b", texto: "Riesgo." },
      ],
      correcta: "a",
    },
    {
      id: "ind10",
      enunciado:
        "Relacione la definición: \"Combinación de la probabilidad de que ocurra un(os) evento(s) o exposición(es) peligroso(s), y la severidad de la lesión o enfermedad que puede ser causada por el(los) evento(s) o exposición(es).\" Corresponde a:",
      opciones: [
        { id: "a", texto: "Peligro." },
        { id: "b", texto: "Riesgo." },
      ],
      correcta: "b",
    },
    {
      id: "ind11",
      enunciado:
        "\"Es todo suceso repentino que sobrevenga por causa o con ocasión del trabajo, y que produzca en el trabajador una lesión orgánica, una perturbación funcional o psiquiátrica, una invalidez o la muerte.\" Esta definición corresponde a:",
      opciones: [
        { id: "a", texto: "Accidente Laboral." },
        { id: "b", texto: "Enfermedad Laboral." },
        { id: "c", texto: "Casi Accidente." },
      ],
      correcta: "a",
    },
    {
      id: "ind12",
      enunciado:
        "\"La contraída como resultado de la exposición a factores de riesgo inherentes a la actividad laboral o del medio en el que el trabajador se ha visto obligado a trabajar.\" Esta definición corresponde a:",
      opciones: [
        { id: "a", texto: "Accidente Laboral." },
        { id: "b", texto: "Enfermedad Laboral." },
        { id: "c", texto: "Casi Accidente." },
      ],
      correcta: "b",
    },
    {
      id: "ind13",
      enunciado:
        "\"Es el suceso en el que no hay como resultado una lesión o perdida material.\" Esta definición corresponde a:",
      opciones: [
        { id: "a", texto: "Accidente Laboral." },
        { id: "b", texto: "Enfermedad Laboral." },
        { id: "c", texto: "Casi Accidente." },
      ],
      correcta: "c",
    },
    {
      id: "ind14",
      enunciado:
        "Ordene (1 a 4) la forma correcta del procedimiento en caso de accidente:",
      opciones: [
        { id: "a", texto: "1) Reportar al responsable SST/jefe inmediato → 2) Prestar primeros auxilios y evaluar el evento → 3) Reporte a ARL antes de 48 horas → 4) Investigación del evento." },
        { id: "b", texto: "1) Prestar primeros auxilios y evaluar el evento → 2) Reportar al responsable SST/jefe inmediato → 3) Reporte a ARL antes de 48 horas → 4) Investigación del evento." },
        { id: "c", texto: "1) Reporte a ARL antes de 48 horas → 2) Investigación del evento → 3) Prestar primeros auxilios → 4) Reportar al responsable SST." },
        { id: "d", texto: "1) Investigación del evento → 2) Prestar primeros auxilios → 3) Reportar al responsable SST → 4) Reporte a ARL." },
      ],
      correcta: "b",
    },
    {
      id: "ind15",
      enunciado:
        "Son actividades propias de seguridad y salud en el trabajo, donde el trabajador participa:",
      opciones: [
        { id: "a", texto: "En las charlas de seguridad y capacitaciones." },
        { id: "b", texto: "Realizar los análisis seguros de trabajo (ATS) – Identificación de peligros y controles." },
        { id: "c", texto: "Gestionar los permisos de trabajo para las actividades de alto riesgo." },
        { id: "d", texto: "Uso correcto de EPP." },
        { id: "e", texto: "Inspección de área, equipo y herramienta." },
        { id: "f", texto: "Todas las anteriores." },
      ],
      correcta: "f",
    },
    {
      id: "ind16",
      enunciado:
        "Todas las sustancias químicas deben estar rotulados de acuerdo con el:",
      opciones: [
        { id: "a", texto: "Sistema globalmente armonizado." },
        { id: "b", texto: "Sistemas integrados." },
        { id: "c", texto: "Sistema de rombo de oxigeno." },
        { id: "d", texto: "Ninguna de las anteriores." },
      ],
      correcta: "a",
    },
    {
      id: "ind17",
      enunciado: "¿Qué es el COPASST?",
      opciones: [
        { id: "a", texto: "Es el Comité Paritario de seguridad y salud en el trabajo." },
        { id: "b", texto: "Es un organismo de promoción y vigilancia de las normas y reglamentos de Seguridad y Salud en el trabajo dentro de la empresa." },
        { id: "c", texto: "Es un organismo que procura generar espacios de promoción de salud, higiene y seguridad industrial al interior de la empresa, colabora activamente en el desarrollo de programas de prevención y capacitación en riesgos profesionales, adicionalmente es un veedor del cumplimiento de las políticas de protección que debe impulsar la organización." },
        { id: "d", texto: "Todas las anteriores." },
      ],
      correcta: "d",
    },
    {
      id: "ind18",
      enunciado: "¿Cuál es el objeto del Comité de Convivencia Laboral?",
      opciones: [
        { id: "a", texto: "El Comité de Convivencia Laboral tiene por objeto prevenir las conductas de acoso laboral y atenderlas en caso de presentarse." },
        { id: "b", texto: "Atender los problemas de pareja y violencia intrafamiliar." },
        { id: "c", texto: "Realizar seguimiento a las actividades de seguridad en el trabajo cuando el equipo administrativo lo requiera." },
        { id: "d", texto: "Ninguna de las anteriores." },
      ],
      correcta: "a",
    },
    {
      id: "ind19",
      enunciado:
        "Señale los elementos que identifican un plan de emergencias:",
      opciones: [
        { id: "a", texto: "Rutas de evacuación y punto de encuentro." },
        { id: "b", texto: "Equipos de emergencia." },
        { id: "c", texto: "Procedimientos de emergencia." },
        { id: "d", texto: "Brigadas de emergencias." },
        { id: "e", texto: "Preparar al Personal (antes, durante y después de la emergencia)." },
        { id: "f", texto: "Uso de elementos de protección personal." },
        { id: "g", texto: "Todas las anteriores." },
      ],
      correcta: "g",
    },
    {
      id: "ind20",
      enunciado:
        "Relacione: \"Cualquier cambio en el medio ambiente, sea adverso o beneficioso, como resultado total o parcial de los aspectos ambientales.\" Corresponde a:",
      opciones: [
        { id: "a", texto: "Impacto ambiental." },
        { id: "b", texto: "Aspecto ambiental." },
      ],
      correcta: "a",
    },
    {
      id: "ind21",
      enunciado:
        "Relacione: \"Elemento de las actividades, productos o servicios de una organización que puede interactuar con el medio ambiente.\" Corresponde a:",
      opciones: [
        { id: "a", texto: "Impacto ambiental." },
        { id: "b", texto: "Aspecto ambiental." },
      ],
      correcta: "b",
    },
    {
      id: "ind22",
      enunciado: "¿Qué es calidad?",
      opciones: [
        { id: "a", texto: "Calidad es el conjunto de propiedades y características de un producto o servicio que le confieren capacidad de satisfacer necesidades, gustos y preferencias, y de cumplir con expectativas del cliente." },
        { id: "b", texto: "Busca satisfacer las necesidades propias de las personas al interior de las empresas." },
        { id: "c", texto: "Calcula los métodos de identificación de amenazas en las organizaciones." },
        { id: "d", texto: "Ninguna de las anteriores." },
      ],
      correcta: "a",
    },
    {
      id: "ind23",
      enunciado:
        "Una No Conformidad es un incumplimiento de un requisito de la norma, incumplimiento de un requisito legal o de cualquier requisito especificado en los procedimientos de nuestro sistema de gestión de la calidad referente a los productos o servicios que suministra nuestra organización. ¿Verdadero o Falso?",
      opciones: [
        { id: "a", texto: "Verdadero." },
        { id: "b", texto: "Falso." },
      ],
      correcta: "a",
    },
  ],
};

/** Evaluación inicial: Hábitos y estilos de vida saludables. */
export const EVALUACION_HABITOS_SALUDABLES: Evaluacion = {
  id: "habitos-vida-saludable",
  titulo: "Evaluación — Hábitos y estilos de vida saludables",
  tema: "Hábitos y estilos de vida saludables",
  descripcion:
    "Evaluación de la capacitación en hábitos y estilos de vida saludables (SG-SST).",
  activa: true,
  creadaEn: new Date().toISOString(),
  actualizadaEn: new Date().toISOString(),
  feedback: FEEDBACK_ESTANDAR,
  preguntas: [
    {
      id: "p1",
      enunciado:
        "¿Cuál de las siguientes acciones contribuye de manera más efectiva a la prevención de enfermedades cardiovasculares?",
      opciones: [
        { id: "a", texto: "Consumir bebidas energizantes para mantener la actividad diaria." },
        { id: "b", texto: "Realizar actividad física regularmente, mantener una alimentación saludable y controlar la presión arterial." },
      ],
      correcta: "b",
    },
    {
      id: "p2",
      enunciado:
        "¿Cuál es uno de los principales beneficios de mantener una adecuada higiene del sueño?",
      opciones: [
        { id: "a", texto: "Incrementar el consumo de alimentos durante la noche." },
        { id: "b", texto: "Mejorar la recuperación física y mental, favoreciendo el rendimiento laboral." },
      ],
      correcta: "b",
    },
    {
      id: "p3",
      enunciado:
        "¿Cuál de los siguientes alimentos aporta vitaminas, minerales y antioxidantes que favorecen la salud?",
      opciones: [
        { id: "a", texto: "Frutas y verduras frescas." },
        { id: "b", texto: "Bebidas azucaradas y productos ultraprocesados." },
      ],
      correcta: "a",
    },
    {
      id: "p4",
      enunciado:
        "Durante la jornada laboral, ¿las pausas activas tienen como objetivo principal?",
      opciones: [
        { id: "a", texto: "Aumentar el tiempo de descanso sin movimiento." },
        { id: "b", texto: "Reducir la fatiga, mejorar la circulación y disminuir el riesgo de lesiones musculoesqueléticas." },
      ],
      correcta: "b",
    },
    {
      id: "p5",
      enunciado: "¿Qué se considera un hábito saludable para prevenir el sedentarismo?",
      opciones: [
        { id: "a", texto: "Permanecer sentado durante toda la jornada laboral." },
        { id: "b", texto: "Levantarse y moverse al menos cada hora, realizando caminatas cortas o estiramientos." },
      ],
      correcta: "b",
    },
    {
      id: "p6",
      enunciado:
        "¿Cuál es la recomendación general para mantener una buena salud mediante la actividad física?",
      opciones: [
        { id: "a", texto: "Realizar actividad física solo los fines de semana." },
        { id: "b", texto: "Realizar al menos 150 minutos de actividad física moderada a la semana, complementada con ejercicios de fortalecimiento muscular." },
      ],
      correcta: "b",
    },
  ],
};
