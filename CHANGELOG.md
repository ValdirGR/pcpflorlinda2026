# Changelog

## [3.0.0] - 2026-02-20

### Adicionado
- **Dashboard Gerencial Inline:** Componente `GerencialContent` com filtros por coleção e status na própria página, sem reload. Inclui 8 gráficos: Burndown, Donut de Status, Heatmap de Referências, Ranking de Atrasadas, Gantt de Coleções, Evolução Semanal, Gauge de Capacidade e Etapas por Coleção.
- **Exclusão Segura:** Botão de exclusão de referências valida se existem etapas cadastradas. Botão fica desabilitado visualmente e Server Action bloqueia a operação.
- **Fallback de Metas:** Cards de produção exibem "(média estimada)" quando não há registros diários na tabela `Producao`, usando o histórico total para cálculo.

### Corrigido
- **Tailwind CSS v4 Warnings:** Substituídos `bg-gradient-*` por `bg-linear-*` e `flex-shrink-0` por `shrink-0` em diversos arquivos (`sidebar.tsx`, `form.tsx`, etc.).
- **Bugs de Layout:** Ajustes no `Sidebar` para evitar quebra de layout em telas menores.
- **Permissão de Exclusão:** Liberado botão de exclusão para usuários com nível "editor" ou superior (antes apenas admin), mantendo a validação de etapas.

---

## [2.6.0] - 2026-02-14

### Adicionado
- **Área Administrativa (`/admin`):** Painel completo para usuários admin com sub-rotas:
  - `/admin/usuarios` — CRUD de usuários do sistema
  - `/admin/logs` — Log de atividades auditável
  - `/admin/configuracoes` — Configurações do sistema
  - `/admin/emails-relatorio` — Gestão de e-mails para relatório diário em PDF
- **Log de Auditoria:** Todas as ações de CRUD registradas automaticamente via `registrarAtividade()` (`src/lib/log-atividade.ts`)
- **Envio de E-mail:** Integração com Resend para relatório diário de produção em PDF
- **Toast Notifications:** Integração com Sonner para feedbacks de ações ao usuário

---

## [2.5.0] - 2026-02-13

### Adicionado
- **TV Dashboard (`/tv-dashboard`):** Visualização fullscreen sem sidebar, otimizada para monitores de gestão. Atualização automática de dados.

---

## [2.4.0] - 2026-02-13

### Adicionado
- **Upload de Fotos via Supabase Storage:** Rota `POST /api/upload-foto` para upload de imagens de referências. Limite de 350KB. Bucket `referencias` no Supabase.
- **Componente `FotoUpload`:** Preview e upload client-side de fotos antes de salvar o formulário.
- **Retrocompatibilidade:** URLs legadas do PHP (`florlinda.store`) continuam sendo exibidas corretamente.
- **`ConfirmDialog`:** Componente reutilizável de confirmação para ações destrutivas.

---

## [2.3.0] - 2026-02-10

### Adicionado
- Fotos nos cards de referência dentro da página de detalhes da coleção (600×400, proporção 3:2).

---

## [2.2.0] - 2026-02-10

### Adicionado
- Página `/producao` redesenhada como dashboard completo, replicando o sistema PHP legado com stats, metas, progresso e prazo crítico.

---

## [2.1.0] - 2026-02-10

### Adicionado
- Fotos nas referências (URL do servidor PHP Hostinger) na listagem e detalhes.

---

## [2.0.0] - 2026-02-10

### Adicionado
- Migração completa do sistema para Next.js 16 (App Router) + Vercel.
- Autenticação via NextAuth v5 (JWT, CredentialsProvider).
- CRUD completo de Coleções, Referências, Produção e Etapas via Server Actions.
- Dashboard principal com cards de métricas, gráfico de barras e progresso.

---

## [1.0.0] - 2026-02-09

### Sistema Original
- Sistema PHP legado (`/pcpflorlinda/`) no servidor Hostinger (`florlinda.store`).
