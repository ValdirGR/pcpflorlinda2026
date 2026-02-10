# PCP Flor Linda - Painel de Controle de Produção

Dashboard moderno para gerenciamento de produção e coleções da Flor Linda, construído com **Next.js 16**, **TypeScript**, **Tailwind CSS** e **Prisma**.

## Tech Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript 5**
- **Tailwind CSS 4**
- **Prisma 5** (ORM - MySQL)
- **NextAuth v5** (Autenticação com Credentials)
- **Recharts** (Gráficos)
- **Lucide React** (Ícones)

## Funcionalidades

- Dashboard com estatísticas, gráficos de produção e progresso por coleção
- CRUD completo de Coleções
- CRUD completo de Referências com filtro e busca
- Registro de Produção
- Gerenciamento de Etapas de Produção
- Relatórios de atrasos e status
- Autenticação com níveis de acesso (admin, usuario, visualizador)
- Layout responsivo com sidebar colapsável

## Setup Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Gerar Prisma Client
npx prisma generate

# Iniciar dev server
npm run dev
```

Acesse: http://localhost:3000

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string MySQL |
| `NEXTAUTH_SECRET` | Secret para JWT/sessão |
| `NEXTAUTH_URL` | URL da aplicação |

## Deploy na Vercel

1. Conecte o repositório GitHub na Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. Deploy automático a cada push

> **Nota**: O banco MySQL continua na Hostinger. Certifique-se de que o acesso remoto está habilitado ("Qualquer Host").

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
