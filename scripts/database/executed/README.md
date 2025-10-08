# Scripts SQL Ejecutados

Estos archivos fueron utilizados para poblar inicialmente la base de datos.
Ya no son necesarios para el funcionamiento normal del sistema.

**Fecha de ejecución:** 2025-10-07
**Estado:** Base de datos poblada exitosamente

## Archivos:
- 01_migration_structure.sql - Estructura base
- 02_venues_europa.sql - 40 venues de Europa
- 03_venues_espana.sql - 40 venues de España
- 04-07_eventos_parte*.sql - 419 eventos en total

## Para recrear desde cero:
1. Ejecutar 01_migration_structure.sql
2. Ejecutar 02-03 para venues
3. Ejecutar 04-07 para eventos

## Mejor opción:
Usar el backup completo en: ../../docker/bd_backup/backups/2025-10-07/
