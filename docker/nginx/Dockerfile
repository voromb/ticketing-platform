FROM nginx:alpine

# Eliminar configuración por defecto que puede interferir
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada y script de inicio
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 9090

ENTRYPOINT ["/docker-entrypoint.sh"]
