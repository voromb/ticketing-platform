#!/bin/bash

# ========================================
# SCRIPT DE BACKUP AUTOMÁTICO
# Sistema de Ticketing - Basado en backup.ps1
# ========================================

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

BACKUP_DIR="${1:-}"

echo -e "${GREEN}=== BACKUP SISTEMA TICKETING ===${NC}"
echo "Iniciando backup completo del sistema..."

# Si no se especifica BackupDir, usar la fecha actual
if [ -z "$BACKUP_DIR" ]; then
    BACKUP_DATE=$(date +"%Y-%m-%d")
    BACKUP_DIR="backups/$BACKUP_DATE"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_PATH="$SCRIPT_DIR/$BACKUP_DIR"

if [ ! -d "$BACKUP_PATH" ]; then
    mkdir -p "$BACKUP_PATH"
    echo "Carpeta de backup creada: $BACKUP_PATH"
fi

echo ""
echo "1. BACKUP POSTGRESQL (TODAS LAS BASES DE DATOS)"

# Base de datos principal ticketing
POSTGRES_MAIN_FILE="$BACKUP_PATH/postgres_ticketing_backup.sql"
docker exec ticketing-postgres pg_dump -U admin -d ticketing --no-owner --no-privileges --inserts > "$POSTGRES_MAIN_FILE"
echo "PostgreSQL ticketing backup guardado: postgres_ticketing_backup.sql"

# Base de datos ticketing_admin
POSTGRES_ADMIN_FILE="$BACKUP_PATH/postgres_ticketing_admin_backup.sql"
docker exec ticketing-postgres pg_dump -U admin -d ticketing_admin --no-owner --no-privileges --inserts > "$POSTGRES_ADMIN_FILE"
echo "PostgreSQL ticketing_admin backup guardado: postgres_ticketing_admin_backup.sql"

# Base de datos approvals_db
POSTGRES_APPROVALS_FILE="$BACKUP_PATH/postgres_approvals_backup.sql"
docker exec ticketing-postgres pg_dump -U admin -d approvals_db --no-owner --no-privileges --inserts > "$POSTGRES_APPROVALS_FILE"
echo "PostgreSQL approvals_db backup guardado: postgres_approvals_backup.sql"

echo ""
echo "2. BACKUP MONGODB (Users + Festival Services)"
MONGO_FILE="$BACKUP_PATH/mongodb_backup.archive"
docker exec ticketing-mongodb mongodump --username admin --password admin123 --authenticationDatabase admin --archive=/tmp/backup.archive --gzip > /dev/null 2>&1
docker cp ticketing-mongodb:/tmp/backup.archive "$MONGO_FILE"
echo "MongoDB backup guardado en: mongodb_backup.archive"

echo ""
echo "3. BACKUP PRISMA MIGRATIONS"
PRISMA_BACKUP_DIR="$BACKUP_PATH/prisma"
if [ ! -d "$PRISMA_BACKUP_DIR" ]; then
    mkdir -p "$PRISMA_BACKUP_DIR"
fi

ADMIN_PRISMA_SOURCE="$SCRIPT_DIR/../../backend/admin/prisma"
FESTIVAL_PRISMA_SOURCE="$SCRIPT_DIR/../../backend/services/festival-services/prisma"
DOCKER_PRISMA_SOURCE="$SCRIPT_DIR/../prisma"

if [ -d "$ADMIN_PRISMA_SOURCE" ]; then
    ADMIN_PRISMA_TARGET="$PRISMA_BACKUP_DIR/admin"
    cp -r "$ADMIN_PRISMA_SOURCE" "$ADMIN_PRISMA_TARGET"
    echo "Migraciones Admin Prisma copiadas"
fi

if [ -d "$FESTIVAL_PRISMA_SOURCE" ]; then
    FESTIVAL_PRISMA_TARGET="$PRISMA_BACKUP_DIR/festival-services"
    cp -r "$FESTIVAL_PRISMA_SOURCE" "$FESTIVAL_PRISMA_TARGET"
    echo "Migraciones Festival Prisma copiadas"
fi

if [ -d "$DOCKER_PRISMA_SOURCE" ]; then
    DOCKER_PRISMA_TARGET="$PRISMA_BACKUP_DIR/docker"
    cp -r "$DOCKER_PRISMA_SOURCE" "$DOCKER_PRISMA_TARGET"
    echo "Schema Docker Prisma copiado"
fi

echo ""
echo "4. VERIFICACION EXHAUSTIVA DEL BACKUP"

# Verificar PostgreSQL ticketing
if [ -f "$POSTGRES_MAIN_FILE" ]; then
    POSTGRES_MAIN_SIZE=$(du -h "$POSTGRES_MAIN_FILE" | cut -f1)
    echo "PostgreSQL ticketing: $POSTGRES_MAIN_SIZE"

    # Contar INSERT statements específicos
    EVENT_INSERTS=$(grep -c 'INSERT INTO public."Event"' "$POSTGRES_MAIN_FILE" 2>/dev/null || echo "0")
    VENUE_INSERTS=$(grep -c 'INSERT INTO public."Venue"' "$POSTGRES_MAIN_FILE" 2>/dev/null || echo "0")
    CATEGORY_INSERTS=$(grep -c 'INSERT INTO public."EventCategory"' "$POSTGRES_MAIN_FILE" 2>/dev/null || echo "0")
    SUBCATEGORY_INSERTS=$(grep -c 'INSERT INTO public."EventSubcategory"' "$POSTGRES_MAIN_FILE" 2>/dev/null || echo "0")
    ORDER_INSERTS=$(grep -c 'INSERT INTO public."Order"' "$POSTGRES_MAIN_FILE" 2>/dev/null || echo "0")
    TICKET_INSERTS=$(grep -c 'INSERT INTO public."Ticket"' "$POSTGRES_MAIN_FILE" 2>/dev/null || echo "0")
    ADMIN_INSERTS=$(grep -c 'INSERT INTO public.admins' "$POSTGRES_MAIN_FILE" 2>/dev/null || echo "0")

    COMPANY_INSERTS=$(grep -c 'INSERT INTO public.companies' "$POSTGRES_MAIN_FILE" 2>/dev/null || echo "0")
    COMPANY_ADMIN_INSERTS=$(grep -c 'INSERT INTO public.company_admins' "$POSTGRES_MAIN_FILE" 2>/dev/null || echo "0")

    echo "  - Eventos: $EVENT_INSERTS"
    echo "  - Venues: $VENUE_INSERTS"
    echo "  - Categorias: $CATEGORY_INSERTS"
    echo "  - Subcategorias: $SUBCATEGORY_INSERTS"
    echo "  - Ordenes PostgreSQL: $ORDER_INSERTS"
    echo "  - Tickets: $TICKET_INSERTS"
    echo "  - Admins: $ADMIN_INSERTS"
    echo -e "  - ${CYAN}Compañías: $COMPANY_INSERTS${NC}"
    echo -e "  - ${CYAN}Company Admins: $COMPANY_ADMIN_INSERTS${NC}"
fi

# Verificar MongoDB (conteo de colecciones)
echo ""
echo "MongoDB Collections:"
USERS_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('ticketing').users.countDocuments()" 2>/dev/null || echo "0")
RESTAURANTS_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').restaurants.countDocuments()" 2>/dev/null || echo "0")
RESERVATIONS_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').reservations.countDocuments()" 2>/dev/null || echo "0")
TRIPS_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').trips.countDocuments()" 2>/dev/null || echo "0")
BOOKINGS_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').bookings.countDocuments()" 2>/dev/null || echo "0")
PRODUCTS_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').products.countDocuments()" 2>/dev/null || echo "0")
CARTS_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').carts.countDocuments()" 2>/dev/null || echo "0")
ORDER_ITEMS_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').orderitems.countDocuments()" 2>/dev/null || echo "0")
PACKAGE_ORDERS_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').orders.countDocuments()" 2>/dev/null || echo "0")

echo ""
echo -e "  ${CYAN}[ticketing]${NC}"
echo -e "  - ${YELLOW}Usuarios: $USERS_COUNT${NC}"

echo ""
echo -e "  ${CYAN}[festival_services]${NC}"
echo -e "  - ${YELLOW}Restaurantes: $RESTAURANTS_COUNT${NC}"
echo -e "  - ${YELLOW}Reservas Restaurantes: $RESERVATIONS_COUNT${NC}"
echo -e "  - ${YELLOW}Viajes: $TRIPS_COUNT${NC}"
echo -e "  - ${YELLOW}Bookings Viajes: $BOOKINGS_COUNT${NC}"
echo -e "  - ${YELLOW}Productos: $PRODUCTS_COUNT${NC}"
echo -e "  - ${YELLOW}Carritos: $CARTS_COUNT${NC}"
echo -e "  - ${YELLOW}Ordenes Merchandising: $ORDER_ITEMS_COUNT${NC}"
echo -e "  - \033[0;35mOrdenes Paquetes: $PACKAGE_ORDERS_COUNT\033[0m"
echo ""

# Verificar PostgreSQL ticketing_admin
if [ -f "$POSTGRES_ADMIN_FILE" ]; then
    POSTGRES_ADMIN_SIZE=$(du -h "$POSTGRES_ADMIN_FILE" | cut -f1)
    echo "PostgreSQL ticketing_admin: $POSTGRES_ADMIN_SIZE"
    
    ADMIN_EVENT_INSERTS=$(grep -c 'INSERT INTO public."Event"' "$POSTGRES_ADMIN_FILE" 2>/dev/null || echo "0")
    ADMIN_VENUE_INSERTS=$(grep -c 'INSERT INTO public."Venue"' "$POSTGRES_ADMIN_FILE" 2>/dev/null || echo "0")
    ADMIN_CATEGORY_INSERTS=$(grep -c 'INSERT INTO public."EventCategory"' "$POSTGRES_ADMIN_FILE" 2>/dev/null || echo "0")
    
    echo "  - Eventos adicionales: $ADMIN_EVENT_INSERTS"
    echo "  - Venues adicionales: $ADMIN_VENUE_INSERTS"
    echo "  - Categorias: $ADMIN_CATEGORY_INSERTS"
fi

# Verificar PostgreSQL approvals_db
if [ -f "$POSTGRES_APPROVALS_FILE" ]; then
    POSTGRES_APPROVALS_SIZE=$(du -h "$POSTGRES_APPROVALS_FILE" | cut -f1)
    echo "PostgreSQL approvals_db: $POSTGRES_APPROVALS_SIZE"
    
    APPROVAL_INSERTS=$(grep -c 'INSERT INTO public."Approval"' "$POSTGRES_APPROVALS_FILE" 2>/dev/null || echo "0")
    echo "  - Approvals: $APPROVAL_INSERTS"
fi

if [ -f "$MONGO_FILE" ]; then
    MONGO_SIZE=$(du -h "$MONGO_FILE" | cut -f1)
    echo "MongoDB: $MONGO_SIZE"
fi

PRISMA_FILES=$(find "$PRISMA_BACKUP_DIR" -type f 2>/dev/null | wc -l)
echo "Prisma: $PRISMA_FILES archivos copiados"

echo ""
echo -e "${GREEN}=== BACKUP COMPLETADO ===${NC}"
echo "Ubicacion: $BACKUP_PATH"
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"

# Verificar si existe base de datos para festival-services en PostgreSQL
FESTIVAL_PG_EXISTS=$(docker exec ticketing-postgres psql -U admin -l 2>/dev/null | grep -c "festival_services" || echo "0")
if [ "$FESTIVAL_PG_EXISTS" -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}ADVERTENCIA: Encontrada base PostgreSQL festival_services no respaldada!${NC}"
else
    echo ""
    echo -e "${GREEN}Festival Services: Solo MongoDB (correcto)${NC}"
fi

echo ""
echo "RESUMEN TOTAL:"
if [ -f "$POSTGRES_MAIN_FILE" ] && [ -f "$POSTGRES_ADMIN_FILE" ] && [ -f "$POSTGRES_APPROVALS_FILE" ]; then
    TOTAL_EVENTS=$((EVENT_INSERTS + ADMIN_EVENT_INSERTS))
    TOTAL_VENUES=$((VENUE_INSERTS + ADMIN_VENUE_INSERTS))
    echo -e "${CYAN}EVENTOS TOTALES: $TOTAL_EVENTS ($EVENT_INSERTS + $ADMIN_EVENT_INSERTS)${NC}"
    echo -e "${CYAN}VENUES TOTALES: $TOTAL_VENUES ($VENUE_INSERTS + $ADMIN_VENUE_INSERTS)${NC}"
    echo -e "${CYAN}APPROVALS: $APPROVAL_INSERTS${NC}"
    echo -e "${GREEN}BACKUP 100% COMPLETO${NC}"
fi