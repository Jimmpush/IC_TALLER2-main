import OpenAI from "openai";
import { brand, business } from "@/lib/brand";
import { vehicles, Vehicle, findVehicle, filterVehicles } from "@/lib/catalog";
import { retrieveKnowledge } from "@/lib/knowledge";
import { DraftOrder, OrderLine, createLine } from "@/lib/orders";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type AutomotivePreferences = {
  usage?: string;
  budgetMax?: number;
  condition?: "Nuevo" | "Usado" | "Cualquiera";
  passengers?: number;
  category?: string;
  priority?: string;
  recommendedCarIds?: string[];
};

export type ConversationResult = {
  reply: string;
  draft: DraftOrder;
  recommendedCars: Vehicle[];
  preferences: AutomotivePreferences;
  readyToConfirm: boolean;
  mode: "ia" | "demo";
};

const baseDraft = (): DraftOrder => ({
  lines: [],
  fulfillment: "Asesoría y Cotización de Vehículo"
});

// Extracción inteligente de intenciones y preferencias automotrices
export function extractPreferences(
  messages: ChatMessage[],
  previous: AutomotivePreferences = {}
): AutomotivePreferences {
  const prefs: AutomotivePreferences = { ...previous };
  const allText = messages.map((m) => m.content).join(" ").toLowerCase();
  const latest = (messages.at(-1)?.content ?? "").toLowerCase();

  // Presupuesto
  const budgetMatch =
    latest.match(/(?:s\/|\$|soles)?\s*(\d{2,3})(?:\s*mil|\s*k|\.000|,000)\b/i) ||
    latest.match(/(?:presupuesto|tengo|dispongo|hasta|tope|gastar)?\s*(?:de|unos)?\s*(?:s\/|\$)?\s*(\d{5,6})\b/i);

  if (budgetMatch) {
    let val = Number(budgetMatch[1]);
    if (val < 1000) val = val * 1000;
    prefs.budgetMax = val;
  }

  // Uso principal
  if (/\b(ciudad|tr[aá]fico|ir a trabajar|oficina|diario|universidad)\b/i.test(latest)) {
    prefs.usage = "Ciudad y uso diario";
  } else if (/\b(familia|hijos|hijo|viajar juntos|espacio para todos)\b/i.test(latest)) {
    prefs.usage = "Familiar y viajes";
  } else if (/\b(trabajo|carga|negocio|obra|chapa|material|herramienta)\b/i.test(latest)) {
    prefs.usage = "Trabajo y carga";
  } else if (/\b(viajes|carretera|sierra|paseo|trocha|aventura)\b/i.test(latest)) {
    prefs.usage = "Viajes y trocha";
  } else if (/\b(primer auto|empezando a manejar|primer carro)\b/i.test(latest)) {
    prefs.usage = "Primer auto";
  }

  // Estado nuevo vs usado
  if (/\b(nuevo|0km|cero km|estrenar|de tienda)\b/i.test(latest)) {
    prefs.condition = "Nuevo";
  } else if (/\b(usado|seminuevo|segunda|de segunda)\b/i.test(latest)) {
    prefs.condition = "Usado";
  }

  // Pasajeros
  const passMatch = latest.match(/\b(5|7|4)\s*(?:personas|pasajeros|asientos|plazas)\b/i);
  if (passMatch) prefs.passengers = Number(passMatch[1]);
  if (/\b(3 filas|tres filas|7 asientos|siete personas)\b/i.test(latest)) prefs.passengers = 7;

  // Carrocería
  if (/\b(suv|camioneta compacta)\b/i.test(latest)) prefs.category = "SUV";
  else if (/\b(sedan|sed[aá]n)\b/i.test(latest)) prefs.category = "Sedanes";
  else if (/\b(hatchback|hatch)\b/i.test(latest)) prefs.category = "Hatchbacks";
  else if (/\b(pickup|pick-up|tolva|4x4)\b/i.test(latest)) prefs.category = "Pickups";
  else if (/\b(familiar|3 filas|camioneta familiar)\b/i.test(latest)) prefs.category = "Camionetas familiares";
  else if (/\b(urbano|econ[oó]mico|chico|pequeño)\b/i.test(latest)) prefs.category = "Autos urbanos y económicos";
  else if (/\b(h[ií]brido|el[eé]ctrico|ev|bater[ií]a)\b/i.test(latest)) prefs.category = "Híbridos y eléctricos";

  // Prioridad
  if (/\b(consumo|ahorro|gasolina|rinde|km por gal[oó]n)\b/i.test(latest)) prefs.priority = "Consumo eficiente";
  else if (/\b(seguridad|airbags|chasis|frenos|choques)\b/i.test(latest)) prefs.priority = "Máxima seguridad";
  else if (/\b(espacio|maletero|caber|espacioso)\b/i.test(latest)) prefs.priority = "Espacio y confort";
  else if (/\b(potencia|r[aá]pido|pique|torque|turbo)\b/i.test(latest)) prefs.priority = "Potencia y respuesta";
  else if (/\b(reventa|mantenimiento|repuestos|fiabilidad|confiable)\b/i.test(latest)) prefs.priority = "Reventa y mantenimiento";

  return prefs;
}

// Selector determinista de vehículos acordes a las preferencias
export function pickRecommendedVehicles(prefs: AutomotivePreferences): Vehicle[] {
  let list = [...vehicles];

  if (prefs.budgetMax) {
    const margin = prefs.budgetMax * 1.15; // hasta un 15% de holgura
    list = list.filter((v) => v.price <= margin);
  }

  if (prefs.condition && prefs.condition !== "Cualquiera") {
    const exact = list.filter((v) => v.condition === prefs.condition);
    if (exact.length >= 2) list = exact;
  }

  if (prefs.passengers && prefs.passengers >= 7) {
    const fam = list.filter((v) => v.seats >= 7);
    if (fam.length > 0) return fam;
  }

  if (prefs.category) {
    const cat = list.filter((v) => v.category === prefs.category);
    if (cat.length >= 2) list = cat;
  }

  if (prefs.usage === "Primer auto" || prefs.usage === "Ciudad y uso diario") {
    list.sort((a, b) => {
      const aScore = (a.category === "Autos urbanos y económicos" || a.category === "Hatchbacks" ? 2 : 0) + (a.price < 60000 ? 1 : 0);
      const bScore = (b.category === "Autos urbanos y económicos" || b.category === "Hatchbacks" ? 2 : 0) + (b.price < 60000 ? 1 : 0);
      return bScore - aScore;
    });
  } else if (prefs.usage === "Trabajo y carga") {
    list.sort((a, b) => (b.category === "Pickups" ? 3 : 0) - (a.category === "Pickups" ? 3 : 0));
  } else if (prefs.usage === "Familiar y viajes") {
    list.sort((a, b) => (b.seats >= 7 ? 3 : b.category === "SUV" ? 2 : 0) - (a.seats >= 7 ? 3 : a.category === "SUV" ? 2 : 0));
  }

  // Devolver entre 3 y 4 vehículos
  return list.slice(0, 4);
}

// Motor conversacional demostrativo / reglas para AIDA
function demoAutomotiveConversation(
  messages: ChatMessage[],
  currentDraft?: DraftOrder
): ConversationResult {
  const prefs = extractPreferences(messages);
  const latest = (messages.at(-1)?.content ?? "").toLowerCase().trim();

  // Comprobar si el usuario menciona un auto en particular
  const specificCar = findVehicle(latest);
  const recommended = pickRecommendedVehicles(prefs);

  const draft: DraftOrder = {
    customerName: currentDraft?.customerName,
    fulfillment: currentDraft?.fulfillment ?? "Asesoría y Cotización de Vehículo",
    lines: currentDraft?.lines ? [...currentDraft.lines] : []
  };

  if (specificCar && !draft.lines.some((l) => l.itemId === specificCar.id)) {
    draft.lines.push(createLine(specificCar, 1));
  }

  // Respuestas según el estado del diálogo
  let reply = "";
  let readyToConfirm = false;

  const isGreeting = /^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|inicio|empezar|que tal)\b/i.test(latest);
  const asksFirstCar = latest.includes("primer auto") || latest.includes("primer carro");
  const asksFamily = latest.includes("familiar") || latest.includes("familia");
  const asksFuel = latest.includes("poco combustible") || latest.includes("ahorro") || latest.includes("consumo");
  const asksSUV = latest.includes("suv") || latest.includes("camioneta");
  const asksUsed = latest.includes("auto usado") || latest.includes("seminuevo");
  const asksCompare = latest.includes("compar") || latest.includes("diferencia entre");
  const confirms = /^(si|sí|confirmo|solicitar|quiero cotizar|dale|ok|cotizar)/i.test(latest);

  if (confirms && draft.lines.length > 0) {
    const carNames = draft.lines.map((l) => l.name).join(", ");
    reply = `¡Excelente decisión! He preparado tu solicitud de cotización formal para **${carNames}**. Puedes presionar el botón **Solicitar Asesoría y Cotización** para registrar tu solicitud y conectar con un asesor especializado. ¿Deseas afinar algún detalle antes de enviar?`;
    readyToConfirm = true;
  } else if (isGreeting && messages.length <= 2) {
    reply =
      "¡Hola! Soy **AIDA**, tu asesora automotriz de AUTOIA. Te ayudaré a encontrar el auto ideal para ti según tu presupuesto y estilo de vida en el Perú.\n\n" +
      "Empecemos por lo más importante: **¿Para qué uso principal necesitas tu próximo vehículo?** (Por ejemplo: ciudad y trabajo diario, viajes en familia, primer auto o trabajo pesado).";
  } else if (asksFirstCar) {
    reply =
      "Para un **primer auto en Perú**, te recomiendo priorizar: maniobrabilidad en tráfico, facilidad para estacionar, repuestos económicos y alto valor de reventa.\n\n" +
      "Un **Kia Picanto 2024** (nuevo, S/ 48,900) o un **Suzuki Swift 2022** (usado certificado, S/ 41,500) son las mejores opciones por su bajo consumo de hasta 60 km/galón. ¿Tienes algún presupuesto tope estimado en soles?";
  } else if (asksFamily) {
    reply =
      "Para la familia, el espacio y la seguridad son prioridad. Si buscas **7 pasajeros**, el **Toyota Rush 2024** (S/ 86,900) con tracción trasera y el **Mitsubishi Outlander 2022 4WD** (S/ 94,500) son líderes indiscutibles.\n\n" +
      "Si 5 plazas son suficientes, el **Toyota Yaris** o la **Hyundai Creta** ofrecen amplios maleteros para coches de bebé y maletas. ¿Cuántas personas viajarán habitualmente en el vehículo?";
  } else if (asksFuel) {
    reply =
      "Si buscas **mínimo consumo de combustible**, la tecnología híbrida o eléctrica es el camino ideal en el tráfico limeño:\n\n" +
      "• **Toyota Corolla Cross Híbrido** (rinde más de 75 km/gal sin necesidad de enchufe).\n" +
      "• **BYD Yuan Plus EV** (100% eléctrico, con costo equivalente de S/ 15 de carga por cada 100 km).\n" +
      "• Si prefieres gasolina tradicional, el **Kia Picanto** entrega hasta 60 km/gal. ¿Cuál es tu recorrido diario aproximado?";
  } else if (asksSUV) {
    reply =
      "Las **SUV** son las favoritas en Perú gracias a su altura al suelo (18 a 22 cm) que evita raspar con rompemuelles o pistas en mal estado.\n\n" +
      "Tenemos opciones como la **Chery Tiggo 4 Pro** (S/ 58,900 nueva), la **Hyundai Creta 2023** (S/ 69,900 usada) y la **Toyota Corolla Cross** (S/ 114,500 híbrida). ¿Prefieres transmisión automática o mecánica?";
  } else if (asksUsed) {
    reply =
      "Un **auto usado o seminuevo** te permite ahorrar entre un 20% y 30% respecto al valor de tienda. En nuestra plataforma verificamos historial de mantenimientos y gravámenes en SUNARP.\n\n" +
      "Opciones recomendadas: **Suzuki Swift 2022** (S/ 41,500), **Hyundai Creta 2023** (S/ 69,900) o **Hyundai Elantra 2023** (S/ 72,500). ¿Qué rango de presupuesto tienes en mente?";
  } else if (specificCar) {
    reply =
      `El **${specificCar.brand} ${specificCar.model} ${specificCar.year}** (${specificCar.condition}, S/ ${specificCar.price.toLocaleString("es-PE")}) es una excelente opción. Destaca por: ${specificCar.highlight}\n\n` +
      `• **Motor y potencia:** ${specificCar.engine} (${specificCar.power})\n` +
      `• **Consumo estimado:** ${specificCar.consumption}\n` +
      `• **Ventajas clave:** ${specificCar.pros.join(" · ")}\n` +
      `• **A considerar:** ${specificCar.cons.join(" · ")}\n\n` +
      `¿Te gustaría agregarlo a tu lista para cotizar o compararlo con otra alternativa?`;
  } else if (prefs.budgetMax) {
    const listStr = recommended
      .map((c) => `• **${c.brand} ${c.model} (${c.condition}, S/ ${c.price.toLocaleString("es-PE")})**: ${c.highlight}`)
      .join("\n");
    reply =
      `Para un presupuesto de **S/ ${prefs.budgetMax.toLocaleString("es-PE")}**, estas son las mejores opciones disponibles que cumplen con tus criterios:\n\n` +
      `${listStr}\n\n` +
      `¿Deseas que comparemos dos de estos modelos en detalle o prefieres evaluar opciones nuevas vs seminuevas?`;
  } else {
    const carList = recommended.slice(0, 3).map((c) => c.name).join(", ");
    reply =
      `Entendido. Tomando en cuenta lo que me comentas, modelos como **${carList}** son alternativas muy sólidas en el mercado peruano.\n\n` +
      `Para afinar la recomendación: ¿tienes un **presupuesto aproximado en soles** o prefieres priorizar un tipo de carrocería en particular (Sedán, SUV, Hatchback)?`;
  }

  return {
    reply,
    draft,
    recommendedCars: recommended,
    preferences: prefs,
    readyToConfirm,
    mode: "demo"
  };
}

// Motor de IA con LLM (Ollama local, OpenAI o NVIDIA)
async function aiAutomotiveConversation(
  messages: ChatMessage[],
  currentDraft?: DraftOrder,
  selectedModel?: string
): Promise<ConversationResult> {
  const isNvidia = process.env.AI_PROVIDER === "nvidia";
  const isOllama = process.env.AI_PROVIDER === "ollama";
  const apiKey = isNvidia ? process.env.NVIDIA_API_KEY : isOllama ? "ollama-local" : process.env.OPENAI_API_KEY;

  if (!apiKey) throw new Error(`Falta la clave del proveedor ${isNvidia ? "NVIDIA" : "OpenAI"}.`);

  const client = new OpenAI({
    apiKey,
    ...(isNvidia ? { baseURL: "https://integrate.api.nvidia.com/v1" } : {}),
    ...(isOllama ? { baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1" } : {})
  });

  const latestUserMessage = messages.at(-1)?.content ?? "";
  const knowledgeRAG = (await retrieveKnowledge(latestUserMessage)).results;
  const prefs = extractPreferences(messages);

  const systemPrompt = `Eres AIDA, la Asesora Inteligente de Decisión Automotriz de ${brand.name} en ${brand.country}.
Tu misión es guiar al usuario para encontrar, comparar y elegir el auto ideal según su presupuesto (en Soles S/), necesidades reales, estilo de vida y costos en Perú.
Tono: ${business.tone}. Sé empática, honesta y experta sin favoritismos comerciales.

Directrices clave:
1. Haz una pregunta a la vez para descubrir: uso principal, presupuesto en Soles, nuevo vs usado, cantidad de pasajeros y prioridades (consumo, seguridad, reventa).
2. Conoce el catálogo demostrativo autorizado: ${JSON.stringify(vehicles.map((v) => ({ id: v.id, name: v.name, price: v.price, condition: v.condition, category: v.category, fuel: v.fuel, consumption: v.consumption, highlight: v.highlight })))}.
3. Conocimiento RAG recuperado para esta consulta: ${JSON.stringify(knowledgeRAG)}.
4. Si el usuario pide comparar, explica ventajas y desventajas objetivas de cada modelo sin inventar datos.
5. Devuelve siempre un JSON válido con estas claves exactas:
   - "reply": string con tu respuesta en español (formato markdown claro y estructurado).
   - "recommendedCarIds": array con los IDs de hasta 4 autos del catálogo que mejor se ajustan.
   - "readyToConfirm": boolean (true si el usuario expresa intención clara de cotizar o solicitar asesoría con un auto seleccionado).
   - "selectedCarId": ID del auto específico si el usuario pide cotizar uno en particular, o null.`;

  const modelName =
    selectedModel ||
    (isNvidia
      ? (process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct")
      : isOllama
      ? (process.env.OLLAMA_MODEL ?? "llama3.2:3b")
      : (process.env.OPENAI_MODEL ?? "gpt-4o-mini"));

  const response = await client.chat.completions.create({
    model: modelName,
    temperature: 0.3,
    ...(!isOllama ? { response_format: { type: "json_object" as const } } : {}),
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content }))
    ]
  });

  const rawContent = response.choices[0]?.message.content?.trim() ?? "{}";
  const jsonClean = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  let parsed: {
    reply?: string;
    recommendedCarIds?: string[];
    readyToConfirm?: boolean;
    selectedCarId?: string;
  } = {};

  try {
    parsed = JSON.parse(jsonClean);
  } catch {
    // Si el LLM devolvió texto libre en lugar de JSON estricto
    parsed = { reply: rawContent };
  }

  // Resolver autos recomendados
  let matchedCars: Vehicle[] = [];
  if (Array.isArray(parsed.recommendedCarIds) && parsed.recommendedCarIds.length > 0) {
    matchedCars = parsed.recommendedCarIds
      .map((id) => vehicles.find((v) => v.id === id))
      .filter((v): v is Vehicle => Boolean(v));
  }

  if (!matchedCars.length) {
    matchedCars = pickRecommendedVehicles(prefs);
  }

  const draft: DraftOrder = {
    customerName: currentDraft?.customerName,
    fulfillment: currentDraft?.fulfillment ?? "Asesoría y Cotización de Vehículo",
    lines: currentDraft?.lines ? [...currentDraft.lines] : []
  };

  if (parsed.selectedCarId) {
    const car = vehicles.find((v) => v.id === parsed.selectedCarId);
    if (car && !draft.lines.some((l) => l.itemId === car.id)) {
      draft.lines.push(createLine(car, 1));
    }
  }

  return {
    reply: parsed.reply || "Estoy analizando las mejores opciones automotrices para ti...",
    draft,
    recommendedCars: matchedCars,
    preferences: prefs,
    readyToConfirm: Boolean(parsed.readyToConfirm),
    mode: "ia"
  };
}

export async function handleConversation(
  messages: ChatMessage[],
  currentDraft?: DraftOrder,
  selectedModel?: string
): Promise<ConversationResult> {
  const provider = process.env.AI_PROVIDER;
  const canUseAI =
    (provider === "nvidia" && process.env.NVIDIA_API_KEY) ||
    (provider === "openai" && process.env.OPENAI_API_KEY) ||
    provider === "ollama";

  if (canUseAI) {
    try {
      return await aiAutomotiveConversation(messages, currentDraft, selectedModel);
    } catch (error) {
      console.warn("AI conversation failed, falling back to automotive demo engine:", error);
      return demoAutomotiveConversation(messages, currentDraft);
    }
  }

  return demoAutomotiveConversation(messages, currentDraft);
}
