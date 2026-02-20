# Arquitetura — PCP Flor Linda (Next.js)

> **Versão:** 2.0  
> **Última atualização:** 10/02/2026  

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │            Next.js 16 (App Router)              │    │
│  │                                                 │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │    │
│  │  │  Pages   │  │  Server  │  │  API Routes  │  │    │
│  │  │  (RSC)   │  │  Actions │  │ (NextAuth)   │  │    │
│  │  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │    │
│  │       │              │               │          │    │
│  │  ┌────▼──────────────▼───────────────▼───────┐  │    │
│  │  │           Prisma Client 5.22              │  │    │
│  │  └────────────────────┬──────────────────────┘  │    │
│  └───────────────────────┼─────────────────────────┘    │
└──────────────────────────┼──────────────────────────────┘
                           │ MySQL Protocol
                           ▼
              ┌────────────────────────┐
              │  MySQL 8 (Hostinger)   │
              │  srv796.hstgr.io       │
              │  u333025608_painel_pcp │
              └────────────────────────┘
                           ▲
                           │ MySQL Protocol
              ┌────────────────────────┐
              │  PHP System (legado)   │
              │  florlinda.store       │
              │  /pcpflorlinda/        │
              └────────────────────────┘
```

---

## 2. Estrutura de Diretórios

```
pcp-flor-linda/
├── docs/                          # Documentação do projeto
│   ├── PRD.md                     # Product Requirements Document
│   ├── ARCHITECTURE.md            # Este documento
│   ├── DATABASE.md                # Schema do banco
│   ├── FLOWCHARTS.md              # Fluxogramas de processos
│   ├── DEPLOY.md                  # Guia de deploy
│   └── API.md                     # Server Actions e rotas
│
├── prisma/
│   └── schema.prisma              # Schema Prisma (mapeamento MySQL)
│
├── public/                        # Assets estáticos
│
├── src/
│   ├── auth.ts                    # Configuração NextAuth v5
│   ├── middleware.ts              # Middleware de autenticação
│   │
│   ├── app/
│   │   ├── layout.tsx             # Layout raiz (font, providers)
│   │   ├── page.tsx               # Redirect → /dashboard
│   │   ├── globals.css            # Estilos globais + Tailwind
│   │   ├── actions.ts             # Server Actions (CRUD)
│   │   ├── login/
│   │   │   └── page.tsx           # Página de login
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts   # NextAuth API handler
│   │   └── (dashboard)/           # Route Group (layout protegido)
│   │       ├── layout.tsx         # DashboardLayout (sidebar + header)
│   │       ├── dashboard/
│   │       │   └── page.tsx       # Dashboard principal
│   │       ├── colecoes/
│   │       │   ├── page.tsx       # Lista de coleções
│   │       │   ├── novo/
│   │       │   │   └── page.tsx   # Criar coleção
│   │       │   └── [id]/
│   │       │       ├── page.tsx   # Detalhes da coleção
│   │       │       └── editar/
│   │       │           └── page.tsx # Editar coleção
│   │       ├── referencias/
│   │       │   ├── page.tsx       # Lista de referências
│   │       │   ├── busca/
│   │       │   │   └── page.tsx   # Busca de referências
│   │       │   ├── novo/
│   │       │   │   └── page.tsx   # Criar referência
│   │       │   └── [id]/
│   │       │       ├── page.tsx   # Detalhes da referência
│   │       │       └── editar/
│   │       │           └── page.tsx # Editar referência
│   │       ├── producao/
│   │       │   ├── page.tsx       # Dashboard de produção
│   │       │   └── novo/
│   │       │       └── page.tsx   # Registrar produção
│   │       └── relatorios/
│   │           └── page.tsx       # Relatórios
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx        # Cards de métricas
│   │   │   ├── production-chart.tsx   # Gráfico de barras (Recharts)
│   │   │   ├── collection-progress.tsx # Progresso das coleções
│   │   │   ├── recent-etapas.tsx      # Etapas recentes
│   │   │   └── referencias-grid.tsx   # Grid de referências com fotos
│   │   ├── gerencial/
│   │   │   ├── gerencial-content.tsx  # Dashboard Gerencial (Client Wrapper)
│   │   │   ├── kpi-cards.tsx          # Cards de KPIs
│   │   │   ├── status-donut.tsx       # Gráfico de Status
│   │   │   ├── metas-heatmap.tsx      # Mapa de calor de metas
│   │   │   └── top-atrasados.tsx      # Lista de atrasados
│   │   ├── layout/
│   │   │   ├── dashboard-layout.tsx   # Layout wrapper (auth check)
│   │   │   ├── header.tsx             # Header com busca e user
│   │   │   └── sidebar.tsx            # Sidebar de navegação
│   │   ├── referencias/
│   │   │   ├── filter.tsx             # Filtros da lista
│   │   │   └── delete-button.tsx      # Botão de exclusão com validação
│   │   └── providers/
│   │       └── auth-provider.tsx      # SessionProvider do NextAuth
│   │
│   └── lib/
│       ├── prisma.ts              # Instância singleton do Prisma
│       └── utils.ts               # Utilitários (formatDate, status, etc.)
│
├── next.config.ts                 # Config Next.js (images)
├── tailwind.config.ts             # Config Tailwind (se houver)
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependências e scripts
├── .env.example                   # Template de variáveis
└── .gitignore                     # Ignora .env, node_modules, .next
```

---

## 3. Padrões Arquiteturais

### 3.1 React Server Components (RSC)

Todas as páginas são **Server Components** por padrão. Isso significa:
- Queries Prisma executam no servidor, sem expor dados ao cliente
- Páginas marcadas com `export const dynamic = "force-dynamic"` para fetch fresh
- Dados são passados como props para Client Components quando necessário

### 3.2 Server Actions

Mutações (criar, editar, excluir) usam **Server Actions** (`"use server"`) definidas em `src/app/actions.ts`. Após a mutação:
1. `revalidatePath()` invalida cache das páginas afetadas
2. `redirect()` redireciona para a página apropriada

### 3.3 Autenticação

```
Requisição → middleware.ts → auth() → Verifica JWT
                                        ├── Válido → Continua para a página
                                        └── Inválido → Redirect /login
```

- **NextAuth v5** com provider `CredentialsProvider`
- Estratégia: JWT (sem sessão no banco)
- O JWT contém: `id`, `email`, `name`, `nivel`
- Middleware aplica em todas as rotas exceto: `/login`, `/api/auth/*`, `/_next/*`

### 3.4 Prisma + MySQL

- `relationMode = "prisma"` — O Prisma gerencia relações em memória (sem FK constraints no MySQL)
- Enums Prisma mapeiam exatamente os tipos ENUM do MySQL
- Singleton pattern para evitar múltiplas conexões em development (`globalForPrisma`)

### 3.5 Imagens

- Armazenadas no servidor PHP legado (Hostinger)
- Servidas via `next/image` com `remotePatterns` configurado para `florlinda.store`
- Proporção padrão: 3:2 (600×400) usando `aspect-ratio: 600/400`

---

## 4. Fluxo de Dados

### 4.1 Leitura (GET)

```
Browser → Next.js Page (RSC) → Prisma.findMany() → MySQL → Dados → HTML → Browser
```

### 4.2 Escrita (POST/PUT/DELETE)

```
Browser → <form action={serverAction}> → Server Action → Prisma.create/update/delete()
         → MySQL → revalidatePath() → redirect() → Browser (nova página)
```

---

## 5. Componentes Client vs Server

### Server Components (padrão)
- Todas as páginas (`page.tsx`)
- Layout (`layout.tsx`)
- Não precisam de `"use client"`

### Client Components (`"use client"`)
- `auth-provider.tsx` — Wrapper de sessão
- `sidebar.tsx` — Navegação com estado (active link, collapse)
- `header.tsx` — Busca com interatividade
- `production-chart.tsx` — Recharts (precisa de DOM)
- `stats-cards.tsx` — Animações

---

## 6. Dependências Principais

| Pacote | Propósito |
|--------|-----------|
| `next` | Framework web (SSR, routing, API) |
| `react` / `react-dom` | UI rendering |
| `@prisma/client` | ORM para MySQL |
| `next-auth` | Autenticação (credentials + JWT) |
| `bcryptjs` | Hash/compare de senhas |
| `recharts` | Gráficos (barras) |
| `lucide-react` | Ícones SVG |
| `tailwind-merge` | Merge inteligente de classes Tailwind |
| `clsx` | Conditional CSS classes |
| `class-variance-authority` | Component variants |
| `zod` | Validação de schemas |
| `date-fns` | Manipulação de datas |
| `dotenv` | Variáveis de ambiente |

---

## 7. Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string MySQL | `mysql://user:pass@host:3306/db` |
| `NEXTAUTH_SECRET` | Secret para JWT | `base64 string (32 bytes)` |
| `NEXTAUTH_URL` | URL base da aplicação | `https://pcpflorlinda.vercel.app` |

---

## 8. Regras de Negócio Importantes

### 8.1 Metas de Produção (Fallback)
O sistema prioriza dados reais da tabela `Producao`. Porém, se não houver registros diários para o cálculo de metas (hoje/semana/mês), ele entra em modo de **Estimativa**:
- Utiliza o campo `referencia.quantidade_produzida` (total).
- Calcula a média diária baseada nos dias úteis decorridos desde o início da coleção.
- Exibe o termo "(média estimada)" nos cards do dashboard.

### 8.2 Exclusão de Referências
Para garantir integridade:
- **Não é permitido** excluir referências que possuam etapas cadastradas.
- O botão de exclusão na interface permanece visível mas desabilitado (cinza) nesses casos.
- A Server Action `excluirReferencia` valida novamente essa regra no servidor antes de executar a exclusão.

