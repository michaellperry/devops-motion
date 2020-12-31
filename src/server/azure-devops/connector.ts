import { Build, BuildStory, BuildTask } from "@shared/model/build";
import { Project } from "@shared/model/project";
import { Release } from "@shared/model/release";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { Story } from "@shared/model/story";
import { Task } from "@shared/model/task";
import { ascending, field, hashSet, structureFor, toArray } from "@shared/structure/structure";
import { Jinaga } from "jinaga";
import { AzureDevOps } from "./proxy";
import { ReleaseRepresentation } from "./release";
import { ReleaseDefinition } from "./release-definition";
import { ReleaseDetail } from "./release-detail";
import { WorkItemDetail } from "./work-item-detail";

export class AzureDevOpsConnector {
    private bookmarkByRelease: { [releaseId: number]: string } = {};

    constructor(
        private j: Jinaga,
        private proxy: AzureDevOps,
        public project: Project
    ) { }

    async refreshReleasePipelines(): Promise<void> {
        const releaseDefinitions = await this.proxy.listReleaseDefinitions();
        const releasePipelineStructure = structureFor(Project, {
            releasePipelines: hashSet(this.j.for(ReleasePipeline.inProject), {
                fact: field(rp => rp),
                names: hashSet(this.j.for(ReleasePipelineName.ofReleasePipeline), {
                    fact: field(rpn => rpn)
                })
            })
        });
        const releasePipelineHashSet = await releasePipelineStructure.query(this.j, this.project);
        const releasePipelineFacts = toArray(
                releasePipelineHashSet.releasePipelines,
                ascending(rp => rp.fact.id)
            )
            .map(rp => ({
                fact: rp.fact,
                names: toArray(rp.names, ascending(rpn => rpn.fact.value))
                    .map(rpn => rpn.fact)
            }));
    
        await Promise.all(releaseDefinitions.map(rd =>
            this.refreshReleasePipeline(rd, releasePipelineFacts)));
    }

    private async refreshReleasePipeline(
        releaseDefinition: ReleaseDefinition,
        queryResults: ReleasePipelineResult[]
    ) {
        const existingFact = queryResults.find(rp =>
            rp.fact.id == releaseDefinition.id);
        if (existingFact) {
            const prior = existingFact.names;
            if (prior.length !== 1 || prior[0].value !== releaseDefinition.name) {
                await this.j.fact(new ReleasePipelineName(
                    existingFact.fact,
                    releaseDefinition.name,
                    prior
                ));
            }
        }
        else {
            const releasePipelineFact = await this.j.fact(new ReleasePipeline(
                this.project,
                releaseDefinition.id
            ));
            await this.j.fact(new ReleasePipelineName(
                releasePipelineFact,
                releaseDefinition.name,
                []
            ));
        }
    }

    async refreshReleases(id: number): Promise<void> {
        const releasePipelineFact = new ReleasePipeline(this.project, id);
        const releasePipelineStructure = structureFor(ReleasePipeline, {
            releases: hashSet(this.j.for(Release.inPipeline), {
                fact: field(r => r)
            })
        });
        const releasePipelineResult = await releasePipelineStructure.query(this.j, releasePipelineFact);
        let releaseFacts = toArray(releasePipelineResult.releases, ascending(r => r.fact.createdOn))
            .map(r => r.fact)
            .filter(r => r.build);

        let cursor = await this.proxy.listReleases(id, this.bookmarkByRelease[id] || "");
        while (true) {
            for (const release of cursor.results) {
                const releaseFact = await this.refreshRelease(release, releasePipelineFact, releaseFacts);
                if (releaseFact) {
                    releaseFacts = releaseFacts
                        .filter(r => r.name !== releaseFact.name)
                        .concat([ releaseFact ]);
                }
            }

            if (cursor.results.length && cursor.bookmark) {
                this.bookmarkByRelease[id] = cursor.bookmark;
                cursor = await this.proxy.listReleases(id, cursor.bookmark);
            }
            else {
                break;
            }
        }

        const builds = releaseFacts.map(r => r.build)
            .filter((build, index, self) => self.findIndex(b => b.id === build.id) === index)
            .sort((a, b) => a.id - b.id);
        if (builds.length > 1) {
            const pairs = builds.slice(1).map((build, index) => ({
                build,
                prior: builds[index]
            }));
            await Promise.all(pairs.map(({build, prior}) => this.refreshTasks(build, prior)));
        }
    }

    private async refreshRelease(
        release: ReleaseRepresentation,
        releasePipelineFact: ReleasePipeline,
        releaseFacts: Release[]
    ): Promise<Release | null> {
        const existingReleaseFact = releaseFacts.find(r => r.name === release.name);
        if (existingReleaseFact) {
            return existingReleaseFact;
        }
        else {
            const releaseDetail = await this.proxy.getRelease(release.id);
            const build = getBuild(releaseDetail);
            if (build) {
                const buildFact = await this.j.fact(new Build(this.project, parseInt(build.id), build.name || ""));
                const newReleaseFact = await this.j.fact(new Release(releasePipelineFact, buildFact, release.name, release.createdOn));
                return newReleaseFact;
            }
        }

        return null;
    }

    private async refreshTasks(build: Build, prior: Build) {
        if (build.id > prior.id) {
            const workItems = await this.proxy.getWorkItemsBetweenBuilds(prior.id, build.id);
            const workItemDetails = await Promise.all(workItems.map(w => this.proxy.getWorkItem(parseInt(w.id))));
            const workItemInfo = workItemDetails.map(getWorkItemInfo);
            const stories = workItemInfo.filter(w => w.type === "Story");
            const tasks = workItemInfo.filter(w => w.type !== "Story" && w.parentWorkItemIds.length === 1);

            const storyFacts = await Promise.all(stories.map(s => this.refreshStory(s.id, s.title, s.closedAt)));
            const taskFacts = await Promise.all(tasks.map(t => this.refreshTask(t.id, t.title, t.parentWorkItemIds[0], t.closedAt)));

            await Promise.all(storyFacts.map(story => this.j.fact(new BuildStory(build, story))));
            await Promise.all(taskFacts.map(task => this.j.fact(new BuildTask(build, task))));
        }
    }

    private async refreshStory(id: number, title: string, closedAt: string): Promise<Story> {
        const storyFact = await this.j.fact(new Story(
            this.project,
            id
        ));
        return storyFact;
    }

    private async refreshTask(id: number, title: string, storyId: number, closedAt: string): Promise<Task> {
        const storyFact = await this.j.fact(new Story(
            this.project,
            storyId
        ));
        const taskFact = await this.j.fact(new Task(
            storyFact,
            id
        ));
        return taskFact;
    }
}

interface ReleasePipelineResult {
    fact: ReleasePipeline;
    names: ReleasePipelineName[];
}

function getBuild(release: ReleaseDetail) {
    const versions = release.artifacts
        .filter(artifact => artifact.type === "Build")
        .map(artifact => artifact.definitionReference["version"])
        .filter(version => version);
    return versions.length !== 1 ? null : versions[0];
}

function getWorkItemInfo(workItemDetail: WorkItemDetail) {
    return {
        id: workItemDetail.id,
        type: workItemDetail.fields["System.WorkItemType"],
        title: workItemDetail.fields["System.Title"],
        closedAt: workItemDetail.fields["Microsoft.VSTS.Common.ClosedDate"],
        parentWorkItemIds: workItemDetail.relations
            .filter(relation => relation.rel === "System.LinkTypes.Hierarchy-Reverse")
            .map(relation => workItemIdFromUrl(relation.url))
            .filter(id => id) as number[]
    };
}

function getWorkItemType(workItem: WorkItemDetail) {
    return workItem.fields["System.WorkItemType"];
}

function workItemIdFromUrl(url: string) {
    if (!url) {
        return null;
    }

    const parts = url.split("/");
    return parts.length > 0 ? parseInt(parts[parts.length-1]) : null;
}