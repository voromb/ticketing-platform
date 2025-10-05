# 🎫 Plataforma de Ticketing Rock/Metal

Plataforma completa de venta de tickets especializada en eventos de rock y metal con arquitectura de microservicios.

## 🚀 Inicio Rápido

```bash
# 1. Servicios (MongoDB, PostgreSQL, RabbitMQ + herramientas)
cd docker
docker-compose up -d

# 2. Prisma Studio (PostgreSQL UI)
cd ../backend/admin
npx prisma studio

# 3. Backend Admin (Puerto 3003)
npm run dev

# 4. Backend User (Puerto 3001)
cd ../user-service
npm run dev

# 5. Frontend Angular (Puerto 4200)
cd ../../frontend/ticketing-app
ng serve
```

## 🌐 URLs Disponibles

- **Frontend**: `http://localhost:4200`
- **Admin API**: `http://localhost:3003`
- **User API**: `http://localhost:3001`
- **Prisma Studio**: `http://localhost:5555`
- **Mongo Express**: `http://localhost:8081`
- **RabbitMQ**: `http://localhost:15672`

## 🏗️ Arquitectura

### Microservicios

- **Admin Service** (3003): PostgreSQL - Eventos, venues, admins
- **User Service** (3001): MongoDB - Usuarios, VIP, autenticación
- **Frontend Angular** (4200): Dashboard admin + interfaz usuario

### Tecnologías

- **Backend**: Node.js, Express, Fastify, PostgreSQL, MongoDB
- **Frontend**: Angular 17+, TypeScript, Tailwind CSS
- **Auth**: JWT + interceptores
- **Comunicación**: REST APIs entre servicios

## 👥 Sistema de Roles

- **NO REGISTRADO**: Acceso básico
- **USER**: Usuario registrado
- **VIP**: Usuario premium con beneficios especiales
- **ADMIN**: Administrador con acceso al dashboard
- **SUPER_ADMIN**: Administrador con permisos completos

## ✨ Funcionalidades

### Dashboard Administrativo

- Estadísticas en tiempo real
- Gestión completa de eventos (CRUD)
- Gestión de usuarios con promoción VIP/Admin
- Gestión de venues y localidades
- Sistema de auditoría

### Sistema VIP

- Promoción automática por mérito
- Descuentos del 10%
- Acceso prioritario
- Soporte premium

## 🔧 Comandos Útiles

```bash
# Parar todo
cd docker && docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar servicio
docker-compose restart mongodb

# Estado de contenedores
## 📊 Herramientas de Desarrollo

- **Prisma Studio**: Gestión PostgreSQL
- **Mongo Express**: Gestión MongoDB
- **RabbitMQ Management**: Cola de mensajes

## 🗄️ Base de Datos

### Backup

- Ubicación: `docker/bd_backup/`
- PostgreSQL: `postgres_admin_backup.sql`
- MongoDB: `users.json`, `events.json`

## 🔑 Credenciales

### Super Admin

- Email: `voro.super@ticketing.com`
- Password: `Voro123!`

### Usuario VIP

- Email: `xavi.vip@ticketing.com`
- Password: `Xavi123!`
