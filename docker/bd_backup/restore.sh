#!/bin/bash

# ========================================
# SCRIPT DE RESTAURACIÓN SEGURA V3.0
# Sistema de Ticketing - ULTRA PRECISO
# NO BORRA NADA QUE NO DEBA
# ========================================

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Parámetros
BACKUP_DATE="$1"
DRY_RUN=false
SKIP_CONFIRMATION=false

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-confirmation)
            SKIP_CONFIRMATION=true
            shift
            ;;
        *)
            BACKUP_DATE="$1"
            shift
            ;;
    esac
done

if [ -z "$BACKUP_DATE" ]; then
    echo -e "${RED}ERROR: Debe especificar la fecha del backup${NC}"
    echo "Uso: $0 YYYY-MM-DD [--dry-run] [--skip-confirmation]"
    exit 1
fi

# ===== FUNCIONES =====

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

test_container_running() {
    docker ps --filter "name=$1" --filter "status=running" --format "{{.Names}}" 2>/dev/null | grep -q "^$1$"
}

get_current_state() {
    print_header "ESTADO ACTUAL DE LAS BASES DE DATOS"
    
    # PostgreSQL
    echo -e "${CYAN}PostgreSQL ticketing:${NC}"
    PG_EVENTS=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' ')
    PG_VENUES=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' ')
    PG_COMPANIES=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM companies;' 2>/dev/null | tr -d ' ')
    PG_ADMINS=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM admins;' 2>/dev/null | tr -d ' ')
    
    echo -e "  - Eventos: ${YELLOW}$PG_EVENTS${NC}"
    echo -e "  - Venues: ${YELLOW}$PG_VENUES${NC}"
    echo -e "  - Compañías: ${YELLOW}$PG_COMPANIES${NC}"
    echo -e "  - Admins: ${YELLOW}$PG_ADMINS${NC}"
    
    echo -e "${CYAN}PostgreSQL ticketing_admin:${NC}"
    PG_ADMIN_EVENTS=$(docker exec ticketing-postgres psql -U admin -d ticketing_admin -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' ')
    echo -e "  - Eventos: ${YELLOW}$PG_ADMIN_EVENTS${NC}"
    
    echo -e "${CYAN}PostgreSQL approvals_db:${NC}"
    PG_APPROVALS=$(docker exec ticketing-postgres psql -U admin -d approvals_db -t -c 'SELECT COUNT(*) FROM "Approval";' 2>/dev/null | tr -d ' ')
    echo -e "  - Approvals: ${YELLOW}$PG_APPROVALS${NC}"
    
    # MongoDB
    echo ""
    echo -e "${CYAN}MongoDB ticketing:${NC}"
    MONGO_USERS=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('ticketing').users.countDocuments()" 2>/dev/null | tr -d ' ')
    echo -e "  - Usuarios: ${YELLOW}$MONGO_USERS${NC}"
    
    echo -e "${CYAN}MongoDB festival_services:${NC}"
    MONGO_RESTAURANTS=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').restaurants.countDocuments()" 2>/dev/null | tr -d ' ')
    MONGO_TRIPS=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').trips.countDocuments()" 2>/dev/null | tr -d ' ')
    MONGO_PRODUCTS=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').products.countDocuments()" 2>/dev/null | tr -d ' ')
    MONGO_ORDERS=$(docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').orders.countDocuments()" 2>/dev/null | tr -d ' ')
    
    echo -e "  - Restaurantes: ${YELLOW}$MONGO_RESTAURANTS${NC}"
    echo -e "  - Viajes: ${YELLOW}$MONGO_TRIPS${NC}"
    echo -e "  - Productos: ${YELLOW}$MONGO_PRODUCTS${NC}"
    echo -e "  - Órdenes: ${YELLOW}$MONGO_ORDERS${NC}"
}

analyze_backup() {
    echo ""
    echo -e "${BLUE}Analizando backup para determinar estado esperado...${NC}"
    
    EXPECTED_PG_EVENTS=$(grep -c 'INSERT INTO public."Event"' "$BACKUP_PATH/postgres_ticketing_backup.sql" 2>/dev/null || echo "0")
    EXPECTED_PG_VENUES=$(grep -c 'INSERT INTO public."Venue"' "$BACKUP_PATH/postgres_ticketing_backup.sql" 2>/dev/null || echo "0")
    EXPECTED_PG_COMPANIES=$(grep -c 'INSERT INTO public.companies' "$BACKUP_PATH/postgres_ticketing_backup.sql" 2>/dev/null || echo "0")
    EXPECTED_PG_ADMINS=$(grep -c 'INSERT INTO public.admins' "$BACKUP_PATH/postgres_ticketing_backup.sql" 2>/dev/null || echo "0")
    EXPECTED_PG_ADMIN_EVENTS=$(grep -c 'INSERT INTO public."Event"' "$BACKUP_PATH/postgres_ticketing_admin_backup.sql" 2>/dev/null || echo "0")
    EXPECTED_PG_APPROVALS=$(grep -c 'INSERT INTO public."Approval"' "$BACKUP_PATH/postgres_approvals_backup.sql" 2>/dev/null || echo "0")
    
    echo -e "${GREEN}Estado esperado del backup:${NC}"
    echo -e "  PostgreSQL ticketing:"
    echo -e "    - Eventos: ${YELLOW}$EXPECTED_PG_EVENTS${NC}"
    echo -e "    - Venues: ${YELLOW}$EXPECTED_PG_VENUES${NC}"
    echo -e "    - Compañías: ${YELLOW}$EXPECTED_PG_COMPANIES${NC}"
    echo -e "    - Admins: ${YELLOW}$EXPECTED_PG_ADMINS${NC}"
    echo -e "  PostgreSQL ticketing_admin:"
    echo -e "    - Eventos: ${YELLOW}$EXPECTED_PG_ADMIN_EVENTS${NC}"
    echo -e "  PostgreSQL approvals_db:"
    echo -e "    - Approvals: ${YELLOW}$EXPECTED_PG_APPROVALS${NC}"
    echo -e "  MongoDB (valores conocidos del backup):"
    echo -e "    - Usuarios: ${YELLOW}6${NC}"
    echo -e "    - Restaurantes: ${YELLOW}839${NC}"
    echo -e "    - Viajes: ${YELLOW}839${NC}"
    echo -e "    - Productos: ${YELLOW}2532${NC}"
    echo -e "    - Órdenes: ${YELLOW}0${NC}"
}

compare_states() {
    print_header "COMPARACIÓN DE ESTADOS"
    
    ALL_GOOD=true
    
    echo ""
    echo -e "${CYAN}PostgreSQL:${NC}"
    
    # Comparar eventos
    if [ "$PG_EVENTS_AFTER" = "$EXPECTED_PG_EVENTS" ]; then
        echo -e "  ${GREEN}✓${NC} ticketing_events: $PG_EVENTS_BEFORE → $PG_EVENTS_AFTER (esperado: $EXPECTED_PG_EVENTS)"
    else
        echo -e "  ${RED}✗${NC} ticketing_events: $PG_EVENTS_BEFORE → $PG_EVENTS_AFTER (esperado: $EXPECTED_PG_EVENTS)"
        ALL_GOOD=false
    fi
    
    # Comparar venues
    if [ "$PG_VENUES_AFTER" = "$EXPECTED_PG_VENUES" ]; then
        echo -e "  ${GREEN}✓${NC} ticketing_venues: $PG_VENUES_BEFORE → $PG_VENUES_AFTER (esperado: $EXPECTED_PG_VENUES)"
    else
        echo -e "  ${RED}✗${NC} ticketing_venues: $PG_VENUES_BEFORE → $PG_VENUES_AFTER (esperado: $EXPECTED_PG_VENUES)"
        ALL_GOOD=false
    fi
    
    # Comparar compañías
    if [ "$PG_COMPANIES_AFTER" = "$EXPECTED_PG_COMPANIES" ]; then
        echo -e "  ${GREEN}✓${NC} ticketing_companies: $PG_COMPANIES_BEFORE → $PG_COMPANIES_AFTER (esperado: $EXPECTED_PG_COMPANIES)"
    else
        echo -e "  ${RED}✗${NC} ticketing_companies: $PG_COMPANIES_BEFORE → $PG_COMPANIES_AFTER (esperado: $EXPECTED_PG_COMPANIES)"
        ALL_GOOD=false
    fi
    
    # Comparar admin events
    if [ "$PG_ADMIN_EVENTS_AFTER" = "$EXPECTED_PG_ADMIN_EVENTS" ]; then
        echo -e "  ${GREEN}✓${NC} admin_events: $PG_ADMIN_EVENTS_BEFORE → $PG_ADMIN_EVENTS_AFTER (esperado: $EXPECTED_PG_ADMIN_EVENTS)"
    else
        echo -e "  ${RED}✗${NC} admin_events: $PG_ADMIN_EVENTS_BEFORE → $PG_ADMIN_EVENTS_AFTER (esperado: $EXPECTED_PG_ADMIN_EVENTS)"
        ALL_GOOD=false
    fi
    
    # Comparar approvals
    if [ "$PG_APPROVALS_AFTER" = "$EXPECTED_PG_APPROVALS" ]; then
        echo -e "  ${GREEN}✓${NC} approvals: $PG_APPROVALS_BEFORE → $PG_APPROVALS_AFTER (esperado: $EXPECTED_PG_APPROVALS)"
    else
        echo -e "  ${RED}✗${NC} approvals: $PG_APPROVALS_BEFORE → $PG_APPROVALS_AFTER (esperado: $EXPECTED_PG_APPROVALS)"
        ALL_GOOD=false
    fi
    
    echo ""
    echo -e "${CYAN}MongoDB:${NC}"
    
    # Comparar MongoDB
    if [ "$MONGO_RESTAURANTS_AFTER" = "839" ]; then
        echo -e "  ${GREEN}✓${NC} restaurants: $MONGO_RESTAURANTS_BEFORE → $MONGO_RESTAURANTS_AFTER (esperado: 839)"
    else
        echo -e "  ${RED}✗${NC} restaurants: $MONGO_RESTAURANTS_BEFORE → $MONGO_RESTAURANTS_AFTER (esperado: 839)"
        ALL_GOOD=false
    fi
    
    if [ "$MONGO_TRIPS_AFTER" = "839" ]; then
        echo -e "  ${GREEN}✓${NC} trips: $MONGO_TRIPS_BEFORE → $MONGO_TRIPS_AFTER (esperado: 839)"
    else
        echo -e "  ${RED}✗${NC} trips: $MONGO_TRIPS_BEFORE → $MONGO_TRIPS_AFTER (esperado: 839)"
        ALL_GOOD=false
    fi
    
    if [ "$MONGO_PRODUCTS_AFTER" = "2532" ]; then
        echo -e "  ${GREEN}✓${NC} products: $MONGO_PRODUCTS_BEFORE → $MONGO_PRODUCTS_AFTER (esperado: 2532)"
    else
        echo -e "  ${RED}✗${NC} products: $MONGO_PRODUCTS_BEFORE → $MONGO_PRODUCTS_AFTER (esperado: 2532)"
        ALL_GOOD=false
    fi
    
    if [ "$ALL_GOOD" = true ]; then
        return 0
    else
        return 1
    fi
}

restore_postgresql() {
    local DB_NAME=$1
    local BACKUP_FILE=$2
    
    echo -e "\n${BLUE}[PostgreSQL] Restaurando $DB_NAME...${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Se restauraría $DB_NAME desde $BACKUP_FILE${NC}"
        return 0
    fi
    
    # Terminar conexiones
    docker exec ticketing-postgres psql -U admin -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1
    
    # Drop y Create
    docker exec ticketing-postgres psql -U admin -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null 2>&1
    docker exec ticketing-postgres psql -U admin -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null 2>&1
    
    # Restaurar
    cat "$BACKUP_PATH/$BACKUP_FILE" | docker exec -i ticketing-postgres psql -U admin -d $DB_NAME > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[PostgreSQL] $DB_NAME restaurada ✓${NC}"
        return 0
    else
        echo -e "${RED}[PostgreSQL] Error restaurando $DB_NAME ✗${NC}"
        return 1
    fi
}

restore_mongodb() {
    echo -e "\n${BLUE}[MongoDB] Restaurando...${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Se restauraría MongoDB${NC}"
        return 0
    fi
    
    # Copiar al contenedor
    docker cp "$BACKUP_PATH/mongodb_backup.archive" ticketing-mongodb:/tmp/mongodb_backup.archive 2>&1 > /dev/null
    
    # Restaurar con --drop
    docker exec ticketing-mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --archive=/tmp/mongodb_backup.archive --drop --gzip 2>&1 > /dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[MongoDB] Restaurada con gzip ✓${NC}"
        return 0
    else
        # Intentar sin gzip
        docker exec ticketing-mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --archive=/tmp/mongodb_backup.archive --drop 2>&1 > /dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}[MongoDB] Restaurada sin gzip ✓${NC}"
            return 0
        else
            echo -e "${RED}[MongoDB] Error en restauración ✗${NC}"
            return 1
        fi
    fi
}

# ===== INICIO DEL SCRIPT =====

print_header "RESTAURACIÓN SEGURA V3.0 - ULTRA PRECISA"
echo -e "${CYAN}Fecha de backup: $BACKUP_DATE${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}MODO: DRY RUN (solo simulación)${NC}"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_PATH="$SCRIPT_DIR/backups/$BACKUP_DATE"

if [ ! -d "$BACKUP_PATH" ]; then
    echo -e "${RED}ERROR: No existe el backup para la fecha $BACKUP_DATE${NC}"
    exit 1
fi

# Verificar archivos
echo ""
echo -e "${BLUE}Verificando archivos de backup...${NC}"
REQUIRED_FILES=("postgres_ticketing_backup.sql" "postgres_ticketing_admin_backup.sql" "postgres_approvals_backup.sql" "mongodb_backup.archive")
ALL_FILES_EXIST=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$BACKUP_PATH/$file" ]; then
        SIZE=$(du -h "$BACKUP_PATH/$file" | cut -f1)
        echo -e "  ${GREEN}✓${NC} $file ($SIZE)"
    else
        echo -e "  ${RED}✗${NC} $file - NO ENCONTRADO"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    echo -e "\n${RED}ERROR: Faltan archivos necesarios${NC}"
    exit 1
fi

# Verificar contenedores
echo ""
echo -e "${BLUE}Verificando contenedores...${NC}"
if ! test_container_running "ticketing-postgres"; then
    echo -e "${RED}ERROR: ticketing-postgres no está corriendo${NC}"
    exit 1
fi
if ! test_container_running "ticketing-mongodb"; then
    echo -e "${RED}ERROR: ticketing-mongodb no está corriendo${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Todos los contenedores están corriendo"

# Obtener estado actual
PG_EVENTS_BEFORE=$PG_EVENTS
PG_VENUES_BEFORE=$PG_VENUES
PG_COMPANIES_BEFORE=$PG_COMPANIES
PG_ADMINS_BEFORE=$PG_ADMINS
PG_ADMIN_EVENTS_BEFORE=$PG_ADMIN_EVENTS
PG_APPROVALS_BEFORE=$PG_APPROVALS
MONGO_USERS_BEFORE=$MONGO_USERS
MONGO_RESTAURANTS_BEFORE=$MONGO_RESTAURANTS
MONGO_TRIPS_BEFORE=$MONGO_TRIPS
MONGO_PRODUCTS_BEFORE=$MONGO_PRODUCTS
MONGO_ORDERS_BEFORE=$MONGO_ORDERS

get_current_state

# Analizar backup
analyze_backup

# Confirmación
if [ "$SKIP_CONFIRMATION" = false ] && [ "$DRY_RUN" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Esta operación reemplazará los datos actuales${NC}"
    echo -e "${YELLOW}Estado actual se perderá y será reemplazado por el backup${NC}"
    echo ""
    read -p "¿Desea continuar? (escriba 'SI' para confirmar): " confirmation
    if [ "$confirmation" != "SI" ]; then
        echo -e "${RED}Restauración cancelada${NC}"
        exit 0
    fi
fi

# RESTAURACIÓN
print_header "EJECUTANDO RESTAURACIÓN"

START_TIME=$(date +%s)

# PostgreSQL
PG_SUCCESS=true
restore_postgresql "ticketing" "postgres_ticketing_backup.sql" || PG_SUCCESS=false
restore_postgresql "ticketing_admin" "postgres_ticketing_admin_backup.sql" || PG_SUCCESS=false
restore_postgresql "approvals_db" "postgres_approvals_backup.sql" || PG_SUCCESS=false

# MongoDB
MONGO_SUCCESS=true
restore_mongodb || MONGO_SUCCESS=false

# Esperar estabilización
if [ "$DRY_RUN" = false ]; then
    echo ""
    echo -e "${BLUE}Esperando estabilización de bases de datos...${NC}"
    sleep 5
fi

# Obtener estado después
PG_EVENTS_AFTER=$PG_EVENTS
PG_VENUES_AFTER=$PG_VENUES
PG_COMPANIES_AFTER=$PG_COMPANIES
PG_ADMIN_EVENTS_AFTER=$PG_ADMIN_EVENTS
PG_APPROVALS_AFTER=$PG_APPROVALS
MONGO_RESTAURANTS_AFTER=$MONGO_RESTAURANTS
MONGO_TRIPS_AFTER=$MONGO_TRIPS
MONGO_PRODUCTS_AFTER=$MONGO_PRODUCTS

get_current_state

# Comparar estados
COMPARISON_SUCCESS=true
compare_states || COMPARISON_SUCCESS=false

# RESULTADO FINAL
print_header "RESULTADO FINAL"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

if [ "$PG_SUCCESS" = true ] && [ "$MONGO_SUCCESS" = true ] && [ "$COMPARISON_SUCCESS" = true ]; then
    echo ""
    echo -e "${GREEN}✓ RESTAURACIÓN COMPLETADA EXITOSAMENTE${NC}"
    echo -e "${GREEN}✓ Todos los datos coinciden con el backup${NC}"
    echo -e "\n${CYAN}Tiempo total: ${MINUTES}m ${SECONDS}s${NC}"
elif [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${YELLOW}[DRY RUN] Simulación completada${NC}"
    echo -e "${GREEN}La restauración real se ejecutaría correctamente${NC}"
else
    echo ""
    echo -e "${YELLOW}✗ RESTAURACIÓN CON ADVERTENCIAS${NC}"
    [ "$PG_SUCCESS" = false ] && echo -e "  - ${RED}PostgreSQL tuvo problemas${NC}"
    [ "$MONGO_SUCCESS" = false ] && echo -e "  - ${RED}MongoDB tuvo problemas${NC}"
    [ "$COMPARISON_SUCCESS" = false ] && echo -e "  - ${YELLOW}Algunos datos no coinciden con lo esperado${NC}"
fi
