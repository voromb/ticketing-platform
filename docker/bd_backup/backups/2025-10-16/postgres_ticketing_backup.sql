--
-- PostgreSQL database dump
--

\restrict BeLTiB4IKxJDQyLqwBwFGdMEaoZfxTCGsXFQ1UAgWy0P7H6oEtx1yteOQb7Pagi

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


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
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);


--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'VALID',
    'USED',
    'CANCELLED',
    'EXPIRED'
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
    name text NOT NULL,
    slug text,
    description text,
    icon text,
    image text,
    images text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
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
-- Name: EventLocality; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EventLocality" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    name text NOT NULL,
    description text,
    capacity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    "availableTickets" integer NOT NULL,
    "soldTickets" integer DEFAULT 0 NOT NULL,
    "reservedTickets" integer DEFAULT 0 NOT NULL,
    color text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: EventSubcategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EventSubcategory" (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name text NOT NULL,
    slug text,
    description text,
    icon text,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
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
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "eventId" text NOT NULL,
    "localityId" text NOT NULL,
    quantity integer NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    "finalAmount" numeric(10,2) NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "stripeSessionId" text,
    "stripePaymentId" text,
    "reservationId" text,
    "userEmail" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone
);


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
-- Name: Reservation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Reservation" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "eventId" text NOT NULL,
    "localityId" text NOT NULL,
    quantity integer NOT NULL,
    status public."ReservationStatus" DEFAULT 'ACTIVE'::public."ReservationStatus" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Ticket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Ticket" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "eventId" text NOT NULL,
    "localityId" text NOT NULL,
    "userId" text NOT NULL,
    "ticketCode" text NOT NULL,
    "qrCode" text,
    status public."TicketStatus" DEFAULT 'VALID'::public."TicketStatus" NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    country text DEFAULT 'EspaÔö£ÔûÆa'::text NOT NULL,
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



--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Event" VALUES ('evt-2025-001', 'Madrid Indie Revolution', 'La mejor noche de indie rock del a├▒o', 'madrid-indie-revolution-2025-1', 'ACTIVE', '2025-01-18 10:26:13', '2025-01-18 09:26:13', '2024-10-20 10:26:13', '2025-01-18 09:26:13', 'es-madrid-but', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-002', 'Valencia Death Metal Night', 'Gran evento de death metal en Valencia', 'valencia-death-metal-night-2025-2', 'ACTIVE', '2025-02-06 12:16:14', '2025-02-06 11:16:14', '2024-11-08 12:16:14', '2025-02-06 11:16:14', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-003', 'Copenhagen Hardcore Punk', 'Festival de punk rock con bandas internacionales', 'copenhagen-hardcore-punk-2025-3', 'ACTIVE', '2025-03-04 14:31:06', '2025-03-04 13:31:06', '2024-12-04 14:31:06', '2025-03-04 13:31:06', 'dk-copenhagen-royal-arena', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 56.00, 224.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-004', 'Vienna Alternative Vibes', 'Noche inolvidable de alternative rock en directo', 'vienna-alternative-vibes-2025-4', 'ACTIVE', '2025-03-19 23:00:54', '2025-03-19 22:00:54', '2024-12-19 23:00:54', '2025-03-19 22:00:54', 'at-vienna-stadthalle', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 52.00, 208.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-005', 'Valencia Independent Sound', 'La mejor noche de indie rock del a├▒o', 'valencia-independent-sound-2025-5', 'ACTIVE', '2025-03-10 20:37:28', '2025-03-10 19:37:28', '2024-12-10 20:37:28', '2025-03-10 19:37:28', 'eedf995f-f060-4105-81b5-8b46dd58be37', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 17.00, 68.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-006', 'Paris Black Metal Storm', 'La mejor noche de black metal del a├▒o', 'paris-black-metal-storm-2025-6', 'ACTIVE', '2025-02-02 00:24:58', '2025-02-01 23:24:58', '2024-11-04 00:24:58', '2025-02-01 23:24:58', 'fr-paris-accor-arena', 20300, 20300, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-007', 'Pamplona Epic Legends', 'La mejor noche de power metal del a├▒o', 'pamplona-epic-legends-2025-7', 'ACTIVE', '2025-02-14 04:19:21', '2025-02-14 03:19:21', '2024-11-16 04:19:21', '2025-02-14 03:19:21', 'es-pamplona-baluarte', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-008', 'Valencia Heavy Rock Fest', 'Concierto ├®pico de hard rock en Valencia', 'valencia-heavy-rock-fest-2025-8', 'ACTIVE', '2025-03-28 09:38:31', '2025-03-28 08:38:31', '2024-12-28 09:38:31', '2025-03-28 08:38:31', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-009', 'Valencia Indie Rock Fest', 'Gran evento de indie rock en Valencia', 'valencia-indie-rock-fest-2025-9', 'ACTIVE', '2025-01-18 05:39:00', '2025-01-18 04:39:00', '2024-10-20 05:39:00', '2025-01-18 04:39:00', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-010', 'Stockholm Rock Power', 'Noche inolvidable de hard rock en directo', 'stockholm-rock-power-2025-10', 'ACTIVE', '2025-02-25 05:31:44', '2025-02-25 04:31:44', '2024-11-27 05:31:44', '2025-02-25 04:31:44', 'se-stockholm-ericsson-globe', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 56.00, 224.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-011', 'Sevilla Doom Warriors', 'Festival de doom metal con bandas internacionales', 'sevilla-doom-warriors-2025-11', 'ACTIVE', '2025-03-16 20:46:26', '2025-03-16 19:46:26', '2024-12-16 20:46:26', '2025-03-16 19:46:26', 'es-sevilla-custom', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-012', 'Pamplona Thrash Mayhem', 'Concierto ├®pico de thrash metal en Pamplona', 'pamplona-thrash-mayhem-2025-12', 'ACTIVE', '2025-01-20 00:56:27', '2025-01-19 23:56:27', '2024-10-22 00:56:27', '2025-01-19 23:56:27', 'es-pamplona-baluarte', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-013', 'C├│rdoba Epic Night', 'Concierto ├®pico de power metal en C├│rdoba', 'cordoba-epic-night-2025-13', 'ACTIVE', '2025-03-10 09:57:18', '2025-03-10 08:57:18', '2024-12-10 09:57:18', '2025-03-10 08:57:18', 'es-cordoba-palacio-congresos', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-014', 'Manchester Punk Underground', 'Noche inolvidable de punk rock en directo', 'manchester-punk-underground-2025-14', 'ACTIVE', '2025-01-12 09:52:25', '2025-01-12 08:52:25', '2024-10-14 09:52:25', '2025-01-12 08:52:25', 'uk-manchester-academy', 2600, 2600, 0, 0, NULL, NULL, NULL, '{}', 42.00, 168.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-015', 'Lisbon Prog Experience', 'La mejor noche de progressive metal del a├▒o', 'lisbon-prog-experience-2025-15', 'ACTIVE', '2025-03-01 10:38:10', '2025-03-01 09:38:10', '2024-12-01 10:38:10', '2025-03-01 09:38:10', 'pt-lisbon-altice-arena', 20000, 20000, 0, 0, NULL, NULL, NULL, '{}', 51.00, 204.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-016', 'Rome Power Storm', 'Gran evento de power metal en Rome', 'rome-power-storm-2025-16', 'ACTIVE', '2025-03-05 10:22:27', '2025-03-05 09:22:27', '2024-12-05 10:22:27', '2025-03-05 09:22:27', 'it-rome-palalottomatica', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-017', 'Berlin Epic Legends', 'Noche inolvidable de power metal en directo', 'berlin-epic-legends-2025-17', 'ACTIVE', '2025-01-08 22:54:47', '2025-01-08 21:54:47', '2024-10-10 22:54:47', '2025-01-08 21:54:47', 'de-berlin-columbiahalle', 3500, 3500, 0, 0, NULL, NULL, NULL, '{}', 39.00, 156.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-018', 'Amsterdam Independent Sound', 'Gran evento de indie rock en Amsterdam', 'amsterdam-independent-sound-2025-18', 'ACTIVE', '2025-03-12 07:34:41', '2025-03-12 06:34:41', '2024-12-12 07:34:41', '2025-03-12 06:34:41', 'nl-amsterdam-paradiso', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-019', 'Berlin New Wave Rock', 'La mejor noche de alternative rock del a├▒o', 'berlin-new-wave-rock-2025-19', 'ACTIVE', '2025-01-13 05:34:01', '2025-01-13 04:34:01', '2024-10-15 05:34:01', '2025-01-13 04:34:01', 'de-berlin-columbiahalle', 3500, 3500, 0, 0, NULL, NULL, NULL, '{}', 39.00, 156.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-020', 'M├ílaga Symphonic Force', 'Festival de symphonic metal con bandas internacionales', 'malaga-symphonic-force-2025-20', 'ACTIVE', '2025-03-16 23:29:20', '2025-03-16 22:29:20', '2024-12-16 23:29:20', '2025-03-16 22:29:20', 'es-malaga-martin-carpena', 11300, 11300, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-021', 'Milan Black Metal Legends', 'Gran evento de black metal en Milan', 'milan-black-metal-legends-2025-21', 'ACTIVE', '2025-02-25 18:37:14', '2025-02-25 17:37:14', '2024-11-27 18:37:14', '2025-02-25 17:37:14', 'it-milan-mediolanum-forum', 12700, 12700, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-022', 'Bilbao Indie Rock Fest', 'La mejor noche de indie rock del a├▒o', 'bilbao-indie-rock-fest-2025-22', 'ACTIVE', '2025-01-12 16:52:08', '2025-01-12 15:52:08', '2024-10-14 16:52:08', '2025-01-12 15:52:08', 'es-bilbao-bizkaia-arena', 18640, 18640, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-023', 'Milan Heavy Rock Fest', 'Noche inolvidable de hard rock en directo', 'milan-heavy-rock-fest-2025-23', 'ACTIVE', '2025-03-07 03:37:29', '2025-03-07 02:37:29', '2024-12-07 03:37:29', '2025-03-07 02:37:29', 'it-milan-mediolanum-forum', 12700, 12700, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-024', 'Bilbao Death Metal Night', 'La mejor noche de death metal del a├▒o', 'bilbao-death-metal-night-2025-24', 'ACTIVE', '2025-03-11 22:13:07', '2025-03-11 21:13:07', '2024-12-11 22:13:07', '2025-03-11 21:13:07', 'es-bilbao-kafe-antzokia', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-025', 'Vigo Rock Storm', 'Concierto ├®pico de hard rock en Vigo', 'vigo-rock-storm-2025-25', 'ACTIVE', '2025-01-14 05:58:57', '2025-01-14 04:58:57', '2024-10-16 05:58:57', '2025-01-14 04:58:57', 'es-vigo-pazo-cultura', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-026', 'Paris Glory Metal', 'Festival de power metal con bandas internacionales', 'paris-glory-metal-2025-26', 'ACTIVE', '2025-01-12 23:38:54', '2025-01-12 22:38:54', '2024-10-14 23:38:54', '2025-01-12 22:38:54', 'fr-paris-accor-arena', 20300, 20300, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-027', 'Alicante Punk Revolution', 'Noche inolvidable de punk rock en directo', 'alicante-punk-revolution-2025-27', 'ACTIVE', '2025-03-15 09:59:56', '2025-03-15 08:59:56', '2024-12-15 09:59:56', '2025-03-15 08:59:56', 'es-alicante-plaza-toros', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-028', 'Vigo Progressive Attack', 'Concierto ├®pico de progressive metal en Vigo', 'vigo-progressive-attack-2025-28', 'ACTIVE', '2025-02-04 20:49:17', '2025-02-04 19:49:17', '2024-11-06 20:49:17', '2025-02-04 19:49:17', 'es-vigo-pazo-cultura', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 19.00, 76.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-029', 'Paris Brutal Force', 'Gran evento de death metal en Paris', 'paris-brutal-force-2025-29', 'ACTIVE', '2025-03-08 00:50:47', '2025-03-07 23:50:47', '2024-12-08 00:50:47', '2025-03-07 23:50:47', 'fr-paris-accor-arena', 20300, 20300, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-030', 'Amsterdam Metal Orchestra', 'La mejor noche de symphonic metal del a├▒o', 'amsterdam-metal-orchestra-2025-30', 'ACTIVE', '2025-01-09 00:05:56', '2025-01-08 23:05:56', '2024-10-11 00:05:56', '2025-01-08 23:05:56', 'nl-amsterdam-paradiso', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 29.00, 116.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-031', 'Paris Progressive Legends', 'Festival de progressive metal con bandas internacionales', 'paris-progressive-legends-2025-31', 'ACTIVE', '2025-03-23 05:33:18', '2025-03-23 04:33:18', '2024-12-23 05:33:18', '2025-03-23 04:33:18', 'fr-paris-olympia', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 55.00, 220.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-032', 'Lisbon Rock Classics Live', 'Concierto ├®pico de classic rock en Lisbon', 'lisbon-rock-classics-live-2025-32', 'ACTIVE', '2025-03-01 02:51:52', '2025-03-01 01:51:52', '2024-12-01 02:51:52', '2025-03-01 01:51:52', 'pt-lisbon-lav', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-033', 'Palma Doom Force', 'Noche inolvidable de doom metal en directo', 'palma-doom-force-2025-33', 'ACTIVE', '2025-02-16 20:39:38', '2025-02-16 19:39:38', '2024-11-18 20:39:38', '2025-02-16 19:39:38', 'es-palma-son-fusteret', 6000, 6000, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-034', 'Barcelona Hard Rock Experience', 'Noche inolvidable de hard rock en directo', 'barcelona-hard-rock-experience-2025-34', 'ACTIVE', '2025-01-08 08:18:34', '2025-01-08 07:18:34', '2024-10-10 08:18:34', '2025-01-08 07:18:34', 'es-barcelona-sant-jordi-club', 4500, 4500, 0, 0, NULL, NULL, NULL, '{}', 33.00, 132.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-035', 'Milan Prog Revolution', 'Noche inolvidable de progressive metal en directo', 'milan-prog-revolution-2025-35', 'ACTIVE', '2025-01-05 05:26:42', '2025-01-05 04:26:42', '2024-10-07 05:26:42', '2025-01-05 04:26:42', 'it-milan-alcatraz', 3000, 3000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-036', 'Copenhagen Rock Force', 'Gran evento de hard rock en Copenhagen', 'copenhagen-rock-force-2025-36', 'ACTIVE', '2025-02-10 00:14:36', '2025-02-09 23:14:36', '2024-11-12 00:14:36', '2025-02-09 23:14:36', 'dk-copenhagen-royal-arena', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 56.00, 224.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-037', 'Paris Power Metal Live', 'La mejor noche de power metal del a├▒o', 'paris-power-metal-live-2025-37', 'ACTIVE', '2025-03-16 21:07:21', '2025-03-16 20:07:21', '2024-12-16 21:07:21', '2025-03-16 20:07:21', 'fr-paris-bataclan', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-038', 'Bilbao Death Revolution', 'Noche inolvidable de death metal en directo', 'bilbao-death-revolution-2025-38', 'ACTIVE', '2025-01-17 09:07:48', '2025-01-17 08:07:48', '2024-10-19 09:07:48', '2025-01-17 08:07:48', 'es-bilbao-bizkaia-arena', 18640, 18640, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-039', 'Zaragoza Hard Rock Live', 'Festival de hard rock con bandas internacionales', 'zaragoza-hard-rock-live-2025-39', 'ACTIVE', '2025-02-23 12:23:28', '2025-02-23 11:23:28', '2024-11-25 12:23:28', '2025-02-23 11:23:28', 'es-zaragoza-pabellon-principe-felipe', 10800, 10800, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-040', 'Gij├│n Punk Explosion', 'Noche inolvidable de punk rock en directo', 'gijon-punk-explosion-2025-40', 'ACTIVE', '2025-03-13 13:38:58', '2025-03-13 12:38:58', '2024-12-13 13:38:58', '2025-03-13 12:38:58', 'es-gijon-plaza-toros', 12000, 12000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-041', 'Vienna Power Storm', 'Festival de power metal con bandas internacionales', 'vienna-power-storm-2025-41', 'ACTIVE', '2025-02-15 17:25:44', '2025-02-15 16:25:44', '2024-11-17 17:25:44', '2025-02-15 16:25:44', 'at-vienna-stadthalle', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 52.00, 208.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-042', 'Las Palmas Steel Force', 'Noche inolvidable de heavy metal en directo', 'las-palmas-steel-force-2025-42', 'ACTIVE', '2025-03-14 18:36:51', '2025-03-14 17:36:51', '2024-12-14 18:36:51', '2025-03-14 17:36:51', 'es-laspalmas-gran-canaria-arena', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-043', 'A Coru├▒a Hard Rock Attack', 'Gran evento de hard rock en A Coru├▒a', 'a-coruna-hard-rock-attack-2025-43', 'ACTIVE', '2025-03-26 13:45:21', '2025-03-26 12:45:21', '2024-12-26 13:45:21', '2025-03-26 12:45:21', 'es-coruna-coliseum', 10500, 10500, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-044', 'Barcelona Timeless Rock', 'Festival de classic rock con bandas internacionales', 'barcelona-timeless-rock-2025-44', 'ACTIVE', '2025-01-10 14:59:11', '2025-01-10 13:59:11', '2024-10-12 14:59:11', '2025-01-10 13:59:11', 'es-barcelona-sant-jordi-club', 4500, 4500, 0, 0, NULL, NULL, NULL, '{}', 40.00, 160.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-045', 'Rome Rock Heritage', 'Gran evento de classic rock en Rome', 'rome-rock-heritage-2025-45', 'ACTIVE', '2025-03-20 19:06:05', '2025-03-20 18:06:05', '2024-12-20 19:06:05', '2025-03-20 18:06:05', 'it-rome-atlantico', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 26.00, 104.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-046', 'Manchester Punk Underground', 'Festival de punk rock con bandas internacionales', 'manchester-punk-underground-2025-46', 'ACTIVE', '2025-02-20 22:02:20', '2025-02-20 21:02:20', '2024-11-22 22:02:20', '2025-02-20 21:02:20', 'uk-manchester-arena', 21000, 21000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-047', 'Rome Doom Night', 'Gran evento de doom metal en Rome', 'rome-doom-night-2025-47', 'ACTIVE', '2025-01-23 00:02:14', '2025-01-22 23:02:14', '2024-10-25 00:02:14', '2025-01-22 23:02:14', 'it-rome-atlantico', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 22.00, 88.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-048', 'Barcelona Thrash Storm', 'Gran evento de thrash metal en Barcelona', 'barcelona-thrash-storm-2025-48', 'ACTIVE', '2025-01-20 07:37:41', '2025-01-20 06:37:41', '2024-10-22 07:37:41', '2025-01-20 06:37:41', 'es-barcelona-razzmatazz', 3000, 3000, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-049', 'Barcelona Rock Thunder', 'Festival de hard rock con bandas internacionales', 'barcelona-rock-thunder-2025-49', 'ACTIVE', '2025-01-25 00:55:11', '2025-01-24 23:55:11', '2024-10-27 00:55:11', '2025-01-24 23:55:11', 'es-barcelona-razzmatazz', 3000, 3000, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-050', 'Madrid Rock Explosion', 'Festival de hard rock con bandas internacionales', 'madrid-rock-explosion-2025-50', 'ACTIVE', '2025-01-15 10:15:18', '2025-01-15 09:15:18', '2024-10-17 10:15:18', '2025-01-15 09:15:18', 'es-madrid-arena', 12000, 12000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-051', 'Las Palmas Rock Power', 'Concierto ├®pico de hard rock en Las Palmas', 'las-palmas-rock-power-2025-51', 'ACTIVE', '2025-03-08 11:53:52', '2025-03-08 10:53:52', '2024-12-08 11:53:52', '2025-03-08 10:53:52', 'es-laspalmas-gran-canaria-arena', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-052', 'Lyon Timeless Rock', 'Concierto ├®pico de classic rock en Lyon', 'lyon-timeless-rock-2025-52', 'ACTIVE', '2025-01-09 02:07:23', '2025-01-09 01:07:23', '2024-10-11 02:07:23', '2025-01-09 01:07:23', 'fr-lyon-halle-tony-garnier', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 65.00, 260.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-053', 'Copenhagen Punk Riot', 'Noche inolvidable de punk rock en directo', 'copenhagen-punk-riot-2025-53', 'ACTIVE', '2025-01-28 22:16:17', '2025-01-28 21:16:17', '2024-10-30 22:16:17', '2025-01-28 21:16:17', 'dk-copenhagen-royal-arena', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 56.00, 224.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-054', 'Palma Indie Rock Live', 'Noche inolvidable de indie rock en directo', 'palma-indie-rock-live-2025-54', 'ACTIVE', '2025-02-21 14:41:41', '2025-02-21 13:41:41', '2024-11-23 14:41:41', '2025-02-21 13:41:41', 'es-palma-son-fusteret', 6000, 6000, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-055', 'Paris Punk Legends', 'Festival de punk rock con bandas internacionales', 'paris-punk-legends-2025-55', 'ACTIVE', '2025-02-05 00:16:08', '2025-02-04 23:16:08', '2024-11-07 00:16:08', '2025-02-04 23:16:08', 'fr-paris-olympia', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-056', 'Madrid Black Metal Night', 'Noche inolvidable de black metal en directo', 'madrid-black-metal-night-2025-56', 'ACTIVE', '2025-02-14 06:20:49', '2025-02-14 05:20:49', '2024-11-16 06:20:49', '2025-02-14 05:20:49', 'es-madrid-la-riviera', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-057', 'Madrid Classic Rock Festival', 'La mejor noche de classic rock del a├▒o', 'madrid-classic-rock-festival-2025-57', 'ACTIVE', '2025-02-24 16:29:56', '2025-02-24 15:29:56', '2024-11-26 16:29:56', '2025-02-24 15:29:56', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-058', 'Valencia Metal Power', 'Festival de heavy metal con bandas internacionales', 'valencia-metal-power-2025-58', 'ACTIVE', '2025-01-24 18:45:21', '2025-01-24 17:45:21', '2024-10-26 18:45:21', '2025-01-24 17:45:21', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-059', 'Vienna Punk Rebellion', 'Noche inolvidable de punk rock en directo', 'vienna-punk-rebellion-2025-59', 'ACTIVE', '2025-02-17 00:53:58', '2025-02-16 23:53:58', '2024-11-19 00:53:58', '2025-02-16 23:53:58', 'at-vienna-stadthalle', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 52.00, 208.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-060', 'Glasgow Rock Icons', 'Concierto ├®pico de classic rock en Glasgow', 'glasgow-rock-icons-2025-60', 'ACTIVE', '2025-03-16 19:17:57', '2025-03-16 18:17:57', '2024-12-16 19:17:57', '2025-03-16 18:17:57', 'uk-glasgow-barrowland', 2100, 2100, 0, 0, NULL, NULL, NULL, '{}', 50.00, 200.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-061', 'Paris Indie Vibes', 'Gran evento de indie rock en Paris', 'paris-indie-vibes-2025-61', 'ACTIVE', '2025-01-08 21:26:30', '2025-01-08 20:26:30', '2024-10-10 21:26:30', '2025-01-08 20:26:30', 'fr-paris-olympia', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-062', 'Brussels Metal Warriors', 'Festival de heavy metal con bandas internacionales', 'brussels-metal-warriors-2025-62', 'ACTIVE', '2025-01-29 14:02:53', '2025-01-29 13:02:53', '2024-10-31 14:02:53', '2025-01-29 13:02:53', 'be-brussels-ancienne-belgique', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 40.00, 160.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-063', 'Vigo Alternative Fest', 'La mejor noche de alternative rock del a├▒o', 'vigo-alternative-fest-2025-63', 'ACTIVE', '2025-02-24 04:56:17', '2025-02-24 03:56:17', '2024-11-26 04:56:17', '2025-02-24 03:56:17', 'es-vigo-pazo-cultura', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-064', 'Copenhagen Rock Legends', 'Noche inolvidable de classic rock en directo', 'copenhagen-rock-legends-2025-64', 'ACTIVE', '2025-01-27 12:28:19', '2025-01-27 11:28:19', '2024-10-29 12:28:19', '2025-01-27 11:28:19', 'dk-copenhagen-royal-arena', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 68.00, 272.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-065', 'Manchester Indie Night', 'Noche inolvidable de indie rock en directo', 'manchester-indie-night-2025-65', 'ACTIVE', '2025-03-07 08:24:25', '2025-03-07 07:24:25', '2024-12-07 08:24:25', '2025-03-07 07:24:25', 'uk-manchester-academy', 2600, 2600, 0, 0, NULL, NULL, NULL, '{}', 42.00, 168.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-066', 'Paris Death Mayhem', 'Noche inolvidable de death metal en directo', 'paris-death-mayhem-2025-66', 'ACTIVE', '2025-01-08 18:07:33', '2025-01-08 17:07:33', '2024-10-10 18:07:33', '2025-01-08 17:07:33', 'fr-paris-bataclan', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-067', 'Las Palmas Thrash Explosion', 'Concierto ├®pico de thrash metal en Las Palmas', 'las-palmas-thrash-explosion-2025-67', 'ACTIVE', '2025-02-12 20:51:06', '2025-02-12 19:51:06', '2024-11-14 20:51:06', '2025-02-12 19:51:06', 'es-laspalmas-gran-canaria-arena', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-068', 'Munich Rock Revival', 'Festival de classic rock con bandas internacionales', 'munich-rock-revival-2025-68', 'ACTIVE', '2025-03-09 12:56:52', '2025-03-09 11:56:52', '2024-12-09 12:56:52', '2025-03-09 11:56:52', 'de-munich-backstage', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-069', 'A Coru├▒a Alt Rock Night', 'Noche inolvidable de alternative rock en directo', 'a-coruna-alt-rock-night-2025-69', 'ACTIVE', '2025-03-08 00:46:26', '2025-03-07 23:46:26', '2024-12-08 00:46:26', '2025-03-07 23:46:26', 'es-coruna-coliseum', 10500, 10500, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-070', 'Manchester Heavy Metal Night', 'Noche inolvidable de heavy metal en directo', 'manchester-heavy-metal-night-2025-70', 'ACTIVE', '2025-01-15 17:04:15', '2025-01-15 16:04:15', '2024-10-17 17:04:15', '2025-01-15 16:04:15', 'uk-manchester-arena', 21000, 21000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-071', 'Paris Punk Rebellion', 'La mejor noche de punk rock del a├▒o', 'paris-punk-rebellion-2025-71', 'ACTIVE', '2025-01-20 00:32:42', '2025-01-19 23:32:42', '2024-10-22 00:32:42', '2025-01-19 23:32:42', 'fr-paris-bataclan', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-072', 'Barcelona Hard Rock Night', 'Noche inolvidable de hard rock en directo', 'barcelona-hard-rock-night-2025-72', 'ACTIVE', '2025-01-31 10:09:02', '2025-01-31 09:09:02', '2024-11-02 10:09:02', '2025-01-31 09:09:02', 'es-barcelona-apolo', 1600, 1600, 0, 0, NULL, NULL, NULL, '{}', 17.00, 68.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-073', 'Barcelona Iron Fest', 'Festival de heavy metal con bandas internacionales', 'barcelona-iron-fest-2025-73', 'ACTIVE', '2025-03-30 19:14:00', '2025-03-30 18:14:00', '2024-12-30 19:14:00', '2025-03-30 18:14:00', 'es-barcelona-bikini', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-074', 'Vienna Thrash Explosion', 'Gran evento de thrash metal en Vienna', 'vienna-thrash-explosion-2025-74', 'ACTIVE', '2025-01-21 21:15:51', '2025-01-21 20:15:51', '2024-10-23 21:15:51', '2025-01-21 20:15:51', 'at-vienna-stadthalle', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 52.00, 208.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-075', 'Athens Symphonic Fest', 'Concierto ├®pico de symphonic metal en Athens', 'athens-symphonic-fest-2025-75', 'ACTIVE', '2025-01-04 01:31:31', '2025-01-04 00:31:31', '2024-10-06 01:31:31', '2025-01-04 00:31:31', 'gr-athens-oaka', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-076', 'Bilbao Progressive Night', 'Gran evento de progressive metal en Bilbao', 'bilbao-progressive-night-2025-76', 'ACTIVE', '2025-01-01 17:14:44', '2025-01-01 16:14:44', '2024-10-03 17:14:44', '2025-01-01 16:14:44', 'es-bilbao-bizkaia-arena', 18640, 18640, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-077', 'Valencia Metal Thunder', 'La mejor noche de heavy metal del a├▒o', 'valencia-metal-thunder-2025-77', 'ACTIVE', '2025-01-13 01:38:50', '2025-01-13 00:38:50', '2024-10-15 01:38:50', '2025-01-13 00:38:50', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-078', 'London Classic Rock Festival', 'Gran evento de classic rock en London', 'london-classic-rock-festival-2025-78', 'ACTIVE', '2025-01-21 03:09:56', '2025-01-21 02:09:56', '2024-10-23 03:09:56', '2025-01-21 02:09:56', 'uk-london-o2-arena', 20000, 20000, 0, 0, NULL, NULL, NULL, '{}', 81.00, 324.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-079', 'Valencia Indie Rock Live', 'La mejor noche de indie rock del a├▒o', 'valencia-indie-rock-live-2025-79', 'ACTIVE', '2025-02-13 07:55:58', '2025-02-13 06:55:58', '2024-11-15 07:55:58', '2025-02-13 06:55:58', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-080', 'Valladolid Golden Rock Era', 'Gran evento de classic rock en Valladolid', 'valladolid-golden-rock-era-2025-80', 'ACTIVE', '2025-01-09 18:34:44', '2025-01-09 17:34:44', '2024-10-11 18:34:44', '2025-01-09 17:34:44', 'es-valladolid-lava', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 18.00, 72.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-081', 'Glasgow Indie Rock Live', 'La mejor noche de indie rock del a├▒o', 'glasgow-indie-rock-live-2025-81', 'ACTIVE', '2025-02-23 05:31:05', '2025-02-23 04:31:05', '2024-11-25 05:31:05', '2025-02-23 04:31:05', 'uk-glasgow-barrowland', 2100, 2100, 0, 0, NULL, NULL, NULL, '{}', 42.00, 168.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-082', 'Valencia Epic Night', 'Noche inolvidable de power metal en directo', 'valencia-epic-night-2025-82', 'ACTIVE', '2025-03-29 06:50:09', '2025-03-29 05:50:09', '2024-12-29 06:50:09', '2025-03-29 05:50:09', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-083', 'Vigo Thrash Power', 'La mejor noche de thrash metal del a├▒o', 'vigo-thrash-power-2025-83', 'ACTIVE', '2025-02-23 04:29:04', '2025-02-23 03:29:04', '2024-11-25 04:29:04', '2025-02-23 03:29:04', 'es-vigo-pazo-cultura', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-084', 'Madrid Technical Night', 'La mejor noche de progressive metal del a├▒o', 'madrid-technical-night-2025-84', 'ACTIVE', '2025-01-10 18:31:31', '2025-01-10 17:31:31', '2024-10-12 18:31:31', '2025-01-10 17:31:31', 'es-madrid-moby-dick', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 19.00, 76.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-085', 'Valencia Hard Rock Night', 'Noche inolvidable de hard rock en directo', 'valencia-hard-rock-night-2025-85', 'ACTIVE', '2025-02-17 10:17:27', '2025-02-17 09:17:27', '2024-11-19 10:17:27', '2025-02-17 09:17:27', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-086', 'Madrid Punk Rock Fest', 'Gran evento de punk rock en Madrid', 'madrid-punk-rock-fest-2025-86', 'ACTIVE', '2025-03-15 18:03:10', '2025-03-15 17:03:10', '2024-12-15 18:03:10', '2025-03-15 17:03:10', 'es-madrid-arena', 12000, 12000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-087', 'Valencia Punk Attack', 'Concierto ├®pico de punk rock en Valencia', 'valencia-punk-attack-2025-87', 'ACTIVE', '2025-01-13 19:36:04', '2025-01-13 18:36:04', '2024-10-15 19:36:04', '2025-01-13 18:36:04', '56bcb5a9-59c0-4476-b69c-649acfec88d4', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-088', 'Paris Death Storm', 'Festival de death metal con bandas internacionales', 'paris-death-storm-2025-88', 'ACTIVE', '2025-01-06 10:01:04', '2025-01-06 09:01:04', '2024-10-08 10:01:04', '2025-01-06 09:01:04', 'fr-paris-bataclan', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-089', 'Palma Vintage Rock Show', 'Gran evento de classic rock en Palma', 'palma-vintage-rock-show-2025-89', 'ACTIVE', '2025-01-28 23:55:47', '2025-01-28 22:55:47', '2024-10-30 23:55:47', '2025-01-28 22:55:47', 'es-palma-son-fusteret', 6000, 6000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-090', 'Alicante Black Metal Night', 'Festival de black metal con bandas internacionales', 'alicante-black-metal-night-2025-90', 'ACTIVE', '2025-01-15 08:14:17', '2025-01-15 07:14:17', '2024-10-17 08:14:17', '2025-01-15 07:14:17', 'es-alicante-plaza-toros', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-091', 'Milan Doom Attack', 'La mejor noche de doom metal del a├▒o', 'milan-doom-attack-2025-91', 'ACTIVE', '2025-03-14 10:45:59', '2025-03-14 09:45:59', '2024-12-14 10:45:59', '2025-03-14 09:45:59', 'it-milan-mediolanum-forum', 12700, 12700, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-092', 'Porto Anarchy Night', 'Festival de punk rock con bandas internacionales', 'porto-anarchy-night-2025-92', 'ACTIVE', '2025-01-26 04:38:24', '2025-01-26 03:38:24', '2024-10-28 04:38:24', '2025-01-26 03:38:24', 'pt-porto-coliseu', 3200, 3200, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-093', 'Bilbao Death Fest', 'Concierto ├®pico de death metal en Bilbao', 'bilbao-death-fest-2025-93', 'ACTIVE', '2025-03-25 04:48:22', '2025-03-25 03:48:22', '2024-12-25 04:48:22', '2025-03-25 03:48:22', 'es-bilbao-bizkaia-arena', 18640, 18640, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-094', 'Vienna Hard Rock Live', 'Concierto ├®pico de hard rock en Vienna', 'vienna-hard-rock-live-2025-94', 'ACTIVE', '2025-03-16 22:54:19', '2025-03-16 21:54:19', '2024-12-16 22:54:19', '2025-03-16 21:54:19', 'at-vienna-gasometer', 3500, 3500, 0, 0, NULL, NULL, NULL, '{}', 39.00, 156.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-095', 'Amsterdam Punk Rock Fest', 'Concierto ├®pico de punk rock en Amsterdam', 'amsterdam-punk-rock-fest-2025-95', 'ACTIVE', '2025-03-27 17:39:37', '2025-03-27 16:39:37', '2024-12-27 17:39:37', '2025-03-27 16:39:37', 'nl-amsterdam-paradiso', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-096', 'Valencia Thrash Storm', 'Noche inolvidable de thrash metal en directo', 'valencia-thrash-storm-2025-96', 'ACTIVE', '2025-02-19 09:33:40', '2025-02-19 08:33:40', '2024-11-21 09:33:40', '2025-02-19 08:33:40', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-097', 'Amsterdam Black Metal Ritual', 'Festival de black metal con bandas internacionales', 'amsterdam-black-metal-ritual-2025-97', 'ACTIVE', '2025-03-02 11:14:48', '2025-03-02 10:14:48', '2024-12-02 11:14:48', '2025-03-02 10:14:48', 'nl-amsterdam-melkweg', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-098', 'Valladolid Rock Icons', 'Noche inolvidable de classic rock en directo', 'valladolid-rock-icons-2025-98', 'ACTIVE', '2025-02-28 01:48:33', '2025-02-28 00:48:33', '2024-11-30 01:48:33', '2025-02-28 00:48:33', 'es-valladolid-lava', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 18.00, 72.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-099', 'Berlin Power Storm', 'Gran evento de power metal en Berlin', 'berlin-power-storm-2025-99', 'ACTIVE', '2025-02-13 09:03:24', '2025-02-13 08:03:24', '2024-11-15 09:03:24', '2025-02-13 08:03:24', 'de-berlin-columbiahalle', 3500, 3500, 0, 0, NULL, NULL, NULL, '{}', 39.00, 156.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-100', 'Brussels Thrash Fest', 'La mejor noche de thrash metal del a├▒o', 'brussels-thrash-fest-2025-100', 'ACTIVE', '2025-03-11 23:27:30', '2025-03-11 22:27:30', '2024-12-11 23:27:30', '2025-03-11 22:27:30', 'be-brussels-ancienne-belgique', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 40.00, 160.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-101', 'Prague Rock Explosion', 'Noche inolvidable de hard rock en directo', 'prague-rock-explosion-2025-101', 'ACTIVE', '2025-05-12 07:35:44', '2025-05-12 06:35:44', '2025-02-11 07:35:44', '2025-05-12 06:35:44', 'cz-prague-o2-arena', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-102', 'Rome Brutal Force', 'Concierto ├®pico de death metal en Rome', 'rome-brutal-force-2025-102', 'ACTIVE', '2025-05-26 10:16:27', '2025-05-26 09:16:27', '2025-02-25 10:16:27', '2025-05-26 09:16:27', 'it-rome-palalottomatica', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-103', 'Amsterdam Heavy Metal Night', 'La mejor noche de heavy metal del a├▒o', 'amsterdam-heavy-metal-night-2025-103', 'ACTIVE', '2025-06-11 06:20:48', '2025-06-11 05:20:48', '2025-03-13 06:20:48', '2025-06-11 05:20:48', 'nl-amsterdam-paradiso', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-104', 'Madrid Prog Metal Fest', 'Concierto ├®pico de progressive metal en Madrid', 'madrid-prog-metal-fest-2025-104', 'ACTIVE', '2025-06-25 07:36:54', '2025-06-25 06:36:54', '2025-03-27 07:36:54', '2025-06-25 06:36:54', 'es-madrid-la-riviera', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-105', 'Manchester Indie Experience', 'Concierto ├®pico de indie rock en Manchester', 'manchester-indie-experience-2025-105', 'ACTIVE', '2025-04-10 10:57:02', '2025-04-10 09:57:02', '2025-01-10 10:57:02', '2025-04-10 09:57:02', 'uk-manchester-academy', 2600, 2600, 0, 0, NULL, NULL, NULL, '{}', 42.00, 168.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-106', 'Madrid Metal Mayhem', 'Noche inolvidable de heavy metal en directo', 'madrid-metal-mayhem-2025-106', 'ACTIVE', '2025-04-16 13:51:32', '2025-04-16 12:51:32', '2025-01-16 13:51:32', '2025-04-16 12:51:32', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-107', 'Sevilla Unholy Night', 'La mejor noche de black metal del a├▒o', 'sevilla-unholy-night-2025-107', 'ACTIVE', '2025-05-25 18:32:53', '2025-05-25 17:32:53', '2025-02-24 18:32:53', '2025-05-25 17:32:53', 'es-sevilla-custom', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-108', 'Valencia Prog Metal Fest', 'Concierto ├®pico de progressive metal en Valencia', 'valencia-prog-metal-fest-2025-108', 'ACTIVE', '2025-04-10 19:26:13', '2025-04-10 18:26:13', '2025-01-10 19:26:13', '2025-04-10 18:26:13', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-109', 'Munich Rock Revival', 'La mejor noche de classic rock del a├▒o', 'munich-rock-revival-2025-109', 'ACTIVE', '2025-06-28 10:22:53', '2025-06-28 09:22:53', '2025-03-30 10:22:53', '2025-06-28 09:22:53', 'de-munich-backstage', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-110', 'Las Palmas Alternative Anthems', 'Gran evento de alternative rock en Las Palmas', 'las-palmas-alternative-anthems-2025-110', 'ACTIVE', '2025-04-26 20:53:56', '2025-04-26 19:53:56', '2025-01-26 20:53:56', '2025-04-26 19:53:56', 'es-laspalmas-gran-canaria-arena', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-111', 'Valencia Underground Rock', 'Festival de alternative rock con bandas internacionales', 'valencia-underground-rock-2025-111', 'ACTIVE', '2025-06-02 05:50:18', '2025-06-02 04:50:18', '2025-03-04 05:50:18', '2025-06-02 04:50:18', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-112', 'Porto Indie Night', 'Noche inolvidable de indie rock en directo', 'porto-indie-night-2025-112', 'ACTIVE', '2025-06-08 00:08:55', '2025-06-07 23:08:55', '2025-03-10 00:08:55', '2025-06-07 23:08:55', 'pt-porto-coliseu', 3200, 3200, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-113', 'Paris Thrash Legends', 'Festival de thrash metal con bandas internacionales', 'paris-thrash-legends-2025-113', 'ACTIVE', '2025-05-09 21:04:21', '2025-05-09 20:04:21', '2025-02-08 21:04:21', '2025-05-09 20:04:21', 'fr-paris-bataclan', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-114', 'Rome Punk Attack', 'La mejor noche de punk rock del a├▒o', 'rome-punk-attack-2025-114', 'ACTIVE', '2025-05-01 22:59:41', '2025-05-01 21:59:41', '2025-01-31 22:59:41', '2025-05-01 21:59:41', 'it-rome-atlantico', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 22.00, 88.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-115', 'Manchester Progressive Storm', 'Gran evento de progressive metal en Manchester', 'manchester-progressive-storm-2025-115', 'ACTIVE', '2025-05-28 01:32:33', '2025-05-28 00:32:33', '2025-02-27 01:32:33', '2025-05-28 00:32:33', 'uk-manchester-arena', 21000, 21000, 0, 0, NULL, NULL, NULL, '{}', 70.00, 280.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-116', 'Zaragoza Infernal Night', 'Festival de black metal con bandas internacionales', 'zaragoza-infernal-night-2025-116', 'ACTIVE', '2025-06-21 03:22:44', '2025-06-21 02:22:44', '2025-03-23 03:22:44', '2025-06-21 02:22:44', 'es-zaragoza-pabellon-principe-felipe', 10800, 10800, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-117', 'Munich Metal Revolution', 'La mejor noche de heavy metal del a├▒o', 'munich-metal-revolution-2025-117', 'ACTIVE', '2025-06-23 03:03:11', '2025-06-23 02:03:11', '2025-03-25 03:03:11', '2025-06-23 02:03:11', 'de-munich-olympiahalle', 15500, 15500, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-118', 'Valencia Anarchy Night', 'Noche inolvidable de punk rock en directo', 'valencia-anarchy-night-2025-118', 'ACTIVE', '2025-06-04 23:52:00', '2025-06-04 22:52:00', '2025-03-06 23:52:00', '2025-06-04 22:52:00', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-119', 'Paris Power Metal Fest', 'Noche inolvidable de power metal en directo', 'paris-power-metal-fest-2025-119', 'ACTIVE', '2025-06-25 14:42:22', '2025-06-25 13:42:22', '2025-03-27 14:42:22', '2025-06-25 13:42:22', 'fr-paris-bataclan', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-120', 'Las Palmas Alt Rock Night', 'Noche inolvidable de alternative rock en directo', 'las-palmas-alt-rock-night-2025-120', 'ACTIVE', '2025-05-16 19:02:48', '2025-05-16 18:02:48', '2025-02-15 19:02:48', '2025-05-16 18:02:48', 'es-laspalmas-gran-canaria-arena', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-121', 'Munich Doom Force', 'Noche inolvidable de doom metal en directo', 'munich-doom-force-2025-121', 'ACTIVE', '2025-05-22 09:18:58', '2025-05-22 08:18:58', '2025-02-21 09:18:58', '2025-05-22 08:18:58', 'de-munich-olympiahalle', 15500, 15500, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-122', 'Munich Rock Legends', 'Concierto ├®pico de classic rock en Munich', 'munich-rock-legends-2025-122', 'ACTIVE', '2025-04-19 02:39:49', '2025-04-19 01:39:49', '2025-01-19 02:39:49', '2025-04-19 01:39:49', 'de-munich-olympiahalle', 15500, 15500, 0, 0, NULL, NULL, NULL, '{}', 65.00, 260.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-123', 'Lisbon Black Metal Attack', 'Noche inolvidable de black metal en directo', 'lisbon-black-metal-attack-2025-123', 'ACTIVE', '2025-06-10 02:47:37', '2025-06-10 01:47:37', '2025-03-12 02:47:37', '2025-06-10 01:47:37', 'pt-lisbon-altice-arena', 20000, 20000, 0, 0, NULL, NULL, NULL, '{}', 43.00, 172.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-124', 'London Power Revolution', 'Gran evento de power metal en London', 'london-power-revolution-2025-124', 'ACTIVE', '2025-05-26 21:57:11', '2025-05-26 20:57:11', '2025-02-25 21:57:11', '2025-05-26 20:57:11', 'uk-london-electric-ballroom', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 26.00, 104.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-125', 'Bilbao Death Revolution', 'Concierto ├®pico de death metal en Bilbao', 'bilbao-death-revolution-2025-125', 'ACTIVE', '2025-05-03 05:27:45', '2025-05-03 04:27:45', '2025-02-02 05:27:45', '2025-05-03 04:27:45', 'es-bilbao-kafe-antzokia', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-126', 'Barcelona Metal Legends', 'Concierto ├®pico de heavy metal en Barcelona', 'barcelona-metal-legends-2025-126', 'ACTIVE', '2025-06-23 20:45:32', '2025-06-23 19:45:32', '2025-03-25 20:45:32', '2025-06-23 19:45:32', 'es-barcelona-bikini', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-127', 'London Indie Rock Live', 'Concierto ├®pico de indie rock en London', 'london-indie-rock-live-2025-127', 'ACTIVE', '2025-05-18 03:00:29', '2025-05-18 02:00:29', '2025-02-17 03:00:29', '2025-05-18 02:00:29', 'uk-london-roundhouse', 3300, 3300, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-128', 'Berlin Indie Showcase', 'Noche inolvidable de indie rock en directo', 'berlin-indie-showcase-2025-128', 'ACTIVE', '2025-04-18 10:47:03', '2025-04-18 09:47:03', '2025-01-18 10:47:03', '2025-04-18 09:47:03', 'de-berlin-mercedes-benz-arena', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-129', 'Berlin Timeless Rock', 'Noche inolvidable de classic rock en directo', 'berlin-timeless-rock-2025-129', 'ACTIVE', '2025-06-25 23:35:24', '2025-06-25 22:35:24', '2025-03-27 23:35:24', '2025-06-25 22:35:24', 'de-berlin-mercedes-benz-arena', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 65.00, 260.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-130', 'Barcelona Death Attack', 'Noche inolvidable de death metal en directo', 'barcelona-death-attack-2025-130', 'ACTIVE', '2025-05-25 22:38:38', '2025-05-25 21:38:38', '2025-02-24 22:38:38', '2025-05-25 21:38:38', 'es-barcelona-apolo', 1600, 1600, 0, 0, NULL, NULL, NULL, '{}', 17.00, 68.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-131', 'Manchester Black Metal Night', 'Festival de black metal con bandas internacionales', 'manchester-black-metal-night-2025-131', 'ACTIVE', '2025-04-26 01:02:32', '2025-04-26 00:02:32', '2025-01-26 01:02:32', '2025-04-26 00:02:32', 'uk-manchester-arena', 21000, 21000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-132', 'Oviedo Death Warriors', 'Gran evento de death metal en Oviedo', 'oviedo-death-warriors-2025-132', 'ACTIVE', '2025-05-27 01:05:21', '2025-05-27 00:05:21', '2025-02-26 01:05:21', '2025-05-27 00:05:21', 'es-oviedo-principe-felipe', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-133', 'Rome Anarchy Night', 'Concierto ├®pico de punk rock en Rome', 'rome-anarchy-night-2025-133', 'ACTIVE', '2025-06-10 04:22:33', '2025-06-10 03:22:33', '2025-03-12 04:22:33', '2025-06-10 03:22:33', 'it-rome-atlantico', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 22.00, 88.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-134', 'Munich Legendary Rock', 'Festival de classic rock con bandas internacionales', 'munich-legendary-rock-2025-134', 'ACTIVE', '2025-06-07 05:02:51', '2025-06-07 04:02:51', '2025-03-09 05:02:51', '2025-06-07 04:02:51', 'de-munich-olympiahalle', 15500, 15500, 0, 0, NULL, NULL, NULL, '{}', 65.00, 260.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-135', 'Oslo Rock Anthology', 'La mejor noche de classic rock del a├▒o', 'oslo-rock-anthology-2025-135', 'ACTIVE', '2025-04-26 08:09:43', '2025-04-26 07:09:43', '2025-01-26 08:09:43', '2025-04-26 07:09:43', 'no-oslo-spektrum', 9700, 9700, 0, 0, NULL, NULL, NULL, '{}', 55.00, 220.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-136', 'A Coru├▒a Rock Force', 'Festival de hard rock con bandas internacionales', 'a-coruna-rock-force-2025-136', 'ACTIVE', '2025-05-15 07:41:04', '2025-05-15 06:41:04', '2025-02-14 07:41:04', '2025-05-15 06:41:04', 'es-coruna-coliseum', 10500, 10500, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-137', 'Valencia Indie Sessions', 'Concierto ├®pico de indie rock en Valencia', 'valencia-indie-sessions-2025-137', 'ACTIVE', '2025-05-26 10:21:38', '2025-05-26 09:21:38', '2025-02-25 10:21:38', '2025-05-26 09:21:38', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-138', 'Vigo Timeless Rock', 'Noche inolvidable de classic rock en directo', 'vigo-timeless-rock-2025-138', 'ACTIVE', '2025-05-21 17:15:27', '2025-05-21 16:15:27', '2025-02-20 17:15:27', '2025-05-21 16:15:27', 'es-vigo-pazo-cultura', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 19.00, 76.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-139', 'Valencia Indie Anthems', 'Gran evento de indie rock en Valencia', 'valencia-indie-anthems-2025-139', 'ACTIVE', '2025-05-12 08:12:15', '2025-05-12 07:12:15', '2025-02-11 08:12:15', '2025-05-12 07:12:15', 'f794e6f0-28c4-4512-ab20-1954720ea984', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-140', 'Sevilla Symphonic Power', 'La mejor noche de symphonic metal del a├▒o', 'sevilla-symphonic-power-2025-140', 'ACTIVE', '2025-04-17 16:47:13', '2025-04-17 15:47:13', '2025-01-17 16:47:13', '2025-04-17 15:47:13', 'es-sevilla-cartuja-center', 7000, 7000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-141', 'Barcelona Epic Orchestra', 'Festival de symphonic metal con bandas internacionales', 'barcelona-epic-orchestra-2025-141', 'ACTIVE', '2025-04-01 21:42:38', '2025-04-01 20:42:38', '2025-01-01 21:42:38', '2025-04-01 20:42:38', 'es-barcelona-palau-sant-jordi', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-142', 'Copenhagen Rock Power', 'Gran evento de hard rock en Copenhagen', 'copenhagen-rock-power-2025-142', 'ACTIVE', '2025-05-07 16:46:43', '2025-05-07 15:46:43', '2025-02-06 16:46:43', '2025-05-07 15:46:43', 'dk-copenhagen-royal-arena', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 56.00, 224.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-143', 'Valencia Thrash Force', 'Gran evento de thrash metal en Valencia', 'valencia-thrash-force-2025-143', 'ACTIVE', '2025-06-23 11:01:27', '2025-06-23 10:01:27', '2025-03-25 11:01:27', '2025-06-23 10:01:27', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-144', 'Paris Indie Underground', 'Gran evento de indie rock en Paris', 'paris-indie-underground-2025-144', 'ACTIVE', '2025-04-18 12:09:40', '2025-04-18 11:09:40', '2025-01-18 12:09:40', '2025-04-18 11:09:40', 'fr-paris-accor-arena', 20300, 20300, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-145', 'Paris Vintage Rock Show', 'Festival de classic rock con bandas internacionales', 'paris-vintage-rock-show-2025-145', 'ACTIVE', '2025-06-16 12:16:15', '2025-06-16 11:16:15', '2025-03-18 12:16:15', '2025-06-16 11:16:15', 'fr-paris-olympia', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 55.00, 220.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-146', 'Athens Thrash Legends', 'Concierto ├®pico de thrash metal en Athens', 'athens-thrash-legends-2025-146', 'ACTIVE', '2025-04-17 18:15:05', '2025-04-17 17:15:05', '2025-01-17 18:15:05', '2025-04-17 17:15:05', 'gr-athens-oaka', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-147', 'Barcelona Rock Force', 'Concierto ├®pico de hard rock en Barcelona', 'barcelona-rock-force-2025-147', 'ACTIVE', '2025-06-14 13:24:29', '2025-06-14 12:24:29', '2025-03-16 13:24:29', '2025-06-14 12:24:29', 'es-barcelona-palau-sant-jordi', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-148', 'Sevilla Doom Force', 'Noche inolvidable de doom metal en directo', 'sevilla-doom-force-2025-148', 'ACTIVE', '2025-06-03 18:13:02', '2025-06-03 17:13:02', '2025-03-05 18:13:02', '2025-06-03 17:13:02', 'es-sevilla-cartuja-center', 7000, 7000, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-149', 'Lisbon Hard Rock Legends', 'Noche inolvidable de hard rock en directo', 'lisbon-hard-rock-legends-2025-149', 'ACTIVE', '2025-06-14 11:47:07', '2025-06-14 10:47:07', '2025-03-16 11:47:07', '2025-06-14 10:47:07', 'pt-lisbon-lav', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-150', 'Palma Dark Ritual', 'La mejor noche de black metal del a├▒o', 'palma-dark-ritual-2025-150', 'ACTIVE', '2025-06-28 22:52:49', '2025-06-28 21:52:49', '2025-03-30 22:52:49', '2025-06-28 21:52:49', 'es-palma-son-fusteret', 6000, 6000, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-151', 'Lyon Indie Showcase', 'Gran evento de indie rock en Lyon', 'lyon-indie-showcase-2025-151', 'ACTIVE', '2025-04-19 15:32:19', '2025-04-19 14:32:19', '2025-01-19 15:32:19', '2025-04-19 14:32:19', 'fr-lyon-halle-tony-garnier', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-152', 'Rome Doom Revolution', 'Gran evento de doom metal en Rome', 'rome-doom-revolution-2025-152', 'ACTIVE', '2025-06-20 07:10:52', '2025-06-20 06:10:52', '2025-03-22 07:10:52', '2025-06-20 06:10:52', 'it-rome-palalottomatica', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-153', 'Madrid Alt Rock Experience', 'La mejor noche de alternative rock del a├▒o', 'madrid-alt-rock-experience-2025-153', 'ACTIVE', '2025-04-21 06:06:27', '2025-04-21 05:06:27', '2025-01-21 06:06:27', '2025-04-21 05:06:27', 'es-madrid-moby-dick', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-154', 'Valencia Metal Revolution', 'Festival de heavy metal con bandas internacionales', 'valencia-metal-revolution-2025-154', 'ACTIVE', '2025-05-12 05:15:06', '2025-05-12 04:15:06', '2025-02-11 05:15:06', '2025-05-12 04:15:06', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-155', 'Paris Indie Revolution', 'La mejor noche de indie rock del a├▒o', 'paris-indie-revolution-2025-155', 'ACTIVE', '2025-06-12 05:45:13', '2025-06-12 04:45:13', '2025-03-14 05:45:13', '2025-06-12 04:45:13', 'fr-paris-olympia', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-156', 'C├│rdoba Rock Thunder', 'Festival de hard rock con bandas internacionales', 'cordoba-rock-thunder-2025-156', 'ACTIVE', '2025-04-25 21:29:56', '2025-04-25 20:29:56', '2025-01-25 21:29:56', '2025-04-25 20:29:56', 'es-cordoba-palacio-congresos', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-157', 'Manchester Epic Legends', 'Concierto ├®pico de power metal en Manchester', 'manchester-epic-legends-2025-157', 'ACTIVE', '2025-06-15 14:06:41', '2025-06-15 13:06:41', '2025-03-17 14:06:41', '2025-06-15 13:06:41', 'uk-manchester-academy', 2600, 2600, 0, 0, NULL, NULL, NULL, '{}', 42.00, 168.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-158', 'Valencia Progressive Force', 'Festival de progressive metal con bandas internacionales', 'valencia-progressive-force-2025-158', 'ACTIVE', '2025-04-14 18:35:08', '2025-04-14 17:35:08', '2025-01-14 18:35:08', '2025-04-14 17:35:08', 'eedf995f-f060-4105-81b5-8b46dd58be37', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 20.00, 80.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-159', 'Valencia Punk Explosion', 'Festival de punk rock con bandas internacionales', 'valencia-punk-explosion-2025-159', 'ACTIVE', '2025-05-29 05:08:53', '2025-05-29 04:08:53', '2025-02-28 05:08:53', '2025-05-29 04:08:53', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-160', 'Lyon Rock Revival', 'Gran evento de classic rock en Lyon', 'lyon-rock-revival-2025-160', 'ACTIVE', '2025-05-03 18:02:25', '2025-05-03 17:02:25', '2025-02-02 18:02:25', '2025-05-03 17:02:25', 'fr-lyon-halle-tony-garnier', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 65.00, 260.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-161', 'Porto Indie Experience', 'Festival de indie rock con bandas internacionales', 'porto-indie-experience-2025-161', 'ACTIVE', '2025-04-08 22:31:48', '2025-04-08 21:31:48', '2025-01-08 22:31:48', '2025-04-08 21:31:48', 'pt-porto-coliseu', 3200, 3200, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-162', 'M├ílaga Thrash Warriors', 'Gran evento de thrash metal en M├ílaga', 'malaga-thrash-warriors-2025-162', 'ACTIVE', '2025-06-26 05:55:52', '2025-06-26 04:55:52', '2025-03-28 05:55:52', '2025-06-26 04:55:52', 'es-malaga-martin-carpena', 11300, 11300, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-163', 'Barcelona Death Storm', 'Gran evento de death metal en Barcelona', 'barcelona-death-storm-2025-163', 'ACTIVE', '2025-04-02 22:43:51', '2025-04-02 21:43:51', '2025-01-02 22:43:51', '2025-04-02 21:43:51', 'es-barcelona-apolo', 1600, 1600, 0, 0, NULL, NULL, NULL, '{}', 17.00, 68.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-164', 'Las Palmas Thrash Fest', 'Concierto ├®pico de thrash metal en Las Palmas', 'las-palmas-thrash-fest-2025-164', 'ACTIVE', '2025-06-18 10:16:02', '2025-06-18 09:16:02', '2025-03-20 10:16:02', '2025-06-18 09:16:02', 'es-laspalmas-gran-canaria-arena', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-165', 'Oslo Rock Icons', 'Festival de classic rock con bandas internacionales', 'oslo-rock-icons-2025-165', 'ACTIVE', '2025-06-27 14:48:04', '2025-06-27 13:48:04', '2025-03-29 14:48:04', '2025-06-27 13:48:04', 'no-oslo-spektrum', 9700, 9700, 0, 0, NULL, NULL, NULL, '{}', 55.00, 220.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-166', 'A Coru├▒a Brutal Force', 'Concierto ├®pico de death metal en A Coru├▒a', 'a-coruna-brutal-force-2025-166', 'ACTIVE', '2025-04-13 21:20:29', '2025-04-13 20:20:29', '2025-01-13 21:20:29', '2025-04-13 20:20:29', 'es-coruna-coliseum', 10500, 10500, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-167', 'Valencia Darkness Fest', 'Noche inolvidable de black metal en directo', 'valencia-darkness-fest-2025-167', 'ACTIVE', '2025-06-23 16:53:19', '2025-06-23 15:53:19', '2025-03-25 16:53:19', '2025-06-23 15:53:19', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-168', 'Bilbao Classic Rock Night', 'Gran evento de classic rock en Bilbao', 'bilbao-classic-rock-night-2025-168', 'ACTIVE', '2025-04-29 10:05:51', '2025-04-29 09:05:51', '2025-01-29 10:05:51', '2025-04-29 09:05:51', 'es-bilbao-kafe-antzokia', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 19.00, 76.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-169', 'Manchester Punk Legends', 'Noche inolvidable de punk rock en directo', 'manchester-punk-legends-2025-169', 'ACTIVE', '2025-04-24 05:43:49', '2025-04-24 04:43:49', '2025-01-24 05:43:49', '2025-04-24 04:43:49', 'uk-manchester-arena', 21000, 21000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-170', 'Munich Thrash Storm', 'Noche inolvidable de thrash metal en directo', 'munich-thrash-storm-2025-170', 'ACTIVE', '2025-04-29 06:21:11', '2025-04-29 05:21:11', '2025-01-29 06:21:11', '2025-04-29 05:21:11', 'de-munich-olympiahalle', 15500, 15500, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-171', 'Valencia Rock Heroes', 'La mejor noche de classic rock del a├▒o', 'valencia-rock-heroes-2025-171', 'ACTIVE', '2025-06-16 05:25:51', '2025-06-16 04:25:51', '2025-03-18 05:25:51', '2025-06-16 04:25:51', 'f794e6f0-28c4-4512-ab20-1954720ea984', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 18.00, 72.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-172', 'Barcelona Steel Force', 'Concierto ├®pico de heavy metal en Barcelona', 'barcelona-steel-force-2025-172', 'ACTIVE', '2025-06-23 01:33:59', '2025-06-23 00:33:59', '2025-03-25 01:33:59', '2025-06-23 00:33:59', 'es-barcelona-bikini', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-173', 'Madrid Hard Rock Attack', 'Gran evento de hard rock en Madrid', 'madrid-hard-rock-attack-2025-173', 'ACTIVE', '2025-06-28 07:58:06', '2025-06-28 06:58:06', '2025-03-30 07:58:06', '2025-06-28 06:58:06', 'es-madrid-but', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-174', 'Warsaw Alternative Fest', 'Noche inolvidable de alternative rock en directo', 'warsaw-alternative-fest-2025-174', 'ACTIVE', '2025-04-24 05:34:40', '2025-04-24 04:34:40', '2025-01-24 05:34:40', '2025-04-24 04:34:40', 'pl-warsaw-torwar', 4800, 4800, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-175', 'London Street Punk', 'Gran evento de punk rock en London', 'london-street-punk-2025-175', 'ACTIVE', '2025-04-12 07:03:37', '2025-04-12 06:03:37', '2025-01-12 07:03:37', '2025-04-12 06:03:37', 'uk-london-electric-ballroom', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 26.00, 104.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-176', 'Oviedo Prog Metal Live', 'Concierto ├®pico de progressive metal en Oviedo', 'oviedo-prog-metal-live-2025-176', 'ACTIVE', '2025-06-15 20:04:05', '2025-06-15 19:04:05', '2025-03-17 20:04:05', '2025-06-15 19:04:05', 'es-oviedo-principe-felipe', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 34.00, 136.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-177', 'Vienna Independent Sound', 'Concierto ├®pico de indie rock en Vienna', 'vienna-independent-sound-2025-177', 'ACTIVE', '2025-05-16 22:18:49', '2025-05-16 21:18:49', '2025-02-15 22:18:49', '2025-05-16 21:18:49', 'at-vienna-stadthalle', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 52.00, 208.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-178', 'Lyon Timeless Rock', 'Festival de classic rock con bandas internacionales', 'lyon-timeless-rock-2025-178', 'ACTIVE', '2025-05-30 10:58:53', '2025-05-30 09:58:53', '2025-03-01 10:58:53', '2025-05-30 09:58:53', 'fr-lyon-halle-tony-garnier', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 65.00, 260.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-179', 'Palma Rock Power', 'Festival de hard rock con bandas internacionales', 'palma-rock-power-2025-179', 'ACTIVE', '2025-05-29 03:31:34', '2025-05-29 02:31:34', '2025-02-28 03:31:34', '2025-05-29 02:31:34', 'es-palma-son-fusteret', 6000, 6000, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-180', 'Vigo Thrash Chaos', 'Gran evento de thrash metal en Vigo', 'vigo-thrash-chaos-2025-180', 'ACTIVE', '2025-05-03 02:02:48', '2025-05-03 01:02:48', '2025-02-02 02:02:48', '2025-05-03 01:02:48', 'es-vigo-pazo-cultura', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-181', 'Oslo Metal Orchestra', 'La mejor noche de symphonic metal del a├▒o', 'oslo-metal-orchestra-2025-181', 'ACTIVE', '2025-05-15 00:43:58', '2025-05-14 23:43:58', '2025-02-14 00:43:58', '2025-05-14 23:43:58', 'no-oslo-spektrum', 9700, 9700, 0, 0, NULL, NULL, NULL, '{}', 55.00, 220.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-182', 'Copenhagen Black Metal Storm', 'Festival de black metal con bandas internacionales', 'copenhagen-black-metal-storm-2025-182', 'ACTIVE', '2025-06-22 07:17:09', '2025-06-22 06:17:09', '2025-03-24 07:17:09', '2025-06-22 06:17:09', 'dk-copenhagen-royal-arena', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 56.00, 224.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-183', 'Madrid Indie Vibes', 'La mejor noche de indie rock del a├▒o', 'madrid-indie-vibes-2025-183', 'ACTIVE', '2025-04-03 02:31:22', '2025-04-03 01:31:22', '2025-01-03 02:31:22', '2025-04-03 01:31:22', 'es-madrid-but', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-184', 'Amsterdam Indie Movement', 'Concierto ├®pico de indie rock en Amsterdam', 'amsterdam-indie-movement-2025-184', 'ACTIVE', '2025-06-16 15:01:47', '2025-06-16 14:01:47', '2025-03-18 15:01:47', '2025-06-16 14:01:47', 'nl-amsterdam-melkweg', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-185', 'Paris Underground Rock', 'Gran evento de alternative rock en Paris', 'paris-underground-rock-2025-185', 'ACTIVE', '2025-04-15 08:29:29', '2025-04-15 07:29:29', '2025-01-15 08:29:29', '2025-04-15 07:29:29', 'fr-paris-olympia', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-186', 'Amsterdam Metal Symphony', 'Concierto ├®pico de symphonic metal en Amsterdam', 'amsterdam-metal-symphony-2025-186', 'ACTIVE', '2025-05-01 01:06:04', '2025-05-01 00:06:04', '2025-01-31 01:06:04', '2025-05-01 00:06:04', 'nl-amsterdam-melkweg', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 29.00, 116.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-187', 'Athens Indie Rock Fest', 'Noche inolvidable de indie rock en directo', 'athens-indie-rock-fest-2025-187', 'ACTIVE', '2025-05-21 13:51:22', '2025-05-21 12:51:22', '2025-02-20 13:51:22', '2025-05-21 12:51:22', 'gr-athens-oaka', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-188', 'Athens Stoner Doom', 'Concierto ├®pico de doom metal en Athens', 'athens-stoner-doom-2025-188', 'ACTIVE', '2025-05-30 04:02:47', '2025-05-30 03:02:47', '2025-03-01 04:02:47', '2025-05-30 03:02:47', 'gr-athens-oaka', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-189', 'London Indie Vibes', 'Festival de indie rock con bandas internacionales', 'london-indie-vibes-2025-189', 'ACTIVE', '2025-05-17 21:59:48', '2025-05-17 20:59:48', '2025-02-16 21:59:48', '2025-05-17 20:59:48', 'uk-london-roundhouse', 3300, 3300, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-190', 'Palma Vintage Rock Show', 'Festival de classic rock con bandas internacionales', 'palma-vintage-rock-show-2025-190', 'ACTIVE', '2025-05-28 13:35:16', '2025-05-28 12:35:16', '2025-02-27 13:35:16', '2025-05-28 12:35:16', 'es-palma-son-fusteret', 6000, 6000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-191', 'Munich Alternative Vibes', 'La mejor noche de alternative rock del a├▒o', 'munich-alternative-vibes-2025-191', 'ACTIVE', '2025-05-17 06:18:10', '2025-05-17 05:18:10', '2025-02-16 06:18:10', '2025-05-17 05:18:10', 'de-munich-backstage', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 20.00, 80.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-192', 'Barcelona Hard Rock Attack', 'Gran evento de hard rock en Barcelona', 'barcelona-hard-rock-attack-2025-192', 'ACTIVE', '2025-06-25 03:01:47', '2025-06-25 02:01:47', '2025-03-27 03:01:47', '2025-06-25 02:01:47', 'es-barcelona-palau-sant-jordi', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-193', 'Sevilla Timeless Rock', 'Festival de classic rock con bandas internacionales', 'sevilla-timeless-rock-2025-193', 'ACTIVE', '2025-04-04 02:59:42', '2025-04-04 01:59:42', '2025-01-04 02:59:42', '2025-04-04 01:59:42', 'es-sevilla-custom', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 19.00, 76.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-194', 'Bilbao Indie Vibes', 'Concierto ├®pico de indie rock en Bilbao', 'bilbao-indie-vibes-2025-194', 'ACTIVE', '2025-04-11 09:30:31', '2025-04-11 08:30:31', '2025-01-11 09:30:31', '2025-04-11 08:30:31', 'es-bilbao-bizkaia-arena', 18640, 18640, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-195', 'M├ílaga Rock Heroes', 'Noche inolvidable de classic rock en directo', 'malaga-rock-heroes-2025-195', 'ACTIVE', '2025-06-21 06:17:41', '2025-06-21 05:17:41', '2025-03-23 06:17:41', '2025-06-21 05:17:41', 'es-malaga-martin-carpena', 11300, 11300, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-196', 'Porto Thrash Storm', 'Noche inolvidable de thrash metal en directo', 'porto-thrash-storm-2025-196', 'ACTIVE', '2025-06-16 00:03:07', '2025-06-15 23:03:07', '2025-03-18 00:03:07', '2025-06-15 23:03:07', 'pt-porto-coliseu', 3200, 3200, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-197', 'Munich Punk Legends', 'Concierto ├®pico de punk rock en Munich', 'munich-punk-legends-2025-197', 'ACTIVE', '2025-06-18 08:19:14', '2025-06-18 07:19:14', '2025-03-20 08:19:14', '2025-06-18 07:19:14', 'de-munich-olympiahalle', 15500, 15500, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-198', 'Prague Legendary Rock', 'Gran evento de classic rock en Prague', 'prague-legendary-rock-2025-198', 'ACTIVE', '2025-06-03 03:31:06', '2025-06-03 02:31:06', '2025-03-05 03:31:06', '2025-06-03 02:31:06', 'cz-prague-o2-arena', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-199', 'Gij├│n Doom Fest', 'La mejor noche de doom metal del a├▒o', 'gijon-doom-fest-2025-199', 'ACTIVE', '2025-04-03 21:40:46', '2025-04-03 20:40:46', '2025-01-03 21:40:46', '2025-04-03 20:40:46', 'es-gijon-plaza-toros', 12000, 12000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-200', 'Vigo Rock Storm', 'Festival de hard rock con bandas internacionales', 'vigo-rock-storm-2025-200', 'ACTIVE', '2025-05-19 15:52:44', '2025-05-19 14:52:44', '2025-02-18 15:52:44', '2025-05-19 14:52:44', 'es-vigo-pazo-cultura', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-201', 'Barcelona Progressive Attack', 'La mejor noche de progressive metal del a├▒o', 'barcelona-progressive-attack-2025-201', 'ACTIVE', '2025-09-11 07:14:52', '2025-09-11 06:14:52', '2025-06-13 07:14:52', '2025-09-11 06:14:52', 'es-barcelona-palau-sant-jordi', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-202', 'Madrid Doom Ritual', 'Gran evento de doom metal en Madrid', 'madrid-doom-ritual-2025-202', 'ACTIVE', '2025-08-13 06:04:42', '2025-08-13 05:04:42', '2025-05-15 06:04:42', '2025-08-13 05:04:42', 'es-madrid-moby-dick', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-203', 'Manchester Extreme Death', 'Gran evento de death metal en Manchester', 'manchester-extreme-death-2025-203', 'ACTIVE', '2025-07-13 22:51:14', '2025-07-13 21:51:14', '2025-04-14 22:51:14', '2025-07-13 21:51:14', 'uk-manchester-academy', 2600, 2600, 0, 0, NULL, NULL, NULL, '{}', 42.00, 168.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-204', 'Copenhagen Doom Fest', 'Noche inolvidable de doom metal en directo', 'copenhagen-doom-fest-2025-204', 'ACTIVE', '2025-08-09 14:50:59', '2025-08-09 13:50:59', '2025-05-11 14:50:59', '2025-08-09 13:50:59', 'dk-copenhagen-royal-arena', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 56.00, 224.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-205', 'Bilbao Death Revolution', 'Noche inolvidable de death metal en directo', 'bilbao-death-revolution-2025-205', 'ACTIVE', '2025-09-18 17:15:19', '2025-09-18 16:15:19', '2025-06-20 17:15:19', '2025-09-18 16:15:19', 'es-bilbao-kafe-antzokia', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-206', 'Madrid Rock Anthology', 'Concierto ├®pico de classic rock en Madrid', 'madrid-rock-anthology-2025-206', 'ACTIVE', '2025-09-09 12:01:36', '2025-09-09 11:01:36', '2025-06-11 12:01:36', '2025-09-09 11:01:36', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-207', 'Valencia Rock Power', 'Concierto ├®pico de hard rock en Valencia', 'valencia-rock-power-2025-207', 'ACTIVE', '2025-08-16 00:37:35', '2025-08-15 23:37:35', '2025-05-18 00:37:35', '2025-08-15 23:37:35', 'f794e6f0-28c4-4512-ab20-1954720ea984', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-208', 'San Sebasti├ín Extreme Death', 'Concierto ├®pico de death metal en San Sebasti├ín', 'san-sebastian-extreme-death-2025-208', 'ACTIVE', '2025-09-07 08:15:50', '2025-09-07 07:15:50', '2025-06-09 08:15:50', '2025-09-07 07:15:50', 'es-donostia-kursaal', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 17.00, 68.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-209', 'London Hard Rock Legends', 'Festival de hard rock con bandas internacionales', 'london-hard-rock-legends-2025-209', 'ACTIVE', '2025-09-13 00:04:07', '2025-09-12 23:04:07', '2025-06-15 00:04:07', '2025-09-12 23:04:07', 'uk-london-roundhouse', 3300, 3300, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-210', 'Valencia Alternative Revolution', 'Noche inolvidable de alternative rock en directo', 'valencia-alternative-revolution-2025-210', 'ACTIVE', '2025-09-22 11:45:05', '2025-09-22 10:45:05', '2025-06-24 11:45:05', '2025-09-22 10:45:05', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-211', 'Munich Black Metal Night', 'Noche inolvidable de black metal en directo', 'munich-black-metal-night-2025-211', 'ACTIVE', '2025-09-21 20:16:26', '2025-09-21 19:16:26', '2025-06-23 20:16:26', '2025-09-21 19:16:26', 'de-munich-olympiahalle', 15500, 15500, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-212', 'Oviedo Prog Metal Fest', 'Festival de progressive metal con bandas internacionales', 'oviedo-prog-metal-fest-2025-212', 'ACTIVE', '2025-08-24 21:50:55', '2025-08-24 20:50:55', '2025-05-26 21:50:55', '2025-08-24 20:50:55', 'es-oviedo-principe-felipe', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 34.00, 136.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-213', 'Amsterdam Progressive Force', 'Concierto ├®pico de progressive metal en Amsterdam', 'amsterdam-progressive-force-2025-213', 'ACTIVE', '2025-07-06 12:06:35', '2025-07-06 11:06:35', '2025-04-07 12:06:35', '2025-07-06 11:06:35', 'nl-amsterdam-paradiso', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 29.00, 116.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-214', 'Granada Underground Rock', 'Gran evento de alternative rock en Granada', 'granada-underground-rock-2025-214', 'ACTIVE', '2025-07-28 10:48:00', '2025-07-28 09:48:00', '2025-04-29 10:48:00', '2025-07-28 09:48:00', 'es-granada-industrial-copera', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-215', 'Glasgow Metal Symphony', 'Concierto ├®pico de symphonic metal en Glasgow', 'glasgow-metal-symphony-2025-215', 'ACTIVE', '2025-07-04 16:01:06', '2025-07-04 15:01:06', '2025-04-05 16:01:06', '2025-07-04 15:01:06', 'uk-glasgow-barrowland', 2100, 2100, 0, 0, NULL, NULL, NULL, '{}', 50.00, 200.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-216', 'Valencia Timeless Rock', 'Noche inolvidable de classic rock en directo', 'valencia-timeless-rock-2025-216', 'ACTIVE', '2025-08-02 18:39:06', '2025-08-02 17:39:06', '2025-05-04 18:39:06', '2025-08-02 17:39:06', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 20.00, 80.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-217', 'London Power Storm', 'Gran evento de power metal en London', 'london-power-storm-2025-217', 'ACTIVE', '2025-07-12 10:36:28', '2025-07-12 09:36:28', '2025-04-13 10:36:28', '2025-07-12 09:36:28', 'uk-london-o2-arena', 20000, 20000, 0, 0, NULL, NULL, NULL, '{}', 68.00, 272.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-218', 'Berlin Heavy Metal Night', 'Festival de heavy metal con bandas internacionales', 'berlin-heavy-metal-night-2025-218', 'ACTIVE', '2025-07-11 16:09:44', '2025-07-11 15:09:44', '2025-04-12 16:09:44', '2025-07-11 15:09:44', 'de-berlin-mercedes-benz-arena', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-219', 'Bilbao Hardcore Punk', 'Gran evento de punk rock en Bilbao', 'bilbao-hardcore-punk-2025-219', 'ACTIVE', '2025-09-13 05:46:42', '2025-09-13 04:46:42', '2025-06-15 05:46:42', '2025-09-13 04:46:42', 'es-bilbao-bizkaia-arena', 18640, 18640, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-220', 'Hamburg Rock Thunder', 'La mejor noche de hard rock del a├▒o', 'hamburg-rock-thunder-2025-220', 'ACTIVE', '2025-09-19 13:31:43', '2025-09-19 12:31:43', '2025-06-21 13:31:43', '2025-09-19 12:31:43', 'de-hamburg-barclays-arena', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 52.00, 208.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-221', 'Paris Punk Legends', 'Noche inolvidable de punk rock en directo', 'paris-punk-legends-2025-221', 'ACTIVE', '2025-09-11 07:19:18', '2025-09-11 06:19:18', '2025-06-13 07:19:18', '2025-09-11 06:19:18', 'fr-paris-olympia', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-222', 'Alicante Hard Rock Night', 'Noche inolvidable de hard rock en directo', 'alicante-hard-rock-night-2025-222', 'ACTIVE', '2025-08-12 20:31:06', '2025-08-12 19:31:06', '2025-05-14 20:31:06', '2025-08-12 19:31:06', 'es-alicante-plaza-toros', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-223', 'Sevilla Punk Revolution', 'La mejor noche de punk rock del a├▒o', 'sevilla-punk-revolution-2025-223', 'ACTIVE', '2025-08-01 00:24:24', '2025-07-31 23:24:24', '2025-05-03 00:24:24', '2025-07-31 23:24:24', 'es-sevilla-cartuja-center', 7000, 7000, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-224', 'Warsaw Metal Warriors', 'La mejor noche de heavy metal del a├▒o', 'warsaw-metal-warriors-2025-224', 'ACTIVE', '2025-08-01 16:09:00', '2025-08-01 15:09:00', '2025-05-03 16:09:00', '2025-08-01 15:09:00', 'pl-warsaw-torwar', 4800, 4800, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-225', 'C├│rdoba Punk Riot', 'La mejor noche de punk rock del a├▒o', 'cordoba-punk-riot-2025-225', 'ACTIVE', '2025-08-16 05:11:37', '2025-08-16 04:11:37', '2025-05-18 05:11:37', '2025-08-16 04:11:37', 'es-cordoba-palacio-congresos', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-226', 'Lyon Death Metal Night', 'Gran evento de death metal en Lyon', 'lyon-death-metal-night-2025-226', 'ACTIVE', '2025-09-04 21:12:08', '2025-09-04 20:12:08', '2025-06-06 21:12:08', '2025-09-04 20:12:08', 'fr-lyon-halle-tony-garnier', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-227', 'C├│rdoba Punk Riot', 'Festival de punk rock con bandas internacionales', 'cordoba-punk-riot-2025-227', 'ACTIVE', '2025-07-02 05:44:48', '2025-07-02 04:44:48', '2025-04-03 05:44:48', '2025-07-02 04:44:48', 'es-cordoba-palacio-congresos', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-228', 'Vienna Alternative Vibes', 'Noche inolvidable de alternative rock en directo', 'vienna-alternative-vibes-2025-228', 'ACTIVE', '2025-09-08 16:12:07', '2025-09-08 15:12:07', '2025-06-10 16:12:07', '2025-09-08 15:12:07', 'at-vienna-gasometer', 3500, 3500, 0, 0, NULL, NULL, NULL, '{}', 39.00, 156.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-229', 'Rome Alt Rock Experience', 'Festival de alternative rock con bandas internacionales', 'rome-alt-rock-experience-2025-229', 'ACTIVE', '2025-07-01 21:55:13', '2025-07-01 20:55:13', '2025-04-02 21:55:13', '2025-07-01 20:55:13', 'it-rome-palalottomatica', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-230', 'Rome Rock Thunder', 'Concierto ├®pico de hard rock en Rome', 'rome-rock-thunder-2025-230', 'ACTIVE', '2025-08-12 15:20:45', '2025-08-12 14:20:45', '2025-05-14 15:20:45', '2025-08-12 14:20:45', 'it-rome-atlantico', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 22.00, 88.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-231', 'A Coru├▒a Metal Symphony', 'Concierto ├®pico de symphonic metal en A Coru├▒a', 'a-coruna-metal-symphony-2025-231', 'ACTIVE', '2025-09-24 12:02:57', '2025-09-24 11:02:57', '2025-06-26 12:02:57', '2025-09-24 11:02:57', 'es-coruna-coliseum', 10500, 10500, 0, 0, NULL, NULL, NULL, '{}', 43.00, 172.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-232', 'Zurich Thrash Explosion', 'Gran evento de thrash metal en Zurich', 'zurich-thrash-explosion-2025-232', 'ACTIVE', '2025-09-20 22:38:28', '2025-09-20 21:38:28', '2025-06-22 22:38:28', '2025-09-20 21:38:28', 'ch-zurich-hallenstadion', 13000, 13000, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-233', 'Valencia Punk Rock Fest', 'Festival de punk rock con bandas internacionales', 'valencia-punk-rock-fest-2025-233', 'ACTIVE', '2025-08-29 11:11:39', '2025-08-29 10:11:39', '2025-05-31 11:11:39', '2025-08-29 10:11:39', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-234', 'Munich Alternative Anthems', 'Gran evento de alternative rock en Munich', 'munich-alternative-anthems-2025-234', 'ACTIVE', '2025-07-27 07:03:16', '2025-07-27 06:03:16', '2025-04-28 07:03:16', '2025-07-27 06:03:16', 'de-munich-backstage', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 20.00, 80.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-235', 'Barcelona Doom Fest', 'Noche inolvidable de doom metal en directo', 'barcelona-doom-fest-2025-235', 'ACTIVE', '2025-07-20 23:47:11', '2025-07-20 22:47:11', '2025-04-21 23:47:11', '2025-07-20 22:47:11', 'es-barcelona-palau-sant-jordi', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-236', 'M├ílaga Indie Anthems', 'La mejor noche de indie rock del a├▒o', 'malaga-indie-anthems-2025-236', 'ACTIVE', '2025-08-18 10:33:18', '2025-08-18 09:33:18', '2025-05-20 10:33:18', '2025-08-18 09:33:18', 'es-malaga-martin-carpena', 11300, 11300, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-237', 'Stockholm Rock Legends', 'La mejor noche de classic rock del a├▒o', 'stockholm-rock-legends-2025-237', 'ACTIVE', '2025-07-26 17:33:02', '2025-07-26 16:33:02', '2025-04-27 17:33:02', '2025-07-26 16:33:02', 'se-stockholm-ericsson-globe', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 68.00, 272.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-238', 'Valencia Metal Warriors', 'La mejor noche de heavy metal del a├▒o', 'valencia-metal-warriors-2025-238', 'ACTIVE', '2025-09-05 22:45:24', '2025-09-05 21:45:24', '2025-06-07 22:45:24', '2025-09-05 21:45:24', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-239', 'Sevilla Symphonic Power', 'Gran evento de symphonic metal en Sevilla', 'sevilla-symphonic-power-2025-239', 'ACTIVE', '2025-08-26 17:10:54', '2025-08-26 16:10:54', '2025-05-28 17:10:54', '2025-08-26 16:10:54', 'es-sevilla-custom', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 19.00, 76.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-240', 'Stockholm Progressive Legends', 'Festival de progressive metal con bandas internacionales', 'stockholm-progressive-legends-2025-240', 'ACTIVE', '2025-08-05 18:15:57', '2025-08-05 17:15:57', '2025-05-07 18:15:57', '2025-08-05 17:15:57', 'se-stockholm-ericsson-globe', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 68.00, 272.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-241', 'Amsterdam Doom Experience', 'La mejor noche de doom metal del a├▒o', 'amsterdam-doom-experience-2025-241', 'ACTIVE', '2025-08-15 17:35:31', '2025-08-15 16:35:31', '2025-05-17 17:35:31', '2025-08-15 16:35:31', 'nl-amsterdam-paradiso', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-242', 'Paris Rock Evolution', 'Gran evento de alternative rock en Paris', 'paris-rock-evolution-2025-242', 'ACTIVE', '2025-07-13 22:52:16', '2025-07-13 21:52:16', '2025-04-14 22:52:16', '2025-07-13 21:52:16', 'fr-paris-olympia', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-243', 'Warsaw Hard Rock Night', 'Festival de hard rock con bandas internacionales', 'warsaw-hard-rock-night-2025-243', 'ACTIVE', '2025-08-21 04:16:25', '2025-08-21 03:16:25', '2025-05-23 04:16:25', '2025-08-21 03:16:25', 'pl-warsaw-torwar', 4800, 4800, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-244', 'A Coru├▒a Hard Rock Experience', 'Festival de hard rock con bandas internacionales', 'a-coruna-hard-rock-experience-2025-244', 'ACTIVE', '2025-08-27 03:19:35', '2025-08-27 02:19:35', '2025-05-29 03:19:35', '2025-08-27 02:19:35', 'es-coruna-coliseum', 10500, 10500, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-245', 'Amsterdam Doom Night', 'Gran evento de doom metal en Amsterdam', 'amsterdam-doom-night-2025-245', 'ACTIVE', '2025-09-23 17:55:21', '2025-09-23 16:55:21', '2025-06-25 17:55:21', '2025-09-23 16:55:21', 'nl-amsterdam-ziggo-dome', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-246', 'Oslo Death Chaos', 'Festival de death metal con bandas internacionales', 'oslo-death-chaos-2025-246', 'ACTIVE', '2025-07-05 15:45:21', '2025-07-05 14:45:21', '2025-04-06 15:45:21', '2025-07-05 14:45:21', 'no-oslo-spektrum', 9700, 9700, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-247', 'Vigo Death Fest', 'Gran evento de death metal en Vigo', 'vigo-death-fest-2025-247', 'ACTIVE', '2025-07-22 03:03:07', '2025-07-22 02:03:07', '2025-04-23 03:03:07', '2025-07-22 02:03:07', 'es-vigo-pazo-cultura', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-248', 'London Black Metal Storm', 'Festival de black metal con bandas internacionales', 'london-black-metal-storm-2025-248', 'ACTIVE', '2025-09-18 03:04:48', '2025-09-18 02:04:48', '2025-06-20 03:04:48', '2025-09-18 02:04:48', 'uk-london-electric-ballroom', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 26.00, 104.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-249', 'Amsterdam Death Fest', 'Noche inolvidable de death metal en directo', 'amsterdam-death-fest-2025-249', 'ACTIVE', '2025-07-12 02:55:42', '2025-07-12 01:55:42', '2025-04-13 02:55:42', '2025-07-12 01:55:42', 'nl-amsterdam-ziggo-dome', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-250', 'Barcelona Indie Anthems', 'Noche inolvidable de indie rock en directo', 'barcelona-indie-anthems-2025-250', 'ACTIVE', '2025-09-23 01:33:49', '2025-09-23 00:33:49', '2025-06-25 01:33:49', '2025-09-23 00:33:49', 'es-barcelona-palau-sant-jordi', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-251', 'Berlin Hardcore Punk', 'Gran evento de punk rock en Berlin', 'berlin-hardcore-punk-2025-251', 'ACTIVE', '2025-07-05 00:15:32', '2025-07-04 23:15:32', '2025-04-06 00:15:32', '2025-07-04 23:15:32', 'de-berlin-mercedes-benz-arena', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-252', 'Valencia Indie Showcase', 'La mejor noche de indie rock del a├▒o', 'valencia-indie-showcase-2025-252', 'ACTIVE', '2025-09-28 14:25:09', '2025-09-28 13:25:09', '2025-06-30 14:25:09', '2025-09-28 13:25:09', '56bcb5a9-59c0-4476-b69c-649acfec88d4', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-253', 'Vigo Rock Force', 'Noche inolvidable de hard rock en directo', 'vigo-rock-force-2025-253', 'ACTIVE', '2025-08-09 02:25:39', '2025-08-09 01:25:39', '2025-05-11 02:25:39', '2025-08-09 01:25:39', 'es-vigo-pazo-cultura', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-254', 'Barcelona Rock Storm', 'Noche inolvidable de hard rock en directo', 'barcelona-rock-storm-2025-254', 'ACTIVE', '2025-07-30 03:13:23', '2025-07-30 02:13:23', '2025-05-01 03:13:23', '2025-07-30 02:13:23', 'es-barcelona-bikini', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-255', 'Vienna Rock Explosion', 'Festival de hard rock con bandas internacionales', 'vienna-rock-explosion-2025-255', 'ACTIVE', '2025-07-12 05:30:46', '2025-07-12 04:30:46', '2025-04-13 05:30:46', '2025-07-12 04:30:46', 'at-vienna-stadthalle', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 52.00, 208.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-256', 'Madrid Heavy Metal Attack', 'Noche inolvidable de heavy metal en directo', 'madrid-heavy-metal-attack-2025-256', 'ACTIVE', '2025-07-15 20:51:48', '2025-07-15 19:51:48', '2025-04-16 20:51:48', '2025-07-15 19:51:48', 'es-madrid-but', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-257', 'Sevilla Rock Force', 'Noche inolvidable de hard rock en directo', 'sevilla-rock-force-2025-257', 'ACTIVE', '2025-09-12 02:59:45', '2025-09-12 01:59:45', '2025-06-14 02:59:45', '2025-09-12 01:59:45', 'es-sevilla-cartuja-center', 7000, 7000, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-258', 'London Speed Metal', 'Festival de thrash metal con bandas internacionales', 'london-speed-metal-2025-258', 'ACTIVE', '2025-09-16 10:23:22', '2025-09-16 09:23:22', '2025-06-18 10:23:22', '2025-09-16 09:23:22', 'uk-london-electric-ballroom', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 26.00, 104.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-259', 'London Punk Explosion', 'Festival de punk rock con bandas internacionales', 'london-punk-explosion-2025-259', 'ACTIVE', '2025-09-15 23:27:10', '2025-09-15 22:27:10', '2025-06-17 23:27:10', '2025-09-15 22:27:10', 'uk-london-o2-arena', 20000, 20000, 0, 0, NULL, NULL, NULL, '{}', 68.00, 272.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-260', 'Paris Dark Fest', 'Gran evento de black metal en Paris', 'paris-dark-fest-2025-260', 'ACTIVE', '2025-09-02 18:39:09', '2025-09-02 17:39:09', '2025-06-04 18:39:09', '2025-09-02 17:39:09', 'fr-paris-olympia', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-261', 'Amsterdam Power Metal Live', 'Noche inolvidable de power metal en directo', 'amsterdam-power-metal-live-2025-261', 'ACTIVE', '2025-07-15 02:20:39', '2025-07-15 01:20:39', '2025-04-16 02:20:39', '2025-07-15 01:20:39', 'nl-amsterdam-melkweg', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-262', 'Barcelona Alternative Vibes', 'La mejor noche de alternative rock del a├▒o', 'barcelona-alternative-vibes-2025-262', 'ACTIVE', '2025-07-15 02:34:37', '2025-07-15 01:34:37', '2025-04-16 02:34:37', '2025-07-15 01:34:37', 'es-barcelona-sant-jordi-club', 4500, 4500, 0, 0, NULL, NULL, NULL, '{}', 33.00, 132.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-263', 'Munich Alternative Wave', 'Gran evento de alternative rock en Munich', 'munich-alternative-wave-2025-263', 'ACTIVE', '2025-08-30 21:42:54', '2025-08-30 20:42:54', '2025-06-01 21:42:54', '2025-08-30 20:42:54', 'de-munich-backstage', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 20.00, 80.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-264', 'Madrid Progressive Night', 'Gran evento de progressive metal en Madrid', 'madrid-progressive-night-2025-264', 'ACTIVE', '2025-09-26 20:43:42', '2025-09-26 19:43:42', '2025-06-28 20:43:42', '2025-09-26 19:43:42', 'es-madrid-la-riviera', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-265', 'London Street Punk', 'La mejor noche de punk rock del a├▒o', 'london-street-punk-2025-265', 'ACTIVE', '2025-09-04 09:54:13', '2025-09-04 08:54:13', '2025-06-06 09:54:13', '2025-09-04 08:54:13', 'uk-london-o2-arena', 20000, 20000, 0, 0, NULL, NULL, NULL, '{}', 68.00, 272.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-266', 'Munich Steel Force', 'Gran evento de heavy metal en Munich', 'munich-steel-force-2025-266', 'ACTIVE', '2025-07-17 04:45:29', '2025-07-17 03:45:29', '2025-04-18 04:45:29', '2025-07-17 03:45:29', 'de-munich-backstage', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 20.00, 80.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-267', 'Valencia Rock Revival', 'Concierto ├®pico de classic rock en Valencia', 'valencia-rock-revival-2025-267', 'ACTIVE', '2025-09-10 13:01:25', '2025-09-10 12:01:25', '2025-06-12 13:01:25', '2025-09-10 12:01:25', '56bcb5a9-59c0-4476-b69c-649acfec88d4', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-268', 'A Coru├▒a Extreme Death', 'Festival de death metal con bandas internacionales', 'a-coruna-extreme-death-2025-268', 'ACTIVE', '2025-08-17 09:38:44', '2025-08-17 08:38:44', '2025-05-19 09:38:44', '2025-08-17 08:38:44', 'es-coruna-coliseum', 10500, 10500, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-269', 'Madrid Symphonic Fest', 'Noche inolvidable de symphonic metal en directo', 'madrid-symphonic-fest-2025-269', 'ACTIVE', '2025-09-08 10:44:20', '2025-09-08 09:44:20', '2025-06-10 10:44:20', '2025-09-08 09:44:20', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-270', 'Stockholm Rock Revival', 'Concierto ├®pico de classic rock en Stockholm', 'stockholm-rock-revival-2025-270', 'ACTIVE', '2025-08-27 14:15:49', '2025-08-27 13:15:49', '2025-05-29 14:15:49', '2025-08-27 13:15:49', 'se-stockholm-ericsson-globe', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 68.00, 272.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-271', 'Munich Symphonic Fest', 'Noche inolvidable de symphonic metal en directo', 'munich-symphonic-fest-2025-271', 'ACTIVE', '2025-09-04 14:51:44', '2025-09-04 13:51:44', '2025-06-06 14:51:44', '2025-09-04 13:51:44', 'de-munich-olympiahalle', 15500, 15500, 0, 0, NULL, NULL, NULL, '{}', 65.00, 260.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-272', 'Valencia Hard Rock Attack', 'La mejor noche de hard rock del a├▒o', 'valencia-hard-rock-attack-2025-272', 'ACTIVE', '2025-08-06 04:30:39', '2025-08-06 03:30:39', '2025-05-08 04:30:39', '2025-08-06 03:30:39', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-273', 'Las Palmas Alternative Anthems', 'Gran evento de alternative rock en Las Palmas', 'las-palmas-alternative-anthems-2025-273', 'ACTIVE', '2025-08-09 01:35:36', '2025-08-09 00:35:36', '2025-05-11 01:35:36', '2025-08-09 00:35:36', 'es-laspalmas-gran-canaria-arena', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-274', 'Valencia Indie Rock Live', 'Gran evento de indie rock en Valencia', 'valencia-indie-rock-live-2025-274', 'ACTIVE', '2025-08-02 19:46:01', '2025-08-02 18:46:01', '2025-05-04 19:46:01', '2025-08-02 18:46:01', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-275', 'Bilbao Power Metal Live', 'Festival de power metal con bandas internacionales', 'bilbao-power-metal-live-2025-275', 'ACTIVE', '2025-07-05 14:45:20', '2025-07-05 13:45:20', '2025-04-06 14:45:20', '2025-07-05 13:45:20', 'es-bilbao-kafe-antzokia', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-276', 'M├ílaga Punk Chaos', 'Noche inolvidable de punk rock en directo', 'malaga-punk-chaos-2025-276', 'ACTIVE', '2025-07-27 06:44:21', '2025-07-27 05:44:21', '2025-04-28 06:44:21', '2025-07-27 05:44:21', 'es-malaga-martin-carpena', 11300, 11300, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-277', 'Amsterdam Rock Storm', 'Gran evento de hard rock en Amsterdam', 'amsterdam-rock-storm-2025-277', 'ACTIVE', '2025-09-05 19:41:50', '2025-09-05 18:41:50', '2025-06-07 19:41:50', '2025-09-05 18:41:50', 'nl-amsterdam-paradiso', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-278', 'Athens Heavy Metal Night', 'Gran evento de heavy metal en Athens', 'athens-heavy-metal-night-2025-278', 'ACTIVE', '2025-09-13 00:32:34', '2025-09-12 23:32:34', '2025-06-15 00:32:34', '2025-09-12 23:32:34', 'gr-athens-oaka', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-279', 'London Dark Ritual', 'La mejor noche de black metal del a├▒o', 'london-dark-ritual-2025-279', 'ACTIVE', '2025-08-29 15:27:32', '2025-08-29 14:27:32', '2025-05-31 15:27:32', '2025-08-29 14:27:32', 'uk-london-roundhouse', 3300, 3300, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-280', 'Lisbon Punk Riot', 'Concierto ├®pico de punk rock en Lisbon', 'lisbon-punk-riot-2025-280', 'ACTIVE', '2025-07-31 15:11:44', '2025-07-31 14:11:44', '2025-05-02 15:11:44', '2025-07-31 14:11:44', 'pt-lisbon-altice-arena', 20000, 20000, 0, 0, NULL, NULL, NULL, '{}', 43.00, 172.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-281', 'Madrid Epic Legends', 'Gran evento de power metal en Madrid', 'madrid-epic-legends-2025-281', 'ACTIVE', '2025-08-26 17:33:03', '2025-08-26 16:33:03', '2025-05-28 17:33:03', '2025-08-26 16:33:03', 'es-madrid-moby-dick', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-282', 'Vienna Rock Explosion', 'Gran evento de hard rock en Vienna', 'vienna-rock-explosion-2025-282', 'ACTIVE', '2025-07-04 09:00:58', '2025-07-04 08:00:58', '2025-04-05 09:00:58', '2025-07-04 08:00:58', 'at-vienna-stadthalle', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 52.00, 208.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-283', 'Zurich Indie Night', 'Concierto ├®pico de indie rock en Zurich', 'zurich-indie-night-2025-283', 'ACTIVE', '2025-07-08 13:00:27', '2025-07-08 12:00:27', '2025-04-09 13:00:27', '2025-07-08 12:00:27', 'ch-zurich-hallenstadion', 13000, 13000, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-284', 'Manchester Brutal Force', 'Noche inolvidable de death metal en directo', 'manchester-brutal-force-2025-284', 'ACTIVE', '2025-08-11 15:40:12', '2025-08-11 14:40:12', '2025-05-13 15:40:12', '2025-08-11 14:40:12', 'uk-manchester-arena', 21000, 21000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-285', 'Prague Street Punk', 'Festival de punk rock con bandas internacionales', 'prague-street-punk-2025-285', 'ACTIVE', '2025-09-02 13:03:29', '2025-09-02 12:03:29', '2025-06-04 13:03:29', '2025-09-02 12:03:29', 'cz-prague-o2-arena', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-286', 'Munich Rock Anthology', 'Noche inolvidable de classic rock en directo', 'munich-rock-anthology-2025-286', 'ACTIVE', '2025-08-10 14:44:30', '2025-08-10 13:44:30', '2025-05-12 14:44:30', '2025-08-10 13:44:30', 'de-munich-backstage', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-287', 'Barcelona Brutal Force', 'Concierto ├®pico de death metal en Barcelona', 'barcelona-brutal-force-2025-287', 'ACTIVE', '2025-09-09 18:13:47', '2025-09-09 17:13:47', '2025-06-11 18:13:47', '2025-09-09 17:13:47', 'es-barcelona-razzmatazz', 3000, 3000, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-288', 'Bilbao Rock Heroes', 'Festival de classic rock con bandas internacionales', 'bilbao-rock-heroes-2025-288', 'ACTIVE', '2025-09-13 20:20:55', '2025-09-13 19:20:55', '2025-06-15 20:20:55', '2025-09-13 19:20:55', 'es-bilbao-kafe-antzokia', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 19.00, 76.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-289', 'Valencia Death Chaos', 'Gran evento de death metal en Valencia', 'valencia-death-chaos-2025-289', 'ACTIVE', '2025-09-06 13:24:42', '2025-09-06 12:24:42', '2025-06-08 13:24:42', '2025-09-06 12:24:42', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-290', 'Pamplona Hard Rock Heroes', 'Festival de hard rock con bandas internacionales', 'pamplona-hard-rock-heroes-2025-290', 'ACTIVE', '2025-07-10 07:06:59', '2025-07-10 06:06:59', '2025-04-11 07:06:59', '2025-07-10 06:06:59', 'es-pamplona-baluarte', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-291', 'Valencia Thrash Storm', 'La mejor noche de thrash metal del a├▒o', 'valencia-thrash-storm-2025-291', 'ACTIVE', '2025-09-23 21:41:00', '2025-09-23 20:41:00', '2025-06-25 21:41:00', '2025-09-23 20:41:00', '56bcb5a9-59c0-4476-b69c-649acfec88d4', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-292', 'Zurich Brutal Force', 'La mejor noche de death metal del a├▒o', 'zurich-brutal-force-2025-292', 'ACTIVE', '2025-08-29 16:53:07', '2025-08-29 15:53:07', '2025-05-31 16:53:07', '2025-08-29 15:53:07', 'ch-zurich-hallenstadion', 13000, 13000, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-293', 'Sevilla Power Warriors', 'Concierto ├®pico de power metal en Sevilla', 'sevilla-power-warriors-2025-293', 'ACTIVE', '2025-07-10 20:48:04', '2025-07-10 19:48:04', '2025-04-11 20:48:04', '2025-07-10 19:48:04', 'es-sevilla-custom', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-294', 'Valencia Legendary Rock', 'Concierto ├®pico de classic rock en Valencia', 'valencia-legendary-rock-2025-294', 'ACTIVE', '2025-07-07 19:18:08', '2025-07-07 18:18:08', '2025-04-08 19:18:08', '2025-07-07 18:18:08', 'eedf995f-f060-4105-81b5-8b46dd58be37', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 20.00, 80.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-295', 'Madrid Hard Rock Heroes', 'Noche inolvidable de hard rock en directo', 'madrid-hard-rock-heroes-2025-295', 'ACTIVE', '2025-07-27 01:07:12', '2025-07-27 00:07:12', '2025-04-28 01:07:12', '2025-07-27 00:07:12', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-296', 'Zaragoza Doom Fest', 'Concierto ├®pico de doom metal en Zaragoza', 'zaragoza-doom-fest-2025-296', 'ACTIVE', '2025-07-15 06:38:41', '2025-07-15 05:38:41', '2025-04-16 06:38:41', '2025-07-15 05:38:41', 'es-zaragoza-pabellon-principe-felipe', 10800, 10800, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-297', 'London Rock Storm', 'Gran evento de hard rock en London', 'london-rock-storm-2025-297', 'ACTIVE', '2025-07-29 13:07:51', '2025-07-29 12:07:51', '2025-04-30 13:07:51', '2025-07-29 12:07:51', 'uk-london-o2-arena', 20000, 20000, 0, 0, NULL, NULL, NULL, '{}', 68.00, 272.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-298', 'London Rock Power', 'Festival de hard rock con bandas internacionales', 'london-rock-power-2025-298', 'ACTIVE', '2025-08-20 17:22:18', '2025-08-20 16:22:18', '2025-05-22 17:22:18', '2025-08-20 16:22:18', 'uk-london-electric-ballroom', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 26.00, 104.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-299', 'Berlin Thrash Warriors', 'Concierto ├®pico de thrash metal en Berlin', 'berlin-thrash-warriors-2025-299', 'ACTIVE', '2025-08-19 04:53:15', '2025-08-19 03:53:15', '2025-05-21 04:53:15', '2025-08-19 03:53:15', 'de-berlin-mercedes-benz-arena', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-300', 'Valencia Alternative Fest', 'Gran evento de alternative rock en Valencia', 'valencia-alternative-fest-2025-300', 'ACTIVE', '2025-07-28 15:11:20', '2025-07-28 14:11:20', '2025-04-29 15:11:20', '2025-07-28 14:11:20', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-301', 'Amsterdam Symphonic Power', 'Gran evento de symphonic metal en Amsterdam', 'amsterdam-symphonic-power-2025-301', 'ACTIVE', '2025-11-14 15:16:39', '2025-11-14 14:16:39', '2025-08-16 15:16:39', '2025-11-14 14:16:39', 'nl-amsterdam-melkweg', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 29.00, 116.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-302', 'Valencia Doom Experience', 'Concierto ├®pico de doom metal en Valencia', 'valencia-doom-experience-2025-302', 'ACTIVE', '2026-03-24 23:09:34', '2026-03-24 22:09:34', '2025-12-24 23:09:34', '2026-03-24 22:09:34', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-303', 'Bilbao Epic Metal', 'Concierto ├®pico de power metal en Bilbao', 'bilbao-epic-metal-2025-303', 'ACTIVE', '2026-02-11 20:30:11', '2026-02-11 19:30:11', '2025-11-13 20:30:11', '2026-02-11 19:30:11', 'es-bilbao-kafe-antzokia', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-304', 'C├│rdoba Orchestra Metal', 'Concierto ├®pico de symphonic metal en C├│rdoba', 'cordoba-orchestra-metal-2025-304', 'ACTIVE', '2025-11-30 17:09:07', '2025-11-30 16:09:07', '2025-09-01 17:09:07', '2025-11-30 16:09:07', 'es-cordoba-palacio-congresos', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 34.00, 136.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-305', 'Valencia Alt Rock Experience', 'Noche inolvidable de alternative rock en directo', 'valencia-alt-rock-experience-2025-305', 'ACTIVE', '2025-11-09 15:05:16', '2025-11-09 14:05:16', '2025-08-11 15:05:16', '2025-11-09 14:05:16', '56bcb5a9-59c0-4476-b69c-649acfec88d4', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-306', 'C├│rdoba Thrash Explosion', 'Gran evento de thrash metal en C├│rdoba', 'cordoba-thrash-explosion-2025-306', 'ACTIVE', '2025-12-13 14:16:01', '2025-12-13 13:16:01', '2025-09-14 14:16:01', '2025-12-13 13:16:01', 'es-cordoba-palacio-congresos', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-307', 'Prague Black Metal Legends', 'Gran evento de black metal en Prague', 'prague-black-metal-legends-2025-307', 'ACTIVE', '2025-11-29 06:12:59', '2025-11-29 05:12:59', '2025-08-31 06:12:59', '2025-11-29 05:12:59', 'cz-prague-o2-arena', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-308', 'C├│rdoba Metal Power', 'Noche inolvidable de heavy metal en directo', 'cordoba-metal-power-2025-308', 'ACTIVE', '2026-01-02 02:03:51', '2026-01-02 01:03:51', '2025-10-04 02:03:51', '2026-01-02 01:03:51', 'es-cordoba-palacio-congresos', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-309', 'Manchester Infernal Night', 'Noche inolvidable de black metal en directo', 'manchester-infernal-night-2025-309', 'ACTIVE', '2026-02-09 08:36:35', '2026-02-09 07:36:35', '2025-11-11 08:36:35', '2026-02-09 07:36:35', 'uk-manchester-arena', 21000, 21000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-310', 'Alicante Indie Anthems', 'Festival de indie rock con bandas internacionales', 'alicante-indie-anthems-2025-310', 'ACTIVE', '2025-10-12 10:01:46', '2025-10-12 09:01:46', '2025-07-14 10:01:46', '2025-10-12 09:01:46', 'es-alicante-plaza-toros', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-311', 'Vienna Alternative Fest', 'Gran evento de alternative rock en Vienna', 'vienna-alternative-fest-2025-311', 'ACTIVE', '2025-12-02 12:38:11', '2025-12-02 11:38:11', '2025-09-03 12:38:11', '2025-12-02 11:38:11', 'at-vienna-gasometer', 3500, 3500, 0, 0, NULL, NULL, NULL, '{}', 39.00, 156.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-312', 'Granada Indie Underground', 'La mejor noche de indie rock del a├▒o', 'granada-indie-underground-2025-312', 'ACTIVE', '2026-02-12 12:19:43', '2026-02-12 11:19:43', '2025-11-14 12:19:43', '2026-02-12 11:19:43', 'es-granada-industrial-copera', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-313', 'Valencia Alternative Wave', 'Festival de alternative rock con bandas internacionales', 'valencia-alternative-wave-2025-313', 'ACTIVE', '2025-11-28 10:55:56', '2025-11-28 09:55:56', '2025-08-30 10:55:56', '2025-11-28 09:55:56', 'f794e6f0-28c4-4512-ab20-1954720ea984', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-314', 'Valladolid Heavy Rock Fest', 'Festival de hard rock con bandas internacionales', 'valladolid-heavy-rock-fest-2025-314', 'ACTIVE', '2025-10-18 00:00:34', '2025-10-17 23:00:34', '2025-07-20 00:00:34', '2025-10-17 23:00:34', 'es-valladolid-lava', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-315', 'Valencia Orchestra Night', 'Gran evento de symphonic metal en Valencia', 'valencia-orchestra-night-2025-315', 'ACTIVE', '2026-01-24 01:40:40', '2026-01-24 00:40:40', '2025-10-26 01:40:40', '2026-01-24 00:40:40', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 20.00, 80.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-316', 'Vienna Thrash Mayhem', 'Festival de thrash metal con bandas internacionales', 'vienna-thrash-mayhem-2025-316', 'ACTIVE', '2026-01-29 05:59:15', '2026-01-29 04:59:15', '2025-10-31 05:59:15', '2026-01-29 04:59:15', 'at-vienna-gasometer', 3500, 3500, 0, 0, NULL, NULL, NULL, '{}', 39.00, 156.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-317', 'Zurich Thrash Mayhem', 'La mejor noche de thrash metal del a├▒o', 'zurich-thrash-mayhem-2025-317', 'ACTIVE', '2025-11-29 07:46:03', '2025-11-29 06:46:03', '2025-08-31 07:46:03', '2025-11-29 06:46:03', 'ch-zurich-hallenstadion', 13000, 13000, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-318', 'Barcelona Death Metal Night', 'La mejor noche de death metal del a├▒o', 'barcelona-death-metal-night-2025-318', 'ACTIVE', '2026-01-18 10:29:42', '2026-01-18 09:29:42', '2025-10-20 10:29:42', '2026-01-18 09:29:42', 'es-barcelona-apolo', 1600, 1600, 0, 0, NULL, NULL, NULL, '{}', 17.00, 68.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-319', 'Valencia Prog Experience', 'Festival de progressive metal con bandas internacionales', 'valencia-prog-experience-2025-319', 'ACTIVE', '2026-01-06 16:08:17', '2026-01-06 15:08:17', '2025-10-08 16:08:17', '2026-01-06 15:08:17', '56bcb5a9-59c0-4476-b69c-649acfec88d4', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-320', 'Pamplona Golden Rock Era', 'Noche inolvidable de classic rock en directo', 'pamplona-golden-rock-era-2025-320', 'ACTIVE', '2025-12-12 12:17:32', '2025-12-12 11:17:32', '2025-09-13 12:17:32', '2025-12-12 11:17:32', 'es-pamplona-baluarte', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 34.00, 136.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-321', 'Valencia Rock Heroes', 'Concierto ├®pico de classic rock en Valencia', 'valencia-rock-heroes-2025-321', 'ACTIVE', '2025-10-14 08:41:17', '2025-10-14 07:41:17', '2025-07-16 08:41:17', '2025-10-14 07:41:17', 'f794e6f0-28c4-4512-ab20-1954720ea984', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 18.00, 72.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-322', 'Sevilla Indie Revolution', 'Noche inolvidable de indie rock en directo', 'sevilla-indie-revolution-2025-322', 'ACTIVE', '2026-02-07 16:12:59', '2026-02-07 15:12:59', '2025-11-09 16:12:59', '2026-02-07 15:12:59', 'es-sevilla-custom', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-323', 'Stockholm Symphonic Power', 'Gran evento de symphonic metal en Stockholm', 'stockholm-symphonic-power-2025-323', 'ACTIVE', '2025-12-25 01:23:25', '2025-12-25 00:23:25', '2025-09-26 01:23:25', '2025-12-25 00:23:25', 'se-stockholm-ericsson-globe', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 68.00, 272.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-324', 'Lyon Legendary Rock', 'Concierto ├®pico de classic rock en Lyon', 'lyon-legendary-rock-2025-324', 'ACTIVE', '2026-01-15 08:39:29', '2026-01-15 07:39:29', '2025-10-17 08:39:29', '2026-01-15 07:39:29', 'fr-lyon-halle-tony-garnier', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 65.00, 260.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-325', 'Brussels Punk Underground', 'Noche inolvidable de punk rock en directo', 'brussels-punk-underground-2025-325', 'ACTIVE', '2025-12-14 21:09:32', '2025-12-14 20:09:32', '2025-09-15 21:09:32', '2025-12-14 20:09:32', 'be-brussels-ancienne-belgique', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 40.00, 160.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-326', 'Athens Technical Metal', 'Gran evento de progressive metal en Athens', 'athens-technical-metal-2025-326', 'ACTIVE', '2026-01-25 14:25:07', '2026-01-25 13:25:07', '2025-10-27 14:25:07', '2026-01-25 13:25:07', 'gr-athens-oaka', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-327', 'Berlin Punk Explosion', 'La mejor noche de punk rock del a├▒o', 'berlin-punk-explosion-2025-327', 'ACTIVE', '2025-10-27 10:47:54', '2025-10-27 09:47:54', '2025-07-29 10:47:54', '2025-10-27 09:47:54', 'de-berlin-mercedes-benz-arena', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-328', 'Barcelona Symphonic Force', 'Concierto ├®pico de symphonic metal en Barcelona', 'barcelona-symphonic-force-2025-328', 'ACTIVE', '2025-10-22 04:57:25', '2025-10-22 03:57:25', '2025-07-24 04:57:25', '2025-10-22 03:57:25', 'es-barcelona-palau-sant-jordi', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-329', 'Valencia Progressive Force', 'Noche inolvidable de progressive metal en directo', 'valencia-progressive-force-2025-329', 'ACTIVE', '2025-10-17 20:29:35', '2025-10-17 19:29:35', '2025-07-19 20:29:35', '2025-10-17 19:29:35', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, '{}', 19.00, 76.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-330', 'Athens Metal Symphony', 'La mejor noche de symphonic metal del a├▒o', 'athens-metal-symphony-2025-330', 'ACTIVE', '2025-11-30 22:16:03', '2025-11-30 21:16:03', '2025-09-01 22:16:03', '2025-11-30 21:16:03', 'gr-athens-oaka', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-331', 'Pamplona Rock Anthology', 'Concierto ├®pico de classic rock en Pamplona', 'pamplona-rock-anthology-2025-331', 'ACTIVE', '2025-12-14 19:06:05', '2025-12-14 18:06:05', '2025-09-15 19:06:05', '2025-12-14 18:06:05', 'es-pamplona-baluarte', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 34.00, 136.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-332', 'Valencia Metal Storm', 'Concierto ├®pico de heavy metal en Valencia', 'valencia-metal-storm-2025-332', 'ACTIVE', '2025-10-04 09:22:36', '2025-10-04 08:22:36', '2025-07-06 09:22:36', '2025-10-04 08:22:36', '6041a699-2a83-4518-b458-5db09b90c31a', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-333', 'Vienna Death Attack', 'Concierto ├®pico de death metal en Vienna', 'vienna-death-attack-2025-333', 'ACTIVE', '2026-01-23 13:30:27', '2026-01-23 12:30:27', '2025-10-25 13:30:27', '2026-01-23 12:30:27', 'at-vienna-stadthalle', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 52.00, 208.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-334', 'Zurich Infernal Night', 'Noche inolvidable de black metal en directo', 'zurich-infernal-night-2025-334', 'ACTIVE', '2026-02-26 15:26:57', '2026-02-26 14:26:57', '2025-11-28 15:26:57', '2026-02-26 14:26:57', 'ch-zurich-hallenstadion', 13000, 13000, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-335', 'Warsaw Glory Metal', 'Gran evento de power metal en Warsaw', 'warsaw-glory-metal-2025-335', 'ACTIVE', '2025-10-04 08:36:55', '2025-10-04 07:36:55', '2025-07-06 08:36:55', '2025-10-04 07:36:55', 'pl-warsaw-torwar', 4800, 4800, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-336', 'Athens Hardcore Punk', 'Noche inolvidable de punk rock en directo', 'athens-hardcore-punk-2025-336', 'ACTIVE', '2025-12-11 05:48:24', '2025-12-11 04:48:24', '2025-09-12 05:48:24', '2025-12-11 04:48:24', 'gr-athens-oaka', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-337', 'Valencia Punk Riot', 'La mejor noche de punk rock del a├▒o', 'valencia-punk-riot-2025-337', 'ACTIVE', '2026-01-24 18:31:58', '2026-01-24 17:31:58', '2025-10-26 18:31:58', '2026-01-24 17:31:58', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-338', 'Gij├│n Hard Rock Attack', 'Festival de hard rock con bandas internacionales', 'gijon-hard-rock-attack-2025-338', 'ACTIVE', '2025-10-30 04:17:24', '2025-10-30 03:17:24', '2025-08-01 04:17:24', '2025-10-30 03:17:24', 'es-gijon-plaza-toros', 12000, 12000, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-339', 'Madrid Progressive Attack', 'Festival de progressive metal con bandas internacionales', 'madrid-progressive-attack-2025-339', 'ACTIVE', '2026-01-06 12:34:07', '2026-01-06 11:34:07', '2025-10-08 12:34:07', '2026-01-06 11:34:07', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-340', 'Vienna Indie Night', 'Concierto ├®pico de indie rock en Vienna', 'vienna-indie-night-2025-340', 'ACTIVE', '2026-01-03 12:54:39', '2026-01-03 11:54:39', '2025-10-05 12:54:39', '2026-01-03 11:54:39', 'at-vienna-gasometer', 3500, 3500, 0, 0, NULL, NULL, NULL, '{}', 39.00, 156.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-341', 'Valencia Golden Rock Era', 'Noche inolvidable de classic rock en directo', 'valencia-golden-rock-era-2025-341', 'ACTIVE', '2026-02-22 21:15:55', '2026-02-22 20:15:55', '2025-11-24 21:15:55', '2026-02-22 20:15:55', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-342', 'Bilbao Indie Rock Fest', 'Festival de indie rock con bandas internacionales', 'bilbao-indie-rock-fest-2025-342', 'ACTIVE', '2025-10-13 01:42:55', '2025-10-13 00:42:55', '2025-07-15 01:42:55', '2025-10-13 00:42:55', 'es-bilbao-bizkaia-arena', 18640, 18640, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-343', 'Oslo New Wave Rock', 'Concierto ├®pico de alternative rock en Oslo', 'oslo-new-wave-rock-2025-343', 'ACTIVE', '2026-01-28 17:55:54', '2026-01-28 16:55:54', '2025-10-30 17:55:54', '2026-01-28 16:55:54', 'no-oslo-spektrum', 9700, 9700, 0, 0, NULL, NULL, NULL, '{}', 46.00, 184.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-344', 'M├ílaga Alternative Fest', 'Concierto ├®pico de alternative rock en M├ílaga', 'malaga-alternative-fest-2025-344', 'ACTIVE', '2025-10-11 12:51:14', '2025-10-11 11:51:14', '2025-07-13 12:51:14', '2025-10-11 11:51:14', 'es-malaga-martin-carpena', 11300, 11300, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-345', 'M├ílaga Hard Rock Legends', 'Concierto ├®pico de hard rock en M├ílaga', 'malaga-hard-rock-legends-2025-345', 'ACTIVE', '2026-02-18 23:18:24', '2026-02-18 22:18:24', '2025-11-20 23:18:24', '2026-02-18 22:18:24', 'es-malaga-martin-carpena', 11300, 11300, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-346', 'Barcelona Metal Warriors', 'La mejor noche de heavy metal del a├▒o', 'barcelona-metal-warriors-2025-346', 'ACTIVE', '2025-12-22 21:22:06', '2025-12-22 20:22:06', '2025-09-23 21:22:06', '2025-12-22 20:22:06', 'es-barcelona-sant-jordi-club', 4500, 4500, 0, 0, NULL, NULL, NULL, '{}', 33.00, 132.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-347', 'Amsterdam Metal Warriors', 'Noche inolvidable de heavy metal en directo', 'amsterdam-metal-warriors-2025-347', 'ACTIVE', '2026-01-02 12:52:01', '2026-01-02 11:52:01', '2025-10-04 12:52:01', '2026-01-02 11:52:01', 'nl-amsterdam-melkweg', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-348', 'M├ílaga Thrash Attack', 'Festival de thrash metal con bandas internacionales', 'malaga-thrash-attack-2025-348', 'ACTIVE', '2026-01-11 13:32:29', '2026-01-11 12:32:29', '2025-10-13 13:32:29', '2026-01-11 12:32:29', 'es-malaga-martin-carpena', 11300, 11300, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-349', 'Madrid Unholy Night', 'Noche inolvidable de black metal en directo', 'madrid-unholy-night-2025-349', 'ACTIVE', '2025-11-10 02:18:48', '2025-11-10 01:18:48', '2025-08-12 02:18:48', '2025-11-10 01:18:48', 'es-madrid-moby-dick', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-350', 'Brussels Alt Rock Experience', 'Festival de alternative rock con bandas internacionales', 'brussels-alt-rock-experience-2025-350', 'ACTIVE', '2026-02-03 08:14:04', '2026-02-03 07:14:04', '2025-11-05 08:14:04', '2026-02-03 07:14:04', 'be-brussels-forest-national', 8500, 8500, 0, 0, NULL, NULL, NULL, '{}', 42.00, 168.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-351', 'C├│rdoba Thrash Mayhem', 'Concierto ├®pico de thrash metal en C├│rdoba', 'cordoba-thrash-mayhem-2025-351', 'ACTIVE', '2026-03-29 00:16:12', '2026-03-28 23:16:12', '2025-12-29 00:16:12', '2026-03-28 23:16:12', 'es-cordoba-palacio-congresos', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-352', 'Barcelona Punk Attack', 'Noche inolvidable de punk rock en directo', 'barcelona-punk-attack-2025-352', 'ACTIVE', '2026-01-15 23:42:46', '2026-01-15 22:42:46', '2025-10-17 23:42:46', '2026-01-15 22:42:46', 'es-barcelona-palau-sant-jordi', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-353', 'Madrid Rock Heroes', 'Noche inolvidable de classic rock en directo', 'madrid-rock-heroes-2025-353', 'ACTIVE', '2025-11-08 00:47:28', '2025-11-07 23:47:28', '2025-08-10 00:47:28', '2025-11-07 23:47:28', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-354', 'Munich Progressive Legends', 'Concierto ├®pico de progressive metal en Munich', 'munich-progressive-legends-2025-354', 'ACTIVE', '2025-11-09 04:31:23', '2025-11-09 03:31:23', '2025-08-11 04:31:23', '2025-11-09 03:31:23', 'de-munich-olympiahalle', 15500, 15500, 0, 0, NULL, NULL, NULL, '{}', 65.00, 260.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-355', 'Paris Power Storm', 'Noche inolvidable de power metal en directo', 'paris-power-storm-2025-355', 'ACTIVE', '2025-11-12 19:01:45', '2025-11-12 18:01:45', '2025-08-14 19:01:45', '2025-11-12 18:01:45', 'fr-paris-accor-arena', 20300, 20300, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('evt-2025-356', 'Manchester Indie Rock Fest', 'Noche inolvidable de indie rock en directo', 'manchester-indie-rock-fest-2025-356', 'ACTIVE', '2026-03-17 19:18:09', '2026-03-17 18:18:09', '2025-12-17 19:18:09', '2026-03-17 18:18:09', 'uk-manchester-arena', 21000, 21000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-357', 'London Heavy Rock Fest', 'Noche inolvidable de hard rock en directo', 'london-heavy-rock-fest-2025-357', 'ACTIVE', '2026-03-07 17:15:40', '2026-03-07 16:15:40', '2025-12-07 17:15:40', '2026-03-07 16:15:40', 'uk-london-roundhouse', 3300, 3300, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-358', 'London Prog Experience', 'Concierto ├®pico de progressive metal en London', 'london-prog-experience-2025-358', 'ACTIVE', '2025-12-17 08:59:03', '2025-12-17 07:59:03', '2025-09-18 08:59:03', '2025-12-17 07:59:03', 'uk-london-roundhouse', 3300, 3300, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-359', 'Lisbon Indie Revolution', 'Noche inolvidable de indie rock en directo', 'lisbon-indie-revolution-2025-359', 'ACTIVE', '2026-01-17 19:38:34', '2026-01-17 18:38:34', '2025-10-19 19:38:34', '2026-01-17 18:38:34', 'pt-lisbon-lav', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-360', 'Barcelona Thrash Revolution', 'Gran evento de thrash metal en Barcelona', 'barcelona-thrash-revolution-2025-360', 'ACTIVE', '2026-01-26 01:59:12', '2026-01-26 00:59:12', '2025-10-28 01:59:12', '2026-01-26 00:59:12', 'es-barcelona-razzmatazz', 3000, 3000, 0, 0, NULL, NULL, NULL, '{}', 32.00, 128.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-361', 'Granada Black Metal Storm', 'Gran evento de black metal en Granada', 'granada-black-metal-storm-2025-361', 'ACTIVE', '2025-12-15 01:03:54', '2025-12-15 00:03:54', '2025-09-16 01:03:54', '2025-12-15 00:03:54', 'es-granada-industrial-copera', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-362', 'Madrid Alternative Wave', 'Festival de alternative rock con bandas internacionales', 'madrid-alternative-wave-2025-362', 'ACTIVE', '2026-03-04 15:01:17', '2026-03-04 14:01:17', '2025-12-04 15:01:17', '2026-03-04 14:01:17', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-363', 'Pamplona Black Metal Ritual', 'Noche inolvidable de black metal en directo', 'pamplona-black-metal-ritual-2025-363', 'ACTIVE', '2026-03-28 20:55:25', '2026-03-28 19:55:25', '2025-12-28 20:55:25', '2026-03-28 19:55:25', 'es-pamplona-baluarte', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-364', 'Valencia Death Metal Night', 'Concierto ├®pico de death metal en Valencia', 'valencia-death-metal-night-2025-364', 'ACTIVE', '2026-01-30 10:45:23', '2026-01-30 09:45:23', '2025-11-01 10:45:23', '2026-01-30 09:45:23', '6041a699-2a83-4518-b458-5db09b90c31a', 15000, 15000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-365', 'Zurich Death Fest', 'Noche inolvidable de death metal en directo', 'zurich-death-fest-2025-365', 'ACTIVE', '2025-11-07 14:37:03', '2025-11-07 13:37:03', '2025-08-09 14:37:03', '2025-11-07 13:37:03', 'ch-zurich-hallenstadion', 13000, 13000, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-366', 'Pamplona Doom Storm', 'Gran evento de doom metal en Pamplona', 'pamplona-doom-storm-2025-366', 'ACTIVE', '2025-11-19 20:42:09', '2025-11-19 19:42:09', '2025-08-21 20:42:09', '2025-11-19 19:42:09', 'es-pamplona-baluarte', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-367', 'Manchester Dark Ritual', 'Noche inolvidable de black metal en directo', 'manchester-dark-ritual-2025-367', 'ACTIVE', '2025-12-29 23:59:37', '2025-12-29 22:59:37', '2025-09-30 23:59:37', '2025-12-29 22:59:37', 'uk-manchester-academy', 2600, 2600, 0, 0, NULL, NULL, NULL, '{}', 42.00, 168.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('evt-2025-368', 'Valencia Progressive Attack', 'Festival de progressive metal con bandas internacionales', 'valencia-progressive-attack-2025-368', 'ACTIVE', '2025-11-20 06:55:29', '2025-11-20 05:55:29', '2025-08-22 06:55:29', '2025-11-20 05:55:29', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, '{}', 36.00, 144.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-369', 'Amsterdam Rock Heroes', 'Festival de classic rock con bandas internacionales', 'amsterdam-rock-heroes-2025-369', 'ACTIVE', '2025-12-03 09:39:51', '2025-12-03 08:39:51', '2025-09-04 09:39:51', '2025-12-03 08:39:51', 'nl-amsterdam-melkweg', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 29.00, 116.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-370', 'Amsterdam Punk Legends', 'Noche inolvidable de punk rock en directo', 'amsterdam-punk-legends-2025-370', 'ACTIVE', '2025-12-07 15:11:26', '2025-12-07 14:11:26', '2025-09-08 15:11:26', '2025-12-07 14:11:26', 'nl-amsterdam-melkweg', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-371', 'Athens Indie Vibes', 'La mejor noche de indie rock del a├▒o', 'athens-indie-vibes-2025-371', 'ACTIVE', '2026-01-05 20:38:56', '2026-01-05 19:38:56', '2025-10-07 20:38:56', '2026-01-05 19:38:56', 'gr-athens-oaka', 18000, 18000, 0, 0, NULL, NULL, NULL, '{}', 41.00, 164.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-372', 'Amsterdam Heavy Metal Attack', 'Festival de heavy metal con bandas internacionales', 'amsterdam-heavy-metal-attack-2025-372', 'ACTIVE', '2025-12-01 19:48:31', '2025-12-01 18:48:31', '2025-09-02 19:48:31', '2025-12-01 18:48:31', 'nl-amsterdam-ziggo-dome', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 59.00, 236.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-373', 'Rome Alt Rock Night', 'La mejor noche de alternative rock del a├▒o', 'rome-alt-rock-night-2025-373', 'ACTIVE', '2025-12-13 17:03:38', '2025-12-13 16:03:38', '2025-09-14 17:03:38', '2025-12-13 16:03:38', 'it-rome-palalottomatica', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-374', 'Zurich Thrash Warriors', 'Concierto ├®pico de thrash metal en Zurich', 'zurich-thrash-warriors-2025-374', 'ACTIVE', '2026-03-21 17:52:06', '2026-03-21 16:52:06', '2025-12-21 17:52:06', '2026-03-21 16:52:06', 'ch-zurich-hallenstadion', 13000, 13000, 0, 0, NULL, NULL, NULL, '{}', 63.00, 252.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-375', 'Sevilla Symphonic Fest', 'Concierto ├®pico de symphonic metal en Sevilla', 'sevilla-symphonic-fest-2025-375', 'ACTIVE', '2026-03-11 23:17:42', '2026-03-11 22:17:42', '2025-12-11 23:17:42', '2026-03-11 22:17:42', 'es-sevilla-custom', 1200, 1200, 0, 0, NULL, NULL, NULL, '{}', 19.00, 76.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 11);
INSERT INTO public."Event" VALUES ('evt-2025-376', 'San Sebasti├ín Doom Night', 'Noche inolvidable de doom metal en directo', 'san-sebastian-doom-night-2025-376', 'ACTIVE', '2026-02-22 15:18:03', '2026-02-22 14:18:03', '2025-11-24 15:18:03', '2026-02-22 14:18:03', 'es-donostia-kursaal', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 17.00, 68.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-377', 'London Death Legends', 'La mejor noche de death metal del a├▒o', 'london-death-legends-2025-377', 'ACTIVE', '2026-02-22 19:28:24', '2026-02-22 18:28:24', '2025-11-24 19:28:24', '2026-02-22 18:28:24', 'uk-london-roundhouse', 3300, 3300, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-378', 'Rome Doom Attack', 'Gran evento de doom metal en Rome', 'rome-doom-attack-2025-378', 'ACTIVE', '2026-02-23 10:54:16', '2026-02-23 09:54:16', '2025-11-25 10:54:16', '2026-02-23 09:54:16', 'it-rome-atlantico', 1800, 1800, 0, 0, NULL, NULL, NULL, '{}', 22.00, 88.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-379', 'London Stoner Doom', 'La mejor noche de doom metal del a├▒o', 'london-stoner-doom-2025-379', 'ACTIVE', '2026-02-26 02:53:41', '2026-02-26 01:53:41', '2025-11-28 02:53:41', '2026-02-26 01:53:41', 'uk-london-electric-ballroom', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 26.00, 104.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('evt-2025-380', 'Madrid Punk Rock Fest', 'Concierto ├®pico de punk rock en Madrid', 'madrid-punk-rock-fest-2025-380', 'ACTIVE', '2026-02-13 16:29:33', '2026-02-13 15:29:33', '2025-11-15 16:29:33', '2026-02-13 15:29:33', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-381', 'Valladolid Steel Force', 'Festival de heavy metal con bandas internacionales', 'valladolid-steel-force-2025-381', 'ACTIVE', '2025-12-11 17:25:05', '2025-12-11 16:25:05', '2025-09-12 17:25:05', '2025-12-11 16:25:05', 'es-valladolid-lava', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-382', 'Pamplona Thrash Explosion', 'Festival de thrash metal con bandas internacionales', 'pamplona-thrash-explosion-2025-382', 'ACTIVE', '2026-01-09 14:30:04', '2026-01-09 13:30:04', '2025-10-11 14:30:04', '2026-01-09 13:30:04', 'es-pamplona-baluarte', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('evt-2025-383', 'London Progressive Storm', 'Noche inolvidable de progressive metal en directo', 'london-progressive-storm-2025-383', 'ACTIVE', '2026-02-14 19:53:17', '2026-02-14 18:53:17', '2025-11-16 19:53:17', '2026-02-14 18:53:17', 'uk-london-electric-ballroom', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 31.00, 124.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-384', 'Brussels Death Mayhem', 'La mejor noche de death metal del a├▒o', 'brussels-death-mayhem-2025-384', 'ACTIVE', '2025-10-17 23:58:05', '2025-10-17 22:58:05', '2025-07-19 23:58:05', '2025-10-17 22:58:05', 'be-brussels-ancienne-belgique', 2000, 2000, 0, 0, NULL, NULL, NULL, '{}', 40.00, 160.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-385', 'Barcelona Death Mayhem', 'Noche inolvidable de death metal en directo', 'barcelona-death-mayhem-2025-385', 'ACTIVE', '2026-02-08 19:14:50', '2026-02-08 18:14:50', '2025-11-10 19:14:50', '2026-02-08 18:14:50', 'es-barcelona-palau-sant-jordi', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 45.00, 180.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-386', 'Bilbao Golden Rock Era', 'Noche inolvidable de classic rock en directo', 'bilbao-golden-rock-era-2025-386', 'ACTIVE', '2025-10-19 20:22:52', '2025-10-19 19:22:52', '2025-07-21 20:22:52', '2025-10-19 19:22:52', 'es-bilbao-bizkaia-arena', 18640, 18640, 0, 0, NULL, NULL, NULL, '{}', 49.00, 196.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-387', 'Valencia Underground Rock', 'Gran evento de alternative rock en Valencia', 'valencia-underground-rock-2025-387', 'ACTIVE', '2025-11-22 04:52:30', '2025-11-22 03:52:30', '2025-08-24 04:52:30', '2025-11-22 03:52:30', 'f794e6f0-28c4-4512-ab20-1954720ea984', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('evt-2025-388', 'M├ílaga Punk Underground', 'Festival de punk rock con bandas internacionales', 'malaga-punk-underground-2025-388', 'ACTIVE', '2025-10-14 05:14:06', '2025-10-14 04:14:06', '2025-07-16 05:14:06', '2025-10-14 04:14:06', 'es-malaga-martin-carpena', 11300, 11300, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-389', 'Hamburg Classic Rock Night', 'La mejor noche de classic rock del a├▒o', 'hamburg-classic-rock-night-2025-389', 'ACTIVE', '2026-01-05 16:13:56', '2026-01-05 15:13:56', '2025-10-07 16:13:56', '2026-01-05 15:13:56', 'de-hamburg-barclays-arena', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 62.00, 248.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('evt-2025-390', 'Bilbao Indie Revolution', 'Noche inolvidable de indie rock en directo', 'bilbao-indie-revolution-2025-390', 'ACTIVE', '2025-10-04 06:16:55', '2025-10-04 05:16:55', '2025-07-06 06:16:55', '2025-10-04 05:16:55', 'es-bilbao-kafe-antzokia', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-391', 'Las Palmas Hard Rock Legends', 'La mejor noche de hard rock del a├▒o', 'las-palmas-hard-rock-legends-2025-391', 'ACTIVE', '2026-01-27 06:28:11', '2026-01-27 05:28:11', '2025-10-29 06:28:11', '2026-01-27 05:28:11', 'es-laspalmas-gran-canaria-arena', 11000, 11000, 0, 0, NULL, NULL, NULL, '{}', 38.00, 152.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-392', 'Oviedo Hard Rock Experience', 'Noche inolvidable de hard rock en directo', 'oviedo-hard-rock-experience-2025-392', 'ACTIVE', '2026-01-31 05:47:53', '2026-01-31 04:47:53', '2025-11-02 05:47:53', '2026-01-31 04:47:53', 'es-oviedo-principe-felipe', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('evt-2025-393', 'Stockholm Indie Vibes', 'Festival de indie rock con bandas internacionales', 'stockholm-indie-vibes-2025-393', 'ACTIVE', '2025-12-13 08:12:27', '2025-12-13 07:12:27', '2025-09-14 08:12:27', '2025-12-13 07:12:27', 'se-stockholm-ericsson-globe', 16000, 16000, 0, 0, NULL, NULL, NULL, '{}', 56.00, 224.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('evt-2025-394', 'Valladolid Heavy Metal Live', 'Festival de heavy metal con bandas internacionales', 'valladolid-heavy-metal-live-2025-394', 'ACTIVE', '2026-02-07 14:21:24', '2026-02-07 13:21:24', '2025-11-09 14:21:24', '2026-02-07 13:21:24', 'es-valladolid-lava', 900, 900, 0, 0, NULL, NULL, NULL, '{}', 15.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-395', 'Valencia Punk Rock Fest', 'Gran evento de punk rock en Valencia', 'valencia-punk-rock-fest-2025-395', 'ACTIVE', '2026-02-09 16:53:45', '2026-02-09 15:53:45', '2025-11-11 16:53:45', '2026-02-09 15:53:45', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, '{}', 16.00, 64.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('evt-2025-396', 'Valencia Progressive Legends', 'Festival de progressive metal con bandas internacionales', 'valencia-progressive-legends-2025-396', 'ACTIVE', '2026-02-05 18:47:04', '2026-02-05 17:47:04', '2025-11-07 18:47:04', '2026-02-05 17:47:04', 'f794e6f0-28c4-4512-ab20-1954720ea984', 800, 800, 0, 0, NULL, NULL, NULL, '{}', 18.00, 72.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('evt-2025-397', 'Warsaw Heavy Metal Attack', 'Festival de heavy metal con bandas internacionales', 'warsaw-heavy-metal-attack-2025-397', 'ACTIVE', '2025-10-23 21:21:37', '2025-10-23 20:21:37', '2025-07-25 21:21:37', '2025-10-23 20:21:37', 'pl-warsaw-torwar', 4800, 4800, 0, 0, NULL, NULL, NULL, '{}', 30.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-398', 'Oviedo Metal Power', 'La mejor noche de heavy metal del a├▒o', 'oviedo-metal-power-2025-398', 'ACTIVE', '2025-11-20 22:01:26', '2025-11-20 21:01:26', '2025-08-22 22:01:26', '2025-11-20 21:01:26', 'es-oviedo-principe-felipe', 2200, 2200, 0, 0, NULL, NULL, NULL, '{}', 28.00, 112.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('evt-2025-399', 'Amsterdam Extreme Death', 'Noche inolvidable de death metal en directo', 'amsterdam-extreme-death-2025-399', 'ACTIVE', '2026-02-22 15:54:16', '2026-02-22 14:54:16', '2025-11-24 15:54:16', '2026-02-22 14:54:16', 'nl-amsterdam-paradiso', 1500, 1500, 0, 0, NULL, NULL, NULL, '{}', 24.00, 96.00, '18+', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('evt-2025-400', 'Madrid Rock Icons', 'Gran evento de classic rock en Madrid', 'madrid-rock-icons-2025-400', 'ACTIVE', '2025-10-04 00:17:52', '2025-10-03 23:17:52', '2025-07-06 00:17:52', '2025-10-03 23:17:52', 'es-madrid-wizink-center', 17000, 17000, 0, 0, NULL, NULL, NULL, '{}', 54.00, 216.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315', NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('2559299a-e517-4c85-8501-fccf596863ed', 'Metal Explosion', 'Festival de heavy metal con 5 bandas', 'metal-explosion', 'ACTIVE', '2025-12-01 21:00:00', NULL, '2025-10-01 10:00:00', '2025-11-30 23:59:59', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2200, 2200, 0, 0, NULL, NULL, NULL, NULL, 30.00, 90.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('39930e46-a60b-49ab-aa82-16e1b309ed12', 'Thrash Attack', 'Concierto de thrash metal en el recinto ferial', 'thrash-attack', 'ACTIVE', '2025-11-20 20:00:00', NULL, '2025-09-10 10:00:00', '2025-11-19 23:59:59', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 15000, 15000, 0, 0, NULL, NULL, NULL, NULL, 20.00, 70.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('52bf7140-39a8-4893-a3fb-da38ca35ad9d', 'Doom Fest', 'Festival de doom metal en la sala Rockstar', 'doom-fest', 'ACTIVE', '2025-12-05 22:00:00', NULL, '2025-09-20 10:00:00', '2025-12-04 23:59:59', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, NULL, 28.00, 75.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 12);
INSERT INTO public."Event" VALUES ('f36a2e02-a92a-4c67-b383-a05010e872c7', 'Underground Metal Night', 'Concierto de metal underground', 'underground-metal-night', 'ACTIVE', '2025-09-18 21:00:00', NULL, '2025-07-10 10:00:00', '2025-09-17 23:59:59', 'a09c3413-4b8e-4605-bf25-7601292e93c1', 800, 800, 0, 0, NULL, NULL, NULL, NULL, 12.00, 40.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('f4db5aa0-9e42-4063-a342-9a5a26507984', 'Valencia Alternative Rock', 'Bandas alternativas en directo', 'valencia-alternative-rock', 'ACTIVE', '2025-06-18 20:00:00', NULL, '2025-04-01 10:00:00', '2025-06-17 23:59:59', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, NULL, 18.00, 45.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 2);
INSERT INTO public."Event" VALUES ('894465b9-fac3-4757-b0f4-31e69b17c8e9', 'Valencia Punk Rock Fest', 'Festival de punk rock local', 'valencia-punk-rock', 'ACTIVE', '2025-08-12 19:00:00', NULL, '2025-05-01 10:00:00', '2025-08-11 23:59:59', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 1400, 1400, 0, 0, NULL, NULL, NULL, NULL, 10.00, 30.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 4);
INSERT INTO public."Event" VALUES ('cf0067c7-b2e1-4ca7-aac9-7db4d9b58f8a', 'Progressive Metal Night', 'Noche experimental de progressive metal', 'progressive-metal-night', 'ACTIVE', '2025-11-11 20:00:00', NULL, '2025-09-01 10:00:00', '2025-11-10 23:59:59', '8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 2500, 2500, 0, 0, NULL, NULL, NULL, NULL, 22.00, 75.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 13);
INSERT INTO public."Event" VALUES ('94a83f67-6e96-4871-91eb-1c02c6f6222c', 'Valencia Hard Rock Night', 'Hard rock en vivo con varias bandas', 'valencia-hard-rock', 'ACTIVE', '2025-09-22 20:00:00', NULL, '2025-07-01 10:00:00', '2025-09-21 23:59:59', '56bcb5a9-59c0-4476-b69c-649acfec88d4', 2500, 2500, 0, 0, NULL, NULL, NULL, NULL, 18.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 5);
INSERT INTO public."Event" VALUES ('ca2aeeea-0b78-4ed0-baa6-72686e4b54ae', 'Valencia Death Metal Night', 'Concierto brutal de death metal', 'valencia-death-metal', 'ACTIVE', '2025-12-02 22:00:00', NULL, '2025-10-01 10:00:00', '2025-12-01 23:59:59', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, NULL, 20.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 8);
INSERT INTO public."Event" VALUES ('0b257a0a-859b-433e-997f-6df067c0befb', 'Indie Rock Night', 'Concierto indie rock con bandas emergentes', 'indie-rock-night', 'ACTIVE', '2025-07-15 20:00:00', NULL, '2025-05-15 10:00:00', '2025-07-14 23:59:59', '1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 1000, 1000, 0, 0, NULL, NULL, NULL, NULL, 15.00, 40.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 3);
INSERT INTO public."Event" VALUES ('9b90bac4-0474-430c-bac7-19f98aca058c', 'Metal Mega Fest', 'Gran festival con bandas de rock y metal', 'metal-mega-fest', 'ACTIVE', '2025-09-05 18:00:00', NULL, '2025-06-01 10:00:00', '2025-09-04 23:59:59', '8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 15000, 15000, 0, 0, NULL, NULL, NULL, NULL, 45.00, 150.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('3719c30b-403b-4ba9-8cdc-cd565fc65c86', 'Valencia Rock Night', 'Concierto de rock cl├ísico en Valencia', 'valencia-rock-night', 'ACTIVE', '2025-11-10 20:00:00', NULL, '2025-09-01 10:00:00', '2025-11-09 23:59:59', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 1200, 1200, 0, 0, NULL, NULL, NULL, NULL, 25.00, 60.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('c7c68ffa-8469-498d-86c3-44f449e0e52b', 'Classic Rock Legends', 'Tributo a las leyendas del rock cl├ísico', 'classic-rock-legends', 'ACTIVE', '2025-10-05 20:00:00', NULL, '2025-08-01 10:00:00', '2025-10-04 23:59:59', '001baa5a-7e6c-4561-8aa3-d154f74b6503', 1500, 1500, 0, 0, NULL, NULL, NULL, NULL, 35.00, 90.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('5e53b4c1-9787-403d-81d7-af96f94ed886', 'Rock Fest Agullent', 'Festival de rock en la Pla├ºa de Dalt', 'rock-fest-agullent', 'ACTIVE', '2025-08-20 20:00:00', NULL, '2025-06-01 10:00:00', '2025-08-19 23:59:59', 'aedfb2d3-7fac-40c2-be1a-f535177ae72c', 10000, 10000, 0, 0, NULL, NULL, NULL, NULL, 15.00, 50.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 1, 1);
INSERT INTO public."Event" VALUES ('10a62657-191a-449b-a7c5-c3cf210c7fba', 'Power Metal Valencia', 'Noche ├®pica de power metal', 'power-metal-valencia', 'ACTIVE', '2025-11-01 20:30:00', NULL, '2025-09-01 10:00:00', '2025-10-31 23:59:59', '6041a699-2a83-4518-b458-5db09b90c31a', 15000, 15000, 0, 0, NULL, NULL, NULL, NULL, 30.00, 100.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 10);
INSERT INTO public."Event" VALUES ('cb12da56-8cf5-45d1-9605-ef0ebfbdbe53', 'Metal Cave Sessions', 'Concierto ├¡ntimo de bandas emergentes', 'metal-cave-sessions', 'ACTIVE', '2025-10-25 20:00:00', NULL, '2025-08-15 10:00:00', '2025-10-24 23:59:59', 'e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 600, 600, 0, 0, NULL, NULL, NULL, NULL, 10.00, 30.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 6);
INSERT INTO public."Event" VALUES ('4d8eaab2-fe43-4844-99cd-4ab77c64ef42', 'Ontinyent Metal Fest', 'Festival de metal en la Pla├ºa de Baix', 'ontinyent-metal-fest', 'ACTIVE', '2025-07-30 20:00:00', NULL, '2025-05-01 10:00:00', '2025-07-29 23:59:59', 'ed18fb98-1c7f-4859-8f5c-3f3e099cebd3', 100000, 100000, 0, 0, NULL, NULL, NULL, NULL, 50.00, 150.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 7);
INSERT INTO public."Event" VALUES ('402bed42-00d4-4c56-ba51-650ec4380d46', 'Black Metal Ritual', 'Concierto de black metal atmosf├®rico', 'black-metal-ritual', 'ACTIVE', '2025-12-21 23:00:00', NULL, '2025-10-01 10:00:00', '2025-12-20 23:59:59', 'f794e6f0-28c4-4512-ab20-1954720ea984', 800, 800, 0, 0, NULL, NULL, NULL, NULL, 20.00, 70.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 9);
INSERT INTO public."Event" VALUES ('fe1932b8-ef55-4957-83c6-d14b86413e3a', 'Symphonic Metal Night', 'Noche de metal sinf├│nico con orquesta en vivo', 'symphonic-metal-night', 'ACTIVE', '2025-12-15 20:30:00', NULL, '2025-10-15 10:00:00', '2025-12-14 23:59:59', 'eedf995f-f060-4105-81b5-8b46dd58be37', 1800, 1800, 0, 0, NULL, NULL, NULL, NULL, 40.00, 120.00, NULL, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-03 11:59:57.49', '2025-10-03 11:59:57.49', NULL, NULL, NULL, NULL, 2, 11);


--
-- Data for Name: EventCategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."EventCategory" VALUES (1, 'Rock', 'rock', NULL, NULL, NULL, '{}', '2025-10-16 16:19:46.958', '2025-10-16 16:19:46.958');
INSERT INTO public."EventCategory" VALUES (2, 'Metal', 'metal', NULL, NULL, NULL, '{}', '2025-10-16 16:19:46.958', '2025-10-16 16:19:46.958');


--
-- Data for Name: EventLocality; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-001-1', 'evt-2025-001', 'Pista General', 'Zona pista general', 840, 16.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-001-2', 'evt-2025-001', 'Balc├│n', 'Zona balc├│n', 300, 29.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-001-3', 'evt-2025-001', 'VIP', 'Zona vip', 60, 48.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-002-1', 'evt-2025-002', 'Pista General', 'Zona pista general', 700, 16.00, 700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-002-2', 'evt-2025-002', 'Balc├│n', 'Zona balc├│n', 250, 29.00, 250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-002-3', 'evt-2025-002', 'VIP', 'Zona vip', 50, 48.00, 50, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-003-1', 'evt-2025-003', 'Pista General', 'Zona pista general', 8800, 56.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-003-2', 'evt-2025-003', 'Grada', 'Zona grada', 5600, 104.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-003-3', 'evt-2025-003', 'Palco VIP', 'Zona palco vip', 1600, 140.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-004-1', 'evt-2025-004', 'Pista General', 'Zona pista general', 8800, 52.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-004-2', 'evt-2025-004', 'Grada', 'Zona grada', 5600, 96.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-004-3', 'evt-2025-004', 'Palco VIP', 'Zona palco vip', 1600, 130.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-005-1', 'evt-2025-005', 'Pista General', 'Zona pista general', 1260, 17.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-005-2', 'evt-2025-005', 'Balc├│n', 'Zona balc├│n', 450, 31.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-005-3', 'evt-2025-005', 'VIP', 'Zona vip', 90, 51.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-006-1', 'evt-2025-006', 'Pista General', 'Zona pista general', 11165, 63.00, 11165, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-006-2', 'evt-2025-006', 'Grada', 'Zona grada', 7105, 117.00, 7105, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-006-3', 'evt-2025-006', 'Palco VIP', 'Zona palco vip', 2030, 158.00, 2030, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-007-1', 'evt-2025-007', 'Pista General', 'Zona pista general', 1320, 28.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-007-2', 'evt-2025-007', 'Grada', 'Zona grada', 660, 53.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-007-3', 'evt-2025-007', 'Palco VIP', 'Zona palco vip', 220, 78.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-008-1', 'evt-2025-008', 'Pista General', 'Zona pista general', 420, 15.00, 420, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-008-2', 'evt-2025-008', 'Balc├│n', 'Zona balc├│n', 150, 27.00, 150, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-008-3', 'evt-2025-008', 'VIP', 'Zona vip', 30, 45.00, 30, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-009-1', 'evt-2025-009', 'Pista General', 'Zona pista general', 420, 15.00, 420, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-009-2', 'evt-2025-009', 'Balc├│n', 'Zona balc├│n', 150, 27.00, 150, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-009-3', 'evt-2025-009', 'VIP', 'Zona vip', 30, 45.00, 30, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-010-1', 'evt-2025-010', 'Pista General', 'Zona pista general', 8800, 56.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-010-2', 'evt-2025-010', 'Grada', 'Zona grada', 5600, 104.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-010-3', 'evt-2025-010', 'Palco VIP', 'Zona palco vip', 1600, 140.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-011-1', 'evt-2025-011', 'Pista General', 'Zona pista general', 840, 16.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-011-2', 'evt-2025-011', 'Balc├│n', 'Zona balc├│n', 300, 29.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-011-3', 'evt-2025-011', 'VIP', 'Zona vip', 60, 48.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-012-1', 'evt-2025-012', 'Pista General', 'Zona pista general', 1320, 28.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-012-2', 'evt-2025-012', 'Grada', 'Zona grada', 660, 53.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-012-3', 'evt-2025-012', 'Palco VIP', 'Zona palco vip', 220, 78.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-013-1', 'evt-2025-013', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-013-2', 'evt-2025-013', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-013-3', 'evt-2025-013', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-014-1', 'evt-2025-014', 'Pista General', 'Zona pista general', 1560, 42.00, 1560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-014-2', 'evt-2025-014', 'Grada', 'Zona grada', 780, 80.00, 780, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-014-3', 'evt-2025-014', 'Palco VIP', 'Zona palco vip', 260, 118.00, 260, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-015-1', 'evt-2025-015', 'Pista General', 'Zona pista general', 11000, 51.00, 11000, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-015-2', 'evt-2025-015', 'Grada', 'Zona grada', 7000, 94.00, 7000, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-015-3', 'evt-2025-015', 'Palco VIP', 'Zona palco vip', 2000, 128.00, 2000, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-016-1', 'evt-2025-016', 'Pista General', 'Zona pista general', 6050, 54.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-016-2', 'evt-2025-016', 'Grada', 'Zona grada', 3849, 100.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-016-3', 'evt-2025-016', 'Palco VIP', 'Zona palco vip', 1100, 135.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-017-1', 'evt-2025-017', 'Pista General', 'Zona pista general', 2100, 39.00, 2100, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-017-2', 'evt-2025-017', 'Grada', 'Zona grada', 1050, 74.00, 1050, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-017-3', 'evt-2025-017', 'Palco VIP', 'Zona palco vip', 350, 109.00, 350, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-018-1', 'evt-2025-018', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-018-2', 'evt-2025-018', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-018-3', 'evt-2025-018', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-019-1', 'evt-2025-019', 'Pista General', 'Zona pista general', 2100, 39.00, 2100, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-037-3', 'evt-2025-037', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-019-2', 'evt-2025-019', 'Grada', 'Zona grada', 1050, 74.00, 1050, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-019-3', 'evt-2025-019', 'Palco VIP', 'Zona palco vip', 350, 109.00, 350, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-020-1', 'evt-2025-020', 'Pista General', 'Zona pista general', 6215, 46.00, 6215, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-020-2', 'evt-2025-020', 'Grada', 'Zona grada', 3954, 85.00, 3954, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-020-3', 'evt-2025-020', 'Palco VIP', 'Zona palco vip', 1130, 115.00, 1130, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-021-1', 'evt-2025-021', 'Pista General', 'Zona pista general', 6985, 54.00, 6985, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-021-2', 'evt-2025-021', 'Grada', 'Zona grada', 4445, 100.00, 4445, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-021-3', 'evt-2025-021', 'Palco VIP', 'Zona palco vip', 1270, 135.00, 1270, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-022-1', 'evt-2025-022', 'Pista General', 'Zona pista general', 10252, 41.00, 10252, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-022-2', 'evt-2025-022', 'Grada', 'Zona grada', 6524, 76.00, 6524, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-022-3', 'evt-2025-022', 'Palco VIP', 'Zona palco vip', 1864, 103.00, 1864, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-023-1', 'evt-2025-023', 'Pista General', 'Zona pista general', 6985, 54.00, 6985, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-023-2', 'evt-2025-023', 'Grada', 'Zona grada', 4445, 100.00, 4445, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-023-3', 'evt-2025-023', 'Palco VIP', 'Zona palco vip', 1270, 135.00, 1270, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-024-1', 'evt-2025-024', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-024-2', 'evt-2025-024', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-024-3', 'evt-2025-024', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-025-1', 'evt-2025-025', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-025-2', 'evt-2025-025', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-025-3', 'evt-2025-025', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-026-1', 'evt-2025-026', 'Pista General', 'Zona pista general', 11165, 63.00, 11165, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-026-2', 'evt-2025-026', 'Grada', 'Zona grada', 7105, 117.00, 7105, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-026-3', 'evt-2025-026', 'Palco VIP', 'Zona palco vip', 2030, 158.00, 2030, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-027-1', 'evt-2025-027', 'Pista General', 'Zona pista general', 8250, 36.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-027-2', 'evt-2025-027', 'Grada', 'Zona grada', 5250, 67.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-027-3', 'evt-2025-027', 'Palco VIP', 'Zona palco vip', 1500, 90.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-028-1', 'evt-2025-028', 'Pista General', 'Zona pista general', 1050, 19.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-028-2', 'evt-2025-028', 'Balc├│n', 'Zona balc├│n', 375, 34.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-028-3', 'evt-2025-028', 'VIP', 'Zona vip', 75, 57.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-029-1', 'evt-2025-029', 'Pista General', 'Zona pista general', 11165, 63.00, 11165, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-029-2', 'evt-2025-029', 'Grada', 'Zona grada', 7105, 117.00, 7105, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-029-3', 'evt-2025-029', 'Palco VIP', 'Zona palco vip', 2030, 158.00, 2030, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-030-1', 'evt-2025-030', 'Pista General', 'Zona pista general', 1050, 29.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-030-2', 'evt-2025-030', 'Balc├│n', 'Zona balc├│n', 375, 52.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-030-3', 'evt-2025-030', 'VIP', 'Zona vip', 75, 87.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-031-1', 'evt-2025-031', 'Pista General', 'Zona pista general', 1200, 55.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-031-2', 'evt-2025-031', 'Grada', 'Zona grada', 600, 105.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-031-3', 'evt-2025-031', 'Palco VIP', 'Zona palco vip', 200, 154.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-032-1', 'evt-2025-032', 'Pista General', 'Zona pista general', 1500, 38.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-032-2', 'evt-2025-032', 'Grada', 'Zona grada', 750, 72.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-032-3', 'evt-2025-032', 'Palco VIP', 'Zona palco vip', 250, 106.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-033-1', 'evt-2025-033', 'Pista General', 'Zona pista general', 3600, 30.00, 3600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-033-2', 'evt-2025-033', 'Grada', 'Zona grada', 1800, 57.00, 1800, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-033-3', 'evt-2025-033', 'Palco VIP', 'Zona palco vip', 600, 84.00, 600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-034-1', 'evt-2025-034', 'Pista General', 'Zona pista general', 2700, 33.00, 2700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-034-2', 'evt-2025-034', 'Grada', 'Zona grada', 1350, 63.00, 1350, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-034-3', 'evt-2025-034', 'Palco VIP', 'Zona palco vip', 450, 92.00, 450, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-035-1', 'evt-2025-035', 'Pista General', 'Zona pista general', 1800, 46.00, 1800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-035-2', 'evt-2025-035', 'Grada', 'Zona grada', 900, 87.00, 900, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-035-3', 'evt-2025-035', 'Palco VIP', 'Zona palco vip', 300, 129.00, 300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-036-1', 'evt-2025-036', 'Pista General', 'Zona pista general', 8800, 56.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-036-2', 'evt-2025-036', 'Grada', 'Zona grada', 5600, 104.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-036-3', 'evt-2025-036', 'Palco VIP', 'Zona palco vip', 1600, 140.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-037-1', 'evt-2025-037', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-037-2', 'evt-2025-037', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-038-1', 'evt-2025-038', 'Pista General', 'Zona pista general', 10252, 41.00, 10252, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-038-2', 'evt-2025-038', 'Grada', 'Zona grada', 6524, 76.00, 6524, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-038-3', 'evt-2025-038', 'Palco VIP', 'Zona palco vip', 1864, 103.00, 1864, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-039-1', 'evt-2025-039', 'Pista General', 'Zona pista general', 5940, 36.00, 5940, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-039-2', 'evt-2025-039', 'Grada', 'Zona grada', 3779, 67.00, 3779, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-039-3', 'evt-2025-039', 'Palco VIP', 'Zona palco vip', 1080, 90.00, 1080, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-040-1', 'evt-2025-040', 'Pista General', 'Zona pista general', 6600, 36.00, 6600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-040-2', 'evt-2025-040', 'Grada', 'Zona grada', 4200, 67.00, 4200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-040-3', 'evt-2025-040', 'Palco VIP', 'Zona palco vip', 1200, 90.00, 1200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-041-1', 'evt-2025-041', 'Pista General', 'Zona pista general', 8800, 52.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-041-2', 'evt-2025-041', 'Grada', 'Zona grada', 5600, 96.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-041-3', 'evt-2025-041', 'Palco VIP', 'Zona palco vip', 1600, 130.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-042-1', 'evt-2025-042', 'Pista General', 'Zona pista general', 6050, 38.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-042-2', 'evt-2025-042', 'Grada', 'Zona grada', 3849, 70.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-042-3', 'evt-2025-042', 'Palco VIP', 'Zona palco vip', 1100, 95.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-043-1', 'evt-2025-043', 'Pista General', 'Zona pista general', 5775, 36.00, 5775, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-043-2', 'evt-2025-043', 'Grada', 'Zona grada', 3674, 67.00, 3674, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-043-3', 'evt-2025-043', 'Palco VIP', 'Zona palco vip', 1050, 90.00, 1050, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-044-1', 'evt-2025-044', 'Pista General', 'Zona pista general', 2700, 40.00, 2700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-044-2', 'evt-2025-044', 'Grada', 'Zona grada', 1350, 76.00, 1350, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-044-3', 'evt-2025-044', 'Palco VIP', 'Zona palco vip', 450, 112.00, 450, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-045-1', 'evt-2025-045', 'Pista General', 'Zona pista general', 1260, 26.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-045-2', 'evt-2025-045', 'Balc├│n', 'Zona balc├│n', 450, 47.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-045-3', 'evt-2025-045', 'VIP', 'Zona vip', 90, 78.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-046-1', 'evt-2025-046', 'Pista General', 'Zona pista general', 11550, 59.00, 11550, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-046-2', 'evt-2025-046', 'Grada', 'Zona grada', 7349, 109.00, 7349, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-046-3', 'evt-2025-046', 'Palco VIP', 'Zona palco vip', 2100, 148.00, 2100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-047-1', 'evt-2025-047', 'Pista General', 'Zona pista general', 1260, 22.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-047-2', 'evt-2025-047', 'Balc├│n', 'Zona balc├│n', 450, 40.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-047-3', 'evt-2025-047', 'VIP', 'Zona vip', 90, 66.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-048-1', 'evt-2025-048', 'Pista General', 'Zona pista general', 1800, 32.00, 1800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-048-2', 'evt-2025-048', 'Grada', 'Zona grada', 900, 61.00, 900, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-048-3', 'evt-2025-048', 'Palco VIP', 'Zona palco vip', 300, 90.00, 300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-049-1', 'evt-2025-049', 'Pista General', 'Zona pista general', 1800, 32.00, 1800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-049-2', 'evt-2025-049', 'Grada', 'Zona grada', 900, 61.00, 900, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-049-3', 'evt-2025-049', 'Palco VIP', 'Zona palco vip', 300, 90.00, 300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-050-1', 'evt-2025-050', 'Pista General', 'Zona pista general', 6600, 45.00, 6600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-050-2', 'evt-2025-050', 'Grada', 'Zona grada', 4200, 83.00, 4200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-050-3', 'evt-2025-050', 'Palco VIP', 'Zona palco vip', 1200, 113.00, 1200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-051-1', 'evt-2025-051', 'Pista General', 'Zona pista general', 6050, 38.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-051-2', 'evt-2025-051', 'Grada', 'Zona grada', 3849, 70.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-051-3', 'evt-2025-051', 'Palco VIP', 'Zona palco vip', 1100, 95.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-052-1', 'evt-2025-052', 'Pista General', 'Zona pista general', 9350, 65.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-052-2', 'evt-2025-052', 'Grada', 'Zona grada', 5950, 120.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-052-3', 'evt-2025-052', 'Palco VIP', 'Zona palco vip', 1700, 163.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-053-1', 'evt-2025-053', 'Pista General', 'Zona pista general', 8800, 56.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-053-2', 'evt-2025-053', 'Grada', 'Zona grada', 5600, 104.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-053-3', 'evt-2025-053', 'Palco VIP', 'Zona palco vip', 1600, 140.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-054-1', 'evt-2025-054', 'Pista General', 'Zona pista general', 3600, 30.00, 3600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-054-2', 'evt-2025-054', 'Grada', 'Zona grada', 1800, 57.00, 1800, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-054-3', 'evt-2025-054', 'Palco VIP', 'Zona palco vip', 600, 84.00, 600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-055-1', 'evt-2025-055', 'Pista General', 'Zona pista general', 1200, 46.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-055-2', 'evt-2025-055', 'Grada', 'Zona grada', 600, 87.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-055-3', 'evt-2025-055', 'Palco VIP', 'Zona palco vip', 200, 129.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-056-1', 'evt-2025-056', 'Pista General', 'Zona pista general', 1500, 32.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-056-2', 'evt-2025-056', 'Grada', 'Zona grada', 750, 61.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-056-3', 'evt-2025-056', 'Palco VIP', 'Zona palco vip', 250, 90.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-057-1', 'evt-2025-057', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-057-2', 'evt-2025-057', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-057-3', 'evt-2025-057', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-058-1', 'evt-2025-058', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-058-2', 'evt-2025-058', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-058-3', 'evt-2025-058', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-059-1', 'evt-2025-059', 'Pista General', 'Zona pista general', 8800, 52.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-059-2', 'evt-2025-059', 'Grada', 'Zona grada', 5600, 96.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-059-3', 'evt-2025-059', 'Palco VIP', 'Zona palco vip', 1600, 130.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-060-1', 'evt-2025-060', 'Pista General', 'Zona pista general', 1260, 50.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-060-2', 'evt-2025-060', 'Grada', 'Zona grada', 630, 95.00, 630, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-060-3', 'evt-2025-060', 'Palco VIP', 'Zona palco vip', 210, 140.00, 210, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-061-1', 'evt-2025-061', 'Pista General', 'Zona pista general', 1200, 46.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-061-2', 'evt-2025-061', 'Grada', 'Zona grada', 600, 87.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-061-3', 'evt-2025-061', 'Palco VIP', 'Zona palco vip', 200, 129.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-062-1', 'evt-2025-062', 'Pista General', 'Zona pista general', 1200, 40.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-062-2', 'evt-2025-062', 'Grada', 'Zona grada', 600, 76.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-062-3', 'evt-2025-062', 'Palco VIP', 'Zona palco vip', 200, 112.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-063-1', 'evt-2025-063', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-063-2', 'evt-2025-063', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-063-3', 'evt-2025-063', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-064-1', 'evt-2025-064', 'Pista General', 'Zona pista general', 8800, 68.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-064-2', 'evt-2025-064', 'Grada', 'Zona grada', 5600, 126.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-064-3', 'evt-2025-064', 'Palco VIP', 'Zona palco vip', 1600, 170.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-065-1', 'evt-2025-065', 'Pista General', 'Zona pista general', 1560, 42.00, 1560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-065-2', 'evt-2025-065', 'Grada', 'Zona grada', 780, 80.00, 780, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-065-3', 'evt-2025-065', 'Palco VIP', 'Zona palco vip', 260, 118.00, 260, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-066-1', 'evt-2025-066', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-066-2', 'evt-2025-066', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-066-3', 'evt-2025-066', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-067-1', 'evt-2025-067', 'Pista General', 'Zona pista general', 6050, 38.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-067-2', 'evt-2025-067', 'Grada', 'Zona grada', 3849, 70.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-067-3', 'evt-2025-067', 'Palco VIP', 'Zona palco vip', 1100, 95.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-068-1', 'evt-2025-068', 'Pista General', 'Zona pista general', 840, 24.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-068-2', 'evt-2025-068', 'Balc├│n', 'Zona balc├│n', 300, 43.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-068-3', 'evt-2025-068', 'VIP', 'Zona vip', 60, 72.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-069-1', 'evt-2025-069', 'Pista General', 'Zona pista general', 5775, 36.00, 5775, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-069-2', 'evt-2025-069', 'Grada', 'Zona grada', 3674, 67.00, 3674, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-069-3', 'evt-2025-069', 'Palco VIP', 'Zona palco vip', 1050, 90.00, 1050, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-070-1', 'evt-2025-070', 'Pista General', 'Zona pista general', 11550, 59.00, 11550, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-070-2', 'evt-2025-070', 'Grada', 'Zona grada', 7349, 109.00, 7349, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-070-3', 'evt-2025-070', 'Palco VIP', 'Zona palco vip', 2100, 148.00, 2100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-071-1', 'evt-2025-071', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-071-2', 'evt-2025-071', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-071-3', 'evt-2025-071', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-072-1', 'evt-2025-072', 'Pista General', 'Zona pista general', 1120, 17.00, 1120, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-072-2', 'evt-2025-072', 'Balc├│n', 'Zona balc├│n', 400, 31.00, 400, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-072-3', 'evt-2025-072', 'VIP', 'Zona vip', 80, 51.00, 80, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-073-1', 'evt-2025-073', 'Pista General', 'Zona pista general', 630, 16.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-073-2', 'evt-2025-073', 'Balc├│n', 'Zona balc├│n', 225, 29.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-073-3', 'evt-2025-073', 'VIP', 'Zona vip', 45, 48.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-074-1', 'evt-2025-074', 'Pista General', 'Zona pista general', 8800, 52.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-074-2', 'evt-2025-074', 'Grada', 'Zona grada', 5600, 96.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-074-3', 'evt-2025-074', 'Palco VIP', 'Zona palco vip', 1600, 130.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-075-2', 'evt-2025-075', 'Grada', 'Zona grada', 6300, 91.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-075-3', 'evt-2025-075', 'Palco VIP', 'Zona palco vip', 1800, 123.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-076-2', 'evt-2025-076', 'Grada', 'Zona grada', 6524, 91.00, 6524, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-076-3', 'evt-2025-076', 'Palco VIP', 'Zona palco vip', 1864, 123.00, 1864, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-077-1', 'evt-2025-077', 'Pista General', 'Zona pista general', 1500, 30.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-077-2', 'evt-2025-077', 'Grada', 'Zona grada', 750, 57.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-077-3', 'evt-2025-077', 'Palco VIP', 'Zona palco vip', 250, 84.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-078-1', 'evt-2025-078', 'Pista General', 'Zona pista general', 11000, 81.00, 11000, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-078-2', 'evt-2025-078', 'Grada', 'Zona grada', 7000, 150.00, 7000, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-078-3', 'evt-2025-078', 'Palco VIP', 'Zona palco vip', 2000, 203.00, 2000, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-079-1', 'evt-2025-079', 'Pista General', 'Zona pista general', 700, 16.00, 700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-079-2', 'evt-2025-079', 'Balc├│n', 'Zona balc├│n', 250, 29.00, 250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-079-3', 'evt-2025-079', 'VIP', 'Zona vip', 50, 48.00, 50, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-080-1', 'evt-2025-080', 'Pista General', 'Zona pista general', 630, 18.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-080-2', 'evt-2025-080', 'Balc├│n', 'Zona balc├│n', 225, 32.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-080-3', 'evt-2025-080', 'VIP', 'Zona vip', 45, 54.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-081-1', 'evt-2025-081', 'Pista General', 'Zona pista general', 1260, 42.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-081-2', 'evt-2025-081', 'Grada', 'Zona grada', 630, 80.00, 630, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-081-3', 'evt-2025-081', 'Palco VIP', 'Zona palco vip', 210, 118.00, 210, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-082-1', 'evt-2025-082', 'Pista General', 'Zona pista general', 1500, 30.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-082-2', 'evt-2025-082', 'Grada', 'Zona grada', 750, 57.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-082-3', 'evt-2025-082', 'Palco VIP', 'Zona palco vip', 250, 84.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-083-1', 'evt-2025-083', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-083-2', 'evt-2025-083', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-083-3', 'evt-2025-083', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-084-1', 'evt-2025-084', 'Pista General', 'Zona pista general', 630, 19.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-084-2', 'evt-2025-084', 'Balc├│n', 'Zona balc├│n', 225, 34.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-084-3', 'evt-2025-084', 'VIP', 'Zona vip', 45, 57.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-085-1', 'evt-2025-085', 'Pista General', 'Zona pista general', 8250, 38.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-085-2', 'evt-2025-085', 'Grada', 'Zona grada', 5250, 70.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-085-3', 'evt-2025-085', 'Palco VIP', 'Zona palco vip', 1500, 95.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-086-1', 'evt-2025-086', 'Pista General', 'Zona pista general', 6600, 45.00, 6600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-086-2', 'evt-2025-086', 'Grada', 'Zona grada', 4200, 83.00, 4200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-086-3', 'evt-2025-086', 'Palco VIP', 'Zona palco vip', 1200, 113.00, 1200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-087-1', 'evt-2025-087', 'Pista General', 'Zona pista general', 1500, 30.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-087-2', 'evt-2025-087', 'Grada', 'Zona grada', 750, 57.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-087-3', 'evt-2025-087', 'Palco VIP', 'Zona palco vip', 250, 84.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-088-1', 'evt-2025-088', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-088-2', 'evt-2025-088', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-088-3', 'evt-2025-088', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-089-1', 'evt-2025-089', 'Pista General', 'Zona pista general', 3600, 36.00, 3600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-089-2', 'evt-2025-089', 'Grada', 'Zona grada', 1800, 68.00, 1800, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-089-3', 'evt-2025-089', 'Palco VIP', 'Zona palco vip', 600, 101.00, 600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-090-1', 'evt-2025-090', 'Pista General', 'Zona pista general', 8250, 36.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-090-2', 'evt-2025-090', 'Grada', 'Zona grada', 5250, 67.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-090-3', 'evt-2025-090', 'Palco VIP', 'Zona palco vip', 1500, 90.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-091-1', 'evt-2025-091', 'Pista General', 'Zona pista general', 6985, 54.00, 6985, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-091-2', 'evt-2025-091', 'Grada', 'Zona grada', 4445, 100.00, 4445, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-091-3', 'evt-2025-091', 'Palco VIP', 'Zona palco vip', 1270, 135.00, 1270, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-092-1', 'evt-2025-092', 'Pista General', 'Zona pista general', 1920, 32.00, 1920, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-092-2', 'evt-2025-092', 'Grada', 'Zona grada', 960, 61.00, 960, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-092-3', 'evt-2025-092', 'Palco VIP', 'Zona palco vip', 320, 90.00, 320, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-093-1', 'evt-2025-093', 'Pista General', 'Zona pista general', 10252, 41.00, 10252, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-075-1', 'evt-2025-075', 'Pista General', 'Zona pista general', 9900, 49.00, 9896, 4, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:45:40.471');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-093-2', 'evt-2025-093', 'Grada', 'Zona grada', 6524, 76.00, 6524, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-093-3', 'evt-2025-093', 'Palco VIP', 'Zona palco vip', 1864, 103.00, 1864, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-094-1', 'evt-2025-094', 'Pista General', 'Zona pista general', 2100, 39.00, 2100, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-094-2', 'evt-2025-094', 'Grada', 'Zona grada', 1050, 74.00, 1050, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-094-3', 'evt-2025-094', 'Palco VIP', 'Zona palco vip', 350, 109.00, 350, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-095-1', 'evt-2025-095', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-095-2', 'evt-2025-095', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-095-3', 'evt-2025-095', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-096-1', 'evt-2025-096', 'Pista General', 'Zona pista general', 8250, 38.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-096-2', 'evt-2025-096', 'Grada', 'Zona grada', 5250, 70.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-096-3', 'evt-2025-096', 'Palco VIP', 'Zona palco vip', 1500, 95.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-097-1', 'evt-2025-097', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-097-2', 'evt-2025-097', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-097-3', 'evt-2025-097', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-098-1', 'evt-2025-098', 'Pista General', 'Zona pista general', 630, 18.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-098-2', 'evt-2025-098', 'Balc├│n', 'Zona balc├│n', 225, 32.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-098-3', 'evt-2025-098', 'VIP', 'Zona vip', 45, 54.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-099-1', 'evt-2025-099', 'Pista General', 'Zona pista general', 2100, 39.00, 2100, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-099-2', 'evt-2025-099', 'Grada', 'Zona grada', 1050, 74.00, 1050, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-099-3', 'evt-2025-099', 'Palco VIP', 'Zona palco vip', 350, 109.00, 350, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-100-1', 'evt-2025-100', 'Pista General', 'Zona pista general', 1200, 40.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-100-2', 'evt-2025-100', 'Grada', 'Zona grada', 600, 76.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-100-3', 'evt-2025-100', 'Palco VIP', 'Zona palco vip', 200, 112.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:41.136', '2025-10-16 16:20:41.136');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-101-1', 'evt-2025-101', 'Pista General', 'Zona pista general', 9900, 41.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-101-2', 'evt-2025-101', 'Grada', 'Zona grada', 6300, 76.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-101-3', 'evt-2025-101', 'Palco VIP', 'Zona palco vip', 1800, 103.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-102-1', 'evt-2025-102', 'Pista General', 'Zona pista general', 6050, 54.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-102-2', 'evt-2025-102', 'Grada', 'Zona grada', 3849, 100.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-102-3', 'evt-2025-102', 'Palco VIP', 'Zona palco vip', 1100, 135.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-103-1', 'evt-2025-103', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-103-2', 'evt-2025-103', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-103-3', 'evt-2025-103', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-104-1', 'evt-2025-104', 'Pista General', 'Zona pista general', 1500, 38.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-104-2', 'evt-2025-104', 'Grada', 'Zona grada', 750, 72.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-104-3', 'evt-2025-104', 'Palco VIP', 'Zona palco vip', 250, 106.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-105-1', 'evt-2025-105', 'Pista General', 'Zona pista general', 1560, 42.00, 1560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-105-2', 'evt-2025-105', 'Grada', 'Zona grada', 780, 80.00, 780, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-105-3', 'evt-2025-105', 'Palco VIP', 'Zona palco vip', 260, 118.00, 260, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-106-1', 'evt-2025-106', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-106-2', 'evt-2025-106', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-106-3', 'evt-2025-106', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-107-1', 'evt-2025-107', 'Pista General', 'Zona pista general', 840, 16.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-107-2', 'evt-2025-107', 'Balc├│n', 'Zona balc├│n', 300, 29.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-107-3', 'evt-2025-107', 'VIP', 'Zona vip', 60, 48.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-108-1', 'evt-2025-108', 'Pista General', 'Zona pista general', 8250, 46.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-108-2', 'evt-2025-108', 'Grada', 'Zona grada', 5250, 85.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-108-3', 'evt-2025-108', 'Palco VIP', 'Zona palco vip', 1500, 115.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-109-1', 'evt-2025-109', 'Pista General', 'Zona pista general', 840, 24.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-109-2', 'evt-2025-109', 'Balc├│n', 'Zona balc├│n', 300, 43.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-109-3', 'evt-2025-109', 'VIP', 'Zona vip', 60, 72.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-110-1', 'evt-2025-110', 'Pista General', 'Zona pista general', 6050, 38.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-110-2', 'evt-2025-110', 'Grada', 'Zona grada', 3849, 70.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-110-3', 'evt-2025-110', 'Palco VIP', 'Zona palco vip', 1100, 95.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-111-1', 'evt-2025-111', 'Pista General', 'Zona pista general', 420, 15.00, 420, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-111-2', 'evt-2025-111', 'Balc├│n', 'Zona balc├│n', 150, 27.00, 150, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-111-3', 'evt-2025-111', 'VIP', 'Zona vip', 30, 45.00, 30, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-112-1', 'evt-2025-112', 'Pista General', 'Zona pista general', 1920, 32.00, 1920, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-112-2', 'evt-2025-112', 'Grada', 'Zona grada', 960, 61.00, 960, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-112-3', 'evt-2025-112', 'Palco VIP', 'Zona palco vip', 320, 90.00, 320, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-113-1', 'evt-2025-113', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-113-2', 'evt-2025-113', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-113-3', 'evt-2025-113', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-114-1', 'evt-2025-114', 'Pista General', 'Zona pista general', 1260, 22.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-114-2', 'evt-2025-114', 'Balc├│n', 'Zona balc├│n', 450, 40.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-114-3', 'evt-2025-114', 'VIP', 'Zona vip', 90, 66.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-115-1', 'evt-2025-115', 'Pista General', 'Zona pista general', 11550, 70.00, 11550, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-115-2', 'evt-2025-115', 'Grada', 'Zona grada', 7349, 130.00, 7349, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-115-3', 'evt-2025-115', 'Palco VIP', 'Zona palco vip', 2100, 175.00, 2100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-116-1', 'evt-2025-116', 'Pista General', 'Zona pista general', 5940, 36.00, 5940, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-116-2', 'evt-2025-116', 'Grada', 'Zona grada', 3779, 67.00, 3779, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-116-3', 'evt-2025-116', 'Palco VIP', 'Zona palco vip', 1080, 90.00, 1080, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-117-1', 'evt-2025-117', 'Pista General', 'Zona pista general', 8525, 54.00, 8525, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-117-2', 'evt-2025-117', 'Grada', 'Zona grada', 5425, 100.00, 5425, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-117-3', 'evt-2025-117', 'Palco VIP', 'Zona palco vip', 1550, 135.00, 1550, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-118-1', 'evt-2025-118', 'Pista General', 'Zona pista general', 1500, 30.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-118-2', 'evt-2025-118', 'Grada', 'Zona grada', 750, 57.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-118-3', 'evt-2025-118', 'Palco VIP', 'Zona palco vip', 250, 84.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-119-1', 'evt-2025-119', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-119-2', 'evt-2025-119', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-119-3', 'evt-2025-119', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-120-1', 'evt-2025-120', 'Pista General', 'Zona pista general', 6050, 38.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-120-2', 'evt-2025-120', 'Grada', 'Zona grada', 3849, 70.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-120-3', 'evt-2025-120', 'Palco VIP', 'Zona palco vip', 1100, 95.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-121-1', 'evt-2025-121', 'Pista General', 'Zona pista general', 8525, 54.00, 8525, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-121-2', 'evt-2025-121', 'Grada', 'Zona grada', 5425, 100.00, 5425, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-121-3', 'evt-2025-121', 'Palco VIP', 'Zona palco vip', 1550, 135.00, 1550, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-122-1', 'evt-2025-122', 'Pista General', 'Zona pista general', 8525, 65.00, 8525, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-122-2', 'evt-2025-122', 'Grada', 'Zona grada', 5425, 120.00, 5425, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-122-3', 'evt-2025-122', 'Palco VIP', 'Zona palco vip', 1550, 163.00, 1550, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-123-1', 'evt-2025-123', 'Pista General', 'Zona pista general', 11000, 43.00, 11000, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-123-2', 'evt-2025-123', 'Grada', 'Zona grada', 7000, 80.00, 7000, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-123-3', 'evt-2025-123', 'Palco VIP', 'Zona palco vip', 2000, 108.00, 2000, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-124-1', 'evt-2025-124', 'Pista General', 'Zona pista general', 1050, 26.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-124-2', 'evt-2025-124', 'Balc├│n', 'Zona balc├│n', 375, 47.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-124-3', 'evt-2025-124', 'VIP', 'Zona vip', 75, 78.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-125-1', 'evt-2025-125', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-125-2', 'evt-2025-125', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-125-3', 'evt-2025-125', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-126-1', 'evt-2025-126', 'Pista General', 'Zona pista general', 630, 16.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-126-2', 'evt-2025-126', 'Balc├│n', 'Zona balc├│n', 225, 29.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-126-3', 'evt-2025-126', 'VIP', 'Zona vip', 45, 48.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-127-1', 'evt-2025-127', 'Pista General', 'Zona pista general', 1980, 49.00, 1980, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-127-2', 'evt-2025-127', 'Grada', 'Zona grada', 990, 93.00, 990, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-127-3', 'evt-2025-127', 'Palco VIP', 'Zona palco vip', 330, 137.00, 330, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-128-1', 'evt-2025-128', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-128-2', 'evt-2025-128', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-128-3', 'evt-2025-128', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-129-1', 'evt-2025-129', 'Pista General', 'Zona pista general', 9350, 65.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-129-2', 'evt-2025-129', 'Grada', 'Zona grada', 5950, 120.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-129-3', 'evt-2025-129', 'Palco VIP', 'Zona palco vip', 1700, 163.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-130-1', 'evt-2025-130', 'Pista General', 'Zona pista general', 1120, 17.00, 1120, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-130-2', 'evt-2025-130', 'Balc├│n', 'Zona balc├│n', 400, 31.00, 400, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-130-3', 'evt-2025-130', 'VIP', 'Zona vip', 80, 51.00, 80, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-131-1', 'evt-2025-131', 'Pista General', 'Zona pista general', 11550, 59.00, 11550, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-131-2', 'evt-2025-131', 'Grada', 'Zona grada', 7349, 109.00, 7349, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-131-3', 'evt-2025-131', 'Palco VIP', 'Zona palco vip', 2100, 148.00, 2100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-132-1', 'evt-2025-132', 'Pista General', 'Zona pista general', 1320, 28.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-132-2', 'evt-2025-132', 'Grada', 'Zona grada', 660, 53.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-132-3', 'evt-2025-132', 'Palco VIP', 'Zona palco vip', 220, 78.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-133-1', 'evt-2025-133', 'Pista General', 'Zona pista general', 1260, 22.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-133-2', 'evt-2025-133', 'Balc├│n', 'Zona balc├│n', 450, 40.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-133-3', 'evt-2025-133', 'VIP', 'Zona vip', 90, 66.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-134-1', 'evt-2025-134', 'Pista General', 'Zona pista general', 8525, 65.00, 8525, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-134-2', 'evt-2025-134', 'Grada', 'Zona grada', 5425, 120.00, 5425, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-134-3', 'evt-2025-134', 'Palco VIP', 'Zona palco vip', 1550, 163.00, 1550, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-135-1', 'evt-2025-135', 'Pista General', 'Zona pista general', 5820, 55.00, 5820, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-135-2', 'evt-2025-135', 'Grada', 'Zona grada', 2910, 105.00, 2910, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-135-3', 'evt-2025-135', 'Palco VIP', 'Zona palco vip', 970, 154.00, 970, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-136-1', 'evt-2025-136', 'Pista General', 'Zona pista general', 5775, 36.00, 5775, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-136-2', 'evt-2025-136', 'Grada', 'Zona grada', 3674, 67.00, 3674, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-136-3', 'evt-2025-136', 'Palco VIP', 'Zona palco vip', 1050, 90.00, 1050, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-137-1', 'evt-2025-137', 'Pista General', 'Zona pista general', 700, 16.00, 700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-137-2', 'evt-2025-137', 'Balc├│n', 'Zona balc├│n', 250, 29.00, 250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-137-3', 'evt-2025-137', 'VIP', 'Zona vip', 50, 48.00, 50, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-138-1', 'evt-2025-138', 'Pista General', 'Zona pista general', 1050, 19.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-138-2', 'evt-2025-138', 'Balc├│n', 'Zona balc├│n', 375, 34.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-138-3', 'evt-2025-138', 'VIP', 'Zona vip', 75, 57.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-139-1', 'evt-2025-139', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-139-2', 'evt-2025-139', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-139-3', 'evt-2025-139', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-140-1', 'evt-2025-140', 'Pista General', 'Zona pista general', 4200, 36.00, 4200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-140-2', 'evt-2025-140', 'Grada', 'Zona grada', 2100, 68.00, 2100, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-140-3', 'evt-2025-140', 'Palco VIP', 'Zona palco vip', 700, 101.00, 700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-141-1', 'evt-2025-141', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-141-2', 'evt-2025-141', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-141-3', 'evt-2025-141', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-142-1', 'evt-2025-142', 'Pista General', 'Zona pista general', 8800, 56.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-142-2', 'evt-2025-142', 'Grada', 'Zona grada', 5600, 104.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-142-3', 'evt-2025-142', 'Palco VIP', 'Zona palco vip', 1600, 140.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-143-1', 'evt-2025-143', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-143-2', 'evt-2025-143', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-143-3', 'evt-2025-143', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-144-1', 'evt-2025-144', 'Pista General', 'Zona pista general', 11165, 63.00, 11165, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-144-2', 'evt-2025-144', 'Grada', 'Zona grada', 7105, 117.00, 7105, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-144-3', 'evt-2025-144', 'Palco VIP', 'Zona palco vip', 2030, 158.00, 2030, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-145-1', 'evt-2025-145', 'Pista General', 'Zona pista general', 1200, 55.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-145-2', 'evt-2025-145', 'Grada', 'Zona grada', 600, 105.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-145-3', 'evt-2025-145', 'Palco VIP', 'Zona palco vip', 200, 154.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-146-1', 'evt-2025-146', 'Pista General', 'Zona pista general', 9900, 41.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-146-2', 'evt-2025-146', 'Grada', 'Zona grada', 6300, 76.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-146-3', 'evt-2025-146', 'Palco VIP', 'Zona palco vip', 1800, 103.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-147-1', 'evt-2025-147', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-147-2', 'evt-2025-147', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-147-3', 'evt-2025-147', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-148-1', 'evt-2025-148', 'Pista General', 'Zona pista general', 4200, 30.00, 4200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-148-2', 'evt-2025-148', 'Grada', 'Zona grada', 2100, 57.00, 2100, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-148-3', 'evt-2025-148', 'Palco VIP', 'Zona palco vip', 700, 84.00, 700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-149-1', 'evt-2025-149', 'Pista General', 'Zona pista general', 1500, 32.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-149-2', 'evt-2025-149', 'Grada', 'Zona grada', 750, 61.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-149-3', 'evt-2025-149', 'Palco VIP', 'Zona palco vip', 250, 90.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-150-1', 'evt-2025-150', 'Pista General', 'Zona pista general', 3600, 30.00, 3600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-150-2', 'evt-2025-150', 'Grada', 'Zona grada', 1800, 57.00, 1800, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-150-3', 'evt-2025-150', 'Palco VIP', 'Zona palco vip', 600, 84.00, 600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-151-1', 'evt-2025-151', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-151-2', 'evt-2025-151', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-151-3', 'evt-2025-151', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-152-1', 'evt-2025-152', 'Pista General', 'Zona pista general', 6050, 54.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-152-2', 'evt-2025-152', 'Grada', 'Zona grada', 3849, 100.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-152-3', 'evt-2025-152', 'Palco VIP', 'Zona palco vip', 1100, 135.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-153-1', 'evt-2025-153', 'Pista General', 'Zona pista general', 630, 16.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-153-2', 'evt-2025-153', 'Balc├│n', 'Zona balc├│n', 225, 29.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-153-3', 'evt-2025-153', 'VIP', 'Zona vip', 45, 48.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-154-1', 'evt-2025-154', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-154-2', 'evt-2025-154', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-154-3', 'evt-2025-154', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-155-1', 'evt-2025-155', 'Pista General', 'Zona pista general', 1200, 46.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-155-2', 'evt-2025-155', 'Grada', 'Zona grada', 600, 87.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-155-3', 'evt-2025-155', 'Palco VIP', 'Zona palco vip', 200, 129.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-156-1', 'evt-2025-156', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-156-2', 'evt-2025-156', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-156-3', 'evt-2025-156', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-157-1', 'evt-2025-157', 'Pista General', 'Zona pista general', 1560, 42.00, 1560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-157-2', 'evt-2025-157', 'Grada', 'Zona grada', 780, 80.00, 780, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-157-3', 'evt-2025-157', 'Palco VIP', 'Zona palco vip', 260, 118.00, 260, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-158-1', 'evt-2025-158', 'Pista General', 'Zona pista general', 1260, 20.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-158-2', 'evt-2025-158', 'Balc├│n', 'Zona balc├│n', 450, 36.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-158-3', 'evt-2025-158', 'VIP', 'Zona vip', 90, 60.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-159-1', 'evt-2025-159', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-159-2', 'evt-2025-159', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-159-3', 'evt-2025-159', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-160-1', 'evt-2025-160', 'Pista General', 'Zona pista general', 9350, 65.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-160-2', 'evt-2025-160', 'Grada', 'Zona grada', 5950, 120.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-160-3', 'evt-2025-160', 'Palco VIP', 'Zona palco vip', 1700, 163.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-161-1', 'evt-2025-161', 'Pista General', 'Zona pista general', 1920, 32.00, 1920, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-161-2', 'evt-2025-161', 'Grada', 'Zona grada', 960, 61.00, 960, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-161-3', 'evt-2025-161', 'Palco VIP', 'Zona palco vip', 320, 90.00, 320, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-162-1', 'evt-2025-162', 'Pista General', 'Zona pista general', 6215, 38.00, 6215, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-162-2', 'evt-2025-162', 'Grada', 'Zona grada', 3954, 70.00, 3954, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-162-3', 'evt-2025-162', 'Palco VIP', 'Zona palco vip', 1130, 95.00, 1130, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-163-1', 'evt-2025-163', 'Pista General', 'Zona pista general', 1120, 17.00, 1120, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-163-2', 'evt-2025-163', 'Balc├│n', 'Zona balc├│n', 400, 31.00, 400, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-163-3', 'evt-2025-163', 'VIP', 'Zona vip', 80, 51.00, 80, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-164-1', 'evt-2025-164', 'Pista General', 'Zona pista general', 6050, 38.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-164-2', 'evt-2025-164', 'Grada', 'Zona grada', 3849, 70.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-164-3', 'evt-2025-164', 'Palco VIP', 'Zona palco vip', 1100, 95.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-165-1', 'evt-2025-165', 'Pista General', 'Zona pista general', 5820, 55.00, 5820, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-165-2', 'evt-2025-165', 'Grada', 'Zona grada', 2910, 105.00, 2910, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-165-3', 'evt-2025-165', 'Palco VIP', 'Zona palco vip', 970, 154.00, 970, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-166-1', 'evt-2025-166', 'Pista General', 'Zona pista general', 5775, 36.00, 5775, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-166-2', 'evt-2025-166', 'Grada', 'Zona grada', 3674, 67.00, 3674, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-166-3', 'evt-2025-166', 'Palco VIP', 'Zona palco vip', 1050, 90.00, 1050, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-167-1', 'evt-2025-167', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-167-2', 'evt-2025-167', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-167-3', 'evt-2025-167', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-168-1', 'evt-2025-168', 'Pista General', 'Zona pista general', 1050, 19.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-168-2', 'evt-2025-168', 'Balc├│n', 'Zona balc├│n', 375, 34.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-168-3', 'evt-2025-168', 'VIP', 'Zona vip', 75, 57.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-169-1', 'evt-2025-169', 'Pista General', 'Zona pista general', 11550, 59.00, 11550, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-169-2', 'evt-2025-169', 'Grada', 'Zona grada', 7349, 109.00, 7349, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-169-3', 'evt-2025-169', 'Palco VIP', 'Zona palco vip', 2100, 148.00, 2100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-170-1', 'evt-2025-170', 'Pista General', 'Zona pista general', 8525, 54.00, 8525, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-170-2', 'evt-2025-170', 'Grada', 'Zona grada', 5425, 100.00, 5425, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-170-3', 'evt-2025-170', 'Palco VIP', 'Zona palco vip', 1550, 135.00, 1550, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-171-1', 'evt-2025-171', 'Pista General', 'Zona pista general', 560, 18.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-171-2', 'evt-2025-171', 'Balc├│n', 'Zona balc├│n', 200, 32.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-171-3', 'evt-2025-171', 'VIP', 'Zona vip', 40, 54.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-172-1', 'evt-2025-172', 'Pista General', 'Zona pista general', 630, 16.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-172-2', 'evt-2025-172', 'Balc├│n', 'Zona balc├│n', 225, 29.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-172-3', 'evt-2025-172', 'VIP', 'Zona vip', 45, 48.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-173-1', 'evt-2025-173', 'Pista General', 'Zona pista general', 840, 16.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-173-2', 'evt-2025-173', 'Balc├│n', 'Zona balc├│n', 300, 29.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-173-3', 'evt-2025-173', 'VIP', 'Zona vip', 60, 48.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-174-1', 'evt-2025-174', 'Pista General', 'Zona pista general', 2880, 30.00, 2880, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-174-2', 'evt-2025-174', 'Grada', 'Zona grada', 1440, 57.00, 1440, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-174-3', 'evt-2025-174', 'Palco VIP', 'Zona palco vip', 480, 84.00, 480, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-175-1', 'evt-2025-175', 'Pista General', 'Zona pista general', 1050, 26.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-175-2', 'evt-2025-175', 'Balc├│n', 'Zona balc├│n', 375, 47.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-175-3', 'evt-2025-175', 'VIP', 'Zona vip', 75, 78.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-176-1', 'evt-2025-176', 'Pista General', 'Zona pista general', 1320, 34.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-176-2', 'evt-2025-176', 'Grada', 'Zona grada', 660, 65.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-176-3', 'evt-2025-176', 'Palco VIP', 'Zona palco vip', 220, 95.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-177-1', 'evt-2025-177', 'Pista General', 'Zona pista general', 8800, 52.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-177-2', 'evt-2025-177', 'Grada', 'Zona grada', 5600, 96.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-177-3', 'evt-2025-177', 'Palco VIP', 'Zona palco vip', 1600, 130.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-178-1', 'evt-2025-178', 'Pista General', 'Zona pista general', 9350, 65.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-178-2', 'evt-2025-178', 'Grada', 'Zona grada', 5950, 120.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-178-3', 'evt-2025-178', 'Palco VIP', 'Zona palco vip', 1700, 163.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-179-1', 'evt-2025-179', 'Pista General', 'Zona pista general', 3600, 30.00, 3600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-179-2', 'evt-2025-179', 'Grada', 'Zona grada', 1800, 57.00, 1800, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-179-3', 'evt-2025-179', 'Palco VIP', 'Zona palco vip', 600, 84.00, 600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-180-1', 'evt-2025-180', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-180-2', 'evt-2025-180', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-180-3', 'evt-2025-180', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-181-1', 'evt-2025-181', 'Pista General', 'Zona pista general', 5820, 55.00, 5820, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-181-2', 'evt-2025-181', 'Grada', 'Zona grada', 2910, 105.00, 2910, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-181-3', 'evt-2025-181', 'Palco VIP', 'Zona palco vip', 970, 154.00, 970, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-182-1', 'evt-2025-182', 'Pista General', 'Zona pista general', 8800, 56.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-182-2', 'evt-2025-182', 'Grada', 'Zona grada', 5600, 104.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-182-3', 'evt-2025-182', 'Palco VIP', 'Zona palco vip', 1600, 140.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-183-1', 'evt-2025-183', 'Pista General', 'Zona pista general', 840, 16.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-183-2', 'evt-2025-183', 'Balc├│n', 'Zona balc├│n', 300, 29.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-183-3', 'evt-2025-183', 'VIP', 'Zona vip', 60, 48.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-184-1', 'evt-2025-184', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-184-2', 'evt-2025-184', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-184-3', 'evt-2025-184', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-185-1', 'evt-2025-185', 'Pista General', 'Zona pista general', 1200, 46.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-185-2', 'evt-2025-185', 'Grada', 'Zona grada', 600, 87.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-185-3', 'evt-2025-185', 'Palco VIP', 'Zona palco vip', 200, 129.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-186-1', 'evt-2025-186', 'Pista General', 'Zona pista general', 1050, 29.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-186-2', 'evt-2025-186', 'Balc├│n', 'Zona balc├│n', 375, 52.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-186-3', 'evt-2025-186', 'VIP', 'Zona vip', 75, 87.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-187-1', 'evt-2025-187', 'Pista General', 'Zona pista general', 9900, 41.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-187-2', 'evt-2025-187', 'Grada', 'Zona grada', 6300, 76.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-187-3', 'evt-2025-187', 'Palco VIP', 'Zona palco vip', 1800, 103.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-188-1', 'evt-2025-188', 'Pista General', 'Zona pista general', 9900, 41.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-188-2', 'evt-2025-188', 'Grada', 'Zona grada', 6300, 76.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-188-3', 'evt-2025-188', 'Palco VIP', 'Zona palco vip', 1800, 103.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-189-1', 'evt-2025-189', 'Pista General', 'Zona pista general', 1980, 49.00, 1980, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-189-2', 'evt-2025-189', 'Grada', 'Zona grada', 990, 93.00, 990, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-189-3', 'evt-2025-189', 'Palco VIP', 'Zona palco vip', 330, 137.00, 330, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-190-1', 'evt-2025-190', 'Pista General', 'Zona pista general', 3600, 36.00, 3600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-190-2', 'evt-2025-190', 'Grada', 'Zona grada', 1800, 68.00, 1800, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-190-3', 'evt-2025-190', 'Palco VIP', 'Zona palco vip', 600, 101.00, 600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-191-1', 'evt-2025-191', 'Pista General', 'Zona pista general', 840, 20.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-191-2', 'evt-2025-191', 'Balc├│n', 'Zona balc├│n', 300, 36.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-191-3', 'evt-2025-191', 'VIP', 'Zona vip', 60, 60.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-192-1', 'evt-2025-192', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-192-2', 'evt-2025-192', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-192-3', 'evt-2025-192', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-193-1', 'evt-2025-193', 'Pista General', 'Zona pista general', 840, 19.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-193-2', 'evt-2025-193', 'Balc├│n', 'Zona balc├│n', 300, 34.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-193-3', 'evt-2025-193', 'VIP', 'Zona vip', 60, 57.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-194-1', 'evt-2025-194', 'Pista General', 'Zona pista general', 10252, 41.00, 10252, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-194-2', 'evt-2025-194', 'Grada', 'Zona grada', 6524, 76.00, 6524, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-194-3', 'evt-2025-194', 'Palco VIP', 'Zona palco vip', 1864, 103.00, 1864, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-195-1', 'evt-2025-195', 'Pista General', 'Zona pista general', 6215, 46.00, 6215, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-195-2', 'evt-2025-195', 'Grada', 'Zona grada', 3954, 85.00, 3954, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-195-3', 'evt-2025-195', 'Palco VIP', 'Zona palco vip', 1130, 115.00, 1130, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-196-1', 'evt-2025-196', 'Pista General', 'Zona pista general', 1920, 32.00, 1920, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-196-2', 'evt-2025-196', 'Grada', 'Zona grada', 960, 61.00, 960, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-196-3', 'evt-2025-196', 'Palco VIP', 'Zona palco vip', 320, 90.00, 320, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-197-1', 'evt-2025-197', 'Pista General', 'Zona pista general', 8525, 54.00, 8525, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-197-2', 'evt-2025-197', 'Grada', 'Zona grada', 5425, 100.00, 5425, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-197-3', 'evt-2025-197', 'Palco VIP', 'Zona palco vip', 1550, 135.00, 1550, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-198-1', 'evt-2025-198', 'Pista General', 'Zona pista general', 9900, 49.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-198-2', 'evt-2025-198', 'Grada', 'Zona grada', 6300, 91.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-198-3', 'evt-2025-198', 'Palco VIP', 'Zona palco vip', 1800, 123.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-199-1', 'evt-2025-199', 'Pista General', 'Zona pista general', 6600, 36.00, 6600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-199-2', 'evt-2025-199', 'Grada', 'Zona grada', 4200, 67.00, 4200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-199-3', 'evt-2025-199', 'Palco VIP', 'Zona palco vip', 1200, 90.00, 1200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-200-1', 'evt-2025-200', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-200-2', 'evt-2025-200', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-200-3', 'evt-2025-200', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:51.573', '2025-10-16 16:20:51.573');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-201-1', 'evt-2025-201', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-201-2', 'evt-2025-201', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-201-3', 'evt-2025-201', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-202-1', 'evt-2025-202', 'Pista General', 'Zona pista general', 630, 16.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-202-2', 'evt-2025-202', 'Balc├│n', 'Zona balc├│n', 225, 29.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-202-3', 'evt-2025-202', 'VIP', 'Zona vip', 45, 48.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-203-1', 'evt-2025-203', 'Pista General', 'Zona pista general', 1560, 42.00, 1560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-203-2', 'evt-2025-203', 'Grada', 'Zona grada', 780, 80.00, 780, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-203-3', 'evt-2025-203', 'Palco VIP', 'Zona palco vip', 260, 118.00, 260, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-204-1', 'evt-2025-204', 'Pista General', 'Zona pista general', 8800, 56.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-204-2', 'evt-2025-204', 'Grada', 'Zona grada', 5600, 104.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-204-3', 'evt-2025-204', 'Palco VIP', 'Zona palco vip', 1600, 140.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-205-1', 'evt-2025-205', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-205-2', 'evt-2025-205', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-205-3', 'evt-2025-205', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-206-1', 'evt-2025-206', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-206-2', 'evt-2025-206', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-206-3', 'evt-2025-206', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-207-1', 'evt-2025-207', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-207-2', 'evt-2025-207', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-207-3', 'evt-2025-207', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-208-1', 'evt-2025-208', 'Pista General', 'Zona pista general', 1260, 17.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-208-2', 'evt-2025-208', 'Balc├│n', 'Zona balc├│n', 450, 31.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-208-3', 'evt-2025-208', 'VIP', 'Zona vip', 90, 51.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-209-1', 'evt-2025-209', 'Pista General', 'Zona pista general', 1980, 49.00, 1980, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-209-2', 'evt-2025-209', 'Grada', 'Zona grada', 990, 93.00, 990, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-209-3', 'evt-2025-209', 'Palco VIP', 'Zona palco vip', 330, 137.00, 330, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-210-1', 'evt-2025-210', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-210-2', 'evt-2025-210', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-210-3', 'evt-2025-210', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-211-1', 'evt-2025-211', 'Pista General', 'Zona pista general', 8525, 54.00, 8525, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-211-2', 'evt-2025-211', 'Grada', 'Zona grada', 5425, 100.00, 5425, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-211-3', 'evt-2025-211', 'Palco VIP', 'Zona palco vip', 1550, 135.00, 1550, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-212-1', 'evt-2025-212', 'Pista General', 'Zona pista general', 1320, 34.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-212-2', 'evt-2025-212', 'Grada', 'Zona grada', 660, 65.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-212-3', 'evt-2025-212', 'Palco VIP', 'Zona palco vip', 220, 95.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-213-1', 'evt-2025-213', 'Pista General', 'Zona pista general', 1050, 29.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-213-2', 'evt-2025-213', 'Balc├│n', 'Zona balc├│n', 375, 52.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-213-3', 'evt-2025-213', 'VIP', 'Zona vip', 75, 87.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-214-1', 'evt-2025-214', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-214-2', 'evt-2025-214', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-214-3', 'evt-2025-214', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-215-1', 'evt-2025-215', 'Pista General', 'Zona pista general', 1260, 50.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-215-2', 'evt-2025-215', 'Grada', 'Zona grada', 630, 95.00, 630, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-215-3', 'evt-2025-215', 'Palco VIP', 'Zona palco vip', 210, 140.00, 210, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-216-1', 'evt-2025-216', 'Pista General', 'Zona pista general', 1050, 20.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-216-2', 'evt-2025-216', 'Balc├│n', 'Zona balc├│n', 375, 36.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-216-3', 'evt-2025-216', 'VIP', 'Zona vip', 75, 60.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-217-1', 'evt-2025-217', 'Pista General', 'Zona pista general', 11000, 68.00, 11000, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-217-2', 'evt-2025-217', 'Grada', 'Zona grada', 7000, 126.00, 7000, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-217-3', 'evt-2025-217', 'Palco VIP', 'Zona palco vip', 2000, 170.00, 2000, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-218-1', 'evt-2025-218', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-218-2', 'evt-2025-218', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-218-3', 'evt-2025-218', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-219-1', 'evt-2025-219', 'Pista General', 'Zona pista general', 10252, 41.00, 10252, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-219-2', 'evt-2025-219', 'Grada', 'Zona grada', 6524, 76.00, 6524, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-219-3', 'evt-2025-219', 'Palco VIP', 'Zona palco vip', 1864, 103.00, 1864, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-220-1', 'evt-2025-220', 'Pista General', 'Zona pista general', 8800, 52.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-220-2', 'evt-2025-220', 'Grada', 'Zona grada', 5600, 96.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-220-3', 'evt-2025-220', 'Palco VIP', 'Zona palco vip', 1600, 130.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-221-1', 'evt-2025-221', 'Pista General', 'Zona pista general', 1200, 46.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-221-2', 'evt-2025-221', 'Grada', 'Zona grada', 600, 87.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-221-3', 'evt-2025-221', 'Palco VIP', 'Zona palco vip', 200, 129.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-222-1', 'evt-2025-222', 'Pista General', 'Zona pista general', 8250, 36.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-222-2', 'evt-2025-222', 'Grada', 'Zona grada', 5250, 67.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-222-3', 'evt-2025-222', 'Palco VIP', 'Zona palco vip', 1500, 90.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-223-1', 'evt-2025-223', 'Pista General', 'Zona pista general', 4200, 30.00, 4200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-223-2', 'evt-2025-223', 'Grada', 'Zona grada', 2100, 57.00, 2100, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-223-3', 'evt-2025-223', 'Palco VIP', 'Zona palco vip', 700, 84.00, 700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-224-1', 'evt-2025-224', 'Pista General', 'Zona pista general', 2880, 30.00, 2880, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-224-2', 'evt-2025-224', 'Grada', 'Zona grada', 1440, 57.00, 1440, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-224-3', 'evt-2025-224', 'Palco VIP', 'Zona palco vip', 480, 84.00, 480, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-225-1', 'evt-2025-225', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-225-2', 'evt-2025-225', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-225-3', 'evt-2025-225', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-226-1', 'evt-2025-226', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-226-2', 'evt-2025-226', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-226-3', 'evt-2025-226', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-227-1', 'evt-2025-227', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-227-2', 'evt-2025-227', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-227-3', 'evt-2025-227', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-228-1', 'evt-2025-228', 'Pista General', 'Zona pista general', 2100, 39.00, 2100, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-228-2', 'evt-2025-228', 'Grada', 'Zona grada', 1050, 74.00, 1050, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-228-3', 'evt-2025-228', 'Palco VIP', 'Zona palco vip', 350, 109.00, 350, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-229-1', 'evt-2025-229', 'Pista General', 'Zona pista general', 6050, 54.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-229-2', 'evt-2025-229', 'Grada', 'Zona grada', 3849, 100.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-229-3', 'evt-2025-229', 'Palco VIP', 'Zona palco vip', 1100, 135.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-230-1', 'evt-2025-230', 'Pista General', 'Zona pista general', 1260, 22.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-230-2', 'evt-2025-230', 'Balc├│n', 'Zona balc├│n', 450, 40.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-230-3', 'evt-2025-230', 'VIP', 'Zona vip', 90, 66.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-231-1', 'evt-2025-231', 'Pista General', 'Zona pista general', 5775, 43.00, 5775, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-231-2', 'evt-2025-231', 'Grada', 'Zona grada', 3674, 80.00, 3674, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-231-3', 'evt-2025-231', 'Palco VIP', 'Zona palco vip', 1050, 108.00, 1050, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-232-1', 'evt-2025-232', 'Pista General', 'Zona pista general', 7150, 63.00, 7150, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-232-2', 'evt-2025-232', 'Grada', 'Zona grada', 4550, 117.00, 4550, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-232-3', 'evt-2025-232', 'Palco VIP', 'Zona palco vip', 1300, 158.00, 1300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-233-1', 'evt-2025-233', 'Pista General', 'Zona pista general', 8250, 38.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-233-2', 'evt-2025-233', 'Grada', 'Zona grada', 5250, 70.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-233-3', 'evt-2025-233', 'Palco VIP', 'Zona palco vip', 1500, 95.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-234-1', 'evt-2025-234', 'Pista General', 'Zona pista general', 840, 20.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-234-2', 'evt-2025-234', 'Balc├│n', 'Zona balc├│n', 300, 36.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-234-3', 'evt-2025-234', 'VIP', 'Zona vip', 60, 60.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-235-1', 'evt-2025-235', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-235-2', 'evt-2025-235', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-235-3', 'evt-2025-235', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-236-1', 'evt-2025-236', 'Pista General', 'Zona pista general', 6215, 38.00, 6215, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-236-2', 'evt-2025-236', 'Grada', 'Zona grada', 3954, 70.00, 3954, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-236-3', 'evt-2025-236', 'Palco VIP', 'Zona palco vip', 1130, 95.00, 1130, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-237-1', 'evt-2025-237', 'Pista General', 'Zona pista general', 8800, 68.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-237-2', 'evt-2025-237', 'Grada', 'Zona grada', 5600, 126.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-237-3', 'evt-2025-237', 'Palco VIP', 'Zona palco vip', 1600, 170.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-238-1', 'evt-2025-238', 'Pista General', 'Zona pista general', 700, 16.00, 700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-238-2', 'evt-2025-238', 'Balc├│n', 'Zona balc├│n', 250, 29.00, 250, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-238-3', 'evt-2025-238', 'VIP', 'Zona vip', 50, 48.00, 50, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-239-1', 'evt-2025-239', 'Pista General', 'Zona pista general', 840, 19.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-239-2', 'evt-2025-239', 'Balc├│n', 'Zona balc├│n', 300, 34.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-239-3', 'evt-2025-239', 'VIP', 'Zona vip', 60, 57.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-240-1', 'evt-2025-240', 'Pista General', 'Zona pista general', 8800, 68.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-240-2', 'evt-2025-240', 'Grada', 'Zona grada', 5600, 126.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-240-3', 'evt-2025-240', 'Palco VIP', 'Zona palco vip', 1600, 170.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-241-1', 'evt-2025-241', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-241-2', 'evt-2025-241', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-241-3', 'evt-2025-241', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-242-1', 'evt-2025-242', 'Pista General', 'Zona pista general', 1200, 46.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-242-2', 'evt-2025-242', 'Grada', 'Zona grada', 600, 87.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-242-3', 'evt-2025-242', 'Palco VIP', 'Zona palco vip', 200, 129.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-243-1', 'evt-2025-243', 'Pista General', 'Zona pista general', 2880, 30.00, 2880, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-243-2', 'evt-2025-243', 'Grada', 'Zona grada', 1440, 57.00, 1440, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-243-3', 'evt-2025-243', 'Palco VIP', 'Zona palco vip', 480, 84.00, 480, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-244-1', 'evt-2025-244', 'Pista General', 'Zona pista general', 5775, 36.00, 5775, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-244-2', 'evt-2025-244', 'Grada', 'Zona grada', 3674, 67.00, 3674, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-244-3', 'evt-2025-244', 'Palco VIP', 'Zona palco vip', 1050, 90.00, 1050, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-245-1', 'evt-2025-245', 'Pista General', 'Zona pista general', 9350, 59.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-245-2', 'evt-2025-245', 'Grada', 'Zona grada', 5950, 109.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-245-3', 'evt-2025-245', 'Palco VIP', 'Zona palco vip', 1700, 148.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-246-1', 'evt-2025-246', 'Pista General', 'Zona pista general', 5820, 46.00, 5820, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-246-2', 'evt-2025-246', 'Grada', 'Zona grada', 2910, 87.00, 2910, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-246-3', 'evt-2025-246', 'Palco VIP', 'Zona palco vip', 970, 129.00, 970, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-247-1', 'evt-2025-247', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-247-2', 'evt-2025-247', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-247-3', 'evt-2025-247', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-248-1', 'evt-2025-248', 'Pista General', 'Zona pista general', 1050, 26.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-248-2', 'evt-2025-248', 'Balc├│n', 'Zona balc├│n', 375, 47.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-248-3', 'evt-2025-248', 'VIP', 'Zona vip', 75, 78.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-249-1', 'evt-2025-249', 'Pista General', 'Zona pista general', 9350, 59.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-249-2', 'evt-2025-249', 'Grada', 'Zona grada', 5950, 109.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-249-3', 'evt-2025-249', 'Palco VIP', 'Zona palco vip', 1700, 148.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-250-1', 'evt-2025-250', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-250-2', 'evt-2025-250', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-250-3', 'evt-2025-250', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-251-1', 'evt-2025-251', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-251-2', 'evt-2025-251', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-251-3', 'evt-2025-251', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-252-1', 'evt-2025-252', 'Pista General', 'Zona pista general', 1500, 30.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-252-2', 'evt-2025-252', 'Grada', 'Zona grada', 750, 57.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-252-3', 'evt-2025-252', 'Palco VIP', 'Zona palco vip', 250, 84.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-253-1', 'evt-2025-253', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-253-2', 'evt-2025-253', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-253-3', 'evt-2025-253', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-254-1', 'evt-2025-254', 'Pista General', 'Zona pista general', 630, 16.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-254-2', 'evt-2025-254', 'Balc├│n', 'Zona balc├│n', 225, 29.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-254-3', 'evt-2025-254', 'VIP', 'Zona vip', 45, 48.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-255-1', 'evt-2025-255', 'Pista General', 'Zona pista general', 8800, 52.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-255-2', 'evt-2025-255', 'Grada', 'Zona grada', 5600, 96.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-255-3', 'evt-2025-255', 'Palco VIP', 'Zona palco vip', 1600, 130.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-256-1', 'evt-2025-256', 'Pista General', 'Zona pista general', 840, 16.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-256-2', 'evt-2025-256', 'Balc├│n', 'Zona balc├│n', 300, 29.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-256-3', 'evt-2025-256', 'VIP', 'Zona vip', 60, 48.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-257-1', 'evt-2025-257', 'Pista General', 'Zona pista general', 4200, 30.00, 4200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-257-2', 'evt-2025-257', 'Grada', 'Zona grada', 2100, 57.00, 2100, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-257-3', 'evt-2025-257', 'Palco VIP', 'Zona palco vip', 700, 84.00, 700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-258-1', 'evt-2025-258', 'Pista General', 'Zona pista general', 1050, 26.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-258-2', 'evt-2025-258', 'Balc├│n', 'Zona balc├│n', 375, 47.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-258-3', 'evt-2025-258', 'VIP', 'Zona vip', 75, 78.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-259-1', 'evt-2025-259', 'Pista General', 'Zona pista general', 11000, 68.00, 11000, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-259-2', 'evt-2025-259', 'Grada', 'Zona grada', 7000, 126.00, 7000, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-259-3', 'evt-2025-259', 'Palco VIP', 'Zona palco vip', 2000, 170.00, 2000, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-260-1', 'evt-2025-260', 'Pista General', 'Zona pista general', 1200, 46.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-260-2', 'evt-2025-260', 'Grada', 'Zona grada', 600, 87.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-260-3', 'evt-2025-260', 'Palco VIP', 'Zona palco vip', 200, 129.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-261-1', 'evt-2025-261', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-261-2', 'evt-2025-261', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-261-3', 'evt-2025-261', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-262-1', 'evt-2025-262', 'Pista General', 'Zona pista general', 2700, 33.00, 2700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-262-2', 'evt-2025-262', 'Grada', 'Zona grada', 1350, 63.00, 1350, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-262-3', 'evt-2025-262', 'Palco VIP', 'Zona palco vip', 450, 92.00, 450, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-263-1', 'evt-2025-263', 'Pista General', 'Zona pista general', 840, 20.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-263-2', 'evt-2025-263', 'Balc├│n', 'Zona balc├│n', 300, 36.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-263-3', 'evt-2025-263', 'VIP', 'Zona vip', 60, 60.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-264-1', 'evt-2025-264', 'Pista General', 'Zona pista general', 1500, 38.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-264-2', 'evt-2025-264', 'Grada', 'Zona grada', 750, 72.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-264-3', 'evt-2025-264', 'Palco VIP', 'Zona palco vip', 250, 106.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-265-1', 'evt-2025-265', 'Pista General', 'Zona pista general', 11000, 68.00, 11000, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-265-2', 'evt-2025-265', 'Grada', 'Zona grada', 7000, 126.00, 7000, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-265-3', 'evt-2025-265', 'Palco VIP', 'Zona palco vip', 2000, 170.00, 2000, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-266-1', 'evt-2025-266', 'Pista General', 'Zona pista general', 840, 20.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-266-2', 'evt-2025-266', 'Balc├│n', 'Zona balc├│n', 300, 36.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-266-3', 'evt-2025-266', 'VIP', 'Zona vip', 60, 60.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-267-1', 'evt-2025-267', 'Pista General', 'Zona pista general', 1500, 36.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-267-2', 'evt-2025-267', 'Grada', 'Zona grada', 750, 68.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-267-3', 'evt-2025-267', 'Palco VIP', 'Zona palco vip', 250, 101.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-268-1', 'evt-2025-268', 'Pista General', 'Zona pista general', 5775, 36.00, 5775, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-268-2', 'evt-2025-268', 'Grada', 'Zona grada', 3674, 67.00, 3674, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-268-3', 'evt-2025-268', 'Palco VIP', 'Zona palco vip', 1050, 90.00, 1050, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-269-1', 'evt-2025-269', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-269-2', 'evt-2025-269', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-269-3', 'evt-2025-269', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-270-1', 'evt-2025-270', 'Pista General', 'Zona pista general', 8800, 68.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-270-2', 'evt-2025-270', 'Grada', 'Zona grada', 5600, 126.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-270-3', 'evt-2025-270', 'Palco VIP', 'Zona palco vip', 1600, 170.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-271-1', 'evt-2025-271', 'Pista General', 'Zona pista general', 8525, 65.00, 8525, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-271-2', 'evt-2025-271', 'Grada', 'Zona grada', 5425, 120.00, 5425, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-271-3', 'evt-2025-271', 'Palco VIP', 'Zona palco vip', 1550, 163.00, 1550, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-272-1', 'evt-2025-272', 'Pista General', 'Zona pista general', 1500, 30.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-272-2', 'evt-2025-272', 'Grada', 'Zona grada', 750, 57.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-272-3', 'evt-2025-272', 'Palco VIP', 'Zona palco vip', 250, 84.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-273-1', 'evt-2025-273', 'Pista General', 'Zona pista general', 6050, 38.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-273-2', 'evt-2025-273', 'Grada', 'Zona grada', 3849, 70.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-273-3', 'evt-2025-273', 'Palco VIP', 'Zona palco vip', 1100, 95.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-274-1', 'evt-2025-274', 'Pista General', 'Zona pista general', 420, 15.00, 420, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-274-2', 'evt-2025-274', 'Balc├│n', 'Zona balc├│n', 150, 27.00, 150, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-274-3', 'evt-2025-274', 'VIP', 'Zona vip', 30, 45.00, 30, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-275-1', 'evt-2025-275', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-275-2', 'evt-2025-275', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-275-3', 'evt-2025-275', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-276-1', 'evt-2025-276', 'Pista General', 'Zona pista general', 6215, 38.00, 6215, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-276-2', 'evt-2025-276', 'Grada', 'Zona grada', 3954, 70.00, 3954, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-276-3', 'evt-2025-276', 'Palco VIP', 'Zona palco vip', 1130, 95.00, 1130, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-277-1', 'evt-2025-277', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-277-2', 'evt-2025-277', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-277-3', 'evt-2025-277', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-278-1', 'evt-2025-278', 'Pista General', 'Zona pista general', 9900, 41.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-278-2', 'evt-2025-278', 'Grada', 'Zona grada', 6300, 76.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-278-3', 'evt-2025-278', 'Palco VIP', 'Zona palco vip', 1800, 103.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-279-1', 'evt-2025-279', 'Pista General', 'Zona pista general', 1980, 49.00, 1980, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-279-2', 'evt-2025-279', 'Grada', 'Zona grada', 990, 93.00, 990, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-279-3', 'evt-2025-279', 'Palco VIP', 'Zona palco vip', 330, 137.00, 330, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-280-1', 'evt-2025-280', 'Pista General', 'Zona pista general', 11000, 43.00, 11000, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-280-2', 'evt-2025-280', 'Grada', 'Zona grada', 7000, 80.00, 7000, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-280-3', 'evt-2025-280', 'Palco VIP', 'Zona palco vip', 2000, 108.00, 2000, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-281-1', 'evt-2025-281', 'Pista General', 'Zona pista general', 630, 16.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-281-2', 'evt-2025-281', 'Balc├│n', 'Zona balc├│n', 225, 29.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-281-3', 'evt-2025-281', 'VIP', 'Zona vip', 45, 48.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-282-1', 'evt-2025-282', 'Pista General', 'Zona pista general', 8800, 52.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-282-2', 'evt-2025-282', 'Grada', 'Zona grada', 5600, 96.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-282-3', 'evt-2025-282', 'Palco VIP', 'Zona palco vip', 1600, 130.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-283-1', 'evt-2025-283', 'Pista General', 'Zona pista general', 7150, 63.00, 7150, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-283-2', 'evt-2025-283', 'Grada', 'Zona grada', 4550, 117.00, 4550, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-283-3', 'evt-2025-283', 'Palco VIP', 'Zona palco vip', 1300, 158.00, 1300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-284-1', 'evt-2025-284', 'Pista General', 'Zona pista general', 11550, 59.00, 11550, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-284-2', 'evt-2025-284', 'Grada', 'Zona grada', 7349, 109.00, 7349, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-284-3', 'evt-2025-284', 'Palco VIP', 'Zona palco vip', 2100, 148.00, 2100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-285-1', 'evt-2025-285', 'Pista General', 'Zona pista general', 9900, 41.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-285-2', 'evt-2025-285', 'Grada', 'Zona grada', 6300, 76.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-285-3', 'evt-2025-285', 'Palco VIP', 'Zona palco vip', 1800, 103.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-286-1', 'evt-2025-286', 'Pista General', 'Zona pista general', 840, 24.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-286-2', 'evt-2025-286', 'Balc├│n', 'Zona balc├│n', 300, 43.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-286-3', 'evt-2025-286', 'VIP', 'Zona vip', 60, 72.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-287-1', 'evt-2025-287', 'Pista General', 'Zona pista general', 1800, 32.00, 1800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-287-2', 'evt-2025-287', 'Grada', 'Zona grada', 900, 61.00, 900, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-287-3', 'evt-2025-287', 'Palco VIP', 'Zona palco vip', 300, 90.00, 300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-288-1', 'evt-2025-288', 'Pista General', 'Zona pista general', 1050, 19.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-288-2', 'evt-2025-288', 'Balc├│n', 'Zona balc├│n', 375, 34.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-288-3', 'evt-2025-288', 'VIP', 'Zona vip', 75, 57.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-289-1', 'evt-2025-289', 'Pista General', 'Zona pista general', 420, 15.00, 420, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-289-2', 'evt-2025-289', 'Balc├│n', 'Zona balc├│n', 150, 27.00, 150, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-289-3', 'evt-2025-289', 'VIP', 'Zona vip', 30, 45.00, 30, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-290-1', 'evt-2025-290', 'Pista General', 'Zona pista general', 1320, 28.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-290-2', 'evt-2025-290', 'Grada', 'Zona grada', 660, 53.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-290-3', 'evt-2025-290', 'Palco VIP', 'Zona palco vip', 220, 78.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-291-1', 'evt-2025-291', 'Pista General', 'Zona pista general', 1500, 30.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-291-2', 'evt-2025-291', 'Grada', 'Zona grada', 750, 57.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-291-3', 'evt-2025-291', 'Palco VIP', 'Zona palco vip', 250, 84.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-292-1', 'evt-2025-292', 'Pista General', 'Zona pista general', 7150, 63.00, 7150, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-292-2', 'evt-2025-292', 'Grada', 'Zona grada', 4550, 117.00, 4550, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-292-3', 'evt-2025-292', 'Palco VIP', 'Zona palco vip', 1300, 158.00, 1300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-293-1', 'evt-2025-293', 'Pista General', 'Zona pista general', 840, 16.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-293-2', 'evt-2025-293', 'Balc├│n', 'Zona balc├│n', 300, 29.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-293-3', 'evt-2025-293', 'VIP', 'Zona vip', 60, 48.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-294-1', 'evt-2025-294', 'Pista General', 'Zona pista general', 1260, 20.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-294-2', 'evt-2025-294', 'Balc├│n', 'Zona balc├│n', 450, 36.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-294-3', 'evt-2025-294', 'VIP', 'Zona vip', 90, 60.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-295-1', 'evt-2025-295', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-295-2', 'evt-2025-295', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-295-3', 'evt-2025-295', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-296-1', 'evt-2025-296', 'Pista General', 'Zona pista general', 5940, 36.00, 5940, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-296-2', 'evt-2025-296', 'Grada', 'Zona grada', 3779, 67.00, 3779, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-296-3', 'evt-2025-296', 'Palco VIP', 'Zona palco vip', 1080, 90.00, 1080, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-297-1', 'evt-2025-297', 'Pista General', 'Zona pista general', 11000, 68.00, 11000, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-297-2', 'evt-2025-297', 'Grada', 'Zona grada', 7000, 126.00, 7000, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-297-3', 'evt-2025-297', 'Palco VIP', 'Zona palco vip', 2000, 170.00, 2000, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-298-1', 'evt-2025-298', 'Pista General', 'Zona pista general', 1050, 26.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-298-2', 'evt-2025-298', 'Balc├│n', 'Zona balc├│n', 375, 47.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-298-3', 'evt-2025-298', 'VIP', 'Zona vip', 75, 78.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-299-1', 'evt-2025-299', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-299-2', 'evt-2025-299', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-299-3', 'evt-2025-299', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-300-1', 'evt-2025-300', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-300-2', 'evt-2025-300', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-300-3', 'evt-2025-300', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:20:59.716', '2025-10-16 16:20:59.716');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-301-1', 'evt-2025-301', 'Pista General', 'Zona pista general', 1050, 29.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-301-2', 'evt-2025-301', 'Balc├│n', 'Zona balc├│n', 375, 52.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-301-3', 'evt-2025-301', 'VIP', 'Zona vip', 75, 87.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-302-1', 'evt-2025-302', 'Pista General', 'Zona pista general', 420, 15.00, 420, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-302-2', 'evt-2025-302', 'Balc├│n', 'Zona balc├│n', 150, 27.00, 150, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-302-3', 'evt-2025-302', 'VIP', 'Zona vip', 30, 45.00, 30, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-303-1', 'evt-2025-303', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-303-2', 'evt-2025-303', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-303-3', 'evt-2025-303', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-304-1', 'evt-2025-304', 'Pista General', 'Zona pista general', 1500, 34.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-304-2', 'evt-2025-304', 'Grada', 'Zona grada', 750, 65.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-304-3', 'evt-2025-304', 'Palco VIP', 'Zona palco vip', 250, 95.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-305-1', 'evt-2025-305', 'Pista General', 'Zona pista general', 1500, 30.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-305-2', 'evt-2025-305', 'Grada', 'Zona grada', 750, 57.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-305-3', 'evt-2025-305', 'Palco VIP', 'Zona palco vip', 250, 84.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-306-1', 'evt-2025-306', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-306-2', 'evt-2025-306', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-306-3', 'evt-2025-306', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-307-1', 'evt-2025-307', 'Pista General', 'Zona pista general', 9900, 41.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-307-2', 'evt-2025-307', 'Grada', 'Zona grada', 6300, 76.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-307-3', 'evt-2025-307', 'Palco VIP', 'Zona palco vip', 1800, 103.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-308-1', 'evt-2025-308', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-308-2', 'evt-2025-308', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-308-3', 'evt-2025-308', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-309-1', 'evt-2025-309', 'Pista General', 'Zona pista general', 11550, 59.00, 11550, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-309-2', 'evt-2025-309', 'Grada', 'Zona grada', 7349, 109.00, 7349, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-309-3', 'evt-2025-309', 'Palco VIP', 'Zona palco vip', 2100, 148.00, 2100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-310-1', 'evt-2025-310', 'Pista General', 'Zona pista general', 8250, 36.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-310-2', 'evt-2025-310', 'Grada', 'Zona grada', 5250, 67.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-310-3', 'evt-2025-310', 'Palco VIP', 'Zona palco vip', 1500, 90.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-311-1', 'evt-2025-311', 'Pista General', 'Zona pista general', 2100, 39.00, 2100, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-311-2', 'evt-2025-311', 'Grada', 'Zona grada', 1050, 74.00, 1050, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-311-3', 'evt-2025-311', 'Palco VIP', 'Zona palco vip', 350, 109.00, 350, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-312-1', 'evt-2025-312', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-312-2', 'evt-2025-312', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-312-3', 'evt-2025-312', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-313-1', 'evt-2025-313', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-313-2', 'evt-2025-313', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-313-3', 'evt-2025-313', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-314-1', 'evt-2025-314', 'Pista General', 'Zona pista general', 630, 15.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-314-2', 'evt-2025-314', 'Balc├│n', 'Zona balc├│n', 225, 27.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-314-3', 'evt-2025-314', 'VIP', 'Zona vip', 45, 45.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-315-1', 'evt-2025-315', 'Pista General', 'Zona pista general', 1050, 20.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-315-2', 'evt-2025-315', 'Balc├│n', 'Zona balc├│n', 375, 36.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-315-3', 'evt-2025-315', 'VIP', 'Zona vip', 75, 60.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-316-1', 'evt-2025-316', 'Pista General', 'Zona pista general', 2100, 39.00, 2100, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-316-2', 'evt-2025-316', 'Grada', 'Zona grada', 1050, 74.00, 1050, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-316-3', 'evt-2025-316', 'Palco VIP', 'Zona palco vip', 350, 109.00, 350, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-317-1', 'evt-2025-317', 'Pista General', 'Zona pista general', 7150, 63.00, 7150, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-317-2', 'evt-2025-317', 'Grada', 'Zona grada', 4550, 117.00, 4550, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-317-3', 'evt-2025-317', 'Palco VIP', 'Zona palco vip', 1300, 158.00, 1300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-318-1', 'evt-2025-318', 'Pista General', 'Zona pista general', 1120, 17.00, 1120, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-318-2', 'evt-2025-318', 'Balc├│n', 'Zona balc├│n', 400, 31.00, 400, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-318-3', 'evt-2025-318', 'VIP', 'Zona vip', 80, 51.00, 80, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-319-1', 'evt-2025-319', 'Pista General', 'Zona pista general', 1500, 36.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-319-2', 'evt-2025-319', 'Grada', 'Zona grada', 750, 68.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-319-3', 'evt-2025-319', 'Palco VIP', 'Zona palco vip', 250, 101.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-320-1', 'evt-2025-320', 'Pista General', 'Zona pista general', 1320, 34.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-320-2', 'evt-2025-320', 'Grada', 'Zona grada', 660, 65.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-320-3', 'evt-2025-320', 'Palco VIP', 'Zona palco vip', 220, 95.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-321-1', 'evt-2025-321', 'Pista General', 'Zona pista general', 560, 18.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-321-2', 'evt-2025-321', 'Balc├│n', 'Zona balc├│n', 200, 32.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-321-3', 'evt-2025-321', 'VIP', 'Zona vip', 40, 54.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-322-1', 'evt-2025-322', 'Pista General', 'Zona pista general', 840, 16.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-322-2', 'evt-2025-322', 'Balc├│n', 'Zona balc├│n', 300, 29.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-322-3', 'evt-2025-322', 'VIP', 'Zona vip', 60, 48.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-323-1', 'evt-2025-323', 'Pista General', 'Zona pista general', 8800, 68.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-323-2', 'evt-2025-323', 'Grada', 'Zona grada', 5600, 126.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-323-3', 'evt-2025-323', 'Palco VIP', 'Zona palco vip', 1600, 170.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-324-1', 'evt-2025-324', 'Pista General', 'Zona pista general', 9350, 65.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-324-2', 'evt-2025-324', 'Grada', 'Zona grada', 5950, 120.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-324-3', 'evt-2025-324', 'Palco VIP', 'Zona palco vip', 1700, 163.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-325-1', 'evt-2025-325', 'Pista General', 'Zona pista general', 1200, 40.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-325-2', 'evt-2025-325', 'Grada', 'Zona grada', 600, 76.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-325-3', 'evt-2025-325', 'Palco VIP', 'Zona palco vip', 200, 112.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-326-1', 'evt-2025-326', 'Pista General', 'Zona pista general', 9900, 49.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-326-2', 'evt-2025-326', 'Grada', 'Zona grada', 6300, 91.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-326-3', 'evt-2025-326', 'Palco VIP', 'Zona palco vip', 1800, 123.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-327-1', 'evt-2025-327', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-327-2', 'evt-2025-327', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-327-3', 'evt-2025-327', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-328-1', 'evt-2025-328', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-328-2', 'evt-2025-328', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-328-3', 'evt-2025-328', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-329-1', 'evt-2025-329', 'Pista General', 'Zona pista general', 700, 19.00, 700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-329-2', 'evt-2025-329', 'Balc├│n', 'Zona balc├│n', 250, 34.00, 250, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-329-3', 'evt-2025-329', 'VIP', 'Zona vip', 50, 57.00, 50, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-330-1', 'evt-2025-330', 'Pista General', 'Zona pista general', 9900, 49.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-330-2', 'evt-2025-330', 'Grada', 'Zona grada', 6300, 91.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-330-3', 'evt-2025-330', 'Palco VIP', 'Zona palco vip', 1800, 123.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-331-1', 'evt-2025-331', 'Pista General', 'Zona pista general', 1320, 34.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-331-2', 'evt-2025-331', 'Grada', 'Zona grada', 660, 65.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-331-3', 'evt-2025-331', 'Palco VIP', 'Zona palco vip', 220, 95.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-332-1', 'evt-2025-332', 'Pista General', 'Zona pista general', 8250, 38.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-332-2', 'evt-2025-332', 'Grada', 'Zona grada', 5250, 70.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-332-3', 'evt-2025-332', 'Palco VIP', 'Zona palco vip', 1500, 95.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-333-1', 'evt-2025-333', 'Pista General', 'Zona pista general', 8800, 52.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-333-2', 'evt-2025-333', 'Grada', 'Zona grada', 5600, 96.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-333-3', 'evt-2025-333', 'Palco VIP', 'Zona palco vip', 1600, 130.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-334-1', 'evt-2025-334', 'Pista General', 'Zona pista general', 7150, 63.00, 7150, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-334-2', 'evt-2025-334', 'Grada', 'Zona grada', 4550, 117.00, 4550, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-334-3', 'evt-2025-334', 'Palco VIP', 'Zona palco vip', 1300, 158.00, 1300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-335-1', 'evt-2025-335', 'Pista General', 'Zona pista general', 2880, 30.00, 2880, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-335-2', 'evt-2025-335', 'Grada', 'Zona grada', 1440, 57.00, 1440, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-335-3', 'evt-2025-335', 'Palco VIP', 'Zona palco vip', 480, 84.00, 480, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-336-1', 'evt-2025-336', 'Pista General', 'Zona pista general', 9900, 41.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-336-2', 'evt-2025-336', 'Grada', 'Zona grada', 6300, 76.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-336-3', 'evt-2025-336', 'Palco VIP', 'Zona palco vip', 1800, 103.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-337-1', 'evt-2025-337', 'Pista General', 'Zona pista general', 1500, 30.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-337-2', 'evt-2025-337', 'Grada', 'Zona grada', 750, 57.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-337-3', 'evt-2025-337', 'Palco VIP', 'Zona palco vip', 250, 84.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-338-1', 'evt-2025-338', 'Pista General', 'Zona pista general', 6600, 36.00, 6600, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-338-2', 'evt-2025-338', 'Grada', 'Zona grada', 4200, 67.00, 4200, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-338-3', 'evt-2025-338', 'Palco VIP', 'Zona palco vip', 1200, 90.00, 1200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-339-1', 'evt-2025-339', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-339-2', 'evt-2025-339', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-339-3', 'evt-2025-339', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-340-1', 'evt-2025-340', 'Pista General', 'Zona pista general', 2100, 39.00, 2100, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-340-2', 'evt-2025-340', 'Grada', 'Zona grada', 1050, 74.00, 1050, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-340-3', 'evt-2025-340', 'Palco VIP', 'Zona palco vip', 350, 109.00, 350, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-341-1', 'evt-2025-341', 'Pista General', 'Zona pista general', 8250, 46.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-341-2', 'evt-2025-341', 'Grada', 'Zona grada', 5250, 85.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-341-3', 'evt-2025-341', 'Palco VIP', 'Zona palco vip', 1500, 115.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-342-1', 'evt-2025-342', 'Pista General', 'Zona pista general', 10252, 41.00, 10252, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-342-2', 'evt-2025-342', 'Grada', 'Zona grada', 6524, 76.00, 6524, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-342-3', 'evt-2025-342', 'Palco VIP', 'Zona palco vip', 1864, 103.00, 1864, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-343-1', 'evt-2025-343', 'Pista General', 'Zona pista general', 5820, 46.00, 5820, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-343-2', 'evt-2025-343', 'Grada', 'Zona grada', 2910, 87.00, 2910, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-343-3', 'evt-2025-343', 'Palco VIP', 'Zona palco vip', 970, 129.00, 970, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-344-1', 'evt-2025-344', 'Pista General', 'Zona pista general', 6215, 38.00, 6215, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-344-2', 'evt-2025-344', 'Grada', 'Zona grada', 3954, 70.00, 3954, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-344-3', 'evt-2025-344', 'Palco VIP', 'Zona palco vip', 1130, 95.00, 1130, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-345-1', 'evt-2025-345', 'Pista General', 'Zona pista general', 6215, 38.00, 6215, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-345-2', 'evt-2025-345', 'Grada', 'Zona grada', 3954, 70.00, 3954, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-345-3', 'evt-2025-345', 'Palco VIP', 'Zona palco vip', 1130, 95.00, 1130, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-346-1', 'evt-2025-346', 'Pista General', 'Zona pista general', 2700, 33.00, 2700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-346-2', 'evt-2025-346', 'Grada', 'Zona grada', 1350, 63.00, 1350, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-346-3', 'evt-2025-346', 'Palco VIP', 'Zona palco vip', 450, 92.00, 450, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-347-1', 'evt-2025-347', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-347-2', 'evt-2025-347', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-347-3', 'evt-2025-347', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-348-1', 'evt-2025-348', 'Pista General', 'Zona pista general', 6215, 38.00, 6215, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-348-2', 'evt-2025-348', 'Grada', 'Zona grada', 3954, 70.00, 3954, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-348-3', 'evt-2025-348', 'Palco VIP', 'Zona palco vip', 1130, 95.00, 1130, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-349-1', 'evt-2025-349', 'Pista General', 'Zona pista general', 630, 16.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-349-2', 'evt-2025-349', 'Balc├│n', 'Zona balc├│n', 225, 29.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-349-3', 'evt-2025-349', 'VIP', 'Zona vip', 45, 48.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-350-1', 'evt-2025-350', 'Pista General', 'Zona pista general', 5100, 42.00, 5100, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-350-2', 'evt-2025-350', 'Grada', 'Zona grada', 2550, 80.00, 2550, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-350-3', 'evt-2025-350', 'Palco VIP', 'Zona palco vip', 850, 118.00, 850, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-351-1', 'evt-2025-351', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-351-2', 'evt-2025-351', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-351-3', 'evt-2025-351', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-352-1', 'evt-2025-352', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-352-2', 'evt-2025-352', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-352-3', 'evt-2025-352', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-353-1', 'evt-2025-353', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-353-2', 'evt-2025-353', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-353-3', 'evt-2025-353', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-354-1', 'evt-2025-354', 'Pista General', 'Zona pista general', 8525, 65.00, 8525, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-354-2', 'evt-2025-354', 'Grada', 'Zona grada', 5425, 120.00, 5425, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-354-3', 'evt-2025-354', 'Palco VIP', 'Zona palco vip', 1550, 163.00, 1550, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-355-1', 'evt-2025-355', 'Pista General', 'Zona pista general', 11165, 63.00, 11165, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-355-2', 'evt-2025-355', 'Grada', 'Zona grada', 7105, 117.00, 7105, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-355-3', 'evt-2025-355', 'Palco VIP', 'Zona palco vip', 2030, 158.00, 2030, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-356-1', 'evt-2025-356', 'Pista General', 'Zona pista general', 11550, 59.00, 11550, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-356-2', 'evt-2025-356', 'Grada', 'Zona grada', 7349, 109.00, 7349, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-356-3', 'evt-2025-356', 'Palco VIP', 'Zona palco vip', 2100, 148.00, 2100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-357-1', 'evt-2025-357', 'Pista General', 'Zona pista general', 1980, 49.00, 1980, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-357-2', 'evt-2025-357', 'Grada', 'Zona grada', 990, 93.00, 990, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-357-3', 'evt-2025-357', 'Palco VIP', 'Zona palco vip', 330, 137.00, 330, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-358-1', 'evt-2025-358', 'Pista General', 'Zona pista general', 1980, 59.00, 1980, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-358-2', 'evt-2025-358', 'Grada', 'Zona grada', 990, 112.00, 990, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-358-3', 'evt-2025-358', 'Palco VIP', 'Zona palco vip', 330, 165.00, 330, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-359-1', 'evt-2025-359', 'Pista General', 'Zona pista general', 1500, 32.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-359-2', 'evt-2025-359', 'Grada', 'Zona grada', 750, 61.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-359-3', 'evt-2025-359', 'Palco VIP', 'Zona palco vip', 250, 90.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-360-1', 'evt-2025-360', 'Pista General', 'Zona pista general', 1800, 32.00, 1800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-360-2', 'evt-2025-360', 'Grada', 'Zona grada', 900, 61.00, 900, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-360-3', 'evt-2025-360', 'Palco VIP', 'Zona palco vip', 300, 90.00, 300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-361-1', 'evt-2025-361', 'Pista General', 'Zona pista general', 1500, 28.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-361-2', 'evt-2025-361', 'Grada', 'Zona grada', 750, 53.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-361-3', 'evt-2025-361', 'Palco VIP', 'Zona palco vip', 250, 78.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-362-1', 'evt-2025-362', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-362-2', 'evt-2025-362', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-362-3', 'evt-2025-362', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-363-1', 'evt-2025-363', 'Pista General', 'Zona pista general', 1320, 28.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-363-2', 'evt-2025-363', 'Grada', 'Zona grada', 660, 53.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-363-3', 'evt-2025-363', 'Palco VIP', 'Zona palco vip', 220, 78.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-364-1', 'evt-2025-364', 'Pista General', 'Zona pista general', 8250, 38.00, 8250, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-364-2', 'evt-2025-364', 'Grada', 'Zona grada', 5250, 70.00, 5250, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-364-3', 'evt-2025-364', 'Palco VIP', 'Zona palco vip', 1500, 95.00, 1500, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-365-1', 'evt-2025-365', 'Pista General', 'Zona pista general', 7150, 63.00, 7150, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-365-2', 'evt-2025-365', 'Grada', 'Zona grada', 4550, 117.00, 4550, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-365-3', 'evt-2025-365', 'Palco VIP', 'Zona palco vip', 1300, 158.00, 1300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-366-1', 'evt-2025-366', 'Pista General', 'Zona pista general', 1320, 28.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-366-2', 'evt-2025-366', 'Grada', 'Zona grada', 660, 53.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-366-3', 'evt-2025-366', 'Palco VIP', 'Zona palco vip', 220, 78.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-367-1', 'evt-2025-367', 'Pista General', 'Zona pista general', 1560, 42.00, 1560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-367-2', 'evt-2025-367', 'Grada', 'Zona grada', 780, 80.00, 780, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-367-3', 'evt-2025-367', 'Palco VIP', 'Zona palco vip', 260, 118.00, 260, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-368-1', 'evt-2025-368', 'Pista General', 'Zona pista general', 1500, 36.00, 1500, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-368-2', 'evt-2025-368', 'Grada', 'Zona grada', 750, 68.00, 750, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-368-3', 'evt-2025-368', 'Palco VIP', 'Zona palco vip', 250, 101.00, 250, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-369-1', 'evt-2025-369', 'Pista General', 'Zona pista general', 1050, 29.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-369-2', 'evt-2025-369', 'Balc├│n', 'Zona balc├│n', 375, 52.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-369-3', 'evt-2025-369', 'VIP', 'Zona vip', 75, 87.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-370-1', 'evt-2025-370', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-370-2', 'evt-2025-370', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-370-3', 'evt-2025-370', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-371-1', 'evt-2025-371', 'Pista General', 'Zona pista general', 9900, 41.00, 9900, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-371-2', 'evt-2025-371', 'Grada', 'Zona grada', 6300, 76.00, 6300, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-371-3', 'evt-2025-371', 'Palco VIP', 'Zona palco vip', 1800, 103.00, 1800, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-372-1', 'evt-2025-372', 'Pista General', 'Zona pista general', 9350, 59.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-372-2', 'evt-2025-372', 'Grada', 'Zona grada', 5950, 109.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-372-3', 'evt-2025-372', 'Palco VIP', 'Zona palco vip', 1700, 148.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-373-1', 'evt-2025-373', 'Pista General', 'Zona pista general', 6050, 54.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-373-2', 'evt-2025-373', 'Grada', 'Zona grada', 3849, 100.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-373-3', 'evt-2025-373', 'Palco VIP', 'Zona palco vip', 1100, 135.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-374-1', 'evt-2025-374', 'Pista General', 'Zona pista general', 7150, 63.00, 7150, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-374-2', 'evt-2025-374', 'Grada', 'Zona grada', 4550, 117.00, 4550, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-374-3', 'evt-2025-374', 'Palco VIP', 'Zona palco vip', 1300, 158.00, 1300, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-375-1', 'evt-2025-375', 'Pista General', 'Zona pista general', 840, 19.00, 840, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-375-2', 'evt-2025-375', 'Balc├│n', 'Zona balc├│n', 300, 34.00, 300, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-375-3', 'evt-2025-375', 'VIP', 'Zona vip', 60, 57.00, 60, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-376-1', 'evt-2025-376', 'Pista General', 'Zona pista general', 1260, 17.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-376-2', 'evt-2025-376', 'Balc├│n', 'Zona balc├│n', 450, 31.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-376-3', 'evt-2025-376', 'VIP', 'Zona vip', 90, 51.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-377-1', 'evt-2025-377', 'Pista General', 'Zona pista general', 1980, 49.00, 1980, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-377-2', 'evt-2025-377', 'Grada', 'Zona grada', 990, 93.00, 990, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-377-3', 'evt-2025-377', 'Palco VIP', 'Zona palco vip', 330, 137.00, 330, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-378-1', 'evt-2025-378', 'Pista General', 'Zona pista general', 1260, 22.00, 1260, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-378-2', 'evt-2025-378', 'Balc├│n', 'Zona balc├│n', 450, 40.00, 450, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-378-3', 'evt-2025-378', 'VIP', 'Zona vip', 90, 66.00, 90, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-379-1', 'evt-2025-379', 'Pista General', 'Zona pista general', 1050, 26.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-379-2', 'evt-2025-379', 'Balc├│n', 'Zona balc├│n', 375, 47.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-379-3', 'evt-2025-379', 'VIP', 'Zona vip', 75, 78.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-380-1', 'evt-2025-380', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-380-2', 'evt-2025-380', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-380-3', 'evt-2025-380', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-381-1', 'evt-2025-381', 'Pista General', 'Zona pista general', 630, 15.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-381-2', 'evt-2025-381', 'Balc├│n', 'Zona balc├│n', 225, 27.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-381-3', 'evt-2025-381', 'VIP', 'Zona vip', 45, 45.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-382-1', 'evt-2025-382', 'Pista General', 'Zona pista general', 1320, 28.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-382-2', 'evt-2025-382', 'Grada', 'Zona grada', 660, 53.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-382-3', 'evt-2025-382', 'Palco VIP', 'Zona palco vip', 220, 78.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-383-1', 'evt-2025-383', 'Pista General', 'Zona pista general', 1050, 31.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-383-2', 'evt-2025-383', 'Balc├│n', 'Zona balc├│n', 375, 56.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-383-3', 'evt-2025-383', 'VIP', 'Zona vip', 75, 93.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-384-1', 'evt-2025-384', 'Pista General', 'Zona pista general', 1200, 40.00, 1200, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-384-2', 'evt-2025-384', 'Grada', 'Zona grada', 600, 76.00, 600, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-384-3', 'evt-2025-384', 'Palco VIP', 'Zona palco vip', 200, 112.00, 200, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-385-1', 'evt-2025-385', 'Pista General', 'Zona pista general', 9350, 45.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-385-2', 'evt-2025-385', 'Grada', 'Zona grada', 5950, 83.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-385-3', 'evt-2025-385', 'Palco VIP', 'Zona palco vip', 1700, 113.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-386-1', 'evt-2025-386', 'Pista General', 'Zona pista general', 10252, 49.00, 10252, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-386-2', 'evt-2025-386', 'Grada', 'Zona grada', 6524, 91.00, 6524, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-386-3', 'evt-2025-386', 'Palco VIP', 'Zona palco vip', 1864, 123.00, 1864, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-387-1', 'evt-2025-387', 'Pista General', 'Zona pista general', 560, 15.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-387-2', 'evt-2025-387', 'Balc├│n', 'Zona balc├│n', 200, 27.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-387-3', 'evt-2025-387', 'VIP', 'Zona vip', 40, 45.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-388-1', 'evt-2025-388', 'Pista General', 'Zona pista general', 6215, 38.00, 6215, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-388-2', 'evt-2025-388', 'Grada', 'Zona grada', 3954, 70.00, 3954, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-388-3', 'evt-2025-388', 'Palco VIP', 'Zona palco vip', 1130, 95.00, 1130, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-389-1', 'evt-2025-389', 'Pista General', 'Zona pista general', 8800, 62.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-389-2', 'evt-2025-389', 'Grada', 'Zona grada', 5600, 115.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-389-3', 'evt-2025-389', 'Palco VIP', 'Zona palco vip', 1600, 155.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-390-1', 'evt-2025-390', 'Pista General', 'Zona pista general', 1050, 16.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-390-2', 'evt-2025-390', 'Balc├│n', 'Zona balc├│n', 375, 29.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-390-3', 'evt-2025-390', 'VIP', 'Zona vip', 75, 48.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-391-1', 'evt-2025-391', 'Pista General', 'Zona pista general', 6050, 38.00, 6050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-391-2', 'evt-2025-391', 'Grada', 'Zona grada', 3849, 70.00, 3849, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-391-3', 'evt-2025-391', 'Palco VIP', 'Zona palco vip', 1100, 95.00, 1100, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-392-1', 'evt-2025-392', 'Pista General', 'Zona pista general', 1320, 28.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-392-2', 'evt-2025-392', 'Grada', 'Zona grada', 660, 53.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-392-3', 'evt-2025-392', 'Palco VIP', 'Zona palco vip', 220, 78.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-393-1', 'evt-2025-393', 'Pista General', 'Zona pista general', 8800, 56.00, 8800, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-393-2', 'evt-2025-393', 'Grada', 'Zona grada', 5600, 104.00, 5600, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-393-3', 'evt-2025-393', 'Palco VIP', 'Zona palco vip', 1600, 140.00, 1600, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-394-1', 'evt-2025-394', 'Pista General', 'Zona pista general', 630, 15.00, 630, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-394-2', 'evt-2025-394', 'Balc├│n', 'Zona balc├│n', 225, 27.00, 225, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-394-3', 'evt-2025-394', 'VIP', 'Zona vip', 45, 45.00, 45, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-395-1', 'evt-2025-395', 'Pista General', 'Zona pista general', 700, 16.00, 700, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-395-2', 'evt-2025-395', 'Balc├│n', 'Zona balc├│n', 250, 29.00, 250, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-395-3', 'evt-2025-395', 'VIP', 'Zona vip', 50, 48.00, 50, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-396-1', 'evt-2025-396', 'Pista General', 'Zona pista general', 560, 18.00, 560, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-396-2', 'evt-2025-396', 'Balc├│n', 'Zona balc├│n', 200, 32.00, 200, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-396-3', 'evt-2025-396', 'VIP', 'Zona vip', 40, 54.00, 40, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-397-1', 'evt-2025-397', 'Pista General', 'Zona pista general', 2880, 30.00, 2880, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-397-2', 'evt-2025-397', 'Grada', 'Zona grada', 1440, 57.00, 1440, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-397-3', 'evt-2025-397', 'Palco VIP', 'Zona palco vip', 480, 84.00, 480, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-398-1', 'evt-2025-398', 'Pista General', 'Zona pista general', 1320, 28.00, 1320, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-398-2', 'evt-2025-398', 'Grada', 'Zona grada', 660, 53.00, 660, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-398-3', 'evt-2025-398', 'Palco VIP', 'Zona palco vip', 220, 78.00, 220, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-399-1', 'evt-2025-399', 'Pista General', 'Zona pista general', 1050, 24.00, 1050, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-399-2', 'evt-2025-399', 'Balc├│n', 'Zona balc├│n', 375, 43.00, 375, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-399-3', 'evt-2025-399', 'VIP', 'Zona vip', 75, 72.00, 75, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-400-1', 'evt-2025-400', 'Pista General', 'Zona pista general', 9350, 54.00, 9350, 0, 0, '#3B82F6', true, 1, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-400-2', 'evt-2025-400', 'Grada', 'Zona grada', 5950, 100.00, 5950, 0, 0, '#10B981', true, 2, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-400-3', 'evt-2025-400', 'Palco VIP', 'Zona palco vip', 1700, 135.00, 1700, 0, 0, '#F59E0B', true, 3, '2025-10-16 16:21:00.315', '2025-10-16 16:21:00.315');
INSERT INTO public."EventLocality" VALUES ('loc-evt-2025-076-1', 'evt-2025-076', 'Pista General', 'Zona pista general', 10252, 49.00, 10248, 4, 0, '#3B82F6', true, 1, '2025-10-16 16:20:41.136', '2025-10-16 16:45:18.799');


--
-- Data for Name: EventSubcategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."EventSubcategory" VALUES (1, 1, 'Classic Rock', 'classic-rock', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (2, 1, 'Alternative Rock', 'alternative-rock', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (3, 1, 'Indie Rock', 'indie-rock', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (4, 1, 'Punk Rock', 'punk-rock', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (5, 1, 'Hard Rock', 'hard-rock', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (6, 2, 'Heavy Metal', 'heavy-metal', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (7, 2, 'Thrash Metal', 'thrash-metal', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (8, 2, 'Death Metal', 'death-metal', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (9, 2, 'Black Metal', 'black-metal', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (10, 2, 'Power Metal', 'power-metal', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (11, 2, 'Symphonic Metal', 'symphonic-metal', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (12, 2, 'Doom Metal', 'doom-metal', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');
INSERT INTO public."EventSubcategory" VALUES (13, 2, 'Progressive Metal', 'progressive-metal', NULL, NULL, NULL, '2025-10-16 16:20:08.859', '2025-10-16 16:20:08.859');


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Order" VALUES ('95ae0521-7e4a-41b8-82ee-a458e7c24f71', '68cecdafebd62af136cdfc92', 'evt-2025-075', 'loc-evt-2025-075-1', 1, 49.00, 0.00, 49.00, 'PENDING', NULL, NULL, NULL, 'voromb@hotmail.com', '2025-10-16 16:41:49.725', '2025-10-16 16:41:49.725', NULL);
INSERT INTO public."Order" VALUES ('548297bc-0645-4242-a0ef-b0677ffdad54', '68cecdafebd62af136cdfc92', 'evt-2025-075', 'loc-evt-2025-075-1', 1, 49.00, 0.00, 49.00, 'PENDING', NULL, NULL, NULL, 'voromb@hotmail.com', '2025-10-16 16:43:49.736', '2025-10-16 16:43:49.736', NULL);
INSERT INTO public."Order" VALUES ('774d728b-3f4a-4110-a46a-e410dfd8c322', '467a0b9f-5cd9-46b0-8905-621bc92a8664', 'evt-2025-076', 'loc-evt-2025-076-1', 2, 98.00, 0.00, 98.00, 'PAID', 'demo_session_774d728b-3f4a-4110-a46a-e410dfd8c322', NULL, NULL, 'admin@ticketing.com', '2025-10-16 16:40:05.413', '2025-10-16 16:45:18.792', '2025-10-16 16:45:18.79');
INSERT INTO public."Order" VALUES ('6a7090fa-3465-4208-b0b3-63dab539e6ce', '68cecdafebd62af136cdfc92', 'evt-2025-075', 'loc-evt-2025-075-1', 1, 49.00, 0.00, 49.00, 'PAID', 'demo_session_6a7090fa-3465-4208-b0b3-63dab539e6ce', NULL, NULL, 'voromb@hotmail.com', '2025-10-16 16:45:36.82', '2025-10-16 16:45:40.468', '2025-10-16 16:45:40.467');


--
-- Data for Name: PriceCategory; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Ticket; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Ticket" VALUES ('c84454b3-fec5-48fd-9970-c34d81450fe9', '774d728b-3f4a-4110-a46a-e410dfd8c322', 'evt-2025-076', 'loc-evt-2025-076-1', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '774d728b-3f4a-4110-a46a-e410dfd8c322-loc-evt-2025-076-1-1', 'QR-774d728b-3f4a-4110-a46a-e410dfd8c322-loc-evt-2025-076-1-1', 'VALID', NULL, '2025-10-16 16:40:05.439');
INSERT INTO public."Ticket" VALUES ('9a3f8f3f-30ca-4093-bfcc-78761b2cd077', '774d728b-3f4a-4110-a46a-e410dfd8c322', 'evt-2025-076', 'loc-evt-2025-076-1', '467a0b9f-5cd9-46b0-8905-621bc92a8664', '774d728b-3f4a-4110-a46a-e410dfd8c322-loc-evt-2025-076-1-2', 'QR-774d728b-3f4a-4110-a46a-e410dfd8c322-loc-evt-2025-076-1-2', 'VALID', NULL, '2025-10-16 16:40:05.439');
INSERT INTO public."Ticket" VALUES ('3bd9abab-a093-480b-bb8b-e99bad49e561', '95ae0521-7e4a-41b8-82ee-a458e7c24f71', 'evt-2025-075', 'loc-evt-2025-075-1', '68cecdafebd62af136cdfc92', '95ae0521-7e4a-41b8-82ee-a458e7c24f71-loc-evt-2025-075-1-1', 'QR-95ae0521-7e4a-41b8-82ee-a458e7c24f71-loc-evt-2025-075-1-1', 'VALID', NULL, '2025-10-16 16:41:49.729');
INSERT INTO public."Ticket" VALUES ('863cffc6-d142-4000-8242-0917bfa8f208', '548297bc-0645-4242-a0ef-b0677ffdad54', 'evt-2025-075', 'loc-evt-2025-075-1', '68cecdafebd62af136cdfc92', '548297bc-0645-4242-a0ef-b0677ffdad54-loc-evt-2025-075-1-1', 'QR-548297bc-0645-4242-a0ef-b0677ffdad54-loc-evt-2025-075-1-1', 'VALID', NULL, '2025-10-16 16:43:49.741');
INSERT INTO public."Ticket" VALUES ('ea83c487-06fc-46ab-b709-10e190dcf54a', '774d728b-3f4a-4110-a46a-e410dfd8c322', 'evt-2025-076', 'loc-evt-2025-076-1', '467a0b9f-5cd9-46b0-8905-621bc92a8664', 'TKT-1760633118803-1', 'TICKET-774d728b-3f4a-4110-a46a-e410dfd8c322-1', 'VALID', NULL, '2025-10-16 16:45:18.804');
INSERT INTO public."Ticket" VALUES ('bfc422d3-2eda-4842-bab6-385fec58919d', '774d728b-3f4a-4110-a46a-e410dfd8c322', 'evt-2025-076', 'loc-evt-2025-076-1', '467a0b9f-5cd9-46b0-8905-621bc92a8664', 'TKT-1760633118810-2', 'TICKET-774d728b-3f4a-4110-a46a-e410dfd8c322-2', 'VALID', NULL, '2025-10-16 16:45:18.812');
INSERT INTO public."Ticket" VALUES ('37b3079e-8130-421a-bb61-46b76590e8ff', '6a7090fa-3465-4208-b0b3-63dab539e6ce', 'evt-2025-075', 'loc-evt-2025-075-1', '68cecdafebd62af136cdfc92', '6a7090fa-3465-4208-b0b3-63dab539e6ce-loc-evt-2025-075-1-1', 'QR-6a7090fa-3465-4208-b0b3-63dab539e6ce-loc-evt-2025-075-1-1', 'VALID', NULL, '2025-10-16 16:45:36.826');
INSERT INTO public."Ticket" VALUES ('19940244-5dae-4561-a598-af49b3876cae', '6a7090fa-3465-4208-b0b3-63dab539e6ce', 'evt-2025-075', 'loc-evt-2025-075-1', '68cecdafebd62af136cdfc92', 'TKT-1760633140472-1', 'TICKET-6a7090fa-3465-4208-b0b3-63dab539e6ce-1', 'VALID', NULL, '2025-10-16 16:45:40.473');


--
-- Data for Name: Venue; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Venue" VALUES ('eedf995f-f060-4105-81b5-8b46dd58be37', 'Palau de les Arts', 'palau-de-les-arts', 1800, 'Av. del Professor L??pez Pi??ero 1', 'Valencia', NULL, 'Espa??a', '46013', NULL, NULL, 'Opera house de Valencia', '{parking,restaurante,tienda}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 17:06:42.338', '2025-09-26 17:06:42.338');
INSERT INTO public."Venue" VALUES ('uk-london-o2-arena', 'The O2 Arena', 'o2-arena-london', 20000, 'Peninsula Square', 'London', 'England', 'United Kingdom', 'SE10 0DX', 51.5033, -0.0031, 'Iconic arena hosting major rock and metal concerts', '{parking,restaurants,bars,merchandise,vip-lounges,accessibility}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9', 'Recinto Ferial Valencia Rock', 'recinto-ferial-valencia-rock', 15000, 'Av. de las Ferias s/n', 'Valencia', 'Valencia', 'Espa??a', '46035', NULL, NULL, 'Recinto al aire libre ideal para festivales de rock y metal', '{parking,food-trucks,merchandise-stands,security,medical-post}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:22:41.999', '2025-09-26 20:22:41.999');
INSERT INTO public."Venue" VALUES ('1156c683-d97e-4c3f-b5fe-70e28b5d9aaa', 'Test Venue', 'test-venue-simple', 1000, 'Test Address', 'Valencia', NULL, 'Espa??a', '46001', NULL, NULL, NULL, '{}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:26:57.007', '2025-09-26 20:26:57.007');
INSERT INTO public."Venue" VALUES ('6041a699-2a83-4518-b458-5db09b90c31a', 'Recinto Ferial Valencia Rock', 'recinto-ferial-valencia-rock-2024', 15000, 'Av. de las Ferias s/n', 'Valencia', 'Valencia', 'Espa??a', '46035', NULL, NULL, 'Recinto al aire libre ideal para festivales de rock y metal', '{parking,food-trucks,merchandise-stands,security,medical-post}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:29:14.471', '2025-09-26 20:29:14.471');
INSERT INTO public."Venue" VALUES ('56bcb5a9-59c0-4476-b69c-649acfec88d4', 'Sala Rockstar Valencia', 'sala-rockstar-valencia-2024', 2500, 'Calle del Rock 15', 'Valencia', 'Valencia', 'Espa??a', '46001', NULL, NULL, 'Sala especializada en conciertos de rock y metal con excelente ac??stica', '{bar,merchandise,coat-check,professional-sound,stage-lighting}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:29:16.527', '2025-09-26 20:29:16.527');
INSERT INTO public."Venue" VALUES ('uk-london-roundhouse', 'Roundhouse', 'roundhouse-london', 3300, 'Chalk Farm Road', 'London', 'England', 'United Kingdom', 'NW1 8EH', 51.5434, -0.152, 'Historic venue known for legendary rock performances', '{bar,accessibility,standing-area,balcony}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('uk-london-electric-ballroom', 'Electric Ballroom', 'electric-ballroom-london', 1500, '184 Camden High St', 'London', 'England', 'United Kingdom', 'NW1 8QP', 51.5404, -0.1431, 'Legendary Camden venue for rock and punk concerts', '{bar,coat-check,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('uk-manchester-arena', 'AO Arena', 'ao-arena-manchester', 21000, 'Victoria Station', 'Manchester', 'England', 'United Kingdom', 'M3 1AR', 53.4881, -2.2447, 'One of Europe''s largest indoor arenas', '{parking,restaurants,bars,merchandise,vip-areas}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('uk-manchester-academy', 'Manchester Academy', 'manchester-academy', 2600, 'Oxford Road', 'Manchester', 'England', 'United Kingdom', 'M13 9PR', 53.4665, -2.2324, 'Multi-room venue for rock and alternative music', '{bar,accessibility,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('uk-glasgow-barrowland', 'Barrowland Ballroom', 'barrowland-glasgow', 2100, 'Gallowgate', 'Glasgow', 'Scotland', 'United Kingdom', 'G4 0TS', 55.8542, -4.2324, 'Legendary venue with iconic neon sign', '{bar,accessibility,standing-area}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('fr-paris-accor-arena', 'Accor Arena', 'accor-arena-paris', 20300, 'Boulevard de Bercy', 'Paris', '??le-de-France', 'France', '75012', 48.8395, 2.379, 'Major arena for international rock tours', '{parking,restaurants,bars,merchandise,vip-lounges}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('fr-paris-olympia', 'L''Olympia', 'olympia-paris', 2000, '28 Boulevard des Capucines', 'Paris', '??le-de-France', 'France', '75009', 48.87, 2.3275, 'Historic music hall hosting rock legends', '{bar,accessibility,seating}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('fr-paris-bataclan', 'Le Bataclan', 'bataclan-paris', 1500, '50 Boulevard Voltaire', 'Paris', '??le-de-France', 'France', '75011', 48.8632, 2.3714, 'Iconic venue for rock and alternative music', '{bar,merchandise,standing-area}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('fr-lyon-halle-tony-garnier', 'Halle Tony Garnier', 'halle-tony-garnier-lyon', 17000, '20 Place Antonin Perrin', 'Lyon', 'Auvergne-Rh??ne-Alpes', 'France', '69007', 45.7343, 4.8271, 'Large concert hall for major rock events', '{parking,bars,merchandise,accessibility}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('de-berlin-mercedes-benz-arena', 'Mercedes-Benz Arena', 'mercedes-benz-arena-berlin', 17000, 'Mercedes-Platz', 'Berlin', 'Berlin', 'Germany', '10243', 52.5064, 13.4437, 'Modern arena hosting international rock acts', '{parking,restaurants,bars,merchandise,vip}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('de-berlin-columbiahalle', 'Columbiahalle', 'columbiahalle-berlin', 3500, 'Columbiadamm', 'Berlin', 'Berlin', 'Germany', '10965', 52.4825, 13.3987, 'Popular venue for rock and metal concerts', '{bar,merchandise,coat-check}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('de-munich-olympiahalle', 'Olympiahalle', 'olympiahalle-munich', 15500, 'Spiridon-Louis-Ring', 'Munich', 'Bavaria', 'Germany', '80809', 48.1743, 11.5517, 'Olympic venue hosting major concerts', '{parking,restaurants,bars,accessibility}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('de-munich-backstage', 'Backstage', 'backstage-munich', 1200, 'Reitknechtstra??e', 'Munich', 'Bavaria', 'Germany', '80639', 48.1448, 11.5261, 'Alternative venue for underground rock and metal', '{bar,outdoor-area,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('de-hamburg-barclays-arena', 'Barclays Arena', 'barclays-arena-hamburg', 16000, 'Sylvesterallee', 'Hamburg', 'Hamburg', 'Germany', '22525', 53.5873, 9.899, 'Multi-purpose arena for concerts and events', '{parking,restaurants,bars,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('it-rome-palalottomatica', 'Palazzo dello Sport', 'palalottomatica-rome', 11000, 'Piazzale dello Sport', 'Rome', 'Lazio', 'Italy', '00144', 41.8318, 12.4673, 'Major indoor arena for concerts in Rome', '{parking,bars,merchandise,accessibility}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('it-rome-atlantico', 'Atlantico Live', 'atlantico-rome', 1800, 'Viale dell''Oceano Atlantico', 'Rome', 'Lazio', 'Italy', '00144', 41.8329, 12.4687, 'Popular venue for rock and alternative concerts', '{bar,merchandise,standing-area}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('it-milan-mediolanum-forum', 'Mediolanum Forum', 'mediolanum-forum-milan', 12700, 'Via G. di Vittorio', 'Milan', 'Lombardy', 'Italy', '20090', 45.4836, 9.1236, 'Premier concert venue in Milan', '{parking,restaurants,bars,merchandise,vip}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('it-milan-alcatraz', 'Alcatraz', 'alcatraz-milan', 3000, 'Via Valtellina', 'Milan', 'Lombardy', 'Italy', '20159', 45.499, 9.1898, 'Historic venue for rock and metal shows', '{bar,merchandise,coat-check}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('nl-amsterdam-ziggo-dome', 'Ziggo Dome', 'ziggo-dome-amsterdam', 17000, 'De Passage', 'Amsterdam', 'North Holland', 'Netherlands', '1101 AX', 52.3138, 4.9389, 'Modern arena hosting major international tours', '{parking,restaurants,bars,merchandise,vip}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('nl-amsterdam-melkweg', 'Melkweg', 'melkweg-amsterdam', 1500, 'Lijnbaansgracht', 'Amsterdam', 'North Holland', 'Netherlands', '1017 CW', 52.3644, 4.8819, 'Legendary venue for alternative and rock music', '{bar,cafe,merchandise,gallery}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('nl-amsterdam-paradiso', 'Paradiso', 'paradiso-amsterdam', 1500, 'Weteringschans', 'Amsterdam', 'North Holland', 'Netherlands', '1017 SG', 52.3619, 4.883, 'Historic church converted into music venue', '{bar,balcony,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('be-brussels-forest-national', 'Forest National', 'forest-national-brussels', 8500, 'Avenue Victor Rousseau', 'Brussels', 'Brussels-Capital', 'Belgium', '1190', 50.8108, 4.3182, 'Major concert hall in Brussels', '{parking,bars,merchandise,accessibility}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('be-brussels-ancienne-belgique', 'Ancienne Belgique', 'ancienne-belgique-brussels', 2000, 'Boulevard Anspach', 'Brussels', 'Brussels-Capital', 'Belgium', '1000', 50.85, 4.3487, 'Historic venue for rock and alternative music', '{bar,multiple-rooms,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('pt-lisbon-altice-arena', 'Altice Arena', 'altice-arena-lisbon', 20000, 'Rossio dos Olivais', 'Lisbon', 'Lisbon', 'Portugal', '1990-231', 38.7683, -9.0948, 'Largest indoor arena in Portugal', '{parking,restaurants,bars,merchandise,vip}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('pt-lisbon-lav', 'LAV - Lisboa ao Vivo', 'lav-lisbon', 2500, 'Rua A??ores', 'Lisbon', 'Lisbon', 'Portugal', '1000-003', 38.7223, -9.1393, 'Modern venue for rock and metal concerts', '{bar,merchandise,parking}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('pt-porto-coliseu', 'Coliseu do Porto', 'coliseu-porto', 3200, 'Rua de Passos Manuel', 'Porto', 'Porto', 'Portugal', '4000-385', 41.1496, -8.6069, 'Historic venue with excellent acoustics', '{bar,seating,accessibility,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('at-vienna-stadthalle', 'Wiener Stadthalle', 'stadthalle-vienna', 16000, 'Vogelweidplatz', 'Vienna', 'Vienna', 'Austria', '1150', 48.2027, 16.3352, 'Multi-purpose venue for major concerts', '{parking,restaurants,bars,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('at-vienna-gasometer', 'Gasometer', 'gasometer-vienna', 3500, 'Guglgasse', 'Vienna', 'Vienna', 'Austria', '1110', 48.1852, 16.4208, 'Converted gasometer hosting rock concerts', '{bar,merchandise,unique-architecture}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('ch-zurich-hallenstadion', 'Hallenstadion', 'hallenstadion-zurich', 13000, 'Wallisellenstrasse', 'Zurich', 'Zurich', 'Switzerland', '8050', 47.4109, 8.5498, 'Major arena for international rock tours', '{parking,restaurants,bars,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('se-stockholm-ericsson-globe', 'Avicii Arena', 'avicii-arena-stockholm', 16000, 'Globentorget', 'Stockholm', 'Stockholm', 'Sweden', '121 77', 59.2936, 18.0839, 'Iconic spherical arena for major concerts', '{parking,restaurants,bars,merchandise,vip}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('no-oslo-spektrum', 'Oslo Spektrum', 'oslo-spektrum', 9700, 'Sonja Henies plass', 'Oslo', 'Oslo', 'Norway', '0185', 59.9127, 10.756, 'Premier concert venue in Norway', '{parking,bars,merchandise,accessibility}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('dk-copenhagen-royal-arena', 'Royal Arena', 'royal-arena-copenhagen', 16000, 'Hannemanns All??', 'Copenhagen', 'Capital Region', 'Denmark', '2300', 55.635, 12.5773, 'Modern multi-purpose arena', '{parking,restaurants,bars,merchandise,vip}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('cz-prague-o2-arena', 'O2 Arena Prague', 'o2-arena-prague', 18000, '??eskomoravsk??', 'Prague', 'Prague', 'Czech Republic', '190 00', 50.1032, 14.4749, 'Largest arena in Czech Republic', '{parking,restaurants,bars,merchandise,vip}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('pl-warsaw-torwar', 'Torwar Hall', 'torwar-warsaw', 4800, '??azienkowska', 'Warsaw', 'Mazovia', 'Poland', '00-449', 52.2189, 21.037, 'Historic venue for rock concerts', '{parking,bar,merchandise}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('gr-athens-oaka', 'Olympic Indoor Hall', 'oaka-athens', 18000, 'Leof. Spyrou Loui', 'Athens', 'Attica', 'Greece', '151 23', 38.0366, 23.7847, 'Olympic venue hosting major concerts', '{parking,bars,merchandise,accessibility}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:51.692', '2025-10-07 17:22:51.692');
INSERT INTO public."Venue" VALUES ('es-madrid-wizink-center', 'WiZink Center', 'wizink-center-madrid', 17000, 'Avenida Felipe II s/n', 'Madrid', 'Madrid', 'Espa??a', '28009', 40.4222, -3.6692, 'Principal recinto cubierto de Madrid para grandes conciertos', '{parking,restaurantes,bares,tienda,vip,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-madrid-la-riviera', 'Sala La Riviera', 'la-riviera-madrid', 2500, 'Paseo Bajo de la Virgen del Puerto s/n', 'Madrid', 'Madrid', 'Espa??a', '28005', 40.4148, -3.722, 'Sala m??tica de Madrid con terraza exterior', '{bar,terraza,guardarropa,tienda}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-madrid-but', 'Sala But', 'but-madrid', 1200, 'Calle de Barcel?? 11', 'Madrid', 'Madrid', 'Espa??a', '28004', 40.4286, -3.7013, 'Sala alternativa en el coraz??n de Madrid', '{bar,guardarropa,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-madrid-moby-dick', 'Sala Moby Dick', 'moby-dick-madrid', 900, 'Avenida de Brasil 5', 'Madrid', 'Madrid', 'Espa??a', '28020', 40.4565, -3.6927, 'Referente del rock en Madrid desde hace d??cadas', '{bar,aire-acondicionado,sonido-profesional}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-madrid-arena', 'Madrid Arena', 'madrid-arena', 12000, 'Avenida de Portugal s/n', 'Madrid', 'Madrid', 'Espa??a', '28011', 40.3986, -3.7539, 'Gran pabell??n para festivales y macroconciertos', '{parking,bares,food-trucks,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-vigo-pazo-cultura', 'Pazo da Cultura', 'pazo-cultura-vigo', 1500, 'R??a V??zquez Varela s/n', 'Vigo', 'Galicia', 'Espa??a', '36201', 42.2328, -8.7119, 'Centro cultural con sala de conciertos', '{parking,bar,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-barcelona-palau-sant-jordi', 'Palau Sant Jordi', 'palau-sant-jordi-barcelona', 17000, 'Passeig Ol??mpic 5-7', 'Barcelona', 'Catalu??a', 'Espa??a', '08038', 41.3647, 2.1532, 'Emblem??tico pabell??n ol??mpico para grandes conciertos', '{parking,restaurantes,bares,tienda,vip}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-barcelona-razzmatazz', 'Sala Razzmatazz', 'razzmatazz-barcelona', 3000, 'Carrer dels Almog??vers 122', 'Barcelona', 'Catalu??a', 'Espa??a', '08018', 41.3959, 2.1911, 'Complejo con 5 salas para todo tipo de conciertos', '{bar,multiple-salas,guardarropa,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-barcelona-apolo', 'Sala Apolo', 'apolo-barcelona', 1600, 'Carrer Nou de la Rambla 113', 'Barcelona', 'Catalu??a', 'Espa??a', '08004', 41.3742, 2.1683, 'Hist??rica sala de conciertos en el Paral??lel', '{bar,terraza,disco,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-barcelona-bikini', 'Sala Bikini', 'bikini-barcelona', 900, 'Avinguda Diagonal 547', 'Barcelona', 'Catalu??a', 'Espa??a', '08029', 41.388, 2.1341, 'Cl??sico barcelon??s desde los a??os 50', '{bar,terraza,parking,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-barcelona-sant-jordi-club', 'Sant Jordi Club', 'sant-jordi-club-barcelona', 4500, 'Passeig Ol??mpic 5-7', 'Barcelona', 'Catalu??a', 'Espa??a', '08038', 41.3645, 2.1528, 'Sala vers??til junto al Palau Sant Jordi', '{parking,bar,merchandising,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-sevilla-cartuja-center', 'Cartuja Center', 'cartuja-center-sevilla', 7000, 'Camino de los Descubrimientos s/n', 'Sevilla', 'Andaluc??a', 'Espa??a', '41092', 37.4042, -5.9978, 'Complejo para eventos y conciertos en La Cartuja', '{parking,bares,restaurantes,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-sevilla-custom', 'Sala Custom', 'custom-sevilla', 1200, 'Calle Matem??ticos Rey Pastor y Castro 1', 'Sevilla', 'Andaluc??a', 'Espa??a', '41092', 37.4078, -5.9943, 'Referente del rock y metal en Sevilla', '{bar,parking,aire-acondicionado}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-bilbao-bizkaia-arena', 'Bizkaia Arena', 'bizkaia-arena-bilbao', 18640, 'Ronda de Azkue 1', 'Bilbao', 'Pa??s Vasco', 'Espa??a', '48902', 43.301, -2.9459, 'Mayor recinto cubierto del Pa??s Vasco', '{parking,restaurantes,bares,tienda,vip}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-bilbao-kafe-antzokia', 'Kafe Antzokia', 'kafe-antzokia-bilbao', 1500, 'Calle San Vicente 2', 'Bilbao', 'Pa??s Vasco', 'Espa??a', '48001', 43.2582, -2.9264, 'Emblem??tica sala de rock en el Casco Viejo', '{bar,restaurante,terraza,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-zaragoza-pabellon-principe-felipe', 'Pabell??n Pr??ncipe Felipe', 'pabellon-principe-felipe-zaragoza', 10800, 'Eduardo Ibarra 5', 'Zaragoza', 'Arag??n', 'Espa??a', '50009', 41.6324, -0.9096, 'Principal pabell??n para conciertos en Zaragoza', '{parking,bar,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-zaragoza-sala-lopez', 'Sala L??pez', 'sala-lopez-zaragoza', 800, 'Calle Ponzano 7', 'Zaragoza', 'Arag??n', 'Espa??a', '50003', 41.6496, -0.8876, 'M??tica sala de rock zaragozana', '{bar,guardarropa}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-malaga-martin-carpena', 'Palacio de Deportes Mart??n Carpena', 'martin-carpena-malaga', 11300, 'Paseo Martiricos 14', 'M??laga', 'Andaluc??a', 'Espa??a', '29011', 36.7159, -4.4396, 'Principal recinto para grandes eventos en M??laga', '{parking,bares,restaurantes,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-malaga-trinchera', 'Sala La Trinchera', 'la-trinchera-malaga', 600, 'Plaza de la Solidaridad 10', 'M??laga', 'Andaluc??a', 'Espa??a', '29002', 36.7167, -4.4201, 'Sala underground para rock y metal', '{bar,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-murcia-garaje-beat', 'Sala Garaje Beat Club', 'garaje-beat-murcia', 750, 'Calle Universidad 8', 'Murcia', 'Murcia', 'Espa??a', '30001', 37.9886, -1.1299, 'Referente del rock alternativo en Murcia', '{bar,terraza,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-alicante-plaza-toros', 'Plaza de Toros de Alicante', 'plaza-toros-alicante', 15000, 'Plaza de Espa??a s/n', 'Alicante', 'Comunidad Valenciana', 'Espa??a', '03001', 38.3453, -0.4897, 'Plaza de toros adaptada para festivales de rock', '{parking,bares,food-trucks}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-alicante-the-music-republic', 'The Music Republic', 'the-music-republic-alicante', 1000, 'Calle San Fernando 51', 'Alicante', 'Comunidad Valenciana', 'Espa??a', '03001', 38.3436, -0.4907, 'Sala moderna para rock y m??sica alternativa', '{bar,terraza,aire-acondicionado}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-palma-son-fusteret', 'Vel??dromo Son Fusteret', 'son-fusteret-palma', 6000, 'Carrer de Gremi Corredors 16', 'Palma de Mallorca', 'Islas Baleares', 'Espa??a', '07009', 39.5836, 2.6503, 'Vel??dromo adaptado para conciertos al aire libre', '{parking,bar,food-trucks}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-palma-es-gremi', 'Es Gremi', 'es-gremi-palma', 800, 'Carrer de Gremi de Teixidors 26', 'Palma de Mallorca', 'Islas Baleares', 'Espa??a', '07009', 39.5842, 2.6489, 'Sala de referencia para rock en Palma', '{bar,merchandising,parking}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-laspalmas-gran-canaria-arena', 'Gran Canaria Arena', 'gran-canaria-arena', 11000, 'Calle Fondos de Segura s/n', 'Las Palmas de Gran Canaria', 'Canarias', 'Espa??a', '35019', 28.0996, -15.4537, 'Principal recinto cubierto de Canarias', '{parking,restaurantes,bares,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-valladolid-lava', 'Sala Lava', 'lava-valladolid', 900, 'Calle San Quirce 10', 'Valladolid', 'Castilla y Le??n', 'Espa??a', '47004', 41.6516, -4.7302, 'Sala de rock en el centro de Valladolid', '{bar,guardarropa,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-granada-industrial-copera', 'Industrial Copera', 'industrial-copera-granada', 2500, 'Camino de Purchil s/n', 'Granada', 'Andaluc??a', 'Espa??a', '18004', 37.1529, -3.6087, 'Espacio industrial para conciertos y festivales', '{parking,bar,food-trucks,terraza}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-granada-planta-baja', 'Sala Planta Baja', 'planta-baja-granada', 600, 'Calle Horno de Abad 11', 'Granada', 'Andaluc??a', 'Espa??a', '18002', 37.1739, -3.5974, 'Sala alternativa en pleno centro', '{bar,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-gijon-plaza-toros', 'Plaza de Toros El Bibio', 'el-bibio-gijon', 12000, 'Camino de la Providencia s/n', 'Gij??n', 'Asturias', 'Espa??a', '33203', 43.5365, -5.6371, 'Plaza convertida en espacio para festivales', '{parking,bares,food-trucks}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-santander-escenario-santander', 'Escenario Santander', 'escenario-santander', 3000, 'Campa de la Magdalena s/n', 'Santander', 'Cantabria', 'Espa??a', '39005', 43.4623, -3.7894, 'Escenario al aire libre junto a la bah??a', '{parking,bar,vistas-mar}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-donostia-kursaal', 'Auditorio Kursaal', 'kursaal-donostia', 1800, 'Avenida de Zurriola 1', 'San Sebasti??n', 'Pa??s Vasco', 'Espa??a', '20002', 43.3228, -1.9764, 'Ic??nico auditorio con vistas al mar', '{parking,restaurante,bar,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-donostia-dabadaba', 'Sala Dabadaba', 'dabadaba-donostia', 800, 'Paseo de Salamanca 3', 'San Sebasti??n', 'Pa??s Vasco', 'Espa??a', '20003', 43.3158, -1.9854, 'Sala de referencia para m??sica alternativa', '{bar,terraza,merchandising}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-pamplona-baluarte', 'Palacio de Congresos Baluarte', 'baluarte-pamplona', 2200, 'Plaza del Baluarte s/n', 'Pamplona', 'Navarra', 'Espa??a', '31002', 42.817, -1.6396, 'Palacio de congresos con sala de conciertos', '{parking,bar,restaurante,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-santiago-sala-capitol', 'Sala Capitol', 'sala-capitol-santiago', 1600, 'R??a do H??rreo 1', 'Santiago de Compostela', 'Galicia', 'Espa??a', '15702', 42.8782, -8.5448, 'Sala multiusos para conciertos y eventos', '{parking,bar,guardarropa}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-cordoba-palacio-congresos', 'Palacio de Congresos de C??rdoba', 'palacio-congresos-cordoba', 2500, 'Calle Torrijos 10', 'C??rdoba', 'Andaluc??a', 'Espa??a', '14003', 37.881, -4.7792, 'Centro de congresos para eventos musicales', '{parking,restaurante,bar,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-coruna-coliseum', 'Coliseum da Coru??a', 'coliseum-coruna', 10500, 'Calle de la Torre de H??rcules s/n', 'A Coru??a', 'Galicia', 'Espa??a', '15002', 43.3623, -8.4115, 'Gran pabell??n para conciertos y eventos', '{parking,bar,restaurante,accesibilidad}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('es-oviedo-principe-felipe', 'Auditorio Pr??ncipe Felipe', 'principe-felipe-oviedo', 2200, 'Calle Severo Ochoa s/n', 'Oviedo', 'Asturias', 'Espa??a', '33006', 43.3553, -5.868, 'Auditorio moderno para todo tipo de eventos', '{parking,bar,accesibilidad,restaurante}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-10-07 17:22:56.928', '2025-10-07 17:22:56.928');
INSERT INTO public."Venue" VALUES ('001baa5a-7e6c-4561-8aa3-d154f74b6503', 'Teatro Principal Valencia', 'teatro-principal-valencia', 1500, 'Calle Mayor 1', 'Valencia', 'Valencia', 'Espa??a', '46001', NULL, NULL, 'Teatro hist??rico renovado en 2024, ubicado en el coraz??n de Valencia', '{parking,wifi,accesibilidad,cafeteria,restaurante}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 17:05:01.928', '2025-09-26 17:06:22.435');
INSERT INTO public."Venue" VALUES ('8d03b434-20a7-46a6-b5c9-76e98fe7e9a0', 'Sala Rockstar Valencia', 'sala-rockstar-valencia', 2500, 'Calle del Rock 15', 'Valencia', 'Valencia', 'Espa??a', '46001', NULL, NULL, 'Sala especializada en conciertos de rock y metal con excelente ac??stica', '{bar,merchandise,coat-check,professional-sound,stage-lighting}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:22:44.081', '2025-09-26 20:22:44.081');
INSERT INTO public."Venue" VALUES ('a09c3413-4b8e-4605-bf25-7601292e93c1', 'Metal Underground Club', 'metal-underground-club', 800, 'Calle Subterr??nea 7', 'Valencia', 'Valencia', 'Espa??a', '46002', NULL, NULL, 'Club ??ntimo perfecto para tributos, ac??sticos y bandas emergentes', '{bar,stage,sound-system,intimate-atmosphere}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:22:46.14', '2025-09-26 20:22:46.14');
INSERT INTO public."Venue" VALUES ('f794e6f0-28c4-4512-ab20-1954720ea984', 'Metal Underground Club', 'metal-underground-club-2024', 800, 'Calle Subterr??nea 7', 'Valencia', 'Valencia', 'Espa??a', '46002', NULL, NULL, 'Club ??ntimo perfecto para tributos, ac??sticos y bandas emergentes', '{bar,stage,sound-system,intimate-atmosphere}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-26 20:29:18.582', '2025-09-26 20:29:18.582');
INSERT INTO public."Venue" VALUES ('e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e', 'Metal Cave Club', 'metal-cave-club-valencia', 600, 'Calle Underground 13', 'Valencia', 'Valencia', 'Espa??a', '46003', NULL, NULL, 'Club underground ??ntimo para bandas de metal emergentes', '{bar,stage,sound-system,intimate-atmosphere}', '{}', true, '467a0b9f-5cd9-46b0-8905-621bc92a8664', '2025-09-27 12:26:04.252', '2025-09-27 12:26:04.252');
INSERT INTO public."Venue" VALUES ('aedfb2d3-7fac-40c2-be1a-f535177ae72c', 'Pla??a de Dalt', 'placa-de-dalt', 10000, 'c/dos', 'Agullent', NULL, 'Espa??a', '46001', NULL, NULL, NULL, '{parking,bar}', '{}', true, '26fa8809-a1a4-4242-9d09-42e65e5ee368', '2025-09-27 17:53:13.626', '2025-09-27 17:53:13.626');
INSERT INTO public."Venue" VALUES ('ed18fb98-1c7f-4859-8f5c-3f3e099cebd3', 'Pla??a de Baix', 'placa-de-baix', 100000, 'C/ una dos tres', 'Ontinyent', NULL, 'Espa??a', '46001', NULL, NULL, NULL, '{parking,bar}', '{}', true, '26fa8809-a1a4-4242-9d09-42e65e5ee368', '2025-09-27 17:41:44.671', '2025-09-27 18:10:14.797');


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

INSERT INTO public._prisma_migrations VALUES ('ad18573c-c146-4437-8a2b-8a12d1cd73c0', 'e1f235a5669904506d07feb2d86fa8980ccc379acb54e7d43be16a1ca8424372', '2025-10-16 15:39:03.089283+00', '0_init', NULL, NULL, '2025-10-16 15:39:02.839804+00', 1);
INSERT INTO public._prisma_migrations VALUES ('cb808f65-6356-426e-9b25-3feab51e08c7', '0cebc5e03fc37b6bd44e572132fc8eb7a490220fa1691b55320fdbfefc7ab964', '2025-09-26 16:41:22.071688+00', '20250926164121_init', NULL, NULL, '2025-09-26 16:41:21.987983+00', 1);
INSERT INTO public._prisma_migrations VALUES ('1c982ab0-0781-4394-b9be-2e956a5b6177', 'c50c639dc1a9b9079f194a1fd3d77080832bb6da27a123aa663620c11ff76830', '2025-09-26 17:39:04.533668+00', '20250926173904_add_rock_metal_fields', NULL, NULL, '2025-09-26 17:39:04.525378+00', 1);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.admins VALUES ('ac9a65b3-2fd5-4573-bf28-c016f92bb9cb', 'super@admin.com', '$2b$10$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC', 'Super', 'Admin', 'SUPER_ADMIN', true, NULL, '2025-09-26 16:41:41.502', '2025-09-26 16:41:41.502');
INSERT INTO public.admins VALUES ('467a0b9f-5cd9-46b0-8905-621bc92a8664', 'admin@ticketing.com', '$2b$10$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC', 'Admin', 'User', 'ADMIN', true, NULL, '2025-09-26 16:41:41.502', '2025-09-26 16:41:41.502');
INSERT INTO public.admins VALUES ('26fa8809-a1a4-4242-9d09-42e65e5ee368', 'voro.super@ticketing.com', '$2b$10$zN5zpSTorCYjQvmlL4xfbO5ldb3Dtd1ReISxEGzIE6wMdAO.1B4/a', 'Voro', 'SuperAdmin', 'SUPER_ADMIN', true, NULL, '2025-09-27 15:27:15.819', '2025-09-27 15:27:15.819');


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
-- Name: EventCategory EventCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventCategory"
    ADD CONSTRAINT "EventCategory_pkey" PRIMARY KEY (id);


--
-- Name: EventLocality EventLocality_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventLocality"
    ADD CONSTRAINT "EventLocality_pkey" PRIMARY KEY (id);


--
-- Name: EventSubcategory EventSubcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventSubcategory"
    ADD CONSTRAINT "EventSubcategory_pkey" PRIMARY KEY (id);


--
-- Name: EventSubcategory EventSubcategory_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventSubcategory"
    ADD CONSTRAINT "EventSubcategory_slug_key" UNIQUE (slug);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PriceCategory PriceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PriceCategory"
    ADD CONSTRAINT "PriceCategory_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: Ticket Ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY (id);


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
-- Name: EventCategory_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "EventCategory_name_key" ON public."EventCategory" USING btree (name);


--
-- Name: EventCategory_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EventCategory_slug_idx" ON public."EventCategory" USING btree (slug);


--
-- Name: EventCategory_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "EventCategory_slug_key" ON public."EventCategory" USING btree (slug);


--
-- Name: EventLocality_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EventLocality_eventId_idx" ON public."EventLocality" USING btree ("eventId");


--
-- Name: EventLocality_eventId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "EventLocality_eventId_name_key" ON public."EventLocality" USING btree ("eventId", name);


--
-- Name: EventLocality_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EventLocality_isActive_idx" ON public."EventLocality" USING btree ("isActive");


--
-- Name: EventSubcategory_category_id_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "EventSubcategory_category_id_name_key" ON public."EventSubcategory" USING btree (category_id, name);


--
-- Name: EventSubcategory_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EventSubcategory_slug_idx" ON public."EventSubcategory" USING btree (slug);


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
-- Name: Order_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_eventId_idx" ON public."Order" USING btree ("eventId");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_stripeSessionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_stripeSessionId_idx" ON public."Order" USING btree ("stripeSessionId");


--
-- Name: Order_stripeSessionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON public."Order" USING btree ("stripeSessionId");


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: PriceCategory_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PriceCategory_eventId_idx" ON public."PriceCategory" USING btree ("eventId");


--
-- Name: PriceCategory_eventId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PriceCategory_eventId_name_key" ON public."PriceCategory" USING btree ("eventId", name);


--
-- Name: Reservation_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Reservation_eventId_idx" ON public."Reservation" USING btree ("eventId");


--
-- Name: Reservation_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Reservation_expiresAt_idx" ON public."Reservation" USING btree ("expiresAt");


--
-- Name: Reservation_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Reservation_status_idx" ON public."Reservation" USING btree (status);


--
-- Name: Reservation_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Reservation_userId_idx" ON public."Reservation" USING btree ("userId");


--
-- Name: Ticket_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ticket_orderId_idx" ON public."Ticket" USING btree ("orderId");


--
-- Name: Ticket_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ticket_status_idx" ON public."Ticket" USING btree (status);


--
-- Name: Ticket_ticketCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ticket_ticketCode_idx" ON public."Ticket" USING btree ("ticketCode");


--
-- Name: Ticket_ticketCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Ticket_ticketCode_key" ON public."Ticket" USING btree ("ticketCode");


--
-- Name: Ticket_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Ticket_userId_idx" ON public."Ticket" USING btree ("userId");


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
-- Name: EventLocality EventLocality_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EventLocality"
    ADD CONSTRAINT "EventLocality_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: Order Order_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_localityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES public."EventLocality"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public."Reservation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: Reservation Reservation_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reservation Reservation_localityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES public."EventLocality"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Ticket Ticket_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Ticket Ticket_localityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES public."EventLocality"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Ticket Ticket_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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

\unrestrict BeLTiB4IKxJDQyLqwBwFGdMEaoZfxTCGsXFQ1UAgWy0P7H6oEtx1yteOQb7Pagi

