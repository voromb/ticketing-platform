--
-- PostgreSQL database dump
--

\restrict TWluDmHMKcpFUjng7Eoo6rLJutk3tcKxp2dWh9q5mfoHgEXQiH24rBfuLcfCe8s

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: admin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: EventStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."EventStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'SOLD_OUT',
    'CANCELLED',
    'COMPLETED',
    'SUSPENDED'
);


ALTER TYPE public."EventStatus" OWNER TO admin;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'MANAGER',
    'VIEWER'
);


ALTER TYPE public."UserRole" OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "tableName" text NOT NULL,
    "recordId" text NOT NULL,
    action text NOT NULL,
    "fieldName" text,
    "oldValue" jsonb,
    "newValue" jsonb,
    "adminId" text NOT NULL,
    "eventId" text,
    "ipAddress" text,
    "userAgent" text,
    "sessionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO admin;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    slug text NOT NULL,
    status public."EventStatus" DEFAULT 'DRAFT'::public."EventStatus" NOT NULL,
    "eventDate" timestamp(3) without time zone NOT NULL,
    "doorsOpenTime" timestamp(3) without time zone,
    "saleStartDate" timestamp(3) without time zone NOT NULL,
    "saleEndDate" timestamp(3) without time zone NOT NULL,
    "venueId" text NOT NULL,
    "totalCapacity" integer NOT NULL,
    "availableTickets" integer NOT NULL,
    "reservedTickets" integer DEFAULT 0 NOT NULL,
    "soldTickets" integer DEFAULT 0 NOT NULL,
    category text NOT NULL,
    subcategory text,
    tags text[],
    "bannerImage" text,
    "thumbnailImage" text,
    images text[],
    "minPrice" numeric(10,2) NOT NULL,
    "maxPrice" numeric(10,2) NOT NULL,
    "ageRestriction" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    metadata jsonb
);


ALTER TABLE public."Event" OWNER TO admin;

--
-- Name: PriceCategory; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."PriceCategory" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "totalTickets" integer NOT NULL,
    "availableTickets" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    capacity integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb,
    "sectionId" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PriceCategory" OWNER TO admin;

--
-- Name: Venue; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Venue" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    capacity integer NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text,
    country text DEFAULT 'España'::text NOT NULL,
    "postalCode" text NOT NULL,
    latitude double precision,
    longitude double precision,
    description text,
    amenities text[],
    images text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Venue" OWNER TO admin;

--
-- Name: VenueSection; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."VenueSection" (
    id text NOT NULL,
    "venueId" text NOT NULL,
    name text NOT NULL,
    capacity integer NOT NULL,
    "rowCount" integer,
    "seatsPerRow" integer
);


ALTER TABLE public."VenueSection" OWNER TO admin;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO admin;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.admins (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    role public."UserRole" DEFAULT 'ADMIN'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.admins OWNER TO admin;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."AuditLog" (id, "tableName", "recordId", action, "fieldName", "oldValue", "newValue", "adminId", "eventId", "ipAddress", "userAgent", "sessionId", "createdAt") FROM stdin;
b00d6b31-bf1e-4300-881f-b9ab089de128	Venue	001baa5a-7e6c-4561-8aa3-d154f74b6503	CREATE	\N	\N	{"id": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "city": "Valencia", "name": "Teatro Principal Valencia", "slug": "teatro-principal-valencia", "state": "Valencia", "images": [], "address": "Calle Mayor 1", "country": "España", "capacity": 1500, "isActive": true, "latitude": null, "sections": [{"id": "47940a17-b99c-46c8-9134-476eb1ad234c", "name": "Platea", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 800, "rowCount": 20, "seatsPerRow": 40}, {"id": "9c5bfee9-bf32-4b60-a79d-632fc757c1a1", "name": "Tribuna", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 500, "rowCount": 15, "seatsPerRow": 34}, {"id": "1e6a9781-0693-46de-87e2-b74883cccef9", "name": "VIP", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 200, "rowCount": 5, "seatsPerRow": 40}], "amenities": ["parking", "wifi", "accesibilidad", "cafeteria"], "createdAt": "2025-09-26T17:05:01.928Z", "createdBy": {"id": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "email": "admin@ticketing.com", "lastName": "User", "firstName": "Admin"}, "longitude": null, "updatedAt": "2025-09-26T17:05:01.928Z", "postalCode": "46001", "createdById": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "description": "Teatro histórico en el centro de Valencia"}	467a0b9f-5cd9-46b0-8905-621bc92a8664	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26100; es-ES) PowerShell/7.5.3	\N	2025-09-26 17:05:01.945
7dd2c2cd-92d0-4379-9175-6615d7321d15	Venue	001baa5a-7e6c-4561-8aa3-d154f74b6503	UPDATE	\N	{"id": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "city": "Valencia", "name": "Teatro Principal Valencia", "slug": "teatro-principal-valencia", "state": "Valencia", "images": [], "address": "Calle Mayor 1", "country": "España", "capacity": 1500, "isActive": true, "latitude": null, "sections": [{"id": "47940a17-b99c-46c8-9134-476eb1ad234c", "name": "Platea", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 800, "rowCount": 20, "seatsPerRow": 40}, {"id": "9c5bfee9-bf32-4b60-a79d-632fc757c1a1", "name": "Tribuna", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 500, "rowCount": 15, "seatsPerRow": 34}, {"id": "1e6a9781-0693-46de-87e2-b74883cccef9", "name": "VIP", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 200, "rowCount": 5, "seatsPerRow": 40}], "amenities": ["parking", "wifi", "accesibilidad", "cafeteria"], "createdAt": "2025-09-26T17:05:01.928Z", "longitude": null, "updatedAt": "2025-09-26T17:05:01.928Z", "postalCode": "46001", "createdById": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "description": "Teatro histórico en el centro de Valencia"}	{"id": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "city": "Valencia", "name": "Teatro Principal Valencia", "slug": "teatro-principal-valencia", "state": "Valencia", "images": [], "address": "Calle Mayor 1", "country": "España", "capacity": 1500, "isActive": true, "latitude": null, "sections": [{"id": "47940a17-b99c-46c8-9134-476eb1ad234c", "name": "Platea", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 800, "rowCount": 20, "seatsPerRow": 40}, {"id": "9c5bfee9-bf32-4b60-a79d-632fc757c1a1", "name": "Tribuna", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 500, "rowCount": 15, "seatsPerRow": 34}, {"id": "1e6a9781-0693-46de-87e2-b74883cccef9", "name": "VIP", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 200, "rowCount": 5, "seatsPerRow": 40}], "amenities": ["parking", "wifi", "accesibilidad", "cafeteria", "restaurante"], "createdAt": "2025-09-26T17:05:01.928Z", "createdBy": {"id": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "email": "admin@ticketing.com", "lastName": "User", "firstName": "Admin"}, "longitude": null, "updatedAt": "2025-09-26T17:06:22.435Z", "postalCode": "46001", "createdById": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "description": "Teatro histórico renovado en 2024, ubicado en el corazón de Valencia"}	467a0b9f-5cd9-46b0-8905-621bc92a8664	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26100; es-ES) PowerShell/7.5.3	\N	2025-09-26 17:06:22.444
5ed9588a-252e-4a20-9076-b79c6dbd5893	Venue	eedf995f-f060-4105-81b5-8b46dd58be37	CREATE	\N	\N	{"id": "eedf995f-f060-4105-81b5-8b46dd58be37", "city": "Valencia", "name": "Palau de les Arts", "slug": "palau-de-les-arts", "state": null, "images": [], "address": "Av. del Professor López Piñero 1", "country": "España", "capacity": 1800, "isActive": true, "latitude": null, "sections": [], "amenities": ["parking", "restaurante", "tienda"], "createdAt": "2025-09-26T17:06:42.338Z", "createdBy": {"id": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "email": "admin@ticketing.com", "lastName": "User", "firstName": "Admin"}, "longitude": null, "updatedAt": "2025-09-26T17:06:42.338Z", "postalCode": "46013", "createdById": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "description": "Opera house de Valencia"}	467a0b9f-5cd9-46b0-8905-621bc92a8664	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26100; es-ES) PowerShell/7.5.3	\N	2025-09-26 17:06:42.344
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Event" (id, name, description, slug, status, "eventDate", "doorsOpenTime", "saleStartDate", "saleEndDate", "venueId", "totalCapacity", "availableTickets", "reservedTickets", "soldTickets", category, subcategory, tags, "bannerImage", "thumbnailImage", images, "minPrice", "maxPrice", "ageRestriction", "createdById", "createdAt", "updatedAt", "publishedAt", "cancelledAt", "completedAt", metadata) FROM stdin;
63b9eba6-e1e5-4cbb-9106-eb2cf57cea94	Valencia Metal Battle 2024	Competencia de bandas locales de metal - ¡Ven a apoyar a tu banda favorita!	valencia-metal-battle-2024	ACTIVE	2024-11-15 19:00:00	\N	2024-10-01 10:00:00	2024-11-14 23:59:59	a09c3413-4b8e-4605-bf25-7601292e93c1	700	700	0	0	ROCK_METAL_CONCERT	METALCORE|BATTLE_OF_BANDS	{metalcore,battle_of_bands,"banda ganadora tbd"}	\N	\N	\N	15.00	35.00	+16	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:41:50.988	2025-09-27 14:51:26.895	\N	\N	\N	\N
1c5124e5-f37e-49cf-9197-684f502a1f17	Test Metal Event	CONCERT de HEAVY_METAL con Test Band	test-metal-event-simple	ACTIVE	2024-12-01 20:00:00	\N	2024-11-01 10:00:00	2024-11-30 23:59:59	a09c3413-4b8e-4605-bf25-7601292e93c1	500	500	0	0	ROCK_METAL_CONCERT	HEAVY_METAL|CONCERT	{heavy_metal,concert,"test band"}	\N	\N	\N	30.00	80.00	+16	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:41:09.571	2025-09-27 14:51:47.824	\N	\N	\N	\N
160b15f9-3ace-4311-82a0-c7563d27254a	Nightwish Symphonic Tour	Una noche mágica de metal sinfónico con orquesta en vivo	nightwish-symphonic-tour-valencia-2024	ACTIVE	2024-12-10 20:00:00	\N	2024-10-15 10:00:00	2024-12-09 23:59:59	8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	2300	2300	0	0	ROCK_METAL_CONCERT	SYMPHONIC_METAL|CONCERT	{symphonic_metal,concert,nightwish}	\N	\N	\N	55.00	180.00	+14	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:41:53.038	2025-09-27 14:52:01.497	\N	\N	\N	\N
719d16ad-4645-4c49-96af-7aef8b3f0bd0	pipi	caca	pipi	DRAFT	2025-09-28 18:14:00	\N	2025-09-27 18:15:19.408	2025-09-27 18:14:00	8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	10000	10000	0	0	ROCK_METAL_CONCERT	HEAVY_METAL|CONCERT	{heavy_metal,concert,culo}	\N	\N	\N	30.00	50.00	+16	26fa8809-a1a4-4242-9d09-42e65e5ee368	2025-09-27 18:15:19.427	2025-09-27 18:15:19.427	\N	\N	\N	\N
83de8d3d-047c-4036-822a-5fe7ef498424	Provando 	uno	provando-	ACTIVE	2025-09-28 15:38:00	\N	2025-09-27 18:25:59.315	2025-09-27 15:38:00	8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	5000	5000	0	0	ROCK_METAL_CONCERT	HEAVY_METAL|CONCERT	{heavy_metal,concert,helloween}	\N	\N	\N	30.00	50.00	+16	26fa8809-a1a4-4242-9d09-42e65e5ee368	2025-09-27 17:38:22.007	2025-09-27 18:25:59.329	\N	\N	\N	\N
63b945e8-b1ec-4dfb-8bcb-7506c1bfa11b	Metallica World Tour Valencia	Metallica en Valencia - Una noche épica de thrash metal	metallica-world-tour-valencia-2024	ACTIVE	2024-09-20 20:00:00	\N	2024-07-01 10:00:00	2024-09-19 23:59:59	8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	2200	2200	0	0	ROCK_METAL_CONCERT	THRASH_METAL|CONCERT	{thrash_metal,concert,metallica}	\N	\N	\N	75.00	250.00	+16	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:41:46.865	2025-09-27 14:50:55.913	\N	\N	\N	\N
73e827cc-252c-4225-b17c-04644779aaf9	Tributo Acústico a Black Sabbath	Una noche íntima con los clásicos de Black Sabbath en versión acústica	tributo-acustico-black-sabbath-2024	ACTIVE	2024-10-31 20:30:00	\N	2024-09-01 10:00:00	2024-10-30 23:59:59	a09c3413-4b8e-4605-bf25-7601292e93c1	600	600	0	0	ROCK_METAL_CONCERT	DOOM_METAL|TRIBUTE	{doom_metal,tribute,"sabbath unplugged"}	\N	\N	\N	25.00	60.00	+18	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:41:48.934	2025-09-27 14:51:14.285	\N	\N	\N	\N
1eadb7d9-3b10-4254-8d0f-74b9ae9cf8eb	Valencia Metal Fest 2024	El festival de heavy metal más grande de Valencia con las leyendas del metal	valencia-metal-fest-2024	DRAFT	2024-08-15 18:00:00	\N	2024-06-01 10:00:00	2024-08-14 23:59:59	8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	12000	12000	0	0	ROCK_METAL_CONCERT	HEAVY_METAL|FESTIVAL	{heavy_metal,festival,"iron maiden"}	\N	\N	\N	65.00	200.00	+16	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:41:44.808	2025-09-27 18:30:28.14	\N	\N	\N	\N
\.


--
-- Data for Name: PriceCategory; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."PriceCategory" (id, "eventId", name, description, price, "totalTickets", "availableTickets", "isActive", capacity, "createdAt", metadata, "sectionId", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Venue; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") FROM stdin;
001baa5a-7e6c-4561-8aa3-d154f74b6503	Teatro Principal Valencia	teatro-principal-valencia	1500	Calle Mayor 1	Valencia	Valencia	España	46001	\N	\N	Teatro histórico renovado en 2024, ubicado en el corazón de Valencia	{parking,wifi,accesibilidad,cafeteria,restaurante}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 17:05:01.928	2025-09-26 17:06:22.435
eedf995f-f060-4105-81b5-8b46dd58be37	Palau de les Arts	palau-de-les-arts	1800	Av. del Professor López Piñero 1	Valencia	\N	España	46013	\N	\N	Opera house de Valencia	{parking,restaurante,tienda}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 17:06:42.338	2025-09-26 17:06:42.338
8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	Recinto Ferial Valencia Rock	recinto-ferial-valencia-rock	15000	Av. de las Ferias s/n	Valencia	Valencia	España	46035	\N	\N	Recinto al aire libre ideal para festivales de rock y metal	{parking,food-trucks,merchandise-stands,security,medical-post}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:22:41.999	2025-09-26 20:22:41.999
8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	Sala Rockstar Valencia	sala-rockstar-valencia	2500	Calle del Rock 15	Valencia	Valencia	España	46001	\N	\N	Sala especializada en conciertos de rock y metal con excelente acústica	{bar,merchandise,coat-check,professional-sound,stage-lighting}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:22:44.081	2025-09-26 20:22:44.081
a09c3413-4b8e-4605-bf25-7601292e93c1	Metal Underground Club	metal-underground-club	800	Calle Subterránea 7	Valencia	Valencia	España	46002	\N	\N	Club íntimo perfecto para tributos, acústicos y bandas emergentes	{bar,stage,sound-system,intimate-atmosphere}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:22:46.14	2025-09-26 20:22:46.14
1156c683-d97e-4c3f-b5fe-70e28b5d9aaa	Test Venue	test-venue-simple	1000	Test Address	Valencia	\N	España	46001	\N	\N	\N	{}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:26:57.007	2025-09-26 20:26:57.007
6041a699-2a83-4518-b458-5db09b90c31a	Recinto Ferial Valencia Rock	recinto-ferial-valencia-rock-2024	15000	Av. de las Ferias s/n	Valencia	Valencia	España	46035	\N	\N	Recinto al aire libre ideal para festivales de rock y metal	{parking,food-trucks,merchandise-stands,security,medical-post}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:29:14.471	2025-09-26 20:29:14.471
56bcb5a9-59c0-4476-b69c-649acfec88d4	Sala Rockstar Valencia	sala-rockstar-valencia-2024	2500	Calle del Rock 15	Valencia	Valencia	España	46001	\N	\N	Sala especializada en conciertos de rock y metal con excelente acústica	{bar,merchandise,coat-check,professional-sound,stage-lighting}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:29:16.527	2025-09-26 20:29:16.527
f794e6f0-28c4-4512-ab20-1954720ea984	Metal Underground Club	metal-underground-club-2024	800	Calle Subterránea 7	Valencia	Valencia	España	46002	\N	\N	Club íntimo perfecto para tributos, acústicos y bandas emergentes	{bar,stage,sound-system,intimate-atmosphere}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:29:18.582	2025-09-26 20:29:18.582
e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e	Metal Cave Club	metal-cave-club-valencia	600	Calle Underground 13	Valencia	Valencia	España	46003	\N	\N	Club underground íntimo para bandas de metal emergentes	{bar,stage,sound-system,intimate-atmosphere}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-27 12:26:04.252	2025-09-27 12:26:04.252
aedfb2d3-7fac-40c2-be1a-f535177ae72c	plaça de dalt	plaa-de-dalt	10000	c/dos	Agullent	\N	España	46001	\N	\N	\N	{parking,bar}	{}	t	26fa8809-a1a4-4242-9d09-42e65e5ee368	2025-09-27 17:53:13.626	2025-09-27 17:53:13.626
ed18fb98-1c7f-4859-8f5c-3f3e099cebd3	plaça de baix	plaa-de-baix	100000	C/ una dos tres	Ontinyent	\N	España	46001	\N	\N	\N	{parking,bar}	{}	t	26fa8809-a1a4-4242-9d09-42e65e5ee368	2025-09-27 17:41:44.671	2025-09-27 18:10:14.797
\.


--
-- Data for Name: VenueSection; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."VenueSection" (id, "venueId", name, capacity, "rowCount", "seatsPerRow") FROM stdin;
47940a17-b99c-46c8-9134-476eb1ad234c	001baa5a-7e6c-4561-8aa3-d154f74b6503	Platea	800	20	40
9c5bfee9-bf32-4b60-a79d-632fc757c1a1	001baa5a-7e6c-4561-8aa3-d154f74b6503	Tribuna	500	15	34
1e6a9781-0693-46de-87e2-b74883cccef9	001baa5a-7e6c-4561-8aa3-d154f74b6503	VIP	200	5	40
b8f086b1-7789-4392-a136-19bc0867a53d	8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	Pit	5000	1	5000
3bbe74c6-43de-4b7d-a8a8-291baef28fb5	8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	General Standing	8000	1	8000
6e92ce1a-088d-4ad7-a27d-f5dd39f670a9	8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	VIP Area	2000	10	200
07f34d0d-b37d-47e5-b1eb-230c976538e0	8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	Moshpit	800	1	800
7ddeb49c-3f42-4d97-84fe-cd0def254e70	8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	Standing General	1200	1	1200
a7ba0299-3a7c-4f78-b9e6-fc983f72218c	8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	Balcony VIP	500	5	100
65334e73-d6c4-4f7f-a73d-ecb85b1fe127	a09c3413-4b8e-4605-bf25-7601292e93c1	Front Pit	300	1	300
00f997c6-a0b3-4c31-b3a7-6777dc8d667e	a09c3413-4b8e-4605-bf25-7601292e93c1	General Floor	400	1	400
696b9fd9-ac31-4aaa-818b-7dc4df8e9dde	a09c3413-4b8e-4605-bf25-7601292e93c1	Bar Area	100	1	100
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
cb808f65-6356-426e-9b25-3feab51e08c7	0cebc5e03fc37b6bd44e572132fc8eb7a490220fa1691b55320fdbfefc7ab964	2025-09-26 16:41:22.071688+00	20250926164121_init	\N	\N	2025-09-26 16:41:21.987983+00	1
1c982ab0-0781-4394-b9be-2e956a5b6177	c50c639dc1a9b9079f194a1fd3d77080832bb6da27a123aa663620c11ff76830	2025-09-26 17:39:04.533668+00	20250926173904_add_rock_metal_fields	\N	\N	2025-09-26 17:39:04.525378+00	1
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.admins (id, email, password, "firstName", "lastName", role, "isActive", "lastLogin", "createdAt", "updatedAt") FROM stdin;
ac9a65b3-2fd5-4573-bf28-c016f92bb9cb	super@admin.com	$2b$10$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC	Super	Admin	SUPER_ADMIN	t	\N	2025-09-26 16:41:41.502	2025-09-26 16:41:41.502
467a0b9f-5cd9-46b0-8905-621bc92a8664	admin@ticketing.com	$2b$10$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC	Admin	User	ADMIN	t	\N	2025-09-26 16:41:41.502	2025-09-26 16:41:41.502
26fa8809-a1a4-4242-9d09-42e65e5ee368	voro.super@ticketing.com	$2b$10$zN5zpSTorCYjQvmlL4xfbO5ldb3Dtd1ReISxEGzIE6wMdAO.1B4/a	Voro	SuperAdmin	SUPER_ADMIN	t	\N	2025-09-27 15:27:15.819	2025-09-27 15:27:15.819
\.


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: PriceCategory PriceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."PriceCategory"
    ADD CONSTRAINT "PriceCategory_pkey" PRIMARY KEY (id);


--
-- Name: VenueSection VenueSection_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."VenueSection"
    ADD CONSTRAINT "VenueSection_pkey" PRIMARY KEY (id);


--
-- Name: Venue Venue_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Venue"
    ADD CONSTRAINT "Venue_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_adminId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "AuditLog_adminId_idx" ON public."AuditLog" USING btree ("adminId");


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_tableName_recordId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "AuditLog_tableName_recordId_idx" ON public."AuditLog" USING btree ("tableName", "recordId");


--
-- Name: Event_category_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Event_category_idx" ON public."Event" USING btree (category);


--
-- Name: Event_eventDate_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Event_eventDate_idx" ON public."Event" USING btree ("eventDate");


--
-- Name: Event_slug_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Event_slug_idx" ON public."Event" USING btree (slug);


--
-- Name: Event_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Event_slug_key" ON public."Event" USING btree (slug);


--
-- Name: Event_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Event_status_idx" ON public."Event" USING btree (status);


--
-- Name: PriceCategory_eventId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "PriceCategory_eventId_idx" ON public."PriceCategory" USING btree ("eventId");


--
-- Name: PriceCategory_eventId_name_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "PriceCategory_eventId_name_key" ON public."PriceCategory" USING btree ("eventId", name);


--
-- Name: VenueSection_venueId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "VenueSection_venueId_idx" ON public."VenueSection" USING btree ("venueId");


--
-- Name: VenueSection_venueId_name_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "VenueSection_venueId_name_key" ON public."VenueSection" USING btree ("venueId", name);


--
-- Name: Venue_city_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Venue_city_idx" ON public."Venue" USING btree (city);


--
-- Name: Venue_slug_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Venue_slug_idx" ON public."Venue" USING btree (slug);


--
-- Name: Venue_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Venue_slug_key" ON public."Venue" USING btree (slug);


--
-- Name: admins_email_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX admins_email_idx ON public.admins USING btree (email);


--
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- Name: AuditLog AuditLog_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Event Event_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event Event_venueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES public."Venue"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PriceCategory PriceCategory_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."PriceCategory"
    ADD CONSTRAINT "PriceCategory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PriceCategory PriceCategory_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."PriceCategory"
    ADD CONSTRAINT "PriceCategory_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."VenueSection"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: VenueSection VenueSection_venueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."VenueSection"
    ADD CONSTRAINT "VenueSection_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES public."Venue"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Venue Venue_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Venue"
    ADD CONSTRAINT "Venue_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict TWluDmHMKcpFUjng7Eoo6rLJutk3tcKxp2dWh9q5mfoHgEXQiH24rBfuLcfCe8s

