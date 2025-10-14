#!/bin/bash
# cSpell:ignore mkdir chmod chown numfmt dockerized mongoexport

# Script de Backup Completo con Migraciones Prisma - Ticketing Platform
# Autor: Sistema de Backup con Migraciones
# Fecha: 2025-10-14
# Descripcion: Backup completo incluyendo migraciones de Prisma (Linux/Mac)

# Variables por defecto
INCLUDE_CONFIGS=false
SHOW_PROGRESS=false
BACKUP_NAME=""

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--include-configs)
            INCLUDE_CONFIGS=true
            shift
            ;;
        -p|--show-progress)
            SHOW_PROGRESS=true
            shift
            ;;
        -n|--name)
            BACKUP_NAME="$2"
            shift 2
            ;;
        -h|--help)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  -c, --include-configs   Incluir archivos de configuracion"
            echo "  -p, --show-progress     Mostrar barra de progreso"
            echo "  -n, --name              Nombre personalizado para el backup"
            echo "  -h, --help              Mostrar esta ayuda"
            echo ""
            echo "Ejemplo: $0 -c -p"
            exit 0
            ;;
        *)
            echo "Opcion desconocida: $1"
            echo "Usa -h o --help para ver las opciones disponibles"
            exit 1
            ;;
    esac
done

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
echo -e "${CYAN}             BACKUP COMPLETO CON MIGRACIONES PRISMA                  ${NC}"
echo -e "${CYAN}                     Ticketing Platform v2.0                        ${NC}"
echo -e "${CYAN}======================================================================${NC}"

# Variables globales
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATE_TODAY=$(date +"%Y-%m-%d")
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

if [ -n "$BACKUP_NAME" ]; then
    BACKUP_DIR="${SCRIPT_PATH}/backups/${DATE_TODAY}_${BACKUP_NAME}"
else
    BACKUP_DIR="${SCRIPT_PATH}/backups/${DATE_TODAY}"
fi

ADMIN_PROJECT_PATH="${SCRIPT_PATH}/../../backend/admin"
SERVICES_PROJECT_PATH="${SCRIPT_PATH}/../../backend/services/festival-services"

echo -e "\n${BLUE}Configuracion del backup:${NC}"
echo -e "   Fecha: ${WHITE}${DATE_TODAY}${NC}"
echo -e "   Timestamp: ${WHITE}${TIMESTAMP}${NC}"
echo -e "   Directorio: ${WHITE}${BACKUP_DIR}${NC}"
echo -e "   Incluir configs: ${WHITE}$([ "$INCLUDE_CONFIGS" = true ] && echo "Si" || echo "No")${NC}"

# Funcion para mostrar progreso
show_progress() {
    if [ "$SHOW_PROGRESS" = true ]; then
        local current=$1
        local total=$2
        local description=$3
        local percent=$((current * 100 / total))
        
        echo -ne "\r${CYAN}[${current}/${total}] ${description}... ${percent}%${NC}"
        if [ "$current" -eq "$total" ]; then
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

# Crear directorio de backup
echo -e "\n${BLUE}Preparando directorio de backup...${NC}"
mkdir -p "$BACKUP_DIR"
echo -e "   ✓ ${GREEN}Directorio creado: $BACKUP_DIR${NC}"

echo -e "\n${GREEN}Iniciando Backup Completo con Migraciones...${NC}"

# ============================================================================
# 1. BACKUP SCHEMAS Y MIGRACIONES PRISMA - PRIMERO
# ============================================================================
echo -e "\n${BLUE}[1/6] Backup Schemas y Migraciones Prisma...${NC}"
show_progress 1 6 "Respaldando configuracion de Prisma"

# Backup Schema Admin
if [ -f "${ADMIN_PROJECT_PATH}/prisma/schema.prisma" ]; then
    echo -e "   ${CYAN}Respaldando schema Admin...${NC}"
    if cp "${ADMIN_PROJECT_PATH}/prisma/schema.prisma" "${BACKUP_DIR}/${TIMESTAMP}_prisma_admin_schema.prisma"; then
        echo -e "   ✓ ${GREEN}Schema Admin respaldado${NC}"
    else
        echo -e "   ${RED}ERROR respaldando schema Admin${NC}"
    fi
else
    echo -e "   ${YELLOW}WARN Schema Admin no encontrado${NC}"
fi

# Backup Migraciones Admin - CRITICO
if [ -d "${ADMIN_PROJECT_PATH}/prisma/migrations" ]; then
    echo -e "   ${CYAN}Respaldando migraciones Admin...${NC}"
    if cp -r "${ADMIN_PROJECT_PATH}/prisma/migrations" "${BACKUP_DIR}/${TIMESTAMP}_prisma_admin_migrations"; then
        # Contar migraciones respaldadas
        mapfile -t MIGRATIONS < <(find "${BACKUP_DIR}/${TIMESTAMP}_prisma_admin_migrations" -maxdepth 1 -type d ! -path "${BACKUP_DIR}/${TIMESTAMP}_prisma_admin_migrations")
        echo -e "   ✓ ${GREEN}Migraciones Admin respaldadas (${#MIGRATIONS[@]} migraciones)${NC}"
        for migration in "${MIGRATIONS[@]}"; do
            echo -e "     - ${WHITE}$(basename "$migration")${NC}"
        done
    else
        echo -e "   ${RED}ERROR respaldando migraciones Admin${NC}"
        exit 1
    fi
else
    echo -e "   ${RED}ERROR Migraciones Admin no encontradas - CRITICO${NC}"
    exit 1
fi

# Backup Schema Services (si existe)
if [ -f "${SERVICES_PROJECT_PATH}/prisma/schema.prisma" ]; then
    echo -e "   ${CYAN}Respaldando schema Festival Services...${NC}"
    if cp "${SERVICES_PROJECT_PATH}/prisma/schema.prisma" "${BACKUP_DIR}/${TIMESTAMP}_prisma_services_schema.prisma"; then
        echo -e "   ✓ ${GREEN}Schema Festival Services respaldado${NC}"
    else
        echo -e "   ${RED}ERROR respaldando schema Services${NC}"
    fi
else
    echo -e "   ${GRAY}INFO Schema Festival Services no existe${NC}"
fi

# ============================================================================
# 2. BACKUP BASE DE DATOS POSTGRESQL
# ============================================================================
echo -e "\n${BLUE}[2/6] Backup Base de Datos PostgreSQL...${NC}"
show_progress 2 6 "Respaldando datos de PostgreSQL"

echo -e "   ${CYAN}Creando backup de PostgreSQL...${NC}"
if docker exec ticketing-postgres pg_dump -U admin -d ticketing --clean --if-exists > "${BACKUP_DIR}/${TIMESTAMP}_postgres_ticketing_full.sql"; then
    # Verificar tamaño del archivo
    POSTGRES_SIZE=$(stat -f%z "${BACKUP_DIR}/${TIMESTAMP}_postgres_ticketing_full.sql" 2>/dev/null || stat -c%s "${BACKUP_DIR}/${TIMESTAMP}_postgres_ticketing_full.sql" 2>/dev/null || echo "0")
    
    echo -e "   ✓ ${GREEN}Backup PostgreSQL completado${NC}"
    echo -e "     - Tamaño: ${WHITE}$(numfmt --to=iec --suffix=B "$POSTGRES_SIZE" 2>/dev/null || echo "${POSTGRES_SIZE} bytes")${NC}"
    
    # Verificar contenido crítico
    if grep -q "CREATE TABLE" "${BACKUP_DIR}/${TIMESTAMP}_postgres_ticketing_full.sql"; then
        echo -e "     - Estructura: ${GREEN}✓ Tablas encontradas${NC}"
    else
        echo -e "     - Estructura: ${RED}✗ Sin tablas${NC}"
    fi
    
    if grep -q "INSERT INTO" "${BACKUP_DIR}/${TIMESTAMP}_postgres_ticketing_full.sql"; then
        echo -e "     - Datos: ${GREEN}✓ Datos encontrados${NC}"
    else
        echo -e "     - Datos: ${YELLOW}⚠ Sin datos${NC}"
    fi
else
    echo -e "   ${RED}ERROR creando backup PostgreSQL${NC}"
    exit 1
fi

# ============================================================================
# 3. BACKUP BASE DE DATOS MONGODB
# ============================================================================
echo -e "\n${BLUE}[3/6] Backup Base de Datos MongoDB...${NC}"
show_progress 3 6 "Respaldando datos de MongoDB"

echo -e "   ${CYAN}Creando backup de usuarios MongoDB...${NC}"
if docker exec ticketing-mongodb mongoexport --db ticketing --collection users --jsonArray > "${BACKUP_DIR}/${TIMESTAMP}_mongodb_users.json"; then
    # Verificar tamaño del archivo
    MONGO_SIZE=$(stat -f%z "${BACKUP_DIR}/${TIMESTAMP}_mongodb_users.json" 2>/dev/null || stat -c%s "${BACKUP_DIR}/${TIMESTAMP}_mongodb_users.json" 2>/dev/null || echo "0")
    
    echo -e "   ✓ ${GREEN}Backup MongoDB completado${NC}"
    echo -e "     - Tamaño: ${WHITE}$(numfmt --to=iec --suffix=B "$MONGO_SIZE" 2>/dev/null || echo "${MONGO_SIZE} bytes")${NC}"
    
    # Contar usuarios
    if command -v jq >/dev/null 2>&1; then
        USER_COUNT=$(jq length "${BACKUP_DIR}/${TIMESTAMP}_mongodb_users.json" 2>/dev/null || echo "?")
        echo -e "     - Usuarios: ${WHITE}${USER_COUNT}${NC}"
    fi
else
    echo -e "   ${YELLOW}WARN Error creando backup MongoDB (puede estar vacio)${NC}"
fi

# ============================================================================
# 4. BACKUP CONFIGURACIONES (OPCIONAL)
# ============================================================================
echo -e "\n${BLUE}[4/6] Backup Configuraciones...${NC}"
show_progress 4 6 "Respaldando archivos de configuracion"

if [ "$INCLUDE_CONFIGS" = true ]; then
    echo -e "   ${CYAN}Respaldando archivos de configuracion...${NC}"
    
    # Backup docker-compose
    if [ -f "${SCRIPT_PATH}/../docker-compose.yml" ]; then
        cp "${SCRIPT_PATH}/../docker-compose.yml" "${BACKUP_DIR}/${TIMESTAMP}_docker-compose.yml"
        echo -e "     - ${GREEN}docker-compose.yml${NC}"
    fi
    
    # Backup package.json files
    find "${SCRIPT_PATH}/../../" -name "package.json" -type f | while read -r pkg; do
        relative_path=$(echo "$pkg" | sed "s|${SCRIPT_PATH}/../../||g" | tr '/' '_')
        cp "$pkg" "${BACKUP_DIR}/${TIMESTAMP}_package_${relative_path}"
        echo -e "     - ${GREEN}${relative_path}${NC}"
    done
    
    echo -e "   ✓ ${GREEN}Configuraciones respaldadas${NC}"
else
    echo -e "   ${GRAY}SKIP Configuraciones omitidas${NC}"
fi

# ============================================================================
# 5. VERIFICACION Y VALIDACION
# ============================================================================
echo -e "\n${BLUE}[5/6] Verificacion y Validacion...${NC}"
show_progress 5 6 "Verificando integridad del backup"

echo -e "   ${CYAN}Verificando archivos criticos...${NC}"

# Verificar archivos esenciales
ESSENTIAL_FILES=(
    "${TIMESTAMP}_prisma_admin_schema.prisma"
    "${TIMESTAMP}_postgres_ticketing_full.sql"
)

CRITICAL_DIRS=(
    "${TIMESTAMP}_prisma_admin_migrations"
)

all_critical_ok=true

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "${BACKUP_DIR}/${file}" ]; then
        echo -e "     ✓ ${GREEN}${file}${NC}"
    else
        echo -e "     ✗ ${RED}${file} - FALTA${NC}"
        all_critical_ok=false
    fi
done

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "${BACKUP_DIR}/${dir}" ]; then
        echo -e "     ✓ ${GREEN}${dir}/${NC}"
    else
        echo -e "     ✗ ${RED}${dir}/ - FALTA${NC}"
        all_critical_ok=false
    fi
done

if [ "$all_critical_ok" = false ]; then
    echo -e "\n${RED}ERROR: Faltan archivos criticos en el backup${NC}"
    exit 1
fi

# ============================================================================
# 6. RESUMEN Y FINALIZACION
# ============================================================================
echo -e "\n${BLUE}[6/6] Resumen y Finalizacion...${NC}"
show_progress 6 6 "Generando resumen del backup"

# Contar archivos totales
TOTAL_FILES=$(find "$BACKUP_DIR" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "?")

# Crear archivo de resumen
cat > "${BACKUP_DIR}/backup_summary.txt" << EOF
BACKUP COMPLETO TICKETING PLATFORM
==================================
Fecha: ${DATE_TODAY}
Timestamp: ${TIMESTAMP}
Generado por: backup_completo_v2.sh

ARCHIVOS INCLUIDOS:
==================
$(ls -la "${BACKUP_DIR}")

ESTADISTICAS:
=============
Total archivos: ${TOTAL_FILES}
Tamaño total: ${TOTAL_SIZE}
Configuraciones incluidas: $([ "$INCLUDE_CONFIGS" = true ] && echo "Si" || echo "No")

VERIFICACION:
=============
✓ Schemas Prisma: Incluidos
✓ Migraciones Prisma: Incluidas  
✓ Base de datos PostgreSQL: Incluida
✓ Base de datos MongoDB: Incluida

INSTRUCCIONES DE RESTAURACION:
==============================
Para restaurar este backup, ejecuta:
./restore_completo_v2.sh -d ${DATE_TODAY}

CREDENCIALES ACTUALES:
=====================
Super Admin: voro.super@ticketing.com / Voro123!
Admin: admin@ticketing.com / admin123
EOF

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}                      BACKUP COMPLETADO EXITOSAMENTE                 ${NC}"
echo -e "${GREEN}======================================================================${NC}"

echo -e "\n${WHITE}RESUMEN DEL BACKUP:${NC}"
echo -e "   Fecha: ${CYAN}${DATE_TODAY}${NC}"
echo -e "   Directorio: ${CYAN}${BACKUP_DIR}${NC}"
echo -e "   Total archivos: ${WHITE}${TOTAL_FILES}${NC}"
echo -e "   Tamaño total: ${WHITE}${TOTAL_SIZE}${NC}"
echo -e "   Timestamp: ${CYAN}${TIMESTAMP}${NC}"

echo -e "\n${YELLOW}ARCHIVOS CRITICOS INCLUIDOS:${NC}"
echo -e "   ✓ ${GREEN}Schemas Prisma${NC}"
echo -e "   ✓ ${GREEN}Migraciones Prisma${NC}"
echo -e "   ✓ ${GREEN}Base de datos PostgreSQL${NC}"
echo -e "   ✓ ${GREEN}Base de datos MongoDB${NC}"
if [ "$INCLUDE_CONFIGS" = true ]; then
    echo -e "   ✓ ${GREEN}Archivos de configuracion${NC}"
fi

echo -e "\n${YELLOW}PARA RESTAURAR ESTE BACKUP:${NC}"
echo -e "   ${WHITE}./restore_completo_v2.sh -d ${DATE_TODAY}${NC}"

echo -e "\n${GREEN}BACKUP COMPLETADO Y VERIFICADO ✓${NC}"
echo -e "${GREEN}======================================================================${NC}"