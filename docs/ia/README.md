# 🤖 Documentación de Inteligencia Artificial

Sistema de IA con Ollama para búsqueda inteligente y chat asistente en la plataforma de ticketing.

---

## 📚 Documentos Disponibles

### 📖 [Documentación Completa](./completa.md)
Guía técnica completa del sistema de IA:
- Arquitectura del sistema
- Infraestructura (Proxmox + Ollama)
- Modelos en producción (v3, v4, search-nlp-v2)
- Fine-tuning con RTX 5070 Ti
- Integración con Angular
- Comandos útiles

### 🚀 [Inicio Rápido](./inicio-rapido.md)
Guía rápida para empezar:
- Resumen de modelos activos
- Entrenamiento en 3 pasos
- Consumo de API desde Angular
- Testing básico
- Troubleshooting común

### 🎓 [Proceso de Entrenamiento](./entrenamiento.md)
Guía paso a paso del entrenamiento:
- Requisitos de hardware/software
- Preparación del entorno
- Extracción de datos desde BD
- Análisis y verificación
- Generación del Modelfile
- Testing y validación
- Scripts completos

### 🔍 [Búsqueda con IA](./busqueda.md)
Sistema de búsqueda NLP:
- Cómo funciona la búsqueda
- Modelo search-nlp-v2
- Ejemplos de búsquedas
- Arquitectura frontend/backend
- Flujo de datos
- Solución de problemas

### 💬 [Chat Flotante](./chat.md)
Asistente conversacional:
- Características del chat
- Modelo metalhead-assistant-v4
- Integración en Angular
- Personalización
- Ejemplos de uso
- Troubleshooting

---

## 🎯 Estado Actual

### Modelos en Producción:
- ✅ **metalhead-assistant-v4** - Chat con datos actualizados
- ✅ **search-nlp-v2** - Búsqueda NLP
- 📦 metalhead-assistant-v3 - Legacy

### API Pública:
```
http://openweb.voro-moran.com/api
```

### Integración:
- ✅ Búsqueda funcionando
- ✅ Chat flotante implementado
- ✅ Mensajes personalizados
- ✅ UI responsive

---

## 🔗 Enlaces Rápidos

- [Ollama API](http://openweb.voro-moran.com/api/tags)
- [OpenWebUI](http://openweb.voro-moran.com/)
- [Repositorio GitHub](https://github.com/voromb/ticketing-platform)

---

**Última actualización:** 9 Noviembre 2025  
**Versión:** 4.0
