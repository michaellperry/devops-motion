import { j } from "../../client/jinaga-config";
import { Project } from "./project";

export class ReleasePipeline {
    static Type = "DevOpsMotion.ReleasePipeline";
    public type = ReleasePipeline.Type;

    constructor(
        public project: Project,
        public id: number
    ) { }

    static inProject(project: Project) {
        return j.match(<ReleasePipeline>{
            type: ReleasePipeline.Type,
            project
        });
    }
}

export class ReleasePipelineName {
    static Type = "DevOpsMotion.ReleasePipeline.Name";
    public type = ReleasePipelineName.Type;

    constructor(
        public releasePipeline: ReleasePipeline,
        public value: string,
        public prior: ReleasePipelineName[]
    ) { }

    static ofReleasePipeline(releasePipeline: ReleasePipeline) {
        return j.match(<ReleasePipelineName>{
            type: ReleasePipelineName.Type,
            releasePipeline
        }).suchThat(ReleasePipelineName.isCurrent);
    }

    static isCurrent(next: ReleasePipelineName) {
        return j.notExists(<ReleasePipelineName>{
            type: ReleasePipelineName.Type,
            prior: [next]
        });
    }
}