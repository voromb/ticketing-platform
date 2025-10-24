# 🧪 GUÍA DE TESTING - PANELES DE SERVICIOS FESTIVAL

## 📋 ÍNDICE
1. [Preparación](#preparación)
2. [Testing Panel Restaurantes](#testing-panel-restaurantes)
3. [Testing Panel Viajes](#testing-panel-viajes)
4. [Testing Panel Merchandising](#testing-panel-merchandising)
5. [Checklist de Verificación](#checklist-de-verificación)

---

## 🔧 PREPARACIÓN

### Servicios Necesarios

Asegúrate de tener corriendo:

```bash
# Backend Services
cd backend/admin && npm run dev          # Puerto 3003
cd backend/user && npm run dev           # Puerto 3001
cd backend/services/festival-services && npm run dev  # Puerto 3004

# Frontend
cd frontend/ticketing-app && npm start   # Puerto 4200

# Infraestructura
docker-compose up -d  # PostgreSQL, MongoDB, RabbitMQ
```

### Credenciales de Testing

```
SUPER_ADMIN:
Email: voro.super@ticketing.com
Password: Voro123!

COMPANY_ADMIN - Restaurantes España:
Email: admin.spain.restaurants@festival.com
Password: Admin123!

COMPANY_ADMIN - Viajes España:
Email: admin.spain.travel@festival.com
Password: Admin123!

COMPANY_ADMIN - Merchandising España:
Email: admin.spain.merch@festival.com
Password: Admin123!
```

---

## 🟢 TESTING PANEL RESTAURANTES

### 1. Acceso al Panel

**URL:** `http://localhost:4200/restaurant-admin/dashboard`

**Pasos:**
1. ✅ Abrir navegador en `http://localhost:4200/login`
2. ✅ Ingresar credenciales: `admin.spain.restaurants@festival.com` / `Admin123!`
3. ✅ Verificar redirección automática a `/restaurant-admin/dashboard`
4. ✅ Verificar que el sidebar es **verde** (tema restaurantes)

**Resultado Esperado:**
- Sidebar verde con logo de restaurante
- Dashboard con 6 cards de estadísticas
- Navegación: Dashboard y Lista

---

### 2. Dashboard - Estadísticas

**URL:** `http://localhost:4200/restaurant-admin/dashboard`

**Verificar Cards:**
- ✅ **Total Restaurantes**: Muestra número total
- ✅ **Activos**: Restaurantes activos
- ✅ **Capacidad Total**: Suma de capacidades
- ✅ **Ocupación Actual**: Ocupación en tiempo real
- ✅ **Pendientes Aprobación**: Restaurantes PENDING
- ✅ **Aprobados**: Restaurantes APPROVED

**Verificar Acciones Rápidas:**
- ✅ Botón "Crear Restaurante" → Navega a `/restaurant-admin/list`
- ✅ Botón "Ver Todos" → Navega a `/restaurant-admin/list`

---

### 3. Lista de Restaurantes

**URL:** `http://localhost:4200/restaurant-admin/list`

**Verificar Filtros:**
- ✅ **Búsqueda**: Filtrar por nombre de restaurante
- ✅ **Tipo de Cocina**: Dropdown con opciones (Italiana, Mexicana, etc.)
- ✅ **Estado**: Dropdown (Abierto, Cerrado, Mantenimiento)
- ✅ **Región**: Dropdown (España, Europa)

**Verificar Tabla:**
- ✅ Columnas: Nombre, Cocina, Ubicación, Capacidad, Ocupación, Estado, Aprobación
- ✅ Datos mock cargados correctamente
- ✅ Badges de estado con colores correctos
- ✅ Badges de aprobación (PENDING=amarillo, APPROVED=verde, REJECTED=rojo)

**Verificar Acciones:**
- ✅ Hover en filas cambia color de fondo
- ✅ Responsive design funciona en móvil

---

## 🔵 TESTING PANEL VIAJES

### 1. Acceso al Panel

**URL:** `http://localhost:4200/travel-admin/dashboard`

**Pasos:**
1. ✅ Logout del panel anterior
2. ✅ Login con: `admin.spain.travel@festival.com` / `Admin123!`
3. ✅ Verificar redirección automática a `/travel-admin/dashboard`
4. ✅ Verificar que el sidebar es **azul** (tema viajes)

**Resultado Esperado:**
- Sidebar azul con icono de autobús
- Dashboard con 6 cards de estadísticas
- Navegación: Dashboard y Viajes

---

### 2. Dashboard - Estadísticas

**URL:** `http://localhost:4200/travel-admin/dashboard`

**Verificar Cards:**
- ✅ **Total Viajes**: Muestra número total
- ✅ **Activos**: Viajes activos
- ✅ **Capacidad Total**: Suma de plazas
- ✅ **Plazas Reservadas**: Reservas actuales
- ✅ **Pendientes Aprobación**: Viajes PENDING
- ✅ **Aprobados**: Viajes APPROVED

**Verificar Acciones Rápidas:**
- ✅ Botón "Crear Viaje" → Navega a `/travel-admin/list`
- ✅ Botón "Ver Todos" → Navega a `/travel-admin/list`

---

### 3. Lista de Viajes

**URL:** `http://localhost:4200/travel-admin/list`

**Verificar Filtros:**
- ✅ **Búsqueda**: Filtrar por nombre de viaje
- ✅ **Tipo de Vehículo**: Dropdown (Autobús, Minibús, Van)
- ✅ **Estado**: Dropdown (Programado, En curso, Completado, Cancelado)

**Verificar Tabla:**
- ✅ Columnas: Nombre, Origen, Destino, Vehículo, Capacidad, Reservados, Estado, Aprobación
- ✅ Datos mock cargados correctamente
- ✅ Badges de estado con colores correctos
- ✅ Información de plazas (X/Y formato)

---

## 🟣 TESTING PANEL MERCHANDISING

### 1. Acceso al Panel

**URL:** `http://localhost:4200/merchandising-admin/dashboard`

**Pasos:**
1. ✅ Logout del panel anterior
2. ✅ Login con: `admin.spain.merch@festival.com` / `Admin123!`
3. ✅ Verificar redirección automática a `/merchandising-admin/dashboard`
4. ✅ Verificar que el sidebar es **morado** (tema merchandising)

**Resultado Esperado:**
- Sidebar morado con icono de caja
- Dashboard con 6 cards de estadísticas
- Navegación: Dashboard y Productos

---

### 2. Dashboard - Estadísticas

**URL:** `http://localhost:4200/merchandising-admin/dashboard`

**Verificar Cards:**
- ✅ **Total Productos**: Muestra número total
- ✅ **Stock Disponible**: Stock total disponible
- ✅ **Unidades Vendidas**: Total de ventas
- ✅ **Ingresos Totales**: Suma de ventas en €
- ✅ **Pendientes Aprobación**: Productos PENDING
- ✅ **Aprobados**: Productos APPROVED

**Verificar Acciones Rápidas:**
- ✅ Botón "Crear Producto" → Navega a `/merchandising-admin/list`
- ✅ Botón "Ver Todos los Productos" → Navega a `/merchandising-admin/list`

---

### 3. Lista de Productos

**URL:** `http://localhost:4200/merchandising-admin/list`

**Verificar Filtros:**
- ✅ **Búsqueda**: Filtrar por nombre de producto
- ✅ **Tipo**: Dropdown (Ropa, Accesorios, Vinilos, CDs, Pósters, Otros)
- ✅ **Estado**: Dropdown (Disponible, Agotado, Próximamente, Descontinuado)

**Verificar Tabla:**
- ✅ Columnas: Producto (con imagen), Tipo, Precio, Stock, Vendidos, Estado, Aprobación
- ✅ Imágenes placeholder cargadas
- ✅ Datos mock cargados correctamente
- ✅ Información de stock (Disponible/Total + Reservados)
- ✅ Badges de estado con colores correctos

---

## ✅ CHECKLIST DE VERIFICACIÓN GENERAL

### Funcionalidades Comunes

**Navegación:**
- ✅ Sidebar se puede colapsar/expandir
- ✅ Rutas funcionan correctamente
- ✅ Botón de logout funciona
- ✅ Información de usuario se muestra en sidebar

**Diseño:**
- ✅ Tema oscuro (bg-slate-900) consistente
- ✅ Colores temáticos correctos (verde/azul/morado)
- ✅ Cards con sombras y bordes redondeados
- ✅ Responsive design funciona en diferentes tamaños

**Rendimiento:**
- ✅ Datos se cargan automáticamente (sin necesidad de click)
- ✅ Detección de cambios funciona correctamente
- ✅ No hay errores en consola del navegador
- ✅ Loading states se muestran durante carga

**Datos Mock:**
- ✅ Restaurantes: 4 ejemplos con diferentes estados
- ✅ Viajes: 4 ejemplos con diferentes estados
- ✅ Productos: 4 ejemplos con diferentes estados

---

## 🐛 PROBLEMAS CONOCIDOS

### Warnings de Accesibilidad (No críticos)
- Select elements sin `title` attribute
- Form elements sin `label` explícito
- **Impacto:** Solo warnings de linting, no afectan funcionalidad

### Próximas Mejoras
- [ ] Conectar con API real del backend
- [ ] Implementar modales de creación/edición
- [ ] Añadir validaciones de formularios
- [ ] Implementar paginación en tablas
- [ ] Añadir exportación de datos

---

## 📊 RESULTADOS ESPERADOS

### ✅ Todo Funciona Correctamente Si:

1. **Los 3 paneles cargan sin errores**
2. **Las estadísticas se muestran correctamente**
3. **Los filtros funcionan**
4. **Los datos mock se visualizan en las tablas**
5. **Los colores temáticos son correctos**
6. **La navegación entre páginas funciona**
7. **El sidebar se puede colapsar/expandir**
8. **No hay errores en la consola del navegador**

---

## 🎯 SIGUIENTE PASO

Una vez verificado todo lo anterior, el sistema está listo para:

1. **Conectar con el backend real**
2. **Implementar funcionalidades CRUD completas**
3. **Añadir sistema de notificaciones**
4. **Integrar con RabbitMQ para aprobaciones**

---

**Fecha de Testing:** {{ FECHA }}  
**Testeado por:** {{ NOMBRE }}  
**Resultado:** ✅ APROBADO / ❌ FALLOS ENCONTRADOS
