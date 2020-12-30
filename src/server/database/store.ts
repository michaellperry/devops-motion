import { JinagaServer, JinagaServerInstance } from "jinaga";
import { Client } from "pg";
import { env } from "process";
import { readPassword, readQuestion, write } from "../interactive/interactive";
import { createUserAdvice, creatingApplicationUser, errorMessage, installPostgres, postgresAdvice, setEnvironmentVariable } from "../interactive/messages";
import { createDatabase, createUser, databaseExists, factTableExists, setupApplicationDatabase, userExists } from "./scripts";

const databaseName = "devopsmotion";

export async function initializeStore(): Promise<JinagaServerInstance> {
    let connectionString = env.DEVOPS_MOTION_POSTGRESQL;

    if (!connectionString) {
        connectionString = await setUpDatabase();
    }

    const server = JinagaServer.create({
        pgKeystore: connectionString,
        pgStore: connectionString
    });
    return server;
}

async function setUpDatabase() {
    write(installPostgres);

    const address = await connectToDatabase();

    const credentials = await createApplicationUser(address);

    await initializeApplicationDatabase(address, credentials);

    const realConnectionString = `postgresql://${credentials.username}:${credentials.password}@${address.host}:${address.port}/${databaseName}`;
    const maskedConnectionString = `postgresql://${credentials.username}:<the password you just entered>@${address.host}:${address.port}/${databaseName}`;
    write(setEnvironmentVariable(maskedConnectionString));
    return realConnectionString;
}

interface PostgresAddress {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
};

async function connectToDatabase(): Promise<PostgresAddress> {
    while (true) {
        const host = await readQuestion("PostgreSQL host", "localhost");
        const port = await readQuestion("PostgreSQL port number", "5432", input => {
            const value = parseInt(input);
            if (isNaN(value) || value < 1 || value > 65536) {
                throw new Error("Please enter a whole number between 1 and 65536.");
            }
            return value;
        });
        const database = await readQuestion("Primary (not application) database", "postgres");
        const user = await readQuestion("Administrative user", "postgres");
        const password = await readPassword("Administrative password");
        write("\n");

        try {
            await createApplicationDatabase(host, port, database, user, password);
        }
        catch (err) {
            write(errorMessage(postgresAdvice, err));
            continue;
        }

        return { host, port, database, user, password };
    }
}

async function createApplicationDatabase(host: string, port: number, database: string, user: string, password: string) {
    const client = new Client({
        host,
        port,
        database,
        user,
        password
    });

    try {
        write(`Connecting to the PostgreSQL server.`);
        await client.connect();
    
        write(`Looking for the ${databaseName} database.`);
        const databases = await client.query(databaseExists, [ databaseName ]);
        if (databases.rowCount === 0) {
            write(`The ${databaseName} database does not exist yet. Creating it now...`);
            await client.query(createDatabase(databaseName));
        }
        else {
            write(`The ${databaseName} database already exists.`);
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

async function createApplicationUser(address: PostgresAddress) : Promise<UserCredentials> {
    while (true) {
        write(creatingApplicationUser(databaseName));
        const username = await readQuestion("Application user name", "domapp");
        const password = await readPassword("Application password");
        const confirmPassword = await readPassword("Confirm password");
        write("\n");
        if (!isValidUserName(username)) {
            write("Username must be up to 16 alphanumeric characters. Underscore and dash are allowed.");
            continue;
        }
        if (!isValidPassword(password)) {
            write("A password is required. It cannot contain an apostrophe.");
            continue;
        }
        if (confirmPassword !== password) {
            write("The passwords don't match.");
            continue;
        }

        try {
            await createUserRole(address, username, password);
        }
        catch (err) {
            write(errorMessage(createUserAdvice, err));
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

async function createUserRole(address: PostgresAddress, username: string, password: string) {
    const client = new Client({
        host: address.host,
        port: address.port,
        database: address.database,
        user: address.user,
        password: address.password
    });

    try {
        await client.connect();

        const users = await client.query(userExists, [ username ]);
        if (users.rowCount === 0) {
            write(`Creating application user ${username}.`);
            await client.query(createUser(username, password));
        }
        else {
            write(`The user ${username} already exists.`);
        }
    }
    finally {
        await client.end();
    }
}

async function initializeApplicationDatabase(address: PostgresAddress, credentials: UserCredentials) {
    const client = new Client({
        host: address.host,
        port: address.port,
        database: databaseName,
        user: address.user,
        password: address.password
    });

    try {
        await client.connect();

        const factTable = await client.query(factTableExists);
        if (factTable.rowCount === 0) {
            write("Running setup script.");
            await client.query(setupApplicationDatabase(credentials.username));
            write("Successfully set up the database!");
        }
        else {
            write("The application database has already been set up.");
        }
    }
    finally {
        await client.end();
    }
}
