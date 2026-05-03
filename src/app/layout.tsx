import type { Metadata } from "next";
import { Geist, Syne } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "GameScope",
  description: "Descubre juegos, filtra por plataforma, género y año.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${syne.variable} antialiased`}>
      <body className="min-h-screen bg-[#050507] text-[#f0f0f5]">{children}</body>
    </html>
  );
}
