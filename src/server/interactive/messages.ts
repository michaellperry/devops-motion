export const welcome = String.raw`
________         _______             _____  ___    ____  _
___  __ \___ _   ___ __ \____  _____ __   |/  /___ _/ /_(_)___  ____
__  / / / _ \ | / / / / / __ \/ ___/ _  /|_/ / __ \/ __/ / __ \/ __ \
_  /_/ /  __/ |/ / /_/ / /_/ (__  )  / /  / / /_/ / /_/ / /_/ / / / /
/_____/\___/|___/\____/ .___/____/  /_/  /_/\____/\__/_/\____/_/ /_/
                     /_/
`;

export const installPostgres = `
I'll help you keep your projects moving forward. But first I'll need a little
help myself. I need a PostgreSQL database to store your configuration and
project snapshots.

Please download PostgreSQL from https://www.postgresql.org/download/

Once you have it installed, I'll set up the database.
`;

export const setEnvironmentVariable = (host: string, port: number, databaseName: string) => `
Please set the environment variable DEVOPS_MOTION_POSTGRESQL to a connection
string.

You can do this in ~/.bashrc with:

export DEVOPS_MOTION_POSTGRESQL=postgresql://dev:devpw@${host}:${port}/${databaseName}

Once that's set, run npm start again and we'll move on to the next step.
`;

export const postgresAdvice = `
I was not able to connect to your PostgreSQL database. Please check your
credentials and try again.
`;

export const setupScriptAdvice = (databaseName: string) => `
I was not able to read the file ./node_modules/jinaga/setup.sql.
This is the setup script that I need to initialize your ${databaseName} database.
Make sure you are running from the root directory of DevOps Motion, and that
the NPM modules have been initialized.
`

export const errorMessage = (advice: string, err: any) => `
xxxxxxxxx

Something went wrong!
${advice}
${err.message}

xxxxxxxxx`;