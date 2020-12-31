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

        // Since Azure DevOps includes the ID matching the bookmark, and we have already processed it,
        // remove it. Return only the new releases.
        const newReleases = releases.filter(r => r.id.toString() !== bookmark);

        // Don't use the header, because it is the ID of a release that you haven't seen yet.
        // As a result, when you reach the end, the continuation token is empty, just like
        // at the beginning.
        // const nextBookmark = result.headers['x-ms-continuationtoken'];

        // Instead, use the ID of the last release that you've seen. This will keep the bookmark
        // stable when you have reached the end, and will reduce the number of duplicate rows
        // processed during a refresh.
        const maxId = (bookmark: number | null, id: number) => !bookmark || id > bookmark ? id : bookmark;
        const nextBookmark = newReleases.reduce((bookmark, release) => maxId(bookmark, release.id), parseInt(bookmark) || null);

        return {
            results: newReleases,
            bookmark: nextBookmark ? nextBookmark.toString() : ""
        };
    }

    async getRelease(releaseId: number) : Promise<ReleaseDetail> {
        const result = await this.callVsrm(`release/releases/${releaseId}?api-version=6.0`);
        return result.data as ReleaseDetail;
    }

    async getWorkItemsBetweenBuilds(fromBuildId: number, toBuildId: number) : Promise<WorkItem[]> {
        const result = await this.callDev(`build/workitems?fromBuildId=${fromBuildId}&toBuildId=${toBuildId}&api-version=6.0-preview.2`);
        return result.data.value as WorkItem[];
    }

    async getWorkItem(workItemId: number) : Promise<WorkItemDetail> {
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
