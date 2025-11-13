# Cambios de Configuración Ollama

## 📅 Fecha: 13 de Noviembre de 2025

## 🔄 Cambio Realizado

Se ha migrado la configuración de Ollama de **DynDNS** a **OpenWeb VPS**.

### Antes:
```
http://voro-moran.dyndns.org:11434
```

### Después:
```
http://openweb.voro-moran.com/api
```

## 🎯 Razón del Cambio

- **Problema**: El puerto 11434 está bloqueado por el firewall de Conselleria
- **Solución**: Usar el VPS de Hetzner con proxy inverso Nginx
- **Ventaja**: Accesible desde cualquier red (Conselleria, WiFi móvil, etc.)

## 📝 Archivos Modificados

### Configuración Docker:
1. ✅ `/docker/nginx/nginx.conf`
   - Upstream ollama: `openweb.voro-moran.com:80`
   - Host header: `openweb.voro-moran.com`

2. ✅ `/docker/nginx/docker-entrypoint.sh`
   - Variable `OLLAMA_HOST="openweb.voro-moran.com"`

### Configuración Frontend:
3. ✅ `/frontend/ticketing-app/proxy.conf.json`
   - Target: `http://openweb.voro-moran.com`

### Documentación:
4. ✅ `DEPLOY.md`
5. ✅ `DOCS.md`
6. ✅ `docs/ia/inicio-rapido.md`

## 🔧 Configuración del VPS (Hetzner)

Se añadió en `/etc/nginx/sites-enabled/default`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name openweb.voro-moran.com;
    
    # OpenWebUI
    location / {
        proxy_pass http://127.0.0.1:8080;
        # ... configuración WebSocket
    }
    
    # API de Ollama (NUEVO)
    location /api/ {
        proxy_pass http://127.0.0.1:11434/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_read_timeout 300s;
        client_max_body_size 100M;
    }
}
```

## ✅ Verificación

```bash
# Test desde cualquier red
curl http://openweb.voro-moran.com/api/tags

# Test desde la aplicación
curl -X POST http://localhost:9090/api/ollama/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"search-nlp-v2","prompt":"thrash metal valencia","stream":false}'
```

## 🚀 Estado Actual

- ✅ Ollama funcionando en VPS Hetzner
- ✅ Proxy inverso configurado en Nginx
- ✅ Accesible desde cualquier red
- ✅ Search con IA operativo
- ✅ Chat con IA operativo
- ✅ Merchandising cargando correctamente
- ✅ MongoDB festival-services conectado

## 📌 Notas Importantes

- El DynDNS (`voro-moran.dyndns.org:11434`) sigue funcionando desde redes que no bloquean el puerto
- OpenWeb (`openweb.voro-moran.com/api`) funciona desde **cualquier red**
- La aplicación ahora usa OpenWeb por defecto para máxima compatibilidad
