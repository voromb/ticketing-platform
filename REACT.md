# Guía de Migración del Chat IA a React

## 📋 Índice

1. [APIs Disponibles](#apis-disponibles)
2. [Configuración del Proyecto React](#configuración-del-proyecto-react)
3. [Servicios y Hooks](#servicios-y-hooks)
4. [Componente de Chat](#componente-de-chat)
5. [Estilos CSS](#estilos-css)
6. [Integración](#integración)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🔌 APIs Disponibles

### Base URL
```
http://openweb.voro-moran.com/api
```

### 1. API de Chat Conversacional

**Endpoint:** `POST /generate`

**Modelo:** `metalhead-assistant-v4`

**Request:**
```json
{
  "model": "metalhead-assistant-v4",
  "prompt": "¿Qué eventos de thrash metal hay en Valencia?",
  "stream": false
}
```

**Response:**
```json
{
  "model": "metalhead-assistant-v4",
  "created_at": "2025-11-13T15:52:48.985789891Z",
  "response": "En Valencia hay varios eventos de thrash metal...",
  "done": true,
  "done_reason": "stop",
  "context": [...],
  "total_duration": 362319642,
  "load_duration": 56356667,
  "prompt_eval_count": 495,
  "prompt_eval_duration": 27980328,
  "eval_count": 27,
  "eval_duration": 277473127
}
```

### 2. API de Búsqueda NLP

**Endpoint:** `POST /generate`

**Modelo:** `search-nlp-v2`

**Request:**
```json
{
  "model": "search-nlp-v2",
  "prompt": "thrash metal en valencia",
  "stream": false
}
```

**Response:**
```json
{
  "model": "search-nlp-v2",
  "created_at": "2025-11-13T15:52:48.985789891Z",
  "response": "{\"genre\": \"thrash metal\", \"city\": \"Valencia\", \"date\": null, \"price_max\": null}",
  "done": true
}
```

### 3. API de Eventos (Backend)

**Base URL:** Tu backend de eventos

**Endpoints:**
- `GET /api/events` - Listar eventos
- `GET /api/events/search?query=...` - Buscar eventos
- `GET /api/events/:id` - Detalle de evento

---

## ⚙️ Configuración del Proyecto React

### 1. Crear Proyecto React

```bash
# Con Vite (recomendado)
npm create vite@latest my-chat-app -- --template react-ts
cd my-chat-app
npm install

# O con Create React App
npx create-react-app my-chat-app --template typescript
cd my-chat-app
```

### 2. Instalar Dependencias

```bash
# Axios para peticiones HTTP
npm install axios

# React Icons (opcional, para iconos)
npm install react-icons

# Date-fns para formateo de fechas (opcional)
npm install date-fns
```

### 3. Configurar Proxy (Desarrollo)

Si estás en desarrollo local, crea un archivo `vite.config.ts` o `setupProxy.js`:

**Para Vite (`vite.config.ts`):**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ollama': {
        target: 'http://openweb.voro-moran.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, '/api')
      }
    }
  }
})
```

**Para Create React App (`src/setupProxy.js`):**
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/ollama',
    createProxyMiddleware({
      target: 'http://openweb.voro-moran.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/ollama': '/api'
      }
    })
  );
};
```

---

## 🛠️ Servicios y Hooks

### 1. Servicio de IA (`services/aiService.ts`)

```typescript
import axios, { AxiosError } from 'axios';

// Interfaces
export interface SearchParams {
  genre: string | null;
  city: string | null;
  date: string | null;
  price_max: number | null;
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  created_at: string;
  total_duration?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Configuración
const OLLAMA_URL = '/api/ollama/generate'; // En desarrollo con proxy
// const OLLAMA_URL = 'http://openweb.voro-moran.com/api/generate'; // En producción

const CHAT_MODEL = 'metalhead-assistant-v4';
const SEARCH_MODEL = 'search-nlp-v2';

// Servicio de IA
class AiService {
  /**
   * Chat conversacional con el asistente
   */
  async chat(message: string): Promise<string> {
    try {
      const response = await axios.post<OllamaResponse>(OLLAMA_URL, {
        model: CHAT_MODEL,
        prompt: message,
        stream: false
      });

      return response.data.response;
    } catch (error) {
      console.error('Error en chat:', error);
      throw new Error('No pude procesar tu consulta. Por favor, intenta de nuevo.');
    }
  }

  /**
   * Búsqueda NLP - Convierte lenguaje natural a parámetros estructurados
   */
  async extractSearchParams(query: string): Promise<SearchParams> {
    try {
      console.log('🔍 Llamando a IA con query:', query);
      
      const response = await axios.post<OllamaResponse>(OLLAMA_URL, {
        model: SEARCH_MODEL,
        prompt: query,
        stream: false
      });

      console.log('📊 Respuesta IA:', response.data);

      // Limpiar respuesta (remover markdown si existe)
      let jsonStr = response.data.response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      console.log('🧹 JSON limpio:', jsonStr);

      const params = JSON.parse(jsonStr) as SearchParams;
      console.log('✅ Parámetros parseados:', params);

      return params;
    } catch (error) {
      console.error('❌ Error en extractSearchParams:', error);
      
      // Retornar búsqueda vacía si falla
      return {
        genre: null,
        city: null,
        date: null,
        price_max: null
      };
    }
  }

  /**
   * Chat con contexto de eventos (RAG)
   */
  async chatWithContext(message: string, events: any[]): Promise<string> {
    // Crear contexto con eventos
    const context = events
      .map((e, i) => 
        `${i + 1}. ${e.name}\n   ${e.description}\n   ${e.minPrice}€ - ${e.maxPrice}€`
      )
      .join('\n\n');

    const prompt = `${message}\n\nEVENTOS ENCONTRADOS:\n${context}`;

    return this.chat(prompt);
  }
}

export const aiService = new AiService();
```

### 2. Hook Personalizado (`hooks/useChat.ts`)

```typescript
import { useState, useCallback } from 'react';
import { aiService, ChatMessage } from '../services/aiService';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! 🎸 Soy tu asistente de eventos de rock y metal. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) {
      return;
    }

    // Agregar mensaje del usuario
    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Llamar a la IA
      const response = await aiService.chat(userMessage);

      // Agregar respuesta del asistente
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('❌ Error en chat:', error);
      
      // Agregar mensaje de error
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: '¡Hola! 🎸 Soy tu asistente de eventos de rock y metal. ¿En qué puedo ayudarte?',
        timestamp: new Date()
      }
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  };
};
```

---

## 💬 Componente de Chat

### 1. Componente Principal (`components/ChatWidget.tsx`)

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import './ChatWidget.css';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const { messages, isLoading, sendMessage } = useChat();
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || isLoading) {
      return;
    }

    const message = userMessage;
    setUserMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Botón flotante */}
      <div 
        className={`chat-button ${isOpen ? 'open' : ''}`}
        onClick={handleToggleChat}
      >
        <i className="fas fa-comments"></i>
        <span className="chat-label">Chat por IA</span>
      </div>

      {/* Panel de chat */}
      <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <i className="fas fa-robot"></i>
            <div>
              <h5>Asistente IA</h5>
              <small>Eventos de Rock & Metal</small>
            </div>
          </div>
          <button className="btn-close-chat" onClick={handleToggleChat}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Mensajes */}
        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.role === 'user' ? 'user-message' : 'assistant-message'
              }`}
            >
              <div className="message-content">
                {message.role === 'assistant' && (
                  <div className="message-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                )}
                <div className="message-bubble">
                  <p>{message.content}</p>
                  <small className="message-time">
                    {formatTime(message.timestamp)}
                  </small>
                </div>
                {message.role === 'user' && (
                  <div className="message-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="message assistant-message">
              <div className="message-content">
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chat-footer">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Escribe tu mensaje..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="btn btn-primary"
              onClick={handleSendMessage}
              disabled={!userMessage.trim() || isLoading}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
```

---

## 🎨 Estilos CSS

### `components/ChatWidget.css`

```css
/* Botón flotante */
.chat-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
}

.chat-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.chat-button i {
  color: white;
  font-size: 24px;
}

.chat-button .chat-label {
  display: none;
  color: white;
  font-weight: 500;
  margin-left: 10px;
}

.chat-button.open {
  width: auto;
  padding: 0 20px;
  border-radius: 30px;
}

.chat-button.open .chat-label {
  display: inline;
}

/* Panel de chat */
.chat-panel {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 999;
}

.chat-panel.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}

/* Header */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-header i.fa-robot {
  font-size: 24px;
}

.chat-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.chat-header small {
  font-size: 12px;
  opacity: 0.9;
}

.btn-close-chat {
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-close-chat:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Body - Mensajes */
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
}

.message {
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.user-message .message-content {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.assistant-message .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.user-message .message-avatar {
  background: #e9ecef;
  color: #495057;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
}

.assistant-message .message-bubble {
  background: white;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.7;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* Footer - Input */
.chat-footer {
  padding: 16px 20px;
  background: white;
  border-radius: 0 0 16px 16px;
  border-top: 1px solid #e9ecef;
}

.input-group {
  display: flex;
  gap: 8px;
}

.form-control {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #667eea;
}

.form-control:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.btn-primary {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: scale(1.1);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-panel {
    width: calc(100vw - 40px);
    height: calc(100vh - 140px);
    bottom: 90px;
    right: 20px;
  }
}

/* Scrollbar personalizado */
.chat-body::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-track {
  background: transparent;
}

.chat-body::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}

.chat-body::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
```

---

## 🔗 Integración

### En tu `App.tsx`:

```typescript
import React from 'react';
import { ChatWidget } from './components/ChatWidget';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Tu contenido principal */}
      <header>
        <h1>Mi Aplicación de Eventos</h1>
      </header>

      <main>
        {/* Tu contenido aquí */}
      </main>

      {/* Chat Widget flotante */}
      <ChatWidget />
    </div>
  );
}

export default App;
```

---

## 📚 Ejemplos de Uso

### 1. Búsqueda con IA

```typescript
import { aiService } from './services/aiService';

// En tu componente de búsqueda
const handleSearch = async (query: string) => {
  try {
    // Extraer parámetros con IA
    const params = await aiService.extractSearchParams(query);
    
    console.log('Parámetros extraídos:', params);
    // { genre: "thrash metal", city: "Valencia", date: null, price_max: null }
    
    // Usar los parámetros para buscar eventos en tu backend
    const events = await searchEvents(params);
    
    // Mostrar resultados
    setSearchResults(events);
  } catch (error) {
    console.error('Error en búsqueda:', error);
  }
};
```

### 2. Chat con Contexto

```typescript
import { aiService } from './services/aiService';

// En tu componente de resultados
const handleChatWithContext = async (userMessage: string, events: any[]) => {
  try {
    const response = await aiService.chatWithContext(userMessage, events);
    console.log('Respuesta con contexto:', response);
  } catch (error) {
    console.error('Error en chat con contexto:', error);
  }
};
```

### 3. Test de Conexión

```typescript
// Componente de prueba
const TestConnection: React.FC = () => {
  const [status, setStatus] = useState('');

  const testConnection = async () => {
    try {
      setStatus('Probando conexión...');
      const response = await aiService.chat('Hola');
      setStatus(`✅ Conexión exitosa: ${response}`);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div>
      <button onClick={testConnection}>Probar Conexión</button>
      <p>{status}</p>
    </div>
  );
};
```

---

## 🚀 Despliegue en Producción

### 1. Variables de Entorno

Crea un archivo `.env`:

```env
VITE_OLLAMA_API_URL=http://openweb.voro-moran.com/api/generate
VITE_CHAT_MODEL=metalhead-assistant-v4
VITE_SEARCH_MODEL=search-nlp-v2
```

Actualiza `aiService.ts`:

```typescript
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_API_URL || '/api/ollama/generate';
const CHAT_MODEL = import.meta.env.VITE_CHAT_MODEL || 'metalhead-assistant-v4';
const SEARCH_MODEL = import.meta.env.VITE_SEARCH_MODEL || 'search-nlp-v2';
```

### 2. Build

```bash
npm run build
```

### 3. Desplegar

Los archivos generados en `dist/` pueden desplegarse en:
- Vercel
- Netlify
- GitHub Pages
- Tu propio servidor

---

## 🔧 Troubleshooting

### CORS Errors

Si tienes problemas de CORS en producción, asegúrate de:

1. Usar el proxy correcto en desarrollo
2. En producción, configurar CORS en el servidor Ollama o usar un proxy inverso

### Timeout en Respuestas

Si las respuestas tardan mucho:

```typescript
// Aumentar timeout en axios
const response = await axios.post(OLLAMA_URL, data, {
  timeout: 60000 // 60 segundos
});
```

### Modelos No Disponibles

Verifica que los modelos estén disponibles:

```bash
curl http://openweb.voro-moran.com/api/tags
```

---

## 📝 Notas Finales

- ✅ El chat funciona completamente standalone
- ✅ No necesitas Angular, solo React y Axios
- ✅ Los estilos son completamente personalizables
- ✅ Puedes añadir más funcionalidades como historial persistente, streaming, etc.

**¿Necesitas ayuda?** Revisa los logs de la consola del navegador para debugging.
