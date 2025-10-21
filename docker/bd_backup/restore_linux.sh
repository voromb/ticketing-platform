#!/bin/bash

# ========================================
# SCRIPT DE RESTAURACIÓN AUTOMÁTICA V2.0
# Sistema de Ticketing - 100% ROBUSTO
# Basado en restore.ps1
# ========================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parámetros
BACKUP_DATE="${1:-}"
SKIP_CONFIRMATION="${2:-false}"

# Verificar argumento obligatorio
if [ -z "$BACKUP_DATE" ]; then
    echo -e "${RED}Error: Debe especificar la fecha del backup${NC}"
    echo "Uso: $0 BACKUP_DATE [skip-confirmation]"
    echo "Ejemplo: $0 2025-10-20"
    echo "Ejemplo: $0 2025-10-20 skip-confirmation"
    exit 1
fi

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}RESTAURACIÓN AUTOMÁTICA V2.0${NC}"
echo -e "${CYAN}========================================${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_PATH="$SCRIPT_DIR/backups/$BACKUP_DATE"

if [ ! -d "$BACKUP_PATH" ]; then
    echo -e "${RED}ERROR: No existe el backup para la fecha $BACKUP_DATE${NC}"
    echo -e "${YELLOW}Ruta buscada: $BACKUP_PATH${NC}"
    exit 1
fi

echo -e "${BLUE}Fecha de backup: $BACKUP_DATE${NC}"
echo -e "${BLUE}Ruta: $BACKUP_PATH${NC}"
echo -e "${CYAN}Modo: COMPLETAMENTE AUTOMÁTICO${NC}"

# ===== VERIFICACIONES INICIALES =====

echo ""
echo -e "${YELLOW}Verificando archivos de backup...${NC}"
REQUIRED_FILES=(
    "postgres_ticketing_backup.sql"
    "postgres_ticketing_admin_backup.sql"
    "postgres_approvals_backup.sql"
    "mongodb_backup.archive"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$BACKUP_PATH/$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file - NO ENCONTRADO${NC}"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo -e "${RED}Faltan archivos de backup necesarios${NC}"
    exit 1
fi

# Confirmación
if [ "$SKIP_CONFIRMATION" != "skip-confirmation" ]; then
    echo ""
    echo -e "${YELLOW}ADVERTENCIA: Esta operación eliminará todos los datos actuales${NC}"
    read -p "¿Desea continuar con la restauración? (s/N): " CONFIRM
    if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
        echo -e "${RED}Restauración cancelada por el usuario${NC}"
        exit 0
    fi
fi

# ===== VERIFICACIÓN DE CONTENEDORES =====

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}VERIFICACIÓN DE CONTENEDORES${NC}"
echo -e "${CYAN}========================================${NC}"

REQUIRED_CONTAINERS=("ticketing-postgres" "ticketing-mongodb")
for container in "${REQUIRED_CONTAINERS[@]}"; do
    if docker ps --filter "name=$container" --filter "status=running" --format "{{.Names}}" | grep -q "$container"; then
        echo -e "${GREEN}✓ $container está listo${NC}"
    else
        echo -e "${RED}✗ No se puede proceder sin $container funcionando${NC}"
        exit 1
    fi
done

# ===== INICIANDO RESTAURACIÓN =====

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}INICIANDO RESTAURACIÓN${NC}"
echo -e "${CYAN}========================================${NC}"

START_TIME=$(date +%s)

# Función para restaurar base de datos PostgreSQL
restore_postgresql_database() {
    local DB_NAME="$1"
    local BACKUP_FILE="$2"
    
    echo ""
    echo -e "${BLUE}Restaurando PostgreSQL: $DB_NAME${NC}"
    
    # Terminar conexiones activas
    docker exec ticketing-postgres psql -U admin -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1
    
    # Eliminar y recrear base de datos
    docker exec ticketing-postgres psql -U admin -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null 2>&1
    docker exec ticketing-postgres psql -U admin -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null 2>&1
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Error creando base $DB_NAME${NC}"
        return 1
    fi
    
    # Crear usuario si no existe
    docker exec ticketing-postgres psql -U admin -d postgres -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ticketing_user') THEN CREATE USER ticketing_user WITH PASSWORD 'ticketing_password' CREATEDB SUPERUSER; END IF; END \$\$;" > /dev/null 2>&1
    
    # Restaurar datos
    if [ -f "$BACKUP_PATH/$BACKUP_FILE" ]; then
        cat "$BACKUP_PATH/$BACKUP_FILE" | docker exec -i ticketing-postgres psql -U admin -d "$DB_NAME" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            # Verificar restauración
            TABLE_COUNT=$(docker exec ticketing-postgres psql -U admin -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
            echo -e "${GREEN}✓ $DB_NAME restaurada correctamente ($TABLE_COUNT tablas)${NC}"
            return 0
        else
            echo -e "${RED}✗ Error restaurando datos en $DB_NAME${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ Archivo de backup no encontrado: $BACKUP_FILE${NC}"
        return 1
    fi
}

# PostgreSQL - Restaurar todas las bases de datos
POSTGRES_SUCCESS=true
restore_postgresql_database "ticketing" "postgres_ticketing_backup.sql" || POSTGRES_SUCCESS=false
restore_postgresql_database "ticketing_admin" "postgres_ticketing_admin_backup.sql" || POSTGRES_SUCCESS=false
restore_postgresql_database "approvals_db" "postgres_approvals_backup.sql" || POSTGRES_SUCCESS=false

# MongoDB - Restaurar
echo ""
echo -e "${BLUE}Restaurando MongoDB...${NC}"

MONGO_SUCCESS=true
MONGO_FILE="$BACKUP_PATH/mongodb_backup.archive"

if [ ! -f "$MONGO_FILE" ]; then
    echo -e "${RED}✗ Archivo MongoDB backup no encontrado${NC}"
    MONGO_SUCCESS=false
else
    # Copiar archivo al contenedor
    docker cp "$MONGO_FILE" ticketing-mongodb:/tmp/mongodb_backup.archive > /dev/null 2>&1
    
    # Restaurar con autenticación
    docker exec ticketing-mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --archive=/tmp/mongodb_backup.archive --drop --gzip > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        # Verificar restauración
        USER_COUNT=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.users.countDocuments()" --quiet 2>/dev/null | tr -d ' ')
        if [ -n "$USER_COUNT" ]; then
            echo -e "${GREEN}✓ MongoDB restaurada correctamente ($USER_COUNT usuarios)${NC}"
        else
            echo -e "${YELLOW}⚠ MongoDB restaurada pero sin verificación completa${NC}"
        fi
    else
        echo -e "${RED}✗ Error restaurando MongoDB${NC}"
        MONGO_SUCCESS=false
    fi
fi

# Prisma - Restaurar migraciones
echo ""
echo -e "${BLUE}Restaurando migraciones Prisma...${NC}"

PRISMA_SUCCESS=true
PRISMA_BACKUP="$BACKUP_PATH/prisma"

if [ ! -d "$PRISMA_BACKUP" ]; then
    echo -e "${YELLOW}⚠ No se encontraron migraciones Prisma para restaurar${NC}"
else
    # Admin migrations
    if [ -d "$PRISMA_BACKUP/admin" ]; then
        ADMIN_TARGET="$SCRIPT_DIR/../../backend/admin/prisma"
        if [ -d "$ADMIN_TARGET" ]; then
            cp -r "$PRISMA_BACKUP/admin"/* "$ADMIN_TARGET/" 2>/dev/null
            echo -e "${GREEN}✓ Migraciones Admin restauradas${NC}"
        fi
    fi
    
    # Festival migrations
    if [ -d "$PRISMA_BACKUP/festival-services" ]; then
        FESTIVAL_TARGET="$SCRIPT_DIR/../../backend/services/festival-services/prisma"
        if [ -d "$FESTIVAL_TARGET" ]; then
            cp -r "$PRISMA_BACKUP/festival-services"/* "$FESTIVAL_TARGET/" 2>/dev/null
            echo -e "${GREEN}✓ Migraciones Festival restauradas${NC}"
        fi
    fi
    
    # Docker schema
    if [ -d "$PRISMA_BACKUP/docker" ]; then
        DOCKER_TARGET="$SCRIPT_DIR/../prisma"
        if [ -d "$DOCKER_TARGET" ]; then
            cp -r "$PRISMA_BACKUP/docker"/* "$DOCKER_TARGET/" 2>/dev/null
            echo -e "${GREEN}✓ Schema Docker restaurado${NC}"
        fi
    fi
fi

# ===== VERIFICACIÓN FINAL =====

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}VERIFICACIÓN FINAL${NC}"
echo -e "${CYAN}========================================${NC}"

if [ "$POSTGRES_SUCCESS" = true ] && [ "$MONGO_SUCCESS" = true ] && [ "$PRISMA_SUCCESS" = true ]; then
    echo ""
    echo -e "${GREEN}RESTAURACIÓN COMPLETADA EXITOSAMENTE!${NC}"
    
    # Verificación rápida de datos
    echo ""
    echo -e "${BLUE}Verificando datos restaurados...${NC}"
    
    EVENTS=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' ')
    VENUES=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' ')
    USERS=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.users.countDocuments()" --quiet 2>/dev/null | tr -d ' ')
    
    [ -n "$EVENTS" ] && echo -e "${GREEN}Eventos principales: $EVENTS${NC}"
    [ -n "$VENUES" ] && echo -e "${GREEN}Venues principales: $VENUES${NC}"
    [ -n "$USERS" ] && echo -e "${GREEN}Usuarios MongoDB: $USERS${NC}"
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    MINUTES=$((DURATION / 60))
    SECONDS=$((DURATION % 60))
    echo ""
    echo -e "${CYAN}Tiempo total: ${MINUTES}m ${SECONDS}s${NC}"
    
    echo ""
    echo -e "${BLUE}URLs del sistema:${NC}"
    echo -e "${CYAN}   • Frontend: http://localhost:4200${NC}"
    echo -e "${CYAN}   • Admin API: http://localhost:3001${NC}"
    echo -e "${CYAN}   • Festival API: http://localhost:3003${NC}"
    
else
    echo ""
    echo -e "${RED}LA RESTAURACIÓN TUVO PROBLEMAS${NC}"
    
    if [ "$POSTGRES_SUCCESS" = true ]; then
        echo -e "${GREEN}PostgreSQL: OK${NC}"
    else
        echo -e "${RED}PostgreSQL: ERROR${NC}"
    fi
    
    if [ "$MONGO_SUCCESS" = true ]; then
        echo -e "${GREEN}MongoDB: OK${NC}"
    else
        echo -e "${RED}MongoDB: ERROR${NC}"
    fi
    
    if [ "$PRISMA_SUCCESS" = true ]; then
        echo -e "${GREEN}Prisma: OK${NC}"
    else
        echo -e "${RED}Prisma: ERROR${NC}"
    fi
    
    exit 1
fi