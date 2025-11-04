♻️ Guía oficial de Restauración de Bases de Datos
Ticketing Platform — Docker + PostgreSQL + MongoDB + Prisma

Versión: 2025.10 — Última actualización: 27/10/2025

✅ Objetivo

Restaurar de forma segura todas las bases de datos del proyecto:

Servicio	Tecnologías	Contenedor
Ticketing / Admin	PostgreSQL	ticketing-postgres
Festival Services	MongoDB	ticketing-mongodb

Incluye:

✔ Eliminación limpia de bases previas
✔ Restauración desde backup local
✔ Sincronización correcta con Prisma
✔ Verificación automática de datos

📂 Estructura requerida del backup

Debe almacenarse en el directorio:

docker/bd_backup/backups/
└── YYYY-MM-DD/
    ├── postgres_ticketing_backup.sql
    ├── postgres_ticketing_admin_backup.sql
    ├── postgres_approvals_backup.sql
    ├── mongodb_backup.archive
    └── (otros archivos opcionales)


Ejemplo real:

docker/bd_backup/backups/2025-10-27/

🧰 Requisitos previos

✔ Docker en ejecución
✔ Contenedores activos:

docker ps | grep ticketing


Debe aparecer:

ticketing-postgres

ticketing-mongodb

🚀 Restauración completa (automática)

Desde:

docker/bd_backup/


Ejecutar:

.\restore-safe.ps1 -BackupDate 2025-10-27 -SkipConfirmation


Si se quiere pedir confirmación manual, omitir -SkipConfirmation:

.\restore-safe.ps1 -BackupDate 2025-10-27

✅ Qué hace el script automáticamente
Proceso	Estado
Detener conexiones activas a PostgreSQL	✅
Eliminar y recrear ticketing + admin + approvals	✅
Cargar .sql restaurados	✅
Restaurar MongoDB con drop de colecciones	✅
Eliminar directorio Prisma dentro del backup	✅
npx prisma db push --skip-generate	✅
Verificación final de datos tras restauración	✅
✅ Verificación manual opcional

Comprobar tablas restauradas:

docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM \"Event\";"
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM \"Venue\";"
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM companies;"
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM admins;"


Valores esperados:

Tabla	Mínimo esperado
Event	> 0
Venue	> 0
companies	6
admins	3

MongoDB:

docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db.getSiblingDB('ticketing').users.countDocuments()"


Debe devolver: 6 usuarios (según backup actual)

⚠️ Advertencias importantes
Situación	Acción recomendada
No eliminar carpeta prisma fuera del backup	Se usa para sincronizar schema
No ejecutar prisma migrate deploy tras restaurar	Puede romper claves e índices
Solo usar backups completos y consistentes	Mismo estado de Postgres y Mongo
🧪 Probar aplicaciones después de restaurar

Admin backend

cd backend/admin
npm run dev


Festival Services backend

cd backend/services/festival-services
npm run start:dev


Frontend

cd frontend/ticketing-app
ng serve -o


Comprobar:

✅ Login ADMIN funcionando
✅ Eventos visibles
✅ Restaurantes, viajes y merchandising disponibles
✅ Sin errores de base de datos

💡 Recomendación final

Crear un backup dorado del estado actual:

./backup.ps1 2025-10-27-gold


Y usarlo siempre como punto limpio de recuperación.

✅ Resumen
Estado del sistema	✅ Completamente operativo
PostgreSQL	✅ Restaurado
MongoDB	✅ Restaurado
Prisma	✅ Sincronizado
Datos admins y companies	✅ Correctos
Script restore-safe.ps1	✅ Última versión V4.2 en uso


