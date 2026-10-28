# Estoque Aqui

Protótipo responsivo de gestão de estoque para empresas de qualquer segmento. A landing page apresenta os recursos, o fluxo em três passos, planos de demonstração e FAQ. O portal inclui cadastro conjunto de empresa e administrador, teste grátis simulado, gerenciamento de assinatura, limites de uso e painel interno com métricas e log de eventos de cobrança fictícios.

A área operacional inclui dashboard, catálogo de produtos com marca, categoria, unidade de medida e observações, entradas e saídas, inventário, produtos com defeito, relatórios, fornecedores, configurações da empresa (nome, CNPJ, endereço, logo e foto de perfil) e temas claro/escuro. A navegação lateral tem rolagem própria para acomodar todos os itens em telas menores. A interface se adapta a celulares, tablets e desktops.

## Tecnologias

Next.js, React, TypeScript, Tailwind CSS, Recharts e Lucide.

## Executar localmente

Requer Node.js e npm.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Acessos demonstrativos

- Administrador do estoque: `admin@estoque3irmaos.com.br` / `admin123`
- Funcionário: `funcionario@estoque3irmaos.com.br` / `func123`
- Painel interno SaaS: `root@estoque3irmaos.com.br` / `root123`

Também é possível criar uma empresa pelo portal. O teste grátis e os preços são exemplos ilustrativos para navegação e teste; o cadastro não solicita informações de cartão.

## Limites do protótipo

Este projeto implementa somente o frontend. Cadastro, sessão, empresas, dados de estoque e assinaturas ficam no `localStorage` do navegador e não oferecem autenticação segura, isolamento de dados entre usuários/dispositivos, banco de dados ou painel administrativo protegido por servidor. Não use senhas reais nem dados sensíveis neste protótipo.

O checkout, a ativação/cancelamento de assinaturas, as faturas, a forma de pagamento e os eventos chamados de webhook são simulações locais: nenhum cartão é solicitado e nenhum pagamento ou webhook é processado. Cobranças reais, inclusive em ambiente de teste de um provedor, exigem integração de backend com credenciais privadas e confirmação por webhooks. Os preços, limites e painel interno também são demonstrativos. As telas 404 e de erro genérico fazem parte do frontend.
