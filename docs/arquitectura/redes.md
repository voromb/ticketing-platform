# 🎫 Ticketing Platform - Arquitectura de Microservicios

## Índice

- [Visión General](#-visión-general)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Microservicios](#-microservicios)
- [Stack Tecnológico](#-stack-tecnológico)
- [Flujos de Trabajo](#-flujos-de-trabajo)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Documentation](#-api-documentation)

## Visión General

Plataforma completa de gestión de festivales de rock/metal que incluye venta de tickets, servicios complementarios (viajes, restaurantes, merchandising) y paneles de administración diferenciados por roles y servicios.

### Objetivos Principales

- **Modularidad**: Cada servicio es independiente y escalable
- **Separación de Responsabilidades**: Cada microservicio maneja un dominio específico
- **Comunicación Asíncrona**: Uso de RabbitMQ para eventos y aprobaciones
- **Multi-Database**: PostgreSQL, MongoDB y Redis según las necesidades
- **Multi-Panel**: Interfaces diferenciadas por color según el servicio

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├────────────┬───────────┬──────────┬───────────┬─────────────────┤
│   Admin    │   User    │  Travel  │Restaurant │  Merchandising  │
│   Panel    │   Panel   │  Panel   │  Panel    │     Panel       │
│  (Dark)    │  (White)  │  (Red)   │  (Green)  │     (Blue)      │
│            │           │          │           │                 │
│SUPER_ADMIN │  Users    │Users +   │Users +    │   Users +       │
│            │  VIP      │COMPANY   │COMPANY    │   COMPANY       │
│            │           │  ADMIN   │  ADMIN    │    ADMIN        │
└─────┬──────┴─────┬─────┴────┬─────┴─────┬─────┴────────┬────────┘
      │            │          │           │              │
      └────────────┴──────────┴───────────┴──────────────┘
                              │
                 ┌────────────▼────────────┐
                 │   API GATEWAY (NestJS)  │
                 │      Puerto: 3000       │
                 └────────────┬────────────┘
                              │
     ┌────────────────────────┼───────────────────────┐
     │                        │                       │
┌────▼──────┐  ┌──────────────▼──────────────┐  ┌─────▼──────┐
│  EXISTING │  │   NEW MICROSERVICES LAYER   │  │  APPROVAL  │
│  SERVICES │  │         (NestJS)            │  │   SERVICE  │
├───────────┤  ├─────────────────────────────┤  ├────────────┤
│           │  │                             │  │            │
│  Admin    │  │  ┌────────┐  ┌──────────┐   │  │  Approval  │
│  Service  │  │  │ Travel │  │Restaurant│   │  │  Gateway   │
│  :3003    │  │  │Service │  │ Service  │   │  │   :3007    │
│           │  │  │ :3004  │  │  :3005   │   │  │            │
│  User     │  │  └────────┘  └──────────┘   │  │  Workflow  │
│  Service  │  │                             │  │  Engine    │
│  :3001    │  │  ┌────────────────────┐     │  │            │
│           │  │  │  Merchandising     │     │  │Notification│
└───────────┘  │  │     Service        │     │  │  Manager   │
               │  │      :3006         │     │  └────────────┘
               │  └────────────────────┘     │
               └─────────────────────────────┘
                              │
                 ┌────────────▼────────────┐
                 │    MESSAGE BROKER       │
                 │      (RabbitMQ)         │
                 └────────────┬────────────┘
                              │
        ┌─────────────────────┼────────────────────┐
        │                     │                    │
┌───────▼──────┐    ┌─────────▼────────┐   ┌───────▼──────┐
│  PostgreSQL  │    │     MongoDB      │   │    Redis     │
├──────────────┤    ├──────────────────┤   ├──────────────┤
│              │    │                  │   │              │
│ - Events     │    │ - Users          │   │ - Cache      │
│ - Venues     │    │ - Sessions       │   │ - Sessions   │
│ - Admins     │    │ - Preferences    │   │ - Temp Data  │
│              │    │                  │   │ - Queues     │
└──────────────┘    └──────────────────┘   └──────────────┘
```

## Microservicios

### 1. API Gateway (Puerto: 3000)

**Responsabilidades:**

- Punto de entrada único para todos los clientes
- Routing inteligente hacia microservicios
- Autenticación y autorización centralizada
- Rate limiting y throttling
- Agregación de respuestas
- Circuit breaker pattern

**Tecnologías:**

- NestJS + Express
- JWT validation
- Redis para caché
- Swagger documentation

### 2. Travel Service (Puerto: 3004)

**Panel:** Rojo Pastel 🔴

**Usuarios:** Users finales + COMPANY_ADMIN

**Funcionalidades:**

**Para Usuarios:**
- Búsqueda y reserva de viajes al festival
- Reserva de transporte (autobuses, shuttles)
- Coordinación de grupos
- Tracking de rutas en tiempo real

**Para COMPANY_ADMIN:**
- Creación y gestión de viajes (requiere aprobación)
- Gestión de rutas y paradas
- Estadísticas de reservas y ocupación
- Control de capacidad y precios

**Base de Datos:** Redis + MongoDB

```javascript
{
  tripId: String,
  festivalId: String,
  departure: {
    location: String,
    datetime: Date,
    coordinates: [lat, lng]
  },
  arrival: {
    location: String,
    estimatedTime: Date
  },
  capacity: Number,
  bookedSeats: Number,
  status: 'SCHEDULED' | 'BOARDING' | 'IN_TRANSIT' | 'COMPLETED',
  requiresApproval: Boolean
}
```

### 3. Restaurant Service (Puerto: 3005)

**Panel:** Verde Pastel 🟢

**Usuarios:** Users finales + COMPANY_ADMIN

**Funcionalidades:**

**Para Usuarios:**
- Catálogo de restaurantes del festival
- Sistema de reservas
- Consulta de menús y dietas especiales
- Pre-pedidos para eventos

**Para COMPANY_ADMIN:**
- Creación y gestión de restaurantes (requiere aprobación)
- Gestión de menús y precios
- Control de aforo y capacidad
- Estadísticas de reservas y ventas

**Base de Datos:** Redis + MongoDB

```javascript
{
  restaurantId: String,
  festivalId: String,
  name: String,
  cuisine: String,
  capacity: Number,
  menu: [{
    itemId: String,
    name: String,
    price: Number,
    dietary: ['vegetarian', 'vegan', 'gluten-free'],
    availability: Number
  }],
  bookings: [{
    userId: String,
    datetime: Date,
    guests: Number,
    specialRequests: String,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  }]
}
```

### 4. Merchandising Service (Puerto: 3006)

**Panel:** Azul Pastel 🔵

**Usuarios:** Users finales + COMPANY_ADMIN

**Funcionalidades:**

**Para Usuarios:**
- Catálogo de productos por banda
- Carrito de compras
- Pre-orders y reservas
- Productos exclusivos VIP
- Sistema de puntos de recogida

**Para COMPANY_ADMIN:**
- Creación y gestión de productos (requiere aprobación)
- Gestión de inventario y stock
- Control de precios y descuentos
- Estadísticas de ventas

**Base de Datos:** Redis + MongoDB

```javascript
{
  productId: String,
  bandId: String,
  festivalId: String,
  type: 'TSHIRT' | 'VINYL' | 'POSTER' | 'ACCESSORIES',
  name: String,
  description: String,
  price: Number,
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  stock: {
    total: Number,
    reserved: Number,
    available: Number
  },
  images: [String],
  exclusive: Boolean,
  preOrderEnabled: Boolean
}
```

### 5. Approval Service (Puerto: 3007)

**Responsabilidades:**

- Centralización de todas las aprobaciones
- Workflow engine para procesos de aprobación
- Notificaciones push/email a administradores
- Escalación automática
- Auditoría de decisiones

**Flujo de Aprobación:**

```mermaid
graph LR
    A[Solicitud] --> B{Validación}
    B -->|Válida| C[Cola de Aprobación]
    B -->|Inválida| D[Rechazada]
    C --> E{Admin Decision}
    E -->|Aprueba| F[Notificar Servicio]
    E -->|Rechaza| G[Notificar Rechazo]
    E -->|Timeout| H[Escalación]
    H --> I[Super Admin]
```

**Base de Datos:** Redis (para estado temporal) + PostgreSQL (para auditoría)

## Stack Tecnológico

### Backend

- **Framework:** NestJS 10.x
- **Runtime:** Node.js 20.x LTS
- **Language:** TypeScript 5.x
- **API Style:** REST + WebSockets (para real-time)

### Databases

- **PostgreSQL 15:** Datos transaccionales (eventos, venues, auditoría)
- **MongoDB 7:** Datos flexibles (usuarios, preferencias, catálogos)
- **Redis 7:** Cache, sesiones, colas temporales

### Message Broker

- **RabbitMQ 3.12:** Comunicación asíncrona entre servicios
  - Exchanges: `festival.events`, `festival.approvals`
  - Queues: Por servicio y tipo de evento
  - Dead Letter Queues para manejo de errores

### Infrastructure

- **Docker & Docker Compose:** Orquestación local
- **Kubernetes:** Orquestación en producción (futuro)
- **API Gateway:** Kong o AWS API Gateway (producción)

### Monitoring & Logging

- **Logs:** Winston + ELK Stack
- **Metrics:** Prometheus + Grafana
- **Tracing:** Jaeger
- **Health Checks:** Terminus (NestJS)

## Flujos de Trabajo

### Flujo de Reserva de Restaurante

```
1. Usuario selecciona restaurante y horario
2. Restaurant Service valida disponibilidad
3. Si requiere aprobación (ej: mesa VIP):
   └── Envía evento a RabbitMQ
   └── Approval Service recibe y procesa
   └── Notifica a Admin Panel
   └── Admin aprueba/rechaza
   └── Approval Service notifica resultado
4. Restaurant Service confirma reserva
5. Envía confirmación al usuario
```

### Flujo de Compra de Merchandising

```
1. Usuario browse catálogo de productos
2. Añade items al carrito
3. Merchandising Service reserva stock temporalmente
4. Procesa pago via Payment Service (existente)
5. Confirma orden y actualiza inventario
6. Genera código QR para recogida
7. Notifica punto de recogida
```

### Flujo de Reserva de Viaje

```
1. Usuario busca viajes disponibles
2. Selecciona origen y horario
3. Travel Service verifica disponibilidad
4. Reserva asientos
5. Si es grupo grande (>10 personas):
   └── Requiere aprobación especial
6. Genera tickets con QR
7. Envía información de embarque
```

## Instalación y Configuración

### Prerrequisitos

```bash
- Node.js 20.x LTS
- Docker Desktop
- NestJS CLI (`npm i -g @nestjs/cli`)
- Redis CLI (opcional)
- MongoDB Compass (opcional)
```

### Instalación Paso a Paso

#### 1. Clonar y preparar el repositorio

```bash
git clone https://github.com/voromb/ticketing-platform.git
cd ticketing-platform
git checkout feature_Voro_2
```

#### 2. Levantar servicios base con Docker

```bash
cd docker
docker-compose up -d
```

#### 3. Instalar API Gateway

```bash
cd ../backend/microservices
nest new api-gateway --package-manager npm
cd api-gateway
npm install @nestjs/microservices @nestjs/config
npm install amqplib amqp-connection-manager
npm install @nestjs/jwt @nestjs/passport
npm install @nestjs/swagger swagger-ui-express
```

#### 4. Instalar Travel Service

```bash
cd ../
nest new travel-service --package-manager npm
cd travel-service
npm install @nestjs/microservices
npm install @nestjs/mongoose mongoose
npm install @nestjs/redis redis
npm install @nestjs/config
```

#### 5. Configurar Restaurant Service

```bash
cd ../
nest new restaurant-service --package-manager npm
cd restaurant-service
# Mismas dependencias que Travel Service
```

#### 6. Configurar Merchandising Service

```bash
cd ../
nest new merchandising-service --package-manager npm
cd merchandising-service
# Mismas dependencias que Travel Service
```

#### 7. Configurar Approval Service

```bash
cd ../
nest new approval-service --package-manager npm
cd approval-service
npm install @nestjs/microservices
npm install @nestjs/redis redis
npm install @prisma/client prisma
npm install @nestjs/config
```

### Variables de Entorno (.env)

#### API Gateway

```env
PORT=3000
JWT_SECRET=your-jwt-secret
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672
```

#### Microservicios

```env
# Travel Service
PORT=3004
MONGODB_URI=mongodb://localhost:27017/travel_service
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672

# Restaurant Service
PORT=3005
MONGODB_URI=mongodb://localhost:27017/restaurant_service
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672

# Merchandising Service
PORT=3006
MONGODB_URI=mongodb://localhost:27017/merch_service
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672

# Approval Service
PORT=3007
DATABASE_URL="postgresql://admin:admin123@localhost:5432/approvals_db"
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672
```

## Estructura del Proyecto

```
ticketing-platform/
├── frontend/
│   ├── ticketing-app/          # Angular - User Panel (White) - Users + VIP
│   ├── admin-panel/            # Angular - Admin Panel (Dark) - SUPER_ADMIN
│   ├── travel-panel/           # Angular - Travel Panel (Red) - Users + COMPANY_ADMIN
│   ├── restaurant-panel/       # Angular - Restaurant Panel (Green) - Users + COMPANY_ADMIN
│   └── merchandising-panel/    # Angular - Merch Panel (Blue) - Users + COMPANY_ADMIN
│
├── backend/
│   ├── admin-service/          # Existing - Express + PostgreSQL
│   ├── user-service/           # Existing - Fastify + MongoDB
│   │
│   └── microservices/          # New NestJS Services
│       ├── api-gateway/
│       │   ├── src/
│       │   │   ├── main.ts
│       │   │   ├── app.module.ts
│       │   │   ├── auth/
│       │   │   ├── proxy/
│       │   │   └── common/
│       │   └── package.json
│       │
│       ├── travel-service/
│       │   ├── src/
│       │   │   ├── trips/
│       │   │   ├── bookings/
│       │   │   └── events/
│       │   └── package.json
│       │
│       ├── restaurant-service/
│       │   ├── src/
│       │   │   ├── restaurants/
│       │   │   ├── reservations/
│       │   │   ├── menus/
│       │   │   └── events/
│       │   └── package.json
│       │
│       ├── merchandising-service/
│       │   ├── src/
│       │   │   ├── products/
│       │   │   ├── orders/
│       │   │   ├── inventory/
│       │   │   └── events/
│       │   └── package.json
│       │
│       └── approval-service/
│           ├── src/
│           │   ├── approvals/
│           │   ├── workflows/
│           │   ├── notifications/
│           │   └── audit/
│           └── package.json
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.microservices.yml  # New
│   ├── init-scripts/
│   └── bd_backup/
│
├── docs/
│   ├── api/
│   ├── architecture/
│   └── deployment/
│
└── scripts/
    ├── start-all.sh
    ├── stop-all.sh
    └── reset-databases.sh
```

## API Documentation

### Endpoints Principales

#### API Gateway Routes

```typescript
// Auth
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

// Travel Service
GET    /api/travel/trips
GET    /api/travel/trips/:id
POST   /api/travel/trips/:id/book
DELETE /api/travel/bookings/:id
GET    /api/travel/my-bookings

// Restaurant Service
GET    /api/restaurants
GET    /api/restaurants/:id
GET    /api/restaurants/:id/menu
POST   /api/restaurants/:id/reserve
GET    /api/restaurants/my-reservations
DELETE /api/restaurants/reservations/:id

// Merchandising Service
GET    /api/merchandise/products
GET    /api/merchandise/products/:id
POST   /api/merchandise/cart/add
GET    /api/merchandise/cart
POST   /api/merchandise/checkout
GET    /api/merchandise/orders

// Approval Service (Admin only)
GET    /api/approvals/pending
GET    /api/approvals/history
POST   /api/approvals/:id/approve
POST   /api/approvals/:id/reject
GET    /api/approvals/stats
```

### WebSocket Events

```typescript
// Real-time notifications
//localhost:3000/events

// Events emitted:
ws: -"approval.requested" -
  "approval.completed" -
  "booking.confirmed" -
  "order.status.changed" -
  "inventory.low";
```

### RabbitMQ Events

```typescript
// Exchange: festival.events
interface TravelBookingEvent {
  type: "TRAVEL_BOOKING_CREATED";
  payload: {
    bookingId: string;
    userId: string;
    tripId: string;
    seats: number;
    requiresApproval: boolean;
  };
}

interface RestaurantReservationEvent {
  type: "RESTAURANT_RESERVATION_CREATED";
  payload: {
    reservationId: string;
    userId: string;
    restaurantId: string;
    datetime: Date;
    guests: number;
    specialRequests?: string;
  };
}

interface MerchandiseOrderEvent {
  type: "MERCHANDISE_ORDER_CREATED";
  payload: {
    orderId: string;
    userId: string;
    items: Array<{
      productId: string;
      quantity: number;
      size?: string;
    }>;
    total: number;
  };
}

// Exchange: festival.approvals
interface ApprovalRequestEvent {
  type: "APPROVAL_REQUESTED";
  payload: {
    approvalId: string;
    service: "TRAVEL" | "RESTAURANT" | "MERCHANDISE";
    entityId: string;
    requestedBy: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    metadata: any;
  };
}

interface ApprovalDecisionEvent {
  type: "APPROVAL_DECISION";
  payload: {
    approvalId: string;
    decision: "APPROVED" | "REJECTED";
    decidedBy: string;
    reason?: string;
    timestamp: Date;
  };
}
```

---

## 📋 TAREAS PENDIENTES - CREACIÓN DE PANELES FRONTEND

### ✅ **Paneles Existentes**

- [x] **Admin Panel (Dark)** - Angular - SUPER_ADMIN
- [x] **User Panel (White)** - Angular - Users + VIP

### 🔨 **Paneles a Crear**

#### 1. Travel Panel (Rojo Pastel 🔴)

**Prioridad:** ALTA

**Funcionalidades a implementar:**

**Vista Usuario:**
- [ ] Página de búsqueda de viajes
- [ ] Filtros por origen, fecha, precio
- [ ] Detalle de viaje con mapa de ruta
- [ ] Formulario de reserva
- [ ] Mis reservas de viajes
- [ ] Tracking en tiempo real

**Vista COMPANY_ADMIN:**
- [ ] Dashboard de estadísticas
- [ ] Formulario crear viaje (con aprobación)
- [ ] Lista de viajes de mi compañía
- [ ] Editar viaje existente
- [ ] Gestión de rutas y paradas
- [ ] Estadísticas de ocupación

**Tecnologías:**
- Angular 18+
- TailwindCSS (tema rojo pastel)
- Angular Material
- Leaflet/Mapbox para mapas
- Chart.js para estadísticas

**Endpoints a consumir:**
```typescript
// Usuarios
GET    /api/travel/trips
GET    /api/travel/trips/:id
POST   /api/travel/trips/:id/book
GET    /api/travel/my-bookings

// COMPANY_ADMIN
POST   /api/travel/with-company
PATCH  /api/travel/:id
GET    /api/travel/stats
```

---

#### 2. Restaurant Panel (Verde Pastel 🟢)

**Prioridad:** ALTA

**Funcionalidades a implementar:**

**Vista Usuario:**
- [ ] Catálogo de restaurantes
- [ ] Filtros por tipo de cocina, ubicación
- [ ] Detalle de restaurante con menú
- [ ] Sistema de reservas con calendario
- [ ] Mis reservas de restaurantes
- [ ] Pre-pedidos

**Vista COMPANY_ADMIN:**
- [ ] Dashboard de estadísticas
- [ ] Formulario crear restaurante (con aprobación)
- [ ] Lista de restaurantes de mi compañía
- [ ] Editar restaurante existente
- [ ] Gestión de menús y precios
- [ ] Control de aforo
- [ ] Estadísticas de reservas

**Tecnologías:**
- Angular 18+
- TailwindCSS (tema verde pastel)
- Angular Material
- FullCalendar para reservas
- Chart.js para estadísticas

**Endpoints a consumir:**
```typescript
// Usuarios
GET    /api/restaurants
GET    /api/restaurants/:id
GET    /api/restaurants/:id/menu
POST   /api/restaurants/:id/reserve
GET    /api/restaurants/my-reservations

// COMPANY_ADMIN
POST   /api/restaurant/with-company
PATCH  /api/restaurant/:id
GET    /api/restaurant/stats
```

---

#### 3. Merchandising Panel (Azul Pastel 🔵)

**Prioridad:** ALTA

**Funcionalidades a implementar:**

**Vista Usuario:**
- [ ] Catálogo de productos
- [ ] Filtros por banda, tipo, precio
- [ ] Detalle de producto con galería
- [ ] Carrito de compras
- [ ] Checkout y pago
- [ ] Mis pedidos
- [ ] Código QR para recogida

**Vista COMPANY_ADMIN:**
- [ ] Dashboard de estadísticas
- [ ] Formulario crear producto (con aprobación)
- [ ] Lista de productos de mi compañía
- [ ] Editar producto existente
- [ ] Gestión de inventario
- [ ] Control de stock
- [ ] Estadísticas de ventas

**Tecnologías:**
- Angular 18+
- TailwindCSS (tema azul pastel)
- Angular Material
- ngx-image-gallery para productos
- Chart.js para estadísticas
- QR Code generator

**Endpoints a consumir:**
```typescript
// Usuarios
GET    /api/merchandise/products
GET    /api/merchandise/products/:id
POST   /api/merchandise/cart/add
GET    /api/merchandise/cart
POST   /api/merchandise/checkout
GET    /api/merchandise/orders

// COMPANY_ADMIN
POST   /api/merchandising/with-company
PATCH  /api/merchandising/:id
GET    /api/merchandising/stats
```

---

### 🎨 **Guía de Estilos por Panel**

#### Travel Panel (Rojo Pastel)
```css
--primary-color: #FF6B6B;
--secondary-color: #FFE5E5;
--accent-color: #FF4757;
--text-color: #2C3E50;
--background: #FFF5F5;
```

#### Restaurant Panel (Verde Pastel)
```css
--primary-color: #51CF66;
--secondary-color: #E7F5E9;
--accent-color: #40C057;
--text-color: #2C3E50;
--background: #F4FFF5;
```

#### Merchandising Panel (Azul Pastel)
```css
--primary-color: #4DABF7;
--secondary-color: #E7F5FF;
--accent-color: #339AF0;
--text-color: #2C3E50;
--background: #F0F9FF;
```

---

### 📦 **Estructura de Cada Panel**

```
panel-name/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── company-admin.guard.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── api.service.ts
│   │   │   └── interceptors/
│   │   │       └── jwt.interceptor.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   └── loading/
│   │   │   └── pipes/
│   │   │
│   │   ├── features/
│   │   │   ├── user/              # Vista para usuarios
│   │   │   │   ├── list/
│   │   │   │   ├── detail/
│   │   │   │   └── booking/
│   │   │   │
│   │   │   └── company-admin/     # Vista para COMPANY_ADMIN
│   │   │       ├── dashboard/
│   │   │       ├── create/
│   │   │       ├── edit/
│   │   │       └── stats/
│   │   │
│   │   └── app.component.ts
│   │
│   ├── assets/
│   ├── environments/
│   └── styles.css
│
├── tailwind.config.js
├── angular.json
└── package.json
```

---

### 🚀 **Plan de Implementación**

#### **Día 1: Travel Panel**
- [ ] Crear proyecto Angular
- [ ] Configurar TailwindCSS con tema rojo
- [ ] Implementar autenticación y guards
- [ ] Vista usuario: Lista y detalle de viajes
- [ ] Vista COMPANY_ADMIN: Dashboard básico

#### **Día 2: Travel Panel (continuación)**
- [ ] Vista usuario: Sistema de reservas
- [ ] Vista COMPANY_ADMIN: Crear viaje
- [ ] Integración con API
- [ ] Testing básico

#### **Día 3: Restaurant Panel**
- [ ] Crear proyecto Angular
- [ ] Configurar TailwindCSS con tema verde
- [ ] Vista usuario: Catálogo de restaurantes
- [ ] Vista COMPANY_ADMIN: Dashboard

#### **Día 4: Restaurant Panel (continuación)**
- [ ] Vista usuario: Sistema de reservas
- [ ] Vista COMPANY_ADMIN: Gestión de menús
- [ ] Integración con API
- [ ] Testing básico

#### **Día 5: Merchandising Panel**
- [ ] Crear proyecto Angular
- [ ] Configurar TailwindCSS con tema azul
- [ ] Vista usuario: Catálogo de productos
- [ ] Vista COMPANY_ADMIN: Dashboard

#### **Día 6: Merchandising Panel (continuación)**
- [ ] Vista usuario: Carrito y checkout
- [ ] Vista COMPANY_ADMIN: Gestión de inventario
- [ ] Integración con API
- [ ] Testing básico

#### **Día 7: Integración y Testing**
- [ ] Testing end-to-end
- [ ] Corrección de bugs
- [ ] Optimización de rendimiento
- [ ] Documentación final

---

### 📝 **Comandos de Inicio Rápido**

```bash
# Crear Travel Panel
cd frontend
ng new travel-panel --routing --style=css
cd travel-panel
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
npm install @angular/material @angular/cdk
npm install chart.js ng2-charts
npm install leaflet @types/leaflet

# Crear Restaurant Panel
cd ../
ng new restaurant-panel --routing --style=css
cd restaurant-panel
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
npm install @angular/material @angular/cdk
npm install chart.js ng2-charts
npm install @fullcalendar/angular @fullcalendar/core

# Crear Merchandising Panel
cd ../
ng new merchandising-panel --routing --style=css
cd merchandising-panel
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
npm install @angular/material @angular/cdk
npm install chart.js ng2-charts
npm install ngx-qrcode-styling
```

---

**Fecha de actualización:** 18 de Octubre, 2025 - 21:22  
**Estado:** 📋 Pendiente de implementación  
**Prioridad:** ALTA - Comenzar mañana
