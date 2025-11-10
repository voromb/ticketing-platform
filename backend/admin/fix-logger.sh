#!/bin/bash

# Arreglar todos los logger.error en controllers
for file in src/controllers/*.ts; do
    if [ -f "$file" ]; then
        # Reemplazar logger.error('mensaje', error) por logger.error({ err: error }, 'mensaje')
        sed -i "s/logger\.error('\([^']*\)', error)/logger.error({ err: error }, '\1')/g" "$file"
        sed -i 's/logger\.error("\([^"]*\)", error)/logger.error({ err: error }, "\1")/g' "$file"
        sed -i 's/logger\.error(`\([^`]*\)`, error)/logger.error({ err: error }, `\1`)/g' "$file"
        
        # Reemplazar logger.error('mensaje:', error) por logger.error({ err: error }, 'mensaje')
        sed -i "s/logger\.error('\([^']*\):', error)/logger.error({ err: error }, '\1')/g" "$file"
        sed -i 's/logger\.error("\([^"]*\):", error)/logger.error({ err: error }, "\1")/g' "$file"
        sed -i 's/logger\.error(`\([^`]*\):`, error)/logger.error({ err: error }, `\1`)/g' "$file"
    fi
done

echo "Logger errors fixed!"
