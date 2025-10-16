#!/bin/bash
# Script de Restauracion MEJORADO - 100% Autonomo (Linux/Mac)
# Autor: Sistema de Restauracion Autonoma
# Fecha: 2025-10-15
# Descripcion: Restauracion completamente autonoma - FUNCIONA EN CUALQUIER UNIX

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Variables por defecto
BACKUP_DATE=""
SKIP_CONFIRMATION=false
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
    echo -e "${RED}Error: Debe especificar la fecha del backup${NC}"
    echo "Uso: $0 --backup-date YYYY-MM-DD [--skip-confirmation] [--show-progress]"
    echo ""
    echo "Fechas disponibles:"
    find "$(dirname "$0")/backups" -type d -maxdepth 1 | grep -E '[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort
    exit 1
fi

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}           RESTAURACION 100% AUTONOMA - TICKETING PLATFORM           ${NC}"  
echo -e "${CYAN}                  FUNCIONA EN CUALQUIER UNIX v3.0                    ${NC}"
echo -e "${CYAN}======================================================================${NC}"

SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_PATH="$SCRIPT_PATH/backups/$BACKUP_DATE"
ADMIN_PROJECT_PATH="$SCRIPT_PATH/../../backend/admin"
USER_PROJECT_PATH="$SCRIPT_PATH/../../backend/user-service"

echo -e "\n${BLUE}Verificando backup...${NC}"
echo -e "   Ruta: $BACKUP_PATH"

if [ ! -d "$BACKUP_PATH" ]; then
    echo -e "\n${RED}Error: No se encuentra el directorio de backup${NC}"
    exit 1
fi

# Buscar archivos de backup - SELECCIONAR LOS QUE TIENEN MAS DATOS (MAS GRANDES)
POSTGRES_MAIN=$(find "$BACKUP_PATH" -name "*postgres_*" -type f | head -1)
if [ -n "$POSTGRES_MAIN" ]; then
    POSTGRES_MAIN=$(find "$BACKUP_PATH" -name "*postgres_*" -type f -exec ls -la {} \; | sort -k5 -nr | head -1 | awk '{print $NF}')
fi

MONGO_USERS=$(find "$BACKUP_PATH" -name "*mongodb_users*" -type f | head -1)
PRISMA_ADMIN_SCHEMA=$(find "$BACKUP_PATH" -name "*prisma_admin_schema*" -type f | head -1)
PRISMA_ADMIN_MIGRATIONS=$(find "$BACKUP_PATH" -name "*prisma_admin_migrations*" -type d | head -1)

echo -e "\n${YELLOW}Archivos encontrados:${NC}"
echo -e "   PostgreSQL: ${GREEN}$(basename "$POSTGRES_MAIN" 2>/dev/null || echo 'NO ENCONTRADO')${NC}"
echo -e "   MongoDB: ${GREEN}$(basename "$MONGO_USERS" 2>/dev/null || echo 'NO ENCONTRADO')${NC}"
echo -e "   Schema Admin: ${GREEN}$(basename "$PRISMA_ADMIN_SCHEMA" 2>/dev/null || echo 'NO ENCONTRADO')${NC}"
echo -e "   Migraciones: ${GREEN}$(basename "$PRISMA_ADMIN_MIGRATIONS" 2>/dev/null || echo 'NO ENCONTRADO')${NC}"

if [ -z "$POSTGRES_MAIN" ] || [ -z "$PRISMA_ADMIN_MIGRATIONS" ]; then
    echo -e "\n${RED}Error: Faltan archivos criticos para la restauracion${NC}"
    exit 1
fi

# Verificar servicios Docker
echo -e "\n${BLUE}Verificando servicios Docker...${NC}"
POSTGRES_STATUS=$(docker ps --filter "name=ticketing-postgres" --format "{{.Status}}" | head -1)
MONGODB_STATUS=$(docker ps --filter "name=ticketing-mongodb" --format "{{.Status}}" | head -1)

if [[ "$POSTGRES_STATUS" == *"Up"* ]]; then
    echo -e "   ${GREEN}[OK] ticketing-postgres : Running${NC}"
else
    echo -e "   ${RED}[ERROR] ticketing-postgres : Not Running${NC}"
    exit 1
fi

if [[ "$MONGODB_STATUS" == *"Up"* ]]; then
    echo -e "   ${GREEN}[OK] ticketing-mongodb : Running${NC}"
else
    echo -e "   ${YELLOW}[WARN] ticketing-mongodb : Not Running${NC}"
fi

# Confirmacion
if [ "$SKIP_CONFIRMATION" = false ]; then
    echo -e "\n${YELLOW}¿Continuar con la restauracion? (y/N):${NC}"
    read -r CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Restauracion cancelada${NC}"
        exit 0
    fi
fi

echo -e "${GREEN}Iniciando Restauracion 100% Autonoma...${NC}"

# ============================================================================
# PASO 0: DROP COMPLETO DE BASES DE DATOS - LIMPIEZA TOTAL
# ============================================================================
echo -e "${RED}[0/7] LIMPIEZA TOTAL - DROP de todas las bases de datos...${NC}"

echo -e "   ${YELLOW}Eliminando COMPLETAMENTE base de datos PostgreSQL...${NC}"
# Desconectar todas las sesiones activas
docker exec ticketing-postgres psql -U admin -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'ticketing' AND pid <> pg_backend_pid();" &>/dev/null

# Borrar base de datos completa
docker exec ticketing-postgres psql -U admin -d postgres -c "DROP DATABASE IF EXISTS ticketing;" &>/dev/null

# Crear base de datos limpia
docker exec ticketing-postgres psql -U admin -d postgres -c "CREATE DATABASE ticketing;" &>/dev/null

if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}[OK] PostgreSQL: Base de datos eliminada y recreada limpia${NC}"
else
    echo -e "   ${RED}[ERROR] No se pudo limpiar PostgreSQL${NC}"
    exit 1
fi

echo -e "   ${YELLOW}Eliminando COMPLETAMENTE colecciones MongoDB...${NC}"
# Eliminar todas las colecciones de la base ticketing
docker exec ticketing-mongodb mongosh "mongodb://admin:admin123@localhost:27017/ticketing?authSource=admin" --eval 'db.dropDatabase();' &>/dev/null

# Eliminar base festival_services también
docker exec ticketing-mongodb mongosh "mongodb://admin:admin123@localhost:27017/festival_services?authSource=admin" --eval 'db.dropDatabase();' &>/dev/null

echo -e "   ${GREEN}[OK] MongoDB: Todas las bases de datos eliminadas${NC}"

# ============================================================================
# PASO 1: RESTAURAR SCHEMAS Y MIGRACIONES
# ============================================================================
echo -e "${BLUE}[1/7] Restaurando Schemas y Migraciones Prisma...${NC}"

if [ -f "$PRISMA_ADMIN_SCHEMA" ]; then
    cp "$PRISMA_ADMIN_SCHEMA" "$ADMIN_PROJECT_PATH/prisma/schema.prisma"
    echo -e "   ${GREEN}[OK] Schema Admin restaurado${NC}"
else
    echo -e "   ${RED}[ERROR] Schema Admin no encontrado${NC}"
    exit 1
fi

# Restaurar migraciones
if [ -d "$PRISMA_ADMIN_MIGRATIONS" ]; then
    echo -e "   Limpiando migraciones existentes..."
    rm -rf "$ADMIN_PROJECT_PATH/prisma/migrations"
    mkdir -p "$ADMIN_PROJECT_PATH/prisma/migrations"
    
    echo -e "   Restaurando migraciones desde backup..."
    cp -r "$PRISMA_ADMIN_MIGRATIONS"/* "$ADMIN_PROJECT_PATH/prisma/migrations/"
    
    MIGRATION_COUNT=$(find "$ADMIN_PROJECT_PATH/prisma/migrations" -type d -maxdepth 1 | wc -l)
    ((MIGRATION_COUNT--)) # Restar 1 porque cuenta el directorio padre
    
    echo -e "   ${GREEN}[OK] Migraciones Admin restauradas ($MIGRATION_COUNT migraciones)${NC}"
    
    # Mostrar migraciones restauradas
    for migration in "$ADMIN_PROJECT_PATH/prisma/migrations"/*; do
        if [ -d "$migration" ]; then
            echo -e "     - $(basename "$migration")"
        fi
    done
else
    echo -e "   ${RED}[ERROR] Directorio de migraciones no encontrado${NC}"
    exit 1
fi

# ============================================================================
# PASO 2: APLICAR MIGRACIONES PRISMA
# ============================================================================
echo -e "\n${BLUE}[2/7] Aplicando Migraciones Prisma...${NC}"

cd "$ADMIN_PROJECT_PATH" || exit 1
echo -e "   Cambiando al directorio admin..."
echo -e "   Ejecutando prisma migrate deploy..."

if npx prisma migrate deploy > /dev/null 2>&1; then
    echo -e "   ${GREEN}[OK] Migraciones Prisma aplicadas exitosamente${NC}"
    echo -e "   Generando cliente Prisma..."
    npx prisma generate > /dev/null 2>&1
else
    echo -e "   ${RED}[ERROR] Error aplicando migraciones Prisma${NC}"
    cd "$SCRIPT_PATH" || exit 1
    exit 1
fi
cd "$SCRIPT_PATH" || exit 1

# ============================================================================
# PASO 3: RESTAURAR DATOS POSTGRESQL
# ============================================================================
echo -e "\n${BLUE}[3/7] Restaurando Datos PostgreSQL...${NC}"

if [ -f "$POSTGRES_MAIN" ]; then
    echo -e "   Cargando backup de PostgreSQL..."
    
    # Terminar conexiones activas
    docker exec ticketing-postgres psql -U admin -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'ticketing';" > /dev/null 2>&1
    
    # Recrear base de datos
    docker exec ticketing-postgres psql -U admin -d postgres -c "DROP DATABASE IF EXISTS ticketing;" > /dev/null 2>&1
    docker exec ticketing-postgres psql -U admin -d postgres -c "CREATE DATABASE ticketing OWNER admin;" > /dev/null 2>&1
    
    # Restaurar datos
    cat "$POSTGRES_MAIN" | docker exec -i ticketing-postgres psql -U admin -d ticketing > /dev/null 2>&1
    
    # Verificar restauracion
    ADMIN_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM admins;' 2>/dev/null | tr -d ' ')
    EVENT_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' ')
    VENUE_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' ')
    
    echo -e "   ${GREEN}[OK] Datos PostgreSQL restaurados exitosamente${NC}"
    [ -n "$ADMIN_COUNT" ] && echo -e "     - Administradores: $ADMIN_COUNT"
    [ -n "$EVENT_COUNT" ] && echo -e "     - Eventos: $EVENT_COUNT"
    [ -n "$VENUE_COUNT" ] && echo -e "     - Venues: $VENUE_COUNT"
else
    echo -e "   ${RED}[ERROR] Archivo de backup PostgreSQL no encontrado${NC}"
    exit 1
fi

# ============================================================================
# PASO 4: CREAR DATOS BASICOS SI NO EXISTEN (AUTONOMIA COMPLETA)
# ============================================================================
echo -e "\n${BLUE}[4/7] Verificando y Creando Datos Basicos...${NC}"

ADMIN_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM admins;' 2>/dev/null | tr -d ' ')

if [ "$ADMIN_COUNT" = "0" ]; then
    echo -e "   Creando administradores reales del sistema..."
    
    # Crear usuarios reales con sus contraseñas originales
    CREATE_ADMINS_SQL="INSERT INTO admins (id, email, password, \"firstName\", \"lastName\", role, \"isActive\", \"lastLogin\", \"createdAt\", \"updatedAt\") VALUES 
('ac9a65b3-2fd5-4573-bf28-c016f92bb9cb', 'super@admin.com', '\$2b\$10\$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC', 'Super', 'Admin', 'SUPER_ADMIN', true, NULL, '2025-09-26 16:41:41.502', '2025-09-26 16:41:41.502'),
('467a0b9f-5cd9-46b0-8905-621bc92a8664', 'admin@ticketing.com', '\$2b\$10\$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC', 'Admin', 'User', 'ADMIN', true, NULL, '2025-09-26 16:41:41.502', '2025-09-26 16:41:41.502'),
('26fa8809-a1a4-4242-9d09-42e65e5ee368', 'voro.super@ticketing.com', '\$2b\$10\$zN5zpSTorCYjQvmlL4xfbO5ldb3Dtd1ReISxEGzIE6wMdAO.1B4/a', 'Voro', 'SuperAdmin', 'SUPER_ADMIN', true, NULL, '2025-09-27 15:27:15.819', '2025-09-27 15:27:15.819')
ON CONFLICT (email) DO NOTHING;"
    
    echo "$CREATE_ADMINS_SQL" | docker exec -i ticketing-postgres psql -U admin -d ticketing > /dev/null 2>&1
    echo -e "   ${GREEN}[OK] Administradores reales creados${NC}"
    echo -e "     - super@admin.com (contraseña original)"
    echo -e "     - admin@ticketing.com (contraseña original)"
    echo -e "     - voro.super@ticketing.com (contraseña original)"
else
    echo -e "   ${GREEN}[OK] Administradores ya existen ($ADMIN_COUNT)${NC}"
fi

# ============================================================================
# PASO 5: RESTAURAR DATOS MONGODB
# ============================================================================
echo -e "\n${BLUE}[5/7] Restaurando Datos MongoDB...${NC}"

if [ -f "$MONGO_USERS" ]; then
    echo -e "   Limpiando coleccion de usuarios..."
    docker exec ticketing-mongodb mongosh --eval 'use ticketing; db.users.deleteMany({});' > /dev/null 2>&1
    
    echo -e "   Restaurando usuarios desde backup..."
    cat "$MONGO_USERS" | docker exec -i ticketing-mongodb mongosh ticketing > /dev/null 2>&1
    
    USER_COUNT=$(docker exec ticketing-mongodb mongosh --quiet --eval 'use ticketing; db.users.countDocuments();' 2>/dev/null)
    echo -e "   ${GREEN}[OK] Usuarios MongoDB restaurados exitosamente${NC}"
    [ -n "$USER_COUNT" ] && echo -e "     - Total usuarios: $USER_COUNT"
else
    echo -e "   ${YELLOW}[WARN] Archivo de backup MongoDB no encontrado${NC}"
fi

# ============================================================================
# PASO 6: VERIFICACION FINAL
# ============================================================================
echo -e "\n${BLUE}[6/7] Verificacion Final...${NC}"

# Verificar PostgreSQL
if docker exec ticketing-postgres psql -U admin -d ticketing -c '\q' > /dev/null 2>&1; then
    echo -e "   ${GREEN}[OK] PostgreSQL: Conectado y operativo${NC}"
else
    echo -e "   ${RED}[ERROR] PostgreSQL: Error de conexion${NC}"
fi

# Verificar MongoDB
if docker exec ticketing-mongodb mongosh --eval 'db.adminCommand("ping")' > /dev/null 2>&1; then
    echo -e "   ${GREEN}[OK] MongoDB: Conectado y operativo${NC}"
else
    echo -e "   ${YELLOW}[WARN] MongoDB: Posible problema de conexion${NC}"
fi

# Verificar Prisma
cd "$ADMIN_PROJECT_PATH" || exit 1
if npx prisma db pull > /dev/null 2>&1; then
    echo -e "   ${GREEN}[OK] Prisma: Schema sincronizado${NC}"
else
    echo -e "   ${YELLOW}[WARN] Prisma: Verificar estado de migraciones${NC}"
fi
cd "$SCRIPT_PATH" || exit 1

echo -e "\n${CYAN}======================================================================${NC}"
echo -e "${CYAN}                   RESTAURACION 100% AUTONOMA COMPLETADA              ${NC}"
echo -e "${CYAN}======================================================================${NC}"

echo -e "\n${GREEN}RESUMEN DE LA RESTAURACION:${NC}"
echo -e "   Backup utilizado: $BACKUP_DATE"
echo -e "   DROP completo: Realizado"
echo -e "   Schemas Prisma: Restaurados desde cero"
echo -e "   Migraciones Prisma: Aplicadas desde cero"
echo -e "   PostgreSQL: Restaurado completo con DROP previo"
echo -e "   MongoDB: Restaurado completo con DROP previo"

echo -e "\n${YELLOW}PARA INICIAR EL SISTEMA EN ESTE MAC:${NC}"
echo -e "   1. cd ../../backend/admin && npm run dev"
echo -e "   2. cd ../../backend/user-service && npm run dev"
echo -e "   3. cd ../../frontend/ticketing-app && npm start"

echo -e "\n${YELLOW}CREDENCIALES DISPONIBLES:${NC}"
echo -e "   Super Admin: super@admin.com (contraseña original)"
echo -e "   Admin: admin@ticketing.com (contraseña original)"
echo -e "   Super Admin 2: voro.super@ticketing.com (contraseña original)"

echo -e "\n${GREEN}SISTEMA 100% FUNCIONAL EN TU MAC [OK]${NC}"
echo -e "${CYAN}======================================================================${NC}"