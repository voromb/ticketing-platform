--
-- PostgreSQL database dump
--

\restrict yysZz2UqHzy307OpRPrfoRcW6HVukO8SdmRBBOeKI5yzekGroVNdY7ln0iFcw10

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
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: EventStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EventStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'SOLD_OUT',
    'CANCELLED',
    'COMPLETED',
    'SUSPENDED'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'MANAGER',
    'VIEWER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Event; Type: TABLE; Schema: public; Owner: -
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
    metadata jsonb,
    category_id integer NOT NULL,
    subcategory_id integer
);


--
-- Name: EventCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EventCategory" (
    id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: EventCategory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EventCategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EventCategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EventCategory_id_seq" OWNED BY public."EventCategory".id;


--
-- Name: EventSubcategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EventSubcategory" (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name text NOT NULL
);


--
-- Name: EventSubcategory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EventSubcategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EventSubcategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EventSubcategory_id_seq" OWNED BY public."EventSubcategory".id;


--
-- Name: PriceCategory; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Venue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Venue" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    capacity integer NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text,
    country text DEFAULT 'Espa??a'::text NOT NULL,
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


--
-- Name: VenueSection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VenueSection" (
    id text NOT NULL,
    "venueId" text NOT NULL,
    name text NOT NULL,
    capacity integer NOT NULL,
    "rowCount" integer,
    "seatsPerRow" integer
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: EventCategory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventCategory" ALTER COLUMN id SET DEFAULT nextval('public."EventCategory_id_seq"'::regclass);


--
-- Name: EventSubcategory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventSubcategory" ALTER COLUMN id SET DEFAULT nextval('public."EventSubcategory_id_seq"'::regclass);


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AuditLog" VALUES ('b00d6b31-bf1e-4300-881f-b9ab089de128', 'Venue', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 'CREATE', NULL, NULL, '{"id": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "city": "Valencia", "name": "Teatro Principal Valencia", "slug": "teatro-principal-valencia", "state": "Valencia", "images": [], "address": "Calle Mayor 1", "country": "EspaÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£ÔòùÔö£├Ña", "capacity": 1500, "isActive": true, "latitude": null, "sections": [{"id": "47940a17-b99c-46c8-9134-476eb1ad234c", "name": "Platea", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 800, "rowCount": 20, "seatsPerRow": 40}, {"id": "9c5bfee9-bf32-4b60-a79d-632fc757c1a1", "name": "Tribuna", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 500, "rowCount": 15, "seatsPerRow": 34}, {"id": "1e6a9781-0693-46de-87e2-b74883cccef9", "name": "VIP", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 200, "rowCount": 5, "seatsPerRow": 40}], "amenities": ["parking", "wifi", "accesibilidad", "cafeteria"], "createdAt": "2025-09-26T17:05:01.928Z", "createdBy": {"id": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "email": "admin@ticketing.com", "lastName": "User", "firstName": "Admin"}, "longitude": null, "updatedAt": "2025-09-26T17:05:01.928Z", "postalCode": "46001", "createdById": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "description": "Teatro histÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£├éÔö£┬«rico en el centro de Valencia"}', '467a0b9f-5cd9-46b0-8905-621bc92a8664', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26100; es-ES) PowerShell/7.5.3', NULL, '2025-09-26 17:05:01.945');
INSERT INTO public."AuditLog" VALUES ('7dd2c2cd-92d0-4379-9175-6615d7321d15', 'Venue', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 'UPDATE', NULL, '{"id": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "city": "Valencia", "name": "Teatro Principal Valencia", "slug": "teatro-principal-valencia", "state": "Valencia", "images": [], "address": "Calle Mayor 1", "country": "EspaÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£ÔòùÔö£├Ña", "capacity": 1500, "isActive": true, "latitude": null, "sections": [{"id": "47940a17-b99c-46c8-9134-476eb1ad234c", "name": "Platea", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 800, "rowCount": 20, "seatsPerRow": 40}, {"id": "9c5bfee9-bf32-4b60-a79d-632fc757c1a1", "name": "Tribuna", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 500, "rowCount": 15, "seatsPerRow": 34}, {"id": "1e6a9781-0693-46de-87e2-b74883cccef9", "name": "VIP", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 200, "rowCount": 5, "seatsPerRow": 40}], "amenities": ["parking", "wifi", "accesibilidad", "cafeteria"], "createdAt": "2025-09-26T17:05:01.928Z", "longitude": null, "updatedAt": "2025-09-26T17:05:01.928Z", "postalCode": "46001", "createdById": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "description": "Teatro histÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£├éÔö£┬«rico en el centro de Valencia"}', '{"id": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "city": "Valencia", "name": "Teatro Principal Valencia", "slug": "teatro-principal-valencia", "state": "Valencia", "images": [], "address": "Calle Mayor 1", "country": "EspaÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£ÔòùÔö£├Ña", "capacity": 1500, "isActive": true, "latitude": null, "sections": [{"id": "47940a17-b99c-46c8-9134-476eb1ad234c", "name": "Platea", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 800, "rowCount": 20, "seatsPerRow": 40}, {"id": "9c5bfee9-bf32-4b60-a79d-632fc757c1a1", "name": "Tribuna", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 500, "rowCount": 15, "seatsPerRow": 34}, {"id": "1e6a9781-0693-46de-87e2-b74883cccef9", "name": "VIP", "venueId": "001baa5a-7e6c-4561-8aa3-d154f74b6503", "capacity": 200, "rowCount": 5, "seatsPerRow": 40}], "amenities": ["parking", "wifi", "accesibilidad", "cafeteria", "restaurante"], "createdAt": "2025-09-26T17:05:01.928Z", "createdBy": {"id": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "email": "admin@ticketing.com", "lastName": "User", "firstName": "Admin"}, "longitude": null, "updatedAt": "2025-09-26T17:06:22.435Z", "postalCode": "46001", "createdById": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "description": "Teatro histÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£├éÔö£┬«rico renovado en 2024, ubicado en el corazÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£├éÔö£┬«n de Valencia"}', '467a0b9f-5cd9-46b0-8905-621bc92a8664', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26100; es-ES) PowerShell/7.5.3', NULL, '2025-09-26 17:06:22.444');
INSERT INTO public."AuditLog" VALUES ('5ed9588a-252e-4a20-9076-b79c6dbd5893', 'Venue', 'eedf995f-f060-4105-81b5-8b46dd58be37', 'CREATE', NULL, NULL, '{"id": "eedf995f-f060-4105-81b5-8b46dd58be37", "city": "Valencia", "name": "Palau de les Arts", "slug": "palau-de-les-arts", "state": null, "images": [], "address": "Av. del Professor LÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£├éÔö£┬«pez PiÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£ÔòùÔö£├Ñero 1", "country": "EspaÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£ÔòùÔö£├Ña", "capacity": 1800, "isActive": true, "latitude": null, "sections": [], "amenities": ["parking", "restaurante", "tienda"], "createdAt": "2025-09-26T17:06:42.338Z", "createdBy": {"id": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "email": "admin@ticketing.com", "lastName": "User", "firstName": "Admin"}, "longitude": null, "updatedAt": "2025-09-26T17:06:42.338Z", "postalCode": "46013", "createdById": "467a0b9f-5cd9-46b0-8905-621bc92a8664", "description": "Opera house de Valencia"}', '467a0b9f-5cd9-46b0-8905-621bc92a8664', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26100; es-ES) PowerShell/7.5.3', NULL, '2025-09-26 17:06:42.344');


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Event" VALUES ('3719c30b-403b-4ba9-8cdc-cd565fc65c86', 'Valencia Rock Night', 'Concierto de rock cl├ö├Â┬úÔö£├é├ö├Â┬úÔö£├®├ö├Â┬╝Ôö£ÔòæÔö£├ÂÔö£├éÔö¼├║├ö├Â┬╝Ôö£┬ísico en Valencia', 'valencia-rock-night', 'ACTIVE', '2025-11-10 20:00:00', NULL, '2025-09-01 10:00:00', '2025-11-09 23:59:59', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 1200, 1200, 0, 0, NULL, NULL, NULL, NULL, 25.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('2559299a-e517-4c85-8501-fccf596863ed', 'Metal Explosion', 'Festival de heavy metal con 5 bandas', 'metal-explosion', 'ACTIVE', '2025-12-01 21:00:00', NULL, '2025-10-01 10:00:00', '2025-11-30 23:59:59', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2200, 2200, 0, 0, NULL, NULL, NULL, NULL, 30.00, 90.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('fe1932b8-ef55-4957-83c6-d14b86413e3a', 'Symphonic Metal Night', 'Noche de metal sinf├ö├Â┬úÔö£├é├ö├Â┬úÔö£├®├ö├Â┬╝Ôö£Ôòæ├ö├Â┬úÔö£├é├ö├Â┬úÔö£├®├ö├Â┬úÔö¼┬½nico con orquesta en vivo', 'symphonic-metal-night', 'ACTIVE', '2025-12-15 20:30:00', NULL, '2025-10-15 10:00:00', '2025-12-14 23:59:59', 'eedf995f-f060-4105-81b5-8b46dd58be37', 1800, 1800, 0, 0, NULL, NULL, NULL, NULL, 40.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('39930e46-a60b-49ab-aa82-16e1b309ed12', 'Thrash Attack', 'Concierto de thrash metal en el recinto ferial', 'thrash-attack', 'ACTIVE', '2025-11-20 20:00:00', NULL, '2025-09-10 10:00:00', '2025-11-19 23:59:59', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 15000, 15000, 0, 0, NULL, NULL, NULL, NULL, 20.00, 70.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('c7c68ffa-8469-498d-86c3-44f449e0e52b', 'Classic Rock Legends', 'Tributo a las leyendas del rock cl├ö├Â┬úÔö£├é├ö├Â┬úÔö£├®├ö├Â┬╝Ôö£ÔòæÔö£├ÂÔö£├éÔö¼├║├ö├Â┬╝Ôö£┬ísico', 'classic-rock-legends', 'ACTIVE', '2025-10-05 20:00:00', NULL, '2025-08-01 10:00:00', '2025-10-04 23:59:59', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 1500, 1500, 0, 0, NULL, NULL, NULL, NULL, 35.00, 90.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('52bf7140-39a8-4893-a3fb-da38ca35ad9d', 'Doom Fest', 'Festival de doom metal en la sala Rockstar', 'doom-fest', 'ACTIVE', '2025-12-05 22:00:00', NULL, '2025-09-20 10:00:00', '2025-12-04 23:59:59', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, NULL, 28.00, 75.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('5e53b4c1-9787-403d-81d7-af96f94ed886', 'Rock Fest Agullent', 'Festival de rock en la Pla├ö├Â┬úÔö£├é├ö├Â┬úÔö£├®├ö├Â┬╝Ôö£ÔòæÔö£├ÂÔö£├éÔö¼ÔòØÔö£├ÂÔö£ÔûôÔö£┬¬a de Dalt', 'rock-fest-agullent', 'ACTIVE', '2025-08-20 20:00:00', NULL, '2025-06-01 10:00:00', '2025-08-19 23:59:59', 'aedfb2d3-7fac-40c2-be1a-f535177ae72c', 10000, 10000, 0, 0, NULL, NULL, NULL, NULL, 15.00, 50.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('f36a2e02-a92a-4c67-b383-a05010e872c7', 'Underground Metal Night', 'Concierto de metal underground', 'underground-metal-night', 'ACTIVE', '2025-09-18 21:00:00', NULL, '2025-07-10 10:00:00', '2025-09-17 23:59:59', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 800, 800, 0, 0, NULL, NULL, NULL, NULL, 12.00, 40.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('10a62657-191a-449b-a7c5-c3cf210c7fba', 'Power Metal Valencia', 'Noche ├ö├Â┬úÔö£├é├ö├Â┬úÔö£├®├ö├Â┬╝Ôö£ÔòæÔö£├ÂÔö£├éÔö¼ÔòØ├ö├Â┬╝Ôö¼┬ópica de power metal', 'power-metal-valencia', 'ACTIVE', '2025-11-01 20:30:00', NULL, '2025-09-01 10:00:00', '2025-10-31 23:59:59', '6041a699-2a83-4518-b458-5db09b90c31a', 15000, 15000, 0, 0, NULL, NULL, NULL, NULL, 30.00, 100.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('cb12da56-8cf5-45d1-9605-ef0ebfbdbe53', 'Metal Cave Sessions', 'Concierto ├ö├Â┬úÔö£├é├ö├Â┬úÔö£├®├ö├Â┬╝Ôö£ÔòæÔö£├ÂÔö£├éÔö¼ÔòØ├ö├Â┬úÔö¼├¡ntimo de bandas emergentes', 'metal-cave-sessions', 'ACTIVE', '2025-10-25 20:00:00', NULL, '2025-08-15 10:00:00', '2025-10-24 23:59:59', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, NULL, 10.00, 30.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('4d8eaab2-fe43-4844-99cd-4ab77c64ef42', 'Ontinyent Metal Fest', 'Festival de metal en la Pla├ö├Â┬úÔö£├é├ö├Â┬úÔö£├®├ö├Â┬╝Ôö£ÔòæÔö£├ÂÔö£├éÔö¼ÔòØÔö£├ÂÔö£ÔûôÔö£┬¬a de Baix', 'ontinyent-metal-fest', 'ACTIVE', '2025-07-30 20:00:00', NULL, '2025-05-01 10:00:00', '2025-07-29 23:59:59', 'ed18fb98-1c7f-4859-8f5c-3f3e099cebd3', 100000, 100000, 0, 0, NULL, NULL, NULL, NULL, 50.00, 150.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('f4db5aa0-9e42-4063-a342-9a5a26507984', 'Valencia Alternative Rock', 'Bandas alternativas en directo', 'valencia-alternative-rock', 'ACTIVE', '2025-06-18 20:00:00', NULL, '2025-04-01 10:00:00', '2025-06-17 23:59:59', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, NULL, 18.00, 45.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('402bed42-00d4-4c56-ba51-650ec4380d46', 'Black Metal Ritual', 'Concierto de black metal atmosf├ö├Â┬úÔö£├é├ö├Â┬úÔö£├®├ö├Â┬╝Ôö£ÔòæÔö£├ÂÔö£├éÔö¼ÔòØ├ö├Â┬╝Ôö¼┬órico', 'black-metal-ritual', 'ACTIVE', '2025-12-21 23:00:00', NULL, '2025-10-01 10:00:00', '2025-12-20 23:59:59', 'f794e6f0-28c4-4512-ab20-1954720ea984', 800, 800, 0, 0, NULL, NULL, NULL, NULL, 20.00, 70.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('894465b9-fac3-4757-b0f4-31e69b17c8e9', 'Valencia Punk Rock Fest', 'Festival de punk rock local', 'valencia-punk-rock', 'ACTIVE', '2025-08-12 19:00:00', NULL, '2025-05-01 10:00:00', '2025-08-11 23:59:59', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 1400, 1400, 0, 0, NULL, NULL, NULL, NULL, 10.00, 30.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('cf0067c7-b2e1-4ca7-aac9-7db4d9b58f8a', 'Progressive Metal Night', 'Noche experimental de progressive metal', 'progressive-metal-night', 'ACTIVE', '2025-11-11 20:00:00', NULL, '2025-09-01 10:00:00', '2025-11-10 23:59:59', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, NULL, 22.00, 75.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('94a83f67-6e96-4871-91eb-1c02c6f6222c', 'Valencia Hard Rock Night', 'Hard rock en vivo con varias bandas', 'valencia-hard-rock', 'ACTIVE', '2025-09-22 20:00:00', NULL, '2025-07-01 10:00:00', '2025-09-21 23:59:59', '56bcb5a9-59c0-4476-b69c-649acfec88d4', 2500, 2500, 0, 0, NULL, NULL, NULL, NULL, 18.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('ca2aeeea-0b78-4ed0-baa6-72686e4b54ae', 'Valencia Death Metal Night', 'Concierto brutal de death metal', 'valencia-death-metal', 'ACTIVE', '2025-12-02 22:00:00', NULL, '2025-10-01 10:00:00', '2025-12-01 23:59:59', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, NULL, 20.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('0b257a0a-859b-433e-997f-6df067c0befb', 'Indie Rock Night', 'Concierto indie rock con bandas emergentes', 'indie-rock-night', 'ACTIVE', '2025-07-15 20:00:00', NULL, '2025-05-15 10:00:00', '2025-07-14 23:59:59', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, NULL, 15.00, 40.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('9b90bac4-0474-430c-bac7-19f98aca058c', 'Metal Mega Fest', 'Gran festival con bandas de rock y metal', 'metal-mega-fest', 'ACTIVE', '2025-09-05 18:00:00', NULL, '2025-06-01 10:00:00', '2025-09-04 23:59:59', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 15000, 15000, 0, 0, NULL, NULL, NULL, NULL, 45.00, 150.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 6);


--
-- Data for Name: EventCategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."EventCategory" VALUES (1, 'Rock');
INSERT INTO public."EventCategory" VALUES (2, 'Metal');


--
-- Data for Name: EventSubcategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."EventSubcategory" VALUES (1, 1, 'Classic Rock');
INSERT INTO public."EventSubcategory" VALUES (2, 1, 'Alternative Rock');
INSERT INTO public."EventSubcategory" VALUES (3, 1, 'Indie Rock');
INSERT INTO public."EventSubcategory" VALUES (4, 1, 'Punk Rock');
INSERT INTO public."EventSubcategory" VALUES (5, 1, 'Hard Rock');
INSERT INTO public."EventSubcategory" VALUES (6, 2, 'Heavy Metal');
INSERT INTO public."EventSubcategory" VALUES (7, 2, 'Thrash Metal');
INSERT INTO public."EventSubcategory" VALUES (8, 2, 'Death Metal');
INSERT INTO public."EventSubcategory" VALUES (9, 2, 'Black Metal');
INSERT INTO public."EventSubcategory" VALUES (10, 2, 'Power Metal');
INSERT INTO public."EventSubcategory" VALUES (11, 2, 'Symphonic Metal');
INSERT INTO public."EventSubcategory" VALUES (12, 2, 'Doom Metal');
INSERT INTO public."EventSubcategory" VALUES (13, 2, 'Progressive Metal');


--
-- Data for Name: PriceCategory; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Venue; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Venue" VALUES ('001baa5a-7e6c-4561-8aa3-d154f74b6503', 'Teatro Principal Valencia', 'teatro-principal-valencia', 1500, 'Calle Mayor 1', 'Valencia', 'Valencia', 'Espa??a', '46001', NULL, NULL, 'Teatro hist??rico renovado en 2024, ubicado en el coraz??n de Valencia', '{parking,wifi,accesibilidad,cafeteria,restaurante}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 17:05:01.928', '2025-09-26 17:06:22.435');
INSERT INTO public."Venue" VALUES ('eedf995f-f060-4105-81b5-8b46dd58be37', 'Palau de les Arts', 'palau-de-les-arts', 1800, 'Av. del Professor L??pez Pi??ero 1', 'Valencia', NULL, 'Espa??a', '46013', NULL, NULL, 'Opera house de Valencia', '{parking,restaurante,tienda}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 17:06:42.338', '2025-09-26 17:06:42.338');
INSERT INTO public."Venue" VALUES ('8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 'Recinto Ferial Valencia Rock', 'recinto-ferial-valencia-rock', 15000, 'Av. de las Ferias s/n', 'Valencia', 'Valencia', 'Espa??a', '46035', NULL, NULL, 'Recinto al aire libre ideal para festivales de rock y metal', '{parking,food-trucks,merchandise-stands,security,medical-post}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:22:41.999', '2025-09-26 20:22:41.999');
INSERT INTO public."Venue" VALUES ('8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 'Sala Rockstar Valencia', 'sala-rockstar-valencia', 2500, 'Calle del Rock 15', 'Valencia', 'Valencia', 'Espa??a', '46001', NULL, NULL, 'Sala especializada en conciertos de rock y metal con excelente ac??stica', '{bar,merchandise,coat-check,professional-sound,stage-lighting}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:22:44.081', '2025-09-26 20:22:44.081');
INSERT INTO public."Venue" VALUES ('a09c3413-4b8e-4605-bf25-7601292e93c1', 'Metal Underground Club', 'metal-underground-club', 800, 'Calle Subterr??nea 7', 'Valencia', 'Valencia', 'Espa??a', '46002', NULL, NULL, 'Club ??ntimo perfecto para tributos, ac??sticos y bandas emergentes', '{bar,stage,sound-system,intimate-atmosphere}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:22:46.14', '2025-09-26 20:22:46.14');
INSERT INTO public."Venue" VALUES ('1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 'Test Venue', 'test-venue-simple', 1000, 'Test Address', 'Valencia', NULL, 'Espa??a', '46001', NULL, NULL, NULL, '{}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:26:57.007', '2025-09-26 20:26:57.007');
INSERT INTO public."Venue" VALUES ('6041a699-2a83-4518-b458-5db09b90c31a', 'Recinto Ferial Valencia Rock', 'recinto-ferial-valencia-rock-2024', 15000, 'Av. de las Ferias s/n', 'Valencia', 'Valencia', 'Espa??a', '46035', NULL, NULL, 'Recinto al aire libre ideal para festivales de rock y metal', '{parking,food-trucks,merchandise-stands,security,medical-post}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:29:14.471', '2025-09-26 20:29:14.471');
INSERT INTO public."Venue" VALUES ('56bcb5a9-59c0-4476-b69c-649acfec88d4', 'Sala Rockstar Valencia', 'sala-rockstar-valencia-2024', 2500, 'Calle del Rock 15', 'Valencia', 'Valencia', 'Espa??a', '46001', NULL, NULL, 'Sala especializada en conciertos de rock y metal con excelente ac??stica', '{bar,merchandise,coat-check,professional-sound,stage-lighting}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:29:16.527', '2025-09-26 20:29:16.527');
INSERT INTO public."Venue" VALUES ('f794e6f0-28c4-4512-ab20-1954720ea984', 'Metal Underground Club', 'metal-underground-club-2024', 800, 'Calle Subterr??nea 7', 'Valencia', 'Valencia', 'Espa??a', '46002', NULL, NULL, 'Club ??ntimo perfecto para tributos, ac??sticos y bandas emergentes', '{bar,stage,sound-system,intimate-atmosphere}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:29:18.582', '2025-09-26 20:29:18.582');
INSERT INTO public."Venue" VALUES ('e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 'Metal Cave Club', 'metal-cave-club-valencia', 600, 'Calle Underground 13', 'Valencia', 'Valencia', 'Espa??a', '46003', NULL, NULL, 'Club underground ??ntimo para bandas de metal emergentes', '{bar,stage,sound-system,intimate-atmosphere}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-27 12:26:04.252', '2025-09-27 12:26:04.252');
INSERT INTO public."Venue" VALUES ('aedfb2d3-7fac-40c2-be1a-f535177ae72c', 'pla??a de dalt', 'plaa-de-dalt', 10000, 'c/dos', 'Agullent', NULL, 'Espa??a', '46001', NULL, NULL, NULL, '{parking,bar}', '{}', true, NULL, '2025-09-27 17:53:13.626', '2025-09-27 17:53:13.626');
INSERT INTO public."Venue" VALUES ('ed18fb98-1c7f-4859-8f5c-3f3e099cebd3', 'pla??a de baix', 'plaa-de-baix', 100000, 'C/ una dos tres', 'Ontinyent', NULL, 'Espa??a', '46001', NULL, NULL, NULL, '{parking,bar}', '{}', true, NULL, '2025-09-27 17:41:44.671', '2025-09-27 18:10:14.797');


--
-- Data for Name: VenueSection; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."VenueSection" VALUES ('47940a17-b99c-46c8-9134-476eb1ad234c', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 'Platea', 800, 20, 40);
INSERT INTO public."VenueSection" VALUES ('9c5bfee9-bf32-4b60-a79d-632fc757c1a1', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 'Tribuna', 500, 15, 34);
INSERT INTO public."VenueSection" VALUES ('1e6a9781-0693-46de-87e2-b74883cccef9', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 'VIP', 200, 5, 40);
INSERT INTO public."VenueSection" VALUES ('b8f086b1-7789-4392-a136-19bc0867a53d', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 'Pit', 5000, 1, 5000);
INSERT INTO public."VenueSection" VALUES ('3bbe74c6-43de-4b7d-a8a8-291baef28fb5', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 'General Standing', 8000, 1, 8000);
INSERT INTO public."VenueSection" VALUES ('6e92ce1a-088d-4ad7-a27d-f5dd39f670a9', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 'VIP Area', 2000, 10, 200);
INSERT INTO public."VenueSection" VALUES ('07f34d0d-b37d-47e5-b1eb-230c976538e0', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 'Moshpit', 800, 1, 800);
INSERT INTO public."VenueSection" VALUES ('7ddeb49c-3f42-4d97-84fe-cd0def254e70', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 'Standing General', 1200, 1, 1200);
INSERT INTO public."VenueSection" VALUES ('a7ba0299-3a7c-4f78-b9e6-fc983f72218c', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 'Balcony VIP', 500, 5, 100);
INSERT INTO public."VenueSection" VALUES ('65334e73-d6c4-4f7f-a73d-ecb85b1fe127', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 'Front Pit', 300, 1, 300);
INSERT INTO public."VenueSection" VALUES ('00f997c6-a0b3-4c31-b3a7-6777dc8d667e', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 'General Floor', 400, 1, 400);
INSERT INTO public."VenueSection" VALUES ('696b9fd9-ac31-4aaa-818b-7dc4df8e9dde', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 'Bar Area', 100, 1, 100);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('cb808f65-6356-426e-9b25-3feab51e08c7', '0cebc5e03fc37b6bd44e572132fc8eb7a490220fa1691b55320fdbfefc7ab964', '2025-09-26 16:41:22.071688+00', '20250926164121_init', NULL, NULL, '2025-09-26 16:41:21.987983+00', 1);
INSERT INTO public._prisma_migrations VALUES ('1c982ab0-0781-4394-b9be-2e956a5b6177', 'c50c639dc1a9b9079f194a1fd3d77080832bb6da27a123aa663620c11ff76830', '2025-09-26 17:39:04.533668+00', '20250926173904_add_rock_metal_fields', NULL, NULL, '2025-09-26 17:39:04.525378+00', 1);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.admins VALUES ('ac9a65b3-2fd5-4573-bf28-c016f92bb9cb', 'super@admin.com', '$2b$10$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC', 'Super', 'Admin', 'SUPER_ADMIN', true, NULL, '2025-09-26 16:41:41.502', '2025-09-26 16:41:41.502');
INSERT INTO public.admins VALUES ('467a0b9f-5cd9-46b0-8905-621bc92a8664', 'admin@ticketing.com', '$2b$10$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC', 'Admin', 'User', 'ADMIN', true, NULL, '2025-09-26 16:41:41.502', '2025-09-26 16:41:41.502');


--
-- Name: EventCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."EventCategory_id_seq"', 2, true);


--
-- Name: EventSubcategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."EventSubcategory_id_seq"', 13, true);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: EventCategory EventCategory_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventCategory"
    ADD CONSTRAINT "EventCategory_name_key" UNIQUE (name);


--
-- Name: EventCategory EventCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventCategory"
    ADD CONSTRAINT "EventCategory_pkey" PRIMARY KEY (id);


--
-- Name: EventSubcategory EventSubcategory_category_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventSubcategory"
    ADD CONSTRAINT "EventSubcategory_category_id_name_key" UNIQUE (category_id, name);


--
-- Name: EventSubcategory EventSubcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventSubcategory"
    ADD CONSTRAINT "EventSubcategory_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: PriceCategory PriceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PriceCategory"
    ADD CONSTRAINT "PriceCategory_pkey" PRIMARY KEY (id);


--
-- Name: VenueSection VenueSection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VenueSection"
    ADD CONSTRAINT "VenueSection_pkey" PRIMARY KEY (id);


--
-- Name: Venue Venue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Venue"
    ADD CONSTRAINT "Venue_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_adminId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_adminId_idx" ON public."AuditLog" USING btree ("adminId");


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_tableName_recordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_tableName_recordId_idx" ON public."AuditLog" USING btree ("tableName", "recordId");


--
-- Name: Event_eventDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Event_eventDate_idx" ON public."Event" USING btree ("eventDate");


--
-- Name: Event_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Event_slug_idx" ON public."Event" USING btree (slug);


--
-- Name: Event_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Event_slug_key" ON public."Event" USING btree (slug);


--
-- Name: Event_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Event_status_idx" ON public."Event" USING btree (status);


--
-- Name: PriceCategory_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PriceCategory_eventId_idx" ON public."PriceCategory" USING btree ("eventId");


--
-- Name: PriceCategory_eventId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PriceCategory_eventId_name_key" ON public."PriceCategory" USING btree ("eventId", name);


--
-- Name: VenueSection_venueId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VenueSection_venueId_idx" ON public."VenueSection" USING btree ("venueId");


--
-- Name: VenueSection_venueId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VenueSection_venueId_name_key" ON public."VenueSection" USING btree ("venueId", name);


--
-- Name: Venue_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Venue_city_idx" ON public."Venue" USING btree (city);


--
-- Name: Venue_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Venue_slug_idx" ON public."Venue" USING btree (slug);


--
-- Name: Venue_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Venue_slug_key" ON public."Venue" USING btree (slug);


--
-- Name: admins_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admins_email_idx ON public.admins USING btree (email);


--
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- Name: AuditLog AuditLog_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EventSubcategory EventSubcategory_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventSubcategory"
    ADD CONSTRAINT "EventSubcategory_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."EventCategory"(id) ON DELETE CASCADE;


--
-- Name: Event Event_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event Event_venueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES public."Venue"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PriceCategory PriceCategory_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PriceCategory"
    ADD CONSTRAINT "PriceCategory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PriceCategory PriceCategory_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PriceCategory"
    ADD CONSTRAINT "PriceCategory_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."VenueSection"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: VenueSection VenueSection_venueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VenueSection"
    ADD CONSTRAINT "VenueSection_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES public."Venue"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Venue Venue_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Venue"
    ADD CONSTRAINT "Venue_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Event fk_event_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT fk_event_category FOREIGN KEY (category_id) REFERENCES public."EventCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event fk_event_subcategory; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT fk_event_subcategory FOREIGN KEY (subcategory_id) REFERENCES public."EventSubcategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict yysZz2UqHzy307OpRPrfoRcW6HVukO8SdmRBBOeKI5yzekGroVNdY7ln0iFcw10

