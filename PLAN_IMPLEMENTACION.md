# PLAN DE IMPLEMENTACION - Uber Clone App

## Ultima actualizacion: 2026-03-21

## STACK TECNOLOGICO
- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Backend:** API Routes Next.js
- **Database:** Neon PostgreSQL (serverless)
- **Auth:** JWT (jose + bcryptjs)
- **State:** Zustand
- **Maps:** Leaflet + OpenStreetMap (gratis)
- **Deploy:** Vercel
- **Responsive:** Mobile-first design

---

## CREDENCIALES

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@uberclone.com | Admin2026! |

---

## FUNCIONALIDADES IMPLEMENTADAS

### 1. BASE DE DATOS (Neon PostgreSQL)

#### Tablas nuevas:
- `driver_stats` - Estadisticas del conductor (rating, viajes, ganancias)
- `vehicle_documents` - Documentos del vehiculo (patente, fotos, verificacion)
- `notifications` - Notificaciones in-app
- `chat_messages` - Mensajes entre conductor y pasajero
- `reports` - Reportes de usuarios
- `ride_cancellations` - Log de cancelaciones

#### Modificaciones a tablas existentes:
- `users` - Agregado: avatar_url, is_suspended, suspension_reason
- `driver_profiles` - Modificado: verification_status

---

### 2. FUNCIONALIDADES IMPLEMENTADAS

#### 2.1 Foto de perfil obligatoria
- Campo en registro
- Fallback con iniciales
- Editable desde perfil

#### 2.2 Verificacion de vehiculo
- Formulario con campos: patente, marca, modelo, ano, color, tipo
- Fotos: frontal, trasera, licencia (base64 o URL)
- Auto-aprobacion (para testing)
- Estados: pending, approved, rejected

#### 2.3 Panel conductor
- Dashboard con mapa
- Solicitudes pendientes
- Historial de viajes
- Ganancias (dia/semana/todo)
- Toggle disponibilidad online/offline

#### 2.4 Mapas (Leaflet)
- Ubicacion actual del usuario
- Conductores cercanos en mapa
- Tracking en tiempo real
- Ruta en mapa

#### 2.5 Notificaciones in-app
- Campana con contador
- Dropdown con lista
- Marcar como leidas
- Tipos: ride_update, driver_nearby, ride_complete

#### 2.6 Chat conductor-pasajero
- Se activa cuando conductor acepta
- Historial de mensajes
- Indicador de no leidos
- Filtro: mensajes < 30 dias

#### 2.7 Historial de viajes
- Pasajero: /history
- Conductor: /driver/history
- Filtros por fecha
- Estadisticas

#### 2.8 Sistema de reportes
- Boton "Reportar" en perfil
- Razones predefinidas
- Historial de reportes
- Estados: pending, reviewed, resolved, dismissed

#### 2.9 Panel admin
- Dashboard: stats generales
- Gestionar usuarios (suspender/activar)
- Verificar conductores
- Revisar reportes
- Ver todos los viajes

#### 2.10 Tracking en tiempo real
- Conductor envia GPS cada 5 segundos
- Pasajero recibe actualizaciones (polling cada 3s)
- Calculo de ETA

#### 2.11 Cancelacion de viajes
- Permitido si status = requested o accepted
- Log en ride_cancellations
- Notificacion al otro usuario

---

## ESTRUCTURA DE RUTAS

### Paginas publicas
- `/` → Redirect a /login
- `/login` - Login de usuario
- `/register` - Registro con foto

### Paginas pasajero (requiere auth)
- `/home` - Solicitar viaje con mapa
- `/ride/[id]` - Detalle del viaje con tracking y chat
- `/history` - Historial de viajes
- `/profile` - Perfil con foto editable

### Paginas conductor (requiere auth + vehiculo verificado)
- `/driver` - Redirige a /driver/dashboard o /driver/verification
- `/driver/verification` - Formulario vehiculo
- `/driver/verification/status` - Estado de verificacion
- `/driver/dashboard` - Dashboard principal
- `/driver/requests` - Solicitudes pendientes
- `/driver/history` - Historial de viajes
- `/driver/earnings` - Ganancias
- `/driver/ride/[id]` - Detalle del viaje con chat

### Paginas admin (requiere auth + role=admin)
- `/admin` - Dashboard
- `/admin/users` - Gestionar usuarios
- `/admin/drivers` - Verificar conductores
- `/admin/reports` - Revisar reportes
- `/admin/rides` - Todos los viajes

---

## API ENDPOINTS

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuario actual
- `PATCH /api/auth/update-profile` - Actualizar perfil

### Rides
- `POST /api/rides` - Solicitar viaje
- `GET /api/rides` - Listar mis viajes
- `GET /api/rides/history` - Historial
- `GET /api/rides/[id]` - Detalle
- `PATCH /api/rides/[id]` - Acciones (accept/start/complete/cancel)
- `GET /api/rides/[id]/tracking` - Posicion del conductor

### Driver
- `GET /api/drivers/nearby` - Conductores cercanos
- `PATCH /api/driver/location` - Actualizar GPS
- `POST /api/driver/verification` - Enviar documentos
- `GET /api/driver/verification/status` - Estado verificacion
- `GET /api/driver/stats` - Estadisticas
- `GET /api/driver/rides` - Viajes del conductor
- `PATCH /api/drivers/status` - Toggle disponibilidad

### Chat
- `GET /api/chat/[rideId]` - Mensajes del viaje
- `POST /api/chat/[rideId]` - Enviar mensaje

### Notifications
- `GET /api/notifications` - Lista de notificaciones
- `PATCH /api/notifications/read` - Marcar leidas

### Reports
- `POST /api/reports` - Crear reporte
- `GET /api/reports/my` - Mis reportes

### Admin
- `GET /api/admin/users` - Lista de usuarios
- `PATCH /api/admin/users/[id]` - Actualizar usuario
- `POST /api/admin/suspend` - Suspender usuario
- `PATCH /api/admin/drivers/verify` - Aprobar/rechazar vehiculo
- `GET /api/admin/reports` - Lista de reportes
- `PATCH /api/admin/reports/[id]` - Resolver reporte
- `GET /api/admin/stats` - Estadisticas

---

## VERIFICACION E2E

### Checklist
- [ ] Build exitoso: `npm run build`
- [ ] Tests pasando: `npm test`
- [ ] Schema DB verificado
- [ ] Login/logout funciona
- [ ] Registro con foto
- [ ] Flujo viaje completo
- [ ] Chat funciona
- [ ] Reportes se crean
- [ ] Admin puede gestionar
- [ ] Sin errores en consola
- [ ] Deploy en Vercel actualizado

### Flujos a probar

**Pasajero:**
1. Registro → Login → Solicitar viaje → Chat → Completar → Historial

**Conductor:**
1. Registro → Verificacion vehiculo → Dashboard → Aceptar viaje → Completar → Ganancias

**Admin:**
1. Login → Dashboard → Gestionar usuarios → Revisar reportes

---

## TIEMPO ESTIMADO

| Fase | Descripcion | Tiempo |
|------|------------|--------|
| 1 | Setup DB + docs | 30 min |
| 2 | Implementar features | 6 horas |
| 3 | Verificacion E2E | 1 hora |
| 4 | Deploy y ajustes | 30 min |
| **Total** | | **~8 horas** |

---

## COMANDOS UTILES

```bash
# Ver tablas en DB
node .agents/scripts/db-helper.js schema

# Ejecutar SQL
node .agents/scripts/db-helper.js exec "<query>"

# Ver estructura tabla
node .agents/scripts/db-helper.js tables <nombre>

# Build
npm run build

# Tests
npm test

# Dev server
npm run dev
```
