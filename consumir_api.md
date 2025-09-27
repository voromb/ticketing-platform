# API de Ticketing Platform - Rock/Metal Events

Documentación para usar las APIs en Postman e Insomnia.

**Health Check:** `http://localhost:3003/health`

## Ejemplos Completos para Insomnia

### VENUES - Todos los métodos HTTP
- `base_url`: `http://localhost:3003`
- `token`: (se llenará después del login)

### Paso 2: Configurar Autenticación
1. Ejecuta la ruta de login
2. Copia el token de la respuesta
3. En las rutas protegidas usa: `Bearer {{token}}`

## Autenticación

### Obtener Token
**Método:** POST  
**URL:** `{{base_url}}/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "email": "admin@ticketing.com",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "467a0b9f-5cd9-46b0-8905-621bc92a8664",
    "email": "admin@ticketing.com",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

## API de Venues

### 1. Listar Venues
**Método:** GET  
**URL:** `{{base_url}}/api/venues?isActive=true`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**Nota:** Es necesario usar el filtro `?isActive=true` para ver los venues activos.

**Respuesta:**
```json
{
  "venues": [
    {
      "id": "8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9",
      "name": "Recinto Ferial Valencia Rock",
      "capacity": 15000,
      "city": "Valencia"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

### 2. Crear Venue
**Método:** POST  
**URL:** `{{base_url}}/api/venues`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Nuevo Venue Rock",
  "slug": "nuevo-venue-rock",
  "capacity": 2000,
  "address": "Calle Rock 123",
  "city": "Valencia",
  "state": "Valencia",
  "country": "España",
  "postalCode": "46001",
  "description": "Venue especializado en rock y metal",
  "amenities": ["parking", "bar", "merchandise"]
}
```

## API de Eventos Rock/Metal

### 1. Listar Eventos
**Método:** GET  
**URL:** `{{base_url}}/api/events`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1eadb7d9-3b10-4254-8d0f-74b9ae9cf8eb",
      "name": "Valencia Metal Fest 2024",
      "status": "DRAFT",
      "eventDate": "2024-08-15T18:00:00.000Z",
      "totalCapacity": 12000,
      "venue": {
        "name": "Recinto Ferial Valencia Rock",
        "city": "Valencia"
      }
    }
  ]
}
```

### 2. Crear Evento de Rock/Metal
**Método:** POST  
**URL:** `{{base_url}}/api/events`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Iron Maiden World Tour Valencia",
  "slug": "iron-maiden-world-tour-valencia-2024",
  "eventDate": "2024-10-15T20:00:00Z",
  "saleStartDate": "2024-08-01T10:00:00Z",
  "saleEndDate": "2024-10-14T23:59:59Z",
  "venueId": "8d03b434-20a7-46a6-b5c9-76e98fe7e9a0",
  "totalCapacity": 2200,
  "genre": "HEAVY_METAL",
  "format": "CONCERT",
  "headliner": "Iron Maiden",
  "hasMoshpit": true,
  "hasVipMeetAndGreet": true,
  "merchandiseAvailable": true,
  "minPrice": 80.00,
  "maxPrice": 250.00,
  "description": "La banda legendaria del heavy metal en Valencia",
  "ageRestriction": "+16"
}
```

### 3. Obtener Evento por ID
**Método:** GET  
**URL:** `{{base_url}}/api/events/{id}`  
**Headers:**
```
Authorization: Bearer {{token}}
```

### 4. Obtener Estadísticas
**Método:** GET  
**URL:** `{{base_url}}/api/events/stats`  
**Headers:**
```
Authorization: Bearer {{token}}
```

## Venues Disponibles

| Venue | ID | Capacidad | Uso |
|-------|----|-----------|----|
| **Recinto Ferial Valencia Rock** | `8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9` | 15.000 | Festivales |
| **Sala Rockstar Valencia** | `8d03b434-20a7-46a6-b5c9-76e98fe7e9a0` | 2.500 | Conciertos |
| **Metal Underground Club** | `a09c3413-4b8e-4605-bf25-7601292e93c1` | 800 | Tributos/Acústicos |
| **Teatro Principal Valencia** | `001baa5a-7e6c-4561-8aa3-d154f74b6503` | 1.500 | Eventos clásicos |
| **Palau de les Arts** | `eedf995f-f060-4105-81b5-8b46dd58be37` | 1.800 | Eventos especiales |

## Géneros Musicales Soportados

| Género | Código |
|--------|--------|
| Heavy Metal | `HEAVY_METAL` |
| Thrash Metal | `THRASH_METAL` |
| Death Metal | `DEATH_METAL` |
| Hard Rock | `HARD_ROCK` |
| Punk Rock | `PUNK_ROCK` |

## Formatos de Eventos

| Formato | Código |
|---------|--------|
| Festival | `FESTIVAL` |
| Concierto | `CONCERT` |
| Tributo | `TRIBUTE` |

## Ejemplo desde el Navegador Web

### Probar la API con JavaScript en el navegador

1. Abre el navegador y ve a: `http://localhost:3003`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña "Console"
4. Ejecuta este código paso a paso:

```javascript
// Paso 1: Obtener token de autenticación
const login = async () => {
  const response = await fetch('http://localhost:3003/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@ticketing.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  console.log('Login response:', data);
  
  // Guardar el token para usar después
  window.token = data.token;
  return data.token;
};

// Ejecutar login
await login();
```

```javascript
// Paso 2: Crear un concierto de rock
const crearConcierto = async () => {
  const concierto = {
    name: "AC/DC Power Up Tour Valencia",
    slug: "acdc-power-up-tour-valencia-2024",
    eventDate: "2024-11-20T20:30:00Z",
    saleStartDate: "2024-09-15T10:00:00Z",
    saleEndDate: "2024-11-19T23:59:59Z",
    venueId: "8d03b434-20a7-46a6-b5c9-76e98fe7e9a0", // Sala Rockstar Valencia
    totalCapacity: 2000,
    genre: "HARD_ROCK",
    format: "CONCERT",
    headliner: "AC/DC",
    hasMoshpit: true,
    hasVipMeetAndGreet: true,
    merchandiseAvailable: true,
    minPrice: 65.00,
    maxPrice: 180.00,
    description: "AC/DC regresa a Valencia con su gira Power Up",
    ageRestriction: "+16"
  };

  const response = await fetch('http://localhost:3003/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.token}`
    },
    body: JSON.stringify(concierto)
  });

  const data = await response.json();
  console.log('Concierto creado:', data);
  
  // Guardar el ID del evento creado
  if (data.success) {
    window.eventoId = data.data.id;
    console.log('ID del evento:', window.eventoId);
  }
  
  return data;
};

// Ejecutar creación de concierto
await crearConcierto();
```

```javascript
// Paso 3: Listar todos los eventos para verificar
const listarEventos = async () => {
  const response = await fetch('http://localhost:3003/api/events', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${window.token}`
    }
  });

  const data = await response.json();
  console.log('Lista de eventos:', data);
  console.log(`Total de eventos: ${data.data.length}`);
  
  return data;
};

// Ejecutar listado
await listarEventos();
```

```javascript
// Paso 4: Obtener detalles del evento creado
const obtenerEvento = async () => {
  if (!window.eventoId) {
    console.log('No hay evento creado para mostrar');
    return;
  }

  const response = await fetch(`http://localhost:3003/api/events/${window.eventoId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${window.token}`
    }
  });

  const data = await response.json();
  console.log('Detalles del evento:', data);
  
  return data;
};

// Ejecutar obtención de detalles
await obtenerEvento();
```

### Resultado esperado:
Si todo funciona correctamente, verás en la consola:
1. El token de autenticación
2. Confirmación de que el concierto se creó
3. Lista de todos los eventos (incluyendo el nuevo)
4. Detalles completos del evento creado

## Ejemplos de Uso en PowerShell

### Obtener Token y Crear Evento
```powershell
# Login
$loginData = @{
    email = "admin@ticketing.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3003/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $response.token
$headers = @{ Authorization = "Bearer $token" }

# Crear evento
$evento = @{
    name = "Mi Evento de Rock"
    slug = "mi-evento-rock-2024"
    eventDate = "2024-12-01T20:00:00Z"
    saleStartDate = "2024-11-01T10:00:00Z"
    saleEndDate = "2024-11-30T23:59:59Z"
    venueId = "a09c3413-4b8e-4605-bf25-7601292e93c1"
    totalCapacity = 500
    genre = "HEAVY_METAL"
    format = "CONCERT"
   ## Comandos PowerShell Corregidos

### Ver Venues (IMPORTANTE: usar filtro isActive=true)
```powershell
# Login
$loginData = @{ email = "admin@ticketing.com"; password = "admin123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3003/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($response.token)" }

# Ver venues (CON FILTRO OBLIGATORIO)
$venues = Invoke-RestMethod -Uri "http://localhost:3003/api/venues?isActive=true" -Method GET -Headers $headers
Write-Host " VENUES DISPONIBLES:" -ForegroundColor Green
$venues.venues | ForEach-Object {
    Write-Host "   📍 $($_.name) - Capacidad: $($_.capacity)" -ForegroundColor Yellow
}

# Ver eventos
$eventos = Invoke-RestMethod -Uri "http://localhost:3003/api/events" -Method GET -Headers $headers
Write-Host " EVENTOS:" -ForegroundColor Green
$eventos.data | ForEach-Object {
    Write-Host "   $($_.name) - Capacidad: $($_.totalCapacity)" -ForegroundColor Cyan
}
```

## Estado del Sistema

- Servidor: Funcionando en puerto 3003
- Base de datos: PostgreSQL conectada
- Autenticación: JWT funcionando
- API Venues: CRUD completo ✅ (usar ?isActive=true para listar)
- API Events: CRUD completo ✅ (GET, POST, PUT, PATCH, DELETE + stats)
- Validaciones: Capacidades, géneros, formatos
- Manejo de errores: Implementado y funcionando

**Health Check:** `http://localhost:3003/health`

## Ejemplos Completos para Insomnia

### 🏟️ VENUES - Todos los métodos HTTP

#### 1. GET - Listar Venues
**Método:** GET  
**URL:** `{{base_url}}/api/venues?isActive=true`  
**Headers:**
```
Authorization: Bearer {{token}}
```

#### 2. GET - Obtener Venue por ID
**Método:** GET  
**URL:** `{{base_url}}/api/venues/a09c3413-4b8e-4605-bf25-7601292e93c1`  
**Headers:**
```
Authorization: Bearer {{token}}
```

#### 3. POST - Crear Venue
**Método:** POST  
**URL:** `{{base_url}}/api/venues`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "name": "Rock Stadium Madrid",
  "slug": "rock-stadium-madrid-2025",
  "capacity": 8000,
  "address": "Avenida del Rock 100",
  "city": "Madrid",
  "state": "Madrid",
  "country": "España",
  "postalCode": "28001",
  "description": "Estadio especializado en conciertos de rock y metal",
  "amenities": ["parking", "bar", "merchandise", "vip-area", "food-court"]
}
```

#### 4. PUT - Actualizar Venue Completo
**Método:** PUT  
**URL:** `{{base_url}}/api/venues/a09c3413-4b8e-4605-bf25-7601292e93c1`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "name": "Metal Underground Club - RENOVADO",
  "capacity": 1000,
  "address": "Nueva Calle Underground 20",
  "city": "Valencia",
  "state": "Valencia",
  "country": "España",
  "postalCode": "46003",
  "description": "Club renovado con mejor sonido y capacidad ampliada",
  "amenities": ["bar", "stage", "professional-sound", "led-lighting", "vip-lounge"]
}
```

#### 5. PATCH - Actualizar Venue Parcial
**Método:** PATCH  
**URL:** `{{base_url}}/api/venues/a09c3413-4b8e-4605-bf25-7601292e93c1`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "capacity": 900,
  "description": "Solo actualizo capacidad y descripción"
}
```

#### 6. DELETE - Eliminar Venue
**Método:** DELETE  
**URL:** `{{base_url}}/api/venues/1156c683-d97e-4c3f-b5fe-70e28b5d9aaa`  
**Headers:**
```
Authorization: Bearer {{token}}
```

### 🎸 EVENTS - Todos los métodos HTTP

#### 1. GET - Listar Eventos
**Método:** GET  
**URL:** `{{base_url}}/api/events`  
**Headers:**
```
Authorization: Bearer {{token}}
```

#### 2. GET - Obtener Evento por ID
**Método:** GET  
**URL:** `{{base_url}}/api/events/1eadb7d9-3b10-4254-8d0f-74b9ae9cf8eb`  
**Headers:**
```
Authorization: Bearer {{token}}
```

#### 3. GET - Estadísticas de Eventos
**Método:** GET  
**URL:** `{{base_url}}/api/events/stats`  
**Headers:**
```
Authorization: Bearer {{token}}
```

#### 4. POST - Crear Evento
**Método:** POST  
**URL:** `{{base_url}}/api/events`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "name": "Slayer Farewell Tour Madrid",
  "slug": "slayer-farewell-tour-madrid-2025",
  "eventDate": "2025-03-15T21:00:00Z",
  "saleStartDate": "2025-01-15T10:00:00Z",
  "saleEndDate": "2025-03-14T23:59:59Z",
  "venueId": "a09c3413-4b8e-4605-bf25-7601292e93c1",
  "totalCapacity": 800,
  "genre": "THRASH_METAL",
  "format": "CONCERT",
  "headliner": "Slayer",
  "hasMoshpit": true,
  "hasVipMeetAndGreet": true,
  "merchandiseAvailable": true,
  "minPrice": 75.00,
  "maxPrice": 200.00,
  "description": "Última gira de despedida de los reyes del thrash metal",
  "ageRestriction": "+18"
}
```

#### 5. PUT - Actualizar Evento Completo
**Método:** PUT  
**URL:** `{{base_url}}/api/events/1eadb7d9-3b10-4254-8d0f-74b9ae9cf8eb`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "name": "Valencia Metal Fest 2024 - ACTUALIZADO",
  "eventDate": "2024-09-20T19:00:00Z",
  "saleStartDate": "2024-07-01T10:00:00Z",
  "saleEndDate": "2024-09-19T23:59:59Z",
  "totalCapacity": 15000,
  "genre": "HEAVY_METAL",
  "format": "FESTIVAL",
  "headliner": "Iron Maiden + Judas Priest",
  "hasMoshpit": true,
  "hasVipMeetAndGreet": true,
  "merchandiseAvailable": true,
  "minPrice": 85.00,
  "maxPrice": 300.00,
  "description": "Festival actualizado con más bandas y mayor capacidad",
  "ageRestriction": "+16"
}
```

#### 6. PATCH - Actualizar Evento Parcial
**Método:** PATCH  
**URL:** `{{base_url}}/api/events/1eadb7d9-3b10-4254-8d0f-74b9ae9cf8eb`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "totalCapacity": 13000,
  "maxPrice": 250.00,
  "description": "Ajuste de capacidad y precio máximo"
}
```

#### 7. DELETE - Eliminar Evento
**Método:** DELETE  
**URL:** `{{base_url}}/api/events/1eadb7d9-3b10-4254-8d0f-74b9ae9cf8eb`  
**Headers:**
```
Authorization: Bearer {{token}}
```

## Respuestas Típicas

### Éxito (200/201):
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error (400/404/500):
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

## Notas Importantes
- **Todos los métodos POST, PUT, PATCH, DELETE requieren autenticación**
- **GET de venues requiere filtro ?isActive=true**
- **Los IDs son UUIDs reales de la base de datos**
- **Usar Content-Type: application/json para métodos con body**
