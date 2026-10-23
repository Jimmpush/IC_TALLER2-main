const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

function createCarSvg(title, subtitle, tag, color = "#C8F36A", bodyType = "sedan") {
  // Visual silhouette coordinates based on body type
  let roofPath = "M 160 210 Q 280 130 450 130 Q 600 130 720 200";
  let bodyPath = "M 90 260 L 140 210 L 730 200 L 810 240 L 820 280 L 760 300 L 120 300 Z";
  let windowPath = "M 220 200 L 320 145 L 470 145 L 470 200 Z M 490 200 L 490 145 L 610 145 L 680 200 Z";
  let wheelLeft = 230;
  let wheelRight = 670;
  let groundY = 320;

  if (bodyType === "suv") {
    roofPath = "M 170 210 Q 240 110 380 110 L 680 110 L 750 200";
    bodyPath = "M 80 260 L 150 190 L 760 180 L 820 220 L 825 270 L 760 290 L 110 290 Z";
    windowPath = "M 230 190 L 290 125 L 480 125 L 480 190 Z M 500 190 L 500 125 L 670 125 L 720 190 Z";
    groundY = 330;
  } else if (bodyType === "pickup") {
    roofPath = "M 170 210 Q 250 115 370 115 L 560 115 L 565 200";
    bodyPath = "M 70 260 L 150 195 L 570 190 L 570 210 L 790 210 L 820 250 L 820 280 L 760 300 L 110 300 Z";
    windowPath = "M 230 190 L 290 130 L 430 130 L 430 190 Z M 450 190 L 450 130 L 540 130 L 540 190 Z";
    groundY = 335;
  } else if (bodyType === "urban") {
    roofPath = "M 170 220 Q 260 125 400 125 L 590 130 L 680 210";
    bodyPath = "M 100 260 L 160 205 L 690 205 L 750 240 L 750 280 L 700 295 L 130 295 Z";
    windowPath = "M 210 200 L 280 140 L 440 140 L 440 200 Z M 460 200 L 460 140 L 580 140 L 630 200 Z";
    wheelLeft = 230;
    wheelRight = 620;
    groundY = 320;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1D1F1E" />
      <stop offset="100%" stop-color="#121312" />
    </linearGradient>
    <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#2D312E" />
      <stop offset="50%" stop-color="#454A46" />
      <stop offset="100%" stop-color="#1E201F" />
    </linearGradient>
    <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.2" />
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#101311" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#1F2420" stop-opacity="0.6" />
    </linearGradient>
    <radialGradient id="wheelGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#606662" />
      <stop offset="60%" stop-color="#1D1F1E" />
      <stop offset="100%" stop-color="#0A0B0A" />
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="900" height="480" rx="24" fill="url(#bg)" />

  <!-- Subtle Architectural grid lines -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    <line x1="0" y1="80" x2="900" y2="80" />
    <line x1="0" y1="160" x2="900" y2="160" />
    <line x1="0" y1="240" x2="900" y2="240" />
    <line x1="0" y1="320" x2="900" y2="320" />
    <line x1="200" y1="0" x2="200" y2="480" />
    <line x1="450" y1="0" x2="450" y2="480" />
    <line x1="700" y1="0" x2="700" y2="480" />
  </g>

  <!-- Studio Ambient Floor Reflection -->
  <ellipse cx="450" cy="${groundY + 15}" rx="380" ry="42" fill="#000000" opacity="0.6" />
  <ellipse cx="450" cy="${groundY + 12}" rx="320" ry="25" fill="${color}" opacity="0.12" filter="url(#glow)" />

  <!-- Car Body Silhouette & Lines -->
  <g transform="translate(0, 10)">
    <!-- Cabin Roof -->
    <path d="${roofPath}" fill="none" stroke="#686F6B" stroke-width="4" stroke-linecap="round" />
    
    <!-- Main Body Base -->
    <path d="${bodyPath}" fill="url(#carBody)" stroke="#3E433F" stroke-width="2" />

    <!-- Tinted Windows -->
    <path d="${windowPath}" fill="url(#glass)" stroke="#4A504B" stroke-width="1.5" />

    <!-- Signature Accent Character Line -->
    <path d="M 150 235 Q 450 230 780 220" fill="none" stroke="${color}" stroke-width="3" opacity="0.85" />
    <line x1="120" y1="260" x2="790" y2="250" stroke="#7E8781" stroke-width="1.5" opacity="0.5" />

    <!-- Headlights & Taillights -->
    <!-- Front LED Light -->
    <path d="M 750 215 L 810 230 L 780 240 Z" fill="${color}" filter="url(#glow)" opacity="0.9" />
    <!-- Rear Light -->
    <path d="M 120 225 L 95 240 L 130 245 Z" fill="#FF4438" opacity="0.85" filter="url(#glow)" />

    <!-- Wheels and Rims -->
    <!-- Front Wheel -->
    <g transform="translate(${wheelRight}, ${groundY - 30})">
      <circle cx="0" cy="0" r="48" fill="url(#wheelGrad)" stroke="#111" stroke-width="6" />
      <circle cx="0" cy="0" r="32" fill="#202220" stroke="#505551" stroke-width="2" />
      <line x1="0" y1="-30" x2="0" y2="30" stroke="${color}" stroke-width="3" opacity="0.8" />
      <line x1="-30" y1="0" x2="30" y2="0" stroke="#8A928D" stroke-width="3" />
      <line x1="-22" y1="-22" x2="22" y2="22" stroke="#8A928D" stroke-width="2.5" />
      <line x1="-22" y1="22" x2="22" y2="-22" stroke="#8A928D" stroke-width="2.5" />
      <circle cx="0" cy="0" r="10" fill="#111" stroke="${color}" stroke-width="2" />
    </g>

    <!-- Rear Wheel -->
    <g transform="translate(${wheelLeft}, ${groundY - 30})">
      <circle cx="0" cy="0" r="48" fill="url(#wheelGrad)" stroke="#111" stroke-width="6" />
      <circle cx="0" cy="0" r="32" fill="#202220" stroke="#505551" stroke-width="2" />
      <line x1="0" y1="-30" x2="0" y2="30" stroke="${color}" stroke-width="3" opacity="0.8" />
      <line x1="-30" y1="0" x2="30" y2="0" stroke="#8A928D" stroke-width="3" />
      <line x1="-22" y1="-22" x2="22" y2="22" stroke="#8A928D" stroke-width="2.5" />
      <line x1="-22" y1="22" x2="22" y2="-22" stroke="#8A928D" stroke-width="2.5" />
      <circle cx="0" cy="0" r="10" fill="#111" stroke="${color}" stroke-width="2" />
    </g>
  </g>

  <!-- Editorial typography & badges overlay -->
  <g transform="translate(48, 56)">
    <rect x="0" y="0" width="auto" height="26" rx="13" fill="#2D302E" />
    <text x="14" y="18" fill="${color}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5">${tag.toUpperCase()}</text>
    <text x="0" y="58" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" letter-spacing="-0.5">${title}</text>
    <text x="0" y="80" fill="#8E948F" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500">${subtitle}</text>
  </g>

  <!-- Watermark AUTOIA -->
  <text x="840" y="60" text-anchor="end" fill="#ffffff" fill-opacity="0.12" font-family="system-ui, sans-serif" font-size="16" font-weight="900" letter-spacing="3">AUTOIA</text>
</svg>`;
}

function createHeroSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="100%" height="100%">
  <defs>
    <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1C1B" />
      <stop offset="60%" stop-color="#141514" />
      <stop offset="100%" stop-color="#0E0F0E" />
    </linearGradient>
    <linearGradient id="limeBeam" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C8F36A" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#C8F36A" stop-opacity="0.1" />
    </linearGradient>
    <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C8F36A" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#1D1F1E" stop-opacity="0" />
    </radialGradient>
    <filter id="hGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="b" />
      <feComposite in="SourceGraphic" in2="b" operator="over" />
    </filter>
  </defs>

  <rect width="1000" height="700" rx="36" fill="url(#heroBg)" />

  <!-- Modern Architecture Ambient Geometry -->
  <g opacity="0.08" stroke="#FFFFFF" stroke-width="1.5">
    <line x1="100" y1="0" x2="100" y2="700" />
    <line x1="300" y1="0" x2="300" y2="700" />
    <line x1="500" y1="0" x2="500" y2="700" />
    <line x1="700" y1="0" x2="700" y2="700" />
    <line x1="900" y1="0" x2="900" y2="700" />
    <line x1="0" y1="200" x2="1000" y2="200" />
    <line x1="0" y1="400" x2="1000" y2="400" />
    <line x1="0" y1="560" x2="1000" y2="560" />
  </g>

  <!-- Spotlight Glow -->
  <circle cx="500" cy="420" r="320" fill="url(#heroGlow)" />
  <ellipse cx="500" cy="540" rx="420" ry="50" fill="#000000" opacity="0.8" />
  <ellipse cx="500" cy="535" rx="350" ry="25" fill="#C8F36A" opacity="0.2" filter="url(#hGlow)" />

  <!-- Hero Car Representation (High-End Electric SUV / Coupe) -->
  <g transform="translate(30, 90)">
    <!-- Aerodynamic Cabin -->
    <path d="M 210 320 Q 340 180 540 180 Q 720 180 820 310" fill="none" stroke="#808983" stroke-width="5" stroke-linecap="round" />
    <path d="M 110 390 L 190 290 L 830 280 L 920 340 L 925 410 L 860 450 L 140 450 Z" fill="#242825" stroke="#3F4641" stroke-width="2" />
    <path d="M 270 290 L 350 205 L 530 205 L 530 290 Z M 550 290 L 550 205 L 710 205 L 780 290 Z" fill="#0C0E0D" stroke="#3D443F" stroke-width="1.5" />

    <!-- Electric Laser Lightbar Front -->
    <path d="M 820 310 L 910 330 L 870 345 Z" fill="#C8F36A" filter="url(#hGlow)" />
    <!-- Cyber Tail light -->
    <path d="M 140 330 L 115 350 L 160 355 Z" fill="#FF3B30" filter="url(#hGlow)" />

    <!-- Neon Accent Beltline -->
    <path d="M 180 345 Q 520 335 880 325" fill="none" stroke="#C8F36A" stroke-width="3.5" opacity="0.9" />

    <!-- Wheels Front -->
    <g transform="translate(770, 440)">
      <circle cx="0" cy="0" r="62" fill="#121312" stroke="#2B2F2C" stroke-width="8" />
      <circle cx="0" cy="0" r="42" fill="#242725" stroke="#C8F36A" stroke-width="3" />
      <line x1="0" y1="-40" x2="0" y2="40" stroke="#C8F36A" stroke-width="4" />
      <line x1="-40" y1="0" x2="40" y2="0" stroke="#C8F36A" stroke-width="4" />
      <circle cx="0" cy="0" r="14" fill="#0A0B0A" stroke="#FFF" stroke-width="2" />
    </g>

    <!-- Wheels Rear -->
    <g transform="translate(260, 440)">
      <circle cx="0" cy="0" r="62" fill="#121312" stroke="#2B2F2C" stroke-width="8" />
      <circle cx="0" cy="0" r="42" fill="#242725" stroke="#C8F36A" stroke-width="3" />
      <line x1="0" y1="-40" x2="0" y2="40" stroke="#C8F36A" stroke-width="4" />
      <line x1="-40" y1="0" x2="40" y2="0" stroke="#C8F36A" stroke-width="4" />
      <circle cx="0" cy="0" r="14" fill="#0A0B0A" stroke="#FFF" stroke-width="2" />
    </g>
  </g>

  <!-- Floating Floating Spec HUD Card -->
  <g transform="translate(620, 80)">
    <rect width="320" height="150" rx="18" fill="#1F2321" fill-opacity="0.95" stroke="#3A403C" stroke-width="1.5" />
    <rect x="20" y="20" width="8" height="8" rx="4" fill="#C8F36A" />
    <text x="36" y="28" fill="#C8F36A" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5">RECOMENDACIÓN DESTACADA</text>
    <text x="20" y="62" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="18" font-weight="800">Toyota Corolla Cross HEV</text>
    <text x="20" y="86" fill="#A0A8A2" font-family="system-ui, sans-serif" font-size="12">SUV Híbrida · 75 km/gal · 5 Pasajeros</text>
    <line x1="20" y1="102" x2="300" y2="102" stroke="#2F3531" stroke-width="1" />
    <text x="20" y="128" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="16" font-weight="800">S/ 114,500</text>
    <text x="300" y="128" text-anchor="end" fill="#C8F36A" font-family="system-ui, sans-serif" font-size="11" font-weight="700">98% COMPATIBILIDAD</text>
  </g>

  <!-- Editorial Brand Badge -->
  <g transform="translate(60, 60)">
    <text x="0" y="30" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="-1">AUTOIA <tspan fill="#C8F36A">STUDIO</tspan></text>
    <text x="0" y="55" fill="#88908A" font-family="system-ui, sans-serif" font-size="13" font-weight="500">Inteligencia Artificial aplicada a tu próxima decisión</text>
  </g>
</svg>`;
}

// Generate all car assets
const cars = [
  { file: 'car-picanto.svg', title: 'Kia Picanto 2024', subtitle: '1.2 EX Sport Plus · Nuevo', tag: 'Urbano Eficiente', color: '#C8F36A', type: 'urban' },
  { file: 'car-swift.svg', title: 'Suzuki Swift 2022', subtitle: '1.2 GL Mecánico · 32,000 km', tag: 'Seminuevo Garantizado', color: '#62D4A2', type: 'urban' },
  { file: 'car-yaris.svg', title: 'Toyota Yaris 2024', subtitle: '1.5 XLI CVT · Nuevo', tag: 'Sedán Líder', color: '#C8F36A', type: 'sedan' },
  { file: 'car-elantra.svg', title: 'Hyundai Elantra 2023', subtitle: '1.6 GLS Automático · 21,500 km', tag: 'Sedán Prémium', color: '#88D6F2', type: 'sedan' },
  { file: 'car-tiggo.svg', title: 'Chery Tiggo 4 Pro', subtitle: '1.5 Comfort MT · Nuevo', tag: 'SUV Accesible', color: '#FFB84D', type: 'suv' },
  { file: 'car-creta.svg', title: 'Hyundai Creta 2023', subtitle: '1.5 GL Automática · 26,000 km', tag: 'SUV Versátil', color: '#68D4C8', type: 'suv' },
  { file: 'car-cross-hybrid.svg', title: 'Corolla Cross HEV', subtitle: '1.8 Híbrido SEG · 75 km/gal', tag: 'Híbrido Autorecargable', color: '#C8F36A', type: 'suv' },
  { file: 'car-rush.svg', title: 'Toyota Rush 2024', subtitle: '1.5 Full 7 Pasajeros · Nuevo', tag: 'Familiar 3 Filas', color: '#C8F36A', type: 'suv' },
  { file: 'car-outlander.svg', title: 'Mitsubishi Outlander', subtitle: '2.4 GLS 4WD 7 Asientos · Usado', tag: 'SUV 4WD 7 Plazas', color: '#D97354', type: 'suv' },
  { file: 'car-hilux.svg', title: 'Toyota Hilux 4x4 SRV', subtitle: '2.8 Turbo Diésel 500 Nm · Usado', tag: 'Pickup Todoterreno', color: '#E8A047', type: 'pickup' },
  { file: 'car-polo.svg', title: 'Volkswagen Polo TSI', subtitle: '1.0 Turbo TSI · 5 Estrellas NCAP', tag: 'Hatchback Turbo', color: '#6EA8FE', type: 'urban' },
  { file: 'car-yuan-plus.svg', title: 'BYD Yuan Plus EV', subtitle: '100% Eléctrico · 510 km Autonomía', tag: 'Cero Emisiones EV', color: '#00E5FF', type: 'suv' }
];

// Generate category cards
const categories = [
  { file: 'cat-urban.svg', title: 'Autos Urbanos', subtitle: 'Desde S/ 41,500 · 60 km/gal', tag: 'Económicos', color: '#C8F36A', type: 'urban' },
  { file: 'cat-sedan.svg', title: 'Sedanes', subtitle: 'Desde S/ 64,500 · Máximo Confort', tag: 'Ejecutivos', color: '#C8F36A', type: 'sedan' },
  { file: 'cat-suv.svg', title: 'SUV & Crossovers', subtitle: 'Desde S/ 58,900 · Mayor Altura', tag: 'Versátiles', color: '#68D4C8', type: 'suv' },
  { file: 'cat-familiar.svg', title: 'Camionetas Familiares', subtitle: '3 Filas · 7 Asientos Reales', tag: 'Familia', color: '#FFB84D', type: 'suv' },
  { file: 'cat-hatchback.svg', title: 'Hatchbacks', subtitle: 'Desde S/ 53,900 · Ágiles y Juveniles', tag: 'Compactos', color: '#6EA8FE', type: 'urban' },
  { file: 'cat-electrico.svg', title: 'Híbridos y Eléctricos', subtitle: 'Ahorro Extremo de Combustible', tag: 'Eco Movilidad', color: '#00E5FF', type: 'suv' },
  { file: 'cat-pickup.svg', title: 'Pickups 4x4', subtitle: 'Capacidad de Carga y Trabajo', tag: 'Fuerza Total', color: '#E8A047', type: 'pickup' }
];

// Generate promo banners
const promos = [
  { file: 'promo-bono.svg', title: 'Bono Financiamiento', subtitle: 'Hasta S/ 6,000 con bancos aliados', tag: 'Crédito Vehicular', color: '#C8F36A', type: 'sedan' },
  { file: 'promo-retoma.svg', title: 'Campaña Retoma', subtitle: 'Sobreprecio de S/ 3,500 por tu usado', tag: 'Tasación Segura', color: '#68D4C8', type: 'suv' },
  { file: 'promo-mantenimiento.svg', title: 'Mantenimiento Gratis', subtitle: '2 Años o 20,000 km incluidos', tag: 'Cero Preocupaciones', color: '#FFB84D', type: 'urban' }
];

console.log('Writing hero SVG...');
fs.writeFileSync(path.join(imgDir, 'hero-autoia.svg'), createHeroSvg());

console.log('Writing vehicle SVGs...');
for (const car of cars) {
  fs.writeFileSync(path.join(imgDir, car.file), createCarSvg(car.title, car.subtitle, car.tag, car.color, car.type));
}

console.log('Writing category SVGs...');
for (const cat of categories) {
  fs.writeFileSync(path.join(imgDir, cat.file), createCarSvg(cat.title, cat.subtitle, cat.tag, cat.color, cat.type));
}

console.log('Writing promo SVGs...');
for (const promo of promos) {
  fs.writeFileSync(path.join(imgDir, promo.file), createCarSvg(promo.title, promo.subtitle, promo.tag, promo.color, promo.type));
}

console.log('All automotive visual assets generated successfully!');
