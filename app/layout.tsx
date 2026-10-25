import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estoque 3 Irmãos — Gestão de estoque",
  description: "Controle inteligente de estoque, produtos e movimentações.",
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
