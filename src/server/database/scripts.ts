export const databaseExists = `
SELECT 1
  FROM pg_database
  WHERE datname = $1;`;

export const createDatabase = (databaseName: string) => `
CREATE DATABASE ${databaseName};`;

export const factTableExists = `
SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'fact';`;

export const userExists = `
SELECT 1
  FROM pg_catalog.pg_user
  WHERE usename = $1;`;

export const createUser = (username: string, password: string) => `
CREATE USER ${username} WITH
  LOGIN
  ENCRYPTED PASSWORD '${password}'
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  VALID UNTIL 'infinity';`;

export const setupApplicationDatabase = (username: string) => `
CREATE TABLE public.edge (
    successor_type character varying(50),
    successor_hash character varying(100),
    predecessor_type character varying(50),
    predecessor_hash character varying(100),
    role character varying(20)
);

ALTER TABLE public.edge OWNER TO postgres;

-- Most unique first, for fastest uniqueness check on insert.
CREATE UNIQUE INDEX ux_edge ON public.edge USING btree (successor_hash, predecessor_hash, role, successor_type, predecessor_type);
-- Covering index based on successor, favoring most likely members of WHERE clause.
CREATE INDEX ix_successor ON public.edge USING btree (successor_hash, role, successor_type, predecessor_hash, predecessor_type);
-- Covering index based on predecessor, favoring most likely members of WHERE clause.
CREATE INDEX ix_predecessor ON public.edge USING btree (predecessor_hash, role, predecessor_type, successor_hash, successor_type);

GRANT SELECT,INSERT ON TABLE public.edge TO ${username};


CREATE TABLE public.fact (
    type character varying(50),
    hash character varying(100),
    fields jsonb,
    predecessors jsonb,
    date_learned timestamp NOT NULL
        DEFAULT (now() at time zone 'utc')
);

ALTER TABLE public.fact OWNER TO postgres;

CREATE UNIQUE INDEX ux_fact ON public.fact USING btree (hash, type);

GRANT SELECT,INSERT ON TABLE public.fact TO ${username};


CREATE TABLE public."user" (
    provider character varying(100),
    user_id character varying(50),
    private_key character varying(1800),
    public_key character varying(500)
);

ALTER TABLE public."user" OWNER TO postgres;

CREATE UNIQUE INDEX ux_user ON public."user" USING btree (user_id, provider);

CREATE UNIQUE INDEX ux_user_public_key ON public."user" (public_key);

GRANT SELECT,INSERT ON TABLE public."user" TO ${username};


CREATE TABLE public."signature" (
    type character varying(50),
    hash character varying(100),
    public_key character varying(500),
    signature character varying(400),
    date_learned timestamp NOT NULL
        DEFAULT (now() at time zone 'utc')
);

ALTER TABLE public."signature" OWNER TO postgres;

CREATE UNIQUE INDEX ux_signature ON public."signature" USING btree (hash, public_key, type);

GRANT SELECT,INSERT ON TABLE public."signature" TO ${username};
`;