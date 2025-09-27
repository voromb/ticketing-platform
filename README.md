#  Plataforma de Ticketing Rock/Metal

Una plataforma completa de venta de tickets especializada en eventos de rock y metal, construida con arquitectura de microservicios.

##  Arquitectura

### Microservicios
- **Admin Service** (Puerto 3003): PostgreSQL - Gestión de eventos, venues y administradores
- **User Service** (Puerto 3001): MongoDB - Gestión de usuarios y sistema VIP
- **Frontend Angular** (Puerto 4200): Dashboard administrativo y interfaz de usuario

### Tecnologías
- **Backend**: Node.js, Express, PostgreSQL, MongoDB
- **Frontend**: Angular 17+, TypeScript, Tailwind CSS
- **Autenticación**: JWT
- **Comunicación**: REST APIs entre microservicios

##  Características Implementadas

### Sistema de Roles
- **NO REGISTRADO**: Acceso básico
- **USER**: Usuario registrado
- **VIP**: Usuario premium con beneficios especiales
- **ADMIN**: Administrador con acceso al dashboard
- **SUPER_ADMIN**: Administrador con permisos completos

### Dashboard Administrativo
-  Estadísticas en tiempo real
-  Gestión completa de eventos (CRUD)
-  Gestión de usuarios con promoción VIP
-  Gestión de venues (CRUD)
-  Navbar dinámico según rol de usuario
-  Autenticación JWT integrada

### Datos de Ejemplo
- **6 Eventos**: Metallica, Iron Maiden, Nightwish, Sabaton, Dream Theater, Epica
- **10 Venues**: Estadios y arenas especializados en rock/metal
- **3 Usuarios**: Incluyendo usuario VIP (Xavi)

##  Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- MongoDB
- Angular CLI

### Backend - Admin Service
```bash
cd backend/admin
npm install
npm run dev
```

### Backend - User Service
```bash
cd backend/user
npm install
npm start
```

### Frontend
```bash
cd frontend/ticketing-app
npm install
npm start
```

##  Usuarios de Prueba

### Super Administrador
- **Email**: voro.super@ticketing.com
- **Password**: Voro123!
- **Rol**: SUPER_ADMIN

### Usuario VIP
- **Email**: xavi.vip@ticketing.com
- **Password**: Xavi123!
- **Rol**: VIP

##  Endpoints Principales

### Admin Service (Puerto 3003)
- `GET /api/events` - Listar eventos
- `POST /api/events` - Crear evento
- `GET /api/venues?isActive=true` - Listar venues activos
- `GET /api/user-management/stats` - Estadísticas de usuarios

### User Service (Puerto 3001)
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/users/profile` - Perfil de usuario

##  FuncionalidadesDestacadas

### Comunicación Entre Microservicios
- User Service consulta eventos del Admin Service
- Admin Service gestiona promociones VIP en User Service
- Comunicación bidireccional sin errores

### Dashboard Responsivo
- diseño moderno con Tailwind CSS
- Componentes standalone de Angular
- Lazy loading de módulos
- Guards de seguridad por roles

### Sistema VIP
- Promoción de usuarios a VIP desde el dashboard
- Beneficios especiales para usuarios VIP
- Gestión completa desde interfaz administrativa

##  Estado del Proyecto

**Backend microservicios**: Completamente funcional
**Frontend dashboard**: Operativo al 100%
**Autenticación JWT**: Implementada y probada
**Sistema de roles**: Funcionando correctamente
**Comunicación entre servicios**: Sin errores
**Datos de ejemplo**: 6 eventos, 10 venues, 3 usuarios
**Sistema VIP**: Operativo

##  Soluciones Técnicas Implementadas

### Problema de Detección de Cambios (Angular)
**Solución**: Uso de `ChangeDetectorRef` con `setTimeout` para forzar actualización de UI

### Autenticación Dual
**Solución**: Sistema que intenta login en Admin Service y fallback a User Service

### Navbar Dinámico
**Solución**: Getters reactivos basados en estado de usuario actual

##  Próximos Pasos

- [ ] Implementar sistema de compra de tickets
- [ ] Añadir pasarela de pagos
- [ ] Sistema de notificaciones
- [ ] Panel de usuario final
- [ ] Reportes avanzados

---
**Desarrollado con  para la comunidad rock/metal** 