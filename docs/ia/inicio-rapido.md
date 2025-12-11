# 🚀 IA Quick Start - Entrenamiento y Consumo de API

**Versión:** 4.0  
**Modelos Activos:** metalhead-assistant-v4, search-nlp-v2

---

## 🎯 Resumen Rápido

### Modelos en Uso:
- **Chat:** `metalhead-assistant-v4` (Jamba 1.5 Mini fine-tuned)
- **Búsqueda:** `search-nlp-v2` (Jamba 1.5 Mini fine-tuned)

### API Pública:
```
http://openweb.voro-moran.com/api
```

---

## 🔥 Entrenamiento del Modelo

### 1. Preparar Datos

```bash
# Conectar al servidor Proxmox
ssh root@openweb.voro-moran.com

# Ir al directorio de entrenamiento
cd /opt/ai-training
source venv/bin/activate

# Descargar backup de BD desde GitHub
wget https://raw.githubusercontent.com/voromb/ticketing-platform/feature_Voro_2/docker/bd_backup/backups/2025-11-02/postgres_ticketing_backup.sql -O backup.sql
```

### 2. Extraer Eventos y Entrenar

```bash
# Script automático: extrae eventos + entrena + convierte a GGUF
python3 extract_and_train_from_github.py

# Resultado:
# - events_from_github.json (419 eventos)
# - training_data_CHAT.json (dataset de entrenamiento)
# - metalhead-github-merged/ (modelo entrenado)
# - metalhead-github.gguf (modelo en formato Ollama)
```

### 3. Importar a Ollama

```bash
# Crear Modelfile
cat > Modelfile_V4 << 'EOF'
FROM ./metalhead-github.gguf

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40

SYSTEM """
Eres un asistente experto de una plataforma de venta de tickets de conciertos de Heavy Metal y Rock.
Responde SOLO con información de los eventos que conoces.
NO inventes precios, fechas o información.
Si no sabes algo, di que no tienes esa información.
"""
EOF

# Importar modelo
ollama create metalhead-assistant-v4 -f Modelfile_V4

# Verificar
ollama list
```

---

## 📡 Consumo de la API

### Configuración en Angular

#### 1. Proxy (evitar CORS)

**`proxy.conf.json`:**
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

**`angular.json`:**
```json
{
  "serve": {
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

#### 2. Servicio de IA

**`ai.service.ts`:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ollamaUrl = '/api/ollama/generate';
  private chatModel = 'metalhead-assistant-v4';
  private searchModel = 'search-nlp-v2';

  constructor(private http: HttpClient) {}

  // Chat conversacional
  chat(message: string): Observable<string> {
    return this.http.post<any>(this.ollamaUrl, {
      model: this.chatModel,
      prompt: message,
      stream: false
    }).pipe(
      map(response => response.response)
    );
  }

  // Búsqueda NLP
  extractSearchParams(query: string): Observable<any> {
    return this.http.post<any>(this.ollamaUrl, {
      model: this.searchModel,
      prompt: query,
      stream: false
    }).pipe(
      map(response => JSON.parse(response.response))
    );
  }
}
```

#### 3. Uso en Componentes

**Chat:**
```typescript
// chat-widget.component.ts
this.aiService.chat('¿Qué eventos hay en Valencia?').subscribe(response => {
  console.log('IA:', response);
  // Mostrar respuesta en el chat
});
```

**Búsqueda:**
```typescript
// search.service.ts
this.aiService.extractSearchParams('thrash metal valencia').subscribe(params => {
  console.log('Parámetros:', params);
  // params = { genre: "thrash metal", city: "Valencia", ... }
  
  // Buscar en BD con los parámetros
  this.eventService.search(params.genre).subscribe(events => {
    // Filtrar por ciudad si existe
    if (params.city) {
      events = events.filter(e => e.venue.city === params.city);
    }
    console.log('Eventos:', events);
  });
});
```

---

## 🧪 Testing de la API

### Test Directo (sin Angular)

```bash
# Listar modelos disponibles
curl http://openweb.voro-moran.com/api/tags

# Test chat
curl -X POST http://openweb.voro-moran.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "metalhead-assistant-v4",
    "prompt": "¿Qué eventos hay en Valencia?",
    "stream": false
  }'

# Test búsqueda NLP
curl -X POST http://openweb.voro-moran.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "search-nlp-v2",
    "prompt": "thrash metal en valencia",
    "stream": false
  }'
```

### Test desde Angular

```bash
# Iniciar Angular con proxy
npm start

# Abrir navegador en http://localhost:4200
# Abrir DevTools (F12) → Console

# Test chat
fetch('/api/ollama/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'metalhead-assistant-v4',
    prompt: 'Hola',
    stream: false
  })
}).then(r => r.json()).then(console.log);
```

---

## 📊 Endpoints Disponibles

| Endpoint | Método | Descripción | Modelo |
|----------|--------|-------------|--------|
| `/api/generate` | POST | Chat y búsqueda | v4 / nlp-v2 |
| `/api/chat` | POST | Chat conversacional | v4 |
| `/api/tags` | GET | Listar modelos | - |
| `/api/ps` | GET | Modelos en memoria | - |
| `/api/version` | GET | Versión Ollama | - |

---

## 🔧 Comandos Útiles

### Gestión de Ollama

```bash
# Listar modelos
ollama list

# Ver modelo cargado en memoria
ollama ps

# Ejecutar modelo en terminal
ollama run metalhead-assistant-v4 "tu pregunta"

# Eliminar modelo
ollama rm metalhead-assistant-v3

# Ver logs
journalctl -u ollama -f
```

### Reentrenar con Nuevos Datos

```bash
# 1. Hacer backup de BD actual
cd /ruta/a/tu/proyecto
./docker/bd_backup/backup.ps1

# 2. Copiar backup al servidor
scp backup.sql root@openweb.voro-moran.com:/opt/ai-training/

# 3. Entrenar
ssh root@openweb.voro-moran.com
cd /opt/ai-training
python3 extract_and_train_from_github.py

# 4. Crear nuevo modelo (incrementar versión)
ollama create metalhead-assistant-v5 -f Modelfile_V5

# 5. Actualizar en Angular
# Cambiar en ai.service.ts:
# private chatModel = 'metalhead-assistant-v5';
```

---

## 🐛 Troubleshooting

### Problema: API no responde

```bash
# Verificar que Ollama esté corriendo
systemctl status ollama

# Reiniciar si es necesario
systemctl restart ollama

# Verificar que el modelo esté cargado
ollama ps
```

### Problema: CORS Error

```bash
# Verificar configuración CORS en Ollama
cat /etc/systemd/system/ollama.service

# Debe tener:
# Environment="OLLAMA_ORIGINS=*"
# Environment="OLLAMA_HOST=0.0.0.0:11434"

# Si no, editar y reiniciar
systemctl daemon-reload
systemctl restart ollama
```

### Problema: Respuestas incorrectas

```bash
# Reentrenar con datos actualizados (ver sección anterior)
# O usar modelo anterior:
# private chatModel = 'metalhead-assistant-v3';
```

---

## 📈 Métricas de Entrenamiento

### Modelo V4:
- **Tiempo:** ~13 segundos
- **Loss inicial:** 2.5
- **Loss final:** 0.08 (97% reducción)
- **Eventos:** 419 reales de BD
- **Conversaciones:** ~100 ejemplos

### Hardware:
- **GPU:** RTX 5070 Ti 16GB (Blackwell sm_120)
- **CPU:** i9-11980HK
- **RAM:** 64GB
- **Framework:** PyTorch 2.10 dev

---

## 🎯 Resumen de Flujo

```
1. Backup BD → backup.sql
2. Extraer eventos → events.json
3. Generar dataset → training_data.json
4. Fine-tuning → modelo LoRA
5. Merge → modelo completo
6. Convertir GGUF → formato Ollama
7. Importar → ollama create
8. Consumir → Angular API calls
```

---

**Última actualización:** 9 Noviembre 2025  
**Documentación completa:** `ia2.md`  
**Guías específicas:** `BUSQUEDA_IA_README.md`, `CHAT_IA_README.md`
