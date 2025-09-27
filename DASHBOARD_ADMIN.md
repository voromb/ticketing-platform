# 🎨 Dashboard Admin - ZardUI Integration

## 📋 Objetivo
Crear un dashboard administrativo profesional usando ZardUI para gestionar toda la plataforma de ticketing desde una interfaz moderna y funcional.

## 🏗️ Arquitectura del Dashboard

### **Sistema de Roles y Navegación**
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND ANGULAR                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │   USER PANEL    │              │  ADMIN DASHBOARD │      │
│  │   (Existente)   │              │   (ZardUI)      │      │
│  │                 │              │                 │      │
│  │ • Ver eventos   │              │ 🎟️ Events CRUD  │      │
│  │ • Comprar       │              │ 🏟️ Venues CRUD  │      │
│  │ • Mis tickets   │              │ 👤 Users Mgmt   │      │
│  │                 │              │ 📊 Statistics   │      │
│  └─────────────────┘              │ ⭐ VIP Promotion│      │
│                                   └─────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Sistema de Autenticación y Guards

### **Flujo de Autenticación por Roles**
```typescript
// Después del login exitoso
if (user.role === 'user' || user.role === 'vip') {
  // → Panel usuario normal (existente)
  router.navigate(['/user-dashboard']);
} else if (user.role === 'admin' || user.role === 'super_admin') {
  // → Dashboard admin con ZardUI
  router.navigate(['/admin-dashboard']);
}
```

### **Guards de Protección**
- **AdminGuard**: Solo permite acceso a ADMIN y SUPER_ADMIN
- **SuperAdminGuard**: Solo permite acceso a SUPER_ADMIN
- **RoleGuard**: Guard genérico configurable por roles

## 📦 Instalación y Setup

### **1. Instalar ZardUI**
```bash
cd frontend/ticketing-app
npm install @zardui/angular
npm install @zardui/icons
npm install @zardui/themes
```

### **2. Configurar en angular.json**
```json
{
  "styles": [
    "node_modules/@zardui/themes/dist/default.css",
    "src/styles.css"
  ]
}
```

### **3. Importar en app.config.ts**
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

## 🎨 Módulos del Dashboard

### **📊 Dashboard Principal**
**Ruta**: `/admin-dashboard`
**Componentes**:
- Métricas principales (eventos, usuarios, ventas)
- Gráficos de estadísticas
- Eventos próximos
- Actividad reciente
- Usuarios VIP recientes

### **🎟️ Gestión de Eventos**
**Ruta**: `/admin-dashboard/events`
**Funcionalidades**:
- Lista de eventos con filtros y búsqueda
- Crear nuevo evento (formulario completo)
- Editar evento existente
- Publicar/despublicar eventos
- Ver estadísticas por evento
- Gestión de tickets disponibles

### **🏟️ Gestión de Venues**
**Ruta**: `/admin-dashboard/venues`
**Funcionalidades**:
- Lista de venues con filtros
- Crear nuevo venue
- Editar venue existente
- Activar/desactivar venues
- Ver eventos por venue

### **👤 Gestión de Usuarios**
**Ruta**: `/admin-dashboard/users`
**Funcionalidades**:
- Lista de usuarios con filtros avanzados
- Búsqueda por nombre, email, rol
- Promocionar usuario a VIP (un click)
- Degradar VIP a usuario normal
- Ver historial de actividad
- Estadísticas de usuarios

### **⚙️ Configuración**
**Ruta**: `/admin-dashboard/settings`
**Funcionalidades**:
- Gestión de administradores (solo SUPER_ADMIN)
- Configuración del sistema
- Logs de actividad
- Backup y restauración

## 🎯 Componentes ZardUI Utilizados

### **Layout y Navegación**
- `zui-sidebar`: Navegación lateral
- `zui-header`: Barra superior
- `zui-breadcrumb`: Navegación de migas
- `zui-layout`: Layout principal

### **Datos y Tablas**
- `zui-table`: Tablas con paginación y filtros
- `zui-data-grid`: Grid avanzado para datos
- `zui-search`: Búsqueda global
- `zui-filter`: Filtros avanzados

### **Formularios**
- `zui-form`: Formularios reactivos
- `zui-input`: Campos de entrada
- `zui-select`: Selectores
- `zui-date-picker`: Selector de fechas
- `zui-file-upload`: Subida de archivos

### **Visualización**
- `zui-card`: Tarjetas de información
- `zui-chart`: Gráficos y estadísticas
- `zui-badge`: Badges de estado
- `zui-progress`: Barras de progreso

### **Interacción**
- `zui-button`: Botones con estilos
- `zui-modal`: Modales y diálogos
- `zui-toast`: Notificaciones
- `zui-dropdown`: Menús desplegables

## 🔄 Integración con Backend

### **Servicios Angular**
```typescript
// AdminService - Comunicación con admin-service (3003)
@Injectable()
export class AdminService {
  private baseUrl = 'http://localhost:3003/api';
  
  // Events
  getEvents() { return this.http.get(`${this.baseUrl}/events`); }
  createEvent(event) { return this.http.post(`${this.baseUrl}/events`, event); }
  
  // Venues
  getVenues() { return this.http.get(`${this.baseUrl}/venues`); }
  
  // Users Management
  getUsers() { return this.http.get(`${this.baseUrl}/user-management`); }
  promoteToVip(userId, data) { 
    return this.http.post(`${this.baseUrl}/user-management/${userId}/promote`, data); 
  }
}
```

### **Interceptors**
- **AuthInterceptor**: Añade JWT token automáticamente
- **ErrorInterceptor**: Manejo centralizado de errores
- **LoadingInterceptor**: Indicadores de carga

## 📱 Responsive Design

### **Breakpoints**
- **Desktop**: > 1024px - Sidebar completo
- **Tablet**: 768px - 1024px - Sidebar colapsable
- **Mobile**: < 768px - Sidebar como drawer

### **Adaptaciones Móviles**
- Tablas se convierten en cards
- Formularios en pasos (wizard)
- Navegación como bottom tabs
- Gráficos optimizados para touch

## 🎨 Temas y Personalización

### **Tema Principal**
```css
:root {
  --zui-primary: #8B5CF6; /* Violeta para rock/metal */
  --zui-secondary: #F59E0B; /* Dorado para VIP */
  --zui-success: #10B981;
  --zui-danger: #EF4444;
  --zui-dark: #1F2937;
}
```

### **Colores por Módulo**
- **Events**: Violeta (#8B5CF6)
- **Venues**: Azul (#3B82F6)
- **Users**: Verde (#10B981)
- **VIP**: Dorado (#F59E0B)

## 📊 Métricas y Analytics

### **Dashboard Principal**
- Total de eventos activos
- Usuarios registrados (user vs vip)
- Ventas del mes
- Eventos próximos (7 días)
- Top venues por eventos

### **Gráficos Implementados**
- Ventas por mes (línea)
- Usuarios por rol (dona)
- Eventos por venue (barras)
- Actividad por día (área)

## 🔒 Seguridad

### **Validaciones Frontend**
- Todos los formularios con validación reactiva
- Sanitización de inputs
- Validación de roles en cada acción

### **Protección de Rutas**
```typescript
// Rutas protegidas por rol
{
  path: 'admin-dashboard',
  canActivate: [AdminGuard],
  children: [
    { path: 'users', canActivate: [SuperAdminGuard] },
    { path: 'settings', canActivate: [SuperAdminGuard] }
  ]
}
```

## 🚀 Performance

### **Optimizaciones**
- Lazy loading de módulos
- OnPush change detection
- Virtual scrolling para listas grandes
- Caching de datos frecuentes
- Debounce en búsquedas

### **Bundle Splitting**
- Core module (shared)
- Admin module (lazy)
- User module (lazy)
- Vendor libraries

## 📝 Testing

### **Unit Tests**
- Componentes con TestBed
- Servicios con HttpClientTestingModule
- Guards con RouterTestingModule

### **E2E Tests**
- Flujos completos de CRUD
- Autenticación por roles
- Responsive design

## 🔧 Configuración de Desarrollo

### **Comandos NPM**
```json
{
  "scripts": {
    "start": "ng serve",
    "start:admin": "ng serve --configuration=admin",
    "build:admin": "ng build --configuration=admin",
    "test:admin": "ng test --include='**/admin/**/*.spec.ts'"
  }
}
```

### **Environments**
```typescript
// environment.admin.ts
export const environment = {
  production: false,
  adminMode: true,
  apiUrl: 'http://localhost:3003/api',
  userApiUrl: 'http://localhost:3001/api'
};
```

## 📚 Documentación de Uso

### **Para Administradores**
1. **Login**: Usar credenciales de admin/super_admin
2. **Dashboard**: Vista general del sistema
3. **Eventos**: Crear y gestionar eventos
4. **Venues**: Administrar lugares
5. **Usuarios**: Promocionar a VIP

### **Para Super Administradores**
- Todas las funciones de admin
- Gestión de otros administradores
- Configuración del sistema
- Acceso a logs y métricas avanzadas

---

**Fecha de creación**: 2025-09-27  
**Estado**: 🚧 En desarrollo  
**Próximos pasos**: Implementación de componentes ZardUI
