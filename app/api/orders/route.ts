import { NextResponse } from "next/server";
import { createOrder, DraftOrder } from "@/lib/orders";
import { saveOrder, listOrders } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ orders: listOrders() });
}

export async function POST(request: Request) {
  try {
    const draft = (await request.json()) as DraftOrder;
    if (!draft?.lines?.length) {
      return NextResponse.json(
        { error: "Selecciona al menos un vehículo para solicitar asesoría o cotización." },
        { status: 400 }
      );
    }
    const order = saveOrder(createOrder(draft));
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("AUTOIA inquiry error", error);
    return NextResponse.json(
      { error: "No se pudo registrar la solicitud de asesoría vehicular." },
      { status: 500 }
    );
  }
}
