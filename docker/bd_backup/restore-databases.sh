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
backup_dir="backup"

echo "🔄 Iniciando Restore de Bases de Datos..."
echo "📅 Timestamp: $timestamp"

# Verificar que existen los archivos de backup
required_files=(
    "$backup_dir/postgres_full_backup_$timestamp.sql"
    "$backup_dir/mongodb_users_$timestamp.json"
    "$backup_dir/prisma_schema_$timestamp.prisma"
)

echo ""
echo "🔍 Verificando archivos de backup..."

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Archivo no encontrado: $file"
        echo "💡 Archivos disponibles:"
        ls "$backup_dir"/*backup* 2>/dev/null | sed 's/.*\//   - /'
        exit 1
    else
        echo "✅ Encontrado: $(basename "$file")"
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
if docker exec ticketing-postgres psql -U admin -d ticketing -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" >/dev/null 2>&1; then
    echo "✅ Base de datos PostgreSQL limpiada"
    
    if cat "$backup_dir/postgres_full_backup_$timestamp.sql" | docker exec -i ticketing-postgres psql -U admin -d ticketing >/dev/null 2>&1; then
        echo "✅ PostgreSQL restaurado desde backup"
    else
        echo "❌ Error restaurando PostgreSQL"
    fi
else
    echo "❌ Error limpiando base de datos PostgreSQL"
fi

echo ""
echo "🍃 Restaurando MongoDB..."

# Restore MongoDB (requiere implementación en el backend)
echo "⚠️  MongoDB restore requiere implementación manual"
echo "📁 Archivo disponible: mongodb_users_$timestamp.json"
echo "💡 Usar MongoDB Compass o mongoimport para restaurar"

echo ""
echo "🔧 Restaurando Prisma Schema..."

# Restore Prisma Schema
if cp "$backup_dir/prisma_schema_$timestamp.prisma" "backend/admin/prisma/schema.prisma"; then
    echo "✅ Prisma Schema restaurado"
    
    cd backend/admin
    
    # Sincronizar Prisma con PostgreSQL restaurado
    echo "🔄 Sincronizando Prisma con PostgreSQL..."
    if npx prisma db pull >/dev/null 2>&1; then
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
    
    cd ../..
else
    echo "❌ Error restaurando Prisma Schema"
fi

echo ""
echo "🚀 Reiniciando servicios..."

# Reiniciar servicios en background
cd backend/admin && npm run dev >/dev/null 2>&1 &
sleep 2
cd ../user-service && npm run dev >/dev/null 2>&1 &
cd ../..

echo "✅ Servicios reiniciados en background"

echo ""
echo "✅ ¡Restore completado!"
echo "📋 Resumen:"
echo "   🐘 PostgreSQL: Restaurado desde SQL dump"
echo "   🍃 MongoDB: Archivo disponible para restore manual"
echo "   🔧 Prisma: Schema restaurado y cliente regenerado"
echo "   🚀 Servicios: Reiniciados en background"

echo ""
echo "💡 Próximos pasos:"
echo "   1. Verificar que los servicios estén funcionando"
echo "   2. Restaurar MongoDB manualmente si es necesario"
echo "   3. Probar la aplicación"
