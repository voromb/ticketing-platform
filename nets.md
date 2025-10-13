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

**Funcionalidades:**

- Gestión de viajes al festival
- Reserva de transporte (autobuses, shuttles)
- Coordinación de grupos
- Tracking de rutas
- Gestión de paradas

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

**Funcionalidades:**

- Catálogo de restaurantes del festival
- Sistema de reservas
- Gestión de menús y dietas especiales
- Control de aforo
- Pre-pedidos para eventos

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

**Funcionalidades:**

- Catálogo de productos por banda
- Gestión de inventario
- Pre-orders y reservas
- Productos exclusivos VIP
- Sistema de puntos de recogida

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
│   ├── ticketing-app/          # Angular - User Panel (White)
│   ├── admin-panel/            # Angular - Admin Panel (Dark)
│   ├── travel-panel/           # Angular - Travel Panel (Red)
│   ├── restaurant-panel/       # Angular - Restaurant Panel (Green)
│   └── merchandising-panel/    # Angular - Merch Panel (Blue)
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
