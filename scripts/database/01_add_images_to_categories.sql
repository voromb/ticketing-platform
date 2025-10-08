-- Migration: Agregar campos de imágenes a EventCategory y EventSubcategory
-- Fecha: 2025-10-07

-- Agregar campos de imágenes a EventCategory
ALTER TABLE "EventCategory" 
  ADD COLUMN IF NOT EXISTS "icon" TEXT,
  ADD COLUMN IF NOT EXISTS "image" TEXT,
  ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Agregar campos de imágenes a EventSubcategory
ALTER TABLE "EventSubcategory"
  ADD COLUMN IF NOT EXISTS "icon" TEXT,
  ADD COLUMN IF NOT EXISTS "image" TEXT,
  ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Comentarios
COMMENT ON COLUMN "EventCategory"."icon" IS 'Icono pequeño para UI (URL o ruta)';
COMMENT ON COLUMN "EventCategory"."image" IS 'Imagen principal de la categoría';
COMMENT ON COLUMN "EventCategory"."images" IS 'Array de imágenes adicionales';

COMMENT ON COLUMN "EventSubcategory"."icon" IS 'Icono pequeño para UI (URL o ruta)';
COMMENT ON COLUMN "EventSubcategory"."image" IS 'Imagen principal de la subcategoría';
COMMENT ON COLUMN "EventSubcategory"."images" IS 'Array de imágenes adicionales';
