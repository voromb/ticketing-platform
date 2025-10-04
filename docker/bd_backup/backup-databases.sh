#!/bin/bash

# 📊 Script de Backup Completo - Ticketing Platform
# Autor: Sistema de Backup Automático
# Fecha: 2025-10-04

echo "🚀 Iniciando Backup Completo de Bases de Datos..."

# Variables
date=$(date +"%Y-%m-%d")
timestamp=$(date +"%H-%M")
backupDir="backups/$date"
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
if docker exec ticketing-postgres pg_dump -U admin -d ticketing > "$backup_dir/postgres_full_backup_$timestamp.sql"; then
    echo "✅ PostgreSQL dump creado"
else
    echo "❌ Error en PostgreSQL dump"
fi

# Backup PostgreSQL - Eventos via API
if curl -X GET "http://localhost:3003/api/events" -H "Content-Type: application/json" > "$backup_dir/postgres_events_$timestamp.json" 2>/dev/null; then
    echo "✅ Eventos exportados via API"
else
    echo "❌ Error exportando eventos"
fi

# Backup PostgreSQL - Venues via API
if curl -X GET "http://localhost:3003/api/venues?limit=50" -H "Content-Type: application/json" > "$backup_dir/postgres_venues_$timestamp.json" 2>/dev/null; then
    echo "✅ Venues exportados via API"
else
    echo "❌ Error exportando venues"
fi

echo ""
echo "🍃 Creando backup de MongoDB..."

# Backup MongoDB - Usuarios via API
if curl -X GET "http://localhost:3001/api/users" -H "Content-Type: application/json" > "$backup_dir/mongodb_users_$timestamp.json" 2>/dev/null; then
    echo "✅ Usuarios exportados via API"
else
    echo "❌ Error exportando usuarios"
fi

echo ""
echo "🔧 Copiando Prisma Schema..."

# Backup Prisma Schema
if cp "backend/admin/prisma/schema.prisma" "$backup_dir/prisma_schema_$timestamp.prisma"; then
    echo "✅ Prisma Schema copiado"
else
    echo "❌ Error copiando Prisma Schema"
fi

echo ""
echo "📋 Creando documentación del backup..."

# Crear archivo de información del backup
cat > "$backup_dir/BACKUP_INFO_$timestamp.md" << EOF
# 📊 Backup Completo - Ticketing Platform
**Fecha:** $(date +"%Y-%m-%d %H:%M:%S")
**Commit:** $commit_hash
**Timestamp:** $timestamp

## 🗄️ Archivos de Backup Creados

### PostgreSQL (Admin Service)
- \`postgres_full_backup_$timestamp.sql\` - Dump completo de PostgreSQL
- \`postgres_events_$timestamp.json\` - Eventos via API
- \`postgres_venues_$timestamp.json\` - Venues via API

### MongoDB (User Service)  
- \`mongodb_users_$timestamp.json\` - Usuarios via API

### Prisma Schema
- \`prisma_schema_$timestamp.prisma\` - Schema completo

## 📋 Estado del Sistema al momento del backup
- Admin-Service (Puerto 3003)
- User-Service (Puerto 3001) 
- PostgreSQL con 8 modelos sincronizados
- MongoDB con rol 'admin' soportado
- Prisma Client actualizado

## 🔧 Para Restaurar
Ejecutar: \`./restore-databases.sh $timestamp\`
EOF

echo ""
echo "✅ ¡Backup completo finalizado!"
echo "📁 Archivos creados en: $backup_dir"
echo "🕒 Timestamp: $timestamp"
echo ""
echo "🔄 Para restaurar ejecuta: ./restore-databases.sh $timestamp"
