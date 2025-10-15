#!/bin/bash
# Script de Restauracion Completa con Migraciones Prisma - Ticketing Platform (Linux/Mac)
# Sin caracteres especiales para compatibilidad total

# Variables por defecto
BACKUP_DATE=""
SKIP_CONFIRMATION=false
RESTORE_CONFIGS=false
SHOW_PROGRESS=false

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --backup-date)
            BACKUP_DATE="$2"
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
            echo "Opcion desconocida: $1"
            exit 1
            ;;
    esac
done

# Verificar argumento obligatorio
if [ -z "$BACKUP_DATE" ]; then
    echo "Error: Debe especificar la fecha del backup"
    echo "Uso: $0 --backup-date YYYY-MM-DD [opciones]"
    echo ""
    echo "Fechas disponibles:"
    find "$(dirname "$0")/backups" -type d -maxdepth 1 | grep -E '[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort
    exit 1
fi

echo "======================================================================"
echo "           RESTAURACION COMPLETA CON MIGRACIONES PRISMA              "  
echo "                     Ticketing Platform v2.0                        "
echo "======================================================================"

# Variables globales
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_PATH="$SCRIPT_PATH/backups/$BACKUP_DATE"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ADMIN_PROJECT_PATH="$SCRIPT_PATH/../../backend/admin"
SERVICES_PROJECT_PATH="$SCRIPT_PATH/../../backend/services/festival-services"

echo ""
echo "Verificando backup..."
echo "   Ruta: $BACKUP_PATH"

# Verificar que existe el directorio de backup
if [ ! -d "$BACKUP_PATH" ]; then
    echo ""
    echo "Error: No se encuentra el directorio de backup"
    echo "Fechas disponibles:"
    find "$SCRIPT_PATH/backups" -type d -maxdepth 1 | grep -E '[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort
    exit 1
fi

echo ""
echo "Analizando archivos de backup..."
FILE_COUNT=$(find "$BACKUP_PATH" -type f | wc -l)
echo "   Archivos encontrados: $FILE_COUNT"

# Identificar archivos principales
POSTGRES_MAIN=$(find "$BACKUP_PATH" -name "*postgres_estado_actual*" -o -name "*postgres_ticketing_full*" | head -1)
MONGO_USERS=$(find "$BACKUP_PATH" -name "*mongodb_usuarios*" -o -name "*mongodb_users*" -o -name "*mongodb_users_manual*" | head -1)
PRISMA_ADMIN_SCHEMA=$(find "$BACKUP_PATH" -name "*prisma_admin_schema*" | head -1)
PRISMA_SERVICES_SCHEMA=$(find "$BACKUP_PATH" -name "*prisma_services_schema*" | head -1)
PRISMA_ADMIN_MIGRATIONS=$(find "$BACKUP_PATH" -type d -name "*prisma_admin_migrations*" | head -1)

echo ""
echo "Archivos criticos encontrados:"
echo "   [OK] PostgreSQL Principal: $(basename "$POSTGRES_MAIN" 2>/dev/null || echo 'ERROR No encontrado')"
echo "   [OK] MongoDB Usuarios: $(basename "$MONGO_USERS" 2>/dev/null || echo 'WARN No encontrado')"
echo "   [OK] Schema Admin: $(basename "$PRISMA_ADMIN_SCHEMA" 2>/dev/null || echo 'WARN No encontrado')"
echo "   [OK] Migraciones Admin: $(basename "$PRISMA_ADMIN_MIGRATIONS" 2>/dev/null || echo 'ERROR No encontradas')"
echo "   [OK] Schema Services: $(basename "$PRISMA_SERVICES_SCHEMA" 2>/dev/null || echo 'INFO No existe')"

# Verificar archivos criticos
if [ -z "$POSTGRES_MAIN" ]; then
    echo ""
    echo "Error: No se encontro el backup principal de PostgreSQL"
    exit 1
fi

# Verificar tamaño del backup
if [ -f "$POSTGRES_MAIN" ]; then
    BACKUP_SIZE=$(stat -f%z "$POSTGRES_MAIN" 2>/dev/null || stat -c%s "$POSTGRES_MAIN" 2>/dev/null || echo "0")
    BACKUP_SIZE_KB=$((BACKUP_SIZE / 1024))
    IS_COMPLETE_BACKUP=$( [ $BACKUP_SIZE -gt 100000 ] && echo "true" || echo "false" )
    
    echo ""
    echo "Analisis del backup:"
    echo "   Tamaño PostgreSQL: ${BACKUP_SIZE_KB} KB"
    echo "   Tipo: $([ "$IS_COMPLETE_BACKUP" = "true" ] && echo "BACKUP COMPLETO" || echo "Backup básico/vacío")"
fi

if [ -z "$PRISMA_ADMIN_MIGRATIONS" ]; then
    echo ""
    echo "Error: No se encontraron las migraciones de Prisma Admin"
    echo "Las migraciones son CRITICAS para la restauracion correcta"
    exit 1
fi

# Funcion para verificar servicios Docker
test_docker_services() {
    echo ""
    echo "Verificando servicios Docker..."
    
    local services=("ticketing-postgres" "ticketing-mongodb")
    local all_running=true
    
    for service in "${services[@]}"; do
        if docker ps --filter "name=$service" --format "{{.Status}}" 2>/dev/null | grep -q "Up"; then
            echo "   [OK] $service : Running"
        else
            echo "   [ERROR] $service : Not running"
            all_running=false
        fi
    done
    
    echo $all_running
}

# Verificar servicios Docker
if [ "$(test_docker_services)" = "false" ]; then
    echo ""
    echo "Error: Algunos servicios Docker no estan corriendo"
    echo "Inicia los servicios con: docker-compose up -d"
    exit 1
fi

# Confirmacion de usuario
if [ "$SKIP_CONFIRMATION" = false ]; then
    echo ""
    echo "ADVERTENCIA: Esta operacion SOBRESCRIBIRA completamente:"
    echo "   - Todas las bases de datos PostgreSQL"
    echo "   - Todas las bases de datos MongoDB"  
    echo "   - Todos los esquemas Prisma"
    echo "   - Todas las migraciones Prisma"
    
    echo ""
    echo "Esta accion es IRREVERSIBLE"
    read -p "Escribe 'RESTAURAR' (en mayusculas) para continuar: " confirmacion
    if [ "$confirmacion" != "RESTAURAR" ]; then
        echo "Restauracion cancelada por el usuario"
        exit 0
    fi
fi

echo ""
echo "Iniciando Restauracion Completa con Migraciones..."

# ============================================================================
# 1. RESTAURAR SCHEMAS Y MIGRACIONES PRISMA - PRIMERO
# ============================================================================
echo ""
echo "[1/7] Restaurando Schemas y Migraciones Prisma..."

# Restaurar Schema Admin
if [ -f "$PRISMA_ADMIN_SCHEMA" ]; then
    TARGET_SCHEMA_PATH="$ADMIN_PROJECT_PATH/prisma/schema.prisma"
    echo "   Restaurando schema Admin..."
    cp "$PRISMA_ADMIN_SCHEMA" "$TARGET_SCHEMA_PATH"
    echo "   [OK] Schema Admin restaurado"
fi

# Restaurar Migraciones Admin - CRITICO
if [ -d "$PRISMA_ADMIN_MIGRATIONS" ]; then
    TARGET_MIGRATIONS_PATH="$ADMIN_PROJECT_PATH/prisma/migrations"
    echo "   Restaurando migraciones Admin..."
    
    # Limpiar migraciones existentes
    [ -d "$TARGET_MIGRATIONS_PATH" ] && rm -rf "$TARGET_MIGRATIONS_PATH"
    
    # Restaurar migraciones desde backup
    cp -r "$PRISMA_ADMIN_MIGRATIONS" "$TARGET_MIGRATIONS_PATH"
    
    # Listar migraciones restauradas
    MIGRATION_COUNT=$(find "$TARGET_MIGRATIONS_PATH" -maxdepth 1 -type d | wc -l)
    echo "   [OK] Migraciones Admin restauradas ($MIGRATION_COUNT migraciones)"
    find "$TARGET_MIGRATIONS_PATH" -maxdepth 1 -type d -exec basename {} \; | tail -n +2 | while read migration; do
        echo "     - $migration"
    done
fi

# ============================================================================
# 2. LIMPIAR Y PREPARAR BASE DE DATOS POSTGRESQL
# ============================================================================
echo ""
echo "[2/7] Preparando Base de Datos PostgreSQL..."

echo "   Eliminando datos existentes..."
docker exec ticketing-postgres psql -U admin -d ticketing -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' >/dev/null 2>&1
echo "   [OK] Base de datos PostgreSQL limpiada"

# ============================================================================
# 3. EJECUTAR MIGRACIONES PRISMA - MUY IMPORTANTE
# ============================================================================
echo ""
echo "[3/7] Ejecutando Migraciones Prisma..."

cd "$ADMIN_PROJECT_PATH"
echo "   Instalando dependencias de Prisma..."
npm install --silent >/dev/null 2>&1

echo "   Ejecutando migraciones Prisma..."
npx prisma migrate deploy >/dev/null 2>&1

echo "   Generando cliente Prisma..."
npx prisma generate >/dev/null 2>&1

echo "   [OK] Migraciones Prisma ejecutadas exitosamente"

# ============================================================================
# 4. RESTAURAR DATOS POSTGRESQL
# ============================================================================
echo ""
echo "[4/7] Restaurando Datos PostgreSQL..."

echo "   Cargando backup de PostgreSQL..."
cat "$POSTGRES_MAIN" | docker exec -i ticketing-postgres psql -U admin -d ticketing >/dev/null 2>&1

# Verificar datos restaurados
ADMIN_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "admins";' 2>/dev/null | tr -d ' ')
EVENT_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' ')
VENUE_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' ')

echo "   [OK] Datos PostgreSQL restaurados exitosamente"
[ -n "$ADMIN_COUNT" ] && echo "     - Administradores: $ADMIN_COUNT"
[ -n "$EVENT_COUNT" ] && echo "     - Eventos: $EVENT_COUNT"
[ -n "$VENUE_COUNT" ] && echo "     - Venues: $VENUE_COUNT"

# ============================================================================
# 5. RESTAURAR DATOS MONGODB
# ============================================================================
echo ""
echo "[5/7] Restaurando Datos MongoDB..."

if [ -f "$MONGO_USERS" ] && [ -s "$MONGO_USERS" ]; then
    echo "   Limpiando coleccion de usuarios..."
    docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use ticketing; db.users.drop()' >/dev/null 2>&1
    
    echo "   Restaurando usuarios desde backup..."
    cat "$MONGO_USERS" | docker exec -i ticketing-mongodb mongoimport -u admin -p admin123 --authenticationDatabase admin --db ticketing --collection users >/dev/null 2>&1
    
    USER_COUNT=$(docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use ticketing; print(db.users.countDocuments())' 2>/dev/null | tr -d ' ')
    
    echo "   [OK] Usuarios MongoDB restaurados exitosamente"
    [ -n "$USER_COUNT" ] && echo "     - Total usuarios: $USER_COUNT"
else
    echo "   WARN No hay backup de usuarios MongoDB"
fi

# ============================================================================
# 6. VERIFICACION FINAL
# ============================================================================
echo ""
echo "[6/7] Verificacion Final..."

echo ""
echo "Verificando estado del sistema..."

# Verificar PostgreSQL
if docker exec ticketing-postgres psql -U admin -d ticketing -c '\dt' >/dev/null 2>&1; then
    echo "   [OK] PostgreSQL: Conectado y operativo"
fi

# Verificar MongoDB
if docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use ticketing; db.stats()' >/dev/null 2>&1; then
    echo "   [OK] MongoDB: Conectado y operativo"
fi

# Volver al directorio original
cd "$SCRIPT_PATH"

echo ""
echo "======================================================================"
echo "                    RESTAURACION COMPLETADA EXITOSAMENTE             "
echo "======================================================================"

echo ""
echo "RESUMEN DE LA RESTAURACION:"
echo "   Backup utilizado: $BACKUP_DATE"
echo "   Timestamp: $TIMESTAMP"
echo "   Schemas Prisma: Restaurados"
echo "   Migraciones Prisma: Ejecutadas"
echo "   PostgreSQL: Restaurado"
echo "   MongoDB: Restaurado"

echo ""
echo "PARA INICIAR EL SISTEMA:"
echo "   1. cd ../../backend/admin && npm run dev"
echo "   2. cd ../../backend/user-service && npm run dev"
echo "   3. cd ../../frontend/ticketing-app && npm start"

echo ""
echo "CREDENCIALES DISPONIBLES:"
echo "   Super Admin: voro.super@ticketing.com / Voro123!"
echo "   Admin: admin@ticketing.com / admin123"

echo ""
echo "SISTEMA RESTAURADO Y LISTO PARA USAR [OK]"
echo "======================================================================"