#!/bin/sh
set -e

# Usar el dominio openweb que tiene el proxy configurado
OLLAMA_HOST="openweb.voro-moran.com"

echo "✅ Usando Ollama en: $OLLAMA_HOST"

# Reemplazar en la configuración
sed -i "s/OLLAMA_HOST_PLACEHOLDER/$OLLAMA_HOST/g" /etc/nginx/nginx.conf

# Iniciar Nginx
exec nginx -g 'daemon off;'
