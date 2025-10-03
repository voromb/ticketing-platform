BEGIN;

-- 1. Vaciar tabla Event (y dependencias como PriceCategory)
TRUNCATE TABLE public."Event" RESTART IDENTITY CASCADE;

-- 2. Renombrar columnas antiguas
ALTER TABLE public."Event"
    RENAME COLUMN category TO category_text;

ALTER TABLE public."Event"
    RENAME COLUMN subcategory TO subcategory_text;

-- 3. Crear nuevas columnas para FK
ALTER TABLE public."Event"
    ADD COLUMN category_id integer,
    ADD COLUMN subcategory_id integer;

-- 4. Añadir constraints
ALTER TABLE public."Event"
    ADD CONSTRAINT fk_event_category FOREIGN KEY (category_id)
        REFERENCES public."EventCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public."Event"
    ADD CONSTRAINT fk_event_subcategory FOREIGN KEY (subcategory_id)
        REFERENCES public."EventSubcategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- 5. Hacer category_id obligatorio
ALTER TABLE public."Event"
    ALTER COLUMN category_id SET NOT NULL;

-- 6. Eliminar columnas de texto viejas
ALTER TABLE public."Event"
    DROP COLUMN category_text,
    DROP COLUMN subcategory_text;

COMMIT;
