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