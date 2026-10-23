import { Vehicle, vehicles } from "@/lib/catalog";

export type OrderLine = {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  vehicle?: Vehicle;
};

export type Order = {
  id: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  lines: OrderLine[];
  total: number;
  fulfillment: string; // ej: "Solicitud de Cotización" | "Test Drive en Concesionario" | "Asesoría Financiera"
  status: "Recibido" | "En evaluación" | "Contactado";
  createdAt: string;
};

export type DraftOrder = {
  customerName?: string;
  customerPhone?: string;
  lines: OrderLine[];
  fulfillment: string;
};

export function createLine(item: Vehicle, quantity = 1): OrderLine {
  return {
    itemId: item.id,
    name: `${item.brand} ${item.model} (${item.year})`,
    quantity,
    unitPrice: item.price,
    vehicle: item
  };
}

export function calculateTotal(lines: OrderLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}

export function createOrder(draft: DraftOrder): Order {
  const lineDetails = draft.lines.map((l) => {
    const v = vehicles.find((item) => item.id === l.itemId);
    return { ...l, vehicle: v ?? l.vehicle };
  });

  return {
    id: `AUTO-${String(Date.now()).slice(-6)}`,
    customerName: draft.customerName || "Usuario AUTOIA",
    customerPhone: draft.customerPhone,
    lines: lineDetails,
    total: calculateTotal(draft.lines),
    fulfillment: draft.fulfillment || "Solicitud de Asesoría y Cotización",
    status: "Recibido",
    createdAt: new Date().toISOString()
  };
}
