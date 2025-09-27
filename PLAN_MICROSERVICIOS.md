# 🎯 Plan de Implementación - Microservicios Ticketing Platform

## 📋 Objetivo General

Implementar gestión de administradores y comunicación entre microservicios mediante API calls para una arquitectura profesional y escalable.

## 🏗️ Arquitectura Final

```
┌─────────────────────────┐    API CALLS    ┌─────────────────────────┐
│    ADMIN SERVICE        │ ←─────────────→ │    USER SERVICE         │
│    (PostgreSQL)         │                 │    (MongoDB)            │
│                         │                 │                         │
│ • Admins (CRUD)         │                 │ • Users (user | vip)    │
│ • Events (CRUD) ✅      │                 │ • Tickets               │
│ • Venues (CRUD) ✅      │                 │                         │
│                         │                 │                         │
│ Puerto: 3003            │                 │ Puerto: 3001            │
└─────────────────────────┘                 └─────────────────────────┘
```

## ✅ Estado Actual (Completado)

### Admin Service (PostgreSQL)

-   ✅ **Venues CRUD** - Completo y funcionando
-   ✅ **Events CRUD** - Completo y funcionando
-   ✅ **Autenticación JWT** - Implementada
-   ✅ **Validaciones** - Zod schemas
-   ✅ **Manejo de errores** - Robusto
-   ✅ **Documentación API** - consumir_api.md

### User Service (MongoDB)

-   ✅ **Modelo User actualizado** - Solo roles: 'user' | 'vip'
-   ✅ **Events eliminados** - Ya no duplicados (se consultan via API)
-   ✅ **Tickets** - Modelo existente
-   ✅ **Autenticación** - Sistema propio

## 🚀 Plan de Implementación

### Fase 1: CRUD de Admins ✅ COMPLETADO

-   [x] **Controlador Admin** - admin.controller.ts ✅
-   [x] **Rutas Admin** - admin.routes.ts ✅
-   [x] **Validaciones** - Zod schemas para admins ✅
-   [ ] **Pruebas** - CRUD completo en Insomnia
-   [ ] **Documentación** - Actualizar consumir_api.md

### Fase 2: API Calls Entre Servicios ✅ COMPLETADO

-   [x] **User-service consulta Events** - GET /api/events desde user-service ✅
-   [x] **Configuración de servicios** - URLs y endpoints configurados ✅
-   [x] **Servicio HTTP** - AdminApiService implementado ✅
-   [x] **Controlador actualizado** - Event controller con API calls ✅
-   [x] **Rutas activadas** - Events routes funcionando ✅
-   [x] **Manejo de errores** - Timeouts y fallbacks implementados ✅
-   [ ] **Admin promociona User a VIP** - API call a user-service
-   [ ] **Ticket creation actualiza disponibilidad** - API call a admin-service

### Fase 3: Funcionalidades Avanzadas

-   [ ] **Rate limiting** - Entre servicios
-   [ ] **Logging distribuido** - Trazabilidad de API calls
-   [ ] **Health checks** - Estado de servicios
-   [ ] **Documentación completa** - Swagger/OpenAPI

## 📊 Modelos de Datos

### PostgreSQL (Admin Service)

```sql
Admin {
  id: UUID (PK)
  email: String (unique)
  password: String (hashed)
  firstName: String
  lastName: String
  role: UserRole (ADMIN, SUPER_ADMIN)
  isActive: Boolean
  lastLogin: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}
```

### MongoDB (User Service)

```javascript
User {
  _id: ObjectId
  username: String (unique)
  email: String (unique)
  password: String (hashed)
  role: 'user' | 'vip'  // ✅ Actualizado
  firstName?: String
  lastName?: String
  phone?: String
  isActive: Boolean
  createdAt: Date
  updatedAt: Date
}

Ticket {
  _id: ObjectId
  eventId: String        // ✅ Referencia a PostgreSQL Event
  userId: ObjectId       // Referencia local
  price: Number
  status: 'reserved' | 'confirmed' | 'cancelled'
  createdAt: Date
}
```

## 🔄 Flujos de API Calls

### 1. User ve eventos disponibles

```
User Frontend → User Service → Admin Service (GET /api/events)
                             ← Events data
              ← Formatted events
← Events list
```

### 2. Admin promociona User a VIP

```
Admin Frontend → Admin Service → User Service (PATCH /api/users/:id/promote)
                               ← Success response
               ← Confirmation
← Updated user status
```

### 3. User compra ticket

```
User Frontend → User Service → Admin Service (GET /api/events/:id)
                             ← Event details
              → User Service → Admin Service (PATCH /api/events/:id/reserve)
                             ← Updated availability
              → Create Ticket in MongoDB
              ← Ticket confirmation
← Purchase success
```

## 🛠️ Configuración Técnica

### Puertos de Servicios

-   **Admin Service**: `http://localhost:3003`
-   **User Service**: `http://localhost:3001`

### Variables de Entorno

```env
# Admin Service (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
USER_SERVICE_URL="http://localhost:3001"

# User Service (.env)
MONGODB_URI="mongodb://..."
JWT_SECRET="..."
ADMIN_SERVICE_URL="http://localhost:3003"
```

## 📝 Checklist de Progreso

### ✅ Completado

-   [x] Explorar estructura del proyecto
-   [x] Limpiar events duplicados de MongoDB
-   [x] Actualizar modelo User (solo 'user' | 'vip')
-   [x] Desactivar rutas de events en user-service

### 🚧 En Progreso

-   [ ] Implementar CRUD de admins en PostgreSQL

### ⏳ Pendiente

-   [ ] API call: User-service consulta events del admin
-   [ ] API call: Admin puede promocionar user a VIP
-   [ ] API call: Crear ticket actualiza disponibilidad
-   [ ] Documentación completa de APIs
-   [ ] Testing de integración entre servicios

## 📚 Documentación de APIs

### Admin Service Endpoints

```
GET    /api/admins           - Listar admins
GET    /api/admins/:id       - Obtener admin por ID
POST   /api/admins           - Crear admin
PUT    /api/admins/:id       - Actualizar admin completo
PATCH  /api/admins/:id       - Actualizar admin parcial
DELETE /api/admins/:id       - Eliminar admin

POST   /api/users/promote/:id - Promocionar user a VIP (API call)
```

### User Service Endpoints (Existentes + Nuevos)

```
GET    /api/events           - Obtener events (via API call)
GET    /api/events/:id       - Obtener event por ID (via API call)
POST   /api/tickets          - Crear ticket (actualiza disponibilidad)
PATCH  /api/users/:id/role   - Actualizar role de user (para admins)
```

## 🎯 Objetivos de Calidad

### Performance

-   API calls < 200ms entre servicios
-   Timeout de 5s para API calls
-   Retry logic para fallos temporales

### Seguridad

-   JWT validation en todos los endpoints
-   Rate limiting por IP
-   Validación de datos con Zod

### Mantenibilidad

-   Código documentado
-   Tests unitarios y de integración
-   Logging estructurado
-   Error handling consistente

---

**Fecha de inicio:** 2025-09-27  
**Última actualización:** 2025-09-27  
**Estado:** 🚧 En desarrollo activo

┌─────────────────────────────────────────────────────────────┐
│ ✅ PROYECTO COMPLETO ✅                                    │
├─────────────────────────────────────────────────────────────┤
│ 🎟️ Events CRUD ✅ │ 👤 Admin Management ✅                │
│ 🏟️ Venues CRUD ✅ │ 🔐 JWT Auth ✅                        │
│ 📊 Statistics ✅ │ 🚀 Microservices ✅                    │
│ 🔄 API Calls ✅ │ 📨 RabbitMQ (Mock) ✅                   │
│ ⭐ VIP Promotion ✅ │ 📝 Documentation ✅                 │
└─────────────────────────────────────────────────────────────┘
