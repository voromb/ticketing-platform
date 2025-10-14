# cSpell:ignore nestjs nodejs addgroup adduser chown
# Dockerfile para Festival Services (NestJS) - Imagen base más segura
FROM node:18.18.2-alpine3.18

# Actualizar paquetes del sistema por seguridad y instalar herramientas necesarias
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        dumb-init \
        ca-certificates \
        && rm -rf /var/cache/apk/*

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Establecer directorio de trabajo
WORKDIR /app

# Cambiar permisos del directorio
RUN chown -R nestjs:nodejs /app
USER nestjs

# Copiar archivos de dependencias
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs prisma ./prisma/

# Instalar dependencias
RUN npm ci && \
    npm cache clean --force

# Generar cliente Prisma
RUN npx prisma generate

# Copiar código fuente
COPY --chown=nestjs:nodejs . .

# Compilar la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3004

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Usar dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]