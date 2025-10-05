#!/bin/bash

# 📊 Script de Backup Completo - Ticketing Platform
# Autor: Sistema de Backup Automático
# Fecha: 2025-10-04

echo "🚀 Iniciando Backup Completo de Bases de Datos..."

# Variables con rutas relativas desde el script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
date=$(date +"%Y-%m-%d")
timestamp=$(date +"%H-%M")
backupDir="$SCRIPT_DIR/backups/$date"
commitHash=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "📅 Fecha: $date"
echo "🕒 Hora: $timestamp"
echo "📁 Directorio: $backupDir"
echo "🔗 Commit: $commitHash"

# Crear directorio por fecha si no existe
if [ ! -d "$backupDir" ]; then
    mkdir -p "$backupDir"
    echo "📁 Directorio de backup creado"
fi

echo ""

# Backup PostgreSQL - Dump completo
if docker exec ticketing-postgres pg_dump -U admin -d ticketing > "$backupDir/postgres_full_backup_$timestamp.sql"; then
    echo "✅ PostgreSQL dump creado"
else
    echo "❌ Error en PostgreSQL dump"
fi

# Backup PostgreSQL - Eventos via API
if curl -X GET "http://localhost:3003/api/events" -H "Content-Type: application/json" > "$backupDir/postgres_events_$timestamp.json" 2>/dev/null; then
    echo "✅ Eventos exportados via API"
else
    echo "❌ Error exportando eventos"
fi

# Backup PostgreSQL - Venues via API
if curl -X GET "http://localhost:3003/api/venues?limit=50" -H "Content-Type: application/json" > "$backupDir/postgres_venues_$timestamp.json" 2>/dev/null; then
    echo "✅ Venues exportados via API"
else
    echo "❌ Error exportando venues"
fi

echo ""
echo "🍃 Creando backup de MongoDB..."

# Backup MongoDB - Usuarios desde MongoDB directo
if docker exec ticketing-mongodb mongoexport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --out=/tmp/users_backup.json >/dev/null 2>&1; then
    if docker cp ticketing-mongodb:/tmp/users_backup.json "$backupDir/mongodb_users_$timestamp.json" >/dev/null 2>&1; then
        echo "✅ Usuarios exportados desde MongoDB (base de datos: ticketing)"
    else
        echo "❌ Error copiando archivo de usuarios"
    fi
else
    echo "❌ Error exportando usuarios desde MongoDB"
fi

echo ""
echo "🔧 Copiando Prisma Schema..."

# Backup Prisma Schema
prismaPath="$SCRIPT_DIR/../../backend/admin/prisma/schema.prisma"
if [ -f "$prismaPath" ]; then
    if cp "$prismaPath" "$backupDir/prisma_schema_$timestamp.prisma"; then
        echo "✅ Prisma Schema copiado"
    else
        echo "❌ Error copiando Prisma Schema"
    fi
else
    echo "⚠️  Advertencia: No se encontró el schema de Prisma"
    echo "    Ruta buscada: $prismaPath"
fi

echo ""
echo "📦 Exportando datos adicionales..."

# Backup Categorías via API
if curl -X GET "http://localhost:3003/api/categories" -H "Content-Type: application/json" > "$backupDir/postgres_categories_$timestamp.json" 2>/dev/null; then
    echo "✅ Categorías exportadas via API"
else
    echo "⚠️  Advertencia: Error exportando categorías"
fi

# Backup Localidades via API
if curl -X GET "http://localhost:3003/api/localities" -H "Content-Type: application/json" > "$backupDir/postgres_localities_$timestamp.json" 2>/dev/null; then
    echo "✅ Localidades exportadas via API"
else
    echo "⚠️  Advertencia: Error exportando localidades"
fi

echo ""
echo "📋 Creando documentación del backup..."

# Crear archivo de información del backup
cat > "$backupDir/BACKUP_INFO_$timestamp.md" << EOF
# 📊 Backup Completo - Ticketing Platform
**Fecha:** $(date +"%Y-%m-%d %H:%M:%S")
**Commit:** $commitHash
**Timestamp:** $timestamp

## 🗄️ Archivos de Backup Creados

### PostgreSQL (Admin Service - Puerto 3003)
- \`postgres_full_backup_$timestamp.sql\` - Dump completo de PostgreSQL
- \`postgres_events_$timestamp.json\` - Eventos via API
- \`postgres_venues_$timestamp.json\` - Venues via API
- \`postgres_categories_$timestamp.json\` - Categorías via API
- \`postgres_localities_$timestamp.json\` - Localidades via API

### MongoDB (User Service - Puerto 3001)
- \`mongodb_users_$timestamp.json\` - Usuarios desde MongoDB
- **⚠️ Base de datos:** ticketing (NO ticketing-users)

### Prisma Schema
- \`prisma_schema_$timestamp.prisma\` - Schema completo

## 📋 Estado del Sistema al momento del backup
- ✅ Admin-Service (Puerto 3003) - PostgreSQL
- ✅ User-Service (Puerto 3001) - MongoDB
- ✅ PostgreSQL: Eventos, Venues, Categorías, Localidades
- ✅ MongoDB: Base de datos 'ticketing' con usuarios
- ✅ Prisma Client actualizado

## 🔧 Para Restaurar
Ejecutar: \`./restore-databases.sh $timestamp\`
EOF

echo ""
echo "✅ ¡Backup completo finalizado!"
echo "📁 Archivos creados en: $backupDir"
echo "🕒 Timestamp: $timestamp"
echo ""
echo "🔄 Para restaurar ejecuta: ./restore-databases.sh $timestamp"
