import * as http from "http";
import { AzureDevOpsConnector } from "./azure-devops/connector";
import { initializeDevOps } from "./azure-devops/initialize";
import { AzureDevOps } from "./azure-devops/proxy";
import { initializeStore } from "./database/store";
import { welcome } from "./interactive/messages";
import { configureRoutes } from "./routes";
import express = require("express");
import bodyParser = require("body-parser");

async function main() {
    console.log(welcome);
    const jinagaServer = await initializeStore();
    const reconfigure = process.argv.includes("-r");
    const configuration = await initializeDevOps(jinagaServer.j, reconfigure);

    const app = express();
    const server = http.createServer(app);
    app.use(bodyParser.json());
    app.set("port", process.env.PORT || 8080);
    app.use('/jinaga', jinagaServer.handler);
    const azureDevOpsConnector = new AzureDevOpsConnector(
        jinagaServer.j,
        new AzureDevOps(
            configuration.project.organization.organization,
            configuration.project.project,
            configuration.apiSecret),
        configuration.project);
    configureRoutes(app, azureDevOpsConnector);

    server.listen(app.get('port'), () => {
        console.log(`  App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
        console.log('  Press CTRL-C to stop\n');
    });
}

main().catch(err => console.error(err));
