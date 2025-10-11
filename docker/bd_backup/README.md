# 🗄️ Sistema de Backup y Restauración - Ticketing Platform

**Versión:** 2.0  
**Última actualización:** 2025-10-04  
**Autor:** Voro

---

## 📋 Índice

1. [Estructura de Carpetas](#estructura-de-carpetas)
2. [Scripts Disponibles](#scripts-disponibles)
3. [Uso Rápido](#uso-rápido)
4. [Bases de Datos](#bases-de-datos)
5. [Comandos Manuales](#comandos-manuales)
6. [Restauración](#restauración)
7. [Troubleshooting](#troubleshooting)

---

## 📁 Estructura de Carpetas

```
bd_backup/
├── README.md                      # Este archivo (documentación completa)
├── backup-databases.ps1           # Script de backup (PowerShell/Windows)
├── backup-databases.sh            # Script de backup (Bash/Linux/Mac)
├── restore-databases.ps1          # Script de restauración (PowerShell)
├── restore-databases.sh           # Script de restauración (Bash)
└── backups/                       # Carpeta de backups organizados por fecha
    ├── 2025-10-04/               # Backup del 4 de octubre 2025
    │   ├── postgres_backup.sql
    │   ├── mongodb_users.json
    │   ├── prisma_schema.prisma
    │   └── BACKUP_INFO.md
    ├── 2025-10-05/               # Backup del 5 de octubre 2025
    └── ...
```

**⚠️ IMPORTANTE:** Cada backup se guarda en una carpeta con la fecha (YYYY-MM-DD) para mantener todo organizado.

---

## 🛠️ Scripts Disponibles

### 1. **backup-databases.ps1** (PowerShell - Windows)
Crea un backup completo de PostgreSQL y MongoDB en una carpeta con la fecha actual.

### 2. **backup-databases.sh** (Bash - Linux/Mac)
Versión Bash del script de backup.

### 3. **restore-databases.ps1** (PowerShell - Windows)
Restaura un backup específico desde una carpeta de fecha.

### 4. **restore-databases.sh** (Bash - Linux/Mac)
Versión Bash del script de restauración.

---

## 🚀 Uso Rápido

### Crear Backup

**Windows (PowerShell):**
```powershell
cd docker\bd_backup
.\backup-databases.ps1
```

**Linux/Mac (Bash):**
```bash
cd docker/bd_backup
./backup-databases.sh
```

**Resultado:**
```
✅ Backup creado en: backups/2025-10-04/
   - postgres_backup.sql
   - mongodb_users.json
   - prisma_schema.prisma
   - BACKUP_INFO.md
```

### Restaurar Backup

**Windows (PowerShell):**
```powershell
.\restore-databases.ps1 2025-10-04
```

**Linux/Mac (Bash):**
```bash
./restore-databases.sh 2025-10-04
```

---

## 🗄️ Bases de Datos

### PostgreSQL (Admin Service - Puerto 5432)

**Base de Datos:** `ticketing`  
**Usuario:** `admin`  
**Password:** `admin123`

**Tablas Principales:**
- `Event` - Eventos del sistema
- `Venue` - Lugares/Recintos
- `EventCategory` - Categorías de eventos
- `EventSubcategory` - Subcategorías
- `EventLocality` - Localidades/Zonas de eventos
- `VenueSection` - Secciones de venues
- `PriceCategory` - Categorías de precios
- `Admin` - Administradores del sistema

### MongoDB (User Service - Puerto 27017)

**⚠️ BASE DE DATOS CORRECTA:** `ticketing` (NO `ticketing-users`)  
**Usuario:** `admin`  
**Password:** `admin123`  
**Auth Database:** `admin`

**Colecciones:**
- `users` - Usuarios del sistema (user, vip, admin)

**Usuarios Actuales:**
- voro.super@ticketing.com (SUPER_ADMIN)
- xavi.vip@ticketing.com (VIP)
- salvador (USER)

---

## 💻 Comandos Manuales

### Backup Manual

#### PostgreSQL:
```bash
# Crear backup
docker exec ticketing-postgres pg_dump -U admin -d ticketing > backups/$(date +%Y-%m-%d)/postgres_backup.sql

# Verificar
docker exec ticketing-postgres psql -U admin -d ticketing -c "\dt"
```

#### MongoDB:
```bash
# Crear backup (BASE DE DATOS CORRECTA: ticketing)
docker exec ticketing-mongodb mongoexport \
  --authenticationDatabase=admin \
  --username=admin \
  --password=admin123 \
  --db=ticketing \
  --collection=users \
  --out=/tmp/users_backup.json

# Copiar backup
docker cp ticketing-mongodb:/tmp/users_backup.json backups/$(date +%Y-%m-%d)/mongodb_users.json

# Verificar usuarios
docker exec ticketing-mongodb mongosh \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  ticketing \
  --eval "db.users.countDocuments()"
```

### Restauración Manual

#### PostgreSQL:
```bash
# Restaurar
docker exec -i ticketing-postgres psql -U admin -d ticketing < backups/2025-10-04/postgres_backup.sql

# Verificar
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM \"Event\";"
```

#### MongoDB:
```bash
# Copiar backup al contenedor
docker cp backups/2025-10-04/mongodb_users.json ticketing-mongodb:/tmp/

# Restaurar (BASE DE DATOS CORRECTA: ticketing)
docker exec ticketing-mongodb mongoimport \
  --authenticationDatabase=admin \
  --username=admin \
  --password=admin123 \
  --db=ticketing \
  --collection=users \
  --file=/tmp/mongodb_users.json

# Verificar
docker exec ticketing-mongodb mongosh \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  ticketing \
  --eval "db.users.find().pretty()"
```

---

## 🔄 Restauración Completa del Sistema

### 1. Levantar Docker
```bash
docker-compose up -d
```

### 2. Esperar a que los servicios estén listos
```bash
docker ps
# Verificar que todos los contenedores estén "healthy"
```

### 3. Restaurar Bases de Datos
```bash
# Opción A: Usar script (recomendado)
.\restore-databases.ps1 2025-10-04

# Opción B: Manual (ver sección anterior)
```

### 4. Verificar Restauración
```bash
# PostgreSQL - Contar eventos
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM \"Event\";"

# MongoDB - Contar usuarios
docker exec ticketing-mongodb mongosh \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  ticketing \
  --eval "db.users.countDocuments()"
```

### 5. Iniciar Servicios

```bash
# Admin-Service (Puerto 3003)
cd backend/admin
npm install
npx prisma generate
npm run dev

# User-Service (Puerto 3001)
cd backend/users
npm install
npm run dev

# Frontend (Puerto 4200)
cd frontend/ticketing-app
npm install
npm start
```

### 6. Acceder al Sistema
- **Frontend:** http://localhost:4200
- **Admin Dashboard:** http://localhost:4200/admin-dashboard
- **Login:** voro.super@ticketing.com / Voro123!

---

## 🐛 Troubleshooting

### Problema: MongoDB backup vacío (0 usuarios)

**Causa:** Estás usando la base de datos incorrecta (`ticketing-users` en lugar de `ticketing`)

**Solución:**
```bash
# Verificar base de datos correcta
docker exec ticketing-mongodb mongosh \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  --eval "show dbs"

# Usar la base de datos CORRECTA: ticketing
docker exec ticketing-mongodb mongoexport \
  --authenticationDatabase=admin \
  --username=admin \
  --password=admin123 \
  --db=ticketing \
  --collection=users \
  --out=/tmp/users_backup.json
```

### Problema: Error de autenticación en MongoDB

**Solución:**
```bash
# Siempre incluir authenticationDatabase=admin
docker exec ticketing-mongodb mongosh \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  ticketing
```

### Problema: PostgreSQL no restaura correctamente

**Solución:**
```bash
# Limpiar base de datos antes de restaurar
docker exec ticketing-postgres psql -U admin -d ticketing -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Restaurar
docker exec -i ticketing-postgres psql -U admin -d ticketing < backups/2025-10-04/postgres_backup.sql
```

### Problema: Contenedores no están corriendo

**Solución:**
```bash
# Ver logs
docker-compose logs ticketing-postgres
docker-compose logs ticketing-mongodb

# Reiniciar servicios
docker-compose restart
```

---

## 📊 Información de los Backups

### Contenido Típico de un Backup:

**PostgreSQL (~32 KB):**
- 6 eventos activos
- 10 venues
- 5 categorías
- 10 subcategorías
- Localidades por evento
- Admins del sistema

**MongoDB (~3 KB):**
- 3 usuarios registrados
- Roles: SUPER_ADMIN, VIP, USER
- Perfiles completos con datos personales

---

## 🔐 Credenciales del Sistema

### Base de Datos PostgreSQL:
- **Host:** localhost:5432
- **Database:** ticketing
- **User:** admin
- **Password:** admin123

### Base de Datos MongoDB:
- **Host:** localhost:27017
- **Database:** ticketing (⚠️ NO ticketing-users)
- **User:** admin
- **Password:** admin123
- **Auth Source:** admin

### Usuarios de la Aplicación:
- **Super Admin:** voro.super@ticketing.com / Voro123!
- **Usuario VIP:** xavi.vip@ticketing.com / Xavi123!
- **Usuario Normal:** test@test.com / Test123!

---

## 📅 Política de Retención de Backups

- **Backups diarios:** Mantener últimos 7 días
- **Backups semanales:** Mantener últimas 4 semanas
- **Backups mensuales:** Mantener últimos 12 meses

**Limpieza automática:** Los scripts eliminan automáticamente backups con más de 7 días.

---

## 🎯 Próximos Pasos

1. ✅ Configurar backup automático diario (cron/task scheduler)
2. ✅ Implementar rotación de backups (7 días)
3. ⏳ Añadir backup de archivos estáticos
4. ⏳ Configurar backup remoto (cloud storage)
5. ⏳ Implementar notificaciones de backup exitoso/fallido

---

## 📞 Contacto y Soporte

**Desarrollador:** Voro  
**Email:** voromb@hotmail.com  
**Versión del Sistema:** 1.0.0  
**Última actualización:** 2025-10-04

---

# Ir a la carpeta de backups
cd 'C:\Programacion_2DAW\ticketing-platform\docker\bd_backup'

# 1. Backup PostgreSQL completo
docker exec ticketing-postgres pg_dump -U admin -d ticketing > 'backups\2025-10-05\postgres_full_backup_11-36.sql'

# 2. Backup MongoDB usuarios
docker exec ticketing-mongodb mongoexport --username admin --password admin123 --authenticationDatabase admin --db ticketing_users --collection users --out /mongodb_users_11-36.json
docker cp ticketing-mongodb:/mongodb_users_11-36.json 'backups\2025-10-05\mongodb_users_11-36.json'

# 3. Backup Prisma Schema
Copy-Item '..\..\backend\admin\prisma\schema.prisma' 'backups\2025-10-05\prisma_schema_11-36.prisma'

# 4. Backup categorías PostgreSQL
docker exec ticketing-postgres psql -U admin -d ticketing -c 'COPY (SELECT * FROM "PriceCategory") TO STDOUT WITH CSV HEADER;' > 'backups\2025-10-05\postgres_categories_11-36.json'

# 5. Backup localidades PostgreSQL  
docker exec ticketing-postgres psql -U admin -d ticketing -c 'COPY (SELECT * FROM "Venue") TO STDOUT WITH CSV HEADER;' > 'backups\2025-10-05\postgres_venues_11-36.json'

# 6. Backup eventos PostgreSQL
docker exec ticketing-postgres psql -U admin -d ticketing -c 'COPY (SELECT * FROM "Event") TO STDOUT WITH CSV HEADER;' > 'backups\2025-10-05\postgres_events_11-36.json'
