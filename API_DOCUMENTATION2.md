# 📡 API DOCUMENTATION - SISTEMA DE RESERVAS Y PAGOS

**Versión:** 1.0.0  
**Fecha:** 2025-10-04  
**Base URL:** `http://localhost:3003`

---

## 📋 TABLA DE CONTENIDOS

1. [Endpoints de Reservas](#-endpoints-de-reservas)
2. [Endpoints de Órdenes](#-endpoints-de-órdenes)
3. [Endpoints de Pagos](#-endpoints-de-pagos)
4. [Cron Job - Expiración Automática](#-cron-job---expiración-automática)
5. [Configuración de Tiempo de Reserva](#-configuración-de-tiempo-de-reserva)
6. [Monitoreo con RabbitMQ](#-monitoreo-con-rabbitmq)
7. [Inspección con Prisma Studio](#-inspección-con-prisma-studio)

---

## 🔖 ENDPOINTS DE RESERVAS

### **Base Path:** `/api/reservations`

---

### **1. Crear Reserva VIP**

**Endpoint:** `POST /api/reservations`  
**Auth:** ✅ Requerido (Bearer Token - Solo VIP)  
**Descripción:** Crea una nueva reserva para un usuario VIP. La reserva expira automáticamente en 15 minutos.

#### **Request:**

```http
POST http://localhost:3003/api/reservations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "eventId": "0b257a0a-859b-433e-997f-6df067c0befb",
  "localityId": "55409ed1-9328-40d0-9c17-e639784b3ea4",
  "quantity": 2
}
```

#### **Validaciones:**

- ✅ Usuario debe ser VIP
- ✅ Máximo 3 reservas activas por usuario
- ✅ Stock disponible suficiente
- ✅ Cantidad entre 1 y 10

#### **Response Success (201):**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "68cecdafebd62af136cdfc92",
    "eventId": "0b257a0a-859b-433e-997f-6df067c0befb",
    "localityId": "55409ed1-9328-40d0-9c17-e639784b3ea4",
    "quantity": 2,
    "status": "ACTIVE",
    "expiresAt": "2025-10-04T21:54:18.000Z",
    "createdAt": "2025-10-04T21:39:18.000Z",
    "updatedAt": "2025-10-04T21:39:18.000Z",
    "event": {
      "name": "Concierto de Rock",
      "eventDate": "2025-12-15T20:00:00.000Z"
    },
    "locality": {
      "name": "Pista General",
      "price": "45.00"
    }
  },
  "message": "Reserva creada exitosamente. Expira en 15 minutos."
}
```

#### **Response Error (400):**

```json
{
  "success": false,
  "error": "Ya tienes 3 reservas activas. Cancela alguna o espera a que expiren."
}
```

```json
{
  "success": false,
  "error": "Stock insuficiente. Solo quedan 1 entradas disponibles."
}
```

#### **Response Error (403):**

```json
{
  "success": false,
  "error": "Solo usuarios VIP pueden crear reservas"
}
```

#### **Efectos:**

- ✅ Stock actualizado: `availableTickets--`, `reservedTickets++`
- ✅ Evento RabbitMQ publicado: `reservation.created`
- ✅ Timer de 15 minutos iniciado

---

### **2. Obtener Mis Reservas**

**Endpoint:** `GET /api/reservations/my-reservations`  
**Auth:** ✅ Requerido (Bearer Token)  
**Descripción:** Obtiene todas las reservas del usuario autenticado.

#### **Request:**

```http
GET http://localhost:3003/api/reservations/my-reservations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Query Parameters (Opcionales):**

- `status` - Filtrar por estado: `ACTIVE`, `COMPLETED` (reserva convertida a orden), `EXPIRED`, `CANCELLED`

```http
GET http://localhost:3003/api/reservations/my-reservations?status=ACTIVE
```

#### **Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "68cecdafebd62af136cdfc92",
      "quantity": 2,
      "status": "ACTIVE",
      "expiresAt": "2025-10-04T21:54:18.000Z",
      "createdAt": "2025-10-04T21:39:18.000Z",
      "event": {
        "id": "0b257a0a-859b-433e-997f-6df067c0befb",
        "name": "Concierto de Rock",
        "eventDate": "2025-12-15T20:00:00.000Z",
        "bannerImage": "https://example.com/banner.jpg"
      },
      "locality": {
        "id": "55409ed1-9328-40d0-9c17-e639784b3ea4",
        "name": "Pista General",
        "price": "45.00"
      }
    }
  ],
  "total": 1
}
```

---

### **3. Obtener Todas las Reservas (Admin)**

**Endpoint:** `GET /api/reservations/all`  
**Auth:** ✅ Requerido (Bearer Token - Admin)  
**Descripción:** Obtiene todas las reservas del sistema (solo admins).

#### **Request:**

```http
GET http://localhost:3003/api/reservations/all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Query Parameters (Opcionales):**

- `status` - Filtrar por estado
- `userId` - Filtrar por usuario
- `eventId` - Filtrar por evento

#### **Response Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "68cecdafebd62af136cdfc92",
      "quantity": 2,
      "status": "ACTIVE",
      "expiresAt": "2025-10-04T21:54:18.000Z",
      "createdAt": "2025-10-04T21:39:18.000Z",
      "event": {
        "name": "Concierto de Rock"
      },
      "locality": {
        "name": "Pista General"
      }
    }
  ],
  "total": 15,
  "stats": {
    "active": 5,
    "completed": 8,
    "expired": 2,
    "cancelled": 0
  }
}
```

---

### **4. Cancelar Reserva**

**Endpoint:** `DELETE /api/reservations/:id`  
**Auth:** ✅ Requerido (Bearer Token)  
**Descripción:** Cancela una reserva activa y libera el stock.

#### **Request:**

```http
DELETE http://localhost:3003/api/reservations/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Response Success (200):**

```json
{
  "success": true,
  "message": "Reserva cancelada exitosamente",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "CANCELLED",
    "freedTickets": 2
  }
}
```

#### **Response Error (404):**

```json
{
  "success": false,
  "error": "Reserva no encontrada"
}
```

#### **Response Error (400):**

```json
{
  "success": false,
  "error": "La reserva ya fue procesada o cancelada"
}
```

#### **Efectos:**

- ✅ Stock liberado: `availableTickets++`, `reservedTickets--`
- ✅ Estado cambiado a `CANCELLED`
- ✅ Evento RabbitMQ publicado: `reservation.cancelled`

---

## 🛒 ENDPOINTS DE ÓRDENES

### **Base Path:** `/api/orders`

---

### **1. Crear Orden**

**Endpoint:** `POST /api/orders`  
**Auth:** ✅ Requerido (Bearer Token)  
**Descripción:** Crea una nueva orden de compra. Puede ser desde una reserva o compra directa.

#### **Request (Compra Directa):**

```http
POST http://localhost:3003/api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "eventId": "0b257a0a-859b-433e-997f-6df067c0befb",
  "localityId": "55409ed1-9328-40d0-9c17-e639784b3ea4",
  "quantity": 2
}
```

#### **Request (Desde Reserva):**

```http
POST http://localhost:3003/api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "eventId": "0b257a0a-859b-433e-997f-6df067c0befb",
  "localityId": "55409ed1-9328-40d0-9c17-e639784b3ea4",
  "quantity": 2,
  "reservationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

#### **Cálculo de Precios:**

```javascript
// Usuario VIP
totalAmount = price * quantity = 45.00 * 2 = 90.00
discount = totalAmount * 0.10 = 9.00
finalAmount = totalAmount - discount = 81.00

// Usuario Normal
totalAmount = price * quantity = 45.00 * 2 = 90.00
discount = 0.00
finalAmount = 90.00
```

#### **Response Success (201):**

```json
{
  "success": true,
  "data": {
    "id": "0234e2bb-43d5-4048-afc2-6801ac60ad0f",
    "userId": "68cecdafebd62af136cdfc92",
    "userEmail": "voro.vip@ticketing.com",
    "eventId": "0b257a0a-859b-433e-997f-6df067c0befb",
    "localityId": "55409ed1-9328-40d0-9c17-e639784b3ea4",
    "quantity": 2,
    "totalAmount": "90.00",
    "discount": "9.00",
    "finalAmount": "81.00",
    "status": "PENDING",
    "reservationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "createdAt": "2025-10-04T21:40:00.000Z",
    "event": {
      "name": "Concierto de Rock"
    },
    "locality": {
      "name": "Pista General",
      "price": "45.00"
    }
  },
  "message": "Orden creada exitosamente"
}
```

#### **Efectos:**

- ✅ Si es compra directa: `availableTickets--`
- ✅ Si es desde reserva: `reservedTickets--` (el stock ya estaba bloqueado)
- ✅ Estado inicial: `PENDING`
- ✅ Descuento VIP aplicado automáticamente

---

### **2. Obtener Mis Órdenes**

**Endpoint:** `GET /api/orders/my-orders`  
**Auth:** ✅ Requerido (Bearer Token)  
**Descripción:** Obtiene todas las órdenes del usuario autenticado.

#### **Request:**

```http
GET http://localhost:3003/api/orders/my-orders
#### **Query Parameters (Opcionales):**

- `status` - Filtrar por estado de la orden: `PENDING`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED`
#### **Response Success (200):**

```json
{
  "success": true,
{{ ... }}
  "data": [
    {
      "id": "0234e2bb-43d5-4048-afc2-6801ac60ad0f",
      "quantity": 2,
      "finalAmount": "81.00",
      "status": "PAID",
      "paidAt": "2025-10-04T21:42:00.000Z",
      "createdAt": "2025-10-04T21:40:00.000Z",
      "event": {
        "name": "Concierto de Rock",
        "eventDate": "2025-12-15T20:00:00.000Z"
      },
      "locality": {
        "name": "Pista General"
      },
      "tickets": [
        {
          "id": "ticket-1",
          "ticketCode": "TKT-1759605671748-1",
          "qrCode": "TICKET-0234e2bb-43d5-4048-afc2-6801ac60ad0f-1",
          "status": "VALID"
        },
        {
          "id": "ticket-2",
          "ticketCode": "TKT-1759605671748-2",
          "qrCode": "TICKET-0234e2bb-43d5-4048-afc2-6801ac60ad0f-2",
          "status": "VALID"
        }
      ]
    }
  ],
  "total": 1
}
```

---

### **3. Obtener Orden por ID**

**Endpoint:** `GET /api/orders/:id`  
**Auth:** ✅ Requerido (Bearer Token)  
**Descripción:** Obtiene una orden específica por su ID.

#### **Request:**

```http
GET http://localhost:3003/api/orders/0234e2bb-43d5-4048-afc2-6801ac60ad0f
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Response Success (200):**

```json
{
  "success": true,
  "data": {
    "id": "0234e2bb-43d5-4048-afc2-6801ac60ad0f",
    "userId": "68cecdafebd62af136cdfc92",
    "userEmail": "voro.vip@ticketing.com",
    "quantity": 2,
    "totalAmount": "90.00",
    "discount": "9.00",
    "finalAmount": "81.00",
    "status": "PAID",
    "paidAt": "2025-10-04T21:42:00.000Z",
    "event": {
      "name": "Concierto de Rock",
      "eventDate": "2025-12-15T20:00:00.000Z",
      "bannerImage": "https://example.com/banner.jpg"
    },
    "locality": {
      "name": "Pista General",
      "price": "45.00"
    },
    "tickets": [...]
  }
}
```

---

### **4. Obtener Todas las Órdenes (Admin)**

**Endpoint:** `GET /api/orders/all`  
**Auth:** ✅ Requerido (Bearer Token - Admin)  
**Descripción:** Obtiene todas las órdenes del sistema.

#### **Request:**

```http
GET http://localhost:3003/api/orders/all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Response Success (200):**

```json
{
  "success": true,
  "data": [...],
  "total": 25,
  "stats": {
    "pending": 3,
    "completed": 20,
    "failed": 2,
    "totalRevenue": "2450.00"
  }
}
```

---

## 💳 ENDPOINTS DE PAGOS

### **Base Path:** `/api/payments`

---

### **1. Crear Sesión de Checkout**

**Endpoint:** `POST /api/payments/create-checkout`  
**Auth:** ✅ Requerido (Bearer Token)  
**Descripción:** Crea una sesión de pago (Stripe o checkout interno).

#### **Request:**

```http
POST http://localhost:3003/api/payments/create-checkout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "orderId": "0234e2bb-43d5-4048-afc2-6801ac60ad0f"
}
```

#### **Response Success (200) - Con Stripe:**

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
    "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6g7h8i9j0"
  }
}
```

#### **Response Success (200) - Sin Stripe (Modo Interno):**

```json
{
  "success": true,
  "data": {
    "sessionId": "checkout_0234e2bb-43d5-4048-afc2-6801ac60ad0f",
    "url": "http://localhost:4200/payment/checkout?orderId=0234e2bb-43d5-4048-afc2-6801ac60ad0f"
  }
}
```

---

### **2. Completar Pago (Modo Interno)**

**Endpoint:** `POST /api/payments/complete-payment`  
**Auth:** ✅ Requerido (Bearer Token)  
**Descripción:** Completa el pago en modo interno (sin Stripe real).

#### **Request:**

```http
POST http://localhost:3003/api/payments/complete-payment
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "orderId": "0234e2bb-43d5-4048-afc2-6801ac60ad0f"
}
```

#### **Response Success (200):**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "0234e2bb-43d5-4048-afc2-6801ac60ad0f",
      "status": "PAID",
      "paidAt": "2025-10-04T21:42:00.000Z"
    },
    "tickets": [
      {
        "id": "ticket-1",
        "ticketCode": "TKT-1759605671748-1",
        "qrCode": "TICKET-0234e2bb-43d5-4048-afc2-6801ac60ad0f-1",
        "status": "VALID"
      },
      {
        "id": "ticket-2",
        "ticketCode": "TKT-1759605671748-2",
        "qrCode": "TICKET-0234e2bb-43d5-4048-afc2-6801ac60ad0f-2",
        "status": "VALID"
      }
    ],
    "message": "Pago procesado exitosamente"
  }
}
```

#### **Efectos:**

- ✅ Orden: `status` → `PAID`
- ✅ Stock: `soldTickets++`
- ✅ Si viene de reserva: `reserva.status` → `COMPLETED`
- ✅ Tickets generados con QR codes
- ✅ Eventos RabbitMQ: `order.completed`, `tickets.generated`

---

### **3. Webhook de Stripe**

**Endpoint:** `POST /api/payments/webhook`  
**Auth:** ❌ No requiere (verificación por firma Stripe)  
**Descripción:** Recibe eventos de Stripe para actualizar órdenes.

#### **Eventos Manejados:**

- `checkout.session.completed` → Orden PAID + Generar tickets
- `checkout.session.expired` → Orden FAILED
- `payment_intent.payment_failed` → Orden FAILED

---

## ⏰ CRON JOB - EXPIRACIÓN AUTOMÁTICA

### **Archivo:** `backend/admin/src/jobs/reservation.cron.ts`

### **Configuración Actual:**

```typescript
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { rabbitMQService } from '../services/rabbitmq.service';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// ⏰ CONFIGURACIÓN: Cada 1 minuto
const CRON_SCHEDULE = '* * * * *';

// 🕐 TIEMPO DE EXPIRACIÓN: 15 minutos
const EXPIRATION_TIME_MINUTES = 15;

export function startReservationCron() {
  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      logger.info('🔄 Ejecutando cron job: Expirar reservas...');

      // Buscar reservas ACTIVE que ya expiraron
      const expiredReservations = await prisma.reservation.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: {
            lt: new Date() // Menor que ahora
          }
        },
        include: {
          event: true,
          locality: true
        }
      });

      if (expiredReservations.length === 0) {
        logger.info('✅ No hay reservas para expirar');
        return;
      }

      logger.info(`⚠️ Encontradas ${expiredReservations.length} reservas expiradas`);

      // Procesar cada reserva expirada
      for (const reservation of expiredReservations) {
        // 1. Actualizar estado a EXPIRED
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: 'EXPIRED' }
        });

        // 2. Liberar stock
        await prisma.eventLocality.update({
          where: { id: reservation.localityId },
          data: {
            availableTickets: { increment: reservation.quantity },
            reservedTickets: { decrement: reservation.quantity }
          }
        });

        // 3. Publicar evento en RabbitMQ
        await rabbitMQService.publishEvent('reservation.expired', {
          reservationId: reservation.id,
          userId: reservation.userId,
          eventId: reservation.eventId,
          eventName: reservation.event.name,
          quantity: reservation.quantity,
          expiredAt: new Date().toISOString()
        });

        logger.info(`✅ Reserva ${reservation.id} expirada y stock liberado (${reservation.quantity} tickets)`);
      }

      logger.info(`🎉 Cron job completado: ${expiredReservations.length} reservas expiradas`);

    } catch (error) {
      logger.error('❌ Error en cron job de expiración:', error);
    }
  });

  logger.info(`⏰ Cron job iniciado: Expiración de reservas cada 1 minuto`);
}
```

### **Cómo Funciona:**

1. **Frecuencia:** Se ejecuta cada 1 minuto (`* * * * *`)
2. **Búsqueda:** Encuentra reservas con `status = ACTIVE` y `expiresAt < now`
3. **Expiración:** Cambia el estado a `EXPIRED`
4. **Liberación de Stock:**
   - `availableTickets` aumenta en `quantity`
   - `reservedTickets` disminuye en `quantity`
5. **Notificación:** Publica evento `reservation.expired` en RabbitMQ
6. **Logs:** Registra cada acción para auditoría

### **Diagrama de Flujo:**

```
┌─────────────────────────────────────────────────────────────┐
│                    CRON JOB (Cada 1 min)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Buscar reservas: status=ACTIVE AND expiresAt < now        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ¿Hay reservas?
                    /           \
                  NO             SI
                  ↓              ↓
            ✅ Terminar    Para cada reserva:
                           ↓
                    1. Status → EXPIRED
                           ↓
                    2. availableTickets++
                       reservedTickets--
                           ↓
                    3. Publicar evento RabbitMQ
                       "reservation.expired"
                           ↓
                    4. Log: "Reserva X expirada"
                           ↓
                    ✅ Siguiente reserva
```

---

## ⚙️ CONFIGURACIÓN DE TIEMPO DE RESERVA

### **Cambiar el Tiempo de Expiración (15 minutos)**

#### **Opción 1: Variable de Entorno (Recomendado)**

**Archivo:** `backend/admin/.env`

```env
# Tiempo de expiración de reservas en minutos
RESERVATION_EXPIRATION_MINUTES=15
```

**Código actualizado:**

```typescript
// backend/admin/src/jobs/reservation.cron.ts
const EXPIRATION_TIME_MINUTES = parseInt(process.env.RESERVATION_EXPIRATION_MINUTES || '15');
```

**Ejemplos:**

```env
# 5 minutos (para testing)
RESERVATION_EXPIRATION_MINUTES=5

# 30 minutos (más tiempo)
RESERVATION_EXPIRATION_MINUTES=30

# 1 hora
RESERVATION_EXPIRATION_MINUTES=60
```

#### **Opción 2: Constante en Código**

**Archivo:** `backend/admin/src/jobs/reservation.cron.ts`

```typescript
// Cambiar esta línea:
const EXPIRATION_TIME_MINUTES = 15; // ← Cambiar a 5, 10, 30, etc.
```

#### **Opción 3: Configuración en Base de Datos**

Crear tabla de configuración:

```prisma
model SystemConfig {
  id    String @id @default(uuid())
  key   String @unique
  value String
}
```

Insertar configuración:

```sql
INSERT INTO "SystemConfig" (id, key, value) 
VALUES (uuid_generate_v4(), 'reservation_expiration_minutes', '15');
```

Leer en código:

```typescript
const config = await prisma.systemConfig.findUnique({
  where: { key: 'reservation_expiration_minutes' }
});
const EXPIRATION_TIME_MINUTES = parseInt(config?.value || '15');
```

### **Cambiar la Frecuencia del Cron Job**

**Archivo:** `backend/admin/src/jobs/reservation.cron.ts`

```typescript
// Cada 1 minuto (actual)
const CRON_SCHEDULE = '* * * * *';

// Cada 30 segundos (más frecuente)
const CRON_SCHEDULE = '*/30 * * * * *';

// Cada 5 minutos (menos frecuente)
const CRON_SCHEDULE = '*/5 * * * *';

// Cada hora
const CRON_SCHEDULE = '0 * * * *';
```

**Formato Cron:**

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Día de la semana (0-7, 0 y 7 = Domingo)
│ │ │ └───── Mes (1-12)
│ │ └─────── Día del mes (1-31)
│ └───────── Hora (0-23)
└─────────── Minuto (0-59)
```

---

## 🐰 MONITOREO CON RABBITMQ

### **Acceder a RabbitMQ Management**

**URL:** `http://localhost:15672`  
**Usuario:** `admin`  
**Contraseña:** `admin123`

### **Ver Eventos en Tiempo Real**

#### **1. Ir a la pestaña "Exchanges"**

- Buscar: `ticketing_events`
- Tipo: `topic`
- Click en el nombre

#### **2. Ver Bindings (Colas conectadas)**

Verás las colas conectadas al exchange:
- `reservation_queue`
- `order_queue`
- `payment_queue`

#### **3. Ver Mensajes en Cola**

- Ir a pestaña "Queues"
- Click en una cola (ej: `reservation_queue`)
- Click en "Get Messages"
- Seleccionar cantidad: 10
- Click "Get Message(s)"

#### **Ejemplo de Mensaje:**

```json
{
  "routingKey": "reservation.created",
  "payload": {
    "reservationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "68cecdafebd62af136cdfc92",
    "eventId": "0b257a0a-859b-433e-997f-6df067c0befb",
    "eventName": "Concierto de Rock",
    "quantity": 2,
    "expiresAt": "2025-10-04T21:54:18.000Z",
    "createdAt": "2025-10-04T21:39:18.000Z"
  },
  "timestamp": "2025-10-04T21:39:18.000Z"
}
```

### **Routing Keys Publicados:**

| Routing Key | Descripción | Cuándo se publica |
|-------------|-------------|-------------------|
| `reservation.created` | Reserva creada | Al crear reserva VIP |
| `reservation.expired` | Reserva expirada | Cron job cada 1 min |
| `reservation.completed` | Reserva completada | Al comprar desde reserva |
| `reservation.cancelled` | Reserva cancelada | Al cancelar reserva |
| `order.created` | Orden creada | Al crear orden |
| `order.completed` | Orden completada | Al completar pago |
| `order.failed` | Orden fallida | Al fallar pago |
| `tickets.generated` | Tickets generados | Al completar orden |

### **Monitorear en Tiempo Real con CLI:**

```bash
# Instalar herramienta
npm install -g amqp-tool

# Escuchar todos los eventos
amqp-tool subscribe amqp://admin:admin123@localhost:5672 ticketing_events '#'

# Escuchar solo reservas
amqp-tool subscribe amqp://admin:admin123@localhost:5672 ticketing_events 'reservation.*'

# Escuchar solo órdenes
amqp-tool subscribe amqp://admin:admin123@localhost:5672 ticketing_events 'order.*'
```

---

## 🔍 INSPECCIÓN CON PRISMA STUDIO

### **Abrir Prisma Studio**

```bash
cd backend/admin
npx prisma studio
```

**URL:** `http://localhost:5555`

### **Tablas Disponibles:**

1. **Reservation** - Ver todas las reservas
2. **Order** - Ver todas las órdenes
3. **Ticket** - Ver todos los tickets
4. **Event** - Ver eventos
5. **EventLocality** - Ver localidades y stock

### **Consultas Útiles:**

#### **1. Ver Reservas Activas:**

- Ir a tabla `Reservation`
- Filtrar: `status` = `ACTIVE`
- Ordenar por: `expiresAt` (ascendente)

#### **2. Ver Reservas que Expiran Pronto:**

- Filtrar: `status` = `ACTIVE`
- Filtrar: `expiresAt` < `[Fecha actual + 5 minutos]`

#### **3. Ver Órdenes Completadas:**

- Ir a tabla `Order`
- Filtrar: `status` = `PAID`
- Ordenar por: `paidAt` (descendente)

#### **4. Ver Stock de Localidades:**

- Ir a tabla `EventLocality`
- Ver columnas:
  - `totalCapacity` - Capacidad total
  - `availableTickets` - Disponibles
  - `reservedTickets` - Reservados
  - `soldTickets` - Vendidos

**Fórmula de validación:**
```
totalCapacity = availableTickets + reservedTickets + soldTickets
```

#### **5. Ver Tickets Generados:**

- Ir a tabla `Ticket`
- Filtrar: `status` = `VALID`
- Ver relaciones: `order`, `event`, `locality`

### **Editar Datos Manualmente:**

#### **Cambiar Estado de Reserva:**

1. Ir a tabla `Reservation`
2. Click en la fila
3. Cambiar `status` a `ACTIVE`, `EXPIRED`, `CANCELLED`, etc.
4. Click "Save"

#### **Ajustar Stock Manualmente:**

1. Ir a tabla `EventLocality`
2. Click en la fila
3. Editar:
   - `availableTickets`
   - `reservedTickets`
   - `soldTickets`
4. Click "Save"

⚠️ **IMPORTANTE:** Asegúrate de mantener la fórmula:
```
totalCapacity = availableTickets + reservedTickets + soldTickets
```

### **Consultas SQL Directas:**

Prisma Studio no permite SQL directo, pero puedes usar:

```bash
# Conectar a PostgreSQL
docker exec -it ticketing-postgres psql -U admin -d ticketing

# Ver reservas activas
SELECT * FROM "Reservation" WHERE status = 'ACTIVE';

# Ver órdenes completadas hoy
SELECT * FROM "Order" 
WHERE status = 'PAID' 
AND "paidAt" >= CURRENT_DATE;

# Ver stock de todas las localidades
SELECT 
  e.name as evento,
  el.name as localidad,
  el."totalCapacity",
  el."availableTickets",
  el."reservedTickets",
  el."soldTickets"
FROM "EventLocality" el
JOIN "Event" e ON el."eventId" = e.id;

# Salir
\q
```

---

## 📊 ESTADÍSTICAS Y REPORTES

### **Endpoint de Estadísticas (Admin)**

**Endpoint:** `GET /api/admin/stats`  
**Auth:** ✅ Requerido (Bearer Token - Admin)

```http
GET http://localhost:3003/api/admin/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "success": true,
  "data": {
    "reservations": {
      "active": 5,
      "completed": 20,
      "expired": 8,
      "cancelled": 2,
      "total": 35
    },
    "orders": {
      "pending": 3,
      "completed": 45,
      "failed": 2,
      "total": 50,
      "totalRevenue": "4500.00"
    },
    "tickets": {
      "valid": 90,
      "used": 10,
      "total": 100
    }
  }
}
```

---

## 🔧 TROUBLESHOOTING

### **Problema: Reservas no expiran**

**Solución:**

```bash
# Verificar que el cron job está corriendo
# Ver logs del admin-service
docker logs ticketing-admin -f

# Buscar línea:
# ⏰ Cron job iniciado: Expiración de reservas cada 1 minuto
```

### **Problema: Stock desincronizado**

**Solución:**

```sql
-- Recalcular stock
UPDATE "EventLocality" el
SET 
  "availableTickets" = "totalCapacity" - "reservedTickets" - "soldTickets"
WHERE id = 'locality-id';
```

### **Problema: RabbitMQ no recibe eventos**

**Solución:**

```bash
# Verificar conexión
docker logs ticketing-rabbitmq

# Reiniciar RabbitMQ
docker restart ticketing-rabbitmq

# Reiniciar admin-service
cd backend/admin
npm run dev
```

---

## 📞 SOPORTE

**Desarrollador:** Salvador Moran Beneyto  
**Fecha:** 2025-10-04  
**Versión API:** 1.0.0

---

## 🎯 RESUMEN RÁPIDO

### **Crear Reserva VIP:**
```bash
POST /api/reservations
Body: { eventId, localityId, quantity }
```

### **Comprar Directamente:**
```bash
POST /api/orders
Body: { eventId, localityId, quantity }
↓
POST /api/payments/create-checkout
Body: { orderId }
↓
POST /api/payments/complete-payment
Body: { orderId }
```

### **Comprar desde Reserva:**
```bash
POST /api/orders
Body: { eventId, localityId, quantity, reservationId }
↓
[Mismo flujo de pago]
```

### **Monitorear:**
- **RabbitMQ:** http://localhost:15672
- **Prisma Studio:** npx prisma studio
- **Logs:** docker logs ticketing-admin -f

---

**¡API completamente documentada y lista para usar!** 🚀
