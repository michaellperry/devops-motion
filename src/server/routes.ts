import { Express, Response, static as ExpressStatic } from 'express';
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
        respond(res, () => azureDevOpsConnector.refreshReleasePipelines());
    });

    app.post("/api/project/release-pipelines/:id/releases", (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.sendStatus(400);
        }
        else {
            respond(res, () => azureDevOpsConnector.refreshReleases(id));
        }
    })
}

function respond(res: Response, process: (() => Promise<void>)) {
    process()
        .then(() => res.sendStatus(200))
        .catch(err => res.status(500).send(err.message));
}