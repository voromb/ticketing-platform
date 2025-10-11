-- =====================================================
-- ARCHIVO 1: MIGRACIÓN DE ESTRUCTURA Y CORRECCIONES
-- =====================================================
-- Este archivo contiene:
-- 1. Agregar slug e images a EventCategory
-- 2. Agregar slug e images a EventSubcategory
-- 3. Corregir TODOS los acentos y Ñ en datos existentes
-- 4. Generar slugs para categorías/subcategorías existentes
-- 5. Eliminar órdenes, tickets y reservations
-- 6. Resetear contadores de ventas
-- =====================================================

BEGIN;

-- =====================================================
-- 1. AGREGAR CAMPOS A EventCategory
-- =====================================================
ALTER TABLE public."EventCategory" 
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- =====================================================
-- 2. AGREGAR CAMPOS A EventSubcategory
-- =====================================================
ALTER TABLE public."EventSubcategory" 
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- =====================================================
-- 3. GENERAR SLUGS PARA CATEGORÍAS EXISTENTES
-- =====================================================
UPDATE public."EventCategory" SET slug = 'rock', images = '{}' WHERE id = 1;
UPDATE public."EventCategory" SET slug = 'metal', images = '{}' WHERE id = 2;

-- =====================================================
-- 4. GENERAR SLUGS PARA SUBCATEGORÍAS EXISTENTES
-- =====================================================
UPDATE public."EventSubcategory" SET slug = 'classic-rock', images = '{}' WHERE id = 1;
UPDATE public."EventSubcategory" SET slug = 'alternative-rock', images = '{}' WHERE id = 2;
UPDATE public."EventSubcategory" SET slug = 'indie-rock', images = '{}' WHERE id = 3;
UPDATE public."EventSubcategory" SET slug = 'punk-rock', images = '{}' WHERE id = 4;
UPDATE public."EventSubcategory" SET slug = 'hard-rock', images = '{}' WHERE id = 5;
UPDATE public."EventSubcategory" SET slug = 'heavy-metal', images = '{}' WHERE id = 6;
UPDATE public."EventSubcategory" SET slug = 'thrash-metal', images = '{}' WHERE id = 7;
UPDATE public."EventSubcategory" SET slug = 'death-metal', images = '{}' WHERE id = 8;
UPDATE public."EventSubcategory" SET slug = 'black-metal', images = '{}' WHERE id = 9;
UPDATE public."EventSubcategory" SET slug = 'power-metal', images = '{}' WHERE id = 10;
UPDATE public."EventSubcategory" SET slug = 'symphonic-metal', images = '{}' WHERE id = 11;
UPDATE public."EventSubcategory" SET slug = 'doom-metal', images = '{}' WHERE id = 12;
UPDATE public."EventSubcategory" SET slug = 'progressive-metal', images = '{}' WHERE id = 13;

-- =====================================================
-- 5. HACER SLUG NOT NULL Y ÚNICO DESPUÉS DE POBLAR
-- =====================================================
ALTER TABLE public."EventCategory" 
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public."EventSubcategory" 
  ALTER COLUMN slug SET NOT NULL;

-- Añadir constraints si no existen
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EventCategory_slug_key') THEN
    ALTER TABLE public."EventCategory" ADD CONSTRAINT "EventCategory_slug_key" UNIQUE (slug);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'EventSubcategory_slug_key') THEN
    ALTER TABLE public."EventSubcategory" ADD CONSTRAINT "EventSubcategory_slug_key" UNIQUE (slug);
  END IF;
END $$;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS "EventCategory_slug_idx" ON public."EventCategory" USING btree (slug);
CREATE INDEX IF NOT EXISTS "EventSubcategory_slug_idx" ON public."EventSubcategory" USING btree (slug);

-- =====================================================
-- 6. CORREGIR ACENTOS Y Ñ EN VENUE
-- =====================================================
UPDATE public."Venue" SET country = 'España' WHERE country LIKE '%Espa%';

UPDATE public."Venue" 
SET description = 'Teatro histórico renovado en 2024, ubicado en el corazón de Valencia'
WHERE id = '001baa5a-7e6c-4561-8aa3-d154f74b6503';

UPDATE public."Venue" 
SET description = 'Sala especializada en conciertos de rock y metal con excelente acústica'
WHERE id = '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0';

UPDATE public."Venue" 
SET description = 'Club íntimo perfecto para tributos, acústicos y bandas emergentes'
WHERE id IN ('a09c3413-4b8e-4605-bf25-7601292e93c1', 'f794e6f0-28c4-4512-ab20-1954720ea984');

UPDATE public."Venue" 
SET description = 'Club underground íntimo para bandas de metal emergentes'
WHERE id = 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e';

UPDATE public."Venue" 
SET name = 'Plaça de Dalt', slug = 'placa-de-dalt'
WHERE id = 'aedfb2d3-7fac-40c2-be1a-f535177ae72c';

UPDATE public."Venue" 
SET name = 'Plaça de Baix', slug = 'placa-de-baix'
WHERE id = 'ed18fb98-1c7f-4859-8f5c-3f3e099cebd3';

-- =====================================================
-- 7. CORREGIR ACENTOS Y Ñ EN EVENT
-- =====================================================
UPDATE public."Event" 
SET description = 'Concierto de rock clásico en Valencia'
WHERE id = '3719c30b-403b-4ba9-8cdc-cd565fc65c86';

UPDATE public."Event" 
SET description = 'Tributo a las leyendas del rock clásico'
WHERE id = 'c7c68ffa-8469-498d-86c3-44f449e0e52b';

UPDATE public."Event" 
SET description = 'Festival de rock en la Plaça de Dalt'
WHERE id = '5e53b4c1-9787-403d-81d7-af96f94ed886';

UPDATE public."Event" 
SET description = 'Noche épica de power metal'
WHERE id = '10a62657-191a-449b-a7c5-c3cf210c7fba';

UPDATE public."Event" 
SET description = 'Concierto íntimo de bandas emergentes'
WHERE id = 'cb12da56-8cf5-45d1-9605-ef0ebfbdbe53';

UPDATE public."Event" 
SET description = 'Festival de metal en la Plaça de Baix'
WHERE id = '4d8eaab2-fe43-4844-99cd-4ab77c64ef42';

UPDATE public."Event" 
SET description = 'Concierto de black metal atmosférico'
WHERE id = '402bed42-00d4-4c56-ba51-650ec4380d46';

UPDATE public."Event" 
SET description = 'Noche de metal sinfónico con orquesta en vivo'
WHERE id = 'fe1932b8-ef55-4957-83c6-d14b86413e3a';

-- =====================================================
-- 8. CORREGIR ACENTOS Y Ñ EN EventLocality
-- =====================================================
UPDATE public."EventLocality" 
SET description = 'Zona VIP con servicios exclusivos y mejor ubicación'
WHERE description LIKE '%ubicaci%n%';

-- =====================================================
-- 9. ELIMINAR ÓRDENES, TICKETS Y RESERVATIONS EXISTENTES
-- =====================================================
-- Como el usuario quiere empezar limpio sin ventas
TRUNCATE TABLE public."Ticket" CASCADE;
TRUNCATE TABLE public."Order" CASCADE;
TRUNCATE TABLE public."Reservation" CASCADE;

-- =====================================================
-- 10. RESETEAR CONTADORES DE VENTAS EN EVENTOS
-- =====================================================
UPDATE public."Event" 
SET "soldTickets" = 0,
    "reservedTickets" = 0,
    "availableTickets" = "totalCapacity";

-- =====================================================
-- 11. RESETEAR CONTADORES EN LOCALIDADES
-- =====================================================
UPDATE public."EventLocality" 
SET "soldTickets" = 0,
    "reservedTickets" = 0,
    "availableTickets" = capacity;

COMMIT;

-- =====================================================
-- MIGRACIÓN COMPLETADA
-- =====================================================
-- Siguiente paso: Ejecutar 02_venues_europa.sql
-- =====================================================