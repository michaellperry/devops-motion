import * as http from "http";
import { initializeDevOps } from "./azure-devops/initialize";
import { initializeStore } from "./database/store";
import { welcome } from "./interactive/messages";
import express = require("express");
import { configureRoutes } from "./routes";

async function main() {
    console.log(welcome);
    const jinagaServer = await initializeStore();
    const reconfigure = process.argv.includes("-r");
    const configuration = await initializeDevOps(jinagaServer.j, reconfigure);

    const app = express();
    const server = http.createServer(app);
    app.set("port", process.env.PORT || 8080);
    app.use('/jinaga', jinagaServer.handler);
    configureRoutes(app, jinagaServer.j, configuration);

    server.listen(app.get('port'), () => {
        console.log(`  App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
        console.log('  Press CTRL-C to stop\n');
    });
}

main().catch(err => console.error(err));
