# Guía de Setup y Deploy

## Prerrequisitos

- Node.js 18+
- npm
- Cuenta de Cloudflare (gratis)

## Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/FelipeAndreau/laburen-challenge-ai-agent.git
cd laburen-challenge-ai-agent

# 2. Instalar dependencias
npm install

# 3. Login en Cloudflare
npx wrangler login

# 4. Crear la base de datos D1
npx wrangler d1 create laburen-db
# ⚠️ Copiar el database_id que devuelve y pegarlo en wrangler.toml

# 5. Crear tablas (local)
npm run db:schema:local

# 6. Cargar productos (local)
npm run db:seed:local

# 7. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:8787
```

## Deploy a Producción

```bash
# 1. Aplicar schema en la DB remota
npm run db:schema:remote

# 2. Cargar datos en la DB remota
npm run db:seed:remote

# 3. Configurar secrets (opcional)
npx wrangler secret put MCP_AUTH_TOKEN
npx wrangler secret put CHATWOOT_API_URL
npx wrangler secret put CHATWOOT_API_TOKEN

# 4. Deploy
npm run deploy
# → https://laburen-asistente-ventas-mcp-server.<tu-subdominio>.workers.dev
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor local de desarrollo |
| `npm run deploy` | Deploy a Cloudflare Workers |
| `npm run db:schema:local` | Aplicar schema SQL en D1 local |
| `npm run db:seed:local` | Poblar D1 local con productos |
| `npm run db:schema:remote` | Aplicar schema SQL en D1 remoto |
| `npm run db:seed:remote` | Poblar D1 remoto con productos |

## Variables de Entorno / Secrets

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `DB` | D1 binding | Base de datos (configurado en wrangler.toml) |
| `MCP` | DO binding | Durable Object (configurado en wrangler.toml) |
| `MCP_AUTH_TOKEN` | Secret (opcional) | Bearer token para autenticación |
| `CHATWOOT_API_URL` | Secret (opcional) | URL de la API de Chatwoot |
| `CHATWOOT_API_TOKEN` | Secret (opcional) | Token de acceso Chatwoot |

## Testing con MCP Inspector

```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Inspector
npx @modelcontextprotocol/inspector@latest
# Conectar a: http://localhost:8787/sse
```

## Integración con Laburen

1. Crear cuenta en [laburen.com](https://laburen.com)
2. Crear agente con el system prompt
3. En Actions → MCP Connection, conectar:
   - URL: `https://tu-worker.workers.dev/sse`
