# Arquitetura — PCP Flor Linda (Next.js)

> **Versão:** 3.0  
> **Última atualização:** 20/02/2026  

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
              ┌────────────────────────┐
              │  Supabase Storage      │  ← fotos de referências
              │  (bucket: referencias) │
              └────────────────────────┘
                           ▲
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
│   │   ├── actions.ts             # Server Actions (CRUD principal)
│   │   ├── admin-actions.ts       # Server Actions (Admin)
│   │   ├── admin-queries.ts       # Queries de leitura para Admin
│   │   ├── login/
│   │   │   └── page.tsx           # Página de login
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts   # NextAuth API handler
│   │   │   └── upload-foto/
│   │   │       └── route.ts       # Upload de fotos (Supabase Storage)
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
│   │       ├── relatorios/
│   │       │   └── page.tsx       # Relatórios (export PDF)
│   │       ├── gerencial/
│   │       │   └── page.tsx       # Dashboard gerencial avançado
│   │       ├── tv-dashboard/
│   │       │   └── page.tsx       # Modo TV (fullscreen, sem sidebar)
│   │       └── admin/             # Área administrativa (admin only)
│   │           ├── page.tsx       # Painel admin principal
│   │           ├── usuarios/      # CRUD de usuários
│   │           ├── configuracoes/ # Configurações do sistema
│   │           ├── logs/          # Log de atividades
│   │           └── emails-relatorio/ # Gestão de e-mails do relatório diário
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-guard.tsx        # Proteção de rota (admin only)
│   │   │   └── admin-stats.tsx        # Cards de estatísticas admin
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx        # Cards de métricas
│   │   │   ├── production-chart.tsx   # Gráfico de barras (Recharts)
│   │   │   ├── collection-progress.tsx # Progresso das coleções
│   │   │   ├── recent-etapas.tsx      # Etapas recentes
│   │   │   └── referencias-grid.tsx   # Grid de referências com fotos
│   │   ├── gerencial/
│   │   │   ├── gerencial-content.tsx  # Dashboard Gerencial (Client Wrapper)
│   │   │   ├── burndown-chart.tsx     # Gráfico burndown de coleção
│   │   │   ├── etapas-por-colecao-chart.tsx # Etapas por coleção
│   │   │   ├── evolucao-semanal-chart.tsx   # Evolução semanal de produção
│   │   │   ├── gantt-colecoes-chart.tsx     # Gantt de coleções
│   │   │   ├── gauge-capacidade.tsx         # Gauge de capacidade produtiva
│   │   │   ├── heatmap-referencias.tsx      # Heatmap de referências
│   │   │   ├── ranking-atrasadas-chart.tsx  # Ranking de atrasadas
│   │   │   └── status-donut-chart.tsx       # Donut de status
│   │   ├── layout/
│   │   │   ├── dashboard-layout.tsx   # Layout wrapper (auth check)
│   │   │   ├── header.tsx             # Header com busca e user
│   │   │   └── sidebar.tsx            # Sidebar de navegação
│   │   ├── referencias/
│   │   │   ├── filter.tsx             # Filtros da lista
│   │   │   ├── delete-button.tsx      # Botão de exclusão com validação
│   │   │   └── foto-upload.tsx        # Upload/preview de foto
│   │   ├── tv-dashboard/
│   │   │   └── tv-content.tsx         # Conteúdo do modo TV
│   │   ├── ui/
│   │   │   └── ConfirmDialog.tsx      # Dialog de confirmação reutilizável
│   │   └── providers/
│   │       └── auth-provider.tsx      # SessionProvider do NextAuth
│   │
│   └── lib/
│       ├── prisma.ts              # Instância singleton do Prisma
│       ├── supabase.ts            # Cliente Supabase (Storage)
│       ├── log-atividade.ts       # Utilitário de log de atividades
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

Mutações (criar, editar, excluir) usam **Server Actions** (`"use server"`) definidas em:
- `src/app/actions.ts` — CRUD principal (coleções, referências, produção, etapas)
- `src/app/admin-actions.ts` — Ações administrativas (usuários, configurações)

Após a mutação:
1. `revalidatePath()` invalida cache das páginas afetadas
2. `redirect()` redireciona para a página apropriada
3. `registrarAtividade()` grava log de auditoria

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
- Rotas `/admin/*` verificam `nivel === "admin"` via `AdminGuard`

### 3.4 Prisma + MySQL

- `relationMode = "prisma"` — O Prisma gerencia relações em memória (sem FK constraints no MySQL)
- Enums Prisma mapeiam exatamente os tipos ENUM do MySQL
- Singleton pattern para evitar múltiplas conexões em development (`globalForPrisma`)

### 3.5 Imagens (Supabase Storage)

- Fotos de referências são armazenadas no **Supabase Storage** (bucket `referencias`)
- Upload via API Route: `POST /api/upload-foto` → retorna URL pública
- A URL pública é salva no campo `foto` da tabela `referencia` (MySQL)
- Fotos legadas do PHP continuam sendo exibidas via URL direta (`florlinda.store`)
- Suporte a limite de 350KB por arquivo no upload

### 3.6 Log de Atividades

Todas as ações de criação, edição e exclusão são registradas automaticamente via `registrarAtividade()` (em `src/lib/log-atividade.ts`). O log é visível na área de administração em `/admin/logs`.

---

## 4. Fluxo de Dados

### 4.1 Leitura (GET)

```
Browser → Next.js Page (RSC) → Prisma.findMany() → MySQL → Dados → HTML → Browser
```

### 4.2 Escrita (POST/PUT/DELETE)

```
Browser → <form action={serverAction}> → Server Action → Prisma.create/update/delete()
         → MySQL → registrarAtividade() → revalidatePath() → redirect() → Browser
```

### 4.3 Upload de Foto

```
Browser → <input type="file"> → POST /api/upload-foto
        → Supabase Storage → URL pública → Server Action editarReferencia()
        → prisma.referencia.update(foto: url) → MySQL
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
- `gerencial-content.tsx` — Filtros e gráficos interativos
- `foto-upload.tsx` — Preview e upload de imagem
- `ConfirmDialog.tsx` — Dialog de confirmação

---

## 6. Dependências Principais

| Pacote | Propósito |
|--------|-----------|
| `next` | Framework web (SSR, routing, API) |
| `react` / `react-dom` | UI rendering |
| `@prisma/client` | ORM para MySQL |
| `next-auth` | Autenticação (credentials + JWT) |
| `bcryptjs` | Hash/compare de senhas |
| `@supabase/supabase-js` | Storage de fotos (Supabase) |
| `recharts` | Gráficos (barras, donut, gauge) |
| `lucide-react` | Ícones SVG |
| `tailwind-merge` | Merge inteligente de classes Tailwind |
| `clsx` | Conditional CSS classes |
| `class-variance-authority` | Component variants |
| `zod` | Validação de schemas |
| `date-fns` | Manipulação de datas |
| `jspdf` + `jspdf-autotable` | Export de relatórios em PDF |
| `resend` | Envio de e-mails (relatório diário) |
| `sonner` | Toast notifications |
| `dotenv` | Variáveis de ambiente |

---

## 7. Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string MySQL | `mysql://user:pass@host:3306/db` |
| `NEXTAUTH_SECRET` | Secret para JWT | `base64 string (32 bytes)` |
| `NEXTAUTH_URL` | URL base da aplicação | `https://pcpflorlinda.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon pública do Supabase | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (server only) | `eyJ...` |
| `RESEND_API_KEY` | Chave da API Resend (e-mails) | `re_...` |

---

## 8. Regras de Negócio Importantes

### 8.1 Metas de Produção (Fallback)
O sistema prioriza dados reais da tabela `Producao`. Se não houver registros diários para o cálculo de metas (hoje/semana/mês), entra em modo de **Estimativa**:
- Utiliza o campo `referencia.quantidade_produzida` (total).
- Calcula a média diária baseada nos dias úteis decorridos desde o início da coleção.
- Exibe o termo "(média estimada)" nos cards do dashboard.

### 8.2 Exclusão de Referências
Para garantir integridade:
- **Não é permitido** excluir referências que possuam etapas cadastradas.
- O botão de exclusão na interface permanece visível mas desabilitado (cinza) nesses casos.
- A Server Action `excluirReferencia` valida novamente essa regra no servidor antes de executar.
- **Permissão:** Usuários com nível `"editor"` ou superior podem excluir (respeitando a regra acima).

### 8.3 Log de Auditoria
Toda ação de CRUD (criar, editar, excluir, alterar status) é automaticamente registrada com:
- Usuário responsável
- Entidade afetada (`colecao`, `referencia`, `etapa`, `producao`)
- Descrição legível da ação
- Timestamp

### 8.4 Área Administrativa
Acessível apenas para usuários com `nivel === "admin"`. Gerencia:
- Usuários (criar, editar, ativar/desativar)
- Configurações do sistema
- Log de atividades
- E-mails para relatório diário

