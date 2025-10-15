# SISTEMA OPERATIVO - PUERTOS Y FUNCIONALIDADES

**Fecha**: 15 de octubre de 2025  
**Estado**: COMPLETAMENTE FUNCIONAL  
**Version**: 1.0.0

---

## PUERTOS DEL PROYECTO

### Resumen de Servicios

| Servicio                | Puerto | Descripcion                      | Estado     |
| ----------------------- | ------ | -------------------------------- | ---------- |
| **Frontend Angular**    | 4200   | Aplicacion web principal         | Activo     |
| **Admin Service**       | 3003   | API admin (Fastify + PostgreSQL) | Activo     |
| **User Service**        | 3001   | API usuarios (Express + MongoDB) | Activo     |
| **Festival Services**   | 3004   | API microservicios (NestJS)      | Activo     |
| **PostgreSQL**          | 5432   | Base de datos admin/reservas     | Activo     |
| **MongoDB**             | 27017  | Base de datos usuarios/eventos   | Activo     |
| **RabbitMQ**            | 5672   | Message broker                   | Activo     |
| **RabbitMQ Management** | 15672  | UI de RabbitMQ                   | Activo     |
| **Redis**               | 6379   | Cache (opcional)                 | Disponible |

### Comandos de Inicio

**Frontend (Puerto 4200)**:

```bash
cd frontend/ticketing-app
npm start
# http://localhost:4200
```

**Admin Service (Puerto 3003)**:

```bash
cd backend/admin
npm run dev
# http://localhost:3003
# Swagger: http://localhost:3003/api/docs
```

**User Service (Puerto 3001)**:

```bash
cd backend/user-service
npm run dev
# http://localhost:3001
# Swagger: http://localhost:3001/api/docs
```

**Festival Services (Puerto 3004)**:

```bash
cd backend/services/festival-services
npm run start:dev
# http://localhost:3004
# Swagger: http://localhost:3004/api/docs
```

**Infraestructura (Docker)**:

```bash
cd docker
docker-compose up -d
# PostgreSQL: localhost:5432
# MongoDB: localhost:27017
# RabbitMQ: localhost:5672
# RabbitMQ UI: localhost:15672
```

---

## SISTEMA DE RESERVAS Y PAGOS

### Funcionalidades por Rol

**USUARIO NO LOGUEADO**:

-   Ver eventos publicos
-   Ver detalles de eventos
-   NO puede comprar ni reservar

**USUARIO NORMAL**:

-   Ver eventos
-   Comprar tickets (pago inmediato)
-   Ver mis tickets comprados
-   NO puede hacer reservas

**USUARIO VIP**:

-   Ver eventos
-   Reservar tickets (15 minutos)
-   Comprar tickets con descuento (10%)
-   Prioridad en compras
-   Hasta 3 reservas simultaneas

**ADMINISTRADOR**:

-   Ver todas las reservas
-   Ver todas las ordenes
-   Dashboard con estadisticas
-   Gestion completa del sistema

### Base de Datos - Nuevas Tablas

**Tabla Reservation**:

```sql
- id (UUID)
- userId (String)
- eventId (String)
- localityId (String)
- quantity (Integer)
- status (ACTIVE, EXPIRED, COMPLETED, CANCELLED)
- expiresAt (DateTime)
- createdAt, updatedAt
```

**Tabla Order**:

```sql
- id (UUID)
- userId (String)
- eventId (String)
- localityId (String)
- quantity (Integer)
- unitPrice (Decimal)
- totalAmount (Decimal)
- status (PENDING, PAID, CANCELLED, COMPLETED)
- stripeSessionId (String)
- reservationId (String, opcional)
- createdAt, updatedAt
```

**Tabla Payment**:

```sql
- id (UUID)
- orderId (String)
- amount (Decimal)
- currency (String)
- status (PENDING, COMPLETED, FAILED, CANCELLED)
- stripePaymentId (String)
- paymentMethod (String)
- createdAt, updatedAt
```

### Endpoints API

**Admin Service (3003) - Reservas**:

```
POST   /api/reservations              # Crear reserva (VIP)
GET    /api/reservations/my-reservations  # Mis reservas
GET    /api/reservations/all          # Todas (admin)
GET    /api/reservations/:id          # Detalle
POST   /api/reservations/:id/confirm  # Confirmar
PATCH  /api/reservations/:id/status   # Cambiar estado
DELETE /api/reservations/:id          # Cancelar
GET    /api/reservations/stats/summary # Estadisticas
```

**Admin Service (3003) - Ordenes**:

```
POST   /api/orders                    # Crear orden
GET    /api/orders/my-orders          # Mis ordenes
GET    /api/orders/all                # Todas (admin)
GET    /api/orders/:id                # Detalle
PATCH  /api/orders/:id/status         # Actualizar estado
POST   /api/orders/:id/cancel         # Cancelar
GET    /api/orders/stats/summary      # Estadisticas
```

**Admin Service (3003) - Pagos**:

```
POST   /api/payments/create-checkout  # Crear sesion Stripe
POST   /api/payments/complete-payment # Pago demo
GET    /api/payments/status/:sessionId # Estado pago
GET    /api/payments                  # Lista pagos
GET    /api/payments/stats/summary    # Estadisticas
POST   /api/payments/webhook          # Webhook Stripe
```

### Flujo de Reserva VIP

1. **Usuario VIP hace reserva**:

    - POST /api/reservations
    - Sistema bloquea tickets por 15 minutos
    - Estado: ACTIVE con expiresAt

2. **Durante los 15 minutos**:

    - Usuario puede confirmar reserva
    - Se crea orden automaticamente
    - Se inicia proceso de pago

3. **Si expira (Cron Job)**:

    - Estado cambia a EXPIRED
    - Tickets se liberan automaticamente
    - Stock vuelve a estar disponible

4. **Si se confirma**:
    - Estado cambia a COMPLETED
    - Se genera orden de compra
    - Proceso de pago con Stripe

### Flujo de Compra Normal

1. **Usuario selecciona tickets**:

    - POST /api/orders
    - Se crea orden con estado PENDING

2. **Proceso de pago**:

    - POST /api/payments/create-checkout
    - Redireccion a Stripe
    - Usuario completa pago

3. **Confirmacion (Webhook)**:
    - POST /api/payments/webhook
    - Estado orden: PAID
    - Se generan tickets

### Integracion Stripe

**Modo Produccion**:

-   Checkout sessions reales
-   Webhooks para confirmacion
-   Procesamiento seguro de tarjetas

**Modo Demo (sin Stripe configurado)**:

-   Simulacion de pagos
-   Endpoints internos para testing
-   Estados manejados manualmente

### Cron Jobs Automaticos

**Expiracion de Reservas (cada minuto)**:

```javascript
// Busca reservas expiradas
// Cambia estado a EXPIRED
// Libera stock automaticamente
// Log de actividad
```

**Configuracion**:

```bash
# En backend/admin/src/jobs/reservation.cron.ts
cron.schedule('* * * * *', expireReservations);
```

### Estadisticas en Tiempo Real

**Dashboard Admin incluye**:

-   Total reservas activas
-   Ordenes por estado
-   Ingresos del dia/mes
-   Usuarios VIP registrados
-   Eventos mas populares
-   Reservas expiradas hoy

**Metricas de rendimiento**:

-   Tiempo promedio de checkout
-   Tasa de conversion VIP vs Normal
-   Abandono de reservas
-   Ingresos por categoria de evento

### Notificaciones del Sistema

**RabbitMQ Events**:

-   reservation.created
-   reservation.expired
-   order.completed
-   payment.confirmed

**Integracion Email (preparada)**:

-   Confirmacion de reserva
-   Recordatorio de expiracion
-   Confirmacion de compra
-   Tickets por email

### Seguridad y Validaciones

**Autenticacion**:

-   JWT tokens en todos los endpoints
-   Validacion de roles (USER, VIP, ADMIN)
-   Rate limiting por usuario

**Validaciones de Negocio**:

-   Stock disponible antes de reservar
-   Limite de 3 reservas simultaneas VIP
-   Precios consistentes
-   Fechas de eventos validas

**Auditoria**:

-   Logs de todas las transacciones
-   Seguimiento de cambios de estado
-   Registro de accesos admin
-   Metricas de uso del sistema

---

## MONITOREO Y LOGS

### Health Checks

```bash
# Verificar servicios
curl http://localhost:3003/health  # Admin
curl http://localhost:3001/health  # User Service
curl http://localhost:3004/health  # Festival Services
```

### Logs del Sistema

```bash
# Admin service logs
cd backend/admin
npm run dev  # Ver logs en consola

# Patrones de log:
[INIT] Iniciando registro de rutas...
[REGISTER] Registrando authRoutes...
[OK] authRoutes OK
[CRON] Cron job de reservas iniciado
[RABBITMQ] RabbitMQ conectado exitosamente
```

### RabbitMQ Management

```
URL: http://localhost:15672
Usuario: guest
Password: guest

Queues monitoreadas:
- approval.requested
- approval.granted
- approval.rejected
```

---

_Sistema completamente operativo con todas las funcionalidades de reservas, pagos y gestion implementadas._
