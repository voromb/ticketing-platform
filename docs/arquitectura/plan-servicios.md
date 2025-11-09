# 📋 PLAN COMPLETO - Sistema de Servicios Festival

## 📑 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Sistema de Usuarios](#sistema-de-usuarios)
5. [Sistema de Login](#sistema-de-login)
6. [Microservicio de Notificaciones](#microservicio-de-notificaciones)
7. [Paneles de Servicios](#paneles-de-servicios)
8. [Documentación Swagger](#documentación-swagger)
9. [Orden de Implementación](#orden-de-implementación)
10. [Checklist Completo](#checklist-completo)

---

## 🎯 RESUMEN EJECUTIVO

### Objetivo

Implementar un sistema completo de gestión de servicios para festivales:

1. **Panel de Restaurantes** (🟢 Verde)
2. **Panel de Viajes** (🔵 Azul)  
3. **Panel de Merchandising** (🟣 Morado)
4. **Microservicio de Notificaciones** (📬 Tiempo real)
5. **Sistema de Login Unificado** (🔐 Redirección automática)
6. **Sistema de Promoción de Usuarios** (⭐ VIP y 🏢 COMPANY_ADMIN)

### Estado Actual

```
✅ Schemas MongoDB: Todos los campos implementados
✅ RabbitMQ: Configurado y funcionando
✅ PostgreSQL: Tablas Companies y CompanyAdmin creadas
✅ JWT: Implementado
✅ Panel Admin: Funcional
✅ Panel User: Funcional
✅ Panel Restaurantes: Backend + Frontend COMPLETADO 🟢
  ├── Dashboard con 6 cards de estadísticas ✅
  ├── Lista CRUD con paginación inteligente ✅
  ├── Componente de Reservas (estructura lista) ✅
  └── Rutas configuradas ✅
✅ Panel Viajes: Backend + Frontend COMPLETADO 🔵
✅ Panel Merchandising: Backend + Frontend COMPLETADO 🟣
```

### Progreso General

**🎉 3 de 3 Paneles Completados (100%)**

| Panel | Backend | Frontend | Estado |
|-------|---------|----------|--------|
| 🟢 Restaurantes | ✅ | ✅ | **COMPLETADO** |
| 🔵 Viajes | ✅ | ✅ | **COMPLETADO** |
| 🟣 Merchandising | ✅ | ✅ | **COMPLETADO** |

---

## 📊 ANÁLISIS DE CAMPOS EN MONGODB

### **1. RESTAURANTES (Restaurant Schema)** ✅

**26 campos ya implementados:**
- Campos de compañía: `companyId`, `companyName`, `region`, `managedBy`
- Aprobaciones: `approvalStatus`, `lastModifiedBy`, `lastApprovedBy`, `lastApprovedAt`
- Datos: `festivalId`, `name`, `description`, `cuisine`, `location`, `capacity`
- Operación: `currentOccupancy`, `schedule[]`, `menu[]`, `acceptsReservations`
- Estado: `status`, `isActive`, `rating`, `totalReviews`

**✅ TODOS LOS CAMPOS NECESARIOS YA ESTÁN IMPLEMENTADOS**

### **2. VIAJES (Trip Schema)** ✅

**23 campos ya implementados:**
- Campos de compañía: `companyId`, `companyName`, `region`, `managedBy`
- Vehículo: `vehicleType`, `vehicleCapacity`, `vehiclePlate`, `driverInfo`
- Aprobaciones: `approvalStatus`, `lastModifiedBy`, `lastApprovedBy`, `lastApprovedAt`
- Datos: `festivalId`, `name`, `description`, `departure`, `arrival`
- Operación: `capacity`, `price`, `bookedSeats`, `status`, `isActive`

**✅ TODOS LOS CAMPOS NECESARIOS YA ESTÁN IMPLEMENTADOS**

### **3. MERCHANDISING (Product Schema)** ✅

**28 campos ya implementados:**
- Campos de compañía: `companyId`, `companyName`, `region`, `managedBy`
- Proveedor: `supplier`, `costPrice`, `margin`, `shippingInfo`
- Aprobaciones: `approvalStatus`, `lastModifiedBy`, `lastApprovedBy`, `lastApprovedAt`
- Datos: `festivalId`, `bandId`, `bandName`, `name`, `description`, `type`
- Inventario: `price`, `sizes[]`, `stock`, `images[]`, `soldUnits`
- Estado: `exclusive`, `preOrderEnabled`, `releaseDate`, `status`, `isActive`

**✅ TODOS LOS CAMPOS NECESARIOS YA ESTÁN IMPLEMENTADOS**

---

## 🎨 DISEÑO DE PANELES

### **Características Comunes**

#### Layout Principal (inspirado en admin-layout)
- Sidebar con color temático
- Dashboard con 6 cards de estadísticas
- Tabla CRUD con filtros
- Modales para acciones
- Tema oscuro (bg-slate-900)

#### Sistema de Colores

**Restaurantes (🟢 Verde):**
- Primario: `#10b981` (green-500)
- Hover: `#047857` (green-700)
- Badges: `bg-green-100 text-green-800`

**Viajes (🔵 Azul):**
- Primario: `#3b82f6` (blue-500)
- Hover: `#1d4ed8` (blue-700)
- Badges: `bg-blue-100 text-blue-800`

**Merchandising (🟣 Morado):**
- Primario: `#a855f7` (purple-500)
- Hover: `#7e22ce` (purple-700)
- Badges: `bg-purple-100 text-purple-800`

---

## 🏗️ ESTRUCTURA DE ARCHIVOS

### Frontend Angular
```
frontend/ticketing-app/src/app/pages/
├── restaurant-admin/
│   ├── restaurant-layout/
│   ├── restaurant-dashboard/
│   ├── restaurant-list/
│   └── restaurant-stats/
├── travel-admin/
│   ├── travel-layout/
│   ├── travel-dashboard/
│   ├── travel-list/
│   └── travel-stats/
└── merchandising-admin/
    ├── merchandising-layout/
    ├── merchandising-dashboard/
    ├── merchandising-list/
    └── merchandising-stats/
```

### Servicios
```
frontend/ticketing-app/src/app/core/services/
├── restaurant.service.ts
├── travel.service.ts
└── merchandising.service.ts
```

### Guards
```
frontend/ticketing-app/src/app/core/guards/
├── restaurant-admin.guard.ts
├── travel-admin.guard.ts
└── merchandising-admin.guard.ts
```

---

## 🔐 FLUJO DE APROBACIONES (11 PASOS)

```
1. SUPER_ADMIN crea Company en PostgreSQL
   ↓
2. SUPER_ADMIN crea COMPANY_ADMIN y lo asigna a Company
   ↓
3. COMPANY_ADMIN hace login en Festival Services
   ↓
4. COMPANY_ADMIN crea/edita Restaurante/Viaje/Producto
   - El recurso se marca como "PENDING_APPROVAL"
   ↓
5. Sistema envía evento RabbitMQ → Approval Service
   - Tipo: approval.requested
   - Datos: {service, entityId, entityType, requestedBy, metadata}
   ↓
6. Approval Service crea registro en PostgreSQL
   - Status: PENDING
   - Priority: HIGH/MEDIUM/LOW
   ↓
7. SUPER_ADMIN ve solicitud en Swagger /api/approval
   - Lista todas las aprobaciones pendientes
   - Ve detalles del cambio solicitado
   ↓
8. SUPER_ADMIN aprueba/rechaza
   - PATCH /api/approval/:id/decision
   - Body: {decision: "APPROVED" | "REJECTED", reason?: string}
   ↓
9. Approval Service publica evento RabbitMQ
   - approval.granted o approval.rejected
   ↓
10. Festival Service recibe evento y actualiza recurso
    - approvalStatus: "APPROVED" o "REJECTED"
    - lastApprovedBy: email del SUPER_ADMIN
    - lastApprovedAt: timestamp
    ↓
11. COMPANY_ADMIN recibe notificación del resultado
    - Email o notificación en sistema
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Backend - Restaurantes** 🟢

#### Servicio y Controller
- [x] `restaurant.service.ts` con métodos CRUD ✅
  - [x] `createRestaurant()` - Marca como PENDING ✅
  - [x] `updateRestaurant()` - Actualizar ✅
  - [x] `deleteRestaurant()` - Eliminar ✅
  - [x] `getRestaurants()` - Filtro por companyId ✅
  - [x] `getRestaurantById()` ✅
  - [x] `getRestaurantStats()` ✅
  - [x] `updateMenu()` ✅
  - [x] `updateOccupancy()` ✅

- [x] `restaurant.controller.ts` con endpoints ✅
  - [x] POST `/api/restaurant` ✅
  - [x] GET `/api/restaurant` ✅
  - [x] GET `/api/restaurant/:id` ✅
  - [x] PATCH `/api/restaurant/:id` ✅
  - [x] DELETE `/api/restaurant/:id` ✅
  - [x] GET `/api/restaurant/stats` ✅
  - [x] PATCH `/api/restaurant/:id/menu` ✅
  - [x] PATCH `/api/restaurant/:id/occupancy` ✅

#### RabbitMQ
- [x] Publicar evento `approval.requested` al crear ✅
- [x] Escuchar evento `approval.granted` ✅
- [x] Escuchar evento `approval.rejected` ✅

#### Frontend - Servicios Angular
- [x] **Frontend - RestaurantService** ✅
- [x] **Frontend - RestaurantLayoutComponent** ✅
- [x] **Frontend - RestaurantDashboardComponent** (6 cards estadísticas) ✅
- [x] **Frontend - RestaurantListComponent** (Tabla CRUD) ✅
- [x] **Rutas configuradas** (/restaurant-admin/dashboard, /restaurant-admin/list) ✅

---

### **Fase 2: Backend - Viajes** 🔵

#### Servicio y Controller
- [x] `travel.service.ts` con métodos CRUD ✅
  - [x] `createTrip()` - Marca como PENDING ✅
  - [x] `updateTrip()` - Actualizar ✅
  - [x] `deleteTrip()` - Eliminar ✅
  - [x] `getTrips()` - Filtro por companyId ✅
  - [x] `getTripById()` ✅
  - [x] `getTripStats()` ✅
  - [x] `updateBookedSeats()` ✅
  - [x] `updateStatus()` ✅

- [x] `travel.controller.ts` con endpoints ✅
  - [x] POST `/api/travel` ✅
  - [x] GET `/api/travel` ✅
  - [x] GET `/api/travel/:id` ✅
  - [x] PATCH `/api/travel/:id` ✅
  - [x] DELETE `/api/travel/:id` ✅
  - [x] GET `/api/travel/stats` ✅
  - [x] PATCH `/api/travel/:id/seats` ✅
  - [x] PATCH `/api/travel/:id/status` ✅

#### RabbitMQ
- [x] Publicar evento `approval.requested` al crear ✅
- [x] Escuchar evento `approval.granted` ✅
- [x] Escuchar evento `approval.rejected` ✅

#### Frontend - Servicios Angular
- [x] **Frontend - TravelService** ✅
- [x] **Frontend - TravelLayoutComponent** (tema azul) ✅
- [x] **Frontend - TravelDashboardComponent** (6 cards estadísticas) ✅
- [x] **Frontend - TravelListComponent** (Tabla CRUD) ✅
- [x] **Rutas configuradas** (/travel-admin/dashboard, /travel-admin/list) ✅

---

### **Fase 3: Backend - Merchandising** 🟣

#### Servicio y Controller
- [x] `merchandising.service.ts` con métodos CRUD ✅
  - [x] `createProduct()` - Marca como PENDING ✅
  - [x] `updateProduct()` - Actualizar ✅
  - [x] `deleteProduct()` - Eliminar ✅
  - [x] `getProducts()` - Filtro por companyId ✅
  - [x] `getProductById()` ✅
  - [x] `getProductStats()` ✅
  - [x] `updateStock()` - reserveStock/confirmPurchase/releaseStock ✅
  - [x] `updatePrice()` - update method ✅

- [x] `merchandising.controller.ts` con endpoints ✅
  - [x] POST `/api/merchandising` ✅
  - [x] GET `/api/merchandising` ✅
  - [x] GET `/api/merchandising/:id` ✅
  - [x] PATCH `/api/merchandising/:id` ✅
  - [x] DELETE `/api/merchandising/:id` ✅
  - [x] GET `/api/merchandising/stats` (orders) ✅
  - [x] POST `/api/merchandising/:id/reserve` ✅
  - [x] POST `/api/merchandising/:id/confirm` ✅
  - [x] POST `/api/merchandising/:id/release` ✅

#### RabbitMQ
- [x] Publicar evento `approval.requested` al crear ✅
- [x] Escuchar evento `approval.granted` ✅
- [x] Escuchar evento `approval.rejected` ✅

#### Frontend - Servicios Angular
- [x] **Frontend - MerchandisingService** ✅
- [x] **Frontend - MerchandisingLayoutComponent** (tema morado) ✅
- [x] **Frontend - MerchandisingDashboardComponent** (6 cards estadísticas) ✅
- [x] **Frontend - MerchandisingListComponent** (Tabla CRUD) ✅
- [x] **Rutas configuradas** (/merchandising-admin/dashboard, /merchandising-admin/list) ✅

---

### **Fase 4: Frontend - Servicios Angular** 🎨

#### Restaurant Service
- [ ] `getRestaurants(companyId?: string)`
- [ ] `getRestaurantById(id: string)`
- [ ] `createRestaurant(data: any)`
- [ ] `updateRestaurant(id: string, data: any)`
- [ ] `deleteRestaurant(id: string)`
- [ ] `getRestaurantStats()`
- [ ] `updateMenu(id: string, menu: any)`
- [ ] `updateOccupancy(id: string, occupancy: number)`

#### Travel Service
- [ ] `getTrips(companyId?: string)`
- [ ] `getTripById(id: string)`
- [ ] `createTrip(data: any)`
- [ ] `updateTrip(id: string, data: any)`
- [ ] `deleteTrip(id: string)`
- [ ] `getTripStats()`
- [ ] `updateBookedSeats(id: string, seats: number)`
- [ ] `updateStatus(id: string, status: string)`

#### Merchandising Service
- [ ] `getProducts(companyId?: string)`
- [ ] `getProductById(id: string)`
- [ ] `createProduct(data: any)`
- [ ] `updateProduct(id: string, data: any)`
- [ ] `deleteProduct(id: string)`
- [ ] `getProductStats()`
- [ ] `updateStock(id: string, stock: any)`
- [ ] `updatePrice(id: string, price: number)`

---

### **Fase 5: Frontend - Panel Restaurantes** 🟢

#### Layout
- [ ] `restaurant-layout.component.ts`
  - [ ] Sidebar verde con navegación
  - [ ] Logo de restaurantes
  - [ ] Menú: Dashboard, Gestión, Estadísticas
  - [ ] Responsive
  - [ ] Tema oscuro

#### Dashboard
- [ ] `restaurant-dashboard.component.ts`
  - [ ] 6 cards de estadísticas
  - [ ] 4 acciones rápidas
  - [ ] 2 listas recientes
  - [ ] Integración con service
  - [ ] ChangeDetectorRef

#### Lista CRUD
- [ ] `restaurant-list.component.ts`
  - [ ] Tabla con columnas
  - [ ] Filtros (búsqueda, estado, aprobación)
  - [ ] Modal de creación/edición
  - [ ] Modal de confirmación
  - [ ] Modal de detalles
  - [ ] Paginación
  - [ ] Loading states

#### Estadísticas
- [ ] `restaurant-stats.component.ts`
  - [ ] Gráficos
  - [ ] Filtros por fecha
  - [ ] Exportar reportes

---

### **Fase 6: Frontend - Panel Viajes** 🔵

#### Layout
- [ ] `travel-layout.component.ts`
  - [ ] Sidebar azul con navegación
  - [ ] Logo de viajes
  - [ ] Menú: Dashboard, Gestión, Estadísticas
  - [ ] Responsive
  - [ ] Tema oscuro

#### Dashboard
- [ ] `travel-dashboard.component.ts`
  - [ ] 6 cards de estadísticas
  - [ ] 4 acciones rápidas
  - [ ] 2 listas recientes
  - [ ] Integración con service
  - [ ] ChangeDetectorRef

#### Lista CRUD
- [ ] `travel-list.component.ts`
  - [ ] Tabla con columnas
  - [ ] Filtros (búsqueda, estado, aprobación)
  - [ ] Modal de creación/edición
  - [ ] Modal de confirmación
  - [ ] Modal de detalles
  - [ ] Paginación
  - [ ] Loading states

#### Estadísticas
- [ ] `travel-stats.component.ts`
  - [ ] Gráficos
  - [ ] Filtros por fecha
  - [ ] Exportar reportes

---

### **Fase 7: Frontend - Panel Merchandising** 🟣

#### Layout
- [ ] `merchandising-layout.component.ts`
  - [ ] Sidebar morado con navegación
  - [ ] Logo de merchandising
  - [ ] Menú: Dashboard, Gestión, Estadísticas
  - [ ] Responsive
  - [ ] Tema oscuro

#### Dashboard
- [ ] `merchandising-dashboard.component.ts`
  - [ ] 6 cards de estadísticas
  - [ ] 4 acciones rápidas
  - [ ] 2 listas recientes
  - [ ] Integración con service
  - [ ] ChangeDetectorRef

#### Lista CRUD
- [ ] `merchandising-list.component.ts`
  - [ ] Tabla con columnas
  - [ ] Filtros (búsqueda, tipo, estado, aprobación)
  - [ ] Modal de creación/edición
  - [ ] Modal de confirmación
  - [ ] Modal de detalles
  - [ ] Paginación
  - [ ] Loading states

#### Estadísticas
- [ ] `merchandising-stats.component.ts`
  - [ ] Gráficos
  - [ ] Filtros por fecha
  - [ ] Exportar reportes

---

### **Fase 8: Guards y Rutas** 🔐

#### Guards
- [ ] `restaurant-admin.guard.ts`
  - [ ] Verificar autenticación
  - [ ] Verificar rol COMPANY_ADMIN
  - [ ] Verificar companyType === RESTAURANT

- [ ] `travel-admin.guard.ts`
  - [ ] Verificar autenticación
  - [ ] Verificar rol COMPANY_ADMIN
  - [ ] Verificar companyType === TRAVEL

- [ ] `merchandising-admin.guard.ts`
  - [ ] Verificar autenticación
  - [ ] Verificar rol COMPANY_ADMIN
  - [ ] Verificar companyType === MERCHANDISING

#### Rutas (app.routes.ts)
- [ ] `/restaurant-admin` → RestaurantLayoutComponent
  - [ ] `/restaurant-admin/dashboard`
  - [ ] `/restaurant-admin/list`
  - [ ] `/restaurant-admin/stats`

- [ ] `/travel-admin` → TravelLayoutComponent
  - [ ] `/travel-admin/dashboard`
  - [ ] `/travel-admin/list`
  - [ ] `/travel-admin/stats`

- [ ] `/merchandising-admin` → MerchandisingLayoutComponent
  - [ ] `/merchandising-admin/dashboard`
  - [ ] `/merchandising-admin/list`
  - [ ] `/merchandising-admin/stats`

---

### **Fase 9: Testing** 🧪

#### Backend
- [ ] Probar creación de restaurante (marca PENDING)
- [ ] Probar creación de viaje (marca PENDING)
- [ ] Probar creación de producto (marca PENDING)
- [ ] Verificar eventos RabbitMQ
- [ ] Probar aprobación por SUPER_ADMIN
- [ ] Verificar actualización de estado

#### Frontend
- [ ] Probar login de COMPANY_ADMIN
- [ ] Probar navegación entre paneles
- [ ] Probar CRUD de cada servicio
- [ ] Verificar filtros y búsqueda
- [ ] Probar modales
- [ ] Verificar responsive design

---

### **Fase 10: Documentación** 📚

- [ ] Documentar endpoints de cada servicio
- [ ] Crear guía de usuario para COMPANY_ADMIN
- [ ] Documentar flujo de aprobaciones
- [ ] Actualizar README con nuevos paneles
- [ ] Documentar variables de entorno

---

## 📝 NOTAS IMPORTANTES

### **Integración con Sistema Existente**
- ✅ Schemas de MongoDB ya tienen todos los campos necesarios
- ✅ Sistema de aprobaciones (Approval Service) ya existe
- ✅ RabbitMQ ya está configurado
- ✅ PostgreSQL (admin) y MongoDB (festival-services) operativos
- ✅ JWT ya implementado en festival-services

### **Arquitectura Actual**
```
Backend Admin (Fastify + PostgreSQL) - Puerto 3003
├── Gestiona: Companies, CompanyAdmins, Approvals
└── Usuarios: SUPER_ADMIN

Festival Services (NestJS + MongoDB) - Puerto 3004
├── Gestiona: Restaurants, Trips, Products
├── Usuarios: COMPANY_ADMIN
└── RabbitMQ: Eventos de aprobación
```

### **Cambios Mínimos Necesarios**
1. Crear controllers y services para CRUD
2. Integrar con RabbitMQ (publicar/escuchar eventos)
3. Crear componentes Angular para cada panel
4. Crear servicios Angular para comunicación
5. Crear guards para proteger rutas

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Backend Restaurantes** (más simple, tiene menos campos)
2. **Frontend Restaurantes** (validar diseño y flujo)
3. **Backend Viajes** (similar a restaurantes)
4. **Frontend Viajes** (reutilizar componentes)
5. **Backend Merchandising** (más complejo, tiene stock)
6. **Frontend Merchandising** (reutilizar componentes)
7. **Testing completo** (todos los servicios)
8. **Documentación** (guías y README)

---

## 📊 DATOS DE EJEMPLO ACTUALES

```
MongoDB (festival_services):
├─ 838 restaurantes (ya creados con seed)
├─ 838 viajes (ya creados con seed)
├─ 2,515 productos (ya creados con seed)
├─ 0 reservas viajes
├─ 0 reservas restaurantes
└─ 0 órdenes merchandising

PostgreSQL (ticketing):
├─ 0 compañías (pendiente crear)
└─ 0 company admins (pendiente crear)
```

---

---

## 📬 MICROSERVICIO DE NOTIFICACIONES

### **🎯 Objetivo del Microservicio**

Crear un **sistema de notificaciones centralizado** que gestione:
1. **Notificaciones en tiempo real** (tipo mensajería privada de foros antiguos)
2. **Sistema de mensajes internos** entre SUPER_ADMIN ↔ COMPANY_ADMIN ↔ USERS
3. **Notificaciones de aprobaciones** (restaurantes, viajes, merchandising)
4. **Notificaciones para usuarios finales** (VIP, compras, eventos)
5. **Historial de mensajes** (bandeja de entrada/salida)

### **🏗️ Arquitectura del Microservicio**

```
Notification Service (NestJS + MongoDB + RabbitMQ + Socket.IO)
├── Puerto: 3005
├── Base de datos: MongoDB (notification_db)
├── Mensajería: RabbitMQ (escucha eventos)
└── WebSocket: Socket.IO (notificaciones en tiempo real)
```

### **📊 Modelo de Base de Datos (MongoDB)**

#### **Colección: notifications**

```typescript
{
  _id: ObjectId,
  
  // Destinatario
  recipientId: string,           // ID del usuario/company_admin
  recipientType: string,          // 'USER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN'
  recipientEmail: string,         // Email del destinatario
  
  // Remitente
  senderId: string,               // ID del remitente (puede ser 'SYSTEM')
  senderType: string,             // 'USER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN' | 'SYSTEM'
  senderEmail: string,            // Email del remitente
  senderName: string,             // Nombre del remitente
  
  // Contenido
  type: string,                   // Tipo de notificación
  title: string,                  // Título corto
  message: string,                // Mensaje completo
  priority: string,               // URGENT | HIGH | MEDIUM | LOW
  
  // Metadata
  metadata: {
    service?: string,             // RESTAURANT | TRAVEL | MERCHANDISING
    entityId?: string,            // ID del recurso relacionado
    entityType?: string,          // Restaurant | Trip | Product
    entityName?: string,          // Nombre del recurso
    approvalId?: string,          // ID de la aprobación
    actionUrl?: string,           // URL para acción rápida
    actionLabel?: string,         // Texto del botón de acción
  },
  
  // Estado
  isRead: boolean,                // Si fue leída
  readAt: Date,                   // Cuándo se leyó
  isArchived: boolean,            // Si está archivada
  archivedAt: Date,               // Cuándo se archivó
  
  // Respuesta (para mensajes directos)
  replyToId: string,              // ID del mensaje al que responde
  hasReplies: boolean,            // Si tiene respuestas
  repliesCount: number,           // Número de respuestas
  
  // Auditoría
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date,                // Fecha de expiración (opcional)
}
```

#### **Tipos de Notificaciones**

```typescript
enum NotificationType {
  // Aprobaciones
  APPROVAL_REQUESTED = 'APPROVAL_REQUESTED',    // Nueva solicitud
  APPROVAL_GRANTED = 'APPROVAL_GRANTED',        // Aprobada
  APPROVAL_REJECTED = 'APPROVAL_REJECTED',      // Rechazada
  
  // Mensajes directos
  DIRECT_MESSAGE = 'DIRECT_MESSAGE',            // Mensaje privado
  
  // Sistema
  SYSTEM_ALERT = 'SYSTEM_ALERT',                // Alerta del sistema
  
  // Usuarios
  VIP_PROMOTION = 'VIP_PROMOTION',              // Promoción a VIP
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',          // Orden confirmada
  ORDER_SHIPPED = 'ORDER_SHIPPED',              // Orden enviada
  RESERVATION_CONFIRMED = 'RESERVATION_CONFIRMED', // Reserva confirmada
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',      // Viaje confirmado
  EVENT_REMINDER = 'EVENT_REMINDER',            // Recordatorio de evento
  
  // Compañías
  COMPANY_CREATED = 'COMPANY_CREATED',          // Compañía creada
  COMPANY_ADMIN_ASSIGNED = 'COMPANY_ADMIN_ASSIGNED', // Admin asignado
}
```

#### **Prioridades**

```typescript
enum NotificationPriority {
  URGENT = 'URGENT',      // Rojo - Requiere acción inmediata
  HIGH = 'HIGH',          // Naranja - Importante
  MEDIUM = 'MEDIUM',      // Amarillo - Normal
  LOW = 'LOW',            // Gris - Informativo
}
```

### **🔄 Flujo Completo de Notificaciones**

#### **Ejemplo 1: Aprobación de Restaurante**

```
1. COMPANY_ADMIN crea restaurante en Festival Service
   ↓
2. Festival Service marca como PENDING_APPROVAL
   ↓
3. Festival Service publica evento RabbitMQ:
   Queue: 'approval.requested'
   Payload: {
     service: 'RESTAURANT',
     entityId: 'uuid-restaurante',
     entityName: 'Restaurante La Roca',
     requestedBy: 'admin.spain.restaurants@festival.com',
     companyId: 'uuid-company',
     companyName: 'España Restaurantes'
   }
   ↓
4. Notification Service escucha evento y crea 2 notificaciones:
   
   A) Para SUPER_ADMIN:
      - Type: APPROVAL_REQUESTED
      - Title: "Nueva solicitud de aprobación"
      - Message: "España Restaurantes solicita aprobar: Restaurante La Roca"
      - Priority: HIGH
      - ActionUrl: "/admin-dashboard/approvals"
      - ActionLabel: "Revisar solicitud"
   
   B) Para COMPANY_ADMIN (confirmación):
      - Type: SYSTEM_ALERT
      - Title: "Solicitud enviada"
      - Message: "Tu solicitud para Restaurante La Roca está pendiente"
      - Priority: MEDIUM
   ↓
5. Notification Service envía en tiempo real vía Socket.IO
   - Emite evento 'new-notification' a sala del SUPER_ADMIN
   - Frontend muestra badge rojo con contador
   - Suena notificación (si está habilitado)
   ↓
6. SUPER_ADMIN ve notificación en panel
   - Click en notificación → marca como leída
   - Click en "Revisar solicitud" → va a aprobaciones
   ↓
7. SUPER_ADMIN aprueba en Approval Service
   ↓
8. Approval Service publica evento RabbitMQ:
   Queue: 'approval.granted'
   Payload: {
     service: 'RESTAURANT',
     entityId: 'uuid-restaurante',
     entityName: 'Restaurante La Roca',
     decision: 'APPROVED',
     decidedBy: 'voro.super@ticketing.com',
     reason: 'Cumple todos los requisitos'
   }
   ↓
9. Notification Service escucha evento y crea notificación:
   Para COMPANY_ADMIN:
   - Type: APPROVAL_GRANTED
   - Title: "✅ Solicitud aprobada"
   - Message: "Tu restaurante La Roca ha sido aprobado"
   - Priority: HIGH
   - ActionUrl: "/restaurant-admin/list"
   ↓
10. COMPANY_ADMIN recibe notificación instantánea
    - Badge rojo con contador actualizado
    - Puede ir directamente a ver su restaurante
```

#### **Ejemplo 2: Mensaje Directo SUPER_ADMIN → COMPANY_ADMIN**

```
1. SUPER_ADMIN abre panel de mensajes
   ↓
2. SUPER_ADMIN selecciona destinatario (COMPANY_ADMIN)
   ↓
3. SUPER_ADMIN escribe mensaje:
   - Asunto: "Actualización de menú requerida"
   - Mensaje: "Por favor actualiza el menú del Restaurante La Roca..."
   - Prioridad: HIGH
   ↓
4. Frontend envía POST /api/notifications/send-message
   ↓
5. Notification Service crea notificación:
   - Type: DIRECT_MESSAGE
   - RecipientId: company-admin-id
   - SenderId: super-admin-id
   - Title: "Actualización de menú requerida"
   - Message: "Por favor actualiza el menú..."
   - Priority: HIGH
   ↓
6. Notification Service envía en tiempo real vía Socket.IO
   ↓
7. COMPANY_ADMIN recibe notificación instantánea
   - Badge rojo con contador
   - Puede responder directamente
   ↓
8. COMPANY_ADMIN responde:
   - Click en "Responder"
   - Escribe respuesta
   - Se crea nueva notificación con replyToId
   ↓
9. SUPER_ADMIN recibe respuesta en tiempo real
   - Ve conversación completa (hilo de mensajes)
```

### **🔌 Endpoints del Microservicio**

#### **Notificaciones**

```typescript
// Obtener notificaciones del usuario actual
GET /api/notifications
Query: {
  type?: string,           // Filtro por tipo
  priority?: string,       // Filtro por prioridad
  isRead?: boolean,        // Filtro por leídas/no leídas
  isArchived?: boolean,    // Filtro por archivadas
  page?: number,
  limit?: number,
}

// Obtener una notificación específica
GET /api/notifications/:id

// Marcar notificación como leída
PATCH /api/notifications/:id/read

// Marcar todas como leídas
PATCH /api/notifications/mark-all-read

// Archivar notificación
PATCH /api/notifications/:id/archive

// Eliminar notificación
DELETE /api/notifications/:id

// Obtener contador de no leídas
GET /api/notifications/unread-count
```

#### **Mensajes Directos**

```typescript
// Enviar mensaje directo
POST /api/notifications/send-message
Body: {
  recipientId: string,
  recipientType: string,
  title: string,
  message: string,
  priority?: string,
}

// Responder mensaje
POST /api/notifications/:id/reply
Body: {
  message: string,
}

// Obtener conversación (hilo de mensajes)
GET /api/notifications/:id/thread

// Obtener conversaciones activas
GET /api/notifications/conversations
```

### **🎨 Diseño del Panel de Notificaciones**

#### **Componente: Notification Bell (Navbar)**

```html
<!-- Ubicación: navbar de todos los paneles -->
<div class="notification-bell">
  <button (click)="toggleNotifications()">
    <i class="fas fa-bell"></i>
    <span *ngIf="unreadCount > 0" class="badge-red">{{ unreadCount }}</span>
  </button>
  
  <!-- Dropdown de notificaciones -->
  <div *ngIf="showNotifications" class="notifications-dropdown">
    <div class="header">
      <h3>Notificaciones</h3>
      <button (click)="markAllAsRead()">Marcar todas como leídas</button>
    </div>
    
    <div class="notifications-list">
      <div *ngFor="let notification of notifications" 
           [class.unread]="!notification.isRead"
           (click)="handleNotificationClick(notification)">
        <div class="icon" [class]="getPriorityClass(notification.priority)">
          <i [class]="getTypeIcon(notification.type)"></i>
        </div>
        <div class="content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
          <span class="time">{{ notification.createdAt | timeAgo }}</span>
        </div>
        <button *ngIf="notification.metadata?.actionUrl" 
                class="action-btn">
          {{ notification.metadata.actionLabel }}
        </button>
      </div>
    </div>
    
    <div class="footer">
      <a routerLink="/notifications">Ver todas</a>
    </div>
  </div>
</div>
```

#### **Página: Centro de Notificaciones**

```
Ruta: /notifications

Tabs:
1. Todas (todas las notificaciones)
2. No leídas (solo no leídas)
3. Mensajes (solo mensajes directos)
4. Archivadas (notificaciones archivadas)

Filtros:
- Por tipo (aprobaciones, mensajes, sistema)
- Por prioridad (urgente, alta, media, baja)
- Por fecha (hoy, esta semana, este mes)
- Búsqueda por texto

Acciones:
- Marcar como leída/no leída
- Archivar/desarchivar
- Eliminar
- Responder (si es mensaje directo)
- Acción rápida (botón de acción)
```

#### **Página: Mensajes Directos**

```
Ruta: /messages

Layout estilo WhatsApp/Telegram:
- Sidebar izquierdo: Lista de conversaciones
- Panel derecho: Conversación seleccionada

Características:
- Ver conversaciones activas
- Buscar conversaciones
- Filtrar por usuario/admin
- Ver historial completo
- Responder en hilo
- Indicador de "escribiendo..."
```

### **🔌 Integración con Socket.IO**

#### **Backend (Notification Service)**

```typescript
// notification.gateway.ts
@WebSocketGateway({
  cors: { origin: ['http://localhost:4200'], credentials: true },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;
  
  private connectedUsers = new Map<string, string>(); // userId -> socketId
  
  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      client.join(`user:${userId}`);
      console.log(`User ${userId} connected`);
    }
  }
  
  handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedUsers.entries())
      .find(([, socketId]) => socketId === client.id)?.[0];
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }
  
  // Enviar notificación a usuario específico
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('new-notification', notification);
  }
  
  // Enviar actualización de contador
  sendUnreadCountUpdate(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('unread-count-update', { count });
  }
}
```

#### **Frontend (Angular Service)**

```typescript
// notification-socket.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationSocketService {
  private socket: Socket;
  private unreadCount$ = new BehaviorSubject<number>(0);
  private notifications$ = new BehaviorSubject<any[]>([]);
  
  connect() {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    
    this.socket = io('http://localhost:3005', {
      auth: { userId: user.id, token: this.authService.getToken() },
    });
    
    this.socket.on('new-notification', (notification) => {
      // Añadir nueva notificación
      const current = this.notifications$.value;
      this.notifications$.next([notification, ...current]);
      
      // Actualizar contador
      this.unreadCount$.next(this.unreadCount$.value + 1);
      
      // Mostrar toast
      this.showNotificationToast(notification);
      
      // Reproducir sonido
      this.playNotificationSound();
    });
    
    this.socket.on('unread-count-update', ({ count }) => {
      this.unreadCount$.next(count);
    });
  }
  
  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }
}
```

### **📦 Estructura de Archivos del Microservicio**

```
backend/services/notification-service/
├── src/
│   ├── notification/
│   │   ├── notification.module.ts
│   │   ├── notification.service.ts
│   │   ├── notification.controller.ts
│   │   ├── notification.gateway.ts        # Socket.IO
│   │   ├── schemas/
│   │   │   └── notification.schema.ts
│   │   └── dto/
│   │       ├── create-notification.dto.ts
│   │       └── send-message.dto.ts
│   ├── rabbitmq/
│   │   ├── rabbitmq.module.ts
│   │   ├── rabbitmq.service.ts
│   │   └── consumers/
│   │       ├── approval.consumer.ts       # Escucha aprobaciones
│   │       ├── vip.consumer.ts            # Escucha promociones VIP
│   │       └── order.consumer.ts          # Escucha órdenes
│   ├── main.ts
│   └── app.module.ts
├── package.json
└── .env

frontend/ticketing-app/src/app/
├── core/services/
│   ├── notification.service.ts            # HTTP requests
│   └── notification-socket.service.ts     # Socket.IO
├── shared/components/
│   ├── notification-bell/
│   │   ├── notification-bell.component.ts
│   │   ├── notification-bell.component.html
│   │   └── notification-bell.component.css
│   └── notification-toast/
│       └── notification-toast.component.ts
└── pages/
    ├── notifications/
    │   ├── notifications-center/
    │   │   └── notifications-center.component.ts
    │   └── messages/
    │       └── messages.component.ts
    └── admin/
        └── send-message/
            └── send-message.component.ts
```

---

## ✅ CHECKLIST COMPLETO DE IMPLEMENTACIÓN

### **Fase 1: Backend - Restaurantes** 🟢
- [x] `restaurant.service.ts` con métodos CRUD ✅
- [x] `restaurant.controller.ts` con endpoints ✅
- [x] Publicar evento `approval.requested` al crear ✅
- [x] Escuchar eventos `approval.granted` y `approval.rejected` ✅
- [x] **Frontend - RestaurantService** ✅
- [x] **Frontend - RestaurantLayoutComponent** ✅
- [x] **Frontend - RestaurantDashboardComponent** (6 cards estadísticas) ✅
- [x] **Frontend - RestaurantListComponent** (Tabla CRUD) ✅
- [x] **Rutas configuradas** (/restaurant-admin/dashboard, /restaurant-admin/list) ✅

### **Fase 2: Backend - Viajes** 🔵
- [x] `travel.service.ts` con métodos CRUD ✅
- [x] `travel.controller.ts` con endpoints ✅
- [x] Publicar evento `approval.requested` al crear ✅
- [x] Escuchar eventos `approval.granted` y `approval.rejected` ✅
- [x] **Frontend - TravelService** ✅
- [x] **Frontend - TravelLayoutComponent** (tema azul) ✅
- [x] **Frontend - TravelDashboardComponent** (6 cards estadísticas) ✅
- [x] **Frontend - TravelListComponent** (Tabla CRUD) ✅
- [x] **Rutas configuradas** (/travel-admin/dashboard, /travel-admin/list) ✅

### **Fase 3: Backend - Merchandising** 🟣
- [ ] `merchandising.service.ts` con métodos CRUD
- [ ] `merchandising.controller.ts` con endpoints
- [ ] Publicar evento `approval.requested` al crear
- [ ] Escuchar eventos `approval.granted` y `approval.rejected`

### **Fase 4: Backend - Notification Service** 📬
- [ ] Crear proyecto NestJS para notification-service
- [ ] Configurar MongoDB (notification_db)
- [ ] Configurar Socket.IO
- [ ] Configurar RabbitMQ consumer
- [ ] Crear schemas de Mongoose
  - [ ] Notification schema
- [ ] Crear DTOs con validaciones
  - [ ] CreateNotificationDto
  - [ ] SendMessageDto
- [ ] Implementar NotificationController
  - [ ] GET /api/notifications
  - [ ] GET /api/notifications/:id
  - [ ] PATCH /api/notifications/:id/read
  - [ ] PATCH /api/notifications/mark-all-read
  - [ ] PATCH /api/notifications/:id/archive
  - [ ] DELETE /api/notifications/:id
  - [ ] GET /api/notifications/unread-count
  - [ ] POST /api/notifications/send-message
  - [ ] POST /api/notifications/:id/reply
  - [ ] GET /api/notifications/:id/thread
  - [ ] GET /api/notifications/conversations
- [ ] Implementar NotificationGateway (Socket.IO)
  - [ ] handleConnection
  - [ ] handleDisconnect
  - [ ] sendNotificationToUser
  - [ ] sendUnreadCountUpdate
- [ ] Implementar RabbitMQ Consumers
  - [ ] approval.consumer.ts (escucha aprobaciones)
  - [ ] vip.consumer.ts (escucha promociones VIP)
  - [ ] order.consumer.ts (escucha órdenes)
- [ ] Configurar variables de entorno
  - [ ] MONGODB_URI
  - [ ] RABBITMQ_URL
  - [ ] JWT_SECRET
  - [ ] PORT=3005

### **Fase 5: Frontend - Servicios Angular** 🎨
- [ ] `notification.service.ts` (HTTP requests)
  - [ ] getNotifications()
  - [ ] getNotificationById()
  - [ ] markAsRead()
  - [ ] markAllAsRead()
  - [ ] archiveNotification()
  - [ ] deleteNotification()
  - [ ] getUnreadCount()
  - [ ] sendMessage()
  - [ ] replyMessage()
  - [ ] getThread()
  - [ ] getConversations()
- [ ] `notification-socket.service.ts` (Socket.IO)
  - [ ] connect()
  - [ ] disconnect()
  - [ ] getUnreadCount()
  - [ ] getNotifications()
  - [ ] markAsRead()
  - [ ] showNotificationToast()
  - [ ] playNotificationSound()
- [ ] `restaurant.service.ts`
- [ ] `travel.service.ts`
- [ ] `merchandising.service.ts`

### **Fase 6: Frontend - Componentes de Notificaciones** 🔔

#### **A) Componente Notification Bell (Compartido)**
- [ ] `notification-bell.component.ts`
  - [ ] Icono de campana con badge
  - [ ] Dropdown con últimas notificaciones
  - [ ] Contador de no leídas
  - [ ] Integración con Socket.IO
  - [ ] **Añadir a navbar de TODOS los paneles:**
    - [ ] Admin Dashboard (SUPER_ADMIN)
    - [ ] Restaurant Admin (COMPANY_ADMIN)
    - [ ] Travel Admin (COMPANY_ADMIN)
    - [ ] Merchandising Admin (COMPANY_ADMIN)
    - [ ] User Profile (USER/VIP)
    - [ ] Shop Navbar (público)

#### **B) Componente Toast**
- [ ] `notification-toast.component.ts`
  - [ ] Toast para notificaciones nuevas
  - [ ] Animaciones de entrada/salida
  - [ ] Botón de acción rápida

#### **C) Centro de Notificaciones (Todos los usuarios)**
- [ ] `notifications-center.component.ts`
  - [ ] Tabs (Todas, No leídas, Mensajes, Archivadas)
  - [ ] Filtros avanzados
  - [ ] Lista de notificaciones
  - [ ] Acciones (leer, archivar, eliminar)
  - [ ] **Rutas por tipo de usuario:**
    - [ ] `/admin-dashboard/notifications` (SUPER_ADMIN)
    - [ ] `/restaurant-admin/notifications` (COMPANY_ADMIN)
    - [ ] `/travel-admin/notifications` (COMPANY_ADMIN)
    - [ ] `/merchandising-admin/notifications` (COMPANY_ADMIN)
    - [ ] `/notifications` (USER/VIP)

#### **D) Buzón de Mensajes (Todos los usuarios)**
- [ ] `messages.component.ts`
  - [ ] Layout tipo WhatsApp
  - [ ] Lista de conversaciones
  - [ ] Vista de conversación
  - [ ] Responder mensajes
  - [ ] Indicador de "escribiendo..."
  - [ ] **Rutas por tipo de usuario:**
    - [ ] `/admin-dashboard/messages` (SUPER_ADMIN)
    - [ ] `/restaurant-admin/messages` (COMPANY_ADMIN)
    - [ ] `/travel-admin/messages` (COMPANY_ADMIN)
    - [ ] `/merchandising-admin/messages` (COMPANY_ADMIN)
    - [ ] `/messages` (USER/VIP)

#### **E) Enviar Mensaje (Solo SUPER_ADMIN)**
- [ ] `send-message.component.ts`
  - [ ] Seleccionar destinatario (COMPANY_ADMIN o USER)
  - [ ] Filtro por tipo de usuario
  - [ ] Formulario de mensaje
  - [ ] Seleccionar prioridad
  - [ ] Enviar mensaje
  - [ ] Ruta: `/admin-dashboard/send-message`

#### **F) Integración en Sidebars**
- [ ] **Admin Dashboard Sidebar:**
  - [ ] Enlace "Notificaciones" con badge
  - [ ] Enlace "Mensajes" con badge
  - [ ] Enlace "Enviar Mensaje"
- [ ] **Restaurant Admin Sidebar:**
  - [ ] Enlace "Notificaciones" con badge
  - [ ] Enlace "Mensajes" con badge
- [ ] **Travel Admin Sidebar:**
  - [ ] Enlace "Notificaciones" con badge
  - [ ] Enlace "Mensajes" con badge
- [ ] **Merchandising Admin Sidebar:**
  - [ ] Enlace "Notificaciones" con badge
  - [ ] Enlace "Mensajes" con badge
- [ ] **User Profile Tabs:**
  - [ ] Tab "Notificaciones"
  - [ ] Tab "Mensajes"

### **Fase 7: Frontend - Panel Restaurantes** 🟢
- [ ] `restaurant-layout.component.ts`
- [ ] `restaurant-dashboard.component.ts`
- [ ] `restaurant-list.component.ts`
- [ ] `restaurant-stats.component.ts`

### **Fase 8: Frontend - Panel Viajes** 🔵
- [ ] `travel-layout.component.ts`
- [ ] `travel-dashboard.component.ts`
- [ ] `travel-list.component.ts`
- [ ] `travel-stats.component.ts`

### **Fase 9: Frontend - Panel Merchandising** 🟣
- [ ] `merchandising-layout.component.ts`
- [ ] `merchandising-dashboard.component.ts`
- [ ] `merchandising-list.component.ts`
- [ ] `merchandising-stats.component.ts`

### **Fase 10: Guards y Rutas** 🔐
- [ ] `restaurant-admin.guard.ts`
- [ ] `travel-admin.guard.ts`
- [ ] `merchandising-admin.guard.ts`
- [ ] Configurar rutas en app.routes.ts
  - [ ] `/restaurant-admin/*`
  - [ ] `/travel-admin/*`
  - [ ] `/merchandising-admin/*`
  - [ ] `/notifications`
  - [ ] `/messages`

### **Fase 11: Testing** 🧪
- [ ] Probar creación de restaurante → notificación a SUPER_ADMIN
- [ ] Probar aprobación → notificación a COMPANY_ADMIN
- [ ] Probar rechazo → notificación a COMPANY_ADMIN
- [ ] Probar mensaje directo SUPER_ADMIN → COMPANY_ADMIN
- [ ] Probar respuesta de mensaje
- [ ] Probar notificaciones en tiempo real (Socket.IO)
- [ ] Probar contador de no leídas
- [ ] Probar marcar como leída
- [ ] Probar archivar notificaciones
- [ ] Probar conversaciones
- [ ] Verificar eventos RabbitMQ
- [ ] Verificar responsive design

### **Fase 12: Documentación** 📚
- [ ] Documentar endpoints de notification-service
- [ ] Documentar eventos RabbitMQ
- [ ] Documentar tipos de notificaciones
- [ ] Documentar integración Socket.IO
- [ ] Crear guía de usuario para notificaciones
- [ ] Actualizar README con notification-service
- [ ] Documentar variables de entorno

---

## 📝 NOTAS IMPORTANTES

### **Integración con Sistema Existente**
- ✅ Schemas de MongoDB ya tienen todos los campos necesarios
- ✅ Sistema de aprobaciones (Approval Service) ya existe
- ✅ RabbitMQ ya está configurado
- ✅ PostgreSQL (admin) y MongoDB (festival-services) operativos
- ✅ JWT ya implementado en festival-services

### **Arquitectura Completa Final**

```
Backend Admin (Fastify + PostgreSQL) - Puerto 3003
├── Gestiona: Companies, CompanyAdmins, Approvals
└── Usuarios: SUPER_ADMIN

Festival Services (NestJS + MongoDB) - Puerto 3004
├── Gestiona: Restaurants, Trips, Products
├── Usuarios: COMPANY_ADMIN
└── RabbitMQ: Eventos de aprobación

Notification Service (NestJS + MongoDB + Socket.IO) - Puerto 3005
├── Gestiona: Notifications, Messages
├── RabbitMQ: Escucha eventos (aprobaciones, VIP, órdenes)
├── Socket.IO: Notificaciones en tiempo real
└── Usuarios: TODOS (SUPER_ADMIN, COMPANY_ADMIN, USER, VIP)

User Service (Express + MongoDB) - Puerto 3001
├── Gestiona: Users, Authentication
└── Usuarios: USER, VIP
```

### **Cambios Necesarios**

1. **Crear Notification Service** (nuevo microservicio)
2. **Integrar Socket.IO** en frontend
3. **Añadir notification-bell** a todos los navbars
4. **Crear páginas** de notificaciones y mensajes
5. **Configurar RabbitMQ consumers** en notification-service
6. **Publicar eventos** desde festival-services
7. **Crear usuarios COMPANY_ADMIN** para cada servicio (seed data)
8. **Simplificar sistema de login** (un solo login, redirección automática)

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Notification Service Backend** (base del sistema de notificaciones)
2. **Notification Service Frontend** (componentes y servicios)
3. **Backend Restaurantes** (más simple)
4. **Frontend Restaurantes** (validar diseño y flujo completo)
5. **Backend Viajes** (similar a restaurantes)
6. **Frontend Viajes** (reutilizar componentes)
7. **Backend Merchandising** (más complejo)
8. **Frontend Merchandising** (reutilizar componentes)
9. **Testing completo** (todos los servicios + notificaciones)
10. **Documentación** (guías y README)

---

## 📊 DATOS DE EJEMPLO Y USUARIOS

### **Usuarios a Crear**

#### **PostgreSQL (Backend Admin)**

```typescript
// SUPER_ADMIN (ya existe)
{
  email: 'voro.super@ticketing.com',
  password: 'Voro123!',
  role: 'SUPER_ADMIN'
}

// COMPANY_ADMIN - Restaurantes España
{
  email: 'rest.spain@test.com',
  password: 'Admin123!',
  firstName: 'Carlos',
  lastName: 'García',
  companyId: '[ID España Restaurantes]',
  companyType: 'RESTAURANT',
  region: 'SPAIN'
}

// COMPANY_ADMIN - Restaurantes Europa
{
  email: 'rest.europe@test.com',
  password: 'Admin123!',
  firstName: 'Pierre',
  lastName: 'Dubois',
  companyId: '[ID Europa Restaurantes]',
  companyType: 'RESTAURANT',
  region: 'EUROPE'
}

// COMPANY_ADMIN - Viajes España
{
  email: 'travel.spain@test.com',
  password: 'Admin123!',
  firstName: 'María',
  lastName: 'López',
  companyId: '[ID España Viajes]',
  companyType: 'TRAVEL',
  region: 'SPAIN'
}

// COMPANY_ADMIN - Viajes Europa
{
  email: 'travel.europe@test.com',
  password: 'Admin123!',
  firstName: 'Hans',
  lastName: 'Schmidt',
  companyId: '[ID Europa Viajes]',
  companyType: 'TRAVEL',
  region: 'EUROPE'
}

// COMPANY_ADMIN - Merchandising España
{
  email: 'merch.spain@test.com',
  password: 'Admin123!',
  firstName: 'Ana',
  lastName: 'Martínez',
  companyId: '[ID España Merchandising]',
  companyType: 'MERCHANDISING',
  region: 'SPAIN'
}

// COMPANY_ADMIN - Merchandising Europa
{
  email: 'merch.europe@test.com',
  password: 'Admin123!',
  firstName: 'Giovanni',
  lastName: 'Rossi',
  companyId: '[ID Europa Merchandising]',
  companyType: 'MERCHANDISING',
  region: 'EUROPE'
}
```

#### **MongoDB (User Service)**

```typescript
// Usuarios normales (ya existen)
{
  email: 'xavi.vip@ticketing.com',
  password: 'Xavi123!',
  role: 'vip'
}

{
  email: 'user@ticketing.com',
  password: 'User123!',
  role: 'user'
}
```

### **Datos Actuales en Base de Datos**

```
MongoDB (festival_services):
├─ 838 restaurantes (ya creados con seed)
├─ 838 viajes (ya creados con seed)
├─ 2,515 productos (ya creados con seed)
├─ 0 reservas viajes
├─ 0 reservas restaurantes
└─ 0 órdenes merchandising

MongoDB (notification_db):
└─ 0 notificaciones (pendiente crear)

PostgreSQL (ticketing):
├─ 0 compañías (pendiente crear)
└─ 0 company admins (pendiente crear)
```

---

## 📚 DOCUMENTACIÓN SWAGGER

### **URLs de Swagger por Microservicio**

```
Festival Services (NestJS):
http://localhost:3004/api/docs

Notification Service (NestJS):
http://localhost:3005/api/docs

Admin Service (Fastify):
http://localhost:3003/documentation
```

### **Configuración de Swagger en Festival Services**

#### **Instalación**

```bash
cd backend/services/festival-services
npm install @nestjs/swagger swagger-ui-express
```

#### **Configuración en main.ts**

```typescript
// backend/services/festival-services/src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true,
  });
  
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Festival Services API')
    .setDescription('API para gestión de Restaurantes, Viajes y Merchandising')
    .setVersion('1.0')
    .addTag('Restaurants', 'Endpoints de gestión de restaurantes')
    .addTag('Travel', 'Endpoints de gestión de viajes')
    .addTag('Merchandising', 'Endpoints de gestión de merchandising')
    .addTag('Auth', 'Endpoints de autenticación')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Festival Services API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
  
  await app.listen(3004);
  console.log('🚀 Festival Services running on http://localhost:3004');
  console.log('📚 Swagger docs: http://localhost:3004/api/docs');
}
bootstrap();
```

### **Decoradores de Swagger en Controllers**

#### **Restaurant Controller**

```typescript
// restaurant.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Restaurants')
@ApiBearerAuth('JWT-auth')
@Controller('api/restaurant')
@UseGuards(JwtAuthGuard)
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear nuevo restaurante',
    description: 'Crea un nuevo restaurante. Requiere aprobación del SUPER_ADMIN.'
  })
  @ApiResponse({ status: 201, description: 'Restaurante creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async create(@Body() createDto: CreateRestaurantDto) {
    return this.restaurantService.create(createDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los restaurantes',
    description: 'Lista todos los restaurantes. COMPANY_ADMIN solo ve los de su compañía.'
  })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filtrar por compañía' })
  @ApiQuery({ name: 'festivalId', required: false, description: 'Filtrar por festival' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'approvalStatus', required: false, description: 'Filtrar por estado de aprobación' })
  @ApiResponse({ status: 200, description: 'Lista de restaurantes' })
  async findAll(@Query() query: any) {
    return this.restaurantService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener restaurante por ID' })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({ status: 200, description: 'Restaurante encontrado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar restaurante',
    description: 'Actualiza un restaurante. Requiere aprobación si se modifican campos críticos.'
  })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({ status: 200, description: 'Restaurante actualizado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateRestaurantDto) {
    return this.restaurantService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar restaurante',
    description: 'Elimina un restaurante. Requiere aprobación del SUPER_ADMIN.'
  })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({ status: 200, description: 'Restaurante eliminado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  async remove(@Param('id') id: string) {
    return this.restaurantService.remove(id);
  }

  @Get('stats/summary')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de restaurantes',
    description: 'Estadísticas generales de restaurantes por compañía'
  })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  async getStats() {
    return this.restaurantService.getStats();
  }

  @Patch(':id/menu')
  @ApiOperation({ summary: 'Actualizar menú del restaurante' })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({ status: 200, description: 'Menú actualizado' })
  async updateMenu(@Param('id') id: string, @Body() menu: any) {
    return this.restaurantService.updateMenu(id, menu);
  }

  @Patch(':id/occupancy')
  @ApiOperation({ summary: 'Actualizar ocupación actual' })
  @ApiParam({ name: 'id', description: 'ID del restaurante' })
  @ApiResponse({ status: 200, description: 'Ocupación actualizada' })
  async updateOccupancy(@Param('id') id: string, @Body() body: { occupancy: number }) {
    return this.restaurantService.updateOccupancy(id, body.occupancy);
  }
}
```

#### **DTOs con Decoradores de Swagger**

```typescript
// create-restaurant.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, Min, Max } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ 
    description: 'ID de la compañía',
    example: 'uuid-company-123'
  })
  @IsString()
  companyId: string;

  @ApiProperty({ 
    description: 'Nombre de la compañía',
    example: 'España Restaurantes'
  })
  @IsString()
  companyName: string;

  @ApiProperty({ 
    description: 'Región',
    example: 'SPAIN',
    enum: ['SPAIN', 'EUROPE', 'AMERICA', 'ASIA', 'AFRICA', 'OCEANIA']
  })
  @IsString()
  region: string;

  @ApiProperty({ 
    description: 'ID del festival',
    example: 'uuid-festival-123'
  })
  @IsString()
  festivalId: string;

  @ApiProperty({ 
    description: 'Nombre del restaurante',
    example: 'Restaurante La Roca'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Descripción del restaurante',
    example: 'Cocina mediterránea con productos locales'
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Tipo de cocina',
    example: 'Mediterránea'
  })
  @IsString()
  cuisine: string;

  @ApiProperty({ 
    description: 'Ubicación en el festival',
    example: 'Zona VIP - Stand 12'
  })
  @IsString()
  location: string;

  @ApiProperty({ 
    description: 'Capacidad máxima',
    example: 50,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ 
    description: 'Ocupación actual',
    example: 0,
    default: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentOccupancy?: number;

  @ApiPropertyOptional({ 
    description: 'Horarios de apertura',
    type: [Object],
    example: [
      { day: 'Lunes', open: '12:00', close: '23:00' },
      { day: 'Martes', open: '12:00', close: '23:00' }
    ]
  })
  @IsArray()
  @IsOptional()
  schedule?: Array<{ day: string; open: string; close: string }>;

  @ApiPropertyOptional({ 
    description: 'Menú del restaurante',
    type: [Object],
    example: [
      { name: 'Paella', price: 15.99, category: 'Principal' },
      { name: 'Sangría', price: 5.99, category: 'Bebida' }
    ]
  })
  @IsArray()
  @IsOptional()
  menu?: Array<{ name: string; price: number; category: string }>;

  @ApiPropertyOptional({ 
    description: 'Acepta reservas',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  acceptsReservations?: boolean;

  @ApiPropertyOptional({ 
    description: 'Duración de reserva en minutos',
    example: 90,
    default: 90
  })
  @IsNumber()
  @Min(30)
  @Max(240)
  @IsOptional()
  reservationDurationMinutes?: number;
}
```

### **Configuración de Swagger en Notification Service**

```typescript
// backend/services/notification-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true,
  });
  
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('API para gestión de notificaciones y mensajes')
    .setVersion('1.0')
    .addTag('Notifications', 'Endpoints de notificaciones')
    .addTag('Messages', 'Endpoints de mensajes directos')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(3005);
  console.log('🚀 Notification Service running on http://localhost:3005');
  console.log('📚 Swagger docs: http://localhost:3005/api/docs');
}
bootstrap();
```

### **Resumen de Endpoints Documentados**

#### **Festival Services (http://localhost:3004/api/docs)**

**Restaurants:**
- POST `/api/restaurant` - Crear restaurante
- GET `/api/restaurant` - Listar restaurantes
- GET `/api/restaurant/:id` - Obtener por ID
- PATCH `/api/restaurant/:id` - Actualizar
- DELETE `/api/restaurant/:id` - Eliminar
- GET `/api/restaurant/stats/summary` - Estadísticas
- PATCH `/api/restaurant/:id/menu` - Actualizar menú
- PATCH `/api/restaurant/:id/occupancy` - Actualizar ocupación

**Travel:**
- POST `/api/travel` - Crear viaje
- GET `/api/travel` - Listar viajes
- GET `/api/travel/:id` - Obtener por ID
- PATCH `/api/travel/:id` - Actualizar
- DELETE `/api/travel/:id` - Eliminar
- GET `/api/travel/stats/summary` - Estadísticas
- PATCH `/api/travel/:id/seats` - Actualizar asientos
- PATCH `/api/travel/:id/status` - Actualizar estado

**Merchandising:**
- POST `/api/merchandising` - Crear producto
- GET `/api/merchandising` - Listar productos
- GET `/api/merchandising/:id` - Obtener por ID
- PATCH `/api/merchandising/:id` - Actualizar
- DELETE `/api/merchandising/:id` - Eliminar
- GET `/api/merchandising/stats/summary` - Estadísticas
- PATCH `/api/merchandising/:id/stock` - Actualizar stock
- PATCH `/api/merchandising/:id/price` - Actualizar precio

**Auth:**
- POST `/api/auth/login` - Login unificado
- POST `/api/auth/register` - Registro
- GET `/api/auth/me` - Usuario actual

#### **Notification Service (http://localhost:3005/api/docs)**

**Notifications:**
- GET `/api/notifications` - Listar notificaciones
- GET `/api/notifications/:id` - Obtener por ID
- PATCH `/api/notifications/:id/read` - Marcar como leída
- PATCH `/api/notifications/mark-all-read` - Marcar todas como leídas
- PATCH `/api/notifications/:id/archive` - Archivar
- DELETE `/api/notifications/:id` - Eliminar
- GET `/api/notifications/unread-count` - Contador de no leídas

**Messages:**
- POST `/api/notifications/send-message` - Enviar mensaje
- POST `/api/notifications/:id/reply` - Responder mensaje
- GET `/api/notifications/:id/thread` - Ver conversación
- GET `/api/notifications/conversations` - Listar conversaciones

#### **Admin Service (http://localhost:3003/documentation)**

Ya configurado con Fastify Swagger.

---

## 🔐 SISTEMA DE LOGIN UNIFICADO

### **Problema Actual**

El login actual pregunta si eres "Usuario" o "Empresa", lo cual es confuso y redundante.

### **Solución: Login Único con Redirección Automática**

#### **Frontend: Un Solo Formulario de Login**

```typescript
// login.component.ts
onSubmit() {
  const { email, password } = this.loginForm.value;
  
  this.authService.login(email, password).subscribe({
    next: (response) => {
      const user = this.authService.getCurrentUser();
      
      // Redirección automática según rol
      this.redirectByRole(user.role);
    }
  });
}

private redirectByRole(role: string) {
  switch(role) {
    // SUPER_ADMIN → Dashboard Admin
    case 'SUPER_ADMIN':
    case 'super_admin':
      this.router.navigate(['/admin-dashboard']);
      break;
    
    // COMPANY_ADMIN → Panel según tipo de compañía
    case 'COMPANY_ADMIN':
      const companyType = this.authService.getCompanyType();
      switch(companyType) {
        case 'RESTAURANT':
          this.router.navigate(['/restaurant-admin/dashboard']);
          break;
        case 'TRAVEL':
          this.router.navigate(['/travel-admin/dashboard']);
          break;
        case 'MERCHANDISING':
          this.router.navigate(['/merchandising-admin/dashboard']);
          break;
        default:
          this.router.navigate(['/']);
      }
      break;
    
    // USER/VIP → Shop
    case 'user':
    case 'vip':
    case 'USER':
    case 'VIP':
      this.router.navigate(['/shop']);
      break;
    
    default:
      this.router.navigate(['/']);
  }
}
```

#### **Backend: Endpoint Único de Login**

```typescript
// Festival Services: /auth/login
// Detecta automáticamente el tipo de usuario

POST /api/auth/login
Body: {
  email: string,
  password: string
}

Response: {
  success: true,
  token: string,
  user: {
    id: string,
    email: string,
    role: string,
    userType: 'USER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN',
    companyType?: 'RESTAURANT' | 'TRAVEL' | 'MERCHANDISING',
    companyId?: string,
    companyName?: string,
    region?: string
  }
}
```

#### **Lógica de Autenticación**

```typescript
// auth.service.ts (Festival Services)
async login(email: string, password: string) {
  // 1. Buscar en PostgreSQL (COMPANY_ADMIN)
  const companyAdmin = await this.prisma.companyAdmin.findUnique({
    where: { email },
    include: { company: true }
  });
  
  if (companyAdmin) {
    // Verificar password
    const isValid = await bcrypt.compare(password, companyAdmin.password);
    if (isValid) {
      return {
        token: this.generateToken(companyAdmin),
        user: {
          id: companyAdmin.id,
          email: companyAdmin.email,
          role: 'COMPANY_ADMIN',
          userType: 'COMPANY_ADMIN',
          companyType: companyAdmin.company.type,
          companyId: companyAdmin.company.id,
          companyName: companyAdmin.company.name,
          region: companyAdmin.company.region,
          firstName: companyAdmin.firstName,
          lastName: companyAdmin.lastName
        }
      };
    }
  }
  
  // 2. Buscar en PostgreSQL (SUPER_ADMIN)
  const admin = await this.prisma.admin.findUnique({
    where: { email }
  });
  
  if (admin) {
    const isValid = await bcrypt.compare(password, admin.password);
    if (isValid) {
      return {
        token: this.generateToken(admin),
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          userType: 'SUPER_ADMIN'
        }
      };
    }
  }
  
  // 3. Buscar en MongoDB (USER/VIP)
  const user = await this.userModel.findOne({ email });
  
  if (user) {
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      return {
        token: this.generateToken(user),
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          userType: 'USER',
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    }
  }
  
  throw new UnauthorizedException('Credenciales incorrectas');
}
```

### **Cambios en el Frontend**

#### **Eliminar:**
- ❌ Selector de "Usuario" o "Empresa"
- ❌ Múltiples formularios de login
- ❌ Lógica de selección manual de tipo

#### **Mantener:**
- ✅ Un solo formulario de login
- ✅ Email y contraseña
- ✅ Redirección automática según rol
- ✅ Mensaje de bienvenida personalizado

#### **Template Simplificado**

```html
<!-- login.component.html -->
<div class="login-container">
  <h2>Iniciar Sesión</h2>
  
  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label>Email</label>
      <input type="email" formControlName="email" placeholder="tu@email.com">
    </div>
    
    <div class="form-group">
      <label>Contraseña</label>
      <input 
        [type]="showPassword ? 'text' : 'password'" 
        formControlName="password"
        placeholder="••••••••">
      <button type="button" (click)="showPassword = !showPassword">
        <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
      </button>
    </div>
    
    <button type="submit" [disabled]="loading">
      {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
    </button>
  </form>
  
  <div class="links">
    <a routerLink="/register">¿No tienes cuenta? Regístrate</a>
    <a routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>
  </div>
</div>
```

### **Beneficios del Login Unificado**

1. ✅ **UX mejorada** - No confunde al usuario
2. ✅ **Más simple** - Un solo formulario
3. ✅ **Automático** - Redirección según rol
4. ✅ **Seguro** - El backend decide el tipo de usuario
5. ✅ **Escalable** - Fácil añadir nuevos roles

---

## 🔒 SISTEMA DE PROMOCIÓN DE USUARIOS

### **Flujo de Promoción (Similar a VIP)**

#### **1. Usuario Normal se Registra** 👤

```
Usuario se registra en /register
├── Rellena: nombre, email, password
├── Rol asignado automáticamente: "user"
└── Puede hacer login y usar la plataforma
```

#### **2. SUPER_ADMIN Promociona Usuarios** ⭐

El SUPER_ADMIN puede promocionar usuarios existentes a:
- **VIP** (ya implementado)
- **COMPANY_ADMIN** (nuevo, igual que VIP)

### **Panel de Usuarios del SUPER_ADMIN**

```
/admin-dashboard/users

Tabla de usuarios:
┌─────────────────────────────────────────────────────────────┐
│ Usuario    │ Email              │ Rol    │ Acciones         │
├─────────────────────────────────────────────────────────────┤
│ Carlos     │ carlos@email.com   │ user   │ [👁️] [⭐ VIP]   │
│            │                    │        │ [🏢 Promocionar] │
├─────────────────────────────────────────────────────────────┤
│ María      │ maria@email.com    │ vip    │ [👁️] [❌ VIP]   │
│            │                    │        │ [🏢 Promocionar] │
└─────────────────────────────────────────────────────────────┘
```

### **Botones de Promoción**

#### **Botón 1: Promocionar VIP** (ya existe)
- Color: Amarillo/Dorado
- Icono: ⭐
- Acción: Cambia rol a `"vip"`

#### **Botón 2: Promocionar a COMPANY_ADMIN** (nuevo)
- Color: Azul/Verde/Morado (según servicio)
- Icono: 🏢
- Acción: Abre modal para elegir servicio

### **Modal de Promoción a COMPANY_ADMIN**

```typescript
// Cuando SUPER_ADMIN hace click en "Promocionar a COMPANY_ADMIN"

Modal: "Promocionar a Company Admin"
├── Usuario seleccionado: Carlos García (carlos@email.com)
├── 
├── Seleccionar Servicio: *
│   ├── 🟢 Restaurantes
│   ├── 🔵 Viajes
│   └── 🟣 Merchandising
├── 
├── Seleccionar Región: *
│   ├── España
│   ├── Europa
│   ├── América
│   └── Otros...
├── 
├── Seleccionar Compañía: * (se carga según servicio + región)
│   └── [Dropdown con compañías disponibles]
├── 
├── Permisos:
│   ├── ✅ Puede crear
│   ├── ✅ Puede actualizar
│   ├── ❌ Puede eliminar
│   ├── ✅ Puede ver estadísticas
│   └── ✅ Puede gestionar stock
├── 
├── Razón de promoción: *
│   └── [Textarea]
├── 
├── Notas adicionales:
│   └── [Textarea]
├── 
└── [Cancelar] [Promocionar a Company Admin]
```

### **Código del Modal**

```typescript
// users-list.component.ts

// Botón en la tabla
<button
  *ngIf="isSuperAdmin"
  (click)="openCompanyAdminPromotionModal(user)"
  class="btn-promote-company-admin"
  title="Promocionar a Company Admin">
  <i class="fas fa-building"></i>
  Promocionar a Company Admin
</button>

// Variables del modal
showCompanyAdminModal = false;
selectedUserForPromotion: any = null;
selectedService: 'RESTAURANT' | 'TRAVEL' | 'MERCHANDISING' | null = null;
selectedRegion: string = '';
selectedCompanyId: string = '';
availableCompanies: any[] = [];
promotionReason: string = '';
promotionNotes: string = '';
permissions = {
  canCreate: true,
  canUpdate: true,
  canDelete: false,
  canViewStats: true,
  canManageStock: true
};

// Abrir modal
openCompanyAdminPromotionModal(user: any) {
  this.selectedUserForPromotion = user;
  this.showCompanyAdminModal = true;
  this.loadCompanies(); // Cargar todas las compañías
}

// Cuando selecciona servicio o región
onServiceOrRegionChange() {
  // Filtrar compañías según servicio y región
  this.availableCompanies = this.allCompanies.filter(company => 
    company.type === this.selectedService &&
    company.region === this.selectedRegion
  );
}

// Confirmar promoción
confirmPromoteToCompanyAdmin() {
  if (!this.selectedService || !this.selectedRegion || 
      !this.selectedCompanyId || !this.promotionReason) {
    Swal.fire('Error', 'Completa todos los campos requeridos', 'error');
    return;
  }
  
  const data = {
    userId: this.selectedUserForPromotion._id,
    companyId: this.selectedCompanyId,
    service: this.selectedService,
    region: this.selectedRegion,
    permissions: this.permissions,
    reason: this.promotionReason,
    notes: this.promotionNotes
  };
  
  this.adminService.promoteToCompanyAdmin(data).subscribe({
    next: (response) => {
      Swal.fire({
        icon: 'success',
        title: '✅ Usuario promocionado',
        text: `${this.selectedUserForPromotion.username} ahora es Company Admin de ${this.selectedService}`
      });
      this.closeCompanyAdminModal();
      this.loadUsers(); // Recargar lista
    },
    error: (error) => {
      Swal.fire('Error', error.error?.message || 'Error al promocionar', 'error');
    }
  });
}
```

### **Backend: Endpoint de Promoción**

```typescript
// admin.service.ts (Backend Admin)

// POST /api/users/:userId/promote-to-company-admin
async promoteToCompanyAdmin(userId: string, data: PromoteToCompanyAdminDto) {
  // 1. Buscar usuario en MongoDB
  const user = await this.userModel.findById(userId);
  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }
  
  // 2. Verificar que la compañía existe en PostgreSQL
  const company = await this.prisma.company.findUnique({
    where: { id: data.companyId }
  });
  if (!company) {
    throw new NotFoundException('Compañía no encontrada');
  }
  
  // 3. Crear COMPANY_ADMIN en PostgreSQL
  const companyAdmin = await this.prisma.companyAdmin.create({
    data: {
      email: user.email,
      password: user.password, // Mantener la misma contraseña
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      companyId: data.companyId,
      canCreate: data.permissions.canCreate,
      canUpdate: data.permissions.canUpdate,
      canDelete: data.permissions.canDelete,
      canViewStats: data.permissions.canViewStats,
      canManageStock: data.permissions.canManageStock,
    }
  });
  
  // 4. Actualizar rol en MongoDB (opcional, para mantener sincronía)
  await this.userModel.findByIdAndUpdate(userId, {
    role: 'company_admin',
    companyId: data.companyId,
    companyType: company.type,
  });
  
  // 5. Enviar notificación al usuario
  await this.notificationService.sendNotification({
    recipientId: userId,
    recipientEmail: user.email,
    type: 'COMPANY_ADMIN_ASSIGNED',
    title: '🎉 Has sido promocionado a Company Admin',
    message: `Ahora eres administrador de ${company.name}. Puedes gestionar ${company.type}.`,
    priority: 'HIGH',
    metadata: {
      companyId: company.id,
      companyName: company.name,
      companyType: company.type,
      actionUrl: `/${company.type.toLowerCase()}-admin/dashboard`,
      actionLabel: 'Ir a mi panel'
    }
  });
  
  // 6. Registrar en log de auditoría
  await this.auditLog.create({
    action: 'PROMOTE_TO_COMPANY_ADMIN',
    performedBy: 'SUPER_ADMIN',
    targetUser: user.email,
    details: {
      companyId: company.id,
      companyName: company.name,
      service: company.type,
      reason: data.reason,
      notes: data.notes
    }
  });
  
  return {
    success: true,
    message: 'Usuario promocionado exitosamente',
    companyAdmin
  };
}
```

### **Flujo Completo de Promoción**

```
1. Usuario "Carlos" se registra como "user"
   - Email: carlos@email.com
   - Rol: "user"
   - Puede usar la plataforma normalmente
   ↓
2. SUPER_ADMIN ve a Carlos en /admin-dashboard/users
   - Revisa su actividad
   - Decide promocionarlo
   ↓
3. SUPER_ADMIN hace click en "Promocionar a Company Admin"
   - Se abre modal
   ↓
4. SUPER_ADMIN selecciona:
   - Servicio: RESTAURANT
   - Región: SPAIN
   - Compañía: España Restaurantes
   - Permisos: crear, actualizar, ver stats
   - Razón: "Experiencia en gestión de restaurantes"
   ↓
5. Sistema crea COMPANY_ADMIN en PostgreSQL
   - Usa el mismo email y password
   - Asigna a la compañía seleccionada
   ↓
6. Sistema actualiza usuario en MongoDB
   - Cambia rol a "company_admin"
   - Añade companyId y companyType
   ↓
7. Sistema envía notificación a Carlos
   - "Has sido promocionado a Company Admin"
   - Botón: "Ir a mi panel"
   ↓
8. Carlos hace login
   - Sistema detecta que es COMPANY_ADMIN
   - Redirige automáticamente a /restaurant-admin/dashboard
   ↓
9. Carlos puede gestionar restaurantes
   - Crear restaurantes (requiere aprobación)
   - Ver estadísticas
   - Gestionar menús
```

### **Ventajas de este Sistema**

1. ✅ **Más simple** - No hay que crear usuarios desde cero
2. ✅ **Consistente** - Igual que la promoción a VIP
3. ✅ **Seguro** - Solo SUPER_ADMIN puede promocionar
4. ✅ **Trazable** - Log de auditoría de todas las promociones
5. ✅ **Notificaciones** - Usuario recibe notificación automática
6. ✅ **Flexible** - SUPER_ADMIN elige servicio y permisos
7. ✅ **Sin duplicados** - Usa el mismo email y password

---

## 📝 SCRIPT DE SEED PARA USUARIOS

### **Crear Compañías y COMPANY_ADMIN**

```typescript
// backend/admin/scripts/seed-companies.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedCompaniesAndAdmins() {
  console.log('🌱 Seeding companies and company admins...');
  
  // 1. Crear Compañías
  const companies = [
    {
      name: 'España Restaurantes',
      type: 'RESTAURANT',
      region: 'SPAIN',
      contactEmail: 'rest.spain@test.com',
      contactPhone: '+34 900 123 456',
      address: 'Madrid, España',
      taxId: 'B12345678',
    },
    {
      name: 'Europa Restaurantes',
      type: 'RESTAURANT',
      region: 'EUROPE',
      contactEmail: 'rest.europe@test.com',
      contactPhone: '+33 1 23 45 67 89',
      address: 'Paris, France',
      taxId: 'FR123456789',
    },
    {
      name: 'España Viajes',
      type: 'TRAVEL',
      region: 'SPAIN',
      contactEmail: 'travel.spain@test.com',
      contactPhone: '+34 900 789 012',
      address: 'Barcelona, España',
      taxId: 'B87654321',
    },
    {
      name: 'Europa Viajes',
      type: 'TRAVEL',
      region: 'EUROPE',
      contactEmail: 'travel.europe@test.com',
      contactPhone: '+49 30 12345678',
      address: 'Berlin, Germany',
      taxId: 'DE123456789',
    },
    {
      name: 'España Merchandising',
      type: 'MERCHANDISING',
      region: 'SPAIN',
      contactEmail: 'merch.spain@test.com',
      contactPhone: '+34 900 345 678',
      address: 'Valencia, España',
      taxId: 'B11223344',
    },
    {
      name: 'Europa Merchandising',
      type: 'MERCHANDISING',
      region: 'EUROPE',
      contactEmail: 'merch.europe@test.com',
      contactPhone: '+39 06 12345678',
      address: 'Rome, Italy',
      taxId: 'IT123456789',
    },
  ];
  
  for (const companyData of companies) {
    const company = await prisma.company.create({
      data: companyData,
    });
    
    console.log(`✅ Company created: ${company.name}`);
    
    // 2. Crear COMPANY_ADMIN para cada compañía
    const adminData = {
      email: companyData.contactEmail,
      password: await bcrypt.hash('Admin123!', 10),
      firstName: getFirstName(companyData.region),
      lastName: getLastName(companyData.region),
      companyId: company.id,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
      canViewStats: true,
      canManageStock: true,
    };
    
    const admin = await prisma.companyAdmin.create({
      data: adminData,
    });
    
    console.log(`✅ Company Admin created: ${admin.email}`);
  }
  
  console.log('🎉 Seed completed!');
}

function getFirstName(region: string): string {
  const names = {
    SPAIN: ['Carlos', 'María', 'Ana'],
    EUROPE: ['Pierre', 'Hans', 'Giovanni'],
  };
  return names[region]?.[Math.floor(Math.random() * 3)] || 'Admin';
}

function getLastName(region: string): string {
  const names = {
    SPAIN: ['García', 'López', 'Martínez'],
    EUROPE: ['Dubois', 'Schmidt', 'Rossi'],
  };
  return names[region]?.[Math.floor(Math.random() * 3)] || 'User';
}

seedCompaniesAndAdmins()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### **Comando para ejecutar el seed**

```bash
# Backend Admin
cd backend/admin
npx ts-node scripts/seed-companies.ts
```

---

## 🍽️ SISTEMA DE RESERVAS DE RESTAURANTES

### **📋 Componente Implementado**

**Ubicación:** `frontend/ticketing-app/src/app/pages/restaurant-admin/restaurant-reservations/`

#### **Archivos Creados:**
- ✅ `restaurant-reservations.component.ts` - Lógica del componente
- ✅ `restaurant-reservations.component.html` - Interfaz visual
- ✅ Ruta agregada en `app.routes.ts` → `/restaurant-admin/reservations`

### **🎯 Funcionalidades Implementadas**

#### **1. Visualización de Reservas**
- Tabla completa con información detallada de cada reserva
- Columnas: Cliente, Restaurante, Fecha & Hora, Personas, Estado, Acciones
- Paginación inteligente (10 reservas por página)
- Empty state cuando no hay reservas

#### **2. Filtros Avanzados**
```typescript
Filtros disponibles:
├── Búsqueda: Por nombre de cliente, email o restaurante
├── Estado: Todos, Pendiente, Confirmada, Cancelada, Completada
└── Fecha: Filtrar por fecha específica
```

#### **3. Gestión de Estados**
El admin puede cambiar el estado de las reservas con botones de acción:
- ✅ **Confirmar** (PENDING → CONFIRMED)
- ❌ **Cancelar** (PENDING/CONFIRMED → CANCELLED)
- ✓ **Completar** (CONFIRMED → COMPLETED)

#### **4. Crear Nuevas Reservas**
Modal para que el admin cree reservas manualmente:
```typescript
Campos del formulario:
├── Nombre del cliente (requerido)
├── Email (requerido)
├── Teléfono (requerido)
├── Fecha (requerido)
├── Hora (requerido)
├── Número de personas (requerido)
└── Peticiones especiales (opcional)
```

### **📊 Modelo de Datos**

```typescript
interface Reservation {
  _id: string;
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;              // YYYY-MM-DD
  time: string;              // HH:mm
  numberOfPeople: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  specialRequests?: string;
  createdAt: string;
}
```

### **🎨 Diseño Visual**

#### **Colores de Estado (Badges):**
```css
PENDING:   bg-yellow-500/20 text-yellow-400 border border-yellow-500/30
CONFIRMED: bg-green-500/20 text-green-400 border border-green-500/30
CANCELLED: bg-red-500/20 text-red-400 border border-red-500/30
COMPLETED: bg-blue-500/20 text-blue-400 border border-blue-500/30
```

#### **Paginación:**
- Botones: Primera (««), Anterior (‹), Números, Siguiente (›), Última (»»)
- Números inteligentes con puntos suspensivos
- Estilo empresarial: `bg-gray-600`, `rounded-full`, `hover:scale-105`

### **🔗 Integración con Usuarios**

#### **Campos de Usuario Disponibles (MongoDB):**
```typescript
interface IUser {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;          // ✅ Campo disponible
  address?: string;
  city?: string;
  country?: string;
  // ... otros campos
}
```

**✅ El campo `phone` ya existe en el modelo de usuarios**

Cuando se implemente el sistema de reservas completo:
- Los usuarios autenticados podrán hacer reservas
- Se usarán automáticamente sus datos: `firstName`, `lastName`, `email`, `phone`
- El admin podrá ver todas las reservas de todos los usuarios

### **📝 Estado Actual del Componente**

#### **✅ Implementado:**
- [x] Estructura completa del componente
- [x] Interfaz visual con tabla y filtros
- [x] Paginación inteligente
- [x] Modal de creación de reservas
- [x] Botones de gestión de estados
- [x] Diseño empresarial consistente
- [x] Ruta configurada en app.routes.ts

#### **⏳ Pendiente de Implementar:**
- [ ] Servicio Angular para comunicación con backend
- [ ] Endpoints de backend para CRUD de reservas
- [ ] Modelo de Reservation en MongoDB
- [ ] Integración con usuarios autenticados
- [ ] Notificaciones de confirmación/cancelación
- [ ] Validaciones de disponibilidad de mesas
- [ ] Sistema de horarios disponibles

### **🔌 Endpoints Necesarios (Backend)**

```typescript
// Endpoints a implementar en festival-services

// Obtener todas las reservas (filtradas por restaurante del admin)
GET /api/reservations
Query: {
  restaurantId?: string,
  status?: string,
  date?: string,
  page?: number,
  limit?: number
}

// Obtener una reserva específica
GET /api/reservations/:id

// Crear nueva reserva (admin o usuario)
POST /api/reservations
Body: {
  restaurantId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  date: string,
  time: string,
  numberOfPeople: number,
  specialRequests?: string
}

// Actualizar estado de reserva
PATCH /api/reservations/:id/status
Body: {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

// Eliminar reserva
DELETE /api/reservations/:id
```

### **🎯 Próximos Pasos**

1. **Backend:**
   - Crear modelo `Reservation` en MongoDB
   - Implementar controller y service de reservas
   - Agregar validaciones de disponibilidad
   - Integrar con sistema de notificaciones

2. **Frontend:**
   - Crear `ReservationService` en Angular
   - Conectar componente con servicio real
   - Implementar validaciones en formulario
   - Agregar confirmaciones con SweetAlert2

3. **Integración:**
   - Permitir a usuarios finales hacer reservas desde shop
   - Notificar al admin cuando hay nueva reserva
   - Notificar al usuario cuando se confirma/cancela
   - Sistema de recordatorios automáticos

---

## 🎉 ACTUALIZACIÓN FINAL - 25 de Octubre, 2025

### **✅ SISTEMA DE ÓRDENES COMPLETO IMPLEMENTADO**

**Backend (festival-services):**
- ✅ Schema `Order` en MongoDB con todos los campos
- ✅ Controller y Service de órdenes implementados
- ✅ Endpoint POST /api/orders para crear paquetes completos
- ✅ Actualización automática de stock, reservas y asientos
- ✅ Validaciones de disponibilidad
- ✅ Integración con tickets, viajes, restaurantes y merchandising

**Funcionalidades:**
- ✅ Compra de paquetes completos (tickets + viajes + restaurantes + merchandising)
- ✅ Actualización automática de `Trip.bookedSeats`
- ✅ Actualización automática de `Restaurant.currentOccupancy`
- ✅ Actualización automática de `Product.stock.available` y `soldUnits`
- ✅ Cálculo de totales con impuestos
- ✅ Estados de orden y pago

### **✅ SISTEMA DE BACKUP/RESTORE V3.0 ULTRA SEGURO**

**Scripts Actualizados:**
- ✅ `backup.ps1` - Verificación completa de 9 colecciones MongoDB
- ✅ `backup_linux.sh` - Versión Linux/Mac actualizada
- ✅ `restore_safe.ps1` - NUEVO: Modo DRY RUN + verificación exhaustiva
- ✅ `restore_safe.sh` - NUEVO: Versión Linux/Mac equivalente
- ✅ `verify-database.ps1` - Actualizado con todas las colecciones

**Características V3.0:**
- ✅ Modo DRY RUN para simular sin hacer cambios
- ✅ Análisis previo del backup (cuenta registros esperados)
- ✅ Captura estado ANTES de restaurar
- ✅ Comparación detallada DESPUÉS de restaurar
- ✅ Verificación que TODO coincida
- ✅ Confirmación explícita (escribir "SI")
- ✅ Compatible Windows (PowerShell) y Linux/Mac (Bash)

**Colecciones Verificadas:**
- ✅ PostgreSQL: Events, Venues, Categories, Subcategories, Orders, Tickets, Admins, Companies, Company Admins
- ✅ MongoDB ticketing: users
- ✅ MongoDB festival_services: restaurants, reservations, trips, bookings, products, carts, orderitems, orders

**Backup Realizado:**
- ✅ Backup completo del 25/10/2025
- ✅ 438 eventos totales
- ✅ 97 venues totales
- ✅ 6 usuarios
- ✅ 839 restaurantes
- ✅ 839 viajes
- ✅ 2,532 productos
- ✅ Sistema de órdenes incluido

---

**Fecha de creación:** 24 de Octubre, 2025  
**Última actualización:** 25 de Octubre, 2025 - 13:05  
**Estado:** 🎉 SISTEMA DE ÓRDENES COMPLETO + BACKUP/RESTORE V3.0 ULTRA SEGURO  
**Versión:** 3.0
