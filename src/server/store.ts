import { Jinaga, JinagaServer } from "jinaga";
import { env } from "process";
import { Console, withConsole } from "./console/interface";

export async function initializeStore(): Promise<Jinaga> {
    const connectionString = env.DEVOPS_MOTION_POSTGRESQL;

    if (!connectionString) {
        await withConsole(console => setUpDatabase(console));
    }

    const server = JinagaServer.create({

    });
    return server.j;
}

async function setUpDatabase(console: Console) {
    console.write(`---------
Welcome to DevOps Motion

I'll help you keep your projects moving forward. But first I'll need a little
help myself. I need a PostgreSQL database to store your configuration and
project snapshots.

Please download PostgreSQL from https://www.postgresql.org/download/

Once you have it installed, I'll set up the database.
---------`);

    const port = await console.question("PostgreSQL port number", "5432", input => {
        const value = parseInt(input);
        if (isNaN(value) || value < 1 || value > 65536) {
            throw new Error("Please enter a whole number between 1 and 65536.");
        }
        return value;
    });

    console.write(`---------
Please set the environment variable DEVOPS_MOTION_POSTGRESQL to a connection
string.

You can do this in ~/.bashrc with:

export DEVOPS_MOTION_POSTGRESQL=postgresql://dev:devpw@localhost:${port}/devopsmotion
---------`);
}