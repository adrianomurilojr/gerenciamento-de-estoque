"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Erro não tratado na interface do Estoque Aqui.");
  }, []);

  return (
    <main className="route-error-page">
      <div className="route-error-card">
        <span className="error-symbol"><AlertTriangle size={23} /></span>
        <span className="eyebrow">ALGO DEU ERRADO</span>
        <h1>Não foi possível carregar esta página.</h1>
        <p>Tente novamente. Se o problema continuar, volte ao início e refaça a ação.</p>
        <button className="primary-button" onClick={reset}><RefreshCw size={16} />Tentar novamente</button>
        <a className="route-error-home" href="/">Voltar ao início</a>
      </div>
    </main>
  );
}
