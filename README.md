# AUTOIA: Plataforma Inteligente de Recomendación de Autos

**AUTOIA** es una plataforma moderna e interactiva especializada en el mundo automotriz en el Perú. Ayuda a los usuarios a encontrar, comparar y elegir el vehículo ideal según sus necesidades, presupuesto, estilo de vida y preferencias reales, guiados por **AIDA**, una asesora automotriz con Inteligencia Artificial.

---

## ✦ Qué incluye la plataforma

- **Identidad de marca premium**: Paleta automotriz tecnológica (#F7F7F4, #1D1F1E, #C8F36A, #858780), tipografía sans serif moderna y diseño editorial responsivo.
- **Hero automotriz con llamada a la acción**: Visual editorial de alta gama, indicadores de valor y tarjeta HUD flotante de recomendación en vivo.
- **Buscador inteligente de vehículos**: Filtros interactivos por presupuesto máximo en soles (S/), tipo de carrocería, condición (nuevo vs usado), combustible, transmisión y buscador de texto libre.
- **Explorador de categorías**: 7 segmentos de mercado (Sedanes, SUV, Hatchbacks, Pickups, Camionetas familiares de 7 asientos, Autos urbanos y económicos, Híbridos y eléctricos).
- **Catálogo de vehículos demostrativo**: Tarjetas con especificaciones técnicas reales para el mercado peruano (motor, potencia, consumo en km/gal, precio en S/, kilometraje, maletero y equipamiento).
- **Comparador técnico de vehículos**: Permite seleccionar hasta 3 modelos lado a lado para contrastar dimensiones, motorización, consumos y equipamiento, con el botón *"Ayúdame a elegir entre estos autos"* conectado a la IA.
- **Asistente inteligente AIDA**:
  - Personalidad neutral, experta y cercana.
  - Funciona con **Ollama local** (`llama3.2:3b`, `gemma3:1b`) o proveedores en la nube (OpenAI, NVIDIA).
  - Incluye **motor demostrativo por reglas** para operar sin dependencias externas.
  - Reconoce presupuesto, uso principal, cantidad de pasajeros y prioridades.
  - Presenta tarjetas interactivas de vehículos dentro de la conversación.
- **Centro de conocimiento automotriz (RAG)**: Guía práctica sobre compra de autos en Perú (presupuesto, nuevo vs usado, revisión legal en SUNARP y SAT, diferencias SUV vs sedán, consumo real y gastos de transferencia/SOAT).
- **Módulo de cotización y test drive**: Permite registrar solicitudes de contacto formal vinculadas a la API (`POST /api/orders`).
- **Arquitectura robusta de APIs**:
  - `POST /api/chat`: Conversación y asesoría con AIDA.
  - `GET /api/models`: Modelos LLM disponibles en Ollama.
  - `GET /api/health`: Estado de conexión con el motor de IA.
  - `GET /api/knowledge`: Búsqueda semántica (RAG) sobre temas automotrices.
  - `GET|POST /api/orders`: Registro y listado de solicitudes de cotización.

---

## 🚗 Arquitectura del Sistema

```text
UI (Next.js 15 + React 18)
      ↓
API Routes (/api/chat, /api/knowledge, /api/orders, /api/health, /api/models)
      ↓
Orquestador AIDA (lib/conversation.ts)
      ↓ ↳ Recuperador RAG (lib/knowledge.ts)
      ↓ ↳ Catálogo Automotriz (lib/catalog.ts)
      ↓ ↳ Motor LLM (Ollama compatible OpenAI / Fallback demostrativo)
      ↓
Store de Solicitudes (lib/store.ts)
```

---

## ⚡ Ejecución Rápida

1. Instalar dependencias e iniciar el servidor:
   ```bash
   npm install
   npm run dev
   ```
2. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
3. El sistema detecta automáticamente si Ollama está en ejecución en `http://127.0.0.1:11434`. Si no lo está, opera sin interrupciones en **Modo Asesoría Demostrativa**.

---

## 🤖 Configuración de Ollama (Recomendado)

En el archivo `.env.local`:
```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434/v1
OLLAMA_MODEL=llama3.2:3b
OLLAMA_MODELS=llama3.2:3b,gemma3:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

Para descargar modelos en Ollama:
```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

---

## 🛠️ Flujo Demostrativo Recomendado

1. En el **Hero**, presiona **"✦ Encontrar mi auto"** para ir al Asistente AIDA.
2. Selecciona un chip rápido como *"🚗 Busco mi primer auto"* o escribe *"Tengo 60 mil soles y quiero un auto para ciudad"*.
3. Observa cómo AIDA analiza el presupuesto, explica los gastos adicionales en Perú (SOAT, impuesto SAT) y recomienda opciones como el **Kia Picanto** o el **Suzuki Swift**.
4. En el catálogo, presiona **"+ Comparar"** en 2 o 3 vehículos y sube al **Comparador**.
5. Pulsa **"✦ Ayúdame a elegir entre estos autos"** para que AIDA compare objetivamente pros y contras.
6. Abre la **Guía de compra** y consulta conceptos de revisión vehicular en SUNARP.
