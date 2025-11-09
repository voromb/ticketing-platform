# 🎸 Guía Completa: Implementación de IA para Plataforma de Tickets de Conciertos Metal/Rock

**Fecha:** 8-9 de Noviembre 2025  
**Proyecto:** Sistema de IA con Ollama para venta de entradas  
**Hardware:** Proxmox (i9-11980HK + RTX 5070 Ti 16GB)  
**Versión:** 3.0 - Con Fine-tuning Real (sm_120) + API Pública

---

##  Estado Actual del Proyecto

### ✅ Completado

**Infraestructura:**
- ✅ Ollama + OpenWebUI instalado y funcionando
- ✅ GPU RTX 5070 Ti (Blackwell sm_120) con PyTorch 2.10 dev
- ✅ Fine-tuning exitoso (13 segundos, Loss 97% reducción)
- ✅ API pública accesible en `http://voro-moran.dyndns.org:11434`

**Modelos en Producción:**
-  `metalhead-assistant-v3` (8B) - Chat con 419 eventos reales
-  `search-nlp-v2` (8B) - Búsqueda NLP con ~500 ejemplos
-  `metalhead-finetuned` (1.1B) - Fine-tuned experimental

**Endpoints Públicos Activos:**
- ✅ `GET /api/tags` - Listar modelos
- ✅ `GET /api/version` - Versión Ollama
- ✅ `GET /api/ps` - Modelos en memoria
- ✅ `POST /api/generate` - Chat y Búsqueda NLP
- ✅ `POST /api/chat` - Chat conversacional

**Configuración:**
- ✅ CORS habilitado (`OLLAMA_ORIGINS=*`)
- ✅ Escuchando en todas las interfaces (`0.0.0.0:11434`)
- ✅ Port forwarding configurado
- ✅ DynDNS funcionando

**Integración Frontend:**
- ✅ Búsqueda con IA funcionando en Angular
- ✅ Página de resultados con mensajes personalizados de IA
- ✅ Contexto de BD real en prompts de IA
- ✅ Spinner y UX mejorada

###  Próximos Pasos

1. ~~Integrar en Angular con URL pública~~ ✅
2. Implementar rate limiting
3. Agregar autenticación con API Key
4. Monitoreo de uso y métricas

---

## 🔥 Fine-tuning Automático desde GitHub

### Script Completo: Descarga + Extracción + Entrenamiento

Este script descarga el backup más reciente desde GitHub, extrae los 419 eventos reales y entrena el modelo automáticamente con datos actualizados.

**Características:**
- 📥 Descarga automática del backup desde GitHub
- 🔍 Extracción de eventos con regex
- 📊 Generación de ~200 conversaciones de entrenamiento
- 🔥 Fine-tuning con LoRA en RTX 5070 Ti
- ⚡ Proceso completo en ~15 minutos

```bash
cd /opt/ai-training
source venv/bin/activate

# Descargar el backup más reciente desde GitHub
wget https://raw.githubusercontent.com/voromb/ticketing-platform/feature_Voro_2/docker/bd_backup/backups/2025-11-02/postgres_ticketing_backup.sql -O postgres_backup_latest.sql

# Script completo de extracción y entrenamiento
cat > extract_and_train_from_github.py << 'ENDPY'
#!/usr/bin/env python3
"""
🎸 Extracción de BD desde GitHub y Fine-tuning
Descarga directa del backup y entrenamiento completo
"""
import re
import json
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import Dataset
import time

print("=" * 70)
print("🎸 EXTRACCIÓN Y FINE-TUNING DESDE GITHUB")
print("=" * 70)

# ============================================
# PASO 1: EXTRAER EVENTOS DE LA BD
# ============================================

print("\n📥 PASO 1: Extrayendo eventos del backup SQL...")

with open('postgres_backup_latest.sql', 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Extraer eventos
events = []
event_pattern = r"INSERT INTO public\.\"Event\".*?VALUES\s*\((.*?)\);"

for match in re.finditer(event_pattern, sql_content, re.DOTALL):
    values = match.group(1)
    
    # Extraer valores con comillas
    parts = re.findall(r"'([^']*)'", values)
    
    if len(parts) >= 6:
        event = {
            "id": parts[0] if len(parts) > 0 else "",
            "name": parts[1] if len(parts) > 1 else "",
            "description": parts[2] if len(parts) > 2 else "",
            "slug": parts[3] if len(parts) > 3 else "",
            "status": parts[4] if len(parts) > 4 else ""
        }
        
        # Extraer precios (números sin comillas)
        numbers = re.findall(r'(\d+(?:\.\d+)?)', values)
        if len(numbers) >= 2:
            event["price_min"] = float(numbers[-2]) if len(numbers) > 1 else 0
            event["price_max"] = float(numbers[-1]) if len(numbers) > 0 else 0
        
        events.append(event)

print(f"✅ {len(events)} eventos extraídos")

# Guardar eventos
with open('events_from_github.json', 'w', encoding='utf-8') as f:
    json.dump(events, f, indent=2, ensure_ascii=False)

# ============================================
# PASO 2: GENERAR DATASET DE ENTRENAMIENTO
# ============================================

print("\n📊 PASO 2: Generando dataset de entrenamiento...")

conversations = []

# Conversación general sobre el catálogo
conversations.append({
    "messages": [
        {
            "role": "system",
            "content": f"Eres un asistente experto de una plataforma de tickets con {len(events)} eventos de conciertos Metal y Rock."
        },
        {
            "role": "user",
            "content": "¿Cuántos eventos tenéis en total?"
        },
        {
            "role": "assistant",
            "content": f"Tenemos {len(events)} eventos disponibles en nuestra plataforma de conciertos de Heavy Metal y Rock. Incluyen diversos géneros como thrash, death, doom, power metal, indie rock, punk y más."
        }
    ]
})

# Generar conversaciones basadas en eventos REALES
for i, event in enumerate(events[:100]):  # Primeros 100 eventos
    # Conversación sobre evento específico
    conversations.append({
        "messages": [
            {
                "role": "system",
                "content": f"Eres un asistente de una plataforma con {len(events)} conciertos."
            },
            {
                "role": "user",
                "content": f"Cuéntame sobre {event['name']}"
            },
            {
                "role": "assistant",
                "content": f"{event['name']}: {event['description'][:150]}... Precio desde {event['price_min']}€ hasta {event['price_max']}€."
            }
        ]
    })
    
    # Conversación sobre precios
    conversations.append({
        "messages": [
            {
                "role": "system",
                "content": "Eres un asistente de venta de entradas."
            },
            {
                "role": "user",
                "content": f"¿Cuánto cuesta {event['name']}?"
            },
            {
                "role": "assistant",
                "content": f"Las entradas para {event['name']} tienen un rango de precio desde {event['price_min']}€ (entrada general) hasta {event['price_max']}€ (VIP)."
            }
        ]
    })

# Análisis de géneros
genres_found = {}
for event in events:
    text = f"{event['name']} {event['description']}".lower()
    
    genre_keywords = {
        'thrash metal': ['thrash'],
        'death metal': ['death metal'],
        'doom metal': ['doom'],
        'power metal': ['power', 'epic'],
        'black metal': ['black metal'],
        'progressive metal': ['progressive', 'prog'],
        'indie rock': ['indie', 'independent'],
        'punk rock': ['punk', 'hardcore'],
        'hard rock': ['hard rock', 'heavy rock']
    }
    
    for genre, keywords in genre_keywords.items():
        if any(keyword in text for keyword in keywords):
            genres_found[genre] = genres_found.get(genre, 0) + 1

# Conversación sobre géneros
genres_text = ", ".join([f"{genre} ({count} eventos)" for genre, count in sorted(genres_found.items(), key=lambda x: x[1], reverse=True)[:5]])

conversations.append({
    "messages": [
        {
            "role": "system",
            "content": f"Eres un asistente con conocimiento de {len(events)} eventos."
        },
        {
            "role": "user",
            "content": "¿Qué géneros musicales tenéis?"
        },
        {
            "role": "assistant",
            "content": f"Tenemos eventos de diversos géneros: {genres_text}. En total son {len(events)} conciertos de Metal y Rock."
        }
    ]
})

print(f"✅ {len(conversations)} conversaciones generadas")

# Guardar dataset
training_data = {"conversations": conversations}
with open('training_data_github.json', 'w', encoding='utf-8') as f:
    json.dump(training_data, f, indent=2, ensure_ascii=False)

# ============================================
# PASO 3: FINE-TUNING
# ============================================

print("\n🔥 PASO 3: Iniciando fine-tuning...")

MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
OUTPUT_DIR = "./metalhead-github-finetuned"

start_time = time.time()

# Cargar modelo
print(f"\n📥 Cargando {MODEL_NAME}...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto"
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
tokenizer.pad_token = tokenizer.eos_token

print(f"✅ Modelo en GPU: {next(model.parameters()).device}")

# LoRA
model.gradient_checkpointing_enable()
model = prepare_model_for_kbit_training(model)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)

trainable, total = model.get_nb_trainable_parameters()
print(f"\n📊 Entrenables: {trainable:,} ({100 * trainable / total:.2f}%)")

# Preparar textos
texts = []
for conv in conversations:
    text = ""
    for msg in conv['messages']:
        role = msg['role']
        content = msg['content']
        
        if role == "system":
            text += f"<|system|>\n{content}\n\n"
        elif role == "user":
            text += f"
