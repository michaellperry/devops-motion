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
