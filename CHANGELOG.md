# Changelog

## [Unreleased] - 2026-02-20

### Adicionado
- **Dashboard Gerencial Inline:** Componente `GerencialContent` com filtros por coleção e status na própria página, sem reload.
- **Exclusão Segura:** Botão de exclusão de referências valida se existem etapas cadastradas. Botão fica desabilitado visualmente e Server Action bloqueia a operação.
- **Fallback de Metas:** Cards de produção agora exibem "(média estimada)" quando não há registros diários na tabela `Producao`, usando o histórico total para cálculo.

### Corrigido
- **Tailwind CSS v4 Warnings:** Substituídos `bg-gradient-*` por `bg-linear-*` e `flex-shrink-0` por `shrink-0` em diversos arquivos (`sidebar.tsx`, `form.tsx`, etc.).
- **Bugs de Layout:** Ajustes no `Sidebar` para evitar quebra de layout em telas menores.
- **Permissão de Exclusão:** Liberado botão de exclusão para usuários com nível "editor" ou superior (antes apenas admin), mantendo a validação de etapas.

