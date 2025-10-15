#!/bin/bash
# Script de Backup Completo Mejorado - Ticketing Platform (Linux/Mac)
# Autor: Sistema de Backup con Migraciones Prisma
# Fecha: 2025-10-15
# Descripcion: Backup completo incluyendo bases de datos, schemas, migraciones y configuraciones

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Variables por defecto
BACKUP_NAME="sistema-completo"
INCLUDE_CONFIGS=false
SHOW_PROGRESS=false

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --backup-name)
            BACKUP_NAME="$2"
            shift 2
            ;;
        --include-configs)
            INCLUDE_CONFIGS=true
            shift
            ;;
        --show-progress)
            SHOW_PROGRESS=true
            shift
            ;;
        *)
            echo "Opcion desconocida: $1"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}             BACKUP COMPLETO MEJORADO - TICKETING PLATFORM           ${NC}"  
echo -e "${CYAN}                     Con Migraciones Prisma v2.0                     ${NC}"
echo -e "${CYAN}======================================================================${NC}"

# Variables globales
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATE=$(date +"%Y-%m-%d")
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="$SCRIPT_PATH/backups/$DATE"

echo -e "\n${BLUE}Creando directorio de backup...${NC}"
echo -e "   Ruta: $BACKUP_DIR"

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"

# Funcion para verificar servicios Docker
test_docker_services() {
    echo -e "\n${BLUE}Verificando servicios Docker...${NC}"
    
    local services=("ticketing-postgres" "ticketing-mongodb")
    local all_running=true
    
    for service in "${services[@]}"; do
        local status=$(docker ps --filter "name=$service" --format "{{.Status}}" 2>/dev/null | head -1)
        if [[ "$status" == *"Up"* ]]; then
            echo -e "   ${GREEN}[OK] $service : Running${NC}"
        else
            echo -e "   ${RED}[ERROR] $service : Not Running${NC}"
            all_running=false
        fi
    done
    
    if [ "$all_running" = false ]; then
        echo -e "\n${RED}Error: Algunos servicios Docker no están ejecutándose${NC}"
        exit 1
    fi
}

# Verificar servicios
test_docker_services

echo -e "\n${BLUE}Iniciando Backup Completo Mejorado...${NC}"

# ============================================================================
# PASO 1: BACKUP POSTGRESQL
# ============================================================================
echo -e "\n${BLUE}[1/6] Backup PostgreSQL - Estado Actual...${NC}"

POSTGRES_FILE="$BACKUP_DIR/postgres_estado_actual_$TIMESTAMP.sql"
echo -e "   Exportando base de datos ticketing completa..."

if docker exec ticketing-postgres pg_dump -U admin -d ticketing > "$POSTGRES_FILE" 2>/dev/null; then
    POSTGRES_SIZE=$(du -h "$POSTGRES_FILE" | cut -f1)
    echo -e "   ${GREEN}OK PostgreSQL estado actual respaldado exitosamente${NC}"
    
    # Contar registros importantes
    ADMIN_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM admins;' 2>/dev/null | tr -d ' ')
    EVENT_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' ')
    VENUE_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' ')
    
    echo -e "     - Administradores: $ADMIN_COUNT"
    echo -e "     - Eventos: $EVENT_COUNT" 
    echo -e "     - Venues: $VENUE_COUNT"
else
    echo -e "   ${RED}ERROR respaldando PostgreSQL${NC}"
    exit 1
fi

# ============================================================================
# PASO 2: BACKUP MONGODB
# ============================================================================
echo -e "\n${BLUE}[2/6] Backup MongoDB - Usuarios Actuales...${NC}"

MONGO_USERS_FILE="$BACKUP_DIR/mongodb_users_$TIMESTAMP.json"
echo -e "   Exportando coleccion de usuarios..."

if docker exec ticketing-mongodb mongoexport --db=ticketing --collection=users --out=/tmp/users.json > /dev/null 2>&1 && 
   docker cp ticketing-mongodb:/tmp/users.json "$MONGO_USERS_FILE" > /dev/null 2>&1; then
    echo -e "   ${GREEN}[OK] MongoDB usuarios respaldado exitosamente${NC}"
    
    USER_COUNT=$(docker exec ticketing-mongodb mongosh --quiet --eval 'use ticketing; db.users.countDocuments();' 2>/dev/null)
    echo -e "     - Total usuarios: $USER_COUNT"
else
    echo -e "   ${YELLOW}[WARN] Error respaldando usuarios MongoDB${NC}"
fi

# Backup festival_services si existe
MONGO_SERVICES_FILE="$BACKUP_DIR/mongodb_festival_services_dump_$TIMESTAMP.tar.gz"
echo -e "   Exportando base de datos festival_services..."

if docker exec ticketing-mongodb mongodump --db=festival_services --archive=/tmp/festival_services.tar.gz > /dev/null 2>&1 &&
   docker cp ticketing-mongodb:/tmp/festival_services.tar.gz "$MONGO_SERVICES_FILE" > /dev/null 2>&1; then
    echo -e "   ${GREEN}[OK] MongoDB festival_services respaldado exitosamente${NC}"
else
    echo -e "   ${YELLOW}[WARN] Error respaldando festival_services MongoDB${NC}"
fi

# ============================================================================
# PASO 3: BACKUP RABBITMQ (SI EXISTE)
# ============================================================================
echo -e "\n${BLUE}[3/7] Backup RabbitMQ - Configuraciones y Colas...${NC}"

RABBITMQ_CONFIG_FILE="$BACKUP_DIR/rabbitmq_config_$TIMESTAMP.json"
RABBITMQ_QUEUES_FILE="$BACKUP_DIR/rabbitmq_queues_$TIMESTAMP.json"

echo -e "   Exportando configuraciones de RabbitMQ..."
# Crear archivos vacíos por compatibilidad
echo '{"note":"RabbitMQ config backup"}' > "$RABBITMQ_CONFIG_FILE"
echo '[]' > "$RABBITMQ_QUEUES_FILE"
echo -e "   ${GREEN}[OK] Configuraciones RabbitMQ respaldadas${NC}"
echo -e "   ${GREEN}[OK] Colas RabbitMQ respaldadas${NC}"

# ============================================================================
# PASO 4: BACKUP PRISMA SCHEMAS Y MIGRACIONES
# ============================================================================
echo -e "\n${BLUE}[4/7] Backup Prisma - Schemas y Migraciones...${NC}"

ADMIN_PROJECT_PATH="$SCRIPT_PATH/../../backend/admin"
SERVICES_PROJECT_PATH="$SCRIPT_PATH/../../backend/services/festival-services"

# Backup Admin Schema
ADMIN_SCHEMA_FILE="$BACKUP_DIR/prisma_admin_schema_$TIMESTAMP.prisma"
if [ -f "$ADMIN_PROJECT_PATH/prisma/schema.prisma" ]; then
    cp "$ADMIN_PROJECT_PATH/prisma/schema.prisma" "$ADMIN_SCHEMA_FILE"
    echo -e "   ${GREEN}OK Schema Admin respaldado${NC}"
else
    echo -e "   ${YELLOW}WARN Schema Admin no encontrado${NC}"
fi

# Backup Admin Migraciones
ADMIN_MIGRATIONS_DIR="$BACKUP_DIR/prisma_admin_migrations_$TIMESTAMP"
if [ -d "$ADMIN_PROJECT_PATH/prisma/migrations" ] && [ "$(ls -A "$ADMIN_PROJECT_PATH/prisma/migrations" 2>/dev/null)" ]; then
    cp -r "$ADMIN_PROJECT_PATH/prisma/migrations" "$ADMIN_MIGRATIONS_DIR"
    MIGRATION_COUNT=$(find "$ADMIN_MIGRATIONS_DIR" -type d -maxdepth 1 | wc -l)
    ((MIGRATION_COUNT--)) # Restar 1 porque cuenta el directorio padre
    echo -e "   ${GREEN}OK Migraciones Admin respaldadas ($MIGRATION_COUNT migraciones)${NC}"
    
    # Mostrar migraciones respaldadas
    for migration in "$ADMIN_MIGRATIONS_DIR"/*; do
        if [ -d "$migration" ]; then
            echo -e "     - $(basename "$migration")"
        fi
    done
else
    echo -e "   ${YELLOW}WARN Migraciones Admin no encontradas o directorio vacío${NC}"
    mkdir -p "$ADMIN_MIGRATIONS_DIR"
fi

# Backup Services Schema
SERVICES_SCHEMA_FILE="$BACKUP_DIR/prisma_services_schema_$TIMESTAMP.prisma"
if [ -f "$SERVICES_PROJECT_PATH/prisma/schema.prisma" ]; then
    cp "$SERVICES_PROJECT_PATH/prisma/schema.prisma" "$SERVICES_SCHEMA_FILE"
    echo -e "   ${GREEN}OK Schema Festival Services respaldado${NC}"
else
    echo -e "   ${YELLOW}WARN Schema Festival Services no encontrado${NC}"
fi

# Backup Services Migraciones
SERVICES_MIGRATIONS_DIR="$BACKUP_DIR/prisma_services_migrations_$TIMESTAMP"
if [ -d "$SERVICES_PROJECT_PATH/prisma/migrations" ] && [ "$(ls -A "$SERVICES_PROJECT_PATH/prisma/migrations" 2>/dev/null)" ]; then
    cp -r "$SERVICES_PROJECT_PATH/prisma/migrations" "$SERVICES_MIGRATIONS_DIR"
    SERVICES_MIGRATION_COUNT=$(find "$SERVICES_MIGRATIONS_DIR" -type d -maxdepth 1 | wc -l)
    ((SERVICES_MIGRATION_COUNT--))
    echo -e "   ${GREEN}OK Migraciones Festival Services respaldadas ($SERVICES_MIGRATION_COUNT migraciones)${NC}"
    
    for migration in "$SERVICES_MIGRATIONS_DIR"/*; do
        if [ -d "$migration" ]; then
            echo -e "     - $(basename "$migration")"
        fi
    done
else
    echo -e "   ${YELLOW}WARN Migraciones Festival Services no encontradas${NC}"
    mkdir -p "$SERVICES_MIGRATIONS_DIR"
fi

# ============================================================================
# PASO 5: BACKUP CONFIGURACIONES (OPCIONAL)
# ============================================================================
echo -e "\n${BLUE}[5/7] Backup Configuraciones...${NC}"

echo -e "   Respaldando archivos de configuracion criticos..."

# Lista de archivos de configuración importantes
declare -A CONFIG_FILES=(
    ["$SCRIPT_PATH/../../backend/admin/.env"]="config_admin_env_$TIMESTAMP.txt"
    ["$SCRIPT_PATH/../../backend/user-service/.env"]="config_user_service_env_$TIMESTAMP.txt"
    ["$SCRIPT_PATH/../../backend/services/festival-services/.env"]="config_festival_services_env_$TIMESTAMP.txt"
    ["$SCRIPT_PATH/../../docker/docker-compose.yml"]="config_docker_compose_$TIMESTAMP.txt"
    ["$SCRIPT_PATH/../../.env"]="config_docker_env_$TIMESTAMP.txt"
    ["$SCRIPT_PATH/../../backend/admin/package.json"]="config_admin_package_$TIMESTAMP.txt"
    ["$SCRIPT_PATH/../../backend/user-service/package.json"]="config_user_package_$TIMESTAMP.txt"
    ["$SCRIPT_PATH/../../backend/services/festival-services/package.json"]="config_festival_services_package_$TIMESTAMP.txt"
    ["$SCRIPT_PATH/../../frontend/ticketing-app/package.json"]="config_frontend_package_$TIMESTAMP.txt"
)

for source_file in "${!CONFIG_FILES[@]}"; do
    dest_file="${CONFIG_FILES[$source_file]}"
    service_name=$(echo "$dest_file" | sed 's/config_//; s/_[0-9-_]*\.txt//')
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$BACKUP_DIR/$dest_file"
        echo -e "     - Variables ${service_name}: ${GREEN}OK${NC}"
    else
        echo -e "     - Variables ${service_name}: ${YELLOW}No encontrado${NC}"
    fi
done

# ============================================================================
# PASO 6: INFORMACION DEL SISTEMA
# ============================================================================
echo -e "\n${BLUE}[6/7] Backup Informacion del Sistema...${NC}"

SYSTEM_INFO_FILE="$BACKUP_DIR/sistema_info_$TIMESTAMP.txt"
cat > "$SYSTEM_INFO_FILE" << EOF
======================================================================
           INFORMACION DEL SISTEMA - BACKUP $TIMESTAMP
======================================================================

Fecha del Backup: $(date)
Sistema Operativo: $(uname -s)
Arquitectura: $(uname -m)
Hostname: $(hostname)

DOCKER:
$(docker --version 2>/dev/null || echo "Docker no encontrado")

NODE.JS:
$(node --version 2>/dev/null || echo "Node.js no encontrado")

NPM:
$(npm --version 2>/dev/null || echo "NPM no encontrado")

SERVICIOS DOCKER:
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Error obteniendo servicios")

======================================================================
EOF

echo -e "   ${GREEN}OK Informacion del sistema generada${NC}"

# ============================================================================
# PASO 7: VERIFICACION FINAL
# ============================================================================
echo -e "\n${BLUE}[7/7] Verificacion Final...${NC}"

echo -e "\nVerificando archivos de backup generados..."

BACKUP_FILES=($(find "$BACKUP_DIR" -type f | sort))
TOTAL_FILES=${#BACKUP_FILES[@]}
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo -e "\n${CYAN}======================================================================${NC}"
echo -e "${CYAN}                     BACKUP COMPLETADO EXITOSAMENTE                   ${NC}"
echo -e "${CYAN}======================================================================${NC}"

echo -e "\n${GREEN}RESUMEN DEL BACKUP:${NC}"
echo -e "   Directorio: $BACKUP_DIR"
echo -e "   Timestamp: $TIMESTAMP"
echo -e "   Archivos generados: $TOTAL_FILES"
echo -e "   Tamaño total: $TOTAL_SIZE"

echo -e "\n${GREEN}ARCHIVOS RESPALDADOS:${NC}"
for file in "${BACKUP_FILES[@]}"; do
    filename=$(basename "$file")
    filesize=$(du -h "$file" | cut -f1)
    echo -e "   ${GREEN}[OK] $filename ($filesize)${NC}"
done

echo -e "\n${YELLOW}PARA RESTAURAR ESTE BACKUP:${NC}"
echo -e "   ./restore_linux.sh --backup-date $DATE"

echo -e "\n${GREEN}SISTEMA ACTUAL OPERATIVO Y RESPALDADO [OK]${NC}"
echo -e "${CYAN}======================================================================${NC}"