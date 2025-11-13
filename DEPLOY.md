# Guía de Despliegue - Ticketing Platform

## Requisitos Previos

- Puertos disponibles: 3001, 3003, 3004, 3005, 4200, 9090
- Bases de datos: MongoDB (27017), PostgreSQL (5432), RabbitMQ (5672, 15672)
- Servidor Ollama para IA (opcional): `openweb.voro-moran.com/api`

---

## Despliegue en Producción

### 1. Configurar variables de entorno

Creamos el archivo `.env` en la carpeta `docker/`:

```bash
cd docker
cp .env.example .env
```

Editamos `.env` con tus credenciales.

### 2. Levantar todo el stack

```bash
docker compose --profile deploy up -d
```

**Eso es todo.** No necesitamos ejecutar ningún script adicional.

Esto levantará automáticamente:
- ✅ MongoDB, PostgreSQL, RabbitMQ
- ✅ Admin Backend (producción)
- ✅ User Service (producción)
- ✅ Festival Services (producción)
- ✅ Messaging Service (producción)
- ✅ Frontend Angular (producción)
- ✅ Nginx (reverse proxy + resolución DNS dinámica)

### 3. Acceder a la aplicación

**🌐 URL Principal: http://localhost:9090**

#### Rutas disponibles:
- **Frontend**: `http://localhost:9090`
- **Admin API**: `http://localhost:9090/api/admin/`
- **User API**: `http://localhost:9090/api/users/`
- **Festival API**: `http://localhost:9090/api/festival/`
- **Messaging API**: `http://localhost:9090/api/messages/`
- **Ollama IA API**: `http://localhost:9090/api/ollama/`
- **API Docs**: `http://localhost:9090/api/docs`

---

## Credenciales de Acceso

### Super Admins (PostgreSQL)
- **Email**: `voro.super@ticketing.com` | **Password**: `Voro123!`
- **Email**: `super@admin.com` | **Password**: `Admin123!`
- **Email**: `admin@ticketing.com` | **Password**: `Admin123!`

### Company Admins (Gestores de Servicios)
Todos usan la contraseña: `Admin123!`

- **Restaurantes España**: `admin.spain.restaurants@festival.com`
- **Restaurantes Europa**: `admin.europe.restaurants@festival.com`
- **Viajes España**: `admin.spain.travel@festival.com`
- **Viajes Europa**: `admin.europe.travel@festival.com`
- **Merchandising España**: `admin.spain.merch@festival.com`
- **Merchandising Europa**: `admin.europe.merch@festival.com`

### Usuarios de Prueba (MongoDB)
- **Usuario VIP**: `xavi.vip@ticketing.com` / `Xavi123!`
- **Usuario Normal**: `test@test.com` / `Test123!`
- **Pepito Palotes**: `ejem@prueba.com`
- **Uno que pasaba**: `paso@prueba.com`

### Bases de Datos
- **PostgreSQL**: `admin` / `admin123` (puerto 5432)
- **MongoDB**: `admin` / `admin123` (puerto 27017)
- **RabbitMQ**: `admin` / `admin123` (puerto 15672)

---

## Comandos Útiles

### Ver estado de los servicios
```bash
docker compose --profile deploy ps
```

### Ver logs en tiempo real
```bash
docker compose --profile deploy logs -f

# Ver logs de un servicio específico
docker compose --profile deploy logs -f nginx
docker compose --profile deploy logs -f frontend
docker compose --profile deploy logs -f admin-backend
```

### Detener todo
```bash
docker compose --profile deploy down
```

### Reiniciar un servicio específico
```bash
docker compose --profile deploy restart nginx
docker compose --profile deploy restart frontend
docker compose --profile deploy restart admin-backend
```

### Reconstruir después de cambios en código
```bash
# Reconstruir todo
docker compose --profile deploy up -d --build

# Reconstruir solo un servicio
docker compose --profile deploy build frontend
docker compose --profile deploy up -d frontend
```

### Limpiar todo (⚠️ ELIMINA DATOS)
```bash
docker compose --profile deploy down -v
docker compose --profile deploy up -d --build
```

---

## Desarrollo Local (Solo Bases de Datos)

Si solo queremos las bases de datos para desarrollo local:

```bash
cd docker
docker compose up -d
```

Esto levanta solo:
- MongoDB (27017)
- PostgreSQL (5432)
- RabbitMQ (5672, 15672)
- Mongo Express (8081)

Luego ejecutamos los servicios manualmente:

```bash
# Backend Admin
cd backend/admin
npm run dev

# User Service
cd backend/user-service
npm run dev

# Festival Services
cd backend/services/festival-services
npm run start:dev

# Messaging Service
cd backend/services/messaging-service
npm run start:dev

# Frontend
cd frontend/ticketing-app
npm start
```

---

## Inteligencia Artificial (IA)

La plataforma incluye funcionalidades de IA para:
- **Chat conversacional** con asistente metalero
- **Búsqueda inteligente** de eventos con lenguaje natural

### Configuración de Ollama

El sistema usa un servidor Ollama remoto: `openweb.voro-moran.com/api`

**Modelos disponibles:**
- `metalhead-assistant-v4` - Chat conversacional
- `search-nlp-v2` - Búsqueda con NLP

### Resolución DNS Dinámica

Nginx resuelve automáticamente el dominio dinámico al iniciar. Si la IP cambia:

```bash
docker compose --profile deploy restart nginx
```

El script `/docker-entrypoint.sh` en Nginx:
1. Configura el proxy a `openweb.voro-moran.com`
2. Actualiza la configuración de Nginx
3. Inicia el servidor

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                   Nginx :9090                           │
│     (Reverse Proxy + Frontend + DNS Resolver)           │
└─────────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐
│ Admin Backend│ │User Svc  │ │Festival Svc │ │Messaging │
│    :3003     │ │  :3001   │ │   :3004     │ │  :3005   │
└──────────────┘ └──────────┘ └─────────────┘ └──────────┘
        │              │              │              │
        └──────────────┼──────────────┴──────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐
│  PostgreSQL  │ │ MongoDB  │ │  RabbitMQ   │ │  Ollama  │
│    :5432     │ │  :27017  │ │   :5672     │ │ (remoto) │
└──────────────┘ └──────────┘ └─────────────┘ └──────────┘
```

### Flujo de Datos

1. **Usuario** → `http://localhost:9090`
2. **Nginx** → Sirve frontend estático + proxy APIs
3. **Frontend** → Llama a `/api/festival`, `/api/users`, etc.
4. **Nginx** → Redirige a servicios backend internos
5. **Backend** → Consulta bases de datos
6. **IA** → Nginx hace proxy a Ollama remoto

---

## Troubleshooting

### Los contenedores no inician

```bash
docker compose --profile deploy logs <servicio>
```

### Error de compilación TypeScript

Todos los warnings de TypeScript han sido corregidos. Si aparecen nuevos:

```bash
cd backend/admin
npm run build
```

### Frontend no carga

Verifica que Nginx esté corriendo:
```bash
docker compose --profile deploy ps nginx
docker compose --profile deploy logs nginx
```

### IA no funciona

1. Verifica que el servidor Ollama esté accesible:
```bash
curl http://openweb.voro-moran.com/api/tags
```

2. Reinicia Nginx para resolver DNS:
```bash
docker compose --profile deploy restart nginx
```

3. Verifica logs de Nginx:
```bash
docker compose --profile deploy logs nginx | grep ollama
```

### Problemas de permisos

```bash
sudo chown -R $USER:$USER .
```

### Base de datos vacía

Restaura desde backup:
```bash
cd docker/bd_backup
./restore.ps1  # Windows
./restore_linux.sh  # Linux
```

---

## Monitoreo

### Health Checks

Todos los servicios tienen endpoints de salud:

```bash
curl http://localhost:9090/api/festival/health
curl http://localhost:9090/api/users/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
```

### Bases de Datos

- **Mongo Express**: http://localhost:8081
- **RabbitMQ Management**: http://localhost:15672

---

## Notas Importantes

### Producción vs Desarrollo

| Aspecto | Producción (Docker) | Desarrollo (Local) |
|---------|--------------------|--------------------|
| **Puerto** | 9090 | 4200 |
| **Build** | Optimizado | Dev mode |
| **APIs** | Rutas relativas | localhost:300X |
| **IA Proxy** | Nginx | Angular proxy |
| **Comando** | `docker compose --profile deploy up -d` | `npm start` |

### Datos Persistentes

Los volúmenes de Docker mantienen los datos entre reinicios:
- `mongo_data` - Base de datos MongoDB
- `postgres_data` - Base de datos PostgreSQL
- `rabbitmq_data` - Mensajes RabbitMQ

### Seguridad

⚠️ **Importante para producción real:**
- Cambiar todas las contraseñas por defecto
- Usar HTTPS con certificados SSL
- Configurar firewall para limitar acceso
- Usar variables de entorno para secretos
- Habilitar autenticación en RabbitMQ Management

---

## Despliegue Rápido (TL;DR)

```bash
cd docker
docker compose --profile deploy up -d
```

Abre: **http://localhost:9090**

Login: `voro.super@ticketing.com` / `Voro123!`

¡Listo! 🎉
