# ================================

# GUÍA DE USO - SISTEMA DE RESTORE

# ================================

## 🚀 INSTRUCCIONES DE USO

### 1. Restauración Completa

```powershell
# Restaurar todo el sistema con confirmación
.\restore.ps1 -BackupDate "2025-10-18"

# Restaurar sin confirmación (automático)
.\restore.ps1 -BackupDate "2025-10-18" -SkipConfirmation

# IMPORTANTE: Después del restore, regenerar Prisma Client
cd C:\Programacion_2DAW\ticketing-platform\backend\admin
npx prisma generate

cd C:\Programacion_2DAW\ticketing-platform\backend\services\festival-services
npx prisma generate
```

**⚠️ CRÍTICO:** Siempre ejecutar `npx prisma generate` después del restore en ambos backends.

### 2. Verificación Post-Restore

```powershell
# Verificación básica
scripts\verify-database.ps1

.\verify-database.ps1

```

### 3. Backup Manual (si necesario)

```powershell
# Crear nuevo backup completo (usa fecha actual automáticamente)
.\backup.ps1

# El backup se guardará en: backups\YYYY-MM-DD
# Ejemplo: backups\2025-10-18
```

**📅 Nota:** El script de backup machaca backups anteriores dentro de la misma carpeta.

---

## 📊 QUE SE RESTAURA EXACTAMENTE

### Datos Principales

-   **438 eventos totales** (419 principales + 19 admin)
-   **97 venues totales** (85 principales + 12 admin)
-   **15 categorías/subcategorías** completas
-   **5 usuarios/admins** con credenciales
-   **2 aprobaciones** del sistema de workflow
-   **15 tablas PostgreSQL** (incluidas `companies` y `company_admins` - Sistema COMPANY_ADMIN)

### Funcionalidades Restauradas

-   ✅ Sistema de usuarios y autenticación
-   ✅ Gestión completa de eventos y venues
-   ✅ Sistema de categorías y subcategorías
-   ✅ Localidades y precios por evento
-   ✅ Sistema de órdenes y tickets
-   ✅ Panel administrativo completo
-   ✅ API de servicios de usuario
-   ✅ API de servicios de festivales
-   ✅ Comunicación entre microservicios (RabbitMQ)
-   ✅ Migraciones de base de datos (Prisma)

### URLs de Acceso Post-Restore

-   🌐 **Frontend**: http://localhost:4200
-   🔧 **Admin API**: http://localhost:3001
-   👤 **User API**: http://localhost:3002
-   🎪 **Festival API**: http://localhost:3003

### Credenciales Restauradas

-   🔑 **super@admin.com** (SUPER_ADMIN)
-   🔑 **admin@ticketing.com** (ADMIN)
-   🔑 **voro.super@ticketing.com** (SUPER_ADMIN)

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### Antes de Restaurar

1. **Todos los datos actuales serán ELIMINADOS**
2. **Los contenedores se reiniciarán completamente**
3. **El proceso toma entre 2-5 minutos**
4. **Docker debe estar ejecutándose**

### Durante la Restauración

-   No interrumpir el proceso
-   No cerrar la ventana de PowerShell
-   Esperar a que termine completamente

### Después de la Restauración

-   Verificar que todos los servicios respondan
-   Comprobar las URLs de acceso
-   Ejecutar el script de verificación

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Si el restore falla:

```powershell
# 1. Detener todo
docker-compose down --volumes

# 2. Limpiar volúmenes
docker volume prune -f

# 3. Reintentar
.\restore.ps1 -Force
```

### Si los contenedores no inician:

```powershell
# Verificar logs
docker-compose logs

# Reiniciar servicios específicos
docker-compose restart ticketing-postgres
docker-compose restart ticketing-mongodb
```

### Si las APIs no responden:

```powershell
# Verificar estado
.\verificar_restore.ps1

# Reiniciar servicios backend
docker-compose restart ticketing-admin
docker-compose restart ticketing-user-service
docker-compose restart ticketing-festival-services
```

---

-   **Backup creado**: 16/10/2025 19:32:34
-   **Versión del sistema**: 1.0
-   **Última verificación**: Completada exitosamente
-   **Estado**: ✅ Listo para restore completo
---

## 🎯 RESULTADO ESPERADO

Tras ejecutar `.\restore.ps1` exitosamente:

```
✅ RESUMEN DE RESTAURACIÓN:
   📊 PostgreSQL ticketing: 419 eventos, 85 venues, 2 categorías
   📊 PostgreSQL admin: 19 eventos, 12 venues
   📊 PostgreSQL approvals: 2 aprobaciones
   📊 MongoDB: ticketing + festival_services
   📊 Prisma migrations: 3 schemas
   📊 Total eventos: 438
   📊 Total venues: 97

🚀 Sistema completamente restaurado y funcional
```

El sistema estará **100% funcional** con todos los datos restaurados.
