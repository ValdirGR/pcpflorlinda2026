# API & Server Actions — PCP Flor Linda

> **Última atualização:** 24/02/2026  

---

## 1. Visão Geral

O PCP Flor Linda **não usa API REST tradicional**. As mutações são feitas via **Server Actions** (Next.js) e as leituras são feitas diretamente nas páginas (React Server Components).

As únicas rotas API são:
- NextAuth para autenticação
- Upload de fotos via Supabase Storage
- Cron de relatório diário (protegido por `CRON_SECRET`)

---

## 2. Rotas API

### `GET/POST /api/auth/[...nextauth]`

Handler do NextAuth v5. Gerencia:
- `POST /api/auth/callback/credentials` — Login
- `POST /api/auth/signout` — Logout
- `GET /api/auth/session` — Obter sessão atual
- `GET /api/auth/csrf` — Token CSRF

**Arquivo:** `src/app/api/auth/[...nextauth]/route.ts`

```typescript
export { GET, POST } from "@/auth";
// Exporta handlers de src/auth.ts (NextAuth v5)
```

---

### `GET|POST /api/cron/relatorio-diario`

Gera e envia o relatório gerencial diário em PDF por e-mail para todos os destinatários ativos cadastrados.

**Autenticação:**
- `GET ?secret=CRON_SECRET` — útil para testes manuais
- `POST Authorization: Bearer CRON_SECRET` — usado pelo Supabase pg_cron

**Resposta (sucesso):**
```json
{ "ok": true, "enviados": 3, "erros": 0, "destinatarios": ["...emails..."] }
```

**Resposta (sem destinatários):**
```json
{ "ok": true, "message": "Nenhum destinatário ativo" }
```

**Arquivo:** `src/app/api/cron/relatorio-diario/route.ts`

**Agendamento sugerido (Supabase pg_cron):**
```sql
SELECT cron.schedule('relatorio-gerencial-diario', '0 10 * * 1-5',
  $$ SELECT net.http_post(
    url := 'https://pcpflorlinda.vercel.app/api/cron/relatorio-diario',
    headers := jsonb_build_object('Authorization','Bearer SEU_CRON_SECRET'),
    body := '{}'::jsonb
  ); $$
);
```
> Seg–Sex às 07h BRT (10h UTC)

---

### `POST /api/upload-foto`

Upload de foto de referência para o Supabase Storage.

**Request:**
- `Content-Type: multipart/form-data`
- Campo `file`: arquivo de imagem (JPG, PNG, WebP — máx. 350KB)

**Response (sucesso):**
```json
{ "url": "https://xxx.supabase.co/storage/v1/object/public/referencias/foto.jpg" }
```

**Response (erro):**
```json
{ "error": "mensagem de erro" }
```

**Arquivo:** `src/app/api/upload-foto/route.ts`

O handler usa `SUPABASE_SERVICE_ROLE_KEY` (server-only) para fazer o upload no bucket `referencias`.

---

## 3. Server Actions

### 3.1 Coleções — `src/app/actions.ts`

#### `criarColecao(formData: FormData)`

Cria uma nova coleção no banco.

| Campo FormData | Tipo | Obrigatório | Descrição |
|----------------|------|-------------|-----------|
| `nome` | string | ✅ | Nome da coleção |
| `codigo` | string | ✅ | Código identificador |
| `data_inicio` | string (date) | ✅ | Data de início |
| `data_fim` | string (date) | ✅ | Data de fim |
| `prazo_inicial_estilo` | string (date) | ❌ | Prazo inicial do estilo |
| `prazo_final_estilo` | string (date) | ❌ | Prazo final do estilo |
| `data_envio_prevista` | string (date) | ❌ | Data prevista de envio |
| `quantidade_total_producao` | string (int) | ❌ | Quantidade total (default: 0) |
| `status` | string (enum) | ❌ | `normal` \| `atrasado` \| `finalizado` |
| `status_estilo` | string | ❌ | Status do estilo |

**Efeitos:**
- `registrarAtividade()` — grava log de auditoria
- `revalidatePath("/colecoes")`, `revalidatePath("/dashboard")`
- `redirect("/colecoes")`

---

#### `editarColecao(id: number, formData: FormData)`

Atualiza uma coleção existente. Mesmos campos do `criarColecao`.

**Efeitos:**
- `registrarAtividade()`
- `revalidatePath("/colecoes")`, `revalidatePath("/colecoes/{id}")`, `revalidatePath("/dashboard")`
- `redirect("/colecoes/{id}")`

---

#### `excluirColecao(id: number)`

Exclui uma coleção e **todos os dados relacionados** em cascata:
1. Para cada referência: exclui etapas e produções
2. Exclui todas as referências da coleção
3. Exclui a coleção

**Permissão:** Admin only.

**Efeitos:**
- `registrarAtividade()` (com número de referências excluídas em `detalhes`)
- `revalidatePath("/colecoes")`, `revalidatePath("/dashboard")`
- `redirect("/colecoes")`

---

### 3.2 Referências — `src/app/actions.ts`

#### `criarReferencia(formData: FormData)`

| Campo FormData | Tipo | Obrigatório | Descrição |
|----------------|------|-------------|-----------|
| `colecao_id` | string (int) | ✅ | ID da coleção |
| `codigo` | string | ✅ | Código da referência |
| `nome` | string | ✅ | Nome da peça |
| `tempo_producao` | string (int) | ✅ | Tempo de produção (min) |
| `previsao_producao` | string (int) | ✅ | Previsão em peças |
| `producao_diaria_pessoa` | string (int) | ✅ | Produção diária/pessoa |
| `foto` | string (URL) | ❌ | URL pública da foto (Supabase ou Hostinger) |
| `data_distribuicao` | string (date) | ❌ | Data de distribuição |
| `media_dias_entrega` | string (int) | ❌ | Média dias entrega |
| `localizacao_estoque` | string | ❌ | Local no estoque |
| `status` | string (enum) | ❌ | Status da referência |
| `para_marketing` | "on" \| null | ❌ | Checkbox marketing |
| `observacoes` | string | ❌ | Observações |

**Status possíveis:** `normal` \| `finalizada` \| `arquivada` \| `atraso_desenvolvimento` \| `atraso_logistica` \| `em_producao`

**Efeitos:**
- `registrarAtividade()`
- `revalidatePath("/referencias")`, `revalidatePath("/dashboard")`
- `redirect("/referencias")`

---

#### `editarReferencia(id: number, formData: FormData)`

Mesmos campos do `criarReferencia`.

**Efeitos:**
- `registrarAtividade()`
- `revalidatePath("/referencias")`, `revalidatePath("/referencias/{id}")`, `revalidatePath("/dashboard")`
- `redirect("/referencias/{id}")`

---

#### `atualizarStatusReferencia(id: number, status: referencias_status)`

Atualiza apenas o status de uma referência.

**Efeitos:**
- `registrarAtividade()` com novo status
- `revalidatePath("/referencias")`, `revalidatePath("/dashboard")`
- **Retorna:** `{ success: true }`

---

#### `excluirReferencia(id: number)`

Exclui uma referência e **todos os dados relacionados** em cascata.

**Permissão:** `usuario` ou `admin` (visualizador não vê o botão).

**Cascade:**
1. Remove a foto do **Supabase Storage** (se a URL pertencer ao bucket `referencias-fotos`)
2. Exclui todas as `etapas_producao` da referência
3. Exclui todos os registros de `producao` da referência
4. Exclui a referência

**Validação UI:** Dupla confirmação via `ConfirmDialog` (dois dialogs sequenciais com mensagens de alerta progressivas).

**Efeitos:**
- `registrarAtividade()`
- `revalidatePath("/referencias")`, `revalidatePath("/colecoes/{colecao_id}")`, `revalidatePath("/dashboard")`
- **Retorna:** `{ success: true }`

---

#### `listarColecoesParaSeletor()`

Retorna coleções ativas (status ≠ `desabilitada`) para uso em selects de formulário.

**Retorna:** `Array<{ id, nome, codigo }>`

---

### 3.3 Produção — `src/app/actions.ts`

#### `criarProducao(formData: FormData)`

| Campo FormData | Tipo | Obrigatório | Descrição |
|----------------|------|-------------|-----------|
| `referencia_id` | string (int) | ✅ | ID da referência |
| `quantidade_dia` | string (int) | ✅ | Peças produzidas no dia |
| `data_producao` | string (date) | ✅ | Data da produção |
| `status` | string (enum) | ❌ | `normal` \| `atrasado` \| `finalizado` |
| `observacoes` | string | ❌ | Observações |

**Efeitos adicionais:**
- Incrementa `quantidade_produzida` na referência: `prisma.referencia.update({ quantidade_produzida: { increment: quantidade_dia } })`
- `registrarAtividade()`
- `revalidatePath("/producao")`, `revalidatePath("/referencias")`, `revalidatePath("/dashboard")`
- `redirect("/producao")`

---

### 3.4 Etapas de Produção — `src/app/actions.ts`

#### `adicionarEtapa(formData: FormData)`

| Campo FormData | Tipo | Obrigatório | Descrição |
|----------------|------|-------------|-----------|
| `referencia_id` | string (int) | ✅ | ID da referência |
| `nome` | string | ✅ | Nome da etapa |
| `status` | string (enum) | ❌ | `pendente` \| `em_andamento` \| `concluida` |
| `data_inicio` | string (date) | ❌ | Data de início |
| `data_fim` | string (date) | ❌ | Data de fim (prazo) |
| `observacoes` | string | ❌ | Observações |

**Efeitos:**
- `registrarAtividade()`
- `revalidatePath("/referencias/{referencia_id}")`, `revalidatePath("/dashboard")`
- `redirect("/referencias/{referencia_id}")`

---

#### `atualizarEtapa(id: number, formData: FormData)`

| Campo FormData | Tipo | Obrigatório | Descrição |
|----------------|------|-------------|-----------|
| `referencia_id` | string (int) | ✅ | ID da referência (para redirect) |
| `nome` | string | ✅ | Nome da etapa |
| `status` | string (enum) | ✅ | Novo status |
| `data_inicio` | string (date) | ❌ | Data de início |
| `data_fim` | string (date) | ❌ | Data de fim |
| `observacoes` | string | ❌ | Observações |

**Efeitos:**
- `registrarAtividade()`
- `revalidatePath("/referencias/{referencia_id}")`, `revalidatePath("/dashboard")`
- `redirect("/referencias/{referencia_id}")`

---

#### `excluirEtapa(id: number, referencia_id: number)`

Exclui uma etapa de produção.

**Efeitos:**
- `registrarAtividade()`
- `revalidatePath("/referencias/{referencia_id}")`, `revalidatePath("/dashboard")`

---

### 3.5 Área Admin — `src/app/admin-actions.ts`

Actions disponíveis na área administrativa (requerem `nivel === "admin"`):

- Criar/editar/desativar usuários
- Salvar configurações do sistema
- Gerenciar lista de e-mails para relatório diário

---

## 4. Queries por Página

### `/dashboard`

```typescript
// 4 queries em paralelo via Promise.all:
prisma.colecao.findMany({ include: { _count, referencias } })
prisma.referencia.findMany({ include: { colecao, etapas } })
prisma.producao.findMany({ take: 30, orderBy: data_producao desc })
prisma.etapaProducao.findMany({ where: status in [pendente, em_andamento], take: 10 })
```

### `/colecoes`

```typescript
prisma.colecao.findMany({
  include: { _count: { referencias }, referencias: { select: quantidade_produzida, previsao_producao } },
  orderBy: { created_at: desc }
})
```

### `/colecoes/[id]`

```typescript
prisma.colecao.findUnique({
  where: { id },
  include: {
    referencias: {
      include: { etapas: { where: status in [pendente, em_andamento] } },
      orderBy: { codigo: asc }
    }
  }
})
```

### `/referencias`

```typescript
prisma.referencia.findMany({
  include: { colecao: { select: nome }, etapas },
  orderBy: { created_at: desc }
})
```

### `/referencias/[id]`

```typescript
prisma.referencia.findUnique({
  where: { id },
  include: { colecao, etapas: { orderBy: created_at asc }, producoes: { orderBy: data_producao desc } }
})
```

### `/producao`

```typescript
// 6 queries em paralelo via Promise.all:
prisma.referencia.findMany({ select: id, codigo, nome, status, quantidade_produzida, previsao_producao, producao_diaria_pessoa, colecao, etapas })
prisma.colecao.findMany({ include: { _count, referencias } })
prisma.producao.findMany({ where: data = hoje })
prisma.producao.findMany({ where: data = semana })
prisma.producao.findMany({ where: data = mês })
prisma.producao.findMany({ take: 10, include: referencia })
```

### `/admin` — `src/app/admin-queries.ts`

```typescript
// Estatísticas admin via obterEstatisticasAdmin():
prisma.usuario.count()
prisma.usuario.findMany({ take: 5, orderBy: created_at desc })
// + demais métricas do sistema
```

---

## 5. Utilitários (`src/lib/utils.ts`)

### Funções Disponíveis

| Função | Assinatura | Descrição |
|--------|-----------|-----------|
| `cn` | `(...inputs: ClassValue[]) => string` | Merge de classes Tailwind |
| `formatDate` | `(date: Date \| string \| null) => string` | Formata data pt-BR (`America/Sao_Paulo`) |
| `formatDateTime` | `(date: Date \| string \| null) => string` | Formata data+hora pt-BR (`America/Sao_Paulo`) |
| `calcPercentage` | `(produced: number, total: number) => number` | Calcula % (max 100) |
| `getStatusColor` | `(status: string) => string` | Retorna classes CSS do badge |
| `getStatusLabel` | `(status: string) => string` | Retorna label legível |
| `isDeadlineNear` | `(date, days?: number) => boolean` | Prazo próximo (default: 5 dias) |
| `isOverdue` | `(date: Date \| string \| null) => boolean` | Data vencida |

### Mapa de Status → Cores

| Status | Classes CSS |
|--------|------------|
| `normal` | `bg-blue-100 text-blue-800` |
| `finalizada` / `finalizado` | `bg-green-100 text-green-800` |
| `arquivada` | `bg-gray-100 text-gray-800` |
| `atraso_desenvolvimento` | `bg-yellow-100 text-yellow-800` |
| `atraso_logistica` / `atrasado` | `bg-red-100 text-red-800` |
| `pendente` | `bg-orange-100 text-orange-800` |
| `em_andamento` | `bg-blue-100 text-blue-800` |
| `concluida` | `bg-green-100 text-green-800` |
| `em_producao` | `bg-purple-100 text-purple-800` |

---

## 6. Log de Atividades (`src/lib/log-atividade.ts`)

Utilitário chamado automaticamente em todas as Server Actions e em eventos de autenticação.

```typescript
registrarAtividade({
  acao: "criar" | "editar" | "excluir" | "login" | "logout" | "alterar_status" | "alterar_senha",
  entidade: "colecao" | "referencia" | "etapa" | "producao" | "usuario" | "sistema" | "email_relatorio",
  entidadeId?: number,
  descricao: string,       // label legível
  detalhes?: string,       // informações extras (opcional)
})
```

**Eventos de autenticação** são registrados diretamente via callbacks `events` do NextAuth em `src/auth.ts` (sem risco de loop):
- `events.signIn` → grava login com IP via `x-forwarded-for`
- `events.signOut` → grava logout com nome do usuário extraído do JWT

---

## 7. Prisma Client (`src/lib/prisma.ts`)

Singleton pattern para evitar múltiplas conexões em desenvolvimento:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

**Importante:** Em desenvolvimento, o Hot Module Reload cria novas instâncias de `PrismaClient`. O singleton armazena a instância em `globalThis` para reutilizar.

---

## 8. Cliente Supabase (`src/lib/supabase.ts`)

Usado exclusivamente para operações de **Storage** (fotos de referências):

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);
```

**Bucket:** `referencias` (público, sem autenticação para leitura)
