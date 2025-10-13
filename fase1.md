# FASE 1: MÓDULOS BASE ✅ COMPLETADA

**Objetivo**: Crear la base de datos y CRUD básico para todos los servicios

- [x] **Travel Module** - CRUD viajes (MongoDB) - 6 endpoints
- [x] **Restaurant Module** - CRUD restaurantes (MongoDB) - 7 endpoints  
- [x] **Merchandising Module** - CRUD productos (MongoDB) - 8 endpoints
- [x] **Approval Module** - Aprobaciones (PostgreSQL/Prisma) - 7 endpoints

**Total implementado**: 4 módulos, 28 endpoints, MongoDB + PostgreSQL

## FASE 2: INTEGRACIÓN RABBITMQ ✅ COMPLETADA

**Objetivo**: Implementar comunicación asíncrona entre microservicios

- [x] **RabbitMQ** para eventos entre servicios - Broker configurado
- [x] **Microservicio de aprobaciones** funcionando - NestJS + Prisma
- [x] **Eventos de aprobación/rechazo** publicados - approval.granted/rejected
- [x] **Swagger documentación** en puerto 3003 - UI completa
- [x] **Validaciones con class-validator** - DTOs robustos
- [x] **Sistema completo de aprobaciones CRUD** - Estados y workflows

**Total implementado**: RabbitMQ + PostgreSQL + Swagger + Validaciones

## FASE 3: LÓGICA DE NEGOCIO ✅ COMPLETADA

**Objetivo**: Implementar workflows completos de reservas, pedidos y aprobaciones automáticas

- [x] **Sistema de reservas en Travel** (bookings) - 12 métodos + 7 endpoints
- [x] **Sistema de reservas en Restaurant** - 15 métodos + 9 endpoints
- [x] **Carrito y pedidos en Merchandising** - 25+ métodos + 14 endpoints
- [x] **Workflow completo de aprobaciones** con listeners - Eventos bidireccionales
- [x] **Integración entre servicios vía RabbitMQ** - Confirmación automática

**Total implementado**: 6 esquemas nuevos, 29 endpoints nuevos, workflows automáticos

## FASE 4: AUTENTICACIÓN Y SEGURIDAD

- [ ] JWT para autenticación
- [ ] Guards para autorización (roles)
- [ ] Interceptors para logs
- [ ] Middleware de seguridad

## FASE 5: FRONTEND (3 paneles nuevos)

- [ ] Panel Travel (Rojo pastel)
- [ ] Panel Restaurant (Verde pastel)
- [ ] Panel Merchandising (Azul pastel)



# Festival Services - Documentación del Proyecto

## Estructura de carpetas

```
festival-services/
├── src/
│   ├── config/              
│   ├── travel/              
│   ├── restaurant/          
│   ├── merchandising/       
│   ├── approval/            
│   ├── app.module.ts        
│   ├── app.controller.ts    
│   ├── app.service.ts       
│   └── main.ts              
├── prisma/
│   └── schema.prisma        
├── .env                     
└── package.json             
```

## Configuración Base

### `src/config/app.config.ts`
Archivo que centraliza las variables de entorno. Lee del `.env` y las organiza en un objeto JavaScript para usar en toda la aplicación. Si alguna variable no existe, usa valores por defecto para no romper nada.

### `src/main.ts`
Archivo principal que arranca el servidor. Aquí configuramos:
- CORS para que el frontend pueda conectarse
- Prefijo `/api` para todas las rutas
- Validación automática de datos entrantes
- **Swagger** (más sobre esto abajo)
- El puerto donde escucha el servidor

### `src/app.module.ts`
El cerebro que conecta todos los módulos. Importa la configuración, conecta con MongoDB, y registra los 4 módulos que creamos.

## ¿Qué es Swagger?

**Swagger es una herramienta que genera documentación interactiva automática de tu API.**

Imagínalo como un Postman automático que:
- Se actualiza solo cuando cambias tu código
- Permite probar los endpoints desde el navegador
- Muestra qué datos espera recibir y qué devuelve
- No tienes que escribir documentación aparte

**Acceso:** http://localhost:3000/api/docs

**Ventajas prácticas:**
- El equipo frontend ve exactamente qué endpoints existen
- Puedes probar la API sin abrir Postman
- Si cambias algo en el código, la documentación se actualiza sola
- Muestra ejemplos de peticiones y respuestas

---

## Módulo Travel - Gestión de Viajes

### Archivos creados:

#### `schemas/trip.schema.ts`
Define cómo se guarda un viaje en MongoDB. Campos principales:
- Información básica: festival, nombre, descripción
- Detalles del viaje: salida, llegada, coordenadas
- Gestión: capacidad, asientos reservados, precio
- Control: estado del viaje, si requiere aprobación

#### `dto/create-trip.dto.ts`
Valida los datos cuando alguien quiere crear un viaje. Si falta algún campo obligatorio o el formato está mal, rechaza la petición automáticamente.

#### `dto/update-trip.dto.ts`
Similar al anterior pero para actualizaciones. Todos los campos son opcionales porque solo actualizas lo que necesites.

#### `travel.service.ts`
La lógica del negocio. Aquí están las funciones que:
- Crean viajes en la base de datos
- Buscan viajes por ID o lista completa
- Actualizan información
- Calculan asientos disponibles
- Marcan viajes como inactivos (no se borran, solo se ocultan)

#### `travel.controller.ts`
Define las rutas HTTP. Cada decorador `@Get`, `@Post`, etc. crea un endpoint:
- POST `/api/travel` → Crear viaje
- GET `/api/travel` → Listar todos
- GET `/api/travel/:id` → Ver uno específico
- GET `/api/travel/:id/available-seats` → Consultar disponibilidad
- PATCH `/api/travel/:id` → Actualizar
- DELETE `/api/travel/:id` → Desactivar

#### `travel.module.ts`
Conecta todo lo anterior y lo exporta como un módulo que app.module puede importar.

---

## Módulo Restaurant - Gestión de Restaurantes

### Diferencias con Travel:

#### `schemas/restaurant.schema.ts`
Además de datos básicos, incluye:
- **Horarios:** Array con días y horas de apertura/cierre
- **Menú completo:** Items con precios, categorías, restricciones dietéticas
- **Control de aforo:** Capacidad máxima y ocupación actual
- **Estado dinámico:** OPEN, CLOSED, FULL

#### `restaurant.service.ts`
Funciones específicas:
- `findByFestival()`: Filtra restaurantes de un festival
- `updateOccupancy()`: Suma o resta comensales y actualiza el estado
- `getAvailableCapacity()`: Calcula espacio disponible

#### Endpoints adicionales:
- `/api/restaurant/:id/capacity` → Consultar aforo disponible
- `/api/restaurant/:id/occupancy` → Actualizar ocupación
- `/api/restaurant?festivalId=xxx` → Filtrar por festival

---

## Módulo Merchandising - Gestión de Productos

### Especializado en inventario:

#### `schemas/product.schema.ts`
Control detallado de stock:
- **Stock triple:** Total, disponible, reservado
- **Tipos de producto:** Camisetas, vinilos, posters, etc.
- **Gestión de tallas:** Array de sizes para ropa
- **Control de ventas:** Unidades vendidas, productos exclusivos VIP

#### `merchandising.service.ts`
Gestión compleja de inventario:
- `reserveStock()`: Aparta unidades temporalmente (para el carrito)
- `confirmPurchase()`: Convierte reserva en venta
- `releaseStock()`: Libera productos no comprados
- Control automático de estados (AVAILABLE, OUT_OF_STOCK)

#### Endpoints de inventario:
- `/api/merchandising/:id/reserve` → Reservar unidades
- `/api/merchandising/:id/confirm` → Confirmar compra
- `/api/merchandising/:id/release` → Liberar reserva

---

## Módulo Approval - Sistema de Aprobaciones

### Diferente: Usa PostgreSQL con Prisma

#### `prisma/schema.prisma`
Define la tabla en PostgreSQL en lugar de MongoDB. Se usa PostgreSQL aquí porque:
- Necesitamos transacciones ACID
- Es información crítica de auditoría
- Requiere integridad referencial estricta

#### `approval.service.ts`
En lugar de Mongoose, usa PrismaClient:
```typescript
this.prisma = new PrismaClient();
```

Gestiona el flujo de aprobaciones:
- Crea solicitudes con prioridad (LOW, MEDIUM, HIGH)
- Lista pendientes ordenadas por urgencia
- Procesa decisiones (APPROVED/REJECTED)
- Genera estadísticas de aprobación

#### `approval.controller.ts`
Endpoints especializados:
- `/api/approval/pending` → Solo las que esperan decisión
- `/api/approval/stats` → Métricas y tasas de aprobación
- `/api/approval/:id/decision` → Aprobar o rechazar

---

## Flujo típico de uso

### Ejemplo real: Festival con restricciones

1. **Se crea un viaje en bus** (Travel Module)
   - 50 plazas disponibles
   - Precio: 25€

2. **Un grupo quiere reservar 30 plazas**
   - El sistema detecta que es un grupo grande
   - Automáticamente requiere aprobación

3. **Se genera solicitud de aprobación** (Approval Module)
   - Prioridad: HIGH
   - Metadata: información del grupo
   - Estado: PENDING

4. **El admin revisa desde su panel**
   - Ve todas las solicitudes pendientes
   - Aprueba porque hay capacidad

5. **Se confirma la reserva**
   - Se actualizan los asientos disponibles
   - Se notifica al usuario

---

## Resumen de endpoints (28 totales)

### Travel - 6 endpoints
Gestión completa de viajes: crear, listar, ver, actualizar, eliminar, consultar disponibilidad

### Restaurant - 7 endpoints
Todo lo de Travel más control de ocupación y filtrado por festival

### Merchandising - 8 endpoints
CRUD básico más gestión avanzada de inventario (reservar, confirmar, liberar)

### Approval - 7 endpoints
Solicitudes, decisiones, estadísticas, filtros por servicio y estado

---

## Lo que falta (Fase 2)

### Sistema de reservas completo
- Tabla `bookings` para Travel (quién reservó qué)
- Tabla `reservations` para Restaurant
- Tabla `orders` para Merchandising
- Relaciones entre usuarios y reservas

### RabbitMQ para mensajería
Cuando algo necesite aprobación:
1. El servicio publica un mensaje en RabbitMQ
2. Approval Service lo recibe y crea el registro
3. Cuando se aprueba/rechaza, notifica de vuelta
4. El servicio original actualiza el estado

### Autenticación JWT
- Login que devuelve token
- Middleware que valida tokens
- Guards que protegen rutas según rol
- Contexto de usuario en cada petición

### Paneles frontend
Tres interfaces Angular con colores distintos:
- Travel: Rojo pastel para gestión de viajes
- Restaurant: Verde pastel para reservas
- Merchandising: Azul pastel para tienda

---

## Datos de prueba creados durante el desarrollo

- **Viaje bus Madrid-Festival:** ID `68eaa4ee1b963876d9c7533d`
- **Rock & Roll Burger:** ID `68eaaa0e112be5ef489e27b0`
- **Camiseta Metallica:** ID `68eaad44a1d6b219c62f3d90`
- **Solicitud aprobación:** ID `7991a26c-f0b1-4d20-86f1-94a93f2d2b11`

Todos funcionando y probados desde Swagger.