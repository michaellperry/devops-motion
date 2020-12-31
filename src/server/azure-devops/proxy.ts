import Axios from "axios";
import { ReleaseRepresentation } from "./release";
import { ReleaseDefinition } from "./release-definition";
import { ReleaseDetail } from "./release-detail";
import { WorkItem } from "./work-item";
import { WorkItemDetail } from "./work-item-detail";

export interface Cursor<T> {
    results: T[],
    bookmark: string
}

export class AzureDevOps {
    constructor(
        private organization: string,
        private project: string,
        private apiSecret: string
    ) { }

    async listReleaseDefinitions() : Promise<ReleaseDefinition[]> {
        const result = await this.callVsrm(`release/definitions?api-version=6.1-preview.4`);
        return result.data.value as ReleaseDefinition[];
    }

    async listReleases(releaseDefinitionId: number, bookmark: string): Promise<Cursor<ReleaseRepresentation>> {
        let url = `release/releases?api-version=6.0&definitionId=${releaseDefinitionId}&queryOrder=ascending`;
        if (bookmark) {
            url = `${url}&continuationToken=${bookmark}`;
        }
        const result = await this.callVsrm(url);
        const releases = result.data.value as ReleaseRepresentation[];
        const nextContinuationToken = result.headers['x-ms-continuationtoken'];

        return {
            results: releases,
            bookmark: nextContinuationToken
        };
    }

    async getRelease(releaseId: number) : Promise<ReleaseDetail> {
        const result = await this.callVsrm(`release/releases/${releaseId}?api-version=6.0`);
        return result.data as ReleaseDetail;
    }

    async getWorkItemsBetweenBuilds(fromBuildId: string, toBuildId: string) : Promise<WorkItem[]> {
        const result = await this.callDev(`build/workitems?fromBuildId=${fromBuildId}&toBuildId=${toBuildId}&api-version=6.0-preview.2`);
        return result.data.value as WorkItem[];
    }

    async getWorkItem(workItemId: string) : Promise<WorkItemDetail> {
        const result = await this.callDev(`wit/workitems/${workItemId}?api-version=6.0&$expand=relations`);
        return result.data as WorkItemDetail;
    }

    private callVsrm(url: string) {
        return this.call("vsrm.dev.azure.com", url);
    }

    private callDev(url: string) {
        return this.call("dev.azure.com", url);
    }

    private async call(host: string, url: string) {
        return await Axios.get(`https://${host}/${this.organization}/${this.project}/_apis/${url}`, {
            auth: {
                username: this.organization,
                password: this.apiSecret
            }
        });
    }
}
