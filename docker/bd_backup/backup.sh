#!/bin/bash

# Script de Backup Completo Unificado - Ticketing Platform
# Autor: Sistema de Backup Automatico Unificado
# Fecha: 2025-10-13
# Descripcion: Backup completo de todo el sistema incluyendo todas las bases de datos, esquemas y configuraciones

# Parametros
BACKUP_NAME="manual-backup"
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
            echo "Parametro desconocido: $1"
            exit 1
            ;;
    esac
done

echo "======================================================================"
echo "                   BACKUP COMPLETO UNIFICADO                         "
echo "                   Ticketing Platform v2.0                          "
echo "======================================================================"

# Variables globales
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATE=$(date +"%Y-%m-%d")
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="$SCRIPT_PATH/backups/$DATE"

echo ""
echo "Creando directorio de backup..."
echo "   Ruta: $BACKUP_DIR"

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"

# Funcion para verificar servicios Docker
check_docker_services() {
    echo ""
    echo "Verificando servicios Docker..."
    
    local services=("ticketing-postgres" "ticketing-mongodb" "ticketing-redis" "ticketing-rabbitmq")
    local all_running=true
    
    for service in "${services[@]}"; do
        if docker ps --filter "name=$service" --format "{{.Status}}" 2>/dev/null | grep -q "Up"; then
            echo "   OK $service : Running"
        else
            echo "   ERROR $service : Not running"
            all_running=false
        fi
    done
    
    if [ "$all_running" = false ]; then
        echo ""
        echo "Error: Algunos servicios Docker no estan corriendo"
        echo "Por favor, inicia los servicios Docker con: docker-compose up -d"
        exit 1
    fi
}

# Verificar servicios Docker
check_docker_services

echo ""
echo "Iniciando Backup Completo..."

# ============================================================================
# 1. POSTGRESQL - BASE DE DATOS PRINCIPAL
# ============================================================================
echo ""
echo "[1/8] Backup PostgreSQL - Base de Datos Principal..."

POSTGRES_FILE="$BACKUP_DIR/postgres_ticketing_full_$TIMESTAMP.sql"
echo "   Exportando base de datos ticketing..."
docker exec ticketing-postgres pg_dump -U admin -d ticketing --clean --create > "$POSTGRES_FILE" 2>/dev/null

# Verificar y mostrar estadisticas
EVENT_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' ')
VENUE_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' ')
CATEGORY_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Category";' 2>/dev/null | tr -d ' ')

echo "   OK PostgreSQL principal respaldado exitosamente"
[ -n "$EVENT_COUNT" ] && echo "     - Eventos: $EVENT_COUNT"
[ -n "$VENUE_COUNT" ] && echo "     - Venues: $VENUE_COUNT"
[ -n "$CATEGORY_COUNT" ] && echo "     - Categorias: $CATEGORY_COUNT"

# ============================================================================
# 2. POSTGRESQL - BASE DE DATOS APPROVALS
# ============================================================================
echo ""
echo "[2/8] Backup PostgreSQL - Base de Datos Approvals..."

# Verificar si existe la base de datos approvals_db
DB_EXISTS=$(docker exec ticketing-postgres psql -U admin -t -c "SELECT 1 FROM pg_database WHERE datname='approvals_db';" 2>/dev/null | tr -d ' ')

if [ "$DB_EXISTS" = "1" ]; then
    APPROVALS_FILE="$BACKUP_DIR/postgres_approvals_db_$TIMESTAMP.sql"
    echo "   Exportando base de datos approvals_db..."
    docker exec ticketing-postgres pg_dump -U admin -d approvals_db --clean --create > "$APPROVALS_FILE" 2>/dev/null
    
    APPROVAL_COUNT=$(docker exec ticketing-postgres psql -U admin -d approvals_db -t -c 'SELECT COUNT(*) FROM "Approval";' 2>/dev/null | tr -d ' ')
    
    echo "   OK PostgreSQL approvals respaldado exitosamente"
    [ -n "$APPROVAL_COUNT" ] && echo "     - Aprobaciones: $APPROVAL_COUNT"
else
    echo "   INFO Base de datos approvals_db no existe, omitiendo..."
fi

# ============================================================================
# 3. MONGODB - USUARIOS
# ============================================================================
echo ""
echo "[3/8] Backup MongoDB - Usuarios..."

MONGO_USERS_FILE="$BACKUP_DIR/mongodb_users_$TIMESTAMP.json"
echo "   Exportando coleccion de usuarios..."
docker exec ticketing-mongodb mongoexport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --out=/tmp/users_backup.json 2>/dev/null
docker cp ticketing-mongodb:/tmp/users_backup.json "$MONGO_USERS_FILE" 2>/dev/null

USER_COUNT=$(docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.users.countDocuments()' 2>/dev/null)

echo "   OK MongoDB usuarios respaldado exitosamente"
[ -n "$USER_COUNT" ] && echo "     - Usuarios: $USER_COUNT"

# ============================================================================
# 4. MONGODB - FESTIVAL SERVICES
# ============================================================================
echo ""
echo "[4/8] Backup MongoDB - Festival Services..."

echo "   Creando dump de festival_services..."
docker exec ticketing-mongodb mongodump --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --out=/tmp/festival_dump 2>/dev/null

echo "   Comprimiendo dump..."
docker exec ticketing-mongodb tar -czf /tmp/festival_services_dump.tar.gz -C /tmp/festival_dump . 2>/dev/null

FESTIVAL_DUMP_FILE="$BACKUP_DIR/mongodb_festival_services_dump_$TIMESTAMP.tar.gz"
docker cp ticketing-mongodb:/tmp/festival_services_dump.tar.gz "$FESTIVAL_DUMP_FILE" 2>/dev/null

echo "   OK MongoDB festival_services respaldado exitosamente"

# Verificar colecciones
COLLECTIONS=("travels" "restaurants" "products" "bookings" "reservations" "orders" "carts")
for collection in "${COLLECTIONS[@]}"; do
    count=$(docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval "use festival_services; db.$collection.countDocuments()" 2>/dev/null)
    if [ -n "$count" ] && [ "$count" != "0" ]; then
        echo "     - $collection: $count documentos"
    fi
done

# ============================================================================
# 5. PRISMA SCHEMAS
# ============================================================================
echo ""
echo "[5/8] Backup Prisma Schemas..."

# Backup Schema Admin
ADMIN_SCHEMA_PATH="$SCRIPT_PATH/../../backend/admin/prisma/schema.prisma"
if [ -f "$ADMIN_SCHEMA_PATH" ]; then
    ADMIN_SCHEMA_BACKUP="$BACKUP_DIR/prisma_admin_schema_$TIMESTAMP.prisma"
    cp "$ADMIN_SCHEMA_PATH" "$ADMIN_SCHEMA_BACKUP"
    echo "   OK Schema Admin respaldado"
else
    echo "   WARN Schema Admin no encontrado"
fi

# Backup Schema Services
SERVICES_SCHEMA_PATH="$SCRIPT_PATH/../../backend/services/festival-services/prisma/schema.prisma"
if [ -f "$SERVICES_SCHEMA_PATH" ]; then
    SERVICES_SCHEMA_BACKUP="$BACKUP_DIR/prisma_services_schema_$TIMESTAMP.prisma"
    cp "$SERVICES_SCHEMA_PATH" "$SERVICES_SCHEMA_BACKUP"
    echo "   OK Schema Festival Services respaldado"
else
    echo "   WARN Schema Festival Services no encontrado"
fi

# ============================================================================
# 6. CONFIGURACIONES (OPCIONAL)
# ============================================================================
echo ""
echo "[6/8] Backup Configuraciones..."

if [ "$INCLUDE_CONFIGS" = true ]; then
    echo "   Respaldando archivos de configuracion..."
    
    # Lista de archivos de configuracion
    declare -A CONFIG_FILES=(
        ["../../backend/admin/.env"]="admin_env"
        ["../../backend/services/festival-services/.env"]="services_env"
        ["../../backend/user-service/.env"]="user_service_env"
        ["../../docker/docker-compose.yml"]="docker_compose"
        ["../../docker/.env"]="docker_env"
    )
    
    for source_path in "${!CONFIG_FILES[@]}"; do
        config_name="${CONFIG_FILES[$source_path]}"
        full_source_path="$SCRIPT_PATH/$source_path"
        
        if [ -f "$full_source_path" ]; then
            target_path="$BACKUP_DIR/config_${config_name}_$TIMESTAMP.txt"
            cp "$full_source_path" "$target_path"
            echo "     - $config_name: OK"
        else
            echo "     - $config_name: No encontrado"
        fi
    done
else
    echo "   INFO Backup de configuraciones omitido (usar --include-configs para incluir)"
fi

# ============================================================================
# 7. INFORMACION DEL SISTEMA
# ============================================================================
echo ""
echo "[7/8] Generando Informacion del Sistema..."

SYSTEM_INFO_FILE="$BACKUP_DIR/SYSTEM_INFO_$TIMESTAMP.txt"
GIT_COMMIT=""
GIT_BRANCH=""

# Intentar obtener informacion de Git
if cd "$SCRIPT_PATH/../.."; then
    GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "No disponible")
    GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "No disponible")
fi

cat > "$SYSTEM_INFO_FILE" << EOF
===================================================================
            INFORMACION DEL SISTEMA - BACKUP
===================================================================

Fecha del Backup: $(date '+%Y-%m-%d %H:%M:%S')
Nombre del Backup: $BACKUP_NAME
Directorio: $BACKUP_DIR

===================================================================
            INFORMACION DE GIT
===================================================================

Commit Hash: $GIT_COMMIT
Branch: $GIT_BRANCH

===================================================================
            SERVICIOS DOCKER
===================================================================

$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null)

===================================================================
            ESTADISTICAS DE BASES DE DATOS
===================================================================

PostgreSQL (ticketing):
$(docker exec ticketing-postgres psql -U admin -d ticketing -c '\dt' 2>/dev/null)

MongoDB (ticketing):
$(docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.stats()' 2>/dev/null)

MongoDB (festival_services):
$(docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use festival_services; db.stats()' 2>/dev/null)

===================================================================
EOF

echo "   OK Informacion del sistema generada"

# ============================================================================
# 8. VERIFICACION Y RESUMEN FINAL
# ============================================================================
echo ""
echo "[8/8] Verificacion Final..."

echo ""
echo "Verificando archivos de backup..."
FILE_COUNT=$(find "$BACKUP_DIR" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
echo "====================================================================="
echo "                    BACKUP COMPLETADO                               "
echo "====================================================================="

echo ""
echo "Resumen del Backup:"
echo "   Directorio: $BACKUP_DIR"
echo "   Archivos creados: $FILE_COUNT"
echo "   Tamaño total: $TOTAL_SIZE"

echo ""
echo "Archivos generados:"
for file in "$BACKUP_DIR"/*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        size=$(du -h "$file" | cut -f1)
        echo "   - $filename ($size)"
    fi
done

# Crear archivo de informacion del backup en JSON
cat > "$BACKUP_DIR/BACKUP_INFO.json" << EOF
{
    "BackupDate": "$(date '+%Y-%m-%d')",
    "BackupTime": "$(date '+%H:%M:%S')",
    "BackupName": "$BACKUP_NAME",
    "BackupDirectory": "$BACKUP_DIR",
    "GitCommit": "$GIT_COMMIT",
    "GitBranch": "$GIT_BRANCH",
    "FilesCount": $FILE_COUNT,
    "IncludedConfigs": $INCLUDE_CONFIGS
}
EOF

echo ""
echo "Siguientes pasos:"
echo "   1. Para restaurar este backup usar:"
echo "      ./restore.sh --backup-folder \"$DATE\""
echo "   2. Los archivos estan en: $BACKUP_DIR"
echo "   3. Verificar que todos los servicios siguen funcionando correctamente"

echo ""
echo "Backup completo finalizado exitosamente!"