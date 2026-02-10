# PRD — Painel de Controle de Produção (PCP) Flor Linda

> **Versão:** 2.0 (Next.js)  
> **Última atualização:** 10/02/2026  
> **Repositório:** https://github.com/ValdirGR/pcpflorlinda2026  
> **Produção:** https://pcpflorlinda.vercel.app  

---

## 1. Visão Geral

O PCP Flor Linda é um sistema web de **Gestão de Produção** para a confecção Flor Linda. Permite o controle completo do ciclo de produção de coleções de moda, desde o cadastro de coleções e referências até o acompanhamento diário de metas de produção.

### 1.1 Objetivos

- Centralizar o acompanhamento de todas as coleções e referências da Flor Linda
- Controlar etapas de produção de cada referência
- Monitorar metas de produção (diária, semanal e mensal)
- Identificar gargalos e referências com prazo crítico
- Oferecer dashboards visuais para tomada de decisão rápida

### 1.2 Público-Alvo

| Perfil | Descrição |
|--------|-----------|
| **Admin** | Acesso total: CRUD completo, exclusões, gestão de usuários |
| **Usuário** | CRUD de coleções, referências e produção (sem exclusão) |
| **Visualizador** | Apenas visualização de dados e relatórios |

---

## 2. Stack Tecnológica

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **Linguagem** | TypeScript | 5.x |
| **React** | React | 19.2.3 |
| **Estilização** | Tailwind CSS | 4.x |
| **ORM** | Prisma | 5.22.0 |
| **Banco de Dados** | MySQL (Hostinger) | 8.x |
| **Autenticação** | NextAuth.js v5 (beta) | 5.0.0-beta.30 |
| **Criptografia** | bcryptjs | 3.x |
| **Gráficos** | Recharts | 3.7.0 |
| **Ícones** | Lucide React | 0.563 |
| **Validação** | Zod | 4.x |
| **Datas** | date-fns | 4.x |
| **Deploy** | Vercel | Auto-deploy |

---

## 3. Funcionalidades

### 3.1 Autenticação

- Login com email/senha
- Senhas armazenadas com bcrypt (compatível com hash do PHP legado)
- Sessão via JWT (stateless)
- Middleware protege todas as rotas exceto `/login`, `/api/auth/*`
- 3 níveis de acesso: `admin`, `usuario`, `visualizador`

### 3.2 Dashboard (`/dashboard`)

- **4 Cards de Resumo:** Total Coleções, Total Referências, Total Produzidas, Etapas Atrasadas
- **Gráfico de Produção:** Barras com produção dos últimos 14 dias (Recharts)
- **Progresso por Coleção:** Lista com barras de progresso de cada coleção
- **Etapas Recentes:** Lista com etapas pendentes/em andamento e prazos
- **Referências Recentes:** Grid com últimas 12 referências (com fotos)

### 3.3 Coleções (`/colecoes`)

- **Listagem:** Todas as coleções com contagem de referências, progresso, e status
- **Detalhes (`/colecoes/[id]`):** Período, nº de referências, produção total, progresso + grid de referências com fotos (600×400)
- **Criar (`/colecoes/novo`):** Formulário com nome, código, datas, status
- **Editar (`/colecoes/[id]/editar`):** Formulário preenchido com dados atuais
- **Excluir:** Disponível apenas para admin (exclui referências e etapas em cascata)

### 3.4 Referências (`/referencias`)

- **Listagem:** Tabela com código, nome, coleção, produção, status + filtros
- **Detalhes (`/referencias/[id]`):** Informações completas, foto da peça, etapas de produção, histórico de produção
- **Criar (`/referencias/novo`):** Formulário com todos os campos
- **Editar (`/referencias/[id]/editar`):** Formulário preenchido
- **Busca (`/referencias/busca`):** Busca por código ou nome

### 3.5 Produção (`/producao`)

Dashboard completo replicando o sistema PHP legado:

- **Stats Cards:** Total Referências, Finalizadas (%), Em Produção (%), Aguardando Distribuição (%)
- **Progresso por Coleção:** Tabela com barras de progresso, peças produzidas/previstas
- **Últimas Atualizações:** 10 últimos registros de produção
- **Metas de Produção:** Meta Diária, Semanal (×6), Mensal (×26) com barras de progresso
- **Referências com Prazo Crítico:** Referências com etapas vencidas e dias restantes

### 3.6 Relatórios (`/relatorios`)

- Relatórios gerais de produção e acompanhamento

---

## 4. Regras de Negócio

### 4.1 Status de Coleções

| Valor | Label |
|-------|-------|
| `normal` | Normal |
| `atrasado` | Atrasado |
| `finalizado` | Finalizado |

### 4.2 Status de Referências

| Valor | Label |
|-------|-------|
| `normal` | Normal |
| `finalizada` | Finalizada |
| `arquivada` | Arquivada |
| `atraso_desenvolvimento` | Atraso Desenvolvimento |
| `atraso_logistica` | Atraso Logística |
| `em_producao` | Em Produção |

### 4.3 Status das Etapas de Produção

| Valor | Label |
|-------|-------|
| `pendente` | Pendente |
| `em_andamento` | Em Andamento |
| `concluida` | Concluída |

### 4.4 Cálculos de Metas

- **Meta Diária** = Soma de `producao_diaria_pessoa` de todas as referências
- **Meta Semanal** = Meta Diária × 6 (6 dias úteis)
- **Meta Mensal** = Meta Diária × 26 (26 dias úteis)
- **Produção Hoje** = Soma de `quantidade_dia` da tabela `producao` filtrada por data = hoje
- **Produção Semanal** = Soma da semana (segunda a sábado)  
- **Produção Mensal** = Soma do mês atual

### 4.5 Progresso

- `Progresso (%) = (quantidade_produzida / previsao_producao) × 100`
- Barra verde quando ≥ 100%, rosa/azul quando < 100%

### 4.6 Prazo Crítico

Uma referência é considerada **crítica** quando:
- Status ≠ `finalizada`
- Possui etapas com `data_fim` anterior à data atual

### 4.7 Fotos

- Fotos das referências são armazenadas no servidor PHP legado em Hostinger
- URL: `https://florlinda.store/pcpflorlinda/uploads/referencias/{nome_arquivo}`
- Exibidas com proporção 3:2 (600×400) usando `next/image`

---

## 5. Restrições

- **NÃO ALTERAR O BANCO DE DADOS** — O banco MySQL na Hostinger está em produção com o sistema PHP legado
- O Prisma usa `relationMode = "prisma"` (sem foreign keys no banco)
- Enums no Prisma mapeiam exatamente os ENUMs do MySQL
- Senhas bcrypt são compatíveis entre PHP e Node.js

---

## 6. Histórico de Versões

| Data | Versão | Mudança |
|------|--------|---------|
| 2026-02-09 | 1.0 | Sistema PHP original (pcpflorlinda) |
| 2026-02-10 | 2.0 | Migração completa para Next.js 16 + Vercel |
| 2026-02-10 | 2.1 | Fotos nas referências (Hostinger URL) |
| 2026-02-10 | 2.2 | Página Produção redesenhada como dashboard completo |
| 2026-02-10 | 2.3 | Fotos nos cards de referência na coleção (600×400) |
