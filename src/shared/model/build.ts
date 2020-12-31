import { Jinaga as j } from "jinaga";
import { Project } from "./project";
import { Story } from "./story";
import { Task } from "./task";

export class Build {
    static Type = "DevOpsMotion.Build";
    type = Build.Type;

    constructor(
        public project: Project,
        public id: number,
        public name: string
    ) { }
}

export class BuildStory {
    static Type = "DevOpsMotion.Build.Story";
    type = BuildStory.Type;

    constructor(
        public build: Build,
        public story: Story
    ) { }

    static inBuild(build: Build) {
        return j.match(<BuildStory>{
            type: BuildStory.Type,
            build
        });
    }
}

export class BuildTask {
    static Type = "DevOpsMotion.Build.Task";
    type = BuildTask.Type;

    constructor(
        public build: Build,
        public task: Task
    ) { }

    static inBuild(build: Build) {
        return j.match(<BuildTask>{
            type: BuildTask.Type,
            build
        });
    }
}