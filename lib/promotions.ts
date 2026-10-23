export type Promotion = {
  id: string;
  name: string;
  title: string;
  description: string;
  discount: string;
  validity: string;
  image: string;
  badge: string;
  terms: string;
  // Compatibilidad
  price?: number;
  days?: string;
};

export const promotions: Promotion[] = [
  {
    id: "bono-financiamiento",
    name: "Bono Crédito Vehicular",
    title: "Hasta S/ 6,000 de bono con entidad financiera",
    description: "Descuento directo en el precio del vehículo al financiar con bancos aliados (BBVA, BCP o Santander Consumer).",
    discount: "Bono hasta S/ 6,000",
    validity: "Vigente este mes",
    image: "/images/promo-bono.svg",
    badge: "Financiamiento",
    terms: "Aplica para compras con cuota inicial mínima del 20% y plazo desde 36 meses.",
    price: 6000,
    days: "Todo el mes"
  },
  {
    id: "retoma-tu-auto",
    name: "Campaña Retoma Garantizada",
    title: "Entrega tu auto usado como parte de pago",
    description: "Tasación transparente y sobreprecio de hasta S/ 3,500 sobre el valor comercial para llevarte tu nuevo vehículo.",
    discount: "Sobreprecio S/ 3,500",
    validity: "Cupos limitados",
    image: "/images/promo-retoma.svg",
    badge: "Retoma 100% Segura",
    terms: "Válido para vehículos de 2017 en adelante sin siniestros estructurales.",
    price: 3500,
    days: "Cupos limitados"
  },
  {
    id: "mantenimiento-gratis",
    name: "Mantenimiento 2 Años Incluido",
    title: "Cero costo en tus primeros 4 servicios preventivos",
    description: "Incluye cambio de aceite sintético, filtros, rotación de neumáticos e inspección de seguridad por 20,000 km.",
    discount: "Ahorro de S/ 2,400",
    validity: "Modelos seleccionados",
    image: "/images/promo-mantenimiento.svg",
    badge: "Tranquilidad Total",
    terms: "Válido para sedanes y SUV nuevas registradas en la plataforma.",
    price: 2400,
    days: "Modelos seleccionados"
  }
];
