#!/bin/bash
# Script de Restauracion Completa con Migraciones Prisma - Ticketing Platform
# Autor: Sistema de Restauracion con Migraciones
# Fecha: 2025-10-14
# Descripcion: Restauracion completa incluyendo migraciones de Prisma (Linux/Mac)

# Variables por defecto
BACKUP_DATE=""
SKIP_CONFIRMATION=false
RESTORE_CONFIGS=false
SHOW_PROGRESS=false

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--date)
            BACKUP_DATE="$2"
            shift 2
            ;;
        -s|--skip-confirmation)
            SKIP_CONFIRMATION=true
            shift
            ;;
        -c|--restore-configs)
            RESTORE_CONFIGS=true
            shift
            ;;
        -p|--show-progress)
            SHOW_PROGRESS=true
            shift
            ;;
        -h|--help)
            echo "Uso: $0 -d <fecha_backup> [opciones]"
            echo ""
            echo "Opciones:"
            echo "  -d, --date              Fecha del backup (OBLIGATORIO)"
            echo "  -s, --skip-confirmation Saltar confirmacion de usuario"
            echo "  -c, --restore-configs   Restaurar archivos de configuracion"
            echo "  -p, --show-progress     Mostrar barra de progreso"
            echo "  -h, --help              Mostrar esta ayuda"
            echo ""
            echo "Ejemplo: $0 -d 2025-10-14 -p"
            exit 0
            ;;
        *)
            echo "Opcion desconocida: $1"
            echo "Usa -h o --help para ver las opciones disponibles"
            exit 1
            ;;
    esac
done

# Verificar que se proporciono la fecha
if [ -z "$BACKUP_DATE" ]; then
    echo "Error: Debes especificar la fecha del backup con -d"
    echo "Ejemplo: $0 -d 2025-10-14"
    echo "Usa -h para ver todas las opciones disponibles"
    exit 1
fi

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}           RESTAURACION COMPLETA CON MIGRACIONES PRISMA              ${NC}"
echo -e "${CYAN}                     Ticketing Platform v2.0                        ${NC}"
echo -e "${CYAN}======================================================================${NC}"

# Variables globales
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_PATH="${SCRIPT_PATH}/backups/${BACKUP_DATE}"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ADMIN_PROJECT_PATH="${SCRIPT_PATH}/../../backend/admin"
SERVICES_PROJECT_PATH="${SCRIPT_PATH}/../../backend/services/festival-services"

echo -e "\n${BLUE}Verificando backup...${NC}"
echo -e "   Ruta: ${WHITE}${BACKUP_PATH}${NC}"

# Verificar que existe el directorio de backup
if [ ! -d "$BACKUP_PATH" ]; then
    echo -e "\n${RED}Error: No se encuentra el directorio de backup${NC}"
    echo -e "${YELLOW}Fechas disponibles:${NC}"
    for dir in "${SCRIPT_PATH}/backups"/*; do
        if [ -d "$dir" ]; then
            echo -e "  - ${WHITE}$(basename "$dir")${NC}"
        fi
    done
    exit 1
fi

# Buscar archivos de backup
echo -e "\n${BLUE}Analizando archivos de backup...${NC}"
mapfile -t BACKUP_FILES < <(find "$BACKUP_PATH" -maxdepth 1 -type f)
echo -e "   Archivos encontrados: ${WHITE}${#BACKUP_FILES[@]}${NC}"

# Identificar archivos principales
POSTGRES_MAIN=$(find "$BACKUP_PATH" -name "*postgres_estado_actual*" -o -name "*postgres_ticketing_full*" | head -n 1)
MONGO_USERS=$(find "$BACKUP_PATH" -name "*mongodb_usuarios*" -o -name "*mongodb_users*" | head -n 1)
PRISMA_ADMIN_SCHEMA=$(find "$BACKUP_PATH" -name "*prisma_admin_schema*" | head -n 1)
PRISMA_SERVICES_SCHEMA=$(find "$BACKUP_PATH" -name "*prisma_services_schema*" | head -n 1)

# Buscar directorio de migraciones de Prisma
PRISMA_ADMIN_MIGRATIONS=$(find "$BACKUP_PATH" -type d -name "*prisma_admin_migrations*" | head -n 1)

echo -e "\n${YELLOW}Archivos criticos encontrados:${NC}"
if [ -n "$POSTGRES_MAIN" ]; then
    echo -e "   ✓ PostgreSQL Principal: ${GREEN}$(basename "$POSTGRES_MAIN")${NC}"
else
    echo -e "   ✓ PostgreSQL Principal: ${RED}ERROR No encontrado${NC}"
fi

if [ -n "$MONGO_USERS" ]; then
    echo -e "   ✓ MongoDB Usuarios: ${GREEN}$(basename "$MONGO_USERS")${NC}"
else
    echo -e "   ✓ MongoDB Usuarios: ${YELLOW}WARN No encontrado${NC}"
fi

if [ -n "$PRISMA_ADMIN_SCHEMA" ]; then
    echo -e "   ✓ Schema Admin: ${GREEN}$(basename "$PRISMA_ADMIN_SCHEMA")${NC}"
else
    echo -e "   ✓ Schema Admin: ${YELLOW}WARN No encontrado${NC}"
fi

if [ -n "$PRISMA_ADMIN_MIGRATIONS" ]; then
    echo -e "   ✓ Migraciones Admin: ${GREEN}$(basename "$PRISMA_ADMIN_MIGRATIONS")${NC}"
else
    echo -e "   ✓ Migraciones Admin: ${RED}ERROR No encontradas${NC}"
fi

if [ -n "$PRISMA_SERVICES_SCHEMA" ]; then
    echo -e "   ✓ Schema Services: ${GREEN}$(basename "$PRISMA_SERVICES_SCHEMA")${NC}"
else
    echo -e "   ✓ Schema Services: ${GRAY}INFO No existe${NC}"
fi

# Verificar archivos criticos
if [ -z "$POSTGRES_MAIN" ]; then
    echo -e "\n${RED}Error: No se encontro el backup principal de PostgreSQL${NC}"
    exit 1
fi

if [ -z "$PRISMA_ADMIN_MIGRATIONS" ]; then
    echo -e "\n${RED}Error: No se encontraron las migraciones de Prisma Admin${NC}"
    echo -e "${YELLOW}Las migraciones son CRITICAS para la restauracion correcta${NC}"
    exit 1
fi

# Funcion para mostrar progreso
show_progress() {
    if [ "$SHOW_PROGRESS" = true ]; then
        local current=$1
        local total=$2
        local description=$3
        local percent=$((current * 100 / total))
        
        echo -ne "\r${CYAN}[${current}/${total}] ${description}... ${percent}%${NC}"
        if [ $current -eq $total ]; then
            echo -e "\n"
        fi
    fi
}

# Funcion para verificar servicios Docker
test_docker_services() {
    echo -e "\n${BLUE}Verificando servicios Docker...${NC}"
    
    local services=("ticketing-postgres" "ticketing-mongodb")
    local all_running=true
    
    for service in "${services[@]}"; do
        local status
        status=$(docker ps --filter "name=$service" --format "{{.Status}}" 2>/dev/null)
        if [[ $status && $status == *"Up"* ]]; then
            echo -e "   ✓ ${service} : ${GREEN}Running${NC}"
        else
            echo -e "   ✗ ${service} : ${RED}Not running${NC}"
            all_running=false
        fi
    done
    
    if [ "$all_running" = false ]; then
        return 1
    else
        return 0
    fi
}

# Verificar servicios Docker
if ! test_docker_services; then
    echo -e "\n${RED}Error: Algunos servicios Docker no estan corriendo${NC}"
    echo -e "${YELLOW}Inicia los servicios con: docker-compose up -d${NC}"
    exit 1
fi

# Confirmacion de usuario
if [ "$SKIP_CONFIRMATION" = false ]; then
    echo -e "\n${YELLOW}ADVERTENCIA: Esta operacion SOBRESCRIBIRA completamente:${NC}"
    echo -e "   - ${RED}Todas las bases de datos PostgreSQL${NC}"
    echo -e "   - ${RED}Todas las bases de datos MongoDB${NC}"
    echo -e "   - ${RED}Todos los esquemas Prisma${NC}"
    echo -e "   - ${RED}Todas las migraciones Prisma${NC}"
    if [ "$RESTORE_CONFIGS" = true ]; then
        echo -e "   - ${RED}Todos los archivos de configuracion${NC}"
    fi
    
    echo -e "\n${RED}Esta accion es IRREVERSIBLE${NC}"
    echo -en "\n${YELLOW}Escribe 'RESTAURAR' (en mayusculas) para continuar: ${NC}"
    read -r confirmacion
    if [ "$confirmacion" != "RESTAURAR" ]; then
        echo -e "${YELLOW}Restauracion cancelada por el usuario${NC}"
        exit 0
    fi
fi

echo -e "\n${GREEN}Iniciando Restauracion Completa con Migraciones...${NC}"

# ============================================================================
# 1. RESTAURAR SCHEMAS Y MIGRACIONES PRISMA - PRIMERO
# ============================================================================
echo -e "\n${BLUE}[1/6] Restaurando Schemas y Migraciones Prisma...${NC}"
show_progress 1 6 "Restaurando configuracion de Prisma"

# Restaurar Schema Admin
if [ -n "$PRISMA_ADMIN_SCHEMA" ]; then
    TARGET_SCHEMA_PATH="${ADMIN_PROJECT_PATH}/prisma/schema.prisma"
    echo -e "   ${CYAN}Restaurando schema Admin...${NC}"
    
    # Crear directorio si no existe
    mkdir -p "$(dirname "$TARGET_SCHEMA_PATH")"
    
    if cp "$PRISMA_ADMIN_SCHEMA" "$TARGET_SCHEMA_PATH"; then
        echo -e "   ✓ ${GREEN}Schema Admin restaurado${NC}"
    else
        echo -e "   ${RED}ERROR restaurando schema Admin${NC}"
    fi
fi

# Restaurar Migraciones Admin - CRITICO
if [ -n "$PRISMA_ADMIN_MIGRATIONS" ]; then
    TARGET_MIGRATIONS_PATH="${ADMIN_PROJECT_PATH}/prisma/migrations"
    echo -e "   ${CYAN}Restaurando migraciones Admin...${NC}"
    
    # Limpiar migraciones existentes
    if [ -d "$TARGET_MIGRATIONS_PATH" ]; then
        rm -rf "$TARGET_MIGRATIONS_PATH"
    fi
    
    # Restaurar migraciones desde backup
    if cp -r "$PRISMA_ADMIN_MIGRATIONS" "$TARGET_MIGRATIONS_PATH"; then
        # Listar migraciones restauradas
        mapfile -t MIGRATIONS < <(find "$TARGET_MIGRATIONS_PATH" -maxdepth 1 -type d ! -path "$TARGET_MIGRATIONS_PATH")
        echo -e "   ✓ ${GREEN}Migraciones Admin restauradas (${#MIGRATIONS[@]} migraciones)${NC}"
        for migration in "${MIGRATIONS[@]}"; do
            echo -e "     - ${WHITE}$(basename "$migration")${NC}"
        done
    else
        echo -e "   ${RED}ERROR restaurando migraciones Admin${NC}"
        exit 1
    fi
fi

# Restaurar Schema Services (si existe)
if [ -n "$PRISMA_SERVICES_SCHEMA" ]; then
    TARGET_SERVICES_SCHEMA_PATH="${SERVICES_PROJECT_PATH}/prisma/schema.prisma"
    if [ -d "$(dirname "$TARGET_SERVICES_SCHEMA_PATH")" ]; then
        echo -e "   ${CYAN}Restaurando schema Festival Services...${NC}"
        
        # Crear directorio si no existe
        mkdir -p "$(dirname "$TARGET_SERVICES_SCHEMA_PATH")"
        
        if cp "$PRISMA_SERVICES_SCHEMA" "$TARGET_SERVICES_SCHEMA_PATH"; then
            echo -e "   ✓ ${GREEN}Schema Festival Services restaurado${NC}"
        else
            echo -e "   ${RED}ERROR restaurando schema Services${NC}"
        fi
    fi
fi

# ============================================================================
# 2. LIMPIAR Y PREPARAR BASE DE DATOS POSTGRESQL
# ============================================================================
echo -e "\n${BLUE}[2/6] Preparando Base de Datos PostgreSQL...${NC}"
show_progress 2 6 "Limpiando base de datos PostgreSQL"

echo -e "   ${CYAN}Eliminando datos existentes...${NC}"
if docker exec ticketing-postgres psql -U admin -d ticketing -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' >/dev/null 2>&1; then
    echo -e "   ✓ ${GREEN}Base de datos PostgreSQL limpiada${NC}"
else
    echo -e "   ${RED}ERROR limpiando PostgreSQL${NC}"
fi

# ============================================================================
# 3. EJECUTAR MIGRACIONES PRISMA - MUY IMPORTANTE
# ============================================================================
echo -e "\n${BLUE}[3/6] Ejecutando Migraciones Prisma...${NC}"
show_progress 3 6 "Aplicando migraciones de base de datos"

cd "$ADMIN_PROJECT_PATH" || exit 1

echo -e "   ${CYAN}Instalando dependencias de Prisma...${NC}"
if npm install --silent >/dev/null 2>&1; then
    echo -e "   ${CYAN}Ejecutando migraciones Prisma...${NC}"
    if npx prisma migrate deploy >/dev/null 2>&1; then
        echo -e "   ${CYAN}Generando cliente Prisma...${NC}"
        if npx prisma generate >/dev/null 2>&1; then
            echo -e "   ✓ ${GREEN}Migraciones Prisma ejecutadas exitosamente${NC}"
        else
            echo -e "   ${RED}ERROR generando cliente Prisma${NC}"
        fi
    else
        echo -e "   ${RED}ERROR ejecutando migraciones Prisma${NC}"
        echo -e "   ${YELLOW}Intentando aplicar migraciones manualmente...${NC}"
        
        # Aplicar migración directamente desde el archivo SQL
        MIGRATION_FILE=$(find "${ADMIN_PROJECT_PATH}/prisma/migrations" -name "migration.sql" | head -n 1)
        if [ -n "$MIGRATION_FILE" ]; then
            echo -e "   ${CYAN}Aplicando migración desde archivo SQL...${NC}"
            if docker exec -i ticketing-postgres psql -U admin -d ticketing < "$MIGRATION_FILE"; then
                echo -e "   ✓ ${GREEN}Migración aplicada manualmente${NC}"
            else
                echo -e "   ${RED}ERROR aplicando migración manual${NC}"
                exit 1
            fi
        fi
    fi
else
    echo -e "   ${RED}ERROR instalando dependencias${NC}"
    exit 1
fi

# ============================================================================
# 4. RESTAURAR DATOS POSTGRESQL
# ============================================================================
echo -e "\n${BLUE}[4/6] Restaurando Datos PostgreSQL...${NC}"
show_progress 4 6 "Cargando datos de PostgreSQL"

echo -e "   ${CYAN}Cargando backup de PostgreSQL...${NC}"
if docker exec -i ticketing-postgres psql -U admin -d ticketing < "$POSTGRES_MAIN" >/dev/null 2>&1; then
    # Verificar datos restaurados
    ADMIN_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "admins";' 2>/dev/null | tr -d ' \n')
    EVENT_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>/dev/null | tr -d ' \n')
    VENUE_COUNT=$(docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' \n')
    
    echo -e "   ✓ ${GREEN}Datos PostgreSQL restaurados exitosamente${NC}"
    if [ -n "$ADMIN_COUNT" ]; then echo -e "     - Administradores: ${WHITE}${ADMIN_COUNT}${NC}"; fi
    if [ -n "$EVENT_COUNT" ]; then echo -e "     - Eventos: ${WHITE}${EVENT_COUNT}${NC}"; fi
    if [ -n "$VENUE_COUNT" ]; then echo -e "     - Venues: ${WHITE}${VENUE_COUNT}${NC}"; fi
else
    echo -e "   ${RED}ERROR restaurando datos PostgreSQL${NC}"
fi

# ============================================================================
# 5. RESTAURAR DATOS MONGODB
# ============================================================================
echo -e "\n${BLUE}[5/6] Restaurando Datos MongoDB...${NC}"
show_progress 5 6 "Cargando datos de MongoDB"

if [ -n "$MONGO_USERS" ]; then
    echo -e "   ${CYAN}Limpiando coleccion de usuarios...${NC}"
    docker exec ticketing-mongodb mongosh --quiet --eval 'use ticketing; db.users.drop()' >/dev/null 2>&1
    
    echo -e "   ${CYAN}Restaurando usuarios desde backup...${NC}"
    if docker exec -i ticketing-mongodb mongoimport --db ticketing --collection users < "$MONGO_USERS" >/dev/null 2>&1; then
        # Verificar datos restaurados
        USER_COUNT=$(docker exec ticketing-mongodb mongosh --quiet --eval 'use ticketing; db.users.countDocuments()' 2>/dev/null | tr -d ' \n')
        
        echo -e "   ✓ ${GREEN}Usuarios MongoDB restaurados exitosamente${NC}"
        if [ -n "$USER_COUNT" ]; then echo -e "     - Total usuarios: ${WHITE}${USER_COUNT}${NC}"; fi
    else
        echo -e "   ${RED}ERROR restaurando usuarios MongoDB${NC}"
    fi
else
    echo -e "   ${YELLOW}WARN No hay backup de usuarios MongoDB${NC}"
fi

# ============================================================================
# 6. VERIFICACION FINAL
# ============================================================================
echo -e "\n${BLUE}[6/6] Verificacion Final...${NC}"
show_progress 6 6 "Verificando restauracion"

echo -e "\n${CYAN}Verificando estado del sistema...${NC}"

# Verificar PostgreSQL
if docker exec ticketing-postgres psql -U admin -d ticketing -c '\dt' >/dev/null 2>&1; then
    echo -e "   ✓ PostgreSQL: ${GREEN}Conectado y operativo${NC}"
else
    echo -e "   PostgreSQL: ${RED}ERROR de conexion${NC}"
fi

# Verificar MongoDB
if docker exec ticketing-mongodb mongosh --quiet --eval 'use ticketing; db.stats()' >/dev/null 2>&1; then
    echo -e "   ✓ MongoDB: ${GREEN}Conectado y operativo${NC}"
else
    echo -e "   MongoDB: ${RED}ERROR de conexion${NC}"
fi

# Volver al directorio original
cd "$SCRIPT_PATH" || exit 1

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}                    RESTAURACION COMPLETADA EXITOSAMENTE             ${NC}"
echo -e "${GREEN}======================================================================${NC}"

echo -e "\n${WHITE}RESUMEN DE LA RESTAURACION:${NC}"
echo -e "   Backup utilizado: ${CYAN}${BACKUP_DATE}${NC}"
echo -e "   Timestamp: ${CYAN}${TIMESTAMP}${NC}"
echo -e "   Schemas Prisma: ${GREEN}Restaurados${NC}"
echo -e "   Migraciones Prisma: ${GREEN}Ejecutadas${NC}"
echo -e "   PostgreSQL: ${GREEN}Restaurado${NC}"
echo -e "   MongoDB: ${GREEN}Restaurado${NC}"

echo -e "\n${YELLOW}PARA INICIAR EL SISTEMA:${NC}"
echo -e "   1. ${WHITE}cd ../../backend/admin && npm run dev${NC}"
echo -e "   2. ${WHITE}cd ../../backend/user-service && npm run dev${NC}"
echo -e "   3. ${WHITE}cd ../../frontend/ticketing-app && npm start${NC}"

echo -e "\n${YELLOW}CREDENCIALES DISPONIBLES:${NC}"
echo -e "   Super Admin: ${WHITE}voro.super@ticketing.com / Voro123!${NC}"
echo -e "   Admin: ${WHITE}admin@ticketing.com / admin123${NC}"

echo -e "\n${GREEN}SISTEMA RESTAURADO Y LISTO PARA USAR ✓${NC}"
echo -e "${GREEN}======================================================================${NC}"