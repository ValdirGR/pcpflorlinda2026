# PRD — Painel de Controle de Produção (PCP) Flor Linda

> **Versão:** 3.0 (Next.js)  
> **Última atualização:** 20/02/2026  
> **Repositório:** https://github.com/ValdirGR/pcpflorlinda2026  
> **Produção:** https://pcpflorlinda.vercel.app  

---

## 1. Visão Geral

O PCP Flor Linda é um sistema web de **Gestão de Produção** para a confecção Flor Linda. Permite o controle completo do ciclo de produção de coleções de moda, desde o cadastro de coleções e referências até o acompanhamento diário de metas de produção, com dashboards avançados para gestão.

### 1.1 Objetivos

- Centralizar o acompanhamento de todas as coleções e referências da Flor Linda
- Controlar etapas de produção de cada referência
- Monitorar metas de produção (diária, semanal e mensal)
- Identificar gargalos e referências com prazo crítico
- Oferecer dashboards visuais para tomada de decisão rápida
- Prover painel gerencial avançado com múltiplos gráficos analíticos
- Enviar relatórios diários automáticos por e-mail

### 1.2 Público-Alvo

| Perfil | Descrição |
|--------|-----------|
| **Admin** | Acesso total: CRUD completo, exclusões, gestão de usuários, configurações |
| **Editor** | CRUD de coleções, referências e produção + exclusão (sem etapas cadastradas) |
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
| **Storage de Fotos** | Supabase Storage | 2.x |
| **Autenticação** | NextAuth.js v5 (beta) | 5.0.0-beta.30 |
| **Criptografia** | bcryptjs | 3.x |
| **Gráficos** | Recharts | 3.7.0 |
| **Ícones** | Lucide React | 0.563 |
| **Validação** | Zod | 4.x |
| **Datas** | date-fns | 4.x |
| **PDF Export** | jsPDF + jspdf-autotable | 4.x / 5.x |
| **E-mail** | Resend | 6.x |
| **Toasts** | Sonner | 2.x |
| **Deploy** | Vercel | Auto-deploy |

---

## 3. Funcionalidades

### 3.1 Autenticação

- Login com email/senha
- Senhas armazenadas com bcrypt (compatível com hash do PHP legado)
- Sessão via JWT (stateless)
- Middleware protege todas as rotas exceto `/login`, `/api/auth/*`
- 4 níveis de acesso: `admin`, `editor`, `usuario`, `visualizador`

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
- **Excluir:** Disponível para admin (exclui referências e etapas em cascata)

### 3.4 Referências (`/referencias`)

- **Listagem:** Tabela com código, nome, coleção, produção, status + filtros
- **Detalhes (`/referencias/[id]`):** Informações completas, foto da peça, etapas de produção, histórico de produção
- **Criar (`/referencias/novo`):** Formulário com todos os campos + upload de foto
- **Editar (`/referencias/[id]/editar`):** Formulário preenchido + upload/troca de foto
- **Busca (`/referencias/busca`):** Busca por código ou nome
- **Excluir:** Disponível para `editor` ou superior, somente sem etapas cadastradas

### 3.5 Produção (`/producao`)

Dashboard completo replicando o sistema PHP legado:

- **Stats Cards:** Total Referências, Finalizadas (%), Em Produção (%), Aguardando Distribuição (%)
- **Progresso por Coleção:** Tabela com barras de progresso, peças produzidas/previstas
- **Últimas Atualizações:** 10 últimos registros de produção
- **Metas de Produção:** Meta Diária, Semanal (×6), Mensal (×26) com barras de progresso
- **Referências com Prazo Crítico:** Referências com etapas vencidas e dias restantes

### 3.6 Relatórios (`/relatorios`)

- Relatórios gerais de produção e acompanhamento
- Export em PDF via jsPDF

### 3.7 Dashboard Gerencial (`/gerencial`)

Painel analítico avançado com filtros inline:

- **Filtros:** Por coleção e status, sem reload de página
- **KPI Cards:** Métricas de performance de produção
- **Gráfico Burndown:** Progresso da coleção ao longo do tempo
- **Gráfico Donut de Status:** Distribuição de referências por status
- **Heatmap de Referências:** Volume de produção por referência
- **Ranking de Atrasadas:** Referências mais atrasadas ordenadas por criticidade
- **Gantt de Coleções:** Linha do tempo comparativa de coleções
- **Evolução Semanal:** Tendência de produção semanal
- **Gauge de Capacidade:** Indicador de utilização da capacidade produtiva
- **Etapas por Coleção:** Distribuição de etapas por coleção

### 3.8 TV Dashboard (`/tv-dashboard`)

- Visualização fullscreen sem sidebar, otimizada para monitores de gestão
- Atualização automática de dados
- Layout compacto com indicadores de alto impacto visual

### 3.9 Área Administrativa (`/admin`) — Admin Only

- **Painel Principal:** Estatísticas de usuários, atividades recentes
- **Usuários (`/admin/usuarios`):** Listar, criar, editar, ativar/desativar usuários
- **Log de Atividades (`/admin/logs`):** Histórico auditável de todas as ações do sistema
- **Configurações (`/admin/configuracoes`):** Configurações gerais do sistema
- **Relatório por E-mail (`/admin/emails-relatorio`):** Gestão da lista de e-mails que recebem o relatório diário de produção em PDF

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

- **Meta Diária** = Soma de `producao_diaria_pessoa` de todas as referências ativas
- **Meta Semanal** = Meta Diária × 6 (6 dias úteis)
- **Meta Mensal** = Meta Diária × 26 (26 dias úteis)
- **Produção Hoje** = Soma de `quantidade_dia` da tabela `producao` filtrada por data = hoje
- **Produção Semanal** = Soma da semana (segunda a sábado)
- **Produção Mensal** = Soma do mês atual

**Fallback:** Se não houver registros diários, usa `referencia.quantidade_produzida` / dias úteis e exibe "(média estimada)".

### 4.5 Progresso

- `Progresso (%) = (quantidade_produzida / previsao_producao) × 100`
- Barra verde quando ≥ 100%, rosa/azul quando < 100%

### 4.6 Prazo Crítico

Uma referência é considerada **crítica** quando:
- Status ≠ `finalizada`
- Possui etapas com `data_fim` anterior à data atual

### 4.7 Fotos de Referências

- Novas fotos: upload via `POST /api/upload-foto` → **Supabase Storage** (bucket `referencias`)
- Limite: 350KB por arquivo
- Formatos aceitos: JPG, PNG, WebP
- URL pública retornada e salva no campo `foto` da tabela `referencia`
- Fotos legadas do PHP continuam acessíveis via `https://florlinda.store/pcpflorlinda/uploads/referencias/{arquivo}`
- Exibidas com proporção 3:2 (600×400) usando `next/image`

### 4.8 Exclusão de Referências

- **Condição:** Somente permitida se a referência não tiver etapas cadastradas
- **Permissão:** Usuários `editor`, `admin`
- **Validação dupla:** Frontend desabilita o botão + Server Action valida no servidor

### 4.9 Log de Auditoria

Todas as ações de CRUD são registradas automaticamente com entidade, ID, descrição e usuário responsável. Visível em `/admin/logs`.

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
| 2026-02-13 | 2.4 | Upload de fotos via Supabase Storage (350KB limit) |
| 2026-02-13 | 2.5 | TV Dashboard liberado para acesso público |
| 2026-02-14 | 2.6 | Log de atividades + Área Admin (usuários, logs, config) |
| 2026-02-20 | 3.0 | Dashboard Gerencial inline com 8 gráficos analíticos; Botão de exclusão liberado para nível editor; Exclusão segura (valida etapas); Correto visual Tailwind v4 |
