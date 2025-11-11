#!/bin/sh
set -e

# Resolver el dominio dinámico y guardarlo
OLLAMA_IP=$(getent hosts voro-moran.dyndns.org | awk '{ print $1 }' | head -n1)

if [ -z "$OLLAMA_IP" ]; then
    echo "⚠️ No se pudo resolver voro-moran.dyndns.org, usando IP por defecto"
    OLLAMA_IP="92.172.161.69"
fi

echo "✅ Ollama resuelto a: $OLLAMA_IP"

# Reemplazar en la configuración
sed -i "s/OLLAMA_HOST_PLACEHOLDER/$OLLAMA_IP/g" /etc/nginx/nginx.conf

# Iniciar Nginx
exec nginx -g 'daemon off;'
