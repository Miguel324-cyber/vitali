import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";


/* =========================================================
   FUENTE INTER
   ========================================================= */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});


/* =========================================================
   FUENTE PLUS JAKARTA SANS
   ========================================================= */

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});


/* =========================================================
   METADATA
   ========================================================= */

export const metadata: Metadata = {
  title: "Vitali Salud",
  description:
    "Plataforma de soporte a la decisión farmacológica y mitigación proactiva de la sobremedicación.",
};


/* =========================================================
   ROOT LAYOUT
   ========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${plusJakarta.variable}`}
      >
        {children}
      </body>
    </html>
  );
}