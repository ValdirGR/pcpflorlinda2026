# Fluxogramas — PCP Flor Linda (Next.js)

> **Última atualização:** 10/02/2026  

---

## 1. Fluxo de Autenticação

```
┌──────────────────┐
│ Usuário acessa   │
│ qualquer página  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   middleware.ts   │
│   auth() check   │
└────────┬─────────┘
         │
    JWT válido?
    ┌────┴────┐
    │         │
   SIM       NÃO
    │         │
    ▼         ▼
┌────────┐ ┌───────────────┐
│ Acessa │ │ Redirect para │
│ página │ │   /login      │
└────────┘ └───────┬───────┘
                   │
                   ▼
           ┌───────────────┐
           │  Formulário   │
           │ Email + Senha │
           └───────┬───────┘
                   │
                   ▼
           ┌───────────────┐
           │  signIn()     │
           │  NextAuth v5  │
           └───────┬───────┘
                   │
                   ▼
           ┌───────────────┐
           │ Prisma query  │
           │ usuario.find  │
           │ { email }     │
           └───────┬───────┘
                   │
           Usuário existe
           e está ativo?
           ┌──────┴──────┐
           │             │
          SIM           NÃO
           │             │
           ▼             ▼
   ┌──────────────┐  ┌──────────────┐
   │ bcrypt.compare│  │ Erro:        │
   │ (senha, hash)│  │ "Email ou    │
   └──────┬───────┘  │ senha        │
          │          │ inválidos"   │
    Senha válida?    └──────────────┘
    ┌─────┴─────┐
    │           │
   SIM         NÃO
    │           │
    ▼           ▼
┌────────────┐ ┌─────────────┐
│ Gera JWT   │ │ Erro na     │
│ {id, email,│ │ tela de     │
│  nivel}    │ │ login       │
│ Redirect   │ └─────────────┘
│ /dashboard │
└────────────┘
```

---

## 2. Fluxo de Leitura (Server Component)

```
┌──────────────────┐
│ Browser Request  │
│ GET /colecoes/22 │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   middleware.ts   │◄── Verifica JWT automaticamente
└────────┬─────────┘
         │ (autenticado)
         ▼
┌──────────────────────────┐
│ colecoes/[id]/page.tsx   │
│ (React Server Component) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ auth()                    │◄── Obtém sessão (id, nivel)
│ prisma.colecao.findUnique │◄── Query no MySQL
│   with: referencias,     │
│         etapas            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Renderiza HTML no server │
│ - Info cards             │
│ - Grid de referências    │
│ - Fotos (next/image)     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────┐
│ HTML enviado ao  │
│ browser (SSR)    │
└──────────────────┘
```

---

## 3. Fluxo de Criação (Server Action)

```
┌──────────────────────┐
│ Usuário preenche     │
│ formulário           │
│ /colecoes/novo       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ <form action={       │
│   criarColecao       │
│ }>                   │
│ Submit (POST)        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Server Action        │
│ criarColecao()       │
│ em actions.ts        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ prisma.colecao.      │
│   create({...})      │
│ → INSERT INTO MySQL  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ revalidatePath(      │
│   "/colecoes"        │
│   "/dashboard"       │
│ )                    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ redirect("/colecoes")│
│ → Browser redireciona│
│   para lista         │
└──────────────────────┘
```

---

## 4. Fluxo de Registro de Produção

```
┌──────────────────────┐
│ Usuário acessa       │
│ /producao/novo       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Seleciona referência │
│ Informa quantidade   │
│ Informa data         │
│ Submit               │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Server Action        │
│ criarProducao()      │
└──────────┬───────────┘
           │
      ┌────┴────────────────────────┐
      │                             │
      ▼                             ▼
┌─────────────────┐    ┌────────────────────────┐
│ prisma.producao │    │ prisma.referencia      │
│   .create({     │    │   .update({            │
│   referencia_id,│    │   quantidade_produzida:│
│   quantidade_dia│    │     { increment:       │
│   ...})         │    │       quantidade_dia } │
└─────────────────┘    │   })                   │
                       └────────────────────────┘
           │
           ▼
┌──────────────────────┐
│ revalidatePath(      │
│   "/producao"        │
│   "/referencias"     │
│   "/dashboard"       │
│ )                    │
│ redirect("/producao")│
└──────────────────────┘
```

---

## 5. Fluxo da Página de Produção (Dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│                    /producao (page.tsx)                       │
│                                                              │
│  getProducaoData() executa em paralelo:                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ prisma       │  │ prisma       │  │ prisma       │      │
│  │ .referencia  │  │ .colecao     │  │ .producao    │      │
│  │ .findMany()  │  │ .findMany()  │  │ .findMany()  │      │
│  │              │  │ (com refs)   │  │ (hoje/sem/   │      │
│  │ → stats      │  │ → progresso  │  │  mês)        │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         ▼                 ▼                  ▼               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Dados Processados                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ stats: {totalRef, finalizadas, emProd, aguardando}  │    │
│  │ metas: {hoje, semana, mês, metaDiaria/Sem/Men}      │    │
│  │ progressoColecoes: [{nome, pct, prod, prev}...]     │    │
│  │ ultimasAtualizacoes: [últimas 10]                   │    │
│  │ refCriticas: [refs com etapas vencidas]             │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Renderização                        │    │
│  │                                                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │    │
│  │  │Stats Card│ │Stats Card│ │Stats Card│ │Stats   │ │    │
│  │  │Total Ref │ │Finaliz. │ │Em Prod.  │ │Aguard. │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │ Tabela: Progresso por Coleção               │   │    │
│  │  │ (nome | status | refs | barra progresso)    │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │ Tabela: Últimas Atualizações de Produção    │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  │                                                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │Meta      │ │Meta      │ │Meta      │           │    │
│  │  │Diária    │ │Semanal   │ │Mensal    │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │ Tabela: Referências com Prazo Crítico       │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Fluxo de Exclusão (Admin Only)

```
┌──────────────────────┐
│ Admin clica          │
│ "Excluir Coleção"    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Server Action        │
│ excluirColecao(id)   │
└──────────┬───────────┘
           │
           ▼ (cascata manual)
┌──────────────────────┐
│ 1. Busca referências │
│    da coleção        │
│                      │
│ 2. Para cada ref:    │
│    - Deleta etapas   │
│    - Deleta produções│
│                      │
│ 3. Deleta referências│
│    da coleção        │
│                      │
│ 4. Deleta coleção    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ revalidatePath(...)  │
│ redirect("/colecoes")│
└──────────────────────┘
```

---

## 7. Fluxo de Permissões (UI)

```
┌────────────────────────────────────────────────────┐
│                Nível do Usuário                    │
├───────────────┬───────────────┬────────────────────┤
│    admin      │   usuario     │   visualizador     │
├───────────────┼───────────────┼────────────────────┤
│ Ver tudo      │ Ver tudo      │ Ver tudo           │
│ Criar tudo    │ Criar tudo    │ ✗ Não cria         │
│ Editar tudo   │ Editar tudo   │ ✗ Não edita        │
│ Excluir tudo  │ ✗ Não exclui  │ ✗ Não exclui       │
└───────────────┴───────────────┴────────────────────┘

Implementação no código:
- Botões de ação são condicionais via `session.user.nivel`
- Server Actions não verificam permissão (confiam no UI layer)
```

---

## 8. Fluxo de Imagens (Fotos de Referências)

```
┌──────────────────────────────────────────────────────────┐
│                  Sistema PHP Legado                       │
│               florlinda.store/pcpflorlinda/               │
│                                                          │
│  Upload via PHP → salva em:                              │
│  /uploads/referencias/{hash}.jpg                         │
│  Campo `foto` na tabela `referencias` = nome do arquivo  │
└────────────────────────┬─────────────────────────────────┘
                         │
                         │ next/image com remotePatterns
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  Next.js (Vercel)                         │
│                                                          │
│  <Image                                                  │
│    src={`https://florlinda.store/pcpflorlinda/            │
│          uploads/referencias/${ref.foto}`}                │
│    fill                                                  │
│    style={{ aspectRatio: "600/400" }}                    │
│  />                                                      │
│                                                          │
│  next.config.ts:                                         │
│    images.remotePatterns = [{                             │
│      protocol: "https",                                  │
│      hostname: "florlinda.store",                        │
│      pathname: "/pcpflorlinda/uploads/**"                │
│    }]                                                    │
└──────────────────────────────────────────────────────────┘
```
