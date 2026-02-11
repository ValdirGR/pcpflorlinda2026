# Database Schema — PCP Flor Linda

> **Última atualização:** 10/02/2026  
> **Motor:** MySQL 8.x (Hostinger)  
> **Host:** srv796.hstgr.io  
> **Banco:** u333025608_painel_pcp  
> **ORM:** Prisma 5.22.0  

---

## ⚠️ IMPORTANTE

> **NÃO ALTERE O BANCO DE DADOS** — Ele está em produção com o sistema PHP legado.  
> O Prisma está configurado com `relationMode = "prisma"` (sem FK constraints reais no banco).

---

## 1. Diagrama ER

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   colecoes   │ 1───N │   referencias    │ 1───N │ etapas_producao │
│──────────────│       │──────────────────│       │─────────────────│
│ id (PK)      │       │ id (PK)          │       │ id (PK)         │
│ nome         │       │ colecao_id (FK)  │       │ referencia_id   │
│ codigo       │       │ codigo           │       │ nome            │
│ data_inicio  │       │ nome             │       │ status (ENUM)   │
│ data_fim     │       │ foto             │       │ data_inicio     │
│ status (ENUM)│       │ tempo_producao   │       │ data_fim        │
│ ...          │       │ previsao_producao│       │ observacoes     │
└──────────────┘       │ status (ENUM)    │       │ created_at      │
                       │ ...              │       │ updated_at      │
                       └────────┬─────────┘       └─────────────────┘
                                │
                                │ 1───N
                                ▼
                       ┌──────────────────┐
                       │    producao      │
                       │──────────────────│
                       │ id (PK)          │
                       │ referencia_id    │
                       │ quantidade_dia   │
                       │ data_producao    │
                       │ status (ENUM)    │
                       │ observacoes      │
                       │ created_at       │
                       │ updated_at       │
                       └──────────────────┘

┌──────────────┐
│   usuarios   │
│──────────────│
│ id (PK)      │
│ nome         │
│ email (UQ)   │
│ senha        │
│ nivel (ENUM) │
│ ativo        │
│ created_at   │
│ updated_at   │
└──────────────┘
```

---

## 2. ENUMs do MySQL

### `colecoes_status`
| Valor | Descrição |
|-------|-----------|
| `normal` | Coleção em andamento |
| `atrasado` | Coleção atrasada |
| `finalizado` | Coleção concluída |

### `referencias_status`
| Valor | Descrição |
|-------|-----------|
| `normal` | Referência normal |
| `finalizada` | Produção concluída |
| `arquivada` | Arquivada |
| `atraso_desenvolvimento` | Atrasada no desenvolvimento |
| `atraso_logistica` | Atrasada na logística |
| `em_producao` | Em produção ativa |

### `etapas_producao_status`
| Valor | Descrição |
|-------|-----------|
| `pendente` | Etapa não iniciada |
| `em_andamento` | Etapa em execução |
| `concluida` | Etapa finalizada |

### `producao_status`
| Valor | Descrição |
|-------|-----------|
| `normal` | Registro normal |
| `atrasado` | Registro atrasado |
| `finalizado` | Registro finalizado |

### `usuarios_nivel`
| Valor | Descrição |
|-------|-----------|
| `admin` | Acesso total |
| `usuario` | CRUD sem exclusão |
| `visualizador` | Apenas leitura |

---

## 3. Tabelas Detalhadas

### 3.1 `colecoes`

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | INT (PK) | NO | AUTO_INCREMENT | ID da coleção |
| `nome` | VARCHAR(100) | NO | — | Nome da coleção |
| `codigo` | VARCHAR(20) | NO | — | Código identificador |
| `data_inicio` | DATE | NO | — | Data de início |
| `data_fim` | DATE | NO | — | Data de fim |
| `prazo_inicial_estilo` | DATE | YES | NULL | Prazo inicial do estilo |
| `prazo_final_estilo` | DATE | YES | NULL | Prazo final do estilo |
| `data_envio_prevista` | DATE | YES | NULL | Data prevista de envio |
| `quantidade_total_producao` | INT | YES | 0 | Quantidade total planejada |
| `status` | ENUM | YES | 'normal' | Status da coleção |
| `status_estilo` | VARCHAR(50) | YES | 'normal' | Status do estilo |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de atualização |

### 3.2 `referencias`

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | INT (PK) | NO | AUTO_INCREMENT | ID da referência |
| `colecao_id` | INT (FK) | NO | — | FK para `colecoes.id` |
| `codigo` | VARCHAR(20) | NO | — | Código da referência |
| `nome` | VARCHAR(100) | NO | — | Nome da peça |
| `foto` | VARCHAR(255) | YES | NULL | Nome do arquivo da foto |
| `tempo_producao` | INT | NO | — | Tempo de produção (minutos) |
| `previsao_producao` | INT | NO | — | Previsão de produção (peças) |
| `producao_diaria_pessoa` | INT | NO | — | Produção diária por pessoa |
| `data_distribuicao` | DATE | YES | NULL | Data de distribuição |
| `media_dias_entrega` | INT | YES | NULL | Média de dias para entrega |
| `localizacao_estoque` | VARCHAR(50) | YES | NULL | Localização no estoque |
| `status` | ENUM | NO | 'normal' | Status da referência |
| `quantidade_produzida` | INT | YES | 0 | Quantidade já produzida |
| `para_marketing` | TINYINT(1) | YES | 0 | Disponível para marketing |
| `observacoes` | TEXT | YES | NULL | Observações |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de atualização |

**Índices:** `colecao_id`

### 3.3 `etapas_producao`

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | INT (PK) | NO | AUTO_INCREMENT | ID da etapa |
| `referencia_id` | INT (FK) | NO | — | FK para `referencias.id` |
| `nome` | VARCHAR(50) | NO | — | Nome da etapa |
| `status` | ENUM | YES | 'pendente' | Status da etapa |
| `data_inicio` | DATE | YES | NULL | Data de início |
| `data_fim` | DATE | YES | NULL | Data de fim |
| `observacoes` | TEXT | YES | NULL | Observações |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de atualização |

**Índices:** `referencia_id`

### 3.4 `producao`

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | INT (PK) | NO | AUTO_INCREMENT | ID do registro |
| `referencia_id` | INT (FK) | NO | — | FK para `referencias.id` |
| `quantidade_dia` | INT | NO | — | Peças produzidas no dia |
| `data_producao` | DATE | NO | — | Data da produção |
| `status` | ENUM | YES | 'normal' | Status do registro |
| `observacoes` | TEXT | YES | NULL | Observações |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de atualização |

**Índices:** `referencia_id`

**Trigger lógico (via código):** Ao inserir produção, `quantidade_produzida` da referência é incrementada.

### 3.5 `usuarios`

| Coluna | Tipo | Null | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | INT (PK) | NO | AUTO_INCREMENT | ID do usuário |
| `nome` | VARCHAR(255) | NO | — | Nome completo |
| `email` | VARCHAR(255) UQ | NO | — | Email (login) |
| `senha` | VARCHAR(255) | NO | — | Hash bcrypt |
| `nivel` | ENUM | NO | 'visualizador' | Nível de acesso |
| `ativo` | TINYINT(1) | NO | 1 | Se está ativo |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Data de atualização |

---

## 4. Relacionamentos

| De | Para | Tipo | Coluna FK |
|----|------|------|-----------|
| `colecoes` | `referencias` | 1:N | `referencias.colecao_id` |
| `referencias` | `etapas_producao` | 1:N | `etapas_producao.referencia_id` |
| `referencias` | `producao` | 1:N | `producao.referencia_id` |

---

## 5. Prisma Schema

O schema Prisma está em `prisma/schema.prisma` e mapeia exatamente as tabelas acima usando:

- `@@map("nome_tabela")` para mapear nomes de models para tabelas MySQL
- `@db.VarChar(N)` para tipos VARCHAR
- `@db.Date` para tipos DATE
- `@db.Timestamp(0)` para tipos TIMESTAMP
- `@db.Text` para tipos TEXT
- Enums Prisma correspondem 1:1 aos ENUMs do MySQL

### Configuração do Datasource

```prisma
datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"  // Sem FK constraints no banco
}
```

---

## 6. Queries Importantes

### Total produzido de uma coleção
```sql
SELECT SUM(r.quantidade_produzida) as total_produzido,
       SUM(r.previsao_producao) as total_previsto
FROM referencias r
WHERE r.colecao_id = ?;
```

### Produção do dia
```sql
SELECT SUM(p.quantidade_dia) as total
FROM producao p
WHERE DATE(p.data_producao) = CURDATE();
```

### Referências com etapas vencidas
```sql
SELECT DISTINCT r.*
FROM referencias r
JOIN etapas_producao e ON e.referencia_id = r.id
WHERE r.status != 'finalizada'
  AND e.status IN ('pendente', 'em_andamento')
  AND e.data_fim < CURDATE();
```
