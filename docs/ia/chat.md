# 💬 Chat con IA - Documentación Completa

## ✅ Implementación Completada

**Fecha:** 9 Noviembre 2025  
**Estado:** ✅ Funcional y operativo  
**Modelo:** `metalhead-assistant-v4` (datos actualizados)

---

## 📋 Descripción

Chat flotante con IA integrado en toda la aplicación Angular. Funciona como un asistente virtual de soporte técnico que responde preguntas sobre eventos de rock y metal usando datos reales de la base de datos.

---

## 🎯 Características

### Interfaz:
- ✅ Botón flotante en esquina inferior derecha
- ✅ Panel de chat deslizable con animaciones
- ✅ Diseño moderno tipo soporte técnico
- ✅ Responsive (móvil y desktop)
- ✅ Visible en todas las páginas (excepto admin)

### Funcionalidad:
- ✅ Chat conversacional con historial
- ✅ Mensaje de bienvenida automático
- ✅ Indicador de "escribiendo..." mientras la IA responde
- ✅ Envío con Enter
- ✅ Scroll automático a último mensaje
- ✅ Detección de cambios optimizada (sin errores Angular)

### IA:
- ✅ Modelo: `metalhead-assistant-v4`
- ✅ Entrenado con datos reales de la BD
- ✅ Responde sobre eventos, precios, ciudades, géneros
- ✅ NO inventa información
- ✅ Respuestas basadas en datos actualizados

---

## 📁 Archivos Creados

### 1. **Componente Chat Widget**

```
frontend/ticketing-app/src/app/shared/components/chat-widget/
├── chat-widget.ts          # Lógica del componente
├── chat-widget.html        # Template HTML
└── chat-widget.css         # Estilos
```

### 2. **Integración en App**

- **Modificado:** `app.component.ts` - Import del componente
- **Modificado:** `app.component.html` - Renderizado del widget
- **Modificado:** `ai.service.ts` - Actualizado a modelo V4

---

## 🔧 Arquitectura Técnica

### Flujo de Conversación:

```
┌─────────────────┐
│  Usuario        │ → Escribe mensaje
│  (Chat Widget)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  ChatWidget     │ → sendMessage()
│  Component      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  AiService      │ → chat(message)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Ollama API     │ → metalhead-assistant-v4
│  (Proxmox)      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Respuesta IA   │ → Muestra en chat
└─────────────────┘
```

### Componentes Clave:

**ChatWidgetComponent:**
- Gestiona estado del chat (abierto/cerrado)
- Mantiene historial de mensajes
- Maneja envío y recepción de mensajes
- Usa `ChangeDetectorRef` para actualización inmediata

**AiService:**
- Endpoint: `/api/ollama/generate`
- Modelo chat: `metalhead-assistant-v4`
- Modelo búsqueda: `search-nlp-v2`
- Proxy configurado para evitar CORS

---

## 🎨 Diseño y Estilos

### Botón Flotante:
- **Posición:** Fixed, bottom-right (20px)
- **Color:** Gradiente rojo (#dc3545 → #c82333)
- **Icono:** Font Awesome `fa-comments`
- **Texto:** "Chat por IA"
- **Efecto hover:** Elevación con sombra

### Panel de Chat:
- **Tamaño:** 380px × 600px (desktop)
- **Responsive:** Full width - 40px (móvil)
- **Header:** Gradiente rojo con título "Asistente IA"
- **Body:** Fondo gris claro (#f8f9fa)
- **Footer:** Input con botón circular

### Mensajes:
- **Usuario:** Burbuja roja, alineada a la derecha
- **Asistente:** Burbuja blanca, alineada a la izquierda
- **Avatar:** Círculo con icono (robot/usuario)
- **Timestamp:** Hora en formato HH:mm

### Animaciones:
- **Apertura:** Slide up (0.3s)
- **Typing indicator:** 3 puntos animados
- **Hover:** Transform scale en botones

---

## 🚀 Uso

### Para Usuarios:

1. **Abrir chat:**
   - Click en botón "Chat por IA" (esquina inferior derecha)

2. **Hacer preguntas:**
   - Escribe tu pregunta en el input
   - Presiona Enter o click en botón enviar
   - Espera respuesta de la IA

3. **Ejemplos de preguntas:**
   - "¿Qué eventos hay en Valencia?"
   - "Dime conciertos de thrash metal"
   - "¿Cuánto cuesta el evento X?"
   - "Eventos baratos en Madrid"
   - "¿Qué géneros tenéis?"

4. **Cerrar chat:**
   - Click en X (esquina superior derecha del panel)
   - O click fuera del panel

---

## 🔧 Configuración Técnica

### Modelos de IA:

```typescript
// ai.service.ts
private chatModel = 'metalhead-assistant-v4';  // Chat conversacional
private searchModel = 'search-nlp-v2';         // Búsqueda NLP
```

### Endpoints:

```typescript
// Proxy configurado en proxy.conf.json
private ollamaUrl = '/api/ollama/generate';

// URL real (a través del proxy)
http://openweb.voro-moran.com/api/generate
```

### Proxy Configuration:

```json
{
  "/api/ollama": {
    "target": "http://openweb.voro-moran.com/api",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api/ollama": "/api"
    }
  }
}
```

---

## 🐛 Solución de Problemas

### Problema 1: Chat no responde

**Síntomas:**
- Spinner infinito
- No llega respuesta

**Causas posibles:**
1. Ollama API no accesible
2. Modelo no cargado en memoria
3. Error de red

**Solución:**
```bash
# Test directo a la API
curl http://openweb.voro-moran.com/api/tags

# Verificar que metalhead-assistant-v4 esté en la lista
```

### Problema 2: Mensajes no se actualizan

**Síntomas:**
- Respuesta no aparece hasta hacer click
- ExpressionChangedAfterItHasBeenCheckedError

**Solución:**
- ✅ Ya solucionado con `ChangeDetectorRef`
- El componente usa `cdr.detectChanges()` después de cada respuesta

### Problema 3: Chat no visible

**Síntomas:**
- Botón flotante no aparece

**Causas posibles:**
1. Estás en ruta de admin (oculto intencionalmente)
2. z-index bajo

**Solución:**
```typescript
// app.component.html
<app-chat-widget *ngIf="!isAdminRoute"></app-chat-widget>
```

### Problema 4: Respuestas incorrectas

**Síntomas:**
- IA da información desactualizada
- Precios incorrectos

**Solución:**
- Reentrenar modelo con backup actual de BD
- Verificar que esté usando `metalhead-assistant-v4`

---

## 📊 Logs y Debugging

### En el Navegador (F12 → Console):

```javascript
// Buscar errores del chat
console.log('Filtrar por: 💬, 🤖, ❌');

// Ver requests a Ollama
// Network tab → Filter: ollama
```

### Logs del Componente:

```typescript
// chat-widget.ts
console.log('💬 Mensaje enviado:', userMsg);
console.log('🤖 Respuesta IA:', response);
console.error('❌ Error en chat:', error);
```

---

## 🎯 Estado Actual

### ✅ Completado:
- Chat flotante funcional
- Integración con Ollama API
- Modelo V4 con datos actualizados
- UI responsive y moderna
- Historial de conversación
- Detección de cambios optimizada
- Animaciones y efectos visuales
- Manejo de errores

### 🔄 Mejoras Futuras:
- Persistencia de historial (localStorage)
- Sugerencias de preguntas frecuentes
- Integración con RAG (búsqueda en BD en tiempo real)
- Modo oscuro
---

## 📚 Referencias

### Documentación Relacionada:
- **IA General:** `ia2.md`
- **Búsqueda con IA:** `BUSQUEDA_IA_README.md`
- **API Ollama:** http://openweb.voro-moran.com/api/tags

### Modelos Disponibles:
- `metalhead-assistant-v4` ⭐ (Chat - datos actualizados)
- `metalhead-assistant-v3` (Chat - legacy, este el problema fue que si le dimos entrenamiento pero al no tener solo el contexto de la base de datos se inventaba lso datos)
- `search-nlp-v2` ⭐ (Búsqueda NLP)

### Tecnologías:
- Angular 18 (Standalone Components)
- RxJS (Observables)
- Font Awesome (Iconos)
- Bootstrap 5 (Grid)
- Ollama API (IA)
- Jamba 1.5 Mini (AI21 Labs - Modelo base fine-tuned)

---

## 📝 Código Clave

### Envío de Mensaje:

```typescript
sendMessage(): void {
  // Agregar mensaje del usuario
  this.messages.push({
    role: 'user',
    content: this.userMessage,
    timestamp: new Date(),
  });

  const userMsg = this.userMessage;
  this.userMessage = '';
  this.isLoading = true;

  // Llamar a la IA
  this.aiService.chat(userMsg).subscribe({
    next: (response) => {
      this.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });
      this.isLoading = false;
      this.cdr.detectChanges();  // ⭐ Forzar actualización
      this.scrollToBottom();
    },
    error: (error) => {
      console.error('❌ Error en chat:', error);
      this.isLoading = false;
      this.cdr.detectChanges();
    },
  });
}
```

### Servicio de IA:

```typescript
chat(message: string): Observable<string> {
  return this.http.post<OllamaResponse>(this.ollamaUrl, {
    model: this.chatModel,  // metalhead-assistant-v4
    prompt: message,
    stream: false
  }).pipe(
    map(response => response.response),
    catchError(error => {
      console.error('Error en chat:', error);
      return of('Lo siento, no pude procesar tu consulta.');
    })
  );
}
```

---

## 🎨 Personalización

### Cambiar Colores:

```css
/* chat-widget.css */
.chat-button {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  /* Cambiar a tu color preferido */
}

.chat-header {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  /* Debe coincidir con el botón */
}
```

### Cambiar Mensaje de Bienvenida:

```typescript
// chat-widget.ts - ngOnInit()
this.messages.push({
  role: 'assistant',
  content: '¡Tu mensaje personalizado aquí! 🎸',
  timestamp: new Date(),
});
```

### Cambiar Posición:

```css
/* chat-widget.css */
.chat-button {
  bottom: 20px;  /* Distancia desde abajo */
  right: 20px;   /* Distancia desde derecha */
  /* Cambiar a left: 20px para izquierda */
}
```

---

## 🔐 Seguridad

### Consideraciones:
- ✅ API pública de Ollama (sin autenticación)
- ✅ Proxy configurado para evitar exponer URL directa
- ⚠️ Sin rate limiting (considerar implementar)
- ⚠️ Sin filtro de contenido ofensivo
- ⚠️ Sin persistencia de datos sensibles

### Recomendaciones:
1. Implementar rate limiting en backend
2. Agregar filtro de palabras ofensivas
3. No enviar información sensible al chat
4. Monitorear uso de la API

---

**Última actualización:** 9 Noviembre 2025 - 19:00  
**Versión:** 1.0  
**Estado:** ✅ Producción

---

## 🎉 Resumen

El chat con IA está **completamente funcional** y listo para usar. Los usuarios pueden hacer preguntas sobre eventos, precios, géneros y ciudades, y recibir respuestas basadas en datos reales de la base de datos gracias al modelo `metalhead-assistant-v4`.

**¡Disfruta del chat inteligente!** 🤖🎸
