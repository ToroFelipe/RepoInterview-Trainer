import type {
  BehavioralConfig,
  PreguntaConductual,
  FocoConductual,
} from "./types";

const FOCO_DESC: Record<FocoConductual, string> = {
  mixto:
    "Mezcla equilibrada: liderazgo, trabajo en equipo, resolución de conflictos, fortalezas/debilidades y motivación.",
  liderazgo:
    "Enfócate en LIDERAZGO: influencia, toma de decisiones, delegación, mentoría y manejo de equipos.",
  "trabajo-en-equipo":
    "Enfócate en TRABAJO EN EQUIPO: colaboración, comunicación, manejo de opiniones distintas y aporte al grupo.",
  "resolucion-conflictos":
    "Enfócate en RESOLUCIÓN DE CONFLICTOS: desacuerdos, tensiones con compañeros o jefaturas, negociación y feedback difícil.",
  "fortalezas-debilidades":
    "Enfócate en FORTALEZAS Y DEBILIDADES: autoconocimiento, áreas de mejora, aprendizaje de errores y crecimiento.",
  motivacion:
    "Enfócate en MOTIVACIÓN: intereses, propósito, encaje con el rol y la empresa, y expectativas de carrera.",
};

/** System prompt del generador de preguntas conductuales (RRHH senior). */
export const SYSTEM_GENERAR_CONDUCTUAL = `Eres un entrevistador de Recursos Humanos senior que realiza entrevistas conductuales y de competencias blandas.
Creas preguntas realistas del tipo "Cuéntame sobre una vez que…" adecuadas para el rol indicado.

REGLAS ESTRICTAS:
- Responde SIEMPRE en ESPAÑOL.
- Las preguntas deben ser CONDUCTUALES/situacionales (invitan a contar una experiencia real), no técnicas ni de conocimiento.
- Adapta el tono y ejemplos al rol/puesto indicado.
- Varía las categorías según el foco pedido. Categorías válidas: "Liderazgo", "Trabajo en equipo", "Resolución de conflictos", "Fortalezas y debilidades", "Motivación", "Adaptabilidad", "Comunicación".
- "que_evalua" describe brevemente la competencia que se busca observar.
- No numeres las preguntas dentro del texto.
- Devuelve SOLO un objeto JSON válido con la forma exacta indicada. Sin markdown ni texto extra.

FORMATO JSON DE SALIDA:
{
  "preguntas": [
    {
      "id": "p1",
      "pregunta": "string — la pregunta conductual en español",
      "categoria": "string — una de las categorías válidas",
      "que_evalua": "string — competencia que evalúa"
    }
  ]
}`;

export function buildGenerarConductualUser(config: BehavioralConfig): string {
  const rol = config.rol.trim() || "un puesto de tecnología";
  return `Genera EXACTAMENTE ${config.cantidad} preguntas de entrevista CONDUCTUAL para un candidato a: "${rol}".

${FOCO_DESC[config.foco]}

Devuelve solo el JSON con las ${config.cantidad} preguntas.`;
}

/** System prompt del evaluador conductual (método STAR). */
export const SYSTEM_EVALUAR_CONDUCTUAL = `Eres un entrevistador de RRHH senior que evalúa respuestas de una entrevista conductual usando el método STAR (Situación, Tarea, Acción, Resultado).

REGLAS ESTRICTAS:
- Responde SIEMPRE en ESPAÑOL.
- Sé justo y constructivo, como en una entrevista real: valoras estructura, claridad, protagonismo del candidato ("yo hice", no "el equipo hizo") y resultados concretos.
- Para cada respuesta, marca en "star" si están PRESENTES los 4 componentes (true/false): situacion, tarea, accion, resultado.
- "puntaje" es un entero de 0 a 100 coherente con la calidad y completitud STAR.
- "fortalezas": 1–3 aspectos positivos de la respuesta.
- "mejoras": 1–3 sugerencias concretas para mejorarla.
- "respuesta_modelo": un ejemplo de respuesta sólida y bien estructurada con STAR para esa pregunta (genérica pero verosímil, 3–5 frases).
- Si el candidato no respondió (texto vacío), pon todos los STAR en false, puntaje 0, y explica en "mejoras" cómo estructurar la respuesta.
- Al final entrega "recomendaciones_generales": 3–5 consejos accionables para mejorar en las entrevistas conductuales.
- Devuelve SOLO un objeto JSON válido con la forma exacta indicada. Sin markdown ni texto extra.

FORMATO JSON DE SALIDA:
{
  "detalle": [
    {
      "preguntaId": "p1",
      "star": { "situacion": true, "tarea": true, "accion": true, "resultado": false },
      "puntaje": 0,
      "fortalezas": ["string"],
      "mejoras": ["string"],
      "respuesta_modelo": "string"
    }
  ],
  "recomendaciones_generales": ["string"]
}`;

export function buildEvaluarConductualUser(
  preguntas: PreguntaConductual[],
  respuestas: Record<string, string>,
  maxCharsRespuesta = 1200
): string {
  const items = preguntas.map((q) => ({
    id: q.id,
    categoria: q.categoria,
    pregunta: q.pregunta,
    que_evalua: q.que_evalua,
    respuesta_del_candidato:
      (respuestas[q.id] ?? "").trim().slice(0, maxCharsRespuesta) ||
      "(sin respuesta)",
  }));

  return `Evalúa las siguientes respuestas de entrevista conductual. Devuelve un "detalle" por cada pregunta (mismo preguntaId) y "recomendaciones_generales".

${JSON.stringify(items, null, 2)}

Devuelve solo el JSON.`;
}
