import { env } from "process";
import { createInterface } from "readline";
import { withConsole, Console } from "./console/interface";

export async function initializeStore() {
    const connectionString = env.DEVOPS_MOTION_POSTGRESQL;

    if (!connectionString) {
        await withConsole(console => setUpDatabase(console));
    }
}

async function setUpDatabase(console: Console) {
    const io = createInterface(process.stdin, process.stdout);

    console.log(`---------
Welcome to DevOps Motion

I'll help you keep your projects moving forward. But first I'll need a little
help myself. I need a PostgreSQL database to store your configuration and
project snapshots.

Please download PostgreSQL from https://www.postgresql.org/download/

Once you have it installed, I'll set up the database.
---------`);

    const port = await console.question("PostgreSQL port number: (default 5432)");


    console.log(`---------
Please set the environment variable DEVOPS_MOTION_POSTGRESQL to a connection
string.

You can do this in ~/.bashrc with:

export DEVOPS_MOTION_POSTGRESQL=postgresql://dev:devpw@localhost:5432/myapplication
---------`);
}