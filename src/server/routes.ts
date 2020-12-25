import { Express, static as ExpressStatic } from 'express';
import { Jinaga } from "jinaga";
import * as path from 'path';
import { Configuration } from "./azure-devops/configuration";

export function configureRoutes(app: Express, j: Jinaga, configuration: Configuration) {
    app.get(/^\/(index.html)?$/, (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    });

    app.use('/scripts', ExpressStatic(path.join(__dirname, '../client/scripts')));
}