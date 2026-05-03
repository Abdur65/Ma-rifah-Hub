


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" integer NOT NULL,
    "section_id" integer NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "icon_name" "text" NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."categories_id_seq" OWNED BY "public"."categories"."id";



CREATE TABLE IF NOT EXISTS "public"."entries" (
    "id" integer NOT NULL,
    "category_id" integer NOT NULL,
    "heading" "text" NOT NULL,
    "arabic_text" "text",
    "body" "text" NOT NULL,
    "reference" "text",
    "ref_is_link" boolean DEFAULT false NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "fts" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", ((COALESCE("heading", ''::"text") || ' '::"text") || COALESCE("body", ''::"text")))) STORED
);


ALTER TABLE "public"."entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."entries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."entries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."entries_id_seq" OWNED BY "public"."entries"."id";



CREATE TABLE IF NOT EXISTS "public"."sections" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL
);


ALTER TABLE "public"."sections" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."sections_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."sections_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sections_id_seq" OWNED BY "public"."sections"."id";



ALTER TABLE ONLY "public"."categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."entries" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."entries_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sections" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."sections_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_section_id_slug_key" UNIQUE ("section_id", "slug");



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_category_id_slug_key" UNIQUE ("category_id", "slug");



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_slug_key" UNIQUE ("slug");



CREATE INDEX "entries_fts_idx" ON "public"."entries" USING "gin" ("fts");



CREATE OR REPLACE TRIGGER "entries_updated_at" BEFORE UPDATE ON "public"."entries" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



CREATE POLICY "admin delete categories" ON "public"."categories" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "admin delete entries" ON "public"."entries" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "admin delete sections" ON "public"."sections" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "admin insert categories" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "admin insert entries" ON "public"."entries" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "admin insert sections" ON "public"."sections" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "admin update categories" ON "public"."categories" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "admin update entries" ON "public"."entries" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "admin update sections" ON "public"."sections" FOR UPDATE TO "authenticated" USING (true);



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."entries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public read categories" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "public read entries" ON "public"."entries" FOR SELECT USING (true);



CREATE POLICY "public read sections" ON "public"."sections" FOR SELECT USING (true);



ALTER TABLE "public"."sections" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";


















GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."categories" TO "service_role";



GRANT UPDATE ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT UPDATE ON SEQUENCE "public"."categories_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."entries" TO "anon";
GRANT ALL ON TABLE "public"."entries" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."entries" TO "service_role";



GRANT UPDATE ON SEQUENCE "public"."entries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."entries_id_seq" TO "authenticated";
GRANT UPDATE ON SEQUENCE "public"."entries_id_seq" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."sections" TO "anon";
GRANT ALL ON TABLE "public"."sections" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."sections" TO "service_role";



GRANT UPDATE ON SEQUENCE "public"."sections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sections_id_seq" TO "authenticated";
GRANT UPDATE ON SEQUENCE "public"."sections_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";



































drop extension if exists "pg_net";

revoke delete on table "public"."categories" from "anon";

revoke insert on table "public"."categories" from "anon";

revoke update on table "public"."categories" from "anon";

revoke delete on table "public"."categories" from "service_role";

revoke insert on table "public"."categories" from "service_role";

revoke select on table "public"."categories" from "service_role";

revoke update on table "public"."categories" from "service_role";

revoke delete on table "public"."entries" from "anon";

revoke insert on table "public"."entries" from "anon";

revoke update on table "public"."entries" from "anon";

revoke delete on table "public"."entries" from "service_role";

revoke insert on table "public"."entries" from "service_role";

revoke select on table "public"."entries" from "service_role";

revoke update on table "public"."entries" from "service_role";

revoke delete on table "public"."sections" from "anon";

revoke insert on table "public"."sections" from "anon";

revoke update on table "public"."sections" from "anon";

revoke delete on table "public"."sections" from "service_role";

revoke insert on table "public"."sections" from "service_role";

revoke select on table "public"."sections" from "service_role";

revoke update on table "public"."sections" from "service_role";


