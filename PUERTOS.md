# 🚢 PUERTOS DEL PROYECTO TICKETING PLATFORM

## 📋 RESUMEN DE PUERTOS

| Servicio | Puerto | Descripción | Estado |
|----------|--------|-------------|--------|
| **Frontend Angular** | `4200` | Aplicación web principal | ✅ Activo |
| **User Service** | `3001` | API usuarios (Express + MongoDB) | ✅ Activo |
| **Admin Service** | `3002` | API admin (Fastify + PostgreSQL) | ✅ Activo |
| **Festival Services** | `3004` | API microservicios (NestJS + MongoDB + PostgreSQL) | ✅ Activo |
| **MongoDB** | `27017` | Base de datos usuarios/eventos | ✅ Activo |
| **PostgreSQL** | `5432` | Base de datos admin/aprobaciones | ✅ Activo |
| **RabbitMQ** | `5672` | Message broker | ✅ Activo |
| **RabbitMQ Management** | `15672` | UI de RabbitMQ | ✅ Activo |
| **Redis** | `6379` | Cache (si se usa) | ⚠️ Opcional |

---

## 🎯 SERVICIOS DETALLADOS

### 🌐 Frontend (Puerto 4200)
```bash
cd frontend
ng serve
# http://localhost:4200
```

### 👥 User Service (Puerto 3001)
```bash
cd backend/user-service
npm run dev
# http://localhost:3001
```
**Endpoints principales:**
- `POST /api/auth/login` - Login usuarios
- `POST /api/auth/register` - Registro usuarios
- `GET /api/events` - Listar eventos

### 🔐 Admin Service (Puerto 3002)
```bash
cd backend/admin
npm run dev
# http://localhost:3002
```
**Endpoints principales:**
- `POST /api/auth/login` - Login admin
- `GET /api/events` - Gestión eventos
- `GET /api/users` - Gestión usuarios

### 🎪 Festival Services (Puerto 3004)
```bash
cd backend/services/festival-services
npm run dev
# http://localhost:3004
```
**Endpoints principales:**
- `GET /api/docs` - Swagger UI
- `POST /api/auth/login` - Autenticación
- `GET /api/travel` - Gestión viajes
- `GET /api/restaurant` - Gestión restaurantes
- `GET /api/merchandising` - Gestión productos
- `GET /api/approval` - Sistema aprobaciones

---

## 🐳 DOCKER SERVICES

### 📊 Base de Datos
```yaml
# docker-compose.yml
services:
  mongodb:
    ports: ["27017:27017"]
  
  postgresql:
    ports: ["5432:5432"]
  
  rabbitmq:
    ports: 
      - "5672:5672"    # AMQP
      - "15672:15672"  # Management UI
  
  redis:
    ports: ["6379:6379"]
```

---

## ⚠️ CONFLICTOS DE PUERTOS

### 🔴 Puerto 3004 ocupado
Si el puerto 3004 está ocupado:

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3004

# Matar proceso (Windows)
taskkill /PID <PID> /F

# O cambiar puerto en Festival Services
# src/main.ts
await app.listen(3005); // Cambiar a 3005
```

### 🔄 Puertos alternativos
- Festival Services: `3004` → `3005`
- Admin Service: `3002` → `3006`
- User Service: `3001` → `3007`

---

## 🚀 ORDEN DE ARRANQUE RECOMENDADO

1. **Infraestructura** (Docker)
```bash
cd docker
docker-compose up -d
```

2. **User Service** (Puerto 3001)
```bash
cd backend/user-service
npm run dev
```

3. **Admin Service** (Puerto 3002)
```bash
cd backend/admin
npm run dev
```

4. **Festival Services** (Puerto 3004)
```bash
cd backend/services/festival-services
npm run dev
```

5. **Frontend** (Puerto 4200)
```bash
cd frontend
ng serve
```

---

## 🔍 VERIFICAR PUERTOS

### Windows
```bash
netstat -ano | findstr :3004
```

### Linux/Mac
```bash
lsof -i :3004
```

### Verificar todos los servicios
```bash
curl http://localhost:3001/api/health  # User Service
curl http://localhost:3002/api/health  # Admin Service
curl http://localhost:3004/api/health  # Festival Services
curl http://localhost:4200            # Frontend
```

---

## 📞 URLs DE ACCESO

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:4200 | Aplicación principal |
| **User API** | http://localhost:3001/api | API usuarios |
| **Admin API** | http://localhost:3002/api | API admin |
| **Festival API** | http://localhost:3004/api | API microservicios |
| **Swagger** | http://localhost:3004/api/docs | Documentación API |
| **RabbitMQ UI** | http://localhost:15672 | Gestión colas (guest/guest) |

---

## 🎯 ESTADO ACTUAL

- ✅ **User Service** - Funcionando en 3001
- ✅ **Admin Service** - Funcionando en 3002  
- ✅ **Festival Services** - Funcionando en 3004 con JWT Auth
- ✅ **Frontend** - Funcionando en 4200
- ✅ **Infraestructura** - Docker funcionando

**¡Todos los puertos documentados y organizados!** 🚢
