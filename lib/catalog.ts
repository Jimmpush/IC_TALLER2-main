export type VehicleCategory =
  | "Sedanes"
  | "SUV"
  | "Hatchbacks"
  | "Pickups"
  | "Camionetas familiares"
  | "Autos urbanos y económicos"
  | "Híbridos y eléctricos";

export type FuelType = "Gasolina" | "Híbrido" | "Eléctrico" | "Diésel" | "GLP / GNV";
export type TransmissionType = "Automática" | "Mecánica" | "CVT";
export type VehicleCondition = "Nuevo" | "Usado";

export type VehicleRadarScores = {
  eficiencia: number; // 0 - 100: Consumo de combustible / ahorro energético
  potencia: number; // 0 - 100: Potencia HP, torque y aceleración
  seguridad: number; // 0 - 100: Airbags, frenos, ESP, asistencias ADAS
  espacio: number; // 0 - 100: Capacidad de pasajeros, habitabilidad y maletero
  tecnologia: number; // 0 - 100: Infoentretenimiento, conectividad, equipamiento
  reventa: number; // 0 - 100: Facilidad de reventa, costo de repuestos y retención de valor en Perú
};

export const radarAxes = [
  { key: "eficiencia", label: "Eficiencia & Consumo", icon: "⚡" },
  { key: "potencia", label: "Potencia & Respuesta", icon: "🚀" },
  { key: "seguridad", label: "Seguridad Activa", icon: "🛡️" },
  { key: "espacio", label: "Espacio & Maletero", icon: "🧳" },
  { key: "tecnologia", label: "Tecnología & Confort", icon: "📱" },
  { key: "reventa", label: "Valor de Reventa", icon: "💎" }
] as const;

export type Vehicle = {
  id: string;
  name: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number; // en Soles (S/)
  condition: VehicleCondition;
  mileage: number | null; // km (null si es nuevo)
  category: VehicleCategory;
  fuel: FuelType;
  transmission: TransmissionType;
  engine: string;
  power: string;
  consumption: string;
  seats: number;
  trunk: string;
  safety: string[];
  equipment: string[];
  image: string;
  description: string;
  highlight: string;
  pros: string[];
  cons: string[];
  radarScores: VehicleRadarScores;
  dataSource: string;
  availability: "En stock inmediato" | "Disponible en concesionario";
  available?: boolean;
};

// Aliases para compatibilidad con código existente
export type CatalogItem = Vehicle;

export const vehicleCategories: Array<{
  id: VehicleCategory;
  name: VehicleCategory;
  description: string;
  icon: string;
  samplePriceFrom: number;
  image: string;
}> = [
  {
    id: "Autos urbanos y económicos",
    name: "Autos urbanos y económicos",
    description: "Fáciles de estacionar, excelente rendimiento de combustible y mantenimiento accesible.",
    icon: "🚗",
    samplePriceFrom: 41500,
    image: "/images/cat-urban.svg"
  },
  {
    id: "Sedanes",
    name: "Sedanes",
    description: "Comodidad ejecutiva, maletero independiente y óptimo confort para viajes y ciudad.",
    icon: "🚘",
    samplePriceFrom: 64500,
    image: "/images/cat-sedan.svg"
  },
  {
    id: "SUV",
    name: "SUV",
    description: "Altura libre al suelo para pistas peruanas, visibilidad panorámica y versatilidad total.",
    icon: "🚙",
    samplePriceFrom: 58900,
    image: "/images/cat-suv.svg"
  },
  {
    id: "Camionetas familiares",
    name: "Camionetas familiares",
    description: "3 filas de asientos (7 pasajeros) para viajar con toda la familia con máxima seguridad.",
    icon: "🚐",
    samplePriceFrom: 84900,
    image: "/images/cat-familiar.svg"
  },
  {
    id: "Hatchbacks",
    name: "Hatchbacks",
    description: "Estilo juvenil y dinámico, portón trasero práctico y gran maniobrabilidad urbana.",
    icon: "🏎️",
    samplePriceFrom: 53900,
    image: "/images/cat-hatchback.svg"
  },
  {
    id: "Híbridos y eléctricos",
    name: "Híbridos y eléctricos",
    description: "Máxima eficiencia energética, cero o mínimas emisiones y ahorro radical en combustible.",
    icon: "⚡",
    samplePriceFrom: 99500,
    image: "/images/cat-electrico.svg"
  },
  {
    id: "Pickups",
    name: "Pickups",
    description: "Tracción 4x4, chasis reforzado y gran capacidad de carga para trabajo exigente y trocha.",
    icon: "🛻",
    samplePriceFrom: 112000,
    image: "/images/cat-pickup.svg"
  }
];

export const vehicles: Vehicle[] = [
  {
    id: "kia-picanto-2024",
    name: "Kia Picanto 1.2 EX",
    brand: "Kia",
    model: "Picanto",
    version: "1.2 EX Sport Plus",
    year: 2024,
    price: 48900,
    condition: "Nuevo",
    mileage: null,
    category: "Autos urbanos y económicos",
    fuel: "Gasolina",
    transmission: "Mecánica",
    engine: "1.2L DOHC Dual CVVT",
    power: "83 HP @ 6,000 rpm",
    consumption: "60 km/gal (combinado)",
    seats: 5,
    trunk: "255 L",
    safety: ["6 Airbags frontales y laterales", "Frenos ABS + EBD", "Control electrónico estabilidad ESP", "Cámara de retroceso"],
    equipment: ["Pantalla multimedia 8\"", "Apple CarPlay & Android Auto inalámbrico", "Mandos al timón", "Aros de aleación 15\""],
    image: "/images/car-picanto.svg",
    description: "El urbano compacto líder en el Perú. Ágil para el tráfico limeño, económico de mantener y con gran reventa.",
    highlight: "El rey del tráfico urbano con bajísimo consumo.",
    pros: ["Consumo sumamente bajo (hasta 65 km/gal en carretera)", "Muy fácil de estacionar en cualquier espacio", "Repuestos abundantes y económicos en todo el Perú"],
    cons: ["Espacio de maletero limitado para viajes largos", "Aceleración justa con 5 pasajeros adultos"],
    radarScores: {
      eficiencia: 92,
      potencia: 58,
      seguridad: 75,
      espacio: 55,
      tecnologia: 78,
      reventa: 92
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "En stock inmediato",
    available: true
  },
  {
    id: "suzuki-swift-2022",
    name: "Suzuki Swift 1.2 GL",
    brand: "Suzuki",
    model: "Swift",
    version: "1.2 GL Mecánico",
    year: 2022,
    price: 41500,
    condition: "Usado",
    mileage: 32000,
    category: "Autos urbanos y económicos",
    fuel: "Gasolina",
    transmission: "Mecánica",
    engine: "1.2L K12M 4 Cilindros",
    power: "82 HP @ 6,000 rpm",
    consumption: "58 km/gal",
    seats: 5,
    trunk: "268 L",
    safety: ["Doble Airbag", "Frenos ABS + EBD", "Sensores de retroceso posteriores", "Anclajes ISOFIX"],
    equipment: ["Pantalla táctil de 7\"", "Bluetooth / USB", "Aire acondicionado", "Vidrios eléctricos 4 puertas"],
    image: "/images/car-swift.svg",
    description: "Excelente estado, un solo dueño, récord de mantenimientos al día en taller autorizado. Ideal como primer auto.",
    highlight: "Calidad japonesa con excelente relación precio-calidad.",
    pros: ["Motor japonés de altísima durabilidad", "Excelente respuesta dinámica y maniobrabilidad", "Depreciación ya amortizada por el primer dueño"],
    cons: ["No cuenta con airbags laterales", "Acabados interiores con plásticos rígidos"],
    radarScores: {
      eficiencia: 88,
      potencia: 60,
      seguridad: 68,
      espacio: 58,
      tecnologia: 70,
      reventa: 88
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "En stock inmediato",
    available: true
  },
  {
    id: "toyota-yaris-2024",
    name: "Toyota Yaris Sedán 1.5 XLI",
    brand: "Toyota",
    model: "Yaris",
    version: "1.5 XLI CVT",
    year: 2024,
    price: 66900,
    condition: "Nuevo",
    mileage: null,
    category: "Sedanes",
    fuel: "Gasolina",
    transmission: "CVT",
    engine: "1.5L Dual VVT-i 2NR-VE",
    power: "105 HP @ 6,000 rpm",
    consumption: "54 km/gal",
    seats: 5,
    trunk: "475 L",
    safety: ["6 Airbags de serie", "Frenos de disco ABS+EBD+BA", "Control de estabilidad VSC y tracción TRC", "Asistente de arranque en pendientes HAC"],
    equipment: ["Pantalla táctil 9\" con CarPlay y Android Auto", "Cámara de retroceso", "Volante multifunción regulable", "Aire acondicionado digital"],
    image: "/images/car-yaris.svg",
    description: "El sedán más vendido y confiable del Perú. Máximo valor de reventa, gran espacio de maletero y fiabilidad legendaria.",
    highlight: "La compra más segura y confiable del mercado peruano.",
    pros: ["El más alto valor de reventa en el mercado peruano", "Maletero gigante de 475 litros para viajes familiares", "Mantenimiento económico y red nacional Toyota"],
    cons: ["Caja CVT enfocada en confort, no en aceleración deportiva", "Insonorización de cabina moderada a altas velocidades"],
    radarScores: {
      eficiencia: 84,
      potencia: 72,
      seguridad: 86,
      espacio: 82,
      tecnologia: 80,
      reventa: 98
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "Disponible en concesionario",
    available: true
  },
  {
    id: "hyundai-elantra-2023",
    name: "Hyundai Elantra 1.6 GLS",
    brand: "Hyundai",
    model: "Elantra",
    version: "1.6 GLS Automático",
    year: 2023,
    price: 72500,
    condition: "Usado",
    mileage: 21500,
    category: "Sedanes",
    fuel: "Gasolina",
    transmission: "Automática",
    engine: "1.6L SmartStream MPi",
    power: "126 HP @ 6,300 rpm",
    consumption: "48 km/gal",
    seats: 5,
    trunk: "474 L",
    safety: ["6 Airbags", "Control de estabilidad ESC", "Frenos de disco en 4 ruedas", "Cámara con guías dinámicas"],
    equipment: ["Cluster digital de 8\"", "Pantalla 10.25\" con conectividad inalámbrica", "Modos de manejo Eco/Sport/Normal", "Aros de aleación 16\""],
    image: "/images/car-elantra.svg",
    description: "Diseño futurista tipo coupé de 4 puertas. Muy bien conservado, único propietario, garantía de fábrica aún vigente.",
    highlight: "Estilo vanguardista con tecnología superior y confort de marcha.",
    pros: ["Diseño exterior e interior muy moderno y prémium", "Cabina espaciosa para pasajeros traseros", "Transmisión automática tradicional de 6 velocidades muy suave"],
    cons: ["Despeje del suelo bajo (cuidado en rompemuelles pronunciados)", "Consumo en tráfico denso algo mayor a motores 1.2L/1.5L"],
    radarScores: {
      eficiencia: 76,
      potencia: 82,
      seguridad: 88,
      espacio: 85,
      tecnologia: 90,
      reventa: 85
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "En stock inmediato",
    available: true
  },
  {
    id: "chery-tiggo-4-pro-2024",
    name: "Chery Tiggo 4 Pro 1.5 Comfort",
    brand: "Chery",
    model: "Tiggo 4 Pro",
    version: "1.5 Comfort MT",
    year: 2024,
    price: 58900,
    condition: "Nuevo",
    mileage: null,
    category: "SUV",
    fuel: "Gasolina",
    transmission: "Mecánica",
    engine: "1.5L Acteco DOHC",
    power: "114 HP @ 6,150 rpm",
    consumption: "46 km/gal",
    seats: 5,
    trunk: "340 L (ampliable a 1,100 L)",
    safety: ["Doble Airbag", "Control de estabilidad Bosch 9.3", "Asistente de descenso en pendiente HDC", "Monitor de presión de neumáticos"],
    equipment: ["Pantalla flotante 10.25\"", "Asientos de ecocuero", "Llave inteligente con botón de encendido", "Luces diurnas LED"],
    image: "/images/car-tiggo.svg",
    description: "La SUV compacta con la mejor relación equipamiento/precio del mercado. Excelente altura libre para pistas difíciles.",
    highlight: "Equipamiento de gama superior a precio de sedán básico.",
    pros: ["Excelente relación precio-equipamiento", "Buena altura al piso para baches y pistas irregulares", "Cabina moderna con materiales agradables al tacto"],
    cons: ["Reventa menor comparada con marcas japonesas tradicionales", "Capacidad de maletero algo justa en configuración estándar"],
    radarScores: {
      eficiencia: 74,
      potencia: 75,
      seguridad: 72,
      espacio: 78,
      tecnologia: 88,
      reventa: 70
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "Disponible en concesionario",
    available: true
  },
  {
    id: "hyundai-creta-2023",
    name: "Hyundai Creta 1.5 GL",
    brand: "Hyundai",
    model: "Creta",
    version: "1.5 GL Automática",
    year: 2023,
    price: 69900,
    condition: "Usado",
    mileage: 26000,
    category: "SUV",
    fuel: "Gasolina",
    transmission: "Automática",
    engine: "1.5L SmartStream",
    power: "113 HP @ 6,300 rpm",
    consumption: "49 km/gal",
    seats: 5,
    trunk: "416 L",
    safety: ["6 Airbags", "Frenos ABS + EBD", "Control electrónico de estabilidad", "Cámara y sensores traseros"],
    equipment: ["Pantalla táctil de 8\"", "Cargador inalámbrico de celular", "Volante en cuero con mandos", "Rieles de techo integrados"],
    image: "/images/car-creta.svg",
    description: "Una de las SUV más buscadas en Perú. Conducción suave, espaciosa, excelente diseño y bajo costo de mantenimiento.",
    highlight: "Equilibrio perfecto entre tamaño, confort y valor de mercado.",
    pros: ["Muy cómoda para la familia con suspensión suave", "Maletero de 416 litros muy aprovechable", "Excelente valor de reventa en el mercado peruano"],
    cons: ["Potencia moderada en subidas andinas con peso completo", "Acabados de puertas en plástico duro"],
    radarScores: {
      eficiencia: 78,
      potencia: 75,
      seguridad: 85,
      espacio: 82,
      tecnologia: 85,
      reventa: 90
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "En stock inmediato",
    available: true
  },
  {
    id: "toyota-corolla-cross-hybrid-2024",
    name: "Toyota Corolla Cross 1.8 HEV",
    brand: "Toyota",
    model: "Corolla Cross",
    version: "1.8 Híbrido SEG e-CVT",
    year: 2024,
    price: 114500,
    condition: "Nuevo",
    mileage: null,
    category: "Híbridos y eléctricos",
    fuel: "Híbrido",
    transmission: "CVT",
    engine: "1.8L Nafta + Motor Eléctrico Auto-recargable",
    power: "122 HP combinados",
    consumption: "75 km/gal (autonomía > 800 km)",
    seats: 5,
    trunk: "440 L",
    safety: ["Toyota Safety Sense: Frenado autónomo precolisión", "Control crucero adaptativo", "Alerta de cambio de carril", "7 Airbags"],
    equipment: ["Techo corredizo eléctrico", "Cuadro digital de 12.3\"", "Pantalla 10\" con Apple CarPlay/Android Auto", "Asientos de cuero con regulación eléctrica"],
    image: "/images/car-cross-hybrid.svg",
    description: "La SUV híbrida definitiva. No requiere enchufes, se autorrecarga con la desaceleración y rinde hasta 75 km por galón.",
    highlight: "Ahorro extremo de combustible y exoneración de pico y placa ambiental.",
    pros: ["Consumo revolucionario: más de 75 km/gal en tráfico urbano", "No requiere enchufe: se recarga automáticamente al frenar", "Reputación híbrida de Toyota con 8 años de garantía en baterías"],
    cons: ["Precio inicial de compra más elevado que una SUV tradicional", "Comportamiento del motor en modo CVT ruidoso bajo máxima aceleración"],
    radarScores: {
      eficiencia: 98,
      potencia: 80,
      seguridad: 96,
      espacio: 86,
      tecnologia: 92,
      reventa: 94
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "Disponible en concesionario",
    available: true
  },
  {
    id: "toyota-rush-2024",
    name: "Toyota Rush 1.5 7 Pasajeros",
    brand: "Toyota",
    model: "Rush",
    version: "1.5 Full 7P Automática",
    year: 2024,
    price: 86900,
    condition: "Nuevo",
    mileage: null,
    category: "Camionetas familiares",
    fuel: "Gasolina",
    transmission: "Automática",
    engine: "1.5L Dual VVT-i Tracción Trasera (RWD)",
    power: "103 HP @ 6,000 rpm",
    consumption: "47 km/gal",
    seats: 7,
    trunk: "213 L (ampliable a 514 L plegando 3ra fila)",
    safety: ["6 Airbags", "Control de estabilidad VSC", "Frenos ABS + EBD", "Sensor de parqueo y cámara"],
    equipment: ["Aire acondicionado digital bizona (delantero y trasero)", "Pantalla 7\" táctil", "Aros bitono 17\"", "Faros LED automáticos"],
    image: "/images/car-rush.svg",
    description: "Camioneta de 3 filas con 7 asientos reales y tracción trasera para superar pendientes con carga. Indispensable para familias grandes.",
    highlight: "7 pasajeros con la confiabilidad y reventa de Toyota.",
    pros: ["Capacidad real para 7 personas por menos de S/ 90,000", "Tracción trasera que ayuda a subir pendientes con pasajeros", "Gran altura al suelo de 22 cm para caminos difíciles"],
    cons: ["Motor 1.5L algo justo en carretera exigente con carga completa", "Tercera fila recomendada principalmente para niños o adultos de baja estatura"],
    radarScores: {
      eficiencia: 75,
      potencia: 70,
      seguridad: 82,
      espacio: 95,
      tecnologia: 75,
      reventa: 92
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "En stock inmediato",
    available: true
  },
  {
    id: "mitsubishi-outlander-2022",
    name: "Mitsubishi Outlander 2.4 4WD",
    brand: "Mitsubishi",
    model: "Outlander",
    version: "2.4 GLS 4WD 7 Asientos",
    year: 2022,
    price: 94500,
    condition: "Usado",
    mileage: 38000,
    category: "Camionetas familiares",
    fuel: "Gasolina",
    transmission: "CVT",
    engine: "2.4L MIVEC 16V",
    power: "167 HP @ 6,000 rpm",
    consumption: "40 km/gal",
    seats: 7,
    trunk: "591 L (en modo 5 asientos)",
    safety: ["7 Airbags incluyendo rodilla", "Tracción integral electrónica All-Wheel Control (AWC)", "Control de tracción y estabilidad ASTC", "Frenos de disco en las 4 ruedas"],
    equipment: ["Sunroof eléctrico", "Audio prémium Rockford Fosgate", "Portón trasero eléctrico", "Tapicería en cuero y calefacción de asientos"],
    image: "/images/car-outlander.svg",
    description: "SUV familiar prémium japonesa con tracción 4WD inteligente, 7 asientos y excelente insonorización para viajes interprovinciales.",
    highlight: "Confort prémium familiar y seguridad total con tracción 4WD.",
    pros: ["Tracción 4WD electrónica ideal para viajes a la sierra o playa", "Espacio amplio y confortable para 7 ocupantes", "Excelente calidad de armado japonés y gran durabilidad"],
    cons: ["Consumo urbano moderado debido al motor 2.4L y 4WD", "Costo de repuestos originales mayor a marcas de volumen"],
    radarScores: {
      eficiencia: 66,
      potencia: 88,
      seguridad: 92,
      espacio: 96,
      tecnologia: 86,
      reventa: 84
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "En stock inmediato",
    available: true
  },
  {
    id: "toyota-hilux-2023",
    name: "Toyota Hilux 2.8 4x4 SRV",
    brand: "Toyota",
    model: "Hilux",
    version: "2.8 D-4D 4x4 Doble Cabina SRV",
    year: 2023,
    price: 138000,
    condition: "Usado",
    mileage: 44000,
    category: "Pickups",
    fuel: "Diésel",
    transmission: "Automática",
    engine: "2.8L Turbo Diésel Intercooler",
    power: "201 HP @ 3,400 rpm / 500 Nm Torque",
    consumption: "38 km/gal (diésel)",
    seats: 5,
    trunk: "Tolva de 1,000 kg de carga útil",
    safety: ["7 Airbags", "Control de estabilidad VSC y balanceo de remolque TSC", "Bloqueo electrónico de diferencial trasero", "Asistente de partida y descenso"],
    equipment: ["Pantalla 8\" con Apple CarPlay/Android Auto", "Climatizador digital", "Faros Bi-LED con DRL", "Aros de aleación 18\" y estribos laterales"],
    image: "/images/car-hilux.svg",
    description: "La reina indiscutible del trabajo, la minería y el agro en Perú. Torque masivo de 500 Nm, durabilidad indestructible y reventa inmediata.",
    highlight: "Indestructible y con el valor de reventa más alto del Perú.",
    pros: ["Capacidad todoterreno real con 4x4 reductora y bloqueo diferencial", "Reventa casi como cheque al portador en cualquier rincón del Perú", "Torque colosal de 500 Nm para remolcar y cargar"],
    cons: ["Suspensión de elásticos trasera rígida cuando circula sin carga", "Objetivo frecuente de robos; requiere póliza de seguro completa"],
    radarScores: {
      eficiencia: 65,
      potencia: 96,
      seguridad: 90,
      espacio: 92,
      tecnologia: 80,
      reventa: 99
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "En stock inmediato",
    available: true
  },
  {
    id: "volkswagen-polo-2024",
    name: "Volkswagen Polo 1.0 TSI",
    brand: "Volkswagen",
    model: "Polo",
    version: "1.0 TSI Turbo Automático",
    year: 2024,
    price: 73900,
    condition: "Nuevo",
    mileage: null,
    category: "Hatchbacks",
    fuel: "Gasolina",
    transmission: "Automática",
    engine: "1.0L Turbo TSI 3 Cilindros",
    power: "101 HP / 170 Nm de torque",
    consumption: "52 km/gal",
    seats: 5,
    trunk: "300 L",
    safety: ["4 Airbags", "5 Estrellas en Latin NCAP", "Control de estabilidad ESP y frenado postcolisión", "Frenos de disco delanteros y traseros"],
    equipment: ["Tablero digital Active Info Display de 8\"", "Pantalla táctil VW Play 10.1\"", "Volante multifunción con levas de cambio", "Sensor de lluvia y luces"],
    image: "/images/car-polo.svg",
    description: "Hatchback con ingeniería alemana, motor turbo de excelente empuje en bajas revoluciones y 5 estrellas de seguridad en Latin NCAP.",
    highlight: "Seguridad 5 estrellas y agilidad turbo en tamaño compacto.",
    pros: ["Motor turbo con excelente pique y torque desde 1,500 rpm", "Máxima calificación de seguridad 5 estrellas Latin NCAP", "Calidad de rodadura e insonorización de nivel superior"],
    cons: ["Exige combustible de 95/97 octanos de buena calidad por ser turbo", "Espacio para piernas traseras justo si el conductor es alto"],
    radarScores: {
      eficiencia: 82,
      potencia: 84,
      seguridad: 95,
      espacio: 70,
      tecnologia: 90,
      reventa: 82
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "Disponible en concesionario",
    available: true
  },
  {
    id: "byd-yuan-plus-2024",
    name: "BYD Yuan Plus EV 510",
    brand: "BYD",
    model: "Yuan Plus",
    version: "EV 510 km Extended Range",
    year: 2024,
    price: 132000,
    condition: "Nuevo",
    mileage: null,
    category: "Híbridos y eléctricos",
    fuel: "Eléctrico",
    transmission: "Automática",
    engine: "Motor 100% Eléctrico + Batería Blade LFP 60.48 kWh",
    power: "201 HP / 310 Nm Instantáneo",
    consumption: "Cero emisiones · S/ 15 de carga por cada 100 km",
    seats: 5,
    trunk: "440 L",
    safety: ["Batería Blade ultra segura (a prueba de perforaciones)", "Frenado autónomo de emergencia", "Detector de punto ciego y tráfico cruzado", "Cámara 360° panorámica transparente"],
    equipment: ["Pantalla giratoria eléctrica de 12.8\"", "Carga rápida DC (30% a 80% en 30 min)", "Techo panorámico con cortina eléctrica", "Audio Hi-Fi Dirac de 8 parlantes"],
    image: "/images/car-yuan-plus.svg",
    description: "SUV 100% eléctrica con batería Blade indestructible y 510 km de autonomía NEDC. El futuro de la movilidad en Lima hoy mismo.",
    highlight: "Cero emisiones, aceleración brutal instantánea y mínimo costo por km.",
    pros: ["Costo de rodadura hasta 75% menor que un auto de gasolina equivalente", "Aceleración instantánea de 0 a 100 km/h en 7.3 segundos", "Silencio total de marcha y tecnología interior impresionante"],
    cons: ["Requiere planificar puntos de recarga en viajes largos fuera de Lima", "Inversión inicial mayor, amortizable a mediano plazo por no gastar gasolina"],
    radarScores: {
      eficiencia: 99,
      potencia: 94,
      seguridad: 94,
      espacio: 86,
      tecnologia: 98,
      reventa: 78
    },
    dataSource: "Demostración de catálogo automotriz Perú",
    availability: "Disponible en concesionario",
    available: true
  }
];

// Compatibilidad con código previo y búsqueda
export const catalog = vehicles;

export function findVehicle(query: string): Vehicle | undefined {
  const normalized = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (!normalized) return undefined;

  return vehicles.find((v) => {
    const full = `${v.brand} ${v.model} ${v.version}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return full.includes(normalized) || normalized.includes(v.model.toLowerCase()) || normalized.includes(v.id);
  });
}

// Búsqueda inteligente por criterios
export type VehicleFilterCriteria = {
  minPrice?: number;
  maxPrice?: number;
  category?: VehicleCategory | "Todas";
  condition?: VehicleCondition | "Todos";
  transmission?: TransmissionType | "Todas";
  fuel?: FuelType | "Todos";
  searchQuery?: string;
};

export function filterVehicles(criteria: VehicleFilterCriteria): Vehicle[] {
  return vehicles.filter((v) => {
    if (criteria.minPrice !== undefined && v.price < criteria.minPrice) return false;
    if (criteria.maxPrice !== undefined && criteria.maxPrice > 0 && v.price > criteria.maxPrice) return false;
    if (criteria.category && criteria.category !== "Todas" && v.category !== criteria.category) return false;
    if (criteria.condition && criteria.condition !== "Todos" && v.condition !== criteria.condition) return false;
    if (criteria.transmission && criteria.transmission !== "Todas" && v.transmission !== criteria.transmission) return false;
    if (criteria.fuel && criteria.fuel !== "Todos" && v.fuel !== criteria.fuel) return false;

    if (criteria.searchQuery && criteria.searchQuery.trim()) {
      const q = criteria.searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const text = `${v.brand} ${v.model} ${v.version} ${v.category} ${v.fuel} ${v.description}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!text.includes(q)) return false;
    }

    return true;
  });
}
