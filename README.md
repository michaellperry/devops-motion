# DevOps Motion

A virtual assistant to help propel your projects toward completion.

## Goals

The purpose of this project is to add a new automated member to your project team.
They will keep an eye on tasks, make sure that work is not dropped, and answer basic questions.

- Notify QA when stories are ready to test
- Determine which build contains the desired work
- Create release notes listing stories completed and bugs fixed between deployments

Motion works with Azure DevOps to keep your projects moving.

## Setup

Install [Node](https://nodejs.org) and [Postgres](https://www.postgresql.org).
Then clone the repository and run:

```bash
npm i
npm run build
npm start
```

The application will walk you through environment and database setup.

If you are using WSL on Windows, consider running PostgreSQL in WSL rather than Windows.
Install it using `sudo apt-get install postgresql postgresql-contrib`.
Then start it with `sudo service postgresql start`.

At first, the postgres user will not have a password.
To set one, run `sudo -u postgres psql postgres` to log in, then type `\password postgres` and create a password.
Or you can run DevOps Motion as the user postgres and leave the password blank: `sudo -u postgres npm start`.

## Troubleshooting

connect ECONNREFUSED 127.0.0.1:5432

This error indicates that PostgreSQL did not answer at the default port.
There could be many reasons for this.
The simplest reason is that PostgreSQL is not running.
Please check that first.

On Windows, use the Service app and look for postgresql-x64-13.
Start pgAdmin 4 and check that the server is running.

If the server is running, double-check the port.
Something might have happened during installation that caused the service to switch to a non-default port.

On Windows, start pgAdmin 4.
Select the server in the tree (e.g. PostgreSQL 13), and open the Properties tab.
The port number is shown in the Connection area.

If the port is correct, then this error might indicate that the client is blocked from connecting to the port.
This is likely a software firewall.

On Windows with WSL, you might be running PostgreSQL as a Windows service but trying to connect via a WSL client.
The Windows firewall prevents WSL apps from accessing Windows services.
Open the Windows Defender Firewall settings and [customize the protected connections](https://github.com/microsoft/WSL/issues/4139#issuecomment-732067409) to remove WSL.

If this doesn't solve the issue, consider running PostgreSQL in WSL rather than Windows.
Install it using `sudo apt-get install postgresql postgresql-contrib`.
Then start it with `sudo service postgresql start`.

At first, the postgres user will not have a password.
To set one, run `sudo -u postgres psql postgres` to log in, then type `\password postgres` and create a password.
Or you can run DevOps Motion as the user postgres and leave the password blank: `sudo -u postgres npm start`.
