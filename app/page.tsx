"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { brand, business } from "@/lib/brand";
import {
  vehicles,
  Vehicle,
  vehicleCategories,
  VehicleCategory,
  VehicleCondition,
  FuelType,
  TransmissionType
} from "@/lib/catalog";
import { automotiveKnowledge, KnowledgeEntry } from "@/lib/knowledge";
import { promotions } from "@/lib/promotions";
import { DraftOrder, Order } from "@/lib/orders";
import { AutomotivePreferences } from "@/lib/conversation";
import { RadarChart } from "@/components/RadarChart";


type Message = { role: "user" | "assistant"; content: string; cars?: Vehicle[] };
type ChatResult = {
  reply: string;
  draft: DraftOrder;
  recommendedCars: Vehicle[];
  preferences: AutomotivePreferences;
  readyToConfirm: boolean;
  mode: "ia" | "demo";
  error?: string;
};

export default function Home() {
  // Estado del Asistente AIDA
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<DraftOrder>({
    lines: [],
    fulfillment: "Asesoría y Cotización de Vehículo"
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [ready, setReady] = useState(false);
  const [detectedPrefs, setDetectedPrefs] = useState<AutomotivePreferences>({});

  // Buscador y Filtros de Catálogo
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | "Todas">("Todas");
  const [selectedCondition, setSelectedCondition] = useState<VehicleCondition | "Todos">("Todos");
  const [selectedFuel, setSelectedFuel] = useState<FuelType | "Todos">("Todos");
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType | "Todas">("Todas");
  const [maxBudget, setMaxBudget] = useState<number>(145000);
  const [sortBy, setSortBy] = useState<"relevancia" | "precio-asc" | "precio-desc" | "recientes">("relevancia");

  // Comparador de vehículos (máximo 3)
  const [comparedCarIds, setComparedCarIds] = useState<string[]>([
    "toyota-yaris-2024",
    "hyundai-creta-2023"
  ]);

  // Modal de Detalle de Vehículo
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Modal de Cotización / Test Drive
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: "", phone: "", email: "", inquiryType: "Cotización formal" });
  const [orders, setOrders] = useState<Order[]>([]);

  // FAQ Acordeón & RAG
  const [openFaq, setOpenFaq] = useState<string | null>("presupuesto");
  const [theoryQuery, setTheoryQuery] = useState("");
  const [ragNotice, setRagNotice] = useState<{ title: string; content: string } | null>(null);

  // Toast Notice
  const [toast, setToast] = useState("");

  // Carga inicial
  useEffect(() => {
    // Consultar estado de salud de IA
    void fetch("/api/health")
      .then((r) => r.json())
      .then((data: { connected: boolean; model?: string }) => {
        setConnected(data.connected);
        if (data.model) setModel(data.model);
      })
      .catch(() => setConnected(false));

    // Consultar modelos disponibles en Ollama
    void fetch("/api/models")
      .then((r) => r.json())
      .then((data: { models?: string[] }) => setModels(data.models ?? []))
      .catch(() => setModels([]));

    // Consultar solicitudes registradas
    void fetch("/api/orders")
      .then((r) => r.json())
      .then((data: { orders?: Order[] }) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {});

    // Saludo inicial de AIDA
    setMessages([
      {
        role: "assistant",
        content:
          "¡Hola! Soy **AIDA**, tu asesora automotriz en **AUTOIA**. Te ayudaré a encontrar el vehículo ideal según tu presupuesto, estilo de vida y costos en Perú.\n\n" +
          "Empecemos por lo más importante: **¿Para qué uso principal necesitas tu próximo vehículo?** (Por ejemplo: ciudad y trabajo diario, viajes familiares, primer auto o trabajo pesado).",
        cars: [vehicles[0], vehicles[2], vehicles[6]]
      }
    ]);
  }, []);

  // Enviar mensaje a AIDA
  async function sendMessage(text: string, attachedCar?: Vehicle) {
    if (!text.trim() || loading) return;

    let userText = text;
    if (attachedCar) {
      userText = `Quiero información y asesoría sobre el ${attachedCar.brand} ${attachedCar.model} ${attachedCar.year}.`;
    }

    const nextMessages = [...messages, { role: "user" as const, content: userText }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, draft, model })
      });

      const result = (await response.json()) as ChatResult;
      if (!response.ok) throw new Error(result.error ?? "No se pudo conectar con la asesora.");

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: result.reply,
          cars: result.recommendedCars && result.recommendedCars.length > 0 ? result.recommendedCars : undefined
        }
      ]);

      if (result.draft) setDraft(result.draft);
      if (result.preferences) setDetectedPrefs(result.preferences);
      setReady(Boolean(result.readyToConfirm));

      // Síntesis de voz opcional si está disponible en el navegador
      if ("speechSynthesis" in window && !result.reply.includes("•")) {
        const voice = new SpeechSynthesisUtterance(result.reply.slice(0, 160));
        voice.lang = "es-PE";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(voice);
      }
    } catch (error) {
      const err = error instanceof Error ? error.message : "Error al consultar con AIDA";
      setToast(err);
    } finally {
      setLoading(false);
    }
  }

  // Filtrado y ordenamiento de vehículos
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        if (selectedCategory !== "Todas" && v.category !== selectedCategory) return false;
        if (selectedCondition !== "Todos" && v.condition !== selectedCondition) return false;
        if (selectedFuel !== "Todos" && v.fuel !== selectedFuel) return false;
        if (selectedTransmission !== "Todas" && v.transmission !== selectedTransmission) return false;
        if (v.price > maxBudget) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const target = `${v.brand} ${v.model} ${v.version} ${v.category} ${v.fuel} ${v.description}`
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          if (!target.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "precio-asc") return a.price - b.price;
        if (sortBy === "precio-desc") return b.price - a.price;
        if (sortBy === "recientes") return b.year - a.year;
        return 0; // relevancia por defecto
      });
  }, [selectedCategory, selectedCondition, selectedFuel, selectedTransmission, maxBudget, searchQuery, sortBy]);

  // Selección para el comparador (máx 3)
  function toggleCompareCar(carId: string) {
    if (comparedCarIds.includes(carId)) {
      setComparedCarIds(comparedCarIds.filter((id) => id !== carId));
    } else {
      if (comparedCarIds.length >= 3) {
        setToast("Puedes comparar hasta 3 vehículos simultáneamente.");
        return;
      }
      setComparedCarIds([...comparedCarIds, carId]);
      setToast("Vehículo agregado al comparador.");
    }
  }

  const comparedVehicles = useMemo(() => {
    return comparedCarIds
      .map((id) => vehicles.find((v) => v.id === id))
      .filter((v): v is Vehicle => Boolean(v));
  }, [comparedCarIds]);

  // Enviar autos comparados a AIDA
  function askAidaAboutComparison() {
    if (comparedVehicles.length < 2) {
      setToast("Selecciona al menos 2 vehículos para que AIDA los compare.");
      return;
    }
    const names = comparedVehicles.map((v) => `${v.brand} ${v.model}`).join(" y ");
    void sendMessage(`AIDA, ayúdame a comparar y decidir entre el ${names}. ¿Cuáles son sus principales ventajas y desventajas?`);
    document.getElementById("asistente")?.scrollIntoView({ behavior: "smooth" });
  }

  // Registrar solicitud de cotización / test drive
  async function submitQuoteRequest(e: FormEvent) {
    e.preventDefault();
    if (!draft.lines.length && !selectedVehicle) {
      setToast("Selecciona un vehículo para solicitar asesoría.");
      return;
    }

    const targetCar = selectedVehicle ?? (draft.lines[0]?.itemId ? vehicles.find((v) => v.id === draft.lines[0].itemId) : vehicles[0]);

    const finalDraft: DraftOrder = {
      customerName: quoteForm.name || "Cliente Interesado",
      customerPhone: quoteForm.phone,
      fulfillment: `${quoteForm.inquiryType}: ${targetCar?.brand} ${targetCar?.model}`,
      lines: [
        {
          itemId: targetCar?.id ?? "auto",
          name: `${targetCar?.brand} ${targetCar?.model} (${targetCar?.year})`,
          quantity: 1,
          unitPrice: targetCar?.price ?? 0,
          vehicle: targetCar
        }
      ]
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalDraft)
      });
      const data = (await res.json()) as { order?: Order; error?: string };

      if (!res.ok || !data.order) throw new Error(data.error ?? "No se pudo registrar la solicitud");

      setOrders((prev) => [data.order!, ...prev]);
      setShowQuoteModal(false);
      setToast(`¡Solicitud ${data.order.id} registrada con éxito! Un asesor se pondrá en contacto.`);
      setReady(false);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Error al registrar la solicitud");
    }
  }

  // Consulta de Teoría RAG
  async function handleTheorySearch(e: FormEvent) {
    e.preventDefault();
    if (!theoryQuery.trim()) return;

    try {
      const res = await fetch(`/api/knowledge?q=${encodeURIComponent(theoryQuery)}`);
      const data = (await res.json()) as { results: Array<{ title: string; content: string }> };
      if (data.results && data.results.length > 0) {
        setRagNotice({ title: data.results[0].title, content: data.results[0].content });
      } else {
        setRagNotice({
          title: "Consulta Automotriz",
          content: "No encontré un documento exacto sobre este término, pero puedes preguntárselo directamente a AIDA en el chat."
        });
      }
    } catch {
      setToast("Error al consultar la base de conocimiento.");
    }
  }

  // Reiniciar Asesoría
  function resetChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "¡Asesoría reiniciada! Cuéntame qué necesitas o qué tipo de auto estás buscando para comenzar una nueva búsqueda.",
        cars: [vehicles[0], vehicles[2], vehicles[6]]
      }
    ]);
    setDraft({ lines: [], fulfillment: "Asesoría y Cotización de Vehículo" });
    setDetectedPrefs({});
    setReady(false);
    setToast("Conversación reiniciada.");
  }

  return (
    <div className="site-wrapper">
      {/* 1. Header y Navegación */}
      <header className="header">
        <div className="container header-inner">
          <a href="#inicio" className="brand-logo">
            <div className="logo-icon">AI</div>
            <div className="logo-text">
              AUTOIA<span>Perú</span>
            </div>
          </a>

          <nav className="nav-links">
            <a href="#inicio">Inicio</a>
            <a href="#buscador">Buscador</a>
            <a href="#categorias">Categorías</a>
            <a href="#catalogo">Explorar autos</a>
            <a href="#comparador">Comparar</a>
            <a href="#asistente">Asistente IA</a>
            <a href="#guia">Guía de compra</a>
          </nav>

          <div className="nav-actions">
            <button
              className="btn-accent"
              onClick={() => {
                document.getElementById("asistente")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              ✦ Encontrar mi auto
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 2. Hero Principal */}
        <section className="hero-section" id="inicio">
          <div className="container hero-grid">
            <div className="hero-content">
              <div className="hero-tag">
                <span className="dot" /> ASESORÍA AUTOMOTRIZ INTELIGENTE
              </div>
              <h1 className="hero-title">
                Encuentra el auto <em>perfecto para ti.</em>
              </h1>
              <p className="hero-desc">
                Cuéntanos qué necesitas, cuánto quieres invertir y cómo utilizarás tu auto. Nuestra asistente te ayudará
                a descubrir las opciones que mejor se adaptan a ti en el mercado peruano.
              </p>
              <div className="hero-buttons">
                <button
                  className="btn-accent"
                  onClick={() => {
                    document.getElementById("asistente")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Hablar con AIDA ↗
                </button>
                <a className="btn-secondary" href="#catalogo">
                  Explorar vehículos
                </a>
              </div>
              <div className="hero-indicators">
                <div className="hero-indicator-item">
                  <div className="hero-indicator-icon">✓</div>
                  <span>Recomendaciones personalizadas</span>
                </div>
                <div className="hero-indicator-item">
                  <div className="hero-indicator-icon">⚖</div>
                  <span>Comparación de vehículos</span>
                </div>
                <div className="hero-indicator-item">
                  <div className="hero-indicator-icon">S/</div>
                  <span>Asesoría según tu presupuesto</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <img src="/images/hero-autoia.svg" alt="Vehículo moderno de alta gama en escenario arquitectónico" />
              <div className="hero-float-card">
                <small>Tu próxima elección</small>
                <strong>Toyota Corolla Cross Híbrido</strong>
                <p>SUV compacta · 5 pasajeros · Bajo consumo (75 km/gal)</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Buscador Inteligente de Vehículos */}
        <section className="search-section" id="buscador">
          <div className="container">
            <div className="search-box">
              <div className="search-header">
                <div>
                  <h3>Buscador Inteligente de Vehículos</h3>
                  <p>Ajusta los criterios según tus necesidades reales para filtrar el catálogo en vivo.</p>
                </div>
                <span className="search-results-count">
                  Mostrando <b>{filteredVehicles.length}</b> de <b>{vehicles.length}</b> autos
                </span>
              </div>

              <div className="search-filters-grid">
                {/* Categoría */}
                <div className="filter-group">
                  <label>Tipo de Carrocería</label>
                  <select
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as VehicleCategory | "Todas")}
                  >
                    <option value="Todas">Todas las categorías</option>
                    {vehicleCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condición */}
                <div className="filter-group">
                  <label>Condición</label>
                  <select
                    className="filter-select"
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value as VehicleCondition | "Todos")}
                  >
                    <option value="Todos">Todos (Nuevos y Usados)</option>
                    <option value="Nuevo">Nuevos (0 km)</option>
                    <option value="Usado">Seminuevos / Usados certificados</option>
                  </select>
                </div>

                {/* Combustible */}
                <div className="filter-group">
                  <label>Combustible</label>
                  <select
                    className="filter-select"
                    value={selectedFuel}
                    onChange={(e) => setSelectedFuel(e.target.value as FuelType | "Todos")}
                  >
                    <option value="Todos">Todos los combustibles</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Híbrido">Híbridos (HEV)</option>
                    <option value="Eléctrico">100% Eléctricos (EV)</option>
                    <option value="Diésel">Diésel</option>
                  </select>
                </div>

                {/* Presupuesto Máximo */}
                <div className="filter-group">
                  <label>
                    Presupuesto máximo: <b>S/ {maxBudget.toLocaleString("es-PE")}</b>
                  </label>
                  <div className="budget-range-wrapper">
                    <input
                      type="range"
                      min={40000}
                      max={145000}
                      step={5000}
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                    />
                    <span className="budget-value">S/ {maxBudget.toLocaleString("es-PE")}</span>
                  </div>
                </div>
              </div>

              <div className="search-footer">
                <div className="search-input-text">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar por marca, modelo o palabra clave (ej. Yaris, Híbrido, 7 pasajeros)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    className="filter-select"
                    style={{ width: "auto" }}
                    value={selectedTransmission}
                    onChange={(e) => setSelectedTransmission(e.target.value as TransmissionType | "Todas")}
                  >
                    <option value="Todas">Transmisión: Todas</option>
                    <option value="Automática">Automática</option>
                    <option value="Mecánica">Mecánica</option>
                    <option value="CVT">CVT</option>
                  </select>

                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setSelectedCategory("Todas");
                      setSelectedCondition("Todos");
                      setSelectedFuel("Todos");
                      setSelectedTransmission("Todas");
                      setMaxBudget(145000);
                      setSearchQuery("");
                      setToast("Filtros restablecidos.");
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Sección de Categorías */}
        <section className="categories-section" id="categorias">
          <div className="container">
            <div className="section-head">
              <p className="section-kicker">SEGMENTOS DEL MERCADO</p>
              <h2 className="section-title">¿Qué tipo de auto estás buscando?</h2>
              <p className="section-desc">
                Explora opciones según tu estilo de vida. Selecciona una categoría para ver los modelos disponibles.
              </p>
            </div>

            <div className="categories-grid">
              {vehicleCategories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <div
                    key={cat.id}
                    className={`category-card ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setSelectedCategory(isSelected ? "Todas" : cat.name);
                      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <div className="cat-icon-wrap">{cat.icon}</div>
                    <h4>{cat.name}</h4>
                    <p>{cat.description}</p>
                    <div className="cat-action">
                      <span>{isSelected ? "Filtro activo ✓" : "Explorar categoría"}</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Catálogo de Autos Recomendados */}
        <section className="catalog-section" id="catalogo">
          <div className="container">
            <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <p className="section-kicker">INVENTARIO SELECCIONADO</p>
                <h2 className="section-title">Autos que podrían interesarte.</h2>
                <p className="section-desc">
                  Vehículos evaluados para el mercado peruano. Datos demostrativos para asesoría y comparación transparente.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>Ordenar por:</span>
                <select
                  className="filter-select"
                  style={{ width: "auto" }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                >
                  <option value="relevancia">Relevancia</option>
                  <option value="precio-asc">Menor precio</option>
                  <option value="precio-desc">Mayor precio</option>
                  <option value="recientes">Año más reciente</option>
                </select>
              </div>
            </div>

            <div className="catalog-grid">
              {filteredVehicles.length === 0 ? (
                <div className="empty-catalog">
                  <h4>No encontramos vehículos con estos filtros</h4>
                  <p>Intenta ampliar tu rango de presupuesto o seleccionar &ldquo;Todas&rdquo; en carrocerías.</p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSelectedCategory("Todas");
                      setSelectedCondition("Todos");
                      setSelectedFuel("Todos");
                      setMaxBudget(145000);
                      setSearchQuery("");
                    }}
                  >
                    Ver todos los vehículos
                  </button>
                </div>
              ) : (
                filteredVehicles.map((car) => {
                  const isCompared = comparedCarIds.includes(car.id);
                  return (
                    <article className="car-card" key={car.id}>
                      <div className="car-card-media">
                        <img src={car.image} alt={`${car.brand} ${car.model}`} />
                        <span className={`car-condition-badge ${car.condition === "Nuevo" ? "nuevo" : "usado"}`}>
                          {car.condition === "Nuevo" ? "0 km · Nuevo" : `Usado · ${car.mileage?.toLocaleString("es-PE")} km`}
                        </span>

                        <button
                          className={`car-compare-toggle ${isCompared ? "selected" : ""}`}
                          onClick={() => toggleCompareCar(car.id)}
                          title="Añadir a la tabla de comparación"
                        >
                          <span>{isCompared ? "✓ Comparando" : "+ Comparar"}</span>
                        </button>
                      </div>

                      <div className="car-card-body">
                        <div className="car-card-header">
                          <div className="car-brand-model">
                            <h3>
                              {car.brand} {car.model}
                            </h3>
                            <div className="car-version">{car.version}</div>
                          </div>
                          <span className="car-year">{car.year}</span>
                        </div>

                        <div className="car-price-row">
                          <span className="car-price">S/ {car.price.toLocaleString("es-PE")}</span>
                          <span className="car-price-sub">precio referencial</span>
                        </div>

                        <div className="car-specs-chips">
                          <div className="spec-chip">
                            <span className="spec-chip-icon">⚙</span>
                            <span>{car.transmission}</span>
                          </div>
                          <div className="spec-chip">
                            <span className="spec-chip-icon">⛽</span>
                            <span>{car.fuel}</span>
                          </div>
                          <div className="spec-chip">
                            <span className="spec-chip-icon">🌿</span>
                            <span>{car.consumption.split(" ")[0]} km/gal</span>
                          </div>
                          <div className="spec-chip">
                            <span className="spec-chip-icon">👥</span>
                            <span>{car.seats} pasajeros</span>
                          </div>
                        </div>

                        <p className="car-highlight">&ldquo;{car.highlight}&rdquo;</p>

                        <div className="car-card-actions">
                          <button
                            className="btn-card-details"
                            onClick={() => setSelectedVehicle(car)}
                          >
                            Ver detalles
                          </button>
                          <button
                            className="btn-card-ask"
                            onClick={() => {
                              void sendMessage(`Quiero consultar sobre el ${car.brand} ${car.model} (${car.year}).`, car);
                              document.getElementById("asistente")?.scrollIntoView({ behavior: "smooth" });
                            }}
                          >
                            Consultar a AIDA
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* 6. Comparador de Vehículos */}
        <section className="comparator-section" id="comparador">
          <div className="container">
            <div className="section-head">
              <p className="section-kicker">HERRAMIENTA TÉCNICA</p>
              <h2 className="section-title">Compara antes de decidir.</h2>
              <p className="section-desc">
                Selecciona entre dos o tres modelos para contrastar precios, motor, consumo y habitabilidad lado a lado.
              </p>
            </div>

            <div className="comparator-bar">
              <div className="comparator-slots">
                <span style={{ fontSize: "13px", fontWeight: 700, marginRight: "6px" }}>Comparando ({comparedVehicles.length}/3):</span>
                {comparedVehicles.map((car) => (
                  <div key={car.id} className="slot-badge">
                    <span>{car.brand} {car.model}</span>
                    <button onClick={() => toggleCompareCar(car.id)} title="Quitar">×</button>
                  </div>
                ))}
                {comparedVehicles.length < 3 && (
                  <span className="slot-empty">
                    + Selecciona {3 - comparedVehicles.length} auto{3 - comparedVehicles.length > 1 ? "s" : ""} más en el catálogo
                  </span>
                )}
              </div>

              {comparedVehicles.length >= 2 && (
                <button className="btn-accent" onClick={askAidaAboutComparison}>
                  ✦ Ayúdame a elegir entre estos autos
                </button>
              )}
            </div>

            {comparedVehicles.length < 2 ? (
              <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-main)", borderRadius: "var(--radius-md)" }}>
                <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                  Por favor selecciona al menos dos vehículos del catálogo pulsando el botón <b>&ldquo;+ Comparar&rdquo;</b> en cada tarjeta.
                </p>
              </div>
            ) : (
              <>
                {/* Gráfico Radial Multidimensional de Características */}
                <RadarChart vehicles={comparedVehicles} />

                {/* Tabla Detallada de Especificaciones Técnicas */}
                <div className="comparator-table-wrap">
                  <table className="compare-table">
                  <thead>
                    <tr>
                      <th>Especificación</th>
                      {comparedVehicles.map((car) => (
                        <th key={car.id} className="compare-car-header">
                          <img src={car.image} alt={car.name} />
                          <strong>{car.brand} {car.model}</strong>
                          <small style={{ color: "var(--muted)", display: "block" }}>{car.version} ({car.year})</small>
                          <span>S/ {car.price.toLocaleString("es-PE")}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Condición / Kilometraje</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>
                          <b>{car.condition}</b> {car.mileage ? `(${car.mileage.toLocaleString("es-PE")} km)` : "(0 km)"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Carrocería</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>{car.category}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Motorización</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>
                          <strong>{car.engine}</strong>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Potencia</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>{car.power}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Consumo estimado</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>
                          <span style={{ color: "var(--charcoal)", fontWeight: 700 }}>{car.consumption}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Transmisión</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>{car.transmission}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Combustible</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>{car.fuel}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Capacidad de Pasajeros</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>
                          <b>{car.seats} personas</b>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Capacidad de Maletero</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>{car.trunk}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Seguridad Principal</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>
                          <ul style={{ paddingLeft: "16px", fontSize: "12px", color: "#4A4D4A" }}>
                            {car.safety.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Equipamiento Destacado</td>
                      {comparedVehicles.map((car) => (
                        <td key={car.id}>
                          <ul style={{ paddingLeft: "16px", fontSize: "12px", color: "#4A4D4A" }}>
                            {car.equipment.map((eq, idx) => (
                              <li key={idx}>{eq}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 7. Presentación de la Asistente AIDA (Banner) */}
        <section className="container">
          <div className="advisor-banner-section">
            <div className="advisor-banner-grid">
              <div className="advisor-banner-content">
                <p className="section-kicker">ORIENTACIÓN TRANSPARENTE</p>
                <h2>No sabes qué auto elegir. Nosotros te ayudamos.</h2>
                <p>
                  No necesitas conocer todas las marcas ni sus especificaciones. Responde unas preguntas y recibe
                  recomendaciones adaptadas a tus necesidades reales, con análisis de ventajas y costos.
                </p>

                <button
                  className="btn-accent"
                  onClick={() => {
                    document.getElementById("asistente")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Hablar con AIDA ahora ↗
                </button>
              </div>

              <div className="advisor-benefits">
                <div className="benefit-item">
                  <div className="benefit-icon">1</div>
                  <div className="benefit-text">
                    <strong>Recomendaciones según tu presupuesto</strong>
                    <span>Calculamos opciones reales considerando trámites, seguro y combustible.</span>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">2</div>
                  <div className="benefit-text">
                    <strong>Vehículos para tu estilo de vida</strong>
                    <span>Ya sea para tráfico de ciudad, viajes familiares o trabajo con carga pesada.</span>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">3</div>
                  <div className="benefit-text">
                    <strong>Comparaciones que facilitan la decisión</strong>
                    <span>Sin favoritismos comerciales: evaluamos pros y contras objetivos de cada marca.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Experiencia Conversacional: AIDA (Asesora IA) */}
        <section className="chat-section" id="asistente">
          <div className="container">
            <div className="section-head">
              <p className="section-kicker">ASISTENTE CONVERSACIONAL</p>
              <h2 className="section-title">AIDA: Tu Asesora Automotriz Inteligente</h2>
              <p className="section-desc">
                Interactúa en lenguaje natural. AIDA analiza el catálogo y te orienta sin sesgos de concesionaria.
              </p>
            </div>

            <div className="chat-wrapper">
              {/* Sidebar de AIDA */}
              <aside className="chat-sidebar">
                <div className="aida-profile">
                  <div className="aida-avatar">AI</div>
                  <div className="aida-info">
                    <h3>{brand.assistantName}</h3>
                    <p>{brand.assistantRole}</p>
                  </div>
                </div>

                <div className="status-indicator">
                  <span className={`status-dot ${connected ? "" : "offline"}`} />
                  <span>{connected ? `Ollama conectado (${model || "local"})` : "Modo Asesoría Demostrativa"}</span>
                </div>

                {models.length > 0 && (
                  <div className="model-selector-wrap">
                    <label>Modelo LLM</label>
                    <select value={model} onChange={(e) => setModel(e.target.value)}>
                      {models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sidebar-pref-box">
                  <h5>Perfil Detectado</h5>
                  <div className="pref-list">
                    <div className="pref-item">
                      <span>Uso:</span>
                      <strong>{detectedPrefs.usage ?? "Por definir"}</strong>
                    </div>
                    <div className="pref-item">
                      <span>Presupuesto:</span>
                      <strong>{detectedPrefs.budgetMax ? `S/ ${detectedPrefs.budgetMax.toLocaleString("es-PE")}` : "Por definir"}</strong>
                    </div>
                    <div className="pref-item">
                      <span>Condición:</span>
                      <strong>{detectedPrefs.condition ?? "Cualquiera"}</strong>
                    </div>
                    <div className="pref-item">
                      <span>Pasajeros:</span>
                      <strong>{detectedPrefs.passengers ? `${detectedPrefs.passengers} personas` : "Estándar (5)"}</strong>
                    </div>
                    <div className="pref-item">
                      <span>Prioridad:</span>
                      <strong>{detectedPrefs.priority ?? "Equilibrio general"}</strong>
                    </div>
                  </div>
                </div>

                <button className="btn-reset-chat" onClick={resetChat}>
                  ↻ Reiniciar asesoría
                </button>
              </aside>

              {/* Área Principal de Conversación */}
              <div className="chat-main">
                <div className="chat-messages-container">
                  {messages.map((msg, index) => (
                    <div key={index} className={`chat-msg ${msg.role}`}>
                      <div className="msg-avatar">{msg.role === "assistant" ? "AI" : "Tú"}</div>
                      <div className="msg-bubble">
                        <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>

                        {/* Tarjetas de autos recomendados en la respuesta */}
                        {msg.cars && msg.cars.length > 0 && (
                          <div className="chat-msg-cars-grid">
                            {msg.cars.map((c) => (
                              <div key={c.id} className="chat-car-mini">
                                <strong>{c.brand} {c.model}</strong>
                                <small style={{ color: "var(--muted)", fontSize: "11px" }}>{c.category} · {c.condition}</small>
                                <span>S/ {c.price.toLocaleString("es-PE")}</span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    onClick={() => setSelectedVehicle(c)}
                                    style={{ background: "var(--bg-main)", color: "var(--charcoal)", border: "1px solid var(--border)" }}
                                  >
                                    Ficha
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDraft({
                                        lines: [{ itemId: c.id, name: `${c.brand} ${c.model}`, quantity: 1, unitPrice: c.price, vehicle: c }],
                                        fulfillment: "Cotización formal"
                                      });
                                      setShowQuoteModal(true);
                                    }}
                                  >
                                    Cotizar
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="chat-msg assistant">
                      <div className="msg-avatar">AI</div>
                      <div className="msg-bubble chat-typing">AIDA está analizando opciones para ti</div>
                    </div>
                  )}
                </div>

                {/* Confirmación rápida cuando el usuario decide cotizar */}
                {ready && draft.lines.length > 0 && (
                  <div className="chat-confirm-box">
                    <span>Has preseleccionado: <b>{draft.lines.map((l) => l.name).join(", ")}</b></span>
                    <button className="btn-accent" onClick={() => setShowQuoteModal(true)}>
                      Solicitar Asesoría y Cotización ↗
                    </button>
                  </div>
                )}

                {/* Opciones rápidas iniciales mediante Chips */}
                <div className="quick-chips-wrap">
                  <button className="chip-btn" onClick={() => void sendMessage("Busco mi primer auto")}>
                    🚗 Busco mi primer auto
                  </button>
                  <button className="chip-btn" onClick={() => void sendMessage("Necesito un auto familiar")}>
                    👨‍👩‍👧‍👦 Necesito un auto familiar
                  </button>
                  <button className="chip-btn" onClick={() => void sendMessage("Quiero gastar poco combustible")}>
                    ⚡ Quiero poco combustible
                  </button>
                  <button className="chip-btn" onClick={() => void sendMessage("Busco una SUV espaciosa")}>
                    🚙 Busco una SUV
                  </button>
                  <button className="chip-btn" onClick={() => void sendMessage("Quiero comprar un auto usado certificado")}>
                    🛡️ Auto usado certificado
                  </button>
                  <button className="chip-btn" onClick={() => void sendMessage("Tengo un presupuesto de 60 mil soles")}>
                    💰 Presupuesto S/ 60,000
                  </button>
                </div>

                {/* Input de chat */}
                <form
                  className="chat-input-bar"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendMessage(input);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Escribe tu consulta o responde a AIDA..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button className="chat-send-btn" type="submit" disabled={!input.trim() || loading}>
                    ↑
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Promociones y Campañas */}
        <section className="container" style={{ padding: "30px 0 60px" }}>
          <div className="section-head">
            <p className="section-kicker">OPORTUNIDADES DESTACADAS</p>
            <h2 className="section-title">Bonos y Campañas de Financiamiento</h2>
            <p className="section-desc">
              Beneficios vigentes para la adquisición de vehículos nuevos y retoma de autos usados.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {promotions.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--charcoal)",
                    background: "var(--accent-tint)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    alignSelf: "flex-start",
                    marginBottom: "12px"
                  }}
                >
                  {p.badge}
                </span>
                <h4 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "8px" }}>{p.name}</h4>
                <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.5, marginBottom: "16px", flex: 1 }}>
                  {p.description}
                </p>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: "15px", color: "var(--charcoal)" }}>{p.discount}</b>
                  <button
                    className="btn-secondary"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => {
                      void sendMessage(`Quiero consultar sobre la promoción de ${p.name}.`);
                      document.getElementById("asistente")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Consultar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Centro de Conocimiento Automotriz (RAG / Guía de Compra) */}
        <section className="knowledge-section" id="guia">
          <div className="container">
            <div className="section-head">
              <p className="section-kicker">GUÍA PRÁCTICA AUTOMOTRIZ</p>
              <h2 className="section-title">Compra tu próximo auto con confianza.</h2>
              <p className="section-desc">
                Respuestas claras a las dudas más comunes sobre presupuesto, trámites legales en SUNARP, consumo y mantenimiento en Perú.
              </p>
            </div>

            {/* Acordeón de FAQ */}
            <div className="faq-grid">
              {automotiveKnowledge.map((item: KnowledgeEntry) => {
                const isOpen = openFaq === item.id;
                return (
                  <div key={item.id} className={`faq-card ${isOpen ? "open" : ""}`}>
                    <button
                      className="faq-question"
                      onClick={() => setOpenFaq(isOpen ? null : item.id)}
                    >
                      <span>{item.title}</span>
                      <span className="faq-toggle-icon">+</span>
                    </button>
                    {isOpen && (
                      <div className="faq-answer">
                        <p>{item.content}</p>
                        <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {item.tags.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: "11px",
                                fontFamily: "'JetBrains Mono', monospace",
                                background: "var(--bg-main)",
                                color: "var(--muted)",
                                padding: "2px 8px",
                                borderRadius: "4px"
                              }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Buscador RAG Teórico */}
            <div className="faq-rag-search">
              <span style={{ fontSize: "18px" }}>📖</span>
              <input
                type="text"
                placeholder="¿Tienes otra duda técnica o legal? (ej: ¿Qué es el gravamen vehicular en SUNARP? o ¿Cuánto paga de impuesto SAT?)..."
                value={theoryQuery}
                onChange={(e) => setTheoryQuery(e.target.value)}
              />
              <button className="btn-primary" onClick={handleTheorySearch}>
                Consultar RAG ↗
              </button>
            </div>

            {ragNotice && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  background: "var(--white)",
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ fontSize: "16px" }}>{ragNotice.title}</strong>
                  <button
                    onClick={() => setRagNotice(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
                  >
                    ✕
                  </button>
                </div>
                <p style={{ fontSize: "13.5px", color: "#4A4D4A", lineHeight: 1.6 }}>{ragNotice.content}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 11. Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="brand-logo">
                <div className="logo-icon" style={{ background: "var(--accent)", color: "var(--charcoal)" }}>
                  AI
                </div>
                <div className="logo-text" style={{ color: "var(--white)" }}>
                  AUTOIA<span>Perú</span>
                </div>
              </div>
              <p>
                Plataforma de recomendación automotriz con Inteligencia Artificial. Conectamos compradores con su auto ideal mediante datos objetivos y asesoría experta.
              </p>
            </div>

            <div className="footer-col">
              <h5>Categorías</h5>
              <ul>
                <li><a href="#catalogo" onClick={() => setSelectedCategory("SUV")}>SUV y Crossovers</a></li>
                <li><a href="#catalogo" onClick={() => setSelectedCategory("Sedanes")}>Sedanes Familiares</a></li>
                <li><a href="#catalogo" onClick={() => setSelectedCategory("Híbridos y eléctricos")}>Híbridos y Eléctricos</a></li>
                <li><a href="#catalogo" onClick={() => setSelectedCategory("Pickups")}>Pickups 4x4</a></li>
                <li><a href="#catalogo" onClick={() => setSelectedCategory("Autos urbanos y económicos")}>Autos Urbanos</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Herramientas</h5>
              <ul>
                <li><a href="#buscador">Buscador por presupuesto</a></li>
                <li><a href="#comparador">Comparador técnico</a></li>
                <li><a href="#asistente">Asistente AIDA</a></li>
                <li><a href="#guia">Guía de compra SUNARP</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Contacto & Soporte</h5>
              <ul>
                <li>{business.location}</li>
                <li>{business.schedule}</li>
                <li>Email: {brand.contactEmail}</li>
                <li>Atención en línea a nivel nacional</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 {brand.name} Perú. Todos los derechos reservados.</span>
            <span>{brand.disclaimer}</span>
          </div>
        </div>
      </footer>

      {/* Modal Ficha Técnica de Vehículo */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedVehicle(null)}>
              ✕
            </button>

            <div className="modal-header">
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--accent)",
                  background: "var(--charcoal)",
                  padding: "4px 10px",
                  borderRadius: "6px"
                }}
              >
                {selectedVehicle.category} · {selectedVehicle.condition}
              </span>
              <h2 style={{ marginTop: "12px" }}>
                {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.year}
              </h2>
              <p>{selectedVehicle.version}</p>
              <h3 style={{ fontSize: "28px", fontWeight: 900, marginTop: "8px", color: "var(--charcoal)" }}>
                S/ {selectedVehicle.price.toLocaleString("es-PE")}
              </h3>
            </div>

            <img
              src={selectedVehicle.image}
              alt={selectedVehicle.name}
              style={{ width: "100%", maxHeight: "320px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
            />

            <div className="modal-specs-grid">
              <div className="modal-spec-item">
                <strong>Motor</strong>
                <span>{selectedVehicle.engine}</span>
              </div>
              <div className="modal-spec-item">
                <strong>Potencia</strong>
                <span>{selectedVehicle.power}</span>
              </div>
              <div className="modal-spec-item">
                <strong>Consumo</strong>
                <span>{selectedVehicle.consumption}</span>
              </div>
              <div className="modal-spec-item">
                <strong>Transmisión</strong>
                <span>{selectedVehicle.transmission}</span>
              </div>
              <div className="modal-spec-item">
                <strong>Combustible</strong>
                <span>{selectedVehicle.fuel}</span>
              </div>
              <div className="modal-spec-item">
                <strong>Pasajeros</strong>
                <span>{selectedVehicle.seats} personas</span>
              </div>
              <div className="modal-spec-item">
                <strong>Maletero</strong>
                <span>{selectedVehicle.trunk}</span>
              </div>
              <div className="modal-spec-item">
                <strong>Disponibilidad</strong>
                <span>{selectedVehicle.availability}</span>
              </div>
            </div>

            <div className="modal-pros-cons">
              <div className="pros-box">
                <h5>Puntos Fuertes y Ventajas</h5>
                <ul>
                  {selectedVehicle.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="cons-box">
                <h5>Aspectos a Considerar</h5>
                <ul>
                  {selectedVehicle.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>Seguridad Incluida</h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedVehicle.safety.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      background: "var(--bg-main)",
                      border: "1px solid var(--border)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px"
                    }}
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Gráfico Radial de Características y Rendimiento */}
            <div style={{ margin: "24px 0", padding: "20px", background: "var(--bg-main)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <h5 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✦</span> Análisis Radial de Capacidades del Vehículo
              </h5>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px" }}>
                Puntaje evaluado de 0 a 100 en los 6 pilares de decisión automotriz en Perú.
              </p>
              <RadarChart vehicles={[selectedVehicle]} size={360} showLegend={false} showBreakdown={true} />
            </div>

            <div className="modal-actions">
              <button
                className="btn-accent"
                onClick={() => {
                  setSelectedVehicle(null);
                  void sendMessage(`Quiero consultar sobre el ${selectedVehicle.brand} ${selectedVehicle.model}.`, selectedVehicle);
                  document.getElementById("asistente")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                ✦ Consultar a AIDA sobre este auto
              </button>

              <button
                className="btn-secondary"
                onClick={() => {
                  toggleCompareCar(selectedVehicle.id);
                  setSelectedVehicle(null);
                }}
              >
                {comparedCarIds.includes(selectedVehicle.id) ? "Quitar de comparación" : "Añadir al comparador"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Solicitud de Cotización / Asesoría */}
      {showQuoteModal && (
        <div className="modal-overlay" onClick={() => setShowQuoteModal(false)}>
          <div className="modal-content" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowQuoteModal(false)}>
              ✕
            </button>

            <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>Solicitud de Asesoría y Cotización</h3>
            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>
              Ingresa tus datos para recibir la propuesta formal, condiciones de financiamiento y programar un Test Drive.
            </p>

            <form onSubmit={submitQuoteRequest} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  className="filter-input"
                  value={quoteForm.name}
                  onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 987 654 321"
                  className="filter-input"
                  value={quoteForm.phone}
                  onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                  Tipo de solicitud
                </label>
                <select
                  className="filter-select"
                  value={quoteForm.inquiryType}
                  onChange={(e) => setQuoteForm({ ...quoteForm, inquiryType: e.target.value })}
                >
                  <option value="Cotización formal con bono">Cotización formal con bono de financiamiento</option>
                  <option value="Test Drive en Concesionario">Agendar Test Drive en concesionario</option>
                  <option value="Evaluación de Retoma de auto usado">Tasación para retoma de mi auto usado</option>
                  <option value="Asesoría personalizada con AIDA">Asesoría telefónica personalizada</option>
                </select>
              </div>

              <button className="btn-accent" type="submit" style={{ marginTop: "10px", width: "100%" }}>
                Enviar Solicitud ↗
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notificación Toast Flotante */}
      {toast && (
        <div className="toast-notice">
          <span>{toast}</span>
          <button onClick={() => setToast("")}>✕</button>
        </div>
      )}
    </div>
  );
}
