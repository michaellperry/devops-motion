import { readFile } from "fs";
import { Jinaga, JinagaServer } from "jinaga";
import { Client } from "pg";
import { env } from "process";
import { Console, withConsole } from "./interactive/console";
import { errorMessage, installPostgres, postgresAdvice, setEnvironmentVariable, setupScriptAdvice, welcome } from "./interactive/messages";

const databaseName = "devopsmotion";

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
    console.write(welcome);
    console.write(installPostgres);

    const address = await connectToDatabase(console);

    console.write(setEnvironmentVariable(address.host, address.port, databaseName));
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
            console.write(`Connecting to the PostgreSQL server.`);
            await client.connect();

            console.write(`Looking for the ${databaseName} database.`);
            const databases = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${databaseName}';`);
            if (databases.rowCount === 0) {
                console.write(`The ${databaseName} database does not exist yet. Creating it now...`);
                await createApplicationDatabase(console, client);
            }
            else {
                console.write(`The ${databaseName} database already exists.`);
            }

            await initializeApplicationDatabase(console, host, port, user);

            return { host, port };
        }
        catch (err) {
            console.write(errorMessage(postgresAdvice, err));
        }
        finally {
            await client.end();
        }
    }
}

async function createApplicationDatabase(console: Console, client: Client) {
    console.write(`Creating ${databaseName} database.`);
    await client.query(`CREATE DATABASE ${databaseName};`);
}

async function initializeApplicationDatabase(console: Console, host: string, port: number, user: string) {
    const appClient = new Client({
        host,
        port,
        user,
        database: databaseName
    });

    const factTable = await appClient.query(`SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'fact';`);

    const script = await loadSetupScript();

    console.write("Running setup script.");
    await appClient.query(script);
}

async function loadSetupScript() {
    try {
        const buffer = await readFileAsync("./node_modules/jinaga/setup.sql");
        const script = buffer.toString("utf8");
        return script;
    }
    catch (err) {
        throw new Error(errorMessage(setupScriptAdvice(databaseName), err));
    }
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