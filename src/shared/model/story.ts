import { Project } from "./project";

export class Story {
    static Type = "DevOpsMotion.Story";
    type = Story.Type;

    constructor(
        public project: Project,
        public id: number
    ) { }
}