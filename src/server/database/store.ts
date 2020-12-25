import { JinagaServer, JinagaServerInstance } from "jinaga";
import { Client } from "pg";
import { env } from "process";
import { createDatabase, createUser, databaseExists, factTableExists, setupApplicationDatabase, userExists } from "./scripts";
import { Console, withConsole } from "../interactive/console";
import { createUserAdvice, creatingApplicationUser, errorMessage, installPostgres, postgresAdvice, setEnvironmentVariable } from "../interactive/messages";

const databaseName = "devopsmotion";

export async function initializeStore(): Promise<JinagaServerInstance> {
    let connectionString = env.DEVOPS_MOTION_POSTGRESQL;

    if (!connectionString) {
        connectionString = await withConsole(console => setUpDatabase(console));
    }

    const server = JinagaServer.create({
        pgKeystore: connectionString,
        pgStore: connectionString
    });
    return server;
}

async function setUpDatabase(console: Console) {
    console.write(installPostgres);

    const address = await connectToDatabase(console);

    const credentials = await createApplicationUser(console, address);

    await initializeApplicationDatabase(console, address, credentials);

    const connectionString = `postgresql://${credentials.username}:${credentials.password}@${address.host}:${address.port}/${databaseName}`;
    console.write(setEnvironmentVariable(connectionString));
    return connectionString;
}

interface PostgresAddress {
    host: string;
    port: number;
    database: string;
    user: string;
};

async function connectToDatabase(console: Console): Promise<PostgresAddress> {
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
        console.write("\n");

        try {
            await createApplicationDatabase(console, host, port, database, user);
        }
        catch (err) {
            console.write(errorMessage(postgresAdvice, err));
            continue;
        }

        return { host, port, database, user };
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
        const databases = await client.query(databaseExists, [ databaseName ]);
        if (databases.rowCount === 0) {
            console.write(`The ${databaseName} database does not exist yet. Creating it now...`);
            await client.query(createDatabase, [ databaseName ]);
        }
        else {
            console.write(`The ${databaseName} database already exists.`);
        }
    }
    finally {
        await client.end();
    }
}

interface UserCredentials {
    username: string;
    password: string;
};

async function createApplicationUser(console: Console, address: PostgresAddress) : Promise<UserCredentials> {
    while (true) {
        console.write(creatingApplicationUser(databaseName));
        const username = await console.question("Application user name", "domapp");
        const password = await console.question("Application password");
        console.write("\n");
        if (!isValidUserName(username)) {
            console.write("Username must be up to 16 alphanumeric characters. Underscore and dash are allowed.");
            continue;
        }
        if (!isValidPassword(password)) {
            console.write("A password is required. It cannot contain an apostrophe.");
            continue;
        }

        try {
            await createUserRole(console, address, username, password);
        }
        catch (err) {
            console.write(errorMessage(createUserAdvice, err));
            continue;
        }

        return { username, password };
    }
}

function isValidUserName(username: string) {
    if (!username) {
        return false;
    }
    if (username.length > 16) {
        return false;
    }
    if (!/^[a-zA-Z0-9_-]*$/.test(username)) {
        return false;
    }

    return true;
}

function isValidPassword(password: string) {
    if (!password) {
        return false;
    }
    if (password.includes("'")) {
        return false;
    }

    return true;
}

async function createUserRole(console: Console, address: PostgresAddress, username: string, password: string) {
    const client = new Client({
        host: address.host,
        port: address.port,
        database: address.database,
        user: address.user
    });

    try {
        await client.connect();

        const users = await client.query(userExists, [ username ]);
        if (users.rowCount === 0) {
            console.write(`Creating application user ${username}.`);
            await client.query(createUser(username, password));
        }
        else {
            console.write(`The user ${username} already exists.`);
        }
    }
    finally {
        await client.end();
    }
}

async function initializeApplicationDatabase(console: Console, address: PostgresAddress, credentials: UserCredentials) {
    const client = new Client({
        host: address.host,
        port: address.port,
        user: address.user,
        database: databaseName
    });

    try {
        await client.connect();

        const factTable = await client.query(factTableExists);
        if (factTable.rowCount === 0) {
            console.write("Running setup script.");
            await client.query(setupApplicationDatabase(credentials.username));
            console.write("Successfully set up the database!");
        }
        else {
            console.write("The application database has already been set up.");
        }
    }
    finally {
        await client.end();
    }
}
