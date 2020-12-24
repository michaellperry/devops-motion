import { Jinaga, JinagaServer } from "jinaga";
import { env } from "process";
import { Console, withConsole } from "./console/interface";
import { Client } from "pg";
import { readFile } from "fs";

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

    const address = await connectToDatabase(console);

    console.write(`---------

Please set the environment variable DEVOPS_MOTION_POSTGRESQL to a connection
string.

You can do this in ~/.bashrc with:

export DEVOPS_MOTION_POSTGRESQL=postgresql://dev:devpw@${address.host}:${address.port}/devopsmotion

---------`);
}

async function connectToDatabase(console: Console) {
    while (true) {
        const host = await console.question("PostgreSQL host", "localhost");
        const port = await console.question("PostgreSQL port number", "5432", input => {
            const value = parseInt(input);
            if (isNaN(value) || value < 1 || value > 65536) {
                throw new Error("Please enter a whole number between 1 and 65536.");
            }
            return value;
        });
        const database = await console.question("Primary (not application) database", "postgres");
        const user = await console.question("Administrative user", "postgres");

        const client = new Client({
            host,
            port,
            database,
            user
        });

        try {
            console.write(`---------

Connecting to the PostgreSQL server.`);
            await client.connect();

            console.write("Looking for the devopsmotion database.");
            const databases = await client.query("SELECT 1 FROM pg_database WHERE datname = 'devopsmotion';");
            if (databases.rowCount === 0) {
                console.write(`The devopsmotion database does not exist yet. Creating it now...`);
                await createApplicationDatabase(console, client, host, port, user);
            }
            else {
                console.write(`The devopsmotion database already exists.`);
            }
            return { host, port };
        }
        catch (err) {
            console.write(`
xxxxxxxxx

Something went wrong!

I was not able to connect to your PostgreSQL database. Please check your
credentials and try again.

${err.message}

xxxxxxxxx`);
        }
        finally {
            await client.end();
        }
    }
}

async function createApplicationDatabase(console: Console, client: Client, host: string, port: number, user: string) {
    console.write("Creating devopsmotion database.");
    await client.query("CREATE DATABASE devopsmotion;");

    const appClient = new Client({
        host,
        port,
        user,
        database: "devopsmotion"
    });

    const buffer = await readFileAsync("./node_modules/jinaga/setup.sql");
    const script = buffer.toString("utf8");

    console.write("Running setup script.");
    await client.query(script);
}

function readFileAsync(path: string) {
    return new Promise<Buffer>((resolve, reject) => {
        readFile(path, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        })
    });
}