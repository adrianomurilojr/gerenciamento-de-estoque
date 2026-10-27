# Estoque Aqui

Protótipo responsivo de gestão de estoque para autopeças, produtos para lava a jato e outros negócios. Inclui uma experiência SaaS demonstrativa com landing page, planos ilustrativos, cadastro conjunto de empresa e administrador, área de assinatura e painel interno. A área operacional mantém dashboard, produtos, movimentações, inventário, produtos com defeito, relatórios e tema claro/escuro.

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

Também é possível criar uma empresa pelo portal. Os planos e valores são exemplos ilustrativos para navegação e teste.

## Limites do protótipo

Este projeto implementa somente o frontend. Cadastro, sessão, empresas, dados de estoque e assinaturas ficam no `localStorage` do navegador e não oferecem autenticação segura, isolamento de dados entre usuários/dispositivos, banco de dados ou painel administrativo protegido por servidor. Não use senhas reais nem dados sensíveis neste protótipo.

O checkout, a ativação/cancelamento de assinaturas e o histórico de cobranças são simulações locais: nenhum cartão é solicitado e nenhum pagamento é processado. Cobranças reais, inclusive em ambiente de teste de um provedor, exigem integração de backend com credenciais privadas e confirmação por webhooks. Os preços e o painel interno também são demonstrativos.
