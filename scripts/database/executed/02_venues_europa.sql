-- =====================================================
-- ARCHIVO 2: VENUES DE EUROPA (40 recintos)
-- =====================================================
-- Este archivo contiene venues en ciudades importantes
-- de toda Europa con capacidades y características variadas
-- =====================================================

BEGIN;

-- =====================================================
-- REINO UNIDO
-- =====================================================

-- Londres
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('uk-london-o2-arena', 'The O2 Arena', 'o2-arena-london', 20000, 'Peninsula Square', 'London', 'England', 'United Kingdom', 'SE10 0DX', 51.5033, -0.0031, 'Iconic arena hosting major rock and metal concerts', '{"parking", "restaurants", "bars", "merchandise", "vip-lounges", "accessibility"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('uk-london-roundhouse', 'Roundhouse', 'roundhouse-london', 3300, 'Chalk Farm Road', 'London', 'England', 'United Kingdom', 'NW1 8EH', 51.5434, -0.1520, 'Historic venue known for legendary rock performances', '{"bar", "accessibility", "standing-area", "balcony"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('uk-london-electric-ballroom', 'Electric Ballroom', 'electric-ballroom-london', 1500, '184 Camden High St', 'London', 'England', 'United Kingdom', 'NW1 8QP', 51.5404, -0.1431, 'Legendary Camden venue for rock and punk concerts', '{"bar", "coat-check", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Manchester
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('uk-manchester-arena', 'AO Arena', 'ao-arena-manchester', 21000, 'Victoria Station', 'Manchester', 'England', 'United Kingdom', 'M3 1AR', 53.4881, -2.2447, 'One of Europe''s largest indoor arenas', '{"parking", "restaurants", "bars", "merchandise", "vip-areas"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('uk-manchester-academy', 'Manchester Academy', 'manchester-academy', 2600, 'Oxford Road', 'Manchester', 'England', 'United Kingdom', 'M13 9PR', 53.4665, -2.2324, 'Multi-room venue for rock and alternative music', '{"bar", "accessibility", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Glasgow
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('uk-glasgow-barrowland', 'Barrowland Ballroom', 'barrowland-glasgow', 2100, 'Gallowgate', 'Glasgow', 'Scotland', 'United Kingdom', 'G4 0TS', 55.8542, -4.2324, 'Legendary venue with iconic neon sign', '{"bar", "accessibility", "standing-area"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- FRANCIA
-- =====================================================

-- París
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('fr-paris-accor-arena', 'Accor Arena', 'accor-arena-paris', 20300, 'Boulevard de Bercy', 'Paris', 'Île-de-France', 'France', '75012', 48.8395, 2.3790, 'Major arena for international rock tours', '{"parking", "restaurants", "bars", "merchandise", "vip-lounges"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('fr-paris-olympia', 'L''Olympia', 'olympia-paris', 2000, '28 Boulevard des Capucines', 'Paris', 'Île-de-France', 'France', '75009', 48.8700, 2.3275, 'Historic music hall hosting rock legends', '{"bar", "accessibility", "seating"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('fr-paris-bataclan', 'Le Bataclan', 'bataclan-paris', 1500, '50 Boulevard Voltaire', 'Paris', 'Île-de-France', 'France', '75011', 48.8632, 2.3714, 'Iconic venue for rock and alternative music', '{"bar", "merchandise", "standing-area"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Lyon
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('fr-lyon-halle-tony-garnier', 'Halle Tony Garnier', 'halle-tony-garnier-lyon', 17000, '20 Place Antonin Perrin', 'Lyon', 'Auvergne-Rhône-Alpes', 'France', '69007', 45.7343, 4.8271, 'Large concert hall for major rock events', '{"parking", "bars", "merchandise", "accessibility"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- ALEMANIA
-- =====================================================

-- Berlín
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('de-berlin-mercedes-benz-arena', 'Mercedes-Benz Arena', 'mercedes-benz-arena-berlin', 17000, 'Mercedes-Platz', 'Berlin', 'Berlin', 'Germany', '10243', 52.5064, 13.4437, 'Modern arena hosting international rock acts', '{"parking", "restaurants", "bars", "merchandise", "vip"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('de-berlin-columbiahalle', 'Columbiahalle', 'columbiahalle-berlin', 3500, 'Columbiadamm', 'Berlin', 'Berlin', 'Germany', '10965', 52.4825, 13.3987, 'Popular venue for rock and metal concerts', '{"bar", "merchandise", "coat-check"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Munich
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('de-munich-olympiahalle', 'Olympiahalle', 'olympiahalle-munich', 15500, 'Spiridon-Louis-Ring', 'Munich', 'Bavaria', 'Germany', '80809', 48.1743, 11.5517, 'Olympic venue hosting major concerts', '{"parking", "restaurants", "bars", "accessibility"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('de-munich-backstage', 'Backstage', 'backstage-munich', 1200, 'Reitknechtstraße', 'Munich', 'Bavaria', 'Germany', '80639', 48.1448, 11.5261, 'Alternative venue for underground rock and metal', '{"bar", "outdoor-area", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Hamburgo
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('de-hamburg-barclays-arena', 'Barclays Arena', 'barclays-arena-hamburg', 16000, 'Sylvesterallee', 'Hamburg', 'Hamburg', 'Germany', '22525', 53.5873, 9.8990, 'Multi-purpose arena for concerts and events', '{"parking", "restaurants", "bars", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- ITALIA
-- =====================================================

-- Roma
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('it-rome-palalottomatica', 'Palazzo dello Sport', 'palalottomatica-rome', 11000, 'Piazzale dello Sport', 'Rome', 'Lazio', 'Italy', '00144', 41.8318, 12.4673, 'Major indoor arena for concerts in Rome', '{"parking", "bars", "merchandise", "accessibility"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('it-rome-atlantico', 'Atlantico Live', 'atlantico-rome', 1800, 'Viale dell''Oceano Atlantico', 'Rome', 'Lazio', 'Italy', '00144', 41.8329, 12.4687, 'Popular venue for rock and alternative concerts', '{"bar", "merchandise", "standing-area"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Milán
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('it-milan-mediolanum-forum', 'Mediolanum Forum', 'mediolanum-forum-milan', 12700, 'Via G. di Vittorio', 'Milan', 'Lombardy', 'Italy', '20090', 45.4836, 9.1236, 'Premier concert venue in Milan', '{"parking", "restaurants", "bars", "merchandise", "vip"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('it-milan-alcatraz', 'Alcatraz', 'alcatraz-milan', 3000, 'Via Valtellina', 'Milan', 'Lombardy', 'Italy', '20159', 45.4990, 9.1898, 'Historic venue for rock and metal shows', '{"bar", "merchandise", "coat-check"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- PAÍSES BAJOS
-- =====================================================

-- Ámsterdam
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('nl-amsterdam-ziggo-dome', 'Ziggo Dome', 'ziggo-dome-amsterdam', 17000, 'De Passage', 'Amsterdam', 'North Holland', 'Netherlands', '1101 AX', 52.3138, 4.9389, 'Modern arena hosting major international tours', '{"parking", "restaurants", "bars", "merchandise", "vip"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('nl-amsterdam-melkweg', 'Melkweg', 'melkweg-amsterdam', 1500, 'Lijnbaansgracht', 'Amsterdam', 'North Holland', 'Netherlands', '1017 CW', 52.3644, 4.8819, 'Legendary venue for alternative and rock music', '{"bar", "cafe", "merchandise", "gallery"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('nl-amsterdam-paradiso', 'Paradiso', 'paradiso-amsterdam', 1500, 'Weteringschans', 'Amsterdam', 'North Holland', 'Netherlands', '1017 SG', 52.3619, 4.8830, 'Historic church converted into music venue', '{"bar", "balcony", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- BÉLGICA
-- =====================================================

-- Bruselas
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('be-brussels-forest-national', 'Forest National', 'forest-national-brussels', 8500, 'Avenue Victor Rousseau', 'Brussels', 'Brussels-Capital', 'Belgium', '1190', 50.8108, 4.3182, 'Major concert hall in Brussels', '{"parking", "bars", "merchandise", "accessibility"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('be-brussels-ancienne-belgique', 'Ancienne Belgique', 'ancienne-belgique-brussels', 2000, 'Boulevard Anspach', 'Brussels', 'Brussels-Capital', 'Belgium', '1000', 50.8500, 4.3487, 'Historic venue for rock and alternative music', '{"bar", "multiple-rooms", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- PORTUGAL
-- =====================================================

-- Lisboa
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('pt-lisbon-altice-arena', 'Altice Arena', 'altice-arena-lisbon', 20000, 'Rossio dos Olivais', 'Lisbon', 'Lisbon', 'Portugal', '1990-231', 38.7683, -9.0948, 'Largest indoor arena in Portugal', '{"parking", "restaurants", "bars", "merchandise", "vip"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('pt-lisbon-lav', 'LAV - Lisboa ao Vivo', 'lav-lisbon', 2500, 'Rua Açores', 'Lisbon', 'Lisbon', 'Portugal', '1000-003', 38.7223, -9.1393, 'Modern venue for rock and metal concerts', '{"bar", "merchandise", "parking"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Porto
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('pt-porto-coliseu', 'Coliseu do Porto', 'coliseu-porto', 3200, 'Rua de Passos Manuel', 'Porto', 'Porto', 'Portugal', '4000-385', 41.1496, -8.6069, 'Historic venue with excellent acoustics', '{"bar", "seating", "accessibility", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- AUSTRIA
-- =====================================================

-- Viena
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('at-vienna-stadthalle', 'Wiener Stadthalle', 'stadthalle-vienna', 16000, 'Vogelweidplatz', 'Vienna', 'Vienna', 'Austria', '1150', 48.2027, 16.3352, 'Multi-purpose venue for major concerts', '{"parking", "restaurants", "bars", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW()),
('at-vienna-gasometer', 'Gasometer', 'gasometer-vienna', 3500, 'Guglgasse', 'Vienna', 'Vienna', 'Austria', '1110', 48.1852, 16.4208, 'Converted gasometer hosting rock concerts', '{"bar", "merchandise", "unique-architecture"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- SUIZA
-- =====================================================

-- Zúrich
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('ch-zurich-hallenstadion', 'Hallenstadion', 'hallenstadion-zurich', 13000, 'Wallisellenstrasse', 'Zurich', 'Zurich', 'Switzerland', '8050', 47.4109, 8.5498, 'Major arena for international rock tours', '{"parking", "restaurants", "bars", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- ESCANDINAVIA
-- =====================================================

-- Estocolmo
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('se-stockholm-ericsson-globe', 'Avicii Arena', 'avicii-arena-stockholm', 16000, 'Globentorget', 'Stockholm', 'Stockholm', 'Sweden', '121 77', 59.2936, 18.0839, 'Iconic spherical arena for major concerts', '{"parking", "restaurants", "bars", "merchandise", "vip"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Oslo
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('no-oslo-spektrum', 'Oslo Spektrum', 'oslo-spektrum', 9700, 'Sonja Henies plass', 'Oslo', 'Oslo', 'Norway', '0185', 59.9127, 10.7560, 'Premier concert venue in Norway', '{"parking", "bars", "merchandise", "accessibility"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Copenhague
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('dk-copenhagen-royal-arena', 'Royal Arena', 'royal-arena-copenhagen', 16000, 'Hannemanns Allé', 'Copenhagen', 'Capital Region', 'Denmark', '2300', 55.6350, 12.5773, 'Modern multi-purpose arena', '{"parking", "restaurants", "bars", "merchandise", "vip"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- =====================================================
-- EUROPA DEL ESTE
-- =====================================================

-- Praga
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('cz-prague-o2-arena', 'O2 Arena Prague', 'o2-arena-prague', 18000, 'Českomoravská', 'Prague', 'Prague', 'Czech Republic', '190 00', 50.1032, 14.4749, 'Largest arena in Czech Republic', '{"parking", "restaurants", "bars", "merchandise", "vip"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Varsovia
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('pl-warsaw-torwar', 'Torwar Hall', 'torwar-warsaw', 4800, 'Łazienkowska', 'Warsaw', 'Mazovia', 'Poland', '00-449', 52.2189, 21.0370, 'Historic venue for rock concerts', '{"parking", "bar", "merchandise"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

-- Atenas
INSERT INTO public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") VALUES
('gr-athens-oaka', 'Olympic Indoor Hall', 'oaka-athens', 18000, 'Leof. Spyrou Loui', 'Athens', 'Attica', 'Greece', '151 23', 38.0366, 23.7847, 'Olympic venue hosting major concerts', '{"parking", "bars", "merchandise", "accessibility"}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', NOW(), NOW());

COMMIT;

-- =====================================================
-- 40 VENUES DE EUROPA CREADOS
-- =====================================================
-- Siguiente paso: Ejecutar 03_venues_espana.sql
-- =====================================================