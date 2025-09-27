# 🎨 Dashboard Admin - Guía de Implementación

## 📋 Estado Actual

### ✅ Completado
- **Guards de autenticación** por roles (AdminGuard, SuperAdminGuard) ✅
- **Servicio AdminService** con todas las API calls ✅
- **Layout principal** del dashboard con sidebar responsive ✅
- **Dashboard principal** con estadísticas y métricas ✅
- **EventsListComponent** con CRUD completo ✅
- **UsersListComponent** con promoción VIP ✅
- **VenuesListComponent** con gestión completa ✅
- **SettingsComponent** para SUPER_ADMIN ✅
- **Rutas protegidas** con guards aplicados ✅
- **Estructura completa** implementada ✅

### 🚧 Próximos Pasos (Opcionales)
1. **Instalar ZardUI real** (actualmente usando Tailwind CSS)
2. **Conectar con AuthService** existente
3. **Implementar formularios modales** avanzados
4. **Añadir gráficos** con Chart.js
5. **Testing E2E** completo

## 🚀 Instalación y Setup

### **1. Navegar al directorio del frontend**
```bash
cd frontend/ticketing-app
```

### **2. Instalar ZardUI (cuando esté disponible)**
```bash
# Verificar disponibilidad de ZardUI
npm search @zardui/angular

# Si está disponible:
npm install @zardui/angular @zardui/icons

# Alternativa con componentes similares:
npm install @angular/cdk @angular/material
# o
npm install ng-zorro-antd
```

### **3. Configurar en angular.json**
```json
{
  "styles": [
    "node_modules/@zardui/themes/dist/default.css",
    "src/styles.css"
  ]
}
```

### **4. Actualizar app.config.ts**
```typescript
import { provideZardUI } from '@zardui/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    provideZardUI({
      theme: 'default',
      icons: 'lucide'
    })
  ]
};
```

## 🔐 Sistema de Autenticación

### **Flujo de Login por Roles**
```typescript
// En el componente de login, después de autenticación exitosa:
if (user.role === 'user' || user.role === 'vip') {
  // → Panel usuario normal (existente)
  this.router.navigate(['/shop']);
} else if (user.role === 'admin' || user.role === 'super_admin') {
  // → Dashboard admin
  this.router.navigate(['/admin-dashboard']);
}
```

### **Guards Implementados**
- **AdminGuard**: Permite acceso solo a ADMIN y SUPER_ADMIN
- **SuperAdminGuard**: Permite acceso solo a SUPER_ADMIN

### **Aplicar Guards a las Rutas**
```typescript
// En app.routes.ts, actualizar:
{
  path: 'admin-dashboard',
  canActivate: [AdminGuard], // ← Añadir aquí
  children: [
    {
      path: 'settings',
      canActivate: [SuperAdminGuard], // ← Y aquí
    }
  ]
}
```

## 🎨 Componentes del Dashboard

### **📊 Dashboard Principal** ✅
**Archivo**: `pages/admin/dashboard/dashboard.component.ts`
**Funcionalidades**:
- Métricas principales (eventos, usuarios, venues)
- Usuarios VIP vs normales
- Eventos recientes
- Acciones rápidas

### **🎟️ Gestión de Eventos** (Pendiente)
**Archivo**: `pages/admin/events/events-list.component.ts`
**Funcionalidades a implementar**:
- Lista de eventos con filtros
- Crear/editar eventos
- Publicar/despublicar
- Ver estadísticas

### **🏟️ Gestión de Venues** (Pendiente)
**Archivo**: `pages/admin/venues/venues-list.component.ts`
**Funcionalidades a implementar**:
- Lista de venues
- CRUD completo
- Activar/desactivar

### **👤 Gestión de Usuarios** (Pendiente)
**Archivo**: `pages/admin/users/users-list.component.ts`
**Funcionalidades a implementar**:
- Lista de usuarios con filtros
- Promoción a VIP (un click)
- Degradación de VIP
- Búsqueda avanzada

### **⚙️ Configuración** (Pendiente)
**Archivo**: `pages/admin/settings/settings.component.ts`
**Funcionalidades a implementar**:
- Gestión de administradores
- Configuración del sistema
- Logs de actividad

## 🔄 Integración con Backend

### **AdminService** ✅
**Archivo**: `core/services/admin.service.ts`
**Endpoints implementados**:

#### Events
- `getEvents()` - Lista de eventos
- `getEvent(id)` - Evento por ID
- `createEvent(event)` - Crear evento
- `updateEvent(id, event)` - Actualizar evento
- `deleteEvent(id)` - Eliminar evento

#### Venues
- `getVenues()` - Lista de venues
- `createVenue(venue)` - Crear venue
- `updateVenue(id, venue)` - Actualizar venue

#### User Management
- `getUsers()` - Lista de usuarios
- `getUserStats()` - Estadísticas de usuarios
- `promoteToVip(userId, data)` - Promocionar a VIP
- `demoteFromVip(userId, data)` - Degradar de VIP

### **URLs de Backend**
- **Admin Service**: `http://localhost:3003/api`
- **User Service**: `http://localhost:3001/api` (para gestión de usuarios)

## 📱 Diseño Responsive

### **Layout Adaptativo** ✅
- **Desktop** (>1024px): Sidebar fijo
- **Tablet** (768-1024px): Sidebar colapsable
- **Mobile** (<768px): Sidebar como drawer

### **Componentes Responsive**
- Sidebar con overlay en móvil
- Grid adaptativo para métricas
- Tablas que se convierten en cards en móvil

## 🎨 Temas y Estilos

### **Colores del Sistema**
```css
:root {
  --admin-primary: #8B5CF6;    /* Violeta para admin */
  --admin-secondary: #F59E0B;  /* Dorado para VIP */
  --admin-success: #10B981;    /* Verde para éxito */
  --admin-danger: #EF4444;     /* Rojo para peligro */
  --admin-dark: #1F2937;       /* Gris oscuro */
}
```

### **Iconos por Módulo**
- **Dashboard**: 📊
- **Events**: 🎟️
- **Venues**: 🏟️
- **Users**: 👤
- **VIP**: ⭐
- **Settings**: ⚙️

## 🚀 Comandos de Desarrollo

### **Ejecutar Frontend**
```bash
cd frontend/ticketing-app
npm start
```

### **Ejecutar con configuración admin**
```bash
ng serve --configuration=development
```

### **Build para producción**
```bash
ng build --configuration=production
```

## 🧪 Testing

### **Rutas de Prueba**
1. **Login como admin**: `http://localhost:4200/login`
2. **Dashboard admin**: `http://localhost:4200/admin-dashboard`
3. **Gestión eventos**: `http://localhost:4200/admin-dashboard/events`
4. **Gestión usuarios**: `http://localhost:4200/admin-dashboard/users`

### **Credenciales de Prueba**
```json
// Admin normal
{
  "email": "admin@ticketing.com",
  "password": "admin123"
}

// Super Admin
{
  "email": "voro.super@ticketing.com", 
  "password": "Voro123!"
}
```

## 📝 Próximas Tareas

### **Alta Prioridad**
1. **Crear EventsListComponent** con tabla de eventos
2. **Crear UsersListComponent** con promoción VIP
3. **Implementar formularios** de creación/edición
4. **Añadir guards** a las rutas protegidas

### **Media Prioridad**
5. **VenuesListComponent** con CRUD completo
6. **SettingsComponent** para super admins
7. **Notificaciones** y feedback visual
8. **Búsqueda global** en el header

### **Baja Prioridad**
9. **Gráficos** con Chart.js o similar
10. **Exportar datos** a CSV/PDF
11. **Tema oscuro** opcional
12. **PWA** para uso móvil

## 🔒 Seguridad

### **Validaciones Frontend**
- Guards en todas las rutas admin
- Validación de roles en cada acción
- Sanitización de inputs
- Tokens JWT en headers

### **Buenas Prácticas**
- Lazy loading de módulos admin
- OnPush change detection
- Manejo de errores centralizado
- Loading states en todas las operaciones

---

**Fecha de creación**: 2025-09-27  
**Estado**: 🚧 Base implementada, componentes CRUD pendientes  
**Próximo paso**: Crear componentes de gestión con ZardUI
