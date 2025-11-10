# 🚀 Deploy con Docker

## Desarrollo (como siempre)

```bash
cd docker
docker compose up -d
```

Esto levanta **solo las bases de datos**:
- MongoDB (27017)
- PostgreSQL (5432)
- RabbitMQ (5672, 15672)
- Mongo Express (8081)

Luego ejecutas tus apps localmente con `npm run dev`.

---

## Deploy Completo (Todo Dockerizado)

### 1. Parar tus apps locales (Ctrl+C)

### 2. Levantar todo en Docker

```bash
cd docker
docker compose --profile deploy up -d
```

Esto levanta:
- ✅ Bases de datos (las mismas, con tus datos)
- ✅ Admin Backend (producción)
- ✅ User Service (producción)
- ✅ Festival Services (producción)
- ✅ Messaging Service (producción)
- ✅ Frontend (producción)
- ✅ Nginx (reverse proxy)

### 3. Acceder

**http://localhost:9090**

- Frontend: `http://localhost:9090`
- Admin API: `http://localhost:9090/api/admin/`
- User API: `http://localhost:9090/api/users/`
- Festival API: `http://localhost:9090/api/festival/`
- Messaging API: `http://localhost:9090/api/messages/`
- API Docs: `http://localhost:9090/api/docs`

---

## Comandos Útiles

```bash
# Ver logs
docker compose --profile deploy logs -f

# Ver estado
docker compose --profile deploy ps

# Detener todo
docker compose --profile deploy down

# Reconstruir (después de cambios en código)
docker compose --profile deploy up -d --build

# Volver a desarrollo
docker compose --profile deploy down
docker compose up -d  # Solo DBs
```

---

## Notas

- **Tus datos NO se pierden** - Los volúmenes persisten
- **Primera vez tarda** - Construye las imágenes (5-10 min)
- **Siguientes veces** - Solo levanta contenedores (rápido)
- **No mezclar** - O desarrollo local O deploy dockerizado, no ambos a la vez
