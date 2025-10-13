#!/bin/bash

# Script de Restauracion Completa Unificada - Ticketing Platform
# Autor: Sistema de Restauracion Automatico Unificado
# Fecha: 2025-10-13
# Descripcion: Restauracion completa de todo el sistema desde un backup unificado

# Parametros
BACKUP_FOLDER=""
SKIP_CONFIRMATION=false
RESTORE_CONFIGS=false
SHOW_PROGRESS=false

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --backup-folder)
            BACKUP_FOLDER="$2"
            shift 2
            ;;
        --skip-confirmation)
            SKIP_CONFIRMATION=true
            shift
            ;;
        --restore-configs)
            RESTORE_CONFIGS=true
            shift
            ;;
        --show-progress)
            SHOW_PROGRESS=true
            shift
            ;;
        *)
            echo "Parametro desconocido: $1"
            echo "Uso: $0 --backup-folder FOLDER [--skip-confirmation] [--restore-configs] [--show-progress]"
            exit 1
            ;;
    esac
done

# Verificar parametro obligatorio
if [ -z "$BACKUP_FOLDER" ]; then
    echo "Error: --backup-folder es obligatorio"
    echo "Uso: $0 --backup-folder FOLDER [--skip-confirmation] [--restore-configs] [--show-progress]"
    exit 1
fi

echo "======================================================================"
echo "                 RESTAURACION COMPLETA UNIFICADA                     "
echo "                 Ticketing Platform v2.0                            "
echo "======================================================================"

# Variables globales
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_PATH="$SCRIPT_PATH/backups/$BACKUP_FOLDER"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo ""
echo "Verificando backup..."
echo "   Ruta: $BACKUP_PATH"

# Verificar que existe el directorio de backup
if [ ! -d "$BACKUP_PATH" ]; then
    echo ""
    echo "Error: No se encuentra el directorio de backup"
    echo "Carpetas disponibles:"
    find "$SCRIPT_PATH/backups" -type d -name "*" | sed 's|.*/||' | grep -v "^backups$" | sort
    exit 1
fi

# Leer informacion del backup si existe
BACKUP_INFO_PATH="$BACKUP_PATH/BACKUP_INFO.json"
if [ -f "$BACKUP_INFO_PATH" ]; then
    echo ""
    echo "Informacion del Backup:"
    
    # Extraer informacion del JSON de forma simple
    BACKUP_DATE=$(grep '"BackupDate"' "$BACKUP_INFO_PATH" | cut -d'"' -f4)
    BACKUP_TIME=$(grep '"BackupTime"' "$BACKUP_INFO_PATH" | cut -d'"' -f4)
    BACKUP_NAME=$(grep '"BackupName"' "$BACKUP_INFO_PATH" | cut -d'"' -f4)
    GIT_COMMIT=$(grep '"GitCommit"' "$BACKUP_INFO_PATH" | cut -d'"' -f4)
    
    echo "   Fecha: $BACKUP_DATE"
    echo "   Hora: $BACKUP_TIME"
    echo "   Nombre: $BACKUP_NAME"
    echo "   Commit: $GIT_COMMIT"
fi

# Buscar archivos de backup
echo ""
echo "Analizando archivos de backup..."
FILE_COUNT=$(find "$BACKUP_PATH" -type f | wc -l)
echo "   Archivos encontrados: $FILE_COUNT"

# Identificar archivos principales
POSTGRES_MAIN=$(find "$BACKUP_PATH" -name "*postgres_ticketing_full*" -type f | head -1)
POSTGRES_APPROVALS=$(find "$BACKUP_PATH" -name "*postgres_approvals_db*" -type f | head -1)
MONGO_USERS=$(find "$BACKUP_PATH" -name "*mongodb_users*" -type f | head -1)
MONGO_FESTIVAL_DUMP=$(find "$BACKUP_PATH" -name "*festival_services_dump*" -type f | head -1)
PRISMA_ADMIN=$(find "$BACKUP_PATH" -name "*prisma_admin_schema*" -type f | head -1)
PRISMA_SERVICES=$(find "$BACKUP_PATH" -name "*prisma_services_schema*" -type f | head -1)

echo ""
echo "Archivos criticos:"
echo "   PostgreSQL Principal: $([ -n "$POSTGRES_MAIN" ] && echo "OK $(basename "$POSTGRES_MAIN")" || echo "ERROR No encontrado")"
echo "   PostgreSQL Approvals: $([ -n "$POSTGRES_APPROVALS" ] && echo "OK $(basename "$POSTGRES_APPROVALS")" || echo "WARN No encontrado")"
echo "   MongoDB Usuarios: $([ -n "$MONGO_USERS" ] && echo "OK $(basename "$MONGO_USERS")" || echo "WARN No encontrado")"
echo "   MongoDB Festival Services: $([ -n "$MONGO_FESTIVAL_DUMP" ] && echo "OK $(basename "$MONGO_FESTIVAL_DUMP")" || echo "WARN No encontrado")"
echo "   Prisma Admin Schema: $([ -n "$PRISMA_ADMIN" ] && echo "OK $(basename "$PRISMA_ADMIN")" || echo "WARN No encontrado")"
echo "   Prisma Services Schema: $([ -n "$PRISMA_SERVICES" ] && echo "OK $(basename "$PRISMA_SERVICES")" || echo "WARN No encontrado")"

# Verificar archivos criticos
if [ -z "$POSTGRES_MAIN" ]; then
    echo ""
    echo "Error: No se encontro el backup principal de PostgreSQL"
    exit 1
fi

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

# Confirmacion del usuario
if [ "$SKIP_CONFIRMATION" = false ]; then
    echo ""
    echo "ADVERTENCIA: Esta operacion SOBRESCRIBIRA completamente:"
    echo "   - Todas las bases de datos PostgreSQL"
    echo "   - Todas las bases de datos MongoDB"
    echo "   - Todos los esquemas Prisma"
    if [ "$RESTORE_CONFIGS" = true ]; then
        echo "   - Todos los archivos de configuracion"
    fi
    
    echo ""
    echo "Esta accion es IRREVERSIBLE"
    echo ""
    read -p "Escribe 'RESTAURAR' (en mayusculas) para continuar: " confirm
    if [ "$confirm" != "RESTAURAR" ]; then
        echo "Restauracion cancelada por el usuario"
        exit 0
    fi
fi

echo ""
echo "Iniciando Restauracion Completa..."

# ============================================================================
# 1. POSTGRESQL - BASE DE DATOS PRINCIPAL
# ============================================================================
echo ""
echo "[1/7] Restaurando PostgreSQL - Base de Datos Principal..."

echo "   Limpiando base de datos existente..."
docker exec ticketing-postgres psql -U admin -d ticketing -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' 2>/dev/null > /dev/null

echo "   Restaurando desde backup..."
cat "$POSTGRES_MAIN" | docker exec -i ticketing-postgres psql -U admin -d ticketing 2>/dev/null > /dev/null

# Verificar restauracion
EVENT_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' ')
VENUE_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' ')

echo "   OK PostgreSQL principal restaurado exitosamente"
[ -n "$EVENT_COUNT" ] && echo "     - Eventos: $EVENT_COUNT"
[ -n "$VENUE_COUNT" ] && echo "     - Venues: $VENUE_COUNT"

# ============================================================================
# 2. POSTGRESQL - BASE DE DATOS APPROVALS
# ============================================================================
echo ""
echo "[2/7] Restaurando PostgreSQL - Base de Datos Approvals..."

if [ -n "$POSTGRES_APPROVALS" ]; then
    echo "   Creando base de datos approvals_db..."
    docker exec ticketing-postgres psql -U admin -c "DROP DATABASE IF EXISTS approvals_db;" 2>/dev/null > /dev/null
    docker exec ticketing-postgres psql -U admin -c "CREATE DATABASE approvals_db;" 2>/dev/null > /dev/null
    
    echo "   Restaurando desde backup..."
    cat "$POSTGRES_APPROVALS" | docker exec -i ticketing-postgres psql -U admin -d approvals_db 2>/dev/null > /dev/null
    
    # Verificar restauracion
    APPROVAL_COUNT=$(docker exec ticketing-postgres psql -U admin -d approvals_db -t -c 'SELECT COUNT(*) FROM "Approval";' 2>/dev/null | tr -d ' ')
    
    echo "   OK PostgreSQL approvals restaurado exitosamente"
    [ -n "$APPROVAL_COUNT" ] && echo "     - Aprobaciones: $APPROVAL_COUNT"
else
    echo "   WARN Backup de approvals no encontrado, omitiendo..."
fi

# ============================================================================
# 3. MONGODB - USUARIOS
# ============================================================================
echo ""
echo "[3/7] Restaurando MongoDB - Usuarios..."

if [ -n "$MONGO_USERS" ]; then
    echo "   Limpiando coleccion de usuarios..."
    docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.users.deleteMany({})' 2>/dev/null > /dev/null
    
    echo "   Restaurando usuarios..."
    docker cp "$MONGO_USERS" ticketing-mongodb:/tmp/users_restore.json 2>/dev/null
    docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/users_restore.json 2>/dev/null > /dev/null
    
    # Verificar restauracion
    USER_COUNT=$(docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.users.countDocuments()' 2>/dev/null)
    
    echo "   OK MongoDB usuarios restaurado exitosamente"
    [ -n "$USER_COUNT" ] && echo "     - Usuarios: $USER_COUNT"
else
    echo "   WARN Backup de usuarios no encontrado, omitiendo..."
fi

# ============================================================================
# 4. MONGODB - FESTIVAL SERVICES
# ============================================================================
echo ""
echo "[4/7] Restaurando MongoDB - Festival Services..."

if [ -n "$MONGO_FESTIVAL_DUMP" ]; then
    echo "   Copiando dump al contenedor..."
    docker cp "$MONGO_FESTIVAL_DUMP" ticketing-mongodb:/tmp/ 2>/dev/null
    
    echo "   Extrayendo dump..."
    docker exec ticketing-mongodb tar -xzf "/tmp/$(basename "$MONGO_FESTIVAL_DUMP")" -C /tmp/ 2>/dev/null
    
    echo "   Restaurando base de datos festival_services..."
    docker exec ticketing-mongodb mongorestore --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services /tmp/festival_services/ --drop 2>/dev/null > /dev/null
    
    # Verificar restauracion
    COLLECTIONS=("travels" "restaurants" "products" "bookings" "reservations" "orders" "carts")
    echo "   OK MongoDB festival_services restaurado exitosamente"
    
    for collection in "${COLLECTIONS[@]}"; do
        count=$(docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval "use festival_services; db.$collection.countDocuments()" 2>/dev/null)
        if [ -n "$count" ] && [ "$count" != "0" ]; then
            echo "     - $collection : $count"
        fi
    done
else
    echo "   WARN Backup de festival_services no encontrado, omitiendo..."
fi

# ============================================================================
# 5. PRISMA SCHEMAS
# ============================================================================
echo ""
echo "[5/7] Restaurando Prisma Schemas..."

# Restaurar Schema Admin
if [ -n "$PRISMA_ADMIN" ]; then
    ADMIN_SCHEMA_PATH="$SCRIPT_PATH/../../backend/admin/prisma/schema.prisma"
    echo "   Restaurando schema Admin..."
    
    # Hacer backup del schema actual si existe
    if [ -f "$ADMIN_SCHEMA_PATH" ]; then
        BACKUP_SCHEMA_NAME="prisma_admin_schema_backup_$TIMESTAMP.prisma"
        BACKUP_SCHEMA_PATH="$BACKUP_PATH/$BACKUP_SCHEMA_NAME"
        cp "$ADMIN_SCHEMA_PATH" "$BACKUP_SCHEMA_PATH"
        echo "     Backup del schema actual guardado en: backups/$BACKUP_FOLDER/$BACKUP_SCHEMA_NAME"
    fi
    
    # Copiar nuevo schema
    cp "$PRISMA_ADMIN" "$ADMIN_SCHEMA_PATH"
    echo "   OK Schema Admin restaurado"
    
    # Generar cliente Prisma
    if cd "$SCRIPT_PATH/../../backend/admin"; then
        echo "   Generando cliente Prisma Admin..."
        npx prisma generate 2>/dev/null > /dev/null
        echo "   OK Cliente Prisma Admin generado"
    fi
else
    echo "   WARN Schema Admin no encontrado, omitiendo..."
fi

# Restaurar Schema Services
if [ -n "$PRISMA_SERVICES" ]; then
    SERVICES_SCHEMA_PATH="$SCRIPT_PATH/../../backend/services/festival-services/prisma/schema.prisma"
    echo "   Restaurando schema Festival Services..."
    
    # Hacer backup del schema actual si existe
    if [ -f "$SERVICES_SCHEMA_PATH" ]; then
        BACKUP_SCHEMA_NAME="prisma_services_schema_backup_$TIMESTAMP.prisma"
        BACKUP_SCHEMA_PATH="$BACKUP_PATH/$BACKUP_SCHEMA_NAME"
        cp "$SERVICES_SCHEMA_PATH" "$BACKUP_SCHEMA_PATH"
        echo "     Backup del schema actual guardado en: backups/$BACKUP_FOLDER/$BACKUP_SCHEMA_NAME"
    fi
    
    # Copiar nuevo schema
    cp "$PRISMA_SERVICES" "$SERVICES_SCHEMA_PATH"
    echo "   OK Schema Festival Services restaurado"
    
    # Generar cliente Prisma
    if cd "$SCRIPT_PATH/../../backend/services/festival-services"; then
        echo "   Generando cliente Prisma Services..."
        npx prisma generate 2>/dev/null > /dev/null
        echo "   OK Cliente Prisma Services generado"
    fi
else
    echo "   WARN Schema Services no encontrado, omitiendo..."
fi

# ============================================================================
# 6. CONFIGURACIONES (OPCIONAL)
# ============================================================================
echo ""
echo "[6/7] Restaurando Configuraciones..."

if [ "$RESTORE_CONFIGS" = true ]; then
    echo "   Restaurando archivos de configuracion..."
    
    # Buscar archivos de configuracion en el backup
    for config_file in "$BACKUP_PATH"/config_*; do
        if [ -f "$config_file" ]; then
            config_basename=$(basename "$config_file")
            config_name=$(echo "$config_basename" | sed 's/config_//' | sed 's/_[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]_[0-9][0-9]-[0-9][0-9]-[0-9][0-9]\.txt//')
            
            case "$config_name" in
                "admin_env")
                    target_path="$SCRIPT_PATH/../../backend/admin/.env"
                    ;;
                "services_env")
                    target_path="$SCRIPT_PATH/../../backend/services/festival-services/.env"
                    ;;
                "user_service_env")
                    target_path="$SCRIPT_PATH/../../backend/user-service/.env"
                    ;;
                "docker_compose")
                    target_path="$SCRIPT_PATH/../../docker/docker-compose.yml"
                    ;;
                "docker_env")
                    target_path="$SCRIPT_PATH/../../docker/.env"
                    ;;
                *)
                    target_path=""
                    ;;
            esac
            
            if [ -n "$target_path" ]; then
                # Hacer backup del archivo actual
                if [ -f "$target_path" ]; then
                    config_backup_name="config_backup_$(basename "$config_file" .txt)_$TIMESTAMP.txt"
                    config_backup_path="$BACKUP_PATH/$config_backup_name"
                    cp "$target_path" "$config_backup_path"
                    echo "       Backup guardado en: backups/$BACKUP_FOLDER/$config_backup_name"
                fi
                
                cp "$config_file" "$target_path"
                echo "     - $config_name : OK"
            fi
        fi
    done
else
    echo "   WARN Restauracion de configuraciones omitida (usar --restore-configs para incluir)"
fi

# ============================================================================
# 7. VERIFICACION FINAL
# ============================================================================
echo ""
echo "[7/7] Verificacion Final..."

echo ""
echo "Verificando restauracion..."

# Verificar PostgreSQL
if docker exec ticketing-postgres psql -U admin -d ticketing -t -c "\dt" 2>/dev/null > /dev/null; then
    echo "   OK PostgreSQL principal: Operativo"
else
    echo "   ERROR PostgreSQL principal: Error"
fi

# Verificar MongoDB
if docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --eval "db.runCommand('ping')" --quiet 2>/dev/null > /dev/null; then
    echo "   OK MongoDB: Operativo"
else
    echo "   ERROR MongoDB: Error"
fi

echo ""
echo "====================================================================="
echo "                   RESTAURACION COMPLETADA                          "
echo "====================================================================="

echo ""
echo "Resumen de la Restauracion:"
echo "   Backup utilizado: $BACKUP_FOLDER"
echo "   PostgreSQL: $([ -n "$POSTGRES_MAIN" ] && echo "Restaurado" || echo "Omitido")"
echo "   Approvals DB: $([ -n "$POSTGRES_APPROVALS" ] && echo "Restaurado" || echo "Omitido")"
echo "   MongoDB: $([ -n "$MONGO_USERS" ] || [ -n "$MONGO_FESTIVAL_DUMP" ] && echo "Restaurado" || echo "Omitido")"
echo "   Prisma Schemas: $([ -n "$PRISMA_ADMIN" ] || [ -n "$PRISMA_SERVICES" ] && echo "Restaurado" || echo "Omitido")"
echo "   Configuraciones: $([ "$RESTORE_CONFIGS" = true ] && echo "Restaurado" || echo "Omitido")"

echo ""
echo "Siguientes pasos:"
echo "   1. Reiniciar los servicios backend:"
echo "      cd backend/admin && npm run dev"
echo "      cd backend/services/festival-services && npm run dev"
echo "      cd backend/user-service && npm run dev"
echo "   2. Verificar que los endpoints funcionan:"
echo "      curl http://localhost:3003/api/events/public"
echo "      curl http://localhost:3004/api/travel"
echo "   3. Revisar logs de los servicios para confirmar funcionamiento"

echo ""
echo "Restauracion completa finalizada exitosamente!"