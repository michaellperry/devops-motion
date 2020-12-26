import { Express, static as ExpressStatic } from 'express';
import * as path from 'path';
import { AzureDevOpsConnector } from "./azure-devops/connector";

export function configureRoutes(app: Express, azureDevOpsConnector: AzureDevOpsConnector) {
    app.get(/^\/(index.html)?$/, (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    });

    app.use('/scripts', ExpressStatic(path.join(__dirname, '../client/scripts')));

    app.get("/api/project", (req, res) => {
        res.send(JSON.stringify(azureDevOpsConnector.project));
    });

    app.post("/api/project/release-pipelines", (req, res) => {
        azureDevOpsConnector.refreshReleasePipelines()
            .then(() => res.sendStatus(200))
            .catch(err => res.status(500).send(err.message));
    });
}