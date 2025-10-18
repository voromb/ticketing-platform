--
-- PostgreSQL database dump
--

\restrict KAr51P17oKGtyW4kRTk0kn62tihh7eh0q7k57fIeMk7fSx0pwGLAfGEwkv5GYmb

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Approval; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Approval" (
    id text NOT NULL,
    service text NOT NULL,
    "entityId" text NOT NULL,
    "entityType" text NOT NULL,
    "requestedBy" text NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "decidedBy" text,
    "decidedAt" timestamp(3) without time zone,
    reason text,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: Approval; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Approval" VALUES ('7991a26c-f0b1-4d20-86f1-94a93f2d2b11', 'TRAVEL', '68eaa4ee1b963876d9c7533d', 'Trip', 'user-123', '2025-10-11 19:30:53.419', 'approved', 'admin@example.com', '2025-10-12 18:06:15.926', 'Aprobado - Viaje para grupo grande autorizado', 'HIGH', '{"reason": "Grupo grande de 30 personas", "specialRequests": "Necesitan asistencia especial"}', '2025-10-11 19:30:53.419', '2025-10-12 18:06:15.929');
INSERT INTO public."Approval" VALUES ('00f00c42-c28a-4e48-9633-e6626055694f', 'TRAVEL', '68eaa4ee1b963876d9c7533d', 'travel', 'user@example.com', '2025-10-12 17:57:59.444', 'approved', 'admin@festival.com', '2025-10-12 19:43:19.841', 'Aprobado por testing - Todo correcto', 'MEDIUM', '{"price": 500}', '2025-10-12 17:57:59.444', '2025-10-12 19:43:19.843');


--
-- Name: Approval Approval_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Approval"
    ADD CONSTRAINT "Approval_pkey" PRIMARY KEY (id);


--
-- Name: Approval_service_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Approval_service_idx" ON public."Approval" USING btree (service);


--
-- Name: Approval_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Approval_status_idx" ON public."Approval" USING btree (status);


--
-- PostgreSQL database dump complete
--

\unrestrict KAr51P17oKGtyW4kRTk0kn62tihh7eh0q7k57fIeMk7fSx0pwGLAfGEwkv5GYmb

