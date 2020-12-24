export const databaseExists = `
SELECT 1
  FROM pg_database
  WHERE datname = $1;`;

export const createDatabase = `
CREATE DATABASE $1;`;

export const factTableExists = `
SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'fact';`;

export const userExists = `
SELECT 1
  FROM pg_catalog.pg_user
  WHERE username = $1;`;

export const createUser = `
CREATE USER $1 WITH
  LOGIN
  ENCRYPTED PASSWORD $2
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  VALID UNTIL 'infinity';`;
