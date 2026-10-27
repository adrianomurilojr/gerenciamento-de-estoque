import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estoque Aqui — Gestão de estoque para sua empresa",
  description: "Organize produtos, movimentações e inventários em uma plataforma de gestão de estoque.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
