# 📨 Sistema de Mensajería Interna - Especificación Técnica

## 🎯 Objetivo

Implementar un microservicio de mensajería interna que permita la comunicación automatizada y manual entre todos los tipos de usuarios del sistema (usuarios finales, COMPANY_ADMIN, SUPER_ADMIN) mediante notificaciones y mensajes privados.

---

## 📋 Casos de Uso

### 1. **Mensajes Automáticos - Compras**
- ✅ Usuario realiza compra → Recibe mensaje: "Gracias por comprar en Ticketing Master"
- ✅ Usuario completa pago → Recibe confirmación con detalles de la orden
- ✅ Orden cancelada → Notificación de cancelación

### 2. **Mensajes Automáticos - Aprobaciones (Restaurante)**
- ✅ COMPANY_ADMIN crea nuevo menú → Mensaje a SUPER_ADMIN: "Nuevo menú pendiente de aprobación"
- ✅ SUPER_ADMIN aprueba → Mensaje a COMPANY_ADMIN: "Tu menú ha sido aprobado"
- ✅ SUPER_ADMIN rechaza → Mensaje a COMPANY_ADMIN: "Tu menú ha sido rechazado - Razón: [...]"

### 3. **Mensajes Automáticos - Aprobaciones (Viajes)**
- ✅ COMPANY_ADMIN crea nuevo viaje → Mensaje a SUPER_ADMIN: "Nuevo viaje pendiente de aprobación"
- ✅ SUPER_ADMIN aprueba → Mensaje a COMPANY_ADMIN: "Tu viaje ha sido aprobado"
- ✅ SUPER_ADMIN rechaza → Mensaje a COMPANY_ADMIN: "Tu viaje ha sido rechazado - Razón: [...]"

### 4. **Mensajes Automáticos - Aprobaciones (Merchandising)**
- ✅ COMPANY_ADMIN crea nuevo producto → Mensaje a SUPER_ADMIN: "Nuevo producto pendiente de aprobación"
- ✅ SUPER_ADMIN aprueba → Mensaje a COMPANY_ADMIN: "Tu producto ha sido aprobado"
- ✅ SUPER_ADMIN rechaza → Mensaje a COMPANY_ADMIN: "Tu producto ha sido rechazado - Razón: [...]"

### 5. **Mensajes Manuales**
- ✅ SUPER_ADMIN puede enviar mensajes a cualquier usuario
- ✅ COMPANY_ADMIN puede enviar mensajes a SUPER_ADMIN
- ✅ Usuarios pueden enviar mensajes a soporte (SUPER_ADMIN)

---

## 🏗️ Arquitectura del Microservicio

### **Tecnologías**
- **Framework**: NestJS (TypeScript)
- **Base de Datos**: MongoDB (para mensajes y conversaciones)
- **Comunicación**: RabbitMQ (eventos entre microservicios)
- **Puerto**: 3005
- **Autenticación**: JWT (compartido con otros servicios)

### **Estructura del Proyecto**
```
backend/services/messaging-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── message/
│   │   ├── message.module.ts
│   │   ├── message.controller.ts
│   │   ├── message.service.ts
│   │   ├── schemas/
│   │   │   ├── message.schema.ts
│   │   │   └── conversation.schema.ts
│   │   └── dto/
│   │       ├── create-message.dto.ts
│   │       ├── send-notification.dto.ts
│   │       └── get-messages.dto.ts
│   ├── notification/
│   │   ├── notification.module.ts
│   │   ├── notification.controller.ts
│   │   ├── notification.service.ts
│   │   └── schemas/
│   │       └── notification.schema.ts
│   ├── rabbitmq/
│   │   ├── rabbitmq.module.ts
│   │   ├── rabbitmq.service.ts
│   │   └── listeners/
│   │       ├── order.listener.ts
│   │       ├── approval.listener.ts
│   │       └── payment.listener.ts
│   └── auth/
│       ├── auth.module.ts
│       ├── guards/
│       │   └── jwt-auth.guard.ts
│       └── strategies/
│           └── jwt.strategy.ts
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 📊 Modelos de Datos (MongoDB)

### **1. Message Schema**
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId,           // Referencia a Conversation
  senderId: string,                   // ID del remitente
  senderType: 'USER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN' | 'SYSTEM',
  senderName: string,                 // Nombre del remitente
  content: string,                    // Contenido del mensaje
  messageType: 'TEXT' | 'NOTIFICATION' | 'SYSTEM_ALERT',
  metadata: {                         // Metadata adicional
    orderId?: string,
    approvalId?: string,
    resourceType?: 'RESTAURANT' | 'TRAVEL' | 'PRODUCT',
    resourceId?: string,
    actionType?: 'PURCHASE' | 'APPROVAL' | 'REJECTION' | 'INFO'
  },
  isRead: boolean,                    // Si el mensaje ha sido leído
  readAt?: Date,                      // Cuándo fue leído
  createdAt: Date,
  updatedAt: Date
}
```

### **2. Conversation Schema**
```typescript
{
  _id: ObjectId,
  participants: [                     // Lista de participantes
    {
      userId: string,
      userType: 'USER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN',
      userName: string,
      lastReadAt?: Date               // Última vez que leyó la conversación
    }
  ],
  conversationType: 'PRIVATE' | 'SUPPORT' | 'SYSTEM',
  subject?: string,                   // Asunto de la conversación
  lastMessageAt: Date,                // Última actividad
  lastMessagePreview: string,         // Preview del último mensaje
  unreadCount: {                      // Contador de no leídos por usuario
    [userId: string]: number
  },
  isActive: boolean,                  // Si la conversación está activa
  createdAt: Date,
  updatedAt: Date
}
```

### **3. Notification Schema**
```typescript
{
  _id: ObjectId,
  userId: string,                     // Destinatario
  userType: 'USER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN',
  title: string,                      // Título de la notificación
  message: string,                    // Mensaje
  notificationType: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR',
  category: 'PURCHASE' | 'APPROVAL' | 'SYSTEM' | 'GENERAL',
  metadata: {
    orderId?: string,
    approvalId?: string,
    resourceType?: string,
    resourceId?: string,
    actionUrl?: string                // URL para acción rápida
  },
  isRead: boolean,
  readAt?: Date,
  expiresAt?: Date,                   // Fecha de expiración (opcional)
  createdAt: Date
}
```

---

## 🔄 Eventos RabbitMQ

### **Eventos que ESCUCHA el Messaging Service**

#### 1. **order.completed** (desde Admin Service)
```json
{
  "orderId": "uuid",
  "userId": "uuid",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "eventName": "Festival Rock 2025",
  "totalAmount": 150.00,
  "ticketQuantity": 2
}
```
**Acción**: Enviar mensaje de agradecimiento al usuario

---

#### 2. **payment.completed** (desde Admin Service / Festival Services)
```json
{
  "orderId": "uuid",
  "userId": "uuid",
  "userName": "John Doe",
  "amount": 150.00,
  "paymentMethod": "stripe"
}
```
**Acción**: Enviar confirmación de pago

---

#### 3. **approval.requested** (desde Festival Services)
```json
{
  "approvalId": "uuid",
  "resourceType": "RESTAURANT" | "TRAVEL" | "PRODUCT",
  "resourceId": "mongoId",
  "resourceName": "Menú Especial",
  "companyAdminId": "uuid",
  "companyAdminName": "Restaurant Admin",
  "companyName": "La Tasca",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "requestedAt": "2025-11-01T12:00:00Z"
}
```
**Acción**: Notificar a SUPER_ADMIN sobre nueva solicitud de aprobación

---

#### 4. **approval.granted** (desde Approval Service)
```json
{
  "approvalId": "uuid",
  "resourceType": "RESTAURANT" | "TRAVEL" | "PRODUCT",
  "resourceId": "mongoId",
  "resourceName": "Menú Especial",
  "companyAdminId": "uuid",
  "companyAdminName": "Restaurant Admin",
  "reviewedBy": "Super Admin",
  "reviewedAt": "2025-11-01T13:00:00Z"
}
```
**Acción**: Notificar a COMPANY_ADMIN que su recurso fue aprobado

---

#### 5. **approval.rejected** (desde Approval Service)
```json
{
  "approvalId": "uuid",
  "resourceType": "RESTAURANT" | "TRAVEL" | "PRODUCT",
  "resourceId": "mongoId",
  "resourceName": "Menú Especial",
  "companyAdminId": "uuid",
  "companyAdminName": "Restaurant Admin",
  "reviewedBy": "Super Admin",
  "rejectionReason": "Precios no competitivos",
  "reviewedAt": "2025-11-01T13:00:00Z"
}
```
**Acción**: Notificar a COMPANY_ADMIN que su recurso fue rechazado con la razón

---

#### 6. **order.cancelled** (desde Admin Service / Festival Services)
```json
{
  "orderId": "uuid",
  "userId": "uuid",
  "userName": "John Doe",
  "reason": "Cancelado por el usuario"
}
```
**Acción**: Notificar al usuario sobre la cancelación

---

### **Eventos que PUBLICA el Messaging Service**

#### 1. **message.sent**
```json
{
  "messageId": "mongoId",
  "conversationId": "mongoId",
  "recipientId": "uuid",
  "recipientType": "USER" | "COMPANY_ADMIN" | "SUPER_ADMIN",
  "sentAt": "2025-11-01T12:00:00Z"
}
```

#### 2. **notification.created**
```json
{
  "notificationId": "mongoId",
  "userId": "uuid",
  "notificationType": "SUCCESS" | "INFO" | "WARNING" | "ERROR",
  "createdAt": "2025-11-01T12:00:00Z"
}
```

---

## 🔌 API Endpoints

### **Messages**

#### `POST /api/messages/send`
Enviar un mensaje manual
```json
{
  "recipientId": "uuid",
  "recipientType": "USER" | "COMPANY_ADMIN" | "SUPER_ADMIN",
  "content": "Mensaje de texto",
  "subject": "Asunto (opcional)"
}
```

#### `GET /api/messages/conversations`
Obtener todas las conversaciones del usuario autenticado
```json
{
  "success": true,
  "data": [
    {
      "conversationId": "mongoId",
      "participants": [...],
      "lastMessage": "Preview del último mensaje",
      "unreadCount": 3,
      "lastMessageAt": "2025-11-01T12:00:00Z"
    }
  ]
}
```

#### `GET /api/messages/conversations/:conversationId`
Obtener mensajes de una conversación específica
```json
{
  "success": true,
  "data": {
    "conversation": {...},
    "messages": [
      {
        "messageId": "mongoId",
        "senderId": "uuid",
        "senderName": "John Doe",
        "content": "Hola",
        "isRead": false,
        "createdAt": "2025-11-01T12:00:00Z"
      }
    ]
  }
}
```

#### `PATCH /api/messages/:messageId/read`
Marcar mensaje como leído

#### `DELETE /api/messages/conversations/:conversationId`
Eliminar conversación (soft delete)

---

### **Notifications**

#### `GET /api/notifications`
Obtener notificaciones del usuario autenticado
```json
{
  "success": true,
  "data": [
    {
      "notificationId": "mongoId",
      "title": "Compra exitosa",
      "message": "Gracias por tu compra",
      "notificationType": "SUCCESS",
      "isRead": false,
      "createdAt": "2025-11-01T12:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

#### `GET /api/notifications/unread-count`
Obtener contador de notificaciones no leídas

#### `PATCH /api/notifications/:notificationId/read`
Marcar notificación como leída

#### `PATCH /api/notifications/mark-all-read`
Marcar todas las notificaciones como leídas

#### `DELETE /api/notifications/:notificationId`
Eliminar notificación

---

## 🎨 Integración Frontend

### **Componentes a Crear**

#### 1. **Navbar - Badge de Notificaciones**
- Icono de campana con contador de no leídas
- Dropdown con últimas 5 notificaciones
- Botón "Ver todas"

#### 2. **Página de Mensajes** (`/messages`)
- Lista de conversaciones (sidebar)
- Vista de mensajes de conversación seleccionada
- Input para enviar nuevos mensajes
- Indicador de mensajes no leídos

#### 3. **Página de Notificaciones** (`/notifications`)
- Lista de todas las notificaciones
- Filtros por tipo y categoría
- Marcar como leída/no leída
- Eliminar notificaciones

#### 4. **Panel de Admin - Mensajes**
- Vista de todas las conversaciones con usuarios
- Enviar mensajes a usuarios específicos
- Notificaciones de aprobaciones pendientes

---

## 🔐 Seguridad y Permisos

### **Reglas de Acceso**

1. **Usuarios (USER/VIP)**:
   - ✅ Ver sus propias conversaciones
   - ✅ Enviar mensajes a soporte (SUPER_ADMIN)
   - ✅ Ver sus propias notificaciones
   - ❌ No pueden enviar mensajes a otros usuarios

2. **COMPANY_ADMIN**:
   - ✅ Ver conversaciones con SUPER_ADMIN
   - ✅ Enviar mensajes a SUPER_ADMIN
   - ✅ Recibir notificaciones de aprobaciones
   - ✅ Ver sus propias notificaciones
   - ❌ No pueden enviar mensajes a usuarios finales

3. **SUPER_ADMIN**:
   - ✅ Ver todas las conversaciones
   - ✅ Enviar mensajes a cualquier usuario
   - ✅ Enviar notificaciones masivas
   - ✅ Ver todas las notificaciones del sistema

---

## 📦 Dependencias Necesarias

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/mongoose": "^10.0.0",
    "@nestjs/microservices": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "mongoose": "^8.0.0",
    "amqplib": "^0.10.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  }
}
```

---

## 🚀 Plan de Implementación

### **Fase 1: Setup Básico** (1-2 horas)
1. ✅ Crear estructura del proyecto
2. ✅ Configurar MongoDB
3. ✅ Configurar RabbitMQ
4. ✅ Implementar autenticación JWT
5. ✅ Crear schemas de MongoDB

### **Fase 2: Mensajería** (2-3 horas)
1. ✅ Implementar CRUD de mensajes
2. ✅ Implementar sistema de conversaciones
3. ✅ Implementar marcado de leído/no leído
4. ✅ Crear endpoints de API

### **Fase 3: Notificaciones** (1-2 horas)
1. ✅ Implementar CRUD de notificaciones
2. ✅ Implementar contador de no leídas
3. ✅ Crear endpoints de API

### **Fase 4: RabbitMQ Listeners** (2-3 horas)
1. ✅ Listener para `order.completed`
2. ✅ Listener para `payment.completed`
3. ✅ Listener para `approval.requested`
4. ✅ Listener para `approval.granted`
5. ✅ Listener para `approval.rejected`
6. ✅ Listener para `order.cancelled`

### **Fase 5: Integración Frontend** (3-4 horas)
1. ✅ Crear servicio de mensajería en Angular
2. ✅ Crear componente de notificaciones en navbar
3. ✅ Crear página de mensajes
4. ✅ Crear página de notificaciones
5. ✅ Integrar en paneles de admin

### **Fase 6: Testing** (1-2 horas)
1. ✅ Probar flujo de compra → mensaje
2. ✅ Probar flujo de aprobación → notificaciones
3. ✅ Probar mensajería manual
4. ✅ Probar permisos y seguridad

---

## 📝 Notas Adicionales

### **Mejoras Futuras (Opcional)**
- 🔔 WebSockets para notificaciones en tiempo real
- 📧 Integración con email para notificaciones importantes
- 🔍 Búsqueda de mensajes y conversaciones
- 📎 Adjuntar archivos en mensajes
- ⭐ Marcar conversaciones como favoritas
- 🗑️ Papelera de mensajes eliminados
- 📊 Dashboard de estadísticas de mensajería

### **Consideraciones de Rendimiento**
- Paginación en listado de mensajes (20 por página)
- Índices en MongoDB para búsquedas rápidas
- Cache de contador de no leídas
- Limpieza automática de notificaciones antiguas (>30 días)

---

## ✅ Checklist de Implementación

- [x] Crear proyecto NestJS
- [x] Configurar MongoDB
- [x] Configurar RabbitMQ
- [x] Implementar schemas
- [x] Implementar MessageService
- [x] Implementar NotificationService
- [x] Implementar RabbitMQ listeners
- [x] Crear endpoints de API
- [x] Documentar con Swagger
- [ ] Crear servicio Angular
- [ ] Crear componentes frontend
- [ ] Integrar en paneles
- [ ] Testing completo
- [ ] Documentación final

---

## 🚦 APROBACIÓN PARA COMENZAR

**¿Estás de acuerdo con esta especificación? ¿Quieres que modifique o añada algo antes de empezar la implementación?**

### ✅ Checklist de Revisión

- [ ] He leído toda la especificación
- [ ] Entiendo la arquitectura propuesta
- [ ] Estoy de acuerdo con los casos de uso
- [ ] Los modelos de datos son correctos
- [ ] Los eventos RabbitMQ cubren todas las necesidades
- [ ] Los endpoints de API son suficientes
- [ ] El plan de implementación es claro
- [ ] **APROBADO - LISTO PARA COMENZAR LA IMPLEMENTACIÓN** ✅

---

**Una vez marques el último checkbox, ¡empezamos con la Fase 1!** 🚀
