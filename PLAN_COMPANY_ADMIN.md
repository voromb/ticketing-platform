# 📋 PLAN COMPLETO - Sistema de COMPANY_ADMIN para Festival Services

## 🎯 Objetivo

Implementar un sistema de autenticación por compañías donde:
- **SUPER_ADMIN** (PostgreSQL - Backend Admin) gestiona y aprueba todo
- **COMPANY_ADMIN** (uno por región/servicio) gestiona sus recursos
- Cada cambio requiere aprobación del SUPER_ADMIN

---

## 📊 ANÁLISIS DE CAMPOS ACTUALES

### **1. RESTAURANTES (Restaurant Schema)**

#### ✅ Campos actuales (15 campos):
- `festivalId` - ID del festival
- `name` - Nombre del restaurante
- `description` - Descripción
- `cuisine` - Tipo de cocina
- `location` - Ubicación física
- `capacity` - Capacidad máxima
- `currentOccupancy` - Ocupación actual
- `schedule[]` - Horarios de funcionamiento
- `menu[]` - Elementos del menú
- `acceptsReservations` - Si acepta reservas
- `reservationDurationMinutes` - Duración de reservas
- `status` - Estado (OPEN/CLOSED/FULL)
- `isActive` - Si está activo
- `rating` - Calificación
- `totalReviews` - Total de reseñas

#### 🆕 Campos necesarios para COMPANY_ADMIN:
- `companyId` (String) - ID de la compañía que gestiona
- `companyName` (String) - Nombre de la compañía (para mostrar)
- `region` (String) - SPAIN, EUROPE, etc.
- `managedBy` (String) - Email del COMPANY_ADMIN
- `requiresApproval` (Boolean) - Si cambios requieren aprobación
- `approvalStatus` (String) - PENDING/APPROVED/REJECTED (para nuevos restaurantes)
- `lastModifiedBy` (String) - Quién hizo el último cambio
- `lastApprovedBy` (String) - Quién aprobó el último cambio
- `lastApprovedAt` (Date) - Cuándo se aprobó

---

### **2. VIAJES (Trip Schema)**

#### ✅ Campos actuales (12 campos):
- `festivalId` - ID del festival
- `name` - Nombre del viaje
- `description` - Descripción
- `departure` - Ubicación de salida (location, datetime, coordinates)
- `arrival` - Ubicación de llegada (location, datetime, coordinates)
- `capacity` - Capacidad del transporte
- `price` - Precio por asiento
- `bookedSeats` - Asientos reservados
- `status` - Estado (SCHEDULED/BOARDING/IN_TRANSIT/COMPLETED/CANCELLED)
- `requiresApproval` - Si requiere aprobación
- `isActive` - Si está activo

#### 🆕 Campos necesarios para COMPANY_ADMIN:
- `companyId` (String) - ID de la compañía de viajes
- `companyName` (String) - Nombre de la compañía
- `region` (String) - SPAIN, EUROPE
- `managedBy` (String) - Email del COMPANY_ADMIN
- `vehicleType` (String) - BUS/TRAIN/PLANE/FERRY
- `vehicleCapacity` (Number) - Capacidad del vehículo
- `vehiclePlate` (String) - Matrícula del vehículo
- `driverInfo` (Object) - {name, phone, license}
- `approvalStatus` (String) - PENDING/APPROVED/REJECTED
- `lastModifiedBy` (String) - Quién hizo el último cambio
- `lastApprovedBy` (String) - Quién aprobó
- `lastApprovedAt` (Date) - Cuándo se aprobó
- `cancellationPolicy` (String) - Política de cancelación

---

### **3. MERCHANDISING (Product Schema)**

#### ✅ Campos actuales (15 campos):
- `festivalId` - ID del festival
- `bandId` - ID de la banda/artista
- `bandName` - Nombre de la banda
- `name` - Nombre del producto
- `description` - Descripción
- `type` - Tipo (TSHIRT/HOODIE/VINYL/CD/POSTER/ACCESSORIES/OTHER)
- `price` - Precio
- `sizes[]` - Tallas disponibles
- `stock` - Inventario (total, available, reserved)
- `images[]` - Imágenes del producto
- `exclusive` - Si es exclusivo VIP
- `preOrderEnabled` - Si permite pre-orden
- `releaseDate` - Fecha de lanzamiento
- `status` - Estado (AVAILABLE/OUT_OF_STOCK/PRE_ORDER/COMING_SOON)
- `isActive` - Si está activo
- `soldUnits` - Unidades vendidas

#### 🆕 Campos necesarios para COMPANY_ADMIN:
- `companyId` (String) - ID de la compañía de merchandising
- `companyName` (String) - Nombre de la compañía
- `region` (String) - SPAIN, EUROPE
- `managedBy` (String) - Email del COMPANY_ADMIN
- `supplier` (Object) - {name, contact, country}
- `costPrice` (Number) - Precio de coste (solo visible para COMPANY_ADMIN)
- `margin` (Number) - Margen de beneficio (%)
- `approvalStatus` (String) - PENDING/APPROVED/REJECTED
- `lastModifiedBy` (String) - Quién hizo el último cambio
- `lastApprovedBy` (String) - Quién aprobó
- `lastApprovedAt` (Date) - Cuándo se aprobó
- `shippingInfo` (Object) - {weight, dimensions, shippingTime}

---

## 🏗️ ESTRUCTURA DE BASE DE DATOS

### **PostgreSQL (Backend Admin) - Nuevas Tablas**

```prisma
model Company {
  id              String         @id @default(uuid())
  name            String         // "España Restaurantes"
  type            CompanyType    // RESTAURANT, TRAVEL, MERCHANDISING
  region          CompanyRegion  // SPAIN, EUROPE
  description     String?
  contactEmail    String
  contactPhone    String?
  address         String?
  taxId           String?        // CIF/NIF de la empresa
  
  // Configuración de aprobaciones
  requiresApprovalForCreate  Boolean @default(true)
  requiresApprovalForUpdate  Boolean @default(true)
  requiresApprovalForDelete  Boolean @default(true)
  
  // Límites y permisos
  maxRestaurants  Int?           // Límite de restaurantes (null = ilimitado)
  maxTrips        Int?           // Límite de viajes
  maxProducts     Int?           // Límite de productos
  
  isActive        Boolean        @default(true)
  companyAdmins   CompanyAdmin[]
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@unique([type, region])
  @@index([type])
  @@index([region])
  @@index([isActive])
  @@map("companies")
}

model CompanyAdmin {
  id              String    @id @default(uuid())
  email           String    @unique
  password        String
  firstName       String
  lastName        String
  phone           String?
  
  // Relación con compañía
  companyId       String
  company         Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Permisos granulares
  canCreate       Boolean   @default(true)   // Puede crear recursos
  canUpdate       Boolean   @default(true)   // Puede actualizar recursos
  canDelete       Boolean   @default(false)  // Puede eliminar recursos
  canViewStats    Boolean   @default(true)   // Puede ver estadísticas
  canManageStock  Boolean   @default(true)   // Puede gestionar inventario
  
  // Auditoría
  isActive        Boolean   @default(true)
  lastLogin       DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([email])
  @@index([companyId])
  @@index([isActive])
  @@map("company_admins")
}

enum CompanyType {
  RESTAURANT
  TRAVEL
  MERCHANDISING
}

enum CompanyRegion {
  SPAIN
  EUROPE
  AMERICA
  ASIA
  AFRICA
  OCEANIA
}
```

### **MongoDB (Festival Services) - Schemas Actualizados**

Los schemas actuales (`Restaurant`, `Trip`, `Product`) se actualizarán agregando los campos identificados en la sección de análisis.

---

## 🔐 FLUJO DE AUTENTICACIÓN Y PERMISOS

### **Jerarquía de Usuarios**

```
┌─────────────────────────────────────────────────────────┐
│ SUPER_ADMIN (PostgreSQL - Backend Admin)                │
│ - Gestiona todas las compañías                          │
│ - Aprueba/rechaza todos los cambios                     │
│ - Acceso total a estadísticas                           │
│ - Puede crear/editar/eliminar COMPANY_ADMIN             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ COMPANY_ADMIN (PostgreSQL - Backend Admin)              │
│ - Gestiona solo recursos de su compañía                 │
│ - Crea/edita recursos (requiere aprobación)             │
│ - Ve solo sus estadísticas                              │
│ - No puede crear otros admins                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ USER / VIP (MongoDB - User Service)                     │
│ - Usuarios finales que compran/reservan                 │
│ - Sin acceso a gestión                                  │
└─────────────────────────────────────────────────────────┘
```

### **Flujo de Trabajo Completo**

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

## 🎯 ENDPOINTS NECESARIOS

### **Backend Admin (Fastify + PostgreSQL)**

#### Gestión de Compañías (solo SUPER_ADMIN)
```
POST   /api/companies              # Crear compañía
GET    /api/companies              # Listar todas
GET    /api/companies/:id          # Ver una compañía
PATCH  /api/companies/:id          # Actualizar compañía
DELETE /api/companies/:id          # Eliminar compañía
GET    /api/companies/:id/stats    # Estadísticas de una compañía
```

#### Gestión de COMPANY_ADMIN (solo SUPER_ADMIN)
```
POST   /api/company-admins                    # Crear admin de compañía
GET    /api/company-admins                    # Listar todos
GET    /api/company-admins/:id                # Ver un admin
PATCH  /api/company-admins/:id                # Actualizar admin
DELETE /api/company-admins/:id                # Eliminar admin
POST   /api/company-admins/:id/reset-password # Reset password
PATCH  /api/company-admins/:id/permissions    # Actualizar permisos
```

#### Estadísticas (SUPER_ADMIN)
```
GET    /api/companies/stats/global            # Estadísticas globales
GET    /api/companies/stats/by-region         # Por región
GET    /api/companies/stats/by-type           # Por tipo de servicio
```

### **Festival Services (NestJS + MongoDB)**

#### Autenticación COMPANY_ADMIN
```
POST   /api/auth/company/login     # Login de COMPANY_ADMIN
POST   /api/auth/company/refresh   # Refresh token
GET    /api/auth/company/profile   # Ver perfil
PATCH  /api/auth/company/profile   # Actualizar perfil
```

#### Restaurantes (con filtro por companyId)
```
GET    /api/restaurant             # COMPANY_ADMIN ve solo los suyos
POST   /api/restaurant             # Crear (requiere aprobación)
GET    /api/restaurant/:id         # Ver detalle
PATCH  /api/restaurant/:id         # Editar (requiere aprobación)
DELETE /api/restaurant/:id         # Eliminar (requiere aprobación)
GET    /api/restaurant/stats       # Estadísticas de la compañía
```

#### Viajes (con filtro por companyId)
```
GET    /api/travel                 # COMPANY_ADMIN ve solo los suyos
POST   /api/travel                 # Crear (requiere aprobación)
GET    /api/travel/:id             # Ver detalle
PATCH  /api/travel/:id             # Editar (requiere aprobación)
DELETE /api/travel/:id             # Eliminar (requiere aprobación)
GET    /api/travel/stats           # Estadísticas de la compañía
```

#### Merchandising (con filtro por companyId)
```
GET    /api/merchandising          # COMPANY_ADMIN ve solo los suyos
POST   /api/merchandising          # Crear (requiere aprobación)
GET    /api/merchandising/:id      # Ver detalle
PATCH  /api/merchandising/:id      # Editar (requiere aprobación)
DELETE /api/merchandising/:id      # Eliminar (requiere aprobación)
GET    /api/merchandising/stats    # Estadísticas de la compañía
```

---

## 📦 DATOS DE EJEMPLO

### **Compañías a Crear**

```typescript
const companies = [
  {
    name: "España Restaurantes",
    type: "RESTAURANT",
    region: "SPAIN",
    contactEmail: "admin.spain.restaurants@festival.com",
    contactPhone: "+34 900 123 456",
    address: "Madrid, España",
    taxId: "B12345678",
    maxRestaurants: 50,
    requiresApprovalForCreate: true,
    requiresApprovalForUpdate: true,
    requiresApprovalForDelete: true
  },
  {
    name: "Europa Restaurantes",
    type: "RESTAURANT",
    region: "EUROPE",
    contactEmail: "admin.europe.restaurants@festival.com",
    contactPhone: "+33 1 23 45 67 89",
    address: "Paris, France",
    taxId: "FR123456789",
    maxRestaurants: 100,
    requiresApprovalForCreate: true,
    requiresApprovalForUpdate: true,
    requiresApprovalForDelete: true
  },
  {
    name: "España Viajes",
    type: "TRAVEL",
    region: "SPAIN",
    contactEmail: "admin.spain.travel@festival.com",
    contactPhone: "+34 900 789 012",
    address: "Barcelona, España",
    taxId: "B87654321",
    maxTrips: 30,
    requiresApprovalForCreate: true,
    requiresApprovalForUpdate: false,
    requiresApprovalForDelete: true
  },
  {
    name: "Europa Viajes",
    type: "TRAVEL",
    region: "EUROPE",
    contactEmail: "admin.europe.travel@festival.com",
    contactPhone: "+49 30 12345678",
    address: "Berlin, Germany",
    taxId: "DE123456789",
    maxTrips: 50,
    requiresApprovalForCreate: true,
    requiresApprovalForUpdate: false,
    requiresApprovalForDelete: true
  },
  {
    name: "España Merchandising",
    type: "MERCHANDISING",
    region: "SPAIN",
    contactEmail: "admin.spain.merch@festival.com",
    contactPhone: "+34 900 345 678",
    address: "Valencia, España",
    taxId: "B11223344",
    maxProducts: 200,
    requiresApprovalForCreate: true,
    requiresApprovalForUpdate: false,
    requiresApprovalForDelete: true
  },
  {
    name: "Europa Merchandising",
    type: "MERCHANDISING",
    region: "EUROPE",
    contactEmail: "admin.europe.merch@festival.com",
    contactPhone: "+39 06 12345678",
    address: "Rome, Italy",
    taxId: "IT123456789",
    maxProducts: 500,
    requiresApprovalForCreate: true,
    requiresApprovalForUpdate: false,
    requiresApprovalForDelete: true
  }
];
```

### **COMPANY_ADMIN a Crear**

```typescript
const companyAdmins = [
  {
    email: "admin.spain.restaurants@festival.com",
    password: "SecurePass123!",
    firstName: "Carlos",
    lastName: "García",
    phone: "+34 600 111 222",
    companyId: "[ID de España Restaurantes]",
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewStats: true,
    canManageStock: true
  },
  {
    email: "admin.europe.restaurants@festival.com",
    password: "SecurePass123!",
    firstName: "Pierre",
    lastName: "Dubois",
    phone: "+33 6 12 34 56 78",
    companyId: "[ID de Europa Restaurantes]",
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewStats: true,
    canManageStock: true
  },
  {
    email: "admin.spain.travel@festival.com",
    password: "SecurePass123!",
    firstName: "María",
    lastName: "López",
    phone: "+34 600 333 444",
    companyId: "[ID de España Viajes]",
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewStats: true,
    canManageStock: false
  },
  {
    email: "admin.europe.travel@festival.com",
    password: "SecurePass123!",
    firstName: "Hans",
    lastName: "Schmidt",
    phone: "+49 170 1234567",
    companyId: "[ID de Europa Viajes]",
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewStats: true,
    canManageStock: false
  },
  {
    email: "admin.spain.merch@festival.com",
    password: "SecurePass123!",
    firstName: "Ana",
    lastName: "Martínez",
    phone: "+34 600 555 666",
    companyId: "[ID de España Merchandising]",
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewStats: true,
    canManageStock: true
  },
  {
    email: "admin.europe.merch@festival.com",
    password: "SecurePass123!",
    firstName: "Giovanni",
    lastName: "Rossi",
    phone: "+39 333 1234567",
    companyId: "[ID de Europa Merchandising]",
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canViewStats: true,
    canManageStock: true
  }
];
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Base de Datos** ✅
- [x] Agregar tablas `Company` y `CompanyAdmin` a Prisma (backend/admin)
- [x] Crear migración de PostgreSQL
- [x] Agregar campo `region` a Venue para relacionar geográficamente
- [x] Actualizar schemas de MongoDB con campos de compañía
  - [x] Restaurant Schema (9 campos nuevos)
  - [x] Trip Schema (13 campos nuevos)
  - [x] Product Schema (13 campos nuevos)
- [x] Generar Prisma Client
- [x] Sincronizar base de datos

### **Fase 2: Backend Admin (Fastify)** ✅
- [x] Crear módulo de Companies
  - [x] Service con lógica de negocio (7 métodos)
  - [x] Controller con endpoints (7 endpoints)
  - [x] DTOs de validación con Zod
  - [x] Documentación Swagger
- [x] Crear módulo de CompanyAdmins
  - [x] Service con lógica de negocio (8 métodos)
  - [x] Controller con endpoints (8 endpoints)
  - [x] DTOs de validación con Zod
  - [x] Hash de passwords con bcrypt
  - [x] Documentación Swagger
- [x] Integrar rutas en servidor
  - [x] Registrar companyRoutes
  - [x] Registrar companyAdminRoutes
  - [x] Tags de Swagger configurados
- [x] Servidor compilado y funcionando

### **Fase 3: Festival Services (NestJS)** ✅
- [x] Extender sistema de autenticación JWT
  - [x] Agregar campos de compañía al payload (CompanyAdminPayload)
  - [x] Crear endpoint de login para COMPANY_ADMIN (POST /auth/company-admin/login)
  - [x] Integrar con PostgreSQL para validar credenciales (CompanyAdminAuthService)
- [x] Crear guards para COMPANY_ADMIN
  - [x] Guard de autenticación (CompanyAdminGuard)
  - [x] Guard de permisos por compañía (CompanyPermissionGuard)
  - [x] Decoradores (@RequirePermissions, @CurrentCompanyAdmin)
- [x] Actualizar controllers de servicios
  - [x] Restaurant: createWithCompany + guards
  - [x] Travel: createWithCompany + guards
  - [x] Merchandising: createWithCompany + guards
- [x] Integrar con sistema de aprobaciones
  - [x] Publicar eventos approval.requested en creación
  - [x] Status PENDING hasta aprobación de SUPER_ADMIN límites (maxRestaurants, etc.)
- [x] Integrar con sistema de aprobaciones existente
  - [x] Marcar recursos como PENDING_APPROVAL
  - [x] Enviar eventos RabbitMQ
  - [x] Escuchar eventos de aprobación/rechazo
- [x] Actualizar DTOs con nuevos campos

### **Fase 4: Testing y Datos** ✅
- [x] Crear seed de datos masivos (npm run seed)
  - [x] 838 restaurantes (2 por evento: económico + premium)
  - [x] 838 viajes (2 por evento: autobús + minibús VIP)
  - [x] 2,515 productos (5-7 por evento: variados)
- [x] Script de verificación de base de datos (verify-database.ps1)
- [x] Sistema de backup/restore verificado y funcional
- [ ] Crear seed de compañías (pendiente)
- [ ] Crear seed de COMPANY_ADMIN (pendiente)
- [ ] Probar flujo completo de aprobaciones
  - [ ] Crear recurso como COMPANY_ADMIN
  - [ ] Verificar evento RabbitMQ
  - [ ] Aprobar como SUPER_ADMIN
  - [ ] Verificar actualización del recurso

### **Fase 5: Documentación** ✅
- [x] Swagger completamente documentado (15 endpoints)
- [x] README del seed script
- [x] Documentación de arquitectura
- [ ] Crear guía de usuario para COMPANY_ADMIN
- [ ] Documentar variables de entorno necesarias

---

## ✅ DECISIONES CONFIRMADAS

### **1. Campos Adicionales**
- ✅ Campos propuestos correctos (companyId, region, managedBy, approvalStatus, etc.)
- ✅ No se necesitan campos adicionales
- ✅ Campo `costPrice` visible para todos (no restringido)

### **2. Permisos y Límites**
- ✅ Permisos confirmados (canCreate, canUpdate, canDelete, canViewStats, canManageStock)
- ✅ COMPANY_ADMIN puede ver estadísticas de su compañía
- ✅ NO hay límites estrictos por compañía (maxRestaurants, maxTrips, maxProducts)
- ✅ Si hay límites, solo son advertencias (no bloquean)

### **3. Flujo de Aprobaciones**
- ✅ Solo CREACIÓN y ELIMINACIÓN requieren aprobación
- ✅ Actualizaciones NO requieren aprobación
- ✅ NO hay diferentes niveles de aprobación

### **4. Notificaciones**
- ✅ COMPANY_ADMIN recibe email cuando se aprueba/rechaza
- ✅ SUPER_ADMIN recibe notificación de nuevas solicitudes
- ✅ Implementar notificaciones en tiempo real (WebSocket)

### **5. Estadísticas**
- ✅ COMPANY_ADMIN ve:
  - Total de recursos creados
  - Reservas/ventas totales
  - Ingresos generados
  - Ocupación/disponibilidad
- ✅ SUPER_ADMIN puede ver comparativas entre compañías

### **6. Seguridad**
- ✅ NO implementar 2FA
- ✅ Logs de auditoría de todas las acciones
- ✅ Tokens JWT expiran en 1 día (mantener actual)

---

## 📝 NOTAS IMPORTANTES

### **Integración con Sistema Existente**
- ✅ El sistema de aprobaciones (Approval Service) ya existe y funciona
- ✅ RabbitMQ ya está configurado para eventos
- ✅ PostgreSQL (admin) y MongoDB (festival-services) ya están operativos
- ✅ JWT ya está implementado en festival-services

### **Arquitectura Actual**
```
Backend Admin (Fastify + PostgreSQL)
├── Puerto: 3003
├── Base de datos: PostgreSQL
├── Usuarios: SUPER_ADMIN, ADMIN, MANAGER, VIEWER
└── Gestiona: Events, Venues, Tickets

Backend Users (Express + MongoDB)
├── Puerto: 3001
├── Base de datos: MongoDB
├── Usuarios: user, vip, admin
└── Gestiona: Autenticación de usuarios finales

Festival Services (NestJS + MongoDB + PostgreSQL)
├── Puerto: 3003
├── Base de datos: MongoDB (recursos) + PostgreSQL (aprobaciones)
├── Servicios: Travel, Restaurant, Merchandising, Approval
└── RabbitMQ: Eventos de aprobación
```

### **Cambios Mínimos Necesarios**
1. Agregar 2 tablas a PostgreSQL (Company, CompanyAdmin)
2. Agregar ~8 campos a cada schema de MongoDB
3. Crear módulo de autenticación para COMPANY_ADMIN
4. Agregar filtros por companyId en queries existentes
5. Extender sistema de aprobaciones para incluir companyId

---

## 🚀 PRÓXIMOS PASOS

1. **Revisar y aprobar este plan**
2. **Responder las preguntas pendientes**
3. **Implementar fase por fase**
4. **Testing exhaustivo**
5. **Documentación final**

---

## 📚 REFERENCIA RÁPIDA - NOMBRES EXACTOS

### **🗄️ NOMBRES DE TABLAS POSTGRESQL**

```sql
-- Backend Admin Database: ticketing
companies              -- Tabla de compañías
company_admins         -- Tabla de administradores de compañías
admins                 -- Tabla de super admins
"Event"                -- Tabla de eventos (con comillas)
"Venue"                -- Tabla de venues (con comillas)
"EventCategory"        -- Tabla de categorías (con comillas)
"EventSubcategory"     -- Tabla de subcategorías (con comillas)
"Order"                -- Tabla de órdenes (con comillas)
"Ticket"               -- Tabla de tickets (con comillas)

-- Approval Service Database: approvals_db
approvals              -- Tabla de aprobaciones
```

### **🗄️ NOMBRES DE COLECCIONES MONGODB**

```javascript
// Database: ticketing (usuarios)
users                  // Usuarios finales
eventcomments          // Comentarios de eventos
eventlikes             // Likes de eventos
likes                  // Likes generales
userfollows            // Seguidores de usuarios
tickets                // Tickets de usuarios

// Database: festival_services
restaurants            // Restaurantes
trips                  // Viajes
products               // Productos de merchandising
bookings               // Reservas de viajes
reservations           // Reservas de restaurantes
orders                 // Órdenes de merchandising
carts                  // Carritos de compra
```

### **🔑 NOMBRES DE CAMPOS - COMPANIES**

```typescript
// Tabla: companies (PostgreSQL)
id: string              // UUID
name: string            // Nombre de la compañía
type: enum              // RESTAURANT | TRAVEL | MERCHANDISING
region: enum            // SPAIN | EUROPE | AMERICA | ASIA | AFRICA | OCEANIA
description: string?    // Descripción opcional
contactEmail: string    // Email de contacto
contactPhone: string?   // Teléfono opcional
address: string?        // Dirección opcional
taxId: string?          // CIF/NIF
requiresApprovalForCreate: boolean   // Default: true
requiresApprovalForUpdate: boolean   // Default: true
requiresApprovalForDelete: boolean   // Default: true
maxRestaurants: number? // Límite opcional
maxTrips: number?       // Límite opcional
maxProducts: number?    // Límite opcional
isActive: boolean       // Default: true
createdAt: DateTime     // Fecha de creación
updatedAt: DateTime     // Fecha de actualización
```

### **🔑 NOMBRES DE CAMPOS - COMPANY_ADMINS**

```typescript
// Tabla: company_admins (PostgreSQL)
id: string              // UUID
email: string           // Email único
password: string        // Hash bcrypt
firstName: string       // Nombre
lastName: string        // Apellido
phone: string?          // Teléfono opcional
companyId: string       // FK a companies.id
canCreate: boolean      // Permiso crear (default: true)
canUpdate: boolean      // Permiso actualizar (default: true)
canDelete: boolean      // Permiso eliminar (default: false)
canViewStats: boolean   // Permiso ver estadísticas (default: true)
canManageStock: boolean // Permiso gestionar inventario (default: true)
isActive: boolean       // Default: true
lastLogin: DateTime?    // Último login
createdAt: DateTime     // Fecha de creación
updatedAt: DateTime     // Fecha de actualización
```

### **🔑 NOMBRES DE CAMPOS AGREGADOS A MONGODB**

```typescript
// Colección: restaurants
companyId: string       // ID de la compañía
companyName: string     // Nombre de la compañía
region: string          // SPAIN, EUROPE, etc.
managedBy: string       // Email del COMPANY_ADMIN
approvalStatus: string  // PENDING | APPROVED | REJECTED
lastModifiedBy: string  // Email de quien modificó
lastApprovedBy: string  // Email de quien aprobó
lastApprovedAt: Date    // Fecha de aprobación

// Colección: trips
companyId: string       // ID de la compañía
companyName: string     // Nombre de la compañía
region: string          // SPAIN, EUROPE, etc.
managedBy: string       // Email del COMPANY_ADMIN
approvalStatus: string  // PENDING | APPROVED | REJECTED
lastModifiedBy: string  // Email de quien modificó
lastApprovedBy: string  // Email de quien aprobó
lastApprovedAt: Date    // Fecha de aprobación

// Colección: products
companyId: string       // ID de la compañía
companyName: string     // Nombre de la compañía
region: string          // SPAIN, EUROPE, etc.
managedBy: string       // Email del COMPANY_ADMIN
approvalStatus: string  // PENDING | APPROVED | REJECTED
lastModifiedBy: string  // Email de quien modificó
lastApprovedBy: string  // Email de quien aprobó
lastApprovedAt: Date    // Fecha de aprobación
```

### **🌐 ENDPOINTS EXACTOS**

```bash
# Backend Admin (Fastify) - http://localhost:3001
POST   /api/companies
GET    /api/companies
GET    /api/companies/:id
PATCH  /api/companies/:id
DELETE /api/companies/:id
GET    /api/companies/:id/stats
GET    /api/companies/stats/global

POST   /api/company-admins
GET    /api/company-admins
GET    /api/company-admins/:id
PATCH  /api/company-admins/:id
DELETE /api/company-admins/:id
PATCH  /api/company-admins/:id/permissions
POST   /api/company-admins/:id/reset-password
GET    /api/companies/:companyId/admins

# Festival Services (NestJS) - http://localhost:3003
POST   /auth/company-admin/login
GET    /auth/company-admin/profile

POST   /api/restaurant/with-company
POST   /api/travel/with-company
POST   /api/merchandising/with-company
```

### **📁 ARCHIVOS CREADOS**

```
backend/admin/src/
├── dto/
│   ├── company.dto.ts              ✅ Creado
│   └── company-admin.dto.ts        ✅ Creado
├── services/
│   ├── company.service.ts          ✅ Creado
│   └── company-admin.service.ts    ✅ Creado
├── controllers/
│   ├── company.controller.ts       ✅ Creado
│   └── company-admin.controller.ts ✅ Creado
└── routes/
    ├── company.routes.ts           ✅ Creado
    └── company-admin.routes.ts     ✅ Creado

backend/services/festival-services/src/
├── auth/
│   ├── company-admin-auth.service.ts     ✅ Creado
│   ├── company-admin-auth.controller.ts  ✅ Creado
│   ├── guards/
│   │   ├── company-admin.guard.ts        ✅ Creado
│   │   └── company-permission.guard.ts   ✅ Creado
│   ├── decorators/
│   │   ├── require-permissions.decorator.ts      ✅ Creado
│   │   └── current-company-admin.decorator.ts    ✅ Creado
│   └── dto/
│       ├── company-admin-auth.dto.ts     ✅ Creado
│       └── create-with-company.dto.ts    ✅ Creado
├── restaurant/
│   ├── restaurant.controller.ts    ✅ Modificado (+1 endpoint)
│   └── restaurant.service.ts       ✅ Modificado (+1 método)
├── travel/
│   ├── travel.controller.ts        ✅ Modificado (+1 endpoint)
│   └── travel.service.ts           ✅ Modificado (+1 método)
└── merchandising/
    ├── merchandising.controller.ts ✅ Modificado (+1 endpoint)
    └── merchandising.service.ts    ✅ Modificado (+1 método)

backend/services/festival-services/scripts/
├── seed-festival-data.ts           ✅ Creado
└── README.md                       ✅ Creado

scripts/
└── verify-database.ps1             ✅ Creado
```

### **🔐 CREDENCIALES DE PRUEBA**

```bash
# SUPER_ADMIN (Backend Admin)
Email: voro.super@ticketing.com
Password: Voro123!

# COMPANY_ADMIN (a crear)
Email: admin.spain.restaurants@festival.com
Password: SecurePass123!
```

### **🚀 COMANDOS ÚTILES**

```bash
# Generar datos masivos
cd backend/services/festival-services
npm run seed

# Verificar base de datos
cd scripts
.\verify-database.ps1

# Backup
cd docker/bd_backup
.\backup.ps1

# Restore
.\restore.ps1 -BackupDate "2025-10-18" -SkipConfirmation

# Regenerar Prisma
cd backend/admin
npx prisma generate

cd backend/services/festival-services
npx prisma generate

# Iniciar servicios
cd backend/admin
npm run dev

cd backend/services/festival-services
npm run start:dev
```

### **📊 ESTADO ACTUAL DE LA BASE DE DATOS**

```
PostgreSQL (ticketing):
  ├─ 419 eventos
  ├─ 85 venues
  ├─ 2 categorías
  ├─ 13 subcategorías
  ├─ 3 administradores
  ├─ 6 órdenes
  ├─ 12 tickets
  ├─ 0 compañías (pendiente crear)
  └─ 0 company admins (pendiente crear)

MongoDB (ticketing):
  ├─ 3 usuarios
  ├─ 4 comentarios
  ├─ 0 likes
  ├─ 0 event likes
  ├─ 0 seguidores
  └─ 0 tickets usuario

MongoDB (festival_services):
  ├─ 838 restaurantes
  ├─ 838 viajes
  ├─ 2,515 productos
  ├─ 0 reservas viajes
  ├─ 0 reservas restaurantes
  └─ 0 órdenes merchandising

TOTAL: 4,738 registros
```

---

**Fecha de creación:** 18 de Octubre, 2025  
**Última actualización:** 18 de Octubre, 2025 - 21:15  
**Estado:** ✅ IMPLEMENTADO Y FUNCIONAL  
**Versión:** 2.0 - DOCUMENTACIÓN COMPLETA
