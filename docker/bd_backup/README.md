# 🚀 Instalación y Backup - Plataforma de Ticketing

## 📦 Instalación Completa

### 1. Levantar Docker
```bash
docker-compose up -d
```

### 2. Restaurar PostgreSQL
```bash
# Windows
Get-Content docker/bd_backup/postgres_admin_backup.sql | docker exec -i ticketing-postgres psql -U admin -d ticketing

# Linux/Mac
cat docker/bd_backup/postgres_admin_backup.sql | docker exec -i ticketing-postgres psql -U admin -d ticketing
```

### 3. Restaurar MongoDB
```bash
docker cp docker/bd_backup/mongo_backup/ ticketing-mongo:/backup/
docker exec ticketing-mongo mongorestore --db ticketing_users /backup/mongo_backup/
```

### 4. Configurar .env
Crear `backend/admin/.env` con conexión DB, JWT secret, etc.
Copiar `backend/users/.env.example` a `backend/users/.env`

### 5. Instalar y Ejecutar
```bash
# Admin-Service
cd backend/admin
npm install && npm run prisma:generate && npm start

# User-Service  
cd backend/users
npm install && npm start

# Frontend
cd frontend/ticketing-app
npm install && ng serve
```

### 6. Acceder
- Frontend: http://localhost:4200
- Admin: http://localhost:4200/admin
- Login: voro.super@ticketing.com / Voro123!

## 💾 Comandos de Backup

### Crear Backups
```bash
# PostgreSQL
docker exec ticketing-postgres pg_dump -U admin -d ticketing > docker/bd_backup/postgres_admin_backup.sql

# MongoDB
docker exec ticketing-mongo mongodump --db ticketing_users --out /backup/
docker cp ticketing-mongo:/backup/ticketing_users docker/bd_backup/mongo_backup/
```

### Verificar
```bash
docker ps
docker exec ticketing-postgres psql -U admin -d ticketing -c "\dt"
docker exec ticketing-mongo mongo ticketing_users --eval "db.users.count()"
```

## 📊 Contenido de los Backups
- **PostgreSQL:** 6 eventos + 10 venues + admins + auditorías
- **MongoDB:** 3 usuarios + 1 VIP + historial promociones
