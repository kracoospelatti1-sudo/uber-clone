# AGENTS.md - Uber Clone App

## Descripcion
Aplicacion estilo UBER con Next.js 14, TypeScript, Tailwind CSS y Neon PostgreSQL.

## Stack Tecnologico
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: JWT con jose + bcryptjs
- **State**: Zustand
- **Testing**: Vitest
- **Deploy**: OnRender + GitHub

## MCP Servers Configurados

### 1. Neon Database (`/.agents/mcps/neon-mcp/`)
Ejecuta SQL en la base de datos Neon.

```bash
# Ejecutar query SQL
node .agents/scripts/db-helper.js exec "SELECT * FROM users LIMIT 5"

# Ver tablas del schema
node .agents/scripts/db-helper.js schema

# Describir estructura de tabla
node .agents/scripts/db-helper.js tables users
```

### 2. Git Operations (`/.agents/scripts/git-helper.js`)
Gestiona repositorio Git.

```bash
# Ver estado
node .agents/scripts/git-helper.js status

# Commit cambios
node .agents/scripts/git-helper.js commit "feat: agregar auth"

# Push a branch
node .agents/scripts/git-helper.js push main
```

## Environment Variables (.env)
```
NEON_DATABASE_URL=postgresql://neondb_owner:...@ep-dry-hat.../neondb?sslmode=require
JWT_SECRET=tu-secret-key-aqui
```

## Database Schema (Neon)
- `users` - Usuarios (pasajeros/conductores)
- `driver_profiles` - Perfiles de conductores
- `rides` - Viajes solicitados
- `ratings` - Calificaciones
- `payments` - Pagos

## Comandos de Desarrollo
```bash
npm install          # Instalar dependencias
npm run dev          # Dev server en localhost:3000
npm run build        # Build produccion
npm run lint         # Lint
npm test             # Tests unitarios (Vitest)
```

## API Endpoints
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET/POST /api/rides` - Viajes
- `GET/PATCH /api/rides/[id]` - Detalle/acciones viaje
- `GET /api/drivers/nearby` - Conductores cercanos
- `PATCH /api/drivers/status` - Cambiar disponibilidad

## Deploy en OnRender
1. Subir codigo a GitHub
2. Conectar repo en OnRender
3. Configurar environment variables
4. Deploy automatico en cada push

## Archivos Clave
- `SPEC.md` - Especificacion completa
- `src/lib/db.ts` - Conexion a Neon
- `src/lib/auth.ts` - Funciones de auth
- `src/stores/appStore.ts` - Estado global
- `src/types/index.ts` - Tipos TypeScript
