import { Project } from "@shared/model/project";
import { Release } from "@shared/model/release";
import { ReleasePipeline, ReleasePipelineName } from "@shared/model/release-pipeline";
import { ascending, field, hashSet, structureFor, toArray } from "@shared/structure/structure";
import { Jinaga } from "jinaga";
import { AzureDevOps } from "./proxy";
import { ReleaseRepresentation } from "./release";
import { ReleaseDefinition } from "./release-definition";

export class AzureDevOpsConnector {
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
        const releases = await this.proxy.listReleases(id, 10);

        const releasePipelineFact = new ReleasePipeline(this.project, id);
        await Promise.all(releases.map(release =>
            this.refreshRelease(release, releasePipelineFact)));
    }

    private async refreshRelease(release: ReleaseRepresentation, releasePipelineFact: ReleasePipeline): Promise<void> {
        const releaseFact = await this.j.fact(new Release(releasePipelineFact, release.name, release.createdOn));
    }
}

interface ReleasePipelineResult {
    fact: ReleasePipeline;
    names: ReleasePipelineName[];
}