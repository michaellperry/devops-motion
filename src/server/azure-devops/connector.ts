import { Project } from "@shared/model/project";
import { ReleasePipeline } from "@shared/model/release-pipeline";
import { Jinaga } from "jinaga";
import { AzureDevOps } from "./proxy";

export class AzureDevOpsConnector {
    constructor(
        private j: Jinaga,
        private proxy: AzureDevOps,
        public project: Project
    ) { }

    async refreshReleasePipelines(): Promise<void> {
        const releaseDefinitions = await this.proxy.listReleaseDefinitions();
        const releasePipelineFacts = await Promise.all(releaseDefinitions.map(rd =>
            this.j.fact(new ReleasePipeline(this.project, rd.id))));
    }
}