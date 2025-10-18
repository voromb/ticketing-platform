# 🎉 Funcionalidades Sociales - Ticketing Platform

## 📋 Resumen

Se han implementado las funcionalidades de **Like**, **Follow** y **Comentarios** en la plataforma de ticketing. Estas características permiten a los usuarios interactuar socialmente con eventos y otros usuarios.

## 🏗️ Arquitectura

### Backend Services

#### User Service (MongoDB)
- **Ubicación**: `backend/user-service/`
- **Base de datos**: MongoDB
- **Funcionalidades**:
  - Gestión de likes en eventos
  - Sistema de follows entre usuarios
  - Comentarios en eventos con respuestas
  - Estadísticas sociales

#### Admin Service (PostgreSQL)
- **Ubicación**: `backend/admin/`
- **Base de datos**: PostgreSQL + Prisma
- **Funcionalidades**:
  - Integración con estadísticas sociales
  - Servicio de comunicación con User Service

### Frontend (Angular)
- **Ubicación**: `frontend/ticketing-app/`
- **Componentes**:
  - `SocialInteractionsComponent`: Likes y comentarios
  - `UserSocialStatsComponent`: Estadísticas de usuario

## 📊 Modelos de Datos

### EventLike
```typescript
{
  userId: string;      // ID del usuario
  eventId: string;     // ID del evento
  createdAt: Date;     // Fecha de creación
}
```

### UserFollow
```typescript
{
  followerId: string;  // Usuario que sigue
  followingId: string; // Usuario seguido
  createdAt: Date;     // Fecha de creación
}
```

### EventComment
```typescript
{
  userId: string;           // ID del usuario
  eventId: string;          // ID del evento
  content: string;         // Contenido del comentario
  parentCommentId?: string; // ID del comentario padre (para respuestas)
  isEdited: boolean;       // Si fue editado
  isDeleted: boolean;       // Si fue eliminado
  likes: string[];          // Array de IDs de usuarios que dieron like
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de actualización
}
```

## 🚀 API Endpoints

### Likes
- `POST /api/social/events/:eventId/like` - Dar/quitar like a evento
- `GET /api/social/events/:eventId/likes` - Obtener estadísticas de likes

### Follows
- `POST /api/social/users/follow` - Seguir/dejar de seguir usuario
- `GET /api/social/users/:userId/follow-stats` - Estadísticas de follows
- `GET /api/social/users/:userId/followers` - Lista de seguidores
- `GET /api/social/users/:userId/following` - Lista de usuarios seguidos

### Comentarios
- `POST /api/social/events/comments` - Crear comentario
- `GET /api/social/events/:eventId/comments` - Obtener comentarios
- `PUT /api/social/comments/:commentId` - Actualizar comentario
- `DELETE /api/social/comments/:commentId` - Eliminar comentario
- `POST /api/social/comments/:commentId/like` - Dar like a comentario

## 🎨 Componentes Frontend

### SocialInteractionsComponent
```typescript
// Uso en template
<app-social-interactions 
  [eventId]="event.id"
  (onLoginRequired)="handleLoginRequired()">
</app-social-interactions>
```

**Características**:
- Botón de like con contador
- Formulario para agregar comentarios
- Lista de comentarios con respuestas
- Sistema de likes en comentarios
- Paginación de comentarios

### UserSocialStatsComponent
```typescript
// Uso en template
<app-user-social-stats 
  [userId]="user.id"
  [showFollowButton]="true"
  (onLoginRequired)="handleLoginRequired()">
</app-user-social-stats>
```

**Características**:
- Contador de seguidores y siguiendo
- Botón para seguir/dejar de seguir
- Promoción para iniciar sesión

## 🔧 Configuración

### Variables de Entorno

#### User Service
```env
MONGODB_URI=mongodb://localhost:27017/ticketing-platform
JWT_SECRET=tu-jwt-secret
PORT=3001
```

#### Admin Service
```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/ticketing_platform
USER_SERVICE_URL=http://localhost:3001
```

#### Frontend
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3003/api',
  userApiUrl: 'http://localhost:3001/api'
};
```

## 📱 Uso en el Frontend

### 1. Importar el servicio
```typescript
import { SocialService } from './core/services/social.service';

constructor(private socialService: SocialService) {}
```

### 2. Usar en componentes
```typescript
// Dar like a un evento
this.socialService.likeEvent(eventId).subscribe(response => {
  console.log('Like toggled:', response);
});

// Seguir a un usuario
this.socialService.followUser(userId).subscribe(response => {
  console.log('Follow toggled:', response);
});

// Crear comentario
this.socialService.createComment(eventId, content).subscribe(response => {
  console.log('Comment created:', response);
});
```

### 3. Integrar componentes
```html
<!-- En la página de detalle del evento -->
<app-social-interactions 
  [eventId]="event.id"
  (onLoginRequired)="redirectToLogin()">
</app-social-interactions>

<!-- En el perfil de usuario -->
<app-user-social-stats 
  [userId]="user.id"
  [showFollowButton]="!isOwnProfile">
</app-user-social-stats>
```

## 🔒 Autenticación

Todas las funcionalidades sociales requieren autenticación:
- Los usuarios deben estar logueados para dar likes, seguir usuarios o comentar
- Se utiliza JWT para la autenticación
- Los componentes muestran prompts para iniciar sesión cuando es necesario

## 📈 Estadísticas

### Eventos
- Contador de likes
- Contador de comentarios
- Estado de like del usuario actual

### Usuarios
- Contador de seguidores
- Contador de usuarios seguidos
- Estado de follow del usuario actual

## 🚀 Próximos Pasos

1. **Notificaciones**: Implementar notificaciones cuando alguien da like o comenta
2. **Feed Social**: Crear un feed con actividades de usuarios seguidos
3. **Moderación**: Sistema de moderación de comentarios
4. **Analytics**: Dashboard con estadísticas sociales
5. **Push Notifications**: Notificaciones push para interacciones sociales

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión entre servicios**
   - Verificar que ambos servicios estén ejecutándose
   - Comprobar las URLs en las variables de entorno

2. **Problemas de autenticación**
   - Verificar que el JWT sea válido
   - Comprobar que el usuario esté autenticado

3. **Errores de base de datos**
   - Verificar conexión a MongoDB (User Service)
   - Verificar conexión a PostgreSQL (Admin Service)

### Logs Útiles
```bash
# User Service logs
tail -f logs/user-service.log

# Admin Service logs  
tail -f logs/admin-service.log
```

## 📞 Soporte

Para problemas o preguntas sobre las funcionalidades sociales, contactar al equipo de desarrollo.
