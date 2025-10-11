-- =====================================================
-- ARCHIVO 3: VENUES DE ESPAÑA (40 recintos)
-- =====================================================
-- Este archivo contiene venues en ciudades importantes
-- de toda España con capacidades y características variadas
-- Los 10 venues existentes de Valencia se mantienen
-- =====================================================

BEGIN;

-- =====================================================
-- MADRID
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-madrid-wizink-center', 'WiZink Center', 'wizink-center-madrid', 17000, 'Avenida Felipe II s/n', 'Madrid', 'Madrid', 'España', '28009', 40.4222, -3.6692, 'Principal recinto cubierto de Madrid para grandes conciertos', '{"parking", "restaurantes", "bares", "tienda", "vip", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-madrid-la-riviera', 'Sala La Riviera', 'la-riviera-madrid', 2500, 'Paseo Bajo de la Virgen del Puerto s/n', 'Madrid', 'Madrid', 'España', '28005', 40.4148, -3.7220, 'Sala mítica de Madrid con terraza exterior', '{"bar", "terraza", "guardarropa", "tienda"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-madrid-but', 'Sala But', 'but-madrid', 1200, 'Calle de Barceló 11', 'Madrid', 'Madrid', 'España', '28004', 40.4286, -3.7013, 'Sala alternativa en el corazón de Madrid', '{"bar", "guardarropa", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-madrid-moby-dick', 'Sala Moby Dick', 'moby-dick-madrid', 900, 'Avenida de Brasil 5', 'Madrid', 'Madrid', 'España', '28020', 40.4565, -3.6927, 'Referente del rock en Madrid desde hace décadas', '{"bar", "aire-acondicionado", "sonido-profesional"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-madrid-arena', 'Madrid Arena', 'madrid-arena', 12000, 'Avenida de Portugal s/n', 'Madrid', 'Madrid', 'España', '28011', 40.3986, -3.7539, 'Gran pabellón para festivales y macroconciertos', '{"parking", "bares", "food-trucks", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- BARCELONA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-barcelona-palau-sant-jordi', 'Palau Sant Jordi', 'palau-sant-jordi-barcelona', 17000, 'Passeig Olímpic 5-7', 'Barcelona', 'Cataluña', 'España', '08038', 41.3647, 2.1532, 'Emblemático pabellón olímpico para grandes conciertos', '{"parking", "restaurantes", "bares", "tienda", "vip"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-barcelona-razzmatazz', 'Sala Razzmatazz', 'razzmatazz-barcelona', 3000, 'Carrer dels Almogàvers 122', 'Barcelona', 'Cataluña', 'España', '08018', 41.3959, 2.1911, 'Complejo con 5 salas para todo tipo de conciertos', '{"bar", "multiple-salas", "guardarropa", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-barcelona-apolo', 'Sala Apolo', 'apolo-barcelona', 1600, 'Carrer Nou de la Rambla 113', 'Barcelona', 'Cataluña', 'España', '08004', 41.3742, 2.1683, 'Histórica sala de conciertos en el Paral·lel', '{"bar", "terraza", "disco", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-barcelona-bikini', 'Sala Bikini', 'bikini-barcelona', 900, 'Avinguda Diagonal 547', 'Barcelona', 'Cataluña', 'España', '08029', 41.3880, 2.1341, 'Clásico barcelonés desde los años 50', '{"bar", "terraza", "parking", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-barcelona-sant-jordi-club', 'Sant Jordi Club', 'sant-jordi-club-barcelona', 4500, 'Passeig Olímpic 5-7', 'Barcelona', 'Cataluña', 'España', '08038', 41.3645, 2.1528, 'Sala versátil junto al Palau Sant Jordi', '{"parking", "bar", "merchandising", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- SEVILLA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-sevilla-cartuja-center', 'Cartuja Center', 'cartuja-center-sevilla', 7000, 'Camino de los Descubrimientos s/n', 'Sevilla', 'Andalucía', 'España', '41092', 37.4042, -5.9978, 'Complejo para eventos y conciertos en La Cartuja', '{"parking", "bares", "restaurantes", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-sevilla-custom', 'Sala Custom', 'custom-sevilla', 1200, 'Calle Matemáticos Rey Pastor y Castro 1', 'Sevilla', 'Andalucía', 'España', '41092', 37.4078, -5.9943, 'Referente del rock y metal en Sevilla', '{"bar", "parking", "aire-acondicionado"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- BILBAO
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-bilbao-bizkaia-arena', 'Bizkaia Arena', 'bizkaia-arena-bilbao', 18640, 'Ronda de Azkue 1', 'Bilbao', 'País Vasco', 'España', '48902', 43.3010, -2.9459, 'Mayor recinto cubierto del País Vasco', '{"parking", "restaurantes", "bares", "tienda", "vip"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-bilbao-kafe-antzokia', 'Kafe Antzokia', 'kafe-antzokia-bilbao', 1500, 'Calle San Vicente 2', 'Bilbao', 'País Vasco', 'España', '48001', 43.2582, -2.9264, 'Emblemática sala de rock en el Casco Viejo', '{"bar", "restaurante", "terraza", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- ZARAGOZA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-zaragoza-pabellon-principe-felipe', 'Pabellón Príncipe Felipe', 'pabellon-principe-felipe-zaragoza', 10800, 'Eduardo Ibarra 5', 'Zaragoza', 'Aragón', 'España', '50009', 41.6324, -0.9096, 'Principal pabellón para conciertos en Zaragoza', '{"parking", "bar", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-zaragoza-sala-lopez', 'Sala López', 'sala-lopez-zaragoza', 800, 'Calle Ponzano 7', 'Zaragoza', 'Aragón', 'España', '50003', 41.6496, -0.8876, 'Mítica sala de rock zaragozana', '{"bar", "guardarropa"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- MÁLAGA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-malaga-martin-carpena', 'Palacio de Deportes Martín Carpena', 'martin-carpena-malaga', 11300, 'Paseo Martiricos 14', 'Málaga', 'Andalucía', 'España', '29011', 36.7159, -4.4396, 'Principal recinto para grandes eventos en Málaga', '{"parking", "bares", "restaurantes", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-malaga-trinchera', 'Sala La Trinchera', 'la-trinchera-malaga', 600, 'Plaza de la Solidaridad 10', 'Málaga', 'Andalucía', 'España', '29002', 36.7167, -4.4201, 'Sala underground para rock y metal', '{"bar", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- MURCIA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-murcia-garaje-beat', 'Sala Garaje Beat Club', 'garaje-beat-murcia', 750, 'Calle Universidad 8', 'Murcia', 'Murcia', 'España', '30001', 37.9886, -1.1299, 'Referente del rock alternativo en Murcia', '{"bar", "terraza", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- ALICANTE
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-alicante-plaza-toros', 'Plaza de Toros de Alicante', 'plaza-toros-alicante', 15000, 'Plaza de España s/n', 'Alicante', 'Comunidad Valenciana', 'España', '03001', 38.3453, -0.4897, 'Plaza de toros adaptada para festivales de rock', '{"parking", "bares", "food-trucks"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-alicante-the-music-republic', 'The Music Republic', 'the-music-republic-alicante', 1000, 'Calle San Fernando 51', 'Alicante', 'Comunidad Valenciana', 'España', '03001', 38.3436, -0.4907, 'Sala moderna para rock y música alternativa', '{"bar", "terraza", "aire-acondicionado"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- PALMA DE MALLORCA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-palma-son-fusteret', 'Velódromo Son Fusteret', 'son-fusteret-palma', 6000, 'Carrer de Gremi Corredors 16', 'Palma de Mallorca', 'Islas Baleares', 'España', '07009', 39.5836, 2.6503, 'Velódromo adaptado para conciertos al aire libre', '{"parking", "bar", "food-trucks"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-palma-es-gremi', 'Es Gremi', 'es-gremi-palma', 800, 'Carrer de Gremi de Teixidors 26', 'Palma de Mallorca', 'Islas Baleares', 'España', '07009', 39.5842, 2.6489, 'Sala de referencia para rock en Palma', '{"bar", "merchandising", "parking"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- LAS PALMAS DE GRAN CANARIA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-laspalmas-gran-canaria-arena', 'Gran Canaria Arena', 'gran-canaria-arena', 11000, 'Calle Fondos de Segura s/n', 'Las Palmas de Gran Canaria', 'Canarias', 'España', '35019', 28.0996, -15.4537, 'Principal recinto cubierto de Canarias', '{"parking", "restaurantes", "bares", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- VALLADOLID
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-valladolid-lava', 'Sala Lava', 'lava-valladolid', 900, 'Calle San Quirce 10', 'Valladolid', 'Castilla y León', 'España', '47004', 41.6516, -4.7302, 'Sala de rock en el centro de Valladolid', '{"bar", "guardarropa", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- GRANADA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-granada-industrial-copera', 'Industrial Copera', 'industrial-copera-granada', 2500, 'Camino de Purchil s/n', 'Granada', 'Andalucía', 'España', '18004', 37.1529, -3.6087, 'Espacio industrial para conciertos y festivales', '{"parking", "bar", "food-trucks", "terraza"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-granada-planta-baja', 'Sala Planta Baja', 'planta-baja-granada', 600, 'Calle Horno de Abad 11', 'Granada', 'Andalucía', 'España', '18002', 37.1739, -3.5974, 'Sala alternativa en pleno centro', '{"bar", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- VIGO
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-vigo-pazo-cultura', 'Pazo da Cultura', 'pazo-cultura-vigo', 1500, 'Rúa Vázquez Varela s/n', 'Vigo', 'Galicia', 'España', '36201', 42.2328, -8.7119, 'Centro cultural con sala de conciertos', '{"parking", "bar", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- GIJÓN
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-gijon-plaza-toros', 'Plaza de Toros El Bibio', 'el-bibio-gijon', 12000, 'Camino de la Providencia s/n', 'Gijón', 'Asturias', 'España', '33203', 43.5365, -5.6371, 'Plaza convertida en espacio para festivales', '{"parking", "bares", "food-trucks"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- SANTANDER
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-santander-escenario-santander', 'Escenario Santander', 'escenario-santander', 3000, 'Campa de la Magdalena s/n', 'Santander', 'Cantabria', 'España', '39005', 43.4623, -3.7894, 'Escenario al aire libre junto a la bahía', '{"parking", "bar", "vistas-mar"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- SAN SEBASTIÁN
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-donostia-kursaal', 'Auditorio Kursaal', 'kursaal-donostia', 1800, 'Avenida de Zurriola 1', 'San Sebastián', 'País Vasco', 'España', '20002', 43.3228, -1.9764, 'Icónico auditorio con vistas al mar', '{"parking", "restaurante", "bar", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('es-donostia-dabadaba', 'Sala Dabadaba', 'dabadaba-donostia', 800, 'Paseo de Salamanca 3', 'San Sebastián', 'País Vasco', 'España', '20003', 43.3158, -1.9854, 'Sala de referencia para música alternativa', '{"bar", "terraza", "merchandising"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- PAMPLONA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-pamplona-baluarte', 'Palacio de Congresos Baluarte', 'baluarte-pamplona', 2200, 'Plaza del Baluarte s/n', 'Pamplona', 'Navarra', 'España', '31002', 42.8170, -1.6396, 'Palacio de congresos con sala de conciertos', '{"parking", "bar", "restaurante", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- SANTIAGO DE COMPOSTELA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-santiago-sala-capitol', 'Sala Capitol', 'sala-capitol-santiago', 1600, 'Rúa do Hórreo 1', 'Santiago de Compostela', 'Galicia', 'España', '15702', 42.8782, -8.5448, 'Sala multiusos para conciertos y eventos', '{"parking", "bar", "guardarropa"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- CÓRDOBA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-cordoba-palacio-congresos', 'Palacio de Congresos de Córdoba', 'palacio-congresos-cordoba', 2500, 'Calle Torrijos 10', 'Córdoba', 'Andalucía', 'España', '14003', 37.8810, -4.7792, 'Centro de congresos para eventos musicales', '{"parking", "restaurante", "bar", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- A CORUÑA
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-coruna-coliseum', 'Coliseum da Coruña', 'coliseum-coruna', 10500, 'Calle de la Torre de Hércules s/n', 'A Coruña', 'Galicia', 'España', '15002', 43.3623, -8.4115, 'Gran pabellón para conciertos y eventos', '{"parking", "bar", "restaurante", "accesibilidad"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- OVIEDO
-- =====================================================

INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('es-oviedo-principe-felipe', 'Auditorio Príncipe Felipe', 'principe-felipe-oviedo', 2200, 'Calle Severo Ochoa s/n', 'Oviedo', 'Asturias', 'España', '33006', 43.3553, -5.8680, 'Auditorio moderno para todo tipo de eventos', '{"parking", "bar", "accesibilidad", "restaurante"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

COMMIT;

-- =====================================================
-- 40 VENUES DE ESPAÑA CREADOS
-- =====================================================
-- Total venues en la base de datos: 90 (10 Valencia + 40 Europa + 40 España)
-- Siguiente paso: Generar eventos con generate-events.js
-- =====================================================