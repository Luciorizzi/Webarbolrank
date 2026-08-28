import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: { default: "Plantados", template: "%s · Plantados" },
  description: "Comunidades que compiten para financiar árboles.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><Header />{children}<Footer /></body></html>;
}
