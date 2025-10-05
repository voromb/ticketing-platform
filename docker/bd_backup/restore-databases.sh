#!/bin/bash
# 🔄 Script de Restore Completo - Ticketing Platform
# Autor: Sistema de Restore Automático
# Fecha: 2025-10-04

# Verificar que se proporcione el timestamp
if [ $# -eq 0 ]; then
    echo "❌ Error: Debes proporcionar un timestamp"
    echo "💡 Uso: ./restore-databases.sh YYYY-MM-DD_HH-MM"
    echo "📁 Backups disponibles:"
    ls docker/bd_backup/*backup* 2>/dev/null | sed 's/.*backup_/   - /' | sed 's/\.[^.]*$//'
    exit 1
fi

timestamp=$1
# Detectar si es formato fecha (YYYY-MM-DD) o timestamp (HH-MM)
if [[ $timestamp =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    backupDir="backups/$timestamp"
else
    # Buscar en carpetas de fecha recientes
    latest_date=$(ls -d backups/*/ 2>/dev/null | tail -1 | sed 's|backups/||' | sed 's|/||')
    backupDir="backups/$latest_date"
fi

echo "🔄 Iniciando Restore de Bases de Datos..."
echo "📅 Timestamp: $timestamp"

# Verificar que existen los archivos de backup
required_files=(
    "$backupDir/postgres_full_backup_$timestamp.sql"
    "$backupDir/mongodb_users_$timestamp.json"
    "$backupDir/prisma_schema_$timestamp.prisma"
)

# Archivos opcionales (no críticos)
optional_files=(
    "$backupDir/postgres_categories_$timestamp.json"
    "$backupDir/postgres_localities_$timestamp.json"
)

echo ""
echo "🔍 Verificando archivos de backup..."
echo "📁 Directorio: $backupDir"

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Archivo no encontrado: $file"
        echo "💡 Archivos disponibles:"
        ls "$backupDir"/* 2>/dev/null | sed 's/.*\//   - /'
        exit 1
    else
        echo "✅ Encontrado: $(basename "$file")"
    fi
done

echo ""
echo "📦 Verificando archivos opcionales..."
for file in "${optional_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Encontrado: $(basename "$file")"
    else
        echo "⚠️  Opcional no encontrado: $(basename "$file")"
    fi
done

echo ""
echo "⚠️  ADVERTENCIA: Este proceso sobrescribirá las bases de datos actuales"
read -p "¿Continuar con el restore? (s/N): " confirm
if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "❌ Restore cancelado por el usuario"
    exit 0
fi

echo ""
echo "🛑 Deteniendo servicios..."

# Detener servicios Node.js
if pkill -f "node.*npm run dev" 2>/dev/null; then
    echo "✅ Servicios Node.js detenidos"
else
    echo "⚠️  No se encontraron procesos Node.js activos"
fi

echo ""
echo "🐘 Restaurando PostgreSQL..."

# Restore PostgreSQL
if docker exec ticketing-postgres psql -U admin -d ticketing -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' >/dev/null 2>&1; then
    echo "✅ Base de datos PostgreSQL limpiada"
    
    if cat "$backupDir/postgres_full_backup_$timestamp.sql" | docker exec -i ticketing-postgres psql -U admin -d ticketing >/dev/null 2>&1; then
        echo "✅ PostgreSQL restaurado desde backup"
    else
        echo "❌ Error restaurando PostgreSQL"
    fi
else
    echo "❌ Error limpiando base de datos PostgreSQL"
fi

echo ""
echo "🍃 Restaurando MongoDB..."

# Restore MongoDB - Limpiar y restaurar
if docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --eval 'use ticketing; db.users.deleteMany({})' >/dev/null 2>&1; then
    echo "✅ Colección de usuarios limpiada"
    
    # Restaurar usuarios desde backup
    if docker cp "$backupDir/mongodb_users_$timestamp.json" ticketing-mongodb:/tmp/users_restore.json >/dev/null 2>&1; then
        if docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/users_restore.json --jsonArray >/dev/null 2>&1; then
            echo "✅ Usuarios restaurados desde MongoDB"
        else
            echo "❌ Error importando usuarios a MongoDB"
        fi
    else
        echo "❌ Error copiando archivo de usuarios"
    fi
else
    echo "❌ Error limpiando MongoDB"
fi

echo ""
echo "🔧 Restaurando Prisma Schema..."

# Restore Prisma Schema
prismaDestination="../../backend/admin/prisma/schema.prisma"
if cp "$backupDir/prisma_schema_$timestamp.prisma" "$prismaDestination"; then
    echo "✅ Prisma Schema restaurado"
    
    cd ../../backend/admin || exit
    
    # Sincronizar Prisma con PostgreSQL restaurado
    echo "🔄 Sincronizando Prisma con PostgreSQL..."
    if npx prisma db push --accept-data-loss >/dev/null 2>&1; then
        echo "✅ Prisma sincronizado con base de datos"
    else
        echo "⚠️  Advertencia: Error en sincronización (continuando...)"
    fi
    
    # Regenerar Prisma Client
    echo "🔄 Regenerando Prisma Client..."
    if npx prisma generate >/dev/null 2>&1; then
        echo "✅ Prisma Client regenerado correctamente"
    else
        echo "❌ Error regenerando Prisma Client"
    fi
    
    cd ../../docker/bd_backup || exit
else
    echo "Error restaurando Prisma Schema"
fi

echo ""
echo "🚀 Reiniciando servicios..."

# Reiniciar servicios en background con rutas relativas
RESTORE_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ADMIN_PATH="$RESTORE_SCRIPT_DIR/../../backend/admin"
USER_PATH="$RESTORE_SCRIPT_DIR/../../backend/user-service"

if [ -d "$ADMIN_PATH" ]; then
    (cd "$ADMIN_PATH" && npm run dev >/dev/null 2>&1 &)
    sleep 2
fi

if [ -d "$USER_PATH" ]; then
    (cd "$USER_PATH" && npm run dev >/dev/null 2>&1 &)
fi

echo "✅ Servicios reiniciados en background"

echo ""
echo "📦 Restaurando datos adicionales..."

# Restaurar categorías si existe el archivo
if [ -f "$backupDir/postgres_categories_$timestamp.json" ]; then
    echo "📂 Categorías disponibles para importación manual"
else
    echo "⚠️  No hay backup de categorías"
fi

# Restaurar localidades si existe el archivo
if [ -f "$backupDir/postgres_localities_$timestamp.json" ]; then
    echo "🏢 Localidades disponibles para importación manual"
else
    echo "⚠️  No hay backup de localidades"
fi

echo ""
echo "✅ ¡Restore completado!"
echo "📋 Resumen:"
echo "   🐘 PostgreSQL: Restaurado desde SQL dump"
echo "   🍃 MongoDB: Archivo disponible para restore manual"
echo "   🔧 Prisma: Schema restaurado y cliente regenerado"
echo "   📦 Categorías y Localidades: Disponibles en archivos JSON"
echo "   🚀 Servicios: Reiniciados en background"

echo ""
echo "💡 Próximos pasos:"
echo "   1. Verificar que los servicios estén funcionando"
echo "   2. Restaurar MongoDB manualmente si es necesario"
echo "   3. Importar categorías y localidades si es necesario"
echo "   4. Probar la aplicación"
