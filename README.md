# Laburen MCP Server

> MCP Server para asistente de ventas mayoristas de ropa, desplegado en Cloudflare Workers.

## 🏗️ Arquitectura

```
Usuario → WhatsApp → Chatwoot → Laburen (AI Agent) → MCP Server → Cloudflare D1
```

El servidor implementa el **Model Context Protocol (MCP)** para exponer herramientas que un agente de IA utiliza para buscar productos, gestionar carritos de compra y derivar conversaciones a agentes humanos.

### Stack Tecnológico

- **Runtime:** Cloudflare Workers + Durable Objects
- **Base de datos:** Cloudflare D1 (SQLite con FTS5)
- **Protocolo:** MCP con transporte SSE (Server-Sent Events)
- **Lenguaje:** TypeScript
- **Arquitectura:** Clean Architecture (Domain → Application → Infrastructure)

## 🔧 MCP Tools

| Tool | Descripción |
|------|-------------|
| `list_products` | Buscar productos con filtros (FTS5 full-text search) |
| `create_cart` | Crear carrito vinculado a conversación |
| `add_products_to_cart` | Agregar/actualizar productos en carrito |
| `delete_product_from_cart` | Eliminar producto del carrito |
| `view_cart` | Ver contenido del carrito con totales |
| `request_human_handoff` | Derivar conversación a agente humano (Chatwoot) |
| `ping` | Health check |

## 📁 Estructura del Proyecto

```
├── src/
│   ├── domain/           # Entidades e interfaces (sin dependencias externas)
│   ├── application/      # Casos de uso (lógica de negocio)
│   ├── infrastructure/   # Implementaciones D1, MCP tools, DI container
│   ├── config/           # Configuración de la aplicación
│   └── index.ts          # Entry point (Worker + Durable Object)
├── db/
│   ├── schema.sql        # DDL con FTS5, triggers, y tablas
│   └── seed.sql          # Datos de productos mayoristas
├── docs/                 # Documentación técnica
├── wrangler.toml         # Configuración Cloudflare Workers
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Login en Cloudflare
npx wrangler login

# Crear base de datos D1
npx wrangler d1 create laburen-db
# → Copiar database_id a wrangler.toml

# Aplicar schema y cargar datos
npm run db:schema:local
npm run db:seed:local

# Desarrollo local
npm run dev
# → http://localhost:8787
```

## 📚 Documentación

- [Arquitectura](docs/ARCHITECTURE.md) — Diagramas y diseño del sistema
- [API / MCP Tools](docs/API.md) — Documentación de herramientas
- [Guía de Setup](docs/SETUP.md) — Deploy paso a paso
- [Desafíos](docs/CHALLENGES.md) — Problemas encontrados y soluciones

## 📄 Licencia

MIT
