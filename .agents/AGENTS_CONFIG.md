# AGENTS CONFIG - Uber Clone App

## Ultima actualizacion: 2026-03-21

Este documento describe la configuracion de agentes y skills para el desarrollo de la app Uber Clone.

---

## ESTRUCTURA DE AGENTES

```
.agents/
├── mcps/                    # MCP Servers
│   ├── neon-mcp/           # Conexion a Neon PostgreSQL
│   ├── github-mcp/         # Operaciones GitHub
│   └── vercel-mcp/         # Deploy en Vercel (pendiente)
├── scripts/                 # Scripts helpers
│   ├── db-helper.js        # Ejecutar SQL en Neon
│   └── git-helper.js       # Operaciones Git
└── skills/                  # Skills del agente (en ~/.agents/skills/)
    ├── uber-app-dev/       # Desarrollo principal
    ├── webapp-testing/      # Testing con Playwright
    └── verificacion-e2e/    # Testing E2E (pendiente)
```

---

## MCP SERVERS

### 1. Neon MCP (`.agents/mcps/neon-mcp/`)

**Proposito:** Ejecutar SQL en la base de datos Neon PostgreSQL

**Tecnologias:** Node.js + pg + @modelcontextprotocol/sdk

**Comandos:**
```bash
# Ver tablas
node .agents/scripts/db-helper.js schema

# Ejecutar query
node .agents/scripts/db-helper.js exec "SELECT * FROM users LIMIT 5"

# Describir tabla
node .agents/scripts/db-helper.js tables users
```

### 2. GitHub MCP (`.agents/mcps/github-mcp/`)

**Proposito:** Gestionar repositorio GitHub

**Tecnologias:** Node.js + @modelcontextprotocol/sdk + gh CLI

**Comandos:**
```bash
# Ver estado
node .agents/scripts/git-helper.js status

# Commit
node .agents/scripts/git-helper.js commit "mensaje"

# Push
node .agents/scripts/git-helper.js push main
```

### 3. Vercel MCP (`.agents/mcps/vercel-mcp/`) - PENDIENTE

**Proposito:** Deploy y gestion en Vercel

**Tecnologias:** Node.js + Vercel API

---

## SKILLS

### 1. uber-app-dev (`~/.agents/skills/uber-app-dev/`)

**Proposito:** Desarrollo principal de la app Uber Clone

**Ubicacion:** `~/.agents/skills/uber-app-dev/SKILL.md`

**Capacidades:**
- Next.js 16 + TypeScript
- Neon PostgreSQL
- Vercel deployment
- Leaflet maps
- Chat en tiempo real
- Sistema de reportes
- Panel admin
- Testing con Vitest

### 2. webapp-testing (`~/.agents/skills/webapp-testing/`)

**Proposito:** Testing E2E de aplicaciones web

**Ubicacion:** `~/.agents/skills/webapp-testing/`

**Herramientas:**
- Playwright para automatizacion
- Helper scripts para server management

### 3. verificacion-e2e (`~/.agents/skills/verificacion-e2e/`) - PENDIENTE

**Proposito:** Guia de testing E2E de la app

**Ubicacion:** `~/.agents/skills/verificacion-e2e/`

---

## VARIABLES DE ENTORNO

```bash
# Neon PostgreSQL
NEON_DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=tu-secret-key

# GitHub
GITHUB_TOKEN=ghp_...

# Vercel (para deploy)
VERCEL_TOKEN=...
```

---

## CREDENCIALES

| Servicio | Credenciales |
|----------|-------------|
| Neon DB | postgresql://neondb_owner:npg_...@ep-dry-hat... |
| GitHub | ghp_... (keyring) |
| Vercel | vercel CLI (OAuth) |
| App Admin | admin@uberclone.com / Admin2026! |

---

## COMANDOS DE DESARROLLO

```bash
# Instalar dependencias
npm install

# Dev server
npm run dev

# Build produccion
npm run build

# Tests unitarios
npm test

# Lint
npm run lint
```

---

## ROLES DE USUARIO

| Rol | Descripcion | Permisos |
|-----|------------|----------|
| `passenger` | Pasajero | Solicitar viajes, ver historial, chatear, reportar |
| `driver` | Conductor | Aceptar viajes, ver solicitudes, ganar, chatear, reportar |
| `admin` | Administrador | Gestionar usuarios, verificar conductores, revisar reportes |

---

## WORKFLOW DE DESARROLLO

1. **Planificar** → Crear/actualizar documentos en PLAN_IMPLEMENTACION.md
2. **Implementar** → Crear/modificar archivos de codigo
3. **Testear** → `npm test` y pruebas manuales
4. **Commit** → `node .agents/scripts/git-helper.js commit "descripcion"`
5. **Deploy** → Push a GitHub → Vercel detecta y deploya automaticamente

---

## TABLA DE RESPONSABILIDADES

| Componente | Responsabilidad |
|------------|-----------------|
| DB Schema | neon-mcp |
| Auth | src/lib/auth.ts + middleware.ts |
| APIs | src/app/api/* |
| UI | src/app/(auth)/, src/app/(app)/, src/app/(driver)/, src/app/(admin)/ |
| Tests | tests/*.test.ts |
| Deploy | Vercel (automatico via GitHub) |

---

## NOTAS

- El agente esta configurado para usar Neon como base de datos principal
- Los MCP servers se ejecutan via stdio para comunicacion con el agente
- Los skills en ~/.agents/skills/ son cargados automaticamente por opencode
- El deploy en Vercel es automatico al hacer push a GitHub
