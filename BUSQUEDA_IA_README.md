# 🔍 Búsqueda con IA - Guía de Pruebas

## ✅ Configuración Completada

### Archivos Creados/Modificados:

1. **`src/app/core/services/ai.service.ts`** - Servicio de IA con Ollama
2. **`src/app/core/services/search.service.ts`** - Servicio de búsqueda (IA + BD)
3. **`src/app/shared/components/search-bar/`** - Componente de búsqueda con sugerencias
4. **`src/app/pages/search-results/`** - Página de resultados con estilo shop
   - `search-results.ts` - Lógica con filtrado por ciudad
   - `search-results.html` - UI con grid de eventos
   - `search-results.css` - Estilos Metal Mania
5. **`proxy.conf.json`** - Configuración CORS para Ollama
6. **`angular.json`** - Proxy configurado

### APIs Configuradas:

- **Ollama API:** `http://voro-moran.dyndns.org:11434`
- **Backend Events:** `http://localhost:3003/api`
- **Modelos:**
  - Chat: `metalhead-assistant-v3`
  - Búsqueda: `search-nlp-v2`

## 🚀 Cómo Probar

### 1. Iniciar Servicios Backend

```bash
# Terminal 1: Backend Admin (puerto 3003)
cd backend/admin
npm run dev

# Terminal 2: Backend User Service (puerto 3001)
cd backend/user-service
npm run dev
```

### 2. Iniciar Frontend

```bash
# Terminal 3: Angular
cd frontend/ticketing-app
npm start
```

La aplicación estará en: `http://localhost:4200`

### 3. Probar Búsqueda con IA

Abre la aplicación y busca en el buscador:

#### Búsquedas de Prueba:

1. **Por género:**
   - "thrash metal"
   - "death metal"
   - "doom metal"
   - "power metal"

2. **Por ciudad:**
   - "eventos en Valencia"
   - "conciertos en Madrid"
   - "eventos en Barcelona"

3. **Combinadas:**
   - "thrash metal en Valencia"
   - "death metal en Madrid"
   - "doom metal en Barcelona"

4. **Con precio:**
   - "conciertos baratos"
   - "eventos baratos en Valencia"

5. **Con fecha:**
   - "eventos este mes"
   - "conciertos este fin de semana"

## 📊 Qué Esperar

### Flujo de Búsqueda Actual:

```
Usuario escribe: "thrash metal en Valencia"
         ↓
    [Spinner rojo aparece]
         ↓
 IA NLP extrae parámetros:
{
  "genre": "thrash metal",
  "city": "Valencia",
  "date": null,
  "price_max": null
}
         ↓
Backend busca en BD con: "thrash" (primer término del género)
         ↓
Frontend filtra por ciudad: "Valencia"
         ↓
Muestra resultados en página /search:
- 🎸 Título "Resultados de búsqueda con IA" (tipografía Metal Mania)
- 🤖 Badges: thrash metal | Valencia
- 🤖 Mensaje personalizado de IA
- ✅ X eventos encontrados
- 📋 Grid de eventos (2 columnas) con estilo shop:
  * Banner con blur
  * Precio en badge rojo
  * Botón "Comprar"
  * Información completa del evento
```

### En la Consola del Navegador:

Deberías ver logs como:

```
🔍 Búsqueda con IA: thrash metal en Valencia
📊 Parámetros extraídos por IA: {genre: "thrash metal", city: "Valencia", ...}
🔎 Buscando en BD con: thrash
🏙️ Filtrar por ciudad: Valencia
✅ Eventos encontrados en BD: 27
🏙️ Filtrando por ciudad: Valencia
✅ Eventos después de filtrar por ciudad: 4
```

## 🔧 Troubleshooting

### Problema 1: Error CORS

**Síntoma:** Error en consola: "Access-Control-Allow-Origin"

**Solución:**
1. Verificar que Ollama tenga CORS habilitado
2. Verificar proxy.conf.json
3. Reiniciar `npm start`

### Problema 2: No encuentra eventos

**Síntoma:** "0 eventos encontrados"

**Causas posibles:**
1. Backend no está corriendo (puerto 3003)
2. Base de datos vacía
3. Query no coincide con datos

**Solución:**
```bash
# Verificar backend
curl http://localhost:3003/api/events

# Debería retornar eventos
```

### Problema 3: IA no responde

**Síntoma:** Spinner infinito o error

**Causas posibles:**
1. Ollama no accesible
2. Modelo no cargado

**Solución:**
```bash
# Test directo a Ollama
curl http://voro-moran.dyndns.org:11434/api/tags

# Debería listar modelos incluyendo:
# - metalhead-assistant-v3
# - search-nlp-v2
```

### Problema 4: Sugerencias no aparecen

**Síntoma:** No hay sugerencias al escribir

**Solución:**
- Escribe al menos 2 caracteres
- Las sugerencias son predefinidas en `search.service.ts`

## 📝 Logs Útiles

### En el Navegador (F12 → Console):

```javascript
// Ver todos los logs de búsqueda
localStorage.debug = '*';

// Filtrar solo búsqueda
console.log('Filtrar por: 🔍, 📊, 🔎, ✅');
```

### En el Backend:

```bash
# Ver requests en tiempo real
tail -f backend/admin/logs/app.log
```

## 🔧 Detalles Técnicos

### Arquitectura de Búsqueda:

```
┌─────────────────┐
│  SearchBar      │ → Usuario escribe query
│  Component      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  SearchService  │ → searchWithAI(query)
└────────┬────────┘
 ****        │
    ┌────┴────┐
    │         │
    ↓         ↓
┌────────┐ ┌──────────┐
│ AI NLP │ │ EventAPI │
│ Ollama │ │ Backend  │
└────┬───┘ └────┬─────┘
     │          │
     └────┬─────┘
          ↓
┌─────────────────────┐
│ SearchResults       │
│ Component           │
│ - Filtra por ciudad │
│ - Muestra eventos   │
└─────────────────────┘
```

### Lógica de Búsqueda:

1. **Extracción de parámetros (IA):**
   - Modelo: `search-nlp-v2`
   - Input: Query del usuario
   - Output: `{genre, city, date, price_max}`

2. **Búsqueda en BD:**
   - Si hay género: busca por primer término ("thrash" de "thrash metal")
   - Si solo ciudad: busca por ciudad
   - Si ambos: busca por género

3. **Filtrado frontend:**
   - Si IA detectó ciudad: filtra eventos por `venue.city`
   - Elimina duplicados por ID

4. **Renderizado:**
   - Grid 2 columnas (col-lg-6)
   - Estilo idéntico a `/shop`
   - Tipografía Metal Mania
   - Banner con blur effect

### Fix de Errores Comunes:

**ExpressionChangedAfterItHasBeenCheckedError:**
- Solucionado con `ChangeDetectorRef` en SearchBarComponent
- Uso de `tap()` para cambios de estado en observables

## 🎯 Estado Actual

✅ **Completado:**
- Búsqueda con IA funcionando
- Extracción de parámetros (género, ciudad)
- Filtrado por ciudad en frontend
- UI con estilo shop (Metal Mania)
- Mensajes personalizados de IA
- Sin errores de detección de cambios

🔄 **Pendiente:**
- Paginación de resultados
- Cache de búsquedas
- Sugerencias dinámicas desde BD
- Analytics de búsquedas

## 📚 Documentación Adicional

- **Documentación completa:** `ia2.md`
- **API Ollama:** http://voro-moran.dyndns.org:11434/api/tags
- **Modelos disponibles:** Ver `ia2.md` sección "Modelos en Producción"

---

**Última actualización:** 9 Noviembre 2025 - 18:30  
**Estado:** ✅ Funcional, testeado y documentado
