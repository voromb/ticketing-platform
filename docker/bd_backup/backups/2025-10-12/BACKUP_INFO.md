# BACKUP COMPLETO - TICKETING PLATFORM
**Fecha:** 2025-10-12 22-59  
**Commit:** 198b33b  
**Rama:** feature_Voro_2

## CONTENIDO DEL BACKUP

### PostgreSQL - Base Principal (ticketing)
- postgres_full_backup_22-59.sql - Dump completo de la BD principal
- postgres_events_22-59.json - Eventos exportados via API
- postgres_venues_22-59.json - Venues exportados via API
- postgres_venues_page2_22-59.json - Venues página 2

### PostgreSQL - Festival Services (approvals_db)
- postgres_approvals_db_22-59.sql - Base de datos de aprobaciones (Prisma)

### MongoDB - Base Principal (ticketing)
- mongodb_users_22-59.json - Usuarios del sistema

### MongoDB - Festival Services (festival_services)
- mongodb_travels_22-59.json - Colección de viajes
- mongodb_restaurants_22-59.json - Colección de restaurantes  
- mongodb_products_22-59.json - Colección de productos/merchandising
- festival_services_dump_22-59.tar.gz - Dump completo de la BD

### Prisma Schemas
- prisma_admin_schema_22-59.prisma - Schema del backend admin
- prisma_services_schema_22-59.prisma - Schema del backend services

## PARA RESTAURAR EN OTRO EQUIPO

### 1. Restaurar PostgreSQL (Base Principal)
```bash
# Copiar el archivo SQL al contenedor
docker cp postgres_full_backup_22-59.sql ticketing-postgres:/tmp/

# Restaurar la base de datos
docker exec ticketing-postgres psql -U admin -d ticketing -f /tmp/postgres_full_backup_22-59.sql
```

### 2. Restaurar PostgreSQL (Festival Services)
```bash
# Crear la base de datos approvals_db si no existe
docker exec ticketing-postgres psql -U admin -c "CREATE DATABASE approvals_db;"

# Restaurar
docker cp postgres_approvals_db_22-59.sql ticketing-postgres:/tmp/
docker exec ticketing-postgres psql -U admin -d approvals_db -f /tmp/postgres_approvals_db_22-59.sql
```

### 3. Restaurar MongoDB (Usuarios)
```bash
# Importar usuarios
docker cp mongodb_users_22-59.json ticketing-mongodb:/tmp/
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/mongodb_users_22-59.json
```

### 4. Restaurar MongoDB (Festival Services)
```bash
# Opción A: Restaurar colecciones individuales
docker cp mongodb_travels_22-59.json ticketing-mongodb:/tmp/
docker cp mongodb_restaurants_22-59.json ticketing-mongodb:/tmp/  
docker cp mongodb_products_22-59.json ticketing-mongodb:/tmp/

docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=travels --file=/tmp/mongodb_travels_22-59.json
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=restaurants --file=/tmp/mongodb_restaurants_22-59.json
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=products --file=/tmp/mongodb_products_22-59.json

# Opción B: Restaurar dump completo
docker cp festival_services_dump_22-59.tar.gz ticketing-mongodb:/tmp/
docker exec ticketing-mongodb tar -xzf /tmp/festival_services_dump_22-59.tar.gz -C /tmp/
docker exec ticketing-mongodb mongorestore --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services /tmp/festival_services/
```

### 5. Configurar Prisma
```bash
# En el backend admin
cd backend/admin
npm install
npx prisma generate
npx prisma db push

# En el backend services  
cd backend/services/festival-services
npm install
npx prisma generate
npx prisma db push
```

## VARIABLES DE ENTORNO NECESARIAS

### Backend Admin (.env)
```
DATABASE_URL="postgresql://admin:admin123@localhost:5432/ticketing?schema=public"
```

### Backend Services (.env)
```
MONGODB_URI=mongodb://admin:admin123@localhost:27017/festival_services?authSource=admin
DATABASE_URL="postgresql://admin:admin123@localhost:5432/approvals_db?schema=public"
```

---
**Generado automáticamente por:** backup-databases.ps1  
**Fecha de creación:** 2025-10-12 22:59:54
