# Documentacion Swagger - Ticketing Platform

Esta guia describe como acceder y utilizar la documentacion Swagger/OpenAPI en todos los servicios del sistema de ticketing.

## Arquitectura de Servicios

El ticketing platform esta compuesto por 3 servicios backend independientes, cada uno con su propia documentacion Swagger:

| Servicio | Puerto | Framework | URL Swagger |
|----------|--------|-----------|-------------|
| **Admin Backend** | 3003 | Fastify | http://localhost:3003/api/docs |
| **User Service** | 3001 | Express | http://localhost:3001/api/docs |
| **Festival Services** | 3004 | NestJS | http://localhost:3004/api/docs |

## Inicio Rapido

### 1. Arrancar todos los servicios

```bash
# Terminal 1 - Admin Backend
cd backend/admin
npm run dev

# Terminal 2 - User Service  
cd backend/user-service
npm run dev

# Terminal 3 - Festival Services
cd backend/services/festival-services
npm run start:dev
```

### 2. Acceder a la documentacion

Una vez arrancados los servicios, puedes acceder a:

- **Admin Swagger**: [http://localhost:3003/api/docs](http://localhost:3003/api/docs)
- **User Swagger**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)  
- **Festival Swagger**: [http://localhost:3004/api/docs](http://localhost:3004/api/docs)

## Autenticacion

### JWT Bearer Token

Todos los servicios utilizan autenticacion JWT. Para probar endpoints protegidos:

1. **Obtener token de autenticacion:**
   - Usa el endpoint `POST /auth/login` en cualquier servicio
   - Proporciona credenciales validas
   - Copia el `token` de la respuesta

2. **Configurar autenticacion en Swagger:**
   - Haz clic en el boton **"Authorize"** en la interfaz Swagger
   - Ingresa: `Bearer {tu-token-aqui}`
   - Ejemplo: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Servicios Detallados

### Admin Backend (Puerto 3003)

**Funcionalidades:**
- Gestion de eventos y venues
- Administracion de categorias  
- Sistema de ordenes y reservas
- Gestion de pagos con Stripe
- Panel de auditoria
- Administracion de usuarios admin

**APIs Principales:**
- `/api/auth` - Autenticacion de administradores
- `/api/events` - CRUD de eventos
- `/api/venues` - Gestion de venues
- `/api/categories` - Categorias y subcategorias
- `/api/orders` - Sistema de ordenes
- `/api/reservations` - Reservas VIP
- `/api/payments` - Procesamiento de pagos
- `/api/audit` - Logs de auditoria

### User Service (Puerto 3001)

**Funcionalidades:**
- Autenticacion de usuarios finales
- Gestion de perfiles de usuario
- Sistema de favoritos
- Notificaciones

**APIs Principales:**
- `/api/auth` - Login/registro de usuarios
- `/api/users` - Gestion de perfiles
- `/api/favorites` - Sistema de favoritos
- `/api/notifications` - Gestion de notificaciones

### Festival Services (Puerto 3004)

**Funcionalidades:**
- Servicios complementarios del festival
- Sistema de aprobaciones
- Gestion de restaurantes
- Servicios de viaje
- Merchandising

**APIs Principales:**
- `/auth` - Autenticacion de servicios
- `/approval` - Sistema de aprobaciones
- `/restaurant` - Reservas de restaurantes
- `/travel` - Servicios de viaje
- `/merchandising` - Productos y pedidos

## Caracteristicas Tecnicas

### Esquemas OpenAPI 3.0

Todos los servicios implementan OpenAPI 3.0 con:

- **Esquemas de datos**: Modelos completos de request/response
- **Validacion**: Tipos, formatos y restricciones
- **Seguridad**: JWT Bearer authentication
- **Ejemplos**: Datos de ejemplo para todas las APIs
- **Codigos de estado**: Documentacion de respuestas HTTP

### Compatibilidad de Frameworks

| Framework | Implementacion | Caracteristicas |
|-----------|---------------|-----------------|
| **Fastify** | `@fastify/swagger` | Esquemas inline, validacion automatica |
| **Express** | `swagger-jsdoc` + `swagger-ui-express` | Documentacion con decoradores |
| **NestJS** | `@nestjs/swagger` | Decoradores nativos, generacion automatica |

## Uso Practico

### Ejemplo: Crear un evento

1. **Autenticarse en Admin Backend**:
   ```http
   POST http://localhost:3003/api/auth/login
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```

2. **Crear evento** (con token):
   ```http
   POST http://localhost:3003/api/events
   Authorization: Bearer {token}
   {
     "name": "Concierto de Rock",
     "description": "Gran concierto al aire libre",
     "eventDate": "2025-12-31T20:00:00Z",
     "venueId": "venue-id",
     "categoryId": "category-id"
   }
   ```

### Ejemplo: Reserva de restaurante

1. **Autenticarse en Festival Services**:
   ```http
   POST http://localhost:3004/auth/login
   ```

2. **Crear reserva**:
   ```http
   POST http://localhost:3004/restaurant/reservations
   Authorization: Bearer {token}
   {
     "restaurantId": "rest-123",
     "date": "2025-12-31",
     "time": "20:00",
     "partySize": 4
   }
   ```

## Filtros y Busquedas

### Parametros Comunes

Muchas APIs soportan parametros de consulta estandar:

```http
GET /api/events?page=1&limit=10&search=rock&category=conciertos
GET /api/orders?status=completed&startDate=2025-01-01&endDate=2025-12-31
GET /api/reservations?userId=user-123&status=active
```

### Ordenamiento

```http
GET /api/events?sortBy=eventDate&sortOrder=desc
GET /api/venues?sortBy=name&sortOrder=asc
```

## Codigos de Respuesta

| Codigo | Significado | Cuando se usa |
|--------|-------------|---------------|
| `200` | OK | Operacion exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Datos de entrada invalidos |
| `401` | Unauthorized | Token ausente o invalido |
| `403` | Forbidden | Sin permisos para la operacion |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto (ej: email ya existe) |
| `500` | Internal Error | Error interno del servidor |

## Solucion de Problemas

### Servicios no responden

```bash
# Verificar que los servicios esten arrancados
curl http://localhost:3003/health
curl http://localhost:3001/health  
curl http://localhost:3004/health
```

### Error de autenticacion

1. Verifica que el token no haya expirado
2. Asegurate de incluir "Bearer " antes del token
3. Revisa que uses el endpoint de login correcto para cada servicio

### Swagger no carga

1. Verifica que el servicio este corriendo
2. Comprueba la URL correcta para cada servicio
3. Revisa los logs del servidor para errores

## Notas Adicionales

- **Persistencia**: Los datos se almacenan en PostgreSQL (admin) y MongoDB (user-service)
- **Tiempo real**: Comunicacion entre servicios via RabbitMQ
- **Archivos**: El sistema de upload esta documentado en `/api/upload`
- **Webhooks**: Stripe webhooks documentados en `/api/payments/webhook`

## Enlaces Rapidos

- [Admin Swagger UI](http://localhost:3003/api/docs)
- [User Service Swagger UI](http://localhost:3001/api/docs)
- [Festival Services Swagger UI](http://localhost:3004/api/docs)

---

*Documentacion actualizada: 15 de octubre de 2025*