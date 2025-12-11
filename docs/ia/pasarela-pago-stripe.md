# 🔐 Documentación: Pasarela de Pago con Stripe

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Configuración](#configuración)
4. [Flujo de Pago](#flujo-de-pago)
5. [Componentes Backend](#componentes-backend)
6. [Componentes Frontend](#componentes-frontend)
7. [Modo Demo vs Producción](#modo-demo-vs-producción)
8. [Webhooks de Stripe](#webhooks-de-stripe)
9. [Integración con RabbitMQ](#integración-con-rabbitmq)
10. [Archivos Modificados](#archivos-modificados)

---

## 📖 Descripción General

El sistema de pasarela de pago implementado utiliza **Stripe** como proveedor de servicios de pago. La implementación incluye:

- ✅ Creación de sesiones de checkout de Stripe
- ✅ Procesamiento de pagos con tarjeta
- ✅ Webhooks para notificaciones de Stripe
- ✅ Modo demo para desarrollo sin Stripe real
- ✅ Generación automática de tickets tras pago exitoso
- ✅ Integración con RabbitMQ para eventos de pago
- ✅ Actualización automática de stock

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│   Stripe    │
│  (Angular)  │         │  (Fastify)   │         │     API     │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                         │
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌─────────────┐
                        │  PostgreSQL  │         │  Webhooks   │
                        │   Database   │         │  (Eventos)  │
                        └──────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   RabbitMQ   │
                        │   (Events)   │
                        └──────────────┘
```

---

## ⚙️ Configuración

### Variables de Entorno (`.env`)

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51QKkqyP6sSXuFQSLABCDEFGHIJKLMNOPQRSTUVWXYZ
STRIPE_PUBLISHABLE_KEY=pk_test_51QKkqyP6sSXuFQSLABCDEFGHIJKLMNOPQRSTUVWXYZ
STRIPE_WEBHOOK_SECRET=whsec_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890

# Frontend URL
FRONTEND_URL=http://localhost:4200

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin123@127.0.0.1:5672
RABBITMQ_EXCHANGE=ticketing_events
```

**Ubicación**: `/backend/admin/.env`

### Detección de Modo Demo

El sistema detecta automáticamente si está en modo demo basándose en las claves de Stripe:

```typescript
const DEMO_MODE = !process.env.STRIPE_SECRET_KEY || 
                  process.env.STRIPE_SECRET_KEY.includes('ABCDEFG');
```

Si las claves contienen valores dummy o no están configuradas, el sistema usa un checkout interno simulado.

---

## 🔄 Flujo de Pago

### 1. Flujo Completo (Modo Producción con Stripe)

```
1. Usuario selecciona evento y cantidad
   ↓
2. Se crea una orden (status: PENDING)
   ↓
3. Frontend solicita crear sesión de checkout
   POST /api/v1/payments/create-checkout
   ↓
4. Backend crea sesión en Stripe
   ↓
5. Usuario es redirigido a Stripe Checkout
   ↓
6. Usuario completa el pago en Stripe
   ↓
7. Stripe envía webhook al backend
   POST /api/v1/payments/webhook
   ↓
8. Backend procesa el webhook:
   - Actualiza orden a PAID
   - Genera tickets
   - Actualiza stock
   - Publica evento en RabbitMQ
   ↓
9. Usuario es redirigido a página de éxito
```

### 2. Flujo Simplificado (Modo Demo)

```
1. Usuario selecciona evento y cantidad
   ↓
2. Se crea una orden (status: PENDING)
   ↓
3. Frontend solicita crear sesión de checkout
   POST /api/v1/payments/create-checkout
   ↓
4. Backend retorna URL de checkout interno
   ↓
5. Usuario completa formulario de pago demo
   ↓
6. Frontend llama a endpoint de pago demo
   POST /api/v1/payments/complete-payment
   ↓
7. Backend procesa el pago:
   - Actualiza orden a PAID
   - Genera tickets
   - Actualiza stock
   ↓
8. Usuario ve confirmación de pago
```

---

## 🔧 Componentes Backend

### 1. Payment Controller

**Ubicación**: `/backend/admin/src/controllers/payment.controller.ts`

#### Métodos Principales:

##### `createCheckoutSession()`
Crea una sesión de checkout de Stripe o retorna URL de checkout demo.

```typescript
async createCheckoutSession(request, reply) {
  // 1. Validar usuario y orden
  // 2. Si DEMO_MODE: retornar URL interna
  // 3. Si producción: crear sesión Stripe
  // 4. Actualizar orden con sessionId
  // 5. Retornar URL de checkout
}
```

**Request**:
```json
{
  "orderId": "uuid-de-la-orden"
}
```

**Response (Modo Demo)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "checkout_uuid-de-la-orden",
    "url": "http://localhost:4200/payment/checkout?orderId=uuid"
  }
}
```

**Response (Modo Producción)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

##### `completeDemoPayment()`
Procesa pagos en modo demo sin Stripe real.

```typescript
async completeDemoPayment(request, reply) {
  // 1. Validar orden
  // 2. Actualizar orden a PAID
  // 3. Actualizar stock
  // 4. Liberar reservas si aplica
  // 5. Generar tickets
  // 6. Retornar confirmación
}
```

**Request**:
```json
{
  "orderId": "uuid-de-la-orden"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order": { /* orden actualizada */ },
    "tickets": [ /* tickets generados */ ],
    "message": "Pago procesado exitosamente"
  }
}
```

##### `handleWebhook()`
Procesa webhooks de Stripe para eventos de pago.

```typescript
async handleWebhook(request, reply) {
  // 1. Verificar firma del webhook
  // 2. Procesar evento según tipo:
  //    - checkout.session.completed
  //    - checkout.session.expired
  //    - payment_intent.payment_failed
  // 3. Actualizar orden
  // 4. Publicar evento en RabbitMQ
}
```

**Eventos Soportados**:
- `checkout.session.completed`: Pago exitoso
- `checkout.session.expired`: Sesión expirada
- `payment_intent.payment_failed`: Pago fallido

##### `checkPaymentStatus()`
Verifica el estado de una sesión de pago.

```typescript
async checkPaymentStatus(request, reply) {
  // 1. Obtener sesión de Stripe
  // 2. Buscar orden asociada
  // 3. Retornar estado completo
}
```

### 2. Order Controller

**Ubicación**: `/backend/admin/src/controllers/order.controller.ts`

#### Métodos Relacionados con Pagos:

##### `updateOrderStatus()`
Actualiza el estado de una orden y ejecuta acciones según el nuevo estado.

```typescript
async updateOrderStatus(orderId, status, stripePaymentId?) {
  // 1. Actualizar orden en transacción
  // 2. Si status === PAID:
  //    - Actualizar stock
  //    - Generar tickets
  //    - Liberar reservas
  // 3. Retornar orden actualizada
}
```

##### `processOrderPayment()`
Procesa el pago de una orden (usado por webhooks).

```typescript
async processOrderPayment(orderId, stripeSessionId) {
  // 1. Validar orden
  // 2. Actualizar a COMPLETED
  // 3. Actualizar stock
  // 4. Liberar reservas
  // 5. Generar tickets
}
```

### 3. Payment Routes

**Ubicación**: `/backend/admin/src/routes/payment.routes.ts`

#### Endpoints Disponibles:

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| POST | `/create-checkout` | ✅ Requerida | Crear sesión de checkout |
| POST | `/complete-payment` | ✅ Requerida | Completar pago demo |
| GET | `/status/:sessionId` | ✅ Requerida | Verificar estado de pago |
| GET | `/` | ✅ Requerida | Listar pagos (TODO) |
| GET | `/stats` | ✅ Requerida | Estadísticas de pagos (TODO) |
| POST | `/webhook` | ❌ Sin auth | Webhook de Stripe |

**Nota**: El webhook no requiere autenticación JWT porque viene directamente de los servidores de Stripe. La autenticación se realiza mediante la firma del webhook.

### 4. RabbitMQ Service

**Ubicación**: `/backend/admin/src/services/rabbitmq.service.ts`

#### Funcionalidad:

```typescript
class RabbitMQService {
  // Conectar a RabbitMQ
  async connect(): Promise<void>
  
  // Publicar evento
  async publishEvent(routingKey: string, data: any): Promise<void>
  
  // Suscribirse a eventos
  async subscribe(routingKey: string, callback: Function): Promise<void>
  
  // Cerrar conexión
  async close(): Promise<void>
}
```

#### Eventos de Pago Publicados:

**Routing Key**: `payment.completed`

**Payload**:
```json
{
  "orderId": "uuid",
  "userId": "uuid",
  "eventId": "uuid",
  "amount": 50.00,
  "currency": "eur",
  "paymentIntent": "pi_...",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## 🎨 Componentes Frontend

### 1. Payment Service

**Ubicación**: `/frontend/ticketing-app/src/app/core/services/payment.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class PaymentService {
  // Crear sesión de checkout
  createCheckoutSession(orderId: string): Observable<any>
  
  // Verificar estado de pago
  checkPaymentStatus(sessionId: string): Observable<any>
}
```

### 2. Payment Checkout Component

**Ubicación**: `/frontend/ticketing-app/src/app/pages/payment-checkout/payment-checkout.component.ts`

#### Funcionalidades:

1. **Carga de información de la orden**
   - Detecta si es orden de Admin Service (UUID) o Festival Services (ObjectId)
   - Obtiene detalles de la orden desde el backend correspondiente

2. **Formulario de pago demo**
   - Número de tarjeta (pre-llenado: 4242 4242 4242 4242)
   - Fecha de expiración (pre-llenado: 12/25)
   - CVC (pre-llenado: 123)

3. **Procesamiento de pago**
   - Valida campos del formulario
   - Envía petición al backend
   - Muestra loading durante el proceso
   - Redirige a perfil tras éxito

#### Flujo del Componente:

```typescript
ngOnInit() {
  // 1. Obtener orderId de query params
  // 2. Cargar información de la orden
}

loadOrderInfo() {
  // 1. Detectar tipo de orden (Admin vs Festival)
  // 2. Llamar al endpoint correspondiente
  // 3. Formatear información para mostrar
}

processPayment() {
  // 1. Validar campos
  // 2. Mostrar loading
  // 3. Detectar tipo de orden
  // 4. Llamar a endpoint de pago correspondiente
  // 5. Mostrar resultado
  // 6. Redirigir a perfil
}
```

---

## 🔀 Modo Demo vs Producción

### Modo Demo (Desarrollo)

**Activación**: Cuando `STRIPE_SECRET_KEY` contiene valores dummy o no está configurada.

**Características**:
- ✅ No requiere cuenta de Stripe real
- ✅ Checkout interno simulado
- ✅ Procesamiento instantáneo
- ✅ Datos de tarjeta pre-llenados
- ✅ Sin webhooks de Stripe
- ⚠️ No hay validación real de tarjetas

**Flujo**:
```
Usuario → Checkout Interno → Backend Demo → Tickets Generados
```

### Modo Producción

**Activación**: Cuando `STRIPE_SECRET_KEY` contiene una clave válida de Stripe.

**Características**:
- ✅ Integración real con Stripe
- ✅ Validación de tarjetas
- ✅ Procesamiento seguro (PCI compliant)
- ✅ Webhooks para confirmación
- ✅ Múltiples métodos de pago
- ✅ Gestión de reembolsos

**Flujo**:
```
Usuario → Stripe Checkout → Stripe API → Webhook → Backend → Tickets Generados
```

---

## 🔔 Webhooks de Stripe

### Configuración

1. **Crear webhook en Stripe Dashboard**:
   - URL: `https://tu-dominio.com/api/v1/payments/webhook`
   - Eventos: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`

2. **Obtener webhook secret**:
   - Copiar el secret del webhook
   - Añadir a `.env` como `STRIPE_WEBHOOK_SECRET`

### Verificación de Firma

```typescript
const sig = request.headers['stripe-signature'];
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const event = stripe.webhooks.constructEvent(
  request.body,
  sig,
  webhookSecret
);
```

### Eventos Procesados

#### 1. `checkout.session.completed`
Pago completado exitosamente.

**Acciones**:
- Actualizar orden a `PAID`
- Generar tickets
- Actualizar stock
- Publicar evento en RabbitMQ

#### 2. `checkout.session.expired`
Sesión de checkout expirada sin completar pago.

**Acciones**:
- Actualizar orden a `FAILED`
- Liberar stock reservado

#### 3. `payment_intent.payment_failed`
Intento de pago fallido.

**Acciones**:
- Actualizar orden a `FAILED`
- Notificar al usuario (TODO)

---

## 🐰 Integración con RabbitMQ

### Propósito

RabbitMQ se usa para comunicación asíncrona entre microservicios cuando ocurren eventos de pago.

### Exchange y Routing Keys

**Exchange**: `ticketing_events` (tipo: `topic`)

**Routing Keys**:
- `payment.completed`: Pago completado
- `payment.failed`: Pago fallido
- `payment.refunded`: Pago reembolsado (TODO)

### Publicación de Eventos

```typescript
await rabbitmqService.publishEvent('payment.completed', {
  orderId: 'uuid',
  userId: 'uuid',
  eventId: 'uuid',
  amount: 50.00,
  currency: 'eur',
  paymentIntent: 'pi_...',
  timestamp: new Date().toISOString()
});
```

### Consumidores

Los siguientes servicios pueden suscribirse a eventos de pago:

1. **Messaging Service**: Enviar emails de confirmación
2. **Analytics Service**: Registrar métricas de ventas
3. **Notification Service**: Enviar notificaciones push

---

## 📁 Archivos Modificados

### Backend

#### Controladores
1. **`/backend/admin/src/controllers/payment.controller.ts`**
   - ✅ Creado desde cero
   - Implementa toda la lógica de pagos
   - Maneja Stripe API y modo demo
   - Procesa webhooks

2. **`/backend/admin/src/controllers/order.controller.ts`**
   - ✅ Modificado
   - Añadido método `updateOrderStatus()`
   - Añadido método `processOrderPayment()`
   - Integración con generación de tickets

#### Rutas
3. **`/backend/admin/src/routes/payment.routes.ts`**
   - ✅ Creado desde cero
   - Define todos los endpoints de pago
   - Configura autenticación y schemas
   - Endpoint de webhook sin autenticación

#### Servicios
4. **`/backend/admin/src/services/rabbitmq.service.ts`**
   - ✅ Creado desde cero
   - Gestiona conexión a RabbitMQ
   - Publica eventos de pago
   - Permite suscripción a eventos

#### Configuración
5. **`/backend/admin/.env`**
   - ✅ Modificado
   - Añadidas variables de Stripe
   - Configuración de RabbitMQ
   - URL del frontend

### Frontend

#### Servicios
6. **`/frontend/ticketing-app/src/app/core/services/payment.service.ts`**
   - ✅ Creado desde cero
   - Métodos para crear checkout
   - Verificación de estado de pago

#### Componentes
7. **`/frontend/ticketing-app/src/app/pages/payment-checkout/payment-checkout.component.ts`**
   - ✅ Creado desde cero
   - Interfaz de checkout demo
   - Procesamiento de pagos
   - Detección de tipo de orden (Admin vs Festival)

---

## 🔐 Seguridad

### Mejores Prácticas Implementadas

1. **Autenticación JWT**: Todos los endpoints (excepto webhook) requieren token válido
2. **Verificación de propiedad**: Se valida que la orden pertenezca al usuario
3. **Verificación de firma**: Los webhooks verifican la firma de Stripe
4. **Transacciones**: Operaciones críticas usan transacciones de base de datos
5. **Validación de estado**: Se verifica que la orden esté en estado `PENDING` antes de procesar

### Consideraciones de Seguridad

⚠️ **Importante**:
- Las claves de Stripe deben mantenerse secretas
- El webhook secret debe ser único y seguro
- En producción, usar HTTPS para todos los endpoints
- No exponer claves en el código fuente
- Usar variables de entorno para configuración sensible

---

## 🧪 Testing

### Tarjetas de Prueba de Stripe

Para testing en modo Stripe real (no demo):

| Tarjeta | Resultado |
|---------|-----------|
| 4242 4242 4242 4242 | Pago exitoso |
| 4000 0000 0000 0002 | Tarjeta rechazada |
| 4000 0000 0000 9995 | Fondos insuficientes |

**Fecha**: Cualquier fecha futura (ej: 12/25)  
**CVC**: Cualquier 3 dígitos (ej: 123)

### Testing de Webhooks

Para probar webhooks localmente, usar Stripe CLI:

```bash
# Instalar Stripe CLI
stripe login

# Escuchar webhooks
stripe listen --forward-to localhost:3003/api/v1/payments/webhook

# Simular evento
stripe trigger checkout.session.completed
```

---

## 📊 Estados de Orden

| Estado | Descripción | Siguiente Estado |
|--------|-------------|------------------|
| `PENDING` | Orden creada, esperando pago | `PAID` o `FAILED` |
| `PAID` | Pago completado, tickets generados | `COMPLETED` |
| `COMPLETED` | Orden completada | - |
| `FAILED` | Pago fallido o expirado | - |
| `CANCELLED` | Orden cancelada por usuario | - |

---

## 🚀 Próximas Mejoras

### Funcionalidades Pendientes

1. **Reembolsos**
   - Endpoint para procesar reembolsos
   - Webhook para `charge.refunded`
   - Actualización de stock tras reembolso

2. **Métodos de Pago Adicionales**
   - PayPal
   - Bizum
   - Transferencia bancaria

3. **Estadísticas de Pagos**
   - Dashboard de ventas
   - Gráficos de ingresos
   - Reportes exportables

4. **Notificaciones**
   - Email de confirmación de pago
   - SMS con código de ticket
   - Notificaciones push

5. **Gestión de Errores**
   - Retry automático para webhooks fallidos
   - Logs detallados de errores
   - Alertas para administradores

---

## 📞 Soporte

Para más información sobre la integración de Stripe:
- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Webhooks de Stripe](https://stripe.com/docs/webhooks)

---

**Última actualización**: 11 de diciembre de 2025  
**Versión**: 1.0.0
