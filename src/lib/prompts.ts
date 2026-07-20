import type { QuizConfig, Pregunta, RespuestaUsuario } from "./types";

const DIFICULTAD_DESC: Record<string, string> = {
  junior:
    "Nivel JUNIOR: preguntas sobre conceptos base, qué hace el proyecto, tecnologías usadas y lectura simple de código.",
  "semi-senior":
    "Nivel SEMI-SENIOR: preguntas sobre decisiones de diseño, flujo entre módulos, patrones y detalles de implementación.",
  senior:
    "Nivel SENIOR: preguntas profundas sobre arquitectura, trade-offs, escalabilidad, edge cases y calidad del código.",
};

const FOCO_DESC: Record<string, string> = {
  features:
    "Enfócate en las FEATURES y funcionalidades del producto: qué resuelve, casos de uso, flujos principales.",
  codigo:
    "Enfócate en el CÓDIGO concreto: fragmentos, funciones, estructuras de datos, y qué hace cada pieza.",
  conceptos:
    "Enfócate en CONCEPTOS y términos técnicos presentes en el repo: patrones, dependencias, paradigmas.",
  mixto:
    "Mezcla equilibrada de features, código concreto, funciones y conceptos/términos técnicos.",
};

/** System prompt para el generador de preguntas (reclutador técnico senior). */
export const SYSTEM_GENERAR = `Eres un reclutador técnico senior que entrevista candidatos de TI.
Tu trabajo es crear preguntas de entrevista realistas y específicas basadas EXCLUSIVAMENTE en el repositorio que se te entrega.

REGLAS ESTRICTAS:
- Responde SIEMPRE en ESPAÑOL.
- Basa cada pregunta en evidencia concreta del repositorio (archivos, funciones, dependencias, patrones reales que veas en el digest). Nada de preguntas genéricas que sirvan para cualquier proyecto.
- Varía los tipos de pregunta: feature, codigo, funcion, concepto, termino.
- Cuando una pregunta se refiera a un fragmento de código, incluye ese fragmento exacto (o una porción representativa) en el campo "contexto" y su ruta en "archivo".
- "respuesta_esperada" debe ser una guía interna clara y correcta de qué debería responder un buen candidato (no se le mostrará al usuario todavía).
- No inventes archivos, funciones ni tecnologías que no estén en el repositorio.
- Devuelve SOLO un objeto JSON válido con la forma exacta indicada. Sin texto adicional, sin markdown.

FORMATO JSON DE SALIDA:
{
  "preguntas": [
    {
      "id": "q1",
      "pregunta": "string — la pregunta en español",
      "tipo": "feature" | "codigo" | "funcion" | "concepto" | "termino",
      "contexto": "string opcional — fragmento de código o archivo relevante",
      "archivo": "string opcional — ruta del archivo del contexto",
      "respuesta_esperada": "string — guía interna de la respuesta correcta"
    }
  ]
}`;

/** Construye el mensaje de usuario para generar preguntas. */
export function buildGenerarUser(
  digest: string,
  config: QuizConfig
): string {
  return `Genera EXACTAMENTE ${config.cantidad} preguntas de entrevista técnica sobre el siguiente repositorio.

${DIFICULTAD_DESC[config.dificultad]}
${FOCO_DESC[config.foco]}

Asegúrate de que las preguntas sean concretas al repo (menciona nombres reales de archivos, funciones, dependencias o features que aparezcan abajo).

=== DIGEST DEL REPOSITORIO ===
${digest}
=== FIN DEL DIGEST ===

Devuelve solo el JSON con las ${config.cantidad} preguntas.`;
}

/** System prompt para el evaluador. */
export const SYSTEM_EVALUAR = `Eres un evaluador técnico justo y riguroso que corrige respuestas de una entrevista.
Comparas la respuesta del candidato con la respuesta esperada y la evidencia del repositorio.

REGLAS ESTRICTAS:
- Responde SIEMPRE en ESPAÑOL.
- Sé JUSTO y realista, como en una entrevista real: evalúas comprensión, no memorización literal.
- Premia el entendimiento del concepto central aunque el candidato no mencione cada detalle de implementación, cada nombre de API o cada edge case. No exijas exhaustividad.
- "correcta" es "bien" (comprende el punto central y responde de forma correcta, aunque le falten detalles menores), "parcial" (idea correcta pero incompleta, imprecisa o superficial) o "mal" (incorrecta, vacía, "no sé" o irrelevante).
- Si el candidato explica correctamente el mecanismo o la idea principal, es al menos "parcial", y "bien" si además es claro y acertado. Reserva "mal" para respuestas realmente incorrectas, vacías o que no abordan la pregunta.
- "puntaje" es un entero de 0 a 100 coherente con el veredicto (bien≈75-100, parcial≈40-74, mal≈0-39).
- "comentario" explica en 1-3 frases por qué, de forma constructiva.
- "respuesta_correcta" es la respuesta ideal y completa que debió dar el candidato.
- Si el candidato no respondió (texto vacío), es "mal" con puntaje 0.
- Genera además "recomendaciones": 3 a 5 sugerencias de estudio accionables basadas en los errores detectados.
- Devuelve SOLO un objeto JSON válido con la forma exacta indicada. Sin markdown ni texto extra.

FORMATO JSON DE SALIDA:
{
  "detalle": [
    {
      "preguntaId": "q1",
      "correcta": "bien" | "parcial" | "mal",
      "puntaje": 0,
      "comentario": "string",
      "respuesta_correcta": "string"
    }
  ],
  "recomendaciones": ["string", "string"]
}`;

/** Construye el mensaje de usuario para evaluar. */
export function buildEvaluarUser(
  preguntas: Pregunta[],
  respuestas: RespuestaUsuario[]
): string {
  const mapa = new Map(respuestas.map((r) => [r.preguntaId, r.texto]));

  const items = preguntas.map((q) => ({
    id: q.id,
    tipo: q.tipo,
    pregunta: q.pregunta,
    contexto: q.contexto ?? null,
    respuesta_esperada: q.respuesta_esperada,
    respuesta_del_candidato: (mapa.get(q.id) ?? "").trim() || "(sin respuesta)",
  }));

  return `Evalúa las siguientes respuestas de entrevista. Devuelve un "detalle" por cada pregunta (mismo preguntaId) y una lista de "recomendaciones".

${JSON.stringify(items, null, 2)}

Devuelve solo el JSON.`;
}
