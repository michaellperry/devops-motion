import { Project } from "@shared/model/project";
import { Express, static as ExpressStatic } from 'express';
import * as path from 'path';

export function configureRoutes(app: Express, project: Project) {
    app.get(/^\/(index.html)?$/, (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    });

    app.use('/scripts', ExpressStatic(path.join(__dirname, '../client/scripts')));

    app.get("/api/project", (req, res) => {
        res.send(JSON.stringify(project));
    });
}