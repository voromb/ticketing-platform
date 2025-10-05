# 🔄 INSTRUCCIONES DE RESTORE - Ticketing Platform

## ⚠️ IMPORTANTE: Leer antes de restaurar

Este documento explica cómo restaurar correctamente el backup de la base de datos en otro PC.

---

## 📋 Requisitos Previos

1. **Docker Desktop** instalado y funcionando
2. **Node.js** instalado (v18 o superior)
3. **Contenedores Docker** levantados:
   ```powershell
   docker-compose up -d
   ```

4. **Verificar que los contenedores estén activos:**
   ```powershell
   docker ps
   ```
   Debes ver: `ticketing-postgres`, `ticketing-mongodb`, `ticketing-rabbitmq`

---

## 🚀 Pasos para Restaurar

### 1. Copiar la carpeta de backup

Copia toda la carpeta `docker/bd_backup/backups/2025-10-05/` a tu nuevo PC en la misma ubicación:
```
ticketing-platform/
  └── docker/
      └── bd_backup/
          └── backups/
              └── 2025-10-05/
```

### 2. Navegar a la carpeta de scripts

```powershell
cd ticketing-platform\docker\bd_backup
```

### 3. Ejecutar el script de restore

**Windows (PowerShell):**
```powershell
.\restore-databases.ps1 11-36
```

**Linux/Mac (Bash):**
```bash
./restore-databases.sh 11-36
```

### 4. Confirmar el restore

El script te preguntará:
```
⚠️  ADVERTENCIA: Este proceso sobrescribirá las bases de datos actuales
¿Continuar con el restore? (s/N):
```

Escribe `s` y presiona Enter.

---

## 🔧 Qué hace el script automáticamente

1. ✅ **Detiene los servicios Node.js** activos
2. ✅ **Limpia PostgreSQL** completamente (DROP SCHEMA public CASCADE)
3. ✅ **Restaura PostgreSQL** desde el dump SQL
4. ✅ **Limpia MongoDB** (colección users)
5. ✅ **Restaura MongoDB** desde el JSON
6. ✅ **Restaura Prisma Schema**
7. ✅ **Sincroniza Prisma** con PostgreSQL (`prisma db push`)
8. ✅ **Regenera Prisma Client** (`prisma generate`)
9. ✅ **Reinicia los servicios** automáticamente

---

## 📦 Archivos que se restauran

- `postgres_full_backup_11-36.sql` (61 KB) - Base de datos completa
- `mongodb_users_11-36.json` (1 KB) - Usuarios
- `prisma_schema_11-36.prisma` (8.5 KB) - Schema de Prisma
- `postgres_categories_11-36.json` - Categorías
- `postgres_localities_11-36.json` - Localidades
- `postgres_venues_11-36.json` - Venues

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "Cannot connect to Docker"
**Solución:** Asegúrate de que Docker Desktop esté corriendo.

### Error: "Request failed with status code 500"
**Causa:** El restore no se completó correctamente.

**Solución:**
1. Detén todos los servicios Node.js
2. Ejecuta el restore nuevamente
3. Espera a que termine completamente
4. Verifica los logs de los servicios

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
# Copiar archivo al contenedor
docker cp docker\bd_backup\backups\2025-10-05\mongodb_users_11-36.json ticketing-mongodb:/tmp/users.json

# Importar manualmente
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/users.json --jsonArray
```

---

## 🔍 Verificar que el restore funcionó

### 1. Verificar PostgreSQL
```powershell
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM \"Event\";"
```
Debería mostrar el número de eventos.

### 2. Verificar MongoDB
```powershell
docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --eval "use ticketing; db.users.countDocuments()"
```
Debería mostrar el número de usuarios (3).

### 3. Verificar servicios
```powershell
# Iniciar admin-service
cd backend\admin
npm run dev

# En otra terminal, iniciar user-service
cd backend\user-service
npm run dev

# En otra terminal, iniciar frontend
cd frontend\ticketing-app
npm start
```

---

## 📝 Credenciales de Prueba

**Super Admin:**
- Email: `voro.super@ticketing.com`
- Password: `Voro123!`

**Usuario VIP:**
- Email: `xavi.vip@ticketing.com`
- Password: `Xavi123!`

---

## 🆘 Si nada funciona

1. **Limpia todo y empieza de cero:**
   ```powershell
   # Detener contenedores
   docker-compose down -v
   
   # Eliminar volúmenes
   docker volume prune -f
   
   # Levantar contenedores limpios
   docker-compose up -d
   
   # Ejecutar restore nuevamente
   cd docker\bd_backup
   .\restore-databases.ps1 11-36
   ```

2. **Verifica los logs:**
   ```powershell
   # Logs de PostgreSQL
   docker logs ticketing-postgres
   
   # Logs de MongoDB
   docker logs ticketing-mongodb
   ```

---

## 📞 Contacto

Si tienes problemas, contacta con el desarrollador original con:
- Logs completos del error
- Captura de pantalla del error
- Versión de Docker y Node.js

---

**Última actualización:** 2025-10-05
**Versión del backup:** 11-36
