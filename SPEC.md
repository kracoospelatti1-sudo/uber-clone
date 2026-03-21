# SPEC.md - App Estilo UBER

## 1. Concept & Vision

Plataforma de movilidad que conecta pasajeros con conductores. Permite solicitar viajes, rastrear en tiempo real, gestionar pagos y calificar experiencias. La app transmite confianza, velocidad y profesionalismo.

## 2. Design Language

### Colors
- Primary: `#000000` (Negro - sofisticación)
- Secondary: `#1A1A1A` (Gris oscuro)
- Accent: `#22C55E` (Verde - acción/confirma)
- Danger: `#EF4444` (Rojo - cancelar/emergencia)
- Background: `#FFFFFF`
- Text: `#111111`
- Muted: `#6B7280`

### Typography
- Font: Inter (Google Fonts)
- Headings: 700 weight
- Body: 400-500 weight

### Motion
- Transitions: 200ms ease-out
- Map animations: smooth GPS tracking
- Loading states: skeleton + pulse

## 3. Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: Neon (PostgreSQL serverless)
- **Auth**: NextAuth.js / Supabase Auth (migrar luego)
- **Maps**: Mapbox GL JS / Google Maps API
- **Real-time**: WebSockets / Neon realtime
- **Testing**: Vitest + Supertest (API) + Playwright (E2E)
- **Deploy**: OnRender + GitHub integration
- **State**: Zustand / React Query

## 4. Database Schema (Neon/PostgreSQL)

```sql
-- Users (pasajeros y conductores)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'passenger', -- 'passenger' | 'driver' | 'admin'
  rating DECIMAL(3,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Profiles
CREATE TABLE driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  license_plate VARCHAR(20) NOT NULL,
  vehicle_model VARCHAR(100),
  vehicle_color VARCHAR(50),
  vehicle_year INTEGER,
  is_available BOOLEAN DEFAULT false,
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(11,8),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rides
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES users(id),
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10,8) NOT NULL,
  pickup_lng DECIMAL(11,8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_lat DECIMAL(10,8) NOT NULL,
  dropoff_lng DECIMAL(11,8) NOT NULL,
  status VARCHAR(30) DEFAULT 'requested',
  -- requested | accepted | started | completed | cancelled
  fare DECIMAL(10,2),
  distance_km DECIMAL(8,2),
  estimated_time INTEGER, -- minutos
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id),
  rater_id UUID REFERENCES users(id),
  rated_id UUID REFERENCES users(id),
  score INTEGER CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id),
  passenger_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'card',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. User Flows

### Pasajero
1. Registro/Login
2. Ingresa origen y destino
3. Ve estimación de precio y tiempo
4. Confirma viaje
5. Espera conductor asignado
6. Rastrea conductor en mapa
7. Viaje en curso
8. Llega a destino
9. Paga y califica

### Conductor
1. Registro/Login (verificado)
2. Activa disponibilidad
3. Recibe solicitudes
4. Acepta/rechaza viaje
5. Navega al origen
6. Inicia viaje
7. Completa viaje
8. Recibe calificación

## 6. API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Rides
- `POST /api/rides/request` - Solicitar viaje
- `GET /api/rides/:id` - Detalle de viaje
- `PATCH /api/rides/:id/accept` - Conductor acepta
- `PATCH /api/rides/:id/start` - Iniciar viaje
- `PATCH /api/rides/:id/complete` - Completar viaje
- `PATCH /api/rides/:id/cancel` - Cancelar

### Drivers
- `GET /api/drivers/nearby` - Conductores cercanos
- `PATCH /api/drivers/location` - Actualizar ubicación
- `PATCH /api/drivers/status` - Cambiar disponibilidad

### Ratings
- `POST /api/ratings` - Crear calificación

## 7. Testing Strategy

### Unit Tests (Vitest)
- Auth logic
- Fare calculation
- Rating aggregation
- Distance calculations

### API Tests (Supertest)
- All endpoints
- Auth middleware
- Error handling

### E2E Tests (Playwright)
- Registro/Login
- Solicitar viaje completo
- Flujo conductor
- Pagos y calificaciones

## 8. Deploy Pipeline

1. Push a GitHub →触发 CI/CD
2. OnRender detecta push
3. Instala dependencias
4. Build Next.js
5. Deploy a producción
6. Neon connection via env vars
