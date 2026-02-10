# Deploy — PCP Flor Linda

> **Última atualização:** 10/02/2026  
> **Plataforma:** Vercel  
> **Repositório:** https://github.com/ValdirGR/pcpflorlinda2026  
> **URL Produção:** https://pcpflorlinda.vercel.app  

---

## 1. Visão Geral

O projeto usa **deploy automático via Vercel** conectado ao GitHub. Cada push na branch `main` aciona um novo deploy automaticamente.

```
git push origin main → GitHub → Vercel (auto-deploy) → https://pcpflorlinda.vercel.app
```

---

## 2. Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Repositório GitHub conectado ao Vercel
- Banco MySQL acessível externamente (Hostinger)

---

## 3. Variáveis de Ambiente (Vercel)

Configure em **Vercel → Settings → Environment Variables**:

| Variável | Valor | Obrigatória |
|----------|-------|-------------|
| `DATABASE_URL` | `mysql://u333025608_adminpcp:SENHA@srv796.hstgr.io:3306/u333025608_painel_pcp` | ✅ Sim |
| `NEXTAUTH_SECRET` | `(string gerada com openssl rand -base64 32)` | ✅ Sim |
| `NEXTAUTH_URL` | `https://pcpflorlinda.vercel.app` | ✅ Sim |

### Gerar NEXTAUTH_SECRET

```bash
# No terminal:
openssl rand -base64 32

# Ou via Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 4. Processo de Deploy

### 4.1 Deploy Automático (Padrão)

```bash
# 1. Faça suas alterações
# 2. Commit e push
git add -A
git commit -m "feat: descrição da alteração"
git push origin main

# 3. Vercel detecta o push e faz deploy automático
# 4. Acompanhe em: https://vercel.com/dashboard
```

### 4.2 Build Script

O `package.json` está configurado para gerar o Prisma Client antes do build:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

**Importante:** O `prisma generate` é necessário porque o Vercel instala dependências via `npm ci` que não mantém o Prisma Client gerado.

### 4.3 Deploy Manual (CLI)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy de preview
vercel

# Deploy de produção
vercel --prod
```

---

## 5. Configuração do Projeto no Vercel

| Configuração | Valor |
|-------------|-------|
| **Framework** | Next.js (auto-detectado) |
| **Build Command** | `prisma generate && next build` |
| **Output Directory** | `.next` (padrão) |
| **Install Command** | `npm ci` (padrão) |
| **Node.js Version** | 20.x |

---

## 6. Troubleshooting

### Erro: PrismaClientInitializationError

```
PrismaClientInitializationError: Prisma Client could not locate the Query Engine
```

**Causa:** O Prisma Client não foi gerado durante o build.  
**Solução:** Garantir que o build script inclui `prisma generate`:

```json
"build": "prisma generate && next build"
```

### Erro: Conexão MySQL recusada

```
Can't connect to MySQL server on 'srv796.hstgr.io'
```

**Causa:** O host MySQL da Hostinger pode bloquear IPs externos.  
**Solução:** Na Hostinger, acesse **Banco de Dados → Acesso Remoto** e adicione `%` (todos os IPs) ou os IPs específicos do Vercel.

### Erro: Imagens não carregam

**Causa:** `next.config.ts` não permite o domínio da imagem.  
**Solução:** Verificar `remotePatterns` em `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "florlinda.store",
      pathname: "/pcpflorlinda/uploads/**",
    },
  ],
},
```

### Erro: NEXTAUTH_URL incorreta

**Causa:** `NEXTAUTH_URL` não corresponde ao domínio do Vercel.  
**Solução:** `NEXTAUTH_URL=https://pcpflorlinda.vercel.app` (sem barra no final).

### Warning: Middleware deprecated

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Causa:** Next.js 16 recomenda usar proxy em vez de middleware.  
**Status:** Warning cosmético. Não afeta funcionalidade. Migrar opcionalmente.

---

## 7. Domínio Personalizado (Opcional)

Para apontar um domínio personalizado:

1. Vercel → Settings → Domains
2. Adicione o domínio (ex: `pcp.florlinda.store`)
3. Configure DNS:
   - **CNAME:** `pcp` → `cname.vercel-dns.com`
   - Ou **A Record:** `76.76.21.21`
4. Atualize `NEXTAUTH_URL` para o novo domínio

---

## 8. Monitoramento

- **Logs:** Vercel → Functions → Logs
- **Analytics:** Vercel → Analytics (opcional, gratuito no Hobby plan)
- **Status do build:** Vercel → Deployments

---

## 9. Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/ValdirGR/pcpflorlinda2026.git
cd pcpflorlinda2026

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com os valores reais

# 4. Gere o Prisma Client
npx prisma generate

# 5. Inicie o dev server
npm run dev

# 6. Acesse http://localhost:3000
```

---

## 10. Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] `DATABASE_URL` aponta para MySQL da Hostinger
- [ ] `NEXTAUTH_SECRET` gerado e configurado
- [ ] `NEXTAUTH_URL` aponta para o domínio correto
- [ ] Acesso remoto ao MySQL habilitado na Hostinger
- [ ] Build script inclui `prisma generate`
- [ ] `next.config.ts` permite imagens de `florlinda.store`
- [ ] Push para `main` aciona deploy automático
