# 🗄️ Sistema de Backup y Restauración - Ticketing Platform

**Versión:** 3.0  
**Última actualización:** 2025-10-05  
**Autor:** Voro

---

## 📋 Índice

1. [Uso Rápido](#-uso-rápido)
2. [Correcciones Aplicadas](#-correcciones-aplicadas)
3. [Instrucciones de Restore](#-instrucciones-de-restore)
4. [Estructura de Carpetas](#-estructura-de-carpetas)
5. [Bases de Datos](#-bases-de-datos)
6. [Troubleshooting](#-troubleshooting)
7. [Credenciales](#-credenciales)

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
✅ Backup creado en: backups/2025-10-05/
   - postgres_full_backup_17-01.sql (61 KB)
   - mongodb_users_17-01.json (1 KB)
   - prisma_schema_17-01.prisma (8.5 KB)
   - postgres_categories_17-01.json
   - postgres_localities_17-01.json
   - postgres_venues_17-01.json
   - BACKUP_INFO.md
```

### Restaurar Backup

**Windows (PowerShell):**
```powershell
.\restore-databases.ps1 17-01
```

**Linux/Mac (Bash):**
```bash
./restore-databases.sh 17-01
```

---

## ✅ Correcciones Aplicadas

### 1. **Comillas Dobles → Comillas Simples**

**Problema:** Las comillas dobles en comandos Docker causaban errores de interpretación.

**Solución:**
```bash
# ANTES (❌)
docker exec ticketing-postgres psql -c "DROP SCHEMA public CASCADE;"

# DESPUÉS (✅)
docker exec ticketing-postgres psql -c 'DROP SCHEMA public CASCADE;'
```

### 2. **Rutas Relativas**

**Problema:** Las rutas absolutas no funcionaban en otros PCs.

**Solución PowerShell:**
```powershell
$scriptPath = $PSScriptRoot
$backupDir = Join-Path $scriptPath "backups\$date"
$prismaPath = Join-Path $scriptPath "..\..\backend\admin\prisma\schema.prisma"
```

**Solución Bash:**
```bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
backupDir="$SCRIPT_DIR/backups/$date"
prismaPath="$SCRIPT_DIR/../../backend/admin/prisma/schema.prisma"
```

### 3. **MongoDB Automático**

**Problema:** MongoDB no se restauraba automáticamente.

**Solución:**
```bash
# Limpiar
docker exec ticketing-mongodb mongosh --eval 'use ticketing; db.users.deleteMany({})'

# Restaurar
docker cp "$backupDir/mongodb_users_$timestamp.json" ticketing-mongodb:/tmp/users_restore.json
docker exec ticketing-mongodb mongoimport --db=ticketing --collection=users --file=/tmp/users_restore.json --jsonArray
```

### 4. **Prisma Sincronizado**

**Problema:** Usaba `prisma db pull` que no aplicaba cambios.

**Solución:**
```bash
# ANTES (❌)
npx prisma db pull

# DESPUÉS (✅)
npx prisma db push --accept-data-loss
npx prisma generate
```

---

## 🔄 Instrucciones de Restore

### ⚠️ IMPORTANTE: Leer antes de restaurar

Este proceso **sobrescribirá completamente** las bases de datos actuales.

### Requisitos Previos

1. **Docker Desktop** instalado y funcionando
2. **Node.js** instalado (v18 o superior)
3. **Contenedores Docker levantados:**
   ```powershell
   docker-compose up -d
   ```

4. **Verificar contenedores activos:**
   ```powershell
   docker ps
   ```
   Debes ver: `ticketing-postgres`, `ticketing-mongodb`, `ticketing-rabbitmq`

### Pasos para Restaurar

#### 1. Copiar carpeta de backup

Copia toda la carpeta `docker/bd_backup/` a tu nuevo PC:
```
ticketing-platform/
  └── docker/
      └── bd_backup/
          ├── backups/
          │   └── 2025-10-05/
          ├── backup-databases.ps1
          ├── backup-databases.sh
          ├── restore-databases.ps1
          ├── restore-databases.sh
          └── README.md
```

#### 2. Navegar a la carpeta

```powershell
cd ticketing-platform\docker\bd_backup
```

#### 3. Ejecutar restore

**Windows:**
```powershell
.\restore-databases.ps1 17-01
```

**Linux/Mac:**
```bash
./restore-databases.sh 17-01
```

#### 4. Confirmar

El script preguntará:
```
⚠️  ADVERTENCIA: Este proceso sobrescribirá las bases de datos actuales
¿Continuar con el restore? (s/N):
```

Escribe `s` y presiona Enter.

### Qué hace el script automáticamente

1. ✅ Detiene servicios Node.js activos
2. ✅ Limpia PostgreSQL (DROP SCHEMA CASCADE)
3. ✅ Restaura PostgreSQL desde dump SQL
4. ✅ Limpia MongoDB (deleteMany users)
5. ✅ Restaura MongoDB desde JSON
6. ✅ Restaura Prisma Schema
7. ✅ Sincroniza Prisma (`db push --accept-data-loss`)
8. ✅ Regenera Prisma Client (`generate`)
9. ✅ Reinicia servicios automáticamente

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
    ├── 2025-10-04/
    │   ├── postgres_full_backup_22-22.sql
    │   ├── mongodb_users_22-22.json
    │   ├── prisma_schema_22-22.prisma
    │   ├── postgres_categories_22-22.json
    │   ├── postgres_localities_22-22.json
    │   ├── postgres_venues_22-22.json
    │   └── BACKUP_INFO.md
    └── 2025-10-05/
        ├── postgres_full_backup_17-01.sql (61 KB)
        ├── mongodb_users_17-01.json (1 KB)
        ├── prisma_schema_17-01.prisma (8.5 KB)
        ├── postgres_categories_17-01.json
        ├── postgres_localities_17-01.json
        ├── postgres_venues_17-01.json
        └── BACKUP_INFO.md
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

## 🐛 Troubleshooting

### Error: "Cannot connect to Docker"

**Solución:** Asegúrate de que Docker Desktop esté corriendo.

### Error: "Request failed with status code 500"

**Causa:** El restore no se completó correctamente.

**Solución:**
1. Detén todos los servicios Node.js
2. Ejecuta el restore nuevamente
3. Espera a que termine completamente
4. Verifica los logs

### Error: "Prisma Client not found"

**Solución:**
```powershell
cd backend\admin
npx prisma generate
cd ..\..
```

### MongoDB no restaura usuarios

**Solución manual:**
```powershell
# Copiar archivo
docker cp docker\bd_backup\backups\2025-10-05\mongodb_users_17-01.json ticketing-mongodb:/tmp/users.json

# Importar
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/users.json --jsonArray
```

### PostgreSQL no restaura correctamente

**Solución:**
```powershell
# Limpiar base de datos
docker exec ticketing-postgres psql -U admin -d ticketing -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

# Restaurar
Get-Content backups\2025-10-05\postgres_full_backup_17-01.sql | docker exec -i ticketing-postgres psql -U admin -d ticketing
```

### Contenedores no están corriendo

**Solución:**
```powershell
# Ver logs
docker-compose logs ticketing-postgres
docker-compose logs ticketing-mongodb

# Reiniciar servicios
docker-compose restart
```

### Si nada funciona - Limpieza completa

```powershell
# Detener contenedores
docker-compose down -v

# Eliminar volúmenes
docker volume prune -f

# Levantar contenedores limpios
docker-compose up -d

# Ejecutar restore
cd docker\bd_backup
.\restore-databases.ps1 17-01
```

---

## 🔍 Verificación Post-Restore

### Verificar PostgreSQL
```powershell
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM \"Event\";"
```
Debería mostrar el número de eventos.

### Verificar MongoDB
```powershell
docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --eval "use ticketing; db.users.countDocuments()"
```
Debería mostrar el número de usuarios (3).

### Verificar Prisma
```powershell
cd backend\admin
npx prisma studio
```

### Iniciar Servicios

```powershell
# Admin-Service (Puerto 3003)
cd backend\admin
npm run dev

# User-Service (Puerto 3001)
cd backend\user-service
npm run dev

# Frontend (Puerto 4200)
cd frontend\ticketing-app
npm start
```

---

## 🔐 Credenciales

### Base de Datos PostgreSQL
- **Host:** localhost:5432
- **Database:** ticketing
- **User:** admin
- **Password:** admin123

### Base de Datos MongoDB
- **Host:** localhost:27017
- **Database:** ticketing (⚠️ NO ticketing-users)
- **User:** admin
- **Password:** admin123
- **Auth Source:** admin

### Usuarios de la Aplicación
- **Super Admin:** voro.super@ticketing.com / Voro123!
- **Usuario VIP:** xavi.vip@ticketing.com / Xavi123!
- **Usuario Normal:** test@test.com / Test123!

---

## 📦 Archivos de Backup

### Contenido Típico:

**PostgreSQL (~61 KB):**
- 6 eventos activos
- 10 venues
- 5 categorías
- 10 subcategorías
- Localidades por evento
- Admins del sistema

**MongoDB (~1 KB):**
- 3 usuarios registrados
- Roles: SUPER_ADMIN, VIP, USER
- Perfiles completos

---

## ⚠️ Puntos Críticos Resueltos

### Error Original:
```
[API Error] 500 - /api/events/public Request failed with status code 500
```

### Causas Identificadas:
1. ❌ MongoDB no se restauraba (usuarios faltantes)
2. ❌ Prisma no se sincronizaba (schema desactualizado)
3. ❌ PostgreSQL tenía datos corruptos mezclados
4. ❌ Comillas dobles causaban errores en comandos

### Solución Aplicada:
1. ✅ MongoDB se limpia y restaura completamente
2. ✅ Prisma se sincroniza con `db push`
3. ✅ PostgreSQL se limpia con DROP SCHEMA CASCADE
4. ✅ Comillas simples en todos los comandos Docker

---

## 📝 Notas Finales

- **Todas las rutas son relativas** - Funciona en cualquier PC
- **Comillas simples** - Sin problemas de interpretación
- **Limpieza automática** - Sin datos mezclados
- **Sincronización completa** - Prisma alineado con PostgreSQL
- **Documentación incluida** - Todo lo necesario en un solo archivo

---

## 📞 Contacto y Soporte

**Desarrollador:** Voro  
**Email:** voromb@hotmail.com  
**Versión del Sistema:** 1.0.0  
**Última actualización:** 2025-10-05  
**Versión del backup:** 17-01

---

**FIN DEL DOCUMENTO**
