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

        try {
            await createApplicationDatabase(console, host, port, database, user);
        }
        catch (err) {
            console.write(errorMessage(postgresAdvice, err));
            continue;
        }

        let script = "";
        try {
            script = await loadSetupScript();
        }
        catch (err) {
            console.write(errorMessage(setupScriptAdvice(databaseName), err));
            continue;
        }
    
        try {
            await initializeApplicationDatabase(console, host, port, user, script);
        }
        catch (err) {
            console.write(errorMessage(postgresAdvice, err));
            continue;
        }

        return { host, port };
    }
}

async function createApplicationDatabase(console: Console, host: string, port: number, database: string, user: string) {
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
        const databases = await client.query(`
            SELECT 1
            FROM pg_database
            WHERE datname = $1;`, [
                databaseName
            ]);
        if (databases.rowCount === 0) {
            console.write(`The ${databaseName} database does not exist yet. Creating it now...`);
            await client.query(`CREATE DATABASE ${databaseName};`);
        }
        else {
            console.write(`The ${databaseName} database already exists.`);
        }
    }
    finally {
        await client.end();
    }
}

async function initializeApplicationDatabase(console: Console, host: string, port: number, user: string, script: string) {
    const client = new Client({
        host,
        port,
        user,
        database: databaseName
    });

    try {
        await client.connect();

        const factTable = await client.query(`SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'fact';`);
        if (factTable.rowCount === 0) {
            console.write("Running setup script.");
            await client.query(script);
        }
        else {
            console.write("The application database has already been set up.");
        }
    }
    finally {
        await client.end();
    }
}

async function loadSetupScript() {
    const buffer = await readFileAsync("./node_modules/jinaga/setup.sql");
    const script = buffer.toString("utf8");
    return script;
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