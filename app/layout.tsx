import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUTOIA | Plataforma Inteligente de Recomendación de Autos",
  description:
    "Asesoría automotriz inteligente con IA (AIDA). Encuentra, compara y elige el vehículo ideal según tu presupuesto, estilo de vida y necesidades en Perú."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
