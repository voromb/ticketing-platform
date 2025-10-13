--
-- PostgreSQL database dump
--

\restrict bACG1bjYM8IIaXTuXXD0v8SqnfREPDC2QyPInIt8Rz40x9WgVj14bXt4QWRozra

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


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
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO admin;

--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."ReservationStatus" OWNER TO admin;

--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'VALID',
    'USED',
    'CANCELLED',
    'EXPIRED'
);


ALTER TYPE public."TicketStatus" OWNER TO admin;

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


ALTER TABLE public."Event" OWNER TO admin;

--
-- Name: EventCategory; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."EventCategory" (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."EventCategory" OWNER TO admin;

--
-- Name: EventCategory_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."EventCategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."EventCategory_id_seq" OWNER TO admin;

--
-- Name: EventCategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."EventCategory_id_seq" OWNED BY public."EventCategory".id;


--
-- Name: EventLocality; Type: TABLE; Schema: public; Owner: admin
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


ALTER TABLE public."EventLocality" OWNER TO admin;

--
-- Name: EventSubcategory; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."EventSubcategory" (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."EventSubcategory" OWNER TO admin;

--
-- Name: EventSubcategory_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."EventSubcategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."EventSubcategory_id_seq" OWNER TO admin;

--
-- Name: EventSubcategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."EventSubcategory_id_seq" OWNED BY public."EventSubcategory".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: admin
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


ALTER TABLE public."Order" OWNER TO admin;

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
-- Name: Reservation; Type: TABLE; Schema: public; Owner: admin
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


ALTER TABLE public."Reservation" OWNER TO admin;

--
-- Name: Ticket; Type: TABLE; Schema: public; Owner: admin
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


ALTER TABLE public."Ticket" OWNER TO admin;

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
-- Name: EventCategory id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EventCategory" ALTER COLUMN id SET DEFAULT nextval('public."EventCategory_id_seq"'::regclass);


--
-- Name: EventSubcategory id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EventSubcategory" ALTER COLUMN id SET DEFAULT nextval('public."EventSubcategory_id_seq"'::regclass);


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."AuditLog" (id, "tableName", "recordId", action, "fieldName", "oldValue", "newValue", "adminId", "eventId", "ipAddress", "userAgent", "sessionId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Event" (id, name, description, slug, status, "eventDate", "doorsOpenTime", "saleStartDate", "saleEndDate", "venueId", "totalCapacity", "availableTickets", "reservedTickets", "soldTickets", tags, "bannerImage", "thumbnailImage", images, "minPrice", "maxPrice", "ageRestriction", "createdById", "createdAt", "updatedAt", "publishedAt", "cancelledAt", "completedAt", metadata, category_id, subcategory_id) FROM stdin;
3719c30b-403b-4ba9-8cdc-cd565fc65c86	Valencia Rock Night	Concierto de rock cl├ísico en Valencia	valencia-rock-night	ACTIVE	2025-11-10 20:00:00	\N	2025-09-01 10:00:00	2025-11-09 23:59:59	001baa5a-7e6c-4561-8aa3-d154f74b6503	1200	1200	0	0	\N	\N	\N	\N	25.00	60.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	1	1
2559299a-e517-4c85-8501-fccf596863ed	Metal Explosion	Festival de heavy metal con 5 bandas	metal-explosion	ACTIVE	2025-12-01 21:00:00	\N	2025-10-01 10:00:00	2025-11-30 23:59:59	8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	2200	2200	0	0	\N	\N	\N	\N	30.00	90.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	6
fe1932b8-ef55-4957-83c6-d14b86413e3a	Symphonic Metal Night	Noche de metal sinf├│nico con orquesta en vivo	symphonic-metal-night	ACTIVE	2025-12-15 20:30:00	\N	2025-10-15 10:00:00	2025-12-14 23:59:59	eedf995f-f060-4105-81b5-8b46dd58be37	1800	1800	0	0	\N	\N	\N	\N	40.00	120.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	11
39930e46-a60b-49ab-aa82-16e1b309ed12	Thrash Attack	Concierto de thrash metal en el recinto ferial	thrash-attack	ACTIVE	2025-11-20 20:00:00	\N	2025-09-10 10:00:00	2025-11-19 23:59:59	8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	15000	15000	0	0	\N	\N	\N	\N	20.00	70.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	7
c7c68ffa-8469-498d-86c3-44f449e0e52b	Classic Rock Legends	Tributo a las leyendas del rock cl├ísico	classic-rock-legends	ACTIVE	2025-10-05 20:00:00	\N	2025-08-01 10:00:00	2025-10-04 23:59:59	001baa5a-7e6c-4561-8aa3-d154f74b6503	1500	1500	0	0	\N	\N	\N	\N	35.00	90.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	1	1
52bf7140-39a8-4893-a3fb-da38ca35ad9d	Doom Fest	Festival de doom metal en la sala Rockstar	doom-fest	ACTIVE	2025-12-05 22:00:00	\N	2025-09-20 10:00:00	2025-12-04 23:59:59	8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	2500	2500	0	0	\N	\N	\N	\N	28.00	75.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	12
5e53b4c1-9787-403d-81d7-af96f94ed886	Rock Fest Agullent	Festival de rock en la Pla├ºa de Dalt	rock-fest-agullent	ACTIVE	2025-08-20 20:00:00	\N	2025-06-01 10:00:00	2025-08-19 23:59:59	aedfb2d3-7fac-40c2-be1a-f535177ae72c	10000	10000	0	0	\N	\N	\N	\N	15.00	50.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	1	1
f36a2e02-a92a-4c67-b383-a05010e872c7	Underground Metal Night	Concierto de metal underground	underground-metal-night	ACTIVE	2025-09-18 21:00:00	\N	2025-07-10 10:00:00	2025-09-17 23:59:59	a09c3413-4b8e-4605-bf25-7601292e93c1	800	800	0	0	\N	\N	\N	\N	12.00	40.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	6
10a62657-191a-449b-a7c5-c3cf210c7fba	Power Metal Valencia	Noche ├®pica de power metal	power-metal-valencia	ACTIVE	2025-11-01 20:30:00	\N	2025-09-01 10:00:00	2025-10-31 23:59:59	6041a699-2a83-4518-b458-5db09b90c31a	15000	15000	0	0	\N	\N	\N	\N	30.00	100.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	10
cb12da56-8cf5-45d1-9605-ef0ebfbdbe53	Metal Cave Sessions	Concierto ├¡ntimo de bandas emergentes	metal-cave-sessions	ACTIVE	2025-10-25 20:00:00	\N	2025-08-15 10:00:00	2025-10-24 23:59:59	e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e	600	600	0	0	\N	\N	\N	\N	10.00	30.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	6
4d8eaab2-fe43-4844-99cd-4ab77c64ef42	Ontinyent Metal Fest	Festival de metal en la Pla├ºa de Baix	ontinyent-metal-fest	ACTIVE	2025-07-30 20:00:00	\N	2025-05-01 10:00:00	2025-07-29 23:59:59	ed18fb98-1c7f-4859-8f5c-3f3e099cebd3	100000	100000	0	0	\N	\N	\N	\N	50.00	150.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	7
f4db5aa0-9e42-4063-a342-9a5a26507984	Valencia Alternative Rock	Bandas alternativas en directo	valencia-alternative-rock	ACTIVE	2025-06-18 20:00:00	\N	2025-04-01 10:00:00	2025-06-17 23:59:59	1156c683-d97e-4c3f-b5fe-70e28b5d9aaa	1000	1000	0	0	\N	\N	\N	\N	18.00	45.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	1	2
402bed42-00d4-4c56-ba51-650ec4380d46	Black Metal Ritual	Concierto de black metal atmosf├®rico	black-metal-ritual	ACTIVE	2025-12-21 23:00:00	\N	2025-10-01 10:00:00	2025-12-20 23:59:59	f794e6f0-28c4-4512-ab20-1954720ea984	800	800	0	0	\N	\N	\N	\N	20.00	70.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	9
894465b9-fac3-4757-b0f4-31e69b17c8e9	Valencia Punk Rock Fest	Festival de punk rock local	valencia-punk-rock	ACTIVE	2025-08-12 19:00:00	\N	2025-05-01 10:00:00	2025-08-11 23:59:59	001baa5a-7e6c-4561-8aa3-d154f74b6503	1400	1400	0	0	\N	\N	\N	\N	10.00	30.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	1	4
cf0067c7-b2e1-4ca7-aac9-7db4d9b58f8a	Progressive Metal Night	Noche experimental de progressive metal	progressive-metal-night	ACTIVE	2025-11-11 20:00:00	\N	2025-09-01 10:00:00	2025-11-10 23:59:59	8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	2500	2500	0	0	\N	\N	\N	\N	22.00	75.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	13
94a83f67-6e96-4871-91eb-1c02c6f6222c	Valencia Hard Rock Night	Hard rock en vivo con varias bandas	valencia-hard-rock	ACTIVE	2025-09-22 20:00:00	\N	2025-07-01 10:00:00	2025-09-21 23:59:59	56bcb5a9-59c0-4476-b69c-649acfec88d4	2500	2500	0	0	\N	\N	\N	\N	18.00	60.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	1	5
ca2aeeea-0b78-4ed0-baa6-72686e4b54ae	Valencia Death Metal Night	Concierto brutal de death metal	valencia-death-metal	ACTIVE	2025-12-02 22:00:00	\N	2025-10-01 10:00:00	2025-12-01 23:59:59	e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e	600	600	0	0	\N	\N	\N	\N	20.00	60.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	8
0b257a0a-859b-433e-997f-6df067c0befb	Indie Rock Night	Concierto indie rock con bandas emergentes	indie-rock-night	ACTIVE	2025-07-15 20:00:00	\N	2025-05-15 10:00:00	2025-07-14 23:59:59	1156c683-d97e-4c3f-b5fe-70e28b5d9aaa	1000	1000	0	0	\N	\N	\N	\N	15.00	40.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	1	3
9b90bac4-0474-430c-bac7-19f98aca058c	Metal Mega Fest	Gran festival con bandas de rock y metal	metal-mega-fest	ACTIVE	2025-09-05 18:00:00	\N	2025-06-01 10:00:00	2025-09-04 23:59:59	8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	15000	15000	0	0	\N	\N	\N	\N	45.00	150.00	\N	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-10-03 11:59:57.49	2025-10-03 11:59:57.49	\N	\N	\N	\N	2	6
\.


--
-- Data for Name: EventCategory; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."EventCategory" (id, name) FROM stdin;
1	Rock
2	Metal
\.


--
-- Data for Name: EventLocality; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."EventLocality" (id, "eventId", name, description, capacity, price, "availableTickets", "soldTickets", "reservedTickets", color, "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
c8a2abb5-99d3-4cbc-b2be-271840811384	3719c30b-403b-4ba9-8cdc-cd565fc65c86	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
aaeefc5a-d160-4dbb-983c-95f98f768fff	3719c30b-403b-4ba9-8cdc-cd565fc65c86	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
60929a23-a54d-495a-9de1-30c519de6ea1	3719c30b-403b-4ba9-8cdc-cd565fc65c86	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
05dbdb91-37aa-4c9c-b9ac-b34004070bb2	2559299a-e517-4c85-8501-fccf596863ed	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
2e015530-eebb-4b25-81d7-9e33aa740d2b	2559299a-e517-4c85-8501-fccf596863ed	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
8643d73d-d12b-4190-9914-a4d0436d5c98	2559299a-e517-4c85-8501-fccf596863ed	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
76d049f0-169f-45ab-8329-0f1623ad382d	fe1932b8-ef55-4957-83c6-d14b86413e3a	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
31eba1bf-78fc-4f5c-9fa1-0fbf22e62f21	fe1932b8-ef55-4957-83c6-d14b86413e3a	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
a72ce2be-b036-4427-84ad-17bafbdb2bf3	fe1932b8-ef55-4957-83c6-d14b86413e3a	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
940ab8fd-c322-4152-873b-d1fd00b0014b	39930e46-a60b-49ab-aa82-16e1b309ed12	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
6f8dc309-6c18-416b-b955-450534d69cd6	39930e46-a60b-49ab-aa82-16e1b309ed12	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
8df48c14-2e0e-4755-80b8-3755a9d9f83e	39930e46-a60b-49ab-aa82-16e1b309ed12	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
ef4af311-4db0-4815-b856-37ca8bb5c202	c7c68ffa-8469-498d-86c3-44f449e0e52b	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
d69ee837-479b-4c7a-bfe8-ecd81df6ea6c	c7c68ffa-8469-498d-86c3-44f449e0e52b	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
f63f9705-aede-4655-af9b-e1fba8acb3e7	c7c68ffa-8469-498d-86c3-44f449e0e52b	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
68c08e2a-287e-4b7d-9c6d-360c9b1bb429	52bf7140-39a8-4893-a3fb-da38ca35ad9d	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
633e4054-2f92-4b28-9add-52452342cc53	52bf7140-39a8-4893-a3fb-da38ca35ad9d	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
5fc4ad65-b310-4531-9c6a-de9ca54fa438	52bf7140-39a8-4893-a3fb-da38ca35ad9d	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
d8b33c19-7098-4bc5-a075-aababff96e8a	5e53b4c1-9787-403d-81d7-af96f94ed886	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
03841d6b-169b-48bb-90c1-9364400135a3	5e53b4c1-9787-403d-81d7-af96f94ed886	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
48b1df2e-ca95-47d5-a459-2602df46ffad	5e53b4c1-9787-403d-81d7-af96f94ed886	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
c2c905f1-7181-40ef-9d5e-12d8c781124a	f36a2e02-a92a-4c67-b383-a05010e872c7	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
42c7b957-65a4-45fc-b480-254617f0d821	f36a2e02-a92a-4c67-b383-a05010e872c7	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
a238c525-0027-436f-bd64-c3206bc9acf6	f36a2e02-a92a-4c67-b383-a05010e872c7	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
bb546a7c-0dff-4d1b-99b8-4f38ee7c3545	10a62657-191a-449b-a7c5-c3cf210c7fba	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
59ce0e1f-bc55-499f-91d2-15bdd45b0073	10a62657-191a-449b-a7c5-c3cf210c7fba	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
0f3f2802-ba49-481d-b054-50520899df92	10a62657-191a-449b-a7c5-c3cf210c7fba	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
03bf04cb-3860-466b-b3a3-72ea6bc5c192	cb12da56-8cf5-45d1-9605-ef0ebfbdbe53	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
67d3c556-909b-4b8d-a475-ad201507fe89	cb12da56-8cf5-45d1-9605-ef0ebfbdbe53	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
c90bad9e-956f-44b7-be51-6f7207338f7c	cb12da56-8cf5-45d1-9605-ef0ebfbdbe53	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
6c5b37f4-8c12-4caa-8549-1963e1eee027	4d8eaab2-fe43-4844-99cd-4ab77c64ef42	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
247c99b1-4991-463b-95af-05c809dac2ab	4d8eaab2-fe43-4844-99cd-4ab77c64ef42	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
225d37fb-0b6b-47a7-b33f-28bf2d9844cc	f4db5aa0-9e42-4063-a342-9a5a26507984	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
26766de9-dd83-47bc-aada-abe59f24b620	f4db5aa0-9e42-4063-a342-9a5a26507984	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
9698187a-cf49-46c8-be4d-277df2151c93	4d8eaab2-fe43-4844-99cd-4ab77c64ef42	Pista General	Zona de pista con acceso general al evento	500	45.00	198	251	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 19:51:00.039
5863020f-aa34-4db6-86f4-46a2b089a441	402bed42-00d4-4c56-ba51-650ec4380d46	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
35fd942f-40cf-4df1-8f99-3b35940dd292	402bed42-00d4-4c56-ba51-650ec4380d46	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
4648fb99-ba4a-4606-8e53-cb56854fa05f	402bed42-00d4-4c56-ba51-650ec4380d46	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
b253091b-48a5-4f5d-b96c-b049756fe6b9	894465b9-fac3-4757-b0f4-31e69b17c8e9	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
d240b6d9-1ff1-4e4a-93e4-f6f7e8139162	894465b9-fac3-4757-b0f4-31e69b17c8e9	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
dadf3966-b267-448a-8ffa-e227b930461d	894465b9-fac3-4757-b0f4-31e69b17c8e9	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
1f3adf03-20b4-4b10-b14d-fca325dbece8	cf0067c7-b2e1-4ca7-aac9-7db4d9b58f8a	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
a9abc76a-a7de-47dc-9112-ebc9774ddb55	cf0067c7-b2e1-4ca7-aac9-7db4d9b58f8a	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
5d5c0bdc-c2cd-4e8e-b88a-39aad87636d5	cf0067c7-b2e1-4ca7-aac9-7db4d9b58f8a	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
0566ca97-8c48-4833-a8e3-c0a9bcea4402	94a83f67-6e96-4871-91eb-1c02c6f6222c	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
892bc61b-3dd0-40cd-a182-1ac8d418f867	94a83f67-6e96-4871-91eb-1c02c6f6222c	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
2abf208d-87ad-4bc0-a23b-4b5c413d3f55	94a83f67-6e96-4871-91eb-1c02c6f6222c	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
165ee9f5-2df2-4fe2-a693-861ca2c97c92	ca2aeeea-0b78-4ed0-baa6-72686e4b54ae	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
3011f6b8-64a1-4d45-8717-659f531b1fb3	ca2aeeea-0b78-4ed0-baa6-72686e4b54ae	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
5064aec5-fa0a-4495-baeb-9b8817a8b464	ca2aeeea-0b78-4ed0-baa6-72686e4b54ae	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
5e432052-5675-4bf5-8489-59e4013b0758	0b257a0a-859b-433e-997f-6df067c0befb	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
2db984e9-2135-4aa0-b6f0-f4333cc1e737	0b257a0a-859b-433e-997f-6df067c0befb	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
98536977-eff1-4384-9113-0d043fec10db	9b90bac4-0474-430c-bac7-19f98aca058c	Pista General	Zona de pista con acceso general al evento	500	45.00	200	250	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
944ea30d-4b84-423e-9a24-0b69d6678004	9b90bac4-0474-430c-bac7-19f98aca058c	Grada Preferente	Asientos en grada con mejor visibilidad	200	75.00	80	100	20	#10B981	t	2	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
9352481b-94a3-4c7f-bdf8-383be1c8a0a3	9b90bac4-0474-430c-bac7-19f98aca058c	Palco VIP	Zona VIP con servicios exclusivos y mejor ubicación	50	120.00	20	25	5	#F59E0B	t	3	2025-10-04 12:32:21.001	2025-10-04 12:32:21.001
55409ed1-9328-40d0-9c17-e639784b3ea4	0b257a0a-859b-433e-997f-6df067c0befb	Pista General	Zona de pista con acceso general al evento	500	45.00	179	259	51	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 20:13:14.398
3031dfaa-7617-415d-b04f-45fe32b27d84	f4db5aa0-9e42-4063-a342-9a5a26507984	Pista General	Zona de pista con acceso general al evento	500	45.00	189	256	50	#3B82F6	t	1	2025-10-04 12:32:21.001	2025-10-04 19:50:50.526
\.


--
-- Data for Name: EventSubcategory; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."EventSubcategory" (id, category_id, name) FROM stdin;
1	1	Classic Rock
2	1	Alternative Rock
3	1	Indie Rock
4	1	Punk Rock
5	1	Hard Rock
6	2	Heavy Metal
7	2	Thrash Metal
8	2	Death Metal
9	2	Black Metal
10	2	Power Metal
11	2	Symphonic Metal
12	2	Doom Metal
13	2	Progressive Metal
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Order" (id, "userId", "eventId", "localityId", quantity, "totalAmount", discount, "finalAmount", status, "stripeSessionId", "stripePaymentId", "reservationId", "userEmail", "createdAt", "updatedAt", "paidAt") FROM stdin;
ff5f58ce-815d-41a5-bbbb-b699bdc655d7	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	\N	\N	\N	voromb@hotmail.com	2025-10-04 18:52:35.779	2025-10-04 18:52:35.779	\N
cfdc0304-80d9-4a02-bcc1-b844375cf512	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	\N	\N	7e814209-6ed3-4e03-911e-ecbb82576ac1	voromb@hotmail.com	2025-10-04 18:53:44.903	2025-10-04 18:53:44.903	\N
442b0ecb-6d05-483e-b49b-328b15f34043	68cecdafebd62af136cdfc92	f4db5aa0-9e42-4063-a342-9a5a26507984	3031dfaa-7617-415d-b04f-45fe32b27d84	1	45.00	4.50	40.50	PENDING	demo_session_442b0ecb-6d05-483e-b49b-328b15f34043	\N	\N	voromb@hotmail.com	2025-10-04 19:02:13.981	2025-10-04 19:02:19.514	2025-10-04 19:02:19.513
6b6a04d4-670b-4bea-b47c-032e2473a33b	68cecdafebd62af136cdfc92	f4db5aa0-9e42-4063-a342-9a5a26507984	3031dfaa-7617-415d-b04f-45fe32b27d84	1	45.00	4.50	40.50	PENDING	demo_session_6b6a04d4-670b-4bea-b47c-032e2473a33b	\N	\N	voromb@hotmail.com	2025-10-04 19:05:56.471	2025-10-04 19:06:01.627	2025-10-04 19:06:01.625
57f80d4c-7d0b-4391-8ff0-bfb858e2a165	68cecdafebd62af136cdfc92	f4db5aa0-9e42-4063-a342-9a5a26507984	3031dfaa-7617-415d-b04f-45fe32b27d84	1	45.00	4.50	40.50	PENDING	demo_session_57f80d4c-7d0b-4391-8ff0-bfb858e2a165	\N	\N	voromb@hotmail.com	2025-10-04 19:07:23.302	2025-10-04 19:07:37.961	2025-10-04 19:07:37.96
b6628e7d-e3f3-4309-9f03-a6041d7e4ae3	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	demo_session_b6628e7d-e3f3-4309-9f03-a6041d7e4ae3	\N	\N	voromb@hotmail.com	2025-10-04 19:09:49.802	2025-10-04 19:09:54.068	2025-10-04 19:09:54.066
919ff25c-2073-4b61-8832-330f53e341da	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	demo_session_919ff25c-2073-4b61-8832-330f53e341da	\N	\N	voromb@hotmail.com	2025-10-04 19:12:33.462	2025-10-04 19:12:37.809	2025-10-04 19:12:37.807
ab120334-c1fe-4651-90ff-2e9766b4b7cd	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	demo_session_ab120334-c1fe-4651-90ff-2e9766b4b7cd	\N	\N	voromb@hotmail.com	2025-10-04 19:17:45.331	2025-10-04 19:17:51.473	2025-10-04 19:17:51.472
2f5705b1-f5de-4ec4-b7d1-eccc1c7d3489	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	\N	\N	\N	voromb@hotmail.com	2025-10-04 19:19:52.084	2025-10-04 19:19:52.084	\N
0234e2bb-43d5-4048-afc2-6801ac60ad0f	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	demo_session_0234e2bb-43d5-4048-afc2-6801ac60ad0f	\N	\N	voromb@hotmail.com	2025-10-04 19:21:08.395	2025-10-04 19:21:11.739	2025-10-04 19:21:11.736
97082b6f-406e-4107-a6ac-a3e6c24b9361	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	demo_session_97082b6f-406e-4107-a6ac-a3e6c24b9361	\N	\N	voromb@hotmail.com	2025-10-04 19:26:02.56	2025-10-04 19:26:06.109	2025-10-04 19:26:06.108
96124574-8778-46e7-83f5-befa30813c3e	68cecdafebd62af136cdfc92	f4db5aa0-9e42-4063-a342-9a5a26507984	3031dfaa-7617-415d-b04f-45fe32b27d84	1	45.00	4.50	40.50	PENDING	demo_session_96124574-8778-46e7-83f5-befa30813c3e	\N	\N	voromb@hotmail.com	2025-10-04 19:30:12.94	2025-10-04 19:30:16.185	2025-10-04 19:30:16.184
921a4cc1-0312-4f13-9402-5686865aa4c3	68cecdafebd62af136cdfc92	4d8eaab2-fe43-4844-99cd-4ab77c64ef42	9698187a-cf49-46c8-be4d-277df2151c93	1	45.00	4.50	40.50	PENDING	demo_session_921a4cc1-0312-4f13-9402-5686865aa4c3	\N	\N	voromb@hotmail.com	2025-10-04 19:36:36.837	2025-10-04 19:36:41.132	2025-10-04 19:36:41.13
8e230a13-40d8-485b-9454-8c8dba2d4a99	68cecdafebd62af136cdfc92	f4db5aa0-9e42-4063-a342-9a5a26507984	3031dfaa-7617-415d-b04f-45fe32b27d84	1	45.00	4.50	40.50	PENDING	demo_session_8e230a13-40d8-485b-9454-8c8dba2d4a99	\N	\N	voromb@hotmail.com	2025-10-04 19:50:43.401	2025-10-04 19:50:50.52	2025-10-04 19:50:50.519
ace0502c-c499-46e3-898b-ca2745d13996	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	demo_session_ace0502c-c499-46e3-898b-ca2745d13996	\N	\N	voromb@hotmail.com	2025-10-04 19:52:48.412	2025-10-04 19:52:52.152	2025-10-04 19:52:52.151
255bc361-c503-4a7a-b02e-c78e2c21d814	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	demo_session_255bc361-c503-4a7a-b02e-c78e2c21d814	\N	\N	voromb@hotmail.com	2025-10-04 20:03:31.036	2025-10-04 20:03:35.365	2025-10-04 20:03:35.364
132d9fdd-f7ba-420d-a25c-ec281b96a967	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PENDING	demo_session_132d9fdd-f7ba-420d-a25c-ec281b96a967	\N	\N	voromb@hotmail.com	2025-10-04 20:10:14.87	2025-10-04 20:10:18.597	2025-10-04 20:10:18.596
40832d90-3bd8-4d4f-9893-10a1bffe4b34	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	45.00	4.50	40.50	PAID	demo_session_40832d90-3bd8-4d4f-9893-10a1bffe4b34	\N	\N	voromb@hotmail.com	2025-10-04 20:13:10.467	2025-10-04 20:13:14.392	2025-10-04 20:13:14.391
\.


--
-- Data for Name: PriceCategory; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."PriceCategory" (id, "eventId", name, description, price, "totalTickets", "availableTickets", "isActive", capacity, "createdAt", metadata, "sectionId", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Reservation" (id, "userId", "eventId", "localityId", quantity, status, "expiresAt", "createdAt", "updatedAt") FROM stdin;
7e814209-6ed3-4e03-911e-ecbb82576ac1	68cecdafebd62af136cdfc92	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	1	COMPLETED	2025-10-04 18:59:41.364	2025-10-04 18:44:41.366	2025-10-04 18:53:44.908
ac1422fb-d426-4ee2-99b0-338636b6919a	68cecdafebd62af136cdfc92	4d8eaab2-fe43-4844-99cd-4ab77c64ef42	9698187a-cf49-46c8-be4d-277df2151c93	1	EXPIRED	2025-10-04 19:50:48.593	2025-10-04 19:35:48.594	2025-10-04 19:51:00.036
\.


--
-- Data for Name: Ticket; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Ticket" (id, "orderId", "eventId", "localityId", "userId", "ticketCode", "qrCode", status, "usedAt", "createdAt") FROM stdin;
d26696ee-3cf9-4d49-856e-8eafe82f1d70	97082b6f-406e-4107-a6ac-a3e6c24b9361	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	68cecdafebd62af136cdfc92	TKT-1759605966115-1	TICKET-97082b6f-406e-4107-a6ac-a3e6c24b9361-1	VALID	\N	2025-10-04 19:26:06.116
ff93846a-4dfd-4575-9103-ef3690935267	96124574-8778-46e7-83f5-befa30813c3e	f4db5aa0-9e42-4063-a342-9a5a26507984	3031dfaa-7617-415d-b04f-45fe32b27d84	68cecdafebd62af136cdfc92	TKT-1759606216193-1	TICKET-96124574-8778-46e7-83f5-befa30813c3e-1	VALID	\N	2025-10-04 19:30:16.194
66461af8-5dcb-45eb-95b5-8b4fa8eabdaa	921a4cc1-0312-4f13-9402-5686865aa4c3	4d8eaab2-fe43-4844-99cd-4ab77c64ef42	9698187a-cf49-46c8-be4d-277df2151c93	68cecdafebd62af136cdfc92	TKT-1759606601153-1	TICKET-921a4cc1-0312-4f13-9402-5686865aa4c3-1	VALID	\N	2025-10-04 19:36:41.154
b4114c09-c937-4770-ba5f-be018aca2e92	8e230a13-40d8-485b-9454-8c8dba2d4a99	f4db5aa0-9e42-4063-a342-9a5a26507984	3031dfaa-7617-415d-b04f-45fe32b27d84	68cecdafebd62af136cdfc92	TKT-1759607450528-1	TICKET-8e230a13-40d8-485b-9454-8c8dba2d4a99-1	VALID	\N	2025-10-04 19:50:50.529
4d914307-6215-4139-8d4b-69357f4fc9c9	ace0502c-c499-46e3-898b-ca2745d13996	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	68cecdafebd62af136cdfc92	TKT-1759607572158-1	TICKET-ace0502c-c499-46e3-898b-ca2745d13996-1	VALID	\N	2025-10-04 19:52:52.159
13fd8351-3de0-4d5c-b6e2-abf46291461d	255bc361-c503-4a7a-b02e-c78e2c21d814	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	68cecdafebd62af136cdfc92	TKT-1759608215374-1	TICKET-255bc361-c503-4a7a-b02e-c78e2c21d814-1	VALID	\N	2025-10-04 20:03:35.375
31fb4ff0-3169-43b6-91db-9a05f4811cac	132d9fdd-f7ba-420d-a25c-ec281b96a967	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	68cecdafebd62af136cdfc92	TKT-1759608618605-1	TICKET-132d9fdd-f7ba-420d-a25c-ec281b96a967-1	VALID	\N	2025-10-04 20:10:18.606
82e88242-7d4f-4e63-94aa-db2de6e7c077	40832d90-3bd8-4d4f-9893-10a1bffe4b34	0b257a0a-859b-433e-997f-6df067c0befb	55409ed1-9328-40d0-9c17-e639784b3ea4	68cecdafebd62af136cdfc92	TKT-1759608794400-1	TICKET-40832d90-3bd8-4d4f-9893-10a1bffe4b34-1	VALID	\N	2025-10-04 20:13:14.401
\.


--
-- Data for Name: Venue; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Venue" (id, name, slug, capacity, address, city, state, country, "postalCode", latitude, longitude, description, amenities, images, "isActive", "createdById", "createdAt", "updatedAt") FROM stdin;
001baa5a-7e6c-4561-8aa3-d154f74b6503	Teatro Principal Valencia	teatro-principal-valencia	1500	Calle Mayor 1	Valencia	Valencia	Espa??a	46001	\N	\N	Teatro hist??rico renovado en 2024, ubicado en el coraz??n de Valencia	{parking,wifi,accesibilidad,cafeteria,restaurante}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 17:05:01.928	2025-09-26 17:06:22.435
eedf995f-f060-4105-81b5-8b46dd58be37	Palau de les Arts	palau-de-les-arts	1800	Av. del Professor L??pez Pi??ero 1	Valencia	\N	Espa??a	46013	\N	\N	Opera house de Valencia	{parking,restaurante,tienda}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 17:06:42.338	2025-09-26 17:06:42.338
8d0df3a8-ca2b-4f0d-b76f-2f2c04dd50e9	Recinto Ferial Valencia Rock	recinto-ferial-valencia-rock	15000	Av. de las Ferias s/n	Valencia	Valencia	Espa??a	46035	\N	\N	Recinto al aire libre ideal para festivales de rock y metal	{parking,food-trucks,merchandise-stands,security,medical-post}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:22:41.999	2025-09-26 20:22:41.999
8d03b434-20a7-46a6-b5c9-76e98fe7e9a0	Sala Rockstar Valencia	sala-rockstar-valencia	2500	Calle del Rock 15	Valencia	Valencia	Espa??a	46001	\N	\N	Sala especializada en conciertos de rock y metal con excelente ac??stica	{bar,merchandise,coat-check,professional-sound,stage-lighting}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:22:44.081	2025-09-26 20:22:44.081
a09c3413-4b8e-4605-bf25-7601292e93c1	Metal Underground Club	metal-underground-club	800	Calle Subterr??nea 7	Valencia	Valencia	Espa??a	46002	\N	\N	Club ??ntimo perfecto para tributos, ac??sticos y bandas emergentes	{bar,stage,sound-system,intimate-atmosphere}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:22:46.14	2025-09-26 20:22:46.14
1156c683-d97e-4c3f-b5fe-70e28b5d9aaa	Test Venue	test-venue-simple	1000	Test Address	Valencia	\N	Espa??a	46001	\N	\N	\N	{}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:26:57.007	2025-09-26 20:26:57.007
6041a699-2a83-4518-b458-5db09b90c31a	Recinto Ferial Valencia Rock	recinto-ferial-valencia-rock-2024	15000	Av. de las Ferias s/n	Valencia	Valencia	Espa??a	46035	\N	\N	Recinto al aire libre ideal para festivales de rock y metal	{parking,food-trucks,merchandise-stands,security,medical-post}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:29:14.471	2025-09-26 20:29:14.471
56bcb5a9-59c0-4476-b69c-649acfec88d4	Sala Rockstar Valencia	sala-rockstar-valencia-2024	2500	Calle del Rock 15	Valencia	Valencia	Espa??a	46001	\N	\N	Sala especializada en conciertos de rock y metal con excelente ac??stica	{bar,merchandise,coat-check,professional-sound,stage-lighting}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:29:16.527	2025-09-26 20:29:16.527
f794e6f0-28c4-4512-ab20-1954720ea984	Metal Underground Club	metal-underground-club-2024	800	Calle Subterr??nea 7	Valencia	Valencia	Espa??a	46002	\N	\N	Club ??ntimo perfecto para tributos, ac??sticos y bandas emergentes	{bar,stage,sound-system,intimate-atmosphere}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-26 20:29:18.582	2025-09-26 20:29:18.582
e24f8e0e-c13a-4fd9-850a-bb97c6c48b3e	Metal Cave Club	metal-cave-club-valencia	600	Calle Underground 13	Valencia	Valencia	Espa??a	46003	\N	\N	Club underground ??ntimo para bandas de metal emergentes	{bar,stage,sound-system,intimate-atmosphere}	{}	t	467a0b9f-5cd9-46b0-8905-621bc92a8664	2025-09-27 12:26:04.252	2025-09-27 12:26:04.252
aedfb2d3-7fac-40c2-be1a-f535177ae72c	pla??a de dalt	plaa-de-dalt	10000	c/dos	Agullent	\N	Espa??a	46001	\N	\N	\N	{parking,bar}	{}	t	26fa8809-a1a4-4242-9d09-42e65e5ee368	2025-09-27 17:53:13.626	2025-09-27 17:53:13.626
ed18fb98-1c7f-4859-8f5c-3f3e099cebd3	pla??a de baix	plaa-de-baix	100000	C/ una dos tres	Ontinyent	\N	Espa??a	46001	\N	\N	\N	{parking,bar}	{}	t	26fa8809-a1a4-4242-9d09-42e65e5ee368	2025-09-27 17:41:44.671	2025-09-27 18:10:14.797
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
-- Name: EventCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."EventCategory_id_seq"', 2, true);


--
-- Name: EventSubcategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."EventSubcategory_id_seq"', 13, true);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: EventCategory EventCategory_name_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EventCategory"
    ADD CONSTRAINT "EventCategory_name_key" UNIQUE (name);


--
-- Name: EventCategory EventCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EventCategory"
    ADD CONSTRAINT "EventCategory_pkey" PRIMARY KEY (id);


--
-- Name: EventLocality EventLocality_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EventLocality"
    ADD CONSTRAINT "EventLocality_pkey" PRIMARY KEY (id);


--
-- Name: EventSubcategory EventSubcategory_category_id_name_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EventSubcategory"
    ADD CONSTRAINT "EventSubcategory_category_id_name_key" UNIQUE (category_id, name);


--
-- Name: EventSubcategory EventSubcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EventSubcategory"
    ADD CONSTRAINT "EventSubcategory_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PriceCategory PriceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."PriceCategory"
    ADD CONSTRAINT "PriceCategory_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: Ticket Ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY (id);


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
-- Name: EventLocality_eventId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "EventLocality_eventId_idx" ON public."EventLocality" USING btree ("eventId");


--
-- Name: EventLocality_eventId_name_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "EventLocality_eventId_name_key" ON public."EventLocality" USING btree ("eventId", name);


--
-- Name: EventLocality_isActive_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "EventLocality_isActive_idx" ON public."EventLocality" USING btree ("isActive");


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
-- Name: Order_eventId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Order_eventId_idx" ON public."Order" USING btree ("eventId");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_stripeSessionId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Order_stripeSessionId_idx" ON public."Order" USING btree ("stripeSessionId");


--
-- Name: Order_stripeSessionId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON public."Order" USING btree ("stripeSessionId");


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: PriceCategory_eventId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "PriceCategory_eventId_idx" ON public."PriceCategory" USING btree ("eventId");


--
-- Name: PriceCategory_eventId_name_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "PriceCategory_eventId_name_key" ON public."PriceCategory" USING btree ("eventId", name);


--
-- Name: Reservation_eventId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Reservation_eventId_idx" ON public."Reservation" USING btree ("eventId");


--
-- Name: Reservation_expiresAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Reservation_expiresAt_idx" ON public."Reservation" USING btree ("expiresAt");


--
-- Name: Reservation_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Reservation_status_idx" ON public."Reservation" USING btree (status);


--
-- Name: Reservation_userId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Reservation_userId_idx" ON public."Reservation" USING btree ("userId");


--
-- Name: Ticket_orderId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Ticket_orderId_idx" ON public."Ticket" USING btree ("orderId");


--
-- Name: Ticket_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Ticket_status_idx" ON public."Ticket" USING btree (status);


--
-- Name: Ticket_ticketCode_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Ticket_ticketCode_idx" ON public."Ticket" USING btree ("ticketCode");


--
-- Name: Ticket_ticketCode_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Ticket_ticketCode_key" ON public."Ticket" USING btree ("ticketCode");


--
-- Name: Ticket_userId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Ticket_userId_idx" ON public."Ticket" USING btree ("userId");


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
-- Name: EventLocality EventLocality_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EventLocality"
    ADD CONSTRAINT "EventLocality_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventSubcategory EventSubcategory_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EventSubcategory"
    ADD CONSTRAINT "EventSubcategory_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."EventCategory"(id) ON DELETE CASCADE;


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
-- Name: Order Order_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_localityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES public."EventLocality"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public."Reservation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: Reservation Reservation_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reservation Reservation_localityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES public."EventLocality"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Ticket Ticket_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Ticket Ticket_localityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES public."EventLocality"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Ticket Ticket_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: Event fk_event_category; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT fk_event_category FOREIGN KEY (category_id) REFERENCES public."EventCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event fk_event_subcategory; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT fk_event_subcategory FOREIGN KEY (subcategory_id) REFERENCES public."EventSubcategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict bACG1bjYM8IIaXTuXXD0v8SqnfREPDC2QyPInIt8Rz40x9WgVj14bXt4QWRozra

