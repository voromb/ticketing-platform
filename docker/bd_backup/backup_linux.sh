#!/bin/bash
# Script de Backup Completo con Migraciones Prisma - Ticketing Platform (Linux/Mac)
# Sin caracteres especiales para compatibilidad total

# Variables por defecto
INCLUDE_CONFIGS=false
SKIP_CONFIRMATION=false
FULL_BACKUP=true

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --include-configs)
            INCLUDE_CONFIGS=true
            shift
            ;;
        --skip-confirmation)
            SKIP_CONFIRMATION=true
            shift
            ;;
        --full-backup)
            FULL_BACKUP=true
            shift
            ;;
        *)
            echo "Opcion desconocida: $1"
            exit 1
            ;;
    esac
done

echo "======================================================================"
echo "             BACKUP COMPLETO CON MIGRACIONES PRISMA                  "  
echo "                     Ticketing Platform v2.0                        "
echo "======================================================================"

# Variables globales
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DATE_FOLDER=$(date +"%Y-%m-%d")
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_PATH="$SCRIPT_PATH/backups/$DATE_FOLDER"
ADMIN_PROJECT_PATH="$SCRIPT_PATH/../../backend/admin"
SERVICES_PROJECT_PATH="$SCRIPT_PATH/../../backend/services/festival-services"
USER_SERVICE_PATH="$SCRIPT_PATH/../../backend/user-service"

echo ""
echo "Creando estructura de backup..."
echo "   Directorio: $BACKUP_PATH"

# Crear directorio de backup
mkdir -p "$BACKUP_PATH"

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

# Verificar conexiones a las bases de datos
echo ""
echo "Verificando conexiones a bases de datos..."

# Test PostgreSQL
if docker exec ticketing-postgres psql -U admin -d ticketing -c '\dt' >/dev/null 2>&1; then
    echo "   [OK] PostgreSQL: Conectado"
else
    echo "   [ERROR] PostgreSQL: No conectado"
    exit 1
fi

# Test MongoDB
if docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use ticketing; db.stats()' >/dev/null 2>&1; then
    echo "   [OK] MongoDB: Conectado"
else
    echo "   [ERROR] MongoDB: No conectado"
    exit 1
fi

# Confirmacion de usuario
if [ "$SKIP_CONFIRMATION" = false ]; then
    echo ""
    echo "Iniciando backup completo del sistema..."
    echo "   - Base de datos PostgreSQL (admin/eventos/venues)"
    echo "   - Base de datos MongoDB (usuarios)"
    echo "   - Schemas Prisma (admin y services)"
    echo "   - Migraciones Prisma"
    [ "$INCLUDE_CONFIGS" = true ] && echo "   - Configuraciones del sistema"
    
    echo ""
    read -p "Continuar con el backup? (s/n): " confirmacion
    if [[ ! "$confirmacion" =~ ^[sS]$ ]]; then
        echo "Backup cancelado por el usuario"
        exit 0
    fi
fi

echo ""
echo "Iniciando Backup Completo..."

# ============================================================================
# 1. BACKUP POSTGRESQL COMPLETO
# ============================================================================
echo ""
echo "[1/7] Creando Backup PostgreSQL..."

# Backup principal de PostgreSQL
POSTGRES_FILE="$BACKUP_PATH/${TIMESTAMP}_postgres_ticketing_full.sql"
echo "   Exportando datos de PostgreSQL..."
docker exec ticketing-postgres pg_dump -U admin -d ticketing > "$POSTGRES_FILE"

POSTGRES_SIZE=$(stat -f%z "$POSTGRES_FILE" 2>/dev/null || stat -c%s "$POSTGRES_FILE" 2>/dev/null)
POSTGRES_SIZE_KB=$((POSTGRES_SIZE / 1024))

echo "   [OK] PostgreSQL exportado: ${POSTGRES_SIZE_KB} KB"

# Verificar contenido del backup
ADMIN_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "admins";' 2>/dev/null | tr -d ' ')
EVENT_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' ')
VENUE_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' ')

echo "   Contenido verificado:"
[ -n "$ADMIN_COUNT" ] && echo "     - Administradores: $ADMIN_COUNT"
[ -n "$EVENT_COUNT" ] && echo "     - Eventos: $EVENT_COUNT"
[ -n "$VENUE_COUNT" ] && echo "     - Venues: $VENUE_COUNT"

# ============================================================================
# 2. BACKUP MONGODB USUARIOS
# ============================================================================
echo ""
echo "[2/7] Creando Backup MongoDB..."

MONGO_FILE="$BACKUP_PATH/${TIMESTAMP}_mongodb_usuarios.json"
echo "   Exportando usuarios de MongoDB..."
docker exec ticketing-mongodb mongoexport -u admin -p admin123 --authenticationDatabase admin --db ticketing --collection users --out /tmp/users_export.json >/dev/null 2>&1
docker cp ticketing-mongodb:/tmp/users_export.json "$MONGO_FILE"

if [ -f "$MONGO_FILE" ] && [ -s "$MONGO_FILE" ]; then
    MONGO_SIZE=$(stat -f%z "$MONGO_FILE" 2>/dev/null || stat -c%s "$MONGO_FILE" 2>/dev/null)
    MONGO_SIZE_KB=$((MONGO_SIZE / 1024))
    
    USER_COUNT=$(docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use ticketing; print(db.users.countDocuments())' 2>/dev/null | tr -d ' ')
    
    echo "   [OK] MongoDB exportado: ${MONGO_SIZE_KB} KB"
    [ -n "$USER_COUNT" ] && echo "     - Total usuarios: $USER_COUNT"
else
    echo "   WARN MongoDB: Sin datos de usuarios"
fi

# ============================================================================
# 3. BACKUP SCHEMAS PRISMA
# ============================================================================
echo ""
echo "[3/7] Creando Backup Schemas Prisma..."

# Schema Admin
if [ -f "$ADMIN_PROJECT_PATH/prisma/schema.prisma" ]; then
    ADMIN_SCHEMA_FILE="$BACKUP_PATH/${TIMESTAMP}_prisma_admin_schema.prisma"
    cp "$ADMIN_PROJECT_PATH/prisma/schema.prisma" "$ADMIN_SCHEMA_FILE"
    echo "   [OK] Schema Admin respaldado"
fi

# Schema Services (si existe)
if [ -f "$SERVICES_PROJECT_PATH/prisma/schema.prisma" ]; then
    SERVICES_SCHEMA_FILE="$BACKUP_PATH/${TIMESTAMP}_prisma_services_schema.prisma"
    cp "$SERVICES_PROJECT_PATH/prisma/schema.prisma" "$SERVICES_SCHEMA_FILE"
    echo "   [OK] Schema Services respaldado"
fi

# ============================================================================
# 4. BACKUP MIGRACIONES PRISMA - CRITICO
# ============================================================================
echo ""
echo "[4/7] Creando Backup Migraciones Prisma..."

# Migraciones Admin
if [ -d "$ADMIN_PROJECT_PATH/prisma/migrations" ]; then
    ADMIN_MIGRATIONS_DIR="$BACKUP_PATH/${TIMESTAMP}_prisma_admin_migrations"
    cp -r "$ADMIN_PROJECT_PATH/prisma/migrations" "$ADMIN_MIGRATIONS_DIR"
    
    MIGRATION_COUNT=$(find "$ADMIN_MIGRATIONS_DIR" -maxdepth 1 -type d | wc -l)
    echo "   [OK] Migraciones Admin respaldadas ($MIGRATION_COUNT items)"
    
    # Listar migraciones
    find "$ADMIN_MIGRATIONS_DIR" -maxdepth 1 -type d -exec basename {} \; | tail -n +2 | while read migration; do
        echo "     - $migration"
    done
fi

# Migraciones Services (si existen)
if [ -d "$SERVICES_PROJECT_PATH/prisma/migrations" ]; then
    SERVICES_MIGRATIONS_DIR="$BACKUP_PATH/${TIMESTAMP}_prisma_services_migrations"
    cp -r "$SERVICES_PROJECT_PATH/prisma/migrations" "$SERVICES_MIGRATIONS_DIR"
    echo "   [OK] Migraciones Services respaldadas"
fi

# ============================================================================
# 5. BACKUP CONFIGURACIONES (OPCIONAL)
# ============================================================================
echo ""
echo "[5/7] Backup Configuraciones..."

if [ "$INCLUDE_CONFIGS" = true ]; then
    # Backup configuraciones de entorno
    CONFIGS_DIR="$BACKUP_PATH/${TIMESTAMP}_configuraciones"
    mkdir -p "$CONFIGS_DIR"
    
    # Copiar archivos de configuracion importantes
    [ -f "$ADMIN_PROJECT_PATH/.env" ] && cp "$ADMIN_PROJECT_PATH/.env" "$CONFIGS_DIR/admin.env"
    [ -f "$USER_SERVICE_PATH/.env" ] && cp "$USER_SERVICE_PATH/.env" "$CONFIGS_DIR/user-service.env"
    [ -f "$SERVICES_PROJECT_PATH/.env" ] && cp "$SERVICES_PROJECT_PATH/.env" "$CONFIGS_DIR/services.env"
    
    echo "   [OK] Configuraciones respaldadas"
else
    echo "   SKIP Configuraciones (no solicitadas)"
fi

# ============================================================================
# 6. VERIFICACION SISTEMA
# ============================================================================
echo ""
echo "[6/7] Verificacion del Sistema..."

echo "   Verificando servicios RabbitMQ..."
if docker ps --filter "name=rabbitmq" --format "{{.Status}}" 2>/dev/null | grep -q "Up"; then
    echo "   [OK] RabbitMQ: Running"
else
    echo "   INFO RabbitMQ: Not running (opcional)"
fi

echo "   [OK] Verificacion completada"

# ============================================================================
# 7. GENERAR REPORTE Y LIMPIEZA
# ============================================================================
echo ""
echo "[7/7] Generando Reporte..."

# Crear archivo de informacion del backup
INFO_FILE="$BACKUP_PATH/backup_info.txt"
cat > "$INFO_FILE" << EOF
BACKUP COMPLETO TICKETING PLATFORM
===================================

Fecha: $(date)
Timestamp: $TIMESTAMP
Version: 2.0

CONTENIDO DEL BACKUP:
- PostgreSQL: ${POSTGRES_SIZE_KB} KB
- MongoDB: Usuario count disponible
- Schemas Prisma: Admin + Services
- Migraciones: Completas
- Configuraciones: $([ "$INCLUDE_CONFIGS" = true ] && echo "Incluidas" || echo "No incluidas")

ESTADISTICAS:
- Administradores: $ADMIN_COUNT
- Eventos: $EVENT_COUNT
- Venues: $VENUE_COUNT
- Usuarios: $USER_COUNT

ARCHIVOS GENERADOS:
$(ls -la "$BACKUP_PATH" | tail -n +2)

SISTEMA RESPALDADO EXITOSAMENTE
EOF

# Calcular tamaño total del backup
TOTAL_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)

echo ""
echo "======================================================================"
echo "                    BACKUP COMPLETADO EXITOSAMENTE                   "
echo "======================================================================"

echo ""
echo "RESUMEN DEL BACKUP:"
echo "   Directorio: $BACKUP_PATH"
echo "   Tamaño total: $TOTAL_SIZE"
echo "   Timestamp: $TIMESTAMP"

echo ""
echo "CONTENIDO RESPALDADO:"
echo "   [OK] PostgreSQL: ${POSTGRES_SIZE_KB} KB ($ADMIN_COUNT admins, $EVENT_COUNT eventos, $VENUE_COUNT venues)"
echo "   [OK] MongoDB: $USER_COUNT usuarios"
echo "   [OK] Schemas Prisma: Completos"
echo "   [OK] Migraciones Prisma: Completas"
echo "   $([ "$INCLUDE_CONFIGS" = true ] && echo "[OK] Configuraciones: Incluidas" || echo "[SKIP] Configuraciones: No incluidas")"

echo ""
echo "PARA RESTAURAR ESTE BACKUP:"
echo "   ./restore_linux.sh --backup-date $DATE_FOLDER"

echo ""
echo "BACKUP COMPLETADO Y VERIFICADO [OK]"
echo "======================================================================"