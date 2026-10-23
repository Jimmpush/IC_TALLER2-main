export type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
};

export type KnowledgeResult = KnowledgeEntry & { score: number; source: "vector" | "keyword" };

const embeddingCache = new Map<string, number[]>();

export const automotiveKnowledge: KnowledgeEntry[] = [
  {
    id: "presupuesto",
    title: "¿Qué auto puedo comprar con mi presupuesto?",
    summary: "Aprende a distribuir tu presupuesto entre valor de compra, seguro, trámites y reserva de mantenimiento.",
    content:
      "En el mercado peruano, el presupuesto debe considerar no solo el valor del auto, sino también los gastos iniciales (entre un 8% y 12% adicional). Por rangos referenciales: De S/ 40,000 a S/ 55,000 puedes acceder a autos urbanos nuevos (como Kia Picanto o Hyundai Grand i10) o sedanes y hatchbacks usados con menos de 40,000 km. De S/ 55,000 a S/ 80,000 accedes a sedanes nuevos de volumen (Toyota Yaris, Nissan Versa) y SUV compactas de entrada. A partir de S/ 85,000 encuentras SUV familiares de 3 filas, camionetas 4x4 o vehículos híbridos y eléctricos.",
    tags: ["presupuesto", "precio", "cuanto-gastar", "soles", "costos", "gama"]
  },
  {
    id: "nuevo-vs-usado",
    title: "¿Conviene comprar un auto nuevo o usado?",
    summary: "Compara garantía y tranquilidad de un cero kilómetros frente al ahorro por depreciación de un seminuevo.",
    content:
      "Un auto nuevo te ofrece garantía de fábrica (3 a 5 años en Perú), tranquilidad mecánica absoluta, tasas preferenciales de crédito vehicular y la emoción de estrenar, pero sufre una depreciación del 15% al 20% al salir del concesionario y paga impuesto vehicular en el SAT durante los primeros 3 años. Un auto usado o seminuevo (de 2 a 4 años) permite acceder a un segmento o modelo superior por el mismo dinero porque ya absorbió la mayor depreciación, pero requiere una rigurosa inspección mecánica y no siempre cuenta con garantía completa.",
    tags: ["nuevo", "usado", "seminuevo", "depreciacion", "garantia", "decision"]
  },
  {
    id: "revision-usado",
    title: "¿Qué debo revisar antes de comprar un auto usado?",
    summary: "Checklist legal y mecánico indispensable: SUNARP, SAT, gravámenes, compresiones de motor y chasis.",
    content:
      "En Perú, la revisión tiene dos partes fundamentales. 1) Legal: Certificado Registral Vehicular en SUNARP para confirmar titularidad y descartar embargos, órdenes de captura o prendas vehiculares; verificación de papeletas pendientes en el SAT y SUTRAN, y récord de accidentes en SOAT. 2) Mecánica: Inspección de chasis para descartar choques estructurales severos, prueba de compresión de cilindros, escaneo OBD2 para códigos de falla ocultos, estado de neumáticos, frenos y verificación de historial de mantenimientos en taller.",
    tags: ["usado", "revision", "inspeccion", "mecanico", "sunarp", "sat", "estafas", "papeletas"]
  },
  {
    id: "suv-vs-sedan",
    title: "¿Qué diferencia hay entre un SUV y un sedán?",
    summary: "Analiza altura libre al suelo, estabilidad, consumo de combustible y practicidad en pista.",
    content:
      "La principal ventaja de una SUV en Perú es su mayor despeje del suelo (18 a 22 cm frente a los 13 a 15 cm de un sedán), lo cual evita raspar la carrocería en rompemuelles pronunciados, baches o pistas sin asfaltar, además de otorgar una posición de manejo más alta. Por su parte, un sedán ofrece mejor coeficiente aerodinámico, centro de gravedad más bajo (mayor estabilidad y seguridad en curvas a velocidad), menor consumo de combustible y un maletero independiente que resguarda el equipaje fuera de la vista exterior.",
    tags: ["suv", "sedan", "carroceria", "altura", "consumo", "estabilidad", "rompemuelles"]
  },
  {
    id: "consumo-combustible",
    title: "¿Qué debo considerar sobre el consumo de combustible?",
    summary: "Evalúa km por galón según tipo de motor, peso vehicular, tráfico limeño y alternativas híbridas o GLP/GNV.",
    content:
      "El consumo real en el tráfico de Lima suele ser entre un 15% y 25% más alto que el consumo homologado en laboratorio. Un auto urbano eficiente de 1.0L a 1.2L rinde entre 50 y 60 km/galón. Un sedán o SUV compacta de 1.5L a 1.6L rinde entre 42 y 50 km/galón. Las SUV medianas o camionetas 2.0L a 2.5L rinden de 30 a 38 km/galón. Si recorres más de 40 km diarios, un vehículo híbrido (que rinde más de 70 km/gal) o una conversión certificada a GNV/GLP amortiza rápidamente la inversión.",
    tags: ["consumo", "combustible", "gasolina", "hibrido", "gnv", "glp", "kilometros-galon", "ahorro"]
  },
  {
    id: "gastos-adicionales",
    title: "¿Qué gastos adicionales debo calcular al comprar un vehículo en Perú?",
    summary: "Desglose de SOAT, seguro vehicular, impuesto al patrimonio vehicular SAT, trámites notariales y placas.",
    content:
      "Al adquirir un vehículo en Perú debes considerar: 1) SOAT anual (S/ 50 a S/ 150 según empresa y región). 2) Seguro vehicular contra todo riesgo (aprox. 3% a 5% del valor comercial al año). 3) Impuesto al Patrimonio Vehicular del SAT: 1% del valor del auto anualmente durante los primeros 3 años desde su inscripción. 4) En autos nuevos: gastos de placas e inmatriculación notarial (S/ 400 a S/ 800). 5) En usados: derecho notarial de transferencia e inscripción registral SUNARP (S/ 250 a S/ 500). 6) Mantenimiento preventivo cada 5,000 o 10,000 km.",
    tags: ["gastos", "soat", "sat", "impuesto", "seguro", "notaria", "sunarp", "costo-total"]
  }
];

// Compatibilidad
export const knowledge = automotiveKnowledge;

export function retrieveKeywordKnowledge(query: string): KnowledgeResult[] {
  const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
  return automotiveKnowledge
    .map((entry) => ({
      entry,
      score: terms.reduce(
        (score, term) =>
          score +
          (entry.title.toLowerCase().includes(term) ||
          entry.tags.some((tag) => tag.includes(term)) ||
          entry.content.toLowerCase().includes(term)
            ? 1
            : 0),
        0
      )
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => ({ ...item.entry, score: item.score, source: "keyword" as const }));
}

function cosineSimilarity(left: number[], right: number[]) {
  const dot = left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0);
  const leftMagnitude = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0));
  const rightMagnitude = Math.sqrt(right.reduce((sum, value) => sum + value * value, 0));
  return leftMagnitude && rightMagnitude ? dot / (leftMagnitude * rightMagnitude) : 0;
}

async function embedMany(texts: string[]) {
  const missing = texts.filter((text) => !embeddingCache.has(text));
  if (!missing.length) return texts.map((text) => embeddingCache.get(text)!);
  const baseUrl = (process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1").replace(/\/v1\/?$/, "");
  const response = await fetch(`${baseUrl}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OLLAMA_EMBEDDING_MODEL ?? "nomic-embed-text", input: missing }),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Ollama embeddings respondió ${response.status}.`);
  const data = (await response.json()) as { embeddings?: number[][] };
  if (!data.embeddings?.length || data.embeddings.length !== missing.length)
    throw new Error("Ollama no devolvió todos los embeddings.");
  missing.forEach((text, index) => embeddingCache.set(text, data.embeddings![index]));
  return texts.map((text) => embeddingCache.get(text)!);
}

export async function retrieveKnowledge(query: string): Promise<{ results: KnowledgeResult[]; source: "vector" | "keyword" }> {
  try {
    const documents = automotiveKnowledge.map(
      (entry) => `${entry.title}. ${entry.content}. Etiquetas: ${entry.tags.join(", ")}`
    );
    const [queryEmbedding, ...documentEmbeddings] = await embedMany([query, ...documents]);
    const vectorResults = automotiveKnowledge.map((entry, index) => ({
      entry,
      score: cosineSimilarity(queryEmbedding, documentEmbeddings[index])
    }));
    return {
      results: vectorResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ entry, score }) => ({ ...entry, score, source: "vector" as const })),
      source: "vector"
    };
  } catch {
    // Si Ollama embeddings no está disponible, fallback fluido por palabras clave
    return {
      results: retrieveKeywordKnowledge(query),
      source: "keyword"
    };
  }
}
