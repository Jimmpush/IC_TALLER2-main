import { vehicles } from "@/lib/catalog";

export type InventoryItem = {
  productId: string;
  name: string;
  brand: string;
  stock: number;
  minimumStock: number;
  location: string;
};

export const initialInventory: InventoryItem[] = vehicles.map((v, i) => ({
  productId: v.id,
  name: `${v.brand} ${v.model} ${v.year}`,
  brand: v.brand,
  stock: v.condition === "Nuevo" ? 3 + (i % 4) : 1, // Los usados tienen 1 unidad en stock demostrativo
  minimumStock: 1,
  location: i % 2 === 0 ? "Sede Javier Prado, Lima" : "Sede Surco, Lima"
}));
