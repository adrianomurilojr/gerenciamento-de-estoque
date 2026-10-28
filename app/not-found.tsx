import Link from "next/link";
import { ArrowLeft, Box, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="route-error-page">
      <div className="route-error-card">
        <span className="brand-icon"><Box size={21} /></span>
        <span className="eyebrow">ERRO 404</span>
        <h1>Não encontramos esta página.</h1>
        <p>O endereço pode ter mudado ou o conteúdo não está disponível. Volte ao início para continuar.</p>
        <Link className="primary-button" href="/"><ArrowLeft size={16} />Voltar ao Estoque Aqui</Link>
        <span className="route-error-decoration"><Search size={72} /></span>
      </div>
    </main>
  );
}
