import { Order } from "@/lib/orders";
import { vehicles } from "@/lib/catalog";

const defaultCar = vehicles.find((v) => v.id === "toyota-yaris-2024") ?? vehicles[0];

const orders: Order[] = [
  {
    id: "AUTO-84219",
    customerName: "Carlos Mendoza",
    customerPhone: "987 654 321",
    lines: [
      {
        itemId: defaultCar.id,
        name: `${defaultCar.brand} ${defaultCar.model} (${defaultCar.year})`,
        quantity: 1,
        unitPrice: defaultCar.price,
        vehicle: defaultCar
      }
    ],
    total: defaultCar.price,
    fulfillment: "Asesoría de Financiamiento y Test Drive",
    status: "En evaluación",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  }
];

export function listOrders() {
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveOrder(order: Order) {
  orders.unshift(order);
  return order;
}
